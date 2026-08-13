// additionalPricing: [
//   { category: "Private", pricePerPerson: 750 },
//   { category: "Custom", pricePerPerson: 500 },
// ],

// src/components/CheckoutSummary.jsx
import { useMemo } from 'react';

/**
 * Get fee amount for a given type ('private' or 'custom').
 * Looks in tour.additionalPricing first, then falls back to a default.
 */
const getFee = (tour, type) => {
  // Default values
  const defaults = {
    private: 750,
    custom: 500,
  };

  // 1. Check additionalPricing
  if (Array.isArray(tour.additionalPricing)) {
    const match = tour.additionalPricing.find(item =>
      item.category?.toLowerCase().includes(type)
    );
    if (match) {
      const amount = match.pricePerPerson || match.price || match.amount || 0;
      if (amount > 0) return amount;
    }
  }

  // 2. Fallback to direct properties (if defined)
  if (type === 'private' && tour.privateFee !== undefined) return tour.privateFee;
  if (type === 'custom' && tour.customFee !== undefined) return tour.customFee;

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
  // ----- Pricing calculation -----
  const pricing = useMemo(() => {
    console.log('[CheckoutSummary] Tour data:', tour);
    console.log('[CheckoutSummary] Guests:', { adultCount, childCount });

    if (!tour || !tour.pricing || tour.pricing.length === 0) {
      console.warn('[CheckoutSummary] No pricing found, using fallback.');
      return {
        displayPrice: '—',
        participantCount: 0,
        displayBaseSubtotal: '—',
        groupDiscountPercent: 0,
        displayGroupDiscountAmount: '—',
        displayDiscountedTourSubtotal: '—',
        displayActivePrivateFee: '—',
        displayActiveCustomFee: '—',
        displayTotal: '—',
        currency: 'ZAR',
      };
    }

    // Adult & child prices
    const adultPricing = tour.pricing.find(p =>
      p.category.toLowerCase().includes('adult')
    ) || tour.pricing[0];
    const adultPrice = adultPricing?.pricePerPerson || 0;
    const childPricing = tour.pricing.find(p =>
      p.category.toLowerCase().includes('child')
    );
    const childPrice = childPricing?.pricePerPerson ?? 0;
    const totalParticipants = adultCount + childCount;
    const originalSubtotal = adultCount * adultPrice + childCount * childPrice;

    // Group discount
    let discountedSubtotal = originalSubtotal;
    let groupDiscountPercent = 0;
    let groupDiscountAmount = 0;

    if (tour.groupPricing?.enabled && tour.groupPricing.tiers?.length) {
      const tier = tour.groupPricing.tiers.find(
        t => totalParticipants >= t.minPeople && totalParticipants <= t.maxPeople
      );
      if (tier) {
        let discountedParticipants = totalParticipants;
        if (!applyGroupDiscountToChildren) {
          discountedParticipants = adultCount;
        }
        const tierTotal = discountedParticipants * tier.perPerson;
        const childCost = applyGroupDiscountToChildren ? 0 : childCount * childPrice;
        const newTotal = tierTotal + childCost;
        groupDiscountAmount = originalSubtotal - newTotal;
        groupDiscountPercent = originalSubtotal > 0
          ? (groupDiscountAmount / originalSubtotal) * 100
          : 0;
        discountedSubtotal = newTotal;
      }
    }

    // ----- Fees: Private & Custom with fallback defaults -----
    const privateFee = formData?.isPrivate ? getFee(tour, 'private') : 0;
    const customFee = formData?.isCustom ? getFee(tour, 'custom') : 0;
    console.log('[CheckoutSummary] Private fee:', privateFee, 'Custom fee:', customFee);

    // Final total
    const total = discountedSubtotal + privateFee + customFee;
    const currency = tour.currency || 'ZAR';
    const formatPrice = (amount) => `${currency} ${amount.toFixed(2)}`;

    return {
      displayPrice: formatPrice(adultPrice),
      participantCount: totalParticipants,
      displayBaseSubtotal: formatPrice(originalSubtotal),
      groupDiscountPercent: Math.round(groupDiscountPercent),
      displayGroupDiscountAmount: formatPrice(groupDiscountAmount),
      displayDiscountedTourSubtotal: formatPrice(discountedSubtotal),
      // Show fee amount with '+' prefix only when active
      displayActivePrivateFee: privateFee > 0 ? `+${formatPrice(privateFee)}` : '—',
      displayActiveCustomFee: customFee > 0 ? `+${formatPrice(customFee)}` : '—',
      displayTotal: formatPrice(total),
      currency,
    };
  }, [tour, adultCount, childCount, formData?.isPrivate, formData?.isCustom, applyGroupDiscountToChildren]);

  // ----- Destructure -----
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
  } = pricing;

  const hasDiscount = groupDiscountPercent > 0;

  // ----- Render (same as before) -----
  return (
    <div
      ref={checkoutRef}
      className="border-t border-black/5 bg-white/92 px-4 py-4 md:px-8 md:py-5"
    >
      <div className="grid items-stretch gap-3 lg:grid-cols-[1fr_auto]">
        <div className="rounded-2xl border border-black/10 bg-white p-4 text-neutral-950 shadow-[0_12px_30px_rgba(0,0,0,0.05)]">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-500">
                Checkout summary
              </p>
              <div className="mt-1 font-frank text-3xl font-bold leading-none text-neutral-950">
                {displayTotal}
              </div>
              <p className="mt-2 text-xs leading-5 text-neutral-500">
                {currency} estimate · final amount is recalculated securely at checkout.
              </p>
            </div>

            <div className="grid gap-2 sm:grid-cols-2 xl:min-w-[31rem]">
              {/* Tour */}
              <div className="rounded-2xl bg-neutral-50 p-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-neutral-400">Tour</p>
                <p className="mt-1 line-clamp-1 text-sm font-bold text-neutral-900">
                  {tour?.title || tour?.info || 'Unnamed Tour'}
                </p>
              </div>
              {/* Traveller */}
              <div className={`rounded-2xl p-3 transition ${contactDetailsComplete ? "bg-neutral-50" : "bg-neutral-100 opacity-55"}`}>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-neutral-400">Traveller</p>
                <p className={`mt-1 line-clamp-1 text-sm font-bold ${contactDetailsComplete ? "text-neutral-900" : "text-neutral-400"}`}>
                  {contactDetailsComplete ? formData?.fullName : "Details not completed"}
                </p>
              </div>
              {/* Date */}
              <div className={`rounded-2xl p-3 transition ${dateDetailsComplete ? "bg-neutral-50" : "bg-neutral-100 opacity-55"}`}>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-neutral-400">Date</p>
                <p className={`mt-1 text-sm font-bold ${dateDetailsComplete ? "text-neutral-900" : "text-neutral-400"}`}>
                  {formData?.date || "Select date"}
                </p>
              </div>
              {/* Guests */}
              <div className="rounded-2xl bg-neutral-50 p-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-neutral-400">Guests</p>
                <p className="mt-1 text-sm font-bold text-neutral-900">
                  {adultCount} adult{adultCount === 1 ? "" : "s"}
                  {childCount > 0 ? ` · ${childCount} child${childCount === 1 ? "" : "ren"}` : ""}
                </p>
              </div>
              {/* Pickup */}
              <div className={`rounded-2xl p-3 transition sm:col-span-2 ${pickupDetailsComplete ? "bg-neutral-50" : "bg-neutral-100 opacity-55"}`}>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-neutral-400">Pickup</p>
                <p className={`mt-1 line-clamp-1 text-sm font-bold ${pickupDetailsComplete ? "text-neutral-900" : "text-neutral-400"}`}>
                  {formData?.pickupLocation || "Choose pickup location"}
                </p>
              </div>
            </div>
          </div>

          {/* Pricing breakdown */}
          <div className="mt-4 rounded-2xl border border-black/5 bg-stone-50 p-3">
            <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-5">
              {/* Subtotal */}
              <div className="rounded-xl bg-white p-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-400">
                  Tour subtotal
                </p>
                <div className="mt-1 flex items-baseline gap-2 flex-wrap">
                  {hasDiscount ? (
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

              {/* Group discount */}
              <div className={`rounded-xl bg-white p-3 transition ${hasDiscount ? "" : "opacity-55"}`}>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-400">
                  Group discount
                </p>
                <p className={`mt-1 text-sm font-bold ${hasDiscount ? "text-green-700" : "text-neutral-400"}`}>
                  {hasDiscount
                    ? `-${displayGroupDiscountAmount} · ${groupDiscountPercent}% off`
                    : `No discount for ${participantCount} guest${participantCount === 1 ? "" : "s"}`}
                </p>
              </div>

              {/* Tour total */}
              <div className="rounded-xl bg-white p-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-400">
                  Tour total
                </p>
                <p className="mt-1 text-sm font-bold text-neutral-900">
                  {displayDiscountedTourSubtotal}
                </p>
              </div>

              {/* Private fee */}
              <div className={`rounded-xl bg-white p-3 transition ${formData?.isPrivate ? "" : "opacity-55"}`}>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-400">
                  Private tour fee
                </p>
                <p className={`mt-1 text-sm font-bold ${formData?.isPrivate ? "text-green-700" : "text-neutral-400"}`}>
                  {formData?.isPrivate ? displayActivePrivateFee : "Not added"}
                </p>
              </div>

              {/* Custom fee */}
              <div className={`rounded-xl bg-white p-3 transition ${formData?.isCustom ? "" : "opacity-55"}`}>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-400">
                  Custom trip fee
                </p>
                <p className={`mt-1 text-sm font-bold ${formData?.isCustom ? "text-blue-700" : "text-neutral-400"}`}>
                  {formData?.isCustom ? displayActiveCustomFee : "Not added"}
                </p>
              </div>
            </div>

            <div className="mt-3 flex flex-col gap-2 rounded-xl bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-bold text-neutral-900">Secure checkout is next.</p>
                <p className="mt-1 text-xs leading-5 text-neutral-500">
                  Payment opens after this form. Pickup and vehicle details are manually confirmed after payment.
                </p>
              </div>
              <div className="hidden flex-wrap gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-500 sm:flex">
                <span className="rounded-full bg-neutral-50 px-3 py-1">Terms</span>
                <span className="rounded-full bg-neutral-50 px-3 py-1">Privacy</span>
                <span className="rounded-full bg-green-200 px-3 py-1 text-green-950">Powered by Stripe</span>
              </div>
            </div>
          </div>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          form="booking-form"
          className={`hero-gradient flex w-full items-center justify-center gap-3 rounded-2xl px-8 py-4 text-base font-bold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl lg:flex-col lg:gap-2 ${
            isEmbedded ? "min-h-[4.6rem] lg:min-h-[8.75rem] lg:w-[15rem]" : "min-h-[5.5rem] lg:min-h-[9rem] lg:w-[15rem]"
          }`}
        >
          {CheckoutCartIcon && <CheckoutCartIcon className="h-7 w-7 lg:h-10 lg:w-10" />}
          <span>Continue to checkout</span>
        </button>
      </div>
    </div>
  );
};

export default CheckoutSummary;