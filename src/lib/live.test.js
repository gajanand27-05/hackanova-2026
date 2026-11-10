import { vi } from 'vitest'
import { createLive, mergeSettings } from './live.js'
import { useSettings } from '../hooks/useLive.js'
import { content } from '../content.js'

function builder(result) {
  const b = { select: () => b, eq: () => b, order: () => b, limit: () => b, maybeSingle: () => b,
    then: (res, rej) => Promise.resolve(result).then(res, rej) }
  return b
}
function fakeClient({ settings = { id: 1, unstop_url: 'https://unstop.com/x' }, fail = false } = {}) {
  const calls = { from: 0 }; let statusCb = null
  const channel = { on: () => channel, subscribe: cb => { statusCb = cb; return channel } }
  return {
    calls, emit: s => statusCb(s),
    from(table) {
      calls.from++
      if (fail) return builder({ data: null, error: { message: 'down' } })
      const data = table === 'site_settings' ? settings : table === 'announcements' ? [{ id: 1, body: 'hi', level: 'normal' }] : []
      return builder({ data, error: null })
    },
    channel: () => channel, removeChannel: vi.fn(),
  }
}

test('mergeSettings falls back to content.js defaults', () => {
  const m = mergeSettings(content, null)
  expect(m.unstopUrl).toBeNull(); expect(m.registrationsClosed).toBe(false); expect(m.schedule).toEqual(content.schedule)
})

test('mergeSettings applies admin values but never overrides confirmed schedule slots', () => {
  const m = mergeSettings(content, { unstop_url: 'https://unstop.com/x', registered_count: 120, registrations_closed: true,
    schedule: { slot2: { time: '13:00', label: 'Check-in' }, freeze: { time: '17:00' } } })
  expect(m.unstopUrl).toBe('https://unstop.com/x'); expect(m.registeredCount).toBe(120); expect(m.registrationsClosed).toBe(true)
  expect(m.schedule.find(e => e.id === 'slot2')).toMatchObject({ time: '13:00', label: 'Check-in' })
  expect(m.schedule.find(e => e.id === 'freeze').time).toBe('18:00')
})

test('inline useSettings matches mergeSettings', () => {
  const row = { unstop_url: 'https://unstop.com/x', registered_count: 5, registrations_closed: true, schedule: { slot3: { time: '15:00', label: 'Demo prep' } } }
  expect(useSettings(row)).toEqual(mergeSettings(content, row))
  expect(useSettings(null)).toEqual(mergeSettings(content, null))
})

test('initial fetch delivers data; no realtime off event day', async () => {
  const client = fakeClient(), onData = vi.fn()
  await createLive({ getClient: async () => client, onData, realtime: false }).start()
  expect(onData).toHaveBeenCalledWith(expect.objectContaining({ settings: expect.objectContaining({ id: 1 }) }))
})

test('falls back to polling when realtime never subscribes', async () => {
  vi.useFakeTimers()
  const client = fakeClient(), onData = vi.fn()
  const live = createLive({ getClient: async () => client, onData, realtime: true, pollMs: 30_000, subscribeTimeoutMs: 10_000 })
  await live.start()
  const before = client.calls.from
  await vi.advanceTimersByTimeAsync(10_000 + 30_000)
  expect(client.calls.from).toBeGreaterThan(before)
  live.stop(); vi.useRealTimers()
})

test('falls back to polling on CHANNEL_ERROR, not while SUBSCRIBED', async () => {
  vi.useFakeTimers()
  const client = fakeClient()
  const live = createLive({ getClient: async () => client, onData: () => {}, realtime: true })
  await live.start()
  client.emit('SUBSCRIBED')
  const n = client.calls.from
  await vi.advanceTimersByTimeAsync(60_000)
  expect(client.calls.from).toBe(n) // realtime healthy: no polling
  client.emit('CHANNEL_ERROR')
  await vi.advanceTimersByTimeAsync(30_000)
  expect(client.calls.from).toBeGreaterThan(n)
  live.stop(); vi.useRealTimers()
})

test('backend errors keep the last good data and never throw', async () => {
  const onData = vi.fn()
  await expect(createLive({ getClient: async () => fakeClient({ fail: true }), onData, realtime: false }).start()).resolves.toBeUndefined()
  expect(onData).toHaveBeenCalledWith({ settings: null, announcements: [], winners: [] })
})

test('client load failure is swallowed (site runs on content.js)', async () => {
  await expect(createLive({ getClient: async () => { throw new Error('cdn') }, onData: () => {}, realtime: true }).start()).resolves.toBeUndefined()
})
