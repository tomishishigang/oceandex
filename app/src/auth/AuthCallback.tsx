import { useEffect } from 'preact/hooks'
import { useLocation } from 'preact-iso'
import { href } from '../base'

/** Legacy callback route — redirects to home. Auth is now handled via Google Identity Services (no redirect). */
export function AuthCallback() {
  const { route } = useLocation()
  useEffect(() => { route(href('/')) }, [])
  return null
}
