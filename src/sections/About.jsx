import { content } from '../content.js'
import { ScrambleText } from '../components/ScrambleText.jsx'

export function About() {
  return (
    <section className="block" id="about">
      <p className="label">01 · About</p>
      <ScrambleText as="h2" text="Build what’s next." glitch />
      <div className="about-grid">
        <div className="card about-main">{content.about.map(p => <p key={p}>{p}</p>)}</div>
        <div className="stats">
          <div className="card stat"><div className="v">12h</div><div className="k">on-site event</div></div>
          <div className="card stat"><div className="v">{content.expectedParticipants}</div><div className="k">hackers expected</div></div>
          <div className="card stat"><div className="v">7</div><div className="k">domains</div></div>
          <div className="card stat"><div className="v">6 PM</div><div className="k">code freeze</div></div>
        </div>
      </div>
    </section>
  )
}
