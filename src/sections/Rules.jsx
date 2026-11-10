import { content } from '../content.js'
import { ScrambleText } from '../components/ScrambleText.jsx'
import { orTBC, Placeholder } from '../components/Placeholder.jsx'

const PANELS = [['eligibility', 'Eligibility'], ['teamSize', 'Team size'], ['submission', 'Submission rules'], ['codeOfConduct', 'Code of conduct']]

export function Rules() {
  return (
    <section className="block" id="rules">
      <p className="label">Rules &amp; judging</p>
      <ScrambleText as="h2" text="Play fair. Ship fast." glitch />
      <div className="acc">
        {PANELS.map(([k, t]) => <details key={k} className="card"><summary>{t}</summary><p>{orTBC(content.rules[k], 'To be confirmed')}</p></details>)}
      </div>
      <h3 className="sub">Judging criteria</h3>
      {content.judgingCriteria.length ? (
        <ul className="criteria">{content.judgingCriteria.map(c => (
          <li key={c.name}><span>{c.name}</span><span className="bar" style={{ '--w': `${c.weight}%` }} /><b>{c.weight}%</b></li>))}</ul>
      ) : <Placeholder>To be confirmed</Placeholder>}
    </section>
  )
}
