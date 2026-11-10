import { content } from '../content.js'
import { ScrambleText } from '../components/ScrambleText.jsx'

// Hidden entirely until at least one perk is confirmed.
export function Perks({ perks = content.perks }) {
  if (!perks.length) return null
  return (
    <section className="block" id="perks">
      <p className="label">What you get</p>
      <ScrambleText as="h2" text="Fuel for the all-dayer." glitch />
      <ul className="perk-grid">{perks.map(p => <li key={p.title} className="card"><b>{p.title}</b><p>{p.desc}</p></li>)}</ul>
    </section>
  )
}
