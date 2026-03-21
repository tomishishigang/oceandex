import { useMemo } from 'preact/hooks'
import { signal } from '@preact/signals'
import type { Species, Category, SightabilityTier } from '../data/types'

export const searchQuery = signal('')
export const selectedCategory = signal<Category | null>(null)
export const selectedTag = signal<string | null>(null)
export const selectedTier = signal<SightabilityTier | null>(null)
export const showAllSpecies = signal(false)
export const seenFilter = signal<'all' | 'seen' | 'unseen'>('all')

export function clearFilters() {
  searchQuery.value = ''
  selectedCategory.value = null
  selectedTag.value = null
  selectedTier.value = null
  seenFilter.value = 'all'
}

export function useFilteredSpecies(
  searchResults: Species[],
  category: Category | null,
  tag: string | null,
  tier: SightabilityTier | null,
  showAll: boolean,
  seenIds: Set<number>,
  seenFilterValue: 'all' | 'seen' | 'unseen',
): Species[] {
  return useMemo(() => {
    let filtered = searchResults

    // Default: show only recommended (common+uncommon with photo)
    if (!showAll) {
      filtered = filtered.filter(
        (s) =>
          s.primary_photo &&
          (s.sightability_tier === 'common' || s.sightability_tier === 'uncommon'),
      )
    }

    if (category) {
      filtered = filtered.filter((s) => s.category === category)
    }

    if (tag) {
      filtered = filtered.filter((s) => s.tags?.includes(tag))
    }

    if (tier) {
      filtered = filtered.filter((s) => s.sightability_tier === tier)
    }

    if (seenFilterValue === 'seen') {
      filtered = filtered.filter((s) => seenIds.has(s.id))
    } else if (seenFilterValue === 'unseen') {
      filtered = filtered.filter((s) => !seenIds.has(s.id))
    }

    return filtered
  }, [searchResults, category, tag, tier, showAll, seenIds, seenFilterValue])
}
