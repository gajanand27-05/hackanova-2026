import '@testing-library/jest-dom/vitest'

window.matchMedia ??= q => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {} })
