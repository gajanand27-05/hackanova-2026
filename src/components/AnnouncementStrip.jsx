import { useState } from 'react'
import { phaseAt } from '../lib/time.js'

// Event-day only (live + judging). Newest first; urgent posts are hot pink and glitch once on arrival.
export function AnnouncementStrip({ now, items }) {
  const [hidden, setHidden] = useState(() => new Set())
  const phase = phaseAt(now)
  const visible = items.filter(a => !hidden.has(a.id))
  if ((phase !== 'live' && phase !== 'judging') || !visible.length) return null
  return (
    <section className="strip" aria-label="Announcements" aria-live="polite">
      <ul>
        {visible.map(a => (
          <li key={a.id} className={a.level === 'urgent' ? 'urgent' : ''}>
            <span>{a.body}</span>
            <button aria-label="Dismiss announcement" onClick={() => setHidden(h => new Set(h).add(a.id))}>✕</button>
          </li>
        ))}
      </ul>
    </section>
  )
}
