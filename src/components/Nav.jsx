import { useState } from 'react'
import { RegisterButton } from './RegisterButton.jsx'

const LINKS = [['about', 'about'], ['domains', 'domains'], ['timeline', 'timeline'], ['prizes', 'prizes'], ['faq', 'faq'], ['contact', 'contact']]

export function Nav({ settings, onTerminal }) {
  const [open, setOpen] = useState(false)
  return (
    <nav className="top" aria-label="Main">
      <a className="logo" href="#top">HACKA<span>NOVA</span></a>
      <div className="nav-links">{LINKS.map(([id, l]) => <a key={id} href={`#${id}`}>{l}</a>)}</div>
      <div className="nav-right">
        <button className="term-btn" aria-label="Open terminal" onClick={onTerminal}>&gt;_</button>
        <RegisterButton settings={settings} label="Register" className="btn ghost reg" small />
        <button className="menu-btn" aria-expanded={open} aria-controls="mmenu" onClick={() => setOpen(o => !o)}>{open ? 'Close' : 'Menu'}</button>
      </div>
      {open && (
        <div id="mmenu" className="mmenu" onKeyDown={e => e.key === 'Escape' && setOpen(false)}>
          {LINKS.map(([id, l]) => <a key={id} href={`#${id}`} onClick={() => setOpen(false)}>{l}</a>)}
        </div>
      )}
    </nav>
  )
}
