import React, { useCallback, useEffect, useRef, useState } from "react";
import { site } from "../../utils/siteConfig.js";

// Reuse the imagery already bundled for the hero rotation.
import tour1 from "/src/assets/images/content/random/1.webp";
import tour5 from "/src/assets/images/content/random/5.webp";
import tour7 from "/src/assets/images/content/random/7.webp";

const isZA = site?.key === "coza";
const priceLabel = (value) => (isZA ? `From R${value}` : `From $${value}`);

// ↓ Replace with your real tour data / CMS feed.
const POPULAR_TOURS = [
  {
    id: "cape-peninsula",
    title: "Cape Peninsula Full Day",
    location: "Cape Town • Peninsula",
    duration: "Full day",
    priceFrom: "1 450",
    rating: "4.9",
    reviews: 214,
    tag: "Most booked",
    image: tour1,
  },
  {
    id: "winelands",
    title: "Winelands & Cellar Doors",
    location: "Stellenbosch • Franschhoek",
    duration: "8 hours",
    priceFrom: "1 250",
    rating: "4.8",
    reviews: 168,
    tag: "Guest favourite",
    image: tour5,
  },
  {
    id: "table-mountain",
    title: "Table Mountain Sunrise Hike",
    location: "Table Mountain • City Bowl",
    duration: "4 hours",
    priceFrom: "890",
    rating: "4.9",
    reviews: 132,
    tag: "Small group",
    image: tour7,
  },
];

/* ------------------------------------------------------------------ icons */
const StarIcon = ({ className = "h-3 w-3" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2.5l2.9 6.1 6.6.9-4.8 4.7 1.2 6.6L12 17.7 6.1 20.8l1.2-6.6L2.5 9.5l6.6-.9L12 2.5z" />
  </svg>
);

const ClockIcon = ({ className = "h-3.5 w-3.5" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

const PinIcon = ({ className = "h-3.5 w-3.5" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

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

/* ------------------------------------------------------- motion (css only) */
const Styles = () => (
  <style>{`
    @media (prefers-reduced-motion: no-preference) {
      @keyframes pt-rise { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: none; } }
      .pt-card { opacity: 0; }
      .pt-head { opacity: 0; }
      .pt-shown .pt-head { animation: pt-rise .55s cubic-bezier(.2,.7,.2,1) both; }
      .pt-shown .pt-card { animation: pt-rise .6s cubic-bezier(.2,.7,.2,1) both; }
      .pt-shown .pt-card:nth-child(1) { animation-delay: .08s; }
      .pt-shown .pt-card:nth-child(2) { animation-delay: .16s; }
      .pt-shown .pt-card:nth-child(3) { animation-delay: .24s; }
      .pt-shown .pt-card:nth-child(4) { animation-delay: .32s; }
    }
  `}</style>
);

/* ------------------------------------------------------------------- card */
const TourCard = ({ tour, onSelect }) => (
  <article className="pt-card group relative flex min-w-[78%] snap-start flex-col overflow-hidden rounded-[22px] border border-black/5 bg-white shadow-[0_10px_28px_rgba(15,23,42,0.07)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_46px_rgba(15,23,42,0.13)] sm:min-w-0">
    <div className="relative aspect-[4/3] overflow-hidden bg-blue-100">
      <img
        src={tour.image}
        alt={tour.title}
        loading="lazy"
        decoding="async"
        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
      />

      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(5,20,70,0.45)_0%,rgba(5,20,70,0)_55%)]" />

      {tour.tag && (
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 font-mont text-[10px] font-black uppercase tracking-[0.14em] text-blue-700 backdrop-blur">
          {tour.tag}
        </span>
      )}

      <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/55 px-2 py-1 font-mont text-[11px] font-bold text-white backdrop-blur">
        <StarIcon className="h-3 w-3 text-amber-300" />
        {tour.rating}
        <span className="font-normal text-white/60">({tour.reviews})</span>
      </span>

      <div className="absolute bottom-3 left-3 right-3 flex items-center gap-3 font-mont text-[11px] font-bold text-white/90">
        <span className="inline-flex items-center gap-1">
          <ClockIcon />
          {tour.duration}
        </span>
      </div>
    </div>

    <div className="flex flex-1 flex-col gap-1 px-4 pb-3 pt-4">
      <h3 className="font-bitter text-base font-bold leading-snug text-black sm:text-lg">
        {tour.title}
      </h3>
      <p className="inline-flex items-center gap-1.5 font-mont text-[11px] font-bold text-black/45 sm:text-xs">
        <PinIcon />
        {tour.location}
      </p>
    </div>

    <div className="mt-auto flex items-center justify-between border-t border-black/5 px-4 py-3">
      <p className="font-bitter text-lg font-black leading-none text-blue-700">
        {priceLabel(tour.priceFrom)}
        <span className="ml-1 font-mont text-[10px] font-bold uppercase tracking-[0.1em] text-black/35">
          pp
        </span>
      </p>

      <button
        type="button"
        onClick={() => onSelect(tour)}
        aria-label={`View ${tour.title}`}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-700 transition group-hover:bg-blue-700 group-hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2"
      >
        <ArrowIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
      </button>
    </div>
  </article>
);

/* --------------------------------------------------------------- section */
const PopularTours = () => {
  const sectionRef = useRef(null);
  const [shown, setShown] = useState(false);

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

  // Wire this to your router / detail modal. For now it drops back to the browser.
  const handleSelect = useCallback(() => {
    const target = document.getElementById("tours");
    if (!target) return;
    const y = target.getBoundingClientRect().top + window.scrollY;
    if (window.lenis) {
      window.lenis.scrollTo(y, { duration: 0.85, force: true });
      return;
    }
    window.scrollTo({ top: y, behavior: "smooth" });
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="popular-tours-title"
      className={`w-full py-10 sm:py-14 ${shown ? "pt-shown" : ""}`}
    >
      <Styles />

      {/* header */}
      <div className="pt-head mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-lg">
          <p className="font-bitter text-[10px] font-black uppercase tracking-[0.22em] text-blue-700/70 sm:text-xs">
            Traveller favourites
          </p>
          <h2
            id="popular-tours-title"
            className="mt-2 font-bitter text-2xl font-bold leading-tight text-black sm:text-3xl lg:text-4xl"
          >
            Popular tours right now
          </h2>
          <p className="mt-2 font-mont text-sm leading-6 text-black/55">
            The routes guests book most often — small groups, local guides and
            honest pricing.
          </p>
        </div>

        <span className="hidden shrink-0 items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 font-mont text-[11px] font-black uppercase tracking-[0.14em] text-blue-700 sm:inline-flex">
          Updated weekly
        </span>
      </div>

      {/* cards */}
      <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3 [&::-webkit-scrollbar]:hidden">
        {POPULAR_TOURS.map((tour) => (
          <TourCard key={tour.id} tour={tour} onSelect={handleSelect} />
        ))}
      </div>
    </section>
  );
};

export default PopularTours;