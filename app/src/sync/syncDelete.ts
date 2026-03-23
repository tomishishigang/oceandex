import { getSupabase, hasSupabaseConfig } from '../auth/supabase'
import { isLoggedIn } from '../auth/useAuth'

/** Delete a session and its sightings from Supabase cloud */
export async function deleteSessionFromCloud(
  sessionId: string,
  sightingIds: string[],
): Promise<void> {
  if (!isLoggedIn() || !navigator.onLine || !hasSupabaseConfig()) return

  const supabase = getSupabase()

  // Delete sightings first (foreign key)
  if (sightingIds.length > 0) {
    const { error: sErr } = await supabase
      .from('sightings')
      .delete()
      .in('id', sightingIds)

    if (sErr) console.warn('Cloud sighting delete error:', sErr.message)
  }

  // Delete the session
  const { error } = await supabase
    .from('dive_sessions')
    .delete()
    .eq('id', sessionId)

  if (error) console.warn('Cloud session delete error:', error.message)
}
