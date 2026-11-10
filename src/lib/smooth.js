import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { motionAllowed, isFinePointer } from './motion.js'

export function initSmooth() {
  gsap.registerPlugin(ScrollTrigger)
  if (!isFinePointer() || !motionAllowed()) return Promise.resolve({ lenis: null }) // phones: native scroll
  return import('lenis').then(({ default: Lenis }) => {
    const lenis = new Lenis({ lerp: 0.1 })
    lenis.on('scroll', ScrollTrigger.update)
    gsap.ticker.add(t => lenis.raf(t * 1000))
    gsap.ticker.lagSmoothing(0)
    return { lenis }
  })
}
