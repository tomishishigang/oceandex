import Dexie, { type EntityTable } from 'dexie'
import type { DiveSession, Sighting, SightingPhoto } from './types'

const db = new Dexie('oceandex') as Dexie & {
  diveSessions: EntityTable<DiveSession, 'id'>
  sightings: EntityTable<Sighting, 'id'>
  sightingPhotos: EntityTable<SightingPhoto, 'id'>
}

// v1: original schema
db.version(1).stores({
  diveSessions: 'id, date',
  sightings: 'id, sessionId, speciesId, [sessionId+speciesId]',
})

// v2: add dive conditions fields
db.version(2).stores({
  diveSessions: 'id, date',
  sightings: 'id, sessionId, speciesId, [sessionId+speciesId]',
}).upgrade(tx => {
  return tx.table('diveSessions').toCollection().modify(session => {
    session.waterTempC = session.waterTempC ?? null
    session.visibilityM = session.visibilityM ?? null
    session.current = session.current ?? null
  })
})

// v3: add sighting photos table
db.version(3).stores({
  diveSessions: 'id, date',
  sightings: 'id, sessionId, speciesId, [sessionId+speciesId]',
  sightingPhotos: 'id, sightingId',
})

// v4: add userId + updatedAt for cloud sync
db.version(4).stores({
  diveSessions: 'id, date, userId',
  sightings: 'id, sessionId, speciesId, userId, [sessionId+speciesId]',
  sightingPhotos: 'id, sightingId',
}).upgrade(tx => {
  const now = new Date().toISOString()
  tx.table('diveSessions').toCollection().modify(session => {
    session.userId = session.userId ?? 'local'
    session.updatedAt = session.updatedAt ?? session.createdAt ?? now
  })
  tx.table('sightings').toCollection().modify(sighting => {
    sighting.userId = sighting.userId ?? 'local'
    sighting.updatedAt = sighting.updatedAt ?? sighting.createdAt ?? now
  })
})

export { db }
