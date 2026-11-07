import '@testing-library/jest-dom/vitest'

if (process.env.HN_TZ) process.env.TZ = process.env.HN_TZ

window.matchMedia ??= q => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {} })
