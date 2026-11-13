import React, { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useAnimationControls } from 'framer-motion'

// LEAD must stay longer than the navbar logo's recolour (200ms) so the
// logo is back to its original colour before the curtain starts moving.
const LEAD = 0.25
const COVER = 0.5
const REVEAL = 0.6
const HOLD_MS = 180 // time the new page gets to mount under full cover
const EASE = [0.65, 0, 0.35, 1]

// ---------- destination label shown on the curtain ----------
const LABELS = {
  '/': 'Home',
  '/tours': 'Tours',
  '/gallery': 'Gallery',
  '/policies': 'Policies',
  '/checkout': 'Checkout',
  '/success': 'Booking confirmed',
}

const labelFor = (path) => {
  if (LABELS[path]) return LABELS[path]
  if (path.startsWith('/tours/')) {
    // "/tours/shark-cage-diving" -> "shark cage diving"
    return path.split('/').filter(Boolean).pop().replace(/-/g, ' ')
  }
  return 'Cape Frontier'
}

// ---------- variants ----------
const curtainVariants = {
  hidden: { y: '105%' },
  cover: { y: '0%', transition: { duration: COVER, delay: LEAD, ease: EASE } },
  reveal: { y: '-105%', transition: { duration: REVEAL, ease: EASE } },
}

// Content fades in while the curtain is still rising, so the
// destination is readable almost immediately.
const contentVariants = {
  hidden: { opacity: 0, y: 10 },
  cover: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, delay: LEAD + 0.12, ease: 'easeOut' },
  },
  reveal: { opacity: 0, transition: { duration: 0.2 } },
}

// The page itself doesn't animate. The exit only holds the old page on
// screen until the curtain fully covers it (0.999 is a deliberate near
// no-op so framer actually runs the timer).
const pageVariants = {
  initial: { opacity: 1 },
  animate: { opacity: 1 },
  exit: {
    opacity: 0.999,
    transition: { duration: LEAD + COVER + 0.05, ease: 'linear' },
  },
}

const CurtainTransition = ({ pathname, outlet, onSwap, onReady }) => {
  const curtain = useAnimationControls()
  const [mounted, setMounted] = useState(false)
  const [target, setTarget] = useState(pathname)

  const prevPath = useRef(pathname)
  const latestPath = useRef(pathname)
  const run = useRef(0)
  const alive = useRef(true)
  latestPath.current = pathname

  useEffect(() => {
    alive.current = true
    setMounted(true)
    return () => {
      alive.current = false
    }
  }, [])

  // Route changed: pull the curtain up (runs alongside AnimatePresence's exit)
  useEffect(() => {
    if (prevPath.current === pathname) return
    prevPath.current = pathname
    run.current++
    setTarget(pathname)
    curtain.start('cover')
  }, [pathname, curtain])

  // Old page is gone and the curtain is fully covering: swap, then reveal
  const handleExitComplete = async () => {
    const id = run.current
    onSwap(latestPath.current)

    await new Promise((r) => setTimeout(r, HOLD_MS))
    if (!alive.current || id !== run.current) return // unmounted or superseded

    onReady()
    await curtain.start('reveal')
    if (alive.current && id === run.current) curtain.set('hidden')
  }

  return (
    <>
      <AnimatePresence
        mode="wait"
        initial={false} // keeps prerendered HTML fully visible
        onExitComplete={handleExitComplete}
      >
        <motion.div
          key={pathname}
          className="min-h-screen"
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {outlet}
        </motion.div>
      </AnimatePresence>

      {/* Client-only: never part of the prerendered HTML.
          z-[9985] keeps it below the navbar (z-[9990]). */}
      {mounted && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-[9985] flex flex-col items-center justify-center border-y-[3px] border-blue-600 bg-white shadow-[0_0_40px_rgba(37,99,235,0.15)]"
          variants={curtainVariants}
          initial="hidden"
          animate={curtain}
        >
          <motion.div
            variants={contentVariants}
            className="flex flex-col items-center text-center"
          >
            <img
              src="/assets/brand/logo-cf.webp"
              alt=""
              className="mb-5 h-16 w-auto object-contain"
            />
            <p className="font-bitter text-[11px] font-black uppercase tracking-[0.28em] text-blue-600/60">
              Taking you to
            </p>
            <p className="mt-2 font-frank text-4xl font-bold capitalize text-blue-600 sm:text-5xl">
              {labelFor(target)}
            </p>
            <div className="mt-6 h-[2px] w-40 overflow-hidden rounded-full bg-blue-600/15">
              <motion.div
                key={target}
                className="h-full w-full origin-left bg-blue-600"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: COVER + LEAD + 0.4, ease: 'easeInOut' }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  )
}

export default CurtainTransition