import Dexie, { type EntityTable } from 'dexie'
import type { DiveSession, Sighting } from './types'

const db = new Dexie('oceandex') as Dexie & {
  diveSessions: EntityTable<DiveSession, 'id'>
  sightings: EntityTable<Sighting, 'id'>
}

db.version(1).stores({
  diveSessions: 'id, date',
  sightings: 'id, sessionId, speciesId, [sessionId+speciesId]',
})

export { db }
