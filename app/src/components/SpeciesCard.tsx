import { useState } from 'preact/hooks'
import { locale, t } from '../hooks/useLocale'
import { categoryMap } from '../data/categories'
import { href } from '../base'
import type { Species } from '../data/types'
import {
  useLiveQuery,
  getAllSessions,
  createSighting,
  createSession,
} from '../db'
import type { DiveSession } from '../db'

interface Props {
  species: Species
  isSeen?: boolean
}

export function SpeciesCard({ species: sp, isSeen }: Props) {
  const cat = categoryMap.get(sp.category)
  const displayName =
    locale.value === 'es'
      ? sp.common_name_es ?? sp.common_name_en ?? sp.scientific_name
      : sp.common_name_en ?? sp.common_name_es ?? sp.scientific_name

  const hasPhoto = !!sp.primary_photo?.url_medium
  const [imgLoaded, setImgLoaded] = useState(false)
  const [imgError, setImgError] = useState(false)
  const showPlaceholder = !hasPhoto || imgError

  const [feedback, setFeedback] = useState<string | null>(null)
  const [showPicker, setShowPicker] = useState(false)
  const sessions = useLiveQuery(() => getAllSessions(), [], [] as DiveSession[])

  async function handleQuickAdd(e: Event) {
    e.preventDefault()
    e.stopPropagation()

    if (sessions.length === 0) {
      const session = await createSession({
        siteName: 'Inmersión rápida',
        date: new Date().toISOString().split('T')[0],
      })
      const result = await createSighting(session.id, sp.id)
      showFeedbackMsg(result ? 'added' : 'already')
    } else if (sessions.length === 1) {
      const result = await createSighting(sessions[0].id, sp.id)
      showFeedbackMsg(result ? 'added' : 'already')
    } else {
      setShowPicker(true)
    }
  }

  async function handlePickSession(e: Event, sessionId: string) {
    e.preventDefault()
    e.stopPropagation()
    const result = await createSighting(sessionId, sp.id)
    showFeedbackMsg(result ? 'added' : 'already')
    setShowPicker(false)
  }

  function showFeedbackMsg(type: string) {
    setFeedback(type)
    setTimeout(() => setFeedback(null), 1500)
  }

  function handleSaveScroll() {
    // Save scroll position before navigating to detail
    sessionStorage.setItem('speciesListScroll', String(window.scrollY))
  }

  return (
    <div class="relative">
      <a
        href={href(`/species/${sp.id}`)}
        onClick={handleSaveScroll}
        class="bg-white rounded-xl overflow-hidden shadow-sm border border-ocean-100 no-underline text-ocean-950 hover:shadow-md transition-shadow flex flex-col"
      >
        {/* Photo */}
        <div class="relative aspect-square">
          {hasPhoto && !imgError && (
            <img
              src={sp.primary_photo!.url_medium!}
              alt={sp.scientific_name}
              class={`w-full h-full object-cover transition-opacity duration-300 ${
                imgLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              loading="lazy"
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
            />
          )}

          {/* Skeleton while loading */}
          {hasPhoto && !imgLoaded && !imgError && (
            <div class="absolute inset-0 bg-ocean-100 animate-pulse" />
          )}

          {/* Placeholder for no-photo or error */}
          {showPlaceholder && (
            <div class="absolute inset-0 bg-ocean-100 flex items-center justify-center text-3xl">
              {cat?.emoji ?? '🌊'}
            </div>
          )}

          {/* Sightability badge */}
          <span
            class={`absolute top-1.5 right-1.5 text-[9px] px-1.5 py-0.5 rounded-full font-medium text-white shadow-sm ${
              sp.sightability_tier === 'common' ? 'bg-tier-common'
              : sp.sightability_tier === 'uncommon' ? 'bg-tier-uncommon'
              : sp.sightability_tier === 'rare' ? 'bg-tier-rare'
              : 'bg-tier-unlikely'
            }`}
          >
            {t(`tier.${sp.sightability_tier}`)}
          </span>

          {/* Seen badge */}
          {isSeen && (
            <span class="absolute top-1.5 left-1.5 text-[9px] px-1.5 py-0.5 rounded-full font-medium text-white shadow-sm bg-ocean-700">
              ✓
            </span>
          )}

          {/* Feedback overlay */}
          {feedback && (
            <div class="absolute inset-0 bg-black/50 flex items-center justify-center rounded-t-xl">
              <span class="text-white text-sm font-semibold">
                {feedback === 'added' ? '✓' : t('sighting.already')}
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div class="p-2 flex-1 flex flex-col">
          <p class="text-xs font-semibold truncate leading-tight">{displayName}</p>
          <p class="text-[10px] text-ocean-500 italic truncate mt-0.5">{sp.scientific_name}</p>
          <div class="mt-auto pt-1">
            <span
              class="text-[9px] px-1.5 py-0.5 rounded"
              style={{ backgroundColor: cat?.color, color: 'white', opacity: 0.8 }}
            >
              {cat?.emoji} {locale.value === 'es' ? cat?.label_es : cat?.label_en}
            </span>
          </div>
        </div>
      </a>

      {/* Quick-add button */}
      <button
        onClick={handleQuickAdd}
        class={`absolute bottom-1.5 right-1.5 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shadow-md transition-colors z-10 ${
          isSeen
            ? 'bg-tier-common text-white'
            : 'bg-ocean-700 text-white hover:bg-ocean-600'
        }`}
        aria-label={t('sighting.mark_seen')}
      >
        {isSeen ? '✓' : '+'}
      </button>

      {/* Session picker dropdown */}
      {showPicker && (
        <div
          class="absolute bottom-10 right-1 bg-white rounded-xl shadow-lg border border-ocean-200 overflow-hidden z-20 w-48"
          onClick={(e) => { e.preventDefault(); e.stopPropagation() }}
        >
          <p class="text-[10px] font-semibold text-ocean-600 px-2 pt-2 pb-1">
            {t('sighting.select_session')}
          </p>
          {sessions.slice(0, 5).map((s) => (
            <button
              key={s.id}
              onClick={(e) => handlePickSession(e, s.id)}
              class="w-full text-left px-2 py-1.5 text-xs text-ocean-800 hover:bg-ocean-50 transition-colors border-t border-ocean-100"
            >
              <span class="font-medium">{s.siteName}</span>
              <span class="text-ocean-400 text-[10px] ml-1">{s.date}</span>
            </button>
          ))}
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowPicker(false) }}
            class="w-full text-center py-1.5 text-[10px] text-ocean-400 border-t border-ocean-100"
          >
            {t('newdive.cancel')}
          </button>
        </div>
      )}
    </div>
  )
}
