import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { EVENT } from '../content.js'
import { ScrambleText, glitchOnce } from '../components/ScrambleText.jsx'
import { Countdown } from '../components/Countdown.jsx'
import { RegisterButton } from '../components/RegisterButton.jsx'
import { motionAllowed } from '../lib/motion.js'
import { bus } from '../scene/bus.js'

const sm = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t) }

// Scroll choreography (DOM side; the particles read scroll themselves): hero fades and blurs,
// a white flash peaks at 53%, then IGNITION scales in and out.
function useHeroChoreography(inner, ignite, cue) {
  useEffect(() => {
    if (!motionAllowed()) return
    gsap.registerPlugin(ScrollTrigger)
    const flash = document.getElementById('flash')
    let fired = false
    const st = ScrollTrigger.create({
      trigger: '#heroWrap', start: 'top top', end: 'bottom bottom', scrub: true,
      onUpdate: ({ progress: p }) => {
        const out = sm(0.04, 0.32, p)
        inner.current.style.opacity = 1 - out
        inner.current.style.transform = `scale(${1 - out * 0.12})`
        inner.current.style.filter = out > 0.01 ? `blur(${(out * 6).toFixed(1)}px)` : ''
        cue.current.style.opacity = 1 - sm(0, 0.08, p)
        const f = Math.max(0, 1 - Math.abs(p - 0.53) / 0.06)
        if (flash) flash.style.opacity = (f * f * 0.9).toFixed(3)
        const ig = sm(0.53, 0.62, p) * (1 - sm(0.78, 0.92, p))
        ignite.current.style.opacity = ig.toFixed(3)
        const word = ignite.current.firstChild
        word.style.transform = `scale(${0.7 + sm(0.53, 0.9, p) * 0.5})`
        word.style.letterSpacing = `${-0.03 + sm(0.53, 0.9, p) * 0.12}em`
        if (p > 0.55 && !fired) { fired = true; glitchOnce(word) }
        if (p < 0.5) fired = false
      },
    })
    return () => st.kill()
  }, [inner, ignite, cue])
}

export function Hero({ now, settings }) {
  const inner = useRef(null), ignite = useRef(null), cue = useRef(null)
  useHeroChoreography(inner, ignite, cue)
  return (
    <div className="hero-wrap" id="heroWrap">
      <header className="hero">
        <div className="hero-inner" ref={inner}>
          <p className="kicker">Dept. of AI &amp; ML · <b>KNSIT</b> presents</p>
          <div className="hero-slot" id="heroSlot" aria-hidden="true" />
          <ScrambleText as="h1" className="wordmark" id="wordmark" text="HACKANOVA" glitch onView={false} duration={1400}
            onHover={() => { bus.scatter = 1 }} />
          <p className="year">2026</p>
          <p className="tagline">{EVENT.tagline}</p>
          <div className="meta">
            <span className="chip"><b>26 Nov 2026</b> · 8 AM–8 PM IST</span>
            <span className="chip">KNS Institute of Technology, <b>Bengaluru</b></span>
          </div>
          <Countdown now={now} />
          <div className="ctas">
            <RegisterButton settings={settings} />
            <a className="btn ghost" href="#about">Explore</a>
          </div>
        </div>
        <div className="ignite" ref={ignite} aria-hidden="true"><span className="glitch" data-text="IGNITION">IGNITION</span></div>
        <div className="scroll-cue" ref={cue} aria-hidden="true">SCROLL TO IGNITE<i /></div>
      </header>
    </div>
  )
}
