import { content, EVENT } from '../content.js'
import { countdownAt, showTime } from './time.js'

const pad = n => String(n).padStart(2, '0')
const L = (text, cls = '') => ({ text, cls })
export const CHIPS = ['help', 'schedule', 'domains', 'prizes', 'register', 'countdown']

export function isTypingTarget(el) {
  return !!el && (['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName) || !!el.isContentEditable)
}

// Pure: returns lines to print (+ an optional action for the UI). ctx = { now, settings }.
export function runCommand(input, { now, settings }) {
  const cmd = input.trim().toLowerCase().split(/\s+/)[0]
  switch (cmd) {
    case '': return { lines: [] }
    case 'help': return { lines: [L('available commands:', 'ok'), L('  schedule   26 nov timeline\n  domains    the 7 problem spaces\n  prizes     what is up for grabs\n  register   how to sign up\n  countdown  time to the next moment\n  about      what is hackanova\n  clear      wipe the screen\n  exit       close terminal')] }
    case 'about': return { lines: [L(`${EVENT.name}: 12-hour inter-college hackathon.\nDept. of AI & ML · ${EVENT.venue}.\n26 Nov 2026 · 8 AM–8 PM IST · code freeze 6 PM.`)] }
    case 'domains': return { lines: content.domains.map((d, i) => L(`  [${pad(i + 1)}] ${d.name}  ${d.desc}`)) }
    case 'schedule':
    case 'timeline': return { lines: settings.schedule.map(e => L(`  ${(showTime(e.time) ?? 'TBC').padEnd(14)}${e.label ?? 'To be confirmed'}`, e.accent === 'freeze' ? 'warn' : e.time ? '' : 'mute')) }
    case 'prizes': return { lines: [L(content.prizes.pool ? `prize pool: ${content.prizes.pool}` : 'prize pool: announcing soon. stay tuned.', 'ok')] }
    case 'countdown': { const c = countdownAt(now); return { lines: [L(c.phase === 'ended' ? 'that’s a wrap. thank you, hackers!' : `${c.label}: ${c.d}d ${pad(c.h)}h ${pad(c.m)}m ${pad(c.s)}s`, 'ok')] } }
    case 'register':
      if (settings.registrationsClosed) return { lines: [L('registrations are closed. see you on 26 nov!', 'warn')] }
      if (!settings.unstopUrl) return { lines: [L('registration + team formation → Unstop', 'ok'), L('link opening soon. watch this space.', 'mute')] }
      return { lines: [L('opening Unstop…', 'ok')], action: 'register' }
    case 'sudo': return { lines: [L('[sudo] password for hacker: ********', 'mute'), L('hacker is not in the sudoers file. this incident will be reported to the judges.', 'warn')] }
    case 'hack': return { lines: [L('bypassing firewall… just kidding. build something real on 26 nov.', 'ok')] }
    case 'nova': return { lines: [L('✦ 12 hours. one explosion of ideas.', 'ok')] }
    case 'clear': return { lines: [], action: 'clear' }
    case 'exit': return { lines: [], action: 'close' }
    default: return { lines: [L(`${cmd}: command not found. try "help".`, 'warn')] }
  }
}
