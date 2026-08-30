import { useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
gsap.registerPlugin(ScrollTrigger)
ScrollTrigger.config({
  ignoreMobileResize: true,
})
/////////////// PAGES ////////////////////////////
import ScrollToTop from './components/ScrollToTop.jsx'
import Navbar from './components/Navbar.jsx'
import LoadingBar from '../src/components/LoadingBar.jsx'
import AnimatedRoutes from './components/AnimatedRoutes.jsx'

const App = () => {
  useEffect(() => {
    // Stop the browser restoring a stale native scroll position on
    // reload/back-forward before Lenis and ScrollTrigger have measured
    // the page. Without this, the browser jumps scrollY to wherever it
    // was last time, and everything below then has to fight to correct it.
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }

    const lenis = new Lenis({
      stopInertiaOnNavigate: true,
      smoothWheel: true,
      syncTouch: false,
    })
    window.lenis = lenis
    lenis.on('scroll', ScrollTrigger.update)

    // Drive Lenis from GSAP's own ticker instead of a separate rAF loop,
    // so Lenis and every ScrollTrigger animation stay on the exact same
    // frame schedule. Removes frame-ordering drift that causes visible
    // snapping right after a ScrollTrigger.refresh().
    const lenisTick = (time) => {
      lenis.raf(time * 1000)
    }
    gsap.ticker.add(lenisTick)
    gsap.ticker.lagSmoothing(0)

    // Let ScrollToTop know Lenis is ready, in case its effect already
    // ran before this one (React runs child effects before parent effects,
    // so on first mount ScrollToTop can fire before this block does).
    window.dispatchEvent(new Event('lenis:ready'))

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
      gsap.ticker.remove(lenisTick)
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
      <LoadingBar>
        <ScrollToTop />
        <Navbar />
        <AnimatedRoutes />
      </LoadingBar>
    </div>
  )
}
export default App