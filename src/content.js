// Single source of truth for all site copy. null = not confirmed yet → the site shows a placeholder badge.
// Organiser updates go HERE (except the /admin quick-update fields, whose defaults also live here).
export const EVENT = {
  name: 'HACKANOVA 2026',
  tagline: '12 hours. One explosion of ideas.',
  startISO: '2026-11-26T08:00:00+05:30',
  freezeISO: '2026-11-26T18:00:00+05:30',
  endISO: '2026-11-26T20:00:00+05:30',
  dateLabel: '26 Nov 2026 · 8 AM–8 PM IST',
  venue: 'KNS Institute of Technology, Bengaluru',
  organiser: 'Department of Artificial Intelligence & Machine Learning, KNSIT',
  prodUrl: 'https://hackanova2026.pages.dev/',
}

export const content = {
  // /admin quick-update defaults (Supabase overrides these when reachable)
  unstopUrl: null,              // organisers send by 13 Nov
  registeredCount: null,
  registrationsClosed: false,

  teamSize: null,
  eligibility: null,
  expectedParticipants: '200+',

  about: [
    'HACKANOVA is a 12-hour inter-college hackathon where student teams turn raw ideas into working prototypes, from first commit to final demo, in a single day.',
    'Hosted by the Department of Artificial Intelligence & Machine Learning at KNS Institute of Technology, Bengaluru. Bring your team, your laptop and your wildest idea.',
  ],

  // Descriptions are draft copy: organisers to approve.
  domains: [
    { id: 'aiml', name: 'AI / ML', desc: 'Models, agents and intelligent tools.' },
    { id: 'health', name: 'Healthcare', desc: 'Diagnostics, access and wellbeing.' },
    { id: 'fintech', name: 'FinTech', desc: 'Payments, inclusion and money made simple.' },
    { id: 'smart', name: 'Smart Cities', desc: 'Mobility, safety and urban systems.' },
    { id: 'edu', name: 'Education', desc: 'Learning that adapts and includes.' },
    { id: 'agri', name: 'Agriculture', desc: 'Farms, food and supply chains.' },
    { id: 'sustain', name: 'Sustainability', desc: 'Climate, energy and circular living.' },
  ],

  // fixed: true = confirmed. Non-fixed slots are filled from /admin (site_settings.schedule[id]).
  schedule: [
    { id: 'kickoff', time: '08:00', label: 'Kickoff & inauguration', fixed: true },
    { id: 'slot2', time: null, label: null, fixed: false },
    { id: 'slot3', time: null, label: null, fixed: false },
    { id: 'freeze', time: '18:00', label: 'Code freeze · submissions close', fixed: true, accent: 'freeze' },
    { id: 'judging', time: '18:00–20:00', label: 'Judging', fixed: true },
    { id: 'results', time: '20:00', label: 'Results & prizes', fixed: true },
  ],

  prizes: { pool: null, tiers: [{ place: 1, amount: null }, { place: 2, amount: null }, { place: 3, amount: null }] },
  perks: [],                    // e.g. { title: 'Certificates', desc: '…' }, only once confirmed
  rules: {
    eligibility: null,
    teamSize: null,
    submission: null,
    codeOfConduct: null,
  },
  judgingCriteria: [],          // e.g. { name: 'Innovation', weight: 30 }
  judges: [],                   // { name, role, photo }
  sponsors: [],                 // { name, tier, logo, url }
  sponsorContactEmail: null,
  venue: {
    name: 'KNS Institute of Technology, Bengaluru',
    address: null,
    directions: null,           // { metro, bus, cab }
    reportingTime: null,
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=KNS+Institute+of+Technology+Bengaluru',
    embedUrl: 'https://www.google.com/maps?q=KNS+Institute+of+Technology+Bengaluru&output=embed',
  },
  // Draft FAQs: answers only use confirmed facts; organisers to approve.
  faqs: [
    { q: 'When and where is HACKANOVA?', a: '26 November 2026, 8:00 AM to 8:00 PM IST, at KNS Institute of Technology, Bengaluru.' },
    { q: 'How do I register?', a: 'Registration and team formation happen on Unstop. Use any Register button on this site.' },
    { q: 'When do I have to submit?', a: 'Code freezes at 6:00 PM sharp. Submissions after that are not judged.' },
    { q: 'What can we build?', a: 'Anything within one of the seven domains: AI / ML, Healthcare, FinTech, Smart Cities, Education, Agriculture or Sustainability.' },
    { q: 'How big can a team be?', a: null },
    { q: 'Who can participate?', a: null },
    { q: 'Is there a registration fee?', a: null },
    { q: 'What should I bring?', a: null },
  ],
  contacts: {
    faculty: [],                // { name, role, email, phone }, official college contacts only
    students: [],               // { name, role, email, phone, consent }, phone shown only if consent === true
  },
  socials: [],                  // { label, url }
  brochureUrl: null,            // '/brochure.pdf' once Task 14 ships it
}
