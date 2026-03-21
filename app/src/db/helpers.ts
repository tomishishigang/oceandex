import { db } from './db'
import type { DiveSession, Sighting, SightingPhoto, ExportData, ExportDataV3, ExportPhotoData, CurrentStrength } from './types'
import { compressImage, generateThumbnail, blobToBase64, base64ToBlob } from './photos'

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

// === Photos ===

export async function addPhotoToSighting(sightingId: string, file: File): Promise<SightingPhoto> {
  const { blob, width, height } = await compressImage(file)
  const thumbnailBlob = await generateThumbnail(blob)

  const photo: SightingPhoto = {
    id: crypto.randomUUID(),
    sightingId,
    blob,
    thumbnailBlob,
    width,
    height,
    createdAt: new Date().toISOString(),
  }
  await db.sightingPhotos.add(photo)
  return photo
}

export async function deletePhoto(id: string): Promise<void> {
  await db.sightingPhotos.delete(id)
}

export async function getPhotosForSighting(sightingId: string): Promise<SightingPhoto[]> {
  return db.sightingPhotos.where('sightingId').equals(sightingId).toArray()
}

export async function getPhotoCount(): Promise<number> {
  return db.sightingPhotos.count()
}

// === Export / Import ===

export async function exportData(includePhotos = false): Promise<ExportDataV3> {
  const [sessions, sightings] = await Promise.all([
    db.diveSessions.toArray(),
    db.sightings.toArray(),
  ])

  const result: ExportDataV3 = {
    version: 3,
    exportedAt: new Date().toISOString(),
    sessions,
    sightings,
  }

  if (includePhotos) {
    const allPhotos = await db.sightingPhotos.toArray()
    const photoData: ExportPhotoData[] = []
    for (const photo of allPhotos) {
      photoData.push({
        id: photo.id,
        sightingId: photo.sightingId,
        base64: await blobToBase64(photo.blob),
        width: photo.width,
        height: photo.height,
        createdAt: photo.createdAt,
      })
    }
    result.photos = photoData
  }

  return result
}

export async function importData(data: ExportData): Promise<{ sessions: number; sightings: number; photos: number }> {
  let sessionsImported = 0
  let sightingsImported = 0
  let photosImported = 0

  await db.transaction('rw', db.diveSessions, db.sightings, db.sightingPhotos, async () => {
    for (const session of data.sessions) {
      const existing = await db.diveSessions.get(session.id)
      if (!existing) {
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
    // Import photos from v3 exports
    if ('photos' in data && data.photos) {
      for (const photoData of data.photos) {
        const existing = await db.sightingPhotos.get(photoData.id)
        if (!existing) {
          const blob = base64ToBlob(photoData.base64)
          const thumbnailBlob = await generateThumbnail(blob)
          await db.sightingPhotos.add({
            id: photoData.id,
            sightingId: photoData.sightingId,
            blob,
            thumbnailBlob,
            width: photoData.width,
            height: photoData.height,
            createdAt: photoData.createdAt,
          })
          photosImported++
        }
      }
    }
  })

  return { sessions: sessionsImported, sightings: sightingsImported, photos: photosImported }
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
