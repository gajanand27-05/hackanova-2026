// Run with: npm run test:rls   (needs code/.env.test, which is gitignored)
// .env.test: SUPABASE_URL, SUPABASE_ANON_KEY, ADMIN_EMAIL, ADMIN_PASSWORD, NONADMIN_EMAIL, NONADMIN_PASSWORD
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createClient } from '@supabase/supabase-js'

const env = process.env
const fresh = () => createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, { auth: { persistSession: false } })
async function signedIn(email, password) {
  const c = fresh()
  const { error } = await c.auth.signInWithPassword({ email, password })
  assert.equal(error, null, `login failed for ${email}`)
  return c
}

test('anonymous visitors can read settings and announcements', async () => {
  const c = fresh()
  const s = await c.from('site_settings').select('*').eq('id', 1).single()
  assert.equal(s.error, null); assert.equal(s.data.id, 1)
  assert.equal((await c.from('announcements').select('id').limit(1)).error, null)
})

test('anonymous visitors cannot write anything', async () => {
  const c = fresh()
  assert.ok((await c.from('announcements').insert({ body: 'hack' })).error)
  const upd = await c.from('site_settings').update({ registrations_closed: true }).eq('id', 1).select()
  assert.ok(upd.error || upd.data.length === 0)
  assert.ok((await c.from('winners').insert({ place: 1, team: 'x' })).error)
})

test('admins table is invisible to the API', async () => {
  const { data, error } = await fresh().from('admins').select('*')
  assert.ok(error || data.length === 0)
})

test('public sign-up is disabled', async () => {
  const { error } = await fresh().auth.signUp({ email: `probe-${Date.now()}@example.com`, password: 'Probe-12345678!' })
  assert.ok(error, 'sign-up should be refused')
})

test('a logged-in non-admin cannot write', async () => {
  const c = await signedIn(env.NONADMIN_EMAIL, env.NONADMIN_PASSWORD)
  assert.ok((await c.from('announcements').insert({ body: 'not allowed' })).error)
  const upd = await c.from('site_settings').update({ registered_count: 999 }).eq('id', 1).select()
  assert.ok(upd.error || upd.data.length === 0)
})

test('unpublished winners are hidden from the public, visible to admins', async () => {
  const admin = await signedIn(env.ADMIN_EMAIL, env.ADMIN_PASSWORD)
  await admin.from('site_settings').update({ winners_published: false }).eq('id', 1)
  await admin.from('winners').upsert({ place: 3, team: 'RLS test team' })
  const pub = await fresh().from('winners').select('*')
  assert.equal(pub.error, null); assert.equal(pub.data.length, 0)
  const priv = await admin.from('winners').select('*').eq('place', 3)
  assert.equal(priv.data.length, 1)
  await admin.from('winners').delete().eq('place', 3)
})

test('an admin can post and delete an announcement', async () => {
  const admin = await signedIn(env.ADMIN_EMAIL, env.ADMIN_PASSWORD)
  const ins = await admin.from('announcements').insert({ body: 'RLS test, please ignore' }).select().single()
  assert.equal(ins.error, null)
  assert.equal((await admin.from('announcements').delete().eq('id', ins.data.id)).error, null)
})
