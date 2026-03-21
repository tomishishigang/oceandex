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

export { db }
