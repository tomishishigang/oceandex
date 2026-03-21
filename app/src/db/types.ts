export type CurrentStrength = 'none' | 'light' | 'moderate' | 'strong'

export interface DiveSession {
  id: string
  userId: string        // 'local' for anonymous, UUID for authenticated
  siteName: string
  date: string          // ISO date: "2026-03-19"
  maxDepthM: number | null
  waterTempC: number | null
  visibilityM: number | null
  current: CurrentStrength | null
  notes: string | null
  createdAt: string     // ISO datetime
  updatedAt: string     // ISO datetime
}

export interface Sighting {
  id: string
  userId: string        // 'local' for anonymous, UUID for authenticated
  sessionId: string
  speciesId: number
  createdAt: string     // ISO datetime
  updatedAt: string     // ISO datetime
}

export interface SightingPhoto {
  id: string
  sightingId: string
  blob: Blob
  thumbnailBlob: Blob
  width: number
  height: number
  createdAt: string
}

export type ExportData = ExportDataV1 | ExportDataV2 | ExportDataV3

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

export interface ExportPhotoData {
  id: string
  sightingId: string
  base64: string
  width: number
  height: number
  createdAt: string
}

export interface ExportDataV3 {
  version: 3
  exportedAt: string
  sessions: DiveSession[]
  sightings: Sighting[]
  photos?: ExportPhotoData[]
}
