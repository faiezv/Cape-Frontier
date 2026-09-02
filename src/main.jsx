import { ViteReactSSG } from 'vite-react-ssg'
import { HelmetProvider } from 'react-helmet-async'

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
export const createRoot = ViteReactSSG(
  { routes },
  ({ router, isClient }) => {}, // optional callback
  ({ children }) => <HelmetProvider>{children}</HelmetProvider>
)