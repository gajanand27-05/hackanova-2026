import { useEffect, useState } from 'react'
import { getClient } from '../lib/supabase.js'
import { Login } from './Login.jsx'
import { AnnouncementsTab } from './AnnouncementsTab.jsx'
import { QuickUpdatesTab } from './QuickUpdatesTab.jsx'
import { WinnersTab } from './WinnersTab.jsx'
import './admin.css'

const TABS = [['ann', 'Announcements', AnnouncementsTab], ['quick', 'Quick updates', QuickUpdatesTab], ['win', 'Winners', WinnersTab]]

export default function Admin() {
  const [client, setClient] = useState(null)
  const [session, setSession] = useState(undefined)
  const [tab, setTab] = useState('ann')
  const [err, setErr] = useState(null)

  useEffect(() => {
    const m = document.createElement('meta'); m.name = 'robots'; m.content = 'noindex, nofollow'; document.head.append(m)
    document.title = 'HACKANOVA admin'
    let sub
    getClient().then(c => {
      setClient(c)
      c.auth.getSession().then(({ data }) => setSession(data.session))
      sub = c.auth.onAuthStateChange((_e, s) => setSession(s)).data.subscription
    }).catch(() => setErr('Admin backend unreachable. Post the message in the participants’ WhatsApp group instead.'))
    return () => { sub?.unsubscribe(); m.remove() }
  }, [])

  if (err) return <main className="admin"><p className="err">{err}</p></main>
  if (!client || session === undefined) return <main className="admin"><p>Loading…</p></main>
  if (!session) return <main className="admin"><Login client={client} /></main>
  const Active = TABS.find(t => t[0] === tab)[2]
  return (
    <main className="admin">
      <header>
        <b>HACKANOVA admin</b>
        <span>{session.user.email}</span>
        <button onClick={() => client.auth.signOut()}>Log out</button>
      </header>
      <nav role="tablist" aria-label="Admin sections">
        {TABS.map(([id, label]) => <button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)}>{label}</button>)}
      </nav>
      <Active client={client} />
    </main>
  )
}
