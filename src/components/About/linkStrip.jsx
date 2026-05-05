import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import arrowIcon from '/icons/topRightArrow.png'

const stripItems = [
  {
    label: 'Cape Town classics',
    text: 'Table Mountain · Robben Island · Cape Point',
    accent: 'green',
  },
  {
    label: 'Private guided routes',
    text: 'Flexible pickups · Local insight · Scenic stops',
    accent: 'blue',
  },
  {
    label: 'Signature experiences',
    text: 'Wine routes · Coastal drives · Hidden gems',
    accent: 'green',
  },
  {
    label: 'Premium planning',
    text: 'Comfortable travel · Curated stops · Local guides',
    accent: 'blue',
  },
]

const LinkStrip = () => {
  const stripRef = useRef(null)
  const wrapperRef = useRef(null)
  const animationRef = useRef(null)
  const resizeTimerRef = useRef(null)
  const [isPaused, setIsPaused] = useState(false)

  const setupMarquee = () => {
    const wrapper = wrapperRef.current

    if (!wrapper) return

    gsap.killTweensOf(wrapper)

    const totalWidth = wrapper.scrollWidth / 2

    if (!totalWidth) return

    gsap.set(wrapper, { x: 0 })

    animationRef.current = gsap.to(wrapper, {
      x: -totalWidth,
      duration: 42,
      ease: 'none',
      repeat: -1,
      modifiers: {
        x: (x) => `${parseFloat(x) % totalWidth}px`,
      },
    })
  }

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      setupMarquee()

      gsap.fromTo(
        '.link-strip-item',
        {
          y: 8,
          opacity: 0,
          filter: 'blur(4px)',
        },
        {
          y: 0,
          opacity: 1,
          filter: 'blur(0px)',
          duration: 0.55,
          stagger: 0.05,
          ease: 'power3.out',
        }
      )
    }, stripRef)

    const handleResize = () => {
      clearTimeout(resizeTimerRef.current)

      resizeTimerRef.current = setTimeout(() => {
        setupMarquee()
      }, 160)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      clearTimeout(resizeTimerRef.current)
      window.removeEventListener('resize', handleResize)
      ctx.revert()
    }
  }, [])

  useEffect(() => {
    if (!animationRef.current) return

    gsap.to(animationRef.current, {
      timeScale: isPaused ? 0.12 : 1,
      duration: 0.55,
      ease: 'power2.out',
    })
  }, [isPaused])

  const StripItem = ({ item }) => {
    const isGreen = item.accent === 'green'

    return (
      <a
        href="#tours"
        className="link-strip-item group flex shrink-0 items-center gap-3 rounded-full border border-black/[0.05] bg-white/45 px-4 py-2 text-black/70 shadow-[0_8px_24px_rgba(15,23,42,0.045)] backdrop-blur-md transition-all duration-500 hover:-translate-y-0.5 hover:bg-white/75 hover:text-black hover:shadow-[0_12px_30px_rgba(15,23,42,0.08)]"
      >
        <span
          className={`h-2 w-2 rounded-full ${
            isGreen ? 'bg-green-300' : 'bg-blue-300'
          } shadow-[0_0_14px_currentColor]`}
        />

        <span
          className={`text-[9px] font-bold uppercase tracking-[0.22em] ${
            isGreen ? 'text-green-700/70' : 'text-blue-700/70'
          }`}
        >
          {item.label}
        </span>

        <span className="h-3 w-px bg-black/10" />

        <span className="text-xs font-medium text-black/55 transition-colors duration-300 group-hover:text-black/75 sm:text-sm">
          {item.text}
        </span>

        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-black/[0.035] transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:bg-green-200/40">
          <img src={arrowIcon} alt="" className="h-3 w-3 opacity-60" />
        </span>
      </a>
    )
  }

  return (
    <section
      ref={stripRef}
      className="relative w-full overflow-hidden border-y border-black/[0.04] bg-white/45 py-1.5 backdrop-blur-xl"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-16 bg-gradient-to-r from-white via-white/75 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-20 w-16 bg-gradient-to-l from-white via-white/75 to-transparent" />

      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-green-200/50 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-blue-300/30 to-transparent" />

      <div
        ref={wrapperRef}
        className="flex w-max flex-row items-center gap-3 px-5 will-change-transform sm:px-8"
      >
        {[...stripItems, ...stripItems].map((item, index) => (
          <StripItem key={`${item.label}-${index}`} item={item} />
        ))}
      </div>
    </section>
  )
}

export default LinkStrip