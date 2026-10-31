// src/components/CheckoutSummary.jsx

import { useMemo, useState, useRef, useEffect } from "react";
import gsap from "gsap";
import { KIDS_ACTIVITIES } from "../data/kidsActivities";
import { resolveImage } from "../utils/ImageLoader.js";

// Single source of truth for pricing math — the same function
// /api/verify-price uses server-side.
import { computePricing } from "../utils/pricingEngine.js";

// ============================================================
// Layout modes
//   default  → original two-column layout (breakdown | sticky total)
//   stacked  → one centred column (breakdown, then total card).
//              Use this inside a bottom sheet / narrow container.
//
// Pay button
//   onSubmit → button is type="button" and calls onSubmit (used by the
//              Tours page to go straight to Paystack).
//   no onSubmit → original behaviour: submits <form id="booking-form">.
//   hideSubmit → no button at all (parent renders its own pay bar).
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
  verifyStatus = "idle", // "idle" | "pending" | "verified" | "failed"
  verifyError = "",

  stacked = false,
  onSubmit = null,
  hideSubmit = false,
  payLabel = null,
}) => {
  const [activeDetail, setActiveDetail] = useState("tour");

  const guestEmojisRef = useRef([]);
  const guestContainerRef = useRef(null);
  const iconButtonsContainerRef = useRef(null);
  const iconButtonRefs = useRef({});

  // ============================================================
  // PRICING — delegated entirely to pricingEngine
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      tour,
      JSON.stringify(childAges),
      adultCount,
      currency,
      selectedOption,
      JSON.stringify(selectedExtras),
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
    privateFee,
    customFee,
    extrasTotal,
    currency: resolvedCurrency,

    adultPrice,
    teenPrice: teenBasePrice,
    childPrice: childBasePrice,
    toddlerPrice: toddlerBasePrice,

    effectiveAdultPrice,
    effectiveTeenPrice,
    effectiveChildPrice,
    effectiveToddlerPrice,

    originalSubtotal,
    discountedSubtotal: discountedTourTotal,

    displayExtrasTotal,
    displayKidsActivityTotal,
    displayTotal,
  } = engineResult;

  const formatCurrency = (amount) => {
    const n = Number(amount);
    return `${resolvedCurrency} ${(Number.isFinite(n) ? n : 0).toFixed(2)}`;
  };

  const displayActivePrivateFee = privateFee > 0 ? formatCurrency(privateFee) : "—";
  const displayActiveCustomFee = customFee > 0 ? formatCurrency(customFee) : "—";

  // ============================================================
  // NORMALISATION
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
    toNum(effectiveTeenPrice) ?? toNum(teenBasePrice) ?? _effectiveAdultPrice;
  const _effectiveChildPrice = toNum(effectiveChildPrice) ?? 0;
  const _effectiveToddlerPrice = toNum(effectiveToddlerPrice) ?? 0;

  // Row subtotals come from effective (post-group-tier) rates so the
  // base amount is never shown next to the discounted per-person rate.
  const adultRowSubtotal = adults * _effectiveAdultPrice;
  const teenRowSubtotal = teens * _effectiveTeenPrice;
  const childRowSubtotal = effectiveChildren * _effectiveChildPrice;
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
  // GSAP — guest emoji pop
  // ============================================================

  useEffect(() => {
    if (activeDetail === "guests" && guestEmojisRef.current.length) {
      const targets = guestEmojisRef.current.filter(Boolean);
      gsap.killTweensOf(targets);
      gsap.fromTo(
        targets,
        { scale: 0, opacity: 0, y: 20 },
        { scale: 1, opacity: 1, y: 0, duration: 0.5, stagger: 0.15, ease: "back.out(1.7)" },
      );
    }
  }, [activeDetail, adults, teens, effectiveChildren, effectiveToddlers]);

  const scrollToCenterButton = (key) => {
    const container = iconButtonsContainerRef.current;
    const button = iconButtonRefs.current[key];
    if (!container || !button) return;

    requestAnimationFrame(() => {
      const containerRect = container.getBoundingClientRect();
      const buttonRect = button.getBoundingClientRect();
      const left =
        container.scrollLeft +
        buttonRect.left -
        containerRect.left -
        containerRect.width / 2 +
        buttonRect.width / 2;
      container.scrollTo({ left, behavior: "smooth" });
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
        Math.abs(_effectiveAdultPrice - _adultPrice) > 0.005 ? _adultPrice : null,
    },
    {
      label: "Teens",
      count: teens,
      perPerson: _effectiveTeenPrice,
      subtotal: teenRowSubtotal,
      basePerPerson:
        Math.abs(
          _effectiveTeenPrice - (toNum(teenBasePrice) ?? _effectiveTeenPrice),
        ) > 0.005
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
  // DETAIL TABS
  // ============================================================

  const detailItems = [
    { key: "tour", icon: "🏝️", label: "Tour", complete: true },
    { key: "traveller", icon: "👤", label: "Traveller", complete: contactDetailsComplete },
    { key: "date", icon: "📅", label: "Date", complete: dateDetailsComplete },
    { key: "guests", icon: "👥", label: "Guests", complete: true },
    { key: "pickup", icon: "🚐", label: "Pickup", complete: pickupDetailsComplete },
  ];

  const tourThumb = tour?.image || tour?.images?.[0];

  const guestRows = [
    { show: adults > 0, emoji: "🧑", count: adults },
    { show: teens > 0, emoji: "👦", count: teens },
    { show: effectiveChildren > 0, emoji: "👧", count: effectiveChildren },
    { show: effectiveToddlers > 0, emoji: "👶", count: effectiveToddlers },
  ];

  const renderDetailContent = (key) => {
    switch (key) {
      case "tour":
        return (
          <div className="flex flex-col items-center justify-center gap-3 text-center sm:flex-row lg:justify-start lg:text-left">
            {tourThumb ? (
              <img
                src={resolveImage(tourThumb)}
                alt={tour?.title || ""}
                className="h-12 w-12 rounded-full border-2 border-blue-200 object-cover"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-2xl">
                🏝️
              </div>
            )}
            <p className="text-sm font-bold text-neutral-900">
              {tour?.title || tour?.info || "Unnamed Tour"}
            </p>
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
            {guestRows.map((row, i) =>
              row.show ? (
                <div key={i} className="flex items-center gap-1">
                  <span
                    ref={(el) => (guestEmojisRef.current[i] = el)}
                    className="text-2xl"
                    style={{ opacity: 0, transform: "scale(0)" }}
                  >
                    {row.emoji}
                  </span>
                  <span className="text-sm font-bold">×{row.count}</span>
                </div>
              ) : null,
            )}
            {guestRows.every((r) => !r.show) && (
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
  // BUTTON STATE
  // ============================================================

  const buttonDisabled =
    submitting ||
    verifyStatus === "pending" ||
    (hasOptions && !selectedTourOption) ||
    (!isCustomQuote && verifyStatus !== "verified" && verifyStatus !== "failed");

  const buttonLabel = (() => {
    if (submitting || verifyStatus === "pending") return "Verifying price…";
    if (isCustomQuote) return "Request custom quote";
    if (hasOptions && !selectedTourOption) return "Select option";
    if (verifyStatus === "failed") return "Retry verification";
    if (verifyStatus === "idle") return "Complete your details";
    return payLabel || "Continue to checkout";
  })();

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div
      ref={checkoutRef}
      className={`border-t border-black/5 bg-white/92 ${
        stacked ? "rounded-t-[2rem]" : ""
      }`}
    >
      <div className="grid grid-cols-1 gap-3">
        <div className="rounded-2xl border border-black/10 bg-white p-4 text-neutral-950 shadow-[0_12px_30px_rgba(0,0,0,0.05)]">
          {/* HEADER */}
          <div
            className={`mb-4 flex items-center justify-center gap-2 ${
              stacked ? "" : "lg:justify-start"
            }`}
          >
            {CheckoutCartIcon && <CheckoutCartIcon className="h-7 w-7 text-blue-600" />}
            <p className="font-frank text-2xl font-bold text-neutral-800">
              Checkout summary
            </p>
          </div>

          {/* BOOKING DETAILS */}
          <div className={`mb-6 flex flex-col gap-4 ${stacked ? "" : "lg:flex-row"}`}>
            <div
              ref={iconButtonsContainerRef}
              className={`icon-scroll-container scroll-smooth overflow-x-auto pb-2 ${
                stacked ? "" : "lg:overflow-visible lg:pb-0"
              }`}
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              <style>{`
                .icon-scroll-container::-webkit-scrollbar { display: none; }
              `}</style>
              <div
                className={`mx-auto flex w-max flex-nowrap gap-2 ${
                  stacked ? "" : "lg:w-full lg:flex-wrap lg:gap-3"
                }`}
              >
                {detailItems.map((item) => {
                  const isActive = activeDetail === item.key;
                  const isComplete = item.complete;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      ref={(el) => {
                        if (el) iconButtonRefs.current[item.key] = el;
                      }}
                      onClick={() => {
                        setActiveDetail(item.key);
                        scrollToCenterButton(item.key);
                      }}
                      className={`flex min-w-[70px] flex-shrink-0 flex-col items-center justify-center rounded-xl px-3 py-2 transition-all duration-200 ${
                        isActive
                          ? "scale-105 bg-blue-600 text-white shadow-md"
                          : isComplete
                            ? "bg-neutral-50 text-neutral-600 hover:scale-105 hover:bg-neutral-100"
                            : "bg-neutral-100 text-neutral-400 opacity-60 hover:bg-neutral-200"
                      }`}
                    >
                      <span className="text-xl">{item.icon}</span>
                      <span className="mt-0.5 text-[10px] font-bold uppercase tracking-wide">
                        {item.label}
                      </span>
                      {!isComplete && (
                        <span className="mt-0.5 text-[10px] text-amber-500">⚠️</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="relative z-40 flex-1">
              <div
                className={`z-30 rounded-xl p-4 text-center transition-all duration-300 ease-out ${
                  stacked ? "" : "lg:text-left"
                } ${
                  activeDetailData.complete
                    ? "border-l-4 border-blue-500 bg-neutral-50"
                    : "border-l-4 border-amber-400 bg-neutral-100"
                }`}
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-400">
                  {activeDetailData.label}
                </p>
                <div className="mt-1">{renderDetailContent(activeDetailData.key)}</div>
                {!activeDetailData.complete && (
                  <p
                    className={`mt-2 flex items-center justify-center gap-1 text-xs font-medium text-amber-600 ${
                      stacked ? "" : "lg:justify-start"
                    }`}
                  >
                    ⚠️ Incomplete – please fill in this field
                  </p>
                )}
              </div>
              <div
                className="pointer-events-none absolute -bottom-2 left-1/2 z-[-1] h-4 w-3/4 -translate-x-1/2 rounded-full bg-black/20"
                style={{ filter: "blur(6px)" }}
              />
            </div>
          </div>

          {/* PRICE BREAKDOWN + TOTAL */}
          <div
            className={`mt-6 grid grid-cols-1 gap-5 ${
              stacked ? "" : "lg:grid-cols-3 lg:gap-6"
            }`}
          >
            {/* BREAKDOWN */}
            <div
              className={`rounded-3xl border border-black/5 bg-gradient-to-b from-stone-50 to-stone-100/70 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] sm:p-6 ${
                stacked ? "" : "lg:col-span-2"
              }`}
            >
              <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-100 text-lg">
                    💰
                  </span>
                  <h4 className="text-base font-black uppercase tracking-[0.16em] text-neutral-800 sm:text-lg">
                    Price breakdown
                  </h4>
                </div>

                {hasGroupAdjustment && groupAdjustmentIsSaving && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 px-3.5 py-1.5 text-xs font-black uppercase tracking-wider text-white shadow-[0_4px_14px_rgba(34,197,94,0.35)] sm:text-sm">
                    <span>🎉</span>
                    <span>Save {formatCurrency(Math.abs(groupAdjustmentAmount))}</span>
                  </span>
                )}
              </div>

              <div className="space-y-2.5">
                {breakdownItems.map((item) => {
                  const hasItemDiscount = item.basePerPerson != null;
                  const baseTotal = hasItemDiscount ? item.basePerPerson * item.count : null;

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
                              hasItemDiscount ? "text-green-900" : "text-neutral-900"
                            }`}
                          >
                            {item.label}
                          </p>

                          <p className="mt-1 text-xs font-semibold text-neutral-500 sm:text-sm">
                            <span className="tabular-nums">{item.count} × </span>
                            {hasItemDiscount ? (
                              <>
                                <span className="text-neutral-400 line-through">
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
                              <p className="text-xs font-semibold tabular-nums text-neutral-400 line-through sm:text-sm">
                                {formatCurrency(baseTotal)}
                              </p>
                              <p className="text-xl font-black leading-tight tabular-nums text-green-700 sm:text-2xl">
                                {formatCurrency(item.subtotal)}
                              </p>
                            </>
                          ) : (
                            <p className="text-xl font-black leading-tight tabular-nums text-neutral-900 sm:text-2xl">
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
                        hasGroupAdjustment ? "text-green-900" : "text-neutral-900"
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
                        <p className="text-sm font-semibold tabular-nums text-neutral-400 line-through">
                          {formatCurrency(baseTourSubtotal)}
                        </p>
                        <p className="text-2xl font-black leading-tight tabular-nums text-green-700 sm:text-3xl">
                          {formatCurrency(engineTourSubtotal)}
                        </p>
                      </>
                    ) : (
                      <p className="text-2xl font-black leading-tight tabular-nums text-neutral-900 sm:text-3xl">
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
                      {qualifyingHeadcount != null && ` · ${qualifyingHeadcount} qualifying guests`}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-white/80 px-3 py-1.5 text-sm font-black tabular-nums text-green-700 sm:text-base">
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
                      {qualifyingHeadcount != null && ` · ${qualifyingHeadcount} qualifying guests`}
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
                  <span className="text-base font-black tabular-nums text-neutral-900 sm:text-lg">
                    {displayActivePrivateFee}
                  </span>
                </div>
              )}
              {customFee > 0 && (
                <div className="mt-3 flex items-center justify-between rounded-2xl border border-black/5 bg-white px-4 py-3 sm:px-5">
                  <span className="text-sm font-bold text-neutral-700 sm:text-base">
                    Custom trip fee
                  </span>
                  <span className="text-base font-black tabular-nums text-neutral-900 sm:text-lg">
                    {displayActiveCustomFee}
                  </span>
                </div>
              )}

              {extrasBreakdown.length > 0 && (
                <div className="mt-3 rounded-2xl border border-black/5 bg-white p-4 sm:p-5">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-neutral-500">
                    Optional extras
                  </p>
                  <div className="mt-3 space-y-2">
                    {extrasBreakdown.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-3 text-sm sm:text-base"
                      >
                        <span className="font-semibold text-neutral-700">{item.label}</span>
                        <span className="font-bold tabular-nums text-neutral-900">
                          {item.formattedCost}
                        </span>
                      </div>
                    ))}
                    <div className="mt-3 flex items-center justify-between border-t border-black/5 pt-3 text-sm sm:text-base">
                      <span className="font-black uppercase tracking-wider text-neutral-900">
                        Extras total
                      </span>
                      <span className="font-black tabular-nums text-neutral-900">
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
                        {selectedKidsActivity.location ? ` · ${selectedKidsActivity.location}` : ""}
                      </p>
                    </div>
                    <span className="shrink-0 text-base font-black tabular-nums text-blue-700 sm:text-lg">
                      + {displayKidsActivityTotal}
                    </span>
                  </div>
                  <div className="mt-4 grid gap-2.5 sm:grid-cols-3">
                    {[
                      ["Adults", adults, kidsActivityAdultPrice, kidsActivityAdultTotal],
                      ["Children", effectiveChildren, kidsActivityChildPrice, kidsActivityChildTotal],
                      ["Toddlers", effectiveToddlers, kidsActivityToddlerPrice, kidsActivityToddlerTotal],
                    ].map(([label, count, price, total]) => (
                      <div key={label} className="rounded-xl bg-white/80 p-3">
                        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-blue-500">
                          {label}
                        </p>
                        <p className="mt-1 text-xs font-semibold text-blue-700">
                          {count} × {formatCurrency(price)}
                        </p>
                        <p className="mt-1 text-base font-black tabular-nums text-blue-950">
                          {formatCurrency(total)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {isCustomQuote && (
                <div className="mt-3 rounded-2xl border border-blue-200 bg-blue-50 p-4">
                  <p className="text-base font-black text-blue-900">Custom quote required</p>
                  <p className="mt-1 text-sm font-medium leading-6 text-blue-700">
                    {matchedGroupTier?.note ||
                      "This group size requires a custom quote. The final price will be confirmed with you before payment."}
                  </p>
                </div>
              )}

              {hasOptions && !selectedTourOption && (
                <div className="mt-3 rounded-2xl border border-blue-200 bg-blue-50 p-4">
                  <p className="text-base font-black text-blue-900">Select an option</p>
                  <p className="mt-1 text-sm font-medium leading-6 text-blue-700">
                    Choose your preferred experience above before continuing to checkout.
                  </p>
                </div>
              )}
            </div>

            {/* TOTAL (+ pay button unless hidden) */}
            <div className={stacked ? "" : "lg:col-span-1"}>
              <div
                className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 p-5 text-white shadow-[0_20px_50px_rgba(37,99,235,0.35)] sm:p-6 ${
                  stacked ? "mx-auto max-w-xl" : "sticky top-4"
                }`}
              >
                <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10 blur-3xl" />

                <div className="relative">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-white/70 sm:text-sm">
                    Total due
                  </p>
                  <p className="mt-1.5 font-frank text-4xl font-black leading-none tabular-nums sm:text-5xl">
                    {isCustomQuote ? "Custom quote" : displayTotal}
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
                        <span className="font-black tabular-nums">{displayActivePrivateFee}</span>
                      </div>
                    )}

                    {customFee > 0 && (
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-medium text-white/80">Custom fee</span>
                        <span className="font-black tabular-nums">{displayActiveCustomFee}</span>
                      </div>
                    )}

                    {extrasTotal > 0 && (
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-medium text-white/80">Extras</span>
                        <span className="font-black tabular-nums">{displayExtrasTotal}</span>
                      </div>
                    )}

                    {selectedKidsActivity && (
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-medium text-white/80">Activity</span>
                        <span className="font-black tabular-nums">{displayKidsActivityTotal}</span>
                      </div>
                    )}
                  </div>

                  {/* Pre-flight verification indicator (not for custom quotes) */}
                  {!isCustomQuote && verifyStatus !== "idle" && (
                    <div
                      className={`mt-4 flex items-start gap-2 rounded-xl border px-3 py-2.5 text-xs font-semibold ${
                        verifyStatus === "verified"
                          ? "border-green-300 bg-green-50 text-green-800"
                          : verifyStatus === "failed"
                            ? "border-red-300 bg-red-50 text-red-700"
                            : "border-amber-200 bg-amber-50 text-amber-800"
                      }`}
                    >
                      {verifyStatus === "pending" && (
                        <>
                          <span className="mt-[2px] inline-block h-3 w-3 shrink-0 animate-spin rounded-full border-2 border-amber-300 border-t-amber-700" />
                          <span>Verifying price…</span>
                        </>
                      )}
                      {verifyStatus === "verified" && (
                        <>
                          <span className="shrink-0 text-sm leading-none">✓</span>
                          <span>Price verified — ready for payment.</span>
                        </>
                      )}
                      {verifyStatus === "failed" && (
                        <>
                          <span className="shrink-0 text-sm leading-none">⚠</span>
                          <span>
                            {verifyError || "Price verification failed."} Tap retry to try again.
                          </span>
                        </>
                      )}
                    </div>
                  )}

                  {submitError && (
                    <p className="mt-3 rounded-xl border border-red-300 bg-red-50 p-3 text-xs font-semibold text-red-700">
                      {submitError}
                    </p>
                  )}

                  {!hideSubmit && (
                    <button
                      type={onSubmit ? "button" : "submit"}
                      form={onSubmit ? undefined : "booking-form"}
                      onClick={onSubmit || undefined}
                      disabled={buttonDisabled}
                      className={`mt-4 w-full rounded-2xl py-4 text-center text-sm font-black uppercase tracking-wider shadow-[0_10px_24px_rgba(0,0,0,0.18)] transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_14px_30px_rgba(0,0,0,0.22)] disabled:opacity-50 disabled:hover:scale-100 ${
                        verifyStatus === "failed"
                          ? "bg-red-600 text-white hover:bg-red-700"
                          : "bg-white text-blue-700"
                      }`}
                    >
                      {buttonLabel}
                    </button>
                  )}

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