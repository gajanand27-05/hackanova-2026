import { useEffect, useState } from 'react'
import { write } from './write.js'

const MAX = 280

export function AnnouncementsTab({ client }) {
  const [body, setBody] = useState(''), [urgent, setUrgent] = useState(false)
  const [list, setList] = useState([]), [msg, setMsg] = useState(null), [busy, setBusy] = useState(false)
  const load = () => client.from('announcements').select('*').order('created_at', { ascending: false })
    .then(({ data, error }) => (error ? setMsg(error.message) : setList(data ?? [])))
  useEffect(() => { load() }, [])

  async function post(e) {
    e.preventDefault(); setBusy(true)
    const err = await write(client.from('announcements').insert({ body: body.trim(), level: urgent ? 'urgent' : 'normal' }))
    setBusy(false)
    if (err) return setMsg(err.replace('Not saved', 'Not posted'))
    setBody(''); setUrgent(false); setMsg('Posted. It is live on the site.'); load()
  }
  async function remove(id) {
    if (!window.confirm('Delete this announcement from the site?')) return
    const err = await write(client.from('announcements').delete().eq('id', id))
    err ? setMsg(err.replace('Not saved', 'Not deleted')) : load()
  }
  const len = body.trim().length
  return (
    <section className="tab">
      <form onSubmit={post}>
        <label>Message<textarea value={body} onChange={e => setBody(e.target.value)} rows={3} /></label>
        <p className={len > MAX ? 'err' : 'hint'}>{len}/{MAX}</p>
        <label className="check"><input type="checkbox" checked={urgent} onChange={e => setUrgent(e.target.checked)} /> Urgent (shows in hot pink)</label>
        <button disabled={busy || !len || len > MAX}>{busy ? 'Posting…' : 'Post'}</button>
      </form>
      {msg && <p role="status" className="status">{msg}</p>}
      <h2>Posted ({list.length})</h2>
      <ul className="ann-list">
        {list.map(a => (
          <li key={a.id} className={a.level}>
            <span>{a.body}</span>
            <time>{new Date(a.created_at).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: 'numeric', minute: '2-digit' })}</time>
            <button onClick={() => remove(a.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </section>
  )
}
