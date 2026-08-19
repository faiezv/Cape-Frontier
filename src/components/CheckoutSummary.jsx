// src/components/CheckoutSummary.jsx

import { useMemo } from "react";

// Helper to get private/custom fees
const getFee = (tour, type) => {
  const defaults = {
    private: 750,
    custom: 500,
  };

  if (Array.isArray(tour?.additionalPricing)) {
    const match = tour.additionalPricing.find((item) =>
      item.category?.toLowerCase().includes(type)
    );
    if (match) {
      const amount = match.pricePerPerson ?? match.price ?? match.amount ?? 0;
      if (Number(amount) > 0) return Number(amount);
    }
  }

  if (type === "private" && tour?.privateFee !== undefined)
    return Number(tour.privateFee) || 0;
  if (type === "custom" && tour?.customFee !== undefined)
    return Number(tour.customFee) || 0;

  return defaults[type] || 0;
};

const CheckoutSummary = ({
  tour,
  adultCount,
  childCount,
  selectedOption,
  selectedExtras = {},
  additionalPricing = [],
  formData,
  contactDetailsComplete,
  dateDetailsComplete,
  pickupDetailsComplete,
  isEmbedded = false,
  CheckoutCartIcon = null,
  checkoutRef = null,
  applyGroupDiscountToChildren = true,
}) => {
  // ------------------------------------------------------------
  // PRICING CALCULATION
  // ------------------------------------------------------------
  const pricing = useMemo(() => {
    const hasOptions = Array.isArray(tour?.options) && tour.options.length > 0;

    // No pricing data fallback
    if (!tour || !Array.isArray(tour.pricing) || tour.pricing.length === 0) {
      return {
        displayPrice: "—",
        participantCount: 0,
        hasOptions,
        displayBaseSubtotal: "—",
        groupDiscountPercent: 0,
        displayGroupDiscountAmount: "—",
        displayDiscountedTourSubtotal: "—",
        displayActivePrivateFee: "—",
        displayActiveCustomFee: "—",
        displayExtrasTotal: "—",
        extrasBreakdown: [],
        displayTotal: "—",
        currency: "ZAR",
        isCustomQuote: false,
        hasDiscount: false,
        matchedGroupTier: null,
        groupPricingType: null,
        selectedTourOption: null,
      };
    }

    const adults = Math.max(0, Number(adultCount) || 0);
    const children = Math.max(0, Number(childCount) || 0);

    const selectedTourOption = hasOptions
      ? tour.options.find((option) => option.id === selectedOption) || null
      : null;

    const adultPricing =
      tour.pricing.find((p) => p.category?.toLowerCase().includes("adult")) ||
      tour.pricing[0];
    const adultBasePrice = Number(adultPricing?.pricePerPerson) || 0;

    let adultPrice = adultBasePrice;
    if (hasOptions) {
      adultPrice = selectedTourOption
        ? Number(selectedTourOption.pricePerPerson) || 0
        : 0;
    }

    const childPricing = tour.pricing.find((p) =>
      p.category?.toLowerCase().includes("child")
    );
    const childBasePrice = Number(childPricing?.pricePerPerson) || 0;

    const participantCount = adults + children;
    const adultBaseSubtotal = adults * adultPrice;
    const childBaseSubtotal = children * childBasePrice;
    const originalSubtotal = adultBaseSubtotal + childBaseSubtotal;

    let discountedSubtotal = originalSubtotal;
    let groupDiscountAmount = 0;
    let groupDiscountPercent = 0;
    let isCustomQuote = false;
    let hasDiscount = false;
    let matchedGroupTier = null;
    let groupPricingType = null;

    // Group pricing tier matching
    if (
      tour.groupPricing?.enabled &&
      Array.isArray(tour.groupPricing.tiers) &&
      tour.groupPricing.tiers.length > 0
    ) {
      matchedGroupTier = tour.groupPricing.tiers.find((tier) => {
        const minPeople = Number(tier.minPeople) || 0;
        const maxPeople = tier.maxPeople == null ? Infinity : Number(tier.maxPeople);
        return participantCount >= minPeople && participantCount <= maxPeople;
      }) || null;
    }

    if (matchedGroupTier) {
      const hasPerPersonPrice =
        matchedGroupTier.perPerson != null &&
        Number.isFinite(Number(matchedGroupTier.perPerson));
      const hasDiscountPercent =
        matchedGroupTier.discountPercent != null &&
        Number.isFinite(Number(matchedGroupTier.discountPercent));

      if (hasPerPersonPrice) {
        groupPricingType = "perPerson";
        const groupAdultPrice = Math.max(0, Number(matchedGroupTier.perPerson));
        const discountedAdultSubtotal = adults * groupAdultPrice;
        const unchangedChildSubtotal = children * childBasePrice;
        discountedSubtotal = discountedAdultSubtotal + unchangedChildSubtotal;
        groupDiscountAmount = Math.max(0, originalSubtotal - discountedSubtotal);
        groupDiscountPercent =
          originalSubtotal > 0 ? (groupDiscountAmount / originalSubtotal) * 100 : 0;
        hasDiscount = groupDiscountAmount > 0;
      } else if (hasDiscountPercent) {
        groupPricingType = "discountPercent";
        const requestedDiscountPercent = Number(matchedGroupTier.discountPercent);
        const safeDiscountPercent = Math.min(Math.max(requestedDiscountPercent, 0), 100);

        if (applyGroupDiscountToChildren) {
          groupDiscountAmount = originalSubtotal * (safeDiscountPercent / 100);
          discountedSubtotal = originalSubtotal - groupDiscountAmount;
        } else {
          const discountedAdultSubtotal = adultBaseSubtotal * (1 - safeDiscountPercent / 100);
          discountedSubtotal = discountedAdultSubtotal + childBaseSubtotal;
          groupDiscountAmount = originalSubtotal - discountedSubtotal;
        }
        groupDiscountPercent =
          originalSubtotal > 0 ? (groupDiscountAmount / originalSubtotal) * 100 : 0;
        hasDiscount = groupDiscountAmount > 0;
      } else {
        groupPricingType = "custom";
        isCustomQuote = true;
        discountedSubtotal = originalSubtotal;
        groupDiscountAmount = 0;
        groupDiscountPercent = 0;
        hasDiscount = false;
      }
    }

    // Private / Custom fees
    const privateFee = formData?.isPrivate ? getFee(tour, "private") : 0;
    const customFee = formData?.isCustom ? getFee(tour, "custom") : 0;

    // -------------------------------------------------------------
    // OPTIONAL EXTRAS
    // -------------------------------------------------------------
    const currency = tour.currency || "ZAR";
    const formatPrice = (amount) => `${currency} ${Number(amount || 0).toFixed(2)}`;

    const pricingExtras =
      additionalPricing.length > 0 ? additionalPricing : tour?.additionalPricing || [];

    let extrasTotal = 0;
    const extrasBreakdown = [];

    if (Array.isArray(pricingExtras)) {
      pricingExtras.forEach((extra) => {
        const { type, category, price, unit } = extra;
        const value = selectedExtras[category];
        if (value === undefined || value === null || value === false) return;

        let cost = 0;
        let label = category;

        if (type === "quantity") {
          const qty = Number(value) || 0;
          if (qty <= 0) return;
          cost = (Number(price) || 0) * qty;
          label = `${category} × ${qty}`;
        } else if (type === "fixed") {
          cost = Number(price) || 0;
        } else {
          // request or external – skip (no cost)
          return;
        }

        if (cost > 0) {
          extrasTotal += cost;
          extrasBreakdown.push({
            label,
            cost,
            formattedCost: formatPrice(cost), // pre‑formatted string
            unit,
          });
        }
      });
    }

    const total = isCustomQuote
      ? null
      : discountedSubtotal + privateFee + customFee + extrasTotal;

    return {
      // ============================================================
      // RAW NUMERIC PRICING
      // Use these values for checkout/payment — NOT the display strings
      // ============================================================

      // Price before any group discount
      originalTotal: Number(originalSubtotal),

      // Amount saved through group pricing
      discountAmount: Number(groupDiscountAmount),

      // Tour price after group discount
      discountedTourTotal: Number(discountedSubtotal),

      // Additional tour fees
      privateFee: Number(privateFee),
      customFee: Number(customFee),

      // Optional extras
      extrasTotal: Number(extrasTotal),

      // FINAL AMOUNT CUSTOMER SHOULD PAY
      finalTotal: isCustomQuote
        ? null
        : Number(
            discountedSubtotal +
              privateFee +
              customFee +
              extrasTotal
          ),

      // ============================================================
      // EXISTING DISPLAY VALUES
      // ============================================================

      displayPrice: formatPrice(adultPrice),

      participantCount,

      hasOptions,

      selectedTourOption,

      displayBaseSubtotal: formatPrice(originalSubtotal),

      groupDiscountPercent,

      displayGroupDiscountAmount: formatPrice(groupDiscountAmount),

      displayDiscountedTourSubtotal: isCustomQuote
        ? "Custom quote"
        : formatPrice(discountedSubtotal),

      displayActivePrivateFee:
        privateFee > 0
          ? `+${formatPrice(privateFee)}`
          : "—",

      displayActiveCustomFee:
        customFee > 0
          ? `+${formatPrice(customFee)}`
          : "—",

      displayExtrasTotal:
        extrasTotal > 0
          ? formatPrice(extrasTotal)
          : "—",

      extrasBreakdown,

      displayTotal:
        isCustomQuote
          ? "Custom quote"
          : formatPrice(total),

      currency,

      isCustomQuote,

      hasDiscount,

      matchedGroupTier,

      groupPricingType,
    };

  }, [
    tour,
    adultCount,
    childCount,
    selectedOption,
    formData?.isPrivate,
    formData?.isCustom,
    applyGroupDiscountToChildren,
    selectedExtras,
    additionalPricing,
  ]);

  // ------------------------------------------------------------
  // DESTRUCTURE
  // ------------------------------------------------------------
  const {
    displayPrice,
    participantCount,
    hasOptions,
    selectedTourOption,
    displayBaseSubtotal,
    groupDiscountPercent,
    displayGroupDiscountAmount,
    displayDiscountedTourSubtotal,
    displayActivePrivateFee,
    displayActiveCustomFee,
    displayExtrasTotal,
    extrasBreakdown,
    displayTotal,
    currency,
    isCustomQuote,
    hasDiscount,
    matchedGroupTier,
    groupPricingType,
  } = pricing;

  // ------------------------------------------------------------
  // RENDER
  // ------------------------------------------------------------
  return (
    <div
      ref={checkoutRef}
      className="border-t border-black/5 bg-white/92 px-4 py-4 md:px-8 md:py-5"
    >
      <div className="grid items-stretch gap-3 lg:grid-cols-[1fr_auto]">
        {/* ======================================================
            SUMMARY CARD
        ====================================================== */}
        <div className="rounded-2xl border border-black/10 bg-white p-4 text-neutral-950 shadow-[0_12px_30px_rgba(0,0,0,0.05)]">
          {/* HEADER */}
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-500">
                Checkout summary
              </p>
              <div
                className={`mt-1 font-frank text-3xl font-bold leading-none ${
                  isCustomQuote ? "text-blue-700" : "text-neutral-950"
                }`}
              >
                {displayTotal}
              </div>
              <p className="mt-2 text-xs leading-5 text-neutral-500">
                {isCustomQuote
                  ? "Your group requires a custom quote. We will confirm the final amount with you."
                  : `${currency} estimate · final amount is recalculated securely at checkout.`}
              </p>
            </div>

            {/* BOOKING DETAILS */}
            <div className="grid gap-2 sm:grid-cols-2 xl:min-w-[31rem]">
              <div className="rounded-2xl bg-neutral-50 p-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-neutral-400">
                  Tour
                </p>
                <p className="mt-1 line-clamp-1 text-sm font-bold text-neutral-900">
                  {tour?.title || tour?.info || "Unnamed Tour"}
                </p>
              </div>

              <div
                className={`rounded-2xl p-3 ${
                  contactDetailsComplete ? "bg-neutral-50" : "bg-neutral-100 opacity-55"
                }`}
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-neutral-400">
                  Traveller
                </p>
                <p
                  className={`mt-1 line-clamp-1 text-sm font-bold ${
                    contactDetailsComplete ? "text-neutral-900" : "text-neutral-400"
                  }`}
                >
                  {contactDetailsComplete ? formData?.fullName : "Details not completed"}
                </p>
              </div>

              <div
                className={`rounded-2xl p-3 ${
                  dateDetailsComplete ? "bg-neutral-50" : "bg-neutral-100 opacity-55"
                }`}
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-neutral-400">
                  Date
                </p>
                <p
                  className={`mt-1 text-sm font-bold ${
                    dateDetailsComplete ? "text-neutral-900" : "text-neutral-400"
                  }`}
                >
                  {formData?.date || "Select date"}
                </p>
              </div>

              <div className="rounded-2xl bg-neutral-50 p-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-neutral-400">
                  Guests
                </p>
                <p className="mt-1 text-sm font-bold text-neutral-900">
                  {adultCount} adult{adultCount === 1 ? "" : "s"}
                  {childCount > 0
                    ? ` · ${childCount} child${childCount === 1 ? "" : "ren"}`
                    : ""}
                </p>
              </div>

              <div
                className={`rounded-2xl p-3 sm:col-span-2 ${
                  pickupDetailsComplete ? "bg-neutral-50" : "bg-neutral-100 opacity-55"
                }`}
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-neutral-400">
                  Pickup
                </p>
                <p
                  className={`mt-1 line-clamp-1 text-sm font-bold ${
                    pickupDetailsComplete ? "text-neutral-900" : "text-neutral-400"
                  }`}
                >
                  {formData?.pickupLocation || "Choose pickup location"}
                </p>
              </div>
            </div>
          </div>

          {/* ====================================================
              PRICING BREAKDOWN
          ==================================================== */}
          <div className="mt-4 rounded-2xl border border-black/5 bg-stone-50 p-3">
            <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-5">
              {/* TOUR SUBTOTAL */}
              <div className="rounded-xl bg-white p-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-400">
                  Tour subtotal
                </p>
                <div className="mt-1 flex flex-wrap items-baseline gap-2">
                  {hasOptions && !selectedTourOption ? (
                    <span className="text-sm font-bold text-blue-700">Select an option</span>
                  ) : isCustomQuote ? (
                    <span className="text-sm font-bold text-blue-700">Custom quote</span>
                  ) : hasDiscount ? (
                    <>
                      <span className="text-sm font-bold text-red-500 line-through">
                        {displayBaseSubtotal}
                      </span>
                      <span className="text-sm font-bold text-green-700">
                        {displayDiscountedTourSubtotal}
                      </span>
                    </>
                  ) : (
                    <span className="text-sm font-bold text-neutral-900">
                      {displayBaseSubtotal}
                    </span>
                  )}
                </div>
              </div>

              {/* GROUP PRICING */}
              <div
                className={`rounded-xl bg-white p-3 ${
                  hasDiscount || isCustomQuote ? "" : "opacity-55"
                }`}
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-400">
                  Group pricing
                </p>
                <p
                  className={`mt-1 text-sm font-bold ${
                    isCustomQuote
                      ? "text-blue-700"
                      : hasDiscount
                      ? "text-green-700"
                      : "text-neutral-400"
                  }`}
                >
                  {isCustomQuote
                    ? matchedGroupTier?.note || "Custom quote required."
                    : hasDiscount
                    ? groupPricingType === "perPerson"
                      ? `-${displayGroupDiscountAmount} · Adult group rate`
                      : `-${displayGroupDiscountAmount} · ${Number(
                          groupDiscountPercent
                        ).toFixed(2)}% off`
                    : `No discount for ${participantCount} guest${
                        participantCount === 1 ? "" : "s"
                      }`}
                </p>
              </div>

              {/* TOUR TOTAL */}
              <div className="rounded-xl bg-white p-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-400">
                  Tour total
                </p>
                <p
                  className={`mt-1 text-sm font-bold ${
                    isCustomQuote ? "text-blue-700" : "text-neutral-900"
                  }`}
                >
                  {hasOptions && !selectedTourOption
                    ? "Select option"
                    : isCustomQuote
                    ? "Custom quote"
                    : displayDiscountedTourSubtotal}
                </p>
              </div>

              {/* PRIVATE FEE */}
              <div
                className={`rounded-xl bg-white p-3 ${
                  formData?.isPrivate ? "" : "opacity-55"
                }`}
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-400">
                  Private tour fee
                </p>
                <p
                  className={`mt-1 text-sm font-bold ${
                    formData?.isPrivate ? "text-green-700" : "text-neutral-400"
                  }`}
                >
                  {formData?.isPrivate ? displayActivePrivateFee : "Not added"}
                </p>
              </div>

              {/* CUSTOM FEE */}
              <div
                className={`rounded-xl bg-white p-3 ${
                  formData?.isCustom ? "" : "opacity-55"
                }`}
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-400">
                  Custom trip fee
                </p>
                <p
                  className={`mt-1 text-sm font-bold ${
                    formData?.isCustom ? "text-blue-700" : "text-neutral-400"
                  }`}
                >
                  {formData?.isCustom ? displayActiveCustomFee : "Not added"}
                </p>
              </div>
            </div>

            {/* ====================================================
                🆕 EXTRAS BREAKDOWN
            ==================================================== */}
            {extrasBreakdown.length > 0 && (
              <div className="mt-3 rounded-xl border border-black/5 bg-white p-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-400">
                  Optional Extras
                </p>
                <div className="mt-2 space-y-1">
                  {extrasBreakdown.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-neutral-700">{item.label}</span>
                      <span className="font-medium text-neutral-900">
                        {item.formattedCost}
                      </span>
                    </div>
                  ))}
                  <div className="mt-2 flex justify-between border-t border-black/5 pt-2 text-sm font-bold">
                    <span>Extras total</span>
                    <span>{displayExtrasTotal}</span>
                  </div>
                </div>
              </div>
            )}

            {/* CUSTOM QUOTE NOTICE */}
            {isCustomQuote && (
              <div className="mt-3 rounded-xl border border-blue-100 bg-blue-50 p-3">
                <p className="text-sm font-bold text-blue-900">Custom quote required</p>
                <p className="mt-1 text-xs leading-5 text-blue-700">
                  {matchedGroupTier?.note ||
                    "This group size requires a custom quote. The final price will be confirmed with you before payment."}
                </p>
              </div>
            )}

            {/* OPTION REQUIRED */}
            {hasOptions && !selectedTourOption && (
              <div className="mt-3 rounded-xl border border-blue-100 bg-blue-50 p-3">
                <p className="text-sm font-bold text-blue-900">Select an option</p>
                <p className="mt-1 text-xs leading-5 text-blue-700">
                  Choose your preferred experience above before continuing to checkout.
                </p>
              </div>
            )}

            {/* CHECKOUT NOTICE */}
            <div className="mt-3 flex flex-col gap-2 rounded-xl bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-bold text-neutral-900">
                  {isCustomQuote
                    ? "Quote confirmation is next."
                    : hasOptions && !selectedTourOption
                    ? "Select an option first."
                    : "Secure checkout is next."}
                </p>
                <p className="mt-1 text-xs leading-5 text-neutral-500">
                  {isCustomQuote
                    ? "Submit your booking details and we will confirm the custom group price with you."
                    : hasOptions && !selectedTourOption
                    ? "Your selected option will determine the adult price."
                    : "Payment opens after this form. Pickup and vehicle details are manually confirmed after payment."}
                </p>
              </div>
              <div className="hidden flex-wrap gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-500 sm:flex">
                <span className="rounded-full bg-neutral-50 px-3 py-1">Terms</span>
                <span className="rounded-full bg-neutral-50 px-3 py-1">Privacy</span>
                <span className="rounded-full bg-green-200 px-3 py-1 text-green-950">
                  Powered by Paystack
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================
            SUBMIT BUTTON
        ====================================================== */}
        <button
          type="submit"
          form="booking-form"
          disabled={hasOptions && !selectedTourOption}
          className={`hero-gradient flex w-full items-center justify-center gap-3 rounded-2xl px-8 py-4 text-base font-bold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 lg:flex-col lg:gap-2 ${
            isEmbedded
              ? "min-h-[4.6rem] lg:min-h-[8.75rem] lg:w-[15rem]"
              : "min-h-[5.5rem] lg:min-h-[9rem] lg:w-[15rem]"
          }`}
        >
          {CheckoutCartIcon && (
            <CheckoutCartIcon className="h-7 w-7 lg:h-10 lg:w-10" />
          )}
          <span>
            {isCustomQuote
              ? "Request custom quote"
              : hasOptions && !selectedTourOption
              ? "Select option"
              : "Continue to checkout"}
          </span>
        </button>
      </div>
    </div>
  );
};

export default CheckoutSummary;