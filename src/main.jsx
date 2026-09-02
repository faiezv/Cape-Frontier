import { ViteReactSSG } from 'vite-react-ssg'
import { HelmetProvider } from 'react-helmet-async'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import App from './App.jsx'
import './index.css'

// PAGES
import Home from './pages/Home.jsx'
import TourDetails from './pages/TourDetails'
import Policies from './pages/Policies.jsx'
import PageNotFound from './pages/PageNotFound.jsx'
import CheckoutPaystack from './pages/CheckoutPaystack'
import CheckoutSuccessPaystack from './pages/CheckoutSuccessPaystack'

// SETUP - Plain route array (NO createBrowserRouter!)
const routes = [
  {
    path: '*',
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: 'tours/:slug', element: <TourDetails /> },
      { path: 'policies', element: <Policies /> },
      { path: 'checkout', element: <CheckoutPaystack /> },
      { path: 'success', element: <CheckoutSuccessPaystack /> },
    ]
  },
  { path: '*', element: <PageNotFound /> }
]

// The plugin handles everything else (no manual render needed)
// export const createRoot = ViteReactSSG(
//   { routes },
//   ({ router, isClient }) => {}, // optional callback
//   ({ children }) => <HelmetProvider>{children}</HelmetProvider>
// )

export const createRoot = ViteReactSSG(
  { routes },
  ({ router, isClient }) => {
    if (isClient) {
      // 1. Disable browser's native scroll restoration
      if (window.history && 'scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'manual'
      }

      // 2. Ensure Lenis is initialized and ready
      // (Assuming you have Lenis globally; if not, import it and init here)
      if (window.lenis) {
        // Stop any ongoing Lenis scroll to prevent race
        window.lenis.stop()
        // Reset to top instantly
        window.lenis.scrollTo(0, { immediate: true, force: true })
        // Start Lenis again
        window.lenis.start()
      }

      // 3. Register ScrollTrigger plugin if not already
      gsap.registerPlugin(ScrollTrigger)

      // 4. Refresh ScrollTrigger after a short delay (allow layout to settle)
      setTimeout(() => {
        ScrollTrigger.refresh(true)
      }, 200)

      // 5. Listen to route changes to reset scroll and refresh
      router.subscribe(() => {
        if (window.lenis) {
          window.lenis.scrollTo(0, { immediate: true, force: true })
          window.lenis.start()
        }
        // Refresh ScrollTrigger after route change
        requestAnimationFrame(() => ScrollTrigger.refresh(true))
      })
    }
  },
  ({ children }) => <HelmetProvider>{children}</HelmetProvider>
)