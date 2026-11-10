import { motionAllowed, systemReducesMotion, optInMotion } from '../lib/motion.js'

export function MotionPill() {
  if (!systemReducesMotion() || motionAllowed()) return null
  return (
    <button className="motion-pill" onClick={() => { optInMotion(); location.reload() }}>
      Reduced motion is on in your system · ▶ Play animations
    </button>
  )
}
