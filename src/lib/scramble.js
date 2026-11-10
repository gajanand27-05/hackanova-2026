const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+=/<>'
// Characters left of `progress` are settled; the rest are random glyphs. Spaces stay spaces.
export function scrambleFrame(text, progress, rand = Math.random) {
  const settled = Math.floor(text.length * Math.min(1, Math.max(0, progress)))
  let out = ''
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    out += i < settled || ch === ' ' ? ch : GLYPHS[Math.floor(rand() * GLYPHS.length)]
  }
  return out
}
