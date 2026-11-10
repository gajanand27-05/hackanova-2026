import { useEffect, useState } from 'react'
import { write } from './write.js'

const EMPTY = [1, 2, 3].map(place => ({ place, team: '', project: '' }))
const NAME = ['1st', '2nd', '3rd']

// Save privately → Publish (with confirm) right after the 8 PM ceremony → Unpublish if needed.
export function WinnersTab({ client }) {
  const [rows, setRows] = useState(EMPTY), [published, setPublished] = useState(false)
  const [confirming, setConfirming] = useState(false), [msg, setMsg] = useState(null)
  useEffect(() => {
    client.from('winners').select('*').order('place')
      .then(({ data }) => data?.length && setRows(EMPTY.map(e => ({ ...e, ...(data.find(d => d.place === e.place) ?? {}) }))))
    client.from('site_settings').select('*').eq('id', 1).single().then(({ data }) => setPublished(!!data?.winners_published))
  }, [])

  const edit = (place, k, v) => setRows(r => r.map(x => (x.place === place ? { ...x, [k]: v } : x)))
  async function save() {
    const filled = rows.filter(r => r.team.trim()).map(r => ({ place: r.place, team: r.team.trim(), project: (r.project ?? '').trim() || null }))
    if (!filled.length) return setMsg('Enter at least one team name.')
    const err = await write(client.from('winners').upsert(filled))
    setMsg(err ?? 'Saved privately. Not visible on the site until you publish.')
  }
  async function setPub(value) {
    const err = await write(client.from('site_settings').update({ winners_published: value, updated_at: new Date().toISOString() }).eq('id', 1))
    if (err) { setConfirming(false); return setMsg(err) }
    setPublished(value); setConfirming(false); setMsg(value ? 'Published! Winners are live on the site.' : 'Unpublished. Winners are hidden again.')
  }
  return (
    <section className="tab">
      <p>Status: <b className={published ? 'live' : ''}>{published ? 'PUBLISHED (everyone can see)' : 'Private (only admins)'}</b></p>
      {rows.map(r => (
        <fieldset key={r.place}>
          <legend>{NAME[r.place - 1]} place</legend>
          <input aria-label={`place ${r.place} team`} value={r.team} onChange={e => edit(r.place, 'team', e.target.value)} placeholder="Team name" />
          <input aria-label={`place ${r.place} project`} value={r.project ?? ''} onChange={e => edit(r.place, 'project', e.target.value)} placeholder="Project (optional)" />
        </fieldset>
      ))}
      <div className="row">
        <button onClick={save}>Save privately</button>
        {!published && !confirming && <button className="primary" onClick={() => setConfirming(true)}>Publish…</button>}
        {published && <button onClick={() => setPub(false)}>Unpublish</button>}
      </div>
      {confirming && (
        <div role="alertdialog" aria-label="Confirm publish" className="confirm">
          <p>Publish winners to everyone now? Only do this after the ceremony.</p>
          <button className="primary" onClick={() => setPub(true)}>Yes, publish now</button>
          <button onClick={() => setConfirming(false)}>Cancel</button>
        </div>
      )}
      {msg && <p role="status" className="status">{msg}</p>}
    </section>
  )
}
