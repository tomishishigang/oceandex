import { useLocation } from 'preact-iso'
import { t } from '../hooks/useLocale'
import { href, stripBase } from '../base'

export function BottomNav() {
  const { path: rawPath } = useLocation()
  const path = stripBase(rawPath)

  const tabs = [
    { route: '/', label: () => t('nav.species'), icon: '🐠', match: (p: string) => p === '/' || p.startsWith('/species') },
    { route: '/log', label: () => t('nav.log'), icon: '🤿', match: (p: string) => p.startsWith('/log') },
    { route: '/sites', label: () => t('nav.sites'), icon: '📍', match: (p: string) => p.startsWith('/sites') },
  ]

  return (
    <nav class="bg-white border-t border-ocean-200 px-4 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] flex justify-around sticky bottom-0 z-50">
      {tabs.map((tab) => (
        <a
          key={tab.route}
          href={href(tab.route)}
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
