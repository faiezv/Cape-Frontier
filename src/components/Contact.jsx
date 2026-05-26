import React, { useEffect, useLayoutEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'

const CONTACT_EMAIL = 'admin@capefrontier.co.za'

const socialLinks = [
  {
    label: 'Facebook',
    icon: '/icons/facebook.png',
    href: 'https://www.facebook.com/',
    type: 'external',
  },
  {
    label: 'X',
    icon: '/icons/x.png',
    href: 'https://x.com/',
    type: 'external',
  },
  {
    label: 'Pinterest',
    icon: '/icons/pinterest.png',
    href: 'https://www.pinterest.com/',
    type: 'external',
  },
  {
    label: 'Email',
    icon: '/icons/mail.png',
    href: `mailto:${CONTACT_EMAIL}`,
    type: 'email',
  },
  {
    label: 'Share',
    icon: '/icons/share.png',
    href: typeof window !== 'undefined' ? window.location.origin : '#',
    type: 'share',
  },
]

const quickCards = [
  {
    label: 'Email',
    value: CONTACT_EMAIL,
    note: 'Booking and support',
  },
]

const Contact = () => {
  const navigate = useNavigate()

  const sectionRef = useRef(null)
  const logoRef = useRef(null)
  const contentRef = useRef(null)
  const cardsRef = useRef([])
  const socialRef = useRef([])
  const footerRef = useRef(null)
  const glowRef = useRef(null)
  const viewportFrameRef = useRef(null)
  const stableViewportRef = useRef({ width: 0, height: 0 })

  useEffect(() => {
    if (typeof window === 'undefined') return undefined

    const section = sectionRef.current

    if (!section) return undefined

    const applyStableViewportHeight = (force = false) => {
      const width = Math.round(window.innerWidth || 0)

      const visualHeight = Math.round(
        window.visualViewport?.height || window.innerHeight || 0
      )

      const previous = stableViewportRef.current

      const widthChanged = Math.abs(width - previous.width) > 24

      const heightChanged =
        Math.abs(visualHeight - previous.height) > 140

      if (force || !previous.height || widthChanged || heightChanged) {
        stableViewportRef.current = {
          width,
          height: visualHeight,
        }

        section.style.setProperty(
          '--contact-vh',
          `${visualHeight}px`
        )
      }
    }

    const scheduleUpdate = (force = false) => {
      const shouldForce = force === true

      if (viewportFrameRef.current) {
        window.cancelAnimationFrame(viewportFrameRef.current)
      }

      viewportFrameRef.current =
        window.requestAnimationFrame(() => {
          applyStableViewportHeight(shouldForce)
        })
    }

    scheduleUpdate(true)

    const handleResize = () => scheduleUpdate(false)

    const handleOrientation = () =>
      window.setTimeout(() => scheduleUpdate(true), 180)

    window.addEventListener('resize', handleResize)

    window.addEventListener(
      'orientationchange',
      handleOrientation
    )

    window.visualViewport?.addEventListener(
      'resize',
      handleResize
    )

    return () => {
      if (viewportFrameRef.current) {
        window.cancelAnimationFrame(viewportFrameRef.current)
      }

      window.removeEventListener('resize', handleResize)

      window.removeEventListener(
        'orientationchange',
        handleOrientation
      )

      window.visualViewport?.removeEventListener(
        'resize',
        handleResize
      )
    }
  }, [])

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        contentRef.current,
        {
          opacity: 0,
          y: 28,
          filter: 'blur(6px)',
        },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 0.8,
          ease: 'power3.out',
        }
      )

      gsap.fromTo(
        logoRef.current,
        {
          opacity: 0,
          scale: 0.92,
          rotate: -2,
        },
        {
          opacity: 1,
          scale: 1,
          rotate: 0,
          duration: 0.8,
          ease: 'back.out(1.4)',
        }
      )

      gsap.fromTo(
        cardsRef.current.filter(Boolean),
        {
          opacity: 0,
          y: 18,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.55,
          stagger: 0.08,
          ease: 'power2.out',
          delay: 0.15,
        }
      )

      gsap.fromTo(
        socialRef.current.filter(Boolean),
        {
          opacity: 0,
          y: 10,
          scale: 0.92,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.45,
          stagger: 0.05,
          ease: 'back.out(1.8)',
          delay: 0.35,
        }
      )

      gsap.fromTo(
        footerRef.current,
        {
          opacity: 0,
          y: 18,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.55,
          ease: 'power2.out',
          delay: 0.45,
        }
      )

      const allowIdleMotion =
        typeof window === 'undefined' ||
        !window.matchMedia('(max-width: 767px)').matches

      if (allowIdleMotion) {
        gsap.to(logoRef.current, {
          y: -10,
          duration: 3.2,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        })

        gsap.to(glowRef.current, {
          x: 26,
          y: -18,
          scale: 1.08,
          duration: 4.2,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        })
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  const scrollToTop = () => {
    if (window.lenis) {
      window.lenis.scrollTo(0, {
        duration: 1,
        force: true,
      })

      return
    }

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  const openContact = () => {
    window.location.href = `mailto:${CONTACT_EMAIL}`
  }

  const handleSocialClick = async (item, event) => {
    if (item.type === 'share') {
      event.preventDefault()

      const shareData = {
        title: 'Cape Frontier Travel & Tours',
        text: 'Explore Cape Town tours with Cape Frontier.',
        url: window.location.origin,
      }

      if (navigator.share) {
        try {
          await navigator.share(shareData)
        } catch {
          // user cancelled
        }

        return
      }

      window.open(item.href, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="relative min-h-[var(--contact-vh,100svh)] overflow-hidden bg-[#eef7f6] text-black"
    >
      <img
        src="/assets/content/clip-art/section3-bg.png"
        className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover opacity-55"
        alt=""
      />

      <img
        src="/assets/content/clip-art/contact-clip.png"
        className="pointer-events-none absolute inset-0 z-10 h-full w-full object-cover opacity-50"
        alt=""
      />

      <div className="absolute inset-0 z-20 bg-[linear-gradient(135deg,rgba(255,255,255,0.94)_0%,rgba(232,246,255,0.90)_46%,rgba(220,252,231,0.94)_100%)]" />

      <div
        ref={glowRef}
        className="pointer-events-none absolute right-[8%] top-[14%] z-20 h-44 w-44 rounded-full bg-green-200/55 blur-3xl sm:h-64 sm:w-64"
      />

      <div className="relative z-30 mx-auto flex min-h-[var(--contact-vh,100svh)] w-full max-w-7xl flex-col px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <div className="flex shrink-0 justify-end">
          <button
            type="button"
            onClick={scrollToTop}
            aria-label="Back to top"
            className="group flex h-11 w-11 items-center justify-center rounded-2xl border border-white/40 bg-white/72 shadow-[0_12px_28px_rgba(0,0,0,0.10)] backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:bg-green-200 sm:h-12 sm:w-12"
          >
            <img
              src="/icons/upArrowDark.png"
              className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 sm:h-5 sm:w-5"
              alt=""
            />
          </button>
        </div>

        <div className="grid flex-1 items-center gap-6 py-4 sm:gap-8 sm:py-6 lg:grid-cols-[0.88fr_1.12fr] lg:gap-14 lg:py-8">
          <div className="order-1 flex justify-center lg:justify-start">
            <div
              ref={logoRef}
              className="relative w-full max-w-[9.5rem] sm:max-w-[12rem] lg:max-w-[22rem]"
            >
              <img
                src="/assets/brand/logo.png"
                className="relative z-10 h-auto w-full object-contain opacity-[0.98] drop-shadow-[0_18px_40px_rgba(0,0,0,0.16)]"
                alt="Cape Frontier logo"
              />

              <div className="absolute inset-x-8 bottom-4 h-10 rounded-full bg-blue-950/10 blur-2xl" />
            </div>
          </div>

          <div
            ref={contentRef}
            className="order-2 flex flex-col gap-5 text-center lg:gap-6 lg:text-left"
          >
            <div>
              <p className="font-bitter text-[10px] font-black uppercase tracking-[0.28em] text-blue-500 sm:text-xs">
                Contact Cape Frontier
              </p>

              <h2 className="mt-2 font-frank text-[2.6rem] font-bold leading-[0.88] tracking-[-0.03em] text-[#071f4f] sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl">
                Have a question?
              </h2>

              <p className="mx-auto mt-3 max-w-xl font-bitter text-[13px] leading-6 text-neutral-600 sm:text-base sm:leading-7 lg:mx-0 lg:max-w-2xl lg:text-lg">
                Message us about tours, pickup details, private
                trips, custom routes, or booking support. We will
                help you choose the right Cape Town experience.
              </p>
            </div>

            <div className="mx-auto max-w-3xl gap-3 sm:grid-cols-3 lg">
              {quickCards.map((card, index) => (
                <div
                  key={card.label}
                  ref={(el) => {
                    cardsRef.current[index] = el
                  }}
                  className="group rounded-[1.6rem] border border-white/70 bg-white/72 p-4 text-left shadow-[0_10px_30px_rgba(7,31,79,0.06)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:bg-white/88 hover:shadow-[0_18px_40px_rgba(7,31,79,0.10)] sm:p-5"
                >
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-500">
                    {card.label}
                  </p>

                  <p className="mt-2 break-words text-sm font-bold leading-5 text-[#071f4f] sm:text-[15px]">
                    {card.value}
                  </p>

                  <p className="mt-2 text-xs leading-5 text-neutral-500">
                    {card.note}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex flex-col items-stretch sm:justify-center gap-3 pt-1 sm:flex-row sm:items-center lg:justify-start">
              <button
                type="button"
                onClick={openContact}
                className="hero-gradient-bl flex w-full items-center justify-center rounded-full px-6 py-3.5 text-sm font-bold tracking-[0.01em] text-white shadow-[0_16px_34px_rgba(7,31,79,0.20)] 
                transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_42px_rgba(7,31,79,0.28)] 
                sm:w-fit sm:px-8
                
                "
              >
                Email
              </button>

              <button
                type="button"
                onClick={() => navigate('/policies')}
                className="flex min-h-[52px] w-full items-center justify-center rounded-full border border-blue-950/10 bg-white/82 px-6 py-3.5 text-sm font-bold text-[#071f4f] shadow-[0_8px_24px_rgba(0,0,0,0.04)] backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:bg-green-200 hover:text-green-950 sm:w-fit sm:px-8"
              >
                View policies
              </button>
            </div>

            <div className="flex items-center justify-center gap-3 lg:justify-start">
              {socialLinks.map((item, index) => (
                <a
                  key={item.label}
                  ref={(el) => {
                    socialRef.current[index] = el
                  }}
                  href={item.href}
                  target={
                    item.type === 'external' ||
                    item.type === 'share'
                      ? '_blank'
                      : undefined
                  }
                  rel={
                    item.type === 'external' ||
                    item.type === 'share'
                      ? 'noreferrer'
                      : undefined
                  }
                  onClick={(event) =>
                    handleSocialClick(item, event)
                  }
                  aria-label={item.label}
                  className="group flex h-11 w-11 items-center justify-center rounded-full border border-white/70 bg-white/72 shadow-[0_8px_24px_rgba(7,31,79,0.06)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:bg-green-200 hover:shadow-[0_14px_32px_rgba(7,31,79,0.12)]"
                >
                  <img
                    src={item.icon}
                    className="h-4 w-4 object-contain opacity-70 transition duration-300 group-hover:opacity-100"
                    alt=""
                  />
                </a>
              ))}
            </div>
          </div>
        </div>

        <footer ref={footerRef} className="shrink-0 pt-2">
          <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/82 shadow-[0_20px_60px_rgba(7,31,79,0.10)] backdrop-blur-xl">
            <div className="py-4 px-4">
              

              <div className='flex flex-col items-start md:items-center'>
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-500">
                  Information
                </p>

                <div className="flex flex-col md:flex-row lg-:flex-row gap-1 sm:gap-4 text-sm mt-2">
                  <button
                    type="button"
                    onClick={() => navigate('/policies')}
                    className="text-left text-neutral-600 transition hover:text-[#071f4f]"
                  >
                    Privacy policy
                  </button>
                  <div className="text-black/30 hidden sm:visible md:visible lg:visible">|</div>
                  <button
                    type="button"
                    onClick={() => navigate('/policies')}
                    className="text-left text-neutral-600 transition hover:text-[#071f4f]"
                  >
                    Terms & conditions
                  </button>
                  <div className="text-black/30 hidden sm:visible md:visible lg:visible">|</div>
                  <button
                    type="button"
                    className="text-left text-neutral-600 transition hover:text-[#071f4f]"
                  >
                    Pickup information
                  </button>

                  <div className="text-black/30 hidden sm:visible md:visible lg:visible">|</div>
                  <button
                    type="button"
                    className="text-left text-neutral-600 transition hover:text-[#071f4f]"
                  >
                    Tour availability
                  </button>

                  <div className="text-black/30 hidden sm:visible md:visible lg:visible">|</div>
                  <button
                    type="button"
                    className="text-left text-neutral-600 transition hover:text-[#071f4f]"
                  >
                    Accessibility
                  </button>
                </div>
              </div>

              
            </div>

            <div className="border-t border-black/5 bg-[#071f4f] px-5 py-4">

            <div className="flex flex-col gap-4 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
              <div className="flex items-center justify-center gap-3 sm:justify-start">
                <img
                  src="/icons/ZAR.png"
                  alt="South African Rand"
                  className="h-9 w-9 rounded-full border border-white/10 object-cover shadow-[0_6px_18px_rgba(0,0,0,0.18)]"
                />

                <div>
                  <p className="text-sm font-semibold tracking-[0.01em] text-white">
                    © 2026 Cape Frontier Travel & Tours
                  </p>

                  <p className="mt-1 text-xs text-white/65">
                    Designed and built with {'<3'} by
                    <span className="font-semibold text-white/85">
                      F. Viljoen
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-end">
                <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold text-green-200 backdrop-blur-md">
                  premium routes
                </span>

                <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold text-green-200 backdrop-blur-md">
                  secure booking
                </span>

                <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold text-green-200 backdrop-blur-md">
                  local experiences
                </span>
              </div>
            </div>

             
            </div>
          </div>
        </footer>
      </div>
    </section>
  )
}

export default Contact