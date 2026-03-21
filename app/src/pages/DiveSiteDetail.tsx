import { useRoute } from 'preact-iso'
import { href } from '../base'
import { t, locale } from '../hooks/useLocale'
import { diveSites } from '../data/diveSites'
import { speciesById } from '../data/species'
import { categoryMap } from '../data/categories'
import { useLiveQuery, getSightingsForSite, getSessionsForSite } from '../db'
import type { DiveSession } from '../db'

const difficultyColors: Record<string, string> = {
  beginner: 'bg-green-100 text-green-700',
  intermediate: 'bg-amber-100 text-amber-700',
  advanced: 'bg-red-100 text-red-700',
}

export function DiveSiteDetail() {
  const { params } = useRoute()
  const siteName = decodeURIComponent(params.name as string)
  const site = diveSites.find(s => s.name === siteName)

  const sessions = useLiveQuery(
    () => getSessionsForSite(siteName),
    [siteName],
    [] as DiveSession[],
  )
  const seenSpeciesIds = useLiveQuery(
    () => getSightingsForSite(siteName),
    [siteName],
    [] as number[],
  )

  if (!site) {
    return (
      <div class="px-4 py-16 text-center">
        <div class="text-5xl mb-3">📍</div>
        <p class="text-ocean-500">Sitio no encontrado</p>
        <a href={href("/sites")} class="text-ocean-600 underline text-sm mt-3 inline-block">
          ← {t('detail.back')}
        </a>
      </div>
    )
  }

  const seenSpecies = seenSpeciesIds.map(id => speciesById.get(id)).filter(Boolean)

  return (
    <div class="px-4 py-4 pb-6">
      <a href={href("/sites")} class="text-sm text-ocean-500 no-underline mb-3 inline-block">
        ← {t('detail.back')}
      </a>

      {/* Site info card */}
      <div class="bg-white rounded-2xl p-5 shadow-sm">
        <div class="flex items-start justify-between gap-2">
          <div>
            <h2 class="text-xl font-bold text-ocean-800">{site.name}</h2>
            <p class="text-sm text-ocean-500 mt-0.5">{site.zone}, {site.region}</p>
          </div>
          <span class={`text-[10px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${difficultyColors[site.difficulty] ?? ''}`}>
            {t(`difficulty.${site.difficulty}`)}
          </span>
        </div>

        <div class="flex gap-3 mt-3 text-xs text-ocean-500">
          <span>🌊 {site.max_depth_m}m</span>
          <span>🤿 {sessions.length} {t('site.dives_count')}</span>
          <span>🐟 {seenSpeciesIds.length} {t('log.species_seen')}</span>
        </div>

        <div class="flex gap-1.5 mt-3 flex-wrap">
          {site.type.map((typ) => (
            <span key={typ} class="text-[10px] bg-ocean-50 text-ocean-600 px-2 py-0.5 rounded-full border border-ocean-100">
              {t(`sitetype.${typ}`)}
            </span>
          ))}
        </div>

        <a
          href={`https://www.google.com/maps?q=${site.lat},${site.lng}`}
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center gap-1 mt-3 text-xs text-deep-600 font-medium no-underline hover:text-deep-700"
        >
          🗺️ {t('sites.map')}
        </a>
      </div>

      {/* Species seen here */}
      <div class="mt-4">
        <h3 class="text-xs font-semibold text-ocean-600 uppercase tracking-wide mb-2">
          {t('site.your_sightings')}
        </h3>

        {seenSpecies.length > 0 ? (
          <div class="grid grid-cols-3 gap-2">
            {seenSpecies.map(sp => {
              if (!sp) return null
              const cat = categoryMap.get(sp.category)
              const name = locale.value === 'es'
                ? sp.common_name_es ?? sp.common_name_en ?? sp.scientific_name
                : sp.common_name_en ?? sp.common_name_es ?? sp.scientific_name

              return (
                <a
                  key={sp.id}
                  href={href(`/species/${sp.id}`)}
                  class="bg-white rounded-xl overflow-hidden shadow-sm border border-ocean-100 no-underline text-ocean-950"
                >
                  {sp.primary_photo?.url_medium ? (
                    <img src={sp.primary_photo.url_medium} alt="" class="w-full aspect-square object-cover" loading="lazy" />
                  ) : (
                    <div class="w-full aspect-square bg-ocean-100 flex items-center justify-center text-2xl">
                      {cat?.emoji ?? '🌊'}
                    </div>
                  )}
                  <p class="text-[10px] p-1.5 truncate font-medium">{name}</p>
                </a>
              )
            })}
          </div>
        ) : (
          <div class="text-center py-8">
            <p class="text-ocean-400 text-sm">{t('site.no_sightings')}</p>
            <a
              href={href("/log/new")}
              class="text-ocean-600 text-sm font-medium no-underline mt-2 inline-block"
            >
              {t('site.dive_here')} →
            </a>
          </div>
        )}
      </div>

      {/* Dive history at this site */}
      {sessions.length > 0 && (
        <div class="mt-4">
          <h3 class="text-xs font-semibold text-ocean-600 uppercase tracking-wide mb-2">
            {sessions.length} {t('site.dives_count')}
          </h3>
          <div class="space-y-2">
            {sessions.map(session => (
              <a
                key={session.id}
                href={href(`/log/${session.id}`)}
                class="block bg-white rounded-xl p-3 shadow-sm border border-ocean-100 no-underline text-ocean-950"
              >
                <p class="text-sm font-medium text-ocean-800">{session.date}</p>
                <div class="flex gap-2 mt-0.5 text-xs text-ocean-400">
                  {session.maxDepthM != null && <span>🌊 {session.maxDepthM}m</span>}
                  {session.waterTempC != null && <span>🌡️ {session.waterTempC}°C</span>}
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
