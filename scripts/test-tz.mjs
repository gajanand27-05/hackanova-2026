// Runs the test suite under two device timezones; all event logic must be TZ-independent.
import { spawnSync } from 'node:child_process'

for (const TZ of ['America/New_York', 'Asia/Kolkata']) {
  console.log(`\n== TZ=${TZ} ==`)
  const r = spawnSync('npx', ['vitest', 'run'], { stdio: 'inherit', shell: true, env: { ...process.env, TZ } })
  if (r.status !== 0) process.exit(r.status ?? 1)
}
