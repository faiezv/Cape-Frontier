// src/components/CheckoutPaystack.jsx

import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FX_RATES } from "../data/fxRates.js";
import vehicles from "../data/vehicles.js";
import { KIDS_ACTIVITIES } from "../data/kidsActivities";

import { resolveImage } from "../utils/ImageLoader.js";
import { formatMoney } from "../components/Tours/Helpers.jsx";
import Seo from "../components/Seo.jsx";

gsap.registerPlugin(ScrollTrigger);

// ─── Config ───────────────────────────────────────────────────────────

// Same list as SiteFooter. Flip `enabled` to show/hide a method.
const paymentMethods = [
  { label: "Visa", glyph: "visa", enabled: true },
  { label: "Mastercard", glyph: "mastercard", enabled: true },
  { label: "Apple Pay", glyph: "applepay", enabled: true },
  { label: "Google Pay", glyph: "googlepay", enabled: true },
  { label: "QR", glyph: "qr", enabled: true },
  { label: "EFT", glyph: "bank", enabled: false },
  { label: "Capitec Pay", glyph: null, enabled: false },
];

// Drop your policy images in /public/images/policies/ with these names.
// If a file is missing, a tinted icon fallback is shown instead.
const POLICY_IMAGES = {
  booking: "/images/policies/booking.webp",
  cancellation: "/images/policies/cancellation.webp",
  weather: "/images/policies/weather.webp",
};

// ─── Helpers ──────────────────────────────────────────────────────────

const getTourReturnPath = (tour) => {
  const rawSlug =
    tour?.slug ||
    tour?.canonicalSlug ||
    tour?.canonicalPath?.split("/").filter(Boolean).pop() ||
    tour?.title ||
    tour?.info ||
    "";

  const slug = String(rawSlug)
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug ? `/tours/${slug}` : "/";
};

const convertFromZar = (amountZar, currency) => {
  const safeAmount = Number(amountZar);
  const code = String(currency || "ZAR").toUpperCase();
  const rate = Number(FX_RATES[code] ?? 1);

  if (!Number.isFinite(safeAmount)) return 0;
  if (!Number.isFinite(rate)) return 0;

  return safeAmount * rate;
};

const formatDisplayTime = (value) => {
  if (!value) return "";

  const text = String(value).trim();
  if (!text) return "";

  if (/\b(am|pm)\b/i.test(text)) return text;

  return text.replace(
    /\b([01]?\d|2[0-3]):([0-5]\d)\b/g,
    (_, hourText, minuteText) => {
      const hour = Number(hourText);
      const suffix = hour >= 12 ? "PM" : "AM";
      const displayHour = hour % 12 || 12;

      return `${displayHour}:${minuteText} ${suffix}`;
    },
  );
};

const toMinorUnit = (amount, currency) => {
  const safeAmount = Number(amount);
  const code = String(currency || "ZAR").toUpperCase();

  if (!Number.isFinite(safeAmount)) return 0;

  const ZERO_DECIMAL = new Set(["JPY", "KRW"]);

  return ZERO_DECIMAL.has(code)
    ? Math.round(safeAmount)
    : Math.round(safeAmount * 100);
};

const normalizeEmails = (emails) => {
  if (!Array.isArray(emails)) return [];

  return emails.map((email) => String(email || "").trim()).filter(Boolean);
};

const getPickupTime = (tour, bookingDetails) => {
  const directTime =
    bookingDetails?.pickupTime ||
    bookingDetails?.preferredPickupTime ||
    bookingDetails?.pickupTimeLabel ||
    bookingDetails?.time ||
    bookingDetails?.pickup?.time ||
    tour?.pickupTime ||
    tour?.startTime ||
    tour?.departureTime;

  if (directTime) return formatDisplayTime(directTime);

  const pickupStop = tour?.stops?.find((stop) => {
    const text = `${stop?.id || ""} ${stop?.name || ""}`.toLowerCase();
    return (text.includes("pickup") || text.includes("meeting")) && stop?.time;
  });

  if (pickupStop?.time) return formatDisplayTime(pickupStop.time);

  const firstTimedStop = tour?.stops?.find((stop) => stop?.time);

  return firstTimedStop?.time
    ? formatDisplayTime(firstTimedStop.time)
    : "To be confirmed";
};

// ─── UI components ────────────────────────────────────────────────────

const InfoPill = ({ children, tone = "neutral" }) => {
  const tones = {
    neutral: "border-white/70 bg-white/80 text-slate-600",
    green: "border-[#071f4f]/20 bg-[#071f4f] text-white",
    blue: "border-[#071f4f]/15 bg-[#eef4ff] text-[#071f4f]",
    dark: "border-[#071f4f] bg-[#071f4f] text-white",
    stone: "border-stone-200 bg-stone-100 text-slate-600",
  };

  return (
    <span
      className={`inline-flex w-fit items-center rounded-full border px-3 py-1.5 text-xs font-bold ${tones[tone] || tones.neutral}`}
    >
      {children}
    </span>
  );
};

const SummaryRow = ({ label, value, strong = false }) => (
  <div className="flex items-start justify-between gap-4 text-sm">
    <span className="text-slate-500">{label}</span>
    <span
      className={`max-w-[62%] text-right leading-5 ${
        strong ? "font-bold text-slate-950" : "font-semibold text-slate-700"
      }`}
    >
      {value}
    </span>
  </div>
);

// Policy card with an image on top. Falls back to a tinted panel if the
// image file is missing.
const PolicyNote = ({ title, image, children }) => {
  const [failed, setFailed] = useState(!image);

  return (
    <div className="overflow-hidden rounded-2xl bg-white/80 shadow-[0_10px_24px_rgba(7,31,79,0.05)]">
      <div className="relative h-32 w-full overflow-hidden bg-gradient-to-br from-[#eef4ff] to-[#dce8fb]">
        {!failed ? (
          <img
            src={resolveImage(image)}
            alt={title}
            loading="lazy"
            onError={() => setFailed(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[#071f4f]/30">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-10 w-10"
              aria-hidden="true"
            >
              <rect x="3" y="4" width="18" height="16" rx="2" />
              <circle cx="9" cy="10" r="1.6" />
              <path d="m21 16-5-5-8 8" />
            </svg>
          </div>
        )}
      </div>

      <div className="p-4">
        <p className="text-sm font-bold text-[#071f4f]">{title}</p>
        <p className="mt-1 text-xs leading-5 text-slate-500">{children}</p>
      </div>
    </div>
  );
};

const VehicleOptionCard = ({ vehicle }) => (
  <div className="group overflow-hidden rounded-[1.35rem] bg-white shadow-[0_12px_28px_rgba(7,31,79,0.06)]">
    <div className="relative h-28 overflow-hidden bg-slate-100">
      <img
        src={resolveImage(vehicle.image)}
        alt={vehicle.name}
        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        loading="lazy"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />

      <div className="absolute bottom-2 left-2 rounded-full bg-white/92 px-2.5 py-1 text-[10px] font-bold text-slate-900 shadow-sm">
        {vehicle.color} · {vehicle.capacity}
      </div>
    </div>

    <div className="p-3">
      <p className="font-frank text-xl font-bold leading-none text-[#071f4f]">
        {vehicle.name}
      </p>

      <p className="mt-1 text-[11px] font-semibold leading-4 text-slate-500">
        {vehicle.type}
      </p>

      <div className="mt-2 flex flex-wrap gap-1.5">
        <span className="rounded-full bg-[#eef4ff] px-2 py-1 text-[10px] font-bold text-[#071f4f]">
          {vehicle.luggage}
        </span>
        <span className="rounded-full bg-[#f3f6fb] px-2 py-1 text-[10px] font-bold text-[#071f4f]">
          {vehicle.transmission}
        </span>
      </div>
    </div>
  </div>
);

const RevealButton = ({ active, title, detail, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`group flex w-full items-center justify-between gap-3 rounded-[1.25rem] border p-4 text-left transition ${
      active
        ? "border-green-300 bg-green-200 text-green-950"
        : "border-black/5 bg-white/82 text-slate-700 shadow-[0_10px_24px_rgba(7,31,79,0.04)] hover:-translate-y-0.5 hover:bg-white"
    }`}
  >
    <span>
      <span className="block text-sm font-bold">{title}</span>
      {detail && (
        <span
          className={`mt-1 block text-xs leading-5 ${active ? "text-green-950/70" : "text-slate-500"}`}
        >
          {detail}
        </span>
      )}
    </span>

    <span
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-lg font-bold transition ${
        active
          ? "bg-white/70 rotate-45 text-green-950"
          : "bg-slate-50 group-hover:bg-[#eef4ff]"
      }`}
    >
      +
    </span>
  </button>
);

const RevealPanel = ({ open, children }) => {
  return (
    <div
      className={`overflow-hidden rounded-[1.5rem] transition-all duration-500 ease-out ${
        open
          ? "max-h-[3200px] translate-y-0 opacity-100"
          : "max-h-0 -translate-y-2 opacity-0 pointer-events-none"
      }`}
      aria-hidden={!open}
    >
      <div
        className={`transition-all duration-500 ease-out ${
          open ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
        }`}
      >
        {children}
      </div>
    </div>
  );
};

// ─── Accepted payment methods (mirrors SiteFooter) ────────────────────

const glyphProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
  className: "h-4 w-4 shrink-0",
};

const Glyph = ({ name }) => {
  switch (name) {
    case "mastercard":
      return (
        <svg
          viewBox="0 0 32 20"
          aria-hidden="true"
          className="h-4 w-auto shrink-0"
        >
          <circle cx="11" cy="10" r="9" fill="#EB001B" />
          <circle cx="21" cy="10" r="9" fill="#F79E1B" />
          <path
            d="M16 2.52A9 9 0 0 1 16 17.48A9 9 0 0 1 16 2.52z"
            fill="#FF5F00"
          />
        </svg>
      );
    case "qr":
      return (
        <svg {...glyphProps}>
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <path d="M14 14h3v3h-3zM20 14v.01M14 20h.01M17 20h4v-3" />
        </svg>
      );
    case "bank":
      return (
        <svg {...glyphProps}>
          <path d="M3 9l9-5 9 5M5 10v8M10 10v8M14 10v8M19 10v8M3 20h18" />
        </svg>
      );
    default:
      return null;
  }
};

const PaymentBadge = ({ label, glyph }) => {
  if (glyph === "applepay") {
    return (
      <li
        aria-label="Apple Pay"
        className="flex h-8 items-center justify-center gap-1 rounded-md border border-black/15 bg-white px-2.5"
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          focusable="false"
          className="h-4 w-4 shrink-0 text-black"
          fill="currentColor"
        >
          <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
        </svg>
        <span className="text-[13px] font-semibold leading-none tracking-tight text-black">
          Pay
        </span>
      </li>
    );
  }

  if (glyph === "googlepay") {
    return (
      <li
        aria-label="Google Pay"
        className="flex h-8 items-center justify-center gap-1 rounded-md border border-black/15 bg-white px-3"
      >
        <span className="text-[13px] font-bold leading-none">
          <span className="text-[#4285F4]">G</span>
          <span className="text-[#EA4335]">o</span>
          <span className="text-[#FBBC05]">o</span>
          <span className="text-[#4285F4]">g</span>
          <span className="text-[#34A853]">l</span>
          <span className="text-[#EA4335]">e</span>
        </span>
        <span className="text-[12px] font-semibold text-neutral-600">Pay</span>
      </li>
    );
  }

  const textClass =
    glyph === "visa"
      ? "text-[12px] font-extrabold italic tracking-tight text-[#1A1F71]"
      : "text-[11px] font-bold text-neutral-700";

  return (
    <li className="flex h-8 items-center justify-center gap-1.5 rounded-md border border-black/10 bg-white px-2.5 text-neutral-700">
      <Glyph name={glyph} />
      <span className={`whitespace-nowrap ${textClass}`}>
        {glyph === "visa" ? "VISA" : label}
      </span>
    </li>
  );
};

const AcceptedPayments = () => (
  <div className="mt-1 rounded-2xl border border-black/5 bg-white/70 px-3 py-3">
    <p className="text-center text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
      We accept
    </p>

    <ul
      aria-label="Accepted payment methods"
      className="mt-2 flex flex-wrap items-center justify-center gap-1.5"
    >
      {paymentMethods
        .filter((method) => method.enabled)
        .map((method) => (
          <PaymentBadge key={method.label} {...method} />
        ))}
    </ul>
  </div>
);

// ─── 3D Secure notice ─────────────────────────────────────────────────

const ThreeDSNotice = () => (
  <div
    role="note"
    className="mt-4 w-full overflow-hidden rounded-2xl border border-amber-300 bg-amber-50 shadow-[0_12px_30px_rgba(180,83,9,0.10)]"
  >
    <div className="flex items-start gap-3 bg-amber-100/80 px-4 py-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-amber-700 shadow-sm">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
          aria-hidden="true"
        >
          <path d="M12 3 4.5 6v5.5c0 4.6 3.1 8.2 7.5 9.5 4.4-1.3 7.5-4.9 7.5-9.5V6L12 3Z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      </span>

      <div className="min-w-0">
        <p className="text-sm font-black leading-5 text-amber-950">
          Your bank may ask you to confirm this payment
        </p>
        <p className="mt-0.5 text-xs font-semibold leading-5 text-amber-900/80">
          This is 3D Secure (3DS). It is normal for international cards and
          protects you from fraud.
        </p>
      </div>
    </div>

    <ul className="space-y-2 px-4 py-3 text-xs leading-5 text-amber-950">
      <li className="flex gap-2">
        <span className="mt-0.5 font-black text-amber-700">✓</span>
        <span>
          <strong>Keep your phone nearby.</strong> You may get an SMS code or a
          push notification from your banking app.
        </span>
      </li>
      <li className="flex gap-2">
        <span className="mt-0.5 font-black text-amber-700">✓</span>
        <span>
          <strong>Do not close or refresh this page</strong> until you are
          returned to Cape Frontier.
        </span>
      </li>
      <li className="flex gap-2">
        <span className="mt-0.5 font-black text-amber-700">✓</span>
        <span>
          <strong>Payment declined?</strong> Call your bank to allow online
          international payments, or try another card.
        </span>
      </li>
    </ul>
  </div>
);

// ─── Payment helpers ──────────────────────────────────────────────────

const generateBookingReference = () => {
  const random = Math.random().toString(36).slice(2, 10).toUpperCase();
  return `TOUR-${random}`;
};

const buildPaystackBookingPayload = ({
  tour,
  bookingDetails,
  notes,
  pricingSummary,
  currency,
  totalAmountLabel,
  checkoutStops,
  bookingReference,
}) => ({
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
  pickupTime: bookingDetails.pickupTimeLabel,
  participants: bookingDetails.participants,
  participantEmails: bookingDetails.participantEmails || [],
  ccParticipantEmails: bookingDetails.ccParticipantEmails || [],
  ccParticipants: Boolean(bookingDetails.ccParticipants),
  pricingOptions: bookingDetails.pricingOptions || {},
  pricingSummary,
  customerNotes: notes,
  pickupLocation:
    bookingDetails.pickupLocation || bookingDetails.pickup || "Not provided",
  pickupCoords: bookingDetails.pickupCoords || null,
  selectedCurrency: currency,
  totalAmount: totalAmountLabel,
  policyAcknowledgement: {
    customerBooksOwnGroup: true,
    participantsMustMatchOwnParty: true,
    lowerRatesRequireFullSelectedGroupPayment: true,
    finalPickupVehicleOperationallyConfirmed: true,
  },
});

// ─── CheckoutForm ─────────────────────────────────────────────────────

const CheckoutForm = ({
  totalAmountLabel,
  currency,
  tour,
  bookingDetails,
  notes,
  pricingSummary,
  checkoutStops = [],
  priceToken = null,
  verifyState = "ready",
  verifyError = "",
  zarEstimate = null,
}) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [successFade, setSuccessFade] = useState(false);

  const totalMinorUnit = Number(
    pricingSummary?.totalMinorUnit ??
      bookingDetails?.pricingOptions?.totalMinorUnit,
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;
    if (verifyState === "pending") return;
    if (verifyState === "failed") return;

    setLoading(true);
    setMessage("");

    try {
      if (!Number.isFinite(totalMinorUnit) || totalMinorUnit < 1) {
        throw new Error(
          "Invalid total amount. Please check the booking total.",
        );
      }

      if (!bookingDetails?.email) {
        throw new Error("Customer email is required before payment.");
      }

      const bookingReference = generateBookingReference();

      const emailPayload = buildPaystackBookingPayload({
        tour,
        bookingDetails,
        notes,
        pricingSummary,
        currency,
        totalAmountLabel,
        checkoutStops,
        bookingReference,
      });

      const checkoutSnapshot = {
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

      sessionStorage.setItem("lastCheckout", JSON.stringify(checkoutSnapshot));

      const res = await fetch("/api/paystack-initialize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: bookingDetails.email,
          // Sent for compatibility; server ignores it when a valid
          // priceToken is present and uses the signed finalTotal.
          amount: totalMinorUnit,
          currency,
          bookingReference,
          callbackUrl: `${window.location.origin}/success`,
          priceToken: priceToken || undefined,
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

      const contentType = res.headers.get("content-type") || "";

      if (!contentType.includes("application/json")) {
        throw new Error(
          import.meta.env.DEV
            ? "Payment API not reachable. Start `vercel dev --listen 3001` so /api/paystack-initialize returns JSON."
            : "Payment service is unavailable. Please try again shortly.",
        );
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Could not start Paystack checkout.");
      }

      if (!data.authorization_url || !data.reference) {
        throw new Error("Paystack did not return a payment URL.");
      }

      sessionStorage.setItem(
        "lastCheckout",
        JSON.stringify({
          ...checkoutSnapshot,
          paystackReference: data.reference,
          accessCode: data.access_code || "",
          authorizationUrl: data.authorization_url,
        }),
      );

      setSuccessFade(true);

      await new Promise((resolve) => {
        window.setTimeout(resolve, 400);
      });

      window.location.href = data.authorization_url;
    } catch (error) {
      console.error("Paystack checkout error:", error);
      setMessage(error.message || "Could not start Paystack payment.");
      setLoading(false);
    }
  };

  const submitDisabled =
    loading || verifyState === "pending" || verifyState === "failed";

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full flex-col gap-3 overflow-visible"
    >
      {successFade && (
        <>
          <style>{`
            @keyframes checkoutFadeToWhite {
              from { opacity: 0; }
              to { opacity: 1; }
            }
          `}</style>

          <div
            className="fixed inset-0 z-[120] bg-white"
            style={{ animation: "checkoutFadeToWhite 400ms ease-out forwards" }}
            aria-hidden="true"
          />
        </>
      )}

      <div className="rounded-[1.25rem] border border-[#071f4f]/10 bg-white p-4 shadow-[0_12px_30px_rgba(7,31,79,0.055)] md:p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#071f4f]/55">
              Amount due
            </p>

            <p className="mt-1 font-frank text-3xl font-black leading-none text-[#071f4f] md:text-4xl">
              {totalAmountLabel}
            </p>
          </div>
        </div>
      </div>

      {verifyState === "pending" && (
        <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs font-semibold text-amber-800">
          <span className="mt-[2px] inline-block h-3 w-3 shrink-0 animate-spin rounded-full border-2 border-amber-300 border-t-amber-700" />
          <span>Verifying price with server…</span>
        </div>
      )}

      {verifyState === "bypassed" && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs font-semibold leading-5 text-amber-800">
          Price verification is unavailable in this environment. In production,
          the amount is re-verified server-side before charge.
        </div>
      )}

      {verifyState === "failed" && (
        <div className="rounded-xl border border-red-300 bg-red-50 px-3 py-2.5 text-xs font-semibold leading-5 text-red-700">
          {verifyError || "Could not verify the current price."} Please go back
          and try again.
        </div>
      )}

      <button
        type="submit"
        disabled={submitDisabled}
        className="hero-gradient-bl group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-[1.25rem] px-6 py-4 font-frank text-xl font-black text-white shadow-[0_18px_42px_rgba(7,31,79,0.20)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_52px_rgba(7,31,79,0.28)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className="pointer-events-none absolute inset-0 translate-x-[-120%] bg-white/20 blur-xl transition duration-700 group-hover:translate-x-[120%]" />

        {!loading && (
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="relative h-5 w-5"
            fill="none"
          >
            <path
              d="M7.5 10V7.7C7.5 5.2 9.3 3.5 12 3.5s4.5 1.7 4.5 4.2V10"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M6.8 10h10.4c.9 0 1.6.7 1.6 1.6v6.1c0 .9-.7 1.6-1.6 1.6H6.8c-.9 0-1.6-.7-1.6-1.6v-6.1c0-.9.7-1.6 1.6-1.6Z"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
        )}

        <span className="relative">
          {loading
            ? "Redirecting..."
            : verifyState === "pending"
              ? "Verifying…"
              : "Pay"}
        </span>
      </button>


      {message && (
        <div className="rounded-2xl bg-red-500 px-4 py-3 text-sm text-white">
          {message}
        </div>
      )}
    </form>
  );
};

// ─── Main CheckoutPaystack component ──────────────────────────────────

const CheckoutPaystack = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    tour,
    bookingDetails,
    selectedCurrency,
    priceToken: initialPriceToken,
  } = location.state || {};

  const pageRef = useRef(null);
  const heroRef = useRef(null);
  const checkoutGridRef = useRef(null);
  const leftRef = useRef(null);
  const rightColumnRef = useRef(null);
  const rightPinRef = useRef(null);
  const rightRef = useRef(null);
  const infoMenuRef = useRef(null);

  const [notes] = useState(bookingDetails?.customerNotes || "");
  const [checkoutError, setCheckoutError] = useState("");
  const [loadingSession, setLoadingSession] = useState(true);
  const [paymentCompact, setPaymentCompact] = useState(false);
  const [showMobileBackTop, setShowMobileBackTop] = useState(false);
  const [openPanels, setOpenPanels] = useState({
    trip: false,
    vehicles: true,
    summary: true,
    policies: false,
  });

  // Pre-flight price verification state. If Booking.jsx already handed
  // us a token, we're ready. If not, we fetch one here so the page is
  // self-sufficient (handles refresh-on-checkout or direct navigation).
  const [verifiedPriceToken, setVerifiedPriceToken] = useState(
    initialPriceToken || null,
  );
  const [verifyState, setVerifyState] = useState(
    initialPriceToken ? "ready" : "idle",
  );
  const [verifyError, setVerifyError] = useState("");

  const togglePanel = (key) => {
    setOpenPanels((current) => ({
      ...current,
      [key]: !current[key],
    }));
  };

  const currency = useMemo(() => {
    return String(
      selectedCurrency || tour?.baseCurrency || "ZAR",
    ).toUpperCase();
  }, [selectedCurrency, tour]);

  const handleBackToBooking = () => {
    if (window.lenis?.start) window.lenis.start();

    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "auto";
    }

    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate(getTourReturnPath(tour), {
      state: {
        tour,
        selectedCurrency: currency,
        restorePreviousScroll: true,
      },
      replace: true,
    });
  };

  const handleScrollToTop = () => {
    if (window.lenis?.scrollTo) {
      window.lenis.scrollTo(0, { duration: 0.75, force: true });
      return;
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePaymentPanelWheel = (event) => {
    const deltaY = event.deltaY || 0;
    if (Math.abs(deltaY) < 1) return;

    event.preventDefault();
    event.stopPropagation();

    const currentY = window.scrollY || window.pageYOffset || 0;
    const nextY = Math.max(0, currentY + deltaY);

    if (window.lenis) {
      window.lenis.scrollTo(nextY, { duration: 0.45, force: true });
      return;
    }

    window.scrollTo({ top: nextY, behavior: "auto" });
  };

  useEffect(() => {
    if (!tour || !bookingDetails) {
      navigate("/");
    }
  }, [tour, bookingDetails, navigate]);

  useEffect(() => {
    let rafId = null;

    const updateMobileBackTop = () => {
      rafId = null;

      if (
        typeof window === "undefined" ||
        window.innerWidth >= 768 ||
        !infoMenuRef.current
      ) {
        setShowMobileBackTop(false);
        return;
      }

      const menuBottom = infoMenuRef.current.getBoundingClientRect().bottom;
      const triggerPoint = window.innerHeight * 0.2;

      setShowMobileBackTop(menuBottom <= triggerPoint);
    };

    const requestUpdate = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(updateMobileBackTop);
    };

    requestUpdate();

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    if (window.lenis?.on) {
      window.lenis.on("scroll", requestUpdate);
    }

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);

      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);

      if (window.lenis?.off) {
        window.lenis.off("scroll", requestUpdate);
      }
    };
  }, [loadingSession, checkoutError, openPanels]);

  useLayoutEffect(() => {
    if (!tour || !bookingDetails || loadingSession || checkoutError) return;
    if (
      !pageRef.current ||
      !heroRef.current ||
      !leftRef.current ||
      !rightRef.current
    )
      return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        heroRef.current,
        { opacity: 0, y: 18, filter: "blur(5px)" },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.6,
          ease: "power3.out",
        },
      );

      if (leftRef.current) {
        gsap.fromTo(
          leftRef.current,
          { opacity: 0, y: 26 },
          {
            opacity: 1,
            y: 0,
            duration: 0.65,
            ease: "power3.out",
            delay: 0.08,
          },
        );
      }
    }, pageRef);

    return () => ctx.revert();
  }, [tour, bookingDetails, loadingSession, checkoutError]);

  useLayoutEffect(() => {
    if (!tour || !bookingDetails || loadingSession || checkoutError) return;
    if (
      !checkoutGridRef.current ||
      !leftRef.current ||
      !rightColumnRef.current ||
      !rightPinRef.current
    ) {
      return;
    }

    const grid = checkoutGridRef.current;
    const left = leftRef.current;
    const column = rightColumnRef.current;
    const pinColumn = rightPinRef.current;
    const lenis = window.lenis;

    let rafId = null;
    let resizeTimer = null;

    const getPinTop = () => 96;

    const resetPin = () => {
      gsap.set(column, { minHeight: "auto" });
      gsap.set(pinColumn, {
        clearProps: "position,top,left,width,zIndex,x,y,transform",
      });
    };

    const updatePin = () => {
      rafId = null;

      if (window.innerWidth < 1024) {
        resetPin();
        return;
      }

      const scrollY = window.scrollY || window.pageYOffset;
      const pinTop = getPinTop();

      const gridTop = grid.getBoundingClientRect().top + scrollY;
      const leftHeight = left.offsetHeight || 0;
      const columnRect = column.getBoundingClientRect();
      const columnLeft = columnRect.left;
      const columnWidth = column.offsetWidth;
      const panelHeight = pinColumn.offsetHeight || 0;

      const startY = gridTop - pinTop;
      const endY = gridTop + leftHeight - panelHeight - pinTop;

      gsap.set(column, {
        minHeight: `${Math.max(panelHeight, 1)}px`,
      });

      if (scrollY < startY || leftHeight <= panelHeight) {
        gsap.set(pinColumn, {
          position: "relative",
          top: "auto",
          left: "auto",
          width: "100%",
          zIndex: 1,
          x: 0,
          y: 0,
          clearProps: "transform",
        });
        return;
      }

      if (scrollY >= endY) {
        gsap.set(pinColumn, {
          position: "absolute",
          top: `${Math.max(0, leftHeight - panelHeight)}px`,
          left: 0,
          width: "100%",
          zIndex: 30,
          x: 0,
          y: 0,
          clearProps: "transform",
        });
        return;
      }

      gsap.set(pinColumn, {
        position: "fixed",
        top: `${pinTop}px`,
        left: `${columnLeft}px`,
        width: `${columnWidth}px`,
        zIndex: 60,
        x: 0,
        y: 0,
        clearProps: "transform",
      });
    };

    const requestUpdate = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(updatePin);
    };

    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        resetPin();
        requestUpdate();
      }, 120);
    };

    const setupTimer = window.setTimeout(() => {
      requestUpdate();
    }, 850);

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", onResize);

    if (lenis?.on) {
      lenis.on("scroll", requestUpdate);
    }

    const lateTimers = [1200, 1800].map((delay) =>
      window.setTimeout(requestUpdate, delay),
    );

    return () => {
      window.clearTimeout(setupTimer);
      window.clearTimeout(resizeTimer);
      lateTimers.forEach((timer) => window.clearTimeout(timer));

      if (rafId) window.cancelAnimationFrame(rafId);

      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", onResize);

      if (lenis?.off) {
        lenis.off("scroll", requestUpdate);
      }

      resetPin();
    };
  }, [tour, bookingDetails, loadingSession, checkoutError, paymentCompact]);

  // ─── Pricing breakdown ─────────────────────────────────────────────

  const adultCount = useMemo(() => {
    const raw = bookingDetails?.adultCount ?? bookingDetails?.adults;
    const parsed = parseInt(raw, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  }, [bookingDetails]);

  const childAges = useMemo(() => {
    const ages = bookingDetails?.childAges;
    if (Array.isArray(ages)) {
      return ages
        .map((age) => Number(age))
        .filter((age) => Number.isFinite(age) && age >= 0 && age <= 17);
    }
    return [];
  }, [bookingDetails]);

  const toddlers = useMemo(() => {
    if (childAges.length > 0) {
      return childAges.filter((age) => age <= 5).length;
    }
    const raw = bookingDetails?.toddlers ?? bookingDetails?.toddlerCount ?? 0;
    const parsed = parseInt(raw, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  }, [childAges, bookingDetails]);

  const children = useMemo(() => {
    if (childAges.length > 0) {
      return childAges.filter((age) => age >= 6 && age <= 11).length;
    }
    const raw = bookingDetails?.childCount ?? bookingDetails?.children ?? 0;
    const parsed = parseInt(raw, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  }, [childAges, bookingDetails]);

  const teens = useMemo(() => {
    if (childAges.length > 0) {
      return childAges.filter((age) => age >= 12 && age <= 17).length;
    }
    return 0;
  }, [childAges]);

  const effectiveAdults = adultCount;
  const effectiveChildren = children;
  const effectiveToddlers = toddlers;
  const effectiveTeens = teens;

  const participants =
    effectiveAdults + effectiveChildren + effectiveToddlers + effectiveTeens;

  const selectedKidsActivity = useMemo(() => {
    const id = bookingDetails?.selectedKidsActivity;
    if (!id) return null;
    return KIDS_ACTIVITIES.find((act) => act.id === id) || null;
  }, [bookingDetails]);

  const kidsActivityAdultPrice = selectedKidsActivity
    ? Number(selectedKidsActivity.adultPrice) || 0
    : 0;
  const kidsActivityChildPrice = selectedKidsActivity
    ? Number(selectedKidsActivity.childPrice) || 0
    : 0;
  const kidsActivityToddlerPrice = selectedKidsActivity
    ? Number(selectedKidsActivity.toddlerPrice) || 0
    : 0;

  const kidsActivityAdultTotal = kidsActivityAdultPrice * effectiveAdults;
  const kidsActivityChildTotal = kidsActivityChildPrice * effectiveChildren;
  const kidsActivityToddlerTotal = kidsActivityToddlerPrice * effectiveToddlers;
  const kidsActivityTotal =
    kidsActivityAdultTotal + kidsActivityChildTotal + kidsActivityToddlerTotal;

  const kidsActivityFee = convertFromZar(kidsActivityTotal, currency);

  const selectedOptionId =
    bookingDetails?.selectedOption || bookingDetails?.optionId;
  const selectedOption = useMemo(() => {
    if (!selectedOptionId || !tour?.options) return null;
    return tour.options.find((opt) => opt.id === selectedOptionId) || null;
  }, [selectedOptionId, tour]);

  const adultPricing =
    tour?.pricing?.find((p) => p.category?.toLowerCase().startsWith("adult")) ||
    tour?.pricing?.[0];
  const adultBasePrice = Number(adultPricing?.pricePerPerson) || 0;
  let adultPrice = adultBasePrice;
  if (selectedOption && typeof selectedOption.pricePerPerson === "number") {
    adultPrice = selectedOption.pricePerPerson;
  }
  const adultPriceConverted = convertFromZar(adultPrice, currency);

  const teenPricing = tour?.pricing?.find((p) =>
    p.category?.toLowerCase().startsWith("teen"),
  );
  const teenBasePrice = Number(teenPricing?.pricePerPerson) || 0;
  const teenPriceConverted = convertFromZar(teenBasePrice, currency);

  const childPricing = tour?.pricing?.find((p) =>
    p.category?.toLowerCase().startsWith("child"),
  );
  const childBasePrice = Number(childPricing?.pricePerPerson) || 0;
  const childPriceConverted = convertFromZar(childBasePrice, currency);

  const toddlerPricing = tour?.pricing?.find((p) =>
    p.category?.toLowerCase().startsWith("toddler"),
  );
  const toddlerBasePrice = Number(toddlerPricing?.pricePerPerson) || 0;
  const toddlerPriceConverted = convertFromZar(toddlerBasePrice, currency);

  const adultOriginalSubtotal = effectiveAdults * adultPriceConverted;
  const teenOriginalSubtotal = effectiveTeens * teenPriceConverted;
  const childOriginalSubtotal = effectiveChildren * childPriceConverted;
  const toddlerOriginalSubtotal = effectiveToddlers * toddlerPriceConverted;
  const originalSubtotal =
    adultOriginalSubtotal +
    teenOriginalSubtotal +
    childOriginalSubtotal +
    toddlerOriginalSubtotal;

  let discountedSubtotal = originalSubtotal;
  let groupDiscountAmount = 0;
  let groupDiscountPercent = 0;
  let adultDiscountAmount = 0;
  let teenDiscountAmount = 0;
  let hasDiscount = false;
  let matchedGroupTier = null;
  let groupPricingType = null;

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
        return participants >= minPeople && participants <= maxPeople;
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
        const groupPersonPrice = Math.max(
          0,
          Number(matchedGroupTier.perPerson),
        );
        const groupPersonPriceConverted = convertFromZar(
          groupPersonPrice,
          currency,
        );

        const discountedAdultSubtotal =
          effectiveAdults * groupPersonPriceConverted;
        const discountedTeenSubtotal =
          effectiveTeens * groupPersonPriceConverted;

        discountedSubtotal =
          discountedAdultSubtotal +
          discountedTeenSubtotal +
          childOriginalSubtotal +
          toddlerOriginalSubtotal;

        adultDiscountAmount = Math.max(
          0,
          adultOriginalSubtotal - discountedAdultSubtotal,
        );
        teenDiscountAmount = Math.max(
          0,
          teenOriginalSubtotal - discountedTeenSubtotal,
        );
        groupDiscountAmount = adultDiscountAmount + teenDiscountAmount;

        const adultAndTeenOriginal =
          adultOriginalSubtotal + teenOriginalSubtotal;
        groupDiscountPercent =
          adultAndTeenOriginal > 0
            ? (groupDiscountAmount / adultAndTeenOriginal) * 100
            : 0;
        hasDiscount = groupDiscountAmount > 0;
      } else if (hasDiscountPercent) {
        groupPricingType = "discountPercent";
        const requestedDiscountPercent = Number(
          matchedGroupTier.discountPercent,
        );
        const safeDiscountPercent = Math.min(
          Math.max(requestedDiscountPercent, 0),
          100,
        );

        const adultDiscount =
          adultOriginalSubtotal * (safeDiscountPercent / 100);
        const discountedAdultSubtotal = adultOriginalSubtotal - adultDiscount;
        const teenDiscount = teenOriginalSubtotal * (safeDiscountPercent / 100);
        const discountedTeenSubtotal = teenOriginalSubtotal - teenDiscount;

        discountedSubtotal =
          discountedAdultSubtotal +
          discountedTeenSubtotal +
          childOriginalSubtotal +
          toddlerOriginalSubtotal;

        adultDiscountAmount = Math.max(0, adultDiscount);
        teenDiscountAmount = Math.max(0, teenDiscount);
        groupDiscountAmount = adultDiscountAmount + teenDiscountAmount;
        groupDiscountPercent = safeDiscountPercent;
        hasDiscount = groupDiscountAmount > 0;
      } else {
        discountedSubtotal = originalSubtotal;
        groupDiscountAmount = 0;
        groupDiscountPercent = 0;
        adultDiscountAmount = 0;
        teenDiscountAmount = 0;
        hasDiscount = false;
      }
    }
  }

  const extrasTotal = useMemo(() => {
    const selectedExtras = bookingDetails?.selectedExtras || {};
    const additionalPricing =
      bookingDetails?.additionalPricing || tour?.additionalPricing || [];

    if (!Array.isArray(additionalPricing) || additionalPricing.length === 0) {
      return 0;
    }

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

    return convertFromZar(total, currency);
  }, [bookingDetails, tour, currency]);

  const totalPrice = discountedSubtotal + extrasTotal + kidsActivityFee;

  const totalAmountLabel = formatMoney(totalPrice, currency);
  const totalMinorUnit = toMinorUnit(totalPrice, currency);

  // Paystack charges in ZAR; show the customer what they will actually pay.
  const zarEstimate =
    currency === "ZAR" ? null : totalPrice / (Number(FX_RATES[currency]) || 1);

  const breakdownItems = [
    {
      label: "Adults",
      count: effectiveAdults,
      perPerson: adultPriceConverted,
      originalSubtotal: adultOriginalSubtotal,
      discountAmount: adultDiscountAmount,
      discountedSubtotal: adultOriginalSubtotal - adultDiscountAmount,
    },
    {
      label: "Teens",
      count: effectiveTeens,
      perPerson: teenPriceConverted,
      originalSubtotal: teenOriginalSubtotal,
      discountAmount: teenDiscountAmount,
      discountedSubtotal: teenOriginalSubtotal - teenDiscountAmount,
    },
    {
      label: "Children",
      count: effectiveChildren,
      perPerson: childPriceConverted,
      originalSubtotal: childOriginalSubtotal,
      discountAmount: 0,
      discountedSubtotal: childOriginalSubtotal,
    },
    {
      label: "Toddlers",
      count: effectiveToddlers,
      perPerson: toddlerPriceConverted,
      originalSubtotal: toddlerOriginalSubtotal,
      discountAmount: 0,
      discountedSubtotal: toddlerOriginalSubtotal,
    },
  ].filter((item) => item.count > 0);

  const participantEmails = useMemo(() => {
    return normalizeEmails(
      bookingDetails?.ccParticipantEmails?.length
        ? bookingDetails.ccParticipantEmails
        : bookingDetails?.participantEmails,
    );
  }, [bookingDetails]);

  const ccParticipantEmails = useMemo(() => {
    return normalizeEmails(bookingDetails?.ccParticipantEmails);
  }, [bookingDetails]);

  const pickupDisplay =
    bookingDetails?.pickupLocation || bookingDetails?.pickup || "Not provided";

  const pickupCoordLabel = bookingDetails?.pickupCoords
    ? `${Number(bookingDetails.pickupCoords.lat).toFixed(6)}, ${Number(
        bookingDetails.pickupCoords.lng,
      ).toFixed(6)}`
    : "Not selected on map";

  const pickupTimeLabel = useMemo(() => {
    return getPickupTime(tour, bookingDetails);
  }, [tour, bookingDetails]);

  const checkoutStops = useMemo(() => {
    if (!Array.isArray(tour?.stops)) return [];

    return tour.stops
      .map((stop, index) => ({
        id: stop?.id || index + 1,
        name: stop?.name || stop?.title || `Stop ${index + 1}`,
        time: formatDisplayTime(stop?.time || ""),
        duration: stop?.duration || "",
      }))
      .filter((stop) => stop.name);
  }, [tour]);

  const displayedVehicles = useMemo(() => {
    return vehicles.slice(0, 3);
  }, []);

  const enrichedBookingDetails = useMemo(
    () => ({
      ...bookingDetails,
      participantEmails,
      ccParticipantEmails,
      pickupTimeLabel,
      pricingOptions: {
        ...bookingDetails?.pricingOptions,
        currency,
        adults: effectiveAdults,
        children: effectiveChildren,
        toddlers: effectiveToddlers,
        teens: effectiveTeens,
        adultPrice: adultPriceConverted,
        teenPrice: teenPriceConverted,
        childPrice: childPriceConverted,
        toddlerPrice: toddlerPriceConverted,
        participants,
        subtotalBeforeDiscount: originalSubtotal,
        groupDiscountPercent,
        groupDiscountAmount,
        discountedTourSubtotal: discountedSubtotal,
        extrasTotal,
        kidsActivityFee,
        totalPrice,
        totalMinorUnit,
        totalAmountLabel,
      },
    }),
    [
      bookingDetails,
      participantEmails,
      ccParticipantEmails,
      pickupTimeLabel,
      currency,
      effectiveAdults,
      effectiveChildren,
      effectiveToddlers,
      effectiveTeens,
      adultPriceConverted,
      teenPriceConverted,
      childPriceConverted,
      toddlerPriceConverted,
      participants,
      originalSubtotal,
      groupDiscountPercent,
      groupDiscountAmount,
      discountedSubtotal,
      extrasTotal,
      kidsActivityFee,
      totalPrice,
      totalMinorUnit,
      totalAmountLabel,
    ],
  );

  const pricingSummary = useMemo(
    () => ({
      currency,
      adults: effectiveAdults,
      children: effectiveChildren,
      toddlers: effectiveToddlers,
      teens: effectiveTeens,
      adultPrice: adultPriceConverted,
      teenPrice: teenPriceConverted,
      childPrice: childPriceConverted,
      toddlerPrice: toddlerPriceConverted,
      participants,
      subtotalBeforeDiscount: originalSubtotal,
      groupDiscountPercent,
      groupDiscountAmount,
      discountedTourSubtotal: discountedSubtotal,
      extrasTotal,
      kidsActivityFee,
      totalPrice,
      totalMinorUnit,
      totalAmountLabel,
    }),
    [
      currency,
      effectiveAdults,
      effectiveChildren,
      effectiveToddlers,
      effectiveTeens,
      adultPriceConverted,
      teenPriceConverted,
      childPriceConverted,
      toddlerPriceConverted,
      participants,
      originalSubtotal,
      groupDiscountPercent,
      groupDiscountAmount,
      discountedSubtotal,
      extrasTotal,
      kidsActivityFee,
      totalPrice,
      totalMinorUnit,
      totalAmountLabel,
    ],
  );

  // ─── Pre-flight token fetch ──────────────────────────────────────
  // If we don't already have a signed token (from Booking.jsx), grab
  // one now. Dev environments (Vite without the API) get "bypassed".
  useEffect(() => {
    if (!tour || !bookingDetails) return;
    if (verifiedPriceToken) return;
    if (verifyState === "bypassed") return;

    let cancelled = false;
    const controller = new AbortController();

    setVerifyState("pending");
    setVerifyError("");

    (async () => {
      try {
        const res = await fetch("/api/verify-price", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            tourId: tour.id ?? tour.slug,
            adultCount: effectiveAdults,
            childAges,
            currency,
            selectedOption: bookingDetails.selectedOption || null,
            selectedExtras: bookingDetails.selectedExtras || {},
            selectedKidsActivity: bookingDetails.selectedKidsActivity || null,
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
            "[CheckoutPaystack] /api/verify-price unavailable; proceeding without token.",
          );
          setVerifyState("bypassed");
          return;
        }

        if (!res.ok) {
          let detail = "";
          try {
            const j = await res.json();
            detail = j?.error || j?.message || "";
          } catch {
            /* body wasn't JSON */
          }
          throw new Error(detail || `HTTP ${res.status}`);
        }

        const data = await res.json();
        if (cancelled) return;

        setVerifiedPriceToken(data?.token || null);
        setVerifyState(data?.token ? "ready" : "bypassed");
      } catch (err) {
        if (cancelled || err.name === "AbortError") return;
        console.error("[CheckoutPaystack] verify-price failed:", err);
        setVerifyState("failed");
        setVerifyError(err?.message || "Could not verify price");
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [
    tour,
    bookingDetails,
    verifiedPriceToken,
    verifyState,
    effectiveAdults,
    childAges,
    currency,
  ]);

  // ─── Validation ──────────────────────────────────────────────────

  useEffect(() => {
    if (!tour || !bookingDetails) return;

    if (!Number.isFinite(totalMinorUnit) || totalMinorUnit < 1) {
      setCheckoutError("Invalid total amount. Check the tour price format.");
      setLoadingSession(false);
      return;
    }

    setCheckoutError("");
    setLoadingSession(false);
  }, [tour, bookingDetails, totalMinorUnit]);

  // ─── Loading / error states ──────────────────────────────────────

  if (!tour || !bookingDetails) return null;

  if (loadingSession) {
    return (
      <>
        <Seo title="Checkout | Cape Frontier Travel" path="/checkout" noindex />
        <div className="flex min-h-screen items-center justify-center bg-white px-6">
          <div className="text-center">
            <div className="relative mx-auto mb-6 h-16 w-16">
              <div className="absolute inset-0 rounded-full border border-[#071f4f]/10" />
              <div className="absolute inset-1 rounded-full border-4 border-transparent border-t-[#071f4f] animate-spin" />
              <div className="absolute inset-[1.35rem] rounded-full bg-[#071f4f]" />
            </div>

            <div className="font-frank text-xl text-slate-900 md:text-2xl">
              Securing checkout session
            </div>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Preparing secure Paystack checkout for {currency}.
            </p>

            <div className="mx-auto mt-6 flex w-fit items-center gap-1.5">
              <span className="h-2 w-2 animate-bounce rounded-full bg-[#071f4f] [animation-delay:-0.24s]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-[#071f4f] [animation-delay:-0.12s]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-[#071f4f]" />
            </div>
          </div>
        </div>
      </>
    );
  }

  if (checkoutError) {
    return (
      <>
        <Seo title="Checkout | Cape Frontier Travel" path="/checkout" noindex />
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-stone-50 px-6">
          <img
            src="/images/section2-bg.png"
            alt=""
            className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-10"
          />

          <div className="absolute inset-0 bg-gradient-to-br from-white/85 via-[#eef4ff]/85 to-[#e8f0fb]/92" />

          <div className="relative z-10 w-full max-w-xl rounded-[2rem] bg-white/95 p-8 text-center shadow-[0_20px_60px_rgba(7,31,79,0.08)]">
            <div className="font-frank text-2xl text-slate-800 md:text-3xl">
              Checkout could not start
            </div>

            <div className="mt-3 font-bitter text-slate-600">
              {checkoutError}
            </div>

            <button
              onClick={handleBackToBooking}
              className="mt-6 rounded-full bg-[#071f4f] px-6 py-3 font-frank text-white transition hover:bg-[#0b2d70]"
            >
              Back to booking
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Seo title="Checkout | Cape Frontier Travel" path="/checkout" noindex />
      <div
        ref={pageRef}
        className="relative min-h-screen overflow-x-hidden bg-[#eef7f6] text-slate-950"
      >
        <img
          src="/images/section2-bg.png"
          alt=""
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-10"
        />

        {showMobileBackTop && (
          <button
            type="button"
            onClick={handleScrollToTop}
            className="fixed left-1/2 top-3 z-[80] inline-flex -translate-x-1/2 items-center gap-2 rounded-full bg-[#071f4f] px-4 py-2 text-xs font-bold text-white shadow-[0_14px_34px_rgba(7,31,79,0.25)] transition hover:-translate-y-0.5 md:hidden"
          >
            <span aria-hidden="true">↑</span>
            Back to top
          </button>
        )}

        <div className="relative z-10 min-h-screen px-3 py-4 sm:px-5 sm:py-5 md:px-8 xl:px-16">
          <div className="mx-auto max-w-7xl">
            <div
              ref={heroRef}
              className="mb-5 flex items-center justify-between gap-4"
            >
              <button
                onClick={handleBackToBooking}
                className="inline-flex w-fit items-center gap-2 rounded-full bg-white/90 px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-[0_12px_30px_rgba(7,31,79,0.06)] transition hover:-translate-y-0.5 hover:bg-[#071f4f] hover:text-white"
              >
                <span aria-hidden="true">←</span>
                <span>Back to tour booking</span>
              </button>
            </div>

            <div
              ref={checkoutGridRef}
              className="grid overflow-visible gap-4 lg:grid-cols-[minmax(0,1.08fr)_minmax(360px,0.82fr)] lg:items-start lg:gap-6"
            >
              <section
                ref={leftRef}
                className="order-2 overflow-hidden rounded-[1.65rem] bg-white/92 shadow-[0_20px_60px_rgba(7,31,79,0.08)] lg:order-1 lg:rounded-[2rem]"
              >
                <div className="relative min-h-[190px] overflow-hidden bg-slate-900 sm:min-h-[230px] md:min-h-[290px]">
                  <img
                    src={resolveImage(tour.image)}
                    alt={tour.title || tour.info}
                    className="absolute inset-0 h-full w-full object-cover"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/86 via-slate-950/38 to-transparent" />

                  <div className="absolute bottom-0 left-0 right-0 p-5 text-white md:p-7">
                    <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/75">
                      Checkout summary
                    </p>

                    <h1 className="mt-2 max-w-3xl font-frank text-3xl font-bold leading-[0.9] sm:text-4xl md:text-5xl">
                      {tour.title || tour.info}
                    </h1>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {tour.duration && <InfoPill>{tour.duration}</InfoPill>}
                      {tour.location && <InfoPill>{tour.location}</InfoPill>}
                      <InfoPill tone="green">
                        {effectiveAdults} adult
                        {effectiveAdults !== 1 ? "s" : ""}
                        {effectiveTeens > 0 &&
                          ` · ${effectiveTeens} teen${effectiveTeens !== 1 ? "s" : ""}`}
                        {effectiveChildren > 0 &&
                          ` · ${effectiveChildren} child${effectiveChildren !== 1 ? "ren" : ""}`}
                        {effectiveToddlers > 0 &&
                          ` · ${effectiveToddlers} toddler${effectiveToddlers !== 1 ? "s" : ""}`}
                      </InfoPill>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 p-4 md:p-6 lg:p-7">
                  {/* Pickup + main participant (moved from payment panel) */}
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="flex items-center gap-3 rounded-[1.35rem] border border-[#071f4f]/10 bg-[#f7faff] p-4">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#071f4f]/10">
                        <svg
                          className="h-5 w-5 text-[#071f4f]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </span>

                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                          Pickup
                        </p>
                        <p className="text-sm font-bold leading-5 text-slate-900">
                          {pickupTimeLabel}
                        </p>
                        <p className="text-xs text-slate-500">
                          {bookingDetails.date || "Date TBC"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 rounded-[1.35rem] border border-[#071f4f]/10 bg-[#f7faff] p-4">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#071f4f]/10">
                        <svg
                          className="h-5 w-5 text-[#071f4f]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </span>

                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                          Main participant
                        </p>
                        <p className="truncate text-sm font-bold leading-5 text-slate-900">
                          {bookingDetails.fullName || "Not provided"}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                          {bookingDetails.email || "No email"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {Object.values(openPanels).some(Boolean) && (
                    <div className="rounded-2xl border border-green-200 bg-green-50 p-3 text-center text-xs font-bold leading-5 text-green-900 sm:hidden">
                      Details open underneath the menu. Choose a card, then
                      scroll down to view it.
                    </div>
                  )}

                  <div
                    ref={infoMenuRef}
                    className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4"
                  >
                    <RevealButton
                      active={openPanels.trip}
                      title="Trip details"
                      detail="Pickup, booking tags"
                      onClick={() => togglePanel("trip")}
                    />
                    <RevealButton
                      active={openPanels.vehicles}
                      title="Vehicles"
                      detail="Confirmed later"
                      onClick={() => togglePanel("vehicles")}
                    />
                    <RevealButton
                      active={openPanels.summary}
                      title="Summary"
                      detail="Total and CS brief"
                      onClick={() => togglePanel("summary")}
                    />
                    <RevealButton
                      active={openPanels.policies}
                      title="Policies"
                      detail="Refunds and rules"
                      onClick={() => togglePanel("policies")}
                    />
                  </div>

                  <RevealPanel open={openPanels.trip}>
                    <div className="grid gap-4 lg:grid-cols-[1fr]">
                      <div className="rounded-[1.5rem] bg-stone-50 p-5">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm">
                              <img
                                src="/icons/mapPin.png"
                                className="h-5 w-5 object-contain"
                                alt=""
                              />
                            </span>
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                              Trip and pickup
                            </p>
                          </div>

                          <InfoPill tone="green">
                            {bookingDetails.date || "Date not selected"}
                          </InfoPill>
                        </div>

                        <p className="mt-3 text-sm font-bold leading-6 text-slate-900">
                          {pickupDisplay}
                        </p>

                        <p className="mt-2 text-xs leading-5 text-slate-500">
                          Coordinates: {pickupCoordLabel}
                        </p>

                        {checkoutStops.length > 0 && (
                          <div className="mt-4 rounded-2xl bg-white/82 p-3">
                            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                              Route stops
                            </p>

                            <div className="mt-3 grid gap-2">
                              {checkoutStops.map((stop, index) => (
                                <div
                                  key={`${stop.id}-${stop.name}-${index}`}
                                  className="grid grid-cols-[auto_1fr] gap-3 rounded-xl border border-black/5 bg-white p-2.5"
                                >
                                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#eef4ff] text-[11px] font-bold text-[#071f4f]">
                                    {index + 1}
                                  </span>

                                  <div className="min-w-0">
                                    <p className="truncate text-xs font-bold text-slate-900">
                                      {stop.name}
                                    </p>

                                    {(stop.time || stop.duration) && (
                                      <p className="mt-0.5 text-[11px] font-semibold text-slate-500">
                                        {[stop.time, stop.duration]
                                          .filter(Boolean)
                                          .join(" · ")}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <p className="mt-3 rounded-2xl bg-white/80 p-3 text-xs leading-5 text-slate-500">
                          Pickup is included unless stated otherwise. Cape
                          Frontier confirms the final pickup point, vehicle
                          details, and operational timing manually after
                          payment.
                        </p>
                      </div>
                    </div>
                  </RevealPanel>

                  <RevealPanel open={openPanels.vehicles}>
                    <div className="rounded-[1.5rem] bg-white p-5 shadow-[0_14px_34px_rgba(7,31,79,0.05)]">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                            Possible vehicle options
                          </p>

                          <h3 className="mt-2 font-frank text-3xl font-bold leading-none text-[#071f4f]">
                            Vehicle confirmed after purchase.
                          </h3>

                          <p className="mt-2 max-w-2xl text-xs leading-5 text-slate-500">
                            Customers do not choose a vehicle at checkout. Cape
                            Frontier confirms the most suitable vehicle after
                            payment based on group size, route, luggage,
                            availability, and operational planning.
                          </p>
                        </div>

                        <InfoPill tone="blue">Operational allocation</InfoPill>
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {displayedVehicles.map((vehicle) => (
                          <VehicleOptionCard
                            key={vehicle.id}
                            vehicle={vehicle}
                          />
                        ))}
                      </div>
                    </div>
                  </RevealPanel>

                  <RevealPanel open={openPanels.summary}>
                    <div className="grid gap-4 lg:grid-cols-[1fr]">
                      <div className="rounded-[1.5rem] bg-white p-5 shadow-[0_14px_34px_rgba(7,31,79,0.05)]">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                          Checkout summary
                        </p>

                        <div className="mt-4 space-y-3">
                          {breakdownItems.map((item) => {
                            const displayOriginal = formatMoney(
                              item.originalSubtotal,
                              currency,
                            );
                            const displayDiscounted = formatMoney(
                              item.discountedSubtotal,
                              currency,
                            );
                            const hasItemDiscount = item.discountAmount > 0;

                            return (
                              <div
                                key={item.label}
                                className="flex items-start justify-between gap-4 text-sm"
                              >
                                <span className="text-slate-500">
                                  {item.label}{" "}
                                  <span className="text-slate-400">
                                    ({item.count} ×{" "}
                                    {formatMoney(item.perPerson, currency)})
                                  </span>
                                </span>
                                <span className="font-semibold text-slate-900 text-right">
                                  {hasItemDiscount ? (
                                    <>
                                      <span className="text-red-500 line-through mr-2">
                                        {displayOriginal}
                                      </span>
                                      <span className="text-green-700">
                                        {displayDiscounted}
                                      </span>
                                    </>
                                  ) : (
                                    displayOriginal
                                  )}
                                </span>
                              </div>
                            );
                          })}

                          <SummaryRow
                            label="Tour subtotal"
                            value={
                              hasDiscount ? (
                                <>
                                  <span className="text-red-500 line-through mr-2">
                                    {formatMoney(originalSubtotal, currency)}
                                  </span>
                                  <span className="text-green-700">
                                    {formatMoney(discountedSubtotal, currency)}
                                  </span>
                                </>
                              ) : (
                                formatMoney(originalSubtotal, currency)
                              )
                            }
                            strong
                          />

                          {hasDiscount && groupDiscountAmount > 0 && (
                            <div className="flex items-start justify-between gap-4 text-sm">
                              <span className="text-slate-500">
                                Group discount (
                                {groupPricingType === "perPerson"
                                  ? "per‑person rate"
                                  : `${groupDiscountPercent.toFixed(0)}% off`}
                                )
                              </span>
                              <span className="font-semibold text-green-700">
                                -{formatMoney(groupDiscountAmount, currency)}
                              </span>
                            </div>
                          )}

                          {selectedKidsActivity && kidsActivityFee > 0 && (
                            <div className="mt-2 rounded-xl border border-blue-100 bg-blue-50 p-3">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-blue-500">
                                    Kids activity
                                  </p>
                                  <p className="mt-1 text-sm font-bold text-blue-950">
                                    {selectedKidsActivity.name}
                                  </p>
                                  <div className="mt-1 space-y-0.5 text-xs text-blue-700">
                                    {effectiveAdults > 0 && (
                                      <p>
                                        {effectiveAdults} ×{" "}
                                        {formatMoney(
                                          kidsActivityAdultPrice,
                                          currency,
                                        )}{" "}
                                        ={" "}
                                        {formatMoney(
                                          kidsActivityAdultTotal,
                                          currency,
                                        )}
                                      </p>
                                    )}
                                    {effectiveChildren > 0 && (
                                      <p>
                                        {effectiveChildren} ×{" "}
                                        {formatMoney(
                                          kidsActivityChildPrice,
                                          currency,
                                        )}{" "}
                                        ={" "}
                                        {formatMoney(
                                          kidsActivityChildTotal,
                                          currency,
                                        )}
                                      </p>
                                    )}
                                    {effectiveToddlers > 0 && (
                                      <p>
                                        {effectiveToddlers} ×{" "}
                                        {formatMoney(
                                          kidsActivityToddlerPrice,
                                          currency,
                                        )}{" "}
                                        ={" "}
                                        {formatMoney(
                                          kidsActivityToddlerTotal,
                                          currency,
                                        )}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <span className="text-sm font-black text-blue-700">
                                  + {formatMoney(kidsActivityFee, currency)}
                                </span>
                              </div>
                            </div>
                          )}

                          {(() => {
                            const selectedExtras =
                              bookingDetails?.selectedExtras || {};
                            const additionalPricing =
                              bookingDetails?.additionalPricing ||
                              tour?.additionalPricing ||
                              [];
                            const requestExtras = additionalPricing
                              .filter((extra) => extra.type === "request")
                              .filter((extra) => {
                                const val = selectedExtras[extra.category];
                                return (
                                  val !== undefined &&
                                  val !== null &&
                                  val !== false
                                );
                              })
                              .map((extra) => extra.category);

                            if (requestExtras.length === 0) return null;
                            return (
                              <SummaryRow
                                label="Requested extras"
                                value={requestExtras.join(", ")}
                              />
                            );
                          })()}
                        </div>

                        {hasDiscount && groupDiscountAmount > 0 && (
                          <div className="mt-4 rounded-[1.35rem] border border-green-200 bg-green-50 p-4">
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-green-700">
                              Group saving
                            </p>

                            <div className="mt-1 font-frank text-2xl font-bold leading-none text-green-950">
                              {formatMoney(groupDiscountAmount, currency)} saved
                            </div>

                            <p className="mt-1 text-xs font-semibold text-green-900/70">
                              {groupDiscountPercent.toFixed(1)}% discount for{" "}
                              {participants} guest
                              {participants !== 1 ? "s" : ""}
                            </p>
                          </div>
                        )}

                        <div className="mt-4 rounded-[1.35rem] bg-[#071f4f] p-4 text-white">
                          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">
                            Total due
                          </p>

                          <div className="mt-1 font-frank text-3xl font-bold leading-none">
                            {totalAmountLabel}
                          </div>

                          <p className="mt-1 text-xs font-semibold text-white/55">
                            {effectiveAdults} adult
                            {effectiveAdults !== 1 ? "s" : ""}
                            {effectiveTeens > 0 &&
                              ` · ${effectiveTeens} teen${effectiveTeens !== 1 ? "s" : ""}`}
                            {effectiveChildren > 0 &&
                              ` · ${effectiveChildren} child${effectiveChildren !== 1 ? "ren" : ""}`}
                            {effectiveToddlers > 0 &&
                              ` · ${effectiveToddlers} toddler${effectiveToddlers !== 1 ? "s" : ""}`}
                            {" · "}
                            {currency}
                          </p>
                        </div>
                      </div>
                    </div>
                  </RevealPanel>

                  <RevealPanel open={openPanels.policies}>
                    <div className="mb-4 flex justify-center">
                      <button
                        type="button"
                        className="inline-flex items-center gap-2 rounded-full border border-[#071f4f]/10 bg-white px-4 py-2 text-xs font-bold text-[#071f4f] shadow-[0_10px_24px_rgba(7,31,79,0.06)]"
                        aria-label="Policy information"
                      >
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#071f4f] text-[11px] text-white">
                          i
                        </span>
                        Policy information
                      </button>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      <PolicyNote
                        title="Booking policy reminder"
                        image={POLICY_IMAGES.booking}
                      >
                        Lower per-person rates apply only when the selected
                        participant count is booked and paid for in full.
                      </PolicyNote>

                      <PolicyNote
                        title="Cancellation reminder"
                        image={POLICY_IMAGES.cancellation}
                      >
                        Cancellation within 24 hours after booking allows a full
                        refund. 2–3 days before trip has a 20% penalty. Within
                        24 hours before the trip has no refund.
                      </PolicyNote>

                      <PolicyNote
                        title="Weather policy"
                        image={POLICY_IMAGES.weather}
                      >
                        Weather-related cancellations may allow a refund or
                        reschedule, depending on availability.
                      </PolicyNote>
                    </div>
                  </RevealPanel>
                </div>
              </section>

              <div
                ref={rightColumnRef}
                className="order-1 relative min-h-[1px] w-full self-start lg:order-2"
              >
                <div ref={rightPinRef} className="relative h-fit w-full">
                  <aside
                    ref={rightRef}
                    onWheel={handlePaymentPanelWheel}
                    className="h-fit max-h-[calc(100svh-1rem)] overflow-visible rounded-[1.65rem] border border-white/75 bg-white/95 shadow-[0_20px_56px_rgba(7,31,79,0.085)] backdrop-blur-xl lg:rounded-[2rem]"
                  >
                    <div className="flex flex-col items-center justify-center gap-3 border-b border-slate-100/90 px-4 py-3 sm:px-5 sm:py-4">
                      <img
                        src="/icons/paystack-logo.svg"
                        alt="Paystack"
                        className="h-8 shrink-0"
                        loading="lazy"
                      />

                      <p className="px-2 text-center text-[11px] font-semibold leading-5 text-slate-400">
                        You will return here after Paystack verifies the
                        payment.
                      </p>
                    </div>

                    <div
                      onPointerDown={() => setPaymentCompact(true)}
                      onMouseEnter={() => setPaymentCompact(true)}
                      onFocusCapture={() => setPaymentCompact(true)}
                      className="space-y-3 overflow-visible p-3 pb-5 sm:p-4 sm:pb-6 md:p-5 md:pb-7"
                    >
                      <CheckoutForm
                        totalAmountLabel={totalAmountLabel}
                        currency={currency}
                        tour={tour}
                        bookingDetails={enrichedBookingDetails}
                        notes={notes}
                        pricingSummary={pricingSummary}
                        checkoutStops={checkoutStops}
                        priceToken={verifiedPriceToken}
                        verifyState={verifyState}
                        verifyError={verifyError}
                        zarEstimate={zarEstimate}
                      />

                      <AcceptedPayments />
                    </div>
                  </aside>

                  <ThreeDSNotice />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CheckoutPaystack;
