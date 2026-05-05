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
    desc: 'All our tours are led by certified local guides with years of experience keeping you safe.',
  },
  {
    icon: '/icons/group.png',
    title: 'Local Expertise',
    desc: 'We know Cape Town inside out — hidden gems, best times, and the stories behind every stop.',
  },
  {
    icon: '/icons/global.png',
    title: 'Safe & Trusted',
    desc: 'Consistently rated 5 stars by hundreds of travellers from around the world.',
  },
]

const trustCards = [
  {
    icon: '/icons/heartHandGreen.png',
    image: '/images/content/random/3.webp',
    label: 'Real Cape Town',
    title: 'Authenticity & Integrity',
    desc: 'We showcase the true essence of Cape Town through immersive local experiences built around culture, history, and natural beauty.',
    layout: 'md:col-span-2 xl:col-span-5 xl:row-span-2',
    imageHeight: 'h-72 xl:h-[30rem]',
    horizontal: false,
  },
  {
    icon: '/icons/approvedGreen.png',
    image: '/images/content/random/4.webp',
    label: 'Easy Booking',
    title: 'Confidence & Trust',
    desc: 'Every tour is planned with care, clear communication, and reliable guidance so guests feel comfortable from booking to drop-off.',
    layout: 'xl:col-span-7',
    imageHeight: 'h-64 xl:h-full',
    horizontal: true,
  },
  {
    icon: '/icons/professional.png',
    image: '/images/content/random/7.webp',
    label: 'Guided Safely',
    title: 'Security & Professionalism',
    desc: 'We focus on safe routes, professional conduct, and consistent service so every trip feels smooth, organised, and memorable.',
    layout: 'xl:col-span-7',
    imageHeight: 'h-64 xl:h-full',
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
        '.promo-banner',
        {
          y: 55,
          scale: 0.97,
          autoAlpha: 0,
        },
        {
          y: 0,
          scale: 1,
          autoAlpha: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: '.promo-banner',
            start: 'top 85%',
            end: 'top 50%',
            scrub: 0.8,
            invalidateOnRefresh: true,
          },
        },
      )

      gsap.fromTo(
        diffCards,
        {
          y: 55,
          scale: 0.94,
          rotate: (index) => (index % 2 === 0 ? -1.5 : 1.5),
          autoAlpha: 0,
        },
        {
          y: 0,
          scale: 1,
          rotate: 0,
          autoAlpha: 1,
          stagger: 0.12,
          ease: 'none',
          scrollTrigger: {
            trigger: '.diff-grid',
            start: 'top 85%',
            end: 'top 42%',
            scrub: 0.8,
            invalidateOnRefresh: true,
          },
        },
      )

      gsap.fromTo(
        trustCardEls,
        {
          y: 90,
          x: (index) => (index === 0 ? -40 : index === 1 ? 40 : 20),
          scale: 0.92,
          rotate: (index) => (index === 0 ? -2 : index === 1 ? 2 : -1),
          autoAlpha: 0,
        },
        {
          y: 0,
          x: 0,
          scale: 1,
          rotate: 0,
          autoAlpha: 1,
          stagger: 0.14,
          ease: 'none',
          scrollTrigger: {
            trigger: '.trust-section',
            start: 'top 82%',
            end: 'top 28%',
            scrub: 0.9,
            invalidateOnRefresh: true,
          },
        },
      )

      gsap.fromTo(
        trustIcons,
        {
          y: 20,
          scale: 0.55,
          rotate: -10,
          autoAlpha: 0,
        },
        {
          y: 0,
          scale: 1,
          rotate: 0,
          autoAlpha: 1,
          stagger: 0.08,
          ease: 'none',
          scrollTrigger: {
            trigger: '.trust-section',
            start: 'top 70%',
            end: 'top 35%',
            scrub: 0.8,
            invalidateOnRefresh: true,
          },
        },
      )

      gsap.fromTo(
        trustCopyItems,
        {
          y: 18,
          autoAlpha: 0,
        },
        {
          y: 0,
          autoAlpha: 1,
          stagger: 0.025,
          ease: 'none',
          scrollTrigger: {
            trigger: '.trust-section',
            start: 'top 68%',
            end: 'top 22%',
            scrub: 0.8,
            invalidateOnRefresh: true,
          },
        },
      )

      parallaxImgs.forEach((img) => {
        const frame = img.closest('.parallax-frame')
        const isSoft = img.classList.contains('soft-parallax')

        gsap.fromTo(
          img,
          {
            yPercent: isSoft ? -4 : -8,
            scale: isSoft ? 1.03 : 1.08,
          },
          {
            yPercent: isSoft ? 4 : 8,
            scale: isSoft ? 1.01 : 1.03,
            ease: 'none',
            scrollTrigger: {
              trigger: frame || img,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
              invalidateOnRefresh: true,
            },
          },
        )
      })

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
    <section ref={pageRef} className="relative z-20 w-full py-12">
      <div className="mx-auto flex w-full flex-col gap-8">
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

        <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 sm:px-6 lg:px-8">
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

          <div className="promo-banner relative z-10 flex flex-col items-stretch gap-4 overflow-hidden rounded-2xl border border-blue-100 bg-blue-50 p-4 shadow-sm md:flex-row">
            <div className="parallax-frame h-56 overflow-hidden rounded-xl md:h-auto md:w-1/4 md:shrink-0">
              <img
                src="/images/content/random/1.webp"
                className="parallax-img soft-parallax h-[108%] w-full object-cover object-center will-change-transform"
                alt=""
              />
            </div>

            <div className="flex flex-col justify-center gap-3 px-2 font-bitter text-gray-800 md:w-1/2">
              <p className="text-2xl font-bold leading-none sm:text-3xl">
                Cape Frontier is the adventure tour central capital.
              </p>

              <p className="text-sm leading-snug text-gray-500 sm:text-base">
                Discover the best adventures that await you. See our tours that will inspire you to
                explore beyond the ordinary.
              </p>
            </div>

            <div className="flex items-center justify-start md:w-1/4 md:justify-center">
              <button className="hero-gradient-bl flex items-center gap-2 rounded-xl px-8 py-3 text-sm font-semibold text-white transition-all hover:scale-[1.02]">
                Learn More
                <img
                  src="/icons/topRightArrow.png"
                  className="h-3.5 brightness-0 invert"
                  alt=""
                />
              </button>
            </div>
          </div>

          <div className="diff-grid relative z-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {differenceCards.map((item) => (
              <div
                key={item.title}
                className="diff-card flex flex-col items-start gap-3 rounded-2xl bg-white px-6 py-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex items-center justify-center">
                  <img src={item.icon} className="h-20 w-fit object-contain" alt="" />
                </div>

                <p className="font-frank text-lg font-bold leading-none text-black">
                  {item.title}
                </p>

                <p className="font-frank text-sm leading-snug text-black/50">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="trust-section relative z-10 overflow-hidden rounded-b-4xl bg-blue-200 p-4 shadow-2xl sm:p-6 lg:p-8">
            <div className="mb-6 rounded-3xl bg-white/70 px-5 py-6 font-frank shadow-sm ring-1 ring-white/70 backdrop-blur">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-green-600">
                Why guests feel confident
              </p>

              <p className="mt-2 max-w-2xl text-2xl font-black leading-none text-black/85 sm:text-3xl">
                Local knowledge, reliable planning, and simple communication before every trip.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-12">
              {trustCards.map((item) => (
                <article
                  key={item.title}
                  className={`trust-card group overflow-hidden rounded-[2rem] bg-white/90 shadow-sm ring-1 ring-white/70 will-change-transform ${item.layout}`}
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
                        className="parallax-img h-[112%] w-full object-cover will-change-transform"
                        alt=""
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />

                      <div className="absolute left-4 top-4 rounded-full bg-white/90 px-4 py-1.5 font-bitter text-xs font-bold text-black shadow-sm backdrop-blur">
                        {item.label}
                      </div>
                    </div>

                    <div className="trust-copy relative flex flex-col justify-between gap-5 p-5 sm:p-6">
                      <div className="trust-icon-wrap -mt-12 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-200 shadow-sm ring-4 ring-white xl:mt-0">
                        <img src={item.icon} className="h-10 w-10 object-contain" alt="" />
                      </div>

                      <div className="flex flex-col gap-3">
                        <p className="font-frank text-3xl font-black leading-none text-black/85">
                          {item.title}
                        </p>

                        <p className="font-frank text-sm leading-relaxed text-gray-500">
                          {item.desc}
                        </p>
                      </div>

                      <div className="flex items-center justify-between border-t border-black/5 pt-4">
                        <p className="font-bitter text-xs font-bold uppercase tracking-[0.16em] text-black/40">
                          Cape Frontier
                        </p>

                        <span className="h-2 w-2 rounded-full bg-green-400" />
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-6 flex justify-center">
              <button className="flex items-center justify-center gap-4 rounded-xl bg-blue-400 px-8 py-4 font-bold text-white transition-all hover:scale-[1.02] hover:bg-blue-500">
                Learn More
                <img src="/icons/go.png" className="h-4 w-4 object-contain" alt="" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}



export default WhatMakesUsDifferent