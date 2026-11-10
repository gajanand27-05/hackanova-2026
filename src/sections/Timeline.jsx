import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrambleText } from '../components/ScrambleText.jsx'
import { showTime, phaseAt, START, END } from '../lib/time.js'
import { motionAllowed } from '../lib/motion.js'

const ARC_D = 'M 50 300 Q 500 -150 950 300'
// quadratic Bézier fallback for environments without SVG geometry (tests); refined with getPointAtLength in the browser
const bez = f => { const u = 1 - f; return { x: u * u * 50 + 2 * u * f * 500 + f * f * 950, y: u * u * 300 + 2 * u * f * -150 + f * f * 300 } }

export function Timeline({ schedule, now }) {
  const path = useRef(null), listRef = useRef(null)
  const n = schedule.length
  const [pts, setPts] = useState(() => schedule.map((_, i) => bez(i / (n - 1))))
  const [p, setP] = useState(motionAllowed() ? 0 : 1)
  const phase = phaseAt(now), live = phase === 'live' || phase === 'judging'
  const here = Math.min(1, Math.max(0, (now - START) / (END - START)))

  useEffect(() => {
    const el = path.current
    if (!el || typeof el.getTotalLength !== 'function') return
    const len = el.getTotalLength()
    setPts(schedule.map((_, i) => { const q = el.getPointAtLength(len * i / (n - 1)); return { x: q.x, y: q.y } }))
    el.style.strokeDasharray = len
    el.style.strokeDashoffset = len * (1 - p)
    if (!motionAllowed()) return
    gsap.registerPlugin(ScrollTrigger)
    const st = ScrollTrigger.create({
      trigger: '#timeline .orbit', start: 'top 75%', end: 'bottom 55%', scrub: 0.6,
      onUpdate: s => { setP(s.progress); el.style.strokeDashoffset = len * (1 - s.progress) },
    })
    return () => st.kill()
  }, [n])

  const herePt = live && path.current?.getTotalLength ? path.current.getPointAtLength(path.current.getTotalLength() * here) : null
  return (
    <section className="block" id="timeline">
      <p className="label">03 · Timeline</p>
      <ScrambleText as="h2" text="One day. One orbit." glitch />
      <p className="lead">26 November 2026. Kickoff at 8 AM, code freezes at 6 PM sharp, and winners are crowned by 8 PM.</p>
      <div className="card orbit">
        <svg viewBox="0 0 1000 330" id="orbitSvg" aria-hidden="true">
          <defs>
            <linearGradient id="grad" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0" stopColor="#2ee6f0" /><stop offset=".55" stopColor="#4d7cff" /><stop offset="1" stopColor="#9a5cff" />
            </linearGradient>
          </defs>
          <path className="track" d={ARC_D} />
          <path className="draw" id="orbitPath" ref={path} d={ARC_D} />
          <g id="orbitNodes">
            {schedule.map((e, i) => {
              const on = p >= i / (n - 1) - 0.001, pt = pts[i]
              return (
                <g key={e.id} className={`node${e.accent === 'freeze' ? ' freeze' : ''}${e.time ? '' : ' tbc'}${on ? ' on' : ''}`}>
                  <circle className="halo" cx={pt.x} cy={pt.y} r="20" />
                  <circle className="dot" cx={pt.x} cy={pt.y} r="8" />
                  <text x={pt.x} y={pt.y - 24}>{showTime(e.time) ?? 'TBC'}</text>
                </g>
              )
            })}
          </g>
          {herePt && <circle className="you-are-here" cx={herePt.x} cy={herePt.y} r="11" />}
        </svg>
        <ol className="tl-list" id="tlList" ref={listRef} style={{ '--p': p.toFixed(3) }}>
          {schedule.map((e, i) => (
            <li key={e.id} className={`${e.accent === 'freeze' ? 'freeze' : ''}${e.time ? '' : ' tbc'}${p >= i / (n - 1) - 0.001 ? ' on' : ''}`}>
              <span className="t">{showTime(e.time) ?? 'TBC'}</span>
              <span className="e">{e.label ?? 'To be confirmed'}</span>
            </li>
          ))}
        </ol>
        <p className="tl-note">Code freezes at <b>6:00 PM sharp</b>. Submissions after code freeze aren’t judged. Other times are to be confirmed.</p>
      </div>
    </section>
  )
}
