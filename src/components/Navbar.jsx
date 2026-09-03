import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLocation } from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// import KidsActivities from '../components/TourDetails/k'
import { KidsActivitiesNavbar } from '../components/KidsActivitiesNavbar.jsx';
import { useLoadingNavigate } from "./useLoadingNavigate.jsx"
import { resolveImage } from '../utils/ImageLoader.js'

gsap.registerPlugin(ScrollTrigger)

const navItems = [
  { label: 'Home' },
  { label: 'About' },
  { label: 'Stories' },
  { label: 'Gallery' },
  { label: 'Tours' },
  { label: 'FAQ' },
]

const sectionIdMap = {
  About: 'about',
  Stories: 'stories',
  Tours: 'tours',
  Gallery: 'gallery',
  FAQ: 'faq',
}

const megaMenus = {
  Home: {
    eyebrow: 'Start here',
    title: 'Cape Frontier Travel & Tours',
    desc: 'Jump back to the main landing area, then explore stories, tours, and contact options from one place.',
    layout: 'links',
    links: [
      {
        title: 'Back to top',
        desc: 'Return to the hero section.',
        target: 'Home',
      },
      {
        title: 'Popular tours',
        desc: 'Move straight into featured routes.',
        target: 'Tours',
      },
      {
        title: 'Ask a question',
        desc: 'Open the contact section for help.',
        target: 'Contact',
      },
    ],
  },

  About: {
    eyebrow: 'About Cape Frontier',
    title: 'What makes the journey feel premium',
    desc: 'A quick guide to the sections that explain the travel experience, local support, pickup flow, and booking process.',
    logo: '/assets/brand/logo-removebg.png',
    layout: 'links',
    links: [
      {
        title: 'Why Cape Frontier',
        desc: 'Local insight, curated routes, and flexible planning.',
        target: 'About',
      },
      {
        title: 'Guided experience',
        desc: 'Tours built around comfort, pacing, and storytelling.',
        target: 'About',
      },
      {
        title: 'Pickup support',
        desc: 'Customers can request pickup from their accommodation.',
        target: 'Tours',
      },
      {
        title: 'Booking flow',
        desc: 'Choose a tour, request the trip, and complete checkout.',
        target: 'Tours',
      },
    ],
  },

  Stories: {
    eyebrow: 'Traveller stories',
    title: 'Reviews, moments, and route highlights',
    desc: 'See what guests enjoyed, from scenic stops and wine farms to guided adventure experiences.',
    layout: 'links',
    links: [
      {
        title: 'Guest reviews',
        desc: 'Read verified traveller-style feedback.',
        target: 'Stories',
      },
      {
        title: 'Cape moments',
        desc: 'Scenic route highlights and memorable stops.',
        target: 'Stories',
      },
      {
        title: 'Adventure notes',
        desc: 'See how the day feels from start to finish.',
        target: 'Tours',
      },
      {
        title: 'Travel confidence',
        desc: 'Helpful guidance before booking.',
        target: 'Contact',
      },
    ],
  },

  Tours: {
    eyebrow: 'Browse tours',
    title: 'Choose your Cape Town experience',
    desc: 'Explore routes by category. Each card opens the tours section where users can preview details and request a trip.',
    layout: 'cards',
    cards: [
      {
        title: 'Adrenaline',
        desc: 'Shark cage diving, paragliding, snorkelling, and guided thrill experiences.',
        image: resolveImage('/src/assets/images/tours/adrenaline/shark-cage-diving/1.webp'),
        target: 'Tours',
      },
      {
        title: 'Hiking',
        desc: 'Lion’s Head and Table Mountain routes with scenic viewpoints.',
        image: resolveImage('/src/assets/images/tours/hiking/lions-head/1.webp'),
        target: 'Tours',
      },
      {
        title: 'Historical',
        desc: 'Robben Island and cultural routes with meaningful local context.',
        image: resolveImage('/src/assets/images/tours/historical/langa/2.webp'),
        target: 'Tours',
      },
      {
        title: 'Packages',
        desc: 'Cape Peninsula and Stellenbosch wine farm full-day experiences.',
        image: resolveImage('/src/assets/images/tours/packages/3-day-garden-route/960px-Harbour_-_Knysna,_South_Af.webp'),
        target: 'Tours',
      },
    ],
  },

  FAQ: {
    eyebrow: 'Cape Frontier policies',
    title: 'Before you book',
    desc: 'Quick policy links for booking, pickup, payments, cancellations, private tours, and vehicle arrangements. Final details are confirmed manually by Cape Frontier.',
    layout: 'links',
    links: [
      {
        title: 'Booking policy',
        desc: 'Guests book for their own group size, and checkout participants must match their party.',
        target: '/policies#booking-policy',
      },
      {
        title: 'Pickup policy',
        desc: 'Pickup is included unless stated otherwise and confirmed manually after booking.',
        target: '/policies#pickup-policy',
      },
      {
        title: 'Payment flow',
        desc: 'Select tour, complete booking form, pay online, then receive confirmation.',
        target: '/policies#payment-policy',
      },
      {
        title: 'Cancellations',
        desc: 'Refunds and penalties depend on timing, with weather options handled separately.',
        target: '/policies#cancellation-policy',
      },
      {
        title: 'Rescheduling',
        desc: 'Reschedules depend on availability and Cape Frontier confirmation.',
        target: '/policies#reschedule-policy',
      },
      {
        title: 'Private tours',
        desc: 'Private tours have an extra per-vehicle fee and exclude entrance fees unless stated.',
        target: '/policies#private-tour-policy',
      },
      {
        title: 'Vehicles',
        desc: 'Cape Frontier decides vehicle size based on group size and operational needs.',
        target: '/policies#vehicle-policy',
      },
    ],
  },
}

const Navbar = () => {
  const navigate = useLoadingNavigate()
  const location = useLocation()

  const isCheckout = location.pathname === '/checkout'
  const isBooking = location.pathname === '/booking'
  const isSuccess = location.pathname === '/success'

  const [language, setLanguage] = useState('EN')
  const [menuOpen, setMenuOpen] = useState(false)
  const [hoverIndex, setHoverIndex] = useState(null)
  const [pendingSection, setPendingSection] = useState(null)
  const [activeMega, setActiveMega] = useState(null)
  const [activeMobileMega, setActiveMobileMega] = useState(null)

  const navbarRef = useRef(null)
  const accentRef = useRef(null)
  const mobilePanelRef = useRef(null)
  const megaPanelRef = useRef(null)
  const mobileMenuContentRef = useRef(null)
  const megaCloseTimerRef = useRef(null)

  const activeMegaData = activeMega ? megaMenus[activeMega] : null

  // --------------------------------------------------
  // AFFILIATION REFS
  // --------------------------------------------------

  const affiliationRef = useRef(null)
  const affiliationTextRef = useRef(null)
  const affiliationHandshakeRef = useRef(null)
  const affiliationLogoRef = useRef(null)
  const affiliationGlowRef = useRef(null)

  // --------------------------------------------------
  // MAIN LOGO
  // --------------------------------------------------

  const mainLogoRef = useRef(null)

  const scrollWindowTo = (y) => {
    const targetY = Math.max(0, y)

    ScrollTrigger.refresh()

    if (window.lenis) {
      window.lenis.scrollTo(targetY, {
        duration: 1,
        force: true,
      })
      return
    }

    window.scrollTo({
      top: targetY,
      behavior: 'smooth',
    })
  }

  const scrollToTop = () => scrollWindowTo(0)

  const scrollToSection = (sectionId) => {
    if (!sectionId) return false

    const el = document.getElementById(sectionId)

    if (!el) return false

    const y =
      el.getBoundingClientRect().top +
      window.scrollY

    scrollWindowTo(y)

    return true
  }

  // --------------------------------------------------
  // DESKTOP MEGA MENU
  // --------------------------------------------------

  const openMega = (label, index, event) => {
    if (window.innerWidth < 768) return

    window.clearTimeout(
      megaCloseTimerRef.current
    )

    setHoverIndex(index)
    setActiveMega(label)

    if (navbarRef.current) {
      gsap.to(navbarRef.current, {
        y: '0%',
        duration: 0.18,
        ease: 'power2.out',
      })
    }
  }

  const scheduleCloseMega = () => {
    window.clearTimeout(
      megaCloseTimerRef.current
    )

    megaCloseTimerRef.current =
      window.setTimeout(() => {
        setActiveMega(null)
        setHoverIndex(null)
      }, 120)
  }

  const keepMegaOpen = () => {
    window.clearTimeout(
      megaCloseTimerRef.current
    )
  }

  // --------------------------------------------------
  // NAVIGATION
  // --------------------------------------------------

  const handleNavClick = (label, event) => {
    event?.preventDefault?.()
    event?.stopPropagation?.()

    setMenuOpen(false)
    setActiveMega(null)
    setActiveMobileMega(null)
    setHoverIndex(null)

    if (
      typeof label === 'string' &&
      label.startsWith('/')
    ) {
      setPendingSection(null)
      navigate(label)
      return
    }

    if (label === 'Home') {
      setPendingSection(null)

      if (location.pathname !== '/') {
        navigate('/', {
          state: {
            scrollTo: 'top',
          },
        })

        return
      }

      scrollToTop()
      return
    }

    const sectionId = sectionIdMap[label]

    if (!sectionId) return

    setPendingSection(sectionId)

    if (location.pathname !== '/') {
      navigate('/', {
        state: {
          scrollTo: sectionId,
        },
      })

      return
    }

    requestAnimationFrame(() => {
      const didScroll =
        scrollToSection(sectionId)

      if (didScroll) {
        setPendingSection(null)
      }
    })
  }

  const toggleMobileMega = (
    label,
    event
  ) => {
    event?.preventDefault?.()
    event?.stopPropagation?.()

    if (label === 'Home') {
      handleNavClick(label, event)
      return
    }

    setActiveMobileMega((current) =>
      current === label ? null : label
    )
  }

  // --------------------------------------------------
  // PENDING SECTION SCROLL
  // --------------------------------------------------

  useEffect(() => {
    if (
      location.pathname !== '/' ||
      !pendingSection
    ) {
      return
    }

    const delays = [
      0,
      80,
      180,
      350,
      650,
      950,
    ]

    const timers = delays.map((delay) =>
      window.setTimeout(() => {
        const didScroll =
          scrollToSection(
            pendingSection
          )

        if (didScroll) {
          setPendingSection(null)
        }
      }, delay)
    )

    return () =>
      timers.forEach((timer) =>
        window.clearTimeout(timer)
      )
  }, [
    location.pathname,
    pendingSection,
  ])

  // --------------------------------------------------
  // ACCENT ANIMATION
  // --------------------------------------------------

  useEffect(() => {
    if (!accentRef.current) return

    const tween = gsap.to(
      accentRef.current,
      {
        x: 14,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      }
    )

    return () => tween.kill()
  }, [])

  // --------------------------------------------------
  // MOBILE MENU ANIMATION
  // --------------------------------------------------

  useEffect(() => {
    if (!menuOpen) return

    if (navbarRef.current) {
      gsap.to(navbarRef.current, {
        y: '0%',
        duration: 0.2,
        ease: 'power2.out',
      })
    }

    if (!mobilePanelRef.current) return

    gsap.fromTo(
      mobilePanelRef.current,
      {
        opacity: 0,
        y: -12,
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.24,
        ease: 'power2.out',
      }
    )
  }, [menuOpen])

  // --------------------------------------------------
  // DESKTOP MEGA ANIMATION
  // --------------------------------------------------

  useEffect(() => {
    if (
      !activeMega ||
      !megaPanelRef.current
    ) {
      return
    }

    gsap.killTweensOf(
      megaPanelRef.current
    )

    gsap.fromTo(
      megaPanelRef.current,
      {
        opacity: 0,
        y: -10,
        scale: 0.985,
        filter: 'blur(4px)',
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: 'blur(0px)',
        duration: 0.24,
        ease: 'power2.out',
      }
    )
  }, [activeMega])

  // --------------------------------------------------
  // MOBILE MEGA ANIMATION
  // --------------------------------------------------

  useEffect(() => {
    if (
      !activeMobileMega ||
      !mobileMenuContentRef.current
    ) {
      return
    }

    const activePanel =
      mobileMenuContentRef.current.querySelector(
        `[data-mobile-mega="${activeMobileMega}"]`
      )

    if (!activePanel) return

    gsap.fromTo(
      activePanel,
      {
        height: 0,
        opacity: 0,
        y: -6,
      },
      {
        height: 'auto',
        opacity: 1,
        y: 0,
        duration: 0.24,
        ease: 'power2.out',
      }
    )
  }, [activeMobileMega])

  // --------------------------------------------------
  // RESIZE
  // --------------------------------------------------

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) {
        setMenuOpen(false)
        setActiveMobileMega(null)
      }

      if (window.innerWidth < 768) {
        setActiveMega(null)
        setHoverIndex(null)
      }
    }

    window.addEventListener(
      'resize',
      onResize
    )

    return () =>
      window.removeEventListener(
        'resize',
        onResize
      )
  }, [])

  // --------------------------------------------------
  // ROUTE CHANGE
  // --------------------------------------------------

  useEffect(() => {
    setMenuOpen(false)
    setActiveMega(null)
    setActiveMobileMega(null)
    setHoverIndex(null)
  }, [location.pathname])

  useEffect(() => {
    return () => {
      window.clearTimeout(
        megaCloseTimerRef.current
      )
    }
  }, [])

  // --------------------------------------------------
  // MAIN LOGO HOVER
  // --------------------------------------------------

  const animateMainLogoIn = () => {
    if (!mainLogoRef.current) return

    gsap.killTweensOf(
      mainLogoRef.current
    )

    gsap.to(mainLogoRef.current, {
      scale: 1.045,
      y: -1,
      duration: 0.35,
      ease: 'power3.out',
    })
  }

  const animateMainLogoOut = () => {
    if (!mainLogoRef.current) return

    gsap.killTweensOf(
      mainLogoRef.current
    )

    gsap.to(mainLogoRef.current, {
      scale: 1,
      y: 0,
      duration: 0.3,
      ease: 'power3.out',
    })
  }

  // --------------------------------------------------
  // AFFILIATION ANIMATION
  // --------------------------------------------------

  const animateAffiliationIn = () => {
    if (!affiliationRef.current) return

    gsap.killTweensOf([
      affiliationRef.current,
      affiliationTextRef.current,
      affiliationHandshakeRef.current,
      affiliationLogoRef.current,
      affiliationGlowRef.current,
    ])

    const textWidth =
      affiliationTextRef.current?.scrollWidth ||
      0

    gsap.to(
      affiliationTextRef.current,
      {
        width: textWidth,
        opacity: 1,
        x: 0,
        letterSpacing: '0.14em',
        duration: 0.45,
        ease: 'power3.out',
      }
    )

    gsap.to(
      affiliationRef.current,
      {
        scale: 1.04,
        y: -2,
        duration: 0.45,
        ease: 'power3.out',
      }
    )

    gsap.to(
      affiliationHandshakeRef.current,
      {
        rotate: 12,
        scale: 1.18,
        duration: 0.25,
        ease: 'power2.out',
        yoyo: true,
        repeat: 1,
      }
    )

    gsap.to(
      affiliationLogoRef.current,
      {
        scale: 1.1,
        x: 2,
        duration: 0.55,
        ease: 'back.out(2)',
      }
    )

    gsap.fromTo(
      affiliationGlowRef.current,
      {
        xPercent: -120,
        opacity: 0,
      },
      {
        xPercent: 180,
        opacity: 1,
        duration: 0.8,
        ease: 'power2.inOut',
      }
    )
  }

  const animateAffiliationOut = () => {
    if (!affiliationRef.current) return

    gsap.killTweensOf([
      affiliationRef.current,
      affiliationTextRef.current,
      affiliationHandshakeRef.current,
      affiliationLogoRef.current,
      affiliationGlowRef.current,
    ])

    gsap.to(
      affiliationTextRef.current,
      {
        width: 0,
        opacity: 0,
        x: -6,
        duration: 0.3,
        ease: 'power3.inOut',
      }
    )

    gsap.to(
      affiliationRef.current,
      {
        scale: 1,
        y: 0,
        duration: 0.35,
        ease: 'power3.out',
      }
    )

    gsap.to(
      affiliationHandshakeRef.current,
      {
        rotate: 0,
        scale: 1,
        duration: 0.3,
        ease: 'power3.out',
      }
    )

    gsap.to(
      affiliationLogoRef.current,
      {
        scale: 1,
        x: 0,
        duration: 0.35,
        ease: 'power3.out',
      }
    )

    gsap.to(
      affiliationGlowRef.current,
      {
        opacity: 0,
        duration: 0.2,
        ease: 'power2.out',
      }
    )
  }

  if (
    isCheckout ||
    isBooking ||
    isSuccess
  ) {
    return null
  }

  return (
    <>
      {/* =========================================================
          NAVBAR
      ========================================================= */}

      <header
        ref={navbarRef}
        className={`
          fixed inset-x-0 top-0 z-[9990]
          w-screen max-w-[100dvw]
          overflow-x-clip
          border-white/10
          backdrop-blur-xl
          transition-all duration-200
          ${
            menuOpen
              ? 'pointer-events-none opacity-0 sm:pointer-events-auto sm:opacity-100'
              : 'opacity-100'
          }
        `}
      >
        <div
          className="
            mx-auto flex w-full max-w-[100dvw] min-w-0
            items-center
            gap-3
            px-3 py-2
            sm:px-4
            md:px-6
            lg:px-8
          "
        >

          {/* =====================================================
              MAIN LOGO
          ===================================================== */}

          <a
            href="/"
            aria-label="Cape Frontier Travel & Tours"
            onClick={(event) =>
              handleNavClick(
                'Home',
                event
              )
            }
            onMouseEnter={
              animateMainLogoIn
            }
            onMouseLeave={
              animateMainLogoOut
            }
            className="
              group
              relative
              flex
              shrink-0
              items-center
              justify-center
              overflow-visible
            "
          >
            <img
              ref={mainLogoRef}
              src="/assets/brand/logo-removebg.png"
              alt="Cape Frontier Travel & Tours"
              className="
                block
                h-11
                w-auto
                max-w-[170px]
                shrink-0
                object-contain
                object-center
                sm:h-12
                sm:max-w-[190px]
                md:h-12
                lg:h-13
              "
            />
          </a>

          {/* =====================================================
              DESKTOP NAV
          ===================================================== */}

          <div
            className="
              ml-auto
              hidden
              min-w-0
              items-center
              gap-2
              md:flex
              lg:gap-3
            "
          >

            {/* =================================================
                DESKTOP NAVIGATION
            ================================================= */}
            {/* =================================================
                CAPE TOWN TOURISM AFFILIATION

                MOVED HERE:
                It now sits beside the navbar rather than
                beside the main Cape Frontier logo.
            ================================================= */}

            <div
              ref={affiliationRef}
              className="
                group
                relative
                hidden
                shrink-0
                items-center
                sm:flex
                hover:bg-white
                rounded-full
                duration-300
              "
              onMouseEnter={
                animateAffiliationIn
              }
              onMouseLeave={
                animateAffiliationOut
              }
            >
              {/* Divider */}

              <div
                className="
                  mr-1
                  h-8
                  w-px
                  shrink-0
                  bg-gradient-to-b
                  from-transparent
                  via-white/30
                  to-transparent
                "
              />

              <a
                href="https://www.capetown.travel"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Cape Town Tourism"
                className="
                  relative
                  flex
                  items-center
                  gap-2
                  overflow-hidden
                  rounded-full
                  border
                  border-white/10
                  bg-white/[0.055]
                  px-2.5
                  py-1
                  backdrop-blur-xl
                  shadow-[0_8px_30px_rgba(0,0,0,0.12)]
                  transition-colors
                  duration-300
                  hover:border-white/25
                  hover:bg-white/[0.10]
                "
              >

                {/* Animated light sweep */}

                <span
                  ref={affiliationGlowRef}
                  className="
                    pointer-events-none
                    absolute
                    -inset-y-4
                    left-0
                    w-8
                    -skew-x-12
                    bg-white/30
                    blur-md
                    opacity-0
                  "
                />

                {/* In affiliation with */}

                <span
                  ref={affiliationTextRef}
                  className="
                    relative
                    z-10
                    block
                    shrink-0
                    overflow-hidden
                    whitespace-nowrap
                    font-frank
                    text-md
                    text-blue-600
                    font-bold
                  "
                  style={{
                    width: 0,
                    opacity: 0,
                  }}
                >
                  Affiliation  {'"Love Cape Town"'}
                </span>

                {/* Handshake */}

                <span
                  ref={
                    affiliationHandshakeRef
                  }
                  className="
                    relative
                    z-10
                    flex
                    h-7
                    w-7
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    bg-white/[0.08]
                  "
                >
                  <img
                    src="/icons/handshake.webp"
                    className="
                      h-4.5
                      w-4.5
                      object-contain
                    "
                    alt=""
                    aria-hidden="true"
                  />
                </span>

                {/* Love Cape Town */}

                <img
                  ref={affiliationLogoRef}
                  src="/assets/brand/logo-love-ct-blue.webp"
                  className="
                    relative
                    z-10
                    h-8
                    w-auto
                    shrink-0
                    object-contain
                    opacity-90
                  "
                  alt="Love Cape Town"
                />

              </a>
            </div>


            <nav
              className="
                flex
                items-center
                gap-1
                rounded-full
                bg-blue-600
                px-4
                shadow-[0_8px_30px_rgba(0,0,0,0.16)]
                lg:gap-2
                lg:px-8
              "
              aria-label="Desktop navigation"
            >

              {navItems.map(
                (item, index) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={(event) =>
                      handleNavClick(
                        item.label,
                        event
                      )
                    }
                    onMouseEnter={(event) =>
                      openMega(
                        item.label,
                        index,
                        event
                      )
                    }
                    onMouseLeave={
                      scheduleCloseMega
                    }
                    className="
                      rounded-full
                      px-2.5
                      py-2
                      text-sm
                      font-bold
                      text-white
                      transition-all
                      duration-300
                      hover:bg-white/20
                      hover:text-white
                      lg:px-4
                    "
                  >
                    <span
                      className="
                        relative
                        inline-flex
                        items-center
                      "
                    >
                      {item.label}

                      <span
                        className={`
                          absolute
                          -bottom-1
                          left-0
                          h-[2px]
                          rounded-full
                          bg-white
                          transition-all
                          duration-300
                          ${
                            hoverIndex === index
                              ? 'w-full opacity-100'
                              : 'w-0 opacity-0'
                          }
                        `}
                      />
                    </span>
                  </button>
                )
              )}
            </nav>

            {/* KIDS ACTIVITIES */}
            {/* <KidsActivitiesNavbar /> */}

            {/* =================================================
                CONTACT
            ================================================= */}

            <button
              type="button"
              onClick={() => {
                const contact =
                  document.querySelector(
                    '#contact'
                  )

                if (!contact) return

                contact.scrollIntoView({
                  behavior: 'smooth',
                  block: 'start',
                })
              }}
              className="
                flex
                shrink-0
                items-center
                gap-2
                rounded-full
                border
                border-white/14
                bg-white
                px-3
                py-1
                text-xs
                font-extrabold
                text-blue-600
                shadow-[0_8px_30px_rgba(0,0,0,0.16)]
                transition
                duration-300
                hover:-translate-y-0.5
                hover:bg-green
              "
            >
              <img
                src="/icons/faqBlue.png"
                className="
                  h-4
                  w-4
                  sm:h-5
                  sm:w-5
                "
                alt="CONTACT"
              />

              <span>
                Contact
              </span>
            </button>

          </div>

          {/* =====================================================
              MOBILE MENU BUTTON
          ===================================================== */}

          <div
            className="
              ml-auto
              flex
              shrink-0
              items-center
              gap-1.5
              sm:hidden
            "
          >
            <button
              type="button"
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
              onClick={(event) => {
                event.preventDefault()
                event.stopPropagation()
                setMenuOpen(
                  (prev) => !prev
                )
              }}
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-full
                border
                border-white/14
                bg-white/8
                backdrop-blur-sm
              "
            >
              <div
                className="
                  relative
                  flex
                  h-4
                  w-5
                  flex-col
                  justify-between
                "
              >
                <span
                  className={`
                    block
                    h-[2px]
                    w-full
                    rounded-full
                    bg-white
                    transition-all
                    duration-300
                    ${
                      menuOpen
                        ? 'translate-y-[7px] rotate-45'
                        : ''
                    }
                  `}
                />

                <span
                  className={`
                    block
                    h-[2px]
                    w-full
                    rounded-full
                    bg-white
                    transition-all
                    duration-300
                    ${
                      menuOpen
                        ? 'opacity-0'
                        : 'opacity-100'
                    }
                  `}
                />

                <span
                  className={`
                    block
                    h-[2px]
                    w-full
                    rounded-full
                    bg-white
                    transition-all
                    duration-300
                    ${
                      menuOpen
                        ? '-translate-y-[7px] -rotate-45'
                        : ''
                    }
                  `}
                />
              </div>
            </button>
          </div>

        </div>
      </header>

      {/* =========================================================
          DESKTOP BACKDROP
      ========================================================= */}

      {activeMegaData &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="
              pointer-events-none
              fixed
              inset-0
              z-[9970]
              bg-black/30
              backdrop-blur-[2px]
              md:block
            "
          />,
          document.body
        )}

      {/* =========================================================
          DESKTOP MEGA PANEL
      ========================================================= */}

      {activeMegaData &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={megaPanelRef}
            onMouseEnter={keepMegaOpen}
            onMouseLeave={
              scheduleCloseMega
            }
            className="
              fixed
              left-0
              right-0
              top-[4rem]
              z-[9980]
              hidden
              max-h-[calc(100dvh-4rem)]
              overflow-y-auto
              overscroll-contain
              border-y
              border-black/5
              bg-linear-to-b
              from-white
              to-0%
              text-black
              shadow-[0_18px_45px_rgba(0,0,0,0.10)]
              md:block
            "
          >
            <div
              className="
                mx-auto
                w-full
                max-w-7xl
                px-4
                py-5
                sm:px-6
                lg:px-8
              "
            >
              <div
                className="
                  grid
                  gap-5
                  lg:grid-cols-[0.68fr_1.32fr]
                "
              >

                {/* Intro */}

                <div
                  className="
                    rounded-[1.5rem]
                    border
                    border-black/5
                    bg-neutral-50
                    p-5
                  "
                >
                  {activeMegaData.logo && (
                    <img
                      src={
                        activeMegaData.logo
                      }
                      alt="Cape Frontier logo"
                      className="
                        mb-4
                        h-20
                        w-auto
                        object-contain
                      "
                    />
                  )}

                  <p
                    className="
                      font-bitter
                      text-[10px]
                      font-black
                      uppercase
                      tracking-[0.24em]
                      text-blue-400
                    "
                  >
                    {
                      activeMegaData.eyebrow
                    }
                  </p>

                  <h3
                    className="
                      mt-2
                      font-frank
                      text-4xl
                      font-bold
                      leading-none
                      text-neutral-950
                    "
                  >
                    {
                      activeMegaData.title
                    }
                  </h3>

                  <p
                    className="
                      mt-3
                      max-w-md
                      font-bitter
                      text-sm
                      leading-6
                      text-neutral-600
                    "
                  >
                    {
                      activeMegaData.desc
                    }
                  </p>

                  <button
                    type="button"
                    onClick={(event) =>
                      handleNavClick(
                        activeMega,
                        event
                      )
                    }
                    className="
                      mt-5
                      inline-flex
                      items-center
                      gap-2
                      rounded-full
                      bg-green-200
                      px-4
                      py-2
                      font-bitter
                      text-sm
                      font-bold
                      text-green-950
                      transition
                      hover:-translate-y-0.5
                    "
                  >
                    Open {activeMega}

                    <span aria-hidden="true">
                      →
                    </span>
                  </button>
                </div>

                {/* Mega Content */}

                {activeMegaData.layout ===
                'cards' ? (
                  <div
                    className="
                      grid
                      grid-cols-2
                      gap-3
                      lg:grid-cols-4
                    "
                  >
                    {activeMegaData.cards.map(
                      (card) => (
                        <button
                          key={card.title}
                          type="button"
                          onClick={(event) =>
                            handleNavClick(
                              card.target,
                              event
                            )
                          }
                          className="
                            group
                            overflow-hidden
                            rounded-[1.35rem]
                            border
                            border-black/5
                            bg-neutral-50
                            text-left
                            shadow-[0_10px_26px_rgba(0,0,0,0.04)]
                            transition
                            hover:-translate-y-1
                            hover:bg-white
                            hover:shadow-[0_16px_34px_rgba(0,0,0,0.08)]
                          "
                        >
                          <div
                            className="
                              relative
                              h-32
                              overflow-hidden
                            "
                          >
                            <img
                              src={card.image}
                              alt={card.title}
                              className="
                                h-full
                                w-full
                                object-cover
                                transition
                                duration-500
                                group-hover:scale-110
                              "
                              loading="lazy"
                            />

                            <div
                              className="
                                absolute
                                inset-0
                                bg-gradient-to-t
                                from-black/60
                                via-black/10
                                to-transparent
                              "
                            />

                            <p
                              className="
                                absolute
                                bottom-3
                                left-3
                                rounded-full
                                bg-white/90
                                px-3
                                py-1
                                font-bitter
                                text-xs
                                font-bold
                                text-black
                                shadow-sm
                              "
                            >
                              {card.title}
                            </p>
                          </div>

                          <p
                            className="
                              p-3
                              font-bitter
                              text-xs
                              leading-5
                              text-neutral-600
                            "
                          >
                            {card.desc}
                          </p>
                        </button>
                      )
                    )}
                  </div>
                ) : (
                  <div
                    className="
                      grid
                      grid-cols-2
                      gap-3
                      lg:grid-cols-4
                    "
                  >
                    {activeMegaData.links.map(
                      (link) => (
                        <button
                          key={link.title}
                          type="button"
                          onClick={(event) =>
                            handleNavClick(
                              link.target,
                              event
                            )
                          }
                          className="
                            group
                            rounded-[1.35rem]
                            border
                            border-black/5
                            bg-neutral-50
                            p-4
                            text-left
                            shadow-[0_10px_26px_rgba(0,0,0,0.04)]
                            transition
                            hover:-translate-y-1
                            hover:bg-white
                            hover:shadow-[0_16px_34px_rgba(0,0,0,0.08)]
                          "
                        >
                          <p
                            className="
                              font-bitter
                              text-sm
                              font-bold
                              text-neutral-950
                            "
                          >
                            {link.title}
                          </p>

                          <p
                            className="
                              mt-2
                              font-bitter
                              text-xs
                              leading-5
                              text-neutral-600
                            "
                          >
                            {link.desc}
                          </p>

                          <span
                            className="
                              mt-3
                              inline-flex
                              rounded-full
                              bg-green-200
                              px-3
                              py-1
                              font-bitter
                              text-[10px]
                              font-bold
                              uppercase
                              tracking-[0.14em]
                              text-green-950
                              transition
                              group-hover:bg-neutral-950
                              group-hover:text-white
                            "
                          >
                            View
                          </span>
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* =========================================================
          MOBILE MENU
      ========================================================= */}

      {menuOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="
              fixed
              inset-0
              z-[9980]
              sm:hidden
            "
            onClick={() =>
              setMenuOpen(false)
            }
            onPointerDown={(event) =>
              event.stopPropagation()
            }
            onTouchStart={(event) =>
              event.stopPropagation()
            }
          >

            {/* Backdrop */}

            <div
              className="
                absolute
                inset-0
                bg-black/50
                backdrop-blur-md
              "
            />

            <div
              ref={mobilePanelRef}
              onClick={(event) =>
                event.stopPropagation()
              }
              onPointerDown={(event) =>
                event.stopPropagation()
              }
              onTouchStart={(event) =>
                event.stopPropagation()
              }
              className="
                absolute
                bottom-3
                left-0
                right-0
                top-[3.75rem]
                mx-auto
                w-full
                max-w-[calc(100dvw-1.25rem)]
                px-2.5
              "
            >
              <div
                ref={mobileMenuContentRef}
                className="
                  h-full
                  w-full
                  overflow-y-auto
                  rounded-[1.7rem]
                  border
                  border-white/10
                  bg-[#06164f]/88
                  p-3
                  shadow-[0_18px_45px_rgba(0,0,0,0.30)]
                  backdrop-blur-2xl
                "
                style={{
                  WebkitOverflowScrolling:
                    'touch',
                }}
              >

                {/* =================================================
                    MOBILE BRAND
                ================================================= */}

                <div
                  className="
                    relative
                    overflow-hidden
                    rounded-[1.35rem]
                    border
                    border-white/10
                    bg-white
                    p-4
                    backdrop-blur-xl
                  "
                >
                  <button
                    type="button"
                    onClick={() =>
                      setMenuOpen(false)
                    }
                    className="
                      absolute
                      right-3
                      top-3
                      flex
                      h-9
                      w-9
                      items-center
                      justify-center
                      rounded-full
                      border
                      border-white/12
                      bg-red-400
                      text-white/85
                      transition
                      hover:bg-white/12
                      hover:text-white
                    "
                    aria-label="Close menu"
                  >
                    <span
                      className="
                        relative
                        h-4
                        w-4
                      "
                      aria-hidden="true"
                    >
                      <span
                        className="
                          absolute
                          left-0
                          top-1/2
                          h-[2px]
                          w-full
                          -translate-y-1/2
                          rotate-45
                          rounded-full
                          bg-current
                        "
                      />

                      <span
                        className="
                          absolute
                          left-0
                          top-1/2
                          h-[2px]
                          w-full
                          -translate-y-1/2
                          -rotate-45
                          rounded-full
                          bg-current
                        "
                      />
                    </span>
                  </button>

                  <img
                    src="/assets/brand/logo-removebg.webp"
                    alt="Cape Frontier logo"
                    className="
                      block
                      h-24
                      w-auto
                      max-w-[230px]
                      object-contain
                      object-left
                    "
                  />

                  <div
                    className="
                      my-2
                      rounded-full
                      border
                      border-blue-600/20
                    "
                  />

                  <div
                    className="
                      flex
                      items-center
                      justify-center
                      text-center
                      gap-4
                    "
                  >
                    <p
                      className="
                        text-md
                        font-bitter
                        font-bold
                        
                      "
                    >
                      Affiliated to
                    </p>

                    {/* <img
                      src="/icons/handshake.webp"
                      alt="Handshake Icon"
                      className="
                        h-8
                        w-auto
                        max-w-[230px]
                        object-contain
                        object-left
                      "
                    /> */}

                    <img
                      src="/assets/brand/logo-love-ct-blue.webp"
                      alt="Love Cape Town"
                      className="
                        block
                        h-12
                        w-auto
                        max-w-[230px]
                        object-contain
                        object-left
                      "
                    />
                  </div>
                </div>

                {/* =================================================
                    MOBILE NAVIGATION
                ================================================= */}

                <nav
                  className="
                    mt-3
                    grid
                    gap-1.5
                  "
                  aria-label="Mobile navigation"
                >
                  {navItems
                    .filter(
                      (item) =>
                        item.label !==
                        'Contact'
                    )
                    .map((item) => (
                      <button
                        key={item.label}
                        type="button"
                        onClick={(event) =>
                          handleNavClick(
                            item.label,
                            event
                          )
                        }
                        className="
                          group
                          flex
                          w-full
                          items-center
                          justify-between
                          rounded-2xl
                          border
                          border-white/[0.08]
                          bg-white/[0.045]
                          px-4
                          py-3.5
                          text-left
                          backdrop-blur-md
                          transition
                          hover:border-white/14
                          hover:bg-white/[0.085]
                        "
                      >
                        <span
                          className="
                            font-frank
                            text-[1.45rem]
                            font-semibold
                            leading-none
                            tracking-[-0.01em]
                            text-white
                          "
                        >
                          {item.label}
                        </span>

                        <span
                          className="
                            flex
                            h-8
                            w-8
                            items-center
                            justify-center
                            rounded-full
                            bg-white/[0.08]
                            font-bitter
                            text-sm
                            font-black
                            text-white/78
                            transition
                            group-hover:bg-green-200
                            group-hover:text-blue-950
                          "
                        >
                          →
                        </span>
                      </button>
                    ))}
                </nav>

                {/* =================================================
                    BUSINESS INFO
                ================================================= */}

                <div
                  className="
                    mt-3
                    rounded-2xl
                    border
                    border-white/[0.08]
                    bg-white/[0.045]
                    p-3
                    backdrop-blur-lg
                  "
                >
                  <p
                    className="
                      font-bitter
                      text-[10px]
                      font-black
                      uppercase
                      tracking-[0.2em]
                      text-green-200
                    "
                  >
                    Business info
                  </p>

                  <div
                    className="
                      mt-3
                      grid
                      gap-2
                    "
                  >

                    {/* Location */}

                    <div
                      className="
                        flex
                        items-start
                        gap-2.5
                      "
                    >
                      <span
                        className="
                          mt-0.5
                          flex
                          h-7
                          w-7
                          shrink-0
                          items-center
                          justify-center
                          rounded-full
                          bg-white/[0.08]
                          text-green-200
                        "
                      >
                        <svg
                          className="h-3.5 w-3.5"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          aria-hidden="true"
                        >
                          <path d="M12 21s7-4.4 7-11a7 7 0 1 0-14 0c0 6.6 7 11 7 11Z" />

                          <circle
                            cx="12"
                            cy="10"
                            r="2.5"
                          />
                        </svg>
                      </span>

                      <div className="min-w-0">
                        <p
                          className="
                            font-bitter
                            text-xs
                            font-black
                            uppercase
                            tracking-[0.12em]
                            text-white/86
                          "
                        >
                          Cape Town based
                        </p>

                        <p
                          className="
                            mt-0.5
                            font-bitter
                            text-xs
                            leading-5
                            text-white/52
                          "
                        >
                          Guided Cape Town
                          routes, local
                          pickup support,
                          and manual
                          booking
                          confirmation.
                        </p>
                      </div>
                    </div>

                    {/* Secure booking */}

                    <div
                      className="
                        flex
                        items-start
                        gap-2.5
                      "
                    >
                      <span
                        className="
                          mt-0.5
                          flex
                          h-7
                          w-7
                          shrink-0
                          items-center
                          justify-center
                          rounded-full
                          bg-white/[0.08]
                          text-green-200
                        "
                      >
                        <svg
                          className="h-3.5 w-3.5"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          aria-hidden="true"
                        >
                          <path d="M20 7 10 17l-5-5" />
                        </svg>
                      </span>

                      <div className="min-w-0">
                        <p
                          className="
                            font-bitter
                            text-xs
                            font-black
                            uppercase
                            tracking-[0.12em]
                            text-white/86
                          "
                        >
                          Secure booking
                          flow
                        </p>

                        <p
                          className="
                            mt-0.5
                            font-bitter
                            text-xs
                            leading-5
                            text-white/52
                          "
                        >
                          Choose your
                          tour, confirm
                          your group, pay
                          online, then
                          receive
                          confirmation.
                        </p>
                      </div>
                    </div>

                  </div>
                </div>

                {/* =================================================
                    TERMS & POLICIES
                ================================================= */}

                <div
                  className="
                    mt-3
                    rounded-2xl
                    border
                    border-white/[0.08]
                    bg-white/[0.045]
                    p-3
                    backdrop-blur-lg
                  "
                >
                  <div
                    className="
                      flex
                      items-center
                      justify-between
                      gap-3
                    "
                  >
                    <p
                      className="
                        font-bitter
                        text-[10px]
                        font-black
                        uppercase
                        tracking-[0.2em]
                        text-green-200
                      "
                    >
                      Terms & policies
                    </p>

                    <button
                      type="button"
                      onClick={(event) =>
                        handleNavClick(
                          '/policies',
                          event
                        )
                      }
                      className="
                        rounded-full
                        bg-white/[0.08]
                        px-3
                        py-1
                        font-bitter
                        text-[10px]
                        font-black
                        uppercase
                        tracking-[0.12em]
                        text-white/72
                        transition
                        hover:bg-white/14
                        hover:text-white
                      "
                    >
                      Open all
                    </button>
                  </div>

                  <div
                    className="
                      mt-3
                      grid
                      grid-cols-2
                      gap-2
                    "
                  >
                    {[
                      [
                        'Booking',
                        '/policies#booking-policy',
                      ],
                      [
                        'Pickup',
                        '/policies#pickup-policy',
                      ],
                      [
                        'Payment',
                        '/policies#payment-policy',
                      ],
                      [
                        'Cancellation',
                        '/policies#cancellation-policy',
                      ],
                      [
                        'Reschedule',
                        '/policies#reschedule-policy',
                      ],
                      [
                        'Private tours',
                        '/policies#private-tour-policy',
                      ],
                    ].map(
                      ([label, target]) => (
                        <button
                          key={label}
                          type="button"
                          onClick={(event) =>
                            handleNavClick(
                              target,
                              event
                            )
                          }
                          className="
                            rounded-xl
                            border
                            border-white/[0.08]
                            bg-white/[0.045]
                            px-3
                            py-2
                            text-left
                            font-bitter
                            text-[11px]
                            font-black
                            uppercase
                            tracking-[0.09em]
                            text-white/68
                            transition
                            hover:bg-white/10
                            hover:text-white
                          "
                        >
                          {label}
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* =================================================
                    BOTTOM ACTIONS
                ================================================= */}

                <div
                  className="
                    mt-3
                    grid
                    grid-cols-2
                    gap-2
                    pb-1
                  "
                >
                  <button
                    type="button"
                    onClick={(event) =>
                      handleNavClick(
                        'Contact',
                        event
                      )
                    }
                    className="
                      flex
                      items-center
                      justify-center
                      gap-2
                      rounded-2xl
                      bg-white
                      px-4
                      py-3
                      font-bitter
                      text-xs
                      font-black
                      uppercase
                      tracking-[0.12em]
                      text-blue-950
                      transition
                      hover:bg-green-100
                    "
                  >
                    <img
                      src="/icons/faqBubble.png"
                      className="
                        h-5
                        w-5
                      "
                      alt=""
                      aria-hidden="true"
                    />

                    <span>
                      FAQ
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={(event) =>
                      handleNavClick(
                        'Contact',
                        event
                      )
                    }
                    className="
                      flex
                      items-center
                      justify-center
                      gap-2
                      rounded-2xl
                      bg-green-200
                      px-4
                      py-3
                      font-bitter
                      text-xs
                      font-black
                      uppercase
                      tracking-[0.12em]
                      text-green-950
                      transition
                      hover:bg-green-100
                    "
                  >
                    <span>
                      Contact
                    </span>

                    <span aria-hidden="true">
                      →
                    </span>
                  </button>
                </div>

              </div>
            </div>
          </div>,
          document.body
        )}

      {/* =========================================================
          GLOBAL NAVBAR STYLES
      ========================================================= */}

      <style>{`
        html,
        body,
        #root {
          overflow-x: hidden;
          max-width: 100%;
        }

        *,
        *::before,
        *::after {
          box-sizing: border-box;
        }
      `}</style>
    </>
  )
}

export default Navbar