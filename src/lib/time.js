import { EVENT } from '../content.js'

export const START = Date.parse(EVENT.startISO)
export const FREEZE = Date.parse(EVENT.freezeISO)
export const END = Date.parse(EVENT.endISO)
export const PROD_HOST = 'hackanova2026.pages.dev'

export function phaseAt(ms) {
  if (ms < START) return 'pre'
  if (ms < FREEZE) return 'live'
  if (ms < END) return 'judging'
  return 'ended'
}

const TARGET = { pre: START, live: FREEZE, judging: END }
const LABEL = { pre: 'Kickoff in', live: 'Code freeze in', judging: 'Results in' }

export function countdownAt(ms) {
  const phase = phaseAt(ms)
  if (phase === 'ended') return { phase, label: 'That’s a wrap', d: 0, h: 0, m: 0, s: 0 }
  let left = Math.max(0, Math.floor((TARGET[phase] - ms) / 1000))
  const d = Math.floor(left / 86400); left -= d * 86400
  const h = Math.floor(left / 3600); left -= h * 3600
  const m = Math.floor(left / 60)
  return { phase, label: LABEL[phase], d, h, m, s: left - m * 60 }
}

const IST = new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', hour: 'numeric', minute: '2-digit', hour12: true })
export function formatTimeIST(ms) {
  return IST.format(ms).replace(/\s+/g, ' ').toUpperCase()
}

// Clock with device-skew correction (HTTP Date header, same origin) and a build-time-only fake time for rehearsals.
export function createClock({ fakeNowISO, hostname = '', realNow = () => Date.now() } = {}) {
  const fakeBase = fakeNowISO && hostname !== PROD_HOST ? Date.parse(fakeNowISO) : NaN
  const isFake = !Number.isNaN(fakeBase)
  const loadedAt = realNow()
  let offset = 0
  return {
    isFake,
    now: () => (isFake ? fakeBase + (realNow() - loadedAt) : realNow() + offset),
    async sync(fetchImpl = fetch, url = '/') {
      if (isFake) return 0
      try {
        const t0 = realNow()
        const res = await fetchImpl(url, { method: 'HEAD', cache: 'no-store' })
        const t1 = realNow()
        const server = Date.parse(res.headers.get('date'))
        if (!Number.isNaN(server)) {
          const o = server + 500 - (t0 + t1) / 2 // Date header has 1 s resolution
          offset = Math.abs(o) < 1500 ? 0 : o
        }
      } catch { /* keep the device clock */ }
      return offset
    },
  }
}

export const clock = createClock({
  fakeNowISO: import.meta.env.VITE_FAKE_NOW,
  hostname: typeof location === 'undefined' ? '' : location.hostname,
})
