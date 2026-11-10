import { content } from '../content.js'
import { ScrambleText } from '../components/ScrambleText.jsx'
import { Placeholder } from '../components/Placeholder.jsx'

export function Faq() {
  return (
    <section className="block" id="faq">
      <p className="label">FAQ</p>
      <ScrambleText as="h2" text="Questions, answered." glitch />
      <div className="acc">
        {content.faqs.map(f => (
          <details key={f.q} className="card"><summary>{f.q}</summary><p>{f.a ?? <Placeholder>To be confirmed</Placeholder>}</p></details>
        ))}
      </div>
    </section>
  )
}
