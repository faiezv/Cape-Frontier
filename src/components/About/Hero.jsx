import React, { useCallback, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";

import HeroStats from "./HeroStats.jsx";
import { site } from "../../utils/siteConfig.js";

import slide1 from "/src/assets/images/content/random/1.webp";
import slide5 from "/src/assets/images/content/random/5.webp";
import slide6 from "/src/assets/images/content/random/7.webp";
import faqBlueIcon from "../../../public/icons/faqBlue.png";

// -----------------------------------------------------------------------------
// Per-site copy
// -----------------------------------------------------------------------------
const COPY = {
  coza: {
    slides: [
      {
        title: "Cape Town tours, priced in rand.",
        desc: "Small-group and private Cape Town tours with local pricing in rand, from iconic viewpoints to hidden local gems.",
      },
      {
        title: "Discover our routes worth remembering.",
        desc: "Coastlines, mountains, Winelands and culture-rich stops, with local pickup support and easy online booking.",
      },
      {
        title: "See Cape Town with real local insight.",
        desc: "Every journey is led with care and local knowledge, by a Cape Town team you can reach on WhatsApp, phone or email.",
      },
    ],
    mobileDesc:
      "Guided Cape Town routes with local insight, scenic stops and prices in rand.",
    stats: [
      { value: "Personal", label: "Service from our team" },
      { value: "Local", label: "Travel expertise" },
      { value: "Tailored", label: "Tour experiences" },
    ],
  },
  com: {
    slides: [
      {
        title: "Your South Africa trip, planned from abroad.",
        desc: "Guided Cape Town and Western Cape tours for international visitors, planned with our local team before you arrive.",
      },
      {
        title: "Discover routes worth remembering.",
        desc: "Travel through coastlines, mountains and Winelands with tours that balance comfort, storytelling and adventure.",
      },
      {
        title: "See Cape Town with real local insight.",
        desc: "Every journey is led with local knowledge, and our Cape Town team is on hand before and during your trip.",
      },
    ],
    mobileDesc:
      "Guided Cape Town routes with local insight, planned before you arrive.",
    stats: [
      { value: "Pre-trip", label: "Planning support" },
      { value: "Local", label: "Travel expertise" },
      { value: "Global", label: "Cards accepted" },
    ],
  },
};

const isZA = site.key === "coza";
const copy = isZA ? COPY.coza : COPY.com;

const slideImages = [slide1, slide5, slide6];

const exploreSlides = copy.slides.map((item, index) => ({
  ...item,
  img: slideImages[index],
}));

const WORD_HOLD_TIME = 12.4;

const ArrowIcon = ({ className = "h-4 w-4" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M5 12h14" />
    <path d="m13 6 6 6-6 6" />
  </svg>
);

const shouldReduceMotion = () => {
  if (typeof window === "undefined") return true;
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
};

// -----------------------------------------------------------------------------
// Hero
// -----------------------------------------------------------------------------
const Hero = () => {
  const textRefs = useRef([]);
  const [slideIndex, setSlideIndex] = useState(0);
  const slide = exploreSlides[slideIndex];

  const scrollToSection = useCallback((primaryId, fallbackId = null) => {
    const target =
      document.getElementById(primaryId) ||
      (fallbackId ? document.getElementById(fallbackId) : null);
    if (!target) return;
    const y = target.getBoundingClientRect().top + window.scrollY;
    if (window.lenis) {
      window.lenis.scrollTo(y, { duration: 0.85, force: true });
      return;
    }
    window.scrollTo({ top: y, behavior: "smooth" });
  }, []);

  const scrollToJourney = useCallback(() => {
    scrollToSection("journey-start", "tours");
  }, [scrollToSection]);

  const scrollToContact = useCallback(() => {
    scrollToSection("contact");
  }, [scrollToSection]);

  // headline + description rotation
  useLayoutEffect(() => {
    const words = textRefs.current.filter(Boolean);
    if (!words.length) return undefined;
    if (shouldReduceMotion()) {
      gsap.set(words, {
        yPercent: 0,
        opacity: 1,
        scale: 1,
        filter: "blur(0px)",
      });
      return undefined;
    }
    const tl = gsap.timeline({
      defaults: { ease: "power2.out" },
      onComplete: () =>
        setSlideIndex((current) => (current + 1) % exploreSlides.length),
    });
    tl.set(
      words,
      { yPercent: 110, opacity: 0, scale: 0.98, filter: "blur(2px)" },
      0,
    )
      .to(words, {
        yPercent: 0,
        opacity: 1,
        scale: 1,
        filter: "blur(0px)",
        duration: 0.28,
        stagger: 0.08,
        ease: "power3.out",
      })
      .to(words, {
        yPercent: 0,
        opacity: 1,
        scale: 1,
        duration: WORD_HOLD_TIME,
        ease: "none",
      })
      .to(words, {
        yPercent: -110,
        opacity: 0,
        scale: 0.98,
        filter: "blur(2px)",
        duration: 0.26,
        stagger: 0.06,
        ease: "power2.in",
      });
    return () => tl.kill();
  }, [slideIndex]);

  return (
    <section className="relative z-20 w-full">
      <div className="mx-auto w-full max-w-6xl px-4 pb-10 pt-8 sm:px-6 md:pt-16 lg:px-8">
        <div className="grid items-stretch gap-8 md:grid-cols-2 lg:gap-14">
          {/* Image */}
          <div className="relative hidden min-h-[260px] overflow-hidden rounded-3xl bg-blue-100 shadow-[0_16px_40px_rgba(0,0,0,0.12)] md:block 
          lg:min-h-[460px]">
            {exploreSlides.map((item, index) => (
              <img
                key={item.img}
                src={item.img}
                alt={index === slideIndex ? item.title : ""}
                loading={index === 0 ? "eager" : "lazy"}
                decoding="async"
                className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
                  index === slideIndex ? "opacity-100" : "opacity-0"
                }`}
              />
            ))}

            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

            
          </div>

          {/* Text */}
          <div className="flex min-w-0 flex-col justify-center gap-4">
            <div className="flex flex-col">
              <div className="overflow-hidden py-1">
                <h1
                  ref={(el) => {
                    textRefs.current[0] = el;
                  }}
                  className="font-bitter text-4xl font-bold leading-[1.1] tracking-tight text-neutral-950 sm:text-5xl lg:text-6xl"
                >
                  {slide.title}
                </h1>
              </div>

              <div className="overflow-hidden py-0.5">
                <p
                  ref={(el) => {
                    textRefs.current[1] = el;
                  }}
                  className="max-w-xl font-mont text-base leading-relaxed text-neutral-700 sm:text-lg"
                >
                  <span className="md:hidden">{copy.mobileDesc}</span>
                  <span className="hidden md:inline">{slide.desc}</span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={scrollToJourney}
                className="hero-gradient inline-flex items-center gap-2 rounded-xl px-6 py-3.5 font-mont text-base font-semibold text-white shadow-[0_12px_28px_rgba(15,10,113,0.16)] transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
              >
                <span>Start your journey</span>
                <ArrowIcon />
              </button>

              <button
                type="button"
                onClick={scrollToContact}
                className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-6 py-3.5 font-mont text-base font-semibold text-blue-800 transition hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
              >
                <img src={faqBlueIcon} className="h-5" alt="" />
                <span>Contact us</span>
              </button>
            </div>

            <HeroStats stats={copy.stats} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;