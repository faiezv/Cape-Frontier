import React, { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const promotedTour = "./images/tours/hiking/platteklip/1.webp"

const ClassicTourBanner = () => {
  const bannerRef = useRef(null)
  const imageWrapRef = useRef(null)
  const imageRef = useRef(null)
  const logoRef = useRef(null)
  const textRef = useRef(null)
  const buttonRef = useRef(null)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: bannerRef.current,
          start: 'top 88%',
          toggleActions: 'play none none reverse',
        },
      })

      tl.fromTo(
        bannerRef.current,
        {
          opacity: 0,
          y: 40,
          scale: 0.985,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.7,
          ease: 'power3.out',
        }
      )
        .fromTo(
          imageWrapRef.current,
          {
            clipPath: 'inset(0 0 100% 0 round 28px)',
          },
          {
            clipPath: 'inset(0 0 0% 0 round 28px)',
            duration: 0.8,
            ease: 'power3.out',
          },
          '-=0.45'
        )
        .fromTo(
          logoRef.current,
          {
            opacity: 0,
            y: 18,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: 'power2.out',
          },
          '-=0.35'
        )
        .fromTo(
          textRef.current,
          {
            opacity: 0,
            y: 20,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: 'power2.out',
          },
          '-=0.3'
        )
        .fromTo(
          buttonRef.current,
          {
            opacity: 0,
            y: 16,
            scale: 0.96,
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.45,
            ease: 'back.out(1.6)',
          },
          '-=0.2'
        )

      gsap.to(imageRef.current, {
        scale: 1.08,
        duration: 6,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      })
    }, bannerRef)

    return () => ctx.revert()
  }, [])

  return (
    <div className="w-full mx-auto flex flex-col gap-8">
      <div
        ref={bannerRef}
        className="group relative overflow-hidden rounded-[28px] border border-[#ece6a6] bg-[#F3F19C] shadow-[0_20px_50px_rgba(0,0,0,0.08)]"
      >
        {/* soft decorative glow */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.35),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(36,94,255,0.10),transparent_30%)]" />

        <div className="relative z-10 flex flex-col lg:flex-row">
          {/* IMAGE */}
          <div
            ref={imageWrapRef}
            className="relative h-56 overflow-hidden sm:h-64 md:h-72 lg:h-auto lg:w-[52%]"
          >
            <img
              ref={imageRef}
              src={promotedTour}
              className="h-full w-full object-cover"
              alt="Platteklip Gorge cable car view"
            />

            <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.18),transparent_38%)]" />

            <div className="absolute left-4 top-4 rounded-full border border-white/40 bg-white/20 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur-md sm:left-5 sm:top-5">
              Featured Route
            </div>
          </div>

          {/* CONTENT */}
          <div className="flex flex-col justify-between gap-6 p-5 text-black sm:p-6 lg:w-[48%] lg:p-8">
            <div className="flex justify-center lg:justify-start">
              <img
                ref={logoRef}
                src="./icons/navLogoDark.png"
                className="max-h-20 object-contain sm:max-h-24 lg:max-h-28"
                alt="Cape Frontier"
              />
            </div>

            <div
              ref={textRef}
              className="flex flex-col gap-3 text-center lg:text-left"
            >
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700/65 sm:text-sm">
                Signature Experience
              </p>

              <p className="font-bitter text-2xl font-bold leading-tight sm:text-3xl">
                Platteklip Gorge Hiking Trail via Cable Car.
              </p>

              <p className="max-w-xl text-sm leading-7 text-black/65 sm:text-base">
                A classic Cape Town route combining dramatic mountain views, fresh ocean air,
                and one of the city’s most iconic ascents.
              </p>
            </div>

            <div
              ref={buttonRef}
              className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start"
            >
              <a
                href="#"
                className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-[0_12px_30px_rgba(20,64,255,0.25)] transition duration-300 hover:-translate-y-0.5 hover:bg-blue-700"
              >
                <span>Learn more about this classic tour</span>
                <img
                  src="./icons/topRightArrow.png"
                  className="h-3.5 brightness-0 invert"
                  alt=""
                />
              </a>

              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-black/45">
                Scenic • Guided • Premium
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ClassicTourBanner