// import { useEffect } from 'react'
// import { gsap } from 'gsap'
// import { ScrollTrigger } from 'gsap/ScrollTrigger'
// import Lenis from 'lenis'

// gsap.registerPlugin(ScrollTrigger)

// ScrollTrigger.config({
//   ignoreMobileResize: true,
// })


// /////////////// PAGES ////////////////////////////
// import ScrollToTop from './components/ScrollToTop.jsx'
// import Navbar from './components/Navbar.jsx'
// import LoadingBar from '../src/components/LoadingBar.jsx'
// import AnimatedRoutes from './components/AnimatedRoutes.jsx'

// const App = () => {
//   useEffect(() => {
//     const lenis = new Lenis({
//       stopInertiaOnNavigate: true,
//       smoothWheel: true,

//       /*
//         Keep touch scrolling native.
//         This reduces mobile Chrome viewport/URL-bar resize conflicts with GSAP.
//       */
//       syncTouch: false,
//     })

//     window.lenis = lenis

//     lenis.on('scroll', ScrollTrigger.update)

//     let rafId = null

//     const raf = (time) => {
//       lenis.raf(time)
//       rafId = window.requestAnimationFrame(raf)
//     }

//     rafId = window.requestAnimationFrame(raf)

//     const refresh = () => {
//       ScrollTrigger.refresh(true)
//     }

//     const refreshOne = window.setTimeout(refresh, 120)
//     const refreshTwo = window.setTimeout(refresh, 500)

//     window.addEventListener('load', refresh, { once: true })

//     if (document.fonts?.ready) {
//       document.fonts.ready.then(refresh).catch(() => {})
//     }

//     return () => {
//       if (rafId) {
//         window.cancelAnimationFrame(rafId)
//       }

//       window.clearTimeout(refreshOne)
//       window.clearTimeout(refreshTwo)
//       window.removeEventListener('load', refresh)

//       lenis.off('scroll', ScrollTrigger.update)
//       lenis.destroy()

//       if (window.lenis === lenis) {
//         window.lenis = null
//       }
//     }
//   }, [])

//   return (
//     <div className="relative min-w-full bg-white">
//       <LoadingBar>
//           <ScrollToTop />
//           <Navbar />
//           <AnimatedRoutes />
//       </LoadingBar>
//     </div>
//   )
// }

// export default App

import { useEffect, useLayoutEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger)

ScrollTrigger.config({
  ignoreMobileResize: true,
})

import ScrollToTop from './components/ScrollToTop.jsx'
import Navbar from './components/Navbar.jsx'
import LoadingBar from '../src/components/LoadingBar.jsx'
import AnimatedRoutes from './components/AnimatedRoutes.jsx'

const App = () => {
  // ----- DISABLE BROWSER RESTORATION (insurance) -----
  useLayoutEffect(() => {
    if ("scrollRestoration" in window.history) {
      const previous = window.history.scrollRestoration;
      window.history.scrollRestoration = "manual";
      return () => { window.history.scrollRestoration = previous };
    }
  }, []);

  // ----- LENIS INIT + MOUNT‑TIME SCROLL LOCK -----
  useEffect(() => {
    const lenis = new Lenis({
      stopInertiaOnNavigate: true,
      smoothWheel: true,
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

    // ----- LOCK BODY UNTIL LAYOUT IS STABLE (only once per session) -----
    const lockKey = 'appScrollLocked'
    if (!sessionStorage.getItem(lockKey)) {
      sessionStorage.setItem(lockKey, 'true')

      // Stop Lenis and lock body
      lenis.stop()
      const origOverflow = document.body.style.overflow
      const origPosition = document.body.style.position
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.width = '100%'
      document.body.style.top = '-0px'

      // Force native scroll to 0
      window.scrollTo(0, 0)
      lenis.scrollTo(0, { immediate: true, force: true })

      // Wait for fonts, images, and a full ScrollTrigger refresh
      const ready = async () => {
        if (document.fonts?.ready) await document.fonts.ready
        await new Promise(resolve => {
          if (document.readyState === 'complete') resolve()
          else window.addEventListener('load', resolve, { once: true })
        })
        await new Promise(r => requestAnimationFrame(r))

        ScrollTrigger.refresh(true)
        await new Promise(r => requestAnimationFrame(r))

        // Unlock body
        document.body.style.overflow = origOverflow || ''
        document.body.style.position = origPosition || ''
        document.body.style.width = ''
        document.body.style.top = ''

        // Restart Lenis and force top one last time
        lenis.start()
        lenis.scrollTo(0, { immediate: true, force: true })

        requestAnimationFrame(() => ScrollTrigger.refresh(true))
      }

      // Run the readiness check
      Promise.resolve().then(ready)
    }

    // Refresh ScrollTrigger on resize and after a delay
    const refresh = () => ScrollTrigger.refresh(true)
    const timeout1 = setTimeout(refresh, 120)
    const timeout2 = setTimeout(refresh, 500)
    window.addEventListener('load', refresh, { once: true })
    if (document.fonts?.ready) {
      document.fonts.ready.then(refresh).catch(() => {})
    }

    // ----- CLEANUP -----
    return () => {
      if (rafId) cancelAnimationFrame(rafId)
      clearTimeout(timeout1)
      clearTimeout(timeout2)
      window.removeEventListener('load', refresh)
      lenis.off('scroll', ScrollTrigger.update)
      lenis.destroy()
      if (window.lenis === lenis) window.lenis = null
      // Reset body styles if they were changed
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.width = ''
      document.body.style.top = ''
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