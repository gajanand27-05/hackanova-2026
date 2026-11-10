import { buildNet, fillFromNet, netLines } from './shapes.js'

const seeded = (s = 1) => () => (s = (s * 16807) % 2147483647) / 2147483647

test('net: 54 surface nodes on the sphere plus 10 inner nodes, edges link valid nodes', () => {
  const net = buildNet(10, seeded())
  expect(net.nodes).toHaveLength(64)
  for (const [x, y, z] of net.nodes.slice(0, 54)) expect(Math.hypot(x, y, z)).toBeGreaterThan(8.5)
  for (const [x, y, z] of net.nodes.slice(54)) expect(Math.hypot(x, y, z)).toBeLessThan(7)
  expect(net.edges.length).toBeGreaterThan(64)
  for (const [i, j] of net.edges) { expect(i).not.toBe(j); expect(net.nodes[i]).toBeDefined(); expect(net.nodes[j]).toBeDefined() }
})

test('fillFromNet writes count*3 finite floats inside the net radius', () => {
  const net = buildNet(10, seeded(7)), out = new Float32Array(4000 * 3)
  fillFromNet(net, out, 4000, seeded(9))
  expect(out.every(Number.isFinite)).toBe(true)
  let max = 0
  for (let i = 0; i < out.length; i += 3) max = Math.max(max, Math.hypot(out[i], out[i + 1], out[i + 2]))
  expect(max).toBeGreaterThan(5)
  expect(max).toBeLessThan(13)
})

test('netLines has two endpoints per edge', () => {
  const net = buildNet(10, seeded(3))
  expect(netLines(net)).toHaveLength(net.edges.length * 6)
})
