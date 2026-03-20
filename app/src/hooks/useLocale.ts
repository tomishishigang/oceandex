import { signal, effect } from '@preact/signals'
import type { Locale } from '../i18n/strings'
import strings from '../i18n/strings'

const STORAGE_KEY = 'oceandex-locale'

function getInitialLocale(): Locale {
  if (typeof window === 'undefined') return 'es'
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved === 'en' || saved === 'es') return saved
  return 'es'
}

export const locale = signal<Locale>(getInitialLocale())

effect(() => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, locale.value)
    document.documentElement.lang = locale.value
  }
})

export function toggleLocale() {
  locale.value = locale.value === 'es' ? 'en' : 'es'
}

export function t(key: string): string {
  const entry = strings[key]
  if (!entry) return key
  return entry[locale.value] ?? entry['es'] ?? key
}
