// src/components/Booking/BookingSections.jsx
import React, { lazy, Suspense, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import ClientOnly from "../ClientOnly";
import {
  BookingField,
  HomeIcon,
  MiniAssurance,
  BandFlipSwitch,
  VehicleSeating,
  CheckIcon,
} from "./BookingUi.jsx";
import {
  formatTourMeta,
  getTourGallery,
  getTourSlug,
  GUEST_BANDS,
  BAND_COLORS,
} from "./BookingConstants.js";
import allTours from "../../data/tours.js";
import { resolveImage } from "../../utils/ImageLoader";
import { formatMoney, convertPrice } from "../../utils/pricingEngine.js";

const Map = lazy(() => import("../Map"));

function RelatedTours({ tour, currency }) {
  const nav = useNavigate();
  const relatedTours = useMemo(() => {
    if (!tour || !Array.isArray(allTours)) return [];
    const currentSlug = getTourSlug(tour);
    const others = allTours.filter(
      (item) =>
        item && getTourSlug(item) !== currentSlug && item.id !== tour.id,
    );
    const sameType = others.filter(
      (item) => item.type === tour.type || item.category === tour.category,
    );
    return [...sameType, ...others]
      .filter(
        (item, index, array) =>
          array.findIndex((c) => getTourSlug(c) === getTourSlug(item)) ===
          index,
      )
      .slice(0, 3);
  }, [tour]);

  if (relatedTours.length === 0) return null;

  return (
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
                  e.currentTarget.src = "/images/content/random/1.webp";
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
  );
}

export function TourGallery({
  tour,
  gallery,
  activeImage,
  setActiveImage,
  activeImageRef,
  fallbackImage,
  currency,
}) {
  const activeImageSrc = gallery[activeImage] || fallbackImage;
  const handleImageError = (e) => {
    if (e.currentTarget.src.includes(fallbackImage)) return;
    e.currentTarget.src = fallbackImage;
  };

  return (
    <>
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

        <RelatedTours tour={tour} currency={currency} />
      </div>
    </>
  );
}

export function TourSummary({
  tour,
  currency,
  setCurrency,
  supportedCurrencies,
  priceRef,
  fallbackImage,
}) {
  const tourInfoPills = [
    {
      label: "Duration",
      value: formatTourMeta(tour?.duration || tour?.category || "Tour"),
      className: "border-[#f7b7c8]/60 bg-[#fde2eb]/90 text-[#7b334f]",
    },
    {
      label: "Style",
      value: formatTourMeta(tour?.type || tour?.category || "Cape Town Tour"),
      className: "border-[#ffd08a]/70 bg-[#fff0c9]/90 text-[#76511c]",
    },
    {
      label: "Location",
      value: formatTourMeta(tour?.location || "Cape Town"),
      className: "border-[#a8d8ee]/70 bg-[#dff4ff]/90 text-[#24566b]",
    },
    {
      label: "Pickup",
      value: "Included",
      className: "border-[#b8e6c8]/70 bg-[#e3f8df]/90 text-[#2d6139]",
    },
  ].filter((pill) => pill.value);

  return (
    <div className="relative isolate overflow-hidden rounded-[2rem] border border-black/5 px-4 py-6 transition-all duration-500 group-hover/right:border-blue-200 sm:rounded-[2.5rem] sm:px-6 sm:py-8 md:px-8 md:py-10">
      <img
        src={resolveImage(tour.image)}
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-55 transition-transform duration-700 group-hover/right:scale-[1.03]"
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

        {tourInfoPills.length > 0 && (
          <div className="mx-auto mt-5 flex max-w-3xl flex-wrap justify-center gap-2 sm:mt-6 sm:gap-2.5">
            {tourInfoPills.map((pill) => (
              <span
                key={`${pill.label}-${pill.value}`}
                className={`inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-bold shadow-[0_8px_20px_rgba(0,0,0,0.05)] backdrop-blur-md sm:min-h-10 sm:gap-2 sm:px-4 sm:py-2 sm:text-xs ${pill.className}`}
              >
                <span className="text-[8px] font-black uppercase tracking-[0.16em] opacity-65 sm:text-[9px] sm:tracking-[0.18em]">
                  {pill.label}
                </span>
                <span className="whitespace-nowrap">{pill.value}</span>
              </span>
            ))}
          </div>
        )}

        <div className="mt-6 flex justify-center sm:mt-8">
          <div
            ref={priceRef}
            className="flex w-full max-w-md flex-col overflow-hidden rounded-[1.5rem] border border-black/5 bg-white/90 shadow-[0_14px_40px_rgba(0,0,0,0.08)] backdrop-blur-xl sm:max-w-fit sm:flex-row sm:items-stretch"
          >
            <div className="flex min-w-0 flex-1 flex-col items-center justify-center px-5 py-4 text-center sm:min-w-[10rem] sm:px-6 sm:py-4">
              <div className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-400 sm:text-[10px]">
                From
              </div>
              <div className="mt-1 max-w-full truncate font-frank text-3xl font-bold leading-none tracking-tight text-neutral-950 sm:text-4xl">
                {formatMoney(convertPrice(tour?.priceBase, currency), currency)}
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
                  className="h-12 w-full min-w-[7rem] cursor-pointer appearance-none rounded-xl border border-black/10 bg-neutral-50 px-4 pr-9 text-center text-sm font-black text-neutral-900 outline-none transition-all duration-200 hover:border-green-300 hover:bg-green-50 focus:border-green-400 focus:bg-green-50 focus:ring-2 focus:ring-green-400/20 sm:h-14 sm:w-24"
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
  );
}

// ─── Section 1 — Traveller details ───────────────────────────────
export function TravellerDetailsSection({
  formData,
  onChange,
  complete,
  isEditing,
  hasSnapshot,
  onRequestEdit,
  onSaveEdit,
  onCancelEdit,
  onResetTraveller,
}) {
  return (
    <div className="w-full min-w-0 rounded-[1.75rem] border border-black/5 bg-white p-4 shadow-[0_12px_32px_rgba(0,0,0,0.04)] transition-all duration-500 group-hover/right:border-green-200/80 group-hover/right:shadow-[0_16px_42px_rgba(34,197,94,0.08)] sm:p-5">
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-green-200 text-sm font-bold text-green-950 ring-1 ring-green-300">
          1
        </span>
        <div className="min-w-0">
          <h3 className="font-frank text-2xl leading-none text-neutral-950">
            Traveller details
          </h3>
          <p className="mt-1 text-xs text-neutral-500">
            Add contact details and choose the preferred tour date.
          </p>
        </div>
      </div>

      {/* FIXED: Added min-h-[3.25rem] to match other blocks */}
      {complete && !isEditing && (
        <div className="flex min-h-[3.25rem] w-full items-center justify-between gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-3">
          <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-hidden">
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-1 text-xs font-bold text-green-900">
              {formData.fullName}
            </span>
            <span className="truncate text-xs text-neutral-500">
              {formData.date} · {formData.mobile}
            </span>
          </div>
          <button
            type="button"
            onClick={onRequestEdit}
            className="shrink-0 rounded-full border border-neutral-300 bg-white px-3.5 py-1.5 text-xs font-bold text-neutral-700 transition hover:bg-neutral-50"
          >
            Change
          </button>
        </div>
      )}

      <div
        className={`transition-all duration-500 ease-out ${
          complete && !isEditing
            ? "pointer-events-none max-h-0 overflow-hidden opacity-0"
            : "max-h-[650px] opacity-100"
        }`}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <BookingField label="Full name">
            <input
              name="fullName"
              placeholder="Faiez Viljoen"
              value={formData.fullName}
              onChange={onChange}
              className="w-full rounded-2xl border border-neutral-200 bg-white p-4 text-base outline-none transition focus:border-green-400 focus:ring-4 focus:ring-green-100"
            />
          </BookingField>

          <BookingField label="Mobile number">
            <input
              name="mobile"
              placeholder="081 000 0000"
              value={formData.mobile}
              onChange={onChange}
              className="w-full rounded-2xl border border-neutral-200 bg-white p-4 text-base outline-none transition focus:border-green-400 focus:ring-4 focus:ring-green-100"
            />
          </BookingField>

          <BookingField label="Email address">
            <input
              name="email"
              type="email"
              placeholder="name@email.com"
              value={formData.email}
              onChange={onChange}
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
              onChange={onChange}
              className="w-full cursor-pointer rounded-2xl border border-neutral-200 bg-white p-4 text-base outline-none transition focus:border-green-400 focus:ring-4 focus:ring-green-100"
            />
          </BookingField>
        </div>

        <div className="mt-4 flex w-full flex-wrap items-center justify-center gap-2">
          {isEditing && hasSnapshot && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="rounded-xl px-3 py-2 text-sm font-bold text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-800"
            >
              Cancel
            </button>
          )}
          <button
            type="button"
            onClick={onResetTraveller}
            className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm font-bold text-neutral-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={onSaveEdit}
            disabled={!complete}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-neutral-900 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:text-neutral-500 disabled:hover:bg-neutral-300"
          >
            <CheckIcon className="h-4 w-4" />
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Section 2 — Group size ──────────────────────────────────────
export function GroupSizeSection({
  tour,
  seatAssignments,
  activeBrush,
  bandCounts,
  participantCount,
  minPeople,
  maxGuests,
  childFriendly,
  isEditing,
  hasSnapshot,
  onSeatTap,
  onBrushToggle,
  onResetSeats,
  onOpenEditor,
  onCancelEdit,
  onConfirm,
}) {
  const nav = useNavigate();
  const taken = participantCount;
  const isFirstTap = taken === 0;
  const canConfirm = taken >= Math.max(1, minPeople);
  const activeName = activeBrush ? BAND_COLORS[activeBrush]?.name : "—";

  return (
    <div className="w-full min-w-0 rounded-[1.75rem] border border-black/5 bg-white p-4 shadow-[0_12px_32px_rgba(0,0,0,0.04)] transition-all duration-500 group-hover/right:border-green-200/80 group-hover/right:shadow-[0_16px_42px_rgba(34,197,94,0.08)] sm:p-5">
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-sm font-bold text-blue-700 ring-1 ring-blue-200">
          2
        </span>
        <div className="min-w-0">
          <h3 className="font-frank text-2xl leading-none text-neutral-950">
            Group size
          </h3>
          <p className="mt-1 text-xs text-neutral-500">
            Pick an age brush, then tap seats to add guests. Tap a filled seat
            to remove.
          </p>
        </div>
      </div>

      {/* FIXED: Added min-h-[3.25rem] to match other blocks */}
      <div
        className={`transition-all duration-500 ease-out ${
          isEditing
            ? "pointer-events-none max-h-0 overflow-hidden opacity-0"
            : "max-h-[200px] opacity-100"
        }`}
      >
        <div className="flex min-h-[3.25rem] w-full items-center justify-between gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-3">
          <div className="flex flex-wrap gap-1.5 min-w-0">
            {GUEST_BANDS.filter((b) => bandCounts[b.key] > 0).map((b) => {
              const n = bandCounts[b.key];
              const c = BAND_COLORS[b.key];
              return (
                <span
                  key={b.key}
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${c.chipBg}`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-white/90" />
                  {n} {n === 1 ? b.singular : b.label.toLowerCase()}
                </span>
              );
            })}
          </div>
          <button
            type="button"
            onClick={onOpenEditor}
            className="shrink-0 rounded-full border border-neutral-300 bg-white px-3.5 py-1.5 text-xs font-bold text-neutral-700 transition hover:bg-neutral-50"
          >
            Change
          </button>
        </div>
      </div>

      <div
        className={`transition-all duration-500 ease-out ${
          isEditing
            ? "max-h-[2400px] opacity-100"
            : "pointer-events-none max-h-0 overflow-hidden opacity-0"
        }`}
      >
        {!childFriendly && (
          <div className="mb-3 flex items-start gap-2 rounded-xl border border-amber-200/80 bg-amber-50/70 px-3 py-2 text-xs text-amber-800">
            <span aria-hidden="true">⚠️</span>
            <span className="min-w-0">
              <b>This tour is not child-friendly.</b> Only adult seats can
              be added.
            </span>
          </div>
        )}

        <div className="mb-3">

          <div className="mx-auto flex w-full min-w-0 max-w-md flex-col gap-1.5 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-2">
            {GUEST_BANDS.map((band) => {
              const disabled = band.key !== "adult" && !childFriendly;
              return (
                <BandFlipSwitch
                  key={band.key}
                  band={band}
                  checked={activeBrush === band.key}
                  disabled={disabled}
                  onToggle={onBrushToggle}
                />
              );
            })}
          </div>
        </div>

        {isFirstTap && (
          <div className="mb-3 flex flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-neutral-200 bg-neutral-50 py-5 text-center">
            <p className="font-frank text-xl font-bold text-neutral-800">
              👆 Tap a seat
            </p>
            <p className="text-[11px] text-neutral-500">
              Pick an age brush above, then tap any seat below
            </p>
          </div>
        )}

        <VehicleSeating
          seatAssignments={seatAssignments}
          onSeatTap={onSeatTap}
        />

        {tour?.groupPricing?.enabled && (
          <button
            type="button"
            onClick={() => nav("/policies")}
            className="mt-3 flex w-full items-center gap-2.5 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-left text-xs text-neutral-700 transition hover:bg-white"
          >
            <img
              src="/icons/savemore.png"
              alt=""
              className="h-5 w-5 shrink-0 object-contain"
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
            <span className="min-w-0 flex-1 font-semibold">
              Bigger groups pay less per person.
            </span>
            <span className="shrink-0 font-bold underline underline-offset-2">
              See how
            </span>
          </button>
        )}

        <div className="mt-4 flex w-full flex-wrap items-center justify-center gap-2">
          {hasSnapshot && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="rounded-xl px-3 py-2 text-sm font-bold text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-800"
            >
              Cancel
            </button>
          )}
          <button
            type="button"
            onClick={onResetSeats}
            className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm font-bold text-neutral-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={!canConfirm}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-neutral-900 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:text-neutral-500 disabled:hover:bg-neutral-300"
          >
            <CheckIcon className="h-4 w-4" />
            Confirm {taken}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Section 3 — Pickup location ─────────────────────────────────
export function PickupLocationSection({
  formData,
  onInputChange,
  showPicker,
  pendingPickup,
  markerPosition,
  mapCenter,
  locationLoading,
  locationError,
  onConfirm,
  onFind,
  onMapPick,
  onReset,
  onChangeClick,
  pickupFeedbackRef,
}) {
  return (
    <div className="w-full min-w-0 rounded-[1.75rem] border border-black/5 bg-white p-4 shadow-[0_12px_32px_rgba(0,0,0,0.04)] transition-all duration-500 group-hover/right:border-green-200/80 group-hover/right:shadow-[0_16px_42px_rgba(34,197,94,0.08)] sm:p-5">
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-sm font-bold text-sky-700 ring-1 ring-sky-200">
          3
        </span>
        <div className="min-w-0">
          <h3 className="font-frank text-2xl leading-none text-neutral-950">
            Pickup location
          </h3>
          <p className="mt-1 text-xs text-neutral-500">
            Enter an address and search, or click directly on the map.
          </p>
        </div>
      </div>

      {/* FIXED: Added min-h-[3.25rem] to match other blocks */}
      {formData.pickupCoords && !showPicker && (
        <div
          ref={pickupFeedbackRef}
          className="flex min-h-[3.25rem] w-full items-center justify-between gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-3"
        >
          <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-hidden">
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-sky-100 px-2.5 py-1 text-xs font-bold text-sky-900">
              <HomeIcon className="h-3.5 w-3.5" />
              Pickup
            </span>
            <span className="truncate text-xs text-neutral-500">
              {formData.pickupLocation}
            </span>
          </div>
          <button
            type="button"
            onClick={onChangeClick}
            className="shrink-0 rounded-full border border-neutral-300 bg-white px-3.5 py-1.5 text-xs font-bold text-neutral-700 transition hover:bg-neutral-50"
          >
            Change
          </button>
        </div>
      )}

      {!formData.pickupCoords && (
        <div
          className={`w-full min-w-0 transition-all duration-500 ease-out ${showPicker ? "max-h-[560px] opacity-100" : "max-h-0 overflow-hidden opacity-0"}`}
        >
          <div className="mb-4 flex w-full min-w-0 flex-col gap-3 md:flex-row">
            <input
              name="pickupLocation"
              placeholder="Hotel, guesthouse, Airbnb, or pickup point"
              value={formData.pickupLocation}
              onChange={onInputChange}
              className="w-full min-w-0 rounded-2xl border border-neutral-200 bg-white p-4 text-base outline-none transition focus:border-green-400 focus:ring-4 focus:ring-green-100 md:flex-1"
            />
            <div className="flex w-full flex-wrap gap-2 md:w-auto">
              <button
                type="button"
                onClick={pendingPickup ? onConfirm : onFind}
                disabled={
                  locationLoading ||
                  (!pendingPickup && !formData.pickupLocation.trim())
                }
                className="flex-1 rounded-2xl bg-blue-600 px-5 py-4 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 md:flex-initial"
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
                  onClick={onReset}
                  className="flex-1 rounded-2xl border border-red-200 bg-white px-5 py-4 font-semibold text-red-600 transition hover:-translate-y-0.5 hover:bg-red-50 md:flex-initial"
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
            <Suspense fallback={<div style={{ height: "260px" }} />}>
              <Map
                center={[mapCenter.lat, mapCenter.lng]}
                markerPosition={markerPosition}
                onPick={onMapPick}
              />
            </Suspense>
          </ClientOnly>
          {locationError && (
            <p className="mt-3 w-full rounded-xl bg-red-50 p-3 text-sm text-red-600">
              {locationError}
            </p>
          )}
        </div>
      )}
    </div>
  );
}