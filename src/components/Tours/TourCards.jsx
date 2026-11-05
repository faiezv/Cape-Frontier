import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { resolveImage } from "../../utils/ImageLoader";
import { getPriceLabel, hasGroupDeal } from "../../utils/tourHelpers";

const FALLBACK_IMG = "/images/content/random/1.webp";

const getItemText = (item) => {
  if (!item) return "";
  return typeof item === "string" ? item : item.text || item.name || "";
};

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

// ─── Grid card ───────────────────────────────────────────────────────────────

export function TourCard({ tour, onOpen }) {
  const { amount, note } = getPriceLabel(tour);

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-100">
        <img
          src={resolveImage(tour.image)}
          alt={tour.title}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.src = FALLBACK_IMG;
          }}
        />
        {tour.onPromo && (
          <div className="absolute left-3 top-3">
            <span className="rounded-full bg-gradient-to-r from-orange-500 to-red-600 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-sm">
              Promo
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 font-frank text-lg font-bold leading-snug text-neutral-950 transition-colors group-hover:text-blue-700">
          {tour.title}
        </h3>

        <p className="mt-1 line-clamp-1 text-xs font-medium text-neutral-500">
          {[tour.duration, tour.location].filter(Boolean).join(" · ")}
        </p>

        <div className="mt-5 flex items-center justify-between rounded-xl border border-neutral-100 bg-neutral-50 p-3">
          <div className="text-neutral-950">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500">
              From
            </span>
            <div className="flex items-baseline gap-1">
              <span className="font-frank text-lg font-bold leading-none">
                R{Number(amount).toLocaleString()}
              </span>
              {note && (
                <span className="text-[10px] font-medium text-neutral-500">
                  {note}
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => onOpen(tour)}
            aria-label={`See details for ${tour.title}`}
            className="rounded-full bg-white px-4 py-2 text-xs font-bold text-blue-700 shadow-sm ring-1 ring-neutral-200 transition hover:bg-blue-50 hover:text-blue-800 after:absolute after:inset-0 after:content-[''] focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600"
          >
            See details
          </button>
        </div>
      </div>
    </article>
  );
}

// ─── Quick view (mini details) ───────────────────────────────────────────────

export function TourQuickView({ tour, onClose, onBook }) {
  const { amount, note } = getPriceLabel(tour);

  const included = (Array.isArray(tour.included) ? tour.included : [])
    .map(getItemText)
    .filter(Boolean);
  const shownIncluded = included.slice(0, 6);
  const moreIncluded = included.length - shownIncluded.length;

  const priceRows = (tour.pricing || [])
    .filter((p) => Number(p.pricePerPerson) > 0)
    .slice(0, 4);

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

  return (
    <div
      className="fixed inset-0 z-[150] flex items-end justify-center bg-black/60 px-0 pt-10 backdrop-blur-sm sm:items-center sm:px-4 sm:pb-8 sm:pt-16"
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
          className="absolute right-3 top-3 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-neutral-700 shadow-md backdrop-blur-md transition hover:bg-white hover:text-black sm:right-4 sm:top-4"
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
              <h2 className="font-frank text-2xl font-bold leading-tight text-neutral-950 sm:text-3xl">
                {tour.title}
              </h2>
              <p className="mt-2 text-sm font-semibold text-neutral-500">
                {[tour.duration, tour.location].filter(Boolean).join(" · ")}
              </p>
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

            {tour.description && (
              <p className="line-clamp-6 font-bitter text-sm leading-relaxed text-neutral-600 sm:text-base">
                {tour.description}
              </p>
            )}

            {priceRows.length > 0 && (
              <div>
                <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-neutral-400">
                  Pricing Options
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {priceRows.map((p) => (
                    <div
                      key={p.category}
                      className="flex items-center justify-between rounded-xl border border-neutral-100 bg-neutral-50 px-4 py-3"
                    >
                      <span className="text-xs font-semibold text-neutral-600">
                        {p.category}
                      </span>
                      <span className="font-frank text-sm font-bold text-neutral-950">
                        R{Number(p.pricePerPerson).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
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
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100 text-[10px] font-bold text-green-800">
                        ✓
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

          {/* Fixed Footer */}
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
          </div>
        </div>
      </div>

      <style>{`
        @keyframes tourQvIn {
          from { opacity: 0; transform: translateY(32px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}