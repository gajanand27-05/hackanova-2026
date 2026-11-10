import { useState } from 'react'
import { bus } from '../scene/bus.js'

const Arrow = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
)

export function RegisterButton({ settings, label = 'Register on Unstop', className = 'btn reg', small = false }) {
  const [toast, setToast] = useState(false)
  const hover = () => { bus.pulse = Math.max(bus.pulse, 0.35) }
  const cls = `${className}${small ? ' sm' : ''}`
  if (settings.registrationsClosed)
    return <button className={`${cls} is-closed`} disabled>Registrations closed</button>
  if (!settings.unstopUrl)
    return (
      <>
        <button className={cls} onMouseEnter={hover}
          onClick={() => { bus.pulse = 1; setToast(true); setTimeout(() => setToast(false), 2600) }}>
          {small ? 'Opening soon' : 'Registration opening soon'}
        </button>
        {toast && <div className="toast show" role="status">Unstop registration link drops soon ✦</div>}
      </>
    )
  return (
    <a className={cls} href={settings.unstopUrl} target="_blank" rel="noopener noreferrer" onMouseEnter={hover} onClick={() => { bus.pulse = 1 }}>
      {label} {!small && <Arrow />}
    </a>
  )
}
