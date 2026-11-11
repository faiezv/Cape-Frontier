import React, { useEffect, useMemo, useRef, useState } from "react";
import { tours, TOUR_TYPES } from "../../data/tours";

// Reuse bundled imagery. Swap in a photo that suits each category.
import imgPackages from "/src/assets/images/content/random/1.webp";
import imgHiking from "/src/assets/images/content/random/7.webp";
import imgAdrenaline from "/src/assets/images/content/random/2.webp"; // ← replace
import imgHistorical from "/src/assets/images/content/random/3.webp"; // ← replace

// `type` must match the values in TOUR_TYPES, because the tours page filters on it.
const CATEGORIES = [
  { type: TOUR_TYPES?.ADRENALINE ?? "adrenaline", label: "Adrenaline", image: imgAdrenaline },
  { type: TOUR_TYPES?.HIKING ?? "hiking", label: "Hiking", image: imgHiking },
  { type: TOUR_TYPES?.HISTORICAL ?? "historical", label: "Historical", image: imgHistorical },
  { type: TOUR_TYPES?.PACKAGES ?? "packages", label: "Packages", image: imgPackages },
];

// Faint contour-map lines, inlined so there is nothing to load.
const CONTOURS = encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="420" viewBox="0 0 640 420" fill="none" stroke="white" stroke-width="1">
    <path d="M-20 300C80 240 150 330 260 280S430 190 520 250 640 220 680 200"/>
    <path d="M-20 270C90 205 160 300 262 250S425 160 518 220 640 190 680 170"/>
    <path d="M-20 240C100 170 170 270 264 220S420 130 516 190 640 160 680 140"/>
    <path d="M-20 210C110 135 180 240 266 190S415 100 514 160 640 130 680 110"/>
    <path d="M-20 330C70 280 140 360 258 310S435 220 522 280 640 250 680 230"/>
    <path d="M-20 360C60 320 130 390 256 340S440 250 524 310 640 280 680 260"/>
    <path d="M-20 180C120 100 190 210 268 160S410 70 512 130 640 100 680 80"/>
  </svg>`,
);

const ArrowIcon = () => (
  <svg
    className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
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

const Styles = () => (
  <style>{`
    @media (prefers-reduced-motion: no-preference) {
      @keyframes tc-fade { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
      .tc-item { opacity: 0; }
      .tc-shown .tc-item { animation: tc-fade .6s cubic-bezier(.2,.7,.2,1) both; }
      .tc-shown .tc-item:nth-child(2) { animation-delay: .07s; }
      .tc-shown .tc-item:nth-child(3) { animation-delay: .14s; }
      .tc-shown .tc-item:nth-child(4) { animation-delay: .21s; }
    }
  `}</style>
);

const CategoryCard = ({ category, count }) => (
  <a
    href={`/tours?type=${encodeURIComponent(category.type)}`}
    aria-label={`Browse ${category.label} tours`}
    // On large screens every second card drops down a little so the row has a rhythm.
    className="tc-item group relative block aspect-[4/5] overflow-hidden rounded-2xl bg-blue-900 outline-none ring-1 ring-white/15 transition duration-500 hover:ring-white/50 focus-visible:ring-2 focus-visible:ring-white sm:aspect-[3/4] lg:[&:nth-child(even)]:translate-y-6"
  >
    <img
      src={category.image}
      alt=""
      loading="lazy"
      decoding="async"
      className="h-full w-full object-cover opacity-90 transition duration-700 group-hover:scale-105 group-hover:opacity-100"
    />
    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(4,14,52,0.9)_0%,rgba(4,14,52,0.15)_55%,rgba(4,14,52,0)_100%)]" />

    {count > 0 && (
      <span className="absolute left-3 top-3 rounded-full bg-white/15 px-2.5 py-1 font-mont text-[11px] font-bold text-white ring-1 ring-white/25 backdrop-blur-md">
        {count} {count === 1 ? "tour" : "tours"}
      </span>
    )}

    <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 sm:p-5">
      <h3 className="font-bitter text-xl font-bold leading-tight text-white sm:text-2xl">
        {category.label}
      </h3>
      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-blue-700 transition duration-300 group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white">
        <ArrowIcon />
      </span>
    </div>
  </a>
);

// `children` renders at the bottom of the panel (e.g. <StripeSponsored />).
const TourCategories = ({ children }) => {
  const sectionRef = useRef(null);
  const [shown, setShown] = useState(false);

  const counts = useMemo(() => {
    const c = {};
    tours.forEach((t) => {
      c[t.type] = (c[t.type] || 0) + 1;
    });
    return c;
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return undefined;
    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return undefined;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="tour-categories-title"
      className={`relative isolate my-10 w-full overflow-hidden rounded-[2rem] bg-blue-950 px-4 pb-6 pt-8 shadow-[0_30px_70px_rgba(5,20,70,0.35)] sm:my-14 sm:px-8 sm:pt-10 ${
        shown ? "tc-shown" : ""
      }`}
    >
      <Styles />

      {/* depth: colour glows + contour lines */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,rgba(37,99,235,0.55),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(14,165,233,0.30),transparent_50%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.12]"
        style={{
          backgroundImage: `url("data:image/svg+xml,${CONTOURS}")`,
          backgroundSize: "640px 420px",
        }}
      />

      <div className="mb-6 flex items-end justify-between gap-4 sm:mb-8">
        <h2
          id="tour-categories-title"
          className="font-bitter text-2xl font-bold leading-tight text-white sm:text-3xl lg:text-4xl"
        >
          Find your tour
        </h2>
        <a
          href="/tours"
          className="shrink-0 font-mont text-sm font-bold text-white/70 underline-offset-4 transition hover:text-white hover:underline"
        >
          All tours
        </a>
      </div>

      <div className="grid grid-cols-2 gap-3 pb-1 sm:gap-5 lg:grid-cols-4 lg:pb-8">
        {CATEGORIES.map((category) => (
          <CategoryCard
            key={category.type}
            category={category}
            count={counts[category.type] || 0}
          />
        ))}
      </div>

      {children && <div className="-mx-4 mt-6 sm:-mx-6">{children}</div>}
    </section>
  );
};

export default TourCategories;