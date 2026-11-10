import { useEffect, useState } from 'react'
import { content } from '../content.js'
import { write } from './write.js'

const OPEN = content.schedule.filter(e => !e.fixed)

export function QuickUpdatesTab({ client }) {
  const [s, setS] = useState(null), [msg, setMsg] = useState(null)
  useEffect(() => {
    client.from('site_settings').select('*').eq('id', 1).single()
      .then(({ data, error }) => (error ? setMsg(error.message) : setS(data)))
  }, [])
  if (!s) return <p>{msg ?? 'Loading…'}</p>

  const set = patch => setS(v => ({ ...v, ...patch }))
  const setSlot = (id, k, v) => set({ schedule: { ...s.schedule, [id]: { ...(s.schedule?.[id] ?? {}), [k]: v || null } } })
  async function save(e) {
    e.preventDefault()
    if (s.unstop_url && !s.unstop_url.startsWith('https://unstop.com/')) return setMsg('Link must start with https://unstop.com/')
    const err = await write(client.from('site_settings').update({
      unstop_url: s.unstop_url || null,
      registered_count: s.registered_count === '' || s.registered_count == null ? null : Number(s.registered_count),
      registrations_closed: s.registrations_closed,
      schedule: s.schedule,
      updated_at: new Date().toISOString(),
    }).eq('id', 1))
    setMsg(err ?? 'Saved. The site updates within seconds.')
  }
  return (
    <form className="tab" onSubmit={save}>
      <label>Unstop link<input type="url" value={s.unstop_url ?? ''} onChange={e => set({ unstop_url: e.target.value })} placeholder="https://unstop.com/…" /></label>
      <p className="hint">Also tell the developer, so the backup copy in the code matches.</p>
      <label>Registered count<input type="number" min="0" inputMode="numeric" value={s.registered_count ?? ''} onChange={e => set({ registered_count: e.target.value })} /></label>
      <label className="check"><input type="checkbox" checked={s.registrations_closed} onChange={e => set({ registrations_closed: e.target.checked })} /> Registrations closed</label>
      <fieldset>
        <legend>“To be confirmed” schedule slots (IST, 24 h)</legend>
        {OPEN.map(e => (
          <div key={e.id} className="slot">
            <input aria-label={`${e.id} time`} type="time" value={s.schedule?.[e.id]?.time ?? ''} onChange={ev => setSlot(e.id, 'time', ev.target.value)} />
            <input aria-label={`${e.id} label`} value={s.schedule?.[e.id]?.label ?? ''} onChange={ev => setSlot(e.id, 'label', ev.target.value)} placeholder="What happens" />
          </div>
        ))}
      </fieldset>
      <button>Save</button>
      {msg && <p role="status" className="status">{msg}</p>}
    </form>
  )
}
