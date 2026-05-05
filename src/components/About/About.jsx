import React, { useState, useLayoutEffect, useRef } from 'react'
import PopularTours from './PopularTours.jsx'
import StripeSponsored from './StripeSponsored.jsx'
import TourSelect from '../Tours/TourSelect.jsx'
import ClassicTourBanner from './CurrentPopularTour.jsx'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import ReviewsShowcase from './ReviewsShowcase.jsx'
import WhatMakesUsDifferent from './WhatMakesUsDifferent.jsx'

import reviews from '../../data/reviews.js'
import SuggestedTours from './SuggestedTours.jsx'

gsap.registerPlugin(ScrollTrigger)

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

const NumberBadge = ({ children }) => (
  <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-[28px] bg-[linear-gradient(135deg,rgba(148,197,255,0.88)_0%,rgba(152,255,213,0.88)_100%)] text-5xl font-bold text-white shadow-[0_12px_30px_rgba(0,0,0,0.12)] sm:h-28 sm:w-28 sm:text-6xl">
    {children}
  </div>
)

const About = () => {
  const textRefs = useRef([])
  const statsRef = useRef([])
  const statsContainerRef = useRef(null)
  const linkStripRef = useRef(null)
  const linkCardRefs = useRef([])
  const bookingShellRef = useRef(null)
  const bookingRef = useRef(null)
  const tourSelectTeaserRef = useRef(null)
  const tourSelectDropRef = useRef(null)

  const [slideIndex, setSlideIndex] = useState(0)
  const [isTourSelectOpen, setIsTourSelectOpen] = useState(false)
  const [hasTourSelectPeeked, setHasTourSelectPeeked] = useState(false)

  const slide = exploreSlides[slideIndex]

  const WORD_HOLD_TIME = 12.4

  const handleToggleTourSelect = () => {
    setHasTourSelectPeeked(true)
    setIsTourSelectOpen((prevValue) => !prevValue)
  }

  const handleOpenTourSelect = () => {
    setHasTourSelectPeeked(true)
    setIsTourSelectOpen(true)
  }

  useLayoutEffect(() => {
    const words = textRefs.current?.filter(Boolean)

    if (!words || words.length === 0) return

    const tl = gsap.timeline({
      defaults: {
        ease: 'power2.out',
      },
      onComplete: () => {
        setSlideIndex((i) => (i + 1) % exploreSlides.length)
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

  useLayoutEffect(() => {
    const cards = linkCardRefs.current.filter(Boolean)
    if (!cards.length || !linkStripRef.current) return

    gsap.set(cards, {
      yPercent: 100,
      opacity: 0,
    })

    const tween = gsap.to(cards, {
      yPercent: 0,
      opacity: 1,
      duration: 0.55,
      stagger: 0.1,
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

  useLayoutEffect(() => {
    if (!bookingShellRef.current || !bookingRef.current) return

    const ctx = gsap.context(() => {
      gsap
        .timeline({
          scrollTrigger: {
            trigger: bookingShellRef.current,
            start: 'top 75%',
            end: 'top 45%',
            scrub: true,
            invalidateOnRefresh: true,
          },
        })
        .fromTo(
          bookingRef.current,
          {
            y: 0,
            backgroundColor: 'rgba(255, 255, 255, 0)',
            boxShadow: '0 18px 40px rgba(0,0,0,0.05)',
          },
          {
            y: -8,
            backgroundColor: 'rgba(255,255,255,0.98)',
            boxShadow: '0 24px 60px rgba(15,10,113,0.12)',
            ease: 'none',
          }
        )
    }, bookingShellRef)

    return () => ctx.revert()
  }, [])

  useLayoutEffect(() => {
    if (!bookingShellRef.current) return

    const trigger = ScrollTrigger.create({
      trigger: bookingShellRef.current,
      start: 'top 62%',
      end: 'bottom 28%',
      onEnter: () => {
        setHasTourSelectPeeked(true)
      },
      onEnterBack: () => {
        setHasTourSelectPeeked(true)
      },
      onLeaveBack: () => {
        if (!isTourSelectOpen) {
          setHasTourSelectPeeked(false)
        }
      },
    })

    return () => trigger.kill()
  }, [isTourSelectOpen])

  useLayoutEffect(() => {
    if (!tourSelectTeaserRef.current) return

    const teaser = tourSelectTeaserRef.current
    const shouldShowTeaser = hasTourSelectPeeked && !isTourSelectOpen

    gsap.killTweensOf(teaser)

    gsap.to(teaser, {
      opacity: shouldShowTeaser ? 1 : 0,
      y: shouldShowTeaser ? 0 : -18,
      scale: shouldShowTeaser ? 1 : 0.96,
      duration: shouldShowTeaser ? 0.45 : 0.25,
      ease: shouldShowTeaser ? 'power3.out' : 'power2.inOut',
      onStart: () => {
        if (shouldShowTeaser) {
          teaser.style.pointerEvents = 'auto'
        }
      },
      onComplete: () => {
        if (!shouldShowTeaser) {
          teaser.style.pointerEvents = 'none'
        }
      },
    })
  }, [hasTourSelectPeeked, isTourSelectOpen])

  useLayoutEffect(() => {
    if (!tourSelectDropRef.current) return

    gsap.set(tourSelectDropRef.current, {
      height: 0,
      opacity: 0,
      y: -18,
      scale: 0.985,
      transformOrigin: 'top center',
      pointerEvents: 'none',
    })
  }, [])

  useLayoutEffect(() => {
    if (!tourSelectDropRef.current) return

    const panel = tourSelectDropRef.current

    gsap.killTweensOf(panel)

    gsap.to(panel, {
      height: isTourSelectOpen ? 'auto' : 0,
      opacity: isTourSelectOpen ? 1 : 0,
      y: isTourSelectOpen ? 0 : -18,
      scale: isTourSelectOpen ? 1 : 0.985,
      duration: isTourSelectOpen ? 0.6 : 0.35,
      ease: isTourSelectOpen ? 'power3.out' : 'power2.inOut',
      onStart: () => {
        if (isTourSelectOpen) {
          panel.style.pointerEvents = 'auto'
        }
      },
      onComplete: () => {
        if (!isTourSelectOpen) {
          panel.style.pointerEvents = 'none'
        }

        ScrollTrigger.refresh()
      },
    })
  }, [isTourSelectOpen])

  useLayoutEffect(() => {
    const stats = statsRef.current.filter(Boolean)

    if (!stats.length) return

    const tl = gsap.timeline({
      repeat: -1,
      repeatDelay: 0.2,
    })

    tl.fromTo(
      stats,
      { opacity: 0, y: 16 },
      {
        opacity: 1,
        y: 0,
        duration: 0.45,
        stagger: 0.18,
        ease: 'power2.out',
      }
    )
      .to({}, { duration: 0.6 })
      .to(stats, {
        opacity: 0,
        y: -10,
        duration: 0.35,
        stagger: 0.18,
        ease: 'power2.in',
      })

    return () => tl.kill()
  }, [])

  return (
    <div className="relative flex w-full max-w-full flex-col bg-white">
      <img
        src="/assets/content/clip-art/section1-bg.png"
        className="absolute inset-0 h-full w-full object-cover"
        alt=""
      />

      <section className="relative z-20 w-full bg-white">
        <div className="relative z-20 mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 pb-8 pt-14 sm:px-6 md:gap-8 md:pt-20 lg:px-8">
          <div className="flex w-full flex-col items-stretch gap-6 md:flex-row md:gap-8">
            <div className="relative min-w-0 md:w-1/2">
              <div className="relative aspect-[4/4.4] w-full overflow-hidden rounded-[28px] bg-blue-100 shadow-[0_16px_40px_rgba(0,0,0,0.12)] sm:aspect-[4/4.1]">
                {exploreSlides.map((item, index) => (
                  <img
                    key={item.img}
                    src={item.img}
                    alt={item.title}
                    className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
                      index === slideIndex ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                ))}

                <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(5,20,70,0.28)_0%,rgba(5,20,70,0.02)_40%,rgba(255,255,255,0.05)_100%)]" />

                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-2xl border border-white/20 bg-white/14 px-4 py-3 text-white backdrop-blur-md">
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/75 sm:text-xs">
                      {slide.eyebrow}
                    </p>
                    <p className="mt-1 truncate text-sm font-semibold sm:text-base">
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

            <div className="flex min-w-0 flex-col justify-between gap-8 md:w-1/2">
              <div className="flex flex-col gap-4">
                <div className="overflow-hidden">
                  <p
                    ref={(el) => (textRefs.current[0] = el)}
                    className="text-xs font-bold uppercase tracking-[0.22em] text-blue-700/70 sm:text-sm"
                  >
                    {slide.eyebrow}
                  </p>
                </div>

                <div className="overflow-hidden">
                  <div
                    ref={(el) => (textRefs.current[1] = el)}
                    className="font-bitter text-4xl font-bold leading-[0.95] text-black sm:text-5xl lg:text-6xl"
                  >
                    {slide.title}
                  </div>
                </div>

                <div className="overflow-hidden">
                  <p
                    ref={(el) => (textRefs.current[2] = el)}
                    className="max-w-xl font-mont text-sm leading-7 text-black/60 sm:text-base"
                  >
                    {slide.desc}
                  </p>
                </div>

                <button className="flex w-fit items-center gap-2 rounded-full bg-green-200 px-3 py-1.5 text-blue-600 transition hover:scale-[1.02]">
                  <img src="./icons/faqBlue.png" className="h-5 sm:h-6" alt="" />
                  <span className="font-mont text-sm font-bold sm:text-base">Contact</span>
                </button>
              </div>

              <div className="flex flex-col gap-6">
                <div ref={statsContainerRef} className="grid grid-cols-3 gap-4 sm:gap-5">
                  <div ref={(el) => (statsRef.current[0] = el)}>
                    <p className="font-bitter text-3xl font-extrabold text-blue-700 sm:text-4xl">
                      10+
                    </p>
                    <p className="font-mont text-xs font-bold text-black/50 sm:text-sm">
                      Years of experience
                    </p>
                  </div>

                  <div ref={(el) => (statsRef.current[1] = el)}>
                    <p className="font-bitter text-3xl font-extrabold text-blue-700 sm:text-4xl">
                      20+
                    </p>
                    <p className="font-mont text-xs font-bold text-black/50 sm:text-sm">
                      Tour Packages
                    </p>
                  </div>

                  <div ref={(el) => (statsRef.current[2] = el)}>
                    <p className="font-bitter text-3xl font-extrabold text-blue-700 sm:text-4xl">
                      500+
                    </p>
                    <p className="font-mont text-xs font-bold text-black/50 sm:text-sm">
                      Happy Customers
                    </p>
                  </div>
                </div>

                <button className="hero-gradient flex w-fit items-center gap-2 rounded-lg px-5 py-3 text-sm text-white transition hover:opacity-90 sm:text-base">
                  <span>Start your journey</span>
                  <img src="./icons/go.png" className="h-4" alt="" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-20 w-full">
        <div className="mx-auto mt-4 flex w-full max-w-6xl flex-col gap-8 px-4 sm:px-6 lg:px-8">
          <div ref={linkStripRef} className="grid w-full gap-2 md:grid-cols-2">
            {linkCards.map((text, index) => (
              <div
                key={text}
                ref={(el) => (linkCardRefs.current[index] = el)}
                className="overflow-hidden rounded-2xl"
              >
                <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-green-300/60 bg-green-200 px-4 py-3 text-sm text-black shadow-[0_10px_24px_rgba(0,0,0,0.05)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(0,0,0,0.08)] sm:px-5 sm:py-4 sm:text-[15px]">
                  <p className="min-w-0 flex-1 leading-relaxed">{text}</p>
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black/6">
                    <img src="./icons/topRightArrowDark.png" className="h-4 w-4" alt="" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <ClassicTourBanner />

          <div ref={bookingShellRef} className="relative mx-auto h-full max-w-5xl overflow-visible pt-10">
            <div
              ref={bookingRef}
              className={`relative z-30 overflow-hidden rounded-[28px] border border-black/8 bg-white/10 backdrop-blur-sm transition-[border-radius] duration-300 ${
                isTourSelectOpen ? 'rounded-b-[20px]' : ''
              }`}
            >
              <div className="relative flex flex-col gap-5 p-5 transition-colors sm:p-6 md:flex-row md:items-center md:gap-8 lg:p-8">
                <div className="shrink-0">
                  <NumberBadge>1</NumberBadge>
                </div>

                <div className="min-w-0 flex-1 text-black">
                  <p
                    className="text-xs font-bold uppercase tracking-[0.24em] sm:text-sm"
                    style={{ color: 'var(--color-brand-lightblue)' }}
                  >
                    Booking step
                  </p>

                  <p
                    className="mt-2 font-frank text-4xl leading-[0.95] sm:text-5xl lg:text-6xl"
                    style={{ color: 'var(--color-brand-darkblue)' }}
                  >
                    Start your journey.
                  </p>

                  <p className="mt-3 max-w-2xl font-mont text-sm leading-7 text-black/60 sm:text-base md:text-lg">
                    <span className="font-bold text-black">Book your tour</span> with your
                    preferred route, date, and group details, then get ready for a Cape Town
                    experience built to feel seamless from start to finish.
                  </p>
                </div>

                <div className="flex shrink-0 items-center self-start md:self-center">
                  <button
                    type="button"
                    onClick={handleToggleTourSelect}
                    aria-expanded={isTourSelectOpen}
                    className="group flex items-center gap-3 rounded-full border border-black/10 bg-white px-4 py-2.5 font-mont text-xs font-bold uppercase tracking-[0.18em] text-black/70 shadow-[0_12px_28px_rgba(0,0,0,0.08)] transition duration-300 hover:-translate-y-0.5 hover:border-blue-400/40 hover:text-blue-700"
                  >
                    <span>{isTourSelectOpen ? 'Close form' : 'Choose tour'}</span>

                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-green-200 text-black transition-transform duration-300 group-hover:translate-y-0.5">
                      <svg
                        className={`h-4 w-4 transition-transform duration-300 ${
                          isTourSelectOpen ? 'rotate-180' : ''
                        }`}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                      >
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </span>
                  </button>
                </div>
              </div>
            </div>

            <div className="relative z-40 flex  justify-center">
              <button
                ref={tourSelectTeaserRef}
                type="button"
                onClick={handleOpenTourSelect}
                className="pointer-events-none -translate-y-4 rounded-full border border-black/10 bg-white px-4 py-2 font-mont text-[11px] font-bold text-black/65 opacity-0 shadow-[0_14px_32px_rgba(0,0,0,0.10)] backdrop-blur-sm transition-colors hover:text-blue-700"
              >
                <span className="inline-flex items-center gap-2">
                  <span>Open tour form</span>
                  <span className="rounded-full bg-green-200 px-2 py-0.5 text-[9px] uppercase tracking-[0.14em] text-black/70">
                    quick
                  </span>
                </span>
              </button>
            </div>

            <div
              ref={tourSelectDropRef}
              className="relative z-20 mx-auto w-full max-w-5xl overflow-hidden"
            >
              <div className="rounded-b-[28px] border border-t-0 border-black/8 bg-white/95 px-2 pb-4 pt-5 shadow-[0_24px_60px_rgba(15,10,113,0.10)] backdrop-blur-sm sm:px-4">
                <TourSelect />
              </div>
            </div>
          </div>

          <SuggestedTours />

          <ReviewsShowcase reviews={reviews} NumberBadge={NumberBadge} />
        </div>
      </section>

      <section className="relative z-20 w-full scroll-mt-24">
        <WhatMakesUsDifferent />

        <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 sm:px-6 lg:px-8">
          <PopularTours />
          <StripeSponsored />
        </div>
      </section>
    </div>
  )
}

export default About