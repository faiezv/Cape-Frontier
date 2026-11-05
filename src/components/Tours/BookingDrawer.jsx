import React, {
  lazy,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import ClientOnly from "../ClientOnly";
import CheckoutSummary from "../CheckoutSummary";
import TourOptions from "../TourDetails/TourOptions.jsx";
import AdditionalPricing from "../TourDetails/AdditionalPricing";
import KidsActivities from "../TourDetails/KidsActivities.jsx";
import { KIDS_ACTIVITIES } from "../../data/kidsActivities.js";
import { resolveImage } from "../../utils/ImageLoader";
import { hasGroupDeal } from "../../utils/tourHelpers";
import {
  computePricing,
  convertPrice,
  formatMoney,
} from "../../utils/pricingEngine.js";

// Leaflet only runs in the browser (same fix as Booking.jsx)
const Map = lazy(() => import("../Map"));

const MAX_PEOPLE = 8;
const DEFAULT_CENTER = { lat: -33.9249, lng: 18.4241 };

export const CONTACT_EMAIL = "admin@cape-frontier.co.za";
export const CONTACT_NUMBER = "(+27)72 264 7284";
export const CONTACT_TEL = "+27722647284";

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

// ─── Form building blocks ────────────────────────────────────────────────────

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
          <h3 className="font-frank text-xl leading-none text-neutral-950">
            {title}
          </h3>
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

function Stepper({
  label,
  hint,
  value,
  onMinus,
  onPlus,
  minusDisabled,
  plusDisabled,
}) {
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
  Number(age) <= 5
    ? CHILD_CATEGORIES[0]
    : Number(age) <= 11
      ? CHILD_CATEGORIES[1]
      : CHILD_CATEGORIES[2];

// ─── Booking drawer: everything up to Paystack on one screen ────────────────

export default function BookingDrawer({ tour, onClose }) {
  const minPeople = Math.min(
    Math.max(Number(tour.minPeople) || 1, 1),
    MAX_PEOPLE,
  );
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
  const canAddChild =
    tour.childFriendly !== false && participantCount < MAX_PEOPLE;

  const contactComplete = Boolean(
    form.fullName.trim() && form.mobile.trim() && form.email.trim(),
  );
  const dateComplete = Boolean(form.date);
  const pickupComplete = Boolean(form.pickupCoords);
  const optionsOk =
    !(Array.isArray(tour.options) && tour.options.length > 0) ||
    Boolean(form.selectedOption);

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
      contactComplete &&
      dateComplete &&
      pickupComplete &&
      (!pricing.hasOptions || form.selectedOption);

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
      adults: Math.max(prev.adults, minPeople - (prev.childAges.length - 1)),
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
      const optionObj = tour.options?.find((o) => o.id === form.selectedOption);
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

      <div
        className="flex h-full max-h-[52rem] w-full max-w-3xl flex-col overflow-hidden rounded-t-[2rem] bg-stone-50 shadow-2xl"
        style={{
          animation: "tourDrawerIn 0.3s cubic-bezier(0.16,1,0.3,1) both",
        }}
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
                minusDisabled={
                  adultCount <= 1 || participantCount - 1 < minPeople
                }
                plusDisabled={participantCount >= MAX_PEOPLE}
              />

              {tour.childFriendly === false ? (
                <div className="rounded-lg border border-amber-200/80 bg-amber-50/70 px-3 py-2 text-xs text-amber-800">
                  ⚠️ This tour is not child-friendly.
                </div>
              ) : (
                <div className="rounded-2xl border border-black/5 bg-white p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-neutral-950">
                      Children
                    </p>
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
                        <span className="text-[9px] font-bold text-blue-500">
                          {cat.range}
                        </span>
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
                                {cat.label}{" "}
                                {
                                  childAges
                                    .slice(0, i + 1)
                                    .filter(
                                      (a) => categoryOf(a).key === cat.key,
                                    ).length
                                }
                              </p>
                              <p className="text-[10px] font-medium text-neutral-400">
                                {cat.range} yrs
                              </p>
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
                {participantCount} guest{participantCount !== 1 ? "s" : ""} in
                total
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
                  <p className="text-sm font-bold text-green-950">
                    Pickup location saved
                  </p>
                  <p className="mt-1 text-sm leading-6 text-neutral-700">
                    {form.pickupLocation}
                  </p>
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
                      patch({
                        pickupLocation: e.target.value,
                        pickupCoords: null,
                      });
                    }}
                  />
                  <button
                    type="button"
                    onClick={pendingPickup ? confirmPickup : handleFindAddress}
                    disabled={
                      locationLoading ||
                      (!pendingPickup && !form.pickupLocation.trim())
                    }
                    className="rounded-2xl bg-blue-600 px-5 py-3.5 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {locationLoading
                      ? "Searching…"
                      : pendingPickup
                        ? "Confirm pickup"
                        : "Find on map"}
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
                  <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-600">
                    {locationError}
                  </p>
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

            {Array.isArray(tour.additionalPricing) &&
              tour.additionalPricing.length > 0 && (
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