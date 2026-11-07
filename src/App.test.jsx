import { render, screen } from '@testing-library/react'
import App from './App.jsx'

test('renders the HACKANOVA title', () => {
  render(<App />)
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/HACKANOVA/)
})
