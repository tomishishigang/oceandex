import { useState } from 'preact/hooks'
import { useRoute, useLocation } from 'preact-iso'
import { href } from '../base'
import { t, locale } from '../hooks/useLocale'
import {
  useLiveQuery,
  getSession,
  getSightingsForSession,
  deleteSession,
  deleteSighting,
  createSighting,
} from '../db'
import type { DiveSession, Sighting } from '../db'
import { speciesById } from '../data/species'
import { categoryMap } from '../data/categories'
import { SpeciesPicker } from '../components/SpeciesPicker'
import { PhotoCapture } from '../components/PhotoCapture'
import { ShareModal } from '../components/ShareModal'
import { useEarnedCount } from '../hooks/useBadges'

export function DiveSessionDetail() {
  const { params } = useRoute()
  const { route } = useLocation()
  const sessionId = params.id as string
  const [showPicker, setShowPicker] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const badgeCount = useEarnedCount()

  const session = useLiveQuery(
    () => getSession(sessionId),
    [sessionId],
    undefined as DiveSession | undefined,
  )
  const sightings = useLiveQuery(
    () => getSightingsForSession(sessionId),
    [sessionId],
    [] as Sighting[],
  )

  const alreadyAdded = new Set(sightings.map(s => s.speciesId))

  if (session === undefined) {
    return (
      <div class="px-4 py-16 text-center">
        <div class="text-5xl mb-3">🤿</div>
        <p class="text-ocean-500">Inmersión no encontrada</p>
        <a href={href("/log")} class="text-ocean-600 underline text-sm mt-3 inline-block">
          ← {t('detail.back')}
        </a>
      </div>
    )
  }

  async function handleDelete() {
    if (confirm(t('log.delete_confirm'))) {
      await deleteSession(sessionId)
      route(href('/log'))
    }
  }

  async function handleRemoveSighting(sightingId: string) {
    await deleteSighting(sightingId)
  }

  async function handleAddSpecies(speciesIds: number[]) {
    for (const spId of speciesIds) {
      await createSighting(sessionId, spId)
    }
    setShowPicker(false)
  }

  return (
    <div class="px-4 py-4 pb-6">
      {/* Back */}
      <a href={href("/log")} class="text-sm text-ocean-500 no-underline mb-3 inline-block">
        ← {t('detail.back')}
      </a>

      {/* Session info */}
      <div class="bg-white rounded-2xl p-5 shadow-sm">
        <h2 class="text-xl font-bold text-ocean-800">{session.siteName}</h2>
        <p class="text-sm text-ocean-500 mt-1">{session.date}</p>

        {/* Conditions grid */}
        {(session.maxDepthM || session.waterTempC || session.visibilityM || session.current) && (
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
            {session.maxDepthM != null && (
              <div class="bg-ocean-50 rounded-lg p-2 text-center">
                <div class="text-xs text-ocean-400">🌊 {t('sites.depth')}</div>
                <div class="text-sm font-semibold text-ocean-800">{session.maxDepthM}m</div>
              </div>
            )}
            {session.waterTempC != null && (
              <div class="bg-ocean-50 rounded-lg p-2 text-center">
                <div class="text-xs text-ocean-400">🌡️ {t('conditions.temp')}</div>
                <div class="text-sm font-semibold text-ocean-800">{session.waterTempC}°C</div>
              </div>
            )}
            {session.visibilityM != null && (
              <div class="bg-ocean-50 rounded-lg p-2 text-center">
                <div class="text-xs text-ocean-400">👁 {t('conditions.visibility')}</div>
                <div class="text-sm font-semibold text-ocean-800">{session.visibilityM}m</div>
              </div>
            )}
            {session.current && (
              <div class="bg-ocean-50 rounded-lg p-2 text-center">
                <div class="text-xs text-ocean-400">💨 {t('conditions.current')}</div>
                <div class="text-sm font-semibold text-ocean-800">{t(`current.${session.current}`)}</div>
              </div>
            )}
          </div>
        )}

        {session.notes && (
          <p class="text-sm text-ocean-600 mt-3 bg-ocean-50 rounded-xl p-3">{session.notes}</p>
        )}
      </div>

      {/* Species seen */}
      <div class="mt-4">
        <h3 class="text-xs font-semibold text-ocean-600 uppercase tracking-wide mb-2">
          {sightings.length} {t('log.species_seen')}
        </h3>

        {sightings.length > 0 ? (
          <div class="space-y-2">
            {sightings.map((sighting) => {
              const sp = speciesById.get(sighting.speciesId)
              if (!sp) return null
              const cat = categoryMap.get(sp.category)
              const name =
                locale.value === 'es'
                  ? sp.common_name_es ?? sp.common_name_en ?? sp.scientific_name
                  : sp.common_name_en ?? sp.common_name_es ?? sp.scientific_name

              return (
                <div
                  key={sighting.id}
                  class="bg-white rounded-xl p-3 shadow-sm border border-ocean-100"
                >
                  <div class="flex items-center gap-3">
                    <a href={href(`/species/${sp.id}`)} class="shrink-0 no-underline">
                      {sp.primary_photo?.url_medium ? (
                        <img
                          src={sp.primary_photo.url_medium}
                          alt={sp.scientific_name}
                          class="w-12 h-12 rounded-lg object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div class="w-12 h-12 rounded-lg bg-ocean-100 flex items-center justify-center text-lg">
                          {cat?.emoji ?? '🌊'}
                        </div>
                      )}
                    </a>
                    <a href={href(`/species/${sp.id}`)} class="flex-1 min-w-0 no-underline text-ocean-950">
                      <p class="text-sm font-semibold truncate">{name}</p>
                      <p class="text-[10px] text-ocean-500 italic truncate">{sp.scientific_name}</p>
                    </a>
                    <button
                      onClick={() => handleRemoveSighting(sighting.id)}
                      class="text-ocean-300 hover:text-red-500 text-xs transition-colors shrink-0"
                      aria-label="Remove sighting"
                    >
                      ✕
                    </button>
                  </div>
                  {/* Photos for this sighting */}
                  <div class="mt-2 ml-15">
                    <PhotoCapture sightingId={sighting.id} />
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div class="text-center py-8">
            <p class="text-ocean-400 text-sm">{t('log.no_sightings')}</p>
            <a
              href={href("/")}
              class="text-ocean-600 text-sm font-medium no-underline mt-2 inline-block"
            >
              {t('nav.species')} →
            </a>
          </div>
        )}
      </div>

      {/* Share + Delete */}
      <div class="mt-6 space-y-2">
        <button
          onClick={() => setShowShare(true)}
          class="w-full py-2.5 rounded-xl bg-ocean-700 text-white text-sm font-medium hover:bg-ocean-600 transition-colors"
        >
          📤 {t('share.button')}
        </button>
        <button
          onClick={handleDelete}
          class="w-full py-2.5 rounded-xl border border-red-200 text-red-500 text-sm font-medium hover:bg-red-50 transition-colors"
        >
          {t('log.delete')}
        </button>
      </div>

      {/* FAB: Add species */}
      <button
        onClick={() => setShowPicker(true)}
        class="fixed bottom-20 right-4 bg-ocean-700 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-2xl hover:bg-ocean-600 transition-colors z-40"
        aria-label={t('picker.add_species')}
      >
        +
      </button>

      {/* Species picker modal */}
      {showPicker && (
        <SpeciesPicker
          mode="multi"
          alreadySelected={alreadyAdded}
          onConfirm={handleAddSpecies}
          onClose={() => setShowPicker(false)}
        />
      )}

      {/* Share modal */}
      {showShare && session && (
        <ShareModal
          session={session}
          speciesIds={sightings.map(s => s.speciesId)}
          badgeCount={badgeCount}
          onClose={() => setShowShare(false)}
        />
      )}
    </div>
  )
}
