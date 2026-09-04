import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import TourSelect from './Tours/TourSelect.jsx'

import kaap from '/src/assets/images/content/hero/kaap.png'
import cobra1 from '/src/assets/images/tours/adrenaline/cobra/cobra-2hr/1.webp'
import simonsTown from '/src/assets/images/content/hero/1.webp'
import cobra2 from '/src/assets/images/tours/adrenaline/cobra/cobra-2hr/2.webp'
import landing from '/src/assets/images/content/hero/2.webp'
import image3 from '/src/assets/images/content/hero/3.webp'

gsap.registerPlugin(ScrollTrigger)

const slides = [
  { image: kaap, location: 'Bo-Kaap, Cape Town' },
  { image: cobra1, location: 'Cobra Sundowner, Cape Town' },
  { image: simonsTown, location: "Simon's Town, Cape Town" },
  { image: cobra2, location: 'Cobra Sundowner, Cape Town' },
  { image: landing, location: 'Cape Town' },
  { image: image3, location: 'Cape Town' },
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

const ArrowDown = ({ className = 'h-4 w-4' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
  >
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
  const titleShineRef = useRef(null)
  const subRef = useRef(null)
  const scrollRef = useRef(null)
  const shineRef = useRef(null)
  const arrowRef = useRef(null)
  const locationRef = useRef(null)

  const prevSlide = useRef(0)

  const isMobile = viewport.width < 640
  const isShort = viewport.height < 860
  const isVeryShort = viewport.height < 760
  const showSubtitle = !(isMobile && isVeryShort)

  const safeScroll = (id) => {
    const el = document.getElementById(id)

    if (el) {
      el.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
      return
    }

    window.scrollBy({
      top: window.innerHeight * 0.9,
      behavior: 'smooth',
    })
  }

  useEffect(() => {
    const onResize = () => setViewport(getViewport())

    onResize()

    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
    }
  }, [])

  // Pin TourSelect while the hero scrolls away
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

  // Hero animations
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      if (!bgRefs.current.length) return

      gsap.set(bgRefs.current, {
        opacity: 0,
        scale: 1.02,
      })

      gsap.set(bgRefs.current[0], {
        opacity: 0.98,
        scale: 1.02,
      })

      if (bgRefs.current[0]) {
        gsap.to(bgRefs.current[0], {
          scale: 1.08,
          duration: 7,
          ease: 'power1.out',
        })
      }

      const tl = gsap.timeline({
        defaults: {
          ease: 'power3.out',
        },
      })

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
        tl.fromTo(
          titleRef.current,
          {
            y: 10,
            opacity: 0,
            scale: 0.985,
          },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.55,
            ease: 'power2.out',
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
        gsap.set(titleRef.current, {
          y: 0,
          scale: 1,
          clearProps: 'filter',
        })
      }

      if (titleShineRef.current) {
        gsap.fromTo(
          titleShineRef.current,
          { xPercent: -220 },
          {
            xPercent: 720,
            duration: 1.15,
            repeat: -1,
            repeatDelay: 2.2,
            ease: 'power2.inOut',
          }
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
    }, heroRef)

    return () => ctx.revert()
  }, [showSubtitle])

  // Automatic hero slideshow
  useEffect(() => {
    if (slides.length <= 1) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 6500)

    return () => clearInterval(interval)
  }, [])

  // Slide transition
  useEffect(() => {
    const prev = prevSlide.current
    const next = currentSlide

    if (prev === next) return

    const prevBg = bgRefs.current[prev]
    const nextBg = bgRefs.current[next]

    if (!prevBg || !nextBg) return

    gsap.killTweensOf([prevBg, nextBg])

    gsap.set(nextBg, {
      opacity: 0,
      scale: 1.02,
    })

    gsap
      .timeline()
      .to(
        prevBg,
        {
          opacity: 0,
          duration: 1.2,
          ease: 'power2.inOut',
        },
        0
      )
      .to(
        nextBg,
        {
          opacity: 1,
          duration: 1.2,
          ease: 'power2.inOut',
        },
        0
      )
      .to(
        nextBg,
        {
          scale: 1.08,
          duration: 6.5,
          ease: 'power1.out',
        },
        0
      )

    if (locationRef.current) {
      gsap.fromTo(
        locationRef.current,
        {
          y: 10,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.45,
          ease: 'power2.out',
        }
      )
    }

    prevSlide.current = next
  }, [currentSlide])

  return (
    <section
      ref={heroRef}
      className="
        relative
        h-[100svh]
        min-h-[100svh]
        w-full
        max-w-full
        overflow-x-hidden
        overflow-y-clip
        font-frank
        text-white
      "
      style={{
        aspectRatio: '16 / 9',
      }}
    >
      {/* Background slides */}
      {slides.map((slide, index) => (
        <div
          key={`${slide.location}-${index}`}
          ref={(el) => {
            bgRefs.current[index] = el
          }}
          className="absolute inset-0 will-change-transform"
          style={{
            backgroundImage: `url(${slide.image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      ))}

      {/* Background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.14),transparent_36%)]" />

      <div className="relative z-20 flex h-full flex-col">
        <div
          ref={contentRef}
          className="
            flex
            flex-1
            flex-col
            items-center
            px-4
            pb-24
            pt-24
            sm:px-6
            sm:pb-12
            sm:pt-12
            md:px-8
            md:pb-24
            md:pt-28
            lg:px-10
            lg:pt-32
          "
        >
          {/* Tour Select is rendered inside Home.
              This placeholder remains for the desktop pinning logic. */}
          <div
            ref={tourSelectRef}
            className="w-full max-w-5xl"
          />

          {/* Main hero content can be placed here */}

        </div>

        {/* Bottom scroll CTA */}
        <button
          ref={scrollRef}
          onClick={() => safeScroll('featured-tours')}
          className="
            absolute
            bottom-0
            left-0
            z-30
            flex
            w-full
            max-w-full
            items-center
            justify-center
            overflow-hidden
            border-t
            border-white/10
            bg-[linear-gradient(90deg,#002dcb_0%,#0938ef_50%,#002dcb_100%)]
            px-4
            py-3
            text-sm
            font-medium
            text-white/95
            shadow-[0_-8px_30px_rgba(0,0,0,0.16)]
            backdrop-blur-md
            sm:py-4
            sm:text-base
            md:text-lg
          "
        >
          <div
            ref={shineRef}
            className="
              pointer-events-none
              absolute
              inset-y-0
              left-[-30%]
              w-[26%]
              skew-x-[-24deg]
              bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.24),transparent)]
            "
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
        </button>
      </div>
    </section>
  )
}

export default Hero