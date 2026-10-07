import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Link } from 'react-router-dom'
// TODO: adjust this path to wherever useLoadingNavigate lives
import { useLoadingNavigate } from './useLoadingNavigate'

// Adjust the relative path to wherever this file lives.
// Filenames are case-sensitive on Vercel (Linux) - keep them exactly as on disk.
import hero1 from '../assets/images/content/hero/1.webp'
import hero2 from '../assets/images/tours/adrenaline/cobra/cobra-2hr/1.webp'
import hero3 from '../assets/images/content/hero/2.webp'
import hero4 from '../assets/images/content/hero/3.webp'
import hero5 from '../assets/images/content/hero/4.webp'

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
  { image: hero5, location: 'Cobra Sundowner, Cape Town' },
]

const SLIDE_MS = 6500
const PROMO_MS = 5000 // how long each promo ribbon stays visible

// Promotional ribbons shown under the search / select destination block.
// Text only (no images). Update the wording and hrefs below.
// `short` is the one-line offer shown on mobile; `text` is the full desktop copy.
// `glow`  = soft coloured halo behind the ribbon
const promos = [
  {
    key: 'peninsula',
    tag: 'Promotion',
    title: 'Cape Peninsula Tour',
    short: 'Limited-time offer, all entry fees included.',
    text: 'All entry fees included. Discover Cape Town’s iconic coastline and unforgettable scenery at a special price, for a limited time only.',
    stamp: { big: 'All-in', small: 'entry fees' }, // round sticker on the left
    image: hero3, // TODO: swap for the Cape Peninsula tour cover image
    labelRest: '#1a1300', // colour of the "View tour" label before the cover fades in
    cta: 'View tour',
    to: '/tours/peninsula-tour-2', // tour slug
    ribbon:
      'bg-[linear-gradient(180deg,#fde047_0%,#facc15_100%)] text-[#1a1300]',
    tagStyle: 'bg-white/75 text-[#854d0e]',
    accent: 'text-[#a16207]',
    stampBorder: 'border-[#eab308]',
    glow: 'rgba(250,204,21,0.55)',
  },
  {
    key: 'heritage',
    tag: 'Must experience',
    title: 'Heritage Cape Flats Community Tour',
    short: 'Groups of 7–10 save 20%',
    text: 'Groups of 7–10 guests save 20%. Go deeper into Cape Town and take a story home with you.',
    stamp: { big: '20%', small: 'off' },
    image: hero1, // TODO: swap for the Heritage Cape Flats tour cover image
    labelRest: '#ffffff',
    cta: 'View tour',
    to: '/tours/heritage-faith-cape-flats-community-tour', // TODO: replace with the Heritage tour's real slug
    ribbon:
      'bg-[linear-gradient(180deg,#fb923c_0%,#f97316_100%)] text-white',
    tagStyle: 'bg-white/75 text-[#c2410c]',
    accent: 'text-[#c2410c]',
    stampBorder: 'border-[#fb923c]',
    glow: 'rgba(249,115,22,0.55)',
  },
]

// Cover image fades in as the pointer gets close to the "View tour" end.
// 0 = far (left half of the ribbon), 1 = right on the button.
const trackNear = (e) => {
  if (e.pointerType === 'touch') return
  const r = e.currentTarget.getBoundingClientRect()
  const x = (e.clientX - r.left) / r.width
  const near = Math.min(1, Math.max(0, (x - 0.5) / 0.4))
  e.currentTarget.style.setProperty('--near', near.toFixed(3))
}
const clearNear = (e) => e.currentTarget.style.removeProperty('--near')

// Ribbons share one grid cell. The active one slides in from the right while
// the previous one slides out to the left, so visitors can see there is
// another banner. Dots underneath show which one is showing (and are clickable);
// the active dot fills up as a progress bar until the next banner.
const PromoRibbons = ({ innerRef, active, prev, onSelect, paused, setPaused, onGo }) => (
  <div
    ref={innerRef}
    onMouseEnter={() => setPaused(true)}
    onMouseLeave={() => setPaused(false)}
    className="relative mt-3 w-full max-w-4xl self-center px-2 sm:mt-0 sm:px-0"
  >
    <style>{`
      @keyframes promoIn {
        from { opacity: 0; transform: translateX(80px); }
        to   { opacity: 1; transform: translateX(0); }
      }
      @keyframes promoOut {
        from { opacity: 1; transform: translateX(0); }
        to   { opacity: 0; transform: translateX(-80px); }
      }
      @keyframes promoTwinkle {
        0%, 100% { opacity: 0; transform: scale(0.3) rotate(0deg); }
        50%      { opacity: 1; transform: scale(1) rotate(90deg); }
      }
      @keyframes promoShine {
        from { transform: translateX(-160%) skewX(-24deg); }
        to   { transform: translateX(520%)  skewX(-24deg); }
      }
      @keyframes promoFill {
        from { transform: scaleX(0); }
        to   { transform: scaleX(1); }
      }

      /* Ribbon shape: notched tail on the left, arrow point on the right */
      .promo-shape {
        --n: 14px;
        clip-path: polygon(0 0, calc(100% - var(--n)) 0, 100% 50%, calc(100% - var(--n)) 100%, 0 100%, var(--n) 50%);
      }
      @media (min-width: 640px) { .promo-shape { --n: 22px; } }

      /* Slide wrapper: carries the slide animation + the shadows.
         drop-shadow (not box-shadow) so it follows the notched shape. */
      .promo-slide {
        filter:
          drop-shadow(0 12px 14px rgba(0,0,0,0.38))
          drop-shadow(0 0 22px var(--glow));
      }
      .promo-in   { animation: promoIn 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
      .promo-out  { animation: promoOut 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards; pointer-events: none; }
      .promo-idle { opacity: 0; pointer-events: none; }

      /* Bevel: bright top edge, darker bottom edge */
      .promo-face {
        box-shadow:
          inset 0 1.5px 0 rgba(255,255,255,0.65),
          inset 0 -2px 0 rgba(0,0,0,0.14);
        transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1), filter 0.3s;
      }
      .promo-face:hover { transform: translateY(-2px); }

      /* Light sweep on arrival, and once more mid-way */
      .promo-shine {
        animation:
          promoShine 1.3s ease-in-out 0.9s 1 both,
          promoShine 1.3s ease-in-out 3.4s 1 both;
      }
      .promo-spark { animation: promoTwinkle 2.4s ease-in-out infinite; }
      .promo-fill  { transform-origin: left; animation: promoFill ${PROMO_MS}ms linear forwards; }

      /* Proximity reveal. --near is set from the pointer (JS); --rest keeps the
         cover faintly visible on touch screens, where there is no hover. --k is the stronger of the two. */
      .promo-face { --near: 0; --rest: 0; --k: max(var(--near), var(--rest)); }
      .promo-face:focus-visible { --near: 1; }
      @media (hover: none) { .promo-face { --rest: 0.6; } }

      .promo-cover {
        opacity: var(--k);
        transform: scale(calc(1.1 - 0.1 * var(--k)));
        transform-origin: right center;
        transition: opacity 0.45s ease, transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
        -webkit-mask-image: linear-gradient(90deg, transparent 0%, #000 70%);
        mask-image: linear-gradient(90deg, transparent 0%, #000 70%);
      }

      /* The ribbon's own "button" end: label turns white as the photo fades in */
      .promo-cta {
        color: color-mix(in srgb, #fff calc(var(--k) * 100%), var(--label));
        border-color: color-mix(in srgb, currentColor 50%, transparent);
        text-shadow: 0 1px 6px rgba(0,0,0,calc(var(--k) * 0.55));
        transition: color 0.3s ease;
      }
      .promo-cta-arrow {
        transform: translateX(calc(var(--k) * 5px));
        transition: transform 0.45s cubic-bezier(0.22, 1, 0.36, 1);
      }
      .promo-face:hover .promo-cta-arrow { animation: promoNudge 0.9s ease-in-out infinite; }
      @keyframes promoNudge {
        0%, 100% { transform: translateX(5px); }
        50%      { transform: translateX(9px); }
      }

      @media (prefers-reduced-motion: reduce) {
        .promo-in, .promo-out { animation-duration: 0.01s; }
        .promo-spark { animation: none; opacity: 0.8; }
        .promo-shine { animation: none; opacity: 0; }
        .promo-fill  { animation: none; transform: scaleX(1); }
        .promo-face:hover { transform: none; }
        .promo-cover, .promo-cta, .promo-cta-arrow { transition: none; }
        .promo-face:hover .promo-cta-arrow { animation: none; }
      }
    `}</style>

    {/* Sparkles on both sides (hidden on small screens) */}
    {[
      { side: '-left-7', top: 'top-[8%]', size: 'text-lg', delay: '0s' },
      { side: '-left-4', top: 'top-[55%]', size: 'text-sm', delay: '0.8s' },
      { side: '-left-9', top: 'top-[85%]', size: 'text-xs', delay: '1.5s' },
      { side: '-right-7', top: 'top-[15%]', size: 'text-sm', delay: '0.4s' },
      { side: '-right-4', top: 'top-[60%]', size: 'text-lg', delay: '1.1s' },
      { side: '-right-9', top: 'top-[90%]', size: 'text-xs', delay: '1.9s' },
    ].map((sp, i) => (
      <span
        key={i}
        aria-hidden="true"
        style={{ animationDelay: sp.delay }}
        className={`promo-spark pointer-events-none absolute hidden text-yellow-200 drop-shadow-[0_0_6px_rgba(253,224,71,0.9)] sm:block ${sp.side} ${sp.top} ${sp.size}`}
      >
        ✦
      </span>
    ))}

    <div className="grid">
      {promos.map((p, i) => {
        const isActive = i === active
        return (
          <div
            key={p.key}
            style={{ '--glow': p.glow }}
            className={`promo-slide relative col-start-1 row-start-1 flex ${
              isActive ? 'promo-in' : i === prev ? 'promo-out' : 'promo-idle'
            }`}
          >
            <Link
              to={p.to}
              onClick={(e) => onGo(e, p.to)}
              aria-label={`${p.cta}: ${p.title}`}
              aria-hidden={!isActive}
              tabIndex={isActive ? 0 : -1}
              onPointerMove={trackNear}
              onPointerLeave={clearNear}
              className={`promo-shape promo-face group relative flex w-full items-center gap-3 overflow-hidden py-2.5 pl-7 pr-7 hover:brightness-105 sm:gap-4 sm:py-3 sm:pl-11 sm:pr-12 ${p.ribbon}`}
            >
              {/* Tour cover photo: hidden until the pointer nears the right end */}
              <span
                aria-hidden="true"
                className="promo-cover pointer-events-none absolute inset-y-0 right-0 w-[34%] sm:w-[42%]"
              >
                <img
                  src={toSrc(p.image)}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                  className="h-full w-full object-cover"
                />
                <span className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0),rgba(0,0,0,0.45))]" />
              </span>

              {/* Gloss on the top half */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-[linear-gradient(180deg,rgba(255,255,255,0.28),rgba(255,255,255,0))]"
              />
              {/* Light sweep (only on the visible ribbon) */}
              {isActive && (
                <span
                  aria-hidden="true"
                  className="promo-shine pointer-events-none absolute inset-y-0 left-0 w-[18%] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.65),transparent)]"
                />
              )}

              {/* Round "price sticker" with the offer */}
              <span
                aria-hidden="true"
                className={`relative z-10 flex h-14 w-14 shrink-0 -rotate-[8deg] flex-col items-center justify-center rounded-full border-2 border-dashed bg-white text-center shadow-[0_3px_6px_rgba(0,0,0,0.3)] sm:h-16 sm:w-16 ${p.accent} ${p.stampBorder}`}
              >
                <span className="whitespace-nowrap text-[15px] font-extrabold leading-none sm:text-xl">
                  {p.stamp.big}
                </span>
                <span className="mt-[3px] whitespace-nowrap text-[8.5px] font-semibold leading-none sm:text-[10px]">
                  {p.stamp.small}
                </span>
              </span>

              {/* Title + tag, then one line of detail */}
              <span className="relative z-10 min-w-0 flex-1 leading-snug [text-shadow:0_1px_0_rgba(255,255,255,0.2)]">
                <span className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5">
                  <strong className="text-[15px] font-bold sm:text-base md:text-lg">
                    {p.title}
                  </strong>
                  <span
                    className={`hidden rounded-full px-2.5 py-0.5 text-[11px] font-semibold [text-shadow:none] sm:inline-block ${p.tagStyle}`}
                  >
                    {p.tag}
                  </span>
                </span>
                <span className="block text-[12px] opacity-90 sm:hidden">{p.short}</span>
                <span className="hidden text-sm opacity-90 sm:block">{p.text}</span>
              </span>

              {/* The ribbon's button end: dashed tear line, label and arrow */}
              <span
                aria-hidden="true"
                style={{ '--label': p.labelRest }}
                className="promo-cta relative z-10 flex h-10 shrink-0 items-center gap-1.5 border-l-2 border-dashed pl-3 text-sm font-extrabold sm:pl-5 sm:text-base"
              >
                <span className="hidden sm:inline">{p.cta}</span>
                <svg
                  className="promo-cta-arrow h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.8"
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

    {/* Dots double as a progress bar: the active one fills over PROMO_MS */}
    <div className="mt-3 flex justify-center gap-2">
      {promos.map((p, i) => {
        const isActive = i === active
        return (
          <button
            key={p.key}
            type="button"
            aria-label={`Show ${p.title} banner`}
            aria-current={isActive}
            onClick={() => onSelect(i)}
            className={`relative h-2 overflow-hidden rounded-full bg-white/35 shadow-[0_1px_3px_rgba(0,0,0,0.35)] transition-all duration-300 hover:bg-white/60 ${
              isActive ? 'w-10' : 'w-2'
            }`}
          >
            {isActive && (
              <span
                aria-hidden="true"
                style={{ animationPlayState: paused ? 'paused' : 'running' }}
                className="promo-fill absolute inset-0 rounded-full bg-white"
              />
            )}
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
  const [promoState, setPromoState] = useState({ active: 0, prev: null })
  const [promoPaused, setPromoPaused] = useState(false)

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
  const promoElapsed = useRef(0) // ms already shown for the current banner
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

      // Scroll fade-out of hero content (harmless with reduced motion)
      if (contentRef.current) {
        gsap.to(contentRef.current, {
          opacity: 0,
          y: -40,
          ease: 'none',
          scrollTrigger: {
            trigger: heroRef.current,
            start: '10% top',
            end: '50% 20%',
            scrub: true,
          },
        })
      }

      if (reduceMotion) return

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

      if (tourSelectRef.current) {
        tl.from(tourSelectRef.current, { y: -10, opacity: 0, duration: 0.75 })
      }

      // NOTE: promo ribbons are NOT animated with GSAP. They slide via CSS
      // keyframes (see PromoRibbons) and GSAP would fight that opacity.

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

  // Rotate promo ribbons (one visible at a time; pauses on hover / hidden tab)
  const selectPromo = (next) =>
    setPromoState((s) =>
      s.active === next ? s : { active: next, prev: s.active }
    )

  useEffect(() => {
    if (promos.length <= 1) return

    // A different banner is showing (auto or dot click): start its clock over
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
      setPromoState((s) => ({
        active: (s.active + 1) % promos.length,
        prev: s.active,
      }))
    }

    id = setTimeout(advance, Math.max(0, PROMO_MS - promoElapsed.current))

    return () => {
      clearTimeout(id)
      // Remember how long this banner has been visible so resuming continues
      promoElapsed.current += Date.now() - startedAt
    }
  }, [promoPaused, promoState.active])

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
              Adjust the min heights if the ribbons overlap the search box. */}
          <div
            ref={tourSelectRef}
            className="w-full max-w-5xl min-h-[200px] sm:min-h-[200px] md:min-h-[100px] lg:min-h-[80px]"
          />

          {/* Promotional ribbons: Cape Peninsula (yellow) + Heritage (orange),
              sliding side to side, one at a time */}
          <PromoRibbons
            innerRef={promoRef}
            active={promoState.active}
            prev={promoState.prev}
            onSelect={selectPromo}
            paused={promoPaused}
            onGo={goTo}
            setPaused={setPromoPaused}
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
              <span>Scroll to see more.</span>
            </div>
          </div>
        </a>
      </div>
    </section>
  )
}

export default Hero