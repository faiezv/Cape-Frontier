// src/components/Booking.jsx
// Fix for leaflet-vite-react-ssg conflict after migrating to react-router-dom v6.30.0 and installing vite-react-ssg and running npm run build
import ClientOnly from "../components/ClientOnly";
import { lazy, Suspense } from "react"; // ensure you have Suspense imported

// Lazy-load the map – this import only runs on the client
const Map = lazy(() => import("../components/Map"));
const DEFAULT_CENTER = [-33.9249, 18.4241];
import CheckoutSummary from "../components/CheckoutSummary";
import TourOptions from "../components/TourDetails/TourOptions.jsx";
import AdditionalPricing from "../components/TourDetails/AdditionalPricing";
import KidsActivities from "../components/TourDetails/KidsActivities.jsx";
import { KIDS_ACTIVITIES } from "../data/kidsActivities.js";

import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import gsap from "gsap";
import allTours from "../data/tours.js";
import { resolveImage } from "../utils/ImageLoader";

const PRIVATE_TOUR_FEE_ZAR = 750;
const CUSTOM_TRIP_FEE_ZAR = 500;

const slugify = (value = "") =>
  value
    .toString()
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const TOUR_FOLDER_ALIASES = {
  shark: "adrenaline/shark-cage-diving",
  "shark-cage-diving": "adrenaline/shark-cage-diving",
  gun: "adrenaline/gun-range",
  gunrange: "adrenaline/gun-range",
  "gun-range": "adrenaline/gun-range",
  paragliding: "adrenaline/paragliding",
  "para-gliding": "adrenaline/paragliding",
  snorkel: "adrenaline/snorkelling",
  snorkelling: "adrenaline/snorkelling",
  snorkeling: "adrenaline/snorkelling",
  "lions-head": "hiking/lions-head",
  "lion-s-head": "hiking/lions-head",
  "lion-head": "hiking/lions-head",
  platteklip: "hiking/platteklip",
  "platteklip-gorge": "hiking/platteklip",
  langa: "historical/langa",
  "langa-township": "historical/langa",
  "robben-island": "historical/robben-island",
  "robben-island-tour": "historical/robben-island",
  "peninsula-tour-1": "packages/peninsula-tour-1",
  "peninsula-tour-2": "packages/peninsula-tour-2",
  delaire: "wine-routes/delaire",
  "delaire-graff": "wine-routes/delaire",
  "rust-en-vrede": "wine-routes/rest-en-vrede",
  "rest-en-vrede": "wine-routes/rest-en-vrede",
  spier: "wine-routes/spier",
  tokara: "wine-routes/tokara",
};

const SPECIAL_GALLERIES = {
  tokara: [
    "/images/tours/wine-routes/tokara/1%20(10).webp",
    "/images/tours/wine-routes/tokara/2%20(9).webp",
    "/images/tours/wine-routes/tokara/3%20(9).webp",
  ],
};

const getTourSlug = (tour) => {
  return tour?.slug || slugify(tour?.title || tour?.info || "");
};

const getTourFolder = (tour) => {
  const slug = getTourSlug(tour);
  const title = slugify(tour?.title || tour?.info || "");
  const category = slugify(tour?.category || "");

  if (TOUR_FOLDER_ALIASES[slug]) return TOUR_FOLDER_ALIASES[slug];
  if (TOUR_FOLDER_ALIASES[title]) return TOUR_FOLDER_ALIASES[title];

  if (title.includes("shark")) return "adrenaline/shark-cage-diving";
  if (title.includes("gun")) return "adrenaline/gun-range";
  if (title.includes("snorkel")) return "adrenaline/snorkelling";
  if (title.includes("para")) return "adrenaline/paragliding";
  if (title.includes("lion")) return "hiking/lions-head";
  if (title.includes("platteklip")) return "hiking/platteklip";
  if (title.includes("langa")) return "historical/langas";
  if (title.includes("robben")) return "historical/robben-island";
  if (title.includes("delaire")) return "wine-routes/delaire";
  if (title.includes("rust") || title.includes("rest"))
    return "wine-routes/rest-en-vrede";
  if (title.includes("spier")) return "wine-routes/spier";
  if (title.includes("tokara")) return "wine-routes/tokara";
  if (title.includes("peninsula") && title.includes("2"))
    return "packages/peninsula-tour-2";
  if (title.includes("peninsula")) return "packages/peninsula-tour-1";
  if (category.includes("adrenaline") || category.includes("adventure"))
    return `adrenaline/${slug}`;
  if (category.includes("hiking")) return `hiking/${slug}`;
  if (category.includes("historical")) return `historical/${slug}`;
  if (category.includes("package")) return `packages/${slug}`;
  if (
    category.includes("wine") ||
    category.includes("winery") ||
    category.includes("wine-route")
  )
    return `wine-routes/${slug}`;
  return slug;
};

const getTourGallery = (tour) => {
  if (Array.isArray(tour?.images) && tour.images.length > 0) return tour.images;
  const slug = getTourSlug(tour);
  const title = slugify(tour?.title || tour?.info || "");
  if (SPECIAL_GALLERIES[slug]) return SPECIAL_GALLERIES[slug];
  if (SPECIAL_GALLERIES[title]) return SPECIAL_GALLERIES[title];
  const folder = getTourFolder(tour);
  return [
    `/images/tours/${folder}/1.webp`,
    `/images/tours/${folder}/2.webp`,
    `/images/tours/${folder}/3.webp`,
  ];
};

// ─── Helpers (same as CheckoutSummary) ────────────────────────────
const getFee = (tour, type) => {
  const defaults = { private: 750, custom: 500 };
  if (Array.isArray(tour?.additionalPricing)) {
    const match = tour.additionalPricing.find((item) =>
      item.category?.toLowerCase().includes(type),
    );
    if (match) {
      const amount = match.pricePerPerson ?? match.price ?? match.amount ?? 0;
      if (Number(amount) > 0) return Number(amount);
    }
  }
  if (type === "private" && tour?.privateFee !== undefined)
    return Number(tour.privateFee) || 0;
  if (type === "custom" && tour?.customFee !== undefined)
    return Number(tour.customFee) || 0;
  return defaults[type] || 0;
};

// ─── FX_RATES ──────────────────────────────────────────────────────
const FX_RATES = {
  ZAR: 1,
  USD: 0.054,
  EUR: 0.05,
  GBP: 0.043,
};

// ─── Helper components ────────────────────────────────────────────
function BookingField({ label, hint, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.18em] text-neutral-500">
        {label}
      </span>
      {children}
      {hint && (
        <span className="mt-1.5 block text-xs leading-5 text-neutral-400">
          {hint}
        </span>
      )}
    </label>
  );
}

function MiniAssurance({ title, text, icon = "✓" }) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white/75 p-4 shadow-[0_10px_26px_rgba(0,0,0,0.04)]">
      <div className="flex items-start gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-green-200 text-sm font-bold text-green-950">
          {icon}
        </span>
        <div>
          <p className="text-sm font-bold text-neutral-900">{title}</p>
          <p className="mt-1 text-xs leading-5 text-neutral-500">{text}</p>
        </div>
      </div>
    </div>
  );
}

function HomeIcon({ className = "h-4 w-4" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="m3 10.8 9-7 9 7" />
      <path d="M5.5 9.5V20h13V9.5" />
      <path d="M9.5 20v-6h5v6" />
    </svg>
  );
}

function SaveIcon({ className = "h-4 w-4" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.15"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" />
      <path d="M17 21v-8H7v8" />
      <path d="M7 3v5h8" />
    </svg>
  );
}

function CheckoutCartIcon({ className = "h-5 w-5" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.15"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M6.5 6h14l-1.4 7.2a2 2 0 0 1-2 1.6H9.1a2 2 0 0 1-2-1.6L5.6 3.8H3" />
      <path d="M9 20.2h.01" />
      <path d="M17 20.2h.01" />
      <path d="M10 10.5h6" />
    </svg>
  );
}

function GuestStepper({
  label,
  value,
  hint,
  onDecrease,
  onIncrease,
  decreaseDisabled,
  increaseDisabled,
  inactive = false,
}) {
  return (
    <div
      className={`rounded-2xl border p-3 transition-all duration-300 ${inactive ? "border-neutral-200 bg-neutral-50/70" : "border-green-100 bg-white"}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p
            className={`font-bold ${inactive ? "text-neutral-400" : "text-black"}`}
          >
            {label}
          </p>
          {hint && (
            <p
              className={`mt-1 text-xs leading-5 ${inactive ? "text-neutral-400" : "text-neutral-500"}`}
            >
              {hint}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onDecrease}
            disabled={decreaseDisabled}
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-black/10 bg-white text-xl font-bold text-neutral-700 transition hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-35"
          >
            −
          </button>
          <span
            className={`flex h-10 min-w-12 items-center justify-center rounded-2xl border bg-transparent px-4 font-frank text-2xl font-bold ${inactive ? "border-neutral-200 text-neutral-400" : "border-green-200 text-green-950"}`}
          >
            {value}
          </span>
          <button
            type="button"
            onClick={onIncrease}
            disabled={increaseDisabled}
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-green-200 bg-white text-xl font-bold text-green-950 transition hover:-translate-y-0.5 hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-35"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}

function ToggleOption({ active, title, text, price, icon, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`group flex min-h-[7rem] w-full flex-col justify-between rounded-2xl border p-4 text-left transition-all duration-300 ${active ? "border-green-300 bg-green-200 text-green-950 shadow-[0_14px_34px_rgba(34,197,94,0.18)]" : "border-black/5 bg-white text-neutral-700 hover:-translate-y-0.5 hover:border-green-200 hover:bg-green-50"}`}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl text-sm font-bold ${active ? "bg-white/70 text-green-950" : "bg-neutral-100 text-neutral-500"}`}
        >
          {icon}
        </span>
        <span
          className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${active ? "bg-white/70 text-green-950" : "bg-neutral-100 text-neutral-400"}`}
        >
          {active ? "Selected" : "Optional"}
        </span>
      </div>
      <div className="mt-3">
        <p className="text-sm font-bold">{title}</p>
        <p
          className={`mt-1 text-xs leading-5 ${active ? "text-green-950/75" : "text-neutral-500"}`}
        >
          {text}
        </p>
        <p
          className={`mt-2 text-xs font-bold ${active ? "text-green-950" : "text-green-700"}`}
        >
          {price}
        </p>
      </div>
    </button>
  );
}

// ─── Main Booking Component ────────────────────────────────────────

const Booking = ({ embeddedTour, bookingData }) => {
  const nav = useNavigate();
  const location = useLocation();

  const tour = embeddedTour || location.state?.tour;
  const isEmbedded = Boolean(embeddedTour);

  const pageRef = useRef(null);
  const backRef = useRef(null);
  const cardRef = useRef(null);
  const leftRef = useRef(null);
  const rightRef = useRef(null);
  const checkoutRef = useRef(null);
  const bottomRef = useRef(null);
  const priceRef = useRef(null);
  const groupSaveRef = useRef(null);
  const pickupFeedbackRef = useRef(null);
  const bookingBasicsCompleteRef = useRef(false);
  const activeImageRef = useRef(null);

  const initialCurrency = location.state?.selectedCurrency || "ZAR";
  const [currency, setCurrency] = useState(initialCurrency);

  const convertPrice = (baseAmount = 0, targetCurrency = "ZAR") => {
    return Number(baseAmount || 0) * (FX_RATES[targetCurrency] || 1);
  };

  const formatMoney = (amount, currencyCode) =>
    new Intl.NumberFormat("en", {
      style: "currency",
      currency: currencyCode,
      maximumFractionDigits: 2,
    }).format(amount);

  const supportedCurrencies =
    tour?.supportedCurrencies?.length > 0
      ? tour.supportedCurrencies
      : ["ZAR", "USD", "EUR", "GBP"];

  // ─── Gallery ──────────────────────────────────────────────────────
  const gallery = useMemo(() => (tour ? getTourGallery(tour) : []), [tour]);

  const relatedTours = useMemo(() => {
    if (!tour || !Array.isArray(allTours)) return [];
    const currentSlug = getTourSlug(tour);
    const sameType = allTours.filter((item) => {
      if (!item) return false;
      const itemSlug = getTourSlug(item);
      if (itemSlug === currentSlug || item.id === tour.id) return false;
      return item.type === tour.type || item.category === tour.category;
    });
    const fallback = allTours.filter((item) => {
      if (!item) return false;
      const itemSlug = getTourSlug(item);
      return itemSlug !== currentSlug && item.id !== tour.id;
    });
    return [...sameType, ...fallback]
      .filter(
        (item, index, array) =>
          array.findIndex(
            (candidate) => getTourSlug(candidate) === getTourSlug(item),
          ) === index,
      )
      .slice(0, 3);
  }, [tour]);

  const [activeImage, setActiveImage] = useState(0);

  const activeImageSrc =
    gallery[activeImage] || tour?.image || "/images/content/random/1.webp";
  const fallbackImage = tour?.image || "/images/content/random/1.webp";

  useEffect(() => {
    setActiveImage(0);
  }, [tour]);

  // Reset child-related state whenever the selected tour changes.
  // Prevents confirmed children from a previous (child-friendly) tour
  // from carrying over — already confirmed — onto a tour where
  // tour.childFriendly === false.
  const prevTourSlugRef = useRef(null);
  useEffect(() => {
    if (!tour) return;
    const tourSlug = getTourSlug(tour);
    const isTourSwitch =
      prevTourSlugRef.current !== null && prevTourSlugRef.current !== tourSlug;

    if (isTourSwitch) {
      // Any confirmations belonged to the previous tour's children — always clear them.
      setConfirmedChildAges({});
      setChildAddedAnimation(false);

      if (tour.childFriendly === false) {
        // New tour doesn't allow children — strip any carried-over children entirely.
        setFormData((prev) => {
          const nextAdults = Math.max(Number(prev.adults || 1), 1);
          const nextParticipantCount = Math.max(nextAdults, 1);
          const maxEmails = Math.max(nextParticipantCount - 1, 0);
          return {
            ...prev,
            children: "0",
            childAges: [],
            participants: String(nextParticipantCount),
            participantEmails: (prev.participantEmails || []).slice(
              0,
              maxEmails,
            ),
            ccParticipants: maxEmails === 0 ? false : prev.ccParticipants,
          };
        });
        setShowChildrenSelector(false);
      }
    }

    prevTourSlugRef.current = tourSlug;
  }, [tour]);

  // ─── Form State ──────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    fullName: "",
    mobile: "",
    email: "",
    date: "",
    selectedExtras: {},
    adults: "1",
    children: "0",
    participants: "1",
    pickupLocation: "",
    pickupCoords: null,
    isPrivate: false,
    isCustom: false,
    ccParticipants: false,
    participantEmails: [],
    selectedKidsActivity: null,
    childAges: [],
    selectedOption: null,
  });

  const [showChildrenSelector, setShowChildrenSelector] = useState(false);
  const [travellerSnapshot, setTravellerSnapshot] = useState(null);
  const [groupSnapshot, setGroupSnapshot] = useState(null);
  const [confirmedChildAges, setConfirmedChildAges] = useState({});
  const [childAddedAnimation, setChildAddedAnimation] = useState(false);

  // ─── Derived counts ──────────────────────────────────────────────
  const adultCount = Math.max(Number(formData.adults || 0), 1);
  const childAges = formData.childAges || [];

  const toddlers = childAges.filter((age) => Number(age) <= 5).length;
  const children = childAges.filter(
    (age) => Number(age) >= 6 && Number(age) <= 11,
  ).length;
  const teens = childAges.filter(
    (age) => Number(age) >= 12 && Number(age) <= 17,
  ).length;

  // Total participants = adults + all children (including toddlers, children, teens)
  const participantCount = adultCount + childAges.length;

  // For UI: max 8 total participants
  const maxParticipants = 8;
  const canAddChild =
    participantCount < maxParticipants && tour?.childFriendly !== false;
  const canAddAdult = participantCount < maxParticipants;

  // ─── Pricing using CheckoutSummary logic ──────────────────────────
  // Get category prices from tour.pricing with .startsWith matching
  const getCategoryPrice = (category) => {
    if (!tour?.pricing) return 0;
    const entry = tour.pricing.find((p) =>
      p.category?.toLowerCase().startsWith(category.toLowerCase()),
    );
    return entry ? Number(entry.pricePerPerson) || 0 : 0;
  };

  const adultPriceZar = getCategoryPrice("adult");
  const teenPriceZar = getCategoryPrice("teen");
  const childPriceZar = getCategoryPrice("child");
  const toddlerPriceZar = getCategoryPrice("toddler");

  // If no specific adult pricing, fallback to tour.priceBase
  const fallbackAdultPrice = Number(tour?.priceBase) || 0;
  const finalAdultPriceZar = adultPriceZar || fallbackAdultPrice;
  const finalTeenPriceZar = teenPriceZar || finalAdultPriceZar;
  const finalChildPriceZar = childPriceZar || 0; // assume 0 if not defined
  const finalToddlerPriceZar = toddlerPriceZar || 0;

  // Convert to selected currency
  const adultPrice = convertPrice(finalAdultPriceZar, currency);
  const teenPrice = convertPrice(finalTeenPriceZar, currency);
  const childPrice = convertPrice(finalChildPriceZar, currency);
  const toddlerPrice = convertPrice(finalToddlerPriceZar, currency);

  // Original subtotals
  const adultSubtotal = adultCount * adultPrice;
  const teenSubtotal = teens * teenPrice;
  const childSubtotal = children * childPrice;
  const toddlerSubtotal = toddlers * toddlerPrice;
  const originalSubtotal =
    adultSubtotal + teenSubtotal + childSubtotal + toddlerSubtotal;

  // ─── Group Discount (same as CheckoutSummary) ─────────────────────
  let discountedSubtotal = originalSubtotal;
  let groupDiscountAmount = 0;
  let groupDiscountPercent = 0;
  let adultDiscountAmount = 0;
  let teenDiscountAmount = 0;
  let hasDiscount = false;
  let matchedGroupTier = null;
  let groupPricingType = null;
  let isCustomQuote = false;

  if (
    tour?.groupPricing?.enabled &&
    Array.isArray(tour.groupPricing.tiers) &&
    tour.groupPricing.tiers.length > 0
  ) {
    matchedGroupTier =
      tour.groupPricing.tiers.find((tier) => {
        const minPeople = Number(tier.minPeople) || 0;
        const maxPeople =
          tier.maxPeople == null ? Infinity : Number(tier.maxPeople);
        return participantCount >= minPeople && participantCount <= maxPeople;
      }) || null;
  }

  if (matchedGroupTier) {
    const groupTotal =
      matchedGroupTier.groupTotal != null
        ? Number(matchedGroupTier.groupTotal)
        : null;

    if (groupTotal !== null && Number.isFinite(groupTotal) && groupTotal > 0) {
      groupPricingType = "groupTotal";
      discountedSubtotal = groupTotal;
      groupDiscountAmount = Math.max(0, originalSubtotal - discountedSubtotal);
      groupDiscountPercent =
        originalSubtotal > 0
          ? (groupDiscountAmount / originalSubtotal) * 100
          : 0;
      adultDiscountAmount = groupDiscountAmount;
      teenDiscountAmount = 0;
      hasDiscount = groupDiscountAmount > 0;
    } else {
      const hasPerPersonPrice =
        matchedGroupTier.perPerson != null &&
        Number.isFinite(Number(matchedGroupTier.perPerson));
      const hasDiscountPercent =
        matchedGroupTier.discountPercent != null &&
        Number.isFinite(Number(matchedGroupTier.discountPercent));

      if (hasPerPersonPrice) {
        groupPricingType = "perPerson";
        const groupPersonPriceZar = Math.max(
          0,
          Number(matchedGroupTier.perPerson),
        );
        const groupPersonPrice = convertPrice(groupPersonPriceZar, currency);

        const discountedAdultSubtotal = adultCount * groupPersonPrice;
        const discountedTeenSubtotal = teens * groupPersonPrice;
        // Children and toddlers keep original price
        const unchangedChildSubtotal = childSubtotal;
        const unchangedToddlerSubtotal = toddlerSubtotal;

        discountedSubtotal =
          discountedAdultSubtotal +
          discountedTeenSubtotal +
          unchangedChildSubtotal +
          unchangedToddlerSubtotal;

        adultDiscountAmount = Math.max(
          0,
          adultSubtotal - discountedAdultSubtotal,
        );
        teenDiscountAmount = Math.max(0, teenSubtotal - discountedTeenSubtotal);
        groupDiscountAmount = adultDiscountAmount + teenDiscountAmount;

        const adultAndTeenOriginal = adultSubtotal + teenSubtotal;
        groupDiscountPercent =
          adultAndTeenOriginal > 0
            ? (groupDiscountAmount / adultAndTeenOriginal) * 100
            : 0;
        hasDiscount = groupDiscountAmount > 0;
      } else if (hasDiscountPercent) {
        groupPricingType = "discountPercent";
        const requested = Number(matchedGroupTier.discountPercent);
        const safe = Math.min(Math.max(requested, 0), 100);

        const adultDiscount = adultSubtotal * (safe / 100);
        const discountedAdultSubtotal = adultSubtotal - adultDiscount;
        const teenDiscount = teenSubtotal * (safe / 100);
        const discountedTeenSubtotal = teenSubtotal - teenDiscount;

        discountedSubtotal =
          discountedAdultSubtotal +
          discountedTeenSubtotal +
          childSubtotal +
          toddlerSubtotal;

        adultDiscountAmount = Math.max(0, adultDiscount);
        teenDiscountAmount = Math.max(0, teenDiscount);
        groupDiscountAmount = adultDiscountAmount + teenDiscountAmount;
        groupDiscountPercent = safe;
        hasDiscount = groupDiscountAmount > 0;
      } else {
        groupPricingType = "custom";
        isCustomQuote = true;
        discountedSubtotal = originalSubtotal;
        groupDiscountAmount = 0;
        groupDiscountPercent = 0;
        adultDiscountAmount = 0;
        teenDiscountAmount = 0;
        hasDiscount = false;
      }
    }
  }

  // ─── Fees ─────────────────────────────────────────────────────────
  const isPrivate = formData.isPrivate;
  const isCustom = formData.isCustom;

  const privateFeeZar = isPrivate ? getFee(tour, "private") : 0;
  const privateFee = convertPrice(privateFeeZar, currency);

  const customFeeZar = isCustom ? getFee(tour, "custom") : 0;
  const customFee = convertPrice(customFeeZar, currency);

  // ─── Extras ──────────────────────────────────────────────────────
  const extrasTotalZar = useMemo(() => {
    const selectedExtras = formData.selectedExtras || {};
    const additionalPricing = tour?.additionalPricing || [];
    if (!Array.isArray(additionalPricing) || additionalPricing.length === 0)
      return 0;
    let total = 0;
    additionalPricing.forEach((extra) => {
      const { type, category, price } = extra;
      const value = selectedExtras[category];
      if (value === undefined || value === null || value === false) return;
      if (type === "quantity") {
        const qty = Number(value) || 0;
        if (qty <= 0) return;
        total += (Number(price) || 0) * qty;
      } else if (type === "fixed") {
        total += Number(price) || 0;
      }
    });
    return total;
  }, [formData.selectedExtras, tour]);

  const extrasTotal = convertPrice(extrasTotalZar, currency);

  // ─── Kids Activity ──────────────────────────────────────────────
  const selectedKidsActivityData = KIDS_ACTIVITIES.find(
    (act) => act.id === formData.selectedKidsActivity,
  );

  const kidsActivityAdultTotalZar = selectedKidsActivityData
    ? (Number(selectedKidsActivityData.adultPrice) || 0) * adultCount
    : 0;
  const kidsActivityChildTotalZar = selectedKidsActivityData
    ? (Number(selectedKidsActivityData.childPrice) || 0) * children
    : 0;
  const kidsActivityToddlerTotalZar = selectedKidsActivityData
    ? (Number(selectedKidsActivityData.toddlerPrice) || 0) * toddlers
    : 0;
  const kidsActivityTotalZar =
    kidsActivityAdultTotalZar +
    kidsActivityChildTotalZar +
    kidsActivityToddlerTotalZar;
  const kidsActivityFee = convertPrice(kidsActivityTotalZar, currency);

  // ─── Totals ──────────────────────────────────────────────────────
  const totalPrice =
    discountedSubtotal + privateFee + customFee + extrasTotal + kidsActivityFee;
  const displayTotal = formatMoney(totalPrice, currency);
  const displayBaseSubtotal = formatMoney(originalSubtotal, currency);
  const displayGroupDiscountAmount = formatMoney(groupDiscountAmount, currency);
  const displayDiscountedTourSubtotal = formatMoney(
    discountedSubtotal,
    currency,
  );
  const displayPrivateFee = formatMoney(privateFee, currency);
  const displayCustomFee = formatMoney(customFee, currency);
  const displayExtrasTotal =
    extrasTotal > 0 ? formatMoney(extrasTotal, currency) : "None";
  const displayKidsActivityTotal =
    kidsActivityFee > 0 ? formatMoney(kidsActivityFee, currency) : "—";

  // ─── UI helpers ──────────────────────────────────────────────────
  const formatTourMeta = (value = "") => {
    const cleaned = value
      .toString()
      .replace(/[-_]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (!cleaned) return "";
    if (/half\s*day/i.test(cleaned)) return "Half-Day";
    if (/full\s*day/i.test(cleaned)) return "Full-Day";
    return cleaned.replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  const tourDurationLabel = formatTourMeta(
    tour?.duration || tour?.category || "Tour",
  );
  const tourLocationLabel = formatTourMeta(tour?.location || "Cape Town");
  const tourStyleLabel = formatTourMeta(
    tour?.type || tour?.category || "Cape Town Tour",
  );
  const tourInfoPills = [
    {
      label: "Duration",
      value: tourDurationLabel,
      className: "border-[#f7b7c8]/60 bg-[#fde2eb]/90 text-[#7b334f]",
    },
    {
      label: "Style",
      value: tourStyleLabel,
      className: "border-[#ffd08a]/70 bg-[#fff0c9]/90 text-[#76511c]",
    },
    {
      label: "Location",
      value: tourLocationLabel,
      className: "border-[#a8d8ee]/70 bg-[#dff4ff]/90 text-[#24566b]",
    },
    {
      label: "Pickup",
      value: "Included",
      className: "border-[#b8e6c8]/70 bg-[#e3f8df]/90 text-[#2d6139]",
    },
  ].filter((pill) => pill.value);

  const normalizedParticipantEmails = (formData.participantEmails || [])
    .map((email) => email.trim())
    .filter(Boolean);

  const contactDetailsComplete = Boolean(
    formData.fullName.trim() && formData.mobile.trim() && formData.email.trim(),
  );
  const dateDetailsComplete = Boolean(formData.date);
  const travellerDetailsComplete =
    contactDetailsComplete && dateDetailsComplete;
  const pickupDetailsComplete = Boolean(formData.pickupCoords);

  // ─── Map state ──────────────────────────────────────────────────
  const [mapCenter, setMapCenter] = useState({
    lat: DEFAULT_CENTER[0],
    lng: DEFAULT_CENTER[1],
  });
  const [markerPosition, setMarkerPosition] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [showPickupPicker, setShowPickupPicker] = useState(true);
  const [pendingPickup, setPendingPickup] = useState(null);
  const [showTravellerEditor, setShowTravellerEditor] = useState(true);
  const [showGroupEditor, setShowGroupEditor] = useState(true);

  // ─── Effects ──────────────────────────────────────────────────────
  const handleImageError = (e) => {
    if (e.currentTarget.src.includes(fallbackImage)) return;
    e.currentTarget.src = fallbackImage;
  };

  const handleBack = () => {
    if (window.lenis) {
      window.lenis.stop();
      window.lenis.scrollTo(window.scrollY, { immediate: true, force: true });
    }
    requestAnimationFrame(() => nav(-1));
  };

  // Prefill from bookingData
  const prevBookingDataRef = useRef();
  useEffect(() => {
    if (!bookingData) return;
    const currentKey = JSON.stringify(bookingData);
    if (prevBookingDataRef.current === currentKey) return;

    const bd = bookingData;
    const updates = {};
    if (bd.fullName !== undefined) updates.fullName = bd.fullName;
    if (bd.mobile !== undefined) updates.mobile = bd.mobile;
    if (bd.email !== undefined) updates.email = bd.email;
    if (bd.date) {
      let normalizedDate = bd.date;
      const dateObj = new Date(bd.date);
      if (!isNaN(dateObj.getTime()))
        normalizedDate = dateObj.toISOString().split("T")[0];
      updates.date = normalizedDate;
    }

    if (bd.adults !== undefined) updates.adults = String(bd.adults);

    // Prefer the detailed per-child ages array (from TourSelect's guest picker)
    // over the plain `children` count — it carries toddler/child/teen info
    // that the count alone loses.
    const incomingChildAges = Array.isArray(bd.childAges)
      ? bd.childAges
          .map((age) => Number(age))
          .filter((age) => Number.isFinite(age))
      : null;

    if (incomingChildAges) {
      updates.childAges = incomingChildAges;
      updates.children = String(incomingChildAges.length);
    } else if (bd.children !== undefined) {
      updates.children = String(bd.children);
    }

    if (bd.pickupLocation !== undefined)
      updates.pickupLocation = bd.pickupLocation;
    if (bd.pickupCoords?.lat && bd.pickupCoords?.lng) {
      updates.pickupCoords = {
        lat: bd.pickupCoords.lat,
        lng: bd.pickupCoords.lng,
      };
    }
    if (bd.isPrivate !== undefined) updates.isPrivate = bd.isPrivate;
    if (bd.isCustom !== undefined) updates.isCustom = bd.isCustom;
    if (bd.ccParticipants !== undefined)
      updates.ccParticipants = bd.ccParticipants;
    if (Array.isArray(bd.participantEmails))
      updates.participantEmails = bd.participantEmails;

    // Adjust participants & enforce max 8 total
    const rawAdults =
      updates.adults !== undefined ? Number(updates.adults) : adultCount;
    const rawChildren =
      updates.children !== undefined ? Number(updates.children) : 0;
    let total = rawAdults + rawChildren;
    if (total > 8) {
      const cappedAdults = Math.min(rawAdults, 8);
      const cappedChildren = Math.min(rawChildren, 8 - cappedAdults);
      updates.adults = String(cappedAdults);
      updates.children = String(cappedChildren);
      total = cappedAdults + cappedChildren;
      if (updates.childAges) {
        updates.childAges = updates.childAges.slice(0, cappedChildren);
      }
    }
    updates.participants = String(total);

    const maxEmails = Math.max(total - 1, 0);
    if (updates.participantEmails?.length > maxEmails) {
      updates.participantEmails = updates.participantEmails.slice(0, maxEmails);
      if (maxEmails === 0) updates.ccParticipants = false;
    }

    if (Object.keys(updates).length) {
      setFormData((prev) => ({ ...prev, ...updates }));
    }

    if (updates.pickupCoords) {
      setMarkerPosition(updates.pickupCoords);
      setMapCenter(updates.pickupCoords);
      setShowPickupPicker(false);
      setPendingPickup(null);
    }

    if (
      updates.adults !== undefined ||
      updates.children !== undefined ||
      updates.childAges !== undefined
    ) {
      setShowGroupEditor(false);
      if (updates.childAges?.length) {
        setShowChildrenSelector(true);
      }
    }

    const preferredCurrency =
      bd.selectedCurrency || bd.pricingOptions?.currency;
    if (preferredCurrency && supportedCurrencies.includes(preferredCurrency)) {
      setCurrency(preferredCurrency);
    }

    prevBookingDataRef.current = currentKey;
  }, [bookingData, supportedCurrencies]);

  // Auto-initialize min participants if no bookingData
  const defaultInitializedRef = useRef(false);
  useEffect(() => {
    if (!tour || bookingData) return;
    if (defaultInitializedRef.current) return;
    const currentAdults = Number(formData.adults || 1);
    const currentChildren = Number(formData.children || 0);
    const total = currentAdults + currentChildren;
    const minPeople = tour?.minPeople ?? 1;
    if (total < minPeople) {
      const needed = minPeople - total;
      const newAdults = Math.min(currentAdults + needed, 8);
      const newChildren = Math.min(currentChildren, 8 - newAdults);
      setFormData((prev) => ({
        ...prev,
        adults: String(newAdults),
        children: String(newChildren),
        participants: String(newAdults + newChildren),
      }));
    }
    defaultInitializedRef.current = true;
  }, [tour, bookingData, formData.adults, formData.children]);

  useEffect(() => {
    if (!tour) nav("/");
  }, [tour, nav]);

  useEffect(() => {
    setActiveImage(0);
  }, [tour]);

  useEffect(() => {
    if (location.state?.forceScrollTop) {
      window.scrollTo(0, 0);
      if (window.lenis) {
        window.lenis.scrollTo(0, { immediate: true, force: true });
        window.lenis.start();
      }
    }
  }, [location.state]);

  useEffect(() => {
    if (!gallery.length || gallery.length === 1) return;
    const interval = setInterval(() => {
      setActiveImage((prev) => (prev + 1) % gallery.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [gallery]);

  useEffect(() => {
    if (!activeImageRef.current) return;
    gsap.fromTo(
      activeImageRef.current,
      { opacity: 0.65, scale: 1.02 },
      { opacity: 1, scale: 1, duration: 0.55, ease: "power2.out" },
    );
  }, [activeImage]);

  useEffect(() => {
    if (!formData.pickupCoords || !pickupFeedbackRef.current) return;
    gsap.fromTo(
      pickupFeedbackRef.current,
      { y: 10, scale: 0.985, autoAlpha: 0.82 },
      { y: 0, scale: 1, autoAlpha: 1, duration: 0.42, ease: "back.out(1.7)" },
    );
  }, [formData.pickupCoords]);

  useEffect(() => {
    if (travellerDetailsComplete && !bookingBasicsCompleteRef.current) {
      setShowTravellerEditor(false);
    }
    bookingBasicsCompleteRef.current = travellerDetailsComplete;
  }, [travellerDetailsComplete]);

  useLayoutEffect(() => {
    if (!tour) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      if (!isEmbedded && backRef.current) {
        tl.fromTo(
          backRef.current,
          { opacity: 0, x: -18 },
          { opacity: 1, x: 0, duration: 0.45 },
        );
      }
      if (cardRef.current) {
        tl.fromTo(
          cardRef.current,
          {
            opacity: 0,
            y: isEmbedded ? 18 : 36,
            scale: isEmbedded ? 1 : 0.985,
          },
          { opacity: 1, y: 0, scale: 1, duration: isEmbedded ? 0.45 : 0.65 },
          isEmbedded ? 0 : "-=0.15",
        );
      }
      if (!isEmbedded && leftRef.current) {
        tl.fromTo(
          leftRef.current,
          { opacity: 0, x: -34 },
          { opacity: 1, x: 0, duration: 0.55 },
          "-=0.45",
        );
      }
      if (rightRef.current) {
        tl.fromTo(
          rightRef.current,
          { opacity: 0, x: isEmbedded ? 0 : 34, y: isEmbedded ? 14 : 0 },
          { opacity: 1, x: 0, y: 0, duration: isEmbedded ? 0.42 : 0.55 },
          isEmbedded ? "-=0.2" : "-=0.5",
        );
      }
      if (checkoutRef.current) {
        tl.fromTo(
          checkoutRef.current,
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.45 },
          "-=0.15",
        );
      }
      if (bottomRef.current) {
        tl.fromTo(
          bottomRef.current,
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 0.45 },
          "-=0.12",
        );
      }
      if (priceRef.current) {
        gsap.fromTo(
          priceRef.current,
          { opacity: 0.5, scale: 0.95 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.7,
            delay: isEmbedded ? 0.35 : 0.7,
            ease: "back.out(1.7)",
          },
        );
      }
    }, pageRef);
    return () => ctx.revert();
  }, [tour, isEmbedded]);

  // ─── Handlers ────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "children") {
      const nextChildValue = Number(value || 0);
      setShowChildrenSelector(nextChildValue > 0);
    }
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "adults" || name === "children") {
        let nextAdultCount = Math.max(
          Number(name === "adults" ? value : prev.adults || 1),
          1,
        );
        let nextChildCount = Math.max(
          Number(name === "children" ? value : prev.children || 0),
          0,
        );
        if (nextAdultCount + nextChildCount > 8) {
          if (name === "adults")
            nextChildCount = Math.max(0, 8 - nextAdultCount);
          else nextAdultCount = Math.max(1, 8 - nextChildCount);
        }
        const nextParticipantCount = Math.max(
          nextAdultCount + nextChildCount,
          1,
        );
        const maxEmails = Math.max(nextParticipantCount - 1, 0);
        next.adults = String(nextAdultCount);
        next.children = String(nextChildCount);
        next.participants = String(nextParticipantCount);
        next.participantEmails = (prev.participantEmails || []).slice(
          0,
          maxEmails,
        );
        if (maxEmails === 0) next.ccParticipants = false;
      }
      return next;
    });
  };

  const handleToggleOption = (name) => {
    setFormData((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const handleAddChildren = () => {
    setShowChildrenSelector(true);
    setShowGroupEditor(true);
    setFormData((prev) => {
      const currentAdults = Math.max(Number(prev.adults || 1), 1);
      const nextChildren = Math.min(
        Math.max(Number(prev.children || 0), 1),
        Math.max(0, 8 - currentAdults),
      );
      const nextParticipantCount = Math.max(currentAdults + nextChildren, 1);
      const maxEmails = Math.max(nextParticipantCount - 1, 0);
      return {
        ...prev,
        children: String(nextChildren),
        participants: String(nextParticipantCount),
        participantEmails: (prev.participantEmails || []).slice(0, maxEmails),
        ccParticipants: maxEmails === 0 ? false : prev.ccParticipants,
      };
    });
  };

  const adjustGuestCount = (type, delta) => {
    setFormData((prev) => {
      let nextAdults = Number(prev.adults || 1);
      let nextChildren = Number(prev.children || 0);
      let total = nextAdults + nextChildren;
      const minPeople = tour?.minPeople ?? 1;
      if (delta < 0 && total - 1 < minPeople) return prev;
      if (type === "adults") {
        nextAdults = Math.min(
          Math.max(nextAdults + delta, 1),
          8 - nextChildren,
        );
      } else if (type === "children") {
        nextChildren = Math.min(
          Math.max(nextChildren + delta, 0),
          8 - nextAdults,
        );
      }
      let newTotal = nextAdults + nextChildren;
      if (newTotal < minPeople) {
        const needed = minPeople - newTotal;
        const canAddToAdults = Math.min(needed, 8 - nextAdults);
        nextAdults += canAddToAdults;
        nextChildren += needed - canAddToAdults;
        nextChildren = Math.min(nextChildren, 8 - nextAdults);
      }
      const nextParticipantCount = nextAdults + nextChildren;
      const maxEmails = Math.max(nextParticipantCount - 1, 0);
      setShowChildrenSelector(nextChildren > 0);
      return {
        ...prev,
        adults: String(nextAdults),
        children: String(nextChildren),
        participants: String(nextParticipantCount),
        participantEmails: (prev.participantEmails || []).slice(0, maxEmails),
        ccParticipants: maxEmails === 0 ? false : prev.ccParticipants,
      };
    });
  };

  const addParticipantEmail = () => {
    setFormData((prev) => {
      const existing = prev.participantEmails || [];
      if (existing.length >= Math.max(participantCount - 1, 0)) return prev;
      return {
        ...prev,
        participantEmails: [...existing, ""],
        ccParticipants: true,
      };
    });
  };

  const updateParticipantEmail = (index, value) => {
    setFormData((prev) => ({
      ...prev,
      participantEmails: (prev.participantEmails || []).map(
        (email, emailIndex) => (emailIndex === index ? value : email),
      ),
    }));
  };

  const removeParticipantEmail = (index) => {
    setFormData((prev) => {
      const nextEmails = (prev.participantEmails || []).filter(
        (_, emailIndex) => emailIndex !== index,
      );
      return {
        ...prev,
        participantEmails: nextEmails,
        ccParticipants: nextEmails.length ? prev.ccParticipants : false,
      };
    });
  };

  const handlePickupInputChange = (e) => {
    const { value } = e.target;
    setPendingPickup(null);
    setMarkerPosition(null);
    setShowPickupPicker(true);
    setFormData((prev) => ({
      ...prev,
      pickupLocation: value,
      pickupCoords: null,
    }));
  };

  const handleConfirmPickupLocation = () => {
    if (!pendingPickup?.coords) return;
    setFormData((prev) => ({
      ...prev,
      pickupLocation: pendingPickup.location,
      pickupCoords: pendingPickup.coords,
    }));
    setPendingPickup(null);
    setShowPickupPicker(false);
  };

  const handleMapPick = async (coords) => {
    setMarkerPosition(coords);
    setMapCenter(coords);
    setLocationError("");
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coords.lat}&lon=${coords.lng}`,
      );
      const data = await res.json();
      setPendingPickup({
        location:
          data?.display_name ||
          `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`,
        coords,
      });
    } catch {
      setPendingPickup({
        location: `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`,
        coords,
      });
    }
  };

  const handleFindAddress = async () => {
    const query = formData.pickupLocation.trim();
    if (!query) {
      setLocationError("Enter a pickup address first.");
      return;
    }
    try {
      setLocationLoading(true);
      setLocationError("");
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(query)}`,
      );
      if (!res.ok) throw new Error("Search failed");
      const data = await res.json();
      if (!data.length) {
        setLocationError("No matching location found.");
        return;
      }
      const result = data[0];
      const coords = { lat: Number(result.lat), lng: Number(result.lon) };
      setMarkerPosition(coords);
      setMapCenter(coords);
      setPendingPickup({
        location: result.display_name || formData.pickupLocation,
        coords,
      });
    } catch {
      setLocationError("Could not find that address.");
    } finally {
      setLocationLoading(false);
    }
  };

  // ─── Submit ──────────────────────────────────────────────────────
  const handleSubmit = (e) => {
    e.preventDefault();
    const requiredFields = [
      "fullName",
      "mobile",
      "email",
      "date",
      "adults",
      "children",
      "pickupLocation",
    ];
    const missing = requiredFields.some((field) => !formData[field]);
    if (missing) {
      alert("Please fill in all fields");
      return;
    }
    if (!formData.pickupCoords) {
      alert("Please confirm your pickup point on the map.");
      return;
    }
    const invalidParticipantEmail = normalizedParticipantEmails.find(
      (email) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    );
    if (invalidParticipantEmail) {
      alert(`Please check this participant email: ${invalidParticipantEmail}`);
      return;
    }

    // Prepare kids activity fee (already computed)
    const kidsActivityFeeConverted = kidsActivityFee;

    // Compute final total with all components
    const finalTotal = totalPrice;

    nav("/checkout", {
      state: {
        tour,
        bookingDetails: {
          ...formData,
          adults: adultCount,
          children: children,
          toddlers: toddlers,
          teens: teens,
          childAges: childAges,
          participants: String(participantCount),
          participantEmails: normalizedParticipantEmails,
          ccParticipantEmails: formData.ccParticipants
            ? normalizedParticipantEmails
            : [],
          selectedExtras: formData.selectedExtras || {},
          selectedKidsActivity: formData.selectedKidsActivity,
          kidsActivityFee: kidsActivityFeeConverted,
          pricingOptions: {
            isPrivate,
            isCustom,
            privateFee,
            customFee,
            groupDiscountPercent,
            groupDiscountAmount,
            subtotalBeforeGroupDiscount: originalSubtotal,
            discountedTourSubtotal: discountedSubtotal,
            extrasTotal,
            kidsActivityFee: kidsActivityFeeConverted,
            estimatedTotal: finalTotal,
            currency,
          },
        },
        selectedCurrency: currency,
      },
    });
  };

  // ─── Render ──────────────────────────────────────────────────────
  if (!tour) return null;

  return (
    <div
      ref={pageRef}
      className={`relative overflow-hidden text-neutral-900 ${
        isEmbedded ? "min-h-0 bg-transparent" : "min-h-screen bg-stone-50"
      }`}
    >
      <img
        src="/assets/content/clip-art/section1-bg.png"
        alt=""
        className={`pointer-events-none absolute z-10 h-full w-full select-none object-contain opacity-90 ${
          isEmbedded ? "hidden" : ""
        }`}
      />

      <div
        className={`absolute inset-0 bg-gradient-to-b from-white/70 via-stone-50/90 to-sky-100/80 ${
          isEmbedded ? "hidden" : ""
        }`}
      />

      <div
        className={`relative z-10 ${
          isEmbedded
            ? "px-4 py-0 sm:px-5"
            : "px-4 py-6 sm:px-6 md:px-8 lg:px-12 xl:px-20"
        }`}
      >
        {/* Back button */}
        <div
          ref={backRef}
          className={`mx-auto mb-6 max-w-7xl ${isEmbedded ? "hidden" : ""}`}
        >
          <button
            onClick={handleBack}
            className="group flex items-center gap-3 rounded-full border border-black/10 bg-white/90 px-5 py-3 text-neutral-800 shadow-sm transition-all duration-300 hover:bg-white hover:shadow-md"
          >
            <img
              src="/icons/upArrow.png"
              className="w-4 rotate-270 transition-transform duration-300 group-hover:-translate-x-1"
              alt=""
            />
            <span className="font-frank text-base">Back to tours</span>
          </button>
        </div>

        {/* Main card */}
        <div
          ref={cardRef}
          className={`mx-auto overflow-hidden border border-black/5 bg-white/92 backdrop-blur-md ${
            isEmbedded
              ? "max-w-6xl rounded-[1.5rem] shadow-[0_16px_48px_rgba(37,99,235,0.08)]"
              : "max-w-7xl rounded-[2rem] shadow-[0_24px_70px_rgba(0,0,0,0.10)]"
          }`}
        >
          <div
            className={
              isEmbedded ? "grid" : "grid lg:grid-cols-[0.95fr_1.05fr]"
            }
          >
            {/* Left column – Tour gallery & details */}
            <div
              ref={leftRef}
              className={isEmbedded ? "hidden" : "relative bg-neutral-100"}
            >
              <div className="relative h-[380px] overflow-hidden md:h-[460px] lg:h-[680px]">
                <img
                  ref={activeImageRef}
                  src={resolveImage(activeImageSrc)}
                  alt={tour.title || tour.info}
                  className="h-full w-full object-cover"
                  onError={handleImageError}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/76 via-black/24 to-black/8" />

                <div className="absolute left-5 top-5 flex flex-wrap gap-2">
                  {tour.duration && (
                    <span className="rounded-full border border-white/20 bg-white/16 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
                      {tour.duration}
                    </span>
                  )}
                  {tour.rating && (
                    <span className="rounded-full border border-white/20 bg-green-200/95 px-3 py-1.5 text-xs font-bold text-green-950 backdrop-blur-md">
                      {tour.rating} rating
                    </span>
                  )}
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-6 text-white md:p-8">
                  <div className="text-xs font-bold uppercase tracking-[0.25em] text-white/75">
                    Selected Tour
                  </div>
                  <div className="mt-2 max-w-[12ch] font-frank text-4xl leading-[0.92] md:text-5xl">
                    {tour.title || tour.info}
                  </div>
                  {tour.location && (
                    <div className="mt-4 inline-flex rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold backdrop-blur-sm">
                      {tour.location}
                    </div>
                  )}
                </div>
              </div>

              <div className="p-5 md:p-7">
                <div className="mb-5 flex gap-3 overflow-x-auto pb-1">
                  {gallery.map((img, index) => (
                    <button
                      key={`${img}-${index}`}
                      type="button"
                      onClick={() => setActiveImage(index)}
                      className={`h-20 w-24 shrink-0 overflow-hidden rounded-2xl border transition-all duration-300 ${
                        activeImage === index
                          ? "border-neutral-900 ring-2 ring-neutral-900/10"
                          : "border-black/10 opacity-75 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={resolveImage(img)}
                        alt={`${tour.title || tour.info} ${index + 1}`}
                        className="h-full w-full object-cover"
                        onError={handleImageError}
                      />
                    </button>
                  ))}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <MiniAssurance
                    title="Pickup included"
                    text="Choose your accommodation or confirm a custom pickup point."
                    icon="⌖"
                  />
                  <MiniAssurance
                    title="Pay now, confirm after"
                    text="Final pickup and operational details are confirmed manually."
                    icon="✓"
                  />
                </div>

                <div className="mt-4 rounded-[1.5rem] border border-black/5 bg-white/80 p-5">
                  <div className="text-xs font-bold uppercase tracking-[0.22em] text-neutral-400">
                    Tour overview
                  </div>
                  {tour.description && (
                    <p className="mt-3 leading-7 text-neutral-650">
                      {tour.description}
                    </p>
                  )}
                </div>

                {relatedTours.length > 0 && (
                  <div className="mt-4 rounded-[1.5rem] p-5">
                    <div className="mb-4 flex items-end justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.22em] text-neutral-400">
                          Related tours
                        </p>
                        <h3 className="mt-1 font-frank text-2xl leading-none text-neutral-950">
                          You may also like
                        </h3>
                      </div>
                      <span className="rounded-full bg-green-200 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-green-950">
                        Explore
                      </span>
                    </div>

                    <div className="grid gap-3">
                      {relatedTours.map((related) => {
                        const relatedImage =
                          related.image ||
                          getTourGallery(related)?.[0] ||
                          "/images/content/random/1.webp";
                        const relatedPrice = formatMoney(
                          convertPrice(related.priceBase, currency),
                          currency,
                        );
                        return (
                          <button
                            key={related.slug || related.id}
                            type="button"
                            onClick={() => nav(`/tours/${related.slug}`)}
                            className="group flex items-center gap-3 rounded-2xl border border-black/5 bg-neutral-50 p-2 text-left transition hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_12px_28px_rgba(0,0,0,0.07)]"
                          >
                            <img
                              src={resolveImage(relatedImage)}
                              alt={related.title}
                              className="h-16 w-20 shrink-0 rounded-xl object-cover"
                              loading="lazy"
                              onError={(e) => {
                                e.currentTarget.src =
                                  "/images/content/random/1.webp";
                              }}
                            />
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-bitter text-sm font-bold text-neutral-950">
                                {related.title}
                              </p>
                              <p className="mt-1 line-clamp-1 text-xs text-neutral-500">
                                {related.duration ||
                                  related.location ||
                                  "Cape Town experience"}
                              </p>
                              <p className="mt-1 text-xs font-bold text-green-700">
                                From {relatedPrice} pp
                              </p>
                            </div>
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-neutral-400 transition group-hover:bg-green-200 group-hover:text-green-950">
                              →
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right column – Booking form */}
            <div
              ref={rightRef}
              className={`group/right ${
                isEmbedded
                  ? "p-3 sm:p-5 md:p-6 lg:p-7"
                  : "p-4 sm:p-5 md:p-7 lg:p-8"
              }`}
            >
              {/* TOUR SUMMARY */}
              <div
                className="
                  relative isolate overflow-hidden
                  rounded-[2rem] sm:rounded-[2.5rem]
                  border border-black/5
                  px-4 py-6
                  sm:px-6 sm:py-8
                  md:px-8 md:py-10
                  transition-all duration-500
                  group-hover/right:border-blue-200
                "
              >
                <img
                  src={resolveImage(tour.image)}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  decoding="async"
                  className="
                    pointer-events-none
                    absolute inset-0
                    h-full w-full
                    object-cover
                    opacity-55
                    transition-transform duration-700
                    group-hover/right:scale-[1.03]
                  "
                  onError={(e) => {
                    e.currentTarget.src = resolveImage(fallbackImage);
                  }}
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-white/85" />

                <div className="relative z-10">
                  <div className="text-center">
                    <p className="text-[9px] font-black uppercase tracking-[0.22em] text-white/75 sm:text-[10px] sm:tracking-[0.26em]">
                      Selected tour
                    </p>
                    <h3 className="mx-auto mt-2 max-w-4xl font-frank font-bold leading-[0.9] tracking-[-0.04em] text-white text-[clamp(2rem,8vw,5.6rem)]">
                      {tour.title || tour.info}
                    </h3>
                  </div>

                  {tourInfoPills?.length > 0 && (
                    <div className="mx-auto mt-5 flex max-w-3xl flex-wrap justify-center gap-2 sm:mt-6 sm:gap-2.5">
                      {tourInfoPills.map((pill) => (
                        <span
                          key={`${pill.label}-${pill.value}`}
                          className={`
                            inline-flex
                            min-h-9
                            items-center
                            gap-1.5
                            rounded-full
                            border
                            px-3 py-1.5
                            text-[11px]
                            font-bold
                            shadow-[0_8px_20px_rgba(0,0,0,0.05)]
                            backdrop-blur-md
                            sm:min-h-10
                            sm:gap-2
                            sm:px-4
                            sm:py-2
                            sm:text-xs
                            ${pill.className}
                          `}
                        >
                          <span className="text-[8px] font-black uppercase tracking-[0.16em] opacity-65 sm:text-[9px] sm:tracking-[0.18em]">
                            {pill.label}
                          </span>
                          <span className="whitespace-nowrap">
                            {pill.value}
                          </span>
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-6 flex justify-center sm:mt-8">
                    <div
                      ref={priceRef}
                      className="
                        flex w-full
                        max-w-md
                        flex-col
                        overflow-hidden
                        rounded-[1.5rem]
                        border border-black/5
                        bg-white/90
                        shadow-[0_14px_40px_rgba(0,0,0,0.08)]
                        backdrop-blur-xl
                        sm:max-w-fit
                        sm:flex-row
                        sm:items-stretch
                      "
                    >
                      <div className="flex min-w-0 flex-1 flex-col items-center justify-center px-5 py-4 text-center sm:min-w-[10rem] sm:px-6 sm:py-4">
                        <div className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-400 sm:text-[10px]">
                          From
                        </div>
                        <div className="mt-1 max-w-full truncate font-frank text-3xl font-bold leading-none tracking-tight text-neutral-950 sm:text-4xl">
                          {formatMoney(
                            convertPrice(tour?.priceBase, currency),
                            currency,
                          )}
                        </div>
                        <div className="mt-1 text-[11px] font-medium text-neutral-500 sm:text-xs">
                          per person
                        </div>
                      </div>

                      <div className="mx-5 h-px bg-black/5 sm:mx-0 sm:my-4 sm:h-auto sm:w-px" />

                      <div className="flex items-center justify-center px-4 py-3 sm:px-4 sm:py-4">
                        <div className="relative">
                          <label htmlFor="tour-currency" className="sr-only">
                            Select currency
                          </label>
                          <select
                            id="tour-currency"
                            aria-label="Select currency"
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value)}
                            className="
                              h-12
                              w-full
                              min-w-[7rem]
                              cursor-pointer
                              appearance-none
                              rounded-xl
                              border
                              border-black/10
                              bg-neutral-50
                              px-4
                              pr-9
                              text-center
                              text-sm
                              font-black
                              text-neutral-900
                              outline-none
                              transition-all
                              duration-200
                              hover:border-green-300
                              hover:bg-green-50
                              focus:border-green-400
                              focus:bg-green-50
                              focus:ring-2
                              focus:ring-green-400/20
                              sm:h-14
                              sm:w-24
                            "
                          >
                            {supportedCurrencies.map((code) => (
                              <option key={code} value={code}>
                                {code}
                              </option>
                            ))}
                          </select>
                          <span
                            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400"
                            aria-hidden="true"
                          >
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.4"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="m6 9 6 6 6-6" />
                            </svg>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tour Options */}
              {Array.isArray(tour?.options) && tour.options.length > 0 && (
                <TourOptions
                  tour={tour}
                  selectedOption={formData?.selectedOption}
                  onOptionChange={(optionId) => {
                    setFormData((prev) => ({
                      ...prev,
                      selectedOption: optionId,
                    }));
                  }}
                />
              )}

              {/* Booking Form */}
              <form
                id="booking-form"
                onSubmit={handleSubmit}
                className="grid gap-5 mt-5"
              >
                {/* 1. Traveller Details */}
                <div className="rounded-[1.75rem] border border-black/5 bg-white p-4 shadow-[0_12px_32px_rgba(0,0,0,0.04)] transition-all duration-500 group-hover/right:border-green-200/80 group-hover/right:shadow-[0_16px_42px_rgba(34,197,94,0.08)] sm:p-5">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-green-200 text-sm font-bold text-green-950 ring-1 ring-green-300">
                      1
                    </span>
                    <div>
                      <h3 className="font-frank text-2xl leading-none text-neutral-950">
                        Traveller details
                      </h3>
                      <p className="mt-1 text-xs text-neutral-500">
                        Add contact details and choose the preferred tour date.
                      </p>
                    </div>
                  </div>

                  {travellerDetailsComplete && !showTravellerEditor && (
                    <div className="mb-4 rounded-2xl border border-green-200 bg-green-50 p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm font-bold text-green-950">
                            Traveller details saved
                          </p>
                          <p className="mt-1 text-xs leading-5 text-neutral-600">
                            {formData.fullName} · {formData.mobile} ·{" "}
                            {formData.email} · {formData.date}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setTravellerSnapshot({
                              fullName: formData.fullName,
                              mobile: formData.mobile,
                              email: formData.email,
                              date: formData.date,
                            });
                            setShowTravellerEditor(true);
                          }}
                          className="w-fit rounded-full border border-green-200 bg-white px-4 py-2 text-xs font-bold text-green-800 transition hover:bg-green-100"
                        >
                          Change
                        </button>
                      </div>
                    </div>
                  )}

                  <div
                    className={`transition-all duration-500 ease-out ${
                      travellerDetailsComplete && !showTravellerEditor
                        ? "max-h-0 overflow-hidden opacity-0 pointer-events-none"
                        : "max-h-[650px] opacity-100"
                    }`}
                  >
                    <div className="grid gap-4 sm:grid-cols-2">
                      <BookingField label="Full name">
                        <input
                          name="fullName"
                          placeholder="Faiez Viljoen"
                          value={formData.fullName}
                          onChange={handleChange}
                          className="w-full rounded-2xl border border-neutral-200 bg-white p-4 text-base outline-none transition focus:border-green-400 focus:ring-4 focus:ring-green-100"
                        />
                      </BookingField>

                      <BookingField label="Mobile number">
                        <input
                          name="mobile"
                          placeholder="081 000 0000"
                          value={formData.mobile}
                          onChange={handleChange}
                          className="w-full rounded-2xl border border-neutral-200 bg-white p-4 text-base outline-none transition focus:border-green-400 focus:ring-4 focus:ring-green-100"
                        />
                      </BookingField>

                      <BookingField label="Email address">
                        <input
                          name="email"
                          type="email"
                          placeholder="name@email.com"
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full rounded-2xl border border-neutral-200 bg-white p-4 text-base outline-none transition focus:border-green-400 focus:ring-4 focus:ring-green-100"
                        />
                      </BookingField>

                      <BookingField label="Preferred date">
                        <input
                          name="date"
                          type="date"
                          value={formData.date}
                          onClick={(e) => e.currentTarget.showPicker?.()}
                          onFocus={(e) => e.currentTarget.showPicker?.()}
                          onChange={handleChange}
                          className="w-full cursor-pointer rounded-2xl border border-neutral-200 bg-white p-4 text-base outline-none transition focus:border-green-400 focus:ring-4 focus:ring-green-100"
                        />
                      </BookingField>
                    </div>

                    <div className="mt-4 flex flex-wrap justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setTravellerSnapshot(null);
                          setShowTravellerEditor(false);
                        }}
                        className="rounded-2xl bg-green-200 px-5 py-3 text-sm font-bold text-green-950 transition hover:-translate-y-0.5 hover:bg-green-300"
                      >
                        Save traveller details
                      </button>
                      {showTravellerEditor && travellerSnapshot && (
                        <button
                          type="button"
                          onClick={() => {
                            if (travellerSnapshot) {
                              setFormData((prev) => ({
                                ...prev,
                                fullName: travellerSnapshot.fullName,
                                mobile: travellerSnapshot.mobile,
                                email: travellerSnapshot.email,
                                date: travellerSnapshot.date,
                              }));
                              setTravellerSnapshot(null);
                            }
                            setShowTravellerEditor(false);
                          }}
                          className="rounded-2xl border border-red-200 bg-white px-5 py-3 text-sm font-bold text-red-600 transition hover:bg-red-50"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* 2. Group Size */}
                <div className="rounded-[1.75rem] border border-black/5 bg-white p-4 shadow-[0_12px_32px_rgba(0,0,0,0.04)] transition-all duration-500 group-hover/right:border-green-200/80 group-hover/right:shadow-[0_16px_42px_rgba(34,197,94,0.08)] sm:p-5">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-100 text-sm font-bold text-blue-700 ring-1 ring-blue-200">
                      2
                    </span>
                    <div>
                      <h3 className="font-frank text-2xl leading-none text-neutral-950">
                        Group size
                      </h3>
                      <p className="mt-1 text-xs text-neutral-500">
                        Select the number of guests in your own party.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-green-200 bg-green-50/65 p-4 transition-all duration-300">
                    {/* Wrapper: both states are always rendered – we toggle classes for smooth transitions */}
                    <div className="overflow-hidden transition-all duration-500 ease-out">
                      {/* ---------- Closed summary (visible when !showGroupEditor) ---------- */}
                      <div
                        className={`transition-all duration-500 ease-out ${
                          showGroupEditor
                            ? "max-h-0 opacity-0 pointer-events-none"
                            : "max-h-[200px] opacity-100"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="text-sm font-medium text-neutral-800">
                            <span className="font-bold text-neutral-950">
                              {formData.adults}
                            </span>{" "}
                            adult{formData.adults !== 1 && "s"}
                            {childAges.length > 0 && (
                              <span>
                                ,{" "}
                                <span className="font-bold text-neutral-950">
                                  {childAges.length}
                                </span>{" "}
                                child{childAges.length !== 1 && "ren"}
                              </span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setGroupSnapshot({
                                adults: formData.adults,
                                children: formData.children,
                                childAges: [...(formData.childAges || [])],
                                participantEmails: [
                                  ...(formData.participantEmails || []),
                                ],
                                ccParticipants: formData.ccParticipants,
                              });
                              setShowGroupEditor(true);
                            }}
                            className="shrink-0 rounded-full border border-green-200 bg-white px-4 py-2 text-xs font-bold text-green-800 transition hover:-translate-y-0.5 hover:bg-green-100"
                          >
                            Change
                          </button>
                        </div>
                      </div>

                      {/* ---------- Open editor (visible when showGroupEditor) ---------- */}
                      <div
                        className={`transition-all duration-500 ease-out ${
                          showGroupEditor
                            ? "max-h-[2000px] opacity-100"
                            : "max-h-0 opacity-0 pointer-events-none"
                        }`}
                      >
                        <div className="mt-4">
                          {" "}
                          {/* keep some spacing when expanded */}
                          <div className="grid gap-3 sm:grid-cols-2">
                            {/* Adults */}
                            <GuestStepper
                              label="Adults"
                              value={adultCount}
                              hint="Adults aged 18+ in your booking group."
                              onDecrease={() => adjustGuestCount("adults", -1)}
                              onIncrease={() => adjustGuestCount("adults", 1)}
                              decreaseDisabled={
                                adultCount <= 1 ||
                                adultCount - 1 + childAges.length <
                                  (tour?.minPeople ?? 1)
                              }
                              increaseDisabled={
                                participantCount >= maxParticipants
                              }
                            />

                            {/* Children */}
                            <div>
                              {tour.childFriendly === false && (
                                <div className="mb-2 flex items-center gap-2 rounded-lg border border-amber-200/80 bg-amber-50/70 px-3 py-2 text-xs text-amber-800">
                                  <span
                                    className="text-base"
                                    aria-hidden="true"
                                  >
                                    ⚠️
                                  </span>
                                  <span>
                                    This tour is not child-friendly. Children
                                    cannot be added.
                                  </span>
                                </div>
                              )}

                              <div className="rounded-2xl border border-black/5 bg-white p-4">
                                <div className="flex items-center justify-between gap-3">
                                  <div>
                                    <p className="text-sm font-bold text-neutral-950">
                                      Children
                                    </p>
                                    <p className="mt-1 text-xs leading-5 text-neutral-500">
                                      Add each child's age.
                                    </p>
                                  </div>
                                  <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-700">
                                    {childAges.length}
                                  </span>
                                </div>

                                {/* Age legend */}
                                <div className="mt-3 grid grid-cols-3 gap-1.5">
                                  <div className="rounded-lg border border-blue-100 bg-blue-50/70 px-2 py-1.5 text-center">
                                    <p className="text-[9px] font-black text-blue-700">
                                      Toddler
                                    </p>
                                    <p className="text-[8px] text-blue-500">
                                      0–5
                                    </p>
                                  </div>
                                  <div className="rounded-lg border border-blue-100 bg-blue-50/70 px-2 py-1.5 text-center">
                                    <p className="text-[9px] font-black text-blue-700">
                                      Child
                                    </p>
                                    <p className="text-[8px] text-blue-500">
                                      6–11
                                    </p>
                                  </div>
                                  <div className="rounded-lg border border-blue-100 bg-blue-50/70 px-2 py-1.5 text-center">
                                    <p className="text-[9px] font-black text-blue-700">
                                      Teen
                                    </p>
                                    <p className="text-[8px] text-blue-500">
                                      12–17
                                    </p>
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  disabled={
                                    tour.childFriendly === false || !canAddChild
                                  }
                                  onClick={() => {
                                    setFormData((prev) => ({
                                      ...prev,
                                      childAges: [...(prev.childAges || []), 6],
                                    }));
                                    setChildAddedAnimation(true);
                                    setTimeout(
                                      () => setChildAddedAnimation(false),
                                      900,
                                    );
                                  }}
                                  className="relative mt-4 flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-xs font-black text-blue-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-100 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                  <span className="text-base">+</span> Add child
                                </button>

                                {childAddedAnimation && (
                                  <div className="pointer-events-none flex justify-center overflow-hidden">
                                    <div className="mt-2 animate-[childPop_0.9s_ease-out_forwards] text-3xl">
                                      🧒
                                    </div>
                                  </div>
                                )}

                                {childAges.length > 0 && (
                                  <div className="mt-3 space-y-2">
                                    {(() => {
                                      // Build labels with category and per‑category numbering
                                      const childLabels = childAges.map(
                                        (age, idx) => {
                                          let category;
                                          if (Number(age) <= 5)
                                            category = "Toddler";
                                          else if (Number(age) <= 11)
                                            category = "Child";
                                          else category = "Teen";
                                          return {
                                            age: Number(age),
                                            category,
                                            index: idx,
                                          };
                                        },
                                      );
                                      const categoryCounts = {};
                                      childLabels.forEach((item) => {
                                        categoryCounts[item.category] =
                                          (categoryCounts[item.category] || 0) +
                                          1;
                                        item.displayIndex =
                                          categoryCounts[item.category];
                                      });

                                      return childLabels.map(
                                        ({
                                          age: numericAge,
                                          category,
                                          index,
                                          displayIndex,
                                        }) => {
                                          const isAgeConfirmed =
                                            !!confirmedChildAges[index];
                                          let ageRange, icon;
                                          if (numericAge <= 5) {
                                            ageRange = "0–5 years";
                                            icon = "🧒";
                                          } else if (numericAge <= 11) {
                                            ageRange = "6–11 years";
                                            icon = "👦";
                                          } else {
                                            ageRange = "12–17 years";
                                            icon = "🧑";
                                          }

                                          const increaseAge = () => {
                                            if (isAgeConfirmed) return;
                                            setFormData((prev) => {
                                              const ages = [
                                                ...(prev.childAges || []),
                                              ];
                                              ages[index] = Math.min(
                                                17,
                                                Number(ages[index] || 0) + 1,
                                              );
                                              return {
                                                ...prev,
                                                childAges: ages,
                                              };
                                            });
                                            setConfirmedChildAges((prev) => ({
                                              ...prev,
                                              [index]: false,
                                            }));
                                          };

                                          const decreaseAge = () => {
                                            if (isAgeConfirmed) return;
                                            setFormData((prev) => {
                                              const ages = [
                                                ...(prev.childAges || []),
                                              ];
                                              ages[index] = Math.max(
                                                0,
                                                Number(ages[index] || 0) - 1,
                                              );
                                              return {
                                                ...prev,
                                                childAges: ages,
                                              };
                                            });
                                            setConfirmedChildAges((prev) => ({
                                              ...prev,
                                              [index]: false,
                                            }));
                                          };

                                          const confirmChildAge = () => {
                                            setConfirmedChildAges((prev) => ({
                                              ...prev,
                                              [index]: true,
                                            }));
                                          };

                                          const removeChild = () => {
                                            setFormData((prev) => {
                                              const ages = [
                                                ...(prev.childAges || []),
                                              ];
                                              ages.splice(index, 1);
                                              return {
                                                ...prev,
                                                childAges: ages,
                                              };
                                            });
                                            setConfirmedChildAges((prev) => {
                                              const next = {};
                                              Object.entries(prev).forEach(
                                                ([key, value]) => {
                                                  const oldIndex = Number(key);
                                                  if (oldIndex < index)
                                                    next[oldIndex] = value;
                                                  if (oldIndex > index)
                                                    next[oldIndex - 1] = value;
                                                },
                                              );
                                              return next;
                                            });
                                          };

                                          return (
                                            <div
                                              key={`child-${index}`}
                                              className={`flex flex-col sm:flex-row sm:items-center items-start gap-2 sm:gap-3 rounded-xl border px-3 py-2.5 transition-all duration-300 ${
                                                isAgeConfirmed
                                                  ? "border-green-200 bg-green-50/50"
                                                  : "border-black/5 bg-neutral-50 hover:border-blue-100 hover:bg-blue-50/40"
                                              }`}
                                            >
                                              {/* Icon + info */}
                                              <div className="flex w-full items-center gap-3 sm:w-auto">
                                                <div
                                                  className={`flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-white text-base sm:text-lg shadow-sm transition-all duration-300 ${
                                                    isAgeConfirmed
                                                      ? "ring-2 ring-green-200"
                                                      : "group-hover:scale-105"
                                                  }`}
                                                >
                                                  {icon}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                  <div className="flex items-center gap-2 flex-wrap">
                                                    <p className="text-xs font-black text-neutral-900">
                                                      {category} {displayIndex}
                                                    </p>
                                                    {isAgeConfirmed && (
                                                      <span className="rounded-full bg-green-100 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wide text-green-700">
                                                        Confirmed
                                                      </span>
                                                    )}
                                                  </div>
                                                  <p
                                                    className={`mt-0.5 text-[10px] transition-colors duration-300 ${
                                                      isAgeConfirmed
                                                        ? "text-green-600"
                                                        : "text-neutral-400"
                                                    }`}
                                                  >
                                                    {ageRange}
                                                  </p>
                                                </div>
                                              </div>

                                              {/* Age controls + action buttons */}
                                              <div className="flex w-full flex-wrap items-center justify-between gap-1.5 sm:w-auto sm:flex-nowrap sm:justify-end">
                                                <div
                                                  className={`flex shrink-0 items-center rounded-xl border bg-white shadow-sm transition-opacity duration-300 ${
                                                    isAgeConfirmed
                                                      ? "border-green-200 opacity-60"
                                                      : "border-black/10"
                                                  }`}
                                                >
                                                  <button
                                                    type="button"
                                                    onClick={decreaseAge}
                                                    disabled={
                                                      numericAge <= 0 ||
                                                      isAgeConfirmed
                                                    }
                                                    className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-l-xl text-sm font-black text-neutral-500 transition hover:bg-blue-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-30"
                                                    aria-label={`Decrease ${category} ${displayIndex} age`}
                                                  >
                                                    −
                                                  </button>
                                                  <div className="flex h-7 min-w-[44px] sm:h-8 sm:min-w-[52px] items-center justify-center border-x border-black/5 px-1.5 sm:px-2">
                                                    <span className="text-xs sm:text-sm font-black text-neutral-950">
                                                      {numericAge}
                                                    </span>
                                                    <span className="ml-0.5 sm:ml-1 text-[8px] sm:text-[9px] font-bold text-neutral-400">
                                                      yrs
                                                    </span>
                                                  </div>
                                                  <button
                                                    type="button"
                                                    onClick={increaseAge}
                                                    disabled={
                                                      numericAge >= 17 ||
                                                      isAgeConfirmed
                                                    }
                                                    className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-r-xl text-sm font-black text-neutral-500 transition hover:bg-blue-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-30"
                                                    aria-label={`Increase ${category} ${displayIndex} age`}
                                                  >
                                                    +
                                                  </button>
                                                </div>

                                                <div className="flex shrink-0 items-center gap-1.5">
                                                  <button
                                                    type="button"
                                                    onClick={confirmChildAge}
                                                    disabled={isAgeConfirmed}
                                                    className={`flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full border transition-all duration-300 ${
                                                      isAgeConfirmed
                                                        ? "scale-105 border-green-500 bg-green-500 text-white shadow-[0_4px_14px_rgba(34,197,94,0.25)]"
                                                        : "border-green-200 bg-green-50 text-green-600 hover:scale-110 hover:bg-green-100"
                                                    }`}
                                                    aria-label={
                                                      isAgeConfirmed
                                                        ? `${category} ${displayIndex} age confirmed`
                                                        : `Confirm ${category} ${displayIndex} age`
                                                    }
                                                  >
                                                    <span
                                                      className={`text-xs sm:text-sm font-black transition-transform duration-300 ${
                                                        isAgeConfirmed
                                                          ? "scale-110"
                                                          : "scale-100"
                                                      }`}
                                                    >
                                                      ✓
                                                    </span>
                                                  </button>
                                                  <button
                                                    type="button"
                                                    onClick={removeChild}
                                                    className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-neutral-300 transition-all duration-200 hover:bg-red-50 hover:text-red-500"
                                                    aria-label={`Remove ${category} ${displayIndex}`}
                                                  >
                                                    ×
                                                  </button>
                                                </div>
                                              </div>
                                            </div>
                                          );
                                        },
                                      );
                                    })()}
                                  </div>
                                )}

                                {childAges.length === 0 && (
                                  <div className="mt-3 rounded-xl border border-dashed border-black/10 bg-neutral-50 px-4 py-5 text-center">
                                    <div className="text-2xl opacity-40">
                                      🧒
                                    </div>
                                    <p className="mt-2 text-xs font-bold text-neutral-500">
                                      No children added
                                    </p>
                                    <p className="mt-0.5 text-[10px] text-neutral-400">
                                      Add a child to enter their age.
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          {/* Group policy + action buttons – stacked on mobile, row on desktop */}
                          <div className="mt-4 flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
                            {/* "Save more" banner */}
                            <div
                              ref={groupSaveRef}
                              className="w-full rounded-2xl border border-green-200 bg-white transition-all duration-300 sm:w-auto"
                            >
                              <div className="flex items-center gap-3 p-4">
                                <img
                                  src="/icons/savemore.png"
                                  className="h-16 shrink-0 px-4 object-contain opacity-80"
                                  alt=""
                                  onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                  }}
                                />
                                <div className="min-w-0 flex-1 leading-none">
                                  <p className="text-lg font-bold text-green-950">
                                    Save more when you book as a group
                                  </p>
                                  <button
                                    type="button"
                                    onClick={() => nav("/policies")}
                                    className="mt-2 inline-flex items-center gap-2 rounded-full border border-blue-600/20 bg-white px-4 py-2 text-xs font-bold text-green-800 shadow-sm transition hover:-translate-y-0.5 hover:bg-green-100"
                                  >
                                    <span className="flex h-4 w-4 place-self-center items-center justify-center rounded-full bg-green-200 text-[10px] text-green-950">
                                      i
                                    </span>
                                    Learn more about group policy
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Confirm & Cancel buttons */}
                            <div className="flex w-full flex-col items-center gap-2 sm:w-auto sm:flex-row sm:gap-3">
                              <button
                                type="button"
                                onClick={() => {
                                  // Auto‑confirm all child ages
                                  const currentChildAges =
                                    formData.childAges || [];
                                  const newConfirmed = {};
                                  currentChildAges.forEach((_, index) => {
                                    newConfirmed[index] = true;
                                  });
                                  setConfirmedChildAges(newConfirmed);

                                  // Delay close to allow confirmation animations to play
                                  setTimeout(() => {
                                    setGroupSnapshot(null);
                                    setShowGroupEditor(false);
                                  }, 600);
                                }}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-green-200 bg-white px-5 py-3 text-sm font-bold text-green-950 shadow-sm transition hover:-translate-y-0.5 hover:bg-green-50 sm:w-auto"
                              >
                                <SaveIcon /> Confirm group details
                              </button>

                              {showGroupEditor && groupSnapshot && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (groupSnapshot) {
                                      setFormData((prev) => ({
                                        ...prev,
                                        adults: groupSnapshot.adults,
                                        children: groupSnapshot.children,
                                        childAges: [
                                          ...(groupSnapshot.childAges || []),
                                        ],
                                        participantEmails: [
                                          ...groupSnapshot.participantEmails,
                                        ],
                                        ccParticipants:
                                          groupSnapshot.ccParticipants,
                                      }));
                                      setShowChildrenSelector(
                                        Number(groupSnapshot.children) > 0,
                                      );
                                      setGroupSnapshot(null);
                                    }
                                    setShowGroupEditor(false);
                                  }}
                                  className="w-full rounded-2xl border border-red-200 bg-white px-5 py-3 text-sm font-bold text-red-600 transition hover:bg-red-50 sm:w-auto"
                                >
                                  Cancel
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Pickup Location */}
                <div className="rounded-[1.75rem] border border-blue-100 bg-blue-50/45 p-4 shadow-[0_12px_32px_rgba(0,0,0,0.04)] transition-all duration-500 group-hover/right:border-green-200/90 group-hover/right:bg-green-50/60 group-hover/right:shadow-[0_16px_42px_rgba(34,197,94,0.08)] sm:p-5">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-sky-100 text-sm font-bold text-sky-700 ring-1 ring-sky-200">
                      3
                    </span>
                    <div>
                      <h3 className="font-frank text-2xl leading-none text-neutral-950">
                        Pickup location
                      </h3>
                      <p className="mt-1 text-xs text-neutral-500">
                        Enter an address and search, or click directly on the
                        map.
                      </p>
                    </div>
                  </div>

                  {formData.pickupCoords && !showPickupPicker && (
                    <div
                      ref={pickupFeedbackRef}
                      className="mt-3 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-neutral-600 shadow-[0_14px_34px_rgba(34,197,94,0.10)]"
                    >
                      <div className="flex items-start gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-green-200 text-green-950">
                          <HomeIcon />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-green-950">
                            Pickup location saved
                          </div>
                          <div className="mt-1 leading-6 text-neutral-700">
                            {formData.pickupLocation}
                          </div>
                          <div className="mt-1 text-xs text-neutral-500">
                            {formData.pickupCoords.lat.toFixed(6)},{" "}
                            {formData.pickupCoords.lng.toFixed(6)}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setPendingPickup(null);
                            setMarkerPosition(null);
                            setShowPickupPicker(true);
                            setFormData((prev) => ({
                              ...prev,
                              pickupLocation: "",
                              pickupCoords: null,
                            }));
                          }}
                          className="shrink-0 rounded-full border border-green-200 bg-white px-3 py-1.5 text-xs font-bold text-green-800 transition hover:bg-green-100"
                        >
                          Change
                        </button>
                      </div>
                    </div>
                  )}

                  {!formData.pickupCoords && (
                    <div
                      className={`transition-all duration-500 ease-out ${showPickupPicker ? "max-h-[560px] opacity-100" : "max-h-0 overflow-hidden opacity-0"}`}
                    >
                      <div className="mb-4 flex flex-col gap-3 md:flex-row">
                        <input
                          name="pickupLocation"
                          placeholder="Hotel, guesthouse, Airbnb, or pickup point"
                          value={formData.pickupLocation}
                          onChange={handlePickupInputChange}
                          className="flex-1 rounded-2xl border border-neutral-200 bg-white p-4 text-base outline-none transition focus:border-green-400 focus:ring-4 focus:ring-green-100"
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={
                              pendingPickup
                                ? handleConfirmPickupLocation
                                : handleFindAddress
                            }
                            disabled={
                              locationLoading ||
                              (!pendingPickup &&
                                !formData.pickupLocation.trim())
                            }
                            className="rounded-2xl bg-blue-600 px-5 py-4 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {locationLoading
                              ? "Searching..."
                              : pendingPickup
                                ? "Confirm"
                                : "Find on map"}
                          </button>
                          {pendingPickup && (
                            <button
                              type="button"
                              onClick={() => {
                                setPendingPickup(null);
                                setMarkerPosition(null);
                                setFormData((prev) => ({
                                  ...prev,
                                  pickupLocation: "",
                                  pickupCoords: null,
                                }));
                                setLocationError("");
                              }}
                              className="rounded-2xl border border-red-200 bg-white px-5 py-4 font-semibold text-red-600 transition hover:-translate-y-0.5 hover:bg-red-50"
                            >
                              Reset
                            </button>
                          )}
                        </div>
                      </div>
                      <ClientOnly
                        fallback={
                          <div
                            style={{
                              height: "260px",
                              background: "#f0f0f0",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              borderRadius: "1rem",
                            }}
                          >
                            Loading map...
                          </div>
                        }
                      >
                        <Suspense
                          fallback={<div style={{ height: "260px" }} />}
                        >
                          <Map
                            center={[mapCenter.lat, mapCenter.lng]}
                            markerPosition={markerPosition}
                            onPick={handleMapPick}
                          />
                        </Suspense>
                      </ClientOnly>
                      {locationError && (
                        <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-600">
                          {locationError}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </form>

              {/* Toggle options & kids activities */}
              <div className="mt-5 space-y-4">
                <div className="flex flex-col gap-3 lg:flex-row [&>button]:flex-1">
                  <ToggleOption
                    active={formData.isPrivate}
                    title="Private tour"
                    text="Book this as a private vehicle-based experience."
                    price={`+ ${displayPrivateFee}`}
                    icon="P"
                    onClick={() => handleToggleOption("isPrivate")}
                  />
                  <ToggleOption
                    active={formData.isCustom}
                    title="Custom trip"
                    text="Request custom planning, route timing, or special adjustments."
                    price={`+ ${displayCustomFee}`}
                    icon="C"
                    onClick={() => handleToggleOption("isCustom")}
                  />
                </div>

                {Array.isArray(tour?.additionalPricing) &&
                  tour.additionalPricing.length > 0 && (
                    <AdditionalPricing
                      additionalPricing={tour.additionalPricing}
                      selectedExtras={formData.selectedExtras}
                      onExtrasChange={(newExtras) =>
                        setFormData((prev) => ({
                          ...prev,
                          selectedExtras: newExtras,
                        }))
                      }
                    />
                  )}

                <KidsActivities
                  childFriendly={tour?.childFriendly === true}
                  adultCount={adultCount}
                  childCount={children} // children 6-11
                  toddlerCount={toddlers}
                  selectedActivity={formData.selectedKidsActivity}
                  onActivityChange={(activityId) =>
                    setFormData((prev) => ({
                      ...prev,
                      selectedKidsActivity: activityId,
                    }))
                  }
                />
              </div>

              {/* CHECKOUT SUMMARY */}
              <div ref={checkoutRef} className="mt-6">
                <CheckoutSummary
                  tour={tour}
                  adultCount={adultCount}
                  childCount={children} // 6-11
                  toddlerCount={toddlers}
                  selectedOption={formData?.selectedOption}
                  selectedExtras={formData.selectedExtras}
                  additionalPricing={tour.additionalPricing}
                  formData={formData}
                  contactDetailsComplete={contactDetailsComplete}
                  dateDetailsComplete={dateDetailsComplete}
                  pickupDetailsComplete={pickupDetailsComplete}
                  isEmbedded={isEmbedded}
                  CheckoutCartIcon={CheckoutCartIcon}
                  checkoutRef={checkoutRef}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          ref={bottomRef}
          className={`mx-auto mt-6 rounded-2xl border border-black/5 bg-white/72 px-5 py-4 shadow-[0_8px_24px_rgba(0,0,0,0.04)] backdrop-blur-md ${
            isEmbedded ? "max-w-6xl" : "max-w-7xl"
          }`}
        >
          <div className="flex flex-col items-center justify-between gap-3 text-center md:flex-row md:text-left">
            <p className="text-sm leading-6 text-neutral-600">
              <b className="text-neutral-900">
                Secure checkout powered by Stripe.
              </b>
              <br />
              Your final amount is verified before payment.
            </p>
            <div className="flex items-center gap-2 rounded-full bg-green-200 px-4 py-2 text-sm font-semibold text-green-950">
              <img
                src="/icons/savemore.png"
                className="h-5 w-5 object-contain"
                alt=""
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
              <span>Group pricing shown before checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;
