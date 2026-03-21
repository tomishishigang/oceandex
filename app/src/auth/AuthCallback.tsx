import { useEffect } from 'preact/hooks'
import { useLocation } from 'preact-iso'
import { href } from '../base'
import { getSupabase } from './supabase'
import { authState } from './useAuth'

/**
 * Handles the OAuth callback redirect from Supabase.
 * Waits for the session to be established before redirecting.
 */
export function AuthCallback() {
  const { route } = useLocation()

  useEffect(() => {
    const supabase = getSupabase()

    // Supabase SDK reads the hash fragment automatically when initialized.
    // We need to explicitly exchange the code if using PKCE flow (code in URL params).
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')

    async function handleCallback() {
      if (code) {
        // PKCE flow: exchange code for session
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) {
          console.error('Auth callback error:', error)
        }
      }

      // Wait for auth state to update
      const checkSession = () => {
        if (authState.value.user) {
          route(href('/'))
        } else {
          // Also check via getSession in case the signal hasn't fired yet
          supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
              authState.value = {
                user: session.user,
                session,
                loading: false,
                initialized: true,
              }
              route(href('/'))
            } else {
              // No session after callback — something went wrong
              setTimeout(() => route(href('/login')), 2000)
            }
          })
        }
      }

      // Give it a moment for the hash fragment to be processed
      setTimeout(checkSession, 500)
    }

    handleCallback()
  }, [])

  return (
    <div class="flex items-center justify-center min-h-[60vh]">
      <div class="text-center">
        <div class="text-4xl mb-3 animate-pulse">🌊</div>
        <p class="text-ocean-500 text-sm">Iniciando sesión...</p>
      </div>
    </div>
  )
}
