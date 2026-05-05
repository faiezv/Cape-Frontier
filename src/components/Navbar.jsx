import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLocation, useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const navItems = [
  { label: 'Home' },
  { label: 'About' },
  { label: 'Stories' },
  { label: 'Tours' },
  { label: 'Contact' },
]

const sectionIdMap = {
  About: 'about',
  Stories: 'stories',
  Tours: 'tours',
  Contact: 'contact',
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
    logo: '/icons/navLogo.png',
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
        image: '/images/tours/adrenaline/shark-cage-diving/1.webp',
        target: 'Tours',
      },
      {
        title: 'Hiking',
        desc: 'Lion’s Head and Table Mountain routes with scenic viewpoints.',
        image: '/images/tours/hiking/lions-head/1.webp',
        target: 'Tours',
      },
      {
        title: 'Historical',
        desc: 'Robben Island and cultural routes with meaningful local context.',
        image: '/images/tours/historical/robben-island/1.webp',
        target: 'Tours',
      },
      {
        title: 'Packages',
        desc: 'Cape Peninsula and Stellenbosch wine farm full-day experiences.',
        image: '/images/tours/packages/peninsula-tour-1/cape-point/1.webp',
        target: 'Tours',
      },
    ],
  },
  Contact: {
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
      {
        title: 'Still to confirm',
        desc: 'Child pricing, same-day bookings, minimum advance time, and private tour fee.',
        target: '/policies#still-to-confirm',
      },
    ],
  },
}

const Navbar = () => {
  const navigate = useNavigate()
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
  const lastScrollY = useRef(0)

  const activeMegaData = activeMega ? megaMenus[activeMega] : null

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

  const scrollToTop = () => {
    scrollWindowTo(0)
  }

  const scrollToSection = (sectionId) => {
    if (!sectionId) return false

    const el = document.getElementById(sectionId)
    if (!el) return false

    /*
      This intentionally does NOT subtract navbar height.
      It places the section top at the viewport top.
      If the fixed navbar covers part of the section, add padding-top/scroll-mt
      on the section itself instead of changing this jump position.
    */
    const y = el.getBoundingClientRect().top + window.scrollY

    scrollWindowTo(y)

    return true
  }

  const openMega = (label, index) => {
    if (window.innerWidth < 768) return

    window.clearTimeout(megaCloseTimerRef.current)
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
    window.clearTimeout(megaCloseTimerRef.current)

    megaCloseTimerRef.current = window.setTimeout(() => {
      setActiveMega(null)
      setHoverIndex(null)
    }, 120)
  }

  const keepMegaOpen = () => {
    window.clearTimeout(megaCloseTimerRef.current)
  }

  const handleNavClick = (label, event) => {
    event?.preventDefault?.()
    event?.stopPropagation?.()

    setMenuOpen(false)
    setActiveMega(null)
    setActiveMobileMega(null)
    setHoverIndex(null)

    if (typeof label === 'string' && label.startsWith('/')) {
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
      const didScroll = scrollToSection(sectionId)
      if (didScroll) setPendingSection(null)
    })
  }

  const toggleMobileMega = (label, event) => {
    event?.preventDefault?.()
    event?.stopPropagation?.()

    if (label === 'Home') {
      handleNavClick(label, event)
      return
    }

    setActiveMobileMega((current) => (current === label ? null : label))
  }

  useEffect(() => {
    if (location.pathname !== '/' || !pendingSection) return

    const delays = [0, 80, 180, 350, 650, 950]

    const timers = delays.map((delay) =>
      window.setTimeout(() => {
        const didScroll = scrollToSection(pendingSection)
        if (didScroll) setPendingSection(null)
      }, delay)
    )

    return () => timers.forEach((timer) => window.clearTimeout(timer))
  }, [location.pathname, pendingSection])

  useEffect(() => {
    if (isCheckout || isBooking) return

    const onScroll = () => {
      if (!navbarRef.current) return

      const currentY = window.scrollY
      const reachedBottom =
        currentY + window.innerHeight >= document.documentElement.scrollHeight - 5

      if (reachedBottom && !menuOpen && !activeMega) {
        gsap.to(navbarRef.current, {
          y: '-100%',
          duration: 0.35,
          ease: 'power2.inOut',
        })

        return
      }

      if (currentY > lastScrollY.current && currentY > 80 && !menuOpen && !activeMega) {
        gsap.to(navbarRef.current, {
          y: '-100%',
          duration: 0.35,
          ease: 'power3.out',
        })
      } else {
        gsap.to(navbarRef.current, {
          y: '0%',
          duration: 0.28,
          ease: 'power3.out',
        })
      }

      lastScrollY.current = currentY
    }

    window.addEventListener('scroll', onScroll)

    return () => window.removeEventListener('scroll', onScroll)
  }, [isCheckout, isBooking, menuOpen, activeMega])

  useEffect(() => {
    if (!accentRef.current) return

    const tween = gsap.to(accentRef.current, {
      x: 14,
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    })

    return () => tween.kill()
  }, [])

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

  useEffect(() => {
    if (!activeMega || !megaPanelRef.current) return

    gsap.killTweensOf(megaPanelRef.current)

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

  useEffect(() => {
    if (!activeMobileMega || !mobileMenuContentRef.current) return

    const activePanel = mobileMenuContentRef.current.querySelector(
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

    window.addEventListener('resize', onResize)

    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
    setActiveMega(null)
    setActiveMobileMega(null)
    setHoverIndex(null)
  }, [location.pathname])

  useEffect(() => {
    return () => {
      window.clearTimeout(megaCloseTimerRef.current)
    }
  }, [])

  if (isCheckout || isBooking || isSuccess) return null

  return (
    <>
      <header
        ref={navbarRef}
        onMouseLeave={scheduleCloseMega}
        onMouseEnter={keepMegaOpen}
        className="fixed inset-x-0 top-0 z-[99990] w-screen max-w-[100dvw] overflow-x-clip border-white/10 bg-[linear-gradient(180deg,rgba(8,43,138,0.78)_0%,rgba(8,43,138,0.50)_100%)] text-white backdrop-blur-md"
      >
        <div className="mx-auto flex w-full max-w-[100dvw] min-w-0 items-center justify-between gap-1.5 px-2 py-2 sm:gap-3 sm:px-4 md:px-6 lg:px-8">
          <button
            type="button"
            onClick={(event) => handleNavClick('Home', event)}
            onMouseEnter={() => openMega('Home', 0)}
            className="flex min-w-0 flex-1 shrink items-center gap-2 overflow-hidden sm:gap-3"
          >
            <img
              className="h-11 max-w-[4.25rem] shrink-0 object-contain sm:h-10 sm:max-w-none md:h-12"
              src="/icons/navLogo.png"
              alt="Cape Frontier logo"
            />

            <div className="min-w-0 overflow-hidden text-left leading-none">
              <div className="hidden truncate text-[10px] font-black uppercase tracking-[0.22em] text-white/75 min-[430px]:block sm:text-[11px]">
                Cape Town
              </div>

              <div className="hidden truncate text-xs font-extrabold sm:inline sm:text-sm md:text-base">
                Travel and Tours
              </div>

              <div
                ref={accentRef}
                className="mt-1 hidden h-[2px] w-10 rounded-full bg-white/80 min-[430px]:block"
              />
            </div>
          </button>

          <nav className="hidden min-w-0 items-center gap-1 md:flex lg:gap-2">
            {navItems.map((item, index) => (
              <button
                key={item.label}
                type="button"
                onClick={(event) => handleNavClick(item.label, event)}
                onMouseEnter={() => openMega(item.label, index)}
                className="rounded-full px-3 py-2 text-sm font-bold text-white/90 transition-all duration-300 hover:bg-white/12 hover:text-white lg:px-4"
              >
                <span className="relative inline-flex items-center">
                  {item.label}

                  <span
                    className={`absolute -bottom-1 left-0 h-[2px] rounded-full bg-white transition-all duration-300 ${
                      hoverIndex === index ? 'w-full opacity-100' : 'w-0 opacity-0'
                    }`}
                  />
                </span>
              </button>
            ))}
          </nav>

          <div className="hidden shrink-0 items-center gap-2 sm:flex md:gap-3">
            <button
              type="button"
              onClick={() => setLanguage((prev) => (prev === 'EN' ? 'FR' : 'EN'))}
              className="flex items-center gap-2 rounded-full border border-white/14 bg-white/8 px-3 py-2 text-xs font-bold text-white/90 backdrop-blur-sm transition hover:bg-white/14"
            >
              <img
                src="/icons/globe.png"
                className="h-4 w-4 sm:h-5 sm:w-5"
                alt="Language"
              />

              <span>{language}</span>
            </button>

            <button
              type="button"
              onClick={(event) => handleNavClick('Contact', event)}
              onMouseEnter={() => openMega('Contact', navItems.length - 1)}
              className="flex items-center gap-2 rounded-full border border-white/14 bg-[linear-gradient(135deg,rgba(255,255,255,0.20)_0%,rgba(255,255,255,0.10)_100%)] px-3 py-2 text-xs font-extrabold text-white shadow-[0_8px_30px_rgba(0,0,0,0.16)] transition duration-300 hover:-translate-y-0.5 hover:bg-white/20"
            >
              <img
                src="/icons/faqBubble.png"
                className="h-4 w-4 sm:h-5 sm:w-5"
                alt="FAQ"
              />

              <span>FAQ</span>
            </button>
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:hidden">
            <button
              type="button"
              onClick={() => setLanguage((prev) => (prev === 'EN' ? 'FR' : 'EN'))}
              className="rounded-full border border-white/14 bg-white/8 px-2.5 py-2 text-xs font-bold text-white/90 backdrop-blur-sm"
            >
              {language}
            </button>

            <button
              type="button"
              aria-label="Toggle menu"
              onClick={(event) => {
                event.preventDefault()
                event.stopPropagation()
                setMenuOpen((prev) => !prev)
              }}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/14 bg-white/8 backdrop-blur-sm"
            >
              <div className="relative flex h-4 w-5 flex-col justify-between">
                <span
                  className={`block h-[2px] w-full rounded-full bg-white transition-all duration-300 ${
                    menuOpen ? 'translate-y-[7px] rotate-45' : ''
                  }`}
                />

                <span
                  className={`block h-[2px] w-full rounded-full bg-white transition-all duration-300 ${
                    menuOpen ? 'opacity-0' : 'opacity-100'
                  }`}
                />

                <span
                  className={`block h-[2px] w-full rounded-full bg-white transition-all duration-300 ${
                    menuOpen ? '-translate-y-[7px] -rotate-45' : ''
                  }`}
                />
              </div>
            </button>
          </div>
        </div>
      </header>

      {activeMegaData &&
        typeof document !== 'undefined' &&
        createPortal(
          <div className="pointer-events-none fixed inset-0 z-[99970] bg-black/30 backdrop-blur-[2px] md:block" />,
          document.body
        )}

      {activeMegaData &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={megaPanelRef}
            onMouseEnter={keepMegaOpen}
            onMouseLeave={scheduleCloseMega}
            className="fixed left-0 right-0 top-[4rem] z-[99980] hidden max-h-[calc(100dvh-4rem)] overflow-y-auto overscroll-contain border-y border-black/5 bg-white text-black shadow-[0_18px_45px_rgba(0,0,0,0.10)] md:block"
          >
            <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
              <div className="grid gap-5 lg:grid-cols-[0.68fr_1.32fr]">
                <div className="rounded-[1.5rem] border border-black/5 bg-neutral-50 p-5">
                  {activeMegaData.logo && (
                    <img
                      src={activeMegaData.logo}
                      alt="Cape Frontier logo"
                      className="mb-4 h-20 w-auto object-contain"
                    />
                  )}

                  <p className="font-bitter text-[10px] font-black uppercase tracking-[0.24em] text-blue-400">
                    {activeMegaData.eyebrow}
                  </p>

                  <h3 className="mt-2 font-frank text-4xl font-bold leading-none text-neutral-950">
                    {activeMegaData.title}
                  </h3>

                  <p className="mt-3 max-w-md font-bitter text-sm leading-6 text-neutral-600">
                    {activeMegaData.desc}
                  </p>

                  <button
                    type="button"
                    onClick={(event) => handleNavClick(activeMega, event)}
                    className="mt-5 inline-flex items-center gap-2 rounded-full bg-green-200 px-4 py-2 font-bitter text-sm font-bold text-green-950 transition hover:-translate-y-0.5"
                  >
                    Open {activeMega}
                    <span aria-hidden="true">→</span>
                  </button>
                </div>

                {activeMegaData.layout === 'cards' ? (
                  <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                    {activeMegaData.cards.map((card) => (
                      <button
                        key={card.title}
                        type="button"
                        onClick={(event) => handleNavClick(card.target, event)}
                        className="group overflow-hidden rounded-[1.35rem] border border-black/5 bg-neutral-50 text-left shadow-[0_10px_26px_rgba(0,0,0,0.04)] transition hover:-translate-y-1 hover:bg-white hover:shadow-[0_16px_34px_rgba(0,0,0,0.08)]"
                      >
                        <div className="relative h-32 overflow-hidden">
                          <img
                            src={card.image}
                            alt={card.title}
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                            loading="lazy"
                          />

                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                          <p className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 font-bitter text-xs font-bold text-black shadow-sm">
                            {card.title}
                          </p>
                        </div>

                        <p className="p-3 font-bitter text-xs leading-5 text-neutral-600">
                          {card.desc}
                        </p>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                    {activeMegaData.links.map((link) => (
                      <button
                        key={link.title}
                        type="button"
                        onClick={(event) => handleNavClick(link.target, event)}
                        className="group rounded-[1.35rem] border border-black/5 bg-neutral-50 p-4 text-left shadow-[0_10px_26px_rgba(0,0,0,0.04)] transition hover:-translate-y-1 hover:bg-white hover:shadow-[0_16px_34px_rgba(0,0,0,0.08)]"
                      >
                        <p className="font-bitter text-sm font-bold text-neutral-950">
                          {link.title}
                        </p>

                        <p className="mt-2 font-bitter text-xs leading-5 text-neutral-600">
                          {link.desc}
                        </p>

                        <span className="mt-3 inline-flex rounded-full bg-green-200 px-3 py-1 font-bitter text-[10px] font-bold uppercase tracking-[0.14em] text-green-950 transition group-hover:bg-neutral-950 group-hover:text-white">
                          View
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}

      {menuOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed inset-0 z-[99999] sm:hidden"
            onClick={() => setMenuOpen(false)}
            onPointerDown={(event) => event.stopPropagation()}
            onTouchStart={(event) => event.stopPropagation()}
          >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

            <div
              ref={mobilePanelRef}
              onClick={(event) => event.stopPropagation()}
              onPointerDown={(event) => event.stopPropagation()}
              onTouchStart={(event) => event.stopPropagation()}
              className="absolute bottom-3 left-0 right-0 top-[3.75rem] mx-auto w-full max-w-[calc(100dvw-1.25rem)] px-2.5"
            >
              <div
                ref={mobileMenuContentRef}
                className="h-full w-full overflow-y-auto overscroll-contain rounded-3xl border border-white/12 bg-[linear-gradient(180deg,rgba(4,27,95,0.98)_0%,rgba(7,41,130,0.96)_100%)] p-3 shadow-[0_18px_45px_rgba(0,0,0,0.28)] backdrop-blur-xl"
                style={{ WebkitOverflowScrolling: 'touch' }}
              >
                <div className="sticky top-0 z-10 mb-2 rounded-2xl border border-white/10 bg-[#041b5f]/95 p-3 backdrop-blur-xl">
                  <p className="font-bitter text-[10px] font-black uppercase tracking-[0.2em] text-green-200">
                    Menu
                  </p>
                  <p className="mt-1 font-frank text-2xl font-bold leading-none text-white">
                    Explore Cape Frontier
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  {navItems.map((item) => {
                    const data = megaMenus[item.label]
                    const isActive = activeMobileMega === item.label

                    return (
                      <div
                        key={item.label}
                        className="overflow-hidden rounded-2xl border border-white/10 bg-white/8"
                      >
                        <button
                          type="button"
                          onClick={(event) => toggleMobileMega(item.label, event)}
                          className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-bold text-white/92 transition hover:bg-white/10"
                        >
                          <span>{item.label}</span>

                          <span
                            className={`transition-transform duration-300 ${
                              isActive ? 'rotate-180' : 'rotate-0'
                            }`}
                          >
                            ↓
                          </span>
                        </button>

                        {isActive && data && (
                          <div
                            data-mobile-mega={item.label}
                            className="overflow-hidden border-t border-white/10 bg-white p-3 text-black"
                          >
                            {data.logo && (
                              <img
                                src={data.logo}
                                alt="Cape Frontier logo"
                                className="mb-3 h-16 w-auto object-contain"
                              />
                            )}

                            <p className="font-bitter text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">
                              {data.eyebrow}
                            </p>

                            <h3 className="mt-1 font-frank text-2xl font-bold leading-none text-neutral-950">
                              {data.title}
                            </h3>

                            <p className="mt-2 font-bitter text-xs leading-5 text-neutral-600">
                              {data.desc}
                            </p>

                            <button
                              type="button"
                              onClick={(event) => handleNavClick(item.label, event)}
                              className="mt-3 inline-flex rounded-full bg-green-200 px-4 py-2 font-bitter text-xs font-bold text-green-950"
                            >
                              Open {item.label}
                            </button>

                            {data.layout === 'cards' && (
                              <div className="mt-3 grid grid-cols-2 gap-2">
                                {data.cards.map((card) => (
                                  <button
                                    key={card.title}
                                    type="button"
                                    onClick={(event) => handleNavClick(card.target, event)}
                                    className="overflow-hidden rounded-2xl border border-black/5 bg-neutral-50 text-left"
                                  >
                                    <div className="relative h-24 overflow-hidden">
                                      <img
                                        src={card.image}
                                        alt={card.title}
                                        className="h-full w-full object-cover"
                                        loading="lazy"
                                      />
                                      <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
                                      <p className="absolute bottom-2 left-2 rounded-full bg-white/90 px-2 py-1 font-bitter text-[10px] font-bold text-black">
                                        {card.title}
                                      </p>
                                    </div>

                                    <p className="p-2 font-bitter text-[10px] leading-4 text-neutral-600">
                                      {card.desc}
                                    </p>
                                  </button>
                                ))}
                              </div>
                            )}

                            {data.layout === 'links' && (
                              <div className="mt-3 grid gap-2">
                                {data.links.map((link) => (
                                  <button
                                    key={link.title}
                                    type="button"
                                    onClick={(event) => handleNavClick(link.target, event)}
                                    className="rounded-2xl border border-black/5 bg-neutral-50 p-3 text-left"
                                  >
                                    <p className="font-bitter text-xs font-bold text-neutral-950">
                                      {link.title}
                                    </p>
                                    <p className="mt-1 font-bitter text-[10px] leading-4 text-neutral-600">
                                      {link.desc}
                                    </p>
                                  </button>
                                ))}
                              </div>
                            )}


                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

                <button
                  type="button"
                  onClick={(event) => handleNavClick('Contact', event)}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/14 bg-white/10 px-4 py-3 text-sm font-extrabold text-white transition hover:bg-white/14"
                >
                  <img src="/icons/faqBubble.png" className="h-5 w-5" alt="FAQ" />
                  <span>FAQ</span>
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

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