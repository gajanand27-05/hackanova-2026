import { runCommand, isTypingTarget } from './terminal.js'
import { START } from './time.js'
import { content } from '../content.js'

const ctx = { now: START - 3600_000, settings: { unstopUrl: null, registrationsClosed: false, schedule: content.schedule } }
const text = r => r.lines.map(l => l.text).join('\n')

test('help lists the tappable commands', () => {
  expect(text(runCommand('help', ctx))).toMatch(/schedule[\s\S]*domains[\s\S]*prizes[\s\S]*register[\s\S]*countdown/)
})
test('domains lists all 7', () => { expect(runCommand('domains', ctx).lines).toHaveLength(7) })
test('schedule shows only confirmed times; open slots say TBC', () => {
  const t = text(runCommand('schedule', ctx))
  expect(t).toMatch(/8:00 AM/); expect(t).toMatch(/To be confirmed/); expect(t).not.toMatch(/lunch/i)
})
test('countdown uses the IST clock', () => { expect(text(runCommand('countdown', ctx))).toMatch(/Kickoff in: 0d 01h 00m 00s/) })
test('register respects the closed toggle and the missing link', () => {
  expect(text(runCommand('register', { ...ctx, settings: { ...ctx.settings, registrationsClosed: true } }))).toMatch(/closed/i)
  expect(text(runCommand('register', ctx))).toMatch(/opening soon/i)
  expect(runCommand('register', { ...ctx, settings: { ...ctx.settings, unstopUrl: 'https://unstop.com/x' } }).action).toBe('register')
})
test('input is trimmed and case-insensitive; unknown commands are handled', () => {
  expect(runCommand('  HELP ', ctx).lines.length).toBeGreaterThan(0)
  expect(text(runCommand('rm -rf /', ctx))).toMatch(/command not found/)
})
test('sudo is a joke, exit closes, clear clears', () => {
  expect(text(runCommand('sudo make me win', ctx))).toMatch(/sudoers/i)
  expect(runCommand('exit', ctx).action).toBe('close')
  expect(runCommand('clear', ctx).action).toBe('clear')
})
test('typing targets are detected', () => {
  for (const tag of ['INPUT', 'TEXTAREA', 'SELECT']) expect(isTypingTarget({ tagName: tag })).toBe(true)
  expect(isTypingTarget({ tagName: 'DIV', isContentEditable: true })).toBe(true)
  expect(isTypingTarget({ tagName: 'BUTTON' })).toBe(false)
  expect(isTypingTarget(null)).toBe(false)
})
