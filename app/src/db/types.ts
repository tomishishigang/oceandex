export interface DiveSession {
  id: string
  siteName: string
  date: string          // ISO date: "2026-03-19"
  maxDepthM: number | null
  notes: string | null
  createdAt: string     // ISO datetime
}

export interface Sighting {
  id: string
  sessionId: string
  speciesId: number
  createdAt: string     // ISO datetime
}

export interface ExportData {
  version: 1
  exportedAt: string
  sessions: DiveSession[]
  sightings: Sighting[]
}
