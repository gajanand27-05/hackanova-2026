import { render, screen, within } from '@testing-library/react'
import { content } from '../content.js'
import { Domains } from './Domains.jsx'
import { Timeline } from './Timeline.jsx'
import { Prizes } from './Prizes.jsx'

const list = container => within(container.querySelector('#tlList'))

test('domains render 7 rows with scene slots', () => {
  const { container } = render(<Domains />)
  expect(container.querySelectorAll('#domList .drow')).toHaveLength(7)
  expect(container.querySelectorAll('#domList .d-slot')).toHaveLength(7)
})

test('timeline shows confirmed times and "To be confirmed" for open slots', () => {
  const { container } = render(<Timeline schedule={content.schedule} now={0} />)
  const l = list(container)
  expect(l.getByText('8:00 AM')).toBeInTheDocument()
  expect(l.getByText('6:00 PM')).toBeInTheDocument()
  expect(l.getByText('6:00–8:00 PM')).toBeInTheDocument()
  expect(l.getAllByText(/to be confirmed/i)).toHaveLength(2)
})

test('timeline uses admin-provided times for open slots', () => {
  const schedule = content.schedule.map(e => e.id === 'slot2' ? { ...e, time: '13:00', label: 'Mid-day check-in' } : e)
  const { container } = render(<Timeline schedule={schedule} now={0} />)
  expect(list(container).getByText('1:00 PM')).toBeInTheDocument()
  expect(list(container).getByText('Mid-day check-in')).toBeInTheDocument()
})

test('prizes show placeholders until winners are published', () => {
  const { rerender } = render(<Prizes winners={[]} />)
  expect(screen.getAllByText(/to be announced/i)).toHaveLength(3)
  rerender(<Prizes winners={[{ place: 1, team: 'Team Nova', project: 'X' }]} />)
  expect(screen.getByText('Team Nova')).toBeInTheDocument()
})
