// Runs the test suite under two device timezones; all event logic must be TZ-independent.
// HN_TZ is applied inside the test process (src/test-setup.js) because Git Bash on Windows strips TZ.
import { spawnSync } from 'node:child_process'

for (const tz of ['America/New_York', 'Asia/Kolkata']) {
  console.log(`\n== TZ=${tz} ==`)
  const r = spawnSync('npx', ['vitest', 'run'], { stdio: 'inherit', shell: true, env: { ...process.env, HN_TZ: tz } })
  if (r.status !== 0) process.exit(r.status ?? 1)
}
