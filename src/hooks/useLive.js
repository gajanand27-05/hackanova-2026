import { useEffect, useState } from 'react'
import { content } from '../content.js'
import { START, END } from '../lib/time.js'

// Realtime only around event day (26 Nov IST); otherwise one fetch on load.
const EVENT_DAY_FROM = START - 2 * 3600_000, EVENT_DAY_TO = END + 4 * 3600_000
const initial = { settings: null, announcements: [], winners: [] }

export function useLive(now) {
  const [data, setData] = useState(initial)
  const eventDay = now >= EVENT_DAY_FROM && now <= EVENT_DAY_TO
  useEffect(() => {
    let live, cancelled = false
    const idle = window.requestIdleCallback ?? (cb => setTimeout(cb, 300))
    idle(async () => {
      try {
        const [{ createLive }, { getClient }] = await Promise.all([import('../lib/live.js'), import('../lib/supabase.js')])
        if (cancelled) return
        live = createLive({ getClient, onData: setData, realtime: eventDay })
        live.start()
      } catch { /* chunk failed to load: content.js defaults stay */ }
    })
    return () => { cancelled = true; live?.stop() }
  }, [eventDay])
  return data
}

// Same result as mergeSettings in live.js; inlined so first paint doesn't need the live chunk.
export function useSettings(row) {
  return {
    unstopUrl: row?.unstop_url || content.unstopUrl,
    registeredCount: row?.registered_count ?? content.registeredCount,
    registrationsClosed: row?.registrations_closed ?? content.registrationsClosed,
    schedule: content.schedule.map(e => (e.fixed ? e : { ...e, ...(row?.schedule?.[e.id] ?? {}) })),
  }
}
