import React from 'react'
import {Outlet, useLocation } from 'react-router-dom';

const AnimatedRoutes = () => {
  const location = useLocation();
  return <Outlet />
}

export default AnimatedRoutes


