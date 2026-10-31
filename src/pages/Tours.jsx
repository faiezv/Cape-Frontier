import React, {
  lazy,
  Suspense,
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
import ClientOnly from "../components/ClientOnly";
import CheckoutSummary from "../components/CheckoutSummary";
import TourOptions from "../components/TourDetails/TourOptions.jsx";
import AdditionalPricing from "../components/TourDetails/AdditionalPricing";
import KidsActivities from "../components/TourDetails/KidsActivities.jsx";
import { KIDS_ACTIVITIES } from "../data/kidsActivities.js";
// Display-only pricing blocks (same ones TourDetails uses)
import TourPricing from "../components/TourDetails/TourPricing";
import TourAdditionalPricing from "../components/TourDetails/TourAdditionalPricing";
import TourGroupPricing from "../components/TourDetails/TourGroupPricing";
import { tours } from "../data/tours";
import { resolveImage } from "../utils/ImageLoader";
import { hasGroupDeal, getDurationBucket, getPriceLabel } from "../utils/tourHelpers";
import { getTourPromo, getPromoPrice } from "../data/promos";
import {
  computePricing,
  convertPrice,
  formatMoney,
} from "../utils/pricingEngine.js";

// Leaflet only runs in the browser (same fix as Booking.jsx)
const Map = lazy(() => import("../components/Map"));

gsap.registerPlugin(ScrollTrigger);

const PIN_TOP_OFFSET = 96;
const MAX_PEOPLE = 8;
const DEFAULT_CENTER = { lat: -33.9249, lng: 18.4241 };

const CONTACT_EMAIL = "admin@cape-frontier.co.za";
const CONTACT_NUMBER = "(+27)72 264 7284";
const CONTACT_TEL = "+27722647284";

// ─── Config ──────────────────────────────────────────────────────────────────

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
  promoOnly: false,
  sort: "featured",
};

const BANNERS = [
  {
    id: "group",
    eyebrow: "Travelling with friends?",
    title: "Save more when you book as a group",
    text: "Many tours drop the per-person price as your group grows.",
    cta: "Show group deals",
    apply: { groupDeals: true },
    className: "from-green-200 to-emerald-100 text-green-950",
  },
  {
    id: "family",
    eyebrow: "Family friendly",
    title: "Adventures the whole family can enjoy",
    text: "Kids' activities, discounted child rates and relaxed itineraries.",
    cta: "Show family tours",
    apply: { childFriendly: true },
    className: "from-sky-200 to-blue-100 text-blue-950",
  },
  {
    id: "multi",
    eyebrow: "Go further",
    title: "Multi-day Garden Route journeys",
    text: "Safaris, caves, forests and coastline with a private driver-guide.",
    cta: "Show multi-day tours",
    apply: { duration: "multi-day" },
    className: "from-amber-200 to-orange-100 text-amber-950",
  },
  {
    id: "custom",
    eyebrow: "Something different?",
    title: "Need a custom trip?",
    text: "Tell us what you have in mind and we'll plan it around you.",
    cta: "Contact us",
    to: "#contact-details",
    className: "from-fuchsia-200 to-pink-100 text-fuchsia-950",
  },
];

const BANNER_EVERY = 6;

// ─── Booking / checkout helpers ──────────────────────────────────────────────

const getTourSlug = (tour) =>
  tour?.slug ||
  String(tour?.title || tour?.info || "")
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const toMinorUnit = (amount, currency) => {
  const n = Number(amount);
  if (!Number.isFinite(n)) return 0;
  const zeroDecimal = new Set(["JPY", "KRW"]);
  return zeroDecimal.has(String(currency).toUpperCase())
    ? Math.round(n)
    : Math.round(n * 100);
};

const generateBookingReference = () =>
  `TOUR-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;

const formatDisplayTime = (value) => {
  if (!value) return "";
  const text = String(value).trim();
  if (!text || /\b(am|pm)\b/i.test(text)) return text;
  return text.replace(/\b([01]?\d|2[0-3]):([0-5]\d)\b/g, (_, h, m) => {
    const hour = Number(h);
    return `${hour % 12 || 12}:${m} ${hour >= 12 ? "PM" : "AM"}`;
  });
};

const getPickupTime = (tour) => {
  const direct = tour?.pickupTime || tour?.startTime || tour?.departureTime;
  if (direct) return formatDisplayTime(direct);
  const pickupStop = tour?.stops?.find((s) => {
    const text = `${s?.id || ""} ${s?.name || ""}`.toLowerCase();
    return (text.includes("pickup") || text.includes("meeting")) && s?.time;
  });
  if (pickupStop?.time) return formatDisplayTime(pickupStop.time);
  const firstTimed = tour?.stops?.find((s) => s?.time);
  return firstTimed?.time ? formatDisplayTime(firstTimed.time) : "To be confirmed";
};

const getCheckoutStops = (tour) =>
  Array.isArray(tour?.stops)
    ? tour.stops
        .map((stop, i) => ({
          id: stop?.id || i + 1,
          name: stop?.name || stop?.title || `Stop ${i + 1}`,
          time: formatDisplayTime(stop?.time || ""),
          duration: stop?.duration || "",
        }))
        .filter((s) => s.name)
    : [];

const toLocalISODate = (d) => {
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const getMinDate = (tour) => {
  const d = new Date();
  const days =
    typeof tour?.daysInAdvance === "number" && tour.daysInAdvance >= 0
      ? tour.daysInAdvance
      : 1;
  d.setDate(d.getDate() + days);
  return toLocalISODate(d);
};

// ─── Small components ────────────────────────────────────────────────────────

function Chip({ active, onClick, children, count }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition active:scale-95 ${
        active
          ? "border-blue-600 bg-blue-600 text-white shadow"
          : "border-black/10 bg-white text-neutral-700 hover:border-blue-300 hover:bg-blue-50"
      }`}
    >
      {children}
      {count !== undefined && (
        <span
          className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
            active ? "bg-white/25 text-white" : "bg-neutral-100 text-neutral-500"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

function PromoBadge({ promo, className = "" }) {
  if (!promo) return null;
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${promo.className} ${className}`}
    >
      {promo.label}
    </span>
  );
}

function Banner({ banner, onApply }) {
  const btn =
    "w-fit shrink-0 rounded-full bg-black px-5 py-2.5 text-sm font-bold text-white transition hover:scale-105 active:scale-95";
  return (
    <div className="col-span-full">
      <div
        className={`flex flex-col gap-3 rounded-3xl bg-gradient-to-r p-5 shadow-lg sm:flex-row sm:items-center sm:justify-between sm:p-6 ${banner.className}`}
      >
        <div className="max-w-xl">
          <p className="text-[11px] font-black uppercase tracking-[0.2em] opacity-60">
            {banner.eyebrow}
          </p>
          <h3 className="mt-1 font-frank text-xl font-bold leading-tight sm:text-2xl">
            {banner.title}
          </h3>
          <p className="mt-1 font-bitter text-sm opacity-75">{banner.text}</p>
        </div>

        {banner.to ? (
          <a href={banner.to} className={btn}>
            {banner.cta} →
          </a>
        ) : (
          <button type="button" onClick={() => onApply(banner.apply)} className={btn}>
            {banner.cta} →
          </button>
        )}
      </div>
    </div>
  );
}

const getItemText = (item) => {
  if (!item) return "";
  return typeof item === "string" ? item : item.text || item.name || "";
};

// Compact per-category prices (Adult R1,200 · Child R900 …) + extras count
function PriceChips({ tour }) {
  const rows = (tour.pricing || []).filter((p) => Number(p.pricePerPerson) > 0).slice(0, 4);
  const extras = tour.additionalPricing?.length || 0;
  if (!rows.length && !extras) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {rows.map((p) => (
        <span
          key={p.category}
          className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-800"
        >
          {p.category} · R{Number(p.pricePerPerson).toLocaleString()}
        </span>
      ))}
      {extras > 0 && (
        <span className="rounded-full bg-green-100 px-2.5 py-1 text-[11px] font-semibold text-green-900">
          +{extras} extra{extras !== 1 ? "s" : ""}
        </span>
      )}
    </div>
  );
}

function DetailBlock({ title, children }) {
  return (
    <section>
      <h3 className="mb-3 font-frank text-xl font-bold leading-none text-neutral-950">{title}</h3>
      {children}
    </section>
  );
}

function TickList({ items, plain = false, single = false }) {
  return (
    <ul className={`grid gap-2 ${single ? "" : "sm:grid-cols-2"}`}>
      {items.map((text, i) => (
        <li
          key={i}
          className="flex gap-2 rounded-xl border border-blue-100 bg-blue-50/50 p-3 font-bitter text-sm leading-relaxed text-neutral-700"
        >
          <span
            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
              plain ? "bg-neutral-200 text-neutral-600" : "bg-green-200 text-green-950"
            }`}
          >
            {plain ? "—" : "✓"}
          </span>
          {text}
        </li>
      ))}
    </ul>
  );
}

// Full-width card that replaces the grid card in place. Opens/closes with GSAP.
function ExpandedTourCard({ tour, onClose, onBook }) {
  const ref = useRef(null);
  const bodyRef = useRef(null);
  const closingRef = useRef(false);
  const promo = getTourPromo(tour);
  const { amount, note } = getPriceLabel(tour);
  const finalAmount = getPromoPrice(amount, promo);
  const discounted = promo?.discountPercent > 0;

  const toList = (v) => (Array.isArray(v) ? v.map(getItemText).filter(Boolean) : []);
  const included = toList(tour.included);
  const excluded = toList(tour.excluded);
  const hasExtras = tour.additionalPricing?.length > 0;

  useLayoutEffect(() => {
    const el = ref.current;
    const body = bodyRef.current;
    if (!el || !body) return undefined;

    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const ctx = gsap.context(() => {
      if (reduce) {
        gsap.set(el, { opacity: 1 });
        return;
      }
      const tl = gsap.timeline({
        onComplete: () => {
          gsap.set(el, { clearProps: "height" });
          ScrollTrigger.refresh();
        },
      });
      tl.fromTo(
        el,
        { height: 0, opacity: 0 },
        { height: "auto", opacity: 1, duration: 0.65, ease: "power3.inOut" },
      ).fromTo(
        body.children,
        { y: 16, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.4,
          stagger: 0.07,
          ease: "power2.out",
          clearProps: "transform,opacity,visibility",
        },
        "-=0.3",
      );
    }, el);

    const t = window.setTimeout(
      () => el.scrollIntoView({ behavior: "smooth", block: "start" }),
      120,
    );
    return () => {
      window.clearTimeout(t);
      ctx.revert();
    };
  }, []);

  const handleClose = () => {
    const el = ref.current;
    if (closingRef.current) return;
    closingRef.current = true;
    if (!el) return onClose();
    gsap.to(el, {
      height: 0,
      opacity: 0,
      duration: 0.5,
      ease: "power3.inOut",
      onComplete: onClose,
    });
  };

  return (
    <article
      ref={ref}
      className="col-span-full scroll-mt-28 overflow-hidden rounded-3xl border border-black/5 bg-white text-black shadow-xl"
    >
      {/* Image on top */}
      <div className="relative h-44 sm:h-60 lg:h-72">
        <img
          src={resolveImage(tour.image)}
          alt={tour.title}
          className="absolute inset-0 h-full w-full object-cover"
          onError={(e) => {
            e.currentTarget.src = "/images/content/random/1.webp";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute left-4 top-4">
          <PromoBadge promo={promo} />
        </div>
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close details"
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-neutral-700 shadow transition hover:bg-white"
        >
          ✕
        </button>
        <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-7">
          <h2 className="font-frank text-3xl font-bold leading-[0.95] sm:text-4xl">{tour.title}</h2>
          <p className="mt-2 text-xs font-semibold text-white/80">
            {[tour.duration, tour.location].filter(Boolean).join(" · ")}
          </p>
        </div>
      </div>

      {/* Pricing + inclusions only */}
      <div ref={bodyRef} className="space-y-7 p-5 sm:p-7">
        <div>
          {promo?.headline && <p className="text-sm font-bold text-red-600">{promo.headline}</p>}
          <p className="font-frank text-lg font-bold text-blue-700">
            From{" "}
            {discounted && (
              <s className="mr-1 text-sm font-semibold text-neutral-400">R{amount.toLocaleString()}</s>
            )}
            R{finalAmount.toLocaleString()}
            {note && <span className="ml-2 text-xs font-semibold text-neutral-400">{note}</span>}
          </p>
        </div>

        {(tour.pricing?.length > 0 || hasExtras || tour.groupPricing?.enabled) && (
          <div className={`grid gap-7 ${hasExtras ? "lg:grid-cols-2" : ""}`}>
            <div className="min-w-0 space-y-7">
              {tour.pricing?.length > 0 && (
                <DetailBlock title="Tour pricing">
                  <TourPricing pricing={tour.pricing} />
                </DetailBlock>
              )}
              {tour.groupPricing?.enabled && (
                <DetailBlock title="Group pricing">
                  <TourGroupPricing groupPricing={tour.groupPricing} />
                </DetailBlock>
              )}
            </div>
            {hasExtras && (
              <div className="min-w-0">
                <DetailBlock title="Additional pricing">
                  <TourAdditionalPricing pricing={tour.additionalPricing} />
                </DetailBlock>
              </div>
            )}
          </div>
        )}

        {(included.length > 0 || excluded.length > 0) && (
          <div className="grid gap-7 lg:grid-cols-2">
            {included.length > 0 && (
              <DetailBlock title="What's included">
                <TickList items={included} single />
              </DetailBlock>
            )}
            {excluded.length > 0 && (
              <DetailBlock title="Not included">
                <TickList items={excluded} plain single />
              </DetailBlock>
            )}
          </div>
        )}

        <div className="flex flex-col gap-2 border-t border-black/5 pt-5 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-full border border-black/10 px-5 py-2.5 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50"
          >
            Close
          </button>
          <Link
            to={`/tours/${tour.slug}`}
            state={{ tour }}
            className="rounded-full border border-blue-200 px-5 py-2.5 text-center text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
          >
            Open full page
          </Link>
          <button
            type="button"
            onClick={() => onBook(tour)}
            className="rounded-full bg-blue-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700 active:scale-95"
          >
            Book now
          </button>
        </div>
      </div>
    </article>
  );
}

function TourCard({ tour, onBook, onExpand }) {
  const promo = getTourPromo(tour);
  const { amount, note } = getPriceLabel(tour);
  const finalAmount = getPromoPrice(amount, promo);
  const discounted = promo?.discountPercent > 0;

  return (
    <article className="flex flex-col overflow-hidden rounded-sm border border-black/5 bg-white shadow-lg transition hover:-translate-y-1 hover:shadow-xl">
      <div className="relative">
        <img
          src={resolveImage(tour.image)}
          alt={tour.title}
          loading="lazy"
          className="aspect-[4/3] w-full object-cover"
          onError={(e) => {
            e.currentTarget.src = "/images/content/random/1.webp";
          }}
        />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <PromoBadge promo={promo} />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-4 text-black">
        <h2 className="font-frank text-xl font-bold leading-tight">{tour.title}</h2>
        <p className="text-xs font-semibold text-neutral-400">{tour.duration}</p>
        {promo?.headline && (
          <p className="text-xs font-bold text-red-600">{promo.headline}</p>
        )}
        <p className="line-clamp-3 font-bitter text-sm text-neutral-600">
          {tour.description}
        </p>

        <PriceChips tour={tour} />

        <div className="mt-auto flex flex-wrap items-end justify-between gap-2 pt-2">
          <span className="font-frank text-sm font-bold text-blue-700">
            From{" "}
            {discounted && (
              <s className="mr-1 text-xs font-semibold text-neutral-400">
                R{amount.toLocaleString()}
              </s>
            )}
            R{finalAmount.toLocaleString()}
            {note && (
              <span className="block text-[10px] font-semibold text-neutral-400">
                {note}
              </span>
            )}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onExpand(tour)}
              className="rounded-full border border-blue-200 px-3 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 active:scale-95"
            >
              See details
            </button>
            <button
              type="button"
              onClick={() => onBook(tour)}
              className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 active:scale-95"
            >
              Book now
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

// Large card, used when exactly one tour is featured
function FeaturedPromoCard({ tour, promo, onBook }) {
  const { amount, note } = getPriceLabel(tour);
  const finalAmount = getPromoPrice(amount, promo);
  const discounted = promo.discountPercent > 0;

  return (
    <button
      type="button"
      onClick={() => onBook(tour)}
      className="group block w-full overflow-hidden rounded-2xl border border-black/5 bg-white text-left text-black shadow-md transition hover:-translate-y-0.5 hover:shadow-xl"
    >
      <div className="relative">
        <img
          src={resolveImage(tour.image)}
          alt={tour.title}
          loading="lazy"
          className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.src = "/images/content/random/1.webp";
          }}
        />
        <div className="absolute left-3 top-3">
          <PromoBadge promo={promo} />
        </div>
      </div>

      <div className="p-4">
        <h4 className="font-frank text-xl font-bold leading-tight">{tour.title}</h4>
        <p className="mt-1 text-xs font-semibold text-neutral-400">{tour.duration}</p>
        <p className="mt-2 text-sm font-bold text-red-600">{promo.headline}</p>
        <p className="mt-2 line-clamp-3 font-bitter text-sm text-neutral-600">
          {tour.description}
        </p>

        <div className="mt-3 flex items-end justify-between gap-2">
          <span className="font-frank text-sm font-bold text-blue-700">
            From{" "}
            {discounted && (
              <s className="mr-1 text-xs font-semibold text-neutral-400">
                R{amount.toLocaleString()}
              </s>
            )}
            R{finalAmount.toLocaleString()}
            {note && (
              <span className="block text-[10px] font-semibold text-neutral-400">
                {note}
              </span>
            )}
          </span>
          <span className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition group-hover:bg-blue-700">
            Book now
          </span>
        </div>
      </div>
    </button>
  );
}

// Compact card used in the sidebar list and the mobile scroller (2+ promos)
function PromoMiniCard({ tour, promo, onBook, className = "" }) {
  const { amount } = getPriceLabel(tour);
  const finalAmount = getPromoPrice(amount, promo);
  const discounted = promo.discountPercent > 0;

  return (
    <button
      type="button"
      onClick={() => onBook(tour)}
      className={`group flex w-full gap-3 rounded-2xl border border-black/5 bg-white p-2 text-left text-black shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${className}`}
    >
      <img
        src={resolveImage(tour.image)}
        alt=""
        loading="lazy"
        className="h-20 w-20 shrink-0 rounded-xl object-cover"
        onError={(e) => {
          e.currentTarget.src = "/images/content/random/1.webp";
        }}
      />
      <div className="min-w-0 flex-1">
        <PromoBadge promo={promo} className="!px-2 !py-0.5 !text-[9px]" />
        <p className="mt-1 line-clamp-2 font-frank text-sm font-bold leading-tight">
          {tour.title}
        </p>
        <p className="mt-0.5 line-clamp-1 text-[11px] font-semibold text-red-600">
          {promo.headline}
        </p>
        <p className="mt-0.5 text-xs font-bold text-blue-700">
          {discounted && (
            <s className="mr-1 font-semibold text-neutral-400">
              R{amount.toLocaleString()}
            </s>
          )}
          R{finalAmount.toLocaleString()}
        </p>
      </div>
    </button>
  );
}

// ─── Booking drawer: everything up to Paystack on one screen ────────────────

const inputClass =
  "w-full rounded-2xl border border-neutral-200 bg-white p-3.5 text-base outline-none transition focus:border-green-400 focus:ring-4 focus:ring-green-100";

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.16em] text-neutral-500">
        {label}
      </span>
      {children}
    </label>
  );
}

function Section({ n, title, sub, done, children }) {
  return (
    <section className="rounded-[1.5rem] border border-black/5 bg-white p-4 shadow-[0_10px_28px_rgba(0,0,0,0.04)] sm:p-5">
      <div className="mb-4 flex items-center gap-3">
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl text-sm font-bold ring-1 ${
            done
              ? "bg-green-500 text-white ring-green-500"
              : "bg-green-100 text-green-950 ring-green-200"
          }`}
        >
          {done ? "✓" : n}
        </span>
        <div>
          <h3 className="font-frank text-xl leading-none text-neutral-950">{title}</h3>
          {sub && <p className="mt-1 text-xs text-neutral-500">{sub}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

function ToggleCard({ active, title, text, price, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex flex-1 flex-col justify-between rounded-2xl border p-4 text-left transition ${
        active
          ? "border-green-300 bg-green-200 text-green-950"
          : "border-black/5 bg-white text-neutral-700 hover:border-green-200 hover:bg-green-50"
      }`}
    >
      <span className="flex items-center justify-between gap-2">
        <span className="text-sm font-bold">{title}</span>
        <span className="rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-bold text-neutral-500">
          {active ? "Added" : "Optional"}
        </span>
      </span>
      <span className="mt-1 text-xs leading-5 opacity-75">{text}</span>
      <span className="mt-2 text-xs font-bold">{price}</span>
    </button>
  );
}

function Stepper({ label, hint, value, onMinus, onPlus, minusDisabled, plusDisabled }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-green-100 bg-white p-3">
      <div>
        <p className="font-bold text-black">{label}</p>
        {hint && <p className="mt-0.5 text-xs text-neutral-500">{hint}</p>}
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onMinus}
          disabled={minusDisabled}
          aria-label={`Fewer ${label.toLowerCase()}`}
          className="flex h-10 w-10 items-center justify-center rounded-2xl border border-black/10 bg-white text-xl font-bold text-neutral-700 transition hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-35"
        >
          −
        </button>
        <span className="flex h-10 min-w-12 items-center justify-center rounded-2xl border border-green-200 px-4 font-frank text-2xl font-bold text-green-950">
          {value}
        </span>
        <button
          type="button"
          onClick={onPlus}
          disabled={plusDisabled}
          aria-label={`More ${label.toLowerCase()}`}
          className="flex h-10 w-10 items-center justify-center rounded-2xl border border-green-200 bg-white text-xl font-bold text-green-950 transition hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-35"
        >
          +
        </button>
      </div>
    </div>
  );
}

const CHILD_CATEGORIES = [
  { key: "toddler", icon: "🧒", label: "Toddler", range: "0–5", age: 3 },
  { key: "child", icon: "👦", label: "Child", range: "6–11", age: 8 },
  { key: "teen", icon: "🧑", label: "Teen", range: "12–17", age: 14 },
];

const categoryOf = (age) =>
  Number(age) <= 5 ? CHILD_CATEGORIES[0] : Number(age) <= 11 ? CHILD_CATEGORIES[1] : CHILD_CATEGORIES[2];

function BookingDrawer({ tour, onClose }) {
  const minPeople = Math.min(Math.max(Number(tour.minPeople) || 1, 1), MAX_PEOPLE);
  const supportedCurrencies =
    tour.supportedCurrencies?.length > 0
      ? tour.supportedCurrencies
      : ["ZAR", "USD", "EUR", "GBP"];

  const [currency, setCurrency] = useState("ZAR");
  const [form, setForm] = useState({
    fullName: "",
    mobile: "",
    email: "",
    date: "",
    adults: minPeople,
    childAges: [],
    pickupLocation: "",
    pickupCoords: null,
    isPrivate: false,
    isCustom: false,
    selectedOption: null,
    selectedExtras: {},
    selectedKidsActivity: null,
    notes: "",
  });
  const patch = (p) => setForm((prev) => ({ ...prev, ...p }));

  // Pickup / map
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [markerPosition, setMarkerPosition] = useState(null);
  const [pendingPickup, setPendingPickup] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");

  // Price verification + payment
  const [verifyStatus, setVerifyStatus] = useState("idle"); // idle | pending | verified | failed
  const [verifyError, setVerifyError] = useState("");
  const [verifiedToken, setVerifiedToken] = useState(null);
  const [verifyRetry, setVerifyRetry] = useState(0);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState("");
  const [fadeOut, setFadeOut] = useState(false);

  const scrollRef = useRef(null);

  // Lock page scroll while the drawer is open
  useEffect(() => {
    const html = document.documentElement.style.overflow;
    const body = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    window.lenis?.stop?.();
    const onKey = (e) => e.key === "Escape" && !paying && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = html;
      document.body.style.overflow = body;
      window.lenis?.start?.();
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose, paying]);

  // ── Derived counts ────────────────────────────────────────────────
  const adultCount = Math.max(Number(form.adults) || 1, 1);
  const childAges = form.childAges;
  const toddlers = childAges.filter((a) => a <= 5).length;
  const children = childAges.filter((a) => a >= 6 && a <= 11).length;
  const teens = childAges.filter((a) => a >= 12 && a <= 17).length;
  const participantCount = adultCount + childAges.length;
  const canAddChild = tour.childFriendly !== false && participantCount < MAX_PEOPLE;

  const contactComplete = Boolean(
    form.fullName.trim() && form.mobile.trim() && form.email.trim(),
  );
  const dateComplete = Boolean(form.date);
  const pickupComplete = Boolean(form.pickupCoords);
  const optionsOk = !(Array.isArray(tour.options) && tour.options.length > 0) || Boolean(form.selectedOption);

  // ── Pricing (single source of truth: pricingEngine) ───────────────
  const pricing = useMemo(
    () =>
      computePricing({
        tour,
        childAges,
        adultCount,
        currency,
        selectedOption: form.selectedOption,
        selectedExtras: form.selectedExtras || {},
        formData: { ...form, adults: String(adultCount) },
        kidsActivities: KIDS_ACTIVITIES,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      tour,
      JSON.stringify(childAges),
      adultCount,
      currency,
      form.selectedOption,
      JSON.stringify(form.selectedExtras),
      form.isPrivate,
      form.isCustom,
      form.selectedKidsActivity,
    ],
  );

  const totalAmountLabel = formatMoney(pricing.finalTotal, currency);
  const totalMinorUnit = toMinorUnit(pricing.finalTotal, currency);

  // ── Pre-flight price verification (same contract as Booking.jsx) ──
  useEffect(() => {
    if (pricing.isCustomQuote) {
      setVerifyStatus("idle");
      setVerifiedToken(null);
      return;
    }

    const ready =
      contactComplete && dateComplete && pickupComplete && (!pricing.hasOptions || form.selectedOption);

    if (!ready) {
      setVerifyStatus("idle");
      setVerifyError("");
      setVerifiedToken(null);
      return;
    }

    const controller = new AbortController();
    let cancelled = false;
    setVerifyStatus("pending");
    setVerifyError("");
    setVerifiedToken(null);

    const timer = setTimeout(async () => {
      try {
        const res = await fetch("/api/verify-price", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            tourId: tour.id ?? getTourSlug(tour),
            adultCount,
            childAges,
            currency,
            selectedOption: form.selectedOption,
            selectedExtras: form.selectedExtras || {},
            isPrivate: form.isPrivate,
            isCustom: form.isCustom,
            selectedKidsActivity: form.selectedKidsActivity,
          }),
        });
        if (cancelled) return;

        const contentType = res.headers.get("content-type") || "";
        if (res.status === 404 || res.status === 405 || contentType.includes("text/html")) {
          console.warn("[Tours] /api/verify-price unavailable; using client-side price.");
          setVerifyStatus("verified");
          setVerifiedToken(null);
          return;
        }
        if (!res.ok) {
          let detail = "";
          try {
            const j = await res.json();
            detail = j?.error || j?.message || "";
          } catch {
            /* not JSON */
          }
          throw new Error(detail || `HTTP ${res.status}`);
        }
        const data = await res.json();
        if (cancelled) return;
        if (data?.isCustomQuote) {
          setVerifyStatus("idle");
          return;
        }
        setVerifyStatus("verified");
        setVerifiedToken(data?.token || null);
      } catch (err) {
        if (cancelled || err.name === "AbortError") return;
        console.error("[Tours] Price verification failed:", err);
        setVerifyStatus("failed");
        setVerifyError(err?.message || "Price verification failed");
      }
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    tour,
    adultCount,
    JSON.stringify(childAges),
    currency,
    form.selectedOption,
    JSON.stringify(form.selectedExtras),
    form.isPrivate,
    form.isCustom,
    form.selectedKidsActivity,
    contactComplete,
    dateComplete,
    pickupComplete,
    pricing.isCustomQuote,
    pricing.hasOptions,
    verifyRetry,
  ]);

  // ── Guests ────────────────────────────────────────────────────────
  const changeAdults = (delta) =>
    setForm((prev) => {
      const next = Math.min(
        Math.max((Number(prev.adults) || 1) + delta, 1),
        MAX_PEOPLE - prev.childAges.length,
      );
      if (next + prev.childAges.length < minPeople) return prev;
      return { ...prev, adults: next };
    });

  const addChild = (age) => {
    if (!canAddChild) return;
    setForm((prev) => ({ ...prev, childAges: [...prev.childAges, age] }));
  };

  const removeChild = (index) =>
    setForm((prev) => ({
      ...prev,
      childAges: prev.childAges.filter((_, i) => i !== index),
      adults: Math.max(
        prev.adults,
        minPeople - (prev.childAges.length - 1),
      ),
    }));

  // ── Pickup ────────────────────────────────────────────────────────
  const handleMapPick = async (coords) => {
    setMarkerPosition(coords);
    setMapCenter(coords);
    setLocationError("");
    const fallback = `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`;
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coords.lat}&lon=${coords.lng}`,
      );
      const data = await res.json();
      setPendingPickup({ location: data?.display_name || fallback, coords });
      patch({ pickupLocation: data?.display_name || fallback });
    } catch {
      setPendingPickup({ location: fallback, coords });
      patch({ pickupLocation: fallback });
    }
  };

  const handleFindAddress = async () => {
    const q = form.pickupLocation.trim();
    if (!q) {
      setLocationError("Enter a pickup address first.");
      return;
    }
    try {
      setLocationLoading(true);
      setLocationError("");
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(q)}`,
      );
      if (!res.ok) throw new Error("Search failed");
      const data = await res.json();
      if (!data.length) {
        setLocationError("No matching location found.");
        return;
      }
      const coords = { lat: Number(data[0].lat), lng: Number(data[0].lon) };
      setMarkerPosition(coords);
      setMapCenter(coords);
      setPendingPickup({ location: data[0].display_name || q, coords });
    } catch {
      setLocationError("Could not find that address.");
    } finally {
      setLocationLoading(false);
    }
  };

  const confirmPickup = () => {
    if (!pendingPickup?.coords) return;
    patch({
      pickupLocation: pendingPickup.location,
      pickupCoords: pendingPickup.coords,
    });
    setPendingPickup(null);
  };

  const changePickup = () => {
    setPendingPickup(null);
    setMarkerPosition(null);
    patch({ pickupLocation: "", pickupCoords: null });
  };

  // ── Pay: straight to Paystack, no /checkout page ──────────────────
  const handlePay = async (e) => {
    e?.preventDefault();
    if (paying) return;
    setPayError("");

    if (!contactComplete || !dateComplete) {
      setPayError("Please add your name, mobile, email and a tour date.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setPayError("Please check your email address.");
      return;
    }
    if (!pickupComplete) {
      setPayError("Please confirm your pickup point on the map.");
      return;
    }
    if (!optionsOk) {
      setPayError("Please choose a tour option.");
      return;
    }
    if (pricing.isCustomQuote) {
      setPayError("This group size needs a custom quote. Please contact us to book.");
      return;
    }
    if (verifyStatus === "failed") {
      setVerifyRetry((n) => n + 1);
      return;
    }
    if (verifyStatus !== "verified") {
      setPayError("Please wait for the price to be verified.");
      return;
    }
    if (!Number.isFinite(totalMinorUnit) || totalMinorUnit < 1) {
      setPayError("Invalid total amount. Please check your booking.");
      return;
    }

    setPaying(true);

    try {
      // Per-person display prices (for the confirmation email / success page)
      const find = (prefix) =>
        tour.pricing?.find((p) => p.category?.toLowerCase().startsWith(prefix));
      const optionObj = tour.options?.find((o) => o.id === form.selectedOption);
      let adultBase = Number((find("adult") || tour.pricing?.[0])?.pricePerPerson) || 0;
      if (optionObj && typeof optionObj.pricePerPerson === "number") {
        adultBase = optionObj.pricePerPerson;
      }
      const adultPrice = convertPrice(adultBase, currency);
      const teenPrice = convertPrice(Number(find("teen")?.pricePerPerson) || 0, currency);
      const childPrice = convertPrice(Number(find("child")?.pricePerPerson) || 0, currency);
      const toddlerPrice = convertPrice(Number(find("toddler")?.pricePerPerson) || 0, currency);

      const pickupTimeLabel = getPickupTime(tour);
      const checkoutStops = getCheckoutStops(tour);
      const bookingReference = generateBookingReference();
      const notes = form.isCustom ? form.notes : "";

      const pricingSummary = {
        currency,
        adults: adultCount,
        children,
        toddlers,
        teens,
        adultPrice,
        teenPrice,
        childPrice,
        toddlerPrice,
        participants: participantCount,
        subtotalBeforeDiscount: pricing.originalSubtotal,
        groupDiscountPercent: pricing.groupDiscountPercent,
        groupDiscountAmount: pricing.groupDiscountAmount,
        discountedTourSubtotal: pricing.discountedSubtotal,
        extrasTotal: pricing.extrasTotal,
        kidsActivityFee: pricing.kidsActivityTotal,
        isPrivate: form.isPrivate,
        privateFee: pricing.privateFee,
        isCustom: form.isCustom,
        customFee: pricing.customFee,
        totalPrice: pricing.finalTotal,
        totalMinorUnit,
        totalAmountLabel,
      };

      const bookingDetails = {
        fullName: form.fullName.trim(),
        mobile: form.mobile.trim(),
        email: form.email.trim(),
        date: form.date,
        adults: adultCount,
        children,
        toddlers,
        teens,
        childAges,
        participants: String(participantCount),
        participantEmails: [],
        ccParticipantEmails: [],
        ccParticipants: false,
        pickupLocation: form.pickupLocation,
        pickupCoords: form.pickupCoords,
        pickupTimeLabel,
        isPrivate: form.isPrivate,
        isCustom: form.isCustom,
        selectedOption: form.selectedOption,
        selectedExtras: form.selectedExtras || {},
        selectedKidsActivity: form.selectedKidsActivity,
        kidsActivityFee: pricing.kidsActivityTotal,
        customerNotes: notes,
        pricingOptions: {
          ...pricingSummary,
          privateFee: pricing.privateFee,
          customFee: pricing.customFee,
          subtotalBeforeGroupDiscount: pricing.originalSubtotal,
          estimatedTotal: pricing.finalTotal,
        },
      };

      const emailPayload = {
        bookingReference,
        bookingRef: bookingReference,
        customerName: bookingDetails.fullName,
        customerEmail: bookingDetails.email,
        mobile: bookingDetails.mobile,
        tourTitle: tour.title || tour.info,
        tourId: tour.id,
        tourSlug: tour.slug,
        tourStops: checkoutStops,
        stops: checkoutStops,
        date: bookingDetails.date,
        pickupTime: pickupTimeLabel,
        participants: bookingDetails.participants,
        participantEmails: [],
        ccParticipantEmails: [],
        ccParticipants: false,
        isPrivate: bookingDetails.isPrivate,
        isCustom: bookingDetails.isCustom,
        pricingOptions: bookingDetails.pricingOptions,
        pricingSummary,
        customerNotes: notes,
        pickupLocation: bookingDetails.pickupLocation || "Not provided",
        pickupCoords: bookingDetails.pickupCoords || null,
        selectedCurrency: currency,
        totalAmount: totalAmountLabel,
        policyAcknowledgement: {
          customerBooksOwnGroup: true,
          participantsMustMatchOwnParty: true,
          lowerRatesRequireFullSelectedGroupPayment: true,
          finalPickupVehicleOperationallyConfirmed: true,
        },
      };

      const snapshot = {
        tour,
        bookingDetails,
        selectedCurrency: currency,
        totalAmountLabel,
        pricingSummary,
        checkoutStops,
        notes,
        bookingReference,
        emailPayload,
        paymentProvider: "paystack",
        savedAt: new Date().toISOString(),
      };

      sessionStorage.setItem("lastCheckout", JSON.stringify(snapshot));

      const res = await fetch("/api/paystack-initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: bookingDetails.email,
          amount: totalMinorUnit, // ignored by the server when a valid priceToken is sent
          currency,
          bookingReference,
          callbackUrl: `${window.location.origin}/success`,
          priceToken: verifiedToken || undefined,
          metadata: {
            bookingReference,
            tourId: tour.id,
            tourSlug: tour.slug,
            tourTitle: tour.title || tour.info,
            customerName: bookingDetails.fullName,
            customerEmail: bookingDetails.email,
            mobile: bookingDetails.mobile,
            participants: bookingDetails.participants,
            totalAmountLabel,
          },
        }),
      });

      // Read as text first: when no API is running (plain `vite` dev server)
      // the request falls through to index.html and JSON parsing blows up.
      const raw = await res.text();
      let data = null;
      try {
        data = JSON.parse(raw);
      } catch {
        data = null;
      }
      if (!data) {
        const looksLikeHtml = /^\s*<(!doctype|html)/i.test(raw);
        throw new Error(
          looksLikeHtml
            ? "The payment API (/api/paystack-initialize) isn't reachable. Run the site with your serverless dev server (e.g. `vercel dev`) or proxy /api to your backend."
            : `Unexpected response from payment server (HTTP ${res.status}).`,
        );
      }
      if (!res.ok) throw new Error(data.error || "Could not start Paystack checkout.");
      if (!data.authorization_url || !data.reference) {
        throw new Error("Paystack did not return a payment URL.");
      }

      sessionStorage.setItem(
        "lastCheckout",
        JSON.stringify({
          ...snapshot,
          paystackReference: data.reference,
          accessCode: data.access_code || "",
          authorizationUrl: data.authorization_url,
        }),
      );

      setFadeOut(true);
      await new Promise((r) => window.setTimeout(r, 350));
      window.location.href = data.authorization_url;
    } catch (err) {
      console.error("Paystack checkout error:", err);
      setPayError(err.message || "Could not start Paystack payment.");
      setPaying(false);
    }
  };

  const privateFeeLabel = formatMoney(pricing.privateFee || 0, currency);
  const customFeeLabel = formatMoney(pricing.customFee || 0, currency);

  const payLabel = paying
    ? "Redirecting to Paystack…"
    : pricing.isCustomQuote
      ? "Custom quote needed"
      : verifyStatus === "pending"
        ? "Verifying price…"
        : verifyStatus === "failed"
          ? "Retry price check"
          : `Pay ${totalAmountLabel} with Paystack`;

  const payDisabled = paying || verifyStatus === "pending" || pricing.isCustomQuote;

  return createPortal(
    <div
      className="tour-drawer-wrap fixed inset-0 z-[200] flex items-end justify-center bg-black/55 px-0 backdrop-blur-sm sm:px-4"
      onClick={() => !paying && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label={`Book ${tour.title}`}
    >
      {fadeOut && (
        <div
          className="fixed inset-0 z-[260] bg-white"
          style={{ animation: "tourFadeToWhite 350ms ease-out forwards" }}
          aria-hidden="true"
        />
      )}

      <div
        className="flex h-full max-h-[52rem] w-full max-w-3xl flex-col overflow-hidden rounded-t-[2rem] bg-stone-50 shadow-2xl"
        style={{ animation: "tourDrawerIn 0.3s cubic-bezier(0.16,1,0.3,1) both" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative shrink-0 overflow-hidden">
          <img
            src={resolveImage(tour.image)}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            onError={(e) => {
              e.currentTarget.src = "/images/content/random/1.webp";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30" />
          <div className="relative flex items-end justify-between gap-3 p-4 pt-8 text-white sm:p-5 sm:pt-10">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/70">
                Book this tour
              </p>
              <h2 className="mt-1 font-frank text-2xl font-bold leading-tight sm:text-3xl">
                {tour.title}
              </h2>
              <p className="mt-1 text-xs font-semibold text-white/75">
                {[tour.duration, tour.location].filter(Boolean).join(" · ")}
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={paying}
                aria-label="Close booking"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-lg backdrop-blur transition hover:bg-white/35 disabled:opacity-40"
              >
                ✕
              </button>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                aria-label="Select currency"
                className="rounded-xl border border-white/30 bg-white/90 px-3 py-1.5 text-sm font-black text-neutral-900 outline-none"
              >
                {supportedCurrencies.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Scrollable form */}
        <div
          ref={scrollRef}
          data-lenis-prevent
          className="flex-1 space-y-4 overflow-y-auto overscroll-contain p-3 sm:p-4"
        >
          {Array.isArray(tour.options) && tour.options.length > 0 && (
            <TourOptions
              tour={tour}
              selectedOption={form.selectedOption}
              onOptionChange={(id) => patch({ selectedOption: id })}
            />
          )}

          <Section
            n={1}
            title="Traveller details"
            sub="Who is booking, and when?"
            done={contactComplete && dateComplete}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Full name">
                <input
                  className={inputClass}
                  value={form.fullName}
                  onChange={(e) => patch({ fullName: e.target.value })}
                  placeholder="Faiez Viljoen"
                  autoComplete="name"
                />
              </Field>
              <Field label="Mobile number">
                <input
                  className={inputClass}
                  value={form.mobile}
                  onChange={(e) => patch({ mobile: e.target.value })}
                  placeholder="081 000 0000"
                  autoComplete="tel"
                  inputMode="tel"
                />
              </Field>
              <Field label="Email address">
                <input
                  className={inputClass}
                  type="email"
                  value={form.email}
                  onChange={(e) => patch({ email: e.target.value })}
                  placeholder="name@email.com"
                  autoComplete="email"
                />
              </Field>
              <Field label="Preferred date">
                <input
                  className={`${inputClass} cursor-pointer`}
                  type="date"
                  min={getMinDate(tour)}
                  value={form.date}
                  onClick={(e) => e.currentTarget.showPicker?.()}
                  onChange={(e) => patch({ date: e.target.value })}
                />
              </Field>
            </div>
          </Section>

          <Section
            n={2}
            title="Group size"
            sub={`Up to ${MAX_PEOPLE} guests per booking.`}
            done
          >
            <div className="space-y-3 rounded-2xl border border-green-200 bg-green-50/60 p-3">
              <Stepper
                label="Adults"
                hint="Aged 18+."
                value={adultCount}
                onMinus={() => changeAdults(-1)}
                onPlus={() => changeAdults(1)}
                minusDisabled={adultCount <= 1 || participantCount - 1 < minPeople}
                plusDisabled={participantCount >= MAX_PEOPLE}
              />

              {tour.childFriendly === false ? (
                <div className="rounded-lg border border-amber-200/80 bg-amber-50/70 px-3 py-2 text-xs text-amber-800">
                  ⚠️ This tour is not child-friendly.
                </div>
              ) : (
                <div className="rounded-2xl border border-black/5 bg-white p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-neutral-950">Children</p>
                    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-700">
                      {childAges.length}
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {CHILD_CATEGORIES.map((cat) => (
                      <button
                        key={cat.key}
                        type="button"
                        disabled={!canAddChild}
                        onClick={() => addChild(cat.age)}
                        aria-label={`Add ${cat.label} (${cat.range} years)`}
                        className="flex flex-col items-center gap-0.5 rounded-xl border border-blue-100 bg-blue-50/70 px-1.5 py-2.5 transition hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
                      >
                        <span className="text-lg leading-none">{cat.icon}</span>
                        <span className="mt-1 text-[10px] font-black uppercase tracking-wide text-blue-700">
                          {cat.label}
                        </span>
                        <span className="text-[9px] font-bold text-blue-500">{cat.range}</span>
                      </button>
                    ))}
                  </div>

                  {childAges.length > 0 ? (
                    <div className="mt-3 space-y-2">
                      {childAges.map((age, i) => {
                        const cat = categoryOf(age);
                        return (
                          <div
                            key={`${i}-${age}`}
                            className="flex items-center gap-3 rounded-xl border border-black/5 bg-neutral-50 px-3 py-2"
                          >
                            <span className="text-lg">{cat.icon}</span>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-black text-neutral-900">
                                {cat.label} {childAges.slice(0, i + 1).filter((a) => categoryOf(a).key === cat.key).length}
                              </p>
                              <p className="text-[10px] font-medium text-neutral-400">{cat.range} yrs</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeChild(i)}
                              aria-label={`Remove ${cat.label}`}
                              className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-[11px] font-bold text-red-600 transition hover:bg-red-500 hover:text-white"
                            >
                              Remove
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="mt-3 rounded-xl border border-dashed border-black/10 bg-neutral-50 px-4 py-3 text-center text-[11px] font-bold text-neutral-500">
                      Tap a category above to add a child.
                    </p>
                  )}
                </div>
              )}

              <p className="text-center text-xs font-semibold text-green-900">
                {participantCount} guest{participantCount !== 1 ? "s" : ""} in total
                {hasGroupDeal(tour) && " · group rates apply automatically"}
              </p>
            </div>
          </Section>

          <Section
            n={3}
            title="Pickup location"
            sub="Search an address, or tap the map."
            done={pickupComplete}
          >
            {pickupComplete ? (
              <div className="flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 p-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-green-950">Pickup location saved</p>
                  <p className="mt-1 text-sm leading-6 text-neutral-700">{form.pickupLocation}</p>
                </div>
                <button
                  type="button"
                  onClick={changePickup}
                  className="shrink-0 rounded-full border border-green-200 bg-white px-3 py-1.5 text-xs font-bold text-green-800 transition hover:bg-green-100"
                >
                  Change
                </button>
              </div>
            ) : (
              <div>
                <div className="mb-3 flex flex-col gap-2 sm:flex-row">
                  <input
                    className={`${inputClass} flex-1`}
                    placeholder="Hotel, guesthouse, Airbnb or pickup point"
                    value={form.pickupLocation}
                    onChange={(e) => {
                      setPendingPickup(null);
                      setMarkerPosition(null);
                      patch({ pickupLocation: e.target.value, pickupCoords: null });
                    }}
                  />
                  <button
                    type="button"
                    onClick={pendingPickup ? confirmPickup : handleFindAddress}
                    disabled={locationLoading || (!pendingPickup && !form.pickupLocation.trim())}
                    className="rounded-2xl bg-blue-600 px-5 py-3.5 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {locationLoading ? "Searching…" : pendingPickup ? "Confirm pickup" : "Find on map"}
                  </button>
                </div>
                <div className="overflow-hidden rounded-2xl">
                  <ClientOnly
                    fallback={
                      <div className="flex h-[260px] items-center justify-center rounded-2xl bg-neutral-100 text-sm text-neutral-500">
                        Loading map…
                      </div>
                    }
                  >
                    <Suspense fallback={<div style={{ height: 260 }} />}>
                      <Map
                        center={[mapCenter.lat, mapCenter.lng]}
                        markerPosition={markerPosition}
                        onPick={handleMapPick}
                      />
                    </Suspense>
                  </ClientOnly>
                </div>
                {locationError && (
                  <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-600">{locationError}</p>
                )}
              </div>
            )}
          </Section>

          <div className="space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row">
              <ToggleCard
                active={form.isPrivate}
                title="Private tour"
                text="Book this as a private vehicle-based experience."
                price={`+ ${privateFeeLabel}`}
                onClick={() => patch({ isPrivate: !form.isPrivate })}
              />
              <ToggleCard
                active={form.isCustom}
                title="Custom trip"
                text="Custom planning, route timing or special adjustments."
                price={`+ ${customFeeLabel}`}
                onClick={() => patch({ isCustom: !form.isCustom })}
              />
            </div>

            {form.isCustom && (
              <textarea
                rows={3}
                value={form.notes}
                onChange={(e) => patch({ notes: e.target.value })}
                className="w-full resize-none rounded-2xl border border-neutral-200 bg-white p-3 text-sm outline-none focus:border-green-400 focus:ring-4 focus:ring-green-100"
                placeholder="Custom route requests, pickup timing, accessibility needs, dietary restrictions…"
              />
            )}

            {Array.isArray(tour.additionalPricing) && tour.additionalPricing.length > 0 && (
              <AdditionalPricing
                additionalPricing={tour.additionalPricing}
                selectedExtras={form.selectedExtras}
                onExtrasChange={(extras) => patch({ selectedExtras: extras })}
              />
            )}

            <KidsActivities
              childFriendly={tour.childFriendly === true}
              adultCount={adultCount}
              childCount={children}
              toddlerCount={toddlers}
              selectedActivity={form.selectedKidsActivity}
              onActivityChange={(id) => patch({ selectedKidsActivity: id })}
            />
          </div>

          {/* Checkout summary (pay button lives in the sticky bar below) */}
          <CheckoutSummary
            tour={tour}
            adultCount={adultCount}
            childCount={children}
            toddlerCount={toddlers}
            currency={currency}
            selectedOption={form.selectedOption}
            selectedExtras={form.selectedExtras}
            formData={{ ...form, adults: String(adultCount), childAges }}
            contactDetailsComplete={contactComplete}
            dateDetailsComplete={dateComplete}
            pickupDetailsComplete={pickupComplete}
            isEmbedded
            stacked
            hideSubmit
            submitting={paying}
            verifyStatus={verifyStatus}
            verifyError={verifyError}
          />

          <p className="px-2 pb-2 text-center text-[11px] leading-5 text-neutral-500">
            Cancellation within 24 hours of booking gets a full refund. 2–3 days before the trip has a
            20% penalty; within 24 hours there is no refund.{" "}
            <Link to="/policies" className="font-semibold text-blue-700 underline">
              Read policies
            </Link>
            . Pickup and vehicle details are confirmed after payment.
          </p>
        </div>

        {/* Sticky pay bar */}
        <div className="shrink-0 border-t border-black/5 bg-white p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:p-4">
          {pricing.isCustomQuote && (
            <p className="mb-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">
              This group size needs a custom quote. Email {CONTACT_EMAIL} or call {CONTACT_NUMBER}.
            </p>
          )}
          {payError && (
            <p className="mb-2 rounded-xl bg-red-500 px-3 py-2 text-sm text-white" role="alert">
              {payError}
            </p>
          )}
          {!payError && !pricing.isCustomQuote && verifyStatus === "idle" && (
            <p className="mb-2 text-center text-[11px] font-semibold text-neutral-400">
              {!contactComplete || !dateComplete
                ? "Add your details and date to continue."
                : !pickupComplete
                  ? "Confirm your pickup point to continue."
                  : !optionsOk
                    ? "Choose a tour option to continue."
                    : ""}
            </p>
          )}
          <button
            type="button"
            onClick={handlePay}
            disabled={payDisabled}
            className="hero-gradient-bl flex w-full items-center justify-center gap-2 rounded-[1.25rem] px-6 py-4 font-frank text-lg font-black text-white shadow-[0_18px_42px_rgba(7,31,79,0.2)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
          >
            {payLabel}
          </button>
          <div className="mt-2 flex items-center justify-center gap-2">
            <img src="/icons/paystack-logo.svg" alt="Paystack" className="h-5" loading="lazy" />
            <span className="text-[11px] font-semibold text-neutral-400">
              Secure payment · your bank may ask for 3D Secure
            </span>
          </div>
        </div>
      </div>

      <style>{`
        /* Keeps the drawer clear of the fixed navbar. Tweak these two values
           to match your navbar height. */
        .tour-drawer-wrap { padding-top: 5.5rem; }
        @media (min-width: 640px) { .tour-drawer-wrap { padding-top: 9rem; } }
        @media (min-width: 1024px) { .tour-drawer-wrap { padding-top: 9.5rem; } }
        @keyframes tourDrawerIn {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes tourFadeToWhite { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>,
    document.body,
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

function Tours() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [bookingTour, setBookingTour] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const sidebarPanelRef = useRef(null);
  const resultsSectionRef = useRef(null);

  const setFilter = (patch) => setFilters((prev) => ({ ...prev, ...patch }));
  const resetFilters = () => setFilters(DEFAULT_FILTERS);
  const openBooking = (tour) => setBookingTour(tour);
  const closeBooking = () => setBookingTour(null);

  // Navbar white panel: in after scrolling, out at the top
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── Derived data ────────────────────────────────────────────────────────
  const priceCeiling = useMemo(
    () => Math.ceil(Math.max(...tours.map((t) => Number(t.priceBase) || 0)) / 500) * 500,
    []
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
    [typeCounts]
  );

  const promoTours = useMemo(
    () =>
      tours
        .map((tour) => ({ tour, promo: getTourPromo(tour) }))
        .filter((x) => x.promo),
    []
  );
  const singlePromo = promoTours.length === 1;

  const filteredTours = useMemo(() => {
    const q = filters.query.trim().toLowerCase();
    const limit = filters.maxPrice ?? Infinity;

    let list = tours.filter((tour) => {
      if (filters.type !== "all" && tour.type !== filters.type) return false;
      if (filters.duration !== "all" && getDurationBucket(tour) !== filters.duration)
        return false;
      if ((Number(tour.priceBase) || 0) > limit) return false;
      if (filters.childFriendly && tour.childFriendly !== true) return false;
      if (filters.groupDeals && !hasGroupDeal(tour)) return false;
      if (filters.promoOnly && !getTourPromo(tour)) return false;
      if (q) {
        const haystack = [tour.title, tour.description, tour.location, ...(tour.tags || [])]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });

    if (filters.sort === "price-asc") list = [...list].sort((a, b) => a.priceBase - b.priceBase);
    if (filters.sort === "price-desc") list = [...list].sort((a, b) => b.priceBase - a.priceBase);
    if (filters.sort === "az") list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    return list;
  }, [filters]);

  const panelFilterCount =
    (filters.duration !== "all" ? 1 : 0) +
    (filters.maxPrice !== null ? 1 : 0) +
    (filters.childFriendly ? 1 : 0) +
    (filters.groupDeals ? 1 : 0) +
    (filters.promoOnly ? 1 : 0);

  const activeFilterCount =
    panelFilterCount + (filters.query ? 1 : 0) + (filters.type !== "all" ? 1 : 0);

  const applyBanner = (patch) => {
    setFilters({ ...DEFAULT_FILTERS, ...patch });
    setFiltersOpen(true);
    document
      .getElementById("tour-results")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // ── Sidebar pin ─────────────────────────────────────────────────────────
  useLayoutEffect(() => {
    if (!sidebarPanelRef.current || !resultsSectionRef.current) return;

    const mm = gsap.matchMedia();

    mm.add("(min-width: 1024px)", () => {
      const trigger = ScrollTrigger.create({
        trigger: sidebarPanelRef.current,
        start: `top ${PIN_TOP_OFFSET}px`,
        endTrigger: resultsSectionRef.current,
        end: () => {
          const pinnedHeight = sidebarPanelRef.current?.offsetHeight || 0;
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

  // Results height changes when filtering, so re-measure the pin range.
  useEffect(() => {
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 60);
    return () => window.clearTimeout(id);
  }, [filteredTours.length, filtersOpen, expandedId]);

  // ── Grid items with a banner after every BANNER_EVERY cards ─────────────
  const gridItems = [];
  let bannerIndex = 0;
  filteredTours.forEach((tour, i) => {
    gridItems.push(
      expandedId === tour.id ? (
        <ExpandedTourCard
          key={tour.id}
          tour={tour}
          onClose={() => setExpandedId(null)}
          onBook={openBooking}
        />
      ) : (
        <TourCard
          key={tour.id}
          tour={tour}
          onBook={openBooking}
          onExpand={(t) => setExpandedId(t.id)}
        />
      ),
    );
    if ((i + 1) % BANNER_EVERY === 0 && i < filteredTours.length - 1) {
      gridItems.push(
        <Banner
          key={`banner-${i}`}
          banner={BANNERS[bannerIndex % BANNERS.length]}
          onApply={applyBanner}
        />
      );
      bannerIndex += 1;
    }
  });

  const selectClass =
    "rounded-full border border-neutral-200 bg-white px-3.5 py-2.5 text-sm font-semibold outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100";

  return (
    <>
      <Seo
        title="Tours - Cape Frontier"
        description="Explore our variety tours tailored specifically for you."
      />

      {/* Navbar white panel. Give your navbar a z-index above z-40. */}
      <div
        aria-hidden="true"
        className={`pointer-events-none fixed inset-x-0 top-0 z-40 h-24 bg-white shadow-md transition-all duration-500 ease-out ${
          scrolled ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
        }`}
      />

      <div className="relative isolate flex min-h-screen w-full flex-col items-center gap-7 bg-blue-400/100 px-4">
        {/* White backdrop behind the navbar / top of the page */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-56 bg-white"
        />

        {/* ── Filter bar ──────────────────────────────────────────────── */}
        <section
          id="tour-results"
          className="mt-32 w-full max-w-7xl scroll-mt-28 rounded-3xl border border-black/5 bg-white/90 p-3 text-black shadow-lg backdrop-blur"
        >
          <div className="flex flex-col gap-2 md:flex-row md:items-center">
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
                className="w-full rounded-full border border-neutral-200 bg-white py-2.5 pl-11 pr-4 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <select
              value={filters.type}
              onChange={(e) => setFilter({ type: e.target.value })}
              aria-label="Category"
              className={selectClass}
            >
              <option value="all">All categories ({tours.length})</option>
              {typeOptions.map((t) => (
                <option key={t} value={t}>
                  {TYPE_LABELS[t]} ({typeCounts[t]})
                </option>
              ))}
            </select>

            <select
              value={filters.sort}
              onChange={(e) => setFilter({ sort: e.target.value })}
              aria-label="Sort tours"
              className={selectClass}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => setFiltersOpen((o) => !o)}
              aria-expanded={filtersOpen}
              aria-controls="more-filters"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-green-200 bg-green-200 px-4 py-2.5 text-sm font-bold text-blue-700 transition hover:bg-blue-100 active:scale-95"
            >
              Filters
              {panelFilterCount > 0 && (
                <span className="rounded-full bg-blue-600 px-1.5 py-0.5 text-[10px] text-white">
                  {panelFilterCount}
                </span>
              )}
              <span
                aria-hidden="true"
                className={`transition-transform duration-300 ${filtersOpen ? "rotate-180" : ""}`}
              >
                ▾
              </span>
            </button>
          </div>

          <div
            id="more-filters"
            className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
              filtersOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
            }`}
          >
            <div className="min-h-0 overflow-hidden">
              <div
                className="grid gap-4 pt-4 md:grid-cols-3"
                style={{ visibility: filtersOpen ? "visible" : "hidden" }}
              >
                <div>
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-neutral-400">
                    Duration
                  </p>
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
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-neutral-400">
                    Show only
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    <Chip
                      active={filters.promoOnly}
                      onClick={() => setFilter({ promoOnly: !filters.promoOnly })}
                    >
                      On promo
                    </Chip>
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
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-black/5 pt-2.5">
            <p className="text-xs text-neutral-600" aria-live="polite">
              <b className="text-neutral-950">{filteredTours.length}</b> of {tours.length} tours
            </p>
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={resetFilters}
                className="rounded-full border border-red-200 px-3 py-1 text-xs font-bold text-red-600 transition hover:bg-red-50"
              >
                Clear ({activeFilterCount})
              </button>
            )}
          </div>
        </section>

        {/* Mobile / tablet featured promo (the sidebar is desktop only) */}
        {promoTours.length > 0 && (
          <div className="w-full max-w-7xl lg:hidden">
            <p className="mb-2 px-1 font-frank text-lg font-bold">
              {singlePromo ? "Featured tour" : "Hot deals"}
            </p>

            {singlePromo ? (
              <FeaturedPromoCard
                tour={promoTours[0].tour}
                promo={promoTours[0].promo}
                onBook={openBooking}
              />
            ) : (
              <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:thin]">
                {promoTours.map(({ tour, promo }) => (
                  <PromoMiniCard
                    key={tour.id}
                    tour={tour}
                    promo={promo}
                    onBook={openBooking}
                    className="w-[78vw] max-w-xs shrink-0 snap-center"
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Results + pinned promo sidebar ───────────────────────────── */}
        <div className="grid w-full max-w-7xl grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
          <div ref={resultsSectionRef}>
            {filteredTours.length > 0 ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {gridItems}
              </div>
            ) : (
              <div className="mx-auto w-full max-w-3xl rounded-3xl bg-white p-10 text-center text-black shadow-lg">
                <p className="font-frank text-3xl font-bold">No tours found</p>
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
          </div>

          <aside className="hidden h-fit lg:block">
            <div ref={sidebarPanelRef}>
              <section className="rounded-3xl border border-black/5 bg-white/95 p-4 text-black shadow-lg backdrop-blur">
                <div className="flex items-end justify-between">
                  {!singlePromo && (
                    <span className="text-xs font-semibold text-neutral-400">
                      {promoTours.length}
                    </span>
                  )}
                </div>

                {promoTours.length === 0 && (
                  <p className="mt-3 text-sm text-neutral-500">
                    No promotions running right now. Check back soon.
                  </p>
                )}

                {singlePromo && (
                  <div className="mt-3">
                    <FeaturedPromoCard
                      tour={promoTours[0].tour}
                      promo={promoTours[0].promo}
                      onBook={openBooking}
                    />
                  </div>
                )}

                {promoTours.length > 1 && (
                  <>
                    <div
                      className="mt-3 space-y-2 overflow-y-auto pr-1 [scrollbar-width:thin]"
                      style={{ maxHeight: `calc(100vh - ${PIN_TOP_OFFSET + 190}px)` }}
                      data-lenis-prevent
                    >
                      {promoTours.map(({ tour, promo }) => (
                        <PromoMiniCard
                          key={tour.id}
                          tour={tour}
                          promo={promo}
                          onBook={openBooking}
                        />
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => applyBanner({ promoOnly: true })}
                      className="mt-3 w-full rounded-full bg-black px-4 py-2.5 text-sm font-bold text-white transition hover:scale-[1.02] active:scale-95"
                    >
                      Show all promo tours →
                    </button>
                  </>
                )}
              </section>
            </div>
          </aside>
        </div>

        {/* ── Contact details ──────────────────────────────────────────── */}
        <section
          id="contact-details"
          className="mb-16 w-full max-w-7xl scroll-mt-28 overflow-hidden rounded-3xl border border-black/5 bg-white text-black shadow-lg"
        >
          <div className="grid gap-6 p-6 sm:p-8 md:grid-cols-[1.1fr_1fr] md:items-center">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-500">
                Can't find what you're after?
              </p>
              <h3 className="mt-1 font-frank text-2xl font-bold leading-tight sm:text-3xl">
                Talk to us about a custom trip
              </h3>
              <p className="mt-2 max-w-md font-bitter text-sm text-neutral-600">
                Tours, pickup details, private trips, custom routes or booking
                support. We'll help you choose the right Cape Town experience.
              </p>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="hero-gradient-bl inline-flex min-h-[48px] items-center justify-center rounded-full px-6 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 active:scale-95"
                >
                  Email us
                </a>
                <a
                  href={`tel:${CONTACT_TEL}`}
                  className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-blue-950/10 bg-white px-6 text-sm font-bold text-[#071f4f] transition hover:-translate-y-0.5 hover:bg-green-200 hover:text-green-950 active:scale-95"
                >
                  Call us
                </a>
                <Link
                  to="/policies"
                  className="inline-flex min-h-[48px] items-center justify-center rounded-full px-4 text-sm font-semibold text-neutral-500 underline-offset-4 transition hover:text-neutral-900 hover:underline"
                >
                  View policies
                </Link>
              </div>
            </div>

            <div className="rounded-3xl border border-blue-100 bg-blue-50/60 p-5">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-500">
                Email
              </p>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="block break-words text-sm font-bold text-[#071f4f] hover:underline sm:text-[15px]"
              >
                {CONTACT_EMAIL}
              </a>

              <div className="my-3 w-full border-t border-blue-200/60" />

              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-500">
                Number
              </p>
              <a
                href={`tel:${CONTACT_TEL}`}
                className="block text-sm font-bold text-[#071f4f] hover:underline sm:text-[15px]"
              >
                {CONTACT_NUMBER}
              </a>

              <p className="mt-2 text-xs text-neutral-500">Booking and support</p>
            </div>
          </div>
        </section>
      </div>

      {/* In-page booking → Paystack (no /checkout hop). Keyed so state resets per tour. */}
      {bookingTour && typeof document !== "undefined" && (
        <BookingDrawer key={bookingTour.id} tour={bookingTour} onClose={closeBooking} />
      )}
    </>
  );
}

export default Tours;