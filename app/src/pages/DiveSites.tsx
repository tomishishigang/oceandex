import { diveSites } from '../data/diveSites'
import { t } from '../hooks/useLocale'
import { href } from '../base'

const difficultyColors: Record<string, string> = {
  beginner: 'bg-green-100 text-green-700',
  intermediate: 'bg-amber-100 text-amber-700',
  advanced: 'bg-red-100 text-red-700',
}

export function DiveSites() {
  const zones = [...new Set(diveSites.map((s) => s.zone))]
  const totalSites = diveSites.length

  return (
    <div class="px-4 py-4">
      {/* Header */}
      <div class="mb-5">
        <h2 class="text-xl font-bold text-ocean-800">{t('sites.title')}</h2>
        <p class="text-sm text-ocean-500 mt-0.5">
          {t('sites.subtitle')} · {totalSites} {t('sites.sites_count')}
        </p>
      </div>

      {/* Zone groups */}
      {zones.map((zone) => {
        const zoneSites = diveSites.filter((s) => s.zone === zone)
        return (
          <div key={zone} class="mb-6">
            <div class="flex items-center gap-2 mb-2">
              <span class="text-sm">📍</span>
              <h3 class="text-sm font-bold text-ocean-700">{zone}</h3>
              <span class="text-xs text-ocean-400">
                {zoneSites.length} {t('sites.sites_count')}
              </span>
            </div>

            <div class="space-y-2">
              {zoneSites.map((site) => (
                <a
                  key={site.name}
                  href={href(`/sites/${encodeURIComponent(site.name)}`)}
                  class="block bg-white rounded-2xl p-4 shadow-sm border border-ocean-100 no-underline text-ocean-950 hover:shadow-md transition-shadow"
                >
                  {/* Site name and difficulty */}
                  <div class="flex items-start justify-between gap-2">
                    <h4 class="font-semibold text-ocean-800">{site.name}</h4>
                    <span class={`text-[10px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${difficultyColors[site.difficulty] ?? ''}`}>
                      {t(`difficulty.${site.difficulty}`)}
                    </span>
                  </div>

                  {/* Details row */}
                  <div class="flex items-center gap-3 mt-2 text-xs text-ocean-500">
                    <span class="flex items-center gap-1">
                      <span>🌊</span>
                      {site.max_depth_m}m
                    </span>
                    <span class="flex items-center gap-1">
                      <span>📏</span>
                      {t('sites.depth')}
                    </span>
                  </div>

                  {/* Type tags */}
                  <div class="flex gap-1.5 mt-2 flex-wrap">
                    {site.type.map((typ) => (
                      <span
                        key={typ}
                        class="text-[10px] bg-ocean-50 text-ocean-600 px-2 py-0.5 rounded-full border border-ocean-100"
                      >
                        {t(`sitetype.${typ}`)}
                      </span>
                    ))}
                  </div>

                  {/* View detail hint */}
                  <p class="text-[10px] text-ocean-400 mt-3">
                    {t('site.detail_title')} →
                  </p>
                </a>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
