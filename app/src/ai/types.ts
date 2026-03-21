export interface InatSuggestion {
  taxon_id: number
  scientific_name: string
  common_name: string | null
  photo_url: string | null
  score: number           // 0-100 confidence
  in_catalog: boolean     // matched to our species catalog
  catalog_species_id: number | null  // our species ID if matched
}

export interface IdentifyResult {
  suggestions: InatSuggestion[]
  processing_time_ms: number
}
