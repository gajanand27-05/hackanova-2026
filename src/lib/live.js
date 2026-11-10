export function mergeSettings(defaults, row) {
  return {
    unstopUrl: row?.unstop_url || defaults.unstopUrl,
    registeredCount: row?.registered_count ?? defaults.registeredCount,
    registrationsClosed: row?.registrations_closed ?? defaults.registrationsClosed,
    schedule: defaults.schedule.map(e => (e.fixed ? e : { ...e, ...(row?.schedule?.[e.id] ?? {}) })),
  }
}

const TABLES = ['announcements', 'site_settings', 'winners']
const DOWN = ['CHANNEL_ERROR', 'TIMED_OUT', 'CLOSED']

// Realtime on event day, with a 30 s polling fallback when the channel errors, closes,
// or never subscribes (e.g. the free plan's concurrent-connection limit is hit).
export function createLive({ getClient, onData, realtime, pollMs = 30_000, subscribeTimeoutMs = 10_000, timers = globalThis }) {
  let client = null, channel = null, pollId = null, timeoutId = null, stopped = false
  const state = { settings: null, announcements: [], winners: [] }

  async function fetchAll() {
    const [s, a, w] = await Promise.all([
      client.from('site_settings').select('*').eq('id', 1).maybeSingle(),
      client.from('announcements').select('*').order('created_at', { ascending: false }).limit(20),
      client.from('winners').select('*').order('place'),
    ])
    if (!s.error) state.settings = s.data
    if (!a.error) state.announcements = a.data ?? []
    if (!w.error) state.winners = w.data ?? []
    if (!stopped) onData({ ...state })
  }
  const refresh = () => fetchAll().catch(() => {})
  function startPolling() {
    if (pollId || stopped) return
    timers.clearTimeout(timeoutId)
    pollId = timers.setInterval(refresh, pollMs)
  }

  return {
    async start() {
      try { client = await getClient() } catch { return }
      await refresh()
      if (!realtime || stopped) return
      timeoutId = timers.setTimeout(startPolling, subscribeTimeoutMs)
      channel = client.channel('live')
      for (const table of TABLES) channel.on('postgres_changes', { event: '*', schema: 'public', table }, refresh)
      channel.subscribe(status => {
        if (status === 'SUBSCRIBED') timers.clearTimeout(timeoutId)
        else if (DOWN.includes(status)) startPolling()
      })
    },
    stop() {
      stopped = true
      timers.clearTimeout(timeoutId); timers.clearInterval(pollId)
      if (channel && client) client.removeChannel(channel)
    },
  }
}
