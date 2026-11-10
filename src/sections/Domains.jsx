import { useState } from 'react'
import { content } from '../content.js'
import { ScrambleText } from '../components/ScrambleText.jsx'
import { bus } from '../scene/bus.js'

// C's row-fill hover; the hovered/focused/tapped row lights its particle cluster in the scene.
export function Domains() {
  const [open, setOpen] = useState(-1)
  const hot = i => { bus.hot = i; bus.hotOn = 1 }
  const cold = i => { if (bus.hot === i) bus.hotOn = 0 }
  return (
    <section className="block" id="domains">
      <p className="label">02 · Domains</p>
      <ScrambleText as="h2" text="Pick your orbit." glitch />
      <p className="lead">Seven problem spaces. Choose one and build something that matters.</p>
      <ul className="dlist" id="domList">
        {content.domains.map((d, i) => (
          <li key={d.id} className={`drow${open === i ? ' open' : ''}`} tabIndex={0}
            onPointerEnter={e => e.pointerType === 'mouse' && hot(i)}
            onPointerLeave={e => e.pointerType === 'mouse' && cold(i)}
            onFocus={() => hot(i)} onBlur={() => { setOpen(-1); cold(i) }}
            onClick={e => { if (e.nativeEvent.pointerType === 'mouse') return; setOpen(o => (o === i ? -1 : i)); hot(i) }}>
            <span className="d-idx">{String(i + 1).padStart(2, '0')}</span>
            <div className="d-main">
              <ScrambleText as="h3" className="d-name" text={d.name} onView={false} duration={520} />
              <p className="d-desc">{d.desc}</p>
            </div>
            <span className="d-slot" aria-hidden="true" />
          </li>
        ))}
      </ul>
    </section>
  )
}
