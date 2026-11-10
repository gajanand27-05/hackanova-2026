import { content } from '../content.js'
import { ScrambleText } from '../components/ScrambleText.jsx'
import { Placeholder } from '../components/Placeholder.jsx'

export function Judges() {
  const list = content.judges
  return (
    <section className="block" id="judges">
      <p className="label">Judges &amp; mentors</p>
      <ScrambleText as="h2" text="The people in the room." glitch />
      {list.length ? (
        <ul className="judge-grid">{list.map(j => <li key={j.name} className="card"><img src={j.photo} alt="" loading="lazy" /><b>{j.name}</b><span>{j.role}</span></li>)}</ul>
      ) : (
        <>
          <Placeholder>Revealing soon</Placeholder>
          <ul className="judge-grid ghosts" aria-hidden="true">{[0, 1, 2, 3].map(i => <li key={i} className="card silhouette" />)}</ul>
        </>
      )}
    </section>
  )
}
