// src/components/CheckoutSummary.jsx

import { useMemo, useState, useRef, useEffect } from "react";
import gsap from "gsap";
import { KIDS_ACTIVITIES } from "../data/kidsActivities";
import { resolveImage } from "../utils/ImageLoader.js";

// ============================================================
// Single source of truth for pricing math — the exact same
// function /api/verify-price uses server-side.
// ============================================================
import { computePricing } from "../utils/pricingEngine.js";

// ============================================================
// COMPONENT
// ============================================================

const CheckoutSummary = ({
  tour,

  adultCount,
  childCount,
  toddlerCount = 0,

  currency = "ZAR",

  selectedOption,
  selectedExtras = {},

  formData,

  contactDetailsComplete,
  dateDetailsComplete,
  pickupDetailsComplete,

  isEmbedded = false,
  CheckoutCartIcon = null,
  checkoutRef = null,

  submitting = false,
  submitError = "",
}) => {
  const [activeDetail, setActiveDetail] = useState("tour");

  const guestEmojisRef = useRef([]);
  const guestContainerRef = useRef(null);
  const iconButtonsContainerRef = useRef(null);
  const iconButtonRefs = useRef({});

  // ============================================================
  // PRICING CALCULATION — delegated entirely to pricingEngine
  // ============================================================

  const childAges = Array.isArray(formData?.childAges)
    ? formData.childAges
        .map((age) => Number(age))
        .filter((age) => Number.isFinite(age) && age >= 0 && age <= 17)
    : [];

  const engineResult = useMemo(
    () =>
      computePricing({
        tour,
        childAges,
        adultCount: Math.max(0, Number(adultCount) || 0),
        currency,
        selectedOption,
        selectedExtras,
        formData,
        kidsActivities: KIDS_ACTIVITIES,
      }),
    [
      tour,
      JSON.stringify(childAges),
      adultCount,
      currency,
      selectedOption,
      selectedExtras,
      formData?.isPrivate,
      formData?.isCustom,
      formData?.selectedKidsActivity,
    ],
  );

  const {
    adults,
    children,
    toddlers,
    teens,
    participantCount,
    qualifyingHeadcount,
    hasOptions,
    selectedTourOption,
    isCustomQuote,
    matchedGroupTier,
    groupPricingType,
    groupDiscountPercent,
    extrasBreakdown,
    selectedKidsActivity,
    kidsActivityAdultPrice,
    kidsActivityChildPrice,
    kidsActivityToddlerPrice,
    kidsActivityAdultTotal,
    kidsActivityChildTotal,
    kidsActivityToddlerTotal,
    kidsActivityTotal,
    privateFee,
    customFee,
    extrasTotal,
    finalTotal,
    currency: resolvedCurrency,

    adultPrice,
    teenPrice: teenBasePrice,
    childPrice: childBasePrice,
    toddlerPrice: toddlerBasePrice,

    effectiveAdultPrice,
    effectiveTeenPrice,
    effectiveChildPrice,
    effectiveToddlerPrice,

    adultSubtotal,
    teenSubtotal,
    childSubtotal,
    toddlerSubtotal,
    originalSubtotal,

    groupDiscountAmount,
    discountedSubtotal: discountedTourTotal,

    displayExtrasTotal,
    displayKidsActivityTotal,
    displayTotal,
  } = engineResult;

  const formatCurrency = (amount) => {
    const n = Number(amount);
    return `${resolvedCurrency} ${(Number.isFinite(n) ? n : 0).toFixed(2)}`;
  };

  const displayActivePrivateFee =
    privateFee > 0 ? `+${formatCurrency(privateFee)}` : "—";
  const displayActiveCustomFee =
    customFee > 0 ? `+${formatCurrency(customFee)}` : "—";

  // ============================================================
  // NORMALIZATION
  // ============================================================

  const toNum = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };

  const _adultPrice = toNum(adultPrice) ?? 0;

  const childRateIsExplicit = toNum(childBasePrice) != null;
  const toddlerRateIsExplicit = toNum(toddlerBasePrice) != null;

  const effectiveChildren = childRateIsExplicit ? children : 0;
  const effectiveToddlers = toddlerRateIsExplicit ? toddlers : 0;

  const _effectiveAdultPrice = toNum(effectiveAdultPrice) ?? _adultPrice;
  const _effectiveTeenPrice =
    toNum(effectiveTeenPrice) ??
    toNum(teenBasePrice) ??
    _effectiveAdultPrice;
  const _effectiveChildPrice = toNum(effectiveChildPrice) ?? 0;
  const _effectiveToddlerPrice = toNum(effectiveToddlerPrice) ?? 0;

  // Always derive row subtotals from the *effective* (post-group-tier)
  // per-person rates. The engine's adultSubtotal/teenSubtotal are the
  // pre-adjustment base totals — using them here renders the base
  // amount next to the discounted per-person rate, which is what the
  // "subtotal shows ZAR 29400 but should show ZAR 28500" bug was.
  const adultRowSubtotal   = adults   * _effectiveAdultPrice;
  const teenRowSubtotal    = teens    * _effectiveTeenPrice;
  const childRowSubtotal   = effectiveChildren * _effectiveChildPrice;
  const toddlerRowSubtotal = effectiveToddlers * _effectiveToddlerPrice;

  const engineTourSubtotal =
    toNum(discountedTourTotal) ??
    adultRowSubtotal + teenRowSubtotal + childRowSubtotal + toddlerRowSubtotal;

  const baseTourSubtotal = toNum(originalSubtotal) ?? engineTourSubtotal;
  const groupAdjustmentAmount = engineTourSubtotal - baseTourSubtotal;
  const hasGroupAdjustment = Math.abs(groupAdjustmentAmount) > 0.005;
  const groupAdjustmentIsSaving = groupAdjustmentAmount < 0;

  const groupRateLabel =
    groupPricingType === "perPerson"
      ? `${formatCurrency(_effectiveAdultPrice)} per person`
      : groupPricingType === "groupTotal"
      ? "fixed group total"
      : `${(toNum(groupDiscountPercent) ?? 0).toFixed(0)}% off`;

  // ============================================================
  // GSAP ANIMATION
  // ============================================================

  useEffect(() => {
    if (activeDetail === "guests" && guestEmojisRef.current.length) {
      gsap.killTweensOf(guestEmojisRef.current);

      gsap.fromTo(
        guestEmojisRef.current,
        { scale: 0, opacity: 0, y: 20 },
        {
          scale: 1,
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.15,
          ease: "back.out(1.7)",
        }
      );
    }
  }, [activeDetail, adults, teens, effectiveChildren, effectiveToddlers]);

  // ============================================================
  // SCROLL TO CENTER SELECTED ICON BUTTON ON MOBILE
  // ============================================================

  const scrollToCenterButton = (key) => {
    const container = iconButtonsContainerRef.current;
    const button = iconButtonRefs.current[key];

    if (!container || !button) return;

    requestAnimationFrame(() => {
      const containerRect = container.getBoundingClientRect();
      const buttonRect = button.getBoundingClientRect();

      const scrollLeft =
        container.scrollLeft +
        buttonRect.left -
        containerRect.left -
        containerRect.width / 2 +
        buttonRect.width / 2;

      container.scrollTo({
        left: scrollLeft,
        behavior: "smooth",
      });
    });
  };

  // ============================================================
  // BREAKDOWN ROWS
  // ============================================================

  const breakdownItems = [
    {
      label: "Adults",
      count: adults,
      perPerson: _effectiveAdultPrice,
      subtotal: adultRowSubtotal,
      basePerPerson:
        Math.abs(_effectiveAdultPrice - _adultPrice) > 0.005
          ? _adultPrice
          : null,
    },
    {
      label: "Teens",
      count: teens,
      perPerson: _effectiveTeenPrice,
      subtotal: teenRowSubtotal,
      basePerPerson:
        Math.abs(_effectiveTeenPrice - (toNum(teenBasePrice) ?? _effectiveTeenPrice)) > 0.005
          ? toNum(teenBasePrice)
          : null,
    },
    {
      label: "Children",
      count: effectiveChildren,
      perPerson: _effectiveChildPrice,
      subtotal: childRowSubtotal,
      basePerPerson: null,
    },
    {
      label: "Toddlers",
      count: effectiveToddlers,
      perPerson: _effectiveToddlerPrice,
      subtotal: toddlerRowSubtotal,
      basePerPerson: null,
    },
  ].filter((item) => item.count > 0);

  // ============================================================
  // DETAILS DATA
  // ============================================================

  const detailItems = [
    { key: "tour",      icon: "🏝️", label: "Tour",      complete: true },
    { key: "traveller", icon: "👤", label: "Traveller", complete: contactDetailsComplete },
    { key: "date",      icon: "📅", label: "Date",      complete: dateDetailsComplete },
    { key: "guests",    icon: "👥", label: "Guests",    complete: true },
    { key: "pickup",    icon: "🚐", label: "Pickup",    complete: pickupDetailsComplete },
  ];

  // ---- Render rich content for each detail ----
  // All flex containers use `justify-center lg:justify-start` so the
  // selection details sit centered on tablet/mobile and left-align
  // from `lg` up (where the panel is beside the icons, not below).
  const renderDetailContent = (key) => {
    switch (key) {
      case "tour":
        return (
          <div className="flex flex-col items-center justify-center gap-3 text-center sm:flex-row lg:justify-start lg:text-left">
            {tour?.images?.[0] ? (
              <img
                src={resolveImage(tour.images[0])}
                alt={tour.title}
                className="w-12 h-12 rounded-full object-cover border-2 border-blue-200"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-2xl">
                🏝️
              </div>
            )}
            <div>
              <p className="text-sm font-bold text-neutral-900">
                {tour?.title || tour?.info || "Unnamed Tour"}
              </p>
            </div>
          </div>
        );
      case "traveller":
        return (
          <div className="text-center lg:text-left">
            <p className="text-sm font-bold text-neutral-900">
              {contactDetailsComplete ? formData?.fullName : "Details not completed"}
            </p>
            {contactDetailsComplete && (
              <>
                <p className="text-xs text-neutral-600">{formData?.email}</p>
                <p className="text-xs text-neutral-600">{formData?.mobile}</p>
              </>
            )}
          </div>
        );
      case "date":
        return (
          <div className="text-center lg:text-left">
            <p className="text-sm font-bold text-neutral-900">
              {formData?.date || "Select date"}
            </p>
            {dateDetailsComplete && formData?.time && (
              <p className="text-xs text-neutral-600">Start time: {formData.time}</p>
            )}
          </div>
        );
      case "guests":
        return (
          <div
            ref={guestContainerRef}
            className="flex flex-wrap items-center justify-center gap-4 lg:justify-start"
          >
            {adults > 0 && (
              <div className="flex items-center gap-1">
                <span
                  ref={(el) => (guestEmojisRef.current[0] = el)}
                  className="text-2xl"
                  style={{ opacity: 0, transform: "scale(0)" }}
                >
                  🧑
                </span>
                <span className="text-sm font-bold">×{adults}</span>
              </div>
            )}
            {teens > 0 && (
              <div className="flex items-center gap-1">
                <span
                  ref={(el) => (guestEmojisRef.current[1] = el)}
                  className="text-2xl"
                  style={{ opacity: 0, transform: "scale(0)" }}
                >
                  👦
                </span>
                <span className="text-sm font-bold">×{teens}</span>
              </div>
            )}
            {effectiveChildren > 0 && (
              <div className="flex items-center gap-1">
                <span
                  ref={(el) => (guestEmojisRef.current[2] = el)}
                  className="text-2xl"
                  style={{ opacity: 0, transform: "scale(0)" }}
                >
                  👧
                </span>
                <span className="text-sm font-bold">×{effectiveChildren}</span>
              </div>
            )}
            {effectiveToddlers > 0 && (
              <div className="flex items-center gap-1">
                <span
                  ref={(el) => (guestEmojisRef.current[3] = el)}
                  className="text-2xl"
                  style={{ opacity: 0, transform: "scale(0)" }}
                >
                  👶
                </span>
                <span className="text-sm font-bold">×{effectiveToddlers}</span>
              </div>
            )}
            {adults === 0 &&
              teens === 0 &&
              effectiveChildren === 0 &&
              effectiveToddlers === 0 && (
                <span className="text-sm text-neutral-500">No guests</span>
              )}
          </div>
        );
      case "pickup":
        return (
          <div className="text-center lg:text-left">
            <p className="text-sm font-bold text-neutral-900">
              {formData?.pickupLocation || "Choose pickup location"}
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  const activeDetailData =
    detailItems.find((d) => d.key === activeDetail) || detailItems[0];

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div
      ref={checkoutRef}
      className="border-t border-black/5 bg-white/92"
    >
      <div className="grid gap-3 grid-cols-1">
        <div className="rounded-2xl border border-black/10 bg-white p-4 text-neutral-950 shadow-[0_12px_30px_rgba(0,0,0,0.05)]">
          {/* HEADER — centered on mobile/tablet, left on lg */}
          <div className="flex items-center justify-center gap-2 mb-4 lg:justify-start">
            {CheckoutCartIcon && (
              <CheckoutCartIcon className="h-7 w-7 text-blue-600" />
            )}
            <p className="text-2xl font-frank font-bold text-neutral-800">
              Checkout summary
            </p>
          </div>

          {/* BOOKING DETAILS */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            {/* Icon buttons row — centered on mobile/tablet, left on lg.
                Outer div is the scrollable container (ref target);
                inner w-max mx-auto wrapper centers the buttons when
                they fit, and scrolls from the left when they don't
                (avoids the "justify-center + overflow hidden-left"
                trap on small screens). */}
            <div
              ref={iconButtonsContainerRef}
              className="overflow-x-auto pb-2 lg:overflow-visible lg:pb-0 scroll-smooth icon-scroll-container"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              <style>{`
                .icon-scroll-container::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
              <div className="flex w-max mx-auto flex-nowrap gap-2 lg:w-full lg:flex-wrap lg:gap-3">
                {detailItems.map((item) => {
                  const isActive = activeDetail === item.key;
                  const isComplete = item.complete;
                  return (
                    <button
                      key={item.key}
                      ref={(el) => {
                        if (el) {
                          iconButtonRefs.current[item.key] = el;
                        }
                      }}
                      onClick={() => {
                        setActiveDetail(item.key);
                        scrollToCenterButton(item.key);
                      }}
                      className={`
                        flex flex-col items-center justify-center
                        px-3 py-2 rounded-xl
                        min-w-[70px] flex-shrink-0
                        transition-all duration-200
                        ${
                          isActive
                            ? "bg-blue-600 text-white shadow-md scale-105"
                            : isComplete
                            ? "bg-neutral-50 text-neutral-600 hover:bg-neutral-100 hover:scale-105"
                            : "bg-neutral-100 text-neutral-400 opacity-60 hover:bg-neutral-200"
                        }
                      `}
                    >
                      <span className="text-xl">{item.icon}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wide mt-0.5">
                        {item.label}
                      </span>
                      {!isComplete && (
                        <span className="text-[10px] mt-0.5 text-amber-500">⚠️</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Value panel — centered content on mobile/tablet,
                left-aligned on lg. */}
            <div className="flex-1 relative z-40">
              <div
                className={`
                  rounded-xl p-4 z-30 text-center lg:text-left
                  transition-all duration-300 ease-out
                  ${
                    activeDetailData.complete
                      ? "bg-neutral-50 border-l-4 border-blue-500"
                      : "bg-neutral-100 border-l-4 border-amber-400"
                  }
                `}
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-400">
                  {activeDetailData.label}
                </p>
                <div className="mt-1">
                  {renderDetailContent(activeDetailData.key)}
                </div>
                {!activeDetailData.complete && (
                  <p className="mt-2 flex items-center justify-center gap-1 text-xs font-medium text-amber-600 lg:justify-start">
                    ⚠️ Incomplete – please fill in this field
                  </p>
                )}
              </div>
              <div
                className="z-[-1] absolute -bottom-2 left-1/2 -translate-x-1/2 w-3/4 h-4 rounded-full bg-black/20 blur-lg pointer-events-none"
                style={{ filter: "blur(6px)" }}
              />
            </div>
          </div>

          {/* ====================================================
              PRICE BREAKDOWN + TOTAL
          ==================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6 mt-6">

            {/* ───────── LEFT — PRICE BREAKDOWN ───────── */}
            <div className="lg:col-span-2 rounded-3xl border border-black/5 bg-gradient-to-b from-stone-50 to-stone-100/70 p-4 sm:p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">

              {/* <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-100 text-lg">
                    💰
                  </span>
                  <h4 className="text-base sm:text-lg font-black uppercase tracking-[0.16em] text-neutral-800">
                    Price breakdown
                  </h4>
                </div>

                {hasGroupAdjustment && groupAdjustmentIsSaving && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 px-3.5 py-1.5 text-xs sm:text-sm font-black uppercase tracking-wider text-white shadow-[0_4px_14px_rgba(34,197,94,0.35)]">
                    <span>🎉</span>
                    <span>Save {formatCurrency(Math.abs(groupAdjustmentAmount))}</span>
                  </span>
                )}
              </div> */}

              <div className="space-y-2.5">
                {breakdownItems.map((item) => {
                  const hasItemDiscount = item.basePerPerson != null;
                  const baseTotal = hasItemDiscount
                    ? item.basePerPerson * item.count
                    : null;

                  return (
                    <div
                      key={item.label}
                      className={`relative overflow-hidden rounded-2xl border px-4 py-3.5 transition-all duration-200 sm:px-5 sm:py-4 ${
                        hasItemDiscount
                          ? "border-green-200 bg-gradient-to-r from-green-50 via-emerald-50/70 to-white shadow-[0_4px_16px_rgba(34,197,94,0.08)]"
                          : "border-black/5 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
                      }`}
                    >
                      {hasItemDiscount && (
                        <span className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-green-400 to-emerald-500" />
                      )}

                      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
                        <div className="min-w-0 flex-1">
                          <p
                            className={`text-base font-black leading-tight sm:text-lg ${
                              hasItemDiscount
                                ? "text-green-900"
                                : "text-neutral-900"
                            }`}
                          >
                            {item.label}
                          </p>

                          <p className="mt-1 text-xs font-semibold text-neutral-500 sm:text-sm">
                            <span className="tabular-nums">
                              {item.count} ×{" "}
                            </span>
                            {hasItemDiscount ? (
                              <>
                                <span className="line-through text-neutral-400">
                                  {formatCurrency(item.basePerPerson)}
                                </span>{" "}
                                <span className="font-black text-green-700">
                                  {formatCurrency(item.perPerson)}
                                </span>
                              </>
                            ) : (
                              <span className="font-bold text-neutral-700">
                                {formatCurrency(item.perPerson)}
                              </span>
                            )}
                          </p>
                        </div>

                        <div className="shrink-0 text-right">
                          {hasItemDiscount && baseTotal != null ? (
                            <>
                              <p className="text-xs font-semibold text-neutral-400 line-through tabular-nums sm:text-sm">
                                {formatCurrency(baseTotal)}
                              </p>
                              <p className="text-xl font-black leading-tight text-green-700 tabular-nums sm:text-2xl">
                                {formatCurrency(item.subtotal)}
                              </p>
                            </>
                          ) : (
                            <p className="text-xl font-black leading-tight text-neutral-900 tabular-nums sm:text-2xl">
                              {formatCurrency(item.subtotal)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div
                className={`mt-4 rounded-2xl border px-4 py-4 sm:px-5 sm:py-5 ${
                  hasGroupAdjustment
                    ? "border-green-300 bg-gradient-to-r from-green-100 via-emerald-50 to-white shadow-[0_6px_22px_rgba(34,197,94,0.12)]"
                    : "border-black/5 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.03)]"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
                  <div>
                    <p
                      className={`text-base font-black uppercase tracking-wider sm:text-lg ${
                        hasGroupAdjustment
                          ? "text-green-900"
                          : "text-neutral-900"
                      }`}
                    >
                      Tour subtotal
                    </p>
                    {hasGroupAdjustment && (
                      <p className="mt-0.5 text-xs font-bold text-green-700 sm:text-sm">
                        After group rate
                      </p>
                    )}
                  </div>

                  <div className="text-right">
                    {hasGroupAdjustment ? (
                      <>
                        <p className="text-sm font-semibold text-neutral-400 line-through tabular-nums">
                          {formatCurrency(baseTourSubtotal)}
                        </p>
                        <p className="text-2xl font-black leading-tight text-green-700 tabular-nums sm:text-3xl">
                          {formatCurrency(engineTourSubtotal)}
                        </p>
                      </>
                    ) : (
                      <p className="text-2xl font-black leading-tight text-neutral-900 tabular-nums sm:text-3xl">
                        {formatCurrency(engineTourSubtotal)}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {hasGroupAdjustment && groupAdjustmentIsSaving && (
                <div className="mt-3 flex items-center gap-3 rounded-2xl border border-green-300 bg-gradient-to-r from-green-100 to-emerald-50 px-4 py-3.5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 text-lg text-white shadow-[0_4px_12px_rgba(34,197,94,0.35)]">
                    🎉
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-black text-green-900 sm:text-base">
                      Group rate applied
                    </p>
                    <p className="mt-0.5 text-xs font-semibold text-green-800 sm:text-sm">
                      {groupRateLabel}
                      {qualifyingHeadcount != null &&
                        ` · ${qualifyingHeadcount} qualifying guests`}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-white/80 px-3 py-1.5 text-sm font-black text-green-700 tabular-nums sm:text-base">
                    −{formatCurrency(Math.abs(groupAdjustmentAmount))}
                  </span>
                </div>
              )}

              {hasGroupAdjustment && !groupAdjustmentIsSaving && (
                <div className="mt-3 flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3.5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-200 text-lg text-amber-900">
                    ℹ️
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-black text-amber-900 sm:text-base">
                      Group rate applied
                    </p>
                    <p className="mt-0.5 text-xs font-semibold text-amber-800 sm:text-sm">
                      {groupRateLabel}
                      {qualifyingHeadcount != null &&
                        ` · ${qualifyingHeadcount} qualifying guests`}
                      . Rates shown above already reflect this adjustment.
                    </p>
                  </div>
                </div>
              )}

              {privateFee > 0 && (
                <div className="mt-3 flex items-center justify-between rounded-2xl border border-black/5 bg-white px-4 py-3 sm:px-5">
                  <span className="text-sm font-bold text-neutral-700 sm:text-base">
                    Private tour fee
                  </span>
                  <span className="text-base font-black text-neutral-900 tabular-nums sm:text-lg">
                    {displayActivePrivateFee.replace("+", "")}
                  </span>
                </div>
              )}
              {customFee > 0 && (
                <div className="mt-3 flex items-center justify-between rounded-2xl border border-black/5 bg-white px-4 py-3 sm:px-5">
                  <span className="text-sm font-bold text-neutral-700 sm:text-base">
                    Custom trip fee
                  </span>
                  <span className="text-base font-black text-neutral-900 tabular-nums sm:text-lg">
                    {displayActiveCustomFee.replace("+", "")}
                  </span>
                </div>
              )}

              {extrasBreakdown.length > 0 && (
                <div className="mt-3 rounded-2xl border border-black/5 bg-white p-4 sm:p-5">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-neutral-500">
                    Optional Extras
                  </p>
                  <div className="mt-3 space-y-2">
                    {extrasBreakdown.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-3 text-sm sm:text-base"
                      >
                        <span className="font-semibold text-neutral-700">
                          {item.label}
                        </span>
                        <span className="font-bold text-neutral-900 tabular-nums">
                          {item.formattedCost}
                        </span>
                      </div>
                    ))}
                    <div className="mt-3 flex items-center justify-between border-t border-black/5 pt-3 text-sm sm:text-base">
                      <span className="font-black uppercase tracking-wider text-neutral-900">
                        Extras total
                      </span>
                      <span className="font-black text-neutral-900 tabular-nums">
                        {displayExtrasTotal}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {selectedKidsActivity && (
                <div className="mt-3 rounded-2xl border border-blue-100 bg-blue-50 p-4 sm:p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-xs font-black uppercase tracking-[0.14em] text-blue-500">
                        Kids activity
                      </p>
                      <p className="mt-1 truncate text-base font-black text-blue-950 sm:text-lg">
                        {selectedKidsActivity.name}
                      </p>
                      <p className="mt-0.5 text-xs font-semibold text-blue-700 sm:text-sm">
                        {selectedKidsActivity.category}
                        {selectedKidsActivity.location
                          ? ` · ${selectedKidsActivity.location}`
                          : ""}
                      </p>
                    </div>
                    <span className="shrink-0 text-base font-black text-blue-700 tabular-nums sm:text-lg">
                      + {displayKidsActivityTotal}
                    </span>
                  </div>
                  <div className="mt-4 grid gap-2.5 sm:grid-cols-3">
                    <div className="rounded-xl bg-white/80 p-3">
                      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-blue-500">
                        Adults
                      </p>
                      <p className="mt-1 text-xs font-semibold text-blue-700">
                        {adults} × {formatCurrency(kidsActivityAdultPrice)}
                      </p>
                      <p className="mt-1 text-base font-black text-blue-950 tabular-nums">
                        {formatCurrency(kidsActivityAdultTotal)}
                      </p>
                    </div>
                    <div className="rounded-xl bg-white/80 p-3">
                      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-blue-500">
                        Children
                      </p>
                      <p className="mt-1 text-xs font-semibold text-blue-700">
                        {effectiveChildren} × {formatCurrency(kidsActivityChildPrice)}
                      </p>
                      <p className="mt-1 text-base font-black text-blue-950 tabular-nums">
                        {formatCurrency(kidsActivityChildTotal)}
                      </p>
                    </div>
                    <div className="rounded-xl bg-white/80 p-3">
                      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-blue-500">
                        Toddlers
                      </p>
                      <p className="mt-1 text-xs font-semibold text-blue-700">
                        {effectiveToddlers} × {formatCurrency(kidsActivityToddlerPrice)}
                      </p>
                      <p className="mt-1 text-base font-black text-blue-950 tabular-nums">
                        {formatCurrency(kidsActivityToddlerTotal)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {isCustomQuote && (
                <div className="mt-3 rounded-2xl border border-blue-200 bg-blue-50 p-4">
                  <p className="text-base font-black text-blue-900">
                    Custom quote required
                  </p>
                  <p className="mt-1 text-sm leading-6 font-medium text-blue-700">
                    {matchedGroupTier?.note ||
                      "This group size requires a custom quote. The final price will be confirmed with you before payment."}
                  </p>
                </div>
              )}

              {hasOptions && !selectedTourOption && (
                <div className="mt-3 rounded-2xl border border-blue-200 bg-blue-50 p-4">
                  <p className="text-base font-black text-blue-900">
                    Select an option
                  </p>
                  <p className="mt-1 text-sm leading-6 font-medium text-blue-700">
                    Choose your preferred experience above before continuing to
                    checkout.
                  </p>
                </div>
              )}
            </div>

            {/* ───────── RIGHT — TOTAL + CHECKOUT ───────── */}
            <div className="lg:col-span-1">
              <div className="sticky top-4 overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-650 to-indigo-700 p-5 text-white shadow-[0_20px_50px_rgba(37,99,235,0.35)] sm:p-6">
                <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10 blur-3xl" />

                <div className="relative">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-white/70 sm:text-sm">
                    Total Due
                  </p>
                  <p className="mt-1.5 font-frank text-4xl font-black leading-none tabular-nums sm:text-5xl">
                    {displayTotal}
                  </p>

                  {hasGroupAdjustment && groupAdjustmentIsSaving && (
                    <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-black uppercase tracking-wider text-green-100 backdrop-blur-sm">
                      🎉 You save {formatCurrency(Math.abs(groupAdjustmentAmount))}
                    </p>
                  )}

                  <div className="mt-5 space-y-2 border-t border-white/20 pt-4 text-sm sm:text-base">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-medium text-white/80">Tour subtotal</span>
                      <span className="font-black tabular-nums">
                        {formatCurrency(engineTourSubtotal)}
                      </span>
                    </div>

                    {privateFee > 0 && (
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-medium text-white/80">Private fee</span>
                        <span className="font-black tabular-nums">
                          {displayActivePrivateFee.replace("+", "")}
                        </span>
                      </div>
                    )}

                    {customFee > 0 && (
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-medium text-white/80">Custom fee</span>
                        <span className="font-black tabular-nums">
                          {displayActiveCustomFee.replace("+", "")}
                        </span>
                      </div>
                    )}

                    {extrasTotal > 0 && (
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-medium text-white/80">Extras</span>
                        <span className="font-black tabular-nums">
                          {displayExtrasTotal}
                        </span>
                      </div>
                    )}

                    {selectedKidsActivity && (
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-medium text-white/80">Activity</span>
                        <span className="font-black tabular-nums">
                          {displayKidsActivityTotal}
                        </span>
                      </div>
                    )}
                  </div>

                  {submitError && (
                    <p className="mt-4 rounded-xl border border-red-300 bg-red-50 p-3 text-xs font-bold text-red-700 sm:text-sm">
                      {submitError}
                    </p>
                  )}

                  <button
                    type="submit"
                    form="booking-form"
                    disabled={(hasOptions && !selectedTourOption) || submitting}
                    className="mt-6 w-full rounded-2xl bg-white py-4 text-center text-sm font-black uppercase tracking-wider text-blue-700 shadow-[0_10px_24px_rgba(0,0,0,0.18)] transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_14px_30px_rgba(0,0,0,0.22)] disabled:opacity-50 disabled:hover:scale-100"
                  >
                    {submitting
                      ? "Verifying price..."
                      : isCustomQuote
                      ? "Request custom quote"
                      : hasOptions && !selectedTourOption
                      ? "Select option"
                      : "Continue to checkout"}
                  </button>

                  <div className="mt-4 flex justify-center gap-3 text-[10px] font-black uppercase tracking-[0.16em] text-white/60">
                    <span>Terms</span>
                    <span>Privacy</span>
                    <span className="rounded-full bg-white/20 px-2.5 py-1 text-white">
                      Paystack
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSummary;