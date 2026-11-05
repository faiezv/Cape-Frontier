import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { resolveImage } from "../../utils/ImageLoader";
import { getPriceLabel, hasGroupDeal } from "../../utils/tourHelpers";

const FALLBACK_IMG = "/images/content/random/1.webp";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getItemText = (item) => {
  if (!item) return "";
  return typeof item === "string" ? item : item.text || item.name || item.title || "";
};

const toList = (value) =>
  (Array.isArray(value) ? value : []).map(getItemText).filter(Boolean);

// "wine-routes" → "Wine routes", "multi_day" → "Multi day"
const formatLabel = (value) => {
  if (!value || typeof value !== "string") return "";
  const spaced = value.replace(/[-_]+/g, " ").trim().toLowerCase();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
};

const getRating = (tour) => {
  const n = Number(tour?.rating ?? tour?.stars);
  return Number.isFinite(n) && n > 0 ? n : null;
};

const getReviewCount = (tour) => {
  const n = Number(
    Array.isArray(tour?.otherReviews)
      ? tour.otherReviews.length
      : tour?.otherReviews,
  );
  return Number.isFinite(n) && n > 0 ? n : null;
};

const hasPickup = (tour) =>
  Array.isArray(tour?.pickupOptions) && tour.pickupOptions.length > 0;

// ─── Tour reference validation ───────────────────────────────────────────────
// Reviews are only accepted with a valid tour reference: "TOUR-" followed by
// exactly TOUR_REF_LENGTH letters/numbers (case-insensitive), e.g. TOUR-1A3B5C7D.
// NOTE: your example "TOUR-1A3B5C7d8" has 9 characters after the dash. If your
// real references are 9 long, change TOUR_REF_LENGTH to 9.
export const TOUR_REF_LENGTH = 8;
const TOUR_REF_PATTERN = new RegExp(`^TOUR-[A-Z0-9]{${TOUR_REF_LENGTH}}$`, "i");

export const normalizeTourReference = (value = "") =>
  String(value).replace(/\s+/g, "").toUpperCase();

export const isValidTourReference = (value) =>
  TOUR_REF_PATTERN.test(normalizeTourReference(value));

const REVIEW_API_URL = "/api/reviews";

// ─── Likes (saved in this browser, shared between card + quick view) ─────────

const LIKES_KEY = "cf-liked-tours";
const likeListeners = new Set();

const readLikes = () => {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(LIKES_KEY));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeLikes = (list) => {
  try {
    window.localStorage.setItem(LIKES_KEY, JSON.stringify(list));
  } catch {
    /* storage unavailable (private mode etc.) – still update in-memory listeners */
  }
  likeListeners.forEach((fn) => fn(list));
};

const getLikeKey = (tour) => String(tour?.id ?? tour?.slug ?? tour?.title ?? "");

function useTourLike(tour) {
  const key = getLikeKey(tour);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    setLiked(readLikes().includes(key));
    const listener = (list) => setLiked(list.includes(key));
    likeListeners.add(listener);
    return () => likeListeners.delete(listener);
  }, [key]);

  const toggle = (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    const current = readLikes();
    writeLikes(
      current.includes(key) ? current.filter((k) => k !== key) : [...current, key],
    );
  };

  return [liked, toggle];
}

// ─── Icons ───────────────────────────────────────────────────────────────────

const iconProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
};

const PinIcon = ({ className = "h-3.5 w-3.5" }) => (
  <svg {...iconProps} className={className}>
    <path d="M12 21s7-4.4 7-11a7 7 0 1 0-14 0c0 6.6 7 11 7 11Z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
);

const ClockIcon = ({ className = "h-3.5 w-3.5" }) => (
  <svg {...iconProps} className={className}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

const UsersIcon = ({ className = "h-3.5 w-3.5" }) => (
  <svg {...iconProps} className={className}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const CarIcon = ({ className = "h-3.5 w-3.5" }) => (
  <svg {...iconProps} className={className}>
    <path d="M5 17h14M6 17l1.5-6h9L18 17M7 17v2M17 17v2" />
    <circle cx="8" cy="14" r="0.6" />
    <circle cx="16" cy="14" r="0.6" />
  </svg>
);

const CheckIcon = ({ className = "h-3 w-3" }) => (
  <svg {...iconProps} strokeWidth={3} className={className}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

const StarIcon = ({ className = "h-3.5 w-3.5" }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
    <path d="m12 2 3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2Z" />
  </svg>
);

const HeartIcon = ({ filled = false, className = "h-[18px] w-[18px]" }) => (
  <svg
    viewBox="0 0 24 24"
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className={className}
  >
    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8Z" />
  </svg>
);

const ArrowIcon = ({ className = "h-3.5 w-3.5" }) => (
  <svg {...iconProps} strokeWidth={2.5} className={className}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

// ─── Chip (used by the filter panel) ─────────────────────────────────────────

export function Chip({ active, onClick, children, count }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition active:scale-95 ${
        active
          ? "border-blue-600 bg-blue-600 text-white shadow-sm"
          : "border-neutral-200 bg-white text-neutral-700 hover:border-blue-300 hover:bg-blue-50"
      }`}
    >
      {children}
      {count !== undefined && (
        <span
          className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
            active
              ? "bg-white/25 text-white"
              : "bg-neutral-100 text-neutral-500"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

// ─── Review modal ────────────────────────────────────────────────────────────

function ReviewModal({ tour, onClose, onSubmitReview }) {
  const [reference, setReference] = useState("");
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [text, setText] = useState("");
  const [touched, setTouched] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | submitting | success | error
  const [error, setError] = useState("");

  const refValid = isValidTourReference(reference);
  const textValid = text.trim().length >= 20;
  const canSubmit =
    refValid && name.trim() && rating > 0 && textValid && status !== "submitting";

  // Lock page scroll + Escape to close
  useEffect(() => {
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
  }, [onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched(true);
    if (!canSubmit) return;

    setStatus("submitting");
    setError("");

    // Only a valid, normalised reference ever leaves this component.
    const payload = {
      tourReference: normalizeTourReference(reference),
      tourId: tour.id ?? null,
      tourSlug: tour.slug ?? null,
      tourTitle: tour.title,
      name: name.trim(),
      country: country.trim() || null,
      rating,
      review: text.trim(),
    };

    try {
      if (onSubmitReview) {
        await onSubmitReview(payload);
      } else {
        const res = await fetch(REVIEW_API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data?.error || "Could not send your review. Please try again.");
        }
      }
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setError(err?.message || "Could not send your review. Please try again.");
    }
  };

  const inputClass =
    "w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-base outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 sm:text-sm";
  const labelClass =
    "mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-neutral-500";

  return createPortal(
    <div
      className="fixed inset-0 z-[100001] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={`Leave a review for ${tour.title}`}
    >
      <div
        data-lenis-prevent
        className="relative max-h-[92dvh] w-full max-w-lg overflow-y-auto overscroll-contain rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl sm:p-8"
        style={{ animation: "tourQvIn 0.3s cubic-bezier(0.16,1,0.3,1) both" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close review form"
          className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full bg-neutral-100 text-lg font-bold text-neutral-700 transition hover:bg-neutral-200 active:scale-95"
        >
          ✕
        </button>

        {status === "success" ? (
          <div className="py-6 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-700">
              <CheckIcon className="h-7 w-7" />
            </div>
            <h3 className="mt-4 font-frank text-2xl font-bold text-neutral-950">
              Thank you!
            </h3>
            <p className="mt-2 font-bitter text-sm leading-relaxed text-neutral-600">
              Your review has been sent. Once your tour reference is verified it
              will be published on the Cape Frontier website.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 rounded-full bg-blue-600 px-8 py-3 text-sm font-bold text-white transition hover:bg-blue-700 active:scale-95"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div className="pr-10">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-blue-600">
                Leave a review
              </p>
              <h3 className="mt-1 font-frank text-2xl font-bold leading-tight text-neutral-950">
                {tour.title}
              </h3>
            </div>

            {/* Tour reference — required */}
            <div>
              <label htmlFor="review-ref" className={labelClass}>
                Tour reference *
              </label>
              <input
                id="review-ref"
                type="text"
                inputMode="text"
                autoCapitalize="characters"
                autoComplete="off"
                spellCheck={false}
                maxLength={5 + TOUR_REF_LENGTH}
                value={reference}
                onChange={(e) => setReference(normalizeTourReference(e.target.value))}
                placeholder={`TOUR-${"1A3B5C7D9E".slice(0, TOUR_REF_LENGTH)}`}
                aria-invalid={touched && !refValid}
                className={`${inputClass} font-mono tracking-wider ${
                  reference && !refValid
                    ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                    : refValid
                      ? "border-green-400 focus:border-green-500 focus:ring-green-100"
                      : ""
                }`}
              />
              {refValid ? (
                <p className="mt-1.5 flex items-center gap-1 text-xs font-semibold text-green-700">
                  <CheckIcon className="h-3 w-3" /> Reference format looks good
                </p>
              ) : (
                <p
                  className={`mt-1.5 text-xs ${
                    touched ? "font-semibold text-red-600" : "text-neutral-500"
                  }`}
                >
                  Enter the reference from your booking: “TOUR-” followed by{" "}
                  {TOUR_REF_LENGTH} letters/numbers. Reviews without a valid
                  reference are not published.
                </p>
              )}
            </div>

            {/* Star rating */}
            <div>
              <span className={labelClass}>Your rating *</span>
              <div
                className="flex gap-1"
                onMouseLeave={() => setHoverRating(0)}
                role="radiogroup"
                aria-label="Rating"
              >
                {[1, 2, 3, 4, 5].map((n) => {
                  const on = n <= (hoverRating || rating);
                  return (
                    <button
                      key={n}
                      type="button"
                      role="radio"
                      aria-checked={rating === n}
                      aria-label={`${n} star${n > 1 ? "s" : ""}`}
                      onClick={() => setRating(n)}
                      onMouseEnter={() => setHoverRating(n)}
                      className={`rounded-lg p-1 transition active:scale-90 ${
                        on ? "text-amber-400" : "text-neutral-300"
                      }`}
                    >
                      <StarIcon className="h-8 w-8" />
                    </button>
                  );
                })}
              </div>
              {touched && rating === 0 && (
                <p className="mt-1 text-xs font-semibold text-red-600">
                  Please choose a rating.
                </p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="review-name" className={labelClass}>
                  Your name *
                </label>
                <input
                  id="review-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  className={inputClass}
                />
                {touched && !name.trim() && (
                  <p className="mt-1 text-xs font-semibold text-red-600">
                    Please enter your name.
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="review-country" className={labelClass}>
                  Country
                </label>
                <input
                  id="review-country"
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  autoComplete="country-name"
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label htmlFor="review-text" className={labelClass}>
                Your review *
              </label>
              <textarea
                id="review-text"
                rows={4}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Tell other travellers about your experience…"
                className={`${inputClass} resize-none`}
              />
              <p
                className={`mt-1 text-xs ${
                  touched && !textValid
                    ? "font-semibold text-red-600"
                    : "text-neutral-500"
                }`}
              >
                {textValid
                  ? "Thanks, that's plenty."
                  : `At least 20 characters (${text.trim().length}/20).`}
              </p>
            </div>

            {status === "error" && (
              <p
                role="alert"
                className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={status === "submitting"}
              className={`w-full rounded-full px-6 py-3.5 text-sm font-bold text-white shadow-md transition active:scale-95 ${
                canSubmit
                  ? "bg-blue-600 shadow-blue-600/20 hover:bg-blue-700"
                  : "cursor-not-allowed bg-neutral-300 shadow-none"
              }`}
            >
              {status === "submitting" ? "Sending…" : "Send review"}
            </button>
          </form>
        )}
      </div>
    </div>,
    document.body,
  );
}

// ─── Grid card ───────────────────────────────────────────────────────────────

export function TourCard({ tour, onOpen, onSubmitReview }) {
  const { amount, note } = getPriceLabel(tour);

  const rating = getRating(tour);
  const reviewCount = getReviewCount(tour);

  const [liked, toggleLike] = useTourLike(tour);
  const [reviewOpen, setReviewOpen] = useState(false);

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-3xl border border-neutral-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-900/10">
      {/* ── Image ───────────────────────────────────────────── */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-100">
        <img
          src={resolveImage(tour.image)}
          alt={tour.title}
          loading="lazy"
          className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
          onError={(e) => {
            e.currentTarget.src = FALLBACK_IMG;
          }}
        />

        {/* Bottom gradient for legibility */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-black/20"
        />

        {/* Duration pill (only overlay on the image) */}
        {tour.duration && (
          <span className="absolute bottom-3 right-3 inline-flex max-w-[80%] items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-neutral-800 shadow-sm backdrop-blur">
            <ClockIcon className="h-3 w-3 shrink-0 text-blue-600" />
            <span className="truncate">{tour.duration}</span>
          </span>
        )}

        {/* Like (heart) */}
        <button
          type="button"
          onClick={toggleLike}
          aria-pressed={liked}
          aria-label={liked ? `Unlike ${tour.title}` : `Like ${tour.title}`}
          className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 shadow-md backdrop-blur transition hover:scale-110 active:scale-90"
        >
          <HeartIcon
            filled={liked}
            className={`h-5 w-5 transition ${liked ? "text-red-500" : "text-neutral-600"}`}
          />
        </button>
      </div>

      {/* ── Body ────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        {(tour.location || rating) && (
          <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-semibold text-neutral-500">
            {tour.location && (
              <span className="inline-flex min-w-0 items-center gap-1">
                <PinIcon className="h-3.5 w-3.5 shrink-0 text-blue-600" />
                <span className="truncate">{tour.location}</span>
              </span>
            )}
            {rating && (
              <span className="inline-flex items-center gap-1 text-neutral-700">
                <StarIcon className="h-3.5 w-3.5 text-amber-500" />
                {rating.toFixed(1)}
                {reviewCount && (
                  <span className="font-medium text-neutral-400">
                    ({reviewCount})
                  </span>
                )}
              </span>
            )}
          </div>
        )}

        <h3 className="line-clamp-2 font-frank text-xl font-bold leading-snug text-neutral-950 transition-colors group-hover:text-blue-700 sm:text-2xl">
          {tour.title}
        </h3>

        {/* ── Footer: single price + CTA ───────────────────── */}
        <div className="mt-auto pt-5">
          <div className="flex items-center justify-between gap-3 border-t border-dashed border-neutral-200 pt-4">
            <div className="min-w-0">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                From
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="font-frank text-2xl font-bold leading-none text-neutral-950">
                  R{Number(amount).toLocaleString()}
                </span>
                {note && (
                  <span className="truncate text-[11px] font-medium text-neutral-500">
                    {note}
                  </span>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => onOpen(tour)}
              aria-label={`See details for ${tour.title}`}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white px-4 py-2.5 text-xs font-bold text-blue-700 shadow-sm ring-1 ring-neutral-200 transition hover:bg-blue-600 hover:text-white hover:ring-blue-600 hover:shadow-md hover:shadow-blue-600/20 after:absolute after:inset-0 after:content-[''] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              See details
              <ArrowIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setReviewOpen(true);
            }}
            className="relative z-10 mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 transition hover:text-blue-700"
          >
            <StarIcon className="h-3.5 w-3.5 text-amber-500" />
            Been on this tour? Leave a review
          </button>
        </div>
      </div>

      {reviewOpen && (
        <ReviewModal
          tour={tour}
          onClose={() => setReviewOpen(false)}
          onSubmitReview={onSubmitReview}
        />
      )}
    </article>
  );
}

// ─── Quick view (mini details) ───────────────────────────────────────────────

export function TourQuickView({ tour, onClose, onBook, onSubmitReview }) {
  const { amount, note } = getPriceLabel(tour);

  const rating = getRating(tour);
  const reviewCount = getReviewCount(tour);
  const typeLabel = formatLabel(tour.type);

  const highlights = toList(tour.highlights).slice(0, 4);

  const included = toList(tour.included);
  const shownIncluded = included.slice(0, 6);
  const moreIncluded = included.length - shownIncluded.length;

  // Quick facts (only shows the ones this tour actually has)
  const facts = [
    tour.duration && { icon: <ClockIcon className="h-4 w-4" />, label: "Duration", value: tour.duration },
    tour.location && { icon: <PinIcon className="h-4 w-4" />, label: "Location", value: tour.location },
    tour.arrangements?.operatingTime && {
      icon: <ClockIcon className="h-4 w-4" />,
      label: "Operating time",
      value: tour.arrangements.operatingTime,
    },
    Number(tour.minPeople) > 1 && {
      icon: <UsersIcon className="h-4 w-4" />,
      label: "Minimum group",
      value: `${Number(tour.minPeople)} people`,
    },
    hasPickup(tour) && {
      icon: <CarIcon className="h-4 w-4" />,
      label: "Pickup",
      value: "Available",
    },
  ].filter(Boolean);

  // ── Gallery Logic ────────────────────────────────────────────────────────
  const galleryImages = useMemo(() => {
    const imgs = [tour.image, ...(tour.images || [])].filter(Boolean);
    if (tour.stops) {
      tour.stops.forEach((s) => {
        if (s.images && s.images.length) imgs.push(...s.images);
      });
    }
    return [...new Set(imgs)].slice(0, 6); // Ensure unique, limit to 6
  }, [tour]);

  const [activeImage, setActiveImage] = useState(galleryImages[0] || FALLBACK_IMG);
  const [liked, toggleLike] = useTourLike(tour);
  const [reviewOpen, setReviewOpen] = useState(false);

  // Lock page scroll + Escape to close
  useEffect(() => {
    const html = document.documentElement.style.overflow;
    const body = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    window.lenis?.stop?.();
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      // The review form (if open) handles its own Escape first.
      if (document.querySelector('[aria-label^="Leave a review for"]')) return;
      onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = html;
      document.body.style.overflow = body;
      window.lenis?.start?.();
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  if (typeof document === "undefined") return null;

  // Rendered into <body> with a z-index above the navbar (z-[9990]) so the
  // popup — and its close button — is never covered.
  return createPortal(
    <div
      className="fixed inset-0 z-[100000] flex items-end justify-center bg-black/60 px-0 pt-[max(2.5rem,env(safe-area-inset-top))] backdrop-blur-sm sm:items-center sm:px-4 sm:pb-8 sm:pt-16"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={tour.title}
    >
      <div
        className="relative flex max-h-[95dvh] w-full max-w-5xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:max-h-[85dvh] sm:flex-row sm:rounded-3xl"
        style={{ animation: "tourQvIn 0.32s cubic-bezier(0.16,1,0.3,1) both" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button (Absolute to Modal) */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close details"
          className="absolute right-3 top-3 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-white text-lg font-bold text-neutral-800 shadow-lg ring-1 ring-black/10 transition hover:bg-neutral-100 active:scale-95 sm:right-4 sm:top-4 sm:h-10 sm:w-10"
        >
          ✕
        </button>

        {/* ── LEFT COLUMN: IMAGE & GALLERY ─────────────────────────── */}
        <div className="relative flex w-full shrink-0 flex-col bg-neutral-100 sm:w-[45%] lg:w-1/2">
          {/* Main Image */}
          <div className="relative h-64 w-full sm:h-80 md:h-96 lg:h-full lg:min-h-[500px]">
            <img
              src={resolveImage(activeImage)}
              alt={tour.title}
              className="absolute inset-0 h-full w-full object-cover transition-opacity duration-300"
              onError={(e) => {
                e.currentTarget.src = FALLBACK_IMG;
              }}
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10"
            />
            {tour.onPromo && (
              <div className="absolute left-4 top-4">
                <span className="rounded-full bg-gradient-to-r from-orange-500 to-red-600 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-white shadow-md">
                  Promo
                </span>
              </div>
            )}
          </div>

          {/* Thumbnail Strip */}
          {galleryImages.length > 1 && (
            <div className="flex w-full gap-2 overflow-x-auto bg-white/95 p-3 backdrop-blur-md lg:bg-neutral-900/60 lg:p-4">
              {galleryImages.map((img, idx) => (
                <button
                  key={`${img}-${idx}`}
                  type="button"
                  onClick={() => setActiveImage(img)}
                  className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                    activeImage === img
                      ? "border-blue-600 opacity-100 ring-2 ring-blue-600/20"
                      : "border-transparent opacity-60 hover:opacity-100 lg:opacity-50 lg:hover:opacity-100"
                  }`}
                >
                  <img
                    src={resolveImage(img)}
                    alt={`${tour.title} thumbnail ${idx + 1}`}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = FALLBACK_IMG;
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── RIGHT COLUMN: DETAILS ────────────────────────────────── */}
        <div className="flex w-full flex-col overflow-hidden sm:w-[55%] lg:w-1/2">
          {/* Scrollable Content */}
          <div
            data-lenis-prevent
            className="flex-1 space-y-6 overflow-y-auto overscroll-contain p-6 sm:p-8"
          >
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-2 pr-10">
                {typeLabel && (
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-blue-800">
                    {typeLabel}
                  </span>
                )}
                {rating && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-neutral-800">
                    <StarIcon className="h-3.5 w-3.5 text-amber-500" />
                    {rating.toFixed(1)}
                    {reviewCount && (
                      <span className="font-medium text-neutral-500">
                        ({reviewCount} reviews)
                      </span>
                    )}
                  </span>
                )}
              </div>

              <h2 className="font-frank text-2xl font-bold leading-tight text-neutral-950 sm:text-3xl">
                {tour.title}
              </h2>
            </div>

            {(tour.childFriendly === true || hasGroupDeal(tour)) && (
              <div className="flex flex-wrap gap-2">
                {tour.childFriendly === true && (
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-900">
                    Family friendly
                  </span>
                )}
                {hasGroupDeal(tour) && (
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-800">
                    Group deals
                  </span>
                )}
              </div>
            )}

            {facts.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {facts.map((f) => (
                  <div
                    key={f.label}
                    className="flex items-start gap-2.5 rounded-xl border border-neutral-100 bg-neutral-50 px-3 py-2.5"
                  >
                    <span className="mt-0.5 text-blue-600">{f.icon}</span>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                        {f.label}
                      </p>
                      <p className="text-xs font-semibold leading-snug text-neutral-800">
                        {f.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tour.description && (
              <p className="line-clamp-6 font-bitter text-sm leading-relaxed text-neutral-600 sm:text-base">
                {tour.description}
              </p>
            )}

            {highlights.length > 0 && (
              <div>
                <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-neutral-400">
                  Highlights
                </p>
                <ul className="space-y-2.5">
                  {highlights.map((text, i) => (
                    <li
                      key={i}
                      className="flex gap-3 font-bitter text-sm leading-snug text-neutral-700 sm:text-base"
                    >
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                        <StarIcon className="h-3 w-3" />
                      </span>
                      {text}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {shownIncluded.length > 0 && (
              <div>
                <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-neutral-400">
                  What's included
                </p>
                <ul className="space-y-3">
                  {shownIncluded.map((text, i) => (
                    <li
                      key={i}
                      className="flex gap-3 font-bitter text-sm leading-snug text-neutral-700 sm:text-base"
                    >
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-800">
                        <CheckIcon className="h-3 w-3" />
                      </span>
                      {text}
                    </li>
                  ))}
                </ul>
                {moreIncluded > 0 && (
                  <p className="mt-3 text-xs font-semibold text-neutral-400">
                    +{moreIncluded} more on the full page
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Fixed Footer — one price only */}
          <div className="shrink-0 border-t border-neutral-100 bg-white p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-8 sm:py-6">
            <div className="mb-4 flex items-baseline gap-2">
              <span className="text-sm font-medium text-neutral-500">From</span>
              <span className="font-frank text-3xl font-bold text-neutral-950">
                R{Number(amount).toLocaleString()}
              </span>
              {note && (
                <span className="text-sm font-medium text-neutral-500">
                  {note}
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Link
                to={`/tours/${tour.slug}`}
                state={{ tour }}
                className="flex items-center justify-center rounded-full border border-neutral-200 px-6 py-3.5 text-center text-sm font-bold text-neutral-700 transition hover:bg-neutral-50 hover:text-neutral-900"
              >
                See full page
              </Link>
              <button
                type="button"
                onClick={() => onBook(tour)}
                className="rounded-full bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700 active:scale-95"
              >
                Book now
              </button>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={toggleLike}
                aria-pressed={liked}
                className={`inline-flex items-center justify-center gap-2 rounded-full border px-4 py-3 text-sm font-bold transition active:scale-95 ${
                  liked
                    ? "border-red-200 bg-red-50 text-red-600"
                    : "border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                }`}
              >
                <HeartIcon filled={liked} className="h-4 w-4" />
                {liked ? "Liked" : "Like tour"}
              </button>
              <button
                type="button"
                onClick={() => setReviewOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-neutral-200 px-4 py-3 text-sm font-bold text-neutral-700 transition hover:bg-neutral-50 active:scale-95"
              >
                <StarIcon className="h-4 w-4 text-amber-500" />
                Leave a review
              </button>
            </div>
          </div>
        </div>
      </div>

      {reviewOpen && (
        <ReviewModal
          tour={tour}
          onClose={() => setReviewOpen(false)}
          onSubmitReview={onSubmitReview}
        />
      )}

      <style>{`
        @keyframes tourQvIn {
          from { opacity: 0; transform: translateY(32px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>,
    document.body,
  );
}