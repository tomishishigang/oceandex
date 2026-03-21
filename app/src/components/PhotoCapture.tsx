import { useState, useRef } from 'preact/hooks'
import { t } from '../hooks/useLocale'
import { addPhotoToSighting, useLiveQuery, getPhotosForSighting, deletePhoto, blobToUrl } from '../db'
import type { SightingPhoto } from '../db'

interface Props {
  sightingId: string
}

export function PhotoCapture({ sightingId }: Props) {
  const [compressing, setCompressing] = useState(false)
  const [viewPhoto, setViewPhoto] = useState<SightingPhoto | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const photos = useLiveQuery(
    () => getPhotosForSighting(sightingId),
    [sightingId],
    [] as SightingPhoto[],
  )

  async function handleFile() {
    const file = fileRef.current?.files?.[0]
    if (!file) return

    setCompressing(true)
    try {
      await addPhotoToSighting(sightingId, file)
    } finally {
      setCompressing(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  async function handleDelete(photoId: string) {
    await deletePhoto(photoId)
    setViewPhoto(null)
  }

  return (
    <div>
      {/* Photo thumbnails */}
      {photos.length > 0 && (
        <div class="flex gap-2 flex-wrap mb-2">
          {photos.map(photo => (
            <button
              key={photo.id}
              onClick={() => setViewPhoto(photo)}
              class="w-14 h-14 rounded-lg overflow-hidden border border-ocean-200 hover:border-ocean-400 transition-colors"
            >
              <img
                src={blobToUrl(photo.thumbnailBlob)}
                alt=""
                class="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Add photo button */}
      <label class={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full cursor-pointer transition-colors ${
        compressing
          ? 'bg-ocean-200 text-ocean-400'
          : 'bg-ocean-100 text-ocean-600 hover:bg-ocean-200'
      }`}>
        <span>📷</span>
        {compressing ? t('photo.compressing') : t('photo.add')}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          class="hidden"
          onChange={handleFile}
          disabled={compressing}
        />
      </label>

      {/* Full-screen photo viewer */}
      {viewPhoto && (
        <div
          class="fixed inset-0 z-[200] bg-black/90 flex flex-col items-center justify-center"
          onClick={() => setViewPhoto(null)}
        >
          <img
            src={blobToUrl(viewPhoto.blob)}
            alt=""
            class="max-w-full max-h-[80vh] object-contain rounded-lg"
          />
          <div class="flex gap-3 mt-4">
            <button
              onClick={(e) => { e.stopPropagation(); setViewPhoto(null) }}
              class="text-white text-sm bg-white/20 px-4 py-2 rounded-full"
            >
              {t('photo.close')}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleDelete(viewPhoto.id) }}
              class="text-red-400 text-sm bg-white/10 px-4 py-2 rounded-full"
            >
              {t('photo.remove')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
