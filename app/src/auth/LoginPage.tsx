import { useEffect, useRef, useState } from 'preact/hooks'
import { useLocation } from 'preact-iso'
import { t } from '../hooks/useLocale'
import { href } from '../base'
import { signInWithGoogleToken } from './useAuth'

const GOOGLE_CLIENT_ID = '109939962105-vjsetdd4l5cm72gcqgm6ash8mk6je73f.apps.googleusercontent.com'

export function LoginPage() {
  const { route } = useLocation()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const buttonRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Load Google Identity Services script
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.onload = () => {
      if (!window.google || !buttonRef.current) return

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
        auto_select: false,
      })

      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: 'outline',
        size: 'large',
        width: 320,
        text: 'signin_with',
        shape: 'pill',
        locale: 'es',
      })
    }
    document.head.appendChild(script)

    return () => {
      script.remove()
    }
  }, [])

  async function handleGoogleResponse(response: { credential: string }) {
    setLoading(true)
    setError(null)
    try {
      await signInWithGoogleToken(response.credential)
      route(href('/'))
    } catch (e: any) {
      console.error('[Login] Error:', e)
      setError(e.message ?? 'Error al iniciar sesión')
      setLoading(false)
    }
  }

  // Make callback available globally for Google's script
  useEffect(() => {
    (window as any).__handleGoogleResponse = handleGoogleResponse
  }, [])

  return (
    <div class="px-4 py-8">
      <div class="max-w-sm mx-auto text-center">
        <div class="text-6xl mb-4">🌊</div>
        <h2 class="text-2xl font-bold text-ocean-800 mb-2">{t('auth.login_title')}</h2>
        <p class="text-sm text-ocean-500 mb-8">{t('auth.login_subtitle')}</p>

        {loading ? (
          <div class="py-4">
            <div class="text-2xl animate-pulse">🌊</div>
            <p class="text-sm text-ocean-400 mt-2">{t('auth.logging_in')}</p>
          </div>
        ) : (
          <div class="flex justify-center">
            <div ref={buttonRef} />
          </div>
        )}

        {error && (
          <p class="text-red-500 text-xs mt-4">{error}</p>
        )}

        <a
          href={href('/')}
          class="block text-sm text-ocean-400 mt-8 no-underline hover:text-ocean-600"
        >
          {t('auth.skip')}
        </a>

        <p class="text-[10px] text-ocean-300 mt-4">
          {t('auth.privacy_note')}
        </p>
      </div>
    </div>
  )
}

// Type declaration for Google Identity Services
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void
          renderButton: (el: HTMLElement, config: any) => void
          prompt: () => void
        }
      }
    }
  }
}
