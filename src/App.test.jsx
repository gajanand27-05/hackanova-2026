import { render, screen } from '@testing-library/react'
import App from './App.jsx'

test('renders title, date and a non-empty Register control without WebGL', () => {
  render(<App />)
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('HACKANOVA')
  expect(screen.getAllByText(/26 Nov 2026/).length).toBeGreaterThan(0)
  expect(screen.getAllByRole('button', { name: /opening soon/i }).length).toBeGreaterThan(0)
})
