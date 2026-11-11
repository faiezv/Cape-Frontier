import React, { useCallback, useEffect, useRef, useState } from 'react'

const ArrowDownIcon = ({ className = 'h-4 w-4' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 5v14" />
    <path d="m6 13 6 6 6-6" />
  </svg>
)

// Motion lives in CSS and only runs when the visitor has not asked for reduced motion.
const Styles = () => (
  <style>{`
    @media (prefers-reduced-motion: no-preference) {
      @keyframes sat-rise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
      @keyframes sat-ring { 0% { transform: scale(1); opacity: .45; } 70%, 100% { transform: scale(1.22, 1.55); opacity: 0; } }
      @keyframes sat-shimmer { 0%, 55% { transform: translateX(-160%) skewX(-22deg); } 100% { transform: translateX(380%) skewX(-22deg); } }
      @keyframes sat-bob { 0%, 100% { transform: translateY(-1px); } 50% { transform: translateY(3px); } }
      .sat-hidden { opacity: 0; }
      .sat-shown { animation: sat-rise .6s cubic-bezier(.2,.7,.2,1) both; }
      .sat-ring { animation: sat-ring 2.6s ease-out infinite; }
      .sat-shimmer { animation: sat-shimmer 4.2s ease-in-out infinite; }
      .sat-bob { animation: sat-bob 1.4s ease-in-out infinite; }
      .group:hover .sat-bob { animation-play-state: paused; }
    }
  `}</style>
)

const BUTTON_CLASSES =
  'group relative inline-flex min-h-12 items-center gap-3 overflow-hidden rounded-full bg-blue-700 py-2.5 pl-6 pr-3 font-bitter text-sm font-black text-white shadow-[0_14px_32px_rgba(0,30,255,0.28)] transition duration-300 hover:-translate-y-0.5 hover:bg-blue-800 hover:shadow-[0_18px_38px_rgba(0,30,255,0.34)] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 sm:text-base'

/**
 * Call-to-action that sits directly beneath the tour browser.
 *
 * - `href`      → render a real <a> (e.g. href="/tours"). Wins over scrolling.
 * - `targetId`  → element to smooth-scroll to when no href is given.
 * - `label`     → button copy.
 */
function SeeAllTours({
  targetId = 'featured-tours',
  fallbackId = 'journey-start',
  label = 'Browse all tours',
  href = null,
  className = '',
}) {
  const sectionRef = useRef(null)
  const [shown, setShown] = useState(false)

  // Play the entrance once, when the block actually reaches the screen.
  useEffect(() => {
    const el = sectionRef.current
    if (!el) return undefined

    if (typeof IntersectionObserver === 'undefined') {
      setShown(true)
      return undefined
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true)
          io.disconnect()
        }
      },
      { threshold: 0.3 }
    )

    io.observe(el)
    return () => io.disconnect()
  }, [])

  const scrollToTarget = useCallback(() => {
    const target =
      document.getElementById(targetId) ||
      (fallbackId ? document.getElementById(fallbackId) : null)

    if (!target) return

    const y = target.getBoundingClientRect().top + window.scrollY

    if (window.lenis) {
      window.lenis.scrollTo(y, { duration: 0.85, force: true })
      return
    }

    window.scrollTo({ top: y, behavior: 'smooth' })
  }, [targetId, fallbackId])

  const inner = (
    <>
      {/* light sweep across the button */}
      <span
        aria-hidden="true"
        className="sat-shimmer pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-white/25"
      />

      <span id="see-all-tours-title" className="relative">
        {label}
      </span>

      <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-white text-blue-700">
        <ArrowDownIcon className="sat-bob h-4 w-4" />
      </span>
    </>
  )

  return (
    <section
      ref={sectionRef}
      aria-labelledby="see-all-tours-title"
      className={`flex w-full justify-center px-4 py-6 sm:py-8 ${className}`}
    >
      <Styles />

      <div
        className={`flex max-w-xl flex-col items-center text-center ${
          shown ? 'sat-shown' : 'sat-hidden'
        }`}
      >
        <div className="relative">
          {/* soft pulsing halo behind the button */}
          <span
            aria-hidden="true"
            className="sat-ring pointer-events-none absolute inset-0 rounded-full bg-blue-700/40"
          />

          {href ? (
            <a href={href} className={BUTTON_CLASSES}>
              {inner}
            </a>
          ) : (
            <button type="button" onClick={scrollToTarget} className={BUTTON_CLASSES}>
              {inner}
            </button>
          )}
        </div>
      </div>
    </section>
  )
}

export default SeeAllTours