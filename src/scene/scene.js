// Particle scene ported from concepts/e-morph.html (concept E), neural-net hero only.
// Stages (scroll-driven): 0 net hero → 1 burst/starfield → 2 domain clusters → 3 timeline arc → 4 trophy → 5 net at the final CTA.
// Reads the scene DOM contract ids; talks to React only through `bus`.
import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'
import { bus } from './bus.js'
import { buildNet, fillFromNet, netLines } from './shapes.js'

const VERT = /* glsl */`
  uniform float uTime, uM, uCollapse, uFinal, uScatter, uPulse, uHot, uHotAmt, uSize, uPR;
  uniform vec3 uOffA, uOffB, uMouse;
  attribute vec3 aHero, aBurst, aConst, aArc, aTrophy, aColor;
  attribute float aRand, aClus;
  varying vec3 vColor; varying float vAlpha;
  float ease(float t){ t = clamp(t, 0., 1.); return t < .5 ? 4.*t*t*t : 1. - pow(-2.*t + 2., 3.) / 2.; }
  float seg(float f){ return ease((f - aRand * .25) / .75); }
  vec3 rotY(vec3 p, float a){ float c = cos(a), s = sin(a); return vec3(c*p.x + s*p.z, p.y, -s*p.x + c*p.z); }
  vec3 hero(){ return rotY(aHero, uTime * .25); }
  vec3 tgt(float s){
    if (s < .5) return hero();
    if (s < 1.5) return aBurst;
    if (s < 2.5) return aConst;
    if (s < 3.5) return aArc;
    if (s < 4.5) return aTrophy;
    return hero() * uFinal;
  }
  void main(){
    float m = clamp(uM, 0., 5.);
    float fl = floor(min(m, 4.999));
    float e = seg(m - fl);
    vec3 A = tgt(fl), B = tgt(fl + 1.);
    float hot = 0.;
    if (fl < .5) {
      // implode into a white-hot core before the burst
      float k = clamp(uCollapse * (1. + aRand * .3), 0., 1.);
      A = mix(A, A * .03, k * k);
      hot = k * (1. - e);
    }
    vec3 p = mix(A + uOffA, B + uOffB, e);
    if (fl < .5) p += normalize(aBurst + vec3(.001)) * sin(e * 3.14159) * (1.2 + aRand * 2.5);
    float bursty = max(0., 1. - abs(m - 1.));
    float heroness = (1. - clamp(m, 0., 1.)) * (1. - uCollapse) + clamp(m - 4., 0., 1.);
    p += vec3(sin(uTime * .6 + aRand * 40.), cos(uTime * .5 + aRand * 30.), sin(uTime * .4 + aRand * 20.)) * (.01 + .07 * bursty);
    vec3 sc = vec3(fract(sin(aRand * 91.7) * 437.5), fract(sin(aRand * 53.3) * 921.1), fract(sin(aRand * 17.9) * 613.7)) - .5;
    p += sc * uScatter * heroness * .9;
    vec2 d = p.xy - uMouse.xy; float dl = length(d);
    p.xy += (d / max(dl, 1e-4)) * (1. - smoothstep(0., uMouse.z, dl)) * heroness * uMouse.z * .45;
    float cl = max(0., 1. - abs(m - 2.));
    float hc = (1. - step(.5, abs(aClus - uHot))) * uHotAmt * cl;
    vec4 mv = modelViewMatrix * vec4(p, 1.);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * (.35 + aRand * 1.1) * (1. + hot * 1.8 + uPulse * .6 + hc * 1.4) * uPR * (10. / max(.5, -mv.z));
    vColor = mix(aColor, vec3(1., .97, .92), clamp(hot * .85 + hc * .7, 0., 1.));
    float tw = .55 + .45 * sin(uTime * (1.5 + aRand * 3.) + aRand * 80.);
    vAlpha = mix(tw, .95, clamp(heroness + hc, 0., 1.));
  }`

const FRAG = /* glsl */`
  varying vec3 vColor; varying float vAlpha;
  void main(){
    float d = length(gl_PointCoord - .5);
    if (d > .5) discard;
    float a = pow(1. - d * 2., 1.8) * vAlpha;
    gl_FragColor = vec4(vColor * a, a);
  }`

export function startScene(canvas, { mobile, reducedMotion }) {
  return new Promise((resolve, reject) => {
    let renderer
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'high-performance' })
      if (!renderer.getContext()) throw new Error('webgl')
    } catch (e) { reject(new Error('webgl')); return }

    const RM = reducedMotion, N = mobile ? 4000 : 16000
    const cleanups = []
    const on = (target, ev, fn, opts) => { target.addEventListener(ev, fn, opts); cleanups.push(() => target.removeEventListener(ev, fn, opts)) }
    let disposed = false

    const DPR = Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2)
    renderer.setPixelRatio(DPR)
    renderer.setSize(innerWidth, innerHeight, false)
    renderer.setClearColor(0x03040c, 1)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 100)
    camera.position.set(0, 0, 10)
    const visH = () => 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))
    const pxW = () => visH() / innerHeight // screen px → world units on the z = 0 plane

    const rnd = Math.random
    const gauss = () => (rnd() + rnd() + rnd() - 1.5) / 1.5
    const onSphere = () => { const u = rnd() * 2 - 1, t = rnd() * Math.PI * 2, s = Math.sqrt(1 - u * u); return [s * Math.cos(t), u, s * Math.sin(t)] }
    const $ = id => document.getElementById(id)

    function sampleMask(w, h, draw, step) {
      const c = document.createElement('canvas'); c.width = w; c.height = h
      const g = c.getContext('2d', { willReadFrequently: true })
      draw(g, w, h)
      const d = g.getImageData(0, 0, w, h).data, pts = []
      for (let y = 0; y < h; y += step) for (let x = 0; x < w; x += step) if (d[(y * w + x) * 4 + 3] > 128) pts.push(x, y)
      return pts
    }
    function centerOf(el) {
      if (!el) return [0, 0]
      const r = el.getBoundingClientRect()
      return [(r.left + r.width / 2 - innerWidth / 2) * pxW(), -(r.top + r.height / 2 - innerHeight / 2) * pxW()]
    }

    /* anchors: each morph stage is pinned to a real element on the page */
    const anchors = [() => $('heroSlot'), null, () => $('domList'), () => document.querySelector('#timeline .orbit'), () => $('trophySlot'), () => $('finalSlot')]
    const ZERO = [0, 0]
    const off = s => (anchors[s] ? centerOf(anchors[s]()) : ZERO)

    /* buffers */
    const aHero = new Float32Array(N * 3), aBurst = new Float32Array(N * 3)
    const aConst = new Float32Array(N * 3), aArc = new Float32Array(N * 3), aTrophy = new Float32Array(N * 3)
    const aColor = new Float32Array(N * 3), aRand = new Float32Array(N), aClus = new Float32Array(N).fill(-1)
    const palette = [[0.30, 0.49, 1.0], [0.60, 0.36, 1.0], [0.18, 0.90, 0.94], [0.79, 0.84, 1.0], [1.0, 0.31, 0.85]]
    const weights = [0.32, 0.28, 0.26, 0.12, 0.02]
    for (let i = 0; i < N; i++) {
      let w = rnd(), c = 0; while (c < 4 && w > weights[c]) { w -= weights[c]; c++ }
      aColor.set(palette[c], i * 3)
      aRand[i] = rnd()
    }

    /* hero: neural net */
    let lineArr = new Float32Array(0)
    function buildHero() {
      const el = $('heroSlot'), r = el ? el.getBoundingClientRect() : { width: 200, height: 200 }
      const net = buildNet(Math.max(40, Math.min(r.width, r.height) * 0.48) * pxW(), rnd)
      fillFromNet(net, aHero, N, rnd)
      lineArr = netLines(net)
    }

    /* section shapes */
    function buildBurst() {
      const vh = visH(), vw = vh * innerWidth / innerHeight
      for (let i = 0; i < N; i++) {
        const d = onSphere(), k = 0.3 + Math.pow(rnd(), 0.6) * 0.95
        aBurst.set([d[0] * k * vw * 0.78, d[1] * k * vh * 0.78, d[2] * k * 5 - 1.5], i * 3)
      }
    }
    function buildConst() {
      const list = $('domList'); if (!list) return
      const L = list.getBoundingClientRect(), k0 = pxW()
      const lcx = L.left + L.width / 2, lcy = L.top + L.height / 2
      const slots = [...list.querySelectorAll('.d-slot')].map((s, i) => {
        const r = s.getBoundingClientRect()
        const zig = (i % 2 ? 0.18 : -0.18) * r.width
        return [(r.left + r.width / 2 + zig - lcx) * k0, -(r.top + r.height / 2 - lcy) * k0, Math.max(10, Math.min(r.width * 0.5, r.height) * 0.4) * k0]
      })
      if (slots.length < 2) return
      for (let i = 0; i < N; i++) {
        const r2 = rnd()
        if (r2 < 0.66) {
          const c = (rnd() * slots.length) | 0, [x, y, cr] = slots[c]
          if (rnd() < 0.62) aConst.set([x + gauss() * cr * 0.34, y + gauss() * cr * 0.34, gauss() * cr * 0.3], i * 3)
          else { const a = rnd() * Math.PI * 2, rr = cr * (1 + gauss() * 0.05); aConst.set([x + Math.cos(a) * rr, y + Math.sin(a) * rr, gauss() * 0.02], i * 3) }
          aClus[i] = c
        } else if (r2 < 0.86) {
          const c = (rnd() * (slots.length - 1)) | 0, a = slots[c], b = slots[c + 1], t = rnd()
          aConst.set([a[0] + (b[0] - a[0]) * t + gauss() * 0.012, a[1] + (b[1] - a[1]) * t + gauss() * 0.012, 0], i * 3)
          aClus[i] = -1
        } else {
          aConst.set([(rnd() - 0.5) * L.width * k0, (rnd() - 0.5) * L.height * k0, -rnd() * 3], i * 3)
          aClus[i] = -1
        }
      }
    }
    function buildArc() {
      const card = document.querySelector('#timeline .orbit'); if (!card) return
      const C = card.getBoundingClientRect(), k0 = pxW()
      const ccx = C.left + C.width / 2, ccy = C.top + C.height / 2
      const svg = $('orbitSvg'), S = svg ? svg.getBoundingClientRect() : { width: 0 }
      const curve = [], beads = [], SEG = 400
      if (S.width > 10) {
        // trace the exact SVG path so particles sit on the drawn arc
        const path = $('orbitPath'), len = path.getTotalLength(), sx = S.width / 1000, sy = S.height / 330
        const map = pt => [(S.left + pt.x * sx - ccx) * k0, -(S.top + pt.y * sy - ccy) * k0]
        for (let i = 0; i <= SEG; i++) curve.push(map(path.getPointAtLength(len * i / SEG)))
        const n = $('orbitNodes').children.length
        for (let i = 0; i < n; i++) beads.push(map(path.getPointAtLength(len * i / Math.max(1, n - 1))))
      } else {
        // phones: the timeline is a vertical list, so trace its progress bar
        const list = $('tlList'); if (!list) return
        const Lr = list.getBoundingClientRect(), x = (Lr.left + 7 - ccx) * k0, y0 = Lr.top + 6, y1 = Lr.bottom - 6
        for (let i = 0; i <= SEG; i++) curve.push([x, -(y0 + (y1 - y0) * i / SEG - ccy) * k0])
        list.querySelectorAll('li').forEach(li => { const r = li.getBoundingClientRect(); beads.push([x, -(r.top + r.height / 2 - ccy) * k0]) })
      }
      const th = 0.03
      for (let i = 0; i < N; i++) {
        const r2 = rnd()
        if (r2 < 0.6) {
          const f = rnd() * SEG, a = curve[f | 0], b = curve[Math.min(SEG, (f | 0) + 1)], t = f % 1
          aArc.set([a[0] + (b[0] - a[0]) * t + gauss() * th, a[1] + (b[1] - a[1]) * t + gauss() * th, gauss() * th], i * 3)
        } else if (r2 < 0.82 && beads.length) {
          const b = beads[(rnd() * beads.length) | 0], s = 0.085
          aArc.set([b[0] + gauss() * s, b[1] + gauss() * s, gauss() * s], i * 3)
        } else {
          const c = curve[(rnd() * (SEG + 1)) | 0], s = 0.45
          aArc.set([c[0] + gauss() * s, c[1] + gauss() * s, -rnd() * 2], i * 3)
        }
      }
    }
    function buildTrophy() {
      const slot = $('trophySlot'); if (!slot) return
      const r = slot.getBoundingClientRect(), k0 = pxW(), W = 600
      const pts = sampleMask(W, W, g => {
        g.fillStyle = '#fff'; g.strokeStyle = '#fff'; g.lineCap = 'round'
        g.beginPath(); g.moveTo(160, 80); g.lineTo(440, 80); g.bezierCurveTo(440, 260, 380, 350, 300, 360); g.bezierCurveTo(220, 350, 160, 260, 160, 80); g.fill()
        g.lineWidth = 26
        g.beginPath(); g.moveTo(170, 120); g.bezierCurveTo(60, 120, 60, 265, 205, 282); g.stroke()
        g.beginPath(); g.moveTo(430, 120); g.bezierCurveTo(540, 120, 540, 265, 395, 282); g.stroke()
        g.fillRect(278, 352, 44, 92)
        g.fillRect(222, 440, 156, 32)
        g.fillRect(182, 472, 236, 52)
        g.globalCompositeOperation = 'destination-out' // star cut-out on the cup
        g.beginPath()
        for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? 22 : 52; g.lineTo(300 + Math.cos(a) * rr, 195 + Math.sin(a) * rr) }
        g.closePath(); g.fill()
      }, 3)
      const n = pts.length / 2, sc = Math.max(60, Math.min(r.width, r.height) * 0.86) / W
      for (let i = 0; i < N; i++) {
        if (n && rnd() < 0.88) {
          const j = ((rnd() * n) | 0) * 2
          aTrophy.set([(pts[j] + rnd() * 3 - W / 2) * sc * k0, -(pts[j + 1] + rnd() * 3 - W / 2) * sc * k0, gauss() * 0.05], i * 3)
        } else {
          const a = rnd() * Math.PI * 2, rr = (0.5 + rnd() * 0.3) * W * sc * k0
          aTrophy.set([Math.cos(a) * rr, Math.sin(a) * rr * 0.9, gauss() * 0.2 - 0.5], i * 3)
        }
      }
    }
    let finalScale = 1
    function computeFinal() {
      const h = $('heroSlot')?.getBoundingClientRect(), f = $('finalSlot')?.getBoundingClientRect()
      finalScale = h && f && h.width > 4 && h.height > 4 ? Math.min(f.width / h.width, f.height / h.height, 1.4) : 1
    }

    /* scroll keys: where each shape is fully formed */
    const K = { wrapTop: 0, wrapH: 1, k: [0, 1, 2, 3, 4, 5] }
    function computeKeys() {
      const y = scrollY, H = innerHeight
      const wrap = $('heroWrap'); if (!wrap) return
      K.wrapTop = wrap.getBoundingClientRect().top + y; K.wrapH = wrap.offsetHeight
      const center = el => { if (!el) return y; const r = el.getBoundingClientRect(); return r.top + y + r.height / 2 - H / 2 }
      const maxS = document.documentElement.scrollHeight - H
      const ks = [0, center($('about')), center($('domList')), center(document.querySelector('#timeline .orbit')), center($('trophySlot')), center($('finalSlot'))]
      ks[5] = Math.min(ks[5], maxS - 2)
      for (let i = 2; i < 6; i++) ks[i] = Math.max(ks[i], ks[i - 1] + 40)
      K.k = ks
    }
    const clamp01 = x => Math.min(1, Math.max(0, x))
    const smooth = (a, b, x) => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t) }
    const heroP = () => clamp01((scrollY - K.wrapTop) / Math.max(1, K.wrapH - innerHeight))
    function stageM() {
      const y = scrollY
      if (y < K.k[1]) return smooth(0.52, 0.72, heroP())
      for (let i = 1; i < 5; i++) if (y < K.k[i + 1]) return i + smooth(0.15, 0.85, (y - K.k[i]) / Math.max(1, K.k[i + 1] - K.k[i]))
      return 5
    }

    /* particles */
    const geo = new THREE.BufferGeometry()
    const attr = (name, arr, size) => { const a = new THREE.BufferAttribute(arr, size); geo.setAttribute(name, a); return a }
    attr('position', aHero, 3)
    const A = { hero: attr('aHero', aHero, 3), burst: attr('aBurst', aBurst, 3), cons: attr('aConst', aConst, 3), arc: attr('aArc', aArc, 3), trophy: attr('aTrophy', aTrophy, 3), clus: attr('aClus', aClus, 1) }
    attr('aColor', aColor, 3); attr('aRand', aRand, 1)
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 200)

    const uniforms = {
      uTime: { value: 0 }, uM: { value: 0 }, uCollapse: { value: 0 }, uFinal: { value: 1 }, uScatter: { value: 0 },
      uPulse: { value: 0 }, uHot: { value: -1 }, uHotAmt: { value: 0 },
      uOffA: { value: new THREE.Vector3() }, uOffB: { value: new THREE.Vector3() }, uMouse: { value: new THREE.Vector3(1e4, 1e4, 0.9) },
      uSize: { value: mobile ? 3.6 : 3.0 }, uPR: { value: DPR },
    }
    const mat = new THREE.ShaderMaterial({ uniforms, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, vertexShader: VERT, fragmentShader: FRAG })
    const points = new THREE.Points(geo, mat)
    points.frustumCulled = false
    scene.add(points)

    // neural-net connections, drawn only while the net is visible (hero and final CTA)
    const lineGeo = new THREE.BufferGeometry()
    const lineMat = new THREE.LineBasicMaterial({ color: 0x6f8cff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })
    const lines = new THREE.LineSegments(lineGeo, lineMat)
    lines.frustumCulled = false
    scene.add(lines)

    let composer = null
    if (!mobile) {
      composer = new EffectComposer(renderer)
      composer.addPass(new RenderPass(scene, camera))
      composer.addPass(new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.6, 0.6, 0.08))
      composer.addPass(new OutputPass())
    }

    function buildAll() {
      buildHero()
      lineGeo.setAttribute('position', new THREE.BufferAttribute(lineArr, 3))
      buildBurst(); buildConst(); buildArc(); buildTrophy(); computeFinal(); computeKeys()
      for (const k in A) A[k].needsUpdate = true
      geo.attributes.position.needsUpdate = true
    }

    /* resize */
    let rT
    on(window, 'resize', () => {
      camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix()
      renderer.setSize(innerWidth, innerHeight, false)
      composer?.setSize(innerWidth, innerHeight)
      clearTimeout(rT); rT = setTimeout(() => { buildAll(); if (RM) requestRender() }, 220)
    })
    const keysId = setInterval(computeKeys, 2000) // layout settles (fonts, reveals) without a resize
    cleanups.push(() => { clearInterval(keysId); clearTimeout(rT) })

    /* frame */
    const s = { m: 0, c: 0, pulse: 0, hot: 0 }
    let last = performance.now()
    function frame(now) {
      const t = RM ? 0 : now / 1000
      const dt = Math.min(0.05, (now - last) / 1000); last = now
      const k = RM ? 1 : Math.min(1, dt * 8)
      s.m += ((RM ? 0 : stageM()) - s.m) * k
      s.c += ((RM ? 0 : smooth(0.3, 0.5, heroP())) - s.c) * k
      bus.pulse *= 0.94; s.pulse += (bus.pulse - s.pulse) * 0.2
      bus.scatter *= 0.9
      s.hot += (bus.hotOn - s.hot) * Math.min(1, dt * 7)

      const fl = Math.floor(Math.min(s.m, 4.999))
      const oa = off(fl), ob = off(fl + 1)
      uniforms.uTime.value = t
      uniforms.uM.value = s.m
      uniforms.uCollapse.value = s.c
      uniforms.uFinal.value = finalScale
      uniforms.uScatter.value = bus.scatter
      uniforms.uPulse.value = s.pulse
      uniforms.uHot.value = bus.hot
      uniforms.uHotAmt.value = s.hot
      uniforms.uOffA.value.set(oa[0], oa[1], 0)
      uniforms.uOffB.value.set(ob[0], ob[1], 0)
      if (!mobile && bus.px > -1e3) uniforms.uMouse.value.set((bus.px - innerWidth / 2) * pxW(), -(bus.py - innerHeight / 2) * pxW(), 0.9)
      else uniforms.uMouse.value.set(1e4, 1e4, 0.9)

      // net lines follow the hero (or the final slot) and fade with the explosion
      const heroVis = (1 - clamp01(s.m)) * (1 - s.c), finalVis = clamp01(s.m - 4)
      if (heroVis > 0.01 || finalVis > 0.01) {
        const atFinal = s.m > 2.5, o = atFinal ? off(5) : off(0), sc = atFinal ? finalScale : 1
        lines.visible = true
        lines.position.set(o[0], o[1], 0)
        lines.scale.setScalar(sc)
        lines.rotation.y = t * 0.25
        lineMat.opacity = 0.22 * (atFinal ? finalVis : heroVis)
      } else lines.visible = false

      composer ? composer.render() : renderer.render(scene, camera)
    }

    let rq = false
    function requestRender() { if (rq || disposed) return; rq = true; requestAnimationFrame(n => { rq = false; if (!disposed) frame(n) }) }

    function dispose() {
      disposed = true
      cleanups.forEach(fn => fn())
      geo.dispose(); mat.dispose(); lineGeo.dispose(); lineMat.dispose()
      composer?.dispose?.()
      renderer.dispose()
    }

    function start() {
      if (disposed) return
      document.body.classList.add('gl-ready')
      requestAnimationFrame(() => {
        if (disposed) return
        buildAll()
        if (RM) {
          // reduced motion: a still net, redrawn only when something moves
          requestRender()
          on(window, 'scroll', requestRender, { passive: true })
          on(window, 'resize', requestRender)
        } else {
          let running = true
          const loop = () => { if (!running || disposed) return; frame(performance.now()); requestAnimationFrame(loop) }
          on(document, 'visibilitychange', () => { running = !document.hidden; if (running) { last = performance.now(); loop() } })
          loop()
        }
        resolve({ dispose })
      })
    }
    // wait for the display font (layout of the anchors depends on it), but never more than 2.5 s
    const fonts = document.fonts ? Promise.all([document.fonts.load('800 100px Syne'), document.fonts.ready]) : Promise.resolve()
    Promise.race([fonts, new Promise(r => setTimeout(r, 2500))]).then(start, start)
  })
}
