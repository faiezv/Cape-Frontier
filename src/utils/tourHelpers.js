// src/utils/tourHelpers.js
// Pure helpers shared by Tours, cards and filters. No Node-only imports.

// The adult / solo price from the pricing table (not the headline priceBase,
// which can be a group rate on some tours).
export const getSoloPrice = (tour) => {
  const list = Array.isArray(tour?.pricing) ? tour.pricing : [];
  const entry =
    list.find((p) => /^(adult|solo)/i.test(p.category || "")) || list[0];
  return Number(entry?.pricePerPerson) || Number(tour?.priceBase) || 0;
};

// True only if some group tier is genuinely cheaper than the solo price.
export const hasGroupDeal = (tour) => {
  const gp = tour?.groupPricing;
  if (!gp?.enabled || !Array.isArray(gp.tiers)) return false;
  const base = getSoloPrice(tour);

  return gp.tiers.some((t) => {
    if (Number(t.discountPercent) > 0) return true;
    if (t.groupTotal != null)
      return Number(t.groupTotal) < base * (Number(t.minPeople) || 1);
    if (t.perPerson != null && Number(t.perPerson) > 0)
      return Number(t.perPerson) < base;
    return false;
  });
};

// Half / full / multi-day, with a text fallback for tours whose `category`
// is undefined (e.g. the ones using TOUR_MODIFIERS.DAY_TOUR).
export const getDurationBucket = (tour) => {
  if (tour?.category === "multi-day") return "multi-day";
  if (tour?.category === "half-day") return "half-day";
  if (tour?.category === "full-day") return "full-day";

  const d = (tour?.duration || "").toLowerCase();
  if (/\d+\s*days?/.test(d) && !/half|full/.test(d)) return "multi-day";
  if (/half/.test(d)) return "half-day";
  return "full-day";
};

// Card price label. If the headline price only applies to bigger groups,
// say so instead of implying a solo traveller pays it.
export const getPriceLabel = (tour) => {
  const headline = Number(tour?.priceBase) || 0;
  const solo = getSoloPrice(tour);

  if (tour?.groupPricing?.enabled && solo > headline) {
    const tier = (tour.groupPricing.tiers || []).find(
      (t) => Number(t.perPerson) === headline
    );
    if (tier) return { amount: headline, note: `per person, ${tier.minPeople}+ guests` };
  }
  return { amount: headline, note: null };
};