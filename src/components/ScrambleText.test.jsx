import { render, screen } from '@testing-library/react'
import { ScrambleText } from './ScrambleText.jsx'

test('screen readers get the real text; the animated copy is hidden', () => {
  const { container } = render(<ScrambleText as="h2" text="Pick your orbit." />)
  expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Pick your orbit.')
  expect(container.querySelector('.sr-only')).toHaveTextContent('Pick your orbit.')
  expect(container.querySelector('[aria-hidden="true"]')).not.toBeNull()
})
