import React, { useEffect, useRef } from 'react'
import { useLocation, useOutlet } from 'react-router-dom'
import { useReducedMotion } from 'framer-motion'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLoadingBar } from './LoadingBar.jsx'
import { useTransitionMode } from '../utils/transitionMode.js'
import { TRANSITIONS, FALLBACK_TRANSITION } from '../transitions/index.js'

const resetScroll = () => {
  if (window.lenis) window.lenis.scrollTo(0, { immediate: true, force: true })
  else window.scrollTo(0, 0)
}

const AnimatedRoutes = ({ onSwap }) => {
  const location = useLocation()
  const outlet = useOutlet()
  const { completeLoading } = useLoadingBar()
  const mode = useTransitionMode()
  const reduceMotion = useReducedMotion()
  const didMount = useRef(false)

  // First load has no transition, so just finish the loading bar.
  useEffect(() => {
    if (didMount.current) return
    didMount.current = true
    completeLoading()
  }, [completeLoading])

  // Reduced-motion visitors always get the simple fade;
  // unknown mode names fall back to it too.
  const Transition =
    TRANSITIONS[reduceMotion ? FALLBACK_TRANSITION : mode] ??
    TRANSITIONS[FALLBACK_TRANSITION]

  return (
    <Transition
      pathname={location.pathname}
      outlet={outlet}
      onSwap={(path) => {
        // old page is gone: safe to reset scroll and update the navbar
        resetScroll()
        onSwap?.(path)
        completeLoading()
      }}
      onReady={() => {
        // new page is visible: measure ScrollTrigger against the final layout
        ScrollTrigger.refresh(true)
      }}
    />
  )
}

export default AnimatedRoutes