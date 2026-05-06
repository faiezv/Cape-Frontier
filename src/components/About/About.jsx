import React, { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import PopularTours from './PopularTours.jsx'
import StripeSponsored from './StripeSponsored.jsx'
import CurrentPopularTour from './CurrentPopularTour.jsx'
import ReviewsShowcase from './ReviewsShowcase.jsx'
import WhatMakesUsDifferent from './WhatMakesUsDifferent.jsx'
import JourneyToursBlock from './JourneyToursBlock.jsx'

import reviews from '../../data/reviews.js'

gsap.registerPlugin(ScrollTrigger)

// -----------------------------------------------------------------------------
// intro slides
// -----------------------------------------------------------------------------
const exploreSlides = [
  {
    img: './images/content/random/1.webp',
    eyebrow: 'Cape Town experiences',
    title: 'Explore beyond the ordinary.',
    desc: 'From iconic viewpoints to hidden local gems, our guided routes are designed to feel immersive, personal, and unforgettable.',
  },
  {
    img: './images/content/random/5.webp',
    eyebrow: 'Scenic routes',
    title: 'Discover routes worth remembering.',
    desc: 'Travel through coastlines, mountains, and culture-rich stops with tours that balance comfort, storytelling, and adventure.',
  },
  {
    img: './images/content/random/6.webp',
    eyebrow: 'Trusted local guides',
    title: 'See Cape Town with real local insight.',
    desc: 'Every journey is led with care, local knowledge, and a focus on giving travellers a premium experience from start to finish.',
  },
]

const linkCards = [
  "Explore Cape Town's Table Mountain, Robben Island, and Cape Point!",
  'Plan premium routes with scenic stops, local stories, and unforgettable views.',
]

const stats = [
  { value: '10+', label: 'Years of experience' },
  { value: '20+', label: 'Tour Packages' },
  { value: '500+', label: 'Happy Customers' },
]

const WORD_HOLD_TIME = 12.4

// -----------------------------------------------------------------------------
// small local display components
// -----------------------------------------------------------------------------
const NumberBadge = ({ children }) => (
  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[24px] bg-[linear-gradient(135deg,rgba(148,197,255,0.9)_0%,rgba(152,255,213,0.9)_100%)] font-frank text-5xl font-black text-white shadow-[0_12px_30px_rgba(0,0,0,0.12)] sm:h-24 sm:w-24 sm:text-6xl md:h-28 md:w-28">
    {children}
  </div>
)

const ArrowIcon = ({ className = 'h-4 w-4' }) => (
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

const shouldReduceMotion = () => {
  if (typeof window === 'undefined') return true
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}

const isTouchDevice = () => {
  if (typeof window === 'undefined') return false

  return (
    window.matchMedia?.('(pointer: coarse)').matches ||
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0
  )
}

const About = () => {
  const textRefs = useRef([])
  const statsRef = useRef([])
  const linkStripRef = useRef(null)
  const linkCardRefs = useRef([])

  const [slideIndex, setSlideIndex] = useState(0)

  const slide = exploreSlides[slideIndex]

  // ---------------------------------------------------------------------------
  // page navigation helpers
  // ---------------------------------------------------------------------------
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

  const scrollToJourney = useCallback(() => {
    scrollToSection('journey-start', 'tours')
  }, [scrollToSection])

  const scrollToContact = useCallback(() => {
    scrollToSection('contact')
  }, [scrollToSection])

  // ---------------------------------------------------------------------------
  // rotating intro text animation
  // ---------------------------------------------------------------------------
  useLayoutEffect(() => {
    const words = textRefs.current.filter(Boolean)

    if (!words.length) return undefined

    if (shouldReduceMotion()) {
      gsap.set(words, {
        yPercent: 0,
        opacity: 1,
        scale: 1,
        filter: 'blur(0px)',
      })

      return undefined
    }

    const tl = gsap.timeline({
      defaults: {
        ease: 'power2.out',
      },
      onComplete: () => {
        setSlideIndex((current) => (current + 1) % exploreSlides.length)
      },
    })

    tl.set(
      words,
      {
        yPercent: 110,
        opacity: 0,
        scale: 0.98,
        filter: 'blur(2px)',
      },
      0
    )
      .to(words, {
        yPercent: 0,
        opacity: 1,
        scale: 1,
        filter: 'blur(0px)',
        duration: 0.28,
        stagger: 0.08,
        ease: 'power3.out',
      })
      .to(words, {
        yPercent: 0,
        opacity: 1,
        scale: 1,
        duration: WORD_HOLD_TIME,
        ease: 'none',
      })
      .to(words, {
        yPercent: -110,
        opacity: 0,
        scale: 0.98,
        filter: 'blur(2px)',
        duration: 0.26,
        stagger: 0.06,
        ease: 'power2.in',
      })

    return () => tl.kill()
  }, [slideIndex])

  // ---------------------------------------------------------------------------
  // link strip entrance animation
  // ---------------------------------------------------------------------------
  useLayoutEffect(() => {
    const cards = linkCardRefs.current.filter(Boolean)

    if (!cards.length || !linkStripRef.current || shouldReduceMotion()) return undefined

    gsap.set(cards, {
      yPercent: 100,
      opacity: 0,
    })

    const tween = gsap.to(cards, {
      yPercent: 0,
      opacity: 1,
      duration: 0.5,
      stagger: 0.08,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: linkStripRef.current,
        start: 'top 90%',
        toggleActions: 'play none none reverse',
      },
    })

    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  }, [])

  // ---------------------------------------------------------------------------
  // stats animation
  // static on touch devices for better mobile performance
  // ---------------------------------------------------------------------------
  useLayoutEffect(() => {
    const statItems = statsRef.current.filter(Boolean)

    if (!statItems.length || shouldReduceMotion() || isTouchDevice()) return undefined

    const tl = gsap.timeline({
      repeat: -1,
      repeatDelay: 0.35,
    })

    tl.fromTo(
      statItems,
      { opacity: 0, y: 14 },
      {
        opacity: 1,
        y: 0,
        duration: 0.38,
        stagger: 0.14,
        ease: 'power2.out',
      }
    )
      .to({}, { duration: 0.7 })
      .to(statItems, {
        opacity: 0,
        y: -8,
        duration: 0.3,
        stagger: 0.14,
        ease: 'power2.in',
      })

    return () => tl.kill()
  }, [])

  return (
    <div className="relative flex w-full max-w-full flex-col bg-white">
      <img
        src="/assets/content/clip-art/section1-bg.png"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-70"
        alt=""
      />

      {/* ---------------------------------------------------------------------
          intro section
          mobile is intentionally compact so users reach tours faster
      --------------------------------------------------------------------- */}
      <section className="relative z-20 w-full bg-white">
        <div className="relative z-20 mx-auto flex w-full max-w-5xl flex-col gap-5 px-4 pb-5 pt-8 sm:px-6 sm:pb-8 sm:pt-12 md:gap-8 md:pt-16 lg:px-8">
          <div className="flex w-full flex-col items-stretch gap-6 md:flex-row md:gap-8">
            {/* desktop/tablet image panel only; hidden on mobile to reduce vertical length */}
            <div className="relative hidden min-w-0 md:block md:w-1/2">
              <div className="relative aspect-[4/4.15] w-full overflow-hidden rounded-[24px] bg-blue-100 shadow-[0_16px_40px_rgba(0,0,0,0.12)] lg:rounded-[28px]">
                {exploreSlides.map((item, index) => (
                  <img
                    key={item.img}
                    src={item.img}
                    alt={item.title}
                    loading={index === 0 ? 'eager' : 'lazy'}
                    decoding="async"
                    className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
                      index === slideIndex ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                ))}

                <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(5,20,70,0.28)_0%,rgba(5,20,70,0.02)_40%,rgba(255,255,255,0.05)_100%)]" />

                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-2xl border border-white/20 bg-white/14 px-4 py-3 text-white backdrop-blur-md">
                  <div className="min-w-0">
                    <p className="font-bitter text-[10px] font- uppercase tracking-[0.2em] text-white/75 sm:text-xs">
                      {slide.eyebrow}
                    </p>
                    <p className="mt-1 truncate font-frank text-sm font-semibold sm:text-base">
                      Cape Frontier Moments
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    {exploreSlides.map((_, index) => (
                      <button
                        key={index}
                        type="button"
                        aria-label={`Go to slide ${index + 1}`}
                        onClick={() => setSlideIndex(index)}
                        className={`h-2.5 rounded-full transition-all ${
                          index === slideIndex ? 'w-7 bg-white' : 'w-2.5 bg-white/45'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* intro copy */}
            <div className="flex min-w-0 flex-col justify-between gap-5 md:w-1/2 md:gap-8">
              <div className="flex flex-col gap-3 md:gap-4">
                <div className="overflow-hidden">
                  <p
                    ref={(el) => {
                      textRefs.current[0] = el
                    }}
                    className="font-bitter text-[10px] font-black uppercase tracking-[0.22em] text-blue-700/70 sm:text-xs md:text-sm"
                  >
                    {slide.eyebrow}
                  </p>
                </div>

                <div className="overflow-hidden">
                  <h1
                    ref={(el) => {
                      textRefs.current[1] = el
                    }}
                    className="font-bitter text-3xl font-bold leading-[0.95] text-black sm:text-5xl lg:text-6xl"
                  >
                    {slide.title}
                  </h1>
                </div>

                <div className="overflow-hidden">
                  <p
                    ref={(el) => {
                      textRefs.current[2] = el
                    }}
                    className="max-w-xl font-mont text-sm leading-6 text-black/60 sm:text-base sm:leading-7"
                  >
                    <span className="md:hidden">
                      Guided Cape Town routes with local insight, scenic stops, and easy booking.
                    </span>
                    <span className="hidden md:inline">{slide.desc}</span>
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={scrollToJourney}
                    className="hero-gradient inline-flex items-center gap-2 rounded-xl px-4 py-3 font-mont text-xs font-black uppercase tracking-[0.14em] text-white shadow-[0_12px_28px_rgba(15,10,113,0.16)] transition hover:opacity-90 sm:text-sm"
                  >
                    <span>Start your journey</span>
                    <ArrowIcon />
                  </button>

                  <button
                    type="button"
                    onClick={scrollToContact}
                    className="inline-flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 font-mont text-xs font-black uppercase tracking-[0.14em] text-blue-700 transition hover:bg-blue-100 sm:text-sm"
                  >
                    <img src="./icons/faqBlue.png" className="h-4 sm:h-5" alt="" />
                    <span>Contact</span>
                  </button>
                </div>
              </div>

              {/* compact stats; no long vertical stack on mobile */}
              <div className="grid grid-cols-3 gap-2 rounded-2xl border border-black/5 bg-white/75 p-3 shadow-[0_14px_34px_rgba(15,23,42,0.06)] backdrop-blur-sm sm:gap-4 sm:p-4">
                {stats.map((item, index) => (
                  <div
                    key={item.label}
                    ref={(el) => {
                      statsRef.current[index] = el
                    }}
                    className="min-w-0 text-center sm:text-left"
                  >
                    <p className="font-bitter text-2xl font-black leading-none text-blue-700 sm:text-3xl lg:text-4xl">
                      {item.value}
                    </p>
                    <p className="mt-1 font-mont text-[10px] font-bold leading-tight text-black/50 sm:text-xs lg:text-sm">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------------
          journey area
          link strip + popular tour + booking/suggested tours + reviews
      --------------------------------------------------------------------- */}
      <section className="relative z-20 w-full">
        <div className="mx-auto mt-2 flex w-full max-w-5xl flex-col gap-5 px-4 sm:mt-4 sm:gap-8 sm:px-6 lg:px-8">
          {/* link strip: second card hidden on mobile to reduce vertical length */}
          <div ref={linkStripRef} className="grid w-full gap-2 md:grid-cols-2">
            {linkCards.map((text, index) => (
              <div
                key={text}
                ref={(el) => {
                  linkCardRefs.current[index] = el
                }}
                className={`overflow-hidden rounded-2xl ${index > 0 ? 'hidden sm:block' : ''}`}
              >
                <button
                  type="button"
                  onClick={scrollToJourney}
                  className="flex w-full min-w-0 items-center gap-3 rounded-2xl border border-green-300/60 bg-green-200 px-4 py-3 text-left font-mont text-sm text-black shadow-[0_10px_24px_rgba(0,0,0,0.05)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(0,0,0,0.08)] sm:px-5 sm:py-4 sm:text-[15px]"
                >
                  <p className="min-w-0 flex-1 leading-relaxed">{text}</p>
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black/6">
                    <img src="./icons/topRightArrowDark.png" className="h-4 w-4" alt="" />
                  </div>
                </button>
              </div>
            ))}
          </div>

          {/* desktop/tablet feature only; mobile goes straight to journey block */}
          <div className=" md:block">
            <CurrentPopularTour />
          </div>

          {/* coupled booking + suggested tours block */}
          <div id="journey-start" className="scroll-mt-24">
            <JourneyToursBlock />
          </div>

          <ReviewsShowcase reviews={reviews} NumberBadge={NumberBadge} />

         {/* Hidden bg mobile only  */}
        <div className="md:hidden absolute w-2vw -bottom-20 -inset-x-12 h-1/4 hero-gradient-bl"></div>
        </div>
      </section>

      {/* ---------------------------------------------------------------------
          trust + remaining tour/payment sections
      --------------------------------------------------------------------- */}
      <section className="relative z-20 w-full scroll-mt-24">
        <WhatMakesUsDifferent />

        <div className="mx-auto flex w-full max-w-5xl flex-col px-4 sm:px-6 lg:px-8">
          <PopularTours />
          <StripeSponsored />
        </div>
      </section>
    </div>
  )
}

export default About