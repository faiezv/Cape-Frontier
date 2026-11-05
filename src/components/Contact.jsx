import React, { useEffect, useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import SiteFooter from '../components/SiteFooter'
import { WhatsAppIcon, WHATSAPP_URL } from '../components/WhatsApp'

const CONTACT_EMAIL = 'admin@cape-frontier.co.za'
const CONTACT_NUMBER = '(+27)72 264 7284';

// Gmail logo (multi-colour). Aspect ratio 256:193, so keep h/w roughly 3:4.
const GmailIcon = ({ className = 'h-3.5 w-[18.5px]' }) => (
  <svg
    viewBox="0 0 256 193"
    aria-hidden="true"
    focusable="false"
    className={className}
  >
    <path fill="#4285F4" d="M58.182 192.05V93.14L27.507 65.077 0 49.504v125.091c0 9.658 7.825 17.455 17.455 17.455h40.727Z" />
    <path fill="#34A853" d="M197.818 192.05h40.727c9.659 0 17.455-7.826 17.455-17.455V49.505l-31.156 17.837-27.026 25.798v98.91Z" />
    <path fill="#EA4335" d="m58.182 93.14-4.174-38.647 4.174-36.989L128 69.868l69.818-52.364 4.67 34.992-4.67 40.644L128 145.504 58.182 93.14Z" />
    <path fill="#FBBC04" d="M197.818 17.504V93.14L256 49.504V26.231c0-21.585-24.64-33.89-41.89-20.945l-16.292 12.218Z" />
    <path fill="#C5221F" d="m0 49.504 26.759 20.07L58.182 93.14V17.504L41.89 5.286C24.61-7.66 0 4.646 0 26.23v23.273Z" />
  </svg>
)

const socialLinks = [
  {
    label: 'Facebook',
    icon: '/icons/facebook.png',
    href: 'https://www.facebook.com/share/19B7fwycJi/',
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

const Contact = () => {
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
      {/* Background artwork
      <img
        // src="/assets/content/clip-art/section3-bg.png"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover opacity-55"
      /> */}

      <img
        src="/assets/content/clip-art/contact-clip.png"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 h-full w-full object-cover opacity-100"
      />

      {/* Soft colour wash */}
      <div className="absolute inset-0 z-20 bg-[linear-gradient(135deg,rgba(255,255,255,0.94)_0%,rgba(232,246,255,0.90)_46%,rgba(220,252,231,0.94)_100%)]" />

      {/* Ambient glow */}
      <div
        ref={glowRef}
        className="pointer-events-none absolute right-[8%] top-[14%] z-20 h-44 w-44 rounded-full bg-green-200/55 blur-3xl sm:h-64 sm:w-64"
      />

      <div className="relative z-30 mx-auto flex min-h-[var(--contact-vh,100svh)] w-full max-w-7xl flex-col px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-7">

        {/* Main content */}
        <div className="grid flex-1 items-center gap-7 py-5 sm:gap-9 sm:py-7 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16 lg:py-8">

          {/* Logo + Back to top */}
          <div className="flex flex-col items-center">
            {/* Logo */}
            <div
              ref={logoRef}
              className="relative w-full max-w-[rem] sm:max-w-[rem] lg:max-w-[rem]"
            >
              <img
                src="/assets/brand/logo-cf.webp"
                alt="Cape Frontier"
                className="relative z-10 h-auto w-full object-contain opacity-[0.98] drop-shadow-[0_18px_40px_rgba(0,0,0,0.16)]"
              />

              <div className="absolute inset-x-8 bottom-3 h-8 rounded-full bg-blue-950/10 blur-2xl" />
            </div>

            <p className='text-2xl font-bitter text-black/60'>Explore beyond the ordinary.</p>

            {/* Back to top */}
            <div className="mt-5 flex items-center justify-end gap-3">
              <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-900/55">
                Back to top
              </span>

              <button
                type="button"
                onClick={scrollToTop}
                aria-label="Back to top"
                className="
                  group
                  flex h-10 w-10 shrink-0 items-center justify-center
                  border border-slate-900/15
                  bg-white/50
                  backdrop-blur-sm
                  transition-all duration-300 ease-out
                  hover:-translate-y-1
                  hover:border-slate-900/40
                  hover:bg-white/90
                  focus:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-slate-900/20
                  sm:h-11 sm:w-11
                "
              >
                <img
                  src="/icons/upArrowDark.png"
                  alt=""
                  className="
                    h-3.5 w-3.5
                    opacity-70
                    transition-all duration-300 ease-out
                    group-hover:-translate-y-0.5
                    group-hover:opacity-100
                  "
                />
              </button>
            </div>
          </div>

          {/* Content */}
          <div
            ref={contentRef}
            className="order-2 flex flex-col gap-5 text-center lg:gap-6 lg:text-left"
          >

            {/* Heading */}
            <div>
              {/* <p className="font-bitter text-[10px] font-black uppercase tracking-[0.28em] text-blue-500 sm:text-xs">
                Contact Cape Frontier
              </p> */}

              {/* <h2 className="mt-2 font-frank font-bold leading-[0.88] tracking-[-0.03em] text-[#071f4f] 
              text-4xl sm:text-4xl md:text-4xl lg:text-4xl xl:text-4xl">
                Have a question?
              </h2>

              <p className="mx-auto mt-3 max-w-2xl font-bitter text-[13px] leading-6 text-neutral-600 sm:text-base sm:leading-7 lg:mx-0 lg:text-lg">
                Message us about tours, pickup details, private trips, custom routes, or booking support. We will help you choose the right Cape Town experience.
              </p> */}
            </div>

            {/* Contact area */}
            <div className="flex w-full gap-4">

              

              {/* Right: Full-height QR */}
              <div
                ref={(el) => {
                  cardsRef.current[1] = el
                }}
                className="flex-1 flex w-full flex-col items-center justify-center rounded-[1.5rem] border border-white/0 bg-white/0 p- 
                text-center hadow-[0_10px_30px_rgba(7,31,79,0.06)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:bg-white/88 
                hover:shadow-[0_18px_40px_rgba(7,31,79,0.10)] 
                "
              >
                <a
                  href="https://www.instagram.com/"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Follow Cape Frontier on Instagram"
                  className="flex h-full w-full flex-col items-center justify-center"
                >
                  {/* QR Code */}
                  <div className="flex min-h-0 flex-1 items-center justify-center">
                    <div className="relative overflow-hidden rounded-2xl border border-black/5 bg-white/70 p-2 
                    shadow-[0_8px_24px_rgba(7,31,79,0.06)] transition duration-300 hover:shadow-[0_14px_32px_rgba(7,31,79,0.12)]">
                      <img
                        src="/assets/brand/instagram.png"
                        alt="Scan to follow Cape Frontier on Instagram"
                        className="h-auto w-full max-w-[16rem] object-contain"
                      />
                    </div>
                  </div>

                  {/* Text below QR */}
                  {/* <div className="mt-3 shrink-0">
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-500">
                      Instagram
                    </p>

                    <p className="mt-1 text-xs font-semibold leading-4 text-[#071f4f]">
                      Scan to follow us
                    </p>
                  </div> */}
                </a>
              </div>

              {/* Left: Email + buttons */}
              <div className="flex-1 flex flex-col gap-4">

                {/* Email */}
                <div
                  ref={(el) => {
                    cardsRef.current[0] = el
                  }}
                  className="relative w-full rounded-3xl border border-white/70 bg-white/72 p-4 text-left shadow-[0_10px_30px_rgba(7,31,79,0.06)] 
                  backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:bg-white/88 hover:shadow-[0_18px_40px_rgba(7,31,79,0.10)] sm:p-5"
                >
                  <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-blue-500">
                    {/* <GmailIcon /> */}
                    {/* Email */}
                  </p>

                  <p className="wrap-break-word text-sm font-bold leading-5 text-[#071f4f] sm:text-[15px]">
                    {CONTACT_EMAIL}
                  </p>

                  <a
                    href={`mailto:${CONTACT_EMAIL}`}
                    className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 transition hover:bg-blue-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
                  >
                    <GmailIcon />
                    Contact us via email
                  </a>
                  <div className='my-3 w-full border border-blue-200/50'/>
                  <p className="mt-2 text-[10px] font-black uppercase tracking-[0.22em] text-blue-500">
                    {/* WhatsApp &amp; calls */}
                  </p>

                  <a
                    href={WHATSAPP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm font-bold leading-5 text-[#071f4f] hover:underline sm:text-[15px]"
                  >
                    <WhatsAppIcon className="h-4 w-4 shrink-0 text-[#25D366]" />
                    {CONTACT_NUMBER}
                  </a>

                  <p className="mt-1 text-xs leading-5 text-neutral-500">
                    Booking and support
                  </p>
                </div>

                {/* Actions */}
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-h-[56px] w-full items-center justify-center gap-3 rounded-full bg-[#25D366] px-6 text-base font-bold text-[#06371d] shadow-[0_16px_34px_rgba(37,211,102,0.35)] transition duration-300 hover:-translate-y-1 hover:bg-[#1ebe5b] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-green-300"
                >
                  <WhatsAppIcon className="h-6 w-6" />
                  Chat on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer (shared with the Tours page) */}
        <div ref={footerRef} className="shrink-0">
          <SiteFooter />
        </div>
      </div>
    </section>
  )
}

export default Contact