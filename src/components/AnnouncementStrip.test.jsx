import { render, screen } from '@testing-library/react'
import { AnnouncementStrip } from './AnnouncementStrip.jsx'
import { START, FREEZE } from '../lib/time.js'

const items = [{ id: 2, body: '30 minutes to code freeze', level: 'urgent' }, { id: 1, body: 'Welcome!', level: 'normal' }]

test('hidden before the event even if announcements exist', () => {
  const { container } = render(<AnnouncementStrip now={START - 1} items={items} />)
  expect(container).toBeEmptyDOMElement()
})

test('shown during live and judging; urgent is marked', () => {
  render(<AnnouncementStrip now={FREEZE - 1} items={items} />)
  expect(screen.getByRole('region', { name: /announcements/i })).toBeInTheDocument()
  expect(screen.getByText('30 minutes to code freeze').closest('li')).toHaveClass('urgent')
})
