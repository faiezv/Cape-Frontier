import React from 'react'
import { Routes, Route, useLocation } from 'react-router-dom';

import Home from '../pages/Home';
import TourDetails from '../pages/TourDetails'
import Policies from '../pages/Policies'
import Booking from '../pages/Booking';
// import Checkout from '../pages/Checkout';
// import Success from '../pages/CheckoutSuccess'

// While testing migration to Paystacl
import CheckoutPaystack from '../pages/CheckoutPaystack';
import Success from '../pages/CheckoutSuccessPaystack'

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <Routes location={location}>
      <Route path="/" element={<Home />} />

      {/* Dedicated SEO tour page */}
      <Route path="/tours/:slug" element={<TourDetails />} />
      <Route path="/policies" element={<Policies />} />
      <Route path="/booking" element={<Booking />} />
      <Route path="/checkout" element={<CheckoutPaystack />} />
      <Route path="/success" element={<Success />} />
    </Routes>
  )
}

export default AnimatedRoutes


