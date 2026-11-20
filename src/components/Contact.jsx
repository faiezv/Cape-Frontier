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
      className="relative overflow-hidden bg-[#eef7f6] text-black py-4 pt-18"
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
      <div className="absolute inset-0 z-20 
      bg-[linear-gradient(135deg,rgba(255,255,255,0.94)_0%,rgba(232,246,255,0.90)_46%,rgba(220,252,231,0.94)_100%)]" />

      {/* Ambient glow */}
      <div
        ref={glowRef}
        className="pointer-events-none absolute right-[8%] z-20 w-44 rounded-full bg-green-200/55 blur-3xl sm:w-64"
      />

      <div className="relative z-30 mx-auto flex  w-full max-w-7xl flex-col ">



        {/* Footer (shared with the Tours page) */}
        <div ref={footerRef} className="shrink-0">
          <SiteFooter />
        </div>
      </div>
    </section>
  )
}

export default Contact