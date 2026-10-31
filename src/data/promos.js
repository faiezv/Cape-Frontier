// src/data/promos.js
// Edit this file to control which tours are on promo and what the promo is.
// Pure data + helpers, safe for SSR and the client.

export const PROMOS_ENABLED = true; // master switch: false hides every promo

export const PROMO_TYPES = {
  deal: { label: "Special deal", className: "bg-red-500 text-white" },
  "last-minute": { label: "Last minute", className: "bg-amber-400 text-amber-950" },
  seasonal: { label: "Seasonal", className: "bg-emerald-500 text-white" },
  featured: { label: "Featured", className: "bg-violet-500 text-white" },
  new: { label: "New", className: "bg-sky-500 text-white" },
};

// One entry per tour on promo. Match on the tour's `slug`.
//   enabled         true/false toggle (default true)
//   type            key of PROMO_TYPES
//   headline        short line shown on the card and sidebar
//   discountPercent optional "was / now" price (see note below before using)
//   endsOn          optional "YYYY-MM-DD", the promo hides itself after this date
export const TOUR_PROMOS = [
  {
    slug: "heritage-faith-cape-flats-community-tour",
    enabled: true,
    type: "featured",
    headline: "20% off for groups of 7+",
  },
  // Switch any of these on to add more promos. With 2+ the sidebar becomes a list.
  {
    slug: "shark-cage-diving-gansbaai",
    enabled: false,
    type: "deal",
    headline: "10% off this month",
  },
  {
    slug: "premium-stellenbosch-wine-cheese-chocolate-pairing-tour",
    enabled: false,
    type: "seasonal",
    headline: "Harvest season special",
  },
  {
    slug: "3-day-garden-route-route-62-tour",
    enabled: false,
    type: "featured",
    headline: "Our most popular road trip",
  },
];

const isExpired = (endsOn) =>
  Boolean(endsOn) && new Date(`${endsOn}T23:59:59`) < new Date();

// Returns the active promo for a tour, or null.
export const getTourPromo = (tour) => {
  if (!PROMOS_ENABLED || !tour) return null;
  const entry = TOUR_PROMOS.find(
    (p) => p.slug === tour.slug && p.enabled !== false && !isExpired(p.endsOn)
  );
  if (!entry) return null;
  return { ...entry, ...(PROMO_TYPES[entry.type] || PROMO_TYPES.deal) };
};

export const getPromoPrice = (amount, promo) =>
  promo?.discountPercent > 0
    ? Math.round(Number(amount) * (1 - promo.discountPercent / 100))
    : Number(amount);