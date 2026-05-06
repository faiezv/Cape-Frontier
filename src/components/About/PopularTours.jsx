import { forwardRef, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import tours from '../../data/tours.js'

gsap.registerPlugin(ScrollTrigger)

// ============================================================
// 1. CATEGORY FALLBACKS + DATA HELPERS
// ============================================================

const CATEGORY_META = {
  adrenaline: {
    name: 'Adrenaline',
    slug: 'adrenaline',
    hasNewTour: true,
    description: 'Shark dives, paragliding, gun range & ocean thrills.',
    image: '/images/tours/adrenaline/shark-cage-diving/1.webp',
  },
  hiking: {
    name: 'Hiking',
    slug: 'hiking',
    hasNewTour: false,
    description: 'Lion’s Head and Table Mountain trail experiences.',
    image: '/images/tours/hiking/lions-head/1.webp',
  },
  historical: {
    name: 'Historical',
    slug: 'historical',
    hasNewTour: true,
    description: 'Robben Island, Langa and cultural Cape Town stories.',
    image: '/images/tours/historical/robben-island/1.webp',
  },
  packages: {
    name: 'Packages',
    slug: 'packages',
    hasNewTour: true,
    description: 'Cape Peninsula routes, scenic stops and full-day highlights.',
    image: '/images/tours/packages/peninsula-tour-1/cape-point/1.webp',
  },
}

const FALLBACK_CATEGORIES = [
  CATEGORY_META.packages,
  CATEGORY_META.adrenaline,
  CATEGORY_META.hiking,
  CATEGORY_META.historical,

].map((category, index) => ({
  id: index + 1,
  count: 0,
  ...category,
}))

const normalizeSlug = (value = '') =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/_/g, '-')
    .replace(/\s+/g, '-')

const getCategoryKey = (tour = {}) => {
  const rawType = normalizeSlug(tour.type || tour.category || tour.collection || tour.group)
  const rawTitle = normalizeSlug(tour.title || tour.name || '')
  const searchText = `${rawType} ${rawTitle}`

  if (searchText.includes('wine') || searchText.includes('winery')) return 'packages'
  if (searchText.includes('adrenaline') || searchText.includes('adventure')) return 'adrenaline'
  if (searchText.includes('hiking') || searchText.includes('hike')) return 'hiking'
  if (
    searchText.includes('historical') ||
    searchText.includes('history') ||
    searchText.includes('cultural') ||
    searchText.includes('robben') ||
    searchText.includes('langa')
  ) {
    return 'historical'
  }
  if (searchText.includes('package') || searchText.includes('peninsula')) return 'packages'

  return CATEGORY_META[rawType] ? rawType : 'packages'
}

const getTourImage = (tour = {}) =>
  tour.image ||
  tour.img ||
  tour.cover ||
  tour.images?.[0] ||
  tour.gallery?.[0] ||
  tour.stops?.find?.((stop) => stop?.images?.[0])?.images?.[0] ||
  null

const buildCategoriesFromTours = () => {
  if (!Array.isArray(tours) || tours.length === 0) return FALLBACK_CATEGORIES

  const grouped = tours.reduce((acc, tour) => {
    const key = getCategoryKey(tour)
    const meta = CATEGORY_META[key] || CATEGORY_META.packages

    if (!acc[key]) {
      acc[key] = {
        id: Object.keys(acc).length + 1,
        ...meta,
        count: 0,
        image: getTourImage(tour) || meta.image,
      }
    }

    acc[key].count += 1

    const image = getTourImage(tour)
    if (image && (!acc[key].image || acc[key].image === meta.image)) {
      acc[key].image = image
    }

    return acc
  }, {})

  const preferredOrder = ['packages', 'adrenaline', 'hiking', 'historical']
  const ordered = preferredOrder
    .filter((key) => grouped[key])
    .map((key, index) => ({
      ...grouped[key],
      id: index + 1,
    }))

  return ordered.length ? ordered : FALLBACK_CATEGORIES
}

const useTouchLayout = () => {
  const [isTouchLayout, setIsTouchLayout] = useState(() => {
    if (typeof window === 'undefined') return false

    return window.innerWidth < 768 || window.matchMedia('(pointer: coarse)').matches
  })

  useEffect(() => {
    const update = () => {
      setIsTouchLayout(window.innerWidth < 768 || window.matchMedia('(pointer: coarse)').matches)
    }

    update()
    window.addEventListener('resize', update)
    window.addEventListener('orientationchange', update)

    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('orientationchange', update)
    }
  }, [])

  return isTouchLayout
}

// ============================================================
// 2. MAIN COMPONENT
// ============================================================

export default function PopularTours() {
  const categories = useMemo(() => buildCategoriesFromTours(), [])

  const [activeIndex, setActiveIndex] = useState(0)
  const [desktopPage, setDesktopPage] = useState(0)

  const sectionRef = useRef(null)
  const shellRef = useRef(null)
  const eyebrowMaskRef = useRef(null)
  const eyebrowRef = useRef(null)
  const titleRef = useRef(null)
  const copyRef = useRef(null)
  const gridRef = useRef(null)
  const mobileMainRef = useRef(null)
  const mobileThumbRefs = useRef([])
  const touchStartRef = useRef({ x: 0, y: 0 })

  const isTouchLayout = useTouchLayout()
  const reduceMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const totalCategories = categories.length
  const desktopItemsPerPage = 4
  const desktopPageCount = Math.max(1, Math.ceil(totalCategories / desktopItemsPerPage))
  const desktopStart = desktopPage * desktopItemsPerPage
  const desktopCategories = categories.slice(desktopStart, desktopStart + desktopItemsPerPage)

  const activeCategory = categories[activeIndex] || categories[0]
  const isPrevDisabled = desktopPage === 0
  const isNextDisabled = desktopPage >= desktopPageCount - 1

  const setActiveSafely = (nextIndex) => {
    if (!totalCategories) return
    setActiveIndex((nextIndex + totalCategories) % totalCategories)
  }

  const handlePrevious = () => {
    setDesktopPage((current) => Math.max(current - 1, 0))
  }

  const handleNext = () => {
    setDesktopPage((current) => Math.min(current + 1, desktopPageCount - 1))
  }

  const handleMobilePrevious = () => {
    setActiveSafely(activeIndex - 1)
  }

  const handleMobileNext = () => {
    setActiveSafely(activeIndex + 1)
  }

  const handleTouchStart = (event) => {
    const touch = event.touches[0]

    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
    }
  }

  const handleTouchEnd = (event) => {
    const touch = event.changedTouches[0]
    const deltaX = touch.clientX - touchStartRef.current.x
    const deltaY = touch.clientY - touchStartRef.current.y

    if (Math.abs(deltaX) < 40) return
    if (Math.abs(deltaY) > Math.abs(deltaX)) return

    if (deltaX < 0) handleMobileNext()
    else handleMobilePrevious()
  }

  // Desktop/larger screen animation:
  // - enter is a normal reveal
  // - exit translates cards first, then fades them away in a stagger
  // - reversible, so scrolling back into the section reveals it again
  useLayoutEffect(() => {
    if (reduceMotion || isTouchLayout) return undefined

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray('.popular-tour-card')
      const cardImages = gsap.utils.toArray('.popular-tour-card img')
      const navButtons = gsap.utils.toArray('.popular-tour-nav')
      const dots = gsap.utils.toArray('.popular-tour-dot')
      const headerItems = [eyebrowRef.current, titleRef.current, copyRef.current].filter(Boolean)

      gsap.set(shellRef.current, {
        autoAlpha: 0,
        y: 58,
        scaleY: 0.78,
        clipPath: 'ellipse(54% 22% at 50% 0%)',
        transformOrigin: 'top center',
        willChange: 'transform, opacity, clip-path',
      })

      gsap.set(eyebrowMaskRef.current, { overflow: 'hidden' })

      gsap.set(eyebrowRef.current, {
        autoAlpha: 1,
        y: 42,
        scale: 0.96,
        willChange: 'transform',
      })

      gsap.set([titleRef.current, copyRef.current], {
        autoAlpha: 0,
        y: 22,
        willChange: 'transform, opacity',
      })

      gsap.set(cards, {
        autoAlpha: 0,
        y: 34,
        scale: 0.97,
        rotateX: -5,
        transformPerspective: 900,
        transformOrigin: 'center bottom',
        willChange: 'transform, opacity',
      })

      gsap.set(cardImages, {
        scale: 1.16,
        yPercent: -2,
        transformOrigin: 'center center',
        willChange: 'transform',
      })

      gsap.set(navButtons, {
        autoAlpha: 0,
        scale: 0.86,
        willChange: 'transform, opacity',
      })

      gsap.set(dots, {
        autoAlpha: 0,
        y: 8,
        willChange: 'transform, opacity',
      })

      const killActiveTweens = () => {
        gsap.killTweensOf([
          shellRef.current,
          eyebrowRef.current,
          titleRef.current,
          copyRef.current,
          ...cards,
          ...cardImages,
          ...navButtons,
          ...dots,
        ])
      }

      const playEnter = () => {
        killActiveTweens()

        gsap
          .timeline({
            defaults: { ease: 'power2.out' },
          })
          .to(shellRef.current, {
            autoAlpha: 1,
            y: 0,
            scaleY: 1,
            clipPath: 'ellipse(145% 130% at 50% 0%)',
            duration: 0.55,
          })
          .to(eyebrowRef.current, { autoAlpha: 1, y: 0, scale: 1, duration: 0.32 }, 0.14)
          .to(titleRef.current, { autoAlpha: 1, y: 0, duration: 0.32 }, 0.2)
          .to(copyRef.current, { autoAlpha: 1, y: 0, duration: 0.32 }, 0.26)
          .to(
            cards,
            {
              autoAlpha: 1,
              y: 0,
              scale: 1,
              rotateX: 0,
              stagger: 0.055,
              duration: 0.4,
            },
            0.36
          )
          .to(
            cardImages,
            {
              scale: 1.06,
              yPercent: 0,
              stagger: 0.055,
              duration: 0.46,
            },
            0.36
          )
          .to(navButtons, { autoAlpha: 1, scale: 1, stagger: 0.06, duration: 0.22 }, 0.66)
          .to(dots, { autoAlpha: 1, y: 0, stagger: 0.05, duration: 0.22 }, 0.7)
      }

      const playExit = () => {
        killActiveTweens()

        gsap
          .timeline({
            defaults: { ease: 'power2.inOut' },
          })
          .to(
            cards,
            {
              y: -28,
              scale: 0.985,
              rotateX: 4,
              stagger: {
                each: 0.045,
                from: 'start',
              },
              duration: 0.26,
            },
            0
          )
          .to(
            cards,
            {
              autoAlpha: 0,
              stagger: {
                each: 0.045,
                from: 'start',
              },
              duration: 0.2,
            },
            0.18
          )
          .to(cardImages, { scale: 1.12, duration: 0.34 }, 0.08)
          .to(navButtons, { autoAlpha: 0, scale: 0.86, stagger: 0.04, duration: 0.18 }, 0.08)
          .to(dots, { autoAlpha: 0, y: 8, stagger: 0.04, duration: 0.18 }, 0.08)
          .to(headerItems, { autoAlpha: 0, y: -14, stagger: 0.04, duration: 0.22 }, 0.22)
          .to(
            shellRef.current,
            {
              autoAlpha: 0,
              y: -24,
              scaleY: 0.96,
              duration: 0.26,
            },
            0.36
          )
      }

      // main animation er and exitent
      const trigger = ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 82%',
        end: 'bottom 50%',
        invalidateOnRefresh: true,
        onEnter: playEnter,
        onEnterBack: playEnter,
        onLeave: playExit,
        onLeaveBack: playExit,
      })

      return () => trigger.kill()
    }, sectionRef)

    return () => ctx.revert()
  }, [desktopPage, isTouchLayout, reduceMotion])

  // Mobile/touch animation:
  // - fade in when the section enters
  // - fade out only when it exits
  // - reversible on scroll back
  useLayoutEffect(() => {
    if (reduceMotion || !isTouchLayout) return undefined

    const ctx = gsap.context(() => {
      gsap.set(shellRef.current, {
        autoAlpha: 0,
        willChange: 'opacity',
      })

      const fadeIn = () => {
        gsap.killTweensOf(shellRef.current)
        gsap.to(shellRef.current, {
          autoAlpha: 1,
          duration: 0.28,
          ease: 'power2.out',
        })
      }

      const fadeOut = () => {
        gsap.killTweensOf(shellRef.current)
        gsap.to(shellRef.current, {
          autoAlpha: 0,
          duration: 0.22,
          ease: 'power2.inOut',
        })
      }

      const trigger = ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 88%',
        end: 'bottom 30%',
        invalidateOnRefresh: true,
        onEnter: fadeIn,
        onEnterBack: fadeIn,
        onLeave: fadeOut,
        onLeaveBack: fadeOut,
      })

      return () => trigger.kill()
    }, sectionRef)

    return () => ctx.revert()
  }, [isTouchLayout, reduceMotion])

  // Mobile active card transition.
  useLayoutEffect(() => {
    if (!isTouchLayout || !mobileMainRef.current || reduceMotion) return undefined

    const ctx = gsap.context(() => {
      gsap.killTweensOf(mobileMainRef.current)

      gsap.fromTo(
        mobileMainRef.current,
        {
          autoAlpha: 0,
          y: 14,
          scale: 0.985,
          filter: 'blur(5px)',
        },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          filter: 'blur(0px)',
          duration: 0.32,
          ease: 'power3.out',
        }
      )

      const thumbs = mobileThumbRefs.current.filter(Boolean)

      if (thumbs.length) {
        gsap.fromTo(
          thumbs,
          {
            autoAlpha: 0,
            y: 8,
          },
          {
            autoAlpha: 1,
            y: 0,
            stagger: 0.035,
            duration: 0.22,
            ease: 'power2.out',
          }
        )
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [activeIndex, isTouchLayout, reduceMotion])

  return (
    <section
      ref={sectionRef}
      id="popular-tours"
      className="relative mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-0"
    >
      <div
        ref={shellRef}
        className="relative z-10 mx-auto w-full rounded-[2rem] bg-white p-4 shadow-[0_18px_55px_rgba(0,0,0,0.08)] sm:p-6 md:rounded-t-[999px] md:rounded-b-[2rem] md:p-10"
      >
        <div className="pointer-events-none absolute inset-x-6 top-5 h-24 rounded-full bg-green-200/25 blur-3xl md:inset-x-8 md:top-6 md:h-28" />

        {/* Section Header */}
        <div className="relative z-10 text-center font-bitter">
          <div className="flex flex-col items-center">
            <div ref={eyebrowMaskRef} className="relative overflow-hidden px-2 py-2">
              <span
                ref={eyebrowRef}
                className="block rounded-full bg-green-200 px-5 py-2 text-xs font-semibold tracking-wide text-green-700 shadow-sm sm:px-6 sm:text-sm"
              >
                Curated Experiences
              </span>
            </div>

            <h2
              ref={titleRef}
              className="mt-1 font-frank text-3xl font-semibold text-black sm:text-4xl md:mt-2 md:text-5xl"
            >
              Popular Tours
            </h2>

            <p
              ref={copyRef}
              className="my-3 max-w-md font-mont text-sm font-light leading-tight text-black/70 sm:my-4 sm:text-base"
            >
              Discover the wild heart of the Cape — from ocean giants to mountain peaks.
            </p>
          </div>
        </div>

        {/* Mobile compact active-card layout */}
        <div
          className="relative z-10 -mx-4 mt-3 md:hidden"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <MobileCategoryCard
            ref={mobileMainRef}
            category={activeCategory}
            currentIndex={activeIndex}
            total={totalCategories}
            onPrevious={handleMobilePrevious}
            onNext={handleMobileNext}
          />

          <div className="mx-4 mt-3 grid grid-cols-4 gap-2">
            {categories.slice(0, 4).map((category, index) => {
              const isActive = activeIndex === index

              return (
                <button
                  key={category.slug}
                  ref={(el) => {
                    mobileThumbRefs.current[index] = el
                  }}
                  type="button"
                  onClick={() => setActiveSafely(index)}
                  className={`relative h-16 overflow-hidden rounded-2xl border text-left transition ${
                    isActive
                      ? 'border-green-300 ring-2 ring-green-200'
                      : 'border-black/8 opacity-80'
                  }`}
                  aria-label={`Show ${category.name}`}
                >
                  <img
                    src={category.image}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                  <span className="absolute bottom-1.5 left-1.5 right-1.5 truncate font-bitter text-[9px] font-black uppercase tracking-[0.08em] text-white">
                    {category.name}
                  </span>
                </button>
              )
            })}
          </div>

          {categories.length > 4 && (
            <div className="mx-4 mt-3">
              <button
                type="button"
                onClick={() => setActiveSafely((activeIndex + 1) % totalCategories)}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-700 px-4 py-3 font-bitter text-xs font-black uppercase tracking-[0.12em] text-white transition hover:bg-blue-800"
              >
                Browse more categories
                <ChevronRight className="h-4 w-4" />
              </button>

              <div className="mt-2 flex items-center justify-center gap-2 rounded-2xl border border-blue-100 bg-blue-50 px-3 py-2">
                <img
                  src="./icons/info.png"
                  className="h-4 w-4 shrink-0 object-contain"
                  alt=""
                  aria-hidden="true"
                />
                <p className="font-mont text-[11px] leading-snug text-blue-950/65">
                  Tap a category preview or swipe the main card to move faster.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Desktop grid */}
        <div ref={gridRef} className="relative z-10 mt-4 hidden md:block">
          <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
            {desktopCategories.map((category) => (
              <CategoryCard key={category.slug} category={category} />
            ))}
          </div>

          {desktopPageCount > 1 && (
            <div>
              <button
                type="button"
                onClick={handlePrevious}
                disabled={isPrevDisabled}
                className={`popular-tour-nav absolute left-0 top-1/2 z-20 flex h-10 w-10 -translate-x-2 -translate-y-1/2 items-center justify-center rounded-full border border-black/20 bg-green-200 shadow-md backdrop-blur-md transition-all duration-300 sm:-translate-x-4 lg:-translate-x-6 ${
                  isPrevDisabled
                    ? 'cursor-not-allowed opacity-30'
                    : 'hover:scale-105 hover:border-green-500/50 hover:bg-green-300'
                }`}
                aria-label="Previous tours"
              >
                <ChevronLeft className="h-5 w-5 text-black/80" />
              </button>

              <button
                type="button"
                onClick={handleNext}
                disabled={isNextDisabled}
                className={`popular-tour-nav absolute right-0 top-1/2 z-20 flex h-10 w-10 translate-x-2 -translate-y-1/2 items-center justify-center rounded-full border border-black/20 bg-green-200 shadow-md backdrop-blur-md transition-all duration-300 sm:translate-x-4 lg:translate-x-6 ${
                  isNextDisabled
                    ? 'cursor-not-allowed opacity-30'
                    : 'hover:scale-105 hover:border-green-500/50 hover:bg-green-300'
                }`}
                aria-label="Next tours"
              >
                <ChevronRight className="h-5 w-5 text-black/80" />
              </button>
            </div>
          )}
        </div>

        {desktopPageCount > 1 && (
          <div className="relative z-10 mt-8 hidden justify-center gap-2 md:flex">
            {Array.from({ length: desktopPageCount }).map((_, index) => {
              const isActive = index === desktopPage

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => setDesktopPage(index)}
                  className={`popular-tour-dot h-1 rounded-full transition-all duration-500 ${
                    isActive ? 'w-8 bg-blue-400' : 'w-4 bg-black/20 hover:bg-black/40'
                  }`}
                  aria-label={`Go to page ${index + 1}`}
                />
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}

// ============================================================
// 3. MOBILE CATEGORY CARD COMPONENT
// ============================================================

const MobileCategoryCard = forwardRef(function MobileCategoryCard(
  {
    category,
    currentIndex,
    total,
    onPrevious,
    onNext,
  },
  ref
) {
  const { name, hasNewTour, description, image } = category

  return (
    <article
      ref={ref}
      className="relative min-h-[23rem] overflow-hidden rounded-none bg-black"
    >
      <img
        src={image}
        alt={`${name} tours in Cape Town`}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover"
      />

      <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-black/25 to-blue-950/90" />

      <div className="relative z-10 flex min-h-[23rem] flex-col justify-end px-5 py-5">
        <div className="mb-auto flex items-start justify-between gap-3">
          <span className="rounded-full border border-white/15 bg-white/12 px-3 py-1 font-bitter text-[10px] font-black uppercase tracking-[0.14em] text-white backdrop-blur-sm">
            {currentIndex + 1} / {total}
          </span>

          <div className="flex max-w-[58%] flex-wrap justify-end gap-1.5">
            {hasNewTour && (
              <span className="rounded-full bg-red-500 px-3 py-1 font-bitter text-[9px] font-black uppercase tracking-[0.12em] text-white shadow-lg">
                New
              </span>
            )}
          </div>
        </div>

        <h3 className="font-bitter text-3xl font-black uppercase tracking-wide text-white drop-shadow-sm">
          {name}
        </h3>

        <div className="my-3 h-px w-12 bg-green-200/80" />

        <p className="max-w-[90%] font-mont text-sm leading-snug text-white/82">
          {description}
        </p>

        <div className="mt-5 flex items-center gap-2">
          <button
            type="button"
            onClick={onPrevious}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/18 bg-white/12 text-white backdrop-blur-sm"
            aria-label="Previous category"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={onNext}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/18 bg-white/12 text-white backdrop-blur-sm"
            aria-label="Next category"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <a
            href="#featured-tours"
            className="ml-auto rounded-full bg-green-200 px-4 py-3 font-bitter text-xs font-black uppercase tracking-[0.12em] text-green-950"
          >
            View tours
          </a>
        </div>
      </div>
    </article>
  )
})

// ============================================================
// 4. DESKTOP CATEGORY CARD COMPONENT
// ============================================================

function CategoryCard({ category }) {
  const { name, hasNewTour, description, image } = category

  return (
    <article className="popular-tour-card group relative aspect-[4/5] w-full overflow-hidden rounded-[2rem] bg-black">
      <div className="absolute inset-0 overflow-hidden rounded-[2rem]">
        <img
          src={image}
          alt={`${name} tours in Cape Town`}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 block h-full min-h-full w-full min-w-full object-cover transition-transform duration-700 ease-out will-change-transform group-hover:scale-110"
        />

        <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-black/10 to-blue-950/85 transition-opacity duration-500 group-hover:opacity-90" />
      </div>

      <div className="relative z-10 flex h-full flex-col items-center justify-end p-6 text-center">
        <div className="mb-auto flex w-full items-start justify-end gap-2">
          {hasNewTour && (
            <div className="rounded-full bg-red-500 px-2.5 py-1 font-bitter text-[8px] font-bold uppercase tracking-wider text-white shadow-lg">
              New Tours
            </div>
          )}
        </div>

        <h3 className="font-bitter text-2xl font-bold uppercase tracking-wide text-white drop-shadow-sm">
          {name}
        </h3>

        <div className="my-3 h-px w-8 bg-white/50 transition-all duration-500 group-hover:w-14 group-hover:bg-green-200" />

        <p className="max-w-[88%] translate-y-3 font-mont text-xs font-light leading-tight text-white/80 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 md:text-sm">
          {description}
        </p>
      </div>

      <div className="absolute bottom-4 left-4 z-20 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
        <div className="h-px w-8 bg-green-200/80" />
      </div>
    </article>
  )
}