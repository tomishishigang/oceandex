import { signal } from '@preact/signals'
import { getSupabase, hasSupabaseConfig } from './supabase'
import type { User, Session } from '@supabase/supabase-js'
import { onFirstLogin, fullSync } from '../sync/syncEngine'

export interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  initialized: boolean
}

export const authState = signal<AuthState>({
  user: null,
  session: null,
  loading: true,
  initialized: false,
})

export const isLoggedIn = () => authState.value.user !== null
export const currentUser = () => authState.value.user
export const currentUserId = () => authState.value.user?.id ?? null

/** Initialize auth listener — call once on app start */
export function initAuth() {
  if (!hasSupabaseConfig()) {
    authState.value = { user: null, session: null, loading: false, initialized: true }
    return
  }

  const supabase = getSupabase()

  // Get initial session
  supabase.auth.getSession().then(({ data: { session } }) => {
    authState.value = {
      user: session?.user ?? null,
      session,
      loading: false,
      initialized: true,
    }
  })

  // Listen for auth changes
  supabase.auth.onAuthStateChange((_event, session) => {
    const wasLoggedOut = !authState.value.user
    authState.value = {
      user: session?.user ?? null,
      session,
      loading: false,
      initialized: true,
    }

    // Trigger sync on login
    if (session?.user && wasLoggedOut) {
      onFirstLogin()
    } else if (session?.user) {
      fullSync()
    }
  })
}

/** Sign in with Google ID token (no redirect needed) */
export async function signInWithGoogleToken(idToken: string, nonce?: string) {
  const supabase = getSupabase()

  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: 'google',
    token: idToken,
    nonce,
  })

  if (error) {
    console.error('[Auth] signInWithIdToken error:', error)
    throw error
  }

  // console.log('[Auth] Signed in:', data.user?.email)
  return data
}

/** Sign out */
export async function signOut() {
  const supabase = getSupabase()
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error('Sign-out error:', error)
    throw error
  }
}

/** Get user display name */
export function getUserDisplayName(): string {
  const user = authState.value.user
  if (!user) return ''
  return user.user_metadata?.full_name ?? user.email ?? ''
}

/** Get user avatar URL */
export function getUserAvatar(): string | null {
  const user = authState.value.user
  if (!user) return null
  return user.user_metadata?.avatar_url ?? null
}
