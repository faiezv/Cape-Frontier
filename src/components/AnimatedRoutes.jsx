import React, { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useLoadingBar } from './LoadingBar.jsx'

const AnimatedRoutes = () => {
  const location = useLocation()
  const { completeLoading } = useLoadingBar()

  useEffect(() => {
    completeLoading()
  }, [location.pathname, completeLoading])

  return <Outlet />
}

export default AnimatedRoutes