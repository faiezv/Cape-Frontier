import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";

import tours from "/src/data/tours.js";
import TourSelect from "./TourSelect";

const FALLBACK_LOCATIONS = [
  "Cape Town",
  "Gansbaai",
  "Signal Hill",
  "Lion’s Head",
  "Cape Peninsula",
  "Stellenbosch",
];

const toCleanLocation = (value) => {
  if (!value) return "";

  return String(value)
    .split(",")[0]
    .replace(/\s+/g, " ")
    .trim();
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
      new Set(
        locations
          .map(toCleanLocation)
          .filter(Boolean)
      )
    );

    return unique.length ? unique : FALLBACK_LOCATIONS;
  }, [locations]);

  const [index, setIndex] = useState(0);
  const wordRef = useRef(null);

  useEffect(() => {
    if (cleanLocations.length <= 1) return undefined;

    const interval = window.setInterval(() => {
      if (!wordRef.current) {
        setIndex((current) => (current + 1) % cleanLocations.length);
        return;
      }

      gsap.to(wordRef.current, {
        autoAlpha: 0,
        y: -5,
        filter: "blur(3px)",
        duration: 0.16,
        ease: "power2.in",
        onComplete: () => {
          setIndex((current) => (current + 1) % cleanLocations.length);

          requestAnimationFrame(() => {
            if (!wordRef.current) return;

            gsap.fromTo(
              wordRef.current,
              { autoAlpha: 0, y: 5, filter: "blur(3px)" },
              {
                autoAlpha: 1,
                y: 0,
                filter: "blur(0px)",
                duration: 0.18,
                ease: "power2.out",
              }
            );
          });
        },
      });
    }, 1050);

    return () => window.clearInterval(interval);
  }, [cleanLocations]);

  return (
    <span
      ref={wordRef}
      className="inline-block rounded-full bg-[#eef4ff] px-2.5 py-1 font-black text-[#071f4f] will-change-transform sm:px-3"
    >
      {cleanLocations[index]}
    </span>
  );
};

function ToursBanner() {
  return (
        <div className="mx-auto flex max-w-6xl flex-col px-4 pb-7 pt-8 sm:px-5 sm:pb-10 sm:pt-12 lg:px-6 lg:pt-14">
          <header className="mx-auto max-w-4xl text-center font-frank">
            <p className="cf-tours-intro-item text-xs font-black uppercase tracking-[0.28em] text-[#071f4f]/60">
              Cape Frontier experiences
            </p>

            <h2 className="cf-tours-intro-item mt-3 text-[3rem] font-black leading-[0.86] tracking-[-0.055em] text-neutral-950 sm:text-6xl md:text-7xl">
              Book Your Adventure.
            </h2>

            <p className="cf-tours-intro-item mx-auto mt-4 min-h-[6rem] max-w-2xl text-balance text-lg font-semibold leading-8 text-neutral-600 sm:min-h-0 sm:text-2xl sm:leading-10">
              Book a trip to{" "}
              <RotatingLocationText locations={DESTINATIONS} />{" "}
              and experience more than just a tour.
            </p>
          </header>

          <div className="mt-7 grid items-stretch gap-4 md:mt-9 lg:grid-cols-[0.9fr_1.1fr]">
            <figure className="cf-tours-intro-item relative hidden min-h-[330px] overflow-hidden rounded-[2rem] bg-[#071f4f] shadow-[0_24px_70px_rgba(7,31,79,0.12)] md:block">
              <img
                src="/images/content/random/7.webp"
                alt="Cape Frontier scenic tour preview"
                className="absolute inset-0 h-full w-full object-cover"
                loading="lazy"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/78 via-black/24 to-transparent" />

              <figcaption className="absolute inset-x-0 bottom-0 p-5 text-white">
                <p className="font-frank text-3xl font-bold leading-none">
                  Guided Cape Town routes
                </p>
                <p className="mt-2 max-w-md text-sm leading-6 text-white/75">
                  Choose your tour, confirm your group, and continue to a dedicated tour page.
                </p>
              </figcaption>
            </figure>

            <div className="cf-tours-intro-item relative z-10">
              <TourSelect />
            </div>
          </div>
        </div>
  )
}

export default ToursBanner