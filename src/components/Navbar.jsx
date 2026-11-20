import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLocation } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { useReducedMotion } from "framer-motion";
import { useTransitionMode } from "../utils/transitionMode.js";
import { LOGO_WHITE_DELAY, FALLBACK_TRANSITION } from "../transitions/index.js";

import { KidsActivitiesNavbar } from "../components/KidsActivitiesNavbar.jsx";
import { useLoadingNavigate } from "./useLoadingNavigate.jsx";
import { resolveImage } from "../utils/ImageLoader.js";

gsap.registerPlugin(ScrollTrigger);

// Updated to include a specific target path for Tours
const navItems = [
  { label: "Home", target: "Home", icon: "home" },
  { label: "About", target: "About", icon: "about" },
  { label: "Stories", target: "Stories", icon: "stories" },
  { label: "Gallery", target: "/gallery", icon: "gallery" },
  { label: "Tours", target: "/tours", icon: "tours" }, // Routes to /tours page
  { label: "FAQ", target: "/policies", icon: "faq" },
];

// Policy shortcuts shown in the mobile sidebar
const policyLinks = [
  ["Booking policy", "/policies#booking-policy"],
  ["Pickup policy", "/policies#pickup-policy"],
  ["Payment flow", "/policies#payment-policy"],
  ["Cancellations", "/policies#cancellation-policy"],
  ["Rescheduling", "/policies#reschedule-policy"],
  ["Private tours", "/policies#private-tour-policy"],
];

const LOGO_WHITE_MAX_SCROLL = 40; // px: past this the logo goes back to its normal colour
const LOGO_WHITE_MAX_DELAY = 0.15; // s: longest wait before the logo turns white
const LOGO_FADE_MS = 120; // logo colour transition (was 200ms)

const sectionIdMap = {
  About: "about",
  Stories: "stories",
  Gallery: "gallery",
  FAQ: "faq",
  Contact: "contact",
};

const megaMenus = {
  Home: {
    eyebrow: "Start here",
    title: "Cape Frontier Travel & Tours",
    desc: "Jump back to the main landing area, then explore stories, tours, and contact options from one place.",
    layout: "links",
    links: [
      {
        title: "Back to top",
        desc: "Return to the hero section.",
        target: "Home",
      },
      {
        title: "Popular tours",
        desc: "Move straight into featured routes.",
        target: "/tours",
      },
      {
        title: "Ask a question",
        desc: "Open the contact section for help.",
        target: "Contact",
      },
    ],
  },

  About: {
    eyebrow: "About Cape Frontier",
    title: "What makes the journey feel premium",
    desc: "A quick guide to the sections that explain the travel experience, local support, pickup flow, and booking process.",
    logo: "/assets/brand/logo-cf.webp",
    layout: "links",
    links: [
      {
        title: "Why Cape Frontier",
        desc: "Local insight, curated routes, and flexible planning.",
        target: "About",
      },
      {
        title: "Guided experience",
        desc: "Tours built around comfort, pacing, and storytelling.",
        target: "About",
      },
      {
        title: "Pickup support",
        desc: "Customers can request pickup from their accommodation.",
        target: "/tours",
      },
      {
        title: "Booking flow",
        desc: "Choose a tour, request the trip, and complete checkout.",
        target: "/tours",
      },
    ],
  },

  Stories: {
    eyebrow: "Traveller stories",
    title: "Reviews, moments, and route highlights",
    desc: "See what guests enjoyed, from scenic stops and wine farms to guided adventure experiences.",
    layout: "links",
    links: [
      {
        title: "Guest reviews",
        desc: "Read verified traveller-style feedback.",
        target: "Stories",
      },
      {
        title: "Cape moments",
        desc: "Scenic route highlights and memorable stops.",
        target: "Stories",
      },
      {
        title: "Adventure notes",
        desc: "See how the day feels from start to finish.",
        target: "/tours",
      },
      {
        title: "Travel confidence",
        desc: "Helpful guidance before booking.",
        target: "Contact",
      },
    ],
  },

  Tours: {
    eyebrow: "Browse tours",
    title: "Choose your Cape Town experience",
    desc: "Explore routes by category. Each card opens the tours section where users can preview details and request a trip.",
    layout: "cards",
    ctaTarget: "/tours", // Ensures the "Open Tours" button at the bottom works
    cards: [
      {
        title: "Adrenaline",
        desc: "Shark cage diving, paragliding, snorkelling, and guided thrill experiences.",
        image: resolveImage(
          "/src/assets/images/tours/adrenaline/shark-cage-diving/1.webp",
        ),
        target: "/tours",
      },
      {
        title: "Hiking",
        desc: "Lion’s Head and Table Mountain routes with scenic viewpoints.",
        image: resolveImage(
          "/src/assets/images/tours/hiking/lions-head/1.webp",
        ),
        target: "/tours",
      },
      {
        title: "Historical",
        desc: "Robben Island and cultural routes with meaningful local context.",
        image: resolveImage("/src/assets/images/tours/historical/langa/2.webp"),
        target: "/tours",
      },
      {
        title: "Packages",
        desc: "Cape Peninsula and Stellenbosch wine farm full-day experiences.",
        image: resolveImage(
          "/src/assets/images/tours/packages/3-day-garden-route/960px-Harbour_-_Knysna,_South_Af.webp",
        ),
        target: "/tours",
      },
    ],
  },

  FAQ: {
    eyebrow: "Cape Frontier policies",
    title: "Before you book",
    desc: "Quick policy links for booking, pickup, payments, cancellations, private tours, and vehicle arrangements. Final details are confirmed manually by Cape Frontier.",
    ctaLabel: "Policies",
    ctaTarget: "/policies",
    layout: "links",
    links: [
      {
        title: "Booking policy",
        desc: "Guests book for their own group size, and checkout participants must match their party.",
        target: "/policies#booking-policy",
      },
      {
        title: "Pickup policy",
        desc: "Pickup is included unless stated otherwise and confirmed manually after booking.",
        target: "/policies#pickup-policy",
      },
      {
        title: "Payment flow",
        desc: "Select tour, complete booking form, pay online, then receive confirmation.",
        target: "/policies#payment-policy",
      },
      {
        title: "Cancellations",
        desc: "Refunds and penalties depend on timing, with weather options handled separately.",
        target: "/policies#cancellation-policy",
      },
      {
        title: "Rescheduling",
        desc: "Reschedules depend on availability and Cape Frontier confirmation.",
        target: "/policies#reschedule-policy",
      },
      {
        title: "Private tours",
        desc: "Private tours have an extra per-vehicle fee and exclude entrance fees unless stated.",
        target: "/policies#private-tour-policy",
      },
      {
        title: "Vehicles",
        desc: "Cape Frontier decides vehicle size based on group size and operational needs.",
        target: "/policies#vehicle-policy",
      },
    ],
  },
};

// --------------------------------------------------
// SIDEBAR ICONS
// --------------------------------------------------

const SidebarIcon = ({ name }) => {
  const paths = {
    home: (
      <>
        <path d="M3 11.5 12 4l9 7.5" />
        <path d="M5 10v10h14V10" />
      </>
    ),
    about: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v5M12 8h.01" />
      </>
    ),
    stories: (
      <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z" />
    ),
    gallery: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="3" />
        <circle cx="9" cy="10" r="1.5" />
        <path d="m4 18 5-5 4 4 3-3 4 4" />
      </>
    ),
    tours: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="m15.5 8.5-2 5-5 2 2-5z" />
      </>
    ),
    faq: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M9.5 9.5a2.5 2.5 0 1 1 3.6 2.2c-.7.4-1.1.9-1.1 1.8M12 17h.01" />
      </>
    ),
    contact: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="3" />
        <path d="m4 7 8 6 8-6" />
      </>
    ),
  };

  return (
    <svg
      className="h-[18px] w-[18px] shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
};

// --------------------------------------------------
// COLLAPSE (smoothly shrinks a navbar group to nothing)
// --------------------------------------------------

const COLLAPSE_MS = 500;
const COLLAPSE_DELAY_MS = 150; // slight delay so it follows the page swap
const COLLAPSE_EASE = "cubic-bezier(0.65, 0, 0.35, 1)";

const Collapse = ({
  open,
  display = "grid",
  alwaysOpenOnMd = false,
  pad = "none",
  children,
}) => {
  // "settled" = fully open and idle. Overflow is only clipped while moving,
  // so shadows and hover lifts aren't cut off once the group is open.
  const [settled, setSettled] = useState(open);

  useEffect(() => {
    const t = setTimeout(
      () => setSettled(open),
      open ? COLLAPSE_DELAY_MS + COLLAPSE_MS + 100 : COLLAPSE_DELAY_MS,
    );
    return () => clearTimeout(t);
  }, [open]);

  const state = open
    ? "grid-cols-[1fr] opacity-100 visible"
    : alwaysOpenOnMd
      ? "grid-cols-[0fr] opacity-0 invisible md:grid-cols-[1fr] md:opacity-100 md:visible"
      : "grid-cols-[0fr] opacity-0 invisible";

  const overflow =
    open && settled
      ? "overflow-visible"
      : alwaysOpenOnMd
        ? "overflow-hidden md:overflow-visible"
        : "overflow-hidden";

  const padding =
    pad === "right" ? "pr-2 lg:pr-3" : pad === "left" ? "pl-2 lg:pl-3" : "";

  return (
    <div
      className={`${display} shrink-0 ${state}`}
      style={{
        transition: [
          `grid-template-columns ${COLLAPSE_MS}ms ${COLLAPSE_EASE} ${COLLAPSE_DELAY_MS}ms`,
          `opacity ${COLLAPSE_MS * 0.6}ms ease ${COLLAPSE_DELAY_MS}ms`,
          `visibility ${COLLAPSE_MS}ms linear ${COLLAPSE_DELAY_MS}ms`,
        ].join(", "),
      }}
    >
      <div className={`flex min-w-0 items-center ${overflow}`}>
        <div className={`flex shrink-0 items-center ${padding}`}>
          {children}
        </div>
      </div>
    </div>
  );
};

const Navbar = ({ displayedPath }) => {
  const navigate = useLoadingNavigate();
  const location = useLocation();
  const shownPath = displayedPath ?? location.pathname;
  const onToursNow =
    location.pathname === "/tours" || location.pathname === "/gallery";

  const mode = useTransitionMode();
  const reduceMotion = useReducedMotion();
  const logoWhiteDelay =
    LOGO_WHITE_DELAY[reduceMotion ? FALLBACK_TRANSITION : mode] ??
    LOGO_WHITE_DELAY[FALLBACK_TRANSITION];

  const [pastTop, setPastTop] = useState(false);

  useEffect(() => {
    const update = () => setPastTop(window.scrollY > LOGO_WHITE_MAX_SCROLL);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [location.pathname]);

  const whiteLogo = onToursNow && !pastTop;
  const logoDelay = whiteLogo
    ? Math.min(logoWhiteDelay, LOGO_WHITE_MAX_DELAY)
    : 0;

  // On /tours and /gallery the navbar turns white once scrolled, so the
  // hamburger switches to dark bars there to stay visible.
  const darkBurger = onToursNow && pastTop;

  const isCheckout = shownPath === "/checkout";
  const isBooking = shownPath === "/booking";
  const isSuccess = shownPath === "/success";
  const isTours = shownPath === "/tours" || shownPath.startsWith("/tours/");

  const [menuOpen, setMenuOpen] = useState(false);
  const [hoverIndex, setHoverIndex] = useState(null);
  const [pendingSection, setPendingSection] = useState(null);
  const [activeMega, setActiveMega] = useState(null);

  const navbarRef = useRef(null);
  const accentRef = useRef(null);
  const mobilePanelRef = useRef(null);
  const mobileBackdropRef = useRef(null);
  const megaPanelRef = useRef(null);
  const megaCloseTimerRef = useRef(null);

  const activeMegaData = activeMega ? megaMenus[activeMega] : null;

  // --------------------------------------------------
  // AFFILIATION REFS
  // --------------------------------------------------

  const affiliationRef = useRef(null);
  const affiliationTextRef = useRef(null);
  const affiliationHandshakeRef = useRef(null);
  const affiliationLogoRef = useRef(null);
  const affiliationGlowRef = useRef(null);

  // --------------------------------------------------
  // MAIN LOGO
  // --------------------------------------------------

  const mainLogoRef = useRef(null);

  const scrollWindowTo = (y) => {
    const targetY = Math.max(0, y);

    ScrollTrigger.refresh();

    if (window.lenis) {
      window.lenis.scrollTo(targetY, {
        duration: 1,
        force: true,
      });
      return;
    }

    window.scrollTo({
      top: targetY,
      behavior: "smooth",
    });
  };

  const scrollToTop = () => scrollWindowTo(0);

  const scrollToSection = (sectionId) => {
    if (!sectionId) return false;

    const el = document.getElementById(sectionId);

    if (!el) return false;

    const y = el.getBoundingClientRect().top + window.scrollY;

    scrollWindowTo(y);

    return true;
  };

  // --------------------------------------------------
  // DESKTOP MEGA MENU
  // --------------------------------------------------

  const openMega = (label, index) => {
    if (window.innerWidth < 768) return;

    window.clearTimeout(megaCloseTimerRef.current);

    setHoverIndex(index);
    setActiveMega(label);

    if (navbarRef.current) {
      gsap.to(navbarRef.current, {
        y: "0%",
        duration: 0.18,
        ease: "power2.out",
      });
    }
  };

  const scheduleCloseMega = () => {
    window.clearTimeout(megaCloseTimerRef.current);

    megaCloseTimerRef.current = window.setTimeout(() => {
      setActiveMega(null);
      setHoverIndex(null);
    }, 120);
  };

  const keepMegaOpen = () => {
    window.clearTimeout(megaCloseTimerRef.current);
  };

  // --------------------------------------------------
  // MOBILE SIDEBAR OPEN / CLOSE
  // --------------------------------------------------

  const closeMenu = () => {
    const panel = mobilePanelRef.current;
    const backdrop = mobileBackdropRef.current;

    if (!panel || reduceMotion) {
      setMenuOpen(false);
      return;
    }

    gsap.to(backdrop, { opacity: 0, duration: 0.2, ease: "power1.out" });
    gsap.to(panel, {
      xPercent: -100,
      duration: 0.24,
      ease: "power2.in",
      onComplete: () => setMenuOpen(false),
    });
  };

  const toggleMenu = () => {
    if (menuOpen) closeMenu();
    else setMenuOpen(true);
  };

  // --------------------------------------------------
  // NAVIGATION
  // --------------------------------------------------

  const handleNavClick = (label, event) => {
    event?.preventDefault?.();
    event?.stopPropagation?.();

    setMenuOpen(false);
    setActiveMega(null);
    setHoverIndex(null);

    // Check for explicit path routes (like /tours)
    if (typeof label === "string" && label.startsWith("/")) {
      setPendingSection(null);
      navigate(label);
      return;
    }

    if (label === "Home") {
      setPendingSection(null);

      if (location.pathname !== "/") {
        navigate("/", {
          state: {
            scrollTo: "top",
          },
        });

        return;
      }

      scrollToTop();
      return;
    }

    const sectionId = sectionIdMap[label];

    if (!sectionId) return;

    setPendingSection(sectionId);

    if (location.pathname !== "/") {
      navigate("/", {
        state: {
          scrollTo: sectionId,
        },
      });

      return;
    }

    requestAnimationFrame(() => {
      const didScroll = scrollToSection(sectionId);

      if (didScroll) {
        setPendingSection(null);
      }
    });
  };

  // Highlights the current page in the sidebar.
  const isItemActive = (target) => {
    if (target === "Home") return shownPath === "/";
    if (target.startsWith("/")) {
      return shownPath === target || shownPath.startsWith(`${target}/`);
    }
    return false;
  };

  // --------------------------------------------------
  // PENDING SECTION SCROLL
  // --------------------------------------------------

  useEffect(() => {
    if (shownPath !== "/" || !pendingSection) return;

    const delays = [0, 80, 180, 350, 650, 950];

    const timers = delays.map((delay) =>
      window.setTimeout(() => {
        const didScroll = scrollToSection(pendingSection);

        if (didScroll) {
          setPendingSection(null);
        }
      }, delay),
    );

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [shownPath, pendingSection]);

  // --------------------------------------------------
  // ACCENT ANIMATION
  // --------------------------------------------------

  useEffect(() => {
    if (!accentRef.current) return;

    const tween = gsap.to(accentRef.current, {
      x: 14,
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });

    return () => tween.kill();
  }, []);

  // --------------------------------------------------
  // MOBILE SIDEBAR: slide in, lock scroll, Escape to close
  // --------------------------------------------------

  useEffect(() => {
    if (!menuOpen) return undefined;

    if (navbarRef.current) {
      gsap.to(navbarRef.current, {
        y: "0%",
        duration: 0.2,
        ease: "power2.out",
      });
    }

    if (mobilePanelRef.current && mobileBackdropRef.current) {
      if (reduceMotion) {
        gsap.set(mobilePanelRef.current, { xPercent: 0 });
        gsap.set(mobileBackdropRef.current, { opacity: 1 });
      } else {
        gsap.fromTo(
          mobilePanelRef.current,
          { xPercent: -100 },
          { xPercent: 0, duration: 0.3, ease: "power3.out" },
        );
        gsap.fromTo(
          mobileBackdropRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.25, ease: "power1.out" },
        );
      }
    }

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.lenis?.stop?.();

    const onKey = (e) => {
      if (e.key === "Escape") closeMenu();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.lenis?.start?.();
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menuOpen]);

  // --------------------------------------------------
  // DESKTOP MEGA ANIMATION
  // --------------------------------------------------

  useEffect(() => {
    if (!activeMega || !megaPanelRef.current) {
      return;
    }

    gsap.killTweensOf(megaPanelRef.current);

    gsap.fromTo(
      megaPanelRef.current,
      {
        opacity: 0,
        y: -10,
        scale: 0.985,
        filter: "blur(4px)",
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: "blur(0px)",
        duration: 0.24,
        ease: "power2.out",
      },
    );
  }, [activeMega]);

  // --------------------------------------------------
  // RESIZE
  // --------------------------------------------------

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 640) {
        setMenuOpen(false);
      }

      if (window.innerWidth < 768) {
        setActiveMega(null);
        setHoverIndex(null);
      }
    };

    window.addEventListener("resize", onResize);

    return () => window.removeEventListener("resize", onResize);
  }, []);

  // --------------------------------------------------
  // ROUTE CHANGE
  // --------------------------------------------------

  useEffect(() => {
    setMenuOpen(false);
    setActiveMega(null);
    setHoverIndex(null);
  }, [location.pathname]);

  useEffect(() => {
    return () => {
      window.clearTimeout(megaCloseTimerRef.current);
    };
  }, []);

  // --------------------------------------------------
  // MAIN LOGO HOVER
  // --------------------------------------------------

  const animateMainLogoIn = () => {
    if (!mainLogoRef.current) return;

    gsap.killTweensOf(mainLogoRef.current);

    gsap.to(mainLogoRef.current, {
      scale: 1.045,
      y: -1,
      duration: 0.35,
      ease: "power3.out",
    });
  };

  const animateMainLogoOut = () => {
    if (!mainLogoRef.current) return;

    gsap.killTweensOf(mainLogoRef.current);

    gsap.to(mainLogoRef.current, {
      scale: 1,
      y: 0,
      duration: 0.3,
      ease: "power3.out",
    });
  };

  // --------------------------------------------------
  // AFFILIATION ANIMATION
  // --------------------------------------------------

  const animateAffiliationIn = () => {
    if (!affiliationRef.current) return;

    gsap.killTweensOf([
      affiliationRef.current,
      affiliationTextRef.current,
      affiliationHandshakeRef.current,
      affiliationLogoRef.current,
      affiliationGlowRef.current,
    ]);

    const textWidth = affiliationTextRef.current?.scrollWidth || 0;

    gsap.to(affiliationTextRef.current, {
      width: textWidth,
      opacity: 1,
      x: 0,
      letterSpacing: "0.14em",
      duration: 0.45,
      ease: "power3.out",
    });

    gsap.to(affiliationRef.current, {
      scale: 1.04,
      y: -2,
      duration: 0.45,
      ease: "power3.out",
    });

    gsap.to(affiliationHandshakeRef.current, {
      rotate: 12,
      scale: 1.18,
      duration: 0.25,
      ease: "power2.out",
      yoyo: true,
      repeat: 1,
    });

    gsap.to(affiliationLogoRef.current, {
      scale: 1.1,
      x: 2,
      duration: 0.55,
      ease: "back.out(2)",
    });

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
        ease: "power2.inOut",
      },
    );
  };

  const animateAffiliationOut = () => {
    if (!affiliationRef.current) return;

    gsap.killTweensOf([
      affiliationRef.current,
      affiliationTextRef.current,
      affiliationHandshakeRef.current,
      affiliationLogoRef.current,
      affiliationGlowRef.current,
    ]);

    gsap.to(affiliationTextRef.current, {
      width: 0,
      opacity: 0,
      x: -6,
      duration: 0.3,
      ease: "power3.inOut",
    });

    gsap.to(affiliationRef.current, {
      scale: 1,
      y: 0,
      duration: 0.35,
      ease: "power3.out",
    });

    gsap.to(affiliationHandshakeRef.current, {
      rotate: 0,
      scale: 1,
      duration: 0.3,
      ease: "power3.out",
    });

    gsap.to(affiliationLogoRef.current, {
      scale: 1,
      x: 0,
      duration: 0.35,
      ease: "power3.out",
    });

    gsap.to(affiliationGlowRef.current, {
      opacity: 0,
      duration: 0.2,
      ease: "power2.out",
    });
  };

  if (isCheckout || isBooking || isSuccess) {
    return null;
  }

  const burgerBar = darkBurger ? "bg-blue-700" : "bg-white";

  return (
    <>
      {/* =========================================================
          NAVBAR
      ========================================================= */}

      <header
        ref={navbarRef}
        className={`fixed inset-x-0 top-0 z-[9990] w-screen max-w-[100dvw] overflow-x-clip border-white/10 backdrop-blur-xl transition-opacity duration-200 ${
          menuOpen
            ? "pointer-events-none opacity-0 sm:pointer-events-auto sm:opacity-100"
            : "opacity-100"
        }`}
      >
        <div className="mx-auto flex w-full max-w-[100dvw] min-w-0 items-center gap-3 px-3 py-2 sm:px-4 md:px-6 lg:px-8">
          {/* =====================================================
              MAIN LOGO
              Follows the real route immediately. Leaving /tours it
              recolours before the curtain; entering /tours it waits
              until the new page is being revealed.
          ===================================================== */}

          <a
            href="/"
            aria-label="Cape Frontier Travel & Tours"
            onClick={(event) => handleNavClick("Home", event)}
            onMouseEnter={animateMainLogoIn}
            onMouseLeave={animateMainLogoOut}
            className="group relative flex shrink-0 items-center justify-center overflow-visible"
          >
            <img
              ref={mainLogoRef}
              src="/assets/brand/logo-cf.webp"
              alt="Cape Frontier Travel & Tours"
              fetchPriority="high"
              loading="eager"
              decoding="async"
              className={`block h-14 w-auto max-w-[220px] shrink-0 object-contain object-center transition-[filter] duration-200 sm:h-16 sm:max-w-[235px] lg:h-[68px] lg:max-w-[250px] ${
                whiteLogo ? "brightness-0 invert" : ""
              }`}
              style={{
                transition: `filter ${LOGO_FADE_MS}ms ease-out ${logoDelay}s`,
              }}
            />
          </a>

          {/* =====================================================
              RIGHT SIDE: every group collapses on /tours except kids
              and the mobile hamburger
          ===================================================== */}

          <div className="ml-auto flex min-w-0 items-center">
            {/* AFFILIATION */}
            <Collapse open={!isTours} display="hidden md:grid" pad="right">
              <div
                ref={affiliationRef}
                className="group relative flex shrink-0 items-center rounded-full duration-300 hover:bg-white"
                onMouseEnter={animateAffiliationIn}
                onMouseLeave={animateAffiliationOut}
              >
                <div className="mr-1 h-8 w-px shrink-0 bg-gradient-to-b from-transparent via-white/30 to-transparent" />

                <a
                  href="https://www.capetown.travel"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Cape Town Tourism"
                  className="relative flex items-center gap-2 overflow-hidden rounded-full border border-white/10 bg-white/[0.055] px-2.5 py-1 shadow-[0_8px_30px_rgba(0,0,0,0.12)] backdrop-blur-xl transition-colors duration-300 hover:border-white/25 hover:bg-white/[0.10]"
                >
                  {/* Animated light sweep */}
                  <span
                    ref={affiliationGlowRef}
                    className="pointer-events-none absolute -inset-y-4 left-0 w-8 -skew-x-12 bg-white/30 opacity-0 blur-md"
                  />

                  {/* In affiliation with */}
                  <span
                    ref={affiliationTextRef}
                    className="text-md relative z-10 block shrink-0 overflow-hidden whitespace-nowrap font-frank font-bold text-blue-600"
                    style={{ width: 0, opacity: 0 }}
                  >
                    Affiliation {'"Love Cape Town"'}
                  </span>

                  {/* Handshake */}
                  <span
                    ref={affiliationHandshakeRef}
                    className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/[0.08]"
                  >
                    <img
                      src="/icons/handshake.webp"
                      className="h-4.5 w-4.5 object-contain"
                      alt=""
                      aria-hidden="true"
                    />
                  </span>

                  {/* Love Cape Town */}
                  <img
                    ref={affiliationLogoRef}
                    src="/assets/brand/logo-love-ct-blue.webp"
                    className="relative z-10 h-8 w-auto shrink-0 object-contain opacity-90"
                    alt="Love Cape Town"
                  />
                </a>
              </div>
            </Collapse>

            {/* DESKTOP NAV PILL */}
            <Collapse open={!isTours} display="hidden md:grid" pad="right">
              <nav
                className="flex shrink-0 items-center gap-1 rounded-full bg-blue-600 px-4 shadow-[0_8px_30px_rgba(0,0,0,0.16)] lg:gap-2 lg:px-8"
                aria-label="Desktop navigation"
              >
                {navItems.map((item, index) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={(event) => handleNavClick(item.target, event)}
                    onMouseEnter={() => openMega(item.label, index)}
                    onMouseLeave={scheduleCloseMega}
                    className="rounded-full px-2.5 py-2 text-sm font-bold text-white transition-all duration-300 hover:bg-white/20 hover:text-white lg:px-4"
                  >
                    <span className="relative inline-flex items-center">
                      {item.label}

                      <span
                        className={`absolute -bottom-1 left-0 h-[2px] rounded-full bg-white transition-all duration-300 ${
                          hoverIndex === index
                            ? "w-full opacity-100"
                            : "w-0 opacity-0"
                        }`}
                      />
                    </span>
                  </button>
                ))}
              </nav>
            </Collapse>

            {/* KIDS ACTIVITIES
                Open on /tours at every size. Off /tours it is open on
                desktop and collapsed on mobile (as before). */}
            <Collapse open={isTours} alwaysOpenOnMd>
              <div className="shrink-0">
                <KidsActivitiesNavbar />
              </div>
            </Collapse>

            {/* CONTACT */}
            <Collapse open={!isTours} display="hidden md:grid" pad="left">
              <button
                type="button"
                onClick={() => {
                  const contact = document.querySelector("#contact");

                  if (!contact) return;

                  contact.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
                }}
                className="flex shrink-0 items-center gap-2 rounded-full border border-white/14 bg-white px-3 py-1 text-xs font-extrabold text-blue-600 shadow-[0_8px_30px_rgba(0,0,0,0.16)] transition duration-300 hover:-translate-y-0.5 hover:bg-green"
              >
                <img
                  src="/icons/faqBlue.png"
                  className="h-4 w-4 sm:h-5 sm:w-5"
                  alt="CONTACT"
                />

                <span>Contact</span>
              </button>
            </Collapse>

            {/* MOBILE MENU BUTTON
                Always visible on mobile, including /tours where it sits
                to the right of Kids Activities. */}
            <Collapse open display="grid sm:hidden" pad="left">
              <button
                type="button"
                aria-label="Open menu"
                aria-expanded={menuOpen}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  toggleMenu();
                }}
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border backdrop-blur-sm transition-colors duration-200 ${
                  darkBurger
                    ? "border-blue-700/25 bg-blue-700/10"
                    : "border-white/14 bg-white/8"
                }`}
              >
                <div className="relative flex h-4 w-5 flex-col justify-between">
                  <span
                    className={`block h-[2px] w-full rounded-full transition-all duration-300 ${burgerBar}`}
                  />
                  <span
                    className={`block h-[2px] w-full rounded-full transition-all duration-300 ${burgerBar}`}
                  />
                  <span
                    className={`block h-[2px] w-full rounded-full transition-all duration-300 ${burgerBar}`}
                  />
                </div>
              </button>
            </Collapse>
          </div>
        </div>
      </header>

      {/* =========================================================
          DESKTOP BACKDROP
      ========================================================= */}

      {!isTours &&
        activeMegaData &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="pointer-events-none fixed inset-0 z-[9970] bg-black/30 backdrop-blur-[2px] md:block" />,
          document.body,
        )}

      {/* =========================================================
          DESKTOP MEGA PANEL
      ========================================================= */}

      {!isTours &&
        activeMegaData &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={megaPanelRef}
            onMouseEnter={keepMegaOpen}
            onMouseLeave={scheduleCloseMega}
            className="fixed left-0 right-0 top-[5rem] z-[9980] hidden max-h-[calc(100dvh-4rem)] overflow-y-auto overscroll-contain border-y border-black/5 bg-linear-to-b from-white to-0% text-black shadow-[0_18px_45px_rgba(0,0,0,0.10)] md:block"
          >
            <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
              <div className="grid gap-5 lg:grid-cols-[0.68fr_1.32fr]">
                {/* Intro */}

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
                    onClick={(event) =>
                      handleNavClick(
                        activeMegaData.ctaTarget ?? activeMega,
                        event,
                      )
                    }
                    className="mt-5 inline-flex items-center gap-2 rounded-full bg-green-200 px-4 py-2 font-bitter text-sm font-bold text-green-950 transition hover:-translate-y-0.5"
                  >
                    Open {activeMegaData.ctaLabel ?? activeMega}
                    <span aria-hidden="true">→</span>
                  </button>
                </div>

                {/* Mega Content */}

                {activeMegaData.layout === "cards" ? (
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
          document.body,
        )}

      {/* =========================================================
          MOBILE SIDEBAR (Claude-style slide-in drawer)
          Available on every page, including /tours.
      ========================================================= */}

      {menuOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-[9995] sm:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
          >
            {/* Backdrop */}
            <div
              ref={mobileBackdropRef}
              onClick={closeMenu}
              className="absolute inset-0 bg-black/40"
            />

            {/* Drawer */}
            <aside
              ref={mobilePanelRef}
              className="absolute inset-y-0 left-0 flex w-[86%] max-w-[21rem] flex-col border-r border-black/[0.06] bg-[#F5F4ED] pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)] text-neutral-900 shadow-[8px_0_40px_rgba(0,0,0,0.18)]"
            >
              {/* Header: logo + close */}
              <div className="flex items-center justify-between gap-2 px-4 pb-2 pt-3">
                <button
                  type="button"
                  onClick={(event) => handleNavClick("Home", event)}
                  aria-label="Cape Frontier home"
                  className="flex min-w-0 items-center"
                >
                  <img
                    src="/assets/brand/logo-cf.webp"
                    alt="Cape Frontier Travel & Tours"
                    className="block h-12 w-auto max-w-[190px] object-contain object-left"
                  />
                </button>

                <button
                  type="button"
                  onClick={closeMenu}
                  autoFocus
                  aria-label="Close menu"
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-neutral-600 transition hover:bg-black/[0.06] hover:text-neutral-900"
                >
                  <span className="relative block h-4 w-4" aria-hidden="true">
                    <span className="absolute left-0 top-1/2 h-[2px] w-full -translate-y-1/2 rotate-45 rounded-full bg-current" />
                    <span className="absolute left-0 top-1/2 h-[2px] w-full -translate-y-1/2 -rotate-45 rounded-full bg-current" />
                  </span>
                </button>
              </div>

              {/* Primary action */}
              <div className="px-3 pb-2 pt-1">
                <button
                  type="button"
                  onClick={(event) => handleNavClick("/tours", event)}
                  className="flex w-full items-center gap-2.5 rounded-xl bg-blue-600 px-3.5 py-2.5 font-bitter text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.99]"
                >
                  <SidebarIcon name="tours" />
                  Browse tours
                </button>
              </div>

              {/* Scrollable body */}
              <div
                className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-3"
                style={{ WebkitOverflowScrolling: "touch" }}
              >
                {/* Navigation */}
                <nav className="grid gap-0.5 pt-1" aria-label="Mobile navigation">
                  {navItems.map((item) => {
                    const active = isItemActive(item.target);

                    return (
                      <button
                        key={item.label}
                        type="button"
                        onClick={(event) => handleNavClick(item.target, event)}
                        aria-current={active ? "page" : undefined}
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left font-bitter text-[15px] transition ${
                          active
                            ? "bg-black/[0.07] font-bold text-neutral-950"
                            : "font-medium text-neutral-700 hover:bg-black/[0.045] hover:text-neutral-950"
                        }`}
                      >
                        <span
                          className={active ? "text-blue-600" : "text-neutral-500"}
                        >
                          <SidebarIcon name={item.icon} />
                        </span>
                        {item.label}
                      </button>
                    );
                  })}
                </nav>

                {/* Policies */}
                <p className="mb-1 mt-5 px-3 font-bitter text-xs font-medium text-neutral-500">
                  Policies
                </p>

                <div className="grid gap-0.5">
                  {policyLinks.map(([label, target]) => (
                    <button
                      key={label}
                      type="button"
                      onClick={(event) => handleNavClick(target, event)}
                      className="w-full truncate rounded-lg px-3 py-2 text-left font-bitter text-sm text-neutral-700 transition hover:bg-black/[0.045] hover:text-neutral-950"
                    >
                      {label}
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={(event) => handleNavClick("/policies", event)}
                    className="w-full rounded-lg px-3 py-2 text-left font-bitter text-sm font-bold text-blue-600 transition hover:bg-black/[0.045]"
                  >
                    View all policies →
                  </button>
                </div>
              </div>

              {/* Footer: contact + affiliation */}
              <div className="border-t border-black/[0.08] px-3 pb-3 pt-3">
                <button
                  type="button"
                  onClick={(event) => handleNavClick("Contact", event)}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left font-bitter text-[15px] font-medium text-neutral-800 transition hover:bg-black/[0.045]"
                >
                  <span className="text-neutral-500">
                    <SidebarIcon name="contact" />
                  </span>
                  Contact us
                </button>

                <div className="mt-2 flex items-center gap-3 rounded-xl border border-black/[0.06] bg-white/70 px-3 py-2.5">
                  <img
                    src="/assets/brand/logo-love-ct-blue.webp"
                    alt="Love Cape Town"
                    className="h-9 w-auto shrink-0 object-contain"
                  />
                  <div className="min-w-0">
                    <p className="font-bitter text-xs font-bold text-neutral-800">
                      Affiliated to Love Cape Town
                    </p>
                    <p className="font-bitter text-[11px] leading-4 text-neutral-500">
                      Cape Town based. Bookings confirmed manually.
                    </p>
                  </div>
                </div>
              </div>
            </aside>
          </div>,
          document.body,
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
  );
};

export default Navbar;