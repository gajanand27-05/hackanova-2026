// RLS doesn't error when a non-admin writes: the write just matches 0 rows. Ask for the changed
// rows back and treat "no error, 0 rows" as a failure, so the UI never claims a save that didn't happen.
export const NOT_ADMIN = 'Not saved: this account is not on the admin list. Add it to public.admins in the Supabase SQL Editor.'

export async function write(query) {
  const { data, error } = await query.select()
  if (error) return `Not saved: ${error.message}`
  if (!data || (Array.isArray(data) && data.length === 0)) return NOT_ADMIN
  return null
}
