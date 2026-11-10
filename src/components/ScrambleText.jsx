import { useEffect, useRef } from 'react'
import { scrambleFrame } from '../lib/scramble.js'
import { motionAllowed } from '../lib/motion.js'

export function glitchOnce(el) {
  if (!el || !motionAllowed()) return
  el.classList.remove('is-glitching'); void el.offsetWidth; el.classList.add('is-glitching')
  setTimeout(() => el.classList.remove('is-glitching'), 360)
}

// Real text for assistive tech (.sr-only); the visible copy is aria-hidden and animates.
// glitch: RGB-split pseudo-elements (CSS .glitch[data-text]) fire after the decode and on hover.
export function ScrambleText({ as: Tag = 'span', text, className = '', hover = true, onView = true, glitch = false, duration = 900, id, onHover }) {
  const root = useRef(null)
  const vis = useRef(null)
  const run = useRef(() => {})

  useEffect(() => {
    const el = vis.current
    if (!el || !motionAllowed()) return
    let raf = 0
    run.current = (dur = duration) => {
      cancelAnimationFrame(raf)
      const t0 = performance.now()
      const step = now => {
        const p = Math.min(1, (now - t0) / dur)
        el.textContent = scrambleFrame(text, 1 - Math.pow(1 - p, 3)) // eased, never snaps
        if (p < 1) raf = requestAnimationFrame(step); else el.textContent = text
      }
      raf = requestAnimationFrame(step)
    }
    let io
    if (onView && 'IntersectionObserver' in window) {
      io = new IntersectionObserver(([e]) => {
        if (e.isIntersecting) { run.current(); if (glitch) setTimeout(() => glitchOnce(root.current), duration); io.disconnect() }
      }, { threshold: 0.6 })
      io.observe(el)
    } else if (!onView) run.current()
    return () => { cancelAnimationFrame(raf); io?.disconnect() }
  }, [text, duration, onView, glitch])

  const enter = hover ? () => { run.current(520); if (glitch) glitchOnce(root.current); onHover?.() } : undefined
  return (
    <Tag ref={root} id={id} className={`${glitch ? 'glitch ' : ''}${className}`} data-text={glitch ? text : undefined} onMouseEnter={enter}>
      <span className="sr-only">{text}</span>
      <span className="vis" aria-hidden="true" ref={vis}>{text}</span>
    </Tag>
  )
}
