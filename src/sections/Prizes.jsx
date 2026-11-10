import { useEffect, useRef, useState } from 'react'
import { content } from '../content.js'
import { ScrambleText } from '../components/ScrambleText.jsx'
import { motionAllowed } from '../lib/motion.js'
import { bus } from '../scene/bus.js'

const ORDER = [2, 1, 3]
const NAME = { 1: '1st', 2: '2nd', 3: '3rd' }

// "₹??,???" flickers to random digits now and then until the pool is announced.
function usePoolFlicker(active) {
  const [txt, setTxt] = useState('??,???')
  useEffect(() => {
    if (!active || !motionAllowed()) return
    let t
    const id = setInterval(() => {
      let s = ''; for (let i = 0; i < 5; i++) s += (Math.random() * 10) | 0
      setTxt(s.slice(0, 2) + ',' + s.slice(2)); t = setTimeout(() => setTxt('??,???'), 260)
    }, 2200)
    return () => { clearInterval(id); clearTimeout(t) }
  }, [active])
  return txt
}

export function Prizes({ winners }) {
  const byPlace = Object.fromEntries(winners.map(w => [w.place, w]))
  const pool = usePoolFlicker(!content.prizes.pool)
  const had = useRef(winners.length > 0)
  useEffect(() => { if (winners.length && !had.current) bus.pulse = 1; had.current = winners.length > 0 }, [winners.length])
  return (
    <section className="block" id="prizes">
      <p className="label">04 · Prizes</p>
      <ScrambleText as="h2" text="Worth the all-dayer." glitch />
      <div className="prize-grid">
        <div className="trophy-slot" id="trophySlot" aria-hidden="true" />
        <div className="card prize-card">
          {content.prizes.pool
            ? <div className="pool">{content.prizes.pool}</div>
            : <div className="pool" aria-label="Prize pool announcing soon"><span className="cur" aria-hidden="true">₹</span><span aria-hidden="true">{pool}</span></div>}
          {!content.prizes.pool && <p className="pool-sub">Prize pool announcing soon</p>}
          <div className="podium">
            {ORDER.map(p => (
              <div key={p} className={`pod${p < 3 ? ` p${p}` : ''}`}>
                <div className="r">{NAME[p]}</div>
                {byPlace[p]
                  ? <><div className="s team">{byPlace[p].team}</div>{byPlace[p].project && <div className="s proj">{byPlace[p].project}</div>}</>
                  : <div className="s">To be announced</div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
