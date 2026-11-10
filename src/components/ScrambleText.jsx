import { useEffect, useRef } from 'react'
import { scrambleFrame } from '../lib/scramble.js'
import { motionAllowed } from '../lib/motion.js'

// Real text for assistive tech (.sr-only); the visible copy is aria-hidden and animates.
export function ScrambleText({ as: Tag = 'span', text, className = '', hover = true, onView = true, duration = 520 }) {
  const vis = useRef(null)
  const run = useRef(() => {})

  useEffect(() => {
    const el = vis.current
    if (!el || !motionAllowed()) return
    let raf = 0
    run.current = () => {
      cancelAnimationFrame(raf)
      const t0 = performance.now()
      const step = now => {
        const p = Math.min(1, (now - t0) / duration)
        el.textContent = scrambleFrame(text, p * p * (3 - 2 * p)) // eased, never snaps
        if (p < 1) raf = requestAnimationFrame(step); else el.textContent = text
      }
      raf = requestAnimationFrame(step)
    }
    let io
    if (onView && 'IntersectionObserver' in window) {
      io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { run.current(); io.disconnect() } }, { threshold: 0.6 })
      io.observe(el)
    }
    return () => { cancelAnimationFrame(raf); io?.disconnect() }
  }, [text, duration, onView])

  return (
    <Tag className={className} onMouseEnter={hover ? () => run.current() : undefined}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" ref={vis}>{text}</span>
    </Tag>
  )
}
