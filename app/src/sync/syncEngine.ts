import { signal } from '@preact/signals'
import { getSupabase } from '../auth/supabase'
import { currentUserId, isLoggedIn } from '../auth/useAuth'
import { db } from '../db/db'
import type { DiveSession, Sighting } from '../db/types'

export type SyncStatus = 'idle' | 'syncing' | 'error' | 'offline'

export const syncStatus = signal<SyncStatus>('idle')
export const lastSyncError = signal<string | null>(null)

/** Claim all local (anonymous) data for the current user */
export async function claimLocalData(): Promise<void> {
  const userId = currentUserId()
  if (!userId) return

  const now = new Date().toISOString()

  await db.transaction('rw', db.diveSessions, db.sightings, async () => {
    await db.diveSessions
      .where('userId').equals('local')
      .modify({ userId, updatedAt: now })

    await db.sightings
      .where('userId').equals('local')
      .modify({ userId, updatedAt: now })
  })
}

/** Push local data to Supabase */
async function pushSessions(userId: string): Promise<void> {
  const supabase = getSupabase()
  const sessions = await db.diveSessions.where('userId').equals(userId).toArray()

  if (sessions.length === 0) return

  const rows = sessions.map(s => ({
    id: s.id,
    user_id: userId,
    site_name: s.siteName,
    date: s.date,
    max_depth_m: s.maxDepthM,
    water_temp_c: s.waterTempC,
    visibility_m: s.visibilityM,
    current: s.current,
    notes: s.notes,
    created_at: s.createdAt,
    updated_at: s.updatedAt,
  }))

  const { error } = await supabase
    .from('dive_sessions')
    .upsert(rows, { onConflict: 'id' })

  if (error) throw new Error(`Push sessions failed: ${error.message}`)
}

async function pushSightings(userId: string): Promise<void> {
  const supabase = getSupabase()
  const sightings = await db.sightings.where('userId').equals(userId).toArray()

  if (sightings.length === 0) return

  const rows = sightings.map(s => ({
    id: s.id,
    user_id: userId,
    session_id: s.sessionId,
    species_id: s.speciesId,
    created_at: s.createdAt,
    updated_at: s.updatedAt,
  }))

  const { error } = await supabase
    .from('sightings')
    .upsert(rows, { onConflict: 'id' })

  if (error) throw new Error(`Push sightings failed: ${error.message}`)
}

/** Pull cloud data into local IndexedDB */
async function pullSessions(userId: string): Promise<void> {
  const supabase = getSupabase()

  const { data, error } = await supabase
    .from('dive_sessions')
    .select('*')
    .eq('user_id', userId)

  if (error) throw new Error(`Pull sessions failed: ${error.message}`)
  if (!data) return

  await db.transaction('rw', db.diveSessions, async () => {
    for (const row of data) {
      const existing = await db.diveSessions.get(row.id)
      const remote: DiveSession = {
        id: row.id,
        userId: row.user_id,
        siteName: row.site_name,
        date: row.date,
        maxDepthM: row.max_depth_m,
        waterTempC: row.water_temp_c,
        visibilityM: row.visibility_m,
        current: row.current,
        notes: row.notes,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }

      if (!existing) {
        await db.diveSessions.add(remote)
      } else if (remote.updatedAt > existing.updatedAt) {
        await db.diveSessions.put(remote)
      }
    }
  })
}

async function pullSightings(userId: string): Promise<void> {
  const supabase = getSupabase()

  const { data, error } = await supabase
    .from('sightings')
    .select('*')
    .eq('user_id', userId)

  if (error) throw new Error(`Pull sightings failed: ${error.message}`)
  if (!data) return

  await db.transaction('rw', db.sightings, async () => {
    for (const row of data) {
      const existing = await db.sightings.get(row.id)
      const remote: Sighting = {
        id: row.id,
        userId: row.user_id,
        sessionId: row.session_id,
        speciesId: row.species_id,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }

      if (!existing) {
        await db.sightings.add(remote)
      } else if (remote.updatedAt > existing.updatedAt) {
        await db.sightings.put(remote)
      }
    }
  })
}

/** Full bidirectional sync */
export async function fullSync(): Promise<void> {
  if (!isLoggedIn()) return
  if (!navigator.onLine) {
    syncStatus.value = 'offline'
    return
  }

  const userId = currentUserId()
  if (!userId) return

  syncStatus.value = 'syncing'
  lastSyncError.value = null

  try {
    // Push local → cloud first
    await pushSessions(userId)
    await pushSightings(userId)

    // Then pull cloud → local
    await pullSessions(userId)
    await pullSightings(userId)

    syncStatus.value = 'idle'
  } catch (e: any) {
    console.error('Sync error:', e)
    syncStatus.value = 'error'
    lastSyncError.value = e.message ?? 'Unknown sync error'
  }
}

/** Called on first login — claims local data then syncs */
export async function onFirstLogin(): Promise<void> {
  await claimLocalData()
  await fullSync()
}

/** Auto-sync: call after each write operation */
let syncTimeout: ReturnType<typeof setTimeout> | null = null

export function scheduleSyncAfterWrite(): void {
  if (!isLoggedIn() || !navigator.onLine) return

  // Debounce: wait 2 seconds after last write before syncing
  if (syncTimeout) clearTimeout(syncTimeout)
  syncTimeout = setTimeout(() => {
    fullSync()
  }, 2000)
}
