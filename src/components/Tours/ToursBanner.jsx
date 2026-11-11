import React, { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";

import tours from "/src/data/tours.js";

const FALLBACK_LOCATIONS = [
  "Cape Town",
  "Gansbaai",
  "Signal Hill",
  "Lion's Head",
  "Cape Peninsula",
  "Stellenbosch",
];

// Slower than before (was 1200ms). Constant motion next to the headline
// competes with the thing people are trying to read.
const ROTATE_EVERY_MS = 2600;

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

const toCleanLocation = (value) => {
  if (!value) return "";
  return String(value).split(",")[0].replace(/\s+/g, " ").trim();
};

const DESTINATIONS = (() => {
  const fromTours = tours.map((tour) => tour.location);
  const unique = Array.from(
    new Set(fromTours.map(toCleanLocation).filter(Boolean))
  );

  return unique.length ? unique.slice(0, 10) : FALLBACK_LOCATIONS;
})();

const RotatingLocationText = ({ locations = FALLBACK_LOCATIONS }) => {
  const cleanLocations = useMemo(() => {
    const unique = Array.from(
      new Set(locations.map(toCleanLocation).filter(Boolean))
    );

    return unique.length ? unique : FALLBACK_LOCATIONS;
  }, [locations]);

  const [index, setIndex] = useState(0);

  const containerRef = useRef(null);
  const currentWordRef = useRef("");
  const animationRef = useRef(null);
  const letterRefs = useRef({});

  const [letters, setLetters] = useState([]);

  useEffect(() => {
    if (!cleanLocations.length) return;

    const newWord = cleanLocations[index];

    if (newWord === currentWordRef.current) return;

    currentWordRef.current = newWord;

    if (animationRef.current) {
      animationRef.current.kill();
    }

    const lettersArray = newWord.split("");
    const oldLettersCount = Object.keys(letterRefs.current).length;

    const tlOut = gsap.timeline({
      onComplete: () => {
        setLetters(lettersArray);

        requestAnimationFrame(() => {
          const newSpans = letterRefs.current;
          const newCount = Object.keys(newSpans).length;

          if (!newCount) return;

          const tlIn = gsap.timeline();

          for (let i = 0; i < newCount; i++) {
            const span = newSpans[i];

            if (!span) continue;

            gsap.set(span, {
              y: 8,
              autoAlpha: 0,
              filter: "blur(3px)",
            });

            tlIn.to(
              span,
              {
                y: 0,
                autoAlpha: 1,
                filter: "blur(0px)",
                duration: 0.08,
                ease: "power2.out",
              },
              i * 0.02
            );
          }

          animationRef.current = tlIn;
        });
      },
    });

    for (let i = 0; i < oldLettersCount; i++) {
      const span = letterRefs.current[i];

      if (!span) continue;

      tlOut.to(
        span,
        {
          y: -8,
          autoAlpha: 0,
          filter: "blur(3px)",
          duration: 0.08,
          ease: "power2.in",
        },
        i * 0.02
      );
    }

    animationRef.current = tlOut;

    return () => {
      tlOut.kill();
    };
  }, [index, cleanLocations]);

  useEffect(() => {
    if (cleanLocations.length && !currentWordRef.current) {
      currentWordRef.current = cleanLocations[0];
      setLetters(cleanLocations[0].split(""));
    }
  }, [cleanLocations]);

  useEffect(() => {
    if (cleanLocations.length <= 1 || prefersReducedMotion()) return;

    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % cleanLocations.length);
    }, ROTATE_EVERY_MS);

    return () => clearInterval(interval);
  }, [cleanLocations]);

  const setLetterRef = (idx, el) => {
    if (el) {
      letterRefs.current[idx] = el;
    } else {
      delete letterRefs.current[idx];
    }
  };

  return (
    <span
      ref={containerRef}
      className="inline-block rounded-full bg-blue-50 px-3 py-0.5 font-bold text-blue-800 will-change-transform"
    >
      <span className="inline-flex whitespace-pre">
        {letters.map((letter, idx) => (
          <span
            key={`${letter}-${idx}`}
            ref={(el) => setLetterRef(idx, el)}
            className="inline-block"
          >
            {letter === " " ? "\u00A0" : letter}
          </span>
        ))}
      </span>
    </span>
  );
};

function ToursBanner() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col px-4 pb-6 pt-10 sm:pb-8 sm:pt-14 lg:pt-24">
      {/*
        Changes vs. the old version:
        - removed the tracked-out "Cape Frontier experiences" eyebrow (said nothing new)
        - "Book Your Adventure" + "Book a trip to" repeated "Book" -> subline now
          starts with "Tours in"
        - fixed broken utility classes (pb-, sm:pb-, mt-, lg:pt-30, max-w-1xl)
        - headline tracking/leading loosened so it doesn't crowd itself
        - dead commented-out image/TourSelect blocks removed
      */}
      <header className="cf-tours-intro-item mx-auto max-w-3xl text-center font-bitter">
        <h2 className="text-4xl font-bold leading-[1.08] tracking-tight text-neutral-950 sm:text-5xl md:text-6xl">
          Book your adventure.
        </h2>

        <p className="mt-5 text-xl font-semibold leading-snug text-neutral-800 sm:text-2xl">
          Tours in <RotatingLocationText locations={DESTINATIONS} />
        </p>

        <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-neutral-600 sm:text-lg">
          Small groups, local guides, and more than just a tour.
        </p>
      </header>

      <style>{`
        @media (min-width: 768px) {
          .tour-select-icon {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

export default ToursBanner;