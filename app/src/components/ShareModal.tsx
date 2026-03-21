import { useState, useEffect } from 'preact/hooks'
import { t } from '../hooks/useLocale'
import { renderCard } from '../share/cardRenderer'
import { STORY_LAYOUT, SQUARE_LAYOUT } from '../share/cardLayouts'
import { shareImage, downloadImage, canShareFiles } from '../share/shareUtils'
import { speciesById } from '../data/species'
import type { DiveSession } from '../db/types'
import type { Species } from '../data/types'

interface Props {
  session: DiveSession
  speciesIds: number[]
  badgeCount: number
  onClose: () => void
}

type Format = 'story' | 'square'

export function ShareModal({ session, speciesIds, badgeCount, onClose }: Props) {
  const [format, setFormat] = useState<Format>('story')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [blob, setBlob] = useState<Blob | null>(null)
  const [generating, setGenerating] = useState(true)

  const speciesList = speciesIds
    .map(id => speciesById.get(id))
    .filter((s): s is Species => !!s)

  useEffect(() => {
    generateCard()
  }, [format])

  async function generateCard() {
    setGenerating(true)
    try {
      const layout = format === 'story' ? STORY_LAYOUT : SQUARE_LAYOUT
      const cardBlob = await renderCard(layout, {
        session,
        speciesList,
        speciesCount: speciesIds.length,
        badgeCount,
      })
      setBlob(cardBlob)
      setPreviewUrl(URL.createObjectURL(cardBlob))
    } catch (e) {
      console.error('Card generation error:', e)
    } finally {
      setGenerating(false)
    }
  }

  async function handleShare() {
    if (!blob) return
    const shared = await shareImage(blob, `Dive at ${session.siteName}`)
    if (!shared) {
      // Fallback to download
      downloadImage(blob, `dive-${session.siteName}-${session.date}.png`)
    }
  }

  function handleDownload() {
    if (!blob) return
    downloadImage(blob, `dive-${session.siteName}-${session.date}.png`)
  }

  return (
    <div class="fixed inset-0 z-[200] bg-black/80 flex flex-col" onClick={onClose}>
      <div
        class="flex-1 flex flex-col max-w-lg mx-auto w-full pt-[max(1rem,env(safe-area-inset-top))]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div class="flex items-center justify-between px-4 py-3">
          <button onClick={onClose} class="text-white/60 text-sm">✕ {t('picker.close')}</button>
          <h3 class="text-white font-bold text-sm">{t('share.title')}</h3>
          <div class="w-16" />
        </div>

        {/* Format toggle */}
        <div class="flex justify-center gap-2 mb-3">
          <button
            onClick={() => setFormat('story')}
            class={`text-xs px-4 py-1.5 rounded-full transition-colors ${
              format === 'story' ? 'bg-white text-ocean-800' : 'bg-white/20 text-white'
            }`}
          >
            {t('share.story')} (9:16)
          </button>
          <button
            onClick={() => setFormat('square')}
            class={`text-xs px-4 py-1.5 rounded-full transition-colors ${
              format === 'square' ? 'bg-white text-ocean-800' : 'bg-white/20 text-white'
            }`}
          >
            {t('share.square')} (1:1)
          </button>
        </div>

        {/* Preview */}
        <div class="flex-1 flex items-center justify-center px-4 overflow-hidden">
          {generating ? (
            <div class="text-center">
              <div class="text-3xl animate-pulse mb-2">🎨</div>
              <p class="text-white/60 text-sm">{t('share.generating')}</p>
            </div>
          ) : previewUrl ? (
            <img
              src={previewUrl}
              alt="Dive card preview"
              class={`rounded-xl shadow-2xl object-contain ${
                format === 'story' ? 'max-h-[60vh]' : 'max-h-[50vh]'
              }`}
            />
          ) : null}
        </div>

        {/* Action buttons */}
        <div class="px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] flex gap-3">
          {canShareFiles() && (
            <button
              onClick={handleShare}
              disabled={generating}
              class="flex-1 bg-white text-ocean-800 py-3 rounded-2xl text-sm font-bold hover:bg-ocean-100 transition-colors disabled:opacity-50"
            >
              📤 {t('share.share')}
            </button>
          )}
          <button
            onClick={handleDownload}
            disabled={generating}
            class={`${canShareFiles() ? 'flex-1' : 'w-full'} bg-white/20 text-white py-3 rounded-2xl text-sm font-bold hover:bg-white/30 transition-colors disabled:opacity-50`}
          >
            💾 {t('share.download')}
          </button>
        </div>
      </div>
    </div>
  )
}
