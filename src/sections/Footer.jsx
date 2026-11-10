import { content, EVENT } from '../content.js'
import { ScrambleText } from '../components/ScrambleText.jsx'
import { RegisterButton } from '../components/RegisterButton.jsx'

// Final call to action (#finalSlot: the neural net re-forms here) + footer.
export function Footer({ settings, onTerminal }) {
  return (
    <>
      <section className="block final" id="join">
        <div className="final-slot" id="finalSlot" aria-hidden="true" />
        <p className="label" style={{ justifyContent: 'center' }}>05 · Join</p>
        <ScrambleText as="h2" text="Ready to go nova?" glitch />
        <p className="lead" style={{ margin: '0 auto' }}>Registration and team formation happen on Unstop.</p>
        <div className="ctas"><RegisterButton settings={settings} /></div>
      </section>
      <footer>
        <div>
          <div className="f-logo">{EVENT.name}</div>
          <div style={{ marginTop: 8 }}>Dept. of AI &amp; ML · {EVENT.venue}</div>
        </div>
        <div className="foot-links">
          {content.brochureUrl && <a href={content.brochureUrl} download>Download brochure</a>}
          {content.socials.map(s => <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer">{s.label}</a>)}
          <span className="hint">psst, press <kbd>`</kbd> or type <kbd>nova</kbd></span>
          <button className="term-btn" onClick={onTerminal} aria-label="Open terminal">&gt;_</button>
        </div>
      </footer>
    </>
  )
}
