import { useRoute, useLocation } from 'preact-iso'
import { t, locale } from '../hooks/useLocale'
import {
  useLiveQuery,
  getSession,
  getSightingsForSession,
  deleteSession,
  deleteSighting,
} from '../db'
import type { DiveSession, Sighting } from '../db'
import { speciesById } from '../data/species'
import { categoryMap } from '../data/categories'

export function DiveSessionDetail() {
  const { params } = useRoute()
  const { route } = useLocation()
  const sessionId = params.id as string

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

  if (session === undefined) {
    return (
      <div class="px-4 py-16 text-center">
        <div class="text-5xl mb-3">🤿</div>
        <p class="text-ocean-500">Inmersión no encontrada</p>
        <a href="/log" class="text-ocean-600 underline text-sm mt-3 inline-block">
          ← {t('detail.back')}
        </a>
      </div>
    )
  }

  async function handleDelete() {
    if (confirm(t('log.delete_confirm'))) {
      await deleteSession(sessionId)
      route('/log')
    }
  }

  async function handleRemoveSighting(sightingId: string) {
    await deleteSighting(sightingId)
  }

  return (
    <div class="px-4 py-4 pb-6">
      {/* Back */}
      <a href="/log" class="text-sm text-ocean-500 no-underline mb-3 inline-block">
        ← {t('detail.back')}
      </a>

      {/* Session info */}
      <div class="bg-white rounded-2xl p-5 shadow-sm">
        <h2 class="text-xl font-bold text-ocean-800">{session.siteName}</h2>
        <p class="text-sm text-ocean-500 mt-1">{session.date}</p>
        {session.maxDepthM && (
          <p class="text-xs text-ocean-400 mt-1">🌊 {t('sites.depth')}: {session.maxDepthM}m</p>
        )}
        {session.notes && (
          <p class="text-sm text-ocean-600 mt-2 bg-ocean-50 rounded-xl p-3">{session.notes}</p>
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
                  class="bg-white rounded-xl p-3 shadow-sm border border-ocean-100 flex items-center gap-3"
                >
                  <a href={`/species/${sp.id}`} class="shrink-0 no-underline">
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
                  <a href={`/species/${sp.id}`} class="flex-1 min-w-0 no-underline text-ocean-950">
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
              )
            })}
          </div>
        ) : (
          <div class="text-center py-8">
            <p class="text-ocean-400 text-sm">{t('log.no_sightings')}</p>
            <a
              href="/"
              class="text-ocean-600 text-sm font-medium no-underline mt-2 inline-block"
            >
              {t('nav.species')} →
            </a>
          </div>
        )}
      </div>

      {/* Delete session */}
      <button
        onClick={handleDelete}
        class="w-full mt-6 py-2.5 rounded-xl border border-red-200 text-red-500 text-sm font-medium hover:bg-red-50 transition-colors"
      >
        {t('log.delete')}
      </button>
    </div>
  )
}
