import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import TourSelect from './Tours/TourSelect.jsx'

gsap.registerPlugin(ScrollTrigger)

const slides = [
  { image: './images/content/random/kaap.png', location: 'Bo-Kaap, Cape Town' },
  { image: './images/content/random/1.webp', location: 'Bo-Kaap, Cape Town' },
  { image: './images/content/random/2.webp', location: 'Camps Bay' },
  { image: './images/content/random/3.webp', location: 'Cape Point' },
  { image: './images/content/random/4.webp', location: 'Cape Winelands' },
  { image: './images/content/random/5.webp', location: 'Bo-Kaap, Cape Town' },
]

const trustItems = [
  { title: 'Trusted Local Guides', subtitle: 'Licensed & experienced', type: 'shield' },
  { title: 'Top Rated Experiences', subtitle: 'Loved by travellers', type: 'star' },
  { title: '24/7 Support', subtitle: 'We’re here for you', type: 'support' },
  { title: 'Secure Booking', subtitle: 'Safe & flexible payments', type: 'lock' },
]

const quickActions = [
  { label: 'Explore', target: 'featured-tours' },
  { label: 'Experience', target: 'stories' },
  { label: 'Discover', target: 'destinations' },
]

const getViewport = () => ({
  width: typeof window !== 'undefined' ? window.innerWidth : 1440,
  height: typeof window !== 'undefined' ? window.innerHeight : 900,
})

const Icon = ({ type }) => {
  const cls = 'h-[18px] w-[18px] sm:h-5 sm:w-5'

  if (type === 'shield') {
    return (
      <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 3l7 3v6c0 4.7-3.1 8-7 9.5C8.1 20 5 16.7 5 12V6l7-3Z" />
      </svg>
    )
  }

  if (type === 'star') {
    return (
      <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="m12 3.8 2.5 5.2 5.8.8-4.2 4 .9 5.7L12 16.8 7 19.5l1-5.7-4.2-4 5.7-.8L12 3.8Z" />
      </svg>
    )
  }

  if (type === 'support') {
    return (
      <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 13a8 8 0 1 1 16 0" />
        <rect x="3" y="12" width="4" height="7" rx="2" />
        <rect x="17" y="12" width="4" height="7" rx="2" />
        <path d="M19 19a3 3 0 0 1-3 3h-2" />
      </svg>
    )
  }

  return (
    <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 1 1 8 0v3" />
    </svg>
  )
}

const ArrowDown = ({ className = 'h-4 w-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
    <path d="m6 9 6 6 6-6" />
  </svg>
)

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [viewport, setViewport] = useState(getViewport)

  const contentRef = useRef(null)
  const heroRef = useRef(null)
  const bgRefs = useRef([])
  const tourSelectRef = useRef(null)
  const actionsRefs = useRef([])
  const titleRef = useRef(null)
  const subRef = useRef(null)
  const trustRefs = useRef([])
  const trustTrackRef = useRef(null)
  const trustSetRef = useRef(null)
  const scrollRef = useRef(null)
  const shineRef = useRef(null)
  const arrowRef = useRef(null)
  const locationRef = useRef(null)

  const prevSlide = useRef(0)

  const isMobile = viewport.width < 640
  const isShort = viewport.height < 860
  const isVeryShort = viewport.height < 760
  const showSubtitle = !(isMobile && isVeryShort)

  const visibleTrustItems = useMemo(() => {
    if (!isMobile) return trustItems
    if (isVeryShort) return trustItems.slice(0, 2)
    if (isShort) return trustItems.slice(0, 3)
    return trustItems
  }, [isMobile, isShort, isVeryShort])

  const safeScroll = (id) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }
    window.scrollBy({ top: window.innerHeight * 0.9, behavior: 'smooth' })
  }

  useEffect(() => {
    const onResize = () => setViewport(getViewport())
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      if (!bgRefs.current.length) return

      gsap.set(bgRefs.current, { opacity: 0, scale: 1.02 })
      gsap.set(bgRefs.current[0], { opacity: 1, scale: 1.02 })

      if (bgRefs.current[0]) {
        gsap.to(bgRefs.current[0], {
          scale: 1.08,
          duration: 7,
          ease: 'power1.out',
        })
      }

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

      if (tourSelectRef.current) {
        tl.from(tourSelectRef.current, {
          y: -10,
          opacity: 0,
          duration: 0.75,
        })
      }

      if (actionsRefs.current.length) {
        tl.from(
          actionsRefs.current,
          {
            y: 16,
            opacity: 0,
            stagger: 0.08,
            duration: 0.45,
          },
          '-=0.25'
        )
      }

      if (titleRef.current) {
        tl.from(
          titleRef.current,
          {
            y: 12,
            opacity: 0,
            scale: 0.97,
            duration: 0.75,
          },
          '-=0.2'
        )
      }

      if (subRef.current) {
        tl.from(
          subRef.current,
          {
            y: 12,
            opacity: 0,
            duration: 0.45,
          },
          '-=0.35'
        )
      }

      if (trustRefs.current.length) {
        tl.from(
          trustRefs.current,
          {
            y: 60,
            opacity: 0,
            stagger: 0.2,
            duration: 0.5,
            ease: 'power3.out',
          },
          '-=0.2'
        )
      }

      if (scrollRef.current) {
        tl.from(
          scrollRef.current,
          {
            y: 60,
            opacity: 0,
            duration: 0.55,
          },
          '-=0.15'
        )
      }

      if (titleRef.current) {
        gsap.to(titleRef.current, {
          y: -2,
          duration: 4.2,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        })
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

      if (trustTrackRef.current && trustSetRef.current) {
        const setWidth = trustSetRef.current.offsetWidth

        gsap.set(trustTrackRef.current, { x: 0 })

        gsap.to(trustTrackRef.current, {
          x: -setWidth,
          duration: 18,
          ease: 'none',
          repeat: -1,
          delay: 1.6,
          modifiers: {
            x: (value) => {
              const x = parseFloat(value)
              return `${((x % -setWidth) + -setWidth) % -setWidth}px`
            },
          },
        })
      }

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
            // markers: true,
          },
        })
      }
    }, heroRef)

    return () => ctx.revert()
  }, [showSubtitle, visibleTrustItems.length])

  useEffect(() => {
    if (slides.length <= 1) return
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 6500)
    return () => clearInterval(interval)
  }, [])

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

    if (locationRef.current) {
      gsap.fromTo(
        locationRef.current,
        { y: 10, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.45, ease: 'power2.out' }
      )
    }

    prevSlide.current = next
  }, [currentSlide])

  return (
    <section
      ref={heroRef}
      className="relative h-[100svh] min-h-[100svh] w-full max-w-full overflow-x-hidden overflow-y-clip text-white font-frank"
    >
      {slides.map((slide, index) => (
        <div
          key={`${slide.location}-${index}`}
          ref={(el) => {
            bgRefs.current[index] = el
          }}
          className="absolute inset-0 will-change-transform "
          style={{
            backgroundImage: `url(${slide.image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      ))}

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.14),transparent_36%)]" />

      <div  className="relative z-20 flex h-full flex-col">
        <div ref={contentRef}
          className={`flex flex-1 flex-col items-center px-4 ${
            isVeryShort ? 'pt-18 pb-20' : isShort ? 'pt-20 pb-22' : 'pt-24 pb-24'
          } sm:px-6 sm:pt-12 sm:pb-12 md:px-8 md:pt-28 md:pb-24 lg:px-10 lg:pt-32`}
        >


          <div className={`${isVeryShort ? 'mt-4' : 'mt-5'} flex w-full flex-col items-center sm:mt-6`}>
            <div
              ref={titleRef}
              className="w-full max-w-fit rounded-[28px] border border-white/16 
              shadow-[0_20px_60px_rgba(0,0,0,0.22)] backdrop-blur-md 
              hero-gradient-bl
              sm:rounded-4xl 
              sm:px-8 sm:py-2 md:px-12 md:py-6 lg:px-14 px-5 py-4"
            >
              <div className="text-center font-lobster text-[2rem] font-extrabold leading-none text-white drop-shadow-[0_6px_18px_rgba(0,0,0,0.28)] sm:text-5xl md:text-6xl lg:text-7xl">
                Travel &amp; Tours
              </div>
            </div>

            {/* {showSubtitle && (
              <p
                ref={subRef}
                className={`${
                  isVeryShort ? 'mt-3 max-w-xl text-xs leading-relaxed' : 'mt-4 max-w-3xl text-sm leading-relaxed'
                } px-3 text-center font-medium text-white/92 drop-shadow-[0_3px_10px_rgba(0,0,0,0.22)] sm:mt-4 sm:text-base md:text-lg lg:text-xl`}
              >
                Handpicked Cape Town experiences, unforgettable routes, and trusted local guides
                for your next journey.
              </p>
            )} */}
          </div>


          <div ref={tourSelectRef} className="w-full max-w-5xl">
            <TourSelect />
          </div>

          {/* <div className={`${isVeryShort ? 'mt-3' : 'mt-4'} flex max-w-full flex-wrap items-center justify-center gap-2 sm:mt-4 sm:gap-2.5`}>
            {quickActions.map((item, index) => (
              <button
                key={item.label}
                ref={(el) => {
                  actionsRefs.current[index] = el
                }}
                onClick={() => safeScroll(item.target)}
                className="group rounded-full border border-white/18 bg-white/8 px-3.5 py-2 text-xs font-semibold text-white/90 backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-white/28 hover:bg-white/14 sm:px-4 sm:text-sm"
              >
                <span className="inline-flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-white/70 transition group-hover:bg-white" />
                  {item.label}
                </span>
              </button>
            ))}
          </div> */}
          <div className={`${isVeryShort ? 'mt-4' : 'mt-6'} z-10 w-full max-w-5xl overflow-hidden sm:mt-7`}>
            <div className="relative w-full overflow-hidden">
              <div ref={trustTrackRef} className="flex w-max flex-nowrap gap-3">
                <div ref={trustSetRef} className="flex flex-nowrap gap-3">
                  {trustItems.map((item, index) => (
                    <div
                      key={`${item.title}-a`}
                      ref={(el) => {
                        trustRefs.current[index] = el
                      }}
                      className="group min-w-[250px] shrink-0 rounded-2xl border border-white/14 bg-white/10 px-4 py-3 text-white backdrop-blur-md"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/14 bg-white/10 text-white/95 sm:h-11 sm:w-11">
                          <Icon type={item.type} />
                        </div>

                        <div className="min-w-0 leading-tight">
                          <div className="text-sm font-semibold sm:text-[15px]">{item.title}</div>
                          <div className="mt-1 text-xs text-white/72 sm:text-sm">{item.subtitle}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-nowrap gap-3">
                  {trustItems.map((item) => (
                    <div
                      key={`${item.title}-b`}
                      className="group min-w-[250px] shrink-0 rounded-2xl border border-white/14 bg-white/10 px-4 py-3 text-white backdrop-blur-md"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/14 bg-white/10 text-white/95 sm:h-11 sm:w-11">
                          <Icon type={item.type} />
                        </div>

                        <div className="min-w-0 leading-tight">
                          <div className="text-sm font-semibold sm:text-[15px]">{item.title}</div>
                          <div className="mt-1 text-xs text-white/72 sm:text-sm">{item.subtitle}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-black/35 to-transparent" />
              <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-black/35 to-transparent" />
            </div>
          </div>
        </div>

        <button
          ref={scrollRef}
          onClick={() => safeScroll('featured-tours')}
          className="absolute bottom-9 md:bottom-0 left-0 z-30 flex w-full max-w-full items-center justify-center overflow-hidden border-t border-white/10 bg-[linear-gradient(90deg,#002dcb_0%,#0938ef_50%,#002dcb_100%)] px-4 py-3 text-sm font-medium text-white/95 shadow-[0_-8px_30px_rgba(0,0,0,0.16)] backdrop-blur-md sm:py-4 sm:text-base md:text-lg"
        >
          <div
            ref={shineRef}
            className="pointer-events-none absolute inset-y-0 left-[-30%] w-[26%] skew-x-[-24deg] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.24),transparent)]"
          />
          <div className="relative z-10 flex items-center gap-3 leading-none">
            <span>Scroll to see more</span>
            <span ref={arrowRef}>
              <ArrowDown className="h-4 w-4" />
            </span>
          </div>
        </button>
      </div>
    </section>
  )
}

export default Hero