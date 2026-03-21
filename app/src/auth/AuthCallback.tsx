import { useEffect, useState } from 'preact/hooks'
import { useLocation } from 'preact-iso'
import { href } from '../base'
import { getSupabase } from './supabase'
import { authState } from './useAuth'

/**
 * Handles the OAuth callback redirect from Supabase.
 * Logs debug info to help troubleshoot auth issues.
 */
export function AuthCallback() {
  const { route } = useLocation()
  const [debug, setDebug] = useState('Processing callback...')

  useEffect(() => {
    const supabase = getSupabase()

    const url = window.location.href
    const params = new URLSearchParams(window.location.search)
    const hash = window.location.hash
    const code = params.get('code')

    console.log('[AuthCallback] URL:', url)
    console.log('[AuthCallback] Code:', code)
    console.log('[AuthCallback] Hash:', hash)

    setDebug(`URL: ${url.substring(0, 80)}...\nCode: ${code ? 'yes' : 'no'}\nHash: ${hash ? 'yes' : 'no'}`)

    async function handleCallback() {
      try {
        if (code) {
          console.log('[AuthCallback] Exchanging code for session...')
          setDebug(prev => prev + '\nExchanging code...')
          const { data, error } = await supabase.auth.exchangeCodeForSession(code)
          if (error) {
            console.error('[AuthCallback] Code exchange error:', error)
            setDebug(prev => prev + `\nError: ${error.message}`)
            return
          }
          console.log('[AuthCallback] Code exchange success, user:', data.user?.email)
          setDebug(prev => prev + `\nUser: ${data.user?.email}`)
        }

        // Try getting session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        console.log('[AuthCallback] Session:', session ? `${session.user.email}` : 'null')
        console.log('[AuthCallback] Session error:', sessionError)

        if (session) {
          authState.value = {
            user: session.user,
            session,
            loading: false,
            initialized: true,
          }
          setDebug(prev => prev + `\nSession OK! Redirecting...`)
          setTimeout(() => route(href('/')), 500)
        } else {
          setDebug(prev => prev + `\nNo session found. Check Supabase config.`)
          // Try waiting a bit longer
          setTimeout(async () => {
            const { data: { session: retrySession } } = await supabase.auth.getSession()
            if (retrySession) {
              authState.value = {
                user: retrySession.user,
                session: retrySession,
                loading: false,
                initialized: true,
              }
              route(href('/'))
            } else {
              setDebug(prev => prev + '\nRetry failed. Redirecting to login.')
              setTimeout(() => route(href('/login')), 3000)
            }
          }, 2000)
        }
      } catch (e: any) {
        console.error('[AuthCallback] Unexpected error:', e)
        setDebug(prev => prev + `\nCrash: ${e.message}`)
      }
    }

    handleCallback()
  }, [])

  return (
    <div class="flex items-center justify-center min-h-[60vh]">
      <div class="text-center">
        <div class="text-4xl mb-3 animate-pulse">🌊</div>
        <p class="text-ocean-500 text-sm">Iniciando sesión...</p>
        <pre class="text-[10px] text-ocean-300 mt-4 text-left max-w-xs mx-auto whitespace-pre-wrap">{debug}</pre>
      </div>
    </div>
  )
}
