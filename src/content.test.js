import { EVENT, content } from './content.js'

test('event instants are the confirmed IST times', () => {
  expect(EVENT.startISO).toBe('2026-11-26T08:00:00+05:30')
  expect(EVENT.freezeISO).toBe('2026-11-26T18:00:00+05:30')
  expect(EVENT.endISO).toBe('2026-11-26T20:00:00+05:30')
})

test('exactly 7 domains, no Open Innovation', () => {
  expect(content.domains.map(d => d.name)).toEqual(
    ['AI / ML', 'Healthcare', 'FinTech', 'Smart Cities', 'Education', 'Agriculture', 'Sustainability'])
})

test('only confirmed schedule times are filled; the rest are null', () => {
  const fixed = content.schedule.filter(e => e.fixed).map(e => e.time)
  expect(fixed).toEqual(['08:00', '18:00', '18:00–20:00', '20:00'])
  for (const e of content.schedule.filter(e => !e.fixed)) { expect(e.time).toBeNull(); expect(e.label).toBeNull() }
  expect(JSON.stringify(content.schedule).toLowerCase()).not.toMatch(/lunch|mentor/)
})

test('unconfirmed organiser info stays null (never invented)', () => {
  expect(content.unstopUrl).toBeNull()
  expect(content.prizes.pool).toBeNull()
  expect(content.teamSize).toBeNull()
  expect(content.sponsors).toEqual([])
  expect(content.judges).toEqual([])
})

test('student phone numbers require consent', () => {
  for (const s of content.contacts.students) if (s.phone) expect(s.consent).toBe(true)
})
