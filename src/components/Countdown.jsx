import { countdownAt } from '../lib/time.js'
const pad = n => String(n).padStart(2, '0')

export function Countdown({ now }) {
  const c = countdownAt(now)
  if (c.phase === 'ended') return <p className="count-label">That’s a wrap. Thank you, hackers!</p>
  const cells = [['days', c.d], ['hrs', c.h], ['min', c.m], ['sec', c.s]]
  return (
    <>
      <p className="count-label">{c.label}</p>
      <div className="count" role="timer" aria-live="off" aria-label={`${c.label} ${c.d} days ${c.h} hours ${c.m} minutes`}>
        {cells.map(([k, v]) => <div key={k} className="cell"><span className="n">{pad(v)}</span><span className="l">{k}</span></div>)}
      </div>
    </>
  )
}
