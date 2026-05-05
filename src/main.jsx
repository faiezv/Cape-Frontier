import { React, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

import Home from './pages/Home.jsx'
import Booking from './pages/Booking.jsx'
import Checkout from './pages/Checkout.jsx'
import CheckoutSuccess from './pages/CheckoutSuccess.jsx'
import CheckoutCancel from './pages/CheckoutCancel.jsx'

import PageNotFound from './pages/PageNotFound.jsx'

//Router setup
import {
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom'

const router = createBrowserRouter([

  {
    path: '*',
    element: <App />,
    children: [
      { index: true, element: <Home/> },
      { path: 'home', element: <Home/> },
      { path: 'booking', element: <Booking/> },
      { path: 'checkout', element: <Checkout/> },
      { path: 'success', element: <CheckoutSuccess/> },
      { path: 'cancel', element: <CheckoutCancel/> },

    ]
  },

  { path: '*', element: <PageNotFound /> }
]);

createRoot(document.getElementById('root')).render(
  <RouterProvider router={router} />
)
