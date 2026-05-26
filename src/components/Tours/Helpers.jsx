import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import tours, {
  CTA_LABELS,
  FX_RATES,
  SUPPORTED_CURRENCIES,
  TOUR_MODIFIERS,
  TOUR_TYPES,
  getAllTourGalleryImages,
} from "/src/data/tours.js";

export function toText(value, fallback = "") {
  if (value == null) return fallback;
  if (typeof value === "string" || typeof value === "number") return String(value);

  if (Array.isArray(value)) {
    return value.map((item) => toText(item)).filter(Boolean).join(" · ");
  }

  if (typeof value === "object") {
    return (
      value.text ||
      value.name ||
      value.label ||
      value.title ||
      value.address ||
      fallback
    );
  }

  return fallback;
}

export function StarRating({ count = 0 }) {
  const safeCount = Math.max(0, Math.min(Number(count || 0), 5));

  return (
    <span className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill={i < safeCount ? "#f59e0b" : "none"}
          stroke={i < safeCount ? "#f59e0b" : "#d1d5db"}
          strokeWidth="2"
          aria-hidden="true"
        >
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
        </svg>
      ))}
    </span>
  );
}


export function getPickupSummary(tour) {
  const options = Array.isArray(tour?.pickupOptions) ? tour.pickupOptions : [];

  if (!options.length) return "";

  const custom = options.find((option) => /custom|request/i.test(option));
  const primary = options.find((option) => !/custom|request/i.test(option));

  if (custom && primary) return `${primary} + custom pickup`;
  return toText(primary || custom || options[0]);
}

export function getBestGroupDiscount(tour) {
  const rules = tour?.groupDiscount?.rules || [];

  if (!tour?.groupDiscount?.enabled || !rules.length) {
    return toText(tour?.groupDiscount?.label, "Group-friendly pricing");
  }

  const best = rules.reduce((winner, rule) => {
    if (!winner) return rule;
    return Number(rule.discountPercent || 0) > Number(winner.discountPercent || 0)
      ? rule
      : winner;
  }, null);

  if (!best) return "Group-friendly pricing";

  return `Up to ${best.discountPercent}% off for ${best.minPeople}+ guests`;
}

export function getReviewInitials(tour) {
  const name = toText(tour?.mainReviewerName, "Guest");

  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function getImagePathAliases(path = "") {
  if (!path) return [];

  const aliases = [path];

  const replacements = [
    ["/adrenaline/paragliding/", "/adrenaline/para-gliding/"],
    ["/adrenaline/para-gliding/", "/adrenaline/paragliding/"],
    ["/historical/langa/", "/historical/langa-township/"],
    ["/historical/langa-township/", "/historical/langa/"],
    ["/hiking/platteklip/", "/hiking/platteklip-gorge/"],
    ["/hiking/platteklip-gorge/", "/hiking/platteklip/"],
    ["/packages/peninsula-tour-1/boulders-beach/", "/packages/peninsula-tour-1/boulders/"],
    ["/packages/peninsula-tour-1/boulders/", "/packages/peninsula-tour-1/boulders-beach/"],
    ["/packages/stellenbosch-wine-farms/delaire/", "/wine-routes/delaire-graff/"],
    ["/wine-routes/delaire-graff/", "/packages/stellenbosch-wine-farms/delaire/"],
  ];

  replacements.forEach(([from, to]) => {
    if (path.includes(from)) aliases.push(path.replace(from, to));
  });

  return aliases;
}

export function uniqueList(items = []) {
  return Array.from(new Set(items.filter(Boolean)));
}

export  function FallbackImage({ sources = [], onFinalError, ...props }) {
  const cleanSources = uniqueList(Array.isArray(sources) ? sources : [sources]);
  const [sourceIndex, setSourceIndex] = useState(0);
  const src = cleanSources[sourceIndex] || "";

  useEffect(() => {
    setSourceIndex(0);
  }, [cleanSources.join("|")]);

  return (
    <img
      {...props}
      src={src}
      onError={(event) => {
        if (sourceIndex < cleanSources.length - 1) {
          setSourceIndex((index) => index + 1);
          return;
        }

        onFinalError?.(event);
      }}
    />
  );
}


export function getTourImageSources(tour) {
  const galleryImages =
    typeof getAllTourGalleryImages === "function"
      ? getAllTourGalleryImages(tour)
      : [];

  return uniqueList(
    [
      ...galleryImages,
      tour?.image,
      ...(Array.isArray(tour?.images) ? tour.images : []),
      tour?.cover,
      tour?.img,
    ].flatMap(getImagePathAliases)
  );
}

export function formatMoney(amount, currencyCode = "ZAR") {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);
}

export function convertPrice(baseAmount, targetCurrency) {
  return Number(baseAmount || 0) * (FX_RATES[targetCurrency] || 1);
}

export function getLocationText(tour) {
  if (typeof tour?.location === "string") return tour.location;

  if (Array.isArray(tour?.location)) {
    const locations = tour.location.map((item) => toText(item)).filter(Boolean);
    return locations.length ? locations.join(" · ") : "Cape Town";
  }

  if (tour?.location && typeof tour.location === "object") {
    return toText(tour.location, "Cape Town");
  }

  const stopNames = tour?.stops?.map((stop) => toText(stop?.name)).filter(Boolean);

  if (stopNames?.length > 1) return `${stopNames.length} Cape Town stops`;
  if (stopNames?.length === 1) return stopNames[0];

  return "Cape Town";
}

export function humanizeId(value = "", fallback = "Tour") {
  const text = String(value || "").trim();

  if (!text) return fallback;

  return text
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function getTypeText(tour) {
  return humanizeId(tour?.type, "Guided Tour");
}

export function getCategoryText(tour) {
  return humanizeId(tour?.category, "Tour");
}

export function getSupportedCurrencies(tour) {
  return tour?.supportedCurrencies?.length > 0
    ? tour.supportedCurrencies
    : SUPPORTED_CURRENCIES;
}