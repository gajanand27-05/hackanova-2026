import { useEffect, useRef, useState } from 'react'
import { content } from './content.js'
import { clock } from './lib/time.js'
import { useNow } from './hooks/useNow.js'
import { initSmooth } from './lib/smooth.js'
import { motionAllowed, isFinePointer } from './lib/motion.js'
import { bus } from './scene/bus.js'
import { Cursor } from './components/Cursor.jsx'
import { MotionPill } from './components/MotionPill.jsx'
import { Nav } from './components/Nav.jsx'
import { Hero } from './sections/Hero.jsx'
import { About } from './sections/About.jsx'
import { Domains } from './sections/Domains.jsx'
import { Timeline } from './sections/Timeline.jsx'
import { Prizes } from './sections/Prizes.jsx'

const DEFAULT_SETTINGS = {
  unstopUrl: content.unstopUrl, registeredCount: content.registeredCount,
  registrationsClosed: content.registrationsClosed, schedule: content.schedule,
}

// Button hover glitch (C's effect), delegated so every .btn gets it.
function useButtonGlitch() {
  useEffect(() => {
    if (!motionAllowed()) return
    let last = null
    const over = e => {
      const b = e.target.closest?.('.btn')
      if (b && b !== last) { b.classList.remove('glitching'); void b.offsetWidth; b.classList.add('glitching') }
      last = b
    }
    const end = e => e.target.classList?.remove('glitching')
    document.addEventListener('pointerover', over)
    document.addEventListener('animationend', end)
    return () => { document.removeEventListener('pointerover', over); document.removeEventListener('animationend', end) }
  }, [])
}

export default function App() {
  const now = useNow()
  const [settings] = useState(DEFAULT_SETTINGS) // Task 11 replaces this with useLive()
  const canvas = useRef(null)
  useButtonGlitch()

  useEffect(() => { clock.sync() }, [])
  useEffect(() => {
    document.documentElement.classList.toggle('rm', !motionAllowed())
    let scene, cancelled = false, lenis = null
    initSmooth().then(s => { if (cancelled) s.lenis?.destroy(); else lenis = s.lenis })
    const move = e => { bus.px = e.clientX; bus.py = e.clientY }
    const leave = () => { bus.px = bus.py = -1e4 }
    addEventListener('pointermove', move, { passive: true })
    document.addEventListener('pointerleave', leave)
    // smooth in-page anchors (Lenis on desktop, native elsewhere)
    const click = e => {
      const a = e.target.closest?.('a[href^="#"]'); if (!a) return
      const t = document.querySelector(a.getAttribute('href')); if (!t) return
      e.preventDefault()
      if (lenis) lenis.scrollTo(t, { offset: -10 }); else t.scrollIntoView({ behavior: motionAllowed() ? 'smooth' : 'auto' })
    }
    document.addEventListener('click', click)
    const go = () => import('./scene/scene.js')
      .then(m => m.startScene(canvas.current, { mobile: !isFinePointer() || innerWidth < 768, reducedMotion: !motionAllowed() }))
      .then(s => { if (cancelled) s.dispose(); else scene = s })
      .catch(() => { /* no WebGL: the CSS .fallback nebula stays visible */ })
    const idle = window.requestIdleCallback ?? (cb => setTimeout(cb, 1))
    idle(go)
    return () => {
      cancelled = true; scene?.dispose(); lenis?.destroy()
      removeEventListener('pointermove', move); document.removeEventListener('pointerleave', leave); document.removeEventListener('click', click)
    }
  }, [])

  return (
    <>
      <canvas id="gl" ref={canvas} aria-hidden="true" />
      <div className="fallback" aria-hidden="true" />
      <div className="vignette" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />
      <div id="flash" aria-hidden="true" />
      <Cursor />
      <Nav settings={settings} onTerminal={() => {}} />
      <MotionPill />
      <main id="top">
        <Hero now={now} settings={settings} />
        <About />
        <Domains />
        <Timeline schedule={settings.schedule} now={now} />
        <Prizes winners={[]} />
      </main>
    </>
  )
}
