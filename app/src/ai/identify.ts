import { preprocessForVision } from './preprocess'
import { species } from '../data/species'
import type { InatSuggestion, IdentifyResult } from './types'

const INAT_API = 'https://api.inaturalist.org/v1'
const INAT_TOKEN = 'eyJhbGciOiJIUzUxMiJ9.eyJ1c2VyX2lkIjoxMDIxNjgwNCwiZXhwIjoxNzc0MTk5MjExfQ.w47oHl-B6I_8seSUzuRO-QH-rQR0Y2onCjrsTcG6uhPocTt0zJAAwXA6dX1X799SHl8u_BLBluNTdhy53tj9jg'

// Build lookup maps for matching iNat results to our catalog
const catalogByScientificName = new Map(
  species.map(s => [s.scientific_name.toLowerCase(), s])
)
const catalogByGenus = new Map<string, typeof species[0][]>()
for (const s of species) {
  const genus = s.genus?.toLowerCase()
  if (genus) {
    const list = catalogByGenus.get(genus) ?? []
    list.push(s)
    catalogByGenus.set(genus, list)
  }
}

/** Send image to iNaturalist CV API and match results to our catalog */
export async function identifySpecies(file: File): Promise<IdentifyResult> {
  const start = performance.now()

  // Preprocess: resize to 299x299
  const imageBlob = await preprocessForVision(file)

  // Build FormData
  const formData = new FormData()
  formData.append('image', imageBlob, 'photo.jpg')
  // Chilean central coast coordinates for regional accuracy
  formData.append('lat', '-33.0')
  formData.append('lng', '-71.6')

  // Call iNat CV API
  const response = await fetch(`${INAT_API}/computervision/score_image`, {
    method: 'POST',
    headers: {
      'Authorization': INAT_TOKEN,
    },
    body: formData,
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`iNat API error ${response.status}: ${text}`)
  }

  const data = await response.json()
  const results = data.results ?? []

  // Find the max score for normalization
  const maxScore = Math.max(...results.map((r: any) => r.combined_score ?? r.vision_score ?? 0), 1)

  // Map iNat results to our format
  const allSuggestions: InatSuggestion[] = results
    .slice(0, 20) // Get more results for better catalog matching
    .map((result: any) => {
      const taxon = result.taxon ?? {}
      const scientificName = (taxon.name ?? '').toLowerCase()
      const rawScore = result.combined_score ?? result.vision_score ?? 0

      // Normalize score to 0-100 relative to the best result
      const score = Math.round((rawScore / maxScore) * 100)

      // Try exact match by scientific name
      let catalogMatch = catalogByScientificName.get(scientificName)

      // Try genus match if no exact match
      if (!catalogMatch && taxon.rank === 'species') {
        const genus = scientificName.split(' ')[0]
        const genusMatches = catalogByGenus.get(genus)
        if (genusMatches && genusMatches.length === 1) {
          catalogMatch = genusMatches[0]
        }
      }

      return {
        taxon_id: taxon.id ?? 0,
        scientific_name: taxon.name ?? 'Unknown',
        common_name: taxon.preferred_common_name ?? taxon.english_common_name ?? null,
        photo_url: taxon.default_photo?.medium_url ?? null,
        score,
        in_catalog: !!catalogMatch,
        catalog_species_id: catalogMatch?.id ?? null,
      }
    })
    .filter((s: InatSuggestion) => s.score > 5) // Filter out very low scores

  // Sort: catalog species first (boosted), then by score
  const suggestions = allSuggestions.sort((a, b) => {
    // Catalog species get a massive boost
    const aBoost = a.in_catalog ? 1000 : 0
    const bBoost = b.in_catalog ? 1000 : 0
    return (bBoost + b.score) - (aBoost + a.score)
  })

  return {
    suggestions: suggestions.slice(0, 10),
    processing_time_ms: Math.round(performance.now() - start),
  }
}
