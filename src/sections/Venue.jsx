import { useState } from 'react'
import { content } from '../content.js'
import { ScrambleText } from '../components/ScrambleText.jsx'
import { orTBC } from '../components/Placeholder.jsx'

// The Google Maps embed is heavy on budget phones, so it loads only when asked.
export function Venue() {
  const v = content.venue
  const [map, setMap] = useState(false)
  return (
    <section className="block" id="venue">
      <p className="label">Venue</p>
      <ScrambleText as="h2" text="Find the launchpad." glitch />
      <div className="venue-grid">
        <div className="card info-card">
          <h3>{v.name}</h3>
          <p>{orTBC(v.address, 'Address announcing soon')}</p>
          <p>Reporting time: {orTBC(v.reportingTime)}</p>
          {v.directions && <ul>{Object.entries(v.directions).map(([k, d]) => <li key={k}><b>{k}:</b> {d}</li>)}</ul>}
          <a className="btn ghost sm" href={v.mapsUrl} target="_blank" rel="noopener noreferrer">Open in Google Maps</a>
        </div>
        <div className="card map-box">
          {map
            ? <iframe title="Map to KNS Institute of Technology" src={v.embedUrl} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
            : <button className="btn ghost" onClick={() => setMap(true)}>Load map</button>}
        </div>
      </div>
    </section>
  )
}
