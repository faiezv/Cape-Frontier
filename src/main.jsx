import { ViteReactSSG } from 'vite-react-ssg'
import { HelmetProvider } from 'react-helmet-async'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import App from './App.jsx'
import './index.css'

// PAGES
import Home from './pages/Home.jsx'
import Tour from './pages/Tours.jsx'
import TourDetails from './pages/TourDetails'
import Policies from './pages/Policies.jsx'
import Gallery from './pages/Gallery.jsx'
import PageNotFound from './pages/PageNotFound.jsx'
import CheckoutPaystack from './pages/CheckoutPaystack'
import CheckoutSuccessPaystack from './pages/CheckoutSuccessPaystack'

const routes = [
  {
    path: '*',
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: 'tours/:slug', element: <TourDetails /> },
      { path: 'tours', element: <Tour /> },
      { path: 'gallery', element: <Gallery /> },
      { path: 'policies', element: <Policies /> },
      { path: 'checkout', element: <CheckoutPaystack /> },
      { path: 'success', element: <CheckoutSuccessPaystack /> },
    ],
  },
  { path: '*', element: <PageNotFound /> },
]

export const createRoot = ViteReactSSG(
  { routes },
  ({ isClient }) => {
    if (isClient) {
      // Disable the browser's native scroll restoration
      if (window.history && 'scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'manual'
      }

      gsap.registerPlugin(ScrollTrigger)

      // Initial layout refresh. Route-change scroll reset and refresh
      // now live in AnimatedRoutes so they run after the exit animation.
      setTimeout(() => ScrollTrigger.refresh(true), 200)
    }
  },
  ({ children }) => <HelmetProvider>{children}</HelmetProvider>
)