import React, { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'
import tours from '../../data/tours.js'
import { resolveImage } from '../../utils/ImageLoader.js'

import { formatMoney } from '../Tours/Helpers.jsx'

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
const ribbonImage = resolveImage('/images/content/random/ribbon.webp')

// -----------------------------------------------------------------------------
// helpers
// -----------------------------------------------------------------------------
const formatPrice = (amount, currency = 'ZAR') => {
  const value = Number(amount || 0)

  try {
    return formatMoney(value, currency)
  } catch (error) {
    console.error('Error formatting price:', error)
    return `${currency} ${value.toFixed(2)}`
  }
}

const getFeaturedTours = () => {
  const selected = FEATURED_SLUGS.map((slug) =>
    tours.find((tour) => tour.slug === slug)
  ).filter(Boolean)

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

const getDetailsPath = (tour) => tour.canonicalPath || `/tours/${tour.slug}`

// -----------------------------------------------------------------------------
// small display components
// -----------------------------------------------------------------------------
const StarRating = ({ stars = 5, rating }) => (
  <div
    className="flex items-center gap-1"
    aria-label={`${rating || stars} rating`}
  >
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

const PricePill = ({ price, className = '' }) => (
  <div
    className={`inline-flex items-center gap-2 rounded-lg bg-black/24 px-3 py-2 ring-1 ring-white/12 backdrop-blur-sm ${className}`}
  >
    <span className="font-bitter text-[10px] font-black uppercase tracking-[0.14em] text-white/86">
      From
    </span>
    <span className="font-frank text-[1.7rem] font-black leading-none text-white lg:text-[1.95rem]">
      {price}
    </span>
  </div>
)

const BookLink = ({ to, className = '' }) => (
  <Link
    to={to}
    onClick={(event) => event.stopPropagation()}
    className={`inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 font-bitter text-xs font-black uppercase tracking-[0.12em] text-blue-900 shadow-[0_10px_24px_rgba(0,0,0,0.10)] transition hover:bg-green-100 ${className}`}
  >
    View &amp; book
    <ArrowIcon className="h-3 w-3" />
  </Link>
)

// fades an info block in/out and staggers its [data-animate-line] children
const animateInfo = (info, isActive, { enter, exit, lineY }) => {
  if (!info) return

  const lines = info.querySelectorAll('[data-animate-line]')

  gsap.killTweensOf(info)

  if (isActive) {
    gsap.set(info, { pointerEvents: 'auto' })

    gsap.to(info, {
      opacity: 1,
      y: 0,
      duration: enter,
      ease: 'power2.out',
      overwrite: true,
    })

    gsap.fromTo(
      lines,
      { y: lineY, opacity: 0 },
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
    gsap.to(info, {
      opacity: 0,
      y: 6,
      duration: exit,
      ease: 'power2.out',
      overwrite: true,
      onComplete: () => gsap.set(info, { pointerEvents: 'none' }),
    })
  }
}

// -----------------------------------------------------------------------------
// main component
// no container background, border or title: just the cards.
// "See all tours" lives in its own section (SeeAllTours.jsx).
// -----------------------------------------------------------------------------
function SuggestedTours() {
  const sectionRef = useRef(null)
  const cardRefs = useRef([])
  const thumbRefs = useRef([])
  const desktopInfoRefs = useRef([])
  const mobileInfoRefs = useRef([])
  const swipeStartRef = useRef({ x: 0, y: 0, time: 0 })

  const [activeIndex, setActiveIndex] = useState(0)

  const featuredTours = useMemo(() => getFeaturedTours(), [])
  const activeTour = featuredTours[activeIndex] || featuredTours[0]

  const reduceMotion = useMemo(() => prefersReducedMotion(), [])

  const getTourImage = useCallback((tour) => {
    const rawImage = tour?.image || tour?.images?.[0]

    return resolveImage(rawImage)
  }, [])

  // ---------------------------------------------------------------------------
  // mobile swipe navigation
  // ---------------------------------------------------------------------------
  const goToTour = useCallback(
    (direction) => {
      const total = featuredTours.length
      if (!total) return

      setActiveIndex((current) =>
        direction === 'next'
          ? (current + 1) % total
          : (current - 1 + total) % total
      )
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

      const isSwipe =
        Math.abs(deltaX) > 42 &&
        Math.abs(deltaX) > Math.abs(deltaY) * 1.35 &&
        elapsed < 700

      if (!isSwipe) return

      goToTour(deltaX < 0 ? 'next' : 'prev')
    },
    [goToTour]
  )

  // ---------------------------------------------------------------------------
  // entrance animation – y only, opacity is left to CSS classes
  // ---------------------------------------------------------------------------
  useLayoutEffect(() => {
    const elements = [
      ...cardRefs.current.filter(Boolean),
      ...thumbRefs.current.filter(Boolean),
    ]

    if (!elements.length || reduceMotion) return undefined

    const touch = window.matchMedia?.('(pointer: coarse)').matches

    const ctx = gsap.context(() => {
      gsap.set(elements, {
        force3D: true,
        willChange: 'transform',
        y: touch ? 0 : 10,
      })

      gsap.to(elements, {
        y: 0,
        duration: touch ? 0.18 : 0.46,
        stagger: touch ? 0 : 0.035,
        ease: 'power2.out',
        onComplete: () => gsap.set(elements, { clearProps: 'opacity' }),
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [reduceMotion])

  // ---------------------------------------------------------------------------
  // active tour animations
  // ---------------------------------------------------------------------------
  useLayoutEffect(() => {
    if (reduceMotion) {
      ;[...desktopInfoRefs.current, ...mobileInfoRefs.current].forEach(
        (info, index) => {
          if (!info) return
          const tourIndex = index % featuredTours.length
          info.style.opacity = tourIndex === activeIndex ? '1' : '0'
        }
      )

      return undefined
    }

    thumbRefs.current.forEach((thumb, index) => {
      if (!thumb) return

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

    desktopInfoRefs.current.forEach((info, index) =>
      animateInfo(info, index === activeIndex, {
        enter: 0.18,
        exit: 0.14,
        lineY: 14,
      })
    )

    mobileInfoRefs.current.forEach((info, index) =>
      animateInfo(info, index === activeIndex, {
        enter: 0.16,
        exit: 0.12,
        lineY: 12,
      })
    )

    return undefined
  }, [activeIndex, reduceMotion, featuredTours.length])

  if (!activeTour) return null

  return (
    <section
      ref={sectionRef}
      aria-label="Featured tours"
      className="relative mx-auto w-full max-w-5xl"
    >
      {/* ------------------------------------------------------------------- */}
      {/* desktop / tablet tour cards                                         */}
      {/* ------------------------------------------------------------------- */}
      <div className="hidden h-[22rem] gap-2.5 md:flex md:gap-3 lg:h-[23rem] lg:gap-3.5">
        {featuredTours.map((tour, index) => {
          const image = getTourImage(tour)
          const price = formatPrice(tour.priceBase, tour.baseCurrency)
          const isActive = index === activeIndex
          const packageTour = isPackageTour(tour)

          return (
            <article
              key={tour.id}
              ref={(el) => {
                cardRefs.current[index] = el
              }}
              role="button"
              tabIndex={0}
              aria-label={`Open ${tour.title}`}
              onClick={() => setActiveIndex(index)}
              onFocus={() => setActiveIndex(index)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  setActiveIndex(index)
                }
              }}
              className={`group relative min-w-0 cursor-pointer overflow-hidden rounded-xl shadow-[0_16px_36px_rgba(15,23,42,0.10)] transition-[flex,opacity] duration-300 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                isActive
                  ? 'flex-[4.2] opacity-100'
                  : 'flex-[0.82] opacity-50 hover:flex-[1.02] hover:opacity-90'
              }`}
            >
              <img
                src={image}
                alt={`${tour.title} tour preview`}
                loading={index === 0 ? 'eager' : 'lazy'}
                fetchPriority={index === 0 ? 'high' : 'auto'}
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/[0.02] to-transparent" />

              {isActive && packageTour && (
                <>
                  <PackageBadge className="absolute left-3 top-3 z-20" />

                  <PackageRibbon className="right-[-1.2rem] top-[-0.35rem] w-[9.6rem] lg:right-[-1.45rem] lg:top-[-0.55rem] lg:w-[10.8rem]" />
                </>
              )}

              {!isActive && (
                <div className="absolute inset-x-0 bottom-0 p-3">
                  <h3 className="rotate-180 font-frank text-lg font-black leading-none text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.35)] [writing-mode:vertical-rl]">
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
                <h3
                  data-animate-line
                  className="font-frank text-3xl font-black leading-[0.95] text-white lg:text-4xl"
                >
                  {tour.title}
                </h3>

                <div
                  data-animate-line
                  className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2"
                >
                  <PricePill price={price} />

                  <div className="flex items-center gap-2">
                    <StarRating stars={tour.stars} rating={tour.rating} />
                    <span className="font-frank text-white/68">
                      ({tour.otherReviews || 0})
                    </span>
                  </div>
                </div>

                <div data-animate-line className="mt-4">
                  <BookLink to={getDetailsPath(tour)} />
                </div>
              </div>
            </article>
          )
        })}
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* mobile                                                              */}
      {/* ------------------------------------------------------------------- */}
      <div className="md:hidden">
        {featuredTours.map((tour, index) => {
          if (index !== activeIndex) return null

          const image = getTourImage(tour)
          const price = formatPrice(tour.priceBase, tour.baseCurrency)
          const packageTour = isPackageTour(tour)

          return (
            <article
              key={tour.id}
              ref={(el) => {
                cardRefs.current[index] = el
              }}
              className="relative min-h-[21rem] touch-pan-y overflow-hidden rounded-xl shadow-[0_16px_36px_rgba(15,23,42,0.10)]"
              onTouchStart={handleSwipeStart}
              onTouchEnd={handleSwipeEnd}
            >
              <img
                src={image}
                alt={`${tour.title} tour preview`}
                loading="eager"
                fetchPriority="high"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/[0.02] to-transparent" />

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
                className="absolute inset-x-0 bottom-0 px-3 pb-3 pt-0"
              >
                <h3
                  data-animate-line
                  className="max-w-[78%] font-frank text-[2rem] font-black leading-[0.95] text-white"
                >
                  {tour.title}
                </h3>

                <div
                  data-animate-line
                  className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2"
                >
                  <PricePill price={price} />
                  <StarRating stars={tour.stars} rating={tour.rating} />
                </div>

                <div data-animate-line className="mt-3">
                  <BookLink to={getDetailsPath(tour)} className="w-full py-3" />
                </div>
              </div>
            </article>
          )
        })}

        {/* thumbnail carousel */}
        <div
          className="flex touch-pan-x gap-2 overflow-x-auto pb-1 pt-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          onTouchStart={handleSwipeStart}
          onTouchEnd={handleSwipeEnd}
        >
          {featuredTours.map((tour, index) => {
            const image = getTourImage(tour)
            const isActive = index === activeIndex

            return (
              <button
                key={tour.id}
                ref={(el) => {
                  thumbRefs.current[index] = el
                }}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`relative h-20 min-w-[6.35rem] overflow-hidden rounded-xl border-2 transition duration-200 ${
                  isActive
                    ? 'border-blue-600'
                    : 'border-transparent opacity-60'
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
      </div>
    </section>
  )
}

export default SuggestedTours