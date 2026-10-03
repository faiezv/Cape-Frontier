import { useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Helmet } from 'react-helmet-async'
import Lenis from 'lenis'
import { buildOrganizationSchema } from './utils/tourSchema.js'

gsap.registerPlugin(ScrollTrigger)
ScrollTrigger.config({
  ignoreMobileResize: true,
})

/////////////// PAGES ////////////////////////////
import Navbar from './components/Navbar.jsx'
import LoadingBar from './components/LoadingBar.jsx'
import AnimatedRoutes from './components/AnimatedRoutes.jsx'

const App = () => {
  useEffect(() => {
    window.__layoutStable = false

    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }

    const lenis = new Lenis({
      stopInertiaOnNavigate: true,
      smoothWheel: true,
      syncTouch: false,
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    })
    window.lenis = lenis
    lenis.scrollTo(0, { immediate: true, force: true })
    lenis.start()
    lenis.on('scroll', ScrollTrigger.update)

    const lenisTick = (time) => lenis.raf(time * 1000)
    gsap.ticker.add(lenisTick)
    gsap.ticker.lagSmoothing(0)

    let timeoutId = null
    let rafId = null
    let isStable = false

    const refresh = () => ScrollTrigger.refresh(true)

    const onStable = () => {
      if (isStable) return
      isStable = true
      rafId = requestAnimationFrame(() => {
        refresh()
        if (window.scrollY <= 2) {
          lenis.scrollTo(0, { immediate: true, force: true })
        }
        // Remember the state AND announce it, so late-mounting
        // components (dev mode, lazy routes) can still find out.
        window.__layoutStable = true
        window.dispatchEvent(new Event('app:layout-stable'))
      })
    }

    const checkStability = () => {
      if (timeoutId) clearTimeout(timeoutId)
      isStable = false
      timeoutId = setTimeout(onStable, 500)
    }

    const observer = new ResizeObserver(checkStability)
    observer.observe(document.body)

    // Images: count both load and error so a failed image can't block us
    const images = Array.from(document.querySelectorAll('img'))
    let settled = 0
    const onImageSettled = () => {
      settled++
      if (settled >= images.length) checkStability()
    }
    images.forEach((img) => {
      if (img.complete) settled++
      else {
        img.addEventListener('load', onImageSettled)
        img.addEventListener('error', onImageSettled)
      }
    })
    checkStability() // always kick off once, even with zero images

    if (document.fonts?.ready) {
      document.fonts.ready.then(checkStability)
    }
    window.addEventListener('load', checkStability)

    const timers = [
      setTimeout(refresh, 100),
      setTimeout(refresh, 300),
      setTimeout(refresh, 600),
      setTimeout(refresh, 1200),
    ]

    return () => {
      window.__layoutStable = false
      if (timeoutId) clearTimeout(timeoutId)
      if (rafId) cancelAnimationFrame(rafId)
      timers.forEach(clearTimeout)
      observer.disconnect()
      images.forEach((img) => {
        img.removeEventListener('load', onImageSettled)
        img.removeEventListener('error', onImageSettled)
      })
      window.removeEventListener('load', checkStability)
      gsap.ticker.remove(lenisTick)
      lenis.off('scroll', ScrollTrigger.update)
      lenis.destroy()
      window.lenis = null
    }
  }, [])

  return (
    <>
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(buildOrganizationSchema())}
        </script>
      </Helmet>
      <div className="relative min-w-full bg-white">
        <LoadingBar>
          <Navbar />
          <AnimatedRoutes />
        </LoadingBar>
      </div>
    </>
  )
}

export default App