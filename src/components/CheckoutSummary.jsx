// src/components/CheckoutSummary.jsx

import { useMemo, useState, useRef, useEffect } from "react";
import gsap from "gsap";
import { KIDS_ACTIVITIES } from "../data/kidsActivities";

// ============================================================
// HELPER — PRIVATE / CUSTOM FEES
// ============================================================

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
      const amount =
        match.pricePerPerson ??
        match.price ??
        match.amount ??
        0;

      if (Number(amount) > 0) {
        return Number(amount);
      }
    }
  }

  if (type === "private" && tour?.privateFee !== undefined) {
    return Number(tour.privateFee) || 0;
  }

  if (type === "custom" && tour?.customFee !== undefined) {
    return Number(tour.customFee) || 0;
  }

  return defaults[type] || 0;
};

// ============================================================
// COMPONENT
// ============================================================

const CheckoutSummary = ({
  tour,

  adultCount,
  childCount,
  toddlerCount = 0,

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

  applyGroupDiscountToChildren = false,
}) => {
  const [activeDetail, setActiveDetail] = useState("tour");

  const guestEmojisRef = useRef([]);
  const guestContainerRef = useRef(null);
  const iconButtonsContainerRef = useRef(null);
  const iconButtonRefs = useRef({});

  // ============================================================
  // PRICING CALCULATION
  // ============================================================

  const pricing = useMemo(() => {
    const hasOptions =
      Array.isArray(tour?.options) &&
      tour.options.length > 0;

    const adults = Math.max(0, Number(adultCount) || 0);

    const childAges = Array.isArray(formData?.childAges)
      ? formData.childAges
          .map((age) => Number(age))
          .filter((age) => Number.isFinite(age) && age >= 0 && age <= 17)
      : [];

    const toddlers = childAges.filter((age) => age <= 5).length;
    const children = childAges.filter((age) => age >= 6 && age <= 11).length;
    const teens = childAges.filter((age) => age >= 12 && age <= 17).length;

    const participantCount = adults + childAges.length;

    const selectedKidsActivity =
      tour?.childFriendly === true
        ? KIDS_ACTIVITIES.find(
            (activity) => activity.id === formData?.selectedKidsActivity
          ) || null
        : null;

    const kidsActivityAdultPrice = selectedKidsActivity
      ? Number(selectedKidsActivity.adultPrice) || 0
      : 0;
    const kidsActivityChildPrice = selectedKidsActivity
      ? Number(selectedKidsActivity.childPrice) || 0
      : 0;
    const kidsActivityToddlerPrice = selectedKidsActivity
      ? Number(selectedKidsActivity.toddlerPrice) || 0
      : 0;

    const kidsActivityAdultTotal = kidsActivityAdultPrice * adults;
    const kidsActivityChildTotal = kidsActivityChildPrice * children;
    const kidsActivityToddlerTotal = kidsActivityToddlerPrice * toddlers;
    const kidsActivityTotal =
      kidsActivityAdultTotal +
      kidsActivityChildTotal +
      kidsActivityToddlerTotal;

    if (
      !tour ||
      !Array.isArray(tour.pricing) ||
      tour.pricing.length === 0
    ) {
      return {
        displayPrice: "—",
        participantCount,
        adults,
        children,
        toddlers,
        teens,
        hasOptions,
        displayBaseSubtotal: "—",
        groupDiscountPercent: 0,
        displayGroupDiscountAmount: "—",
        displayDiscountedTourSubtotal: "—",
        displayActivePrivateFee: "—",
        displayActiveCustomFee: "—",
        displayExtrasTotal: "—",
        extrasBreakdown: [],
        displayKidsActivityTotal: "—",
        kidsActivityTotal: 0,
        kidsActivityAdultPrice: 0,
        kidsActivityChildPrice: 0,
        kidsActivityToddlerPrice: 0,
        kidsActivityAdultTotal: 0,
        kidsActivityChildTotal: 0,
        kidsActivityToddlerTotal: 0,
        selectedKidsActivity,
        displayTotal: "—",
        currency: "ZAR",
        isCustomQuote: false,
        hasDiscount: false,
        matchedGroupTier: null,
        groupPricingType: null,
        selectedTourOption: null,
        originalTotal: 0,
        adultOriginalSubtotal: 0,
        teenOriginalSubtotal: 0,
        childOriginalSubtotal: 0,
        toddlerOriginalSubtotal: 0,
        adultDiscountAmount: 0,
        teenDiscountAmount: 0,
        discountAmount: 0,
        discountedTourTotal: 0,
        privateFee: 0,
        customFee: 0,
        extrasTotal: 0,
        finalTotal: 0,
        adultPrice: 0,
        teenBasePrice: 0,
        childBasePrice: 0,
        toddlerBasePrice: 0,
      };
    }

    const selectedTourOption = hasOptions
      ? tour.options.find((option) => option.id === selectedOption) || null
      : null;

    // ---- CATEGORY PRICING ----
    const adultPricing =
      tour.pricing.find((p) =>
        p.category?.toLowerCase().startsWith("adult")
      ) || tour.pricing[0];
    const adultBasePrice = Number(adultPricing?.pricePerPerson) || 0;
    let adultPrice = adultBasePrice;
    if (hasOptions) {
      adultPrice = selectedTourOption
        ? Number(selectedTourOption.pricePerPerson) || 0
        : 0;
    }

    const teenPricing = tour.pricing.find((p) =>
      p.category?.toLowerCase().startsWith("teen")
    );
    const teenBasePrice = Number(teenPricing?.pricePerPerson) || 0;

    const childPricing = tour.pricing.find((p) =>
      p.category?.toLowerCase().startsWith("child")
    );
    const childBasePrice = Number(childPricing?.pricePerPerson) || 0;

    const toddlerPricing = tour.pricing.find((p) =>
      p.category?.toLowerCase().startsWith("toddler")
    );
    const toddlerBasePrice = Number(toddlerPricing?.pricePerPerson) || 0;

    // ---- ORIGINAL SUBTOTALS ----
    const adultBaseSubtotal = adults * adultPrice;
    const teenBaseSubtotal = teens * teenBasePrice;
    const childBaseSubtotal = children * childBasePrice;
    const toddlerBaseSubtotal = toddlers * toddlerBasePrice;

    const originalSubtotal =
      adultBaseSubtotal +
      teenBaseSubtotal +
      childBaseSubtotal +
      toddlerBaseSubtotal;

    // ---- GROUP DISCOUNT ----
    let discountedSubtotal = originalSubtotal;
    let groupDiscountAmount = 0;
    let groupDiscountPercent = 0;
    let adultDiscountAmount = 0;
    let teenDiscountAmount = 0;
    let isCustomQuote = false;
    let hasDiscount = false;
    let matchedGroupTier = null;
    let groupPricingType = null;

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
      const groupTotal =
        matchedGroupTier.groupTotal != null ? Number(matchedGroupTier.groupTotal) : null;

      if (groupTotal !== null && Number.isFinite(groupTotal) && groupTotal > 0) {
        groupPricingType = "groupTotal";
        discountedSubtotal = groupTotal;
        groupDiscountAmount = Math.max(0, originalSubtotal - discountedSubtotal);
        groupDiscountPercent =
          originalSubtotal > 0 ? (groupDiscountAmount / originalSubtotal) * 100 : 0;
        adultDiscountAmount = groupDiscountAmount;
        teenDiscountAmount = 0;
        hasDiscount = groupDiscountAmount > 0;
        isCustomQuote = false;
      } else {
        const hasPerPersonPrice =
          matchedGroupTier.perPerson != null &&
          Number.isFinite(Number(matchedGroupTier.perPerson));
        const hasDiscountPercent =
          matchedGroupTier.discountPercent != null &&
          Number.isFinite(Number(matchedGroupTier.discountPercent));

        if (hasPerPersonPrice) {
          groupPricingType = "perPerson";
          const groupPersonPrice = Math.max(0, Number(matchedGroupTier.perPerson));

          const discountedAdultSubtotal = adults * groupPersonPrice;
          const discountedTeenSubtotal = teens * groupPersonPrice;
          const unchangedChildSubtotal = childBaseSubtotal;
          const unchangedToddlerSubtotal = toddlerBaseSubtotal;

          discountedSubtotal =
            discountedAdultSubtotal +
            discountedTeenSubtotal +
            unchangedChildSubtotal +
            unchangedToddlerSubtotal;

          adultDiscountAmount = Math.max(0, adultBaseSubtotal - discountedAdultSubtotal);
          teenDiscountAmount = Math.max(0, teenBaseSubtotal - discountedTeenSubtotal);
          groupDiscountAmount = adultDiscountAmount + teenDiscountAmount;

          const adultAndTeenOriginal = adultBaseSubtotal + teenBaseSubtotal;
          groupDiscountPercent =
            adultAndTeenOriginal > 0 ? (groupDiscountAmount / adultAndTeenOriginal) * 100 : 0;
          hasDiscount = groupDiscountAmount > 0;
          isCustomQuote = false;
        } else if (hasDiscountPercent) {
          groupPricingType = "discountPercent";
          const requestedDiscountPercent = Number(matchedGroupTier.discountPercent);
          const safeDiscountPercent = Math.min(Math.max(requestedDiscountPercent, 0), 100);

          const adultDiscount = adultBaseSubtotal * (safeDiscountPercent / 100);
          const discountedAdultSubtotal = adultBaseSubtotal - adultDiscount;
          const teenDiscount = teenBaseSubtotal * (safeDiscountPercent / 100);
          const discountedTeenSubtotal = teenBaseSubtotal - teenDiscount;

          discountedSubtotal =
            discountedAdultSubtotal +
            discountedTeenSubtotal +
            childBaseSubtotal +
            toddlerBaseSubtotal;

          adultDiscountAmount = Math.max(0, adultDiscount);
          teenDiscountAmount = Math.max(0, teenDiscount);
          groupDiscountAmount = adultDiscountAmount + teenDiscountAmount;
          groupDiscountPercent = safeDiscountPercent;
          hasDiscount = groupDiscountAmount > 0;
        } else {
          groupPricingType = "custom";
          isCustomQuote = true;
          discountedSubtotal = originalSubtotal;
          groupDiscountAmount = 0;
          groupDiscountPercent = 0;
          adultDiscountAmount = 0;
          teenDiscountAmount = 0;
          hasDiscount = false;
        }
      }
    }

    // ---- FEES ----
    const privateFee = formData?.isPrivate ? getFee(tour, "private") : 0;
    const customFee = formData?.isCustom ? getFee(tour, "custom") : 0;

    // ---- EXTRAS ----
    const currency = tour.currency || "ZAR";
    const formatPrice = (amount) =>
      `${currency} ${Number(amount || 0).toFixed(2)}`;

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
          return;
        }

        if (cost > 0) {
          extrasTotal += cost;
          extrasBreakdown.push({ label, cost, formattedCost: formatPrice(cost), unit });
        }
      });
    }

    // ---- FINAL TOTAL ----
    const total = isCustomQuote
      ? null
      : discountedSubtotal + privateFee + customFee + extrasTotal + kidsActivityTotal;

    // ---- RETURN ----
    return {
      adults,
      children,
      toddlers,
      teens,
      participantCount,
      adultPrice: Number(adultPrice),
      teenBasePrice: Number(teenBasePrice),
      childBasePrice: Number(childBasePrice),
      toddlerBasePrice: Number(toddlerBasePrice),
      adultOriginalSubtotal: Number(adultBaseSubtotal),
      teenOriginalSubtotal: Number(teenBaseSubtotal),
      childOriginalSubtotal: Number(childBaseSubtotal),
      toddlerOriginalSubtotal: Number(toddlerBaseSubtotal),
      originalTotal: Number(originalSubtotal),
      adultDiscountAmount: Number(adultDiscountAmount),
      teenDiscountAmount: Number(teenDiscountAmount),
      discountAmount: Number(groupDiscountAmount),
      groupDiscountPercent: Number(groupDiscountPercent),
      discountedTourTotal: Number(discountedSubtotal),
      privateFee: Number(privateFee),
      customFee: Number(customFee),
      extrasTotal: Number(extrasTotal),
      selectedKidsActivity,
      kidsActivityAdultPrice: Number(kidsActivityAdultPrice),
      kidsActivityChildPrice: Number(kidsActivityChildPrice),
      kidsActivityToddlerPrice: Number(kidsActivityToddlerPrice),
      kidsActivityAdultTotal: Number(kidsActivityAdultTotal),
      kidsActivityChildTotal: Number(kidsActivityChildTotal),
      kidsActivityToddlerTotal: Number(kidsActivityToddlerTotal),
      kidsActivityTotal: Number(kidsActivityTotal),
      finalTotal: isCustomQuote ? null : Number(total),
      displayPrice: formatPrice(adultPrice),
      hasOptions,
      selectedTourOption,
      displayBaseSubtotal: formatPrice(originalSubtotal),
      displayGroupDiscountAmount: formatPrice(groupDiscountAmount),
      displayDiscountedTourSubtotal: isCustomQuote
        ? "Custom quote"
        : formatPrice(discountedSubtotal),
      displayActivePrivateFee:
        privateFee > 0 ? `+${formatPrice(privateFee)}` : "—",
      displayActiveCustomFee:
        customFee > 0 ? `+${formatPrice(customFee)}` : "—",
      displayExtrasTotal: extrasTotal > 0 ? formatPrice(extrasTotal) : "—",
      displayKidsActivityTotal: selectedKidsActivity
        ? formatPrice(kidsActivityTotal)
        : "—",
      extrasBreakdown,
      displayTotal: isCustomQuote ? "Custom quote" : formatPrice(total),
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
    toddlerCount,
    selectedOption,
    formData?.childAges,
    formData?.isPrivate,
    formData?.isCustom,
    formData?.selectedKidsActivity,
    selectedExtras,
    additionalPricing,
    applyGroupDiscountToChildren,
  ]);

  // ============================================================
  // DESTRUCTURE
  // ============================================================

  const {
    displayPrice,
    participantCount,
    adults,
    children,
    toddlers,
    teens,
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
    displayKidsActivityTotal,
    selectedKidsActivity,
    kidsActivityAdultPrice,
    kidsActivityChildPrice,
    kidsActivityToddlerPrice,
    kidsActivityAdultTotal,
    kidsActivityChildTotal,
    kidsActivityToddlerTotal,
    displayTotal,
    currency,
    isCustomQuote,
    hasDiscount,
    matchedGroupTier,
    groupPricingType,
    adultPrice,
    teenBasePrice,
    childBasePrice,
    toddlerBasePrice,
    adultOriginalSubtotal,
    teenOriginalSubtotal,
    childOriginalSubtotal,
    toddlerOriginalSubtotal,
    adultDiscountAmount,
    teenDiscountAmount,
    discountedTourTotal,
    privateFee,
    customFee,
    extrasTotal,
    kidsActivityTotal,
    finalTotal,
  } = pricing;

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
  }, [activeDetail, adults, teens, children, toddlers]);

  // ============================================================
  // SCROLL TO CENTER SELECTED ICON BUTTON ON MOBILE
  // ============================================================

  const scrollToCenterButton = (key) => {
    const container = iconButtonsContainerRef.current;
    const button = iconButtonRefs.current[key];

    if (!container || !button) return;

    // Use requestAnimationFrame to ensure DOM is updated
    requestAnimationFrame(() => {
      const containerRect = container.getBoundingClientRect();
      const buttonRect = button.getBoundingClientRect();

      // Calculate the scroll position to center the button
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
  // BUILD BREAKDOWN ITEMS — FIXED LABELS
  // ============================================================

  const breakdownItems = [
    {
      label: "Adults",
      count: adults,
      perPerson: adultPrice,
      originalSubtotal: adultOriginalSubtotal,
      discountAmount: adultDiscountAmount,
      discountedSubtotal: adultOriginalSubtotal - adultDiscountAmount,
    },
    {
      label: "Teens",
      count: teens,
      perPerson: teenBasePrice,
      originalSubtotal: teenOriginalSubtotal,
      discountAmount: teenDiscountAmount,
      discountedSubtotal: teenOriginalSubtotal - teenDiscountAmount,
    },
    {
      label: "Children",
      count: children,
      perPerson: childBasePrice,
      originalSubtotal: childOriginalSubtotal,
      discountAmount: 0,
      discountedSubtotal: childOriginalSubtotal,
    },
    {
      label: "Toddlers",
      count: toddlers,
      perPerson: toddlerBasePrice,
      originalSubtotal: toddlerOriginalSubtotal,
      discountAmount: 0,
      discountedSubtotal: toddlerOriginalSubtotal,
    },
  ].filter((item) => item.count > 0);

  const formatCurrency = (amount) =>
    `${currency} ${Number(amount || 0).toFixed(2)}`;

  // ============================================================
  // DETAILS DATA
  // ============================================================

  const detailItems = [
    {
      key: "tour",
      icon: "🏝️",
      label: "Tour",
      complete: true,
    },
    {
      key: "traveller",
      icon: "👤",
      label: "Traveller",
      complete: contactDetailsComplete,
    },
    {
      key: "date",
      icon: "📅",
      label: "Date",
      complete: dateDetailsComplete,
    },
    {
      key: "guests",
      icon: "👥",
      label: "Guests",
      complete: true,
    },
    {
      key: "pickup",
      icon: "🚐",
      label: "Pickup",
      complete: pickupDetailsComplete,
    },
  ];

  // ---- Render rich content for each detail ----
  const renderDetailContent = (key) => {
    switch (key) {
      case "tour":
        return (
          <div className="flex items-center gap-3">
            {tour?.images?.[0] ? (
              <img
                src={tour.images[0]}
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
          <div>
            <p className="text-sm font-bold text-neutral-900">
              {contactDetailsComplete ? formData?.fullName : "Details not completed"}
            </p>
            {contactDetailsComplete && (
              <>
                <p className="text-xs text-neutral-600">{formData?.email}</p>
                <p className="text-xs text-neutral-600">{formData?.phone}</p>
              </>
            )}
          </div>
        );
      case "date":
        return (
          <div>
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
          <div ref={guestContainerRef} className="flex items-center gap-4 flex-wrap">
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
            {children > 0 && (
              <div className="flex items-center gap-1">
                <span
                  ref={(el) => (guestEmojisRef.current[2] = el)}
                  className="text-2xl"
                  style={{ opacity: 0, transform: "scale(0)" }}
                >
                  👧
                </span>
                <span className="text-sm font-bold">×{children}</span>
              </div>
            )}
            {toddlers > 0 && (
              <div className="flex items-center gap-1">
                <span
                  ref={(el) => (guestEmojisRef.current[3] = el)}
                  className="text-2xl"
                  style={{ opacity: 0, transform: "scale(0)" }}
                >
                  👶
                </span>
                <span className="text-sm font-bold">×{toddlers}</span>
              </div>
            )}
            {adults === 0 && teens === 0 && children === 0 && toddlers === 0 && (
              <span className="text-sm text-neutral-500">No guests</span>
            )}
          </div>
        );
      case "pickup":
        return (
          <div>
            <p className="text-sm font-bold text-neutral-900">
              {formData?.pickupLocation || "Choose pickup location"}
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  const activeDetailData = detailItems.find((d) => d.key === activeDetail) || detailItems[0];

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div
      ref={checkoutRef}
      className="border-t border-black/5 bg-white/92"
    >
      <div className="grid gap-3 grid-cols-1">
        {/* ======================================================
            SUMMARY CARD
        ====================================================== */}

        <div className="rounded-2xl border border-black/10 bg-white p-4 text-neutral-950 shadow-[0_12px_30px_rgba(0,0,0,0.05)]">
          {/* HEADER */}
          <div className="flex items-center gap-2 mb-4">
            {CheckoutCartIcon && (
              <CheckoutCartIcon className="h-7 w-7 text-blue-600" />
            )}
            <p className="text-2xl font-frank font-   text-neutral-800">
              Checkout summary
            </p>
          </div>

          {/* ====================================================
              BOOKING DETAILS — ICON BUTTONS + VALUE PANEL
          ==================================================== */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            {/* Icon buttons container — with scroll-to-center on selection */}
            <div
              ref={iconButtonsContainerRef}
              className="flex flex-nowrap gap-2 overflow-x-auto pb-2 lg:flex-wrap lg:overflow-visible lg:pb-0 lg:gap-3 scroll-smooth"
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
                      ${isActive
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

            {/* Value panel */}
            <div className="flex-1 relative z-40">
              <div
                className={`
                  rounded-xl p-4 z-30
                  transition-all duration-300 ease-out
                  ${activeDetailData.complete
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
                  <p className="text-xs text-amber-600 font-medium mt-2 flex items-center gap-1">
                    ⚠️ Incomplete – please fill in this field
                  </p>
                )}
              </div>
              {/* 3D shadow */}
              <div
                className="z-[-1] absolute -bottom-2 left-1/2 -translate-x-1/2 w-3/4 h-4 rounded-full bg-black/20 blur-lg pointer-events-none"
                style={{ filter: "blur(6px)" }}
              />
            </div>
          </div>

          {/* ====================================================
              PRICE BREAKDOWN + TOTAL
          ==================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            {/* LEFT — PRICE BREAKDOWN */}
            <div className="lg:col-span-2 space-y-4 rounded-2xl border border-black/5 bg-stone-50 p-4">
              <h4 className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-400">
                Price breakdown
              </h4>

              {/* PER‑CATEGORY LIST */}
              <div className="space-y-2">
                {breakdownItems.map((item) => {
                  const hasItemDiscount = item.discountAmount > 0;
                  const displayOriginal = formatCurrency(item.originalSubtotal);
                  const displayDiscounted = formatCurrency(item.discountedSubtotal);

                  return (
                    <div
                      key={item.label}
                      className="flex flex-wrap items-baseline justify-between gap-1 rounded-lg bg-white px-3 py-2 text-sm"
                    >
                      <span className="font-medium text-neutral-700">
                        {item.label}{" "}
                        <span className="text-neutral-400">
                          ({item.count} × {formatCurrency(item.perPerson)})
                        </span>
                      </span>
                      <span className="font-semibold text-neutral-900">
                        {hasItemDiscount ? (
                          <>
                            <span className="text-red-500 line-through mr-2">
                              {displayOriginal}
                            </span>
                            <span className="text-green-700">{displayDiscounted}</span>
                          </>
                        ) : (
                          displayOriginal
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* SUBTOTAL */}
              <div className="flex flex-wrap items-baseline justify-between rounded-lg bg-white px-3 py-2 text-sm">
                <span className="font-medium text-neutral-700">Tour subtotal</span>
                <span className="font-semibold text-neutral-900">
                  {hasDiscount ? (
                    <>
                      <span className="text-red-500 line-through mr-2">
                        {displayBaseSubtotal}
                      </span>
                      <span className="text-green-700">
                        {displayDiscountedTourSubtotal}
                      </span>
                    </>
                  ) : (
                    displayBaseSubtotal
                  )}
                </span>
              </div>

              {/* GROUP DISCOUNT LINE */}
              {hasDiscount && (
                <div className="flex flex-wrap items-baseline justify-between rounded-lg bg-green-50 px-3 py-2 text-sm">
                  <span className="font-medium text-green-800">
                    Group discount ({groupPricingType === "perPerson" ? "per‑person rate" : `${groupDiscountPercent.toFixed(0)}% off`})
                  </span>
                  <span className="font-semibold text-green-700">
                    -{displayGroupDiscountAmount}
                  </span>
                </div>
              )}

              {/* PRIVATE / CUSTOM FEES */}
              {privateFee > 0 && (
                <div className="flex flex-wrap items-baseline justify-between rounded-lg bg-white px-3 py-2 text-sm">
                  <span className="font-medium text-neutral-700">Private tour fee</span>
                  <span className="font-semibold text-neutral-900">
                    {displayActivePrivateFee.replace("+", "")}
                  </span>
                </div>
              )}
              {customFee > 0 && (
                <div className="flex flex-wrap items-baseline justify-between rounded-lg bg-white px-3 py-2 text-sm">
                  <span className="font-medium text-neutral-700">Custom trip fee</span>
                  <span className="font-semibold text-neutral-900">
                    {displayActiveCustomFee.replace("+", "")}
                  </span>
                </div>
              )}

              {/* EXTRAS */}
              {extrasBreakdown.length > 0 && (
                <div className="rounded-lg border border-black/5 bg-white p-3">
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

              {/* KIDS ACTIVITY */}
              {selectedKidsActivity && (
                <div className="rounded-xl border border-blue-100 bg-blue-50 p-3">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-blue-500">
                        Kids activity
                      </p>
                      <p className="mt-1 truncate text-sm font-bold text-blue-950">
                        {selectedKidsActivity.name}
                      </p>
                      <p className="mt-0.5 text-xs text-blue-700">
                        {selectedKidsActivity.category}
                        {selectedKidsActivity.location
                          ? ` · ${selectedKidsActivity.location}`
                          : ""}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-black text-blue-700">
                      + {displayKidsActivityTotal}
                    </span>
                  </div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-3">
                    <div className="rounded-lg bg-white/70 p-2">
                      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-blue-500">
                        Adults
                      </p>
                      <p className="mt-1 text-xs text-blue-700">
                        {adults} × {currency} {kidsActivityAdultPrice.toFixed(2)}
                      </p>
                      <p className="mt-1 text-sm font-bold text-blue-950">
                        {currency} {kidsActivityAdultTotal.toFixed(2)}
                      </p>
                    </div>
                    <div className="rounded-lg bg-white/70 p-2">
                      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-blue-500">
                        Children
                      </p>
                      <p className="mt-1 text-xs text-blue-700">
                        {children} × {currency} {kidsActivityChildPrice.toFixed(2)}
                      </p>
                      <p className="mt-1 text-sm font-bold text-blue-950">
                        {currency} {kidsActivityChildTotal.toFixed(2)}
                      </p>
                    </div>
                    <div className="rounded-lg bg-white/70 p-2">
                      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-blue-500">
                        Toddlers
                      </p>
                      <p className="mt-1 text-xs text-blue-700">
                        {toddlers} × {currency} {kidsActivityToddlerPrice.toFixed(2)}
                      </p>
                      <p className="mt-1 text-sm font-bold text-blue-950">
                        {currency} {kidsActivityToddlerTotal.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* CUSTOM QUOTE NOTICE */}
              {isCustomQuote && (
                <div className="rounded-xl border border-blue-100 bg-blue-50 p-3">
                  <p className="text-sm font-bold text-blue-900">
                    Custom quote required
                  </p>
                  <p className="mt-1 text-xs leading-5 text-blue-700">
                    {matchedGroupTier?.note ||
                      "This group size requires a custom quote. The final price will be confirmed with you before payment."}
                  </p>
                </div>
              )}

              {/* OPTION REQUIRED */}
              {hasOptions && !selectedTourOption && (
                <div className="rounded-xl border border-blue-100 bg-blue-50 p-3">
                  <p className="text-sm font-bold text-blue-900">
                    Select an option
                  </p>
                  <p className="mt-1 text-xs leading-5 text-blue-700">
                    Choose your preferred experience above before continuing to checkout.
                  </p>
                </div>
              )}
            </div>

            {/* RIGHT — TOTAL + CHECKOUT BUTTON */}
            <div className="lg:col-span-1">
              <div className="sticky top-4 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 p-6 text-white shadow-lg">
                <p className="text-sm font-medium uppercase tracking-wider opacity-80">
                  Total Due
                </p>
                <p className="mt-1 font-frank text-4xl font-bold leading-none">
                  {displayTotal}
                </p>

                <div className="mt-4 space-y-1 border-t border-white/20 pt-4 text-sm">
                  <div className="flex justify-between">
                    <span className="opacity-80">Subtotal</span>
                    <span>{displayBaseSubtotal}</span>
                  </div>
                  {hasDiscount && (
                    <div className="flex justify-between text-green-300">
                      <span>Discount</span>
                      <span>-{displayGroupDiscountAmount}</span>
                    </div>
                  )}
                  {privateFee > 0 && (
                    <div className="flex justify-between">
                      <span className="opacity-80">Private fee</span>
                      <span>{displayActivePrivateFee.replace("+", "")}</span>
                    </div>
                  )}
                  {customFee > 0 && (
                    <div className="flex justify-between">
                      <span className="opacity-80">Custom fee</span>
                      <span>{displayActiveCustomFee.replace("+", "")}</span>
                    </div>
                  )}
                  {extrasTotal > 0 && (
                    <div className="flex justify-between">
                      <span className="opacity-80">Extras</span>
                      <span>{displayExtrasTotal}</span>
                    </div>
                  )}
                  {selectedKidsActivity && (
                    <div className="flex justify-between">
                      <span className="opacity-80">Activity</span>
                      <span>{displayKidsActivityTotal}</span>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  form="booking-form"
                  disabled={hasOptions && !selectedTourOption}
                  className="mt-6 w-full rounded-xl bg-white py-4 text-center text-sm font-bold uppercase tracking-wider text-blue-700 shadow-lg transition hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                >
                  {isCustomQuote
                    ? "Request custom quote"
                    : hasOptions && !selectedTourOption
                    ? "Select option"
                    : "Continue to checkout"}
                </button>

                <div className="mt-4 flex justify-center gap-3 text-[10px] font-bold uppercase tracking-[0.14em] text-white/60">
                  <span>Terms</span>
                  <span>Privacy</span>
                  <span className="rounded-full bg-white/20 px-2 py-0.5 text-white">
                    Paystack
                  </span>
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