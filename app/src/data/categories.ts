// Category display metadata
import type { Category } from './types'

export interface CategoryInfo {
  id: Category
  label_es: string
  label_en: string
  color: string
  emoji: string
}

export const categories: CategoryInfo[] = [
  { id: 'fish_and_vertebrates', label_es: 'Peces y vertebrados', label_en: 'Fish & vertebrates', color: 'var(--color-cat-fish)', emoji: '🐟' },
  { id: 'mollusks', label_es: 'Moluscos', label_en: 'Mollusks', color: 'var(--color-cat-mollusks)', emoji: '🐙' },
  { id: 'crustaceans', label_es: 'Crustáceos', label_en: 'Crustaceans', color: 'var(--color-cat-crustaceans)', emoji: '🦀' },
  { id: 'echinoderms', label_es: 'Equinodermos', label_en: 'Echinoderms', color: 'var(--color-cat-echinoderms)', emoji: '⭐' },
  { id: 'algae', label_es: 'Algas', label_en: 'Algae', color: 'var(--color-cat-algae)', emoji: '🌿' },
  { id: 'cnidarians', label_es: 'Cnidarios', label_en: 'Cnidarians', color: 'var(--color-cat-cnidarians)', emoji: '🪸' },
  { id: 'worms', label_es: 'Gusanos', label_en: 'Worms', color: 'var(--color-cat-worms)', emoji: '🪱' },
  { id: 'sponges', label_es: 'Esponjas', label_en: 'Sponges', color: 'var(--color-cat-sponges)', emoji: '🧽' },
]

export const categoryMap = new Map(categories.map((c) => [c.id, c]))
