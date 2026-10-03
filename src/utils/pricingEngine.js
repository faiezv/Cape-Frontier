// src/utils/pricingEngine.js
import { FX_RATES } from "../data/tours.js";

export const convertPrice = (baseAmount = 0, targetCurrency = "ZAR") =>
  Number(baseAmount || 0) * (FX_RATES[targetCurrency] || 1);

export const formatMoney = (amount, currency = "ZAR") =>
  `${currency} ${Number(amount || 0).toFixed(2)}`;

export const getFee = (tour, type) => {
  const defaults = { private: 750, custom: 500 };
  if (Array.isArray(tour?.additionalPricing)) {
    const match = tour.additionalPricing.find((item) =>
      item.category?.toLowerCase().includes(type),
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

export const matchGroupTier = (tour, qualifyingHeadcount) => {
  if (
    !tour?.groupPricing?.enabled ||
    !Array.isArray(tour.groupPricing.tiers) ||
    tour.groupPricing.tiers.length === 0
  )
    return null;

  return (
    tour.groupPricing.tiers.find((tier) => {
      const min = Number(tier.minPeople) || 0;
      const max = tier.maxPeople == null ? Infinity : Number(tier.maxPeople);
      return qualifyingHeadcount >= min && qualifyingHeadcount <= max;
    }) || null
  );
};

export const computePricing = ({
  tour,
  childAges = [],
  adultCount = 1,
  currency = "ZAR",
  selectedOption = null,
  selectedExtras = {},
  formData = {},
  kidsActivities = [],
}) => {
  const adults = Math.max(0, Number(adultCount) || 0);

  const normalizedChildAges = (Array.isArray(childAges) ? childAges : [])
    .map((a) => Number(a))
    .filter((a) => Number.isFinite(a) && a >= 0 && a <= 17);

  const toddlers = normalizedChildAges.filter((a) => a <= 5).length;
  const children = normalizedChildAges.filter((a) => a >= 6 && a <= 11).length;
  const teens = normalizedChildAges.filter((a) => a >= 12 && a <= 17).length;

  // Total heads (used for display / limits).
  const participantCount = adults + normalizedChildAges.length;

  // ── Qualifying headcount for group pricing ─────────────────────────
  // Only adults and teens count toward the group-tier threshold.
  // Toddlers and children do NOT — a "group of 6" means 6 paying
  // adult-equivalent guests, not 3 adults plus 3 toddlers.

  const counts = {
    teens: true,
    children: false,
    toddlers: false,
    ...(tour?.groupPricing?.countsTowardTier || {}),
  };

  const qualifyingHeadcount =
    adults +
    (counts.teens ? teens : 0) +
    (counts.children ? children : 0) +
    (counts.toddlers ? toddlers : 0);

  const hasOptions = Array.isArray(tour?.options) && tour.options.length > 0;
  const selectedTourOption = hasOptions
    ? tour.options.find((o) => o.id === selectedOption) || null
    : null;

  // ── Base prices (ZAR) ──────────────────────────────────────────────
  const getBasePrice = (prefix) => {
    if (!Array.isArray(tour?.pricing)) return 0;
    const entry = tour.pricing.find((p) =>
      p.category?.toLowerCase().startsWith(prefix.toLowerCase()),
    );
    return Number(entry?.pricePerPerson) || 0;
  };

  let adultPriceZar = getBasePrice("adult");
  if (hasOptions) {
    adultPriceZar = selectedTourOption
      ? Number(selectedTourOption.pricePerPerson) || 0
      : 0;
  } else if (!adultPriceZar) {
    adultPriceZar = Number(tour?.priceBase) || 0;
  }

  const teenPriceZar = getBasePrice("teen") || adultPriceZar;
  const childPriceZar = getBasePrice("child");
  const toddlerPriceZar = getBasePrice("toddler");

  // ── Convert to selected currency ───────────────────────────────────
  const adultPrice = convertPrice(adultPriceZar, currency);
  const teenPrice = convertPrice(teenPriceZar, currency);
  const childPrice = convertPrice(childPriceZar, currency);
  const toddlerPrice = convertPrice(toddlerPriceZar, currency);

  // ── Original subtotals ─────────────────────────────────────────────
  const adultSubtotal = adults * adultPrice;
  const teenSubtotal = teens * teenPrice;
  const childSubtotal = children * childPrice;
  const toddlerSubtotal = toddlers * toddlerPrice;
  const originalSubtotal =
    adultSubtotal + teenSubtotal + childSubtotal + toddlerSubtotal;

  // ── Group pricing ──────────────────────────────────────────────────
  let discountedSubtotal = originalSubtotal;
  let groupDiscountAmount = 0;
  let groupDiscountPercent = 0;
  let adultDiscountAmount = 0;
  let teenDiscountAmount = 0;
  let hasDiscount = false;
  let isCustomQuote = false;
  let groupPricingType = null;

  // Effective per-person rates — initialised to base rates and
  // overwritten below whenever a group tier changes them. These are
  // the numbers the UI should render as "× per person".
  let effectiveAdultPrice = adultPrice;
  let effectiveTeenPrice = teenPrice;
  let effectiveChildPrice = childPrice;
  let effectiveToddlerPrice = toddlerPrice;

  const matchedGroupTier = matchGroupTier(tour, qualifyingHeadcount);

  if (matchedGroupTier) {
    const rawGroupTotal =
      matchedGroupTier.groupTotal != null
        ? Number(matchedGroupTier.groupTotal)
        : null;

    if (
      rawGroupTotal !== null &&
      Number.isFinite(rawGroupTotal) &&
      rawGroupTotal > 0
    ) {
      // Fixed group total — convert from ZAR to selected currency
      groupPricingType = "groupTotal";
      discountedSubtotal = convertPrice(rawGroupTotal, currency);
      groupDiscountAmount = Math.max(0, originalSubtotal - discountedSubtotal);
      groupDiscountPercent =
        originalSubtotal > 0
          ? (groupDiscountAmount / originalSubtotal) * 100
          : 0;
      adultDiscountAmount = groupDiscountAmount;
      teenDiscountAmount = 0;
      hasDiscount = groupDiscountAmount > 0;

      // Spread the group-total (minus children/toddlers) across the
      // adult-equivalent guests so the UI can still show a per-person rate.
      const adultTeenCount = adults + teens;
      if (adultTeenCount > 0) {
        const adultTeenPortion = Math.max(
          0,
          discountedSubtotal - childSubtotal - toddlerSubtotal,
        );
        const perPerson = adultTeenPortion / adultTeenCount;
        effectiveAdultPrice = perPerson;
        effectiveTeenPrice = perPerson;
      }
    } else {
      const hasPerPerson =
        matchedGroupTier.perPerson != null &&
        Number.isFinite(Number(matchedGroupTier.perPerson));
      const hasDiscountPct =
        matchedGroupTier.discountPercent != null &&
        Number.isFinite(Number(matchedGroupTier.discountPercent));

      if (hasPerPerson) {
        groupPricingType = "perPerson";
        const groupPersonPrice = convertPrice(
          Math.max(0, Number(matchedGroupTier.perPerson)),
          currency,
        );
        const discAdult = adults * groupPersonPrice;
        const discTeen = teens * groupPersonPrice;

        discountedSubtotal =
          discAdult + discTeen + childSubtotal + toddlerSubtotal;

        adultDiscountAmount = Math.max(0, adultSubtotal - discAdult);
        teenDiscountAmount = Math.max(0, teenSubtotal - discTeen);
        groupDiscountAmount = adultDiscountAmount + teenDiscountAmount;

        const adultTeenOriginal = adultSubtotal + teenSubtotal;
        groupDiscountPercent =
          adultTeenOriginal > 0
            ? (groupDiscountAmount / adultTeenOriginal) * 100
            : 0;
        hasDiscount = groupDiscountAmount > 0;

        effectiveAdultPrice = groupPersonPrice;
        effectiveTeenPrice = groupPersonPrice;
      } else if (hasDiscountPct) {
        groupPricingType = "discountPercent";
        const pct = Math.min(
          Math.max(Number(matchedGroupTier.discountPercent), 0),
          100,
        );
        const adultDisc = adultSubtotal * (pct / 100);
        const teenDisc = teenSubtotal * (pct / 100);

        discountedSubtotal =
          adultSubtotal -
          adultDisc +
          (teenSubtotal - teenDisc) +
          childSubtotal +
          toddlerSubtotal;

        adultDiscountAmount = Math.max(0, adultDisc);
        teenDiscountAmount = Math.max(0, teenDisc);
        groupDiscountAmount = adultDiscountAmount + teenDiscountAmount;
        groupDiscountPercent = pct;
        hasDiscount = groupDiscountAmount > 0;

        effectiveAdultPrice = adultPrice * (1 - pct / 100);
        effectiveTeenPrice = teenPrice * (1 - pct / 100);
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

  // ── Fees ───────────────────────────────────────────────────────────
  const privateFee = formData?.isPrivate
    ? convertPrice(getFee(tour, "private"), currency)
    : 0;
  const customFee = formData?.isCustom
    ? convertPrice(getFee(tour, "custom"), currency)
    : 0;

  // ── Extras ─────────────────────────────────────────────────────────
  const pricingExtras = Array.isArray(tour?.additionalPricing)
    ? tour.additionalPricing
    : [];

  let extrasTotal = 0;
  const extrasBreakdown = [];

  pricingExtras.forEach((extra) => {
    const { type, category, price } = extra;
    const value = selectedExtras[category];
    if (value === undefined || value === null || value === false) return;

    let costZar = 0;
    let label = category;

    if (type === "quantity") {
      const qty = Number(value) || 0;
      if (qty <= 0) return;
      costZar = (Number(price) || 0) * qty;
      label = `${category} × ${qty}`;
    } else if (type === "fixed") {
      costZar = Number(price) || 0;
    } else {
      return;
    }

    if (costZar > 0) {
      const converted = convertPrice(costZar, currency);
      extrasTotal += converted;
      extrasBreakdown.push({
        label,
        cost: converted,
        formattedCost: formatMoney(converted, currency),
      });
    }
  });

  // ── Kids activity ──────────────────────────────────────────────────
  const selectedKidsActivity =
    tour?.childFriendly === true && formData?.selectedKidsActivity
      ? kidsActivities.find((a) => a.id === formData.selectedKidsActivity) ||
        null
      : null;

  const kaAdultPrice = Number(selectedKidsActivity?.adultPrice) || 0;
  const kaChildPrice = Number(selectedKidsActivity?.childPrice) || 0;
  const kaToddlerPrice = Number(selectedKidsActivity?.toddlerPrice) || 0;

  const kidsActivityAdultTotal = convertPrice(kaAdultPrice * adults, currency);
  const kidsActivityChildTotal = convertPrice(
    kaChildPrice * children,
    currency,
  );
  const kidsActivityToddlerTotal = convertPrice(
    kaToddlerPrice * toddlers,
    currency,
  );
  const kidsActivityTotal =
    kidsActivityAdultTotal + kidsActivityChildTotal + kidsActivityToddlerTotal;

  // ── Final total ────────────────────────────────────────────────────
  const finalTotal = isCustomQuote
    ? null
    : discountedSubtotal +
      privateFee +
      customFee +
      extrasTotal +
      kidsActivityTotal;

  const fmt = (n) => formatMoney(n, currency);

  return {
    // Counts
    adults,
    children,
    toddlers,
    teens,
    participantCount, // all heads (used for limits / display)
    qualifyingHeadcount, // adults + teens — the tier-matching count

    // Per-person base prices (in selected currency)
    adultPrice,
    teenPrice,
    childPrice,
    toddlerPrice,

    // Per-person *effective* prices — reflect any group tier that was
    // applied. UI should use these for "N × rate" rows.
    effectiveAdultPrice,
    effectiveTeenPrice,
    effectiveChildPrice,
    effectiveToddlerPrice,

    // Subtotals
    adultSubtotal,
    teenSubtotal,
    childSubtotal,
    toddlerSubtotal,
    originalSubtotal,

    // Group discount
    matchedGroupTier,
    groupPricingType,
    hasDiscount,
    isCustomQuote,
    groupDiscountPercent,
    groupDiscountAmount,
    adultDiscountAmount,
    teenDiscountAmount,
    discountedSubtotal,

    // Fees
    privateFee,
    customFee,

    // Extras
    extrasTotal,
    extrasBreakdown,

    // Kids activity
    selectedKidsActivity,
    kidsActivityAdultPrice: kaAdultPrice,
    kidsActivityChildPrice: kaChildPrice,
    kidsActivityToddlerPrice: kaToddlerPrice,
    kidsActivityAdultTotal,
    kidsActivityChildTotal,
    kidsActivityToddlerTotal,
    kidsActivityTotal,

    // Options
    hasOptions,
    selectedTourOption,

    // Total
    finalTotal,

    // Display strings
    displayAdultPrice: fmt(effectiveAdultPrice),
    displayTeenPrice: fmt(effectiveTeenPrice),
    displayOriginalSubtotal: fmt(originalSubtotal),
    displayGroupDiscountAmount: fmt(groupDiscountAmount),
    displayDiscountedSubtotal: isCustomQuote
      ? "Custom quote"
      : fmt(discountedSubtotal),
    displayPrivateFee: privateFee > 0 ? fmt(privateFee) : "—",
    displayCustomFee: customFee > 0 ? fmt(customFee) : "—",
    displayExtrasTotal: extrasTotal > 0 ? fmt(extrasTotal) : "—",
    displayKidsActivityTotal: selectedKidsActivity
      ? fmt(kidsActivityTotal)
      : "—",
    displayTotal: isCustomQuote
      ? "Custom quote"
      : finalTotal !== null
        ? fmt(finalTotal)
        : "—",
    currency,
  };
};

// Called server-side before Paystack charge creation
export const verifyPriceToken = (token, expectedTourId) => {
  const secret = process.env.PRICE_SECRET;
  try {
    const payload = jwt.verify(token, secret);
    if (payload.tourId !== expectedTourId) throw new Error("Tour mismatch");
    return payload;
  } catch {
    return null;
  }
};
