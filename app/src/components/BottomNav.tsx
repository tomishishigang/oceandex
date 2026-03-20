import { useLocation } from 'preact-iso'
import { t } from '../hooks/useLocale'

export function BottomNav() {
  const { path } = useLocation()

  const tabs = [
    { href: '/', label: () => t('nav.species'), icon: '🐠', match: (p: string) => p === '/' || p.startsWith('/species') },
    { href: '/log', label: () => t('nav.log'), icon: '🤿', match: (p: string) => p.startsWith('/log') },
    { href: '/sites', label: () => t('nav.sites'), icon: '📍', match: (p: string) => p.startsWith('/sites') },
  ]

  return (
    <nav class="bg-white border-t border-ocean-200 px-4 py-2 flex justify-around sticky bottom-0 z-50">
      {tabs.map((tab) => (
        <a
          key={tab.href}
          href={tab.href}
          class={`flex flex-col items-center gap-0.5 text-xs font-medium no-underline transition-colors ${
            tab.match(path) ? 'text-ocean-700' : 'text-ocean-400'
          }`}
        >
          <span class="text-lg">{tab.icon}</span>
          {tab.label()}
        </a>
      ))}
    </nav>
  )
}
