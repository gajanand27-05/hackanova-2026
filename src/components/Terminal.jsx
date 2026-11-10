import { useEffect, useRef, useState } from 'react'
import { runCommand, CHIPS } from '../lib/terminal.js'

// Slide-down terminal. Always mounted (so it can animate) but inert while closed.
// Tappable command chips mean nobody has to type, which keeps it usable on phones.
export function Terminal({ open, onClose, settings, now }) {
  const [log, setLog] = useState([{ text: 'nova@hackanova:~ · tap a command or type help', cls: 'mute', k: 0 }])
  const [value, setValue] = useState('')
  const [history, setHistory] = useState([]), [hIdx, setHIdx] = useState(0)
  const input = useRef(null), opener = useRef(null), out = useRef(null)
  const key = useRef(1)

  useEffect(() => {
    if (!open) return
    opener.current = document.activeElement
    const id = setTimeout(() => input.current?.focus(), 50)
    return () => { clearTimeout(id); opener.current?.focus?.() }
  }, [open])
  useEffect(() => { if (out.current) out.current.scrollTop = out.current.scrollHeight }, [log])

  function exec(cmd) {
    const r = runCommand(cmd, { now, settings })
    if (cmd.trim()) { setHistory(h => [...h, cmd]); setHIdx(history.length + 1) }
    if (r.action === 'clear') return setLog([])
    if (r.action === 'close') return onClose()
    if (r.action === 'register') window.open(settings.unstopUrl, '_blank', 'noopener')
    setLog(l => [...l, { text: `❯ ${cmd}`, cls: 'cmd', k: key.current++ }, ...r.lines.map(x => ({ ...x, k: key.current++ }))])
  }
  function onKey(e) {
    if (e.key === 'Escape') onClose()
    if (e.key === 'ArrowUp' && history.length) { e.preventDefault(); const i = Math.max(0, hIdx - 1); setHIdx(i); setValue(history[i]) }
    if (e.key === 'ArrowDown' && history.length) { e.preventDefault(); const i = Math.min(history.length, hIdx + 1); setHIdx(i); setValue(history[i] ?? '') }
  }
  return (
    <div id="term" className={open ? 'open' : ''} role="dialog" aria-modal="false" aria-label="NOVA terminal"
      aria-hidden={!open} inert={!open} onKeyDown={onKey}>
      <div className="term-bar"><span>nova@hackanova:~ · tap a command or type <b style={{ color: 'var(--cyan)' }}>help</b></span>
        <button onClick={onClose} aria-label="Close terminal">close ✕</button></div>
      <div id="term-out" ref={out} aria-live="polite">{log.map(l => <div key={l.k} className={l.cls}>{l.text}</div>)}</div>
      <div className="chips">{CHIPS.map(c => <button key={c} onClick={() => exec(c)}>{c}</button>)}</div>
      <form className="term-in" autoComplete="off" onSubmit={e => { e.preventDefault(); exec(value); setValue('') }}>
        <span aria-hidden="true">❯</span><label className="sr-only" htmlFor="termInput">Command</label>
        <input id="termInput" ref={input} value={value} onChange={e => setValue(e.target.value)} spellCheck="false" autoCapitalize="off" />
      </form>
    </div>
  )
}
