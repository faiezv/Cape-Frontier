import React, { useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.25, ease: 'easeOut' } },
  exit: { opacity: 0, transition: { duration: 0.2, ease: 'easeIn' } },
}

// Transition contract:
//   props:  pathname, outlet
//   calls:  onSwap(path)  once the old page is gone
//           onReady()     once the new page is visible
const FadeTransition = ({ pathname, outlet, onSwap, onReady }) => {
  const latestPath = useRef(pathname)
  latestPath.current = pathname

  return (
    <AnimatePresence
      mode="wait"
      initial={false} // keeps prerendered HTML fully visible
      onExitComplete={() => {
        onSwap(latestPath.current)
        requestAnimationFrame(onReady)
      }}
    >
      <motion.div
        key={pathname}
        className="min-h-screen"
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {outlet}
      </motion.div>
    </AnimatePresence>
  )
}

export default FadeTransition