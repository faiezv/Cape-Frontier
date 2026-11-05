import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Seo from "../components/Seo";
import { tours } from "../data/tours";
import { hasGroupDeal, getDurationBucket } from "../utils/tourHelpers";
import {
  Chip,
  TourCard,
  TourQuickView,
} from "../components/Tours/TourCards";
import BookingDrawer, {
  CONTACT_EMAIL,
  CONTACT_NUMBER,
  CONTACT_TEL,
  getTourSlug,
} from "../components/Tours/BookingDrawer";

gsap.registerPlugin(ScrollTrigger);

// ─── Config ──────────────────────────────────────────────────────────────────

// Increased from 96 to 112 to give the pinned panel some breathing room
const PIN_TOP_OFFSET = 112;

const TYPE_LABELS = {
  adrenaline: "Adrenaline",
  hiking: "Hiking",
  historical: "Historical",
  packages: "Packages",
  "wine-routes": "Wine routes",
};

const DURATION_OPTIONS = [
  { id: "half-day", label: "Half day" },
  { id: "full-day", label: "Full day" },
  { id: "multi-day", label: "Multi-day" },
];

const SORT_OPTIONS = [
  { id: "featured", label: "Featured" },
  { id: "price-asc", label: "Price ↑" },
  { id: "price-desc", label: "Price ↓" },
  { id: "az", label: "A – Z" },
];

const DEFAULT_FILTERS = {
  query: "",
  type: "all",
  duration: "all",
  maxPrice: null,
  childFriendly: false,
  groupDeals: false,
  showPromos: false,
  sort: "featured",
};

// Always-unique, never-null identity for a tour (React keys).
const getTourKey = (tour) =>
  String(tour?.id ?? tour?.slug ?? getTourSlug(tour));

const labelClass =
  "mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-neutral-400";

// ─── Filter panel (shared by desktop sidebar + mobile sheet) ─────────────────

function FilterPanel({
  filters,
  setFilter,
  typeOptions,
  typeCounts,
  priceCeiling,
  totalCount,
}) {
  return (
    <div className="space-y-6">
      <div>
        <p className={labelClass}>Category</p>
        <div className="flex flex-col gap-1">
          {[
            { id: "all", label: "All categories", count: totalCount },
            ...typeOptions.map((t) => ({
              id: t,
              label: TYPE_LABELS[t],
              count: typeCounts[t],
            })),
          ].map((o) => {
            const active = filters.type === o.id;
            return (
              <button
                key={o.id}
                type="button"
                onClick={() => setFilter({ type: o.id })}
                aria-pressed={active}
                className={`flex items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition ${
                  active
                    ? "bg-blue-50 font-bold text-blue-700"
                    : "font-medium text-neutral-700 hover:bg-neutral-50"
                }`}
              >
                {o.label}
                <span
                  className={`text-xs ${active ? "text-blue-500" : "text-neutral-400"}`}
                >
                  {o.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className={labelClass}>Duration</p>
        <div className="flex flex-wrap gap-1.5">
          <Chip
            active={filters.duration === "all"}
            onClick={() => setFilter({ duration: "all" })}
          >
            Any
          </Chip>
          {DURATION_OPTIONS.map((d) => (
            <Chip
              key={d.id}
              active={filters.duration === d.id}
              onClick={() => setFilter({ duration: d.id })}
            >
              {d.label}
            </Chip>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-neutral-400">
            Max price
          </p>
          <span className="text-xs font-bold text-blue-700">
            {filters.maxPrice === null
              ? "Any"
              : `R${filters.maxPrice.toLocaleString()}`}
          </span>
        </div>
        <input
          type="range"
          min={500}
          max={priceCeiling}
          step={500}
          value={filters.maxPrice ?? priceCeiling}
          onChange={(e) => {
            const v = Number(e.target.value);
            setFilter({ maxPrice: v >= priceCeiling ? null : v });
          }}
          className="w-full accent-blue-600"
          aria-label="Maximum price"
        />
      </div>

      <div>
        <p className={labelClass}>Show only</p>
        <div className="flex flex-wrap gap-1.5">
          <Chip
            active={filters.childFriendly}
            onClick={() => setFilter({ childFriendly: !filters.childFriendly })}
          >
            Family
          </Chip>
          <Chip
            active={filters.groupDeals}
            onClick={() => setFilter({ groupDeals: !filters.groupDeals })}
          >
            Group deals
          </Chip>
          <Chip
            active={filters.showPromos}
            onClick={() => setFilter({ showPromos: !filters.showPromos })}
          >
            On Promo
          </Chip>
        </div>
      </div>
    </div>
  );
}

// Mobile bottom sheet
function FilterSheet({ open, onClose, resultCount, onClear, canClear, children }) {
  useEffect(() => {
    if (!open) return undefined;
    const html = document.documentElement.style.overflow;
    const body = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    window.lenis?.stop?.();
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = html;
      document.body.style.overflow = body;
      window.lenis?.start?.();
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[180] flex items-end bg-black/50 lg:hidden"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Filters"
    >
      <div
        className="flex max-h-[85vh] w-full flex-col rounded-t-3xl bg-white shadow-2xl"
        style={{ animation: "tourSheetIn 0.26s cubic-bezier(0.16,1,0.3,1) both" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
          <p className="font-frank text-lg font-bold">Filters</p>
          <div className="flex items-center gap-2">
            {canClear && (
              <button
                type="button"
                onClick={onClear}
                className="rounded-full border border-red-200 px-3 py-1 text-xs font-bold text-red-600"
              >
                Clear
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close filters"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 text-neutral-700"
            >
              ✕
            </button>
          </div>
        </div>

        <div data-lenis-prevent className="flex-1 overflow-y-auto overscroll-contain p-5">
          {children}
        </div>

        <div className="border-t border-neutral-100 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-full bg-blue-600 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-blue-700 active:scale-95"
          >
            Show {resultCount} tour{resultCount !== 1 ? "s" : ""}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes tourSheetIn {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
      `}</style>
    </div>,
    document.body,
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

function Tours() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [quickTour, setQuickTour] = useState(null);
  const [bookingTour, setBookingTour] = useState(null);
  const [promoIndex, setPromoIndex] = useState(0);

  // Refs
  const panelRef = useRef(null);
  const resultsRef = useRef(null);
  const bgRef = useRef(null);

  const setFilter = (patch) => setFilters((prev) => ({ ...prev, ...patch }));
  const resetFilters = () => setFilters(DEFAULT_FILTERS);

  const openQuick = (tour) => setQuickTour(tour);
  const closeQuick = () => setQuickTour(null);
  const closeBooking = () => setBookingTour(null);
  const closeSheet = () => setSheetOpen(false);

  // Quick view → booking drawer
  const bookFromQuick = (tour) => {
    setQuickTour(null);
    setBookingTour(tour);
  };

  // Navbar white panel appears once the page is scrolled
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── Fix Navbar Logo/Titles when at the top of the page ──────────────────
  useEffect(() => {
    if (!scrolled) {
      document.body.classList.add("tours-at-top");
    } else {
      document.body.classList.remove("tours-at-top");
    }
    return () => document.body.classList.remove("tours-at-top");
  }, [scrolled]);

  // ── Derived data ────────────────────────────────────────────────────────
  const promoList = useMemo(() => tours.filter((t) => t.onPromo), []);
  const hasPromos = promoList.length > 0;

  // Rotate promo text every 4 seconds
  useEffect(() => {
    if (promoList.length <= 1) return;
    const timer = setInterval(() => {
      setPromoIndex((prev) => (prev + 1) % promoList.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [promoList.length]);

  const priceCeiling = useMemo(
    () =>
      Math.ceil(Math.max(...tours.map((t) => Number(t.priceBase) || 0)) / 500) *
      500,
    [],
  );

  const typeCounts = useMemo(() => {
    const counts = {};
    tours.forEach((t) => {
      counts[t.type] = (counts[t.type] || 0) + 1;
    });
    return counts;
  }, []);

  const typeOptions = useMemo(
    () => Object.keys(typeCounts).filter((t) => TYPE_LABELS[t]),
    [typeCounts],
  );

  const filteredTours = useMemo(() => {
    const q = filters.query.trim().toLowerCase();
    const limit = filters.maxPrice ?? Infinity;

    let list = tours.filter((tour) => {
      if (filters.type !== "all" && tour.type !== filters.type) return false;
      if (
        filters.duration !== "all" &&
        getDurationBucket(tour) !== filters.duration
      )
        return false;
      if ((Number(tour.priceBase) || 0) > limit) return false;
      if (filters.childFriendly && tour.childFriendly !== true) return false;
      if (filters.groupDeals && !hasGroupDeal(tour)) return false;
      if (filters.showPromos && !tour.onPromo) return false;
      
      if (q) {
        const haystack = [
          tour.title,
          tour.description,
          tour.location,
          ...(tour.tags || []),
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });

    if (filters.sort === "price-asc")
      list = [...list].sort((a, b) => a.priceBase - b.priceBase);
    if (filters.sort === "price-desc")
      list = [...list].sort((a, b) => b.priceBase - a.priceBase);
    if (filters.sort === "az")
      list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    return list;
  }, [filters]);

  const panelFilterCount =
    (filters.type !== "all" ? 1 : 0) +
    (filters.duration !== "all" ? 1 : 0) +
    (filters.maxPrice !== null ? 1 : 0) +
    (filters.childFriendly ? 1 : 0) +
    (filters.groupDeals ? 1 : 0) +
    (filters.showPromos ? 1 : 0);

  const activeFilterCount = panelFilterCount + (filters.query ? 1 : 0);

  // ── Pinned filter sidebar (desktop only) ────────────────────────────────
  useLayoutEffect(() => {
    const panel = panelRef.current;
    const results = resultsRef.current;

    if (!panel || !results) return;

    const mm = gsap.matchMedia();

    mm.add("(min-width: 1024px)", () => {
      const trigger = ScrollTrigger.create({
        trigger: panel,
        start: `top ${PIN_TOP_OFFSET}px`,
        endTrigger: results,
        end: () => {
          const pinnedHeight = panel.offsetHeight || 0;
          return `bottom ${PIN_TOP_OFFSET + pinnedHeight + 24}px`;
        },
        pin: true,
        pinSpacing: false,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      });

      ScrollTrigger.refresh();

      return () => trigger.kill();
    });

    return () => mm.revert();
  }, []);

  // ── Animated Background Gradient on Scroll ─────────────────────────────
  useLayoutEffect(() => {
    if (!bgRef.current) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: document.body,
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
      },
    });

    tl.to(bgRef.current, {
      backgroundPosition: "100% 100%",
      ease: "none",
    });

    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
    };
  }, []);

  // Content height changes — recalc pins.
  useEffect(() => {
    const raf = requestAnimationFrame(() => ScrollTrigger.refresh());
    const timeout = setTimeout(() => ScrollTrigger.refresh(), 320);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timeout);
    };
  }, [filteredTours.length]);

  // Refresh once all images loaded.
  useEffect(() => {
    const onLoad = () => ScrollTrigger.refresh();
    if (document.readyState === "complete") {
      ScrollTrigger.refresh();
    } else {
      window.addEventListener("load", onLoad);
    }
    return () => window.removeEventListener("load", onLoad);
  }, []);

  const panel = (
    <FilterPanel
      filters={filters}
      setFilter={setFilter}
      typeOptions={typeOptions}
      typeCounts={typeCounts}
      priceCeiling={priceCeiling}
      totalCount={tours.length}
    />
  );

  return (
    <>
      {/* Fix for dark logo/title on dark background at the top of the page */}
      <style>{`
        body.tours-at-top header a[href="/"] img,
        body.tours-at-top header a[href="/"] svg {
          filter: brightness(0) invert(1) drop-shadow(0 2px 4px rgba(0,0,0,0.15)) !important;
          transition: filter 0.3s ease;
        }
        body.tours-at-top header a[href="/"] span,
        body.tours-at-top header a[href="/"] h1,
        body.tours-at-top header a[href="/"] p {
          color: #ffffff !important;
          transition: color 0.3s ease;
        }
      `}</style>

      <Seo
        title="Tours - Cape Frontier"
        description="Explore our variety tours tailored specifically for you."
      />

      {/* Animated Main Background Layer */}
      <div
        ref={bgRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 h-full w-full bg-[linear-gradient(135deg,#ffffff_0%,#eff6ff_40%,#e0e7ff_100%)] bg-[length:200%_200%]"
      />

      {/* Navbar white panel (after scrolling) */}
      <div
        aria-hidden="true"
        className={`pointer-events-none fixed inset-x-0 top-0 z-40 h-24 bg-white shadow-md transition-all duration-500 ease-out ${
          scrolled ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
        }`}
      />

      <div className="relative min-h-screen w-full text-neutral-900">
        {/* Brand band behind the navbar */}
        <div
          aria-hidden="true"
          className="hero-gradient-bl absolute inset-x-0 top-0 h-24 bg-blue-950 sm:h-32"
        />

        {/* Wrapper aligned to bottom of header */}
        <div className="relative pt-24 sm:pt-32">
          
          {/* ── PROMO STRIP (Full Width) ───────────────────────────── */}
          {hasPromos && (
            <div className="relative z-20 w-full overflow-hidden bg-gradient-to-r from-emerald-600 via-green-500 to-emerald-600 py-3 text-white shadow-md">
              <div className="mx-auto flex max-w-[1500px] flex-col items-center justify-between gap-3 px-4 sm:flex-row sm:px-6">
                <div className="flex items-center gap-3 text-center sm:text-left">
                  <span className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20 text-sm sm:flex">
                    ✨
                  </span>
                  <p className="font-bitter text-sm text-white/95">
                    Special offer:{" "}
                    {promoList.length > 1 ? (
                      <span className="relative inline-flex h-5 overflow-hidden align-bottom font-bold text-white">
                        <span
                          key={promoIndex}
                          className="inline-block animate-[promoRollIn_0.4s_ease-out_forwards]"
                        >
                          {promoList[promoIndex]?.title}
                        </span>
                      </span>
                    ) : (
                      <span className="font-bold text-white">{promoList[0]?.title}</span>
                    )}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setFilter({ showPromos: !filters.showPromos })}
                  className={`shrink-0 rounded-full px-5 py-2 text-xs font-bold shadow-sm transition active:scale-95 ${
                    filters.showPromos
                      ? "bg-white text-emerald-700 hover:bg-neutral-50"
                      : "bg-emerald-800/40 text-white hover:bg-emerald-800/60 backdrop-blur-sm"
                  }`}
                >
                  {filters.showPromos ? "Show All Tours" : "View Promo Tours"}
                </button>
              </div>
              <style>{`
                @keyframes promoRollIn {
                  0% { transform: translateY(100%); opacity: 0; }
                  100% { transform: translateY(0); opacity: 1; }
                }
              `}</style>
            </div>
          )}

          {/* ── MAIN CONTENT CONTAINER ──────────────────────────────── */}
          <div className="relative mx-auto w-full max-w-[1500px] px-4 pb-16 pt-6 sm:px-6 sm:pt-8">
            <div className="lg:flex lg:items-start lg:gap-8">
              {/* ── Left filter panel (desktop) ── */}
              <aside
                ref={panelRef}
                data-lenis-prevent
                className="hidden max-h-[calc(100vh-9rem)] w-60 shrink-0 overflow-y-auto overscroll-contain rounded-3xl border border-neutral-200 bg-white p-5 lg:block xl:w-64"
              >
                <div className="mb-5 flex items-center justify-between">
                  <p className="font-frank text-lg font-bold">Filters</p>
                  {panelFilterCount > 0 && (
                    <button
                      type="button"
                      onClick={() =>
                        setFilters((p) => ({
                          ...DEFAULT_FILTERS,
                          query: p.query,
                          sort: p.sort,
                        }))
                      }
                      className="rounded-full border border-red-200 px-3 py-1 text-xs font-bold text-red-600 transition hover:bg-red-50"
                    >
                      Clear ({panelFilterCount})
                    </button>
                  )}
                </div>
                {panel}
              </aside>

              {/* ── Results ── */}
              <main ref={resultsRef} className="min-w-0 flex-1">
                {/* Toolbar */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <div className="relative flex-1">
                    <svg
                      className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    >
                      <circle cx="11" cy="11" r="7" />
                      <path d="m20 20-3.5-3.5" />
                    </svg>
                    <input
                      type="search"
                      value={filters.query}
                      onChange={(e) => setFilter({ query: e.target.value })}
                      placeholder="Search tours…"
                      className="w-full rounded-full border border-neutral-300 bg-white py-3 pl-11 pr-4 text-base outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 sm:text-sm"
                    />
                  </div>

                  <div className="flex gap-2">
                    <select
                      value={filters.sort}
                      onChange={(e) => setFilter({ sort: e.target.value })}
                      aria-label="Sort tours"
                      className="min-w-0 flex-1 rounded-full border border-neutral-300 bg-white px-4 py-3 text-sm font-semibold outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 sm:flex-none"
                    >
                      {SORT_OPTIONS.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.label}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => setSheetOpen(true)}
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-neutral-300 bg-white px-5 py-3 text-sm font-bold text-neutral-800 transition active:scale-95 lg:hidden"
                    >
                      Filters
                      {panelFilterCount > 0 && (
                        <span className="rounded-full bg-blue-600 px-1.5 py-0.5 text-[10px] text-white">
                          {panelFilterCount}
                        </span>
                      )}
                    </button>
                  </div>
                </div>

                {/* Count + clear */}
                <div className="mb-5 mt-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-800" aria-live="polite">
                      Showing <b className="text-neutral-950">{filteredTours.length}</b> of {tours.length} tours. Use filters to narrow down.
                    </p>
                  </div>
                  {activeFilterCount > 0 && (
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="shrink-0 rounded-full border border-red-200 px-3 py-1 text-xs font-bold text-red-600 transition hover:bg-red-50"
                    >
                      Clear all ({activeFilterCount})
                    </button>
                  )}
                </div>

                {/* Grid */}
                {filteredTours.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredTours.map((tour) => (
                      <TourCard
                        key={getTourKey(tour)}
                        tour={tour}
                        onOpen={openQuick}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="mx-auto w-full max-w-xl rounded-3xl border border-neutral-200 bg-white p-10 text-center">
                    <p className="font-frank text-2xl font-bold">
                      No tours found
                    </p>
                    <p className="mt-2 text-sm text-neutral-600">
                      Try removing a filter or widening your price range.
                    </p>
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="mt-5 rounded-full bg-blue-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-700 active:scale-95"
                    >
                      Clear all filters
                    </button>
                  </div>
                )}
              </main>
            </div>

            {/* ── Contact details ─────────────────── */}
            <section
              id="contact-details"
              className="relative mt-20 w-full scroll-mt-28 overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#071f4f] via-blue-900 to-blue-700 text-white shadow-2xl"
            >
              <div
                aria-hidden="true"
                className="absolute -top-24 left-1/2 h-[300px] w-[500px] -translate-x-1/2 rounded-full bg-blue-400/20 blur-[80px]"
              />

              <div className="relative z-10 flex flex-col items-center justify-center px-6 py-16 text-center sm:px-12 sm:py-20">
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-300">
                  Can't find what you're after?
                </p>

                <h3 className="mt-3 max-w-2xl font-frank text-3xl font-bold leading-tight text-white sm:text-4xl">
                  Talk to us about a custom trip
                </h3>

                <p className="mt-4 max-w-xl font-bitter text-base leading-relaxed text-blue-100">
                  Tours, pickup details, private trips, custom routes or booking
                  support. We'll help you choose the right Cape Town experience.
                </p>

                <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <a
                    href={`mailto:${CONTACT_EMAIL}`}
                    className="inline-flex min-h-[52px] w-full items-center justify-center rounded-full bg-white px-8 text-sm font-bold text-blue-900 shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-50 active:scale-95 sm:w-auto"
                  >
                    Email us
                  </a>
                  <a
                    href={`tel:${CONTACT_TEL}`}
                    className="inline-flex min-h-[52px] w-full items-center justify-center rounded-full border border-white/30 px-8 text-sm font-bold text-white backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-white/10 active:scale-95 sm:w-auto"
                  >
                    Call us
                  </a>
                  <Link
                    to="/policies"
                    className="inline-flex min-h-[52px] w-full items-center justify-center rounded-full px-6 text-sm font-semibold text-blue-200 underline-offset-4 transition hover:text-white hover:underline sm:w-auto"
                  >
                    View policies
                  </Link>
                </div>

                <div className="mt-12 flex w-full flex-col items-center justify-center gap-6 sm:flex-row sm:gap-12">
                  <div className="text-center">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-300">
                      Email
                    </p>
                    <a
                      href={`mailto:${CONTACT_EMAIL}`}
                      className="mt-1 block break-words text-sm font-bold text-white transition-colors hover:text-blue-200 hover:underline"
                    >
                      {CONTACT_EMAIL}
                    </a>
                  </div>
                  
                  <div className="hidden h-10 w-px bg-white/20 sm:block" />

                  <div className="text-center">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-300">
                      Number
                    </p>
                    <a
                      href={`tel:${CONTACT_TEL}`}
                      className="mt-1 block text-sm font-bold text-white transition-colors hover:text-blue-200 hover:underline"
                    >
                      {CONTACT_NUMBER}
                    </a>
                  </div>
                </div>

              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Mobile filter sheet */}
      <FilterSheet
        open={sheetOpen}
        onClose={closeSheet}
        resultCount={filteredTours.length}
        onClear={resetFilters}
        canClear={activeFilterCount > 0}
      >
        {panel}
      </FilterSheet>

      {/* Mini details → See full page / Book now */}
      {quickTour && typeof document !== "undefined" && (
        <TourQuickView
          key={getTourKey(quickTour)}
          tour={quickTour}
          onClose={closeQuick}
          onBook={bookFromQuick}
        />
      )}

      {/* Booking drawer */}
      {bookingTour && typeof document !== "undefined" && (
        <BookingDrawer
          key={getTourKey(bookingTour)}
          tour={bookingTour}
          onClose={closeBooking}
        />
      )}
    </>
  );
}

export default Tours;