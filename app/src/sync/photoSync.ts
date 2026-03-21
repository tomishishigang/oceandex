import { getSupabase } from '../auth/supabase'
import { currentUserId, isLoggedIn } from '../auth/useAuth'
import { db } from '../db/db'
import { generateThumbnail } from '../db/photos'

const BUCKET = 'sighting-photos'

/** Upload a photo to Supabase Storage */
export async function uploadPhoto(photoId: string, sightingId: string, blob: Blob): Promise<void> {
  if (!isLoggedIn()) return
  const userId = currentUserId()
  if (!userId) return

  const supabase = getSupabase()
  const path = `${userId}/${sightingId}/${photoId}.jpg`

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, blob, {
      contentType: 'image/jpeg',
      upsert: true,
    })

  if (error) {
    console.error('Photo upload error:', error)
    throw error
  }
}

/** Download a photo from Supabase Storage */
export async function downloadPhoto(userId: string, sightingId: string, photoId: string): Promise<Blob | null> {
  const supabase = getSupabase()
  const path = `${userId}/${sightingId}/${photoId}.jpg`

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .download(path)

  if (error) {
    console.error('Photo download error:', error)
    return null
  }

  return data
}

/** Push all local photos to Supabase Storage */
export async function pushPhotos(): Promise<number> {
  if (!isLoggedIn()) return 0
  const userId = currentUserId()
  if (!userId) return 0

  const supabase = getSupabase()
  const photos = await db.sightingPhotos.toArray()
  let uploaded = 0

  for (const photo of photos) {
    // Check if already uploaded
    const { data: existing } = await supabase.storage
      .from(BUCKET)
      .list(`${userId}/${photo.sightingId}`, { search: `${photo.id}.jpg` })

    if (existing && existing.length > 0) continue

    try {
      await uploadPhoto(photo.id, photo.sightingId, photo.blob)
      uploaded++
    } catch {
      // Skip failed uploads, will retry next sync
    }
  }

  return uploaded
}

/** Pull photos from Supabase Storage that we don't have locally */
export async function pullPhotos(): Promise<number> {
  if (!isLoggedIn()) return 0
  const userId = currentUserId()
  if (!userId) return 0

  const supabase = getSupabase()
  let downloaded = 0

  // Get all sightings for this user
  const sightings = await db.sightings.where('userId').equals(userId).toArray()

  for (const sighting of sightings) {
    // List photos in storage for this sighting
    const { data: files } = await supabase.storage
      .from(BUCKET)
      .list(`${userId}/${sighting.id}`)

    if (!files || files.length === 0) continue

    for (const file of files) {
      const photoId = file.name.replace('.jpg', '')

      // Skip if already in local DB
      const existing = await db.sightingPhotos.get(photoId)
      if (existing) continue

      // Download and store locally
      const blob = await downloadPhoto(userId, sighting.id, photoId)
      if (!blob) continue

      const thumbnailBlob = await generateThumbnail(blob)

      await db.sightingPhotos.add({
        id: photoId,
        sightingId: sighting.id,
        blob,
        thumbnailBlob,
        width: 0, // Will be determined on display
        height: 0,
        createdAt: file.created_at ? new Date(file.created_at).toISOString() : new Date().toISOString(),
      })

      downloaded++
    }
  }

  return downloaded
}
