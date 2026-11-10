import { content } from '../content.js'
import { ScrambleText } from '../components/ScrambleText.jsx'
import { Placeholder } from '../components/Placeholder.jsx'

// Faculty use official college contacts. A student's phone shows only with their written consent.
function Person({ p, allowPhone }) {
  const phone = allowPhone && p.phone
  return (
    <li className="card person">
      <b>{p.name}</b><span className="role">{p.role}</span>
      {p.email && <a href={`mailto:${p.email}`}>{p.email}</a>}
      {phone && (
        <span className="row">
          <a className="btn sm" href={`tel:${p.phone}`} aria-label={`Call ${p.name}`}>Call</a>
          <a className="btn ghost sm" href={`https://wa.me/${p.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" aria-label={`WhatsApp ${p.name}`}>WhatsApp</a>
        </span>
      )}
    </li>
  )
}

export function Contact({ faculty = content.contacts.faculty, students = content.contacts.students }) {
  const none = !faculty.length && !students.length
  return (
    <section className="block" id="contact">
      <p className="label">Contact</p>
      <ScrambleText as="h2" text="Talk to mission control." glitch />
      {none ? <Placeholder>Coordinators announcing soon</Placeholder> : (
        <ul className="people">
          {faculty.map(p => <Person key={p.email ?? p.name} p={p} allowPhone />)}
          {students.map(p => <Person key={p.email ?? p.name} p={p} allowPhone={p.consent === true} />)}
        </ul>
      )}
    </section>
  )
}
