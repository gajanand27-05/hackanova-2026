import { START, FREEZE, END, phaseAt, countdownAt, formatTimeIST, createClock, PROD_HOST } from './time.js'

const at = iso => Date.parse(iso)

test('phase boundaries at 8:00, 18:00, 20:00 IST', () => {
  expect(phaseAt(at('2026-11-26T07:59:59+05:30'))).toBe('pre')
  expect(phaseAt(at('2026-11-26T08:00:00+05:30'))).toBe('live')
  expect(phaseAt(at('2026-11-26T17:59:59+05:30'))).toBe('live')
  expect(phaseAt(at('2026-11-26T18:00:00+05:30'))).toBe('judging')
  expect(phaseAt(at('2026-11-26T19:59:59+05:30'))).toBe('judging')
  expect(phaseAt(at('2026-11-26T20:00:00+05:30'))).toBe('ended')
})

test('instants are absolute (independent of device TZ)', () => {
  expect(START).toBe(Date.UTC(2026, 10, 26, 2, 30))
  expect(FREEZE).toBe(Date.UTC(2026, 10, 26, 12, 30))
  expect(END).toBe(Date.UTC(2026, 10, 26, 14, 30))
})

test('countdown to kickoff, freeze and results', () => {
  expect(countdownAt(START - (2 * 86400 + 3 * 3600 + 4 * 60 + 5) * 1000))
    .toEqual({ phase: 'pre', label: 'Kickoff in', d: 2, h: 3, m: 4, s: 5 })
  expect(countdownAt(FREEZE - 1000)).toMatchObject({ phase: 'live', label: 'Code freeze in', d: 0, h: 0, m: 0, s: 1 })
  expect(countdownAt(END - 60_000)).toMatchObject({ phase: 'judging', label: 'Results in', m: 1, s: 0 })
  expect(countdownAt(END)).toMatchObject({ phase: 'ended', d: 0, h: 0, m: 0, s: 0 })
})

test('formats times in IST regardless of device timezone', () => {
  expect(formatTimeIST(START)).toBe('8:00 AM')
  expect(formatTimeIST(FREEZE)).toBe('6:00 PM')
})

test('fake time is honoured off the production host and ignored on it', () => {
  let real = 1_000
  const realNow = () => real
  const rehearsal = createClock({ fakeNowISO: '2026-11-26T17:59:30+05:30', hostname: 'rehearsal.hackanova2026.pages.dev', realNow })
  expect(rehearsal.isFake).toBe(true)
  real += 5_000
  expect(rehearsal.now()).toBe(at('2026-11-26T17:59:35+05:30'))
  const prod = createClock({ fakeNowISO: '2026-11-26T17:59:30+05:30', hostname: PROD_HOST, realNow })
  expect(prod.isFake).toBe(false)
  expect(prod.now()).toBe(real)
})

test('sync corrects device clock skew from the HTTP Date header', async () => {
  const device = Date.parse('2026-11-26T08:00:00Z')
  const clock = createClock({ hostname: PROD_HOST, realNow: () => device })
  const fetchImpl = async () => ({ headers: new Headers({ date: new Date(device + 120_000).toUTCString() }) })
  await clock.sync(fetchImpl)
  expect(Math.abs(clock.now() - (device + 120_000))).toBeLessThanOrEqual(1000)
})

test('sync keeps the device clock when the request fails', async () => {
  const clock = createClock({ hostname: PROD_HOST, realNow: () => 42 })
  await clock.sync(async () => { throw new Error('offline') })
  expect(clock.now()).toBe(42)
})
