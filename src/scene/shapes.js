// Pure geometry for the neural-net hero object (ported from concepts/e-morph.html buildNet).
const gauss = rnd => (rnd() + rnd() + rnd() - 1.5) / 1.5
const onSphere = rnd => {
  const u = rnd() * 2 - 1, t = rnd() * Math.PI * 2, s = Math.sqrt(1 - u * u)
  return [s * Math.cos(t), u, s * Math.sin(t)]
}

// 54 Fibonacci-sphere nodes (slightly jittered) + 10 inner nodes; each node links to its 3 nearest neighbours.
export function buildNet(R, rnd = Math.random) {
  const nodes = [], M = 54
  for (let i = 0; i < M; i++) {
    const y = 1 - ((i + 0.5) / M) * 2, rr = Math.sqrt(1 - y * y), th = i * 2.39996, j = 1 + gauss(rnd) * 0.06
    nodes.push([Math.cos(th) * rr * R * j, y * R * j, Math.sin(th) * rr * R * j])
  }
  for (let i = 0; i < 10; i++) { const d = onSphere(rnd), k = R * (0.2 + rnd() * 0.45); nodes.push(d.map(v => v * k)) }
  const edges = [], seen = new Set()
  nodes.forEach((a, i) => {
    nodes.map((b, j) => [j, (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2])
      .filter(x => x[0] !== i).sort((x, y) => x[1] - y[1]).slice(0, 3)
      .forEach(([j]) => { const key = i < j ? i + '-' + j : j + '-' + i; if (!seen.has(key)) { seen.add(key); edges.push([i, j]) } })
  })
  return { nodes, edges, R }
}

export function netLines({ nodes, edges }) {
  const out = new Float32Array(edges.length * 6)
  edges.forEach(([i, j], e) => { out.set(nodes[i], e * 6); out.set(nodes[j], e * 6 + 3) })
  return out
}

// 36% glow on nodes, 54% along edges (synapses), 10% fill the volume.
export function fillFromNet({ nodes, edges, R }, out, count, rnd = Math.random) {
  for (let i = 0; i < count; i++) {
    const r2 = rnd(); let p
    if (r2 < 0.36) { const nd = nodes[(rnd() * nodes.length) | 0], s = R * 0.035; p = [nd[0] + gauss(rnd) * s, nd[1] + gauss(rnd) * s, nd[2] + gauss(rnd) * s] }
    else if (r2 < 0.9) {
      const [ia, ib] = edges[(rnd() * edges.length) | 0], a = nodes[ia], b = nodes[ib], t = rnd(), s = R * 0.008
      p = [a[0] + (b[0] - a[0]) * t + gauss(rnd) * s, a[1] + (b[1] - a[1]) * t + gauss(rnd) * s, a[2] + (b[2] - a[2]) * t + gauss(rnd) * s]
    } else { const d = onSphere(rnd), k = R * Math.cbrt(rnd()) * 1.05; p = d.map(v => v * k) }
    out.set(p, i * 3)
  }
  return out
}
