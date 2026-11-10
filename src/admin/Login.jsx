import { useState } from 'react'

export function Login({ client }) {
  const [email, setEmail] = useState(''), [password, setPassword] = useState('')
  const [err, setErr] = useState(null), [busy, setBusy] = useState(false)
  async function submit(e) {
    e.preventDefault(); setBusy(true); setErr(null)
    const { error } = await client.auth.signInWithPassword({ email, password })
    setBusy(false)
    if (error) setErr('Login failed. Check email and password.')
  }
  return (
    <form className="login" onSubmit={submit}>
      <h1>Coordinator login</h1>
      <label>Email<input type="email" autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} required /></label>
      <label>Password<input type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} required /></label>
      {err && <p className="err" role="alert">{err}</p>}
      <button className="primary" disabled={busy}>{busy ? 'Logging in…' : 'Log in'}</button>
    </form>
  )
}
