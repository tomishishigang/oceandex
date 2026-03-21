import { useRef, useEffect } from 'preact/hooks'
import { t } from '../hooks/useLocale'
import { species } from '../data/species'
import { useSearch } from '../hooks/useSearch'
import {
  searchQuery,
  selectedCategory,
  selectedTag,
  selectedTier,
  showAllSpecies,
  seenFilter,
  useFilteredSpecies,
} from '../hooks/useFilters'
import { useLiveQuery, getSeenSpeciesIds, getSeenCount } from '../db'
import { SearchBar } from '../components/SearchBar'
import { FilterChips } from '../components/FilterChips'
import { SpeciesCard } from '../components/SpeciesCard'

export function SpeciesList() {
  const seenIds = useLiveQuery(() => getSeenSpeciesIds(), [], new Set<number>())
  const seenCount = useLiveQuery(() => getSeenCount(), [], 0)
  const searchResults = useSearch(species, searchQuery.value)
  const filtered = useFilteredSpecies(
    searchResults,
    selectedCategory.value,
    selectedTag.value,
    selectedTier.value,
    showAllSpecies.value,
    seenIds,
    seenFilter.value,
  )

  // Scroll to top when filters change
  const listRef = useRef<HTMLDivElement>(null)
  const filterKey = `${searchQuery.value}|${selectedCategory.value}|${selectedTag.value}|${selectedTier.value}|${showAllSpecies.value}|${seenFilter.value}`
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [filterKey])

  return (
    <div class="px-4 py-4 space-y-3" ref={listRef}>
      {/* Progress bar */}
      {seenCount > 0 && (
        <div class="bg-white rounded-xl p-3 shadow-sm border border-ocean-100">
          <div class="flex justify-between text-xs text-ocean-600 mb-1.5">
            <span class="font-semibold">{t('stats.progress')}</span>
            <span>{seenCount} {t('stats.seen_of')} 327</span>
          </div>
          <div class="w-full bg-ocean-100 rounded-full h-2">
            <div
              class="h-2 rounded-full bg-ocean-500 transition-all"
              style={{ width: `${Math.min(100, (seenCount / 327) * 100)}%` }}
            />
          </div>
        </div>
      )}

      <SearchBar />
      <FilterChips />

      {/* Results count */}
      <p class="text-xs text-ocean-400">
        {filtered.length} {t('species.count')}
      </p>

      {/* Species grid */}
      {filtered.length > 0 ? (
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 pb-4">
          {filtered.map((sp) => (
            <SpeciesCard key={sp.id} species={sp} isSeen={seenIds.has(sp.id)} />
          ))}
        </div>
      ) : (
        <div class="text-center py-12">
          <div class="text-4xl mb-2">🔍</div>
          <p class="text-ocean-500 text-sm">{t('species.no_results')}</p>
        </div>
      )}
    </div>
  )
}
