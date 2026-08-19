// src/components/CheckoutSummary.jsx
import { useMemo } from "react";

/**
 * Get fee amount for a given type ("private" or "custom").
 *
 * Priority:
 * 1. tour.additionalPricing
 * 2. direct tour.privateFee / tour.customFee
 * 3. default fallback
 */
const getFee = (tour, type) => {
  const defaults = {
    private: 750,
    custom: 500,
  };

  // 1. Check additionalPricing
  if (Array.isArray(tour.additionalPricing)) {
    const match = tour.additionalPricing.find((item) =>
      item.category?.toLowerCase().includes(type)
    );

    if (match) {
      const amount =
        match.pricePerPerson ||
        match.price ||
        match.amount ||
        0;

      if (amount > 0) return amount;
    }
  }

  // 2. Direct properties
  if (
    type === "private" &&
    tour.privateFee !== undefined
  ) {
    return tour.privateFee;
  }

  if (
    type === "custom" &&
    tour.customFee !== undefined
  ) {
    return tour.customFee;
  }

  // 3. Default fallback
  return defaults[type] || 0;
};

const CheckoutSummary = ({
  tour,
  adultCount,
  childCount,
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
    console.log("[CheckoutSummary] Tour data:", tour);
    console.log("[CheckoutSummary] Guests:", {
      adultCount,
      childCount,
    });

    // ----------------------------------------------------------
    // No pricing fallback
    // ----------------------------------------------------------

    if (
      !tour ||
      !tour.pricing ||
      tour.pricing.length === 0
    ) {
      console.warn(
        "[CheckoutSummary] No pricing found, using fallback."
      );

      return {
        displayPrice: "—",
        participantCount: 0,

        displayBaseSubtotal: "—",

        groupDiscountPercent: 0,
        displayGroupDiscountAmount: "—",
        displayDiscountedTourSubtotal: "—",

        displayActivePrivateFee: "—",
        displayActiveCustomFee: "—",

        displayTotal: "—",

        currency: "ZAR",

        isCustomQuote: false,
        matchedGroupTier: null,
      };
    }

    // ----------------------------------------------------------
    // Adult pricing
    // ----------------------------------------------------------

    const adultPricing =
      tour.pricing.find((p) =>
        p.category?.toLowerCase().includes("adult")
      ) || tour.pricing[0];

    const adultPrice =
      adultPricing?.pricePerPerson ?? 0;

    // ----------------------------------------------------------
    // Child pricing
    // ----------------------------------------------------------

    const childPricing = tour.pricing.find((p) =>
      p.category?.toLowerCase().includes("child")
    );

    const childPrice =
      childPricing?.pricePerPerson ?? 0;

    // ----------------------------------------------------------
    // Participant totals
    // ----------------------------------------------------------

    const totalParticipants =
      adultCount + childCount;

    // ----------------------------------------------------------
    // Original tour subtotal
    // ----------------------------------------------------------

    const originalSubtotal =
      adultCount * adultPrice +
      childCount * childPrice;

    // ----------------------------------------------------------
    // Group pricing state
    // ----------------------------------------------------------

    let discountedSubtotal =
      originalSubtotal;

    let groupDiscountPercent = 0;

    let groupDiscountAmount = 0;

    let isCustomQuote = false;

    let matchedGroupTier = null;

    // ----------------------------------------------------------
    // Group pricing
    // ----------------------------------------------------------

    if (
      tour.groupPricing?.enabled &&
      tour.groupPricing.tiers?.length
    ) {
      const tier =
        tour.groupPricing.tiers.find(
          (t) =>
            totalParticipants >=
              Number(t.minPeople) &&
            (
              t.maxPeople == null ||
              totalParticipants <=
                Number(t.maxPeople)
            )
        );

      matchedGroupTier =
        tier ?? null;

      if (tier) {
        const hasPerPersonPrice =
          tier.perPerson != null;

        const hasDiscountPercent =
          tier.discountPercent != null;

        // ------------------------------------------------------
        // CUSTOM QUOTE
        //
        // Neither perPerson nor discountPercent exists.
        // ------------------------------------------------------

        if (
          !hasPerPersonPrice &&
          !hasDiscountPercent
        ) {
          isCustomQuote = true;

          discountedSubtotal =
            originalSubtotal;

          groupDiscountAmount = 0;

          groupDiscountPercent = 0;
        }

        // ------------------------------------------------------
        // PER-PERSON GROUP PRICE
        // ------------------------------------------------------

        else if (hasPerPersonPrice) {
          let discountedParticipants =
            totalParticipants;

          if (
            !applyGroupDiscountToChildren
          ) {
            discountedParticipants =
              adultCount;
          }

          const tierTotal =
            discountedParticipants *
            Number(tier.perPerson);

          const childCost =
            applyGroupDiscountToChildren
              ? 0
              : childCount * childPrice;

          const newTotal =
            tierTotal + childCost;

          groupDiscountAmount =
            Math.max(
              0,
              originalSubtotal -
                newTotal
            );

          groupDiscountPercent =
            originalSubtotal > 0
              ? (
                  groupDiscountAmount /
                  originalSubtotal
                ) * 100
              : 0;

          discountedSubtotal =
            newTotal;
        }

        // ------------------------------------------------------
        // PERCENTAGE DISCOUNT
        // ------------------------------------------------------

        else if (hasDiscountPercent) {
          const discountPercent =
            Number(
              tier.discountPercent
            );

          const safeDiscountPercent =
            Math.min(
              Math.max(
                discountPercent,
                0
              ),
              100
            );

          // ----------------------------------------------
          // Discount applies to everyone
          // ----------------------------------------------

          if (
            applyGroupDiscountToChildren
          ) {
            groupDiscountAmount =
              originalSubtotal *
              (safeDiscountPercent / 100);

            discountedSubtotal =
              originalSubtotal -
              groupDiscountAmount;
          }

          // ----------------------------------------------
          // Discount applies to adults only
          // ----------------------------------------------

          else {
            const adultSubtotal =
              adultCount *
              adultPrice;

            const discountedAdultSubtotal =
              adultSubtotal -
              adultSubtotal *
                (safeDiscountPercent / 100);

            const normalChildSubtotal =
              childCount *
              childPrice;

            discountedSubtotal =
              discountedAdultSubtotal +
              normalChildSubtotal;

            groupDiscountAmount =
              originalSubtotal -
              discountedSubtotal;
          }

          groupDiscountPercent =
            originalSubtotal > 0
              ? (
                  groupDiscountAmount /
                  originalSubtotal
                ) * 100
              : 0;
        }
      }
    }

    // ----------------------------------------------------------
    // Private / Custom fees
    // ----------------------------------------------------------

    const privateFee =
      formData?.isPrivate
        ? getFee(tour, "private")
        : 0;

    const customFee =
      formData?.isCustom
        ? getFee(tour, "custom")
        : 0;

    console.log(
      "[CheckoutSummary] Private fee:",
      privateFee,
      "Custom fee:",
      customFee
    );

    // ----------------------------------------------------------
    // Final total
    // ----------------------------------------------------------

    /*
     * For a custom quote tier, don't pretend we have
     * a real calculated total.
     */
    const total = isCustomQuote
      ? null
      : discountedSubtotal +
        privateFee +
        customFee;

    const currency =
      tour.currency || "ZAR";

    const formatPrice = (amount) =>
      `${currency} ${Number(amount).toFixed(2)}`;

    return {
      displayPrice:
        formatPrice(adultPrice),

      participantCount:
        totalParticipants,

      displayBaseSubtotal:
        formatPrice(originalSubtotal),

      groupDiscountPercent:
        Math.round(groupDiscountPercent),

      displayGroupDiscountAmount:
        formatPrice(groupDiscountAmount),

      displayDiscountedTourSubtotal:
        isCustomQuote
          ? "Custom quote"
          : formatPrice(
              discountedSubtotal
            ),

      displayActivePrivateFee:
        privateFee > 0
          ? `+${formatPrice(privateFee)}`
          : "—",

      displayActiveCustomFee:
        customFee > 0
          ? `+${formatPrice(customFee)}`
          : "—",

      displayTotal:
        isCustomQuote
          ? "Custom quote"
          : formatPrice(total),

      currency,

      isCustomQuote,

      matchedGroupTier,
    };
  }, [
    tour,
    adultCount,
    childCount,
    formData?.isPrivate,
    formData?.isCustom,
    applyGroupDiscountToChildren,
  ]);

  // ------------------------------------------------------------
  // Destructure
  // ------------------------------------------------------------

  const {
    displayPrice,
    participantCount,
    displayBaseSubtotal,
    groupDiscountPercent,
    displayGroupDiscountAmount,
    displayDiscountedTourSubtotal,
    displayActivePrivateFee,
    displayActiveCustomFee,
    displayTotal,
    currency,
    isCustomQuote,
    matchedGroupTier,
  } = pricing;

  const hasDiscount =
    groupDiscountPercent > 0 &&
    !isCustomQuote;

  // ------------------------------------------------------------
  // Render
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

          {/* ----------------------------------------------------
              Header
          ---------------------------------------------------- */}

          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">

            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-500">
                Checkout summary
              </p>

              <div
                className={`mt-1 font-frank text-3xl font-bold leading-none ${
                  isCustomQuote
                    ? "text-blue-700"
                    : "text-neutral-950"
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

            {/* --------------------------------------------------
                Booking details
            -------------------------------------------------- */}

            <div className="grid gap-2 sm:grid-cols-2 xl:min-w-[31rem]">

              {/* Tour */}
              <div className="rounded-2xl bg-neutral-50 p-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-neutral-400">
                  Tour
                </p>

                <p className="mt-1 line-clamp-1 text-sm font-bold text-neutral-900">
                  {tour?.title ||
                    tour?.info ||
                    "Unnamed Tour"}
                </p>
              </div>

              {/* Traveller */}
              <div
                className={`rounded-2xl p-3 transition ${
                  contactDetailsComplete
                    ? "bg-neutral-50"
                    : "bg-neutral-100 opacity-55"
                }`}
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-neutral-400">
                  Traveller
                </p>

                <p
                  className={`mt-1 line-clamp-1 text-sm font-bold ${
                    contactDetailsComplete
                      ? "text-neutral-900"
                      : "text-neutral-400"
                  }`}
                >
                  {contactDetailsComplete
                    ? formData?.fullName
                    : "Details not completed"}
                </p>
              </div>

              {/* Date */}
              <div
                className={`rounded-2xl p-3 transition ${
                  dateDetailsComplete
                    ? "bg-neutral-50"
                    : "bg-neutral-100 opacity-55"
                }`}
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-neutral-400">
                  Date
                </p>

                <p
                  className={`mt-1 text-sm font-bold ${
                    dateDetailsComplete
                      ? "text-neutral-900"
                      : "text-neutral-400"
                  }`}
                >
                  {formData?.date ||
                    "Select date"}
                </p>
              </div>

              {/* Guests */}
              <div className="rounded-2xl bg-neutral-50 p-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-neutral-400">
                  Guests
                </p>

                <p className="mt-1 text-sm font-bold text-neutral-900">
                  {adultCount} adult
                  {adultCount === 1
                    ? ""
                    : "s"}

                  {childCount > 0
                    ? ` · ${childCount} child${
                        childCount === 1
                          ? ""
                          : "ren"
                      }`
                    : ""}
                </p>
              </div>

              {/* Pickup */}
              <div
                className={`rounded-2xl p-3 transition sm:col-span-2 ${
                  pickupDetailsComplete
                    ? "bg-neutral-50"
                    : "bg-neutral-100 opacity-55"
                }`}
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-neutral-400">
                  Pickup
                </p>

                <p
                  className={`mt-1 line-clamp-1 text-sm font-bold ${
                    pickupDetailsComplete
                      ? "text-neutral-900"
                      : "text-neutral-400"
                  }`}
                >
                  {formData?.pickupLocation ||
                    "Choose pickup location"}
                </p>
              </div>
            </div>
          </div>

          {/* ====================================================
              PRICING BREAKDOWN
          ==================================================== */}

          <div className="mt-4 rounded-2xl border border-black/5 bg-stone-50 p-3">

            <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-5">

              {/* ------------------------------------------------
                  Tour subtotal
              ------------------------------------------------ */}

              <div className="rounded-xl bg-white p-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-400">
                  Tour subtotal
                </p>

                <div className="mt-1 flex flex-wrap items-baseline gap-2">

                  {isCustomQuote ? (
                    <span className="text-sm font-bold text-blue-700">
                      Custom quote
                    </span>
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

              {/* ------------------------------------------------
                  Group pricing
              ------------------------------------------------ */}

              <div
                className={`rounded-xl bg-white p-3 transition ${
                  hasDiscount || isCustomQuote
                    ? ""
                    : "opacity-55"
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
                    ? matchedGroupTier?.note ||
                      "Custom quote required."
                    : hasDiscount
                      ? `-${displayGroupDiscountAmount} · ${groupDiscountPercent}% off`
                      : `No discount for ${participantCount} guest${
                          participantCount === 1
                            ? ""
                            : "s"
                        }`}
                </p>
              </div>

              {/* ------------------------------------------------
                  Tour total
              ------------------------------------------------ */}

              <div className="rounded-xl bg-white p-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-400">
                  Tour total
                </p>

                <p
                  className={`mt-1 text-sm font-bold ${
                    isCustomQuote
                      ? "text-blue-700"
                      : "text-neutral-900"
                  }`}
                >
                  {isCustomQuote
                    ? "Custom quote"
                    : displayDiscountedTourSubtotal}
                </p>
              </div>

              {/* ------------------------------------------------
                  Private fee
              ------------------------------------------------ */}

              <div
                className={`rounded-xl bg-white p-3 transition ${
                  formData?.isPrivate
                    ? ""
                    : "opacity-55"
                }`}
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-400">
                  Private tour fee
                </p>

                <p
                  className={`mt-1 text-sm font-bold ${
                    formData?.isPrivate
                      ? "text-green-700"
                      : "text-neutral-400"
                  }`}
                >
                  {formData?.isPrivate
                    ? displayActivePrivateFee
                    : "Not added"}
                </p>
              </div>

              {/* ------------------------------------------------
                  Custom fee
              ------------------------------------------------ */}

              <div
                className={`rounded-xl bg-white p-3 transition ${
                  formData?.isCustom
                    ? ""
                    : "opacity-55"
                }`}
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-400">
                  Custom trip fee
                </p>

                <p
                  className={`mt-1 text-sm font-bold ${
                    formData?.isCustom
                      ? "text-blue-700"
                      : "text-neutral-400"
                  }`}
                >
                  {formData?.isCustom
                    ? displayActiveCustomFee
                    : "Not added"}
                </p>
              </div>
            </div>

            {/* ==================================================
                Custom quote notice
            ================================================== */}

            {isCustomQuote && (
              <div className="mt-3 rounded-xl border border-blue-100 bg-blue-50 p-3">
                <p className="text-sm font-bold text-blue-900">
                  Custom quote required
                </p>

                <p className="mt-1 text-xs leading-5 text-blue-700">
                  {matchedGroupTier?.note ||
                    "This group size requires a custom quote. The final price will be confirmed with you before payment."}
                </p>
              </div>
            )}

            {/* ==================================================
                Checkout notice
            ================================================== */}

            <div className="mt-3 flex flex-col gap-2 rounded-xl bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-bold text-neutral-900">
                  {isCustomQuote
                    ? "Quote confirmation is next."
                    : "Secure checkout is next."}
                </p>

                <p className="mt-1 text-xs leading-5 text-neutral-500">
                  {isCustomQuote
                    ? "Submit your booking details and we will confirm the custom group price with you."
                    : "Payment opens after this form. Pickup and vehicle details are manually confirmed after payment."}
                </p>
              </div>

              <div className="hidden flex-wrap gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-500 sm:flex">
                <span className="rounded-full bg-neutral-50 px-3 py-1">
                  Terms
                </span>

                <span className="rounded-full bg-neutral-50 px-3 py-1">
                  Privacy
                </span>

                <span className="rounded-full bg-green-200 px-3 py-1 text-green-950">
                  Powered by Stripe
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
          className={`hero-gradient flex w-full items-center justify-center gap-3 rounded-2xl px-8 py-4 text-base font-bold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl lg:flex-col lg:gap-2 ${
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
              : "Continue to checkout"}
          </span>
        </button>
      </div>
    </div>
  );
};

export default CheckoutSummary;