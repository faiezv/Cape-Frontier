import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// SEO
import Seo from "../components/Seo.jsx";

import Hero from "../components/Hero.jsx";
import About from "../components/About/About.jsx";
import Stories from "../components/Stories/Stories.jsx";
import Tours from "../components/Tours/Tours.jsx";
import Contact from "../components/Contact.jsx";
import TourSelect from "../components/Tours/TourSelect.jsx";

gsap.registerPlugin(ScrollTrigger);

const isTouchDevice = () => {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(pointer: coarse)").matches ||
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0
  );
};

const Home = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const pageRef = useRef(null);
  const heroRef = useRef(null);
  const aboutRef = useRef(null);
  const tourSelectSectionRef = useRef(null);
  const toursSectionRef = useRef(null);
  const contactSectionRef = useRef(null);

  // ---------- BUTTON STATE ----------
  const [showButton, setShowButton] = useState(false);
  const [isToursVisible, setIsToursVisible] = useState(false);
  const [isContactVisible, setIsContactVisible] = useState(false);

  // ---------- HASH OVERRIDE ----------
  useEffect(() => {
    if (location.hash) {
      window.history.replaceState(
        null,
        "",
        location.pathname + location.search,
      );
      window.scrollTo(0, 0);
      if (window.lenis) {
        window.lenis.scrollTo(0, { immediate: true, force: true });
      }
      requestAnimationFrame(() => ScrollTrigger.refresh(true));
    }
  }, [location]);

  // ---------- SCROLL LISTENER (for button visibility) ----------
  useEffect(() => {
    const handleScroll = () => {
      if (!heroRef.current) return;
      const heroHeight = heroRef.current.offsetHeight;
      const threshold = heroHeight * 0.5;
      const pastHero = window.scrollY > threshold;

      let toursVisible = false;
      let contactVisible = false;

      if (toursSectionRef.current) {
        const rect = toursSectionRef.current.getBoundingClientRect();
        if (rect.top < window.innerHeight) toursVisible = true;
      }
      if (contactSectionRef.current) {
        const rect = contactSectionRef.current.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          contactVisible = true;
        }
      }

      setIsToursVisible(toursVisible);
      setIsContactVisible(contactVisible);
      setShowButton(pastHero && !toursVisible && !contactVisible);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ---------- SCROLL TO TOP (Tour Select button) ----------
  const scrollToTourSelect = () => {
    if (window.lenis) {
      window.lenis.scrollTo(0, { immediate: true, force: true });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // ---------- TOUR SELECT HIDE/SHOW ----------
  useLayoutEffect(() => {
    const section = tourSelectSectionRef.current;
    if (!section) return;

    let cleanup = null;
    let retryTimer = null;

    const setup = () => {
      if (!window.lenis) {
        retryTimer = window.setTimeout(setup, 50);
        return;
      }

      let lastScroll = window.lenis.scroll || window.scrollY || 0;
      let hidden = false;

      gsap.set(section, {
        y: 0,
        autoAlpha: 1,
        force3D: true,
      });

      const show = () => {
        if (!hidden) return;
        hidden = false;
        gsap.to(section, {
          y: 0,
          autoAlpha: 1,
          duration: 0.4,
          ease: "power3.out",
          overwrite: true,
        });
      };

      const hide = () => {
        if (hidden) return;
        hidden = true;
        gsap.to(section, {
          y: 100,
          autoAlpha: 0,
          duration: 0.35,
          ease: "power3.out",
          overwrite: true,
        });
      };

      const handleScroll = ({ scroll }) => {
        if (scroll <= 5) {
          show();
          lastScroll = scroll;
          return;
        }
        const difference = scroll - lastScroll;
        if (difference > 2) hide();
        else if (difference < -2) show();
        lastScroll = scroll;
      };

      window.lenis.on("scroll", handleScroll);
      cleanup = () => window.lenis?.off("scroll", handleScroll);
    };

    setup();

    return () => {
      if (retryTimer) window.clearTimeout(retryTimer);
      cleanup?.();
      gsap.killTweensOf(section);
    };
  }, []);

  // ---------- SCROLL-TO-SECTION FROM location.state ----------
  useEffect(() => {
    const scrollTarget = location.state?.scrollTo;
    if (!scrollTarget || !window.lenis) return undefined;

    const timer = window.setTimeout(() => {
      if (scrollTarget === "top") {
        window.lenis.scrollTo(0, { immediate: true, force: true });
      } else {
        const element = document.getElementById(scrollTarget);
        if (element) {
          const y = element.getBoundingClientRect().top + window.scrollY;
          window.lenis.scrollTo(y, { immediate: true, force: true });
        }
      }
      window.requestAnimationFrame(() => ScrollTrigger.refresh(true));
      navigate(location.pathname + location.search, {
        replace: true,
        state: {},
      });
    }, 700);

    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key]);

  // ---------- REFRESH ONCE TOURS' LAYOUT ACTUALLY SETTLES ----------
  useEffect(() => {
    const onStable = () => ScrollTrigger.refresh(true);
    window.addEventListener("tours:stable", onStable);
    return () => window.removeEventListener("tours:stable", onStable);
  }, []);

  // ---------- HERO & ABOUT ANIMATIONS (DELAYED PIN) ----------
  // We'll keep the ScrollTrigger pin but delay its creation until after load
  const [pinCreated, setPinCreated] = useState(false);

  useEffect(() => {
    // Only run once after everything is stable
    const createPin = () => {
      if (!heroRef.current || !aboutRef.current || pinCreated) return;

      const touchDevice = isTouchDevice();

      const resetHero = () => {
        gsap.set(heroRef.current, {
          clearProps: "filter",
          scale: 1,
          opacity: 1,
          x: 0,
          y: 0,
          transformOrigin: "center top",
          force3D: true,
          backfaceVisibility: "hidden",
          willChange: "transform, opacity",
        });
      };

      const getHeroScrollDistance = () => {
        const heroHeight = heroRef.current?.offsetHeight || 0;
        const visualHeight = window.visualViewport?.height || 0;
        const windowHeight = window.innerHeight || 0;
        return Math.max(heroHeight, visualHeight, windowHeight, 1);
      };

      resetHero();

      gsap.set([heroRef.current, aboutRef.current], {
        force3D: true,
        backfaceVisibility: "hidden",
        willChange: "transform, opacity",
      });

      gsap.set(aboutRef.current, { y: 40 });

      const tl = gsap.timeline({
        scrollTrigger: {
          id: "home-hero-pin-scale",
          trigger: heroRef.current,
          start: "top top",
          end: () =>
            `+=${Math.round(
              getHeroScrollDistance() * (touchDevice ? 1.15 : 1),
            )}`,
          scrub: touchDevice ? 0.55 : 0.3,
          pin: heroRef.current,
          pinSpacing: false,
          anticipatePin: touchDevice ? 0 : 1,
          invalidateOnRefresh: true,
          refreshPriority: 5,
          onRefreshInit: () => {
            if (window.scrollY <= 2) resetHero();
          },
          onRefresh: (self) => {
            if (window.scrollY <= 2) {
              self.animation?.progress(0);
              resetHero();
            }
          },
        },
      });

      tl.to(aboutRef.current, { y: 0, force3D: true, ease: "none" }, 0).to(
        heroRef.current,
        {
          scale: touchDevice ? 0.72 : 0.6,
          opacity: touchDevice ? 0.82 : 0.1,
          force3D: true,
          ease: "none",
        },
        0,
      );

      setPinCreated(true);
      // Force a final refresh after pin creation
      ScrollTrigger.refresh(true);
    };

    // Wait for the DOM to settle
    const setup = () => {
      // If already loaded, create immediately
      if (document.readyState === "complete") {
        setTimeout(createPin, 200);
        return;
      }
      // Otherwise wait for load
      window.addEventListener("load", () => {
        setTimeout(createPin, 300);
      }, { once: true });
    };

    setup();

    return () => {
      // Cleanup if needed
    };
  }, [pinCreated]);

  // ---------- RENDER ----------
  return (
    <>
      <Seo
        title="Cape Frontier Travel | Guided Tours in South Africa"
        description="Small-group and custom tours across the Western Cape."
        path="/"
      />
      <div
        ref={pageRef}
        className="relative flex flex-col overflow-x-hidden bg-white text-white"
      >
        <section className="absolute z-30 w-full overflow-x-hidden overflow-y-visible">
          <div ref={tourSelectSectionRef} className="mx-auto max-w-5xl mt-20">
            <TourSelect />
          </div>
        </section>

        <section
          id="home"
          ref={heroRef}
          className="relative z-10 overflow-hidden"
        >
          <Hero />
        </section>

        <section
          id="about"
          ref={aboutRef}
          className="relative z-20 -mt-6 rounded-t-[2rem] bg-white text-black sm:-mt-8 lg:-mt-10"
        >
          <About />
        </section>

        <section id="stories" className="relative z-26">
          <Stories />
        </section>

        <section id="tours" ref={toursSectionRef} className="relative z-26">
          <Tours />
        </section>

        <section id="contact" ref={contactSectionRef} className="relative z-26">
          <Contact />
        </section>

        {/* Fixed button */}
        <div
          className={`fixed left-1/2 top-20 z-50 -translate-x-1/2 transition-all duration-500 ease-out ${
            showButton
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }`}
        >
          <button
            onClick={scrollToTourSelect}
            className="flex items-center rounded-full bg-blue-600 px-5 py-2.5 shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label="Jump to tour selection"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 15l7-7 7 7"
              />
            </svg>
            <span
              className={`ml-2 font-medium text-white transition-all duration-500 delay-150 ${
                showButton ? "opacity-100" : "opacity-0"
              }`}
            >
              Tour Select
            </span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Home;