import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

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

  const heroRef = useRef(null)
  const contentRef = useRef(null)
  const tourSelectRef = useRef(null)
  const scrollRef = useRef(null)
  const shineRef = useRef(null)
  const arrowRef = useRef(null)
  const bgRefs = useRef([])
  const prevSlide = useRef(0)

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

          {/* Placeholder used for the desktop TourSelect pinning */}
          <div ref={tourSelectRef} className="w-full max-w-5xl" />
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