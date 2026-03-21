import { useState, useRef } from 'preact/hooks'
import { t, locale } from '../hooks/useLocale'
import { identifySpecies } from '../ai/identify'
import { blobToDataUrl } from '../ai/preprocess'
import { speciesById } from '../data/species'
import { categoryMap } from '../data/categories'
import type { InatSuggestion, IdentifyResult } from '../ai/types'
import { MarkAsSeen } from '../components/MarkAsSeen'

type State = 'idle' | 'loading' | 'results' | 'error'

export function Identify() {
  const [state, setState] = useState<State>('idle')
  const [preview, setPreview] = useState<string | null>(null)
  const [result, setResult] = useState<IdentifyResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedSpeciesId, setSelectedSpeciesId] = useState<number | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    setState('loading')
    setError(null)
    setSelectedSpeciesId(null)

    // Show preview
    const url = await blobToDataUrl(file)
    setPreview(url)

    try {
      const result = await identifySpecies(file)
      setResult(result)
      setState('results')
    } catch (e: any) {
      console.error('Identify error:', e)
      setError(e.message ?? t('identify.error'))
      setState('error')
    }
  }

  function handleFileInput() {
    const file = fileRef.current?.files?.[0]
    if (file) handleFile(file)
    if (fileRef.current) fileRef.current.value = ''
  }

  function reset() {
    setState('idle')
    setPreview(null)
    setResult(null)
    setError(null)
    setSelectedSpeciesId(null)
  }

  return (
    <div class="px-4 py-4 pb-6">
      <h2 class="text-xl font-bold text-ocean-800 mb-1">{t('identify.title')}</h2>
      <p class="text-sm text-ocean-500 mb-4">{t('identify.subtitle')}</p>

      {/* Idle: show capture buttons */}
      {state === 'idle' && (
        <div class="space-y-3">
          <label class="block bg-ocean-700 text-white rounded-2xl p-6 text-center cursor-pointer hover:bg-ocean-600 transition-colors">
            <span class="text-4xl block mb-2">📸</span>
            <span class="text-sm font-semibold">{t('identify.take_photo')}</span>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              class="hidden"
              onChange={(e) => {
                const file = (e.target as HTMLInputElement).files?.[0]
                if (file) handleFile(file)
              }}
            />
          </label>
          <label class="block bg-white border-2 border-dashed border-ocean-300 rounded-2xl p-6 text-center cursor-pointer hover:bg-ocean-50 transition-colors">
            <span class="text-4xl block mb-2">🖼️</span>
            <span class="text-sm font-semibold text-ocean-600">{t('identify.upload')}</span>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              class="hidden"
              onChange={handleFileInput}
            />
          </label>
        </div>
      )}

      {/* Loading */}
      {state === 'loading' && (
        <div class="text-center py-8">
          {preview && (
            <img src={preview} alt="" class="w-48 h-48 object-cover rounded-2xl mx-auto mb-4" />
          )}
          <div class="text-3xl animate-pulse mb-2">🔬</div>
          <p class="text-ocean-500 text-sm">{t('identify.analyzing')}</p>
        </div>
      )}

      {/* Error */}
      {state === 'error' && (
        <div class="text-center py-8">
          {preview && (
            <img src={preview} alt="" class="w-48 h-48 object-cover rounded-2xl mx-auto mb-4" />
          )}
          <div class="text-3xl mb-2">❌</div>
          <p class="text-red-500 text-sm mb-4">{error}</p>
          <button
            onClick={reset}
            class="bg-ocean-700 text-white px-6 py-2 rounded-xl text-sm font-medium"
          >
            {t('identify.try_again')}
          </button>
        </div>
      )}

      {/* Results */}
      {state === 'results' && result && (
        <div>
          {/* Preview image */}
          {preview && (
            <img src={preview} alt="" class="w-full aspect-[4/3] object-cover rounded-2xl mb-4" />
          )}

          <div class="flex justify-between items-center mb-3">
            <h3 class="text-sm font-semibold text-ocean-700">
              {t('identify.results')} ({result.suggestions.length})
            </h3>
            <button
              onClick={reset}
              class="text-xs text-ocean-400 hover:text-ocean-600"
            >
              {t('identify.try_again')}
            </button>
          </div>

          {result.suggestions.length === 0 ? (
            <div class="text-center py-8">
              <div class="text-3xl mb-2">🤷</div>
              <p class="text-ocean-500 text-sm">{t('identify.no_results')}</p>
            </div>
          ) : (
            <div class="space-y-2">
              {result.suggestions.map((suggestion) => (
                <SuggestionCard
                  key={suggestion.taxon_id}
                  suggestion={suggestion}
                  isSelected={selectedSpeciesId === suggestion.catalog_species_id}
                  onSelect={() => setSelectedSpeciesId(suggestion.catalog_species_id)}
                />
              ))}
            </div>
          )}

          {/* Mark as seen for selected species */}
          {selectedSpeciesId && (
            <div class="mt-4 bg-ocean-50 rounded-2xl p-4">
              <p class="text-xs font-semibold text-ocean-600 mb-2">{t('identify.add_sighting')}</p>
              <MarkAsSeen speciesId={selectedSpeciesId} />
            </div>
          )}

          <p class="text-[10px] text-ocean-300 text-center mt-4">
            Powered by iNaturalist · {result.processing_time_ms}ms
          </p>
        </div>
      )}
    </div>
  )
}

function SuggestionCard({
  suggestion,
  isSelected,
  onSelect,
}: {
  suggestion: InatSuggestion
  isSelected: boolean
  onSelect: () => void
}) {
  const catalogSpecies = suggestion.catalog_species_id
    ? speciesById.get(suggestion.catalog_species_id)
    : null
  const cat = catalogSpecies ? categoryMap.get(catalogSpecies.category) : null

  const displayName = catalogSpecies
    ? (locale.value === 'es'
        ? catalogSpecies.common_name_es ?? catalogSpecies.common_name_en
        : catalogSpecies.common_name_en ?? catalogSpecies.common_name_es)
      ?? suggestion.scientific_name
    : suggestion.common_name ?? suggestion.scientific_name

  const photoUrl = catalogSpecies?.primary_photo?.url_medium ?? suggestion.photo_url

  return (
    <button
      onClick={suggestion.in_catalog ? onSelect : undefined}
      class={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
        isSelected
          ? 'bg-ocean-100 border-2 border-ocean-500'
          : suggestion.in_catalog
            ? 'bg-white border border-ocean-100 hover:bg-ocean-50 shadow-sm'
            : 'bg-white/50 border border-ocean-100 opacity-60'
      }`}
    >
      {/* Photo */}
      {photoUrl ? (
        <img src={photoUrl} alt="" class="w-14 h-14 rounded-lg object-cover shrink-0" />
      ) : (
        <div class="w-14 h-14 rounded-lg bg-ocean-100 flex items-center justify-center text-xl shrink-0">
          {cat?.emoji ?? '🌊'}
        </div>
      )}

      {/* Info */}
      <div class="flex-1 min-w-0">
        <p class="text-sm font-semibold truncate text-ocean-800">{displayName}</p>
        <p class="text-[10px] italic text-ocean-500 truncate">{suggestion.scientific_name}</p>
        {!suggestion.in_catalog && (
          <p class="text-[10px] text-ocean-400 mt-0.5">{t('identify.not_in_catalog')}</p>
        )}
      </div>

      {/* Confidence */}
      <div class="shrink-0 text-right">
        <div class="text-sm font-bold text-ocean-700">{suggestion.score}%</div>
        <div class="w-12 bg-ocean-100 rounded-full h-1.5 mt-1">
          <div
            class={`h-1.5 rounded-full ${
              suggestion.score >= 70 ? 'bg-green-500'
              : suggestion.score >= 40 ? 'bg-yellow-500'
              : 'bg-red-400'
            }`}
            style={{ width: `${Math.min(100, suggestion.score)}%` }}
          />
        </div>
      </div>
    </button>
  )
}
