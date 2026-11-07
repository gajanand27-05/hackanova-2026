import { useEffect, useState } from 'react'
import { clock } from '../lib/time.js'

export function useNow() {
  const [now, setNow] = useState(() => clock.now())
  useEffect(() => {
    const id = setInterval(() => setNow(clock.now()), 1000)
    return () => clearInterval(id)
  }, [])
  return now
}
