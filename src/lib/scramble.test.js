import { scrambleFrame } from './scramble.js'

test('progress 1 returns the real text; spaces never scramble', () => {
  expect(scrambleFrame('Smart Cities', 1, () => 0)).toBe('Smart Cities')
  const mid = scrambleFrame('Smart Cities', 0.5, () => 0)
  expect(mid).toHaveLength('Smart Cities'.length)
  expect(mid[5]).toBe(' ')
  expect(mid.slice(0, 6)).toBe('Smart ')
})
