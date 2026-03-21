import { db } from './db'
import type { DiveSession, Sighting, ExportData, CurrentStrength } from './types'

// === Sessions ===

export async function createSession(data: {
  siteName: string
  date: string
  maxDepthM?: number | null
  waterTempC?: number | null
  visibilityM?: number | null
  current?: CurrentStrength | null
  notes?: string | null
}): Promise<DiveSession> {
  const session: DiveSession = {
    id: crypto.randomUUID(),
    siteName: data.siteName,
    date: data.date,
    maxDepthM: data.maxDepthM ?? null,
    waterTempC: data.waterTempC ?? null,
    visibilityM: data.visibilityM ?? null,
    current: data.current ?? null,
    notes: data.notes ?? null,
    createdAt: new Date().toISOString(),
  }
  await db.diveSessions.add(session)
  return session
}

export async function deleteSession(id: string): Promise<void> {
  await db.transaction('rw', db.diveSessions, db.sightings, async () => {
    await db.sightings.where('sessionId').equals(id).delete()
    await db.diveSessions.delete(id)
  })
}

export async function getSession(id: string): Promise<DiveSession | undefined> {
  return db.diveSessions.get(id)
}

export async function getAllSessions(): Promise<DiveSession[]> {
  return db.diveSessions.orderBy('date').reverse().toArray()
}

export async function getMostRecentSession(): Promise<DiveSession | undefined> {
  return db.diveSessions.orderBy('date').reverse().first()
}

// === Sightings ===

export async function createSighting(
  sessionId: string,
  speciesId: number,
): Promise<Sighting | null> {
  // Check for duplicate
  const existing = await db.sightings
    .where('[sessionId+speciesId]')
    .equals([sessionId, speciesId])
    .first()

  if (existing) return null // Already recorded

  const sighting: Sighting = {
    id: crypto.randomUUID(),
    sessionId,
    speciesId,
    createdAt: new Date().toISOString(),
  }
  await db.sightings.add(sighting)
  return sighting
}

export async function deleteSighting(id: string): Promise<void> {
  await db.sightings.delete(id)
}

export async function getSightingsForSession(sessionId: string): Promise<Sighting[]> {
  return db.sightings.where('sessionId').equals(sessionId).toArray()
}

export async function getSightingsForSpecies(speciesId: number): Promise<Sighting[]> {
  return db.sightings.where('speciesId').equals(speciesId).toArray()
}

export async function getSeenSpeciesIds(): Promise<Set<number>> {
  const all = await db.sightings.toArray()
  return new Set(all.map((s) => s.speciesId))
}

export async function getSeenCount(): Promise<number> {
  const ids = await getSeenSpeciesIds()
  return ids.size
}

// === Export / Import ===

export async function exportData(): Promise<ExportData> {
  const [sessions, sightings] = await Promise.all([
    db.diveSessions.toArray(),
    db.sightings.toArray(),
  ])
  return {
    version: 2,
    exportedAt: new Date().toISOString(),
    sessions,
    sightings,
  }
}

export async function importData(data: ExportData): Promise<{ sessions: number; sightings: number }> {
  let sessionsImported = 0
  let sightingsImported = 0

  await db.transaction('rw', db.diveSessions, db.sightings, async () => {
    for (const session of data.sessions) {
      const existing = await db.diveSessions.get(session.id)
      if (!existing) {
        // Backfill v2 fields for v1 imports
        const normalized: DiveSession = {
          ...session,
          waterTempC: session.waterTempC ?? null,
          visibilityM: session.visibilityM ?? null,
          current: session.current ?? null,
        }
        await db.diveSessions.add(normalized)
        sessionsImported++
      }
    }
    for (const sighting of data.sightings) {
      const existing = await db.sightings.get(sighting.id)
      if (!existing) {
        await db.sightings.add(sighting)
        sightingsImported++
      }
    }
  })

  return { sessions: sessionsImported, sightings: sightingsImported }
}

// === Site-specific queries ===

export async function getSessionsForSite(siteName: string): Promise<DiveSession[]> {
  return db.diveSessions.where('date').above('').filter(s => s.siteName === siteName).reverse().toArray()
}

export async function getSightingsForSite(siteName: string): Promise<number[]> {
  const sessions = await getSessionsForSite(siteName)
  const sessionIds = sessions.map(s => s.id)
  if (sessionIds.length === 0) return []
  const sightings = await db.sightings.where('sessionId').anyOf(sessionIds).toArray()
  return [...new Set(sightings.map(s => s.speciesId))]
}
