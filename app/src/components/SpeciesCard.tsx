import { useState } from 'preact/hooks'
import { locale, t } from '../hooks/useLocale'
import { categoryMap } from '../data/categories'
import type { Species } from '../data/types'

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

  return (
    <a
      href={`/species/${sp.id}`}
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
  )
}
