import React, { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const chips = [
  {
    title: 'Save more as a group!',
    isNew: false,
  },
  {
    title: 'Hiking Trails',
    isNew: true,
  },
  {
    title: 'Historical Locations',
    isNew: true,
  },
]

const differenceCards = [
  {
    icon: '/icons/5stars.png',
    title: 'Top Tier Service',
    desc: 'Premium planning, clear communication, and a guided experience that feels organised before you even leave your accommodation.',
  },
  {
    icon: '/icons/group.png',
    title: 'Local Expertise',
    desc: 'Cape Town routes are shaped around timing, viewpoints, pickup flow, and the local details that make each stop feel meaningful.',
  },
  {
    icon: '/icons/global.png',
    title: 'High Availability',
    desc: 'On-demand vehicle planning gives Cape Frontier more flexibility to support bookings without relying on one fixed vehicle setup.',
  },
]

const trustCards = [
  {
    icon: '/icons/heartHandGreen.png',
    image: '/images/content/random/3.webp',
    label: 'Real Cape Town',
    title: 'Authentic routes with real Cape Town context',
    desc: 'Each experience is shaped around Cape Town scenery, culture, timing, local stories, and practical route flow. Instead of simply moving guests from stop to stop, the route is planned to feel connected: where you are going, why it matters, what makes the view or place special, and how the day fits together without feeling rushed.',
    layout: 'md:col-span-2 xl:col-span-5 xl:row-span-2',
    imageHeight: 'h-52 sm:h-60 xl:h-[26rem]',
    horizontal: false,
  },
  {
    icon: '/icons/approvedGreen.png',
    image: '/images/content/random/4.webp',
    label: 'Easy Booking',
    title: 'Clear booking and payment flow',
    desc: 'Guests choose the tour, date, pickup details, and participant count before checkout. Cape Frontier then confirms the booking details manually.',
    layout: 'xl:col-span-7',
    imageHeight: 'h-44 sm:h-52 xl:h-full',
    horizontal: true,
  },
  {
    icon: '/icons/professional.png',
    image: '/images/content/random/7.webp',
    label: 'Guided Safely',
    title: 'Reliable vehicle planning',
    desc: 'Because transport can be arranged on demand, Cape Frontier can match the vehicle to the group size and route instead of forcing one fixed setup.',
    layout: 'xl:col-span-7',
    imageHeight: 'h-44 sm:h-52 xl:h-full',
    horizontal: true,
    reverse: true,
  },
]

const AnimatedWords = ({ text }) => {
  const words = text.split(' ')

  return (
    <span aria-label={text}>
      {words.map((word, index) => (
        <React.Fragment key={`${word}-${index}`}>
          <span className="inline-block overflow-hidden align-bottom pb-[0.08em]">
            <span className="wmud-word inline-block will-change-transform">
              {word}
            </span>
          </span>
          {index !== words.length - 1 && ' '}
        </React.Fragment>
      ))}
    </span>
  )
}

const WhatMakesUsDifferent = () => {
  const pageRef = useRef(null)
  const headerRef = useRef(null)

  useLayoutEffect(() => {
    if (!pageRef.current) return

    const lenis = window.lenis
    const syncLenis = () => ScrollTrigger.update()

    if (lenis?.on) {
      lenis.on('scroll', syncLenis)
    }

    const ctx = gsap.context(() => {
      const words = gsap.utils.toArray('.wmud-word')
      const pills = gsap.utils.toArray('.wmud-pill')
      const newBubbles = gsap.utils.toArray('.new-tour-bubble')
      const diffCards = gsap.utils.toArray('.diff-card')
      const trustCardEls = gsap.utils.toArray('.trust-card')
      const trustIcons = gsap.utils.toArray('.trust-icon-wrap')
      const trustCopyItems = gsap.utils.toArray('.trust-copy > *')
      const parallaxImgs = gsap.utils.toArray('.parallax-img')
      const promoPieces = gsap.utils.toArray('.promo-piece')
      const isTouch = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

      if (reduceMotion) {
        gsap.set(
          [
            ...words,
            ...pills,
            ...newBubbles,
            ...diffCards,
            ...trustCardEls,
            ...trustIcons,
            ...trustCopyItems,
            ...promoPieces,
            '.wmud-subcopy',
          ],
          {
            y: 0,
            yPercent: 0,
            x: 0,
            scale: 1,
            rotate: 0,
            autoAlpha: 1,
          },
        )

        return
      }

      gsap.set(words, { yPercent: 115 })

      gsap.set('.wmud-subcopy', {
        y: 24,
        autoAlpha: 0,
      })

      gsap.set(pills, {
        y: 22,
        scale: 0.86,
        rotate: -2,
        autoAlpha: 0,
        transformOrigin: 'center center',
      })

      gsap.set(newBubbles, {
        scale: 0,
        rotate: 12,
        autoAlpha: 0,
        transformOrigin: 'center center',
      })

      const introTl = gsap.timeline({
        scrollTrigger: {
          trigger: headerRef.current,
          start: 'top 75%',
          end: 'bottom 35%',
          scrub: 0.8,
          invalidateOnRefresh: true,
        },
      })

      introTl
        .to(words, {
          yPercent: 0,
          stagger: 0.045,
          ease: 'none',
        })
        .to(
          '.wmud-subcopy',
          {
            y: 0,
            autoAlpha: 1,
            ease: 'none',
          },
          '>-0.05',
        )
        .to(
          pills,
          {
            y: 0,
            scale: 1,
            rotate: 0,
            autoAlpha: 1,
            stagger: 0.08,
            ease: 'none',
          },
          '>',
        )
        .to(
          newBubbles,
          {
            scale: 1,
            rotate: 0,
            autoAlpha: 1,
            stagger: 0.08,
            ease: 'none',
          },
          '>-0.05',
        )

      let pillPulsePlayed = false

      ScrollTrigger.create({
        trigger: headerRef.current,
        start: 'bottom 36%',
        once: true,
        onEnter: () => {
          if (pillPulsePlayed) return
          pillPulsePlayed = true

          gsap
            .timeline()
            .to(pills, {
              backgroundColor: '#bbf7d0',
              boxShadow:
                '0 0 0 7px rgba(187, 247, 208, 0.7), 0 14px 32px rgba(34, 197, 94, 0.22)',
              scale: 1.08,
              y: -3,
              stagger: 0.06,
              duration: 0.24,
              ease: 'power2.out',
            })
            .to(pills, {
              backgroundColor: '#ffffff',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              scale: 1,
              y: 0,
              stagger: 0.04,
              duration: 0.28,
              ease: 'power2.out',
            })
        },
      })

      gsap.fromTo(
        promoPieces,
        {
          y: isTouch ? 18 : 32,
          scale: 0.98,
          autoAlpha: 0,
        },
        {
          y: 0,
          scale: 1,
          autoAlpha: 1,
          stagger: 0.07,
          duration: isTouch ? 0.32 : 0.46,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.promo-banner',
            start: 'top 86%',
            once: true,
          },
        },
      )

      gsap.fromTo(
        diffCards,
        {
          y: isTouch ? 18 : 34,
          scale: 0.97,
          autoAlpha: 0,
        },
        {
          y: 0,
          scale: 1,
          autoAlpha: 1,
          stagger: isTouch ? 0.05 : 0.1,
          duration: isTouch ? 0.32 : 0.46,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.diff-grid',
            start: 'top 86%',
            once: true,
          },
        },
      )

      gsap.fromTo(
        trustCardEls,
        {
          y: isTouch ? 22 : 46,
          scale: 0.97,
          autoAlpha: 0,
        },
        {
          y: 0,
          scale: 1,
          autoAlpha: 1,
          stagger: isTouch ? 0.05 : 0.11,
          duration: isTouch ? 0.34 : 0.5,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.trust-section',
            start: 'top 84%',
            once: true,
          },
        },
      )

      gsap.fromTo(
        trustIcons,
        {
          y: 12,
          scale: 0.82,
          rotate: -5,
          autoAlpha: 0,
        },
        {
          y: 0,
          scale: 1,
          autoAlpha: 1,
          stagger: 0.06,
          duration: 0.34,
          ease: 'back.out(1.45)',
          scrollTrigger: {
            trigger: '.trust-section',
            start: 'top 76%',
            once: true,
          },
        },
      )

      gsap.fromTo(
        trustCopyItems,
        {
          y: 12,
          autoAlpha: 0,
        },
        {
          y: 0,
          autoAlpha: 1,
          stagger: 0.025,
          duration: 0.3,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.trust-section',
            start: 'top 72%',
            once: true,
          },
        },
      )

      if (!isTouch) {
        parallaxImgs.forEach((img) => {
          const frame = img.closest('.parallax-frame')
          const isSoft = img.classList.contains('soft-parallax')

          gsap.fromTo(
            img,
            {
              yPercent: isSoft ? -2 : -4,
              scale: isSoft ? 1.02 : 1.04,
            },
            {
              yPercent: isSoft ? 2 : 4,
              scale: isSoft ? 1.01 : 1.025,
              ease: 'none',
              scrollTrigger: {
                trigger: frame || img,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1.1,
                invalidateOnRefresh: true,
              },
            },
          )
        })
      }

      requestAnimationFrame(() => {
        ScrollTrigger.refresh()
      })
    }, pageRef)

    return () => {
      ctx.revert()

      if (lenis?.off) {
        lenis.off('scroll', syncLenis)
      }
    }
  }, [])

  return (
    <section ref={pageRef} className="relative z-20 w-full py-10 sm:py-12">
      <div className="mx-auto flex w-full flex-col gap-6">
        {/* ============================================================
            BANNER — KEPT
        ============================================================ */}
        <div
          ref={headerRef}
          className="z-30 mx-auto flex w-full max-w-5xl flex-col items-center gap-8 bg-white px-4 py-14 text-center text-black sm:py-16"
        >
          <img src="/icons/infoDark.png" className="h-8" alt="" />

          <div className="max-w-3xl font-frank text-4xl font-extrabold sm:text-5xl lg:text-6xl">
            <p>
              <AnimatedWords text="What makes us different?" />
            </p>
          </div>

          <p className="wmud-subcopy max-w-2xl text-sm leading-relaxed text-black/70 sm:text-base">
            Discover the unique features and benefits that set us apart from the competition.
            Benefit from our expertise and commitment.
          </p>
        </div>

        <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-4 sm:px-6 lg:px-8">
          {/* ============================================================
              PILLS — KEPT
          ============================================================ */}
          <div className="wmud-pill-wrap relative z-10 flex flex-wrap justify-center gap-4">
            {chips.map((item) => (
              <div
                key={item.title}
                className="wmud-pill relative rounded-full bg-white px-6 py-2 font-bitter text-sm text-black shadow-sm will-change-transform"
              >
                {item.title}

                {item.isNew && (
                  <span className="new-tour-bubble absolute -right-3 -top-3 rounded-full bg-red-500 px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-white shadow-md">
                    New tour
                  </span>
                )}
              </div>
            ))}
          </div>


          {/* ============================================================
              DIFF CARDS — ROW ON MOBILE/MEDIUM
          ============================================================ */}
          <div className="diff-grid relative z-10 flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] md:grid md:grid-cols-3 md:overflow-visible md:pb-0 [&::-webkit-scrollbar]:hidden">
            {differenceCards.map((item) => (
              <div
                key={item.title}
                className="diff-card flex min-w-[76vw] flex-col items-start gap-3 rounded-[1.25rem] bg-white px-4 py-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md sm:min-w-[18rem] md:min-w-0"
              >
                <div className="flex h-12 items-center justify-center">
                  <img src={item.icon} className="h-11 w-fit object-contain" alt="" />
                </div>

                <p className="font-frank text-2xl font-bold leading-none text-black">
                  {item.title}
                </p>

                <p className="font-bitter text-sm leading-relaxed text-black/52">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

          {/* ============================================================
              SIMPLE TRUST PILL
          ============================================================ */}
          <div className="promo-banner relative z-10">
            <div className="promo-piece mx-auto flex w-4xl items-center gap-2 rounded-full bg-green-200 px-3 py-2 shadow-sm sm:px-4">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/80 shadow-sm">
                <img
                  src="/icons/approvedGreen.png"
                  className="h-5 w-5 object-contain"
                  alt=""
                />
              </span>

              <p className="min-w-0 font-bitter text-xs font-bold leading-snug text-green-950 sm:text-sm">
                Book your group, pay securely, and receive manual confirmation.
              </p>
            </div>
          </div>

          {/* ============================================================
              TRUST SECTION — LIGHTER GAPS, LESS ROUNDNESS, NO CARD BORDERS
          ============================================================ */}
          <div className="trust-section relative z-10 overflow-hidden rounded-[1.5rem] bg-transparent p-3 shadow-[0_16px_42px_rgba(15,23,42,0.08)] sm:p-4 lg:p-5">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 hero-gradient opacity-95" />
            <div className="pointer-events-none absolute inset-x-0 top-[38%] h-28 bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.35)_42%,rgba(255,255,255,0)_100%)]" />

            <div className="relative z-10 grid gap-3 md:grid-cols-2 xl:grid-cols-12">
              {trustCards.map((item) => (
                <article
                  key={item.title}
                  className={`trust-card group overflow-hidden rounded-[1.25rem] bg-white/90 shadow-sm will-change-transform ${item.layout}`}
                >
                  <div
                    className={`grid h-full ${
                      item.horizontal ? 'xl:grid-cols-[0.9fr_1.1fr]' : ''
                    }`}
                  >
                    <div
                      className={`parallax-frame relative overflow-hidden ${item.imageHeight} ${
                        item.reverse ? 'xl:order-2' : ''
                      }`}
                    >
                      <img
                        src={item.image}
                        className="parallax-img h-[108%] w-full object-cover will-change-transform"
                        alt=""
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />

                      <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1.5 font-bitter text-[11px] font-bold text-black shadow-sm backdrop-blur">
                        {item.label}
                      </div>
                    </div>

                    <div className="trust-copy relative flex flex-col justify-between gap-4 p-4 sm:p-5">
                      <div className="trust-icon-wrap -mt-10 flex h-14 w-14 items-center justify-center rounded-[1rem] bg-green-200 shadow-sm ring-4 ring-white xl:mt-0">
                        <img src={item.icon} className="h-8 w-8 object-contain" alt="" />
                      </div>

                      <div className="flex flex-col gap-2">
                        <p className="font-frank text-3xl font-black leading-none text-black/85">
                          {item.title}
                        </p>

                        <p className="font-bitter text-sm leading-relaxed text-gray-500">
                          {item.desc}
                        </p>

                        {item.title === 'Reliable vehicle planning' && (
                          <div className="mt-2">
                            <p className="mb-2 font-bitter text-[10px] font-black uppercase tracking-[0.16em] text-black/35">
                              Fleet support
                            </p>

                            <div className="grid grid-cols-3 gap-1.5">
                              {[
                                '/images/content/vehicles/hyundai-staria-silver.webp',
                                '/images/content/vehicles/hyundai-staria-white.webp',
                                '/images/content/vehicles/mitsubishi-xpander.webp',
                              ].map((src, index) => (
                                <img
                                  key={src}
                                  src={src}
                                  className="h-12 w-full rounded-lg object-cover shadow-sm"
                                  alt={['Hyundai Staria Silver', 'Hyundai Staria White', 'Mitsubishi Xpander'][index]}
                                  loading="lazy"
                                  decoding="async"
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between border-t border-black/5 pt-3">
                        <p className="font-bitter text-[11px] font-bold uppercase tracking-[0.16em] text-black/40">
                          Cape Frontier
                        </p>

                        <span className="h-2 w-2 rounded-full bg-green-400" />
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="relative z-10 mt-3 grid gap-2 sm:grid-cols-2">
              <div className="rounded-[1rem] bg-white/75 px-4 py-3 shadow-sm">
                <p className="font-bitter text-[10px] font-black uppercase tracking-[0.16em] text-blue-700">
                  Reschedule support
                </p>
                <p className="mt-1 font-bitter text-xs leading-relaxed text-black/50">
                  Weather-affected trips can be guided through reschedule options depending on availability.
                </p>
              </div>

              <div className="rounded-[1rem] bg-white/75 px-4 py-3 shadow-sm">
                <p className="font-bitter text-[10px] font-black uppercase tracking-[0.16em] text-green-700">
                  Refund clarity
                </p>
                <p className="mt-1 font-bitter text-xs leading-relaxed text-black/50">
                  Refund handling follows the stated cancellation window, with weather cases reviewed fairly.
                </p>
              </div>
            </div>

            <div className="relative z-10 mt-4 flex justify-center">
              <a
                href="#popular-tours"
                className="flex items-center justify-center gap-3 rounded-full bg-blue-400 px-6 py-3 font-bold text-white transition-all hover:-translate-y-0.5 hover:scale-[1.02] hover:bg-blue-500"
              >
                Learn More
                <img src="/icons/go.png" className="h-4 w-4 object-contain" alt="" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default WhatMakesUsDifferent