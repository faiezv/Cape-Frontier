import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Link } from 'react-router-dom'
// TODO: adjust this path to wherever useLoadingNavigate lives
import { useLoadingNavigate } from './useLoadingNavigate'

import ToursBrowser from './Tours/ToursBrowser'

// Adjust the relative path to wherever this file lives.
// Filenames are case-sensitive on Vercel (Linux) - keep them exactly as on disk.
import hero1 from '../assets/images/content/hero/1.webp'
import hero2 from '../assets/images/tours/adrenaline/cobra/cobra-2hr/1.webp'
import hero3 from '../assets/images/content/hero/2.webp'
import hero4 from '../assets/images/content/hero/3.webp'
// import hero5 from '../assets/images/content/hero/4.webp'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

// useLayoutEffect warns during SSR; fall back to useEffect on the server.
const useIsoLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect

// Vite gives a string, Next.js gives { src, width, height } - support both.
const toSrc = (img) => (typeof img === 'string' ? img : img.src)

// Reorder / relabel to match what 1-4.webp actually show.
const slides = [
  { image: hero1, location: 'Bo-Kaap, Cape Town' },
  { image: hero2, location: 'Cobra Sundowner, Cape Town' },
  { image: hero3, location: "Simon's Town, Cape Town" },
  { image: hero4, location: 'Cape Town' },
  // { image: hero5, location: 'Cobra Sundowner, Cape Town' },
]

const SLIDE_MS = 6500
const PROMO_MS = 5000 // how long each promo stays visible

// -----------------------------------------------------------------------------
// Promotions shown under the tour select block.
// `short` = one-line mobile copy, `text` = desktop copy.
// Every colour for a promo lives in its own class strings below so a promo is
// one self-contained object. (Tailwind needs full class names, no templating.)
// -----------------------------------------------------------------------------
const promos = [
  {
    key: 'peninsula',
    tag: 'Limited-time offer',
    title: 'Cape Peninsula Tour',
    short: 'Entry fees included.',
    text: 'All entry fees included. Discover Cape Town’s iconic coastline at a special price, for a limited time only.',
    stamp: { big: 'All-in', small: 'entry fees' },
    image: hero3, // TODO: swap for the Cape Peninsula tour cover image
    cta: 'View tour',
    to: '/tours/peninsula-tour-2', // tour slug
    // colours
    card: 'bg-[linear-gradient(135deg,#fde047_0%,#facc15_45%,#f59e0b_100%)] text-[#1c1400]',
    tagClass: 'bg-[#1c1400]/10 text-[#5b4200]',
    sealClass: 'border-[#eab308] text-[#a16207]',
    ctaClass: 'bg-[#1c1400] text-white group-hover:bg-black',
    ring: 'ring-white/80',
  },
  {
    key: 'heritage',
    tag: 'Must experience',
    title: 'Heritage Cape Flats Community Tour',
    short: 'Groups of 7–10 save 20%.',
    text: 'Groups of 7–10 guests save 20%. Go deeper into Cape Town and take a story home with you.',
    stamp: { big: '20%', small: 'off' },
    image: hero1, // TODO: swap for the Heritage Cape Flats tour cover image
    cta: 'View tour',
    to: '/tours/heritage-faith-cape-flats-community-tour', // TODO: replace with the real slug
    card: 'bg-[linear-gradient(135deg,#fb923c_0%,#f97316_50%,#ea580c_100%)] text-white',
    tagClass: 'bg-white/20 text-white',
    sealClass: 'border-[#fb923c] text-[#c2410c]',
    ctaClass: 'bg-white text-[#c2410c] group-hover:bg-orange-50',
    ring: 'ring-white/80',
  },
]

// All promo CSS lives in one constant, so the <style> node never changes.
//
// Why this does not flicker:
//  - the first promo is in the markup as "active" from the very first paint, so
//    there is no hidden -> visible switch on load (transitions only run on change)
//  - animations touch transform / opacity only (compositor friendly): no
//    clip-path, no filter glows, no backdrop blur
//  - the card has a fixed height and its photo sits in a fixed box, so a late
//    font or image can never move anything
//  - the progress bars render an empty track until the clock starts, then fill
//    from zero (the old placeholder bar jumped when the clock started)
const PROMO_CSS = `
  @keyframes promoFill {
    from { transform: scaleX(0); }
    to   { transform: scaleX(1); }
  }
  /* One diagonal light sweep, then a long rest. transform only. */
  @keyframes promoShine {
    0%        { transform: translateX(-160%) skewX(-24deg); }
    22%, 100% { transform: translateX(560%)  skewX(-24deg); }
  }
  /* The seal settles in with a small overshoot (no opacity change) */
  @keyframes promoPop {
    0%   { transform: scale(0.7) rotate(-16deg); }
    60%  { transform: scale(1.08) rotate(-4deg); }
    100% { transform: scale(1) rotate(-6deg); }
  }

  /* Slides share one grid cell and cross-fade. Inactive slides become
     visibility:hidden after the fade so they can't be focused or clicked. */
  .promo-slide {
    opacity: 0;
    visibility: hidden;
    transform: translateY(10px) scale(0.985);
    pointer-events: none;
    transition: opacity 0.4s ease, transform 0.4s ease, visibility 0s linear 0.4s;
  }
  .promo-slide[data-active="true"] {
    opacity: 1;
    visibility: visible;
    transform: none;
    pointer-events: auto;
    transition: opacity 0.5s ease 0.1s, transform 0.55s cubic-bezier(0.22, 1, 0.36, 1) 0.1s, visibility 0s;
  }

  .promo-badge { transform: rotate(-6deg); }
  .promo-slide[data-active="true"] .promo-badge { animation: promoPop 0.7s cubic-bezier(0.22, 1, 0.36, 1) both; }
  .promo-slide[data-active="true"] .promo-shine { animation: promoShine 6.5s ease-in-out 0.6s infinite; }

  .promo-fill { transform-origin: left; animation: promoFill ${PROMO_MS}ms linear forwards; }

  @media (prefers-reduced-motion: reduce) {
    .promo-slide, .promo-slide[data-active="true"] { transition: none; transform: none; }
    .promo-slide[data-active="true"] .promo-badge,
    .promo-slide[data-active="true"] .promo-shine { animation: none; }
    .promo-shine { display: none; }
    .promo-fill { animation: none; transform: scaleX(1); }
  }
`

// -----------------------------------------------------------------------------
// PromoBanner
// Bold, fixed-height card; one promo at a time; thin progress bars underneath.
// `ready` (page loaded + fonts in) only starts the rotation clock.
// -----------------------------------------------------------------------------
const PromoBanner = ({
  innerRef,
  active,
  onSelect,
  paused,
  setPaused,
  onGo,
  ready,
}) => (
  <div
    ref={innerRef}
    onMouseEnter={() => setPaused(true)}
    onMouseLeave={() => setPaused(false)}
    className="relative mt-3 w-full max-w-4xl self-center px-2 sm:mt-0 sm:px-0"
  >
    <style>{PROMO_CSS}</style>

    <div className="grid">
      {promos.map((p, i) => {
        const isActive = i === active

        return (
          <div
            key={p.key}
            data-active={isActive}
            className="promo-slide col-start-1 row-start-1"
          >
            <Link
              to={p.to}
              onClick={(e) => onGo(e, p.to)}
              aria-label={`${p.cta}: ${p.title}`}
              aria-hidden={!isActive}
              tabIndex={isActive ? 0 : -1}
              className={`group relative isolate flex h-[88px] w-full transform-gpu items-center gap-3 overflow-hidden rounded-2xl p-2.5 shadow-[0_14px_32px_rgba(0,0,0,0.30),inset_0_1px_0_rgba(255,255,255,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:h-[108px] sm:gap-4 sm:p-3 ${p.card}`}
            >
              {/* top gloss */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-1/2 bg-gradient-to-b from-white/25 to-transparent"
              />
              {/* light sweep */}
              <span
                aria-hidden="true"
                className="promo-shine pointer-events-none absolute inset-y-0 left-0 -z-10 w-[16%] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.55),transparent)]"
              />

              {/* Cover photo (tablet and up) */}
              <span
                aria-hidden="true"
                className={`hidden h-full w-28 shrink-0 overflow-hidden rounded-xl bg-black/10 ring-2 sm:block md:w-40 ${p.ring}`}
              >
                <img
                  src={toSrc(p.image)}
                  alt=""
                  loading="eager"
                  decoding="async"
                  draggable={false}
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
              </span>

              {/* Copy */}
              <span className="min-w-0 flex-1 leading-snug">
                <span
                  className={`hidden rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.08em] sm:inline-block ${p.tagClass}`}
                >
                  {p.tag}
                </span>

                <strong className="block line-clamp-2 text-[15px] font-extrabold leading-tight sm:mt-1 sm:line-clamp-1 sm:text-lg md:text-xl">
                  {p.title}
                </strong>

                <span className="mt-0.5 block truncate text-[12px] font-medium opacity-90 sm:hidden">
                  {p.short}
                </span>
                <span className="hidden text-[13px] font-medium leading-snug opacity-90 sm:line-clamp-2">
                  {p.text}
                </span>
              </span>

              {/* Offer seal */}
              <span
                aria-hidden="true"
                className={`promo-badge flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-full border-2 border-dashed bg-white text-center shadow-[0_4px_10px_rgba(0,0,0,0.25)] sm:h-[4.5rem] sm:w-[4.5rem] ${p.sealClass}`}
              >
                <span className="whitespace-nowrap text-[15px] font-extrabold leading-none sm:text-xl">
                  {p.stamp.big}
                </span>
                <span className="mt-[3px] whitespace-nowrap text-[8.5px] font-semibold leading-none sm:text-[10px]">
                  {p.stamp.small}
                </span>
              </span>

              {/* CTA */}
              <span
                aria-hidden="true"
                className={`inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-xl px-3 font-bitter text-xs font-black shadow-[0_6px_14px_rgba(0,0,0,0.22)] transition-colors sm:px-4 sm:text-sm ${p.ctaClass}`}
              >
                <span className="hidden md:inline">{p.cta}</span>
                <svg
                  className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14m-6-6 6 6-6 6" />
                </svg>
              </span>
            </Link>
          </div>
        )
      })}
    </div>

    {/* Progress bars: the active one fills over PROMO_MS, all are clickable */}
    <div className="mt-1 flex justify-center gap-2">
      {promos.map((p, i) => {
        const isActive = i === active

        return (
          <button
            key={p.key}
            type="button"
            aria-label={`Show ${p.title}`}
            aria-current={isActive}
            onClick={() => onSelect(i)}
            className="py-2"
          >
            <span className="relative block h-1 w-10 overflow-hidden rounded-full bg-white/35 shadow-[0_1px_3px_rgba(0,0,0,0.35)] transition-colors hover:bg-white/55 sm:w-12">
              {isActive && ready && (
                <span
                  aria-hidden="true"
                  style={{ animationPlayState: paused ? 'paused' : 'running' }}
                  className="promo-fill absolute inset-0 rounded-full bg-white"
                />
              )}
            </span>
          </button>
        )
      })}
    </div>
  </div>
)

const ArrowDown = ({ className = 'h-4 w-4' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    aria-hidden="true"
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
)

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  // Only slide 1 is in the server HTML (it is the LCP image).
  // The rest mount after window load so they never compete with it.
  const [extrasReady, setExtrasReady] = useState(false)
  const [promoState, setPromoState] = useState({ active: 0 })
  const [promoPaused, setPromoPaused] = useState(false)
  // True once the page has loaded and fonts are ready: starts the promo clock.
  const [promoReady, setPromoReady] = useState(false)

  const heroRef = useRef(null)
  const contentRef = useRef(null)
  const tourSelectRef = useRef(null)
  const promoRef = useRef(null)
  const scrollRef = useRef(null)
  const shineRef = useRef(null)
  const arrowRef = useRef(null)
  const bgRefs = useRef([])
  const prevSlide = useRef(0)
  // Promo timer bookkeeping so hover pauses/resumes instead of restarting
  const promoElapsed = useRef(0) // ms already shown for the current promo
  const promoLastActive = useRef(0)

  // Route changes go through the loading bar. A plain <Link> calls react-router's
  // navigate() directly, which never touches the bar.
  const loadingNavigate = useLoadingNavigate()
  const goTo = (e, to) => {
    // let ctrl/cmd/shift/middle-click open a new tab as usual
    if (
      e.defaultPrevented ||
      e.button !== 0 ||
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      e.altKey
    )
      return
    e.preventDefault()
    loadingNavigate(to)
  }

  const safeScroll = (id) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }
    window.scrollBy({ top: window.innerHeight * 0.9, behavior: 'smooth' })
  }

  // Load slides 2+ once the page has finished loading
  useEffect(() => {
    if (document.readyState === 'complete') {
      setExtrasReady(true)
      return
    }
    const onLoad = () => setExtrasReady(true)
    window.addEventListener('load', onLoad)
    return () => window.removeEventListener('load', onLoad)
  }, [])

  // Wait for page load + web fonts before starting the promo rotation, so the
  // first rotation never happens while text is still being swapped in.
  useEffect(() => {
    let cancelled = false

    const loaded = new Promise((resolve) => {
      if (document.readyState === 'complete') resolve()
      else window.addEventListener('load', resolve, { once: true })
    })
    const fonts = document.fonts?.ready ?? Promise.resolve()

    Promise.all([loaded, fonts]).then(() => {
      if (cancelled) return
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          if (!cancelled) setPromoReady(true)
        })
      )
    })

    return () => {
      cancelled = true
    }
  }, [])

  // Pin TourSelect while the hero scrolls away (desktop only)
  useEffect(() => {
    const mm = gsap.matchMedia()

    mm.add('(min-width: 768px)', () => {
      if (!heroRef.current || !tourSelectRef.current) return

      const st = ScrollTrigger.create({
        trigger: heroRef.current,
        start: 'top top',
        end: 'bottom top',
        pin: tourSelectRef.current,
        pinSpacing: false,
      })

      return () => st.kill()
    })

    return () => mm.revert()
  }, [])

  // Intro + looping animations
  useIsoLayoutEffect(() => {
    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    const ctx = gsap.context(() => {
      const first = bgRefs.current[0]

      // Slide 1 is the only <img> in the server HTML. React does not repair a
      // mismatched `src` during hydration, so if the server build emitted a
      // different asset URL than the client bundle, the browser keeps the
      // broken one. Re-assert the client URL and retry if it failed to decode.
      if (first) {
        const want = toSrc(slides[0].image)
        if (
          first.getAttribute('src') !== want ||
          (first.complete && first.naturalWidth === 0)
        ) {
          first.setAttribute('src', want)
        }
      }

      if (!reduceMotion && first) {
        gsap.fromTo(
          first,
          { scale: 1.02 },
          { scale: 1.08, duration: 7, ease: 'power1.out' }
        )
      }

      if (reduceMotion) return

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

      if (tourSelectRef.current) {
        tl.from(tourSelectRef.current, { y: -10, opacity: 0, duration: 0.75 })
      }

      // NOTE: the promo banner is NOT animated with GSAP. It animates with CSS
      // (see PROMO_CSS); GSAP would fight those transforms and opacity.

      if (scrollRef.current) {
        tl.from(
          scrollRef.current,
          { y: 60, opacity: 0, duration: 0.55 },
          '-=0.25'
        )
      }

      if (arrowRef.current) {
        gsap.to(arrowRef.current, {
          y: 6,
          duration: 0.95,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        })
      }

      if (shineRef.current) {
        gsap.fromTo(
          shineRef.current,
          { xPercent: -150 },
          {
            xPercent: 220,
            duration: 2.3,
            repeat: -1,
            repeatDelay: 1.1,
            ease: 'none',
          }
        )
      }
    }, heroRef)

    return () => ctx.revert()
  }, [])

  // Automatic slideshow (pauses in background tabs, off for reduced motion)
  useEffect(() => {
    if (!extrasReady || slides.length <= 1) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const interval = setInterval(() => {
      if (document.hidden) return
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, SLIDE_MS)

    return () => clearInterval(interval)
  }, [extrasReady])

  // Rotate promos (one visible at a time; pauses on hover / hidden tab)
  const selectPromo = (next) =>
    setPromoState((s) => (s.active === next ? s : { active: next }))

  useEffect(() => {
    // Don't start the clock until the page is settled
    if (!promoReady || promos.length <= 1) return

    // A different promo is showing (auto or click): start its clock over
    if (promoLastActive.current !== promoState.active) {
      promoLastActive.current = promoState.active
      promoElapsed.current = 0
    }

    // Hovering: keep the elapsed time, run nothing
    if (promoPaused) return

    const startedAt = Date.now()
    let id

    const advance = () => {
      // Don't rotate in a background tab; check again shortly
      if (document.hidden) {
        id = setTimeout(advance, 500)
        return
      }
      setPromoState((s) => ({ active: (s.active + 1) % promos.length }))
    }

    id = setTimeout(advance, Math.max(0, PROMO_MS - promoElapsed.current))

    return () => {
      clearTimeout(id)
      // Remember how long this promo has been visible so resuming continues
      promoElapsed.current += Date.now() - startedAt
    }
  }, [promoReady, promoPaused, promoState.active])

  // Slide cross-fade
  useEffect(() => {
    const prev = prevSlide.current
    const next = currentSlide
    if (prev === next) return

    const prevBg = bgRefs.current[prev]
    const nextBg = bgRefs.current[next]
    if (!prevBg || !nextBg) return

    gsap.killTweensOf([prevBg, nextBg])
    gsap.set(nextBg, { opacity: 0, scale: 1.02 })

    gsap
      .timeline()
      .to(prevBg, { opacity: 0, duration: 1.2, ease: 'power2.inOut' }, 0)
      .to(nextBg, { opacity: 1, duration: 1.2, ease: 'power2.inOut' }, 0)
      .to(nextBg, { scale: 1.08, duration: 6.5, ease: 'power1.out' }, 0)

    prevSlide.current = next
  }, [currentSlide])

  const visibleSlides = extrasReady ? slides : slides.slice(0, 1)

  return (
    <section
      ref={heroRef}
      aria-label="Cape Frontier hero"
      className="relative h-[100svh] min-h-[100svh] w-full max-w-full overflow-x-hidden overflow-y-clip bg-[#0b1220] font-frank text-white"
    >
      {/* Real <img> elements: crawlable, preloadable, and alt-texted.
          Slide 1 is eager + high priority; the rest are added after load. */}
      {visibleSlides.map((slide, index) => (
        <img
          key={slide.location + index}
          ref={(el) => {
            bgRefs.current[index] = el
          }}
          src={toSrc(slide.image)}
          alt={slide.location}
          aria-hidden={index !== currentSlide}
          loading={index === 0 ? 'eager' : 'lazy'}
          fetchPriority={index === 0 ? 'high' : 'auto'}
          decoding={index === 0 ? 'sync' : 'async'}
          draggable={false}
          onError={(e) =>
            console.error('[Hero] image failed to load:', e.currentTarget.src)
          }
          className={`absolute inset-0 h-full w-full object-cover will-change-transform ${
            index === 0 ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}

      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.14),transparent_36%)]" />

      <div className="relative z-20 flex h-full flex-col">
        <div
          ref={contentRef}
          className="flex flex-1 flex-col items-center px-4 pb-24 pt-24 sm:px-6 sm:pb-12 sm:pt-12 md:px-8 md:pb-24 md:pt-28 lg:px-10 lg:pt-32"
        >
          {/* SEO: the page needs exactly one <h1>. Edit the copy to match your brand. */}
          <h1 className="sr-only">
            Cape Frontier - Guided tours and experiences in Cape Town
          </h1>

          {/* Placeholder used for the desktop TourSelect pinning.
              Adjust the min heights if the banner overlaps the search box. */}
          <div
            ref={tourSelectRef}
            className="w-full max-w-5xl min-h-[200px] sm:min-h-[200px] md:min-h-[100px] lg:min-h-[80px]"
          />

          {/* Promo banner: Cape Peninsula + Heritage, one at a time */}
          <PromoBanner
            innerRef={promoRef}
            active={promoState.active}
            onSelect={selectPromo}
            paused={promoPaused}
            onGo={goTo}
            setPaused={setPromoPaused}
            ready={promoReady}
          />
        </div>

        {/* Bottom scroll CTA - a real link, so it works without JS too */}
        <a
          ref={scrollRef}
          href="#featured-tours"
          onClick={(e) => {
            e.preventDefault()
            safeScroll('featured-tours')
          }}
          className="absolute bottom-0 left-0 z-30 flex w-full max-w-full items-center justify-center overflow-hidden border-t border-white/10 bg-[linear-gradient(90deg,#002dcb_0%,#0938ef_50%,#002dcb_100%)] px-4 py-3 text-sm font-medium text-white/95 shadow-[0_-8px_30px_rgba(0,0,0,0.16)] backdrop-blur-md sm:py-4 sm:text-base md:text-lg"
        >
          <div
            ref={shineRef}
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-[-30%] w-[26%] skew-x-[-24deg] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.24),transparent)]"
          />

          <div className="relative z-10 flex items-center gap-3 leading-none">
            <div className="flex gap-6">
              <span>Explore beyond the ordinary.</span>
              <span ref={arrowRef}>
                <ArrowDown className="h-5 w-5 -translate-y-1" />
              </span>
            </div>
          </div>
        </a>
      </div>
    </section>
  )
}

export default Hero