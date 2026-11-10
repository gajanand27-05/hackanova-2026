import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { AnnouncementsTab } from './AnnouncementsTab.jsx'
import { WinnersTab } from './WinnersTab.jsx'
import { QuickUpdatesTab } from './QuickUpdatesTab.jsx'

function client(overrides = {}) {
  const chain = r => {
    const b = { select: () => b, order: () => b, eq: () => b, single: () => b,
      insert: vi.fn(() => b), delete: vi.fn(() => b), upsert: vi.fn(() => b), update: vi.fn(() => b),
      then: (a, c) => Promise.resolve(r).then(a, c) }
    return b
  }
  const ok = { data: [], error: null }
  const tables = {
    announcements: chain(ok), winners: chain(ok),
    site_settings: chain({ data: { id: 1, unstop_url: null, registered_count: null, registrations_closed: false, schedule: {}, winners_published: false }, error: null }),
    ...overrides,
  }
  return { from: t => tables[t], tables }
}

test('announcement over 280 characters cannot be posted', () => {
  render(<AnnouncementsTab client={client()} />)
  fireEvent.change(screen.getByLabelText(/message/i), { target: { value: 'x'.repeat(281) } })
  expect(screen.getByRole('button', { name: /post/i })).toBeDisabled()
})

test('posting sends body and level', async () => {
  const c = client()
  render(<AnnouncementsTab client={c} />)
  fireEvent.change(screen.getByLabelText(/message/i), { target: { value: 'Check-in desk is open' } })
  fireEvent.click(screen.getByLabelText(/urgent/i))
  fireEvent.click(screen.getByRole('button', { name: /post/i }))
  await waitFor(() => expect(c.tables.announcements.insert).toHaveBeenCalledWith({ body: 'Check-in desk is open', level: 'urgent' }))
})

test('publishing winners needs a confirm step', async () => {
  const c = client()
  render(<WinnersTab client={c} />)
  fireEvent.click(await screen.findByRole('button', { name: /^publish/i }))
  expect(c.tables.site_settings.update).not.toHaveBeenCalled()
  fireEvent.click(screen.getByRole('button', { name: /yes, publish now/i }))
  await waitFor(() => expect(c.tables.site_settings.update).toHaveBeenCalledWith(expect.objectContaining({ winners_published: true })))
})

test('quick updates reject a non-Unstop link', async () => {
  const c = client()
  render(<QuickUpdatesTab client={c} />)
  fireEvent.change(await screen.findByLabelText(/unstop link/i), { target: { value: 'https://evil.example/phish' } })
  fireEvent.click(screen.getByRole('button', { name: /save/i }))
  expect(await screen.findByText(/must start with https:\/\/unstop.com\//i)).toBeInTheDocument()
  expect(c.tables.site_settings.update).not.toHaveBeenCalled()
})

test('registrations-closed toggle is saved', async () => {
  const c = client()
  render(<QuickUpdatesTab client={c} />)
  fireEvent.click(await screen.findByLabelText(/registrations closed/i))
  fireEvent.click(screen.getByRole('button', { name: /save/i }))
  await waitFor(() => expect(c.tables.site_settings.update).toHaveBeenCalledWith(expect.objectContaining({ registrations_closed: true })))
})
