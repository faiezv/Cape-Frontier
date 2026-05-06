import React, { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'
import tours from '../../data/tours.js'

// -----------------------------------------------------------------------------
// featured tour selection
// keep this list small because this section is only a quick preview before tours
// -----------------------------------------------------------------------------
const FEATURED_SLUGS = [
  'peninsula-tour-2',
  'stellenbosch-wine-farms',
  'paragliding',
  'lions-head-hike',
]

// ribbon asset used on package-style cards
const ribbonImage = '/images/content/random/ribbon.webp'

// -----------------------------------------------------------------------------
// helpers
// -----------------------------------------------------------------------------
const formatPrice = (amount, currency = 'ZAR') => {
  const value = Number(amount || 0)

  try {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(value)
  } catch {
    return `${currency} ${value.toLocaleString('en-ZA')}`
  }
}

const getFeaturedTours = () => {
  const selected = FEATURED_SLUGS.map((slug) => tours.find((tour) => tour.slug === slug)).filter(Boolean)

  if (selected.length >= 4) return selected.slice(0, 4)

  const fallback = [...tours]
    .sort((a, b) => {
      const ratingDiff = Number(b.rating || 0) - Number(a.rating || 0)
      if (ratingDiff !== 0) return ratingDiff
      return Number(b.otherReviews || 0) - Number(a.otherReviews || 0)
    })
    .filter((tour) => !selected.some((item) => item.id === tour.id))

  return [...selected, ...fallback].slice(0, 4)
}

const isTouchDevice = () => {
  if (typeof window === 'undefined') return false

  return (
    window.matchMedia?.('(pointer: coarse)').matches ||
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0
  )
}

const prefersReducedMotion = () => {
  if (typeof window === 'undefined') return true
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}

const isPackageTour = (tour) => {
  const type = String(tour?.type || '').toLowerCase()
  const category = String(tour?.category || '').toLowerCase()
  const title = String(tour?.title || '').toLowerCase()

  return (
    type.includes('packages') ||
    type.includes('wine') ||
    category.includes('package') ||
    title.includes('package') ||
    title.includes('tour')
  )
}

// -----------------------------------------------------------------------------
// small display components
// -----------------------------------------------------------------------------
const StarRating = ({ stars = 5, rating }) => (
  <div className="flex items-center gap-1" aria-label={`${rating || stars} rating`}>
    <span className="font-frank text-sm font-black text-white">{rating}</span>

    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, index) => (
        <svg
          key={index}
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill={index < stars ? '#FACC15' : 'none'}
          stroke="#FACC15"
          strokeWidth="1.5"
          aria-hidden="true"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  </div>
)

const ArrowIcon = ({ className = 'h-3.5 w-3.5' }) => (
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
    <path d="M5 12h14" />
    <path d="m13 6 6 6-6 6" />
  </svg>
)

const PackageBadge = ({ className = '' }) => (
  <div
    className={`inline-flex items-center gap-1.5 rounded-md border border-red-200/40 bg-red-500/95 px-2.5 py-1 font-bitter text-[9px] font-black uppercase tracking-[0.14em] text-white shadow-[0_8px_18px_rgba(0,0,0,0.18)] ${className}`}
  >
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-white" aria-hidden="true">
      <path d="M5 10h14v10H5V10Zm1.5-5.2c1.6-1 3.5-.4 5.5 2 2-2.4 3.9-3 5.5-2 1.4.9 1.6 2.9.4 4.2H21v4H3V9h3.1C4.9 7.7 5.1 5.7 6.5 4.8ZM9.4 6c-.8-.5-1.7-.3-2.1.3-.4.7 0 1.6.9 2.1h2.6C10.3 7.3 9.8 6.4 9.4 6Zm5.2 0c-.4.4-.9 1.3-1.4 2.4h2.6c.9-.5 1.3-1.4.9-2.1-.4-.6-1.3-.8-2.1-.3Z" />
    </svg>
    Package
  </div>
)

const PackageRibbon = ({ className = '' }) => (
  <div
    className={`pointer-events-none absolute z-20 ${className}`}
    aria-hidden="true"
  >
    <img
      src={ribbonImage}
      alt=""
      className="h-auto w-full object-contain drop-shadow-[0_12px_20px_rgba(0,0,0,0.18)]"
      loading="lazy"
      decoding="async"
      style={{ transform: 'scaleX(-1)' }}
    />
  </div>
)

const ReviewPill = ({ onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="group inline-flex w-full items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-3.5 py-2.5 text-left text-neutral-900 backdrop-blur-md transition duration-300 hover:bg-green-100 sm:rounded-2xl"
  >
    <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-500 text-white shadow-[0_8px_18px_rgba(34,197,94,0.22)]">
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
        <path d="M9.2 16.6 4.9 12.3l1.4-1.4 2.9 2.9 8.5-8.5 1.4 1.4-9.9 9.9Z" />
      </svg>
    </span>

    <span className="min-w-0">
      <span className="block font-bitter text-[10px] font-black uppercase tracking-[0.12em] text-green-700">
        verified guest feedback
      </span>
      <span className="block font-bitter text-[11px] leading-4 text-neutral-700 md:text-[12px]">
        see our reviews and why travellers keep choosing cape frontier
      </span>
    </span>
  </button>
)

// -----------------------------------------------------------------------------
// main component
// -----------------------------------------------------------------------------
function SuggestedTours() {
  // refs used by GSAP animations and mobile swipe handling
  const sectionRef = useRef(null)
  const cardRefs = useRef([])
  const thumbRefs = useRef([])
  const desktopInfoRefs = useRef([])
  const mobileInfoRefs = useRef([])
  const swipeStartRef = useRef({ x: 0, y: 0, time: 0 })

  // active card state: only one tour opens at a time
  const [activeIndex, setActiveIndex] = useState(0)

  // data derived from tours.js
  const featuredTours = useMemo(() => getFeaturedTours(), [])
  const activeTour = featuredTours[activeIndex] || featuredTours[0]

  const touchDevice = useMemo(() => isTouchDevice(), [])
  const reduceMotion = useMemo(() => prefersReducedMotion(), [])

  // navigation helpers
  // primaryId is tried first; fallbackId is used when that section is not on the page
  const scrollToSection = useCallback((primaryId, fallbackId = null) => {
    const target =
      document.getElementById(primaryId) ||
      (fallbackId ? document.getElementById(fallbackId) : null)

    if (!target) return

    const y = target.getBoundingClientRect().top + window.scrollY

    if (window.lenis) {
      window.lenis.scrollTo(y, {
        duration: 0.85,
        force: true,
      })
      return
    }

    window.scrollTo({
      top: y,
      behavior: 'smooth',
    })
  }, [])

  const scrollToTours = useCallback(() => {
    scrollToSection('tours', 'featured-tours')
  }, [scrollToSection])

  const scrollToReviews = useCallback(() => {
    scrollToSection('reviews', 'stories')
  }, [scrollToSection])

  // mobile swipe / carousel navigation
  const goToTour = useCallback(
    (direction) => {
      if (!featuredTours.length) return

      setActiveIndex((current) => {
        if (direction === 'next') {
          return (current + 1) % featuredTours.length
        }

        return (current - 1 + featuredTours.length) % featuredTours.length
      })
    },
    [featuredTours.length]
  )

  const handleSwipeStart = useCallback((event) => {
    const touch = event.touches?.[0]
    if (!touch) return

    swipeStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    }
  }, [])

  const handleSwipeEnd = useCallback(
    (event) => {
      const touch = event.changedTouches?.[0]
      if (!touch) return

      const start = swipeStartRef.current
      const deltaX = touch.clientX - start.x
      const deltaY = touch.clientY - start.y
      const elapsed = Date.now() - start.time

      const horizontalSwipe = Math.abs(deltaX) > 42
      const mostlyHorizontal = Math.abs(deltaX) > Math.abs(deltaY) * 1.35
      const notTooSlow = elapsed < 700

      if (!horizontalSwipe || !mostlyHorizontal || !notTooSlow) return

      if (deltaX < 0) {
        goToTour('next')
      } else {
        goToTour('prev')
      }
    },
    [goToTour]
  )

  // initial entrance animation for cards/thumbs
  useLayoutEffect(() => {
    const cards = cardRefs.current.filter(Boolean)
    const thumbs = thumbRefs.current.filter(Boolean)

    if ((!cards.length && !thumbs.length) || reduceMotion) return undefined

    const ctx = gsap.context(() => {
      gsap.set([...cards, ...thumbs], {
        force3D: true,
        willChange: 'transform, opacity',
      })

      gsap.fromTo(
        [...cards, ...thumbs],
        {
          y: touchDevice ? 0 : 10,
          opacity: touchDevice ? 1 : 0,
        },
        {
          y: 0,
          opacity: 1,
          duration: touchDevice ? 0.18 : 0.46,
          stagger: touchDevice ? 0 : 0.035,
          ease: 'power2.out',
        }
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [touchDevice, reduceMotion])

  useLayoutEffect(() => {
    const thumbs = thumbRefs.current.filter(Boolean)
    const desktopInfos = desktopInfoRefs.current.filter(Boolean)
    const mobileInfos = mobileInfoRefs.current.filter(Boolean)

    if (reduceMotion) {
      desktopInfos.forEach((info, index) => {
        info.style.opacity = index === activeIndex ? '1' : '0'
      })
      mobileInfos.forEach((info, index) => {
        info.style.opacity = index === activeIndex ? '1' : '0'
      })
      return undefined
    }

    thumbs.forEach((thumb, index) => {
      gsap.killTweensOf(thumb)
      gsap.to(thumb, {
        y: 0,
        opacity: index === activeIndex ? 1 : 0.84,
        scale: index === activeIndex ? 1.01 : 1,
        duration: 0.18,
        ease: 'power2.out',
        overwrite: true,
      })
    })

    desktopInfoRefs.current.forEach((info, index) => {
      if (!info) return

      const lines = info.querySelectorAll('[data-animate-line]')

      if (index === activeIndex) {
        gsap.killTweensOf(info)
        gsap.set(info, { pointerEvents: 'auto' })
        gsap.to(info, {
          opacity: 1,
          y: 0,
          duration: 0.18,
          ease: 'power2.out',
          overwrite: true,
        })

        gsap.fromTo(
          lines,
          {
            y: 14,
            opacity: 0,
          },
          {
            y: 0,
            opacity: 1,
            stagger: 0.045,
            duration: 0.26,
            ease: 'power2.out',
            overwrite: true,
            delay: 0.01,
          }
        )
      } else {
        gsap.killTweensOf(info)
        gsap.to(info, {
          opacity: 0,
          y: 6,
          duration: 0.14,
          ease: 'power2.out',
          overwrite: true,
          onComplete: () => gsap.set(info, { pointerEvents: 'none' }),
        })
      }
    })

    mobileInfoRefs.current.forEach((info, index) => {
      if (!info) return

      const lines = info.querySelectorAll('[data-animate-line]')

      if (index === activeIndex) {
        gsap.killTweensOf(info)
        gsap.set(info, { pointerEvents: 'auto' })
        gsap.to(info, {
          opacity: 1,
          y: 0,
          duration: 0.16,
          ease: 'power2.out',
          overwrite: true,
        })

        gsap.fromTo(
          lines,
          {
            y: 12,
            opacity: 0,
          },
          {
            y: 0,
            opacity: 1,
            stagger: 0.04,
            duration: 0.24,
            ease: 'power2.out',
            overwrite: true,
            delay: 0.01,
          }
        )
      } else {
        gsap.killTweensOf(info)
        gsap.to(info, {
          opacity: 0,
          y: 6,
          duration: 0.12,
          ease: 'power2.out',
          overwrite: true,
          onComplete: () => gsap.set(info, { pointerEvents: 'none' }),
        })
      }
    })

    return undefined
  }, [activeIndex, reduceMotion])

  if (!activeTour) return null

  return (
    // ---------------------------------------------------------------------------
    // section shell
    // ---------------------------------------------------------------------------
    <section
      ref={sectionRef}
      aria-labelledby="suggested-tours-title"
      className="relative mx-auto w-full max-w-5xl overflow-hidden rounded-[16px] bg-white"
    >
      <div className="absolute inset-0 border border-black/5 bg-white shadow-[0_18px_45px_rgba(15,10,113,0.08)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 hero-gradient" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white" />

      <div className="relative pb-3 pt-4 sm:px-4 sm:pb-5 sm:pt-5 md:px-5 md:pb-5 md:pt-6 lg:px-6 lg:pb-6 lg:pt-6">
        <div className="mb-3 flex flex-col gap-3 px-2.5 text-neutral-950 sm:mb-5 sm:px-0 md:mb-6 md:grid md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:gap-5 lg:mb-7">
          <div className="max-w-xl text-center sm:text-left md:max-w-2xl md:rounded-2xl md:border md:border-black/5 md:bg-white/70 md:px-4 md:py-3 md:shadow-[0_14px_34px_rgba(15,23,42,0.05)] md:backdrop-blur-sm lg:px-5">
            <p className="font-bitter text-[10px] font-black uppercase tracking-[0.22em] text-blue-600 md:text-[11px] md:tracking-[0.24em]">
              Suggested tours
            </p>

            <h2
              id="suggested-tours-title"
              className="mt-1 font-frank text-2xl font-black leading-none tracking-tight sm:text-3xl md:text-[2rem] lg:text-[2.2rem]"
            >
              Pick a favourite fast.
            </h2>

            <p className="mt-2 hidden max-w-xl font-bitter text-sm leading-6 text-neutral-600 sm:block md:text-sm md:leading-6">
              One tour opens at a time. The rest stay compact so the section stays short and quick
              to scan.
            </p>
          </div>

          <div className="hidden gap-2 sm:flex sm:items-center md:flex-col md:items-stretch lg:flex-row lg:items-center">
            <button
              type="button"
              onClick={scrollToTours}
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-3 font-bitter text-sm font-black text-white shadow-[0_14px_34px_rgba(0,30,255,0.16)] transition duration-300 hover:-translate-y-0.5 hover:bg-blue-800 sm:px-5"
              aria-label="Browse all Cape Frontier tours"
            >
              Browse all tours
              <ArrowIcon className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
            </button>

            <button
              type="button"
              onClick={scrollToReviews}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 font-bitter text-sm font-black text-blue-800 backdrop-blur-md transition duration-300 hover:bg-blue-100 hover:text-blue-900 sm:px-5"
            >
              See all reviews
              <ArrowIcon className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* desktop / tablet layout: flex accordion cards */}
        {/* touch devices using this layout can also swipe left/right */}
        <div
          className="hidden h-[22rem] touch-pan-y gap-2.5 md:flex md:gap-3 lg:h-[23rem] lg:gap-3.5"
          onTouchStart={handleSwipeStart}
          onTouchEnd={handleSwipeEnd}
        >
          {featuredTours.map((tour, index) => {
            const image = tour.image || tour.images?.[0]
            const price = formatPrice(tour.priceBase, tour.baseCurrency)
            const isActive = index === activeIndex
            const detailsPath = tour.canonicalPath || `/tours/${tour.slug}`
            const packageTour = isPackageTour(tour)

            return (
              <article
                key={tour.id}
                ref={(el) => {
                  cardRefs.current[index] = el
                }}
                className={`group relative min-w-0 cursor-pointer touch-pan-y overflow-hidden border border-black/5 bg-white shadow-[0_16px_36px_rgba(15,23,42,0.10)] ring-1 ring-black/[0.025] backdrop-blur-sm transition-[flex,opacity] duration-300 ease-out ${
                  isActive
                    ? 'flex-[4.2] rounded-xl opacity-100'
                    : 'flex-[0.82] rounded-xl opacity-80 hover:flex-[1.02] hover:opacity-100'
                }`}
                onClick={() => setActiveIndex(index)}
                aria-label={`Open ${tour.title}`}
              >
                <img
                  src={image}
                  alt={`${tour.title} tour preview`}
                  loading={index === 0 ? 'eager' : 'lazy'}
                  fetchPriority={index === 0 ? 'high' : 'auto'}
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/36 via-black/[0.02] to-transparent" />

                {isActive && packageTour && (
                  <>
                    <PackageBadge className="absolute left-3 top-3 z-20" />
                    <PackageRibbon className="right-[-1.2rem] top-[-0.35rem] w-[9.6rem] lg:right-[-1.45rem] lg:top-[-0.55rem] lg:w-[10.8rem]" />
                  </>
                )}

                {!isActive && (
                  <div className="absolute inset-x-0 bottom-0 p-3">
                    <div className="mb-2 h-8 w-8 rounded-full border border-white/20 bg-black/30 text-center font-bitter text-xs font-black leading-8 text-white backdrop-blur-md">
                      {index + 1}
                    </div>

                    <h3 className="[writing-mode:vertical-rl] rotate-180 font-frank text-lg font-black leading-none text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.35)]">
                      {tour.title}
                    </h3>
                  </div>
                )}

                <div
                  ref={(el) => {
                    desktopInfoRefs.current[index] = el
                  }}
                  className={`absolute inset-x-0 bottom-0 max-w-xl p-4 transition-opacity duration-200 sm:p-5 ${
                    isActive ? 'opacity-100' : 'pointer-events-none opacity-0'
                  }`}
                >
                  <div className="max-w-xl">
                    <h3
                      data-animate-line
                      className="font-frank text-3xl font-black leading-[0.95] text-white lg:text-4xl"
                    >
                      {tour.title}
                    </h3>

                    <div data-animate-line className="mt-3 flex flex-wrap items-center gap-3">
                      <StarRating stars={tour.stars} rating={tour.rating} />
                      <span className="font-frank text-white/68">({tour.otherReviews || 0})</span>

                      <div className="inline-flex items-center gap-2 rounded-lg bg-black/24 px-3 py-2 ring-1 ring-white/12 backdrop-blur-sm">
                        <span className="font-bitter text-[10px] font-black uppercase tracking-[0.14em] text-white/86">
                          From
                        </span>
                        <span className="font-frank text-[1.7rem] font-black leading-none text-white lg:text-[1.95rem]">
                          {price}
                        </span>
                      </div>
                    </div>

                    <div data-animate-line className="mt-4 flex flex-wrap items-center gap-2">
                      <Link
                        to={detailsPath}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 font-bitter text-xs font-black uppercase tracking-[0.12em] text-blue-900 shadow-[0_10px_24px_rgba(0,0,0,0.10)] transition hover:bg-green-100"
                      >
                        Details
                        <ArrowIcon className="h-3 w-3" />
                      </Link>

                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation()
                          scrollToTours()
                        }}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/18 bg-black/24 px-4 py-2.5 font-bitter text-xs font-black uppercase tracking-[0.12em] text-white backdrop-blur-md transition hover:bg-white hover:text-blue-900"
                      >
                        All tours
                        <ArrowIcon className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            )
          })}
        </div>

        <div className="hidden px-0 pt-3 md:block">
          <p className="mb-2 hidden font-bitter text-[10px] font-black uppercase tracking-[0.16em] text-neutral-500 [@media(pointer:coarse)]:block">
            swipe left or right to preview tours
          </p>
          <ReviewPill onClick={scrollToReviews} />
        </div>

        {/* mobile layout: one active card + swipeable thumbnail navigation */}
        <div className="md:hidden">
          {featuredTours.map((tour, index) => {
            const image = tour.image || tour.images?.[0]
            const price = formatPrice(tour.priceBase, tour.baseCurrency)
            const isActive = index === activeIndex
            const packageTour = isPackageTour(tour)

            if (!isActive) return null

            return (
              <article
                key={tour.id}
                ref={(el) => {
                  cardRefs.current[index] = el
                }}
                className="relative mb-0 min-h-[20rem] touch-pan-y overflow-hidden rounded-none border-y border-black/5 bg-white shadow-[0_16px_36px_rgba(15,23,42,0.10)] ring-0"
                onTouchStart={handleSwipeStart}
                onTouchEnd={handleSwipeEnd}
              >
                <img
                  src={image}
                  alt={`${tour.title} tour preview`}
                  loading={index === 0 ? 'eager' : 'lazy'}
                  fetchPriority={index === 0 ? 'high' : 'auto'}
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/34 via-black/[0.02] to-transparent" />

                {packageTour && (
                  <>
                    <PackageBadge className="absolute left-3 top-3 z-20" />
                    <PackageRibbon className="right-[-0.9rem] top-[-0.25rem] w-[8rem]" />
                  </>
                )}

                <div
                  ref={(el) => {
                    mobileInfoRefs.current[index] = el
                  }}
                  className="absolute inset-x-0 bottom-0 px-3 pb-2.5 pt-0"
                >
                  <h3
                    data-animate-line
                    className="max-w-[78%] font-frank text-[2rem] font-black leading-[0.95] text-white"
                  >
                    {tour.title}
                  </h3>

                  <div data-animate-line className="mt-3 flex flex-wrap items-center gap-3">
                    <StarRating stars={tour.stars} rating={tour.rating} />
                    <div className="inline-flex items-center gap-2 rounded-lg bg-black/24 px-3 py-2 ring-1 ring-white/12 backdrop-blur-sm">
                      <span className="font-bitter text-[10px] font-black uppercase tracking-[0.14em] text-white/86">
                        From
                      </span>
                      <span className="font-frank text-[1.7rem] font-black leading-none text-white">
                        {price}
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            )
          })}

          <div className="px-2.5">
            {/* mobile nav hint + thumbnail carousel */}
            <div className="flex items-center justify-between gap-3 pb-1 pt-2">
              <p className="font-bitter text-[10px] font-black uppercase tracking-[0.16em] text-white/80">
                swipe or tap
              </p>
              <div className="flex items-center gap-1 text-white/75" aria-hidden="true">
                <span className="text-xs">←</span>
                <span className="h-1 w-1 rounded-full bg-white/55" />
                <span className="text-xs">→</span>
              </div>
            </div>

            <div
              className="-mt-px flex touch-pan-x gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              onTouchStart={handleSwipeStart}
              onTouchEnd={handleSwipeEnd}
            >
              {featuredTours.map((tour, index) => {
                const image = tour.image || tour.images?.[0]
                const isActive = index === activeIndex

                return (
                  <button
                    key={tour.id}
                    ref={(el) => {
                      thumbRefs.current[index] = el
                    }}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className={`relative h-20 min-w-[6.35rem] overflow-hidden rounded-xl border transition duration-200 ${
                      isActive
                        ? 'border-blue-300 shadow-[0_10px_24px_rgba(59,130,246,0.16)]'
                        : 'border-black/10 opacity-85'
                    }`}
                    aria-label={`Open ${tour.title}`}
                    aria-pressed={isActive}
                  >
                    <img
                      src={image}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover"
                    />

                    <span className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/[0.02] to-transparent" />

                    <span className="absolute bottom-1.5 left-1.5 right-1.5 line-clamp-1 text-left font-bitter text-[10px] font-black uppercase tracking-[0.1em] text-white">
                      {tour.title}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* bottom mobile navigation buttons */}
            <div className="mt-2.5 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={scrollToReviews}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/25 bg-white/10 px-3 py-3 font-bitter text-[11px] font-black uppercase tracking-[0.12em] text-white backdrop-blur-md transition hover:bg-white/15"
              >
                See reviews
                <ArrowIcon className="h-3 w-3" />
              </button>

              <button
                type="button"
                onClick={scrollToTours}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-3 py-3 font-bitter text-[11px] font-black uppercase tracking-[0.12em] text-blue-900 shadow-[0_12px_24px_rgba(0,0,0,0.12)] transition hover:bg-green-100"
              >
                Browse all
                <ArrowIcon className="h-3 w-3" />
              </button>
            </div>

            {/* full-width trust/review CTA at the very bottom */}
            <div className="hidden mt-2.5">
              <ReviewPill onClick={scrollToReviews} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default SuggestedTours