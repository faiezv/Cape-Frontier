import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

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

  const pageRef = useRef(null);
  const heroRef = useRef(null);
  const aboutRef = useRef(null);
  const tourSelectRef = useRef(null);
  const tourSelectSectionRef = useRef(null);
  const toursSectionRef = useRef(null);
  const contactSectionRef = useRef(null); // kept for reference, but not used for position

  // ---------- BUTTON STATE ----------
  const [showButton, setShowButton] = useState(false);
  const [isToursVisible, setIsToursVisible] = useState(false); // only Tours triggers bottom

  // ---------- SCROLL LISTENER ----------
  useEffect(() => {
    const handleScroll = () => {
      // --- Show/hide button based on hero height threshold ---
      if (!heroRef.current) return;
      const heroHeight = heroRef.current.offsetHeight;
      // 👇 Adjust this value (0.5 = 50%) to change when button appears
      const threshold = heroHeight * 0.5;
      setShowButton(window.scrollY > threshold);

      // --- Check if Tours section is visible (only this triggers bottom) ---
      let toursVisible = false;
      if (toursSectionRef.current) {
        const rect = toursSectionRef.current.getBoundingClientRect();
        // If the top of Tours is above the bottom of the viewport
        if (rect.top < window.innerHeight) toursVisible = true;
      }
      setIsToursVisible(toursVisible);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // initial check

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ---------- SCROLL TO TOP (TOUR SELECT) ----------
  const scrollToTourSelect = () => {
    if (window.lenis) {
      window.lenis.scrollTo(0, {
        immediate: true,
        force: true,
      });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // ---------- EXISTING useLayoutEffect FOR TOUR SELECT HIDE/SHOW ----------
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

  // ---------- EXISTING useEffect FOR LOCATION.STATE SCROLL ----------
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
    }, 700);

    return () => window.clearTimeout(timer);
  }, [location.key, location.state]);

  // ---------- EXISTING useLayoutEffect FOR HERO/ABOUT ANIMATIONS ----------
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      if (!heroRef.current || !aboutRef.current) return;

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
              getHeroScrollDistance() * (touchDevice ? 1.15 : 1)
            )}`,
          scrub: touchDevice ? 0.55 : 0.3,
          pin: heroRef.current,
          pinSpacing: false,
          anticipatePin: touchDevice ? 0 : 1,
          invalidateOnRefresh: true,
          refreshPriority: 2,
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
        0
      );

      const refresh = () => {
        if (window.scrollY <= 2) resetHero();
        ScrollTrigger.refresh(true);
      };

      const refreshOne = window.setTimeout(refresh, 80);
      const refreshTwo = window.setTimeout(refresh, 320);
      const refreshThree = window.setTimeout(refresh, 900);

      window.addEventListener("load", refresh, { once: true });
      if (document.fonts?.ready) {
        document.fonts.ready.then(refresh).catch(() => {});
      }

      return () => {
        window.clearTimeout(refreshOne);
        window.clearTimeout(refreshTwo);
        window.clearTimeout(refreshThree);
        window.removeEventListener("load", refresh);
      };
    }, pageRef);

    return () => ctx.revert();
  }, []);

  // ---------- RENDER ----------
  return (
    <div
      ref={pageRef}
      className="relative flex flex-col overflow-x-hidden bg-white text-white"
    >
      {/* TourSelect wrapper – now with higher z-index to stay above about */}
      <section
        className="absolute z-30 w-full overflow-x-hidden overflow-y-visible"
      >
        <div ref={tourSelectRef} className="mx-auto max-w-5xl mt-20 ">
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

      {/* ---------- FIXED BUTTON (top by default, bottom only when Tours is visible) ---------- */}
      <div
        className={`fixed left-1/2 z-50 -translate-x-1/2 transition-all duration-500 ease-out ${
          showButton
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        } ${
          isToursVisible
            ? "bottom-8 translate-y-0 scale-100"
            : "top-20 translate-y-0 scale-100"
        }`}
        style={{
          transitionProperty: "transform, opacity, top, bottom",
        }}
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
  );
};

export default Home;