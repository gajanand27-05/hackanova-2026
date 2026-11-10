import { content } from '../content.js'
import { ScrambleText } from '../components/ScrambleText.jsx'

export function Sponsors() {
  const s = content.sponsors
  return (
    <section className="block" id="sponsors">
      <p className="label">Sponsors</p>
      <ScrambleText as="h2" text="Powered by." glitch />
      {s.length ? (
        <ul className="logos">{s.map(x => (
          <li key={x.name} className={`card tier-${x.tier}`}><a href={x.url} target="_blank" rel="noopener noreferrer"><img src={x.logo} alt={x.name} loading="lazy" /></a></li>))}</ul>
      ) : (
        <div className="card partner">
          <b>Partner with HACKANOVA</b>
          <p>200+ student builders, 12 hours, one room.</p>
          {content.sponsorContactEmail
            ? <a className="btn ghost sm" href={`mailto:${content.sponsorContactEmail}`}>{content.sponsorContactEmail}</a>
            : <span className="badge-tbc">Contact announcing soon</span>}
        </div>
      )}
    </section>
  )
}
