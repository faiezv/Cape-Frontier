import React, { useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const MyTransition = ({ pathname, outlet, onSwap, onReady }) => {
  const latest = useRef(pathname)
  latest.current = pathname

  return (
    <AnimatePresence
      mode="wait"
      initial={false}
      onExitComplete={() => {
        onSwap(latest.current)     // old page gone
        requestAnimationFrame(onReady) // new page visible (call later if you animate in)
      }}
    >
      <motion.div key={pathname} className="min-h-screen" /* your variants */>
        {outlet}
      </motion.div>
    </AnimatePresence>
  )
}
export default MyTransition