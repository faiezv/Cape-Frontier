import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Seo from "../components/Seo";
import SiteFooter from "../components/SiteFooter";
import { site } from "../utils/siteConfig.js";
import { tours } from "../data/tours";
import { hasGroupDeal, getDurationBucket } from "../utils/tourHelpers";
import {
  Chip,
  TourCard,
  TourGrid,
  TourQuickView,
} from "../components/Tours/TourCards";
import CurrencySelector from "../components/Tours/CurrencySelector";
import BookingDrawer, { getTourSlug } from "../components/Tours/BookingDrawer";

gsap.registerPlugin(ScrollTrigger);

// ─── Config ──────────────────────────────────────────────────────────────────

// Set to true to bring the filter sidebar / mobile filter sheet back.
const SHOW_FILTERS = false;

// Layout maths (px). Navbar height = logo + py-2:  72 (mobile) / 80 (sm) / 84 (lg).
// The promo bar is PROMO_BAR_HEIGHT tall (88px) and sits flush under the navbar.
// The blue band ends exactly in the middle of the bar (44px over blue, 44px below)
// and the content starts below the bar:
//   mobile: bar 72→160,  band 116px, content starts 160px
//   sm:     bar 80→168,  band 124px, content starts 168px
//   lg:     bar 84→172,  band 128px, content starts 172px
// If you change the bar height, update: bar h-[..], band h-[..], wrapper pt-[..].
const NAVBAR_HEIGHT_LG = 84;
const PROMO_BAR_HEIGHT = 88;
const PIN_GAP = 16;

// Per-site SEO copy for this page
const isZA = site.key === "coza";
const TOURS_TITLE = isZA
  ? "Cape Town Tours | Book in Rand | Cape Frontier"
  : "Cape Town & Western Cape Tours | Cape Frontier";
const TOURS_DESCRIPTION = isZA
  ? "Browse small-group and private Cape Town tours with local rand pricing, from wine routes and hiking to adrenaline experiences."
  : "Browse small-group and private tours across Cape Town and the Western Cape, planned from abroad, from wine routes to hiking and adrenaline.";

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
                className={`flex items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition ${active
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

// ─── Giant hollow tagline (matches the footer width) ─────────────────────────
// SVG text with textLength stretches the glyphs to the exact container width.
// To get a clean hollow outline (no inner lines where glyph contours overlap),
// the text is stroked and then masked with a solid fill of itself, so only the
// OUTER half of the stroke is visible. Visible thickness = strokeWidth / 2.
const TAGLINE = "Explore beyond the ordinary.";
const TAGLINE_COLOR = "#2563eb";

const baseText = {
  fontStyle: "italic",
  fontWeight: 800,
};

function HollowLine({ id, x, y, size, width, stroke, children, viewW, viewH }) {
  const maskId = `tagline-mask-${id}`;
  return (
    <>
      <defs>
        <mask
          id={maskId}
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width={viewW}
          height={viewH}
        >
          <rect x="0" y="0" width={viewW} height={viewH} fill="#fff" />
          <text
            x={x}
            y={y}
            textLength={width}
            lengthAdjust="spacingAndGlyphs"
            className="font-frank"
            fontSize={size}
            style={baseText}
            fill="#000"
          >
            {children}
          </text>
        </mask>
      </defs>
      <text
        x={x}
        y={y}
        textLength={width}
        lengthAdjust="spacingAndGlyphs"
        className="font-frank"
        fontSize={size}
        style={baseText}
        fill="none"
        stroke={TAGLINE_COLOR}
        strokeWidth={stroke}
        strokeLinejoin="round"
        mask={`url(#${maskId})`}
      >
        {children}
      </text>
    </>
  );
}

function BigTagline() {
  return (
    <div
      className="w-full select-none overflow-hidden opacity-60"
      role="img"
      aria-label={TAGLINE}
    >
      {/* Mobile: two lines */}
      <svg
        viewBox="0 0 1000 310"
        className="block h-auto w-full sm:hidden"
        aria-hidden="true"
      >
        <HollowLine id="m1" x={16} y={135} size={140} width={960} stroke={14} viewW={1000} viewH={310}>
          Explore beyond
        </HollowLine>
        <HollowLine id="m2" x={16} y={285} size={140} width={960} stroke={14} viewW={1000} viewH={310}>
          the ordinary.
        </HollowLine>
      </svg>

      {/* sm and up: one line */}
      <svg
        viewBox="0 0 1000 120"
        className="hidden h-auto w-full sm:block"
        aria-hidden="true"
      >
        <HollowLine id="d" x={10} y={92} size={92} width={976} stroke={7} viewW={1000} viewH={120}>
          {TAGLINE}
        </HollowLine>
      </svg>
    </div>
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

  // Where the pinned sidebar should stick (below navbar panel + promo bar)
  const pinTopOffset =
    NAVBAR_HEIGHT_LG + (hasPromos ? PROMO_BAR_HEIGHT : 0) + PIN_GAP;

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
    if (!SHOW_FILTERS) return undefined;

    const panel = panelRef.current;
    const results = resultsRef.current;

    if (!panel || !results) return undefined;

    const mm = gsap.matchMedia();

    mm.add("(min-width: 1024px)", () => {
      const trigger = ScrollTrigger.create({
        trigger: panel,
        start: `top ${pinTopOffset}px`,
        endTrigger: results,
        end: () => {
          const pinnedHeight = panel.offsetHeight || 0;
          return `bottom ${pinTopOffset + pinnedHeight + 24}px`;
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
  }, [pinTopOffset]);

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

      {/* path is required: without it the canonical becomes `${origin}undefined` */}
      <Seo
        title={TOURS_TITLE}
        description={TOURS_DESCRIPTION}
        path="/tours"
        regionalTag={false}
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
        className={`pointer-events-none fixed inset-x-0 top-0 z-40 h-[73px] bg-white shadow-md sm:h-[81px] lg:h-[85px] transition-all duration-500 ease-out ${scrolled ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
          }`}
      />

      {/* ── PROMO BAR (fixed, 88px, flush under the navbar) ───────────
          Its vertical centre lines up with the bottom edge of the blue band
          (50/50 split). */}
      {hasPromos && (
        <div className="fixed inset-x-0 top-[72px] z-30 h-[88px] overflow-hidden bg-gradient-to-r from-emerald-600 via-green-500 to-emerald-600 text-white shadow-md sm:top-[80px] lg:top-[84px]">
          <div className="mx-auto flex h-full w-full max-w-[1500px] items-center justify-between gap-3 px-4 sm:px-6">
            <p className="h-6 min-w-0 overflow-hidden truncate font-bitter text-xl leading-6 text-white/95">
              <span aria-hidden="true">✨ </span>
              Special offer:{" "}
              {promoList.length > 1 ? (
                <span
                  key={promoIndex}
                  className="inline-block max-w-full animate-[promoRollIn_0.4s_ease-out_forwards] align-bottom font-bold text-white"
                >
                  {promoList[promoIndex]?.title}
                </span>
              ) : (
                <span className="font-bold text-white">
                  {promoList[0]?.title}
                </span>
              )}
            </p>
            <button
              type="button"
              onClick={() => setFilter({ showPromos: !filters.showPromos })}
              className={`inline-flex h-[18px] shrink-0 items-center whitespace-nowrap rounded-full px-3 text-[10px] font-bold leading-none transition active:scale-95 ${filters.showPromos
                ? "bg-white text-emerald-700 hover:bg-neutral-50"
                : "bg-emerald-800/40 text-white hover:bg-emerald-800/60"
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

      <div className="relative min-h-screen w-full text-neutral-900">
        {/* Brand band behind the navbar; ends mid-way through the promo bar */}
        <div
          aria-hidden="true"
          className="hero-gradient-bl absolute inset-x-0 top-0 h-[116px] bg-blue-950 sm:h-[124px] lg:h-[128px]"
        />

        {/* Content wrapper: top padding = navbar height + promo bar height, so
            the search bar / grid always start BELOW the fixed promo bar. */}
        <div
          className={`relative ${hasPromos
            ? "pt-[160px] sm:pt-[168px] lg:pt-[172px]"
            : "pt-[116px] sm:pt-[124px] lg:pt-[128px]"
            }`}
        >
          {/* ── MAIN CONTENT CONTAINER ──────────────────────────────── */}
          <div className="relative mx-auto w-full max-w-[1500px] px-4 pb-16 pt-6 sm:px-6 sm:pt-8">
            <div className="lg:flex lg:items-start lg:gap-8">
              {/* ── Left filter panel (desktop) ── */}
              {SHOW_FILTERS && (
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
              )}

              {/* ── Results ── */}
              <main ref={resultsRef} className="min-w-0 flex-1">
                {/* Toolbar */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <CurrencySelector />

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

                    {SHOW_FILTERS && (
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
                    )}
                  </div>
                </div>

                {/* Count + clear */}
                <div className="mb-5 mt-4 flex items-center justify-between">
                  <div>
                    <p
                      className="text-sm font-medium text-neutral-800"
                      aria-live="polite"
                    >
                      Showing{" "}
                      <b className="text-neutral-950">{filteredTours.length}</b>{" "}
                      of {tours.length} tours. Use filters to narrow down.
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
                  <TourGrid>
                    {filteredTours.map((tour) => (
                      <TourCard
                        key={getTourKey(tour)}
                        tour={tour}
                        onOpen={openQuick}
                      />
                    ))}
                  </TourGrid>
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
          </div>
        </div>
      </div>

      {/* Site footer + tagline share one container so their widths match.
          The id keeps old #contact-details links working. */}
      <div
        id="contact-details"
        className="mx-auto w-full max-w-7xl scroll-mt-40 px-4 pb-6 sm:px-6 sm:pb-8 lg:px-8"
      >
        <SiteFooter />
        <div className="mt-6 sm:mt-8">
          {/* <BigTagline /> */}
        </div>
      </div>

      {/* Mobile filter sheet */}
      {SHOW_FILTERS && (
        <FilterSheet
          open={sheetOpen}
          onClose={closeSheet}
          resultCount={filteredTours.length}
          onClear={resetFilters}
          canClear={activeFilterCount > 0}
        >
          {panel}
        </FilterSheet>
      )}

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