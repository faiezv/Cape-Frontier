import React, { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import TourSelect from '../Tours/TourSelect.jsx'
import SuggestedTours from './SuggestedTours.jsx'

gsap.registerPlugin(ScrollTrigger)

// -----------------------------------------------------------------------------
// small local display components
// badge now matches the larger review-step badge feel and keeps the journey block coupled
// -----------------------------------------------------------------------------
const NumberBadge = React.forwardRef(function NumberBadge({ children }, ref) {
  return (
    <div
      ref={ref}
      className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-[24px] bg-[linear-gradient(135deg,rgba(148,197,255,0.92)_0%,rgba(152,255,213,0.92)_100%)] text-white shadow-[0_12px_30px_rgba(0,0,0,0.12)] sm:h-24 sm:w-24 sm:rounded-[28px] md:h-28 md:w-28"
      aria-hidden="true"
    >
      <span className="badge-glow absolute inset-[-40%] bg-[conic-gradient(from_90deg,rgba(187,247,208,0.8),rgba(96,165,250,0.72),rgba(15,10,113,0.62),rgba(187,247,208,0.8))] opacity-40" />
      <span className="badge-color-wash absolute inset-0 bg-[linear-gradient(135deg,rgba(187,247,208,0.42),rgba(96,165,250,0.38),rgba(15,10,113,0.18))] opacity-0 mix-blend-screen" />
      <span className="badge-shine absolute inset-y-0 left-[-65%] w-[46%] skew-x-[-22deg] bg-white/28" />

      <span className="relative z-10 font-frank text-5xl font-black leading-none text-white sm:text-6xl">
        {children}
      </span>
    </div>
  )
})

const ArrowDownIcon = ({ open }) => (
  <svg
    className={`h-4 w-4 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    aria-hidden="true"
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
)

// -----------------------------------------------------------------------------
// start card
// -----------------------------------------------------------------------------
const StartJourneyCard = ({ isOpen, onToggle, badgeRef }) => (
  <div
    className={`relative z-30 overflow-hidden rounded-[24px] border border-black/8 bg-white/85 shadow-[0_18px_45px_rgba(15,10,113,0.08)] backdrop-blur-sm transition-[border-radius,box-shadow] duration-300 sm:rounded-[28px] ${
      isOpen ? 'rounded-b-[18px] shadow-[0_14px_30px_rgba(15,10,113,0.06)]' : ''
    }`}
  >
    <div className="relative flex flex-col gap-5 p-5 transition-colors sm:p-6 md:flex-row md:items-center md:gap-8 lg:p-8">
      <div className="hidden shrink-0 sm:block">
        <NumberBadge ref={badgeRef}>1</NumberBadge>
      </div>

      <div className="min-w-0 flex-1 text-black">
        <div className="flex items-start gap-4 sm:block">
          <div className="shrink-0 sm:hidden">
            <NumberBadge>1</NumberBadge>
          </div>

          <div className="min-w-0">
            <p
              className="font-bitter text-xs font-black uppercase tracking-[0.24em] sm:text-sm"
              style={{ color: 'var(--color-brand-lightblue)' }}
            >
              Booking step
            </p>

            <h2
              id="journey-tours-title"
              className="mt-2 font-frank text-4xl font-light leading-[0.95] sm:text-5xl lg:text-6xl"
              style={{ color: 'var(--color-brand-darkblue)' }}
            >
              Start your journey.
            </h2>
          </div>
        </div>

        <p className="mt-3 max-w-2xl font-mont text-sm leading-7 text-black/60 sm:text-base md:text-lg">
          <span className="font-bold text-black">Book your tour</span> with your preferred route,
          date, and group details, then get ready for a Cape Town experience built to feel seamless
          from start to finish.
        </p>
      </div>

      {isOpen && (
        <div className="flex shrink-0 items-center self-center md:self-center">
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={isOpen}
            aria-controls="journey-tour-select"
            className="group flex w-full items-center justify-center gap-3 rounded-full border border-black/10 bg-white px-4 py-2.5 font-bitter text-xs font-black uppercase tracking-[0.18em] text-black/70 shadow-[0_12px_28px_rgba(0,0,0,0.08)] transition duration-300 hover:-translate-y-0.5 hover:border-blue-400/40 hover:text-blue-700 sm:w-auto"
          >
            <span>Close form</span>

            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-green-200 text-black transition-transform duration-300 group-hover:translate-y-0.5">
              <ArrowDownIcon open={isOpen} />
            </span>
          </button>
        </div>
      )}
    </div>
  </div>
)

// -----------------------------------------------------------------------------
// floating teaser pill
// sits on the seam between the top card and the form
// when clicked it expands outward, then the form fades/slides in
// -----------------------------------------------------------------------------
const FloatingFormPill = React.forwardRef(function FloatingFormPill({ onOpen }, ref) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-40 flex translate-y-1/2 justify-center">
      <button
        ref={ref}
        type="button"
        onClick={onOpen}
        className="pointer-events-auto rounded-full border border-black/10 bg-white px-4 py-2 font-bitter text-[11px] font-black text-black/65 shadow-[0_14px_32px_rgba(0,0,0,0.10)] backdrop-blur-sm transition-colors hover:text-blue-700"
      >
        <span className="inline-flex items-center gap-2">
          <span>Open tour form</span>
          <span className="rounded-full bg-green-200 px-2 py-0.5 font-bitter text-[9px] font-black uppercase tracking-[0.14em] text-black/70">
            quick
          </span>
        </span>
      </button>
    </div>
  )
})

// -----------------------------------------------------------------------------
// collapsible tour select dropdown
// -----------------------------------------------------------------------------
const TourSelectPanel = React.forwardRef(function TourSelectPanel(props, ref) {
  return (
    <div
      id="journey-tour-select"
      ref={ref}
      className="relative z-20 mx-auto w-full max-w-5xl overflow-hidden"
    >
      <div className="rounded-b-[24px] border border-t-0 border-black/8 bg-white/95 px-2 pb-4 pt-4 shadow-[0_24px_60px_rgba(15,10,113,0.10)] backdrop-blur-sm sm:rounded-b-[28px] sm:px-4 sm:pt-5">
        <TourSelect />
      </div>
    </div>
  )
})

// -----------------------------------------------------------------------------
// main coupled block
// -----------------------------------------------------------------------------
function JourneyToursBlock() {
  const shellRef = useRef(null)
  const teaserRef = useRef(null)
  const panelRef = useRef(null)
  const badgeRef = useRef(null)
  const openSourceRef = useRef('toggle')
  const teaserNaturalWidthRef = useRef(0)

  const [isTourSelectOpen, setIsTourSelectOpen] = useState(false)

  const measureTeaserWidth = useCallback(() => {
    const teaser = teaserRef.current
    if (!teaser) return
    teaserNaturalWidthRef.current = teaser.offsetWidth
  }, [])

  const handleToggleTourSelect = useCallback(() => {
    openSourceRef.current = 'toggle'
    setIsTourSelectOpen((current) => !current)
  }, [])

  const handleOpenTourSelect = useCallback(() => {
    openSourceRef.current = 'teaser'
    setIsTourSelectOpen(true)
  }, [])

  // ---------------------------------------------------------------------------
  // animated badge: no rotation, only soft color wash + two quick shines
  // ---------------------------------------------------------------------------
  useLayoutEffect(() => {
    const badge = badgeRef.current

    if (!badge) return undefined

    const glow = badge.querySelector('.badge-glow')
    const wash = badge.querySelector('.badge-color-wash')
    const shine = badge.querySelector('.badge-shine')
    const number = badge.querySelector('span.relative')

    const ctx = gsap.context(() => {
      gsap.set(badge, {
        transformOrigin: 'center center',
        force3D: true,
        willChange: 'transform',
      })

      gsap.set(glow, {
        transformOrigin: 'center center',
        force3D: true,
        willChange: 'opacity',
      })

      gsap.set(shine, {
        xPercent: -150,
        force3D: true,
      })

      gsap.set(wash, {
        opacity: 0,
      })

      gsap
        .timeline({
          repeat: -1,
          repeatDelay: 1.25,
          defaults: {
            ease: 'sine.inOut',
          },
        })
        .to(
          badge,
          {
            scale: 1.025,
            duration: 1.2,
            yoyo: true,
            repeat: 1,
          },
          0
        )
        .to(
          glow,
          {
            opacity: 0.72,
            duration: 0.55,
            yoyo: true,
            repeat: 1,
          },
          0
        )
        .to(
          wash,
          {
            opacity: 0.34,
            duration: 0.55,
            yoyo: true,
            repeat: 1,
          },
          0.05
        )
        .fromTo(
          shine,
          {
            xPercent: -150,
          },
          {
            xPercent: 260,
            duration: 0.62,
            ease: 'power2.inOut',
          },
          0.18
        )
        .fromTo(
          shine,
          {
            xPercent: -150,
          },
          {
            xPercent: 260,
            duration: 0.62,
            ease: 'power2.inOut',
          },
          0.9
        )
        .to(
          number,
          {
            y: -1,
            duration: 1.2,
            yoyo: true,
            repeat: 1,
          },
          0
        )
    }, badge)

    return () => ctx.revert()
  }, [])

  // ---------------------------------------------------------------------------
  // initial closed state
  // ---------------------------------------------------------------------------
  useLayoutEffect(() => {
    measureTeaserWidth()

    const teaser = teaserRef.current
    const panel = panelRef.current

    if (!teaser || !panel) return undefined

    gsap.set(teaser, {
      autoAlpha: 1,
      y: 0,
      scale: 1,
      width: 'auto',
      pointerEvents: 'auto',
    })

    gsap.set(panel, {
      height: 0,
      autoAlpha: 0,
      y: -14,
      overflow: 'hidden',
      pointerEvents: 'none',
    })

    const onResize = () => {
      measureTeaserWidth()

      if (panel.dataset.open === 'true') {
        gsap.set(panel, { height: 'auto' })
      }

      ScrollTrigger.refresh()
    }

    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
    }
  }, [measureTeaserWidth])

  // ---------------------------------------------------------------------------
  // open / close form animation
  // ---------------------------------------------------------------------------
  useLayoutEffect(() => {
    const teaser = teaserRef.current
    const panel = panelRef.current

    if (!teaser || !panel) return undefined

    gsap.killTweensOf(teaser)
    gsap.killTweensOf(panel)

    const tl = gsap.timeline({
      defaults: {
        overwrite: true,
      },
      onComplete: () => {
        ScrollTrigger.refresh()
      },
    })

    if (isTourSelectOpen) {
      const openFromTeaser = openSourceRef.current === 'teaser'

      panel.dataset.open = 'true'

      gsap.set(panel, {
        height: 'auto',
        autoAlpha: 1,
        y: 0,
        overflow: 'hidden',
        pointerEvents: 'auto',
      })

      const panelHeight = panel.offsetHeight
      const targetWidth = Math.max(panel.offsetWidth - 4, teaserNaturalWidthRef.current || teaser.offsetWidth)

      gsap.set(panel, {
        height: 0,
        autoAlpha: 0,
        y: -10,
      })

      if (openFromTeaser) {
        tl.to(
          teaser,
          {
            width: targetWidth,
            duration: 0.28,
            ease: 'power2.inOut',
          },
          0
        )
          .to(
            teaser,
            {
              autoAlpha: 0,
              scale: 0.98,
              duration: 0.14,
              ease: 'power2.out',
              onComplete: () => {
                teaser.style.pointerEvents = 'none'
              },
            },
            0.18
          )
          .to(
            panel,
            {
              height: panelHeight,
              autoAlpha: 1,
              y: 0,
              duration: 0.42,
              ease: 'power3.out',
              onComplete: () => {
                gsap.set(panel, {
                  height: 'auto',
                  overflow: 'visible',
                })
              },
            },
            0.2
          )
      } else {
        tl.to(
          teaser,
          {
            autoAlpha: 0,
            y: -6,
            scale: 0.98,
            duration: 0.16,
            ease: 'power2.out',
            onComplete: () => {
              teaser.style.pointerEvents = 'none'
            },
          },
          0
        ).to(
          panel,
          {
            height: panelHeight,
            autoAlpha: 1,
            y: 0,
            duration: 0.42,
            ease: 'power3.out',
            onComplete: () => {
              gsap.set(panel, {
                height: 'auto',
                overflow: 'visible',
              })
            },
          },
          0.08
        )
      }

      return () => tl.kill()
    }

    panel.dataset.open = 'false'

    gsap.set(panel, {
      overflow: 'hidden',
      pointerEvents: 'none',
    })

    tl.to(
      panel,
      {
        height: 0,
        autoAlpha: 0,
        y: -10,
        duration: 0.28,
        ease: 'power2.inOut',
      },
      0
    )
      .set(
        teaser,
        {
          clearProps: 'width',
          width: 'auto',
        },
        0.06
      )
      .fromTo(
        teaser,
        {
          autoAlpha: 0,
          y: -10,
          scale: 0.98,
        },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.22,
          ease: 'power2.out',
          onStart: () => {
            teaser.style.pointerEvents = 'auto'
          },
        },
        0.12
      )

    return () => tl.kill()
  }, [isTourSelectOpen])

  return (
    <section
      ref={shellRef}
      aria-labelledby="journey-tours-title"
      className="relative mx-auto h-full max-w-6xl overflow-visible pt-6 sm:pt-8 md:pt-10"
    >
      {/* shared background keeps the booking step, form, and suggested tours visually coupled */}
      <div className="pointer-events-none absolute inset-x-[-0.75rem] bottom-[-1.5rem] top-16 rounded-[2rem] bg-[linear-gradient(180deg,transparent_0%,rgba(0,30,255,0.05)_38%,rgba(15,10,113,0.08)_100%)]" />

      {/* start your journey */}
      <div className="relative">
        <StartJourneyCard
          isOpen={isTourSelectOpen}
          onToggle={handleToggleTourSelect}
          badgeRef={badgeRef}
        />

        <FloatingFormPill ref={teaserRef} onOpen={handleOpenTourSelect} />
      </div>

      {/* tour select dropdown — pulled upward so it visually attaches to the card */}
      <div className="-mt-2 sm:-mt-3">
        <TourSelectPanel ref={panelRef} />
      </div>

      {/* suggested tours remain inside the same coupled journey area */}
      <div className="relative z-10 mt-4 sm:mt-5 md:mt-6">
        <SuggestedTours />
      </div>
    </section>
  )
}

export default JourneyToursBlock