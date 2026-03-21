import type { Category } from './types'

export interface BadgeCondition {
  type: 'dive_count' | 'species_count' | 'category_count' | 'site_count' | 'all_sites_in_zone' | 'has_order'
  threshold?: number
  category?: Category
  order?: string
  zone?: string
}

export interface Badge {
  id: string
  icon: string
  condition: BadgeCondition
}

export const BADGES: Badge[] = [
  // Dive milestones
  { id: 'primera-inmersion', icon: '🐣', condition: { type: 'dive_count', threshold: 1 } },
  { id: 'cinco-inmersiones', icon: '🤿', condition: { type: 'dive_count', threshold: 5 } },
  { id: 'diez-inmersiones', icon: '🏅', condition: { type: 'dive_count', threshold: 10 } },

  // Species count milestones
  { id: 'diez-especies', icon: '🔟', condition: { type: 'species_count', threshold: 10 } },
  { id: 'veinticinco-especies', icon: '🔍', condition: { type: 'species_count', threshold: 25 } },
  { id: 'cincuenta-especies', icon: '🥇', condition: { type: 'species_count', threshold: 50 } },
  { id: 'cien-especies', icon: '💯', condition: { type: 'species_count', threshold: 100 } },
  { id: 'oceandex-completo', icon: '🏆', condition: { type: 'species_count', threshold: 327 } },

  // Specific encounters
  { id: 'encuentro-tiburon', icon: '🦈', condition: { type: 'has_order', order: 'Carcharhiniformes' } },
  { id: 'cazador-nudibranquios', icon: '🐙', condition: { type: 'category_count', category: 'mollusks', threshold: 3 } },
  { id: 'rey-invertebrados', icon: '🦀', condition: { type: 'category_count', category: 'crustaceans', threshold: 10 } },
  { id: 'estrellero', icon: '⭐', condition: { type: 'category_count', category: 'echinoderms', threshold: 5 } },

  // Site exploration
  { id: 'explorador-novato', icon: '📍', condition: { type: 'site_count', threshold: 3 } },
  { id: 'gran-explorador', icon: '🗺️', condition: { type: 'site_count', threshold: 10 } },
  { id: 'explorador-quintay', icon: '👑', condition: { type: 'all_sites_in_zone', zone: 'Quintay' } },
]
