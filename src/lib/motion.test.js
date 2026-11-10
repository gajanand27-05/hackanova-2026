import { motionAllowed, optInMotion, systemReducesMotion } from './motion.js'

const mq = reduce => q => ({ matches: q.includes('reduce') ? reduce : false })
const store = () => { const m = new Map(); return { getItem: k => m.get(k) ?? null, setItem: (k, v) => m.set(k, v), removeItem: k => m.delete(k) } }

test('system reduced motion turns motion off', () => {
  expect(systemReducesMotion(mq(true))).toBe(true)
  expect(motionAllowed({ mq: mq(true), storage: store() })).toBe(false)
  expect(motionAllowed({ mq: mq(false), storage: store() })).toBe(true)
})

test('opt-in overrides the system setting', () => {
  const s = store(); optInMotion(s)
  expect(motionAllowed({ mq: mq(true), storage: s })).toBe(true)
})

test('storage failures fall back to the system setting', () => {
  const broken = { getItem() { throw new Error('blocked') }, setItem() { throw new Error('blocked') } }
  expect(() => optInMotion(broken)).not.toThrow()
  expect(motionAllowed({ mq: mq(true), storage: broken })).toBe(false)
})
