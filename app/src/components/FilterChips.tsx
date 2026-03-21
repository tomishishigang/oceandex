import { t, locale } from '../hooks/useLocale'
import { selectedCategory, selectedTag, selectedTier, showAllSpecies, seenFilter, clearFilters } from '../hooks/useFilters'
import { categories } from '../data/categories'
import { tags } from '../data/tags'
import type { SightabilityTier } from '../data/types'

const tiers: { id: SightabilityTier; color: string }[] = [
  { id: 'common', color: 'bg-tier-common' },
  { id: 'uncommon', color: 'bg-tier-uncommon' },
  { id: 'rare', color: 'bg-tier-rare' },
  { id: 'unlikely', color: 'bg-tier-unlikely' },
]

export function FilterChips() {
  const hasFilters = selectedCategory.value || selectedTag.value || selectedTier.value || seenFilter.value !== 'all'

  // Show tags relevant to the selected category, or all tags if no category selected
  const visibleTags = selectedCategory.value
    ? tags.filter(tag => tag.parentCategory === selectedCategory.value)
    : tags

  return (
    <div class="space-y-2">
      {/* Show all toggle */}
      <div class="flex items-center justify-between">
        <div class="flex gap-1.5">
          <button
            onClick={() => { showAllSpecies.value = false }}
            class={`text-xs px-2.5 py-1 rounded-full transition-colors ${
              !showAllSpecies.value
                ? 'bg-ocean-700 text-white'
                : 'bg-ocean-100 text-ocean-600'
            }`}
          >
            {t('species.recommended')}
          </button>
          <button
            onClick={() => { showAllSpecies.value = true }}
            class={`text-xs px-2.5 py-1 rounded-full transition-colors ${
              showAllSpecies.value
                ? 'bg-ocean-700 text-white'
                : 'bg-ocean-100 text-ocean-600'
            }`}
          >
            {t('species.all')}
          </button>
        </div>
        {hasFilters && (
          <button
            onClick={clearFilters}
            class="text-xs text-ocean-400 hover:text-ocean-600"
          >
            {t('filter.clear')}
          </button>
        )}
      </div>

      {/* Category chips */}
      <div class="flex gap-1.5 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-none">
        {categories.map((cat) => {
          const isActive = selectedCategory.value === cat.id
          return (
            <button
              key={cat.id}
              onClick={() => {
                selectedCategory.value = isActive ? null : cat.id
                // Clear tag if switching category
                if (selectedTag.value) {
                  const tagInfo = tags.find(t => t.id === selectedTag.value)
                  if (tagInfo && tagInfo.parentCategory !== cat.id) {
                    selectedTag.value = null
                  }
                }
              }}
              class={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-ocean-700 text-white'
                  : 'bg-white text-ocean-600 border border-ocean-200'
              }`}
            >
              <span>{cat.emoji}</span>
              {locale.value === 'es' ? cat.label_es : cat.label_en}
            </button>
          )
        })}
      </div>

      {/* Tag sub-filters (shown when relevant) */}
      {visibleTags.length > 0 && (
        <div class="flex gap-1.5 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-none">
          {visibleTags.map((tag) => {
            const isActive = selectedTag.value === tag.id
            return (
              <button
                key={tag.id}
                onClick={() => {
                  selectedTag.value = isActive ? null : tag.id
                  // Auto-select parent category if not already selected
                  if (!isActive && tag.parentCategory && selectedCategory.value !== tag.parentCategory) {
                    selectedCategory.value = tag.parentCategory
                  }
                }}
                class={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-deep-600 text-white'
                    : 'bg-ocean-50 text-ocean-600 border border-ocean-200'
                }`}
              >
                <span>{tag.emoji}</span>
                {locale.value === 'es' ? tag.label_es : tag.label_en}
              </button>
            )
          })}
        </div>
      )}

      {/* Tier + Seen chips */}
      <div class="flex gap-1.5 flex-wrap">
        {tiers.map((tier) => {
          const isActive = selectedTier.value === tier.id
          return (
            <button
              key={tier.id}
              onClick={() => {
                selectedTier.value = isActive ? null : tier.id
              }}
              class={`text-xs px-2.5 py-1 rounded-full transition-colors ${
                isActive
                  ? `${tier.color} text-white`
                  : 'bg-white text-ocean-600 border border-ocean-200'
              }`}
            >
              {t(`tier.${tier.id}`)}
            </button>
          )
        })}

        <span class="w-px bg-ocean-200 mx-0.5" />

        <button
          onClick={() => { seenFilter.value = seenFilter.value === 'seen' ? 'all' : 'seen' }}
          class={`text-xs px-2.5 py-1 rounded-full transition-colors ${
            seenFilter.value === 'seen'
              ? 'bg-ocean-700 text-white'
              : 'bg-white text-ocean-600 border border-ocean-200'
          }`}
        >
          ✓ {t('sighting.seen')}
        </button>
        <button
          onClick={() => { seenFilter.value = seenFilter.value === 'unseen' ? 'all' : 'unseen' }}
          class={`text-xs px-2.5 py-1 rounded-full transition-colors ${
            seenFilter.value === 'unseen'
              ? 'bg-ocean-700 text-white'
              : 'bg-white text-ocean-600 border border-ocean-200'
          }`}
        >
          ○ No {t('sighting.seen').toLowerCase()}
        </button>
      </div>
    </div>
  )
}
