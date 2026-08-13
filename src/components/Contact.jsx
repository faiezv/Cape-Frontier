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
    href: '/',
    type: 'share',
  },
]

const informationLinks = [
  { label: 'Privacy policy', path: '/policies' },
  { label: 'Terms & conditions', path: '/policies' },
  { label: 'Pickup information' },
  { label: 'Tour availability' },
  { label: 'Accessibility' },
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

  /*
   * Keep the section height stable when mobile browser chrome
   * expands/collapses.
   */
  useEffect(() => {
    const section = sectionRef.current

    if (!section || typeof window === 'undefined') return

    let frame = null
    let lastHeight = 0

    const updateHeight = () => {
      if (frame) cancelAnimationFrame(frame)

      frame = requestAnimationFrame(() => {
        const height = Math.round(
          window.visualViewport?.height ||
            window.innerHeight ||
            0
        )

        /*
         * Ignore tiny browser UI fluctuations.
         */
        if (!lastHeight || Math.abs(height - lastHeight) > 80) {
          lastHeight = height
          section.style.setProperty(
            '--contact-vh',
            `${height}px`
          )
        }
      })
    }

    updateHeight()

    window.addEventListener('resize', updateHeight)
    window.addEventListener('orientationchange', updateHeight)

    window.visualViewport?.addEventListener(
      'resize',
      updateHeight
    )

    return () => {
      if (frame) cancelAnimationFrame(frame)

      window.removeEventListener('resize', updateHeight)
      window.removeEventListener(
        'orientationchange',
        updateHeight
      )

      window.visualViewport?.removeEventListener(
        'resize',
        updateHeight
      )
    }
  }, [])

  /*
   * Entrance animations.
   */
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const cards = cardsRef.current.filter(Boolean)
      const socials = socialRef.current.filter(Boolean)

      gsap.fromTo(
        contentRef.current,
        {
          opacity: 0,
          y: 24,
          filter: 'blur(5px)',
        },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 0.7,
          ease: 'power3.out',
        }
      )

      gsap.fromTo(
        logoRef.current,
        {
          opacity: 0,
          scale: 0.9,
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

      if (cards.length) {
        gsap.fromTo(
          cards,
          {
            opacity: 0,
            y: 16,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.07,
            ease: 'power2.out',
            delay: 0.12,
          }
        )
      }

      if (socials.length) {
        gsap.fromTo(
          socials,
          {
            opacity: 0,
            y: 8,
            scale: 0.94,
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.4,
            stagger: 0.05,
            ease: 'back.out(1.7)',
            delay: 0.3,
          }
        )
      }

      gsap.fromTo(
        footerRef.current,
        {
          opacity: 0,
          y: 14,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: 'power2.out',
          delay: 0.4,
        }
      )

      const desktop =
        typeof window === 'undefined' ||
        !window.matchMedia('(max-width: 767px)').matches

      if (desktop) {
        gsap.to(logoRef.current, {
          y: -8,
          duration: 3.2,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        })

        gsap.to(glowRef.current, {
          x: 22,
          y: -16,
          scale: 1.06,
          duration: 4,
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
    if (item.type !== 'share') return

    event.preventDefault()

    const shareData = {
      title: 'Cape Frontier Travel & Tours',
      text: 'Explore Cape Town tours with Cape Frontier.',
      url: window.location.origin,
    }

    if (
      typeof navigator !== 'undefined' &&
      navigator.share
    ) {
      try {
        await navigator.share(shareData)
      } catch {
        // User cancelled the share sheet.
      }

      return
    }

    window.open(
      window.location.origin,
      '_blank',
      'noopener,noreferrer'
    )
  }

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="relative min-h-[var(--contact-vh,100svh)] overflow-hidden bg-[#eef7f6] text-black"
    >
      {/* Background artwork */}
      <img
        src="/assets/content/clip-art/section3-bg.png"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover opacity-55"
      />

      <img
        src="/assets/content/clip-art/contact-clip.png"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 h-full w-full object-cover opacity-50"
      />

      {/* Soft colour wash */}
      <div className="absolute inset-0 z-20 bg-[linear-gradient(135deg,rgba(255,255,255,0.94)_0%,rgba(232,246,255,0.90)_46%,rgba(220,252,231,0.94)_100%)]" />

      {/* Ambient glow */}
      <div
        ref={glowRef}
        className="pointer-events-none absolute right-[8%] top-[14%] z-20 h-44 w-44 rounded-full bg-green-200/55 blur-3xl sm:h-64 sm:w-64"
      />

      <div className="relative z-30 mx-auto flex min-h-[var(--contact-vh,100svh)] w-full max-w-7xl flex-col px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-7">
        {/* Top control */}
        <div className="flex shrink-0 justify-end">
          <button
            type="button"
            onClick={scrollToTop}
            aria-label="Back to top"
            className="group flex h-10 w-10 items-center justify-center rounded-2xl border border-white/50 bg-white/70 shadow-[0_10px_25px_rgba(0,0,0,0.08)] backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:bg-green-200 sm:h-11 sm:w-11"
          >
            <img
              src="/icons/upArrowDark.png"
              alt=""
              className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5"
            />
          </button>
        </div>

        {/* Main content */}
        <div className="grid flex-1 items-center gap-7 py-5 sm:gap-9 sm:py-7 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16 lg:py-8">
          {/* Logo */}
          <div className="order-1 flex justify-center lg:justify-start">
            <div
              ref={logoRef}
              className="relative w-full max-w-[8rem] sm:max-w-[11rem] lg:max-w-[20rem]"
            >
              <img
                src="/assets/brand/logo.png"
                alt="Cape Frontier"
                className="relative z-10 h-auto w-full object-contain opacity-[0.98] drop-shadow-[0_18px_40px_rgba(0,0,0,0.16)]"
              />

              <div className="absolute inset-x-8 bottom-3 h-8 rounded-full bg-blue-950/10 blur-2xl" />
            </div>
          </div>

          {/* Content */}
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

              <p className="mx-auto mt-3 max-w-2xl font-bitter text-[13px] leading-6 text-neutral-600 sm:text-base sm:leading-7 lg:mx-0 lg:text-lg">
                Message us about tours, pickup details, private
                trips, custom routes, or booking support. We will
                help you choose the right Cape Town experience.
              </p>
            </div>

            {/* Contact card */}
            <div className="w-full max-w-3xl">
              <div
                ref={(el) => {
                  cardsRef.current[0] = el
                }}
                className="rounded-[1.5rem] border border-white/70 bg-white/72 p-4 text-left shadow-[0_10px_30px_rgba(7,31,79,0.06)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:bg-white/88 hover:shadow-[0_18px_40px_rgba(7,31,79,0.10)] sm:p-5"
              >
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-500">
                  Email
                </p>

                <p className="mt-2 break-words text-sm font-bold leading-5 text-[#071f4f] sm:text-[15px]">
                  {CONTACT_EMAIL}
                </p>

                <p className="mt-1 text-xs leading-5 text-neutral-500">
                  Booking and support
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={openContact}
                className="hero-gradient-bl flex min-h-[52px] w-full items-center justify-center rounded-full px-6 text-sm font-bold text-white shadow-[0_16px_34px_rgba(7,31,79,0.20)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_42px_rgba(7,31,79,0.28)] sm:w-auto sm:px-8"
              >
                Email us
              </button>

              <button
                type="button"
                onClick={() => navigate('/policies')}
                className="flex min-h-[52px] w-full items-center justify-center rounded-full border border-blue-950/10 bg-white/82 px-6 text-sm font-bold text-[#071f4f] shadow-[0_8px_24px_rgba(0,0,0,0.04)] backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:bg-green-200 hover:text-green-950 sm:w-auto sm:px-8"
              >
                View policies
              </button>
            </div>

            {/* Socials */}
            <div className="flex items-center justify-center gap-2.5 lg:justify-start">
              {socialLinks.map((item, index) => (
                <a
                  key={item.label}
                  ref={(el) => {
                    socialRef.current[index] = el
                  }}
                  href={item.href}
                  target={
                    item.type === 'external'
                      ? '_blank'
                      : undefined
                  }
                  rel={
                    item.type === 'external'
                      ? 'noreferrer'
                      : undefined
                  }
                  onClick={(event) =>
                    handleSocialClick(item, event)
                  }
                  aria-label={item.label}
                  className="group flex h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-white/72 shadow-[0_8px_24px_rgba(7,31,79,0.06)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:bg-green-200 hover:shadow-[0_14px_32px_rgba(7,31,79,0.12)] sm:h-11 sm:w-11"
                >
                  <img
                    src={item.icon}
                    alt=""
                    className="h-4 w-4 object-contain opacity-70 transition duration-300 group-hover:opacity-100"
                  />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer ref={footerRef} className="shrink-0">
          <div className="overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/82 shadow-[0_20px_60px_rgba(7,31,79,0.10)] backdrop-blur-xl">
            {/* Information */}
            <div className="px-4 py-4 sm:px-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">
                  Information
                </p>

                <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs sm:justify-end sm:text-sm">
                  {informationLinks.map((item, index) => (
                    <React.Fragment key={item.label}>
                      {index > 0 && (
                        <span
                          aria-hidden="true"
                          className="hidden text-black/20 sm:inline"
                        >
                          |
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          item.path && navigate(item.path)
                        }
                        className="text-neutral-600 transition hover:text-[#071f4f]"
                      >
                        {item.label}
                      </button>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>

            {/* Copyright */}
            <div className="border-t border-black/5 bg-[#071f4f] px-4 py-4 sm:px-6">
              <div className="flex flex-col gap-4 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
                <div className="flex items-center justify-center gap-3 sm:justify-start">
                  <img
                    src="/icons/ZAR.png"
                    alt="South African Rand"
                    className="h-9 w-9 shrink-0 rounded-full border border-white/10 object-cover shadow-[0_6px_18px_rgba(0,0,0,0.18)]"
                  />

                  <div>
                    <p className="text-sm font-semibold text-white">
                      © 2026 Cape Frontier Travel & Tours
                    </p>

                    <p className="mt-1 text-xs text-white/65">
                      Designed and built with {'<3'} by{' '}
                      <span className="font-semibold text-white/85">
                        F. Viljoen
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-end">
                  <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold text-green-200 backdrop-blur-md">
                    premium routes
                  </span>

                  <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold text-green-200 backdrop-blur-md">
                    secure booking
                  </span>

                  <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold text-green-200 backdrop-blur-md">
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