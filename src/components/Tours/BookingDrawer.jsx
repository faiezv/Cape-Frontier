import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import CheckoutSummary from "../Booking/CheckoutSummary";
import TourOptions from "../TourDetails/TourOptions.jsx";
import KidsActivities from "../TourDetails/KidsActivities.jsx";
import { KIDS_ACTIVITIES } from "../../data/kidsActivities.js";
import { resolveImage } from "../../utils/ImageLoader";
import { useCurrency } from "../../utils/currency";
import CurrencySelector from "./CurrencySelector";
import {
  computePricing,
  convertPrice,
  formatMoney,
} from "../../utils/pricingEngine.js";

// Same building blocks + seat logic as the full Booking page
import {
  BAND_AGE,
  MAX_GUESTS,
} from "../Booking/BookingConstants.js";
import {
  TravellerDetailsSection,
  GroupSizeSection,
  PickupLocationSection,
} from "../Booking/BookingSections.jsx";

const DEFAULT_CENTER = { lat: -33.9249, lng: 18.4241 };
const BAR_HEIGHT = 56; // px, must match the sticky bar's h-14

export const CONTACT_EMAIL = "admin@cape-frontier.co.za";
export const CONTACT_NUMBER = "(+27)72 264 7284";
export const CONTACT_TEL = "+27722647284";

// ─── Reading the selected currency from the shared currency context ──────────
// useCurrency() can name the selected code differently depending on how the
// provider was written, so check the usual names, then fall back to the first
// 3-letter code found on the context.
const CODE_RE = /^[A-Z]{3}$/;
const toCode = (v) => {
  if (!v) return null;
  if (typeof v === "string") {
    const u = v.trim().toUpperCase();
    return CODE_RE.test(u) ? u : null;
  }
  if (typeof v === "object") return toCode(v.code ?? v.currency ?? v.id ?? v.value);
  return null;
};
const getContextCurrency = (ctx) => {
  if (!ctx) return "ZAR";
  for (const k of [
    "currency",
    "code",
    "currencyCode",
    "selected",
    "selectedCurrency",
    "current",
    "active",
  ]) {
    const c = toCode(ctx[k]);
    if (c) return c;
  }
  for (const v of Object.values(ctx)) {
    if (typeof v === "string") {
      const c = toCode(v);
      if (c) return c;
    }
  }
  return "ZAR";
};

// ─── Booking / checkout helpers ──────────────────────────────────────────────

export const getTourSlug = (tour) =>
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
  return firstTimed?.time
    ? formatDisplayTime(firstTimed.time)
    : "To be confirmed";
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

// ─── Seat helpers (same logic as Booking.jsx) ────────────────────────────────

const deriveSeatState = (assignments) => {
  const bandCounts = { adult: 0, teen: 0, child: 0, toddler: 0 };
  const childAgesArr = [];
  let participantCount = 0;
  for (const band of assignments || []) {
    if (!band) continue;
    bandCounts[band] = (bandCounts[band] || 0) + 1;
    participantCount++;
    const age = BAND_AGE[band];
    if (age !== undefined) childAgesArr.push(age);
  }
  return {
    bandCounts,
    adults: Math.max(bandCounts.adult, 1),
    childAges: childAgesArr,
    children: bandCounts.child,
    teens: bandCounts.teen,
    toddlers: bandCounts.toddler,
    participantCount,
  };
};

const syncSeatDerived = (prev, assignments) => {
  const d = deriveSeatState(assignments);
  const maxEmails = Math.max(d.participantCount - 1, 0);
  return {
    ...prev,
    seatAssignments: assignments,
    adults: String(d.adults),
    children: String(d.children),
    childAges: d.childAges,
    participants: String(d.participantCount),
    participantEmails: (prev.participantEmails || []).slice(0, maxEmails),
    ccParticipants: maxEmails === 0 ? false : prev.ccParticipants,
  };
};

const startingSeats = (minPeople) => {
  const start = Math.max(1, Math.min(minPeople, MAX_GUESTS));
  const assignments = Array(MAX_GUESTS).fill(null);
  for (let i = 0; i < start; i++) assignments[i] = "adult";
  return assignments;
};

// ─── Small UI piece (private / custom toggles) ───────────────────────────────

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

// ─── Booking drawer: everything up to Paystack on one screen ────────────────

export default function BookingDrawer({ tour, onClose }) {
  const minPeople = tour?.minPeople ?? 1;
  const childFriendly = tour?.childFriendly !== false;
  const supportedCurrencies =
    tour.supportedCurrencies?.length > 0
      ? tour.supportedCurrencies
      : ["ZAR", "USD", "EUR", "GBP"];

  // Currency comes from the same selector as the Tours page (shared context).
  // If the tour doesn't support the chosen currency, price in ZAR instead.
  const currencyCtx = useCurrency();
  const chosenCurrency = getContextCurrency(currencyCtx);
  const currency = supportedCurrencies.includes(chosenCurrency)
    ? chosenCurrency
    : "ZAR";
  const [formData, setFormData] = useState(() =>
    syncSeatDerived(
      {
        fullName: "",
        mobile: "",
        email: "",
        date: "",
        selectedExtras: {},
        seatAssignments: Array(MAX_GUESTS).fill(null),
        adults: "1",
        children: "0",
        childAges: [],
        participants: "0",
        pickupLocation: "",
        pickupCoords: null,
        isPrivate: false,
        isCustom: false,
        ccParticipants: false,
        participantEmails: [],
        selectedKidsActivity: null,
        selectedOption: null,
        notes: "",
      },
      startingSeats(minPeople),
    ),
  );
  const patch = (p) => setFormData((prev) => ({ ...prev, ...p }));

  const [activeBrush, setActiveBrush] = useState("adult");

  // Section editors (same behaviour as the Booking page)
  const [travellerSnapshot, setTravellerSnapshot] = useState(null);
  const [groupSnapshot, setGroupSnapshot] = useState(null);
  const [showTravellerEditor, setShowTravellerEditor] = useState(true);
  const [showGroupEditor, setShowGroupEditor] = useState(true);

  // Pickup / map
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [markerPosition, setMarkerPosition] = useState(null);
  const [pendingPickup, setPendingPickup] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [showPickupPicker, setShowPickupPicker] = useState(true);
  const pickupFeedbackRef = useRef(null);

  // Price verification + payment
  const [verifyStatus, setVerifyStatus] = useState("idle"); // idle | pending | verified | failed
  const [verifyError, setVerifyError] = useState("");
  const [verifiedToken, setVerifiedToken] = useState(null);
  const [verifyRetry, setVerifyRetry] = useState(0);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState("");
  const [fadeOut, setFadeOut] = useState(false);

  const scrollRef = useRef(null);
  const heroRef = useRef(null);

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

  // Scroll-linked header: the hero (image + title) lives inside the scroll
  // area so it scrolls away natively, and a compact sticky bar takes over.
  // --p (0 → 1) is written straight to the DOM in a rAF, and only drives
  // opacity / transform, so nothing re-renders or re-lays-out while scrolling.
  useEffect(() => {
    const el = scrollRef.current;
    const hero = heroRef.current;
    if (!el || !hero) return undefined;

    let range = 1;
    let raf = 0;

    function update() {
      raf = 0;
      const p = Math.min(Math.max(el.scrollTop / range, 0), 1);
      el.style.setProperty("--p", p.toFixed(4));
    }
    function measure() {
      range = Math.max(hero.offsetHeight - BAR_HEIGHT, 1);
      update();
    }
    function onScroll() {
      if (!raf) raf = requestAnimationFrame(update);
    }

    measure();
    el.addEventListener("scroll", onScroll, { passive: true });
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    ro?.observe(hero);
    return () => {
      el.removeEventListener("scroll", onScroll);
      ro?.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // ── Derived seat state ────────────────────────────────────────────
  const seatDerived = useMemo(
    () => deriveSeatState(formData.seatAssignments),
    [formData.seatAssignments],
  );
  const adultCount = seatDerived.adults;
  const childAges = seatDerived.childAges;
  const bandCounts = seatDerived.bandCounts;
  const participantCount = seatDerived.participantCount;
  const toddlers = seatDerived.toddlers;
  const children = seatDerived.children;
  const teens = seatDerived.teens;

  // ── Seat handlers ─────────────────────────────────────────────────
  const handleSeatTap = (seatIndex) => {
    if (seatIndex < 0 || seatIndex >= MAX_GUESTS) return;

    const assignments =
      formData.seatAssignments || Array(MAX_GUESTS).fill(null);
    const current = assignments[seatIndex];

    if (current) {
      if (participantCount - 1 < Math.max(minPeople, 1)) return;
      if (current === "adult") {
        const adultSeats = assignments.filter((a) => a === "adult").length;
        if (adultSeats <= 1) return;
      }
      setFormData((prev) => {
        const p = prev.seatAssignments || Array(MAX_GUESTS).fill(null);
        const next = [...p];
        next[seatIndex] = null;
        return syncSeatDerived(prev, next);
      });
      return;
    }

    const band =
      activeBrush === "adult" || (activeBrush && childFriendly)
        ? activeBrush
        : "adult";

    setFormData((prev) => {
      const p = prev.seatAssignments || Array(MAX_GUESTS).fill(null);
      const next = [...p];
      next[seatIndex] = band;
      return syncSeatDerived(prev, next);
    });
  };

  const handleBrushToggle = (bandKey) => {
    if (bandKey !== "adult" && !childFriendly) return;
    setActiveBrush((prev) => (prev === bandKey ? null : bandKey));
  };

  const handleResetSeats = () => {
    setFormData((prev) => syncSeatDerived(prev, startingSeats(minPeople)));
    setActiveBrush("adult");
  };

  useEffect(() => {
    if (!childFriendly && activeBrush && activeBrush !== "adult") {
      setActiveBrush("adult");
    }
  }, [childFriendly, activeBrush]);

  const openGroupEditor = () => {
    setGroupSnapshot({
      seatAssignments: [...(formData.seatAssignments || [])],
      adults: formData.adults,
      children: formData.children,
      childAges: [...(formData.childAges || [])],
      participants: formData.participants,
      participantEmails: [...(formData.participantEmails || [])],
      ccParticipants: formData.ccParticipants,
    });
    setShowGroupEditor(true);
  };

  const cancelGroupEdit = () => {
    if (groupSnapshot) setFormData((prev) => ({ ...prev, ...groupSnapshot }));
    setGroupSnapshot(null);
    setShowGroupEditor(false);
  };

  const confirmGroup = () => {
    setGroupSnapshot(null);
    setShowGroupEditor(false);
  };

  // ── Traveller handlers ────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTravellerEdit = () => {
    setTravellerSnapshot({
      fullName: formData.fullName,
      mobile: formData.mobile,
      email: formData.email,
      date: formData.date,
    });
    setShowTravellerEditor(true);
  };

  const handleTravellerSave = () => {
    setTravellerSnapshot(null);
    setShowTravellerEditor(false);
  };

  const handleTravellerCancel = () => {
    if (travellerSnapshot) {
      setFormData((prev) => ({ ...prev, ...travellerSnapshot }));
    }
    setTravellerSnapshot(null);
    setShowTravellerEditor(false);
  };

  const handleResetTraveller = () => {
    setFormData((prev) => ({
      ...prev,
      fullName: "",
      mobile: "",
      email: "",
      date: "",
    }));
  };

  // ── Completion flags ──────────────────────────────────────────────
  const contactDetailsComplete = Boolean(
    formData.fullName.trim() && formData.mobile.trim() && formData.email.trim(),
  );
  const dateDetailsComplete = Boolean(formData.date);
  const travellerDetailsComplete =
    contactDetailsComplete && dateDetailsComplete;
  const pickupDetailsComplete = Boolean(formData.pickupCoords);
  const optionsOk =
    !(Array.isArray(tour.options) && tour.options.length > 0) ||
    Boolean(formData.selectedOption);

  // ── Pricing (single source of truth: pricingEngine) ───────────────
  const pricing = useMemo(
    () =>
      computePricing({
        tour,
        childAges,
        adultCount,
        currency,
        selectedOption: formData.selectedOption,
        selectedExtras: formData.selectedExtras || {},
        formData,
        kidsActivities: KIDS_ACTIVITIES,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      tour,
      JSON.stringify(childAges),
      adultCount,
      currency,
      formData.selectedOption,
      JSON.stringify(formData.selectedExtras),
      formData.isPrivate,
      formData.isCustom,
      formData.selectedKidsActivity,
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
      contactDetailsComplete &&
      dateDetailsComplete &&
      pickupDetailsComplete &&
      (!pricing.hasOptions || formData.selectedOption);

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
            selectedOption: formData.selectedOption,
            selectedExtras: formData.selectedExtras || {},
            isPrivate: formData.isPrivate,
            isCustom: formData.isCustom,
            selectedKidsActivity: formData.selectedKidsActivity,
          }),
        });
        if (cancelled) return;

        const contentType = res.headers.get("content-type") || "";
        if (
          res.status === 404 ||
          res.status === 405 ||
          contentType.includes("text/html")
        ) {
          console.warn(
            "[Tours] /api/verify-price unavailable; using client-side price.",
          );
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
    formData.selectedOption,
    JSON.stringify(formData.selectedExtras),
    formData.isPrivate,
    formData.isCustom,
    formData.selectedKidsActivity,
    contactDetailsComplete,
    dateDetailsComplete,
    pickupDetailsComplete,
    pricing.isCustomQuote,
    pricing.hasOptions,
    verifyRetry,
  ]);

  // ── Pickup handlers (same as Booking.jsx) ─────────────────────────
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

  const handlePickupReset = () => {
    setPendingPickup(null);
    setMarkerPosition(null);
    setFormData((prev) => ({
      ...prev,
      pickupLocation: "",
      pickupCoords: null,
    }));
    setLocationError("");
  };

  const handlePickupChange = () => {
    setPendingPickup(null);
    setMarkerPosition(null);
    setShowPickupPicker(true);
    setFormData((prev) => ({
      ...prev,
      pickupLocation: "",
      pickupCoords: null,
    }));
  };

  // ── Pay: straight to Paystack, no /checkout page ──────────────────
  const handlePay = async (e) => {
    e?.preventDefault();
    if (paying) return;
    setPayError("");

    if (!contactDetailsComplete || !dateDetailsComplete) {
      setPayError("Please add your name, mobile, email and a tour date.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      setPayError("Please check your email address.");
      return;
    }
    if (!pickupDetailsComplete) {
      setPayError("Please confirm your pickup point on the map.");
      return;
    }
    if (!optionsOk) {
      setPayError("Please choose a tour option.");
      return;
    }
    if (pricing.isCustomQuote) {
      setPayError(
        "This group size needs a custom quote. Please contact us to book.",
      );
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
      const optionObj = tour.options?.find(
        (o) => o.id === formData.selectedOption,
      );
      let adultBase =
        Number((find("adult") || tour.pricing?.[0])?.pricePerPerson) || 0;
      if (optionObj && typeof optionObj.pricePerPerson === "number") {
        adultBase = optionObj.pricePerPerson;
      }
      const adultPrice = convertPrice(adultBase, currency);
      const teenPrice = convertPrice(
        Number(find("teen")?.pricePerPerson) || 0,
        currency,
      );
      const childPrice = convertPrice(
        Number(find("child")?.pricePerPerson) || 0,
        currency,
      );
      const toddlerPrice = convertPrice(
        Number(find("toddler")?.pricePerPerson) || 0,
        currency,
      );

      const pickupTimeLabel = getPickupTime(tour);
      const checkoutStops = getCheckoutStops(tour);
      const bookingReference = generateBookingReference();
      const notes = formData.isCustom ? formData.notes : "";
      const participantEmails = (formData.participantEmails || [])
        .map((x) => x.trim())
        .filter(Boolean);

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
        isPrivate: formData.isPrivate,
        privateFee: pricing.privateFee,
        isCustom: formData.isCustom,
        customFee: pricing.customFee,
        totalPrice: pricing.finalTotal,
        totalMinorUnit,
        totalAmountLabel,
      };

      const bookingDetails = {
        fullName: formData.fullName.trim(),
        mobile: formData.mobile.trim(),
        email: formData.email.trim(),
        date: formData.date,
        adults: adultCount,
        children,
        toddlers,
        teens,
        childAges,
        participants: String(participantCount),
        participantEmails,
        ccParticipantEmails: formData.ccParticipants ? participantEmails : [],
        ccParticipants: Boolean(formData.ccParticipants),
        seatAssignments: formData.seatAssignments,
        pickupLocation: formData.pickupLocation,
        pickupCoords: formData.pickupCoords,
        pickupTimeLabel,
        isPrivate: formData.isPrivate,
        isCustom: formData.isCustom,
        selectedOption: formData.selectedOption,
        selectedExtras: formData.selectedExtras || {},
        selectedKidsActivity: formData.selectedKidsActivity,
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
        participantEmails: bookingDetails.participantEmails,
        ccParticipantEmails: bookingDetails.ccParticipantEmails,
        ccParticipants: bookingDetails.ccParticipants,
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
      if (!res.ok)
        throw new Error(data.error || "Could not start Paystack checkout.");
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

  const payDisabled =
    paying || verifyStatus === "pending" || pricing.isCustomQuote;

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

      {/* Wrapper does NOT clip, so the currency dropdown can open past the
          panel's rounded/overflow-hidden edge. */}
      <div
        className="relative flex h-full max-h-[52rem] w-full max-w-3xl"
        style={{
          animation: "tourDrawerIn 0.3s cubic-bezier(0.16,1,0.3,1) both",
        }}
        onClick={(e) => e.stopPropagation()}
      >
      <div className="flex h-full w-full flex-col overflow-hidden rounded-t-[2rem] bg-stone-50 shadow-2xl">
        {/* Scroll area: sticky bar + hero (image & title) + form */}
        <div
          ref={scrollRef}
          data-lenis-prevent
          className="flex-1 overflow-y-auto overscroll-contain"
          style={{ "--p": 0 }}
        >
          {/* Sticky compact bar: always shows close + currency; the title and a
              solid background fade in as the hero scrolls away. */}
          <div className="sticky top-0 z-30 h-14">
            <div
              aria-hidden="true"
              className="absolute inset-0 border-b border-black/5 bg-white/90 backdrop-blur-md"
              style={{ opacity: "clamp(0, calc((var(--p) - 0.55) * 2.5), 1)" }}
            />
            {/* Left/right padding leaves room for the currency selector and close button */}
            <div className="relative flex h-full items-center pl-40 pr-16">
              <p
                className="min-w-0 truncate font-frank text-base font-bold text-neutral-950"
                style={{
                  opacity: "clamp(0, calc((var(--p) - 0.7) * 3.4), 1)",
                  transform: "translate3d(0, calc((1 - var(--p)) * 6px), 0)",
                }}
              >
                {tour.title}
              </p>
            </div>
          </div>

          {/* Hero: slides up under the bar as you scroll */}
          <div
            ref={heroRef}
            className="relative -mt-14 h-48 overflow-hidden bg-neutral-900 sm:h-56"
          >
            <img
              src={resolveImage(tour.image)}
              alt=""
              className="absolute inset-0 h-full w-full object-cover will-change-transform"
              style={{
                transform: "translate3d(0, calc(var(--p) * 36px), 0) scale(1.12)",
              }}
              onError={(e) => {
                e.currentTarget.src = "/images/content/random/1.webp";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/45 to-black/25" />
            <div
              className="absolute inset-x-0 bottom-0 p-4 text-white will-change-transform sm:p-5"
              style={{
                opacity: "max(0, calc(1 - var(--p) * 1.6))",
                transform: "translate3d(0, calc(var(--p) * -14px), 0)",
              }}
            >
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
          </div>

          <div className="space-y-4 p-3 sm:p-4">
          {Array.isArray(tour.options) && tour.options.length > 0 && (
            <TourOptions
              tour={tour}
              selectedOption={formData.selectedOption}
              onOptionChange={(id) => patch({ selectedOption: id })}
              currency={currency}
            />
          )}

          {/* Same sections as the Booking page */}
          <form
            id="booking-drawer-form"
            onSubmit={(e) => e.preventDefault()}
            className="grid min-w-0 grid-cols-1 gap-5"
          >
            <TravellerDetailsSection
              formData={formData}
              onChange={handleChange}
              complete={travellerDetailsComplete}
              isEditing={showTravellerEditor}
              hasSnapshot={Boolean(travellerSnapshot)}
              onRequestEdit={handleTravellerEdit}
              onSaveEdit={handleTravellerSave}
              onCancelEdit={handleTravellerCancel}
              onResetTraveller={handleResetTraveller}
            />

            <GroupSizeSection
              tour={tour}
              seatAssignments={formData.seatAssignments}
              activeBrush={activeBrush}
              bandCounts={bandCounts}
              participantCount={participantCount}
              minPeople={minPeople}
              maxGuests={MAX_GUESTS}
              childFriendly={childFriendly}
              isEditing={showGroupEditor}
              hasSnapshot={Boolean(groupSnapshot)}
              onSeatTap={handleSeatTap}
              onBrushToggle={handleBrushToggle}
              onResetSeats={handleResetSeats}
              onOpenEditor={openGroupEditor}
              onCancelEdit={cancelGroupEdit}
              onConfirm={confirmGroup}
            />

            <PickupLocationSection
              formData={formData}
              onInputChange={handlePickupInputChange}
              showPicker={showPickupPicker}
              pendingPickup={pendingPickup}
              markerPosition={markerPosition}
              mapCenter={mapCenter}
              locationLoading={locationLoading}
              locationError={locationError}
              onConfirm={handleConfirmPickupLocation}
              onFind={handleFindAddress}
              onMapPick={handleMapPick}
              onReset={handlePickupReset}
              onChangeClick={handlePickupChange}
              pickupFeedbackRef={pickupFeedbackRef}
            />

            <KidsActivities
              childFriendly={tour.childFriendly === true}
              adultCount={adultCount}
              childCount={children}
              toddlerCount={toddlers}
              selectedActivity={formData.selectedKidsActivity}
              onActivityChange={(id) => patch({ selectedKidsActivity: id })}
            />
          </form>

          <div className="space-y-3">
            {/* <div className="flex flex-col gap-3 sm:flex-row">
              <ToggleCard
                active={formData.isPrivate}
                title="Private tour"
                text="Book this as a private vehicle-based experience."
                price={`+ ${privateFeeLabel}`}
                onClick={() => patch({ isPrivate: !formData.isPrivate })}
              />
              <ToggleCard
                active={formData.isCustom}
                title="Custom trip"
                text="Custom planning, route timing or special adjustments."
                price={`+ ${customFeeLabel}`}
                onClick={() => patch({ isCustom: !formData.isCustom })}
              />
            </div> */}

            {formData.isCustom && (
              <textarea
                rows={3}
                value={formData.notes}
                onChange={(e) => patch({ notes: e.target.value })}
                className="w-full resize-none rounded-2xl border border-neutral-200 bg-white p-3 text-sm outline-none focus:border-green-400 focus:ring-4 focus:ring-green-100"
                placeholder="Custom route requests, pickup timing, accessibility needs, dietary restrictions…"
              />
            )}
          </div>

          {/* Checkout summary (pay button lives in the sticky bar below) */}
          <CheckoutSummary
            tour={tour}
            adultCount={adultCount}
            childCount={children}
            toddlerCount={toddlers}
            currency={currency}
            selectedOption={formData.selectedOption}
            selectedExtras={formData.selectedExtras}
            formData={formData}
            contactDetailsComplete={contactDetailsComplete}
            dateDetailsComplete={dateDetailsComplete}
            pickupDetailsComplete={pickupDetailsComplete}
            isEmbedded
            stacked
            hideSubmit
            submitting={paying}
            verifyStatus={verifyStatus}
            verifyError={verifyError}
            onExtrasChange={(extras) => patch({ selectedExtras: extras })}
          />

          <p className="px-2 pb-2 text-center text-[11px] leading-5 text-neutral-500">
            Cancellation within 24 hours of booking gets a full refund. 2–3 days
            before the trip has a 20% penalty; within 24 hours there is no
            refund.{" "}
            <Link
              to="/policies"
              className="font-semibold text-blue-700 underline"
            >
              Read policies
            </Link>
            . Pickup and vehicle details are confirmed after payment.
          </p>
          </div>
        </div>

        {/* Sticky pay bar */}
        <div className="shrink-0 border-t border-black/5 bg-white p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:p-4">
          {pricing.isCustomQuote && (
            <p className="mb-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">
              This group size needs a custom quote. Email {CONTACT_EMAIL} or
              call {CONTACT_NUMBER}.
            </p>
          )}
          {payError && (
            <p
              className="mb-2 rounded-xl bg-red-500 px-3 py-2 text-sm text-white"
              role="alert"
            >
              {payError}
            </p>
          )}
          {currency !== chosenCurrency && (
            <p className="mb-2 text-center text-[11px] font-semibold text-amber-700">
              {chosenCurrency} isn’t available for this tour, so it’s priced in{" "}
              {currency}.
              {currency === "ZAR" && currencyCtx?.format
                ? ` (about ${currencyCtx.format(pricing.finalTotal)})`
                : ""}
            </p>
          )}
          {!payError && !pricing.isCustomQuote && verifyStatus === "idle" && (
            <p className="mb-2 text-center text-[11px] font-semibold text-neutral-400">
              {!contactDetailsComplete || !dateDetailsComplete
                ? "Add your details and date to continue."
                : !pickupDetailsComplete
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
            <img
              src="/icons/paystack-logo.svg"
              alt="Paystack"
              className="h-5"
              loading="lazy"
            />
            <span className="text-[11px] font-semibold text-neutral-400">
              Secure payment · your bank may ask for 3D Secure
            </span>
          </div>
        </div>
      </div>

      {/* Currency + close live outside the clipped panel. The selector sits on
          the LEFT so its dropdown (which opens rightwards) stays on screen. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[45] flex h-14 items-center justify-between px-4">
        <div className="pointer-events-auto">
          <CurrencySelector />
        </div>
        <button
          type="button"
          onClick={onClose}
          disabled={paying}
          aria-label="Close booking"
          className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-lg text-neutral-800 shadow ring-1 ring-black/10 transition hover:bg-white disabled:opacity-40"
        >
          ✕
        </button>
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