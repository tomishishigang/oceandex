import { useState, useEffect, useRef } from 'preact/hooks'
import { t } from '../hooks/useLocale'
import { renderCard, type BackgroundStyle, type CardStyle } from '../share/cardRenderer'
import { STORY_LAYOUT, SQUARE_LAYOUT } from '../share/cardLayouts'
import { downloadImage } from '../share/shareUtils'
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

const BACKGROUND_OPTIONS: { id: BackgroundStyle; emoji: string; label_es: string; label_en: string }[] = [
  { id: 'ocean', emoji: '🌊', label_es: 'Océano', label_en: 'Ocean' },
  { id: 'deep', emoji: '🫧', label_es: 'Profundo', label_en: 'Deep' },
  { id: 'night', emoji: '🌙', label_es: 'Nocturno', label_en: 'Night' },
  { id: 'photo', emoji: '📷', label_es: 'Tu foto', label_en: 'Your photo' },
]

const STYLE_OPTIONS: { id: CardStyle; label_es: string; label_en: string }[] = [
  { id: 'full', label_es: 'Completo', label_en: 'Full' },
  { id: 'minimal', label_es: 'Minimal', label_en: 'Minimal' },
]

export function ShareModal({ session, speciesIds, badgeCount, onClose }: Props) {
  const [format, setFormat] = useState<Format>('story')
  const [bgStyle, setBgStyle] = useState<BackgroundStyle>('ocean')
  const [cardStyle, setCardStyle] = useState<CardStyle>('full')
  const [bgPhoto, setBgPhoto] = useState<Blob | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [blob, setBlob] = useState<Blob | null>(null)
  const [generating, setGenerating] = useState(true)
  const photoRef = useRef<HTMLInputElement>(null)

  const speciesList = speciesIds
    .map(id => speciesById.get(id))
    .filter((s): s is Species => !!s)

  useEffect(() => {
    generateCard()
  }, [format, bgStyle, cardStyle, bgPhoto])

  async function generateCard() {
    setGenerating(true)
    try {
      const layout = format === 'story' ? STORY_LAYOUT : SQUARE_LAYOUT
      const cardBlob = await renderCard(layout, {
        session,
        speciesList,
        speciesCount: speciesIds.length,
        badgeCount,
        backgroundStyle: bgStyle,
        cardStyle,
        backgroundPhoto: bgPhoto,
      })
      setBlob(cardBlob)
      if (previewUrl) URL.revokeObjectURL(previewUrl)
      setPreviewUrl(URL.createObjectURL(cardBlob))
    } catch (e) {
      console.error('Card generation error:', e)
    } finally {
      setGenerating(false)
    }
  }

  function handleBgPhotoSelect() {
    const file = photoRef.current?.files?.[0]
    if (file) {
      setBgPhoto(file)
      setBgStyle('photo')
    }
  }

  function handleDownload() {
    if (!blob) return
    downloadImage(blob, `dive-${session.siteName}-${session.date}.png`)
  }

  async function handleShare() {
    if (!blob) return
    // Try native share first
    try {
      const file = new File([blob], 'dive-card.png', { type: 'image/png' })
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file] })
        return
      }
    } catch (e: any) {
      if (e.name === 'AbortError') return
    }
    // Fallback: download
    handleDownload()
  }

  return (
    <div class="fixed inset-0 z-[200] bg-black/90 flex flex-col" onClick={onClose}>
      <div
        class="flex-1 flex flex-col max-w-lg mx-auto w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div class="flex items-center justify-between px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
          <button onClick={onClose} class="text-white/60 text-sm">✕</button>
          <h3 class="text-white font-bold text-sm">{t('share.title')}</h3>
          <div class="w-8" />
        </div>

        {/* Options bar */}
        <div class="px-4 space-y-2 mb-3">
          {/* Format */}
          <div class="flex justify-center gap-2">
            <button
              onClick={() => setFormat('story')}
              class={`text-[10px] px-3 py-1 rounded-full ${format === 'story' ? 'bg-white text-ocean-800' : 'bg-white/15 text-white/70'}`}
            >
              {t('share.story')} 9:16
            </button>
            <button
              onClick={() => setFormat('square')}
              class={`text-[10px] px-3 py-1 rounded-full ${format === 'square' ? 'bg-white text-ocean-800' : 'bg-white/15 text-white/70'}`}
            >
              {t('share.square')} 1:1
            </button>
            {STYLE_OPTIONS.map(s => (
              <button
                key={s.id}
                onClick={() => setCardStyle(s.id)}
                class={`text-[10px] px-3 py-1 rounded-full ${cardStyle === s.id ? 'bg-white text-ocean-800' : 'bg-white/15 text-white/70'}`}
              >
                {s.label_es}
              </button>
            ))}
          </div>

          {/* Background options */}
          <div class="flex justify-center gap-2">
            {BACKGROUND_OPTIONS.map(bg => (
              <button
                key={bg.id}
                onClick={() => {
                  if (bg.id === 'photo') {
                    photoRef.current?.click()
                  } else {
                    setBgStyle(bg.id)
                  }
                }}
                class={`text-xs px-3 py-1.5 rounded-full flex items-center gap-1 ${
                  bgStyle === bg.id ? 'bg-white text-ocean-800' : 'bg-white/15 text-white/70'
                }`}
              >
                {bg.emoji} {bg.label_es}
              </button>
            ))}
            <input
              ref={photoRef}
              type="file"
              accept="image/*"
              class="hidden"
              onChange={handleBgPhotoSelect}
            />
          </div>
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
              alt="Dive card"
              class={`rounded-xl shadow-2xl object-contain ${
                format === 'story' ? 'max-h-[50vh]' : 'max-h-[45vh]'
              }`}
            />
          ) : null}
        </div>

        {/* Action buttons */}
        <div class="px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] flex gap-3">
          <button
            onClick={handleShare}
            disabled={generating}
            class="flex-1 bg-white text-ocean-800 py-3 rounded-2xl text-sm font-bold hover:bg-ocean-100 transition-colors disabled:opacity-50"
          >
            📤 {t('share.share')}
          </button>
          <button
            onClick={handleDownload}
            disabled={generating}
            class="flex-1 bg-white/20 text-white py-3 rounded-2xl text-sm font-bold hover:bg-white/30 transition-colors disabled:opacity-50"
          >
            💾 {t('share.download')}
          </button>
        </div>
      </div>
    </div>
  )
}
