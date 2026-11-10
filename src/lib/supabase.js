let p = null
export function getClient() {
  p ??= import('@supabase/supabase-js').then(({ createClient }) => {
    const url = import.meta.env.VITE_SUPABASE_URL, key = import.meta.env.VITE_SUPABASE_ANON_KEY
    if (!url || !key) throw new Error('supabase env missing')
    return createClient(url, key, { auth: { persistSession: location.pathname.startsWith('/admin') } })
  })
  return p
}
