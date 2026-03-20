import { t } from '../hooks/useLocale'
import { searchQuery } from '../hooks/useFilters'

export function SearchBar() {
  return (
    <div class="relative">
      <span class="absolute left-3 top-1/2 -translate-y-1/2 text-ocean-400 text-sm">🔍</span>
      <input
        type="text"
        value={searchQuery.value}
        onInput={(e) => {
          searchQuery.value = (e.target as HTMLInputElement).value
        }}
        placeholder={t('species.search')}
        class="w-full pl-9 pr-8 py-2.5 rounded-xl bg-white border border-ocean-200 text-sm text-ocean-800 placeholder:text-ocean-300 focus:outline-none focus:ring-2 focus:ring-ocean-400 focus:border-transparent"
      />
      {searchQuery.value && (
        <button
          onClick={() => { searchQuery.value = '' }}
          class="absolute right-3 top-1/2 -translate-y-1/2 text-ocean-400 hover:text-ocean-600 text-sm"
          aria-label="Clear search"
        >
          ✕
        </button>
      )}
    </div>
  )
}
