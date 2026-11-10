import { render, screen } from '@testing-library/react'
import { RegisterButton } from './RegisterButton.jsx'

test('links to Unstop when a URL is set', () => {
  render(<RegisterButton settings={{ unstopUrl: 'https://unstop.com/hackathons/x', registrationsClosed: false }} />)
  const a = screen.getByRole('link', { name: /register/i })
  expect(a).toHaveAttribute('href', 'https://unstop.com/hackathons/x')
  expect(a).toHaveAttribute('rel', expect.stringContaining('noopener'))
})

test('never renders empty: shows "opening soon" before the link exists', () => {
  render(<RegisterButton settings={{ unstopUrl: null, registrationsClosed: false }} />)
  expect(screen.getByRole('button')).toHaveTextContent(/opening soon/i)
})

test('closed registrations disable the button', () => {
  render(<RegisterButton settings={{ unstopUrl: 'https://unstop.com/x', registrationsClosed: true }} />)
  expect(screen.getByRole('button', { name: /registrations closed/i })).toBeDisabled()
  expect(screen.queryByRole('link')).toBeNull()
})
