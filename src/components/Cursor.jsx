import { useEffect, useRef } from 'react'
import { isFinePointer, motionAllowed } from '../lib/motion.js'

// Decorative only: sits on top of the real cursor, which always stays visible.
export function Cursor() {
  const ref = useRef(null)
  useEffect(() => {
    if (!isFinePointer() || !motionAllowed()) return
    const el = ref.current; el.style.display = 'block'
    let x = innerWidth / 2, y = innerHeight / 2, tx = x, ty = y, raf = 0
    const move = e => {
      tx = e.clientX; ty = e.clientY
      el.classList.toggle('grow', !!e.target.closest?.('a,button,[role="button"],.drow'))
    }
    const loop = () => {
      x += (tx - x) * 0.18; y += (ty - y) * 0.18
      el.style.transform = `translate3d(${x}px,${y}px,0) translate(-50%,-50%)`
      raf = requestAnimationFrame(loop)
    }
    addEventListener('pointermove', move, { passive: true }); loop()
    return () => { removeEventListener('pointermove', move); cancelAnimationFrame(raf) }
  }, [])
  return <div ref={ref} className="cursor" aria-hidden="true" style={{ display: 'none' }} />
}
