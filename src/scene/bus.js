// Shared mutable state: React writes, the render loop reads. No React state, so no re-renders.
export const bus = { pulse: 0, scatter: 0, hot: -1, hotOn: 0, px: -1e4, py: -1e4 }
