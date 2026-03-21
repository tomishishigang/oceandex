import { useRoute } from 'preact-iso'
import { speciesById } from '../data/species'
import { categoryMap } from '../data/categories'
import { tagMap } from '../data/tags'
import { t, locale } from '../hooks/useLocale'
import { MarkAsSeen } from '../components/MarkAsSeen'
import { href } from '../base'

export function SpeciesDetail() {
  const { params } = useRoute()
  const id = Number(params.id)
  const sp = speciesById.get(id)

  if (!sp) {
    return (
      <div class="px-4 py-16 text-center">
        <div class="text-5xl mb-3">🌊</div>
        <p class="text-ocean-500 font-medium">{t('detail.not_found')}</p>
        <a href={href("/")} class="text-ocean-600 underline text-sm mt-3 inline-block">
          ← {t('detail.back')}
        </a>
      </div>
    )
  }

  const cat = categoryMap.get(sp.category)
  const displayName =
    locale.value === 'es'
      ? sp.common_name_es ?? sp.common_name_en ?? sp.scientific_name
      : sp.common_name_en ?? sp.common_name_es ?? sp.scientific_name
  const secondaryName =
    locale.value === 'es' ? sp.common_name_en : sp.common_name_es

  const tierClass =
    sp.sightability_tier === 'common' ? 'bg-tier-common'
    : sp.sightability_tier === 'uncommon' ? 'bg-tier-uncommon'
    : sp.sightability_tier === 'rare' ? 'bg-tier-rare'
    : 'bg-tier-unlikely'

  const taxonomyRows = [
    ['detail.phylum', sp.phylum],
    ['detail.class', sp.class],
    ['detail.order', sp.order],
    ['detail.family', sp.family],
    ['detail.genus', sp.genus],
  ].filter(([, val]) => val)

  return (
    <div class="pb-6">
      {/* Hero image */}
      <div class="relative">
        {sp.primary_photo?.url_medium ? (
          <img
            src={sp.primary_photo.url_medium}
            alt={sp.scientific_name}
            class="w-full aspect-[4/3] object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none'
            }}
          />
        ) : (
          <div
            class="w-full aspect-[4/3] flex items-center justify-center text-7xl"
            style={{ backgroundColor: cat?.color ?? '#e2e8f0', opacity: 0.2 }}
          >
            {cat?.emoji ?? '🌊'}
          </div>
        )}

        {/* Back button overlay */}
        <a
          href={href("/")}
          class="absolute top-3 left-3 bg-black/40 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full no-underline hover:bg-black/60 transition-colors"
        >
          ← {t('detail.back')}
        </a>
      </div>

      {/* Main info card */}
      <div class="px-4 -mt-6 relative z-10">
        <div class="bg-white rounded-2xl p-5 shadow-lg">
          {/* Name */}
          <h2 class="text-xl font-bold text-ocean-900 leading-tight">
            {displayName}
          </h2>
          <p class="text-sm italic text-ocean-500 mt-0.5">{sp.scientific_name}</p>
          {secondaryName && (
            <p class="text-xs text-ocean-400 mt-0.5">{secondaryName}</p>
          )}
          {sp.worms_authority && (
            <p class="text-[10px] text-ocean-300 mt-0.5">{sp.worms_authority}</p>
          )}

          {/* Badges row */}
          <div class="mt-3 flex flex-wrap gap-2 items-center">
            <span class={`text-xs px-2.5 py-1 rounded-full font-semibold text-white ${tierClass}`}>
              {t(`tier.${sp.sightability_tier}`)}
            </span>
            <span
              class="text-xs px-2.5 py-1 rounded-full text-white font-medium"
              style={{ backgroundColor: cat?.color }}
            >
              {cat?.emoji} {locale.value === 'es' ? cat?.label_es : cat?.label_en}
            </span>
            {sp.tags?.map(tagId => {
              const tag = tagMap.get(tagId)
              if (!tag) return null
              return (
                <span key={tagId} class="text-xs px-2.5 py-1 rounded-full bg-deep-100 text-deep-700 font-medium">
                  {tag.emoji} {locale.value === 'es' ? tag.label_es : tag.label_en}
                </span>
              )
            })}
            <span class="text-xs text-ocean-400 ml-auto">
              {t('detail.score')}: {sp.sightability_score}/100
            </span>
          </div>
        </div>

        {/* Sightability bar */}
        <div class="bg-white rounded-2xl p-4 shadow-sm mt-3">
          <h3 class="text-xs font-semibold text-ocean-600 mb-2 uppercase tracking-wide">
            {t('detail.sightability')}
          </h3>
          <div class="w-full bg-ocean-100 rounded-full h-2.5">
            <div
              class={`h-2.5 rounded-full transition-all ${tierClass}`}
              style={{ width: `${sp.sightability_score}%` }}
            />
          </div>
          <div class="flex justify-between mt-1.5 text-[10px] text-ocean-400">
            <span>{t('tier.unlikely')}</span>
            <span>{t('tier.common')}</span>
          </div>
        </div>

        {/* Taxonomy */}
        {taxonomyRows.length > 0 && (
          <div class="bg-white rounded-2xl p-4 shadow-sm mt-3">
            <h3 class="text-xs font-semibold text-ocean-600 mb-3 uppercase tracking-wide">
              {t('detail.taxonomy')}
            </h3>
            <div class="space-y-2">
              {taxonomyRows.map(([key, val]) => (
                <div key={key} class="flex justify-between items-center text-sm">
                  <span class="text-ocean-400">{t(key as string)}</span>
                  <span class="text-ocean-800 font-medium">{val}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Observation stats */}
        <div class="bg-white rounded-2xl p-4 shadow-sm mt-3">
          <h3 class="text-xs font-semibold text-ocean-600 mb-3 uppercase tracking-wide">
            {t('detail.observations')}
          </h3>
          <div class="grid grid-cols-2 gap-3">
            <div class="text-center p-2 bg-ocean-50 rounded-xl">
              <div class="text-lg font-bold text-ocean-800">{sp.inat_observations}</div>
              <div class="text-[10px] text-ocean-500">iNaturalist</div>
            </div>
            <div class="text-center p-2 bg-ocean-50 rounded-xl">
              <div class="text-lg font-bold text-ocean-800">{sp.observation_count}</div>
              <div class="text-[10px] text-ocean-500">OBIS</div>
            </div>
          </div>
        </div>

        {/* Photo attribution */}
        {sp.primary_photo?.attribution && (
          <p class="text-[10px] text-ocean-300 mt-3 text-center px-2">
            {t('detail.photo_by')}: {sp.primary_photo.attribution}
          </p>
        )}

        {/* Mark as seen */}
        <div class="mt-4">
          <MarkAsSeen speciesId={sp.id} />
        </div>

        {/* Actions */}
        <div class="mt-3 space-y-2">
          <a
            href={href('/compare')}
            class="flex items-center justify-center gap-2 bg-white rounded-2xl p-3 shadow-sm text-sm text-ocean-600 font-medium no-underline hover:bg-ocean-50 transition-colors border border-ocean-200"
          >
            <span>⚖️</span>
            {t('compare.title')}
          </a>
          {sp.wikipedia_url && (
            <a
              href={sp.wikipedia_url}
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center justify-center gap-2 bg-white rounded-2xl p-3 shadow-sm text-sm text-deep-600 font-medium no-underline hover:bg-deep-50 transition-colors border border-deep-100"
            >
              <span>📖</span>
              {t('detail.wikipedia')}
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
