import { useState, useEffect } from 'preact/hooks'
import { liveQuery } from 'dexie'

export function useLiveQuery<T>(
  querier: () => T | Promise<T>,
  deps: unknown[],
  defaultValue: T,
): T {
  const [value, setValue] = useState<T>(defaultValue)

  useEffect(() => {
    const observable = liveQuery(querier)
    const subscription = observable.subscribe({
      next: (val) => setValue(val),
      error: (err) => console.error('useLiveQuery error:', err),
    })
    return () => subscription.unsubscribe()
  }, deps)

  return value
}
