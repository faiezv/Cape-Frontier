// src/components/CheckoutSummary.jsx

import { useMemo, useState, useRef, useEffect } from "react";
import gsap from "gsap";
import { KIDS_ACTIVITIES } from "../../data/kidsActivities.js";
import { resolveImage } from "../../utils/ImageLoader.js";

import { computePricing } from "../../utils/pricingEngine.js";

const CheckoutSummary = ({
  tour,

  adultCount,
  childCount,
  toddlerCount = 0,

  currency = "ZAR",
  live,

  selectedOption,
  selectedExtras = {},
  onExtrasChange,

  formData,

  contactDetailsComplete,
  dateDetailsComplete,
  pickupDetailsComplete,

  isEmbedded = false,
  CheckoutCartIcon = null,
  checkoutRef = null,

  submitting = false,
  submitError = "",
  verifyStatus = "idle",
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
  // PRICING
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
        live,
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
      live,
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
        { scale: 0, opacity: 0, y: 12 },
        { scale: 1, opacity: 1, y: 0, duration: 0.4, stagger: 0.1, ease: "back.out(1.6)" },
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
          <div className="flex flex-col items-center gap-2.5 text-center sm:flex-row lg:justify-start lg:text-left">
            {tourThumb ? (
              <img
                src={resolveImage(tourThumb)}
                alt={tour?.title || ""}
                className="h-10 w-10 rounded-full border border-slate-200 object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-lg">
                🏝️
              </div>
            )}
            <p className="text-sm font-medium text-slate-900">
              {tour?.title || tour?.info || "Unnamed Tour"}
            </p>
          </div>
        );
      case "traveller":
        return (
          <div className="text-center lg:text-left">
            <p className="text-sm font-medium text-slate-900">
              {contactDetailsComplete ? formData?.fullName : "Details not completed"}
            </p>
            {Boolean(contactDetailsComplete) && (
              <>
                <p className="text-xs text-slate-500">{formData?.email}</p>
                <p className="text-xs text-slate-500">{formData?.mobile}</p>
              </>
            )}
          </div>
        );
      case "date":
        return (
          <div className="text-center lg:text-left">
            <p className="text-sm font-medium text-slate-900">
              {formData?.date || "Select date"}
            </p>
            {Boolean(dateDetailsComplete && formData?.time) && (
              <p className="text-xs text-slate-500">Start time: {formData.time}</p>
            )}
          </div>
        );
      case "guests":
        return (
          <div
            ref={guestContainerRef}
            className="flex flex-wrap items-center justify-center gap-3 lg:justify-start"
          >
            {guestRows.map((row, i) =>
              row.show ? (
                <div key={i} className="flex items-center gap-1">
                  <span
                    ref={(el) => (guestEmojisRef.current[i] = el)}
                    className="text-lg"
                    style={{ opacity: 0, transform: "scale(0)" }}
                  >
                    {row.emoji}
                  </span>
                  <span className="text-sm font-medium text-slate-900">×{row.count}</span>
                </div>
              ) : null,
            )}
            {guestRows.every((r) => !r.show) && (
              <span className="text-sm text-slate-500">No guests</span>
            )}
          </div>
        );
      case "pickup":
        return (
          <div className="text-center lg:text-left">
            <p className="break-words text-sm font-medium text-slate-900">
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
  // RENDER EXTRAS
  // ============================================================

  const renderExtras = () => {
    if (!tour?.additionalPricing || tour.additionalPricing.length === 0) return null;

    return (
      <div className="mt-4 border-t border-slate-200 pt-4">
        <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
          Optional Extras
        </h5>
        <div className="space-y-4">
          {tour.additionalPricing.map((extra) => {
            const key = extra.category;
            const isSelected = !!selectedExtras[key];
            const qty = typeof selectedExtras[key] === "number" ? selectedExtras[key] : (isSelected ? 1 : 0);

            if (extra.type === "quantity") {
              return (
                <div key={key} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{extra.category}</p>
                    <p className="text-xs text-slate-500">{formatCurrency(extra.price)} {extra.unit}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onExtrasChange({ ...selectedExtras, [key]: Math.max(0, qty - 1) })}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    >
                      -
                    </button>
                    <span className="w-5 text-center text-sm font-semibold">{qty}</span>
                    <button
                      type="button"
                      onClick={() => onExtrasChange({ ...selectedExtras, [key]: qty + 1 })}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            }

            if (extra.type === "fixed" || extra.type === "request") {
              return (
                <div key={key} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{extra.category}</p>
                    <p className="text-xs text-slate-500">
                      {extra.type === "request" ? "Request" : `${formatCurrency(extra.price)} ${extra.unit}`}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onExtrasChange({ ...selectedExtras, [key]: !isSelected })}
                    className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${isSelected ? "bg-blue-600" : "bg-slate-200"}`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                        isSelected ? "translate-x-[18px]" : "translate-x-[2px]"
                      }`}
                    />
                  </button>
                </div>
              );
            }

            return null;
          })}
        </div>
      </div>
    );
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div
      ref={checkoutRef}
      className={`min-w-0 bg-white ${stacked ? "rounded-t-2xl" : ""}`}
    >
      <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
        {/* HEADER */}
        <div className="mb-5 flex items-center gap-2.5">
          {CheckoutCartIcon && (
            <CheckoutCartIcon className="h-5 w-5 text-blue-600" />
          )}
          <h3 className="text-base font-semibold text-slate-900 sm:text-lg">
            Checkout summary
          </h3>
        </div>

        {/* BOOKING DETAILS */}
        <div className={`mb-6 flex min-w-0 flex-col gap-3 ${stacked ? "" : "lg:flex-row lg:items-stretch"}`}>
          <div
            ref={iconButtonsContainerRef}
            className={`scroll-smooth overflow-x-auto pb-1 ${
              stacked ? "" : "lg:overflow-visible lg:pb-0 lg:flex lg:items-stretch"
            }`}
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            <style>{`
              .icon-scroll-container::-webkit-scrollbar { display: none; }
            `}</style>
            <div
              className={`mx-auto flex w-max gap-2 ${
                stacked ? "" : "lg:mx-0 lg:w-full lg:flex-wrap lg:items-stretch"
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
                    className={`flex min-w-[64px] shrink-0 flex-col items-center justify-center gap-1 rounded-lg border px-3 py-2 transition-colors ${
                      isActive
                        ? "border-blue-600 bg-blue-600 text-white"
                        : isComplete
                          ? "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                          : "border-slate-200 bg-slate-50 text-slate-400 hover:bg-slate-100"
                    } ${stacked ? "" : "lg:h-auto"}`}
                  >
                    <span className="text-base leading-none">{item.icon}</span>
                    <span className="text-[10px] font-medium uppercase tracking-wide">
                      {item.label}
                    </span>
                    {!isComplete && (
                      <span className="mt-0.5 h-1 w-1 rounded-full bg-amber-500" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className={`min-w-0 flex-1 ${stacked ? "" : "lg:flex"}`}>
            <div
              className={`flex w-full min-w-0 flex-col justify-center rounded-lg border p-4 ${
                activeDetailData.complete
                  ? "border-slate-200 bg-slate-50"
                  : "border-amber-200 bg-amber-50"
              }`}
            >
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                {activeDetailData.label}
              </p>
              <div className="mt-1.5 min-w-0">{renderDetailContent(activeDetailData.key)}</div>
              {!activeDetailData.complete && (
                <p className="mt-2 text-xs font-medium text-amber-700">
                  This field is incomplete
                </p>
              )}
            </div>
          </div>
        </div>

        {/* PRICE BREAKDOWN + TOTAL
            grid-cols-1 gives mobile a real minmax(0,1fr) column; without it
            long labels (e.g. extras) widen the column past the screen. */}
        <div className={`grid grid-cols-1 gap-5 ${stacked ? "" : "lg:grid-cols-5"}`}>

          {/* LEFT COLUMN: BREAKDOWN & EXTRAS */}
          <div className={`min-w-0 space-y-3 ${stacked ? "" : "lg:col-span-3"}`}>

            {/* Price Breakdown Card */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
              <div className="mb-4 flex items-center justify-between">
                <h4 className="text-sm font-semibold text-slate-900">
                  Price breakdown
                </h4>
                {hasGroupAdjustment && groupAdjustmentIsSaving && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200">
                    Save {formatCurrency(Math.abs(groupAdjustmentAmount))}
                  </span>
                )}
              </div>

              <div className="space-y-1">
                {breakdownItems.map((item) => {
                  const hasItemDiscount = item.basePerPerson != null;
                  const baseTotal = hasItemDiscount
                    ? item.basePerPerson * item.count
                    : null;

                  return (
                    <div
                      key={item.label}
                      className={`flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 ${
                        hasItemDiscount ? "bg-emerald-50/70" : ""
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900">
                          {item.label}
                        </p>
                        <p className="text-xs text-slate-500">
                          <span className="tabular-nums">{item.count} × </span>
                          {hasItemDiscount ? (
                            <>
                              <span className="text-slate-400 line-through">
                                {formatCurrency(item.basePerPerson)}
                              </span>{" "}
                              <span className="font-medium text-emerald-700">
                                {formatCurrency(item.perPerson)}
                              </span>
                            </>
                          ) : (
                            <span className="text-slate-700">
                              {formatCurrency(item.perPerson)}
                            </span>
                          )}
                        </p>
                      </div>

                      <div className="shrink-0 text-right">
                        {hasItemDiscount && baseTotal != null && (
                          <p className="text-xs tabular-nums text-slate-400 line-through">
                            {formatCurrency(baseTotal)}
                          </p>
                        )}
                        <p
                          className={`text-sm font-semibold tabular-nums ${
                            hasItemDiscount
                              ? "text-emerald-700"
                              : "text-slate-900"
                          }`}
                        >
                          {formatCurrency(item.subtotal)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Tour subtotal */}
              <div className="mt-3 flex items-end justify-between gap-3 border-t border-slate-200 pt-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900">
                    Tour subtotal
                  </p>
                  {hasGroupAdjustment && (
                    <p className="text-xs font-medium text-emerald-700">
                      After group rate
                    </p>
                  )}
                </div>
                <div className="shrink-0 text-right">
                  {hasGroupAdjustment && (
                    <p className="text-xs tabular-nums text-slate-400 line-through">
                      {formatCurrency(baseTourSubtotal)}
                    </p>
                  )}
                  <p
                    className={`text-base font-bold tabular-nums ${
                      hasGroupAdjustment ? "text-emerald-700" : "text-slate-900"
                    }`}
                  >
                    {formatCurrency(engineTourSubtotal)}
                  </p>
                </div>
              </div>

              {/* Group rate detail */}
              {hasGroupAdjustment && groupAdjustmentIsSaving && (
                <div className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-emerald-900">
                      Group rate applied
                    </p>
                    <p className="mt-0.5 text-xs text-emerald-700">
                      {groupRateLabel}
                      {qualifyingHeadcount != null &&
                        ` · ${qualifyingHeadcount} qualifying guests`}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold tabular-nums text-emerald-700">
                    −{formatCurrency(Math.abs(groupAdjustmentAmount))}
                  </span>
                </div>
              )}

              {hasGroupAdjustment && !groupAdjustmentIsSaving && (
                <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5">
                  <p className="text-xs font-semibold text-amber-900">
                    Group rate applied
                  </p>
                  <p className="mt-0.5 text-xs text-amber-700">
                    {groupRateLabel}
                    {qualifyingHeadcount != null &&
                      ` · ${qualifyingHeadcount} qualifying guests`}
                    . Rates above already reflect this adjustment.
                  </p>
                </div>
              )}

              {/* Fees */}
              {(privateFee > 0 || customFee > 0) && (
                <div className="mt-3 space-y-1.5 border-t border-slate-200 pt-3">
                  {privateFee > 0 && (
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm text-slate-700">
                        Private tour fee
                      </span>
                      <span className="shrink-0 text-sm font-semibold tabular-nums text-slate-900">
                        {displayActivePrivateFee}
                      </span>
                    </div>
                  )}
                  {customFee > 0 && (
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm text-slate-700">
                        Custom trip fee
                      </span>
                      <span className="shrink-0 text-sm font-semibold tabular-nums text-slate-900">
                        {displayActiveCustomFee}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* READ-ONLY KIDS ACTIVITY SUMMARY (From Pricing Engine) */}
              {Boolean(selectedKidsActivity) && (
                <div className="mt-4 border-t border-slate-200 pt-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 mb-2">
                    Kids activity
                  </p>
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900">
                        {selectedKidsActivity.name}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {selectedKidsActivity.category}
                        {selectedKidsActivity.location
                          ? ` · ${selectedKidsActivity.location}`
                          : ""}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-semibold tabular-nums text-slate-900">
                      + {displayKidsActivityTotal}
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-3 border-t border-slate-100 pt-3">
                    {[
                      ["Adults", adults, kidsActivityAdultPrice, kidsActivityAdultTotal],
                      ["Children", effectiveChildren, kidsActivityChildPrice, kidsActivityChildTotal],
                      ["Toddlers", effectiveToddlers, kidsActivityToddlerPrice, kidsActivityToddlerTotal],
                    ].map(([label, count, price, total]) => (
                      <div key={label} className="min-w-0">
                        <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
                          {label}
                        </p>
                        <p className="text-xs text-slate-500">
                          {count} × {formatCurrency(price)}
                        </p>
                        <p className="mt-0.5 text-sm font-semibold tabular-nums text-slate-900">
                          {formatCurrency(total)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* INTERACTIVE OPTIONAL EXTRAS */}
              {renderExtras()}

            </div>

            {/* CUSTOM QUOTE NOTICE */}
            {Boolean(isCustomQuote) && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                <p className="text-sm font-semibold text-blue-900">
                  Custom quote required
                </p>
                <p className="mt-1 text-xs leading-relaxed text-blue-700">
                  {matchedGroupTier?.note ||
                    "This group size requires a custom quote. The final price will be confirmed with you before payment."}
                </p>
              </div>
            )}

            {/* SELECT OPTION NOTICE */}
            {Boolean(hasOptions && !selectedTourOption) && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                <p className="text-sm font-semibold text-blue-900">
                  Select an option
                </p>
                <p className="mt-1 text-xs leading-relaxed text-blue-700">
                  Choose your preferred experience above before continuing to
                  checkout.
                </p>
              </div>
            )}

          </div>

          {/* RIGHT COLUMN: TOTAL + PAY */}
          <div className={`min-w-0 ${stacked ? "" : "lg:col-span-2"}`}>
            <div
              className={`rounded-xl bg-blue-700 p-5 text-white sm:p-6 ${
                stacked ? "mx-auto max-w-xl" : "sticky top-4"
              }`}
            >
              <p className="text-xs font-medium uppercase tracking-wider text-blue-200">
                Total due
              </p>
              <p className="mt-1.5 break-words text-3xl font-bold tabular-nums sm:text-4xl">
                {isCustomQuote ? "Custom quote" : displayTotal}
              </p>

              {hasGroupAdjustment && groupAdjustmentIsSaving && (
                <p className="mt-1.5 text-xs font-medium text-emerald-200">
                  You save {formatCurrency(Math.abs(groupAdjustmentAmount))}
                </p>
              )}

              <div className="mt-5 space-y-1.5 border-t border-blue-600 pt-4 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-blue-100">Tour subtotal</span>
                  <span className="font-medium tabular-nums">
                    {formatCurrency(engineTourSubtotal)}
                  </span>
                </div>

                {privateFee > 0 && (
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-blue-100">Private fee</span>
                    <span className="font-medium tabular-nums">
                      {displayActivePrivateFee}
                    </span>
                  </div>
                )}

                {customFee > 0 && (
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-blue-100">Custom fee</span>
                    <span className="font-medium tabular-nums">
                      {displayActiveCustomFee}
                    </span>
                  </div>
                )}

                {extrasTotal > 0 && (
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-blue-100">Extras</span>
                    <span className="font-medium tabular-nums">
                      {displayExtrasTotal}
                    </span>
                  </div>
                )}

                {Boolean(selectedKidsActivity) && (
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-blue-100">Activity</span>
                    <span className="font-medium tabular-nums">
                      {displayKidsActivityTotal}
                    </span>
                  </div>
                )}
              </div>

              {/* Verification status */}
              {!isCustomQuote && verifyStatus !== "idle" && (
                <div
                  className={`mt-4 flex items-start gap-2 rounded-lg px-3 py-2 text-xs font-medium ${
                    verifyStatus === "verified"
                      ? "bg-emerald-500/15 text-emerald-100"
                      : verifyStatus === "failed"
                        ? "bg-red-500/15 text-red-100"
                        : "bg-amber-500/15 text-amber-100"
                  }`}
                >
                  {verifyStatus === "pending" && (
                    <>
                      <span className="mt-0.5 h-3 w-3 shrink-0 animate-spin rounded-full border-2 border-amber-200 border-t-amber-100" />
                      <span>Verifying price…</span>
                    </>
                  )}
                  {verifyStatus === "verified" && (
                    <>
                      <span className="shrink-0 leading-none">✓</span>
                      <span>Price verified — ready for payment.</span>
                    </>
                  )}
                  {verifyStatus === "failed" && (
                    <>
                      <span className="shrink-0 leading-none">⚠</span>
                      <span>
                        {verifyError || "Price verification failed."} Tap retry to
                        try again.
                      </span>
                    </>
                  )}
                </div>
              )}

              {submitError && (
                <p className="mt-3 rounded-lg bg-red-500/15 p-3 text-xs font-medium text-red-100">
                  {submitError}
                </p>
              )}

              {!hideSubmit && (
                <button
                  type={onSubmit ? "button" : "submit"}
                  form={onSubmit ? undefined : "booking-form"}
                  onClick={onSubmit || undefined}
                  disabled={buttonDisabled}
                  className={`mt-4 w-full rounded-lg py-3.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                    verifyStatus === "failed"
                      ? "bg-red-600 text-white hover:bg-red-700"
                      : "bg-white text-blue-700 hover:bg-blue-50"
                  }`}
                >
                  {buttonLabel}
                </button>
              )}

              <div className="mt-4 flex items-center justify-center gap-2 text-[10px] font-medium uppercase tracking-wider text-blue-200">
                <span>Terms</span>
                <span>·</span>
                <span>Privacy</span>
                <span className="rounded bg-white/15 px-2 py-0.5 text-white">
                  Paystack
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSummary;