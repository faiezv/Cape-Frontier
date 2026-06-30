import { React, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import {
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom'

import App from './App.jsx'
import './index.css'

// PAGES
import Home from './pages/Home.jsx'
import TourDetails from './pages/TourDetails'
import Policies from './pages/Policies.jsx'

import CheckoutPaystack from './pages/CheckoutPaystack';
import CheckoutSuccessPaystack from './pages/CheckoutSuccessPaystack';
import CheckoutPayfast from './pages/CheckoutPayfast.jsx';
import CheckoutSuccessPayfast from './pages/CheckoutSuccessPayfast.jsx';
import CheckoutCancelPayfast from './pages/CheckoutCancelPayfast.jsx'

import PageNotFound from './pages/PageNotFound.jsx'

// SETUP
const router = createBrowserRouter([

  {
    path: '*',
    element: <App />,
    children: [
      { index: true, element: <Home/> },

      { path: 'tours/:slug', element: <TourDetails/> },
      { path: 'policies', element: <Policies/> },
      // { path: 'checkout', element: <CheckoutPaystack/> },
      { path: 'checkout', element: <CheckoutPayfast/> },
      { path: 'success', element: <CheckoutSuccessPayfast/> },
      // { path: 'success', element: <CheckoutSuccessPaystack/> },
      { path: 'cancel;', element: <CheckoutCancelPayfast/> },

    ]
  },

  { path: '*', element: <PageNotFound /> }
]);

createRoot(document.getElementById('root')).render(
  <RouterProvider router={router} />
)
