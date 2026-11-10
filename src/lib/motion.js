const KEY = 'hn-motion'
const media = mq => mq ?? (typeof matchMedia === 'function' ? matchMedia : null)
const store = s => s ?? (typeof localStorage === 'undefined' ? null : localStorage)

export function systemReducesMotion(mq) {
  const m = media(mq); return !!m && m('(prefers-reduced-motion: reduce)').matches
}
export function motionAllowed({ mq, storage } = {}) {
  let opt = null
  try { opt = store(storage)?.getItem(KEY) ?? null } catch { /* storage blocked */ }
  return opt === 'full' ? true : !systemReducesMotion(mq)
}
export function optInMotion(storage) { try { store(storage)?.setItem(KEY, 'full') } catch { /* ignore */ } }
export function optOutMotion(storage) { try { store(storage)?.removeItem(KEY) } catch { /* ignore */ } }
export function isFinePointer(mq) { const m = media(mq); return !!m && m('(pointer: fine)').matches }
