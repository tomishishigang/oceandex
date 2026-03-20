export interface Photo {
  url_medium: string | null
  url_square: string | null
  attribution: string
  license: string | null
}

export type Category =
  | 'fish_and_vertebrates'
  | 'mollusks'
  | 'crustaceans'
  | 'echinoderms'
  | 'algae'
  | 'cnidarians'
  | 'worms'
  | 'sponges'

export type SightabilityTier = 'common' | 'uncommon' | 'rare' | 'unlikely'

export interface Species {
  id: number
  scientific_name: string
  common_name_en: string | null
  common_name_es: string | null
  kingdom: string | null
  phylum: string | null
  class: string | null
  order: string | null
  family: string | null
  genus: string | null
  species: string | null
  category: Category
  observation_count: number
  inat_observations: number
  primary_photo: Photo | null
  additional_photos: Photo[]
  wikipedia_url: string | null
  worms_authority: string | null
  sightability_score: number
  sightability_tier: SightabilityTier
}

export interface DiveSite {
  name: string
  zone: string
  region: string
  lat: number
  lng: number
  max_depth_m: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  type: string[]
  source: string
}

export interface DatasetMetadata {
  name: string
  version: string
  build_date: string
  region: string
  total_species: number
  with_photos: number
  with_common_name_en: number
  with_common_name_es: number
  [key: string]: unknown
}
