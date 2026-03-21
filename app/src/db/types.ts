export type CurrentStrength = 'none' | 'light' | 'moderate' | 'strong'

export interface DiveSession {
  id: string
  siteName: string
  date: string          // ISO date: "2026-03-19"
  maxDepthM: number | null
  waterTempC: number | null
  visibilityM: number | null
  current: CurrentStrength | null
  notes: string | null
  createdAt: string     // ISO datetime
}

export interface Sighting {
  id: string
  sessionId: string
  speciesId: number
  createdAt: string     // ISO datetime
}

export type ExportData = ExportDataV1 | ExportDataV2

export interface ExportDataV1 {
  version: 1
  exportedAt: string
  sessions: DiveSession[]
  sightings: Sighting[]
}

export interface ExportDataV2 {
  version: 2
  exportedAt: string
  sessions: DiveSession[]
  sightings: Sighting[]
}
