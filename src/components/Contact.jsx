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

const footerLinks = [
  {
    label: 'Contact',
    href: `mailto:${CONTACT_EMAIL}`,
    type: 'email',
  },
  {
    label: 'Privacy',
    href: '/policies',
    type: 'internal',
  },
  {
    label: 'Terms',
    href: '/policies',
    type: 'internal',
  },
  {
    label: 'Accessibility',
    href: '/policies',
    type: 'internal',
  },
]

const quickCards = [
  {
    label: 'Email',
    value: CONTACT_EMAIL,
    note: 'Booking and support',
  },
  {
    label: 'Pickup',
    value: 'Accommodation-based',
    note: 'Confirmed after payment',
  },
  {
    label: 'Response',
    value: 'Manual confirmation',
    note: 'Final trip details checked',
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
      const heightChanged = Math.abs(visualHeight - previous.height) > 140

      if (force || !previous.height || widthChanged || heightChanged) {
        stableViewportRef.current = {
          width,
          height: visualHeight,
        }

        section.style.setProperty('--contact-vh', `${visualHeight}px`)
      }
    }

    const scheduleUpdate = (force = false) => {
      const shouldForce = force === true

      if (viewportFrameRef.current) {
        window.cancelAnimationFrame(viewportFrameRef.current)
      }

      viewportFrameRef.current = window.requestAnimationFrame(() => {
        applyStableViewportHeight(shouldForce)
      })
    }

    scheduleUpdate(true)

    const handleResize = () => scheduleUpdate(false)
    const handleOrientation = () => window.setTimeout(() => scheduleUpdate(true), 180)

    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleOrientation)
    window.visualViewport?.addEventListener('resize', handleResize)

    return () => {
      if (viewportFrameRef.current) {
        window.cancelAnimationFrame(viewportFrameRef.current)
      }

      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleOrientation)
      window.visualViewport?.removeEventListener('resize', handleResize)
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
          // user cancelled share
        }

        return
      }

      window.open(item.href, '_blank', 'noopener,noreferrer')
    }
  }

  const handleFooterLink = (link) => {
    if (link.type === 'email') {
      window.location.href = link.href
      return
    }

    if (link.type === 'internal') {
      navigate(link.href)
      return
    }

    window.open(link.href, '_blank', 'noopener,noreferrer')
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
        className="pointer-events-none absolute inset-0 z-10 h-full w-full object-cover opacity-55"
        alt=""
      />

      <div className="absolute inset-0 z-20 bg-[linear-gradient(135deg,rgba(255,255,255,0.92)_0%,rgba(232,246,255,0.88)_46%,rgba(220,252,231,0.92)_100%)]" />

      <div
        ref={glowRef}
        className="pointer-events-none absolute right-[8%] top-[16%] z-20 h-44 w-44 rounded-full bg-green-200/55 blur-3xl sm:h-64 sm:w-64"
      />

      <div className="relative z-30 mx-auto flex min-h-[var(--contact-vh,100svh)] w-full max-w-7xl flex-col px-4 py-3 sm:px-6 sm:py-5 lg:px-8">
        <div className="flex shrink-0 justify-end">
          <button
            type="button"
            onClick={scrollToTop}
            aria-label="Back to top"
            className="group flex h-10 w-10 items-center justify-center rounded-2xl border border-white/40 bg-white/72 shadow-[0_12px_28px_rgba(0,0,0,0.10)] backdrop-blur-md transition hover:-translate-y-1 hover:bg-green-200 sm:h-12 sm:w-12"
          >
            <img
              src="/icons/upArrow.png"
              className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 sm:h-5 sm:w-5"
              alt=""
            />
          </button>
        </div>

        <div className="grid flex-1 items-start gap-3 py-2 sm:gap-5 sm:py-3 lg:grid-cols-[0.78fr_1.22fr] lg:items-center lg:gap-10 lg:py-5">
          <div className="order-2 hidden lg:order-1 lg:block">
            <div
              ref={logoRef}
              className="relative mx-auto max-w-[15rem] lg:mx-0 lg:max-w-[21rem]"
            >
              <img
                src="/assets/brand/logo.png"
                className="relative z-10 h-auto w-full object-contain drop-shadow-[0_18px_40px_rgba(0,0,0,0.13)]"
                alt="Cape Frontier logo"
              />

              <div className="absolute inset-x-8 bottom-4 h-10 rounded-full bg-blue-950/10 blur-2xl" />
            </div>
          </div>

          <div
            ref={contentRef}
            className="order-1 flex flex-col gap-3 text-center sm:gap-4 lg:order-2 lg:text-left"
          >
            <div>
              <p className="font-bitter text-[10px] font-black uppercase tracking-[0.28em] text-blue-500 sm:text-xs">
                Contact Cape Frontier
              </p>

              <h2 className="mt-2 font-frank text-[2.35rem] font-bold leading-[0.9] text-[#071f4f] sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl">
                Have a question?
              </h2>

              <p className="mx-auto mt-2 max-w-2xl font-bitter text-xs leading-5 text-neutral-600 sm:mt-3 sm:text-base sm:leading-6 lg:mx-0 lg:text-lg">
                Message us about tours, pickup details, private trips, custom
                routes, or booking support. We will help you choose the right
                Cape Town experience.
              </p>
            </div>

            <div className="mx-auto grid w-full max-w-2xl gap-2 sm:grid-cols-3 lg:mx-0">
              {quickCards.map((card, index) => (
                <div
                  key={card.label}
                  ref={(el) => {
                    cardsRef.current[index] = el
                  }}
                  className="rounded-2xl border border-white/70 bg-white/78 p-2.5 text-left shadow-[0_10px_26px_rgba(7,31,79,0.06)] backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-white sm:p-4"
                >
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-400">
                    {card.label}
                  </p>

                  <p className="mt-1 break-words text-xs font-bold text-[#071f4f] sm:text-sm">
                    {card.value}
                  </p>

                  <p className="mt-1 hidden text-xs leading-5 text-neutral-500 sm:block">
                    {card.note}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
              <button
                type="button"
                onClick={openContact}
                className="hero-gradient-bl flex w-full items-center justify-center rounded-full px-6 py-3 text-sm font-bold text-white shadow-[0_14px_32px_rgba(7,31,79,0.18)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_38px_rgba(7,31,79,0.24)] sm:w-fit sm:px-7 sm:py-3.5"
              >
                Email {CONTACT_EMAIL}
              </button>

              <button
                type="button"
                onClick={() => navigate('/policies')}
                className="flex w-full items-center justify-center rounded-full border border-blue-950/10 bg-white/82 px-6 py-3 text-sm font-bold text-[#071f4f] shadow-sm backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-green-200 hover:text-green-950 sm:w-fit sm:px-7 sm:py-3.5"
              >
                View policies
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 lg:justify-start">
              {socialLinks.map((item, index) => (
                <a
                  key={item.label}
                  ref={(el) => {
                    socialRef.current[index] = el
                  }}
                  href={item.href}
                  target={item.type === 'external' || item.type === 'share' ? '_blank' : undefined}
                  rel={item.type === 'external' || item.type === 'share' ? 'noreferrer' : undefined}
                  onClick={(event) => handleSocialClick(item, event)}
                  aria-label={item.label}
                  className="group flex h-9 w-9 items-center justify-center rounded-full border border-white/80 bg-white/78 shadow-sm backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-green-200 sm:h-11 sm:w-11"
                >
                  <img
                    src={item.icon}
                    className="h-4 w-4 object-contain opacity-70 transition group-hover:opacity-100"
                    alt=""
                  />
                </a>
              ))}
            </div>
          </div>
        </div>

        <footer ref={footerRef} className="shrink-0 pb-1 sm:pb-2">
          <div className="overflow-hidden rounded-[1.5rem] border border-white/70 bg-white/86 shadow-[0_16px_40px_rgba(7,31,79,0.10)] backdrop-blur-md">
            <div className="flex flex-col gap-2.5 p-3 sm:gap-3 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <p className="text-xs text-neutral-600 sm:text-sm">
                  © 2026{' '}
                  <span className="font-bold text-[#071f4f]">
                    Cape Frontier Travel & Tours.
                  </span>{' '}
                  All rights reserved.
                </p>

                <p className="mt-1 text-xs leading-5 text-neutral-500">
                  Designed and built by{' '}
                  <b className="text-neutral-800">F. Viljoen</b>
                </p>
              </div>

              <nav className="flex flex-wrap gap-1.5 text-xs font-bold sm:gap-2 sm:text-sm">
                {footerLinks.map((link) => (
                  <button
                    key={link.label}
                    type="button"
                    onClick={() => handleFooterLink(link)}
                    className="rounded-full bg-[#f4fbff] px-3 py-1.5 text-blue-950/60 transition hover:bg-green-200 hover:text-green-950 sm:px-4 sm:py-2"
                  >
                    {link.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="flex flex-col gap-1.5 border-t border-black/5 bg-[#071f4f] px-3 py-2.5 text-[11px] text-white/70 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-3 sm:text-xs">
              <span>premium cape town routes • pickup support • secure bookings</span>
              <span className="font-bold text-green-200">admin@capefrontier.co.za</span>
            </div>
          </div>
        </footer>
      </div>
    </section>
  )
}

export default Contact