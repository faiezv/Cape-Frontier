import React, { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";

import tours from "/src/data/tours.js";
import TourSelect from "./TourSelect";

const FALLBACK_LOCATIONS = [
  "Cape Town",
  "Gansbaai",
  "Signal Hill",
  "Lion's Head",
  "Cape Peninsula",
  "Stellenbosch",
];

const toCleanLocation = (value) => {
  if (!value) return "";
  return String(value).split(",")[0].replace(/\s+/g, " ").trim();
};

const DESTINATIONS = (() => {
  const fromTours = tours.map((tour) => tour.location);
  const unique = Array.from(new Set(fromTours.map(toCleanLocation).filter(Boolean)));
  return unique.length ? unique.slice(0, 10) : FALLBACK_LOCATIONS;
})();

const RotatingLocationText = ({ locations = FALLBACK_LOCATIONS }) => {
  const cleanLocations = useMemo(() => {
    const unique = Array.from(new Set(locations.map(toCleanLocation).filter(Boolean)));
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

    const oldWord = currentWordRef.current;
    currentWordRef.current = newWord;

    if (animationRef.current) animationRef.current.kill();

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
            if (span) {
              gsap.set(span, { y: 8, autoAlpha: 0, filter: "blur(3px)" });
              tlIn.to(span, {
                y: 0,
                autoAlpha: 1,
                filter: "blur(0px)",
                duration: 0.08,
                ease: "power2.out",
              }, i * 0.02);
            }
          }
          animationRef.current = tlIn;
        });
      }
    });

    for (let i = 0; i < oldLettersCount; i++) {
      const span = letterRefs.current[i];
      if (span) {
        tlOut.to(span, {
          y: -8,
          autoAlpha: 0,
          filter: "blur(3px)",
          duration: 0.08,
          ease: "power2.in",
        }, i * 0.02);
      }
    }
    animationRef.current = tlOut;
  }, [index, cleanLocations]);

  useEffect(() => {
    if (cleanLocations.length && !currentWordRef.current) {
      currentWordRef.current = cleanLocations[0];
      setLetters(cleanLocations[0].split(""));
    }
  }, [cleanLocations]);

  useEffect(() => {
    if (cleanLocations.length <= 1) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % cleanLocations.length);
    }, 1200);
    return () => clearInterval(interval);
  }, [cleanLocations]);

  const setLetterRef = (idx, el) => {
    if (el) letterRefs.current[idx] = el;
    else delete letterRefs.current[idx];
  };

  return (
    <span
      ref={containerRef}
      className="inline-block rounded-full bg-[#eef4ff] px-2.5 py-1 font-black text-[#071f4f] will-change-transform sm:px-3"
    >
      <span className="inline-flex whitespace-pre">
        {letters.map((letter, idx) => (
          <span
            key={idx}
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
    <div className="max-w-5xl mx-auto flex flex-col pb-7 pt-8 sm:pb-10 sm:pt-12 lg:pt-14">
      <header className="max-w-4xl text-center font-frank mx-4 lg:mx-auto">
        <p className="cf-tours-intro-item text-xs font-black uppercase tracking-[0.28em] text-[#071f4f]/60">
          Cape Frontier experiences
        </p>
        <h2 className="cf-tours-intro-item mt-3 text-[3rem] font-black leading-[0.86] tracking-[-0.055em] text-neutral-950 sm:text-6xl md:text-7xl">
          Book Your Adventure.
        </h2>
        <div className="cf-tours-intro-item mx-auto mt-4 min-h-[6rem] max-w-1xl text-balance text-lg font-semibold leading-tight text-neutral-600 sm:min-h-0 sm:text-2xl">
          <div className="block">
            Book a trip to <RotatingLocationText locations={DESTINATIONS} />
          </div>
          <div className="block">and experience more than just a tour.</div>
        </div>
      </header>

      {/* Two‑column grid: image | TourSelect */}
      <div className="mt-7 grid items-stretch gap-4 md:mt-9 lg:grid-cols-[0.9fr_1.1fr]">
        <figure className="cf-tours-intro-item relative hidden min-h-[330px] overflow-hidden rounded-[2rem] bg-[#071f4f] shadow-[0_24px_70px_rgba(7,31,79,0.12)] md:block">
          <img
            src="/images/content/random/7.webp"
            alt="Cape Frontier scenic tour preview"
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/78 via-black/24 to-transparent" />
        </figure>

        <div className="cf-tours-intro-item relative z-10 mx-4 lg:mx-auto">
          <TourSelect />
        </div>
      </div>

      {/* Minimal pill‑style "Guided Cape Town routes" section */}
      {/* <div className="flex flex-col items-start gap-2 p-4">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-black/5 px-3 py-1 font-frank text-xs font-black uppercase tracking-wider text-black/60 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
            Guided Cape Town routes
          </p>
        <p className="max-w-sm text-sm font-bitter leading-relaxed text-black/60">
          Choose your tour, confirm your group, and continue to a dedicated tour page.
        </p>
        </div>
      </div> */}

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