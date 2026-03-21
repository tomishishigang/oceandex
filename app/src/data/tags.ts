// Tag/subcategory definitions — NOT auto-generated
import type { Category } from './types'

export interface TagInfo {
  id: string
  label_es: string
  label_en: string
  emoji: string
  parentCategory?: Category
}

export const tags: TagInfo[] = [
  { id: 'nudibranch', label_es: 'Nudibranquios', label_en: 'Nudibranchs', emoji: '🦋', parentCategory: 'mollusks' },
  { id: 'shark_ray', label_es: 'Tiburones y rayas', label_en: 'Sharks & rays', emoji: '🦈', parentCategory: 'fish_and_vertebrates' },
  { id: 'octopus', label_es: 'Pulpos', label_en: 'Octopuses', emoji: '🐙', parentCategory: 'mollusks' },
  { id: 'crab', label_es: 'Cangrejos', label_en: 'Crabs', emoji: '🦀', parentCategory: 'crustaceans' },
  { id: 'sea_star', label_es: 'Estrellas de mar', label_en: 'Sea stars', emoji: '⭐', parentCategory: 'echinoderms' },
  { id: 'sea_urchin', label_es: 'Erizos', label_en: 'Sea urchins', emoji: '🌰', parentCategory: 'echinoderms' },
  { id: 'seabird', label_es: 'Aves marinas', label_en: 'Seabirds', emoji: '🐦', parentCategory: 'fish_and_vertebrates' },
  { id: 'marine_mammal', label_es: 'Mamíferos marinos', label_en: 'Marine mammals', emoji: '🐋', parentCategory: 'fish_and_vertebrates' },
  { id: 'penguin', label_es: 'Pingüinos', label_en: 'Penguins', emoji: '🐧', parentCategory: 'fish_and_vertebrates' },
]

export const tagMap = new Map(tags.map((t) => [t.id, t]))
