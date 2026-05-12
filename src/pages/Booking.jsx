// The form should calculate a live price, but the final amount must be recalculated again on the server before creating the Stripe payment. 
// Do not trust only the frontend price.

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

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";

import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

const DEFAULT_CENTER = [-33.9249, 18.4241];

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
  // adrenaline
  "shark": "adrenaline/shark-cage-diving",
  "shark-cage-diving": "adrenaline/shark-cage-diving",

  "gun": "adrenaline/gun-range",
  "gunrange": "adrenaline/gun-range",
  "gun-range": "adrenaline/gun-range",

  "paragliding": "adrenaline/paragliding",
  "para-gliding": "adrenaline/paragliding",

  "snorkel": "adrenaline/snorkelling",
  "snorkelling": "adrenaline/snorkelling",
  "snorkeling": "adrenaline/snorkelling",

  // hiking
  "lions-head": "hiking/lions-head",
  "lion-s-head": "hiking/lions-head",
  "lion-head": "hiking/lions-head",

  "platteklip": "hiking/platteklip",
  "platteklip-gorge": "hiking/platteklip",

  // historical
  "langa": "historical/langa",
  "langa-township": "historical/langa",

  "robben-island": "historical/robben-island",
  "robben-island-tour": "historical/robben-island",

  // packages
  "peninsula-tour-1": "packages/peninsula-tour-1",
  "peninsula-tour-2": "packages/peninsula-tour-2",

  // wine routes
  "delaire": "wine-routes/delaire",
  "delaire-graff": "wine-routes/delaire",

  "rust-en-vrede": "wine-routes/rest-en-vrede",
  "rest-en-vrede": "wine-routes/rest-en-vrede",

  "spier": "wine-routes/spier",

  "tokara": "wine-routes/tokara",
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

  if (title.includes("langa")) return "historical/langa";
  if (title.includes("robben")) return "historical/robben-island";

  if (title.includes("delaire")) return "wine-routes/delaire";
  if (title.includes("rust") || title.includes("rest")) return "wine-routes/rest-en-vrede";
  if (title.includes("spier")) return "wine-routes/spier";
  if (title.includes("tokara")) return "wine-routes/tokara";

  if (title.includes("peninsula") && title.includes("2")) {
    return "packages/peninsula-tour-2";
  }

  if (title.includes("peninsula")) {
    return "packages/peninsula-tour-1";
  }

  if (category.includes("adrenaline") || category.includes("adventure")) {
    return `adrenaline/${slug}`;
  }

  if (category.includes("hiking")) {
    return `hiking/${slug}`;
  }

  if (category.includes("historical")) {
    return `historical/${slug}`;
  }

  if (category.includes("package")) {
    return `packages/${slug}`;
  }

  if (
    category.includes("wine") ||
    category.includes("winery") ||
    category.includes("wine-route")
  ) {
    return `wine-routes/${slug}`;
  }

  return slug;
};

const getTourGallery = (tour) => {
  if (Array.isArray(tour?.images) && tour.images.length > 0) {
    return tour.images;
  }

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

function FlyToLocation({ center, zoom = 13 }) {
  const map = useMap();

  useEffect(() => {
    if (!center) return;
    map.flyTo(center, zoom, { duration: 1.1 });
  }, [center, zoom, map]);

  return null;
}

function MapClickHandler({ onPick }) {
  useMapEvents({
    click(e) {
      onPick({
        lat: e.latlng.lat,
        lng: e.latlng.lng,
      });
    },
  });

  return null;
}

function PickupMap({ center, markerPosition, onPick }) {
  return (
    <MapContainer
      center={center}
      zoom={12}
      scrollWheelZoom={true}
      className="h-[260px] w-full overflow-hidden rounded-2xl border border-black/10"
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapClickHandler onPick={onPick} />
      <FlyToLocation center={center} />

      {markerPosition && (
        <Marker position={[markerPosition.lat, markerPosition.lng]} />
      )}
    </MapContainer>
  );
}

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
      className={`rounded-2xl border p-3 transition-all duration-300 ${
        inactive ? "border-neutral-200 bg-neutral-50/70" : "border-green-100 bg-white"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p
            className={`text-[10px] font-bold uppercase tracking-[0.16em] ${
              inactive ? "text-neutral-400" : "text-green-700"
            }`}
          >
            {label}
          </p>
          {hint && (
            <p className={`mt-1 text-xs leading-5 ${inactive ? "text-neutral-400" : "text-neutral-500"}`}>
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
            className={`flex h-10 min-w-12 items-center justify-center rounded-2xl border bg-transparent px-4 font-frank text-2xl font-bold ${
              inactive ? "border-neutral-200 text-neutral-400" : "border-green-200 text-green-950"
            }`}
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
      className={`group flex min-h-[7rem] w-full flex-col justify-between rounded-2xl border p-4 text-left transition-all duration-300 ${
        active
          ? "border-green-300 bg-green-200 text-green-950 shadow-[0_14px_34px_rgba(34,197,94,0.18)]"
          : "border-black/5 bg-white text-neutral-700 hover:-translate-y-0.5 hover:border-green-200 hover:bg-green-50"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl text-sm font-bold ${
            active ? "bg-white/70 text-green-950" : "bg-neutral-100 text-neutral-500"
          }`}
        >
          {icon}
        </span>

        <span
          className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${
            active ? "bg-white/70 text-green-950" : "bg-neutral-100 text-neutral-400"
          }`}
        >
          {active ? "Selected" : "Optional"}
        </span>
      </div>

      <div className="mt-3">
        <p className="text-sm font-bold">{title}</p>
        <p className={`mt-1 text-xs leading-5 ${active ? "text-green-950/75" : "text-neutral-500"}`}>
          {text}
        </p>
        <p className={`mt-2 text-xs font-bold ${active ? "text-green-950" : "text-green-700"}`}>
          {price}
        </p>
      </div>
    </button>
  );
}

const Booking = ({ embeddedTour }) => {
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

  const FX_RATES = {
    ZAR: 1,
    USD: 0.054,
    EUR: 0.05,
    GBP: 0.043,
  };

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

  const pricePerPerson = convertPrice(tour?.priceBase, currency);
  const displayPrice = formatMoney(pricePerPerson, currency);

  const gallery = useMemo(() => {
    return tour ? getTourGallery(tour) : [];
  }, [tour]);

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
          array.findIndex((candidate) => getTourSlug(candidate) === getTourSlug(item)) === index
      )
      .slice(0, 3);
  }, [tour]);

  const [activeImage, setActiveImage] = useState(0);

  const activeImageSrc =
    gallery[activeImage] || tour?.image || "/images/content/random/1.webp";

  const fallbackImage = tour?.image || "/images/content/random/1.webp";

  const [formData, setFormData] = useState({
    fullName: "",
    mobile: "",
    email: "",
    date: "",
    adults: "1",
    children: "0",
    participants: "1",
    pickupLocation: "",
    pickupCoords: null,
    isPrivate: false,
    isCustom: false,
    ccParticipants: false,
    participantEmails: [],
  });

  const [showChildrenSelector, setShowChildrenSelector] = useState(false);

  const adultCount = Math.max(Number(formData.adults || 0), 1);
  const childCount = Math.max(Number(formData.children || 0), 0);
  const participantCount = Math.max(adultCount + childCount, 1);
  const maxParticipantEmails = Math.max(participantCount - 1, 0);
  const maxAdults = Math.max(1, 8 - childCount);
  const maxChildren = Math.max(0, 8 - adultCount);
  const shouldShowChildrenSelector = showChildrenSelector || childCount > 0;
  const groupDiscountRules =
    tour?.groupDiscount?.enabled === false
      ? []
      : Array.isArray(tour?.groupDiscount?.rules)
        ? tour.groupDiscount.rules
        : [];

  const activeGroupDiscountRule = groupDiscountRules
    .filter((rule) => participantCount >= Number(rule.minPeople || rule.minParticipants || 0))
    .sort(
      (a, b) =>
        Number(b.discountPercent || b.discount || 0) -
        Number(a.discountPercent || a.discount || 0)
    )[0];

  const groupDiscountPercent = activeGroupDiscountRule
    ? Number(activeGroupDiscountRule.discountPercent || activeGroupDiscountRule.discount || 0)
    : 0;

  const privateFee = formData.isPrivate ? convertPrice(PRIVATE_TOUR_FEE_ZAR, currency) : 0;
  const customFee = formData.isCustom ? convertPrice(CUSTOM_TRIP_FEE_ZAR, currency) : 0;
  const baseSubtotal = pricePerPerson * participantCount;
  const groupDiscountAmount =
    groupDiscountPercent > 0 ? baseSubtotal * (groupDiscountPercent / 100) : 0;
  const discountedTourSubtotal = Math.max(baseSubtotal - groupDiscountAmount, 0);
  const estimatedTotal = discountedTourSubtotal + privateFee + customFee;
  const displayTotal = formatMoney(estimatedTotal, currency);
  const displayBaseSubtotal = formatMoney(baseSubtotal, currency);
  const displayGroupDiscountAmount = formatMoney(groupDiscountAmount, currency);
  const displayDiscountedTourSubtotal = formatMoney(discountedTourSubtotal, currency);
  const displayPrivateFee = formatMoney(convertPrice(PRIVATE_TOUR_FEE_ZAR, currency), currency);
  const displayCustomFee = formatMoney(convertPrice(CUSTOM_TRIP_FEE_ZAR, currency), currency);
  const displayActivePrivateFee = formatMoney(privateFee, currency);
  const displayActiveCustomFee = formatMoney(customFee, currency);

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

  const tourDurationLabel = formatTourMeta(tour?.duration || tour?.category || "Tour");
  const tourLocationLabel = formatTourMeta(tour?.location || "Cape Town");
  const tourStyleLabel = formatTourMeta(tour?.type || tour?.category || "Cape Town Tour");
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
    formData.fullName.trim() &&
      formData.mobile.trim() &&
      formData.email.trim()
  );
  const dateDetailsComplete = Boolean(formData.date);
  const travellerDetailsComplete = contactDetailsComplete && dateDetailsComplete;
  const pickupDetailsComplete = Boolean(formData.pickupCoords);

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

  const handleImageError = (e) => {
    if (e.currentTarget.src.includes(fallbackImage)) return;
    e.currentTarget.src = fallbackImage;
  };

  const handleBack = () => {
    if (window.lenis) {
      window.lenis.stop();
      window.lenis.scrollTo(window.scrollY, {
        immediate: true,
        force: true,
      });
    }

    requestAnimationFrame(() => {
      nav(-1);
    });
  };

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
      { opacity: 1, scale: 1, duration: 0.55, ease: "power2.out" }
    );
  }, [activeImage]);

  useEffect(() => {
    if (!formData.pickupCoords || !pickupFeedbackRef.current) return;

    gsap.fromTo(
      pickupFeedbackRef.current,
      {
        y: 10,
        scale: 0.985,
        autoAlpha: 0.82,
      },
      {
        y: 0,
        scale: 1,
        autoAlpha: 1,
        duration: 0.42,
        ease: "back.out(1.7)",
      }
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
      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
      });

      if (!isEmbedded && backRef.current) {
        tl.fromTo(
          backRef.current,
          { opacity: 0, x: -18 },
          { opacity: 1, x: 0, duration: 0.45 }
        );
      }

      if (cardRef.current) {
        tl.fromTo(
          cardRef.current,
          { opacity: 0, y: isEmbedded ? 18 : 36, scale: isEmbedded ? 1 : 0.985 },
          { opacity: 1, y: 0, scale: 1, duration: isEmbedded ? 0.45 : 0.65 },
          isEmbedded ? 0 : "-=0.15"
        );
      }

      if (!isEmbedded && leftRef.current) {
        tl.fromTo(
          leftRef.current,
          { opacity: 0, x: -34 },
          { opacity: 1, x: 0, duration: 0.55 },
          "-=0.45"
        );
      }

      if (rightRef.current) {
        tl.fromTo(
          rightRef.current,
          { opacity: 0, x: isEmbedded ? 0 : 34, y: isEmbedded ? 14 : 0 },
          { opacity: 1, x: 0, y: 0, duration: isEmbedded ? 0.42 : 0.55 },
          isEmbedded ? "-=0.2" : "-=0.5"
        );
      }

      if (checkoutRef.current) {
        tl.fromTo(
          checkoutRef.current,
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.45 },
          "-=0.15"
        );
      }

      if (bottomRef.current) {
        tl.fromTo(
          bottomRef.current,
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 0.45 },
          "-=0.12"
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
          }
        );
      }
    }, pageRef);

    return () => ctx.revert();
  }, [tour, isEmbedded]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "children") {
      const nextChildValue = Number(value || 0);
      setShowChildrenSelector(nextChildValue > 0);
    }

    setFormData((prev) => {
      const next = {
        ...prev,
        [name]: value,
      };

      if (name === "adults" || name === "children") {
        let nextAdultCount = Math.max(
          Number(name === "adults" ? value : prev.adults || 1),
          1
        );
        let nextChildCount = Math.max(
          Number(name === "children" ? value : prev.children || 0),
          0
        );

        if (nextAdultCount + nextChildCount > 8) {
          if (name === "adults") {
            nextChildCount = Math.max(0, 8 - nextAdultCount);
          } else {
            nextChildCount = Math.max(0, 8 - nextAdultCount);
          }
        }

        const nextParticipantCount = Math.max(nextAdultCount + nextChildCount, 1);
        const maxEmails = Math.max(nextParticipantCount - 1, 0);

        next.adults = String(nextAdultCount);
        next.children = String(nextChildCount);
        next.participants = String(nextParticipantCount);
        next.participantEmails = (prev.participantEmails || []).slice(0, maxEmails);
        if (maxEmails === 0) next.ccParticipants = false;
      }

      return next;
    });
  };

  const handleToggleOption = (name) => {
    setFormData((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const handleAddChildren = () => {
    setShowChildrenSelector(true);
    setShowGroupEditor(true);

    setFormData((prev) => {
      const currentAdults = Math.max(Number(prev.adults || 1), 1);
      const nextChildren = Math.min(Math.max(Number(prev.children || 0), 1), Math.max(0, 8 - currentAdults));
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
    setShowGroupEditor(true);

    setFormData((prev) => {
      let nextAdults = Math.max(Number(prev.adults || 1), 1);
      let nextChildren = Math.max(Number(prev.children || 0), 0);

      if (type === "adults") {
        nextAdults = Math.min(Math.max(nextAdults + delta, 1), Math.max(1, 8 - nextChildren));
      }

      if (type === "children") {
        nextChildren = Math.min(Math.max(nextChildren + delta, 0), Math.max(0, 8 - nextAdults));
        setShowChildrenSelector(nextChildren > 0);
      }

      const nextParticipantCount = Math.max(nextAdults + nextChildren, 1);
      const maxEmails = Math.max(nextParticipantCount - 1, 0);

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
      if (existing.length >= maxParticipantEmails) return prev;

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
      participantEmails: (prev.participantEmails || []).map((email, emailIndex) =>
        emailIndex === index ? value : email
      ),
    }));
  };

  const removeParticipantEmail = (index) => {
    setFormData((prev) => {
      const nextEmails = (prev.participantEmails || []).filter(
        (_, emailIndex) => emailIndex !== index
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
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coords.lat}&lon=${coords.lng}`
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
        `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(
          query
        )}`
      );

      if (!res.ok) throw new Error("Search failed");

      const data = await res.json();

      if (!data.length) {
        setLocationError("No matching location found.");
        return;
      }

      const result = data[0];

      const coords = {
        lat: Number(result.lat),
        lng: Number(result.lon),
      };

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
      (email) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    );

    if (invalidParticipantEmail) {
      alert(`Please check this participant email: ${invalidParticipantEmail}`);
      return;
    }

    nav("/checkout", {
      state: {
        tour,
        bookingDetails: {
          ...formData,
          adults: adultCount,
          children: childCount,
          participants: String(participantCount),
          participantEmails: normalizedParticipantEmails,
          ccParticipantEmails: formData.ccParticipants ? normalizedParticipantEmails : [],
          pricingOptions: {
            isPrivate: formData.isPrivate,
            isCustom: formData.isCustom,
            privateFee,
            customFee,
            groupDiscountPercent,
            groupDiscountAmount,
            subtotalBeforeGroupDiscount: baseSubtotal,
            discountedTourSubtotal,
            estimatedTotal,
            currency,
          },
        },
        selectedCurrency: currency,
      },
    });
  };

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
          isEmbedded ? "px-4 py-0 sm:px-5" : "px-6 py-10 md:px-12 xl:px-20"
        }`}
      >
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

        <div
          ref={cardRef}
          className={`mx-auto overflow-hidden border border-black/5 bg-white/92 backdrop-blur-md ${
            isEmbedded
              ? "max-w-6xl rounded-[1.5rem] shadow-[0_16px_48px_rgba(37,99,235,0.08)]"
              : "max-w-7xl rounded-[2rem] shadow-[0_24px_70px_rgba(0,0,0,0.10)]"
          }`}
        >
          <div className={isEmbedded ? "grid" : "grid lg:grid-cols-[0.95fr_1.05fr]"}>
            <div ref={leftRef} className={isEmbedded ? "hidden" : "relative bg-neutral-100"}>
              <div className="relative h-[380px] overflow-hidden md:h-[460px] lg:h-[680px]">
                <img
                  ref={activeImageRef}
                  src={activeImageSrc}
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
                        src={img}
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
                          related.image || getTourGallery(related)?.[0] || "/images/content/random/1.webp";
                        const relatedPrice = formatMoney(
                          convertPrice(related.priceBase, currency),
                          currency
                        );

                        return (
                          <button
                            key={related.slug || related.id}
                            type="button"
                            onClick={() => nav(`/tours/${related.slug}`)}
                            className="group flex items-center gap-3 rounded-2xl border border-black/5 bg-neutral-50 p-2 text-left transition hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_12px_28px_rgba(0,0,0,0.07)]"
                          >
                            <img
                              src={relatedImage}
                              alt={related.title}
                              className="h-16 w-20 shrink-0 rounded-xl object-cover"
                              loading="lazy"
                              onError={(e) => {
                                e.currentTarget.src = "/images/content/random/1.webp";
                              }}
                            />

                            <div className="min-w-0 flex-1">
                              <p className="truncate font-bitter text-sm font-bold text-neutral-950">
                                {related.title}
                              </p>

                              <p className="mt-1 line-clamp-1 text-xs text-neutral-500">
                                {related.duration || related.location || "Cape Town experience"}
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

            <div className="max-w-5xl mx-auto flex flex-col items-center mt-4">
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-green-500">
                    {isEmbedded ? "Tour request" : "Booking details"}
                  </p>

                  <h2 className="mt-2 font-frank text-3xl leading-none text-black md:text-4xl">
                    {isEmbedded ? "Complete your details" : "Secure your slot"}
                  </h2>
            </div>

            <div
              ref={rightRef}
              className={`group/right transition-colors duration-500 ${
                isEmbedded
                  ? "p-4 sm:p-5 md:p-6 lg:p-7"
                  : "p-5 hover:from-white hover:via-green-49/70 hover:to-blue-50/60 md:p-7 lg:p-8"
              }`}
            >
              <div className="relative mb-6 overflow-hidden rounded-t-4xl border border-black/5 p-4 transition-all duration-500 group-hover/right:border-blue-200 sm:p-5">
                <img
                  src={tour.image || fallbackImage}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="pointer-events-none absolute inset-0 h-full w-full object-fit opacity-10  blur-[0px]"
                  onError={(e) => {
                    e.currentTarget.src = fallbackImage;
                  }}
                />


                <div className="relative z-10">
                <div className="flex flex-col items-center text-center">
                  <div
                    ref={priceRef}
                    className="mt-5 flex w-full shrink-0 flex-col items-center justify-center gap-3 rounded-2xl border border-black/5 bg-white/80 px-5 py-5 text-center shadow-[0_10px_26px_rgba(0,0,0,0.035)] sm:w-fit sm:flex-row sm:items-center sm:gap-4 sm:px-6 sm:py-4"
                  >
                    <div className="px-2 py-1.5 sm:min-w-[9.5rem] sm:px-3 sm:py-2">
                      <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
                        From
                      </div>

                      <div className="font-frank text-3xl font-bold leading-none text-neutral-950 md:text-4xl">
                        {displayPrice}
                      </div>

                      <div className="mt-1 text-xs text-neutral-500">per person</div>
                    </div>

                    <div className="relative py-1.5 sm:py-2">
                      <select
                        aria-label="Select currency"
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="h-14 w-24 appearance-none rounded-2xl border border-black/10 bg-white px-4 pr-8 text-center text-lg font-bold text-neutral-900 outline-none transition hover:border-green-300 hover:bg-green-200 focus:border-green-400 focus:bg-green-200"
                      >
                        {supportedCurrencies.map((code) => (
                          <option key={code} value={code}>
                            {code}
                          </option>
                        ))}
                      </select>

                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
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

                <div className="mt-7 px-2 text-center">
                  <p className="text-[10px] font-black uppercase tracking-[0.26em] text-neutral-400">
                    Selected tour
                  </p>

                  <h3 className="mx-auto mt-2 max-w-5xl font-frank text-[2.85rem] font-black leading-[0.9] tracking-[-0.055em] text-neutral-950 sm:text-[3.9rem] md:text-[4.75rem] lg:text-[5.6rem]">
                    {tour.title || tour.info}
                  </h3>
                </div>

                <div className="mt-5 flex flex-wrap justify-center gap-2.5 sm:gap-3">
                  {tourInfoPills.map((pill) => (
                    <span
                      key={`${pill.label}-${pill.value}`}
                      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold shadow-[0_8px_20px_rgba(0,0,0,0.035)] backdrop-blur-sm ${pill.className}`}
                    >
                      <span className="text-[9px] uppercase tracking-[0.18em] opacity-65">
                        {pill.label}
                      </span>
                      <span>{pill.value}</span>
                    </span>
                  ))}
                </div>
                </div>
              </div>

              <form id="booking-form" onSubmit={handleSubmit} className="grid gap-5">
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

                  {travellerDetailsComplete && (
                    <div className="mb-4 rounded-2xl border border-green-200 bg-green-50 p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm font-bold text-green-950">
                            Traveller details saved
                          </p>
                          <p className="mt-1 text-xs leading-5 text-neutral-600">
                            {formData.fullName} · {formData.mobile} · {formData.email} · {formData.date}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => setShowTravellerEditor(true)}
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

                    {travellerDetailsComplete && (
                      <div className="mt-4 flex justify-center">
                        <button
                          type="button"
                          onClick={() => setShowTravellerEditor(false)}
                          className="rounded-2xl bg-green-200 px-5 py-3 text-sm font-bold text-green-950 transition hover:-translate-y-0.5 hover:bg-green-300"
                        >
                          Save traveller details
                        </button>
                      </div>
                    )}
                  </div>

                </div>

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
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-green-700">
                          Selected guests
                        </p>
                        <p className="mt-1 font-frank text-3xl font-bold leading-none text-neutral-950">
                          {participantCount} total
                        </p>
                        <p className="mt-1 text-xs leading-5 text-neutral-500">
                          {adultCount} adult{adultCount === 1 ? "" : "s"}
                          {childCount > 0
                            ? ` · ${childCount} child${childCount === 1 ? "" : "ren"}`
                            : ""}
                          {normalizedParticipantEmails.length > 0
                            ? ` · ${normalizedParticipantEmails.length} email${normalizedParticipantEmails.length === 1 ? "" : "s"} added`
                            : ""}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowGroupEditor(true)}
                        className="w-fit rounded-full border border-green-200 bg-white px-4 py-2 text-xs font-bold text-green-800 transition hover:-translate-y-0.5 hover:bg-green-100"
                      >
                        Change
                      </button>
                    </div>

                    <div
                      className={`transition-all duration-500 ease-out ${
                        !showGroupEditor
                          ? "max-h-0 overflow-hidden opacity-0 pointer-events-none"
                          : "mt-4 max-h-[980px] opacity-100"
                      }`}
                    >
                      <div className="grid gap-3 sm:grid-cols-2">
                        <GuestStepper
                          label="Adults"
                          value={adultCount}
                          hint="Adults in your own booking group."
                          onDecrease={() => adjustGuestCount("adults", -1)}
                          onIncrease={() => adjustGuestCount("adults", 1)}
                          decreaseDisabled={adultCount <= 1}
                          increaseDisabled={adultCount + childCount >= 8}
                        />

                        <GuestStepper
                          label="Children"
                          value={childCount}
                          hint="Optional. Leave at 0 when there are no children."
                          onDecrease={() => adjustGuestCount("children", -1)}
                          onIncrease={() => adjustGuestCount("children", 1)}
                          decreaseDisabled={childCount <= 0}
                          increaseDisabled={adultCount + childCount >= 8}
                          inactive={childCount === 0}
                        />
                      </div>

                      <div className="mt-4 rounded-2xl border border-black/5 bg-white p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm font-bold text-neutral-950">
                              Participant email CCs
                            </p>
                            <p className="mt-1 text-xs leading-5 text-neutral-500">
                              Optional. Add guest emails under the selected number of guests.
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={addParticipantEmail}
                            disabled={!maxParticipantEmails || formData.participantEmails.length >= maxParticipantEmails}
                            className="rounded-2xl border border-black/10 bg-neutral-950 px-4 py-2.5 text-xs font-bold text-white transition hover:-translate-y-0.5 hover:bg-black disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            Add member email
                          </button>
                        </div>

                        {maxParticipantEmails === 0 && (
                          <p className="mt-3 rounded-xl bg-neutral-50 p-3 text-xs leading-5 text-neutral-500">
                            Select at least 2 total guests to add extra guest emails.
                          </p>
                        )}

                        {formData.participantEmails.length > 0 && (
                          <div className="mt-4 grid gap-3">
                            <label className="flex items-center gap-3 rounded-2xl bg-neutral-50 p-3 text-sm text-neutral-700">
                              <input
                                type="checkbox"
                                checked={formData.ccParticipants}
                                onChange={() => handleToggleOption("ccParticipants")}
                                className="h-4 w-4 accent-green-500"
                              />
                              CC these participants after confirmed purchase
                            </label>

                            {formData.participantEmails.map((email, index) => (
                              <div key={index} className="flex gap-2">
                                <input
                                  type="email"
                                  value={email}
                                  onChange={(e) => updateParticipantEmail(index, e.target.value)}
                                  placeholder={`Participant ${index + 2} email`}
                                  className="min-w-0 flex-1 rounded-2xl border border-neutral-200 bg-white p-3 text-sm outline-none transition focus:border-green-400 focus:ring-4 focus:ring-green-100"
                                />

                                <button
                                  type="button"
                                  onClick={() => removeParticipantEmail(index)}
                                  className="rounded-2xl border border-black/10 bg-white px-3 text-sm font-bold text-neutral-500 transition hover:bg-red-50 hover:text-red-500"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="mt-4 flex justify-center">
                        <button
                          type="button"
                          onClick={() => setShowGroupEditor(false)}
                          className="inline-flex items-center gap-2 rounded-2xl border border-green-200 bg-white px-5 py-3 text-sm font-bold text-green-950 shadow-sm transition hover:-translate-y-0.5 hover:bg-green-50"
                        >
                          <SaveIcon />
                          Confirm group details
                        </button>
                      </div>
                    </div>
                  </div>

                  <div
                    ref={groupSaveRef}
                    className="mt-4 rounded-2xl border border-green-200 bg-green-50 p-4 transition-all duration-300"
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src="/icons/savemore.png"
                        className="mt-0.5 h-8 w-8 shrink-0 object-contain opacity-80"
                        alt=""
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-green-950">
                          Save more when you book as a group
                        </p>

                        <p className="mt-1 text-xs leading-5 text-green-900/75">
                          Bigger groups can unlock a lower per-person estimate. Group rates only apply to the full selected group size booked and paid for.
                        </p>

                        <button
                          type="button"
                          onClick={() => nav("/policies")}
                          className="mt-3 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold text-green-800 shadow-sm transition hover:-translate-y-0.5 hover:bg-green-100"
                        >
                          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-green-200 text-[10px] text-green-950">
                            i
                          </span>
                          Learn more about group policy
                        </button>
                      </div>
                    </div>
                  </div>

                </div>

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
                        Enter an address and search, or click directly on the map.
                      </p>
                    </div>
                  </div>

                  <div
                    className={`transition-all duration-500 ease-out ${
                      formData.pickupCoords && !showPickupPicker
                        ? "max-h-0 overflow-hidden opacity-0 pointer-events-none -mt-2"
                        : "max-h-[560px] opacity-100"
                    }`}
                  >
                    <div className="mb-4 flex flex-col gap-3 md:flex-row">
                      <input
                        name="pickupLocation"
                        placeholder="Hotel, guesthouse, Airbnb, or pickup point"
                        value={formData.pickupLocation}
                        onChange={handlePickupInputChange}
                        className="flex-1 rounded-2xl border border-neutral-200 bg-white p-4 text-base outline-none transition focus:border-green-400 focus:ring-4 focus:ring-green-100"
                      />

                      <button
                        type="button"
                        onClick={handleFindAddress}
                        disabled={locationLoading}
                        className="rounded-2xl bg-blue-600 px-5 py-4 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {locationLoading ? "Searching..." : "Find on map"}
                      </button>
                    </div>

                    <PickupMap
                      center={[mapCenter.lat, mapCenter.lng]}
                      markerPosition={markerPosition}
                      onPick={handleMapPick}
                    />

                    {pendingPickup && (
                      <div className="mt-3 rounded-2xl border border-blue-200 bg-white p-4 text-sm text-neutral-600 shadow-[0_14px_34px_rgba(59,130,246,0.10)]">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <div className="font-bold text-blue-950">
                              Confirm found pickup location
                            </div>

                            <div className="mt-1 leading-6 text-neutral-700">
                              {pendingPickup.location}
                            </div>

                            <div className="mt-1 text-xs text-neutral-500">
                              {pendingPickup.coords.lat.toFixed(6)},{" "}
                              {pendingPickup.coords.lng.toFixed(6)}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={handleConfirmPickupLocation}
                            className="shrink-0 rounded-full bg-blue-600 px-4 py-2 text-xs font-bold text-white transition hover:-translate-y-0.5 hover:bg-blue-700"
                          >
                            Confirm location
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {locationError && (
                    <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-600">
                      {locationError}
                    </p>
                  )}

                  {formData.pickupCoords && (
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
                            setShowPickupPicker(true);
                          }}
                          className="shrink-0 rounded-full border border-green-200 bg-white px-3 py-1.5 text-xs font-bold text-green-800 transition hover:bg-green-100"
                        >
                          Change
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </form>
            </div>
          </div>

          <div
            ref={checkoutRef}
            className="border-t border-black/5 bg-white/92 px-4 py-4 md:px-8 md:py-5"
          >
            <div className="grid items-stretch gap-3 lg:grid-cols-[1fr_auto]">
              <div className="rounded-2xl border border-black/10 bg-white p-4 text-neutral-950 shadow-[0_12px_30px_rgba(0,0,0,0.05)]">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-500">
                      Checkout summary
                    </p>

                    <div className="mt-1 font-frank text-3xl font-bold leading-none text-neutral-950">
                      {displayTotal}
                    </div>

                    <p className="mt-2 text-xs leading-5 text-neutral-500">
                      {currency} estimate · final amount is recalculated securely at checkout.
                    </p>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2 xl:min-w-[31rem]">
                    <div className="rounded-2xl bg-neutral-50 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-neutral-400">
                        Tour
                      </p>
                      <p className="mt-1 line-clamp-1 text-sm font-bold text-neutral-900">
                        {tour.title || tour.info}
                      </p>
                    </div>

                    <div className={`rounded-2xl p-3 transition ${contactDetailsComplete ? "bg-neutral-50" : "bg-neutral-100 opacity-55"}`}>
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-neutral-400">
                        Traveller
                      </p>
                      <p className={`mt-1 line-clamp-1 text-sm font-bold ${contactDetailsComplete ? "text-neutral-900" : "text-neutral-400"}`}>
                        {contactDetailsComplete ? formData.fullName : "Details not completed"}
                      </p>
                    </div>

                    <div className={`rounded-2xl p-3 transition ${dateDetailsComplete ? "bg-neutral-50" : "bg-neutral-100 opacity-55"}`}>
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-neutral-400">
                        Date
                      </p>
                      <p className={`mt-1 text-sm font-bold ${dateDetailsComplete ? "text-neutral-900" : "text-neutral-400"}`}>
                        {formData.date || "Select date"}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-neutral-50 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-neutral-400">
                        Guests
                      </p>
                      <p className="mt-1 text-sm font-bold text-neutral-900">
                        {adultCount} adult{adultCount === 1 ? "" : "s"}
                        {childCount > 0 ? ` · ${childCount} child${childCount === 1 ? "" : "ren"}` : ""}
                      </p>
                    </div>

                    <div className={`rounded-2xl p-3 transition sm:col-span-2 ${pickupDetailsComplete ? "bg-neutral-50" : "bg-neutral-100 opacity-55"}`}>
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-neutral-400">
                        Pickup
                      </p>
                      <p className={`mt-1 line-clamp-1 text-sm font-bold ${pickupDetailsComplete ? "text-neutral-900" : "text-neutral-400"}`}>
                        {formData.pickupLocation || "Choose pickup location"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-black/5 bg-stone-50 p-3">
                  <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-5">
                    <div className="rounded-xl bg-white p-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-400">
                        Tour subtotal
                      </p>
                      <p className="mt-1 text-sm font-bold text-neutral-900">
                        {displayPrice} × {participantCount} = {displayBaseSubtotal}
                      </p>
                    </div>

                    <div className={`rounded-xl bg-white p-3 transition ${groupDiscountPercent > 0 ? "" : "opacity-55"}`}>
                      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-400">
                        Group discount
                      </p>
                      <p className={`mt-1 text-sm font-bold ${groupDiscountPercent > 0 ? "text-green-700" : "text-neutral-400"}`}>
                        {groupDiscountPercent > 0
                          ? `-${displayGroupDiscountAmount} · ${groupDiscountPercent}% off`
                          : `No discount for ${participantCount} guest${participantCount === 1 ? "" : "s"}`}
                      </p>
                    </div>

                    <div className="rounded-xl bg-white p-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-400">
                        Tour total
                      </p>
                      <p className="mt-1 text-sm font-bold text-neutral-900">
                        {displayDiscountedTourSubtotal}
                      </p>
                    </div>

                    <div className={`rounded-xl bg-white p-3 transition ${formData.isPrivate ? "" : "opacity-55"}`}>
                      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-400">
                        Private tour fee
                      </p>
                      <p className={`mt-1 text-sm font-bold ${formData.isPrivate ? "text-green-700" : "text-neutral-400"}`}>
                        {formData.isPrivate ? displayActivePrivateFee : "Not added"}
                      </p>
                    </div>

                    <div className={`rounded-xl bg-white p-3 transition ${formData.isCustom ? "" : "opacity-55"}`}>
                      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-400">
                        Custom trip fee
                      </p>
                      <p className={`mt-1 text-sm font-bold ${formData.isCustom ? "text-blue-700" : "text-neutral-400"}`}>
                        {formData.isCustom ? displayActiveCustomFee : "Not added"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-col gap-2 rounded-xl bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-bold text-neutral-900">
                        Secure checkout is next.
                      </p>
                      <p className="mt-1 text-xs leading-5 text-neutral-500">
                        Payment opens after this form. Pickup and vehicle details are manually confirmed after payment.
                      </p>
                    </div>

                    <div className="hidden flex-wrap gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-500 sm:flex">
                      <span className="rounded-full bg-neutral-50 px-3 py-1">Terms</span>
                      <span className="rounded-full bg-neutral-50 px-3 py-1">Privacy</span>
                      <span className="rounded-full bg-green-200 px-3 py-1 text-green-950">
                        Powered by Stripe
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                form="booking-form"
                className={`hero-gradient flex w-full items-center justify-center gap-3 rounded-2xl px-8 py-4 text-base font-bold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl lg:flex-col lg:gap-2 ${
                  isEmbedded ? "min-h-[4.6rem] lg:min-h-[8.75rem] lg:w-[15rem]" : "min-h-[5.5rem] lg:min-h-[9rem] lg:w-[15rem]"
                }`}
              >
                <CheckoutCartIcon className="h-7 w-7 lg:h-10 lg:w-10" />
                <span>Continue to checkout</span>
              </button>
            </div>
          </div>
        </div>

        <div
          ref={bottomRef}
          className={`mx-auto mt-6 rounded-2xl border border-black/5 bg-white/72 px-5 py-4 shadow-[0_8px_24px_rgba(0,0,0,0.04)] backdrop-blur-md ${
            isEmbedded ? "max-w-6xl" : "max-w-7xl"
          }`}
        >
          <div className="flex flex-col items-center justify-between gap-3 text-center md:flex-row md:text-left">
            <p className="text-sm leading-6 text-neutral-600">
              <b className="text-neutral-900">Secure checkout powered by Stripe.</b>
              <br />
              Your final amount is verified before payment.
            </p>

            <div className="flex items-center gap-2 rounded-full bg-green-200 px-4 py-2 text-sm font-semibold text-green-950">
              <img
                src="/icons/savemore.png"
                className="h-5 w-5 object-contain"
                alt=""
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
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