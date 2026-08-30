import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

  const pageRef = useRef(null);
  const heroRef = useRef(null);
  const aboutRef = useRef(null);
  const tourSelectSectionRef = useRef(null);
  const toursSectionRef = useRef(null);
  const contactSectionRef = useRef(null);

  const [showButton, setShowButton] = useState(false);
  const [isToursVisible, setIsToursVisible] = useState(false);
  const [isContactVisible, setIsContactVisible] = useState(false);

  // ---------- 1. DISABLE BROWSER SCROLL RESTORATION BEFORE PAINT ----------
  useLayoutEffect(() => {
    if ("scrollRestoration" in window.history) {
      const previous = window.history.scrollRestoration;
      window.history.scrollRestoration = "manual";
      return () => {
        window.history.scrollRestoration = previous;
      };
    }
  }, []);

  // ---------- 2. LOCK SCROLL & FORCE TOP (WITH OVERFLOW HIDING) ----------
  useEffect(() => {
    // If there's a hash or a state‑based scroll target, let those effects handle it.
    if (location.hash || location.state?.scrollTo) return;

    // Prevent any scroll until we've set the position.
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    let isMounted = true;
    let retries = 0;
    const maxRetries = 30; // ~3 seconds

    const forceScrollToTop = () => {
      if (!isMounted) return;

      // Stop Lenis to avoid conflicts
      if (window.lenis) {
        window.lenis.stop();
        window.lenis.scrollTo(0, { immediate: true, force: true });
        // Restart Lenis after a short delay, but keep overflow hidden for now
        setTimeout(() => {
          if (window.lenis && isMounted) {
            window.lenis.start();
          }
        }, 50);
        return true;
      } else {
        window.scrollTo({ top: 0, behavior: "auto" });
        return false;
      }
    };

    const attemptScroll = () => {
      if (!isMounted) return;
      const success = forceScrollToTop();
      if (!success && retries < maxRetries) {
        retries++;
        setTimeout(attemptScroll, 100);
      } else {
        // Once we have scrolled (or Lenis is available), release overflow after
        // waiting for all layout changes (fonts, images, ScrollTrigger).
        const releaseScroll = () => {
          if (!isMounted) return;
          document.body.style.overflow = originalOverflow || "";
          // Refresh ScrollTrigger after the layout settles
          requestAnimationFrame(() => ScrollTrigger.refresh(true));
        };

        // Wait for fonts, images, and any other layout shifts.
        const loadPromises = [
          document.fonts?.ready || Promise.resolve(),
          new Promise((resolve) => {
            if (document.readyState === "complete") resolve();
            else window.addEventListener("load", resolve, { once: true });
          }),
        ];

        Promise.all(loadPromises).then(() => {
          // Give an extra frame for any remaining layout shifts.
          requestAnimationFrame(() => {
            setTimeout(releaseScroll, 200);
          });
        });
      }
    };

    // First attempt after a minimal delay to let React paint.
    const initialTimer = setTimeout(attemptScroll, 100);

    return () => {
      isMounted = false;
      clearTimeout(initialTimer);
      // Restore overflow if component unmounts early
      document.body.style.overflow = originalOverflow || "";
    };
  }, []); // empty deps → only on mount

  // ---------- 3. HASH OVERRIDE (unchanged) ----------
  useEffect(() => {
    if (location.hash) {
      window.history.replaceState(null, "", location.pathname + location.search);
      window.scrollTo(0, 0);
      if (window.lenis) {
        window.lenis.scrollTo(0, { immediate: true, force: true });
      }
      // After handling hash, we also need to refresh ScrollTrigger
      requestAnimationFrame(() => ScrollTrigger.refresh(true));
    }
  }, [location]);

  // ---------- 4. SCROLL LISTENER (unchanged) ----------
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

  // ---------- 5. SCROLL TO TOP (TOUR SELECT) ----------
  const scrollToTourSelect = () => {
    if (window.lenis) {
      window.lenis.scrollTo(0, { immediate: true, force: true });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // ---------- 6. TOUR SELECT HIDE/SHOW (unchanged) ----------
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

  // ---------- 7. SCROLL-TO-SECTION FROM location.state (unchanged) ----------
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

  // ---------- 8. HERO / ABOUT ANIMATIONS (unchanged) ----------
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
      {/* TourSelect wrapper */}
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
  );
};

export default Home;