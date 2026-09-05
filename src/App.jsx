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
import LoadingBar from '../src/components/LoadingBar.jsx'
import AnimatedRoutes from './components/AnimatedRoutes.jsx'

const App = () => {
  useEffect(() => {
    // Disable browser's native scroll restoration
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }

    // Initialize Lenis
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

    // Use ResizeObserver to refresh only after layout stabilises
    let timeoutId = null
    let isStable = false

    const refresh = () => ScrollTrigger.refresh(true)

    const onStable = () => {
      if (isStable) return
      isStable = true
      // Force a final refresh and reset scroll
      requestAnimationFrame(() => {
        refresh()
        // Only snap to top if the user hasn't already scrolled themselves -
        // otherwise this yanks them back to 0 mid-read.
        if (window.scrollY <= 2) {
          lenis.scrollTo(0, { immediate: true, force: true })
        }
        // Tell any component waiting to create scroll-driven animations
        // (e.g. the hero pin) that layout is now trustworthy.
        window.dispatchEvent(new Event('app:layout-stable'))
      })
    }

    const checkStability = () => {
      if (timeoutId) clearTimeout(timeoutId)
      isStable = false
      timeoutId = setTimeout(onStable, 500) // wait 500ms of no changes
    }

    // Observe the whole document for layout changes
    const observer = new ResizeObserver(checkStability)
    observer.observe(document.body)

    // Also watch images and fonts
    const images = document.querySelectorAll('img')
    let loadedCount = 0
    const onImageLoad = () => {
      loadedCount++
      if (loadedCount === images.length) checkStability()
    }
    images.forEach(img => {
      if (img.complete) loadedCount++
      else img.addEventListener('load', onImageLoad)
    })
    if (loadedCount === images.length) checkStability()

    if (document.fonts?.ready) {
      document.fonts.ready.then(checkStability)
    }

    window.addEventListener('load', checkStability)

    // Fallback timers in case ResizeObserver misses something
    const timers = [
      setTimeout(refresh, 100),
      setTimeout(refresh, 300),
      setTimeout(refresh, 600),
      setTimeout(refresh, 1200),
    ]

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
      timers.forEach(clearTimeout)
      observer.disconnect()
      images.forEach(img => img.removeEventListener('load', onImageLoad))
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
        <meta name="description" content="Cape Frontier" />
        <link rel="canonical" href="https://www.cape-frontier.co.za" />
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