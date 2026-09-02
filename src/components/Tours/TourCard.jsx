import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom"; // ✅ use createPortal directly
import { useLoadingNavigate } from "../useLoadingNavigate.jsx";
import {
  CTA_LABELS,
  SUPPORTED_CURRENCIES,
} from "/src/data/tours.js";
import {
  toText,
  getPickupSummary,
  getBestGroupDiscount,
  FallbackImage,
  getTourImageSources,
  formatMoney,
  convertPrice,
  getLocationText,
  getTypeText,
  getCategoryText,
  getSupportedCurrencies,
} from "./Helpers.jsx";
import { resolveTourImage } from "/src/utils/ImageLoader.js";

// Helper functions (unchanged)
const getModifierLabel = (tour) => {
  if (!tour.category) return "";
  const map = {
    HALF_DAY: "Half Day",
    FULL_DAY: "Full Day",
    DAY_TOUR: "Day Tour",
    MULTI_DAY: "Multi-Day",
  };
  return map[tour.category] || "";
};

const hasGroupPricing = (tour) => {
  return tour.groupPricing?.enabled && tour.groupPricing?.tiers?.length > 0;
};

const getBestGroupTier = (tour) => {
  if (!hasGroupPricing(tour)) return null;
  const tiers = tour.groupPricing.tiers;
  const sorted = [...tiers].sort((a, b) => b.minPeople - a.minPeople);
  return sorted[0] || null;
};

export default function TourCard({ tour, isMobile, isCarousel = false }) {
  const navigate = useLoadingNavigate();

  // ── Currency ──────────────────────────────────────────────
  const [currency, setCurrency] = useState(
    () => tour?.baseCurrency || SUPPORTED_CURRENCIES[0] || "ZAR"
  );
  const supportedCurrencies = getSupportedCurrencies(tour);

  useEffect(() => {
    if (!supportedCurrencies.includes(currency)) {
      setCurrency(tour?.baseCurrency || supportedCurrencies[0] || "ZAR");
    }
  }, [currency, supportedCurrencies, tour?.baseCurrency]);

  // ── Image sources ─────────────────────────────────────────
  const imageSources = useMemo(() => {
    const sources = getTourImageSources(tour);
    if (!Array.isArray(sources)) return [];
    return sources.filter(Boolean).map(resolveTourImage).filter(Boolean);
  }, [tour]);

  // ── Derived data ──────────────────────────────────────────
  const categoryLabel = getCategoryText(tour);
  const typeLabel = getTypeText(tour);
  const modifierLabel = getModifierLabel(tour);
  const locationText = getLocationText(tour);
  const basePrice = Number(tour?.priceBase ?? tour?.price ?? 0);
  const displayPrice = formatMoney(convertPrice(basePrice, currency), currency);
  const isFamilyFriendly = tour.childFriendly === true;
  const bestGroupTier = getBestGroupTier(tour);

  // ── Modal state ───────────────────────────────────────────
  const [modalOpen, setModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false); // ✅ track client mount

  // ✅ set mounted to true after client hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  // ── Navigation ────────────────────────────────────────────
  const getTourPath = (tourData) => `/tours/${tourData?.slug || tourData?.id || ""}`;

  const goToTourPage = () => {
    navigate(getTourPath(tour), { state: { tour, selectedCurrency: currency } });
  };

  const goToBooking = () => {
    navigate(`${getTourPath(tour)}#booking`, {
      state: {
        tour: { ...tour, priceBase: basePrice },
        selectedCurrency: currency,
        scrollToBooking: true,
      },
    });
  };

  const handleContactClick = () => {
    // Safe: runs only on client (click handler)
    document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // ── Mobile info toggles ──────────────────────────────────
  const [infoOpen, setInfoOpen] = useState(null);

  const toggleInfo = (key) => {
    setInfoOpen((prev) => (prev === key ? null : key));
  };

  // ── Render highlights ─────────────────────────────────────
  const renderHighlights = () => {
    if (!tour.highlights || tour.highlights.length === 0) return null;
    const items = tour.highlights.slice(0, 4);
    return (
      <div className="grid grid-cols-2 gap-2 mt-3">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-start gap-2 text-sm text-neutral-700">
            <svg className="w-4 h-4 mt-0.5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span className="line-clamp-2">{item.text}</span>
          </div>
        ))}
      </div>
    );
  };

  // ── Render included items ────────────────────────────────
  const renderIncluded = () => {
    if (!tour.included || tour.included.length === 0) return null;
    const items = tour.included.slice(0, 4);
    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {items.map((item, idx) => {
          const isLunch = item.text.toLowerCase().includes("lunch");
          return (
            <span
              key={idx}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                isLunch ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-neutral-100 text-neutral-700"
              }`}
            >
              {isLunch ? (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M8 21s1-1.5 2-3.5c1-2 2-4.5 2-7.5V5a2 2 0 0 0-4 0v5c0 3-2.5 6-2.5 6" />
                  <path d="M16 21s1-1.5 2-3.5c1-2 2-4.5 2-7.5V5a2 2 0 0 0-4 0v5c0 3-2.5 6-2.5 6" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v8" />
                  <path d="M8 12h8" />
                </svg>
              )}
              {item.text}
            </span>
          );
        })}
        {tour.included.length > 4 && (
          <span className="text-xs text-neutral-400">+{tour.included.length - 4} more</span>
        )}
      </div>
    );
  };

  // ── Render group pricing ─────────────────────────────
  const renderGroupPricing = () => {
    if (!bestGroupTier) return null;
    const tier = bestGroupTier;
    const discountLabel = tier.discountPercent ? `Save ${tier.discountPercent}%` : "Best value";
    const description = tier.perPerson
      ? `From ${formatMoney(convertPrice(tier.perPerson, currency), currency)} pp for ${tier.minPeople}+`
      : `Best for ${tier.minPeople}+ guests`;
    return (
      <div className="flex items-center gap-1.5 text-sm text-blue-700">
        <img src="/icons/savemore.png" className="h-5 w-5 object-contain" alt="Group discount" />
        <span className="font-medium">{discountLabel}</span>
        <span className="text-neutral-500 text-xs">• {description}</span>
      </div>
    );
  };

  // ── Modal component (now using createPortal) ──────────────────
  const ModalContent = () => {
    if (!modalOpen) return null;
    return (
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={closeModal}
      >
        <div
          className="relative max-w-2xl w-full max-h-[80vh] bg-white rounded-2xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-neutral-200">
            <h3 className="text-lg font-bold text-neutral-900">Tour Details</h3>
            <button
              type="button"
              onClick={closeModal}
              className="p-1 rounded-full hover:bg-neutral-100 transition"
            >
              <svg className="w-6 h-6 text-neutral-500" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh] space-y-6">
            {/* Description */}
            <div>
              <h4 className="font-semibold text-neutral-900 mb-2">Description</h4>
              <p className="text-neutral-700 leading-relaxed whitespace-pre-line">
                {tour.description || "No description available."}
              </p>
            </div>
            {/* Reviews */}
            <div>
              <h4 className="font-semibold text-neutral-900 mb-2">Reviews</h4>
              {tour.mainReview ? (
                <div className="space-y-4">
                  <div className="bg-neutral-50 rounded-xl p-4">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-neutral-900">{tour.mainReviewerName || "Guest"}</span>
                      {tour.mainReviewerCountry && (
                        <span className="text-xs text-neutral-500">• {tour.mainReviewerCountry}</span>
                      )}
                      {tour.reviewYear && (
                        <span className="text-xs text-neutral-400">{tour.reviewYear}</span>
                      )}
                    </div>
                    <p className="mt-2 text-neutral-700">{tour.mainReview}</p>
                    {tour.rating && (
                      <div className="mt-2 flex items-center gap-1">
                        <span className="text-amber-400">★</span>
                        <span className="text-sm font-medium">{Number(tour.rating).toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                  {tour.otherReviews && tour.otherReviews > 0 && (
                    <p className="text-sm text-neutral-500">{tour.otherReviews} other reviews</p>
                  )}
                </div>
              ) : (
                <p className="text-neutral-500">No reviews available for this tour.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ── Render ──────────────────────────────────────────────────
  return (
    <>
      <article
        className={`
          relative overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-md transition-shadow duration-300 hover:shadow-xl
          ${isCarousel ? 'm-0' : 'm-0'} 
          /* Removed h-full from carousel to let card size naturally */
        `}
        data-tour-card
      >
        <div className={`
          grid grid-cols-1 md:grid-cols-2 grid-rows-1 gap-0
          /* Removed h-full from carousel */
        `}>
          {/* -------- IMAGE PANEL -------- */}
          <div className="relative h-64 md:h-full md:min-h-full flex-shrink-0 bg-neutral-900 overflow-hidden " >
            <FallbackImage
              sources={imageSources}
              alt={tour?.title || "Tour image"}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 hover:scale-105"
              loading="lazy"
              decoding="async"
              onFinalError={(e) => {
                e.currentTarget.style.display = "none";
                if (e.currentTarget.parentNode) {
                  e.currentTarget.parentNode.style.background =
                    "linear-gradient(135deg, #1a2a6c, #b21f1f, #fdbb2d)";
                }
              }}
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
              {modifierLabel && (
                <span className="rounded-full bg-white/90 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-neutral-800 shadow">
                  {modifierLabel}
                </span>
              )}
              {isFamilyFriendly && (
                <span className="rounded-full bg-green-100/90 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-green-800 shadow">
                  👨‍👩‍👧‍👦 Family
                </span>
              )}
              {categoryLabel && (
                <span className="rounded-full bg-blue-100/90 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-blue-800 shadow">
                  {categoryLabel}
                </span>
              )}
            </div>

            {/* Rating */}
            {tour.rating && (
              <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-white/90 backdrop-blur-sm px-3 py-1.5 shadow">
                <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-sm font-bold text-neutral-800">{Number(tour.rating).toFixed(1)}</span>
                <span className="text-xs text-neutral-500">({tour.otherReviews || 0})</span>
              </div>
            )}

            {/* Title */}
            <div className="absolute bottom-3 left-3 right-3 z-10">
              <h3 className="text-xl font-bold text-white drop-shadow-lg line-clamp-2">
                {tour?.title || "Untitled Tour"}
              </h3>
              <p className="text-sm text-white/80 drop-shadow">{locationText}</p>
            </div>
          </div>

          {/* -------- CONTENT PANEL -------- */}
          <div className="flex flex-col p-4 md:p-5 space-y-3">
            {/* Top row: location, duration, pickup, help */}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => toggleInfo('location')}
                className="flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-200 transition"
              >
                <img src="/icons/mapPin.png" className="h-4 w-4 object-contain" alt="" />
                Location
              </button>
              <button
                type="button"
                onClick={() => toggleInfo('duration')}
                className="flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-200 transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                Duration
              </button>
              {getPickupSummary(tour) && (
                <button
                  type="button"
                  onClick={() => toggleInfo('pickup')}
                  className="flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-200 transition"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokelinejoin="round" viewBox="0 0 24 24">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  Pickup
                </button>
              )}
              <button
                type="button"
                onClick={handleContactClick}
                className="flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-200 transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                Need help?
              </button>
            </div>

            {/* Info toggle display */}
            {infoOpen && (
              <div className="rounded-xl border border-blue-100 bg-blue-50/60 px-3 py-2 text-sm text-neutral-700">
                {infoOpen === 'location' && <span>{locationText}</span>}
                {infoOpen === 'duration' && <span>{tour.duration || "Flexible"}</span>}
                {infoOpen === 'pickup' && <span>{getPickupSummary(tour)}</span>}
              </div>
            )}

            {/* Price + group pricing */}
            <div>
              <div className="flex flex-wrap items-end gap-2">
                <div>
                  <span className="text-xs font-medium text-neutral-400">From</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-neutral-900 tracking-tight">
                      {displayPrice}
                    </span>
                    <span className="text-sm text-neutral-500">pp</span>
                  </div>
                </div>
              </div>
              {renderGroupPricing()}
            </div>

            {/* Description & Reviews - centered and stacked */}
            <div className="flex flex-col items-center gap-1 pt-2 border-t border-neutral-100">
              <button
                type="button"
                onClick={openModal}
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M4 6h16M4 12h10M4 18h8" />
                </svg>
                View Description & Reviews
              </button>
            </div>

            {/* Highlights */}
            {renderHighlights()}

            {/* Included items */}
            {renderIncluded()}

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-neutral-100">
              <button
                type="button"
                onClick={goToTourPage}
                className="flex-1 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:border-red-300 hover:text-red-500 active:scale-95"
              >
                See Details
              </button>
              <button
                type="button"
                onClick={goToBooking}
                className="flex-1 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 active:scale-95"
              >
                {CTA_LABELS.requestTrip || "Request Trip"}
                <svg className="inline-block w-4 h-4 ml-1 -mt-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M5 12h14" />
                  <path d="M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </article>

      {/* ✅ Render modal via portal only after client mount */}
      {mounted && createPortal(
        <ModalContent />,
        document.body
      )}
    </>
  );
}