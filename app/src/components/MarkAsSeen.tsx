import { useState } from 'preact/hooks'
import { t } from '../hooks/useLocale'
import { href } from '../base'
import {
  useLiveQuery,
  getAllSessions,
  getSightingsForSpecies,
  createSighting,
  createSession,
} from '../db'
import type { DiveSession, Sighting } from '../db'

interface Props {
  speciesId: number
}

export function MarkAsSeen({ speciesId }: Props) {
  const sessions = useLiveQuery(() => getAllSessions(), [], [] as DiveSession[])
  const sightings = useLiveQuery(
    () => getSightingsForSpecies(speciesId),
    [speciesId],
    [] as Sighting[],
  )

  const [showPicker, setShowPicker] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)

  async function handleQuickAdd() {
    if (sessions.length === 0) {
      // Create a quick session for today
      const session = await createSession({
        siteName: 'Inmersión rápida',
        date: new Date().toISOString().split('T')[0],
      })
      const result = await createSighting(session.id, speciesId)
      showFeedback(result ? 'sighting.added' : 'sighting.already')
    } else if (sessions.length === 1) {
      const result = await createSighting(sessions[0].id, speciesId)
      showFeedback(result ? 'sighting.added' : 'sighting.already')
    } else {
      setShowPicker(true)
    }
  }

  async function handlePickSession(sessionId: string) {
    const result = await createSighting(sessionId, speciesId)
    showFeedback(result ? 'sighting.added' : 'sighting.already')
    setShowPicker(false)
  }

  function showFeedback(key: string) {
    setFeedback(key)
    setTimeout(() => setFeedback(null), 2000)
  }

  return (
    <div>
      {/* Mark as seen button */}
      <button
        onClick={handleQuickAdd}
        class={`flex items-center justify-center gap-2 w-full rounded-2xl p-3 shadow-sm text-sm font-medium transition-colors border ${
          sightings.length > 0
            ? 'bg-tier-common/10 border-tier-common text-green-700'
            : 'bg-white border-ocean-200 text-ocean-700 hover:bg-ocean-50'
        }`}
      >
        <span>{sightings.length > 0 ? '✓' : '👁'}</span>
        {sightings.length > 0
          ? `${t('sighting.seen')} (${sightings.length} ${t('sighting.times_seen')})`
          : t('sighting.mark_seen')}
      </button>

      {/* Feedback toast */}
      {feedback && (
        <p class="text-xs text-center text-ocean-500 mt-2 animate-pulse">
          {t(feedback)}
        </p>
      )}

      {/* Session picker */}
      {showPicker && (
        <div class="mt-2 bg-white rounded-2xl shadow-lg border border-ocean-200 overflow-hidden">
          <p class="text-xs font-semibold text-ocean-600 px-3 pt-3 pb-1">
            {t('sighting.select_session')}
          </p>
          {sessions.slice(0, 5).map((s) => (
            <button
              key={s.id}
              onClick={() => handlePickSession(s.id)}
              class="w-full text-left px-3 py-2.5 text-sm text-ocean-800 hover:bg-ocean-50 transition-colors border-t border-ocean-100"
            >
              <span class="font-medium">{s.siteName}</span>
              <span class="text-ocean-400 text-xs ml-2">{s.date}</span>
            </button>
          ))}
          <button
            onClick={() => setShowPicker(false)}
            class="w-full text-center py-2 text-xs text-ocean-400 border-t border-ocean-100"
          >
            {t('newdive.cancel')}
          </button>
        </div>
      )}

      {/* Sighting history */}
      {sightings.length > 0 && (
        <div class="mt-3">
          <p class="text-[10px] text-ocean-400 uppercase tracking-wide mb-1">
            {t('sighting.history')}
          </p>
          {sightings.map((s) => {
            const session = sessions.find((sess) => sess.id === s.sessionId)
            return (
              <a
                key={s.id}
                href={href(`/log/${s.sessionId}`)}
                class="block text-xs text-ocean-500 no-underline hover:text-ocean-700 py-0.5"
              >
                📍 {session?.siteName ?? '?'} — {session?.date ?? '?'}
              </a>
            )
          })}
        </div>
      )}
    </div>
  )
}
