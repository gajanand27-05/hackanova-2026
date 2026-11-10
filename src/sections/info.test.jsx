import { render, screen, fireEvent } from '@testing-library/react'
import { Venue } from './Venue.jsx'
import { Contact } from './Contact.jsx'
import { Perks } from './Perks.jsx'
import { Faq } from './Faq.jsx'
import { Footer } from './Footer.jsx'

test('map iframe loads only after the user asks', () => {
  const { container } = render(<Venue />)
  expect(container.querySelector('iframe')).toBeNull()
  expect(screen.getByRole('link', { name: /open in google maps/i })).toHaveAttribute('href', expect.stringContaining('google.com/maps'))
  fireEvent.click(screen.getByRole('button', { name: /load map/i }))
  expect(container.querySelector('iframe')).not.toBeNull()
})

test('student phone hidden without consent, shown with consent', () => {
  const students = [
    { name: 'A', role: 'Student coordinator', email: 'a@x.in', phone: '+919999999999', consent: false },
    { name: 'B', role: 'Student coordinator', email: 'b@x.in', phone: '+918888888888', consent: true },
  ]
  render(<Contact faculty={[]} students={students} />)
  expect(screen.queryByText(/9999999999/)).toBeNull()
  expect(screen.queryByRole('link', { name: /call a/i })).toBeNull()
  expect(screen.getByRole('link', { name: /call b/i })).toHaveAttribute('href', 'tel:+918888888888')
})

test('perks section is hidden when no perk is confirmed', () => {
  const { container } = render(<Perks perks={[]} />)
  expect(container).toBeEmptyDOMElement()
})

test('unanswered FAQs show "To be confirmed" instead of invented answers', () => {
  render(<Faq />)
  expect(screen.getAllByText(/to be confirmed/i).length).toBeGreaterThan(0)
})

test('final section carries the scene slot and a register control', () => {
  const { container } = render(<Footer settings={{ unstopUrl: null, registrationsClosed: false }} onTerminal={() => {}} />)
  expect(container.querySelector('#finalSlot')).not.toBeNull()
  expect(screen.getByRole('button', { name: /opening soon/i })).toBeInTheDocument()
})
