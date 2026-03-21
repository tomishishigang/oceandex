import { useEffect } from 'preact/hooks'
import { useLocation } from 'preact-iso'
import { href } from '../base'

/**
 * Handles the OAuth callback redirect from Supabase.
 * Supabase JS SDK auto-detects the hash fragment and completes the auth flow.
 * We just redirect to the home page after a short delay.
 */
export function AuthCallback() {
  const { route } = useLocation()

  useEffect(() => {
    // Supabase client auto-processes the URL hash/params
    // Give it a moment to complete, then redirect
    const timer = setTimeout(() => {
      route(href('/'))
    }, 1000)
    return () => clearTimeout(timer)
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
