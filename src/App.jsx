import React, { useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

/////////////// PAGES ////////////////////////////
import ScrollToTop from './components/ScrollToTop.jsx'
import Navbar from './components/Navbar.jsx'
import AnimatedRoutes from './components/AnimatedRoutes.jsx'

gsap.registerPlugin(ScrollTrigger)

ScrollTrigger.config({
  ignoreMobileResize: true,
})

const App = () => {
  useEffect(() => {
    const lenis = new Lenis({
      stopInertiaOnNavigate: true,
      smoothWheel: true,

      /*
        Keep touch scrolling native.
        This reduces mobile Chrome viewport/URL-bar resize conflicts with GSAP.
      */
      syncTouch: false,
    })

    window.lenis = lenis

    lenis.on('scroll', ScrollTrigger.update)

    let rafId = null

    const raf = (time) => {
      lenis.raf(time)
      rafId = window.requestAnimationFrame(raf)
    }

    rafId = window.requestAnimationFrame(raf)

    const refresh = () => {
      ScrollTrigger.refresh(true)
    }

    const refreshOne = window.setTimeout(refresh, 120)
    const refreshTwo = window.setTimeout(refresh, 500)

    window.addEventListener('load', refresh, { once: true })

    if (document.fonts?.ready) {
      document.fonts.ready.then(refresh).catch(() => {})
    }

    return () => {
      if (rafId) {
        window.cancelAnimationFrame(rafId)
      }

      window.clearTimeout(refreshOne)
      window.clearTimeout(refreshTwo)
      window.removeEventListener('load', refresh)

      lenis.off('scroll', ScrollTrigger.update)
      lenis.destroy()

      if (window.lenis === lenis) {
        window.lenis = null
      }
    }
  }, [])

  return (
    <div className="relative min-w-full bg-white">
      <ScrollToTop />
      <Navbar />
      <AnimatedRoutes />
    </div>
  )
}

export default App