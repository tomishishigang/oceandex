import { effect } from '@preact/signals'
import { searchQuery, selectedCategory, selectedTier, showAllSpecies } from './useFilters'
import type { Category, SightabilityTier } from '../data/types'

const VALID_CATEGORIES: Category[] = [
  'fish_and_vertebrates', 'mollusks', 'crustaceans', 'echinoderms',
  'algae', 'cnidarians', 'worms', 'sponges',
]
const VALID_TIERS: SightabilityTier[] = ['common', 'uncommon', 'rare', 'unlikely']

/** Read URL params into signals on page load. */
export function initFromUrl() {
  if (typeof window === 'undefined') return
  const params = new URLSearchParams(window.location.search)

  const q = params.get('q')
  if (q) searchQuery.value = q

  const cat = params.get('category') as Category
  if (cat && VALID_CATEGORIES.includes(cat)) selectedCategory.value = cat

  const tier = params.get('tier') as SightabilityTier
  if (tier && VALID_TIERS.includes(tier)) selectedTier.value = tier

  if (params.get('all') === '1') showAllSpecies.value = true
}

/** Sync signal changes back to URL (replaceState, no navigation). */
export function startUrlSync() {
  effect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams()

    if (searchQuery.value) params.set('q', searchQuery.value)
    if (selectedCategory.value) params.set('category', selectedCategory.value)
    if (selectedTier.value) params.set('tier', selectedTier.value)
    if (showAllSpecies.value) params.set('all', '1')

    const qs = params.toString()
    const url = qs ? `${window.location.pathname}?${qs}` : window.location.pathname
    window.history.replaceState(null, '', url)
  })
}
