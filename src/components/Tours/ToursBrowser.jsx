import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import tours, {
  CTA_LABELS,
  FX_RATES,
  SUPPORTED_CURRENCIES,
  TOUR_MODIFIERS,
  TOUR_TYPES,
  getAllTourGalleryImages,
} from "/src/data/tours.js";

const browseSections = [
  {
    id: TOUR_TYPES.ADRENALINE,
    label: "Adrenaline",
    icon: "/icons/browseTour/flag.png",
    match: (tour) => tour.type === TOUR_TYPES.ADRENALINE,
  },
  {
    id: TOUR_TYPES.HISTORICAL,
    label: "Historical",
    icon: "/icons/browseTour/present.png",
    match: (tour) => tour.type === TOUR_TYPES.HISTORICAL,
  },
  {
    id: TOUR_TYPES.HIKING,
    label: "Hiking",
    icon: "/icons/browseTour/leisure.png",
    match: (tour) => tour.type === TOUR_TYPES.HIKING,
  },
  {
    id: TOUR_TYPES.PACKAGES,
    label: "Packages",
    icon: "/icons/browseTour/compass.png",
    match: (tour) =>
      tour.type === TOUR_TYPES.PACKAGES ||
      tour.type === TOUR_TYPES.WINE_ROUTES,
  },
];

function clamp(value, min = 0, max = 1) {
  return Math.min(Math.max(value, min), max);
}

function humanizeId(value = "", fallback = "Tour") {
  const text = String(value || "").trim();

  if (!text) return fallback;

  return text
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function toText(value, fallback = "") {
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

function getCategoryText(tour) {
  return humanizeId(tour?.category, "Tour");
}

function getTypeText(tour) {
  return humanizeId(tour?.type, "Guided Tour");
}

function getLocationText(tour) {
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

function uniqueList(items = []) {
  return Array.from(new Set(items.filter(Boolean)));
}

function getImagePathAliases(path = "") {
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

function getTourImageSources(tour) {
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

function formatMoney(amount, currencyCode = "ZAR") {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);
}

function convertPrice(baseAmount, targetCurrency) {
  return Number(baseAmount || 0) * (FX_RATES[targetCurrency] || 1);
}

function getTourPath(tour) {
  if (tour?.canonicalPath) return tour.canonicalPath;
  if (tour?.slug) return `/tours/${tour.slug}`;

  const slug = String(tour?.title || "tour")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `/tours/${slug}`;
}

function getBestGroupDiscount(tour) {
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

function getPickupSummary(tour) {
  const options = Array.isArray(tour?.pickupOptions) ? tour.pickupOptions : [];

  if (!options.length) return "";

  const custom = options.find((option) => /custom|request/i.test(option));
  const primary = options.find((option) => !/custom|request/i.test(option));

  if (custom && primary) return `${primary} + custom pickup`;
  return toText(primary || custom || options[0]);
}

function getReviewInitials(tour) {
  const name = toText(tour?.mainReviewerName, "Guest");

  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function getSupportedCurrencies(tour) {
  return tour?.supportedCurrencies?.length > 0
    ? tour.supportedCurrencies
    : SUPPORTED_CURRENCIES;
}

function FallbackImage({ sources = [], onFinalError, ...props }) {
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

function StarRating({ count = 0 }) {
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

function CategoryProgressDots({ total = 0, activeIndex = 0, orientation = "horizontal" }) {
  if (!total) return null;

  const safeIndex = Math.max(0, Math.min(activeIndex, total - 1));
  const isVertical = orientation === "vertical";

  return (
    <div
      className={`flex ${isVertical ? "flex-col items-center" : "items-center"} gap-2`}
      aria-label={`Tour ${safeIndex + 1} of ${total}`}
    >
      {Array.from({ length: total }).map((_, index) => {
        const complete = index <= safeIndex;
        const current = index === safeIndex;

        return (
          <span
            key={index}
            className={`block rounded-full border transition-colors duration-200 ${
              isVertical ? "h-3 w-3" : "h-2.5 w-2.5"
            } ${
              complete
                ? "border-green-300 bg-green-200 shadow-[0_0_0_3px_rgba(187,247,208,0.18)]"
                : "border-white/15 bg-white/12"
            } ${current ? "scale-110" : "scale-100"}`}
          />
        );
      })}
    </div>
  );
}

function BrowseButton({ section, index, active, onClick, compact = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative w-full rounded-2xl text-left transition-all duration-300 ${
        compact ? "px-2.5 py-2" : "px-3.5 py-3"
      } ${
        active
          ? "bg-white/95 text-neutral-950 shadow-[0_10px_30px_rgba(0,0,0,0.12)]"
          : "text-white/72 hover:bg-white/10 hover:text-white"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-all duration-300 ${
            active
              ? "border-green-300 bg-green-200"
              : "border-white/10 bg-white/8 group-hover:bg-white/12"
          }`}
        >
          <img
            src={section.icon}
            className="h-6 w-6 object-contain"
            alt={section.label}
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
        </div>

        <div className="min-w-0 flex-1">
          <p
            className={`text-[9px] font-bitter uppercase leading-none tracking-[0.14em] ${
              active ? "text-neutral-400" : "text-white/35"
            }`}
          >
            0{index + 1}
          </p>

          <p className="mt-0.5 truncate font-bitter text-[12px] font-semibold leading-tight">
            {section.label}
          </p>
        </div>
      </div>

      {active && (
        <span className="absolute right-3 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-red-400" />
      )}
    </button>
  );
}

function TourCard({ tour, cardHeight }) {
  const navigate = useNavigate();
  const [currency, setCurrency] = useState(
    () => tour?.baseCurrency || SUPPORTED_CURRENCIES[0] || "ZAR"
  );
  const [reviewOpen, setReviewOpen] = useState(false);

  const supportedCurrencies = getSupportedCurrencies(tour);

  useEffect(() => {
    if (!supportedCurrencies.includes(currency)) {
      setCurrency(tour?.baseCurrency || supportedCurrencies[0] || "ZAR");
    }
  }, [currency, supportedCurrencies, tour?.baseCurrency]);

  const basePrice = Number(tour?.priceBase ?? tour?.price ?? 0);
  const categoryLabel = getCategoryText(tour);
  const typeLabel = getTypeText(tour);
  const locationText = getLocationText(tour);
  const displayPrice = formatMoney(convertPrice(basePrice, currency), currency);

  const goToTourPage = () => {
    navigate(getTourPath(tour), {
      state: {
        tour,
        selectedCurrency: currency,
      },
    });
  };

  const goToBooking = () => {
    navigate(`${getTourPath(tour)}#booking`, {
      state: {
        tour: {
          ...tour,
          priceBase: basePrice,
        },
        selectedCurrency: currency,
        scrollToBooking: true,
      },
    });
  };

  return (
    <article
      key={tour?.id || tour?.slug}
      className="cf-pinned-tour-card relative w-full overflow-hidden rounded-[1.5rem] border border-black/5 bg-white shadow-[0_14px_42px_rgba(0,0,0,0.08)] sm:rounded-[2rem] sm:shadow-[0_18px_60px_rgba(0,0,0,0.08)]"
      data-tour-card
      style={{ "--cf-card-height": `${cardHeight}px` }}
    >
      <div className="relative h-full">
        <div
          data-card-grid
          className="grid h-full grid-cols-1 bg-white font-bitter text-black md:grid-cols-2 md:min-h-[390px] xl:min-h-[420px]"
        >
          <div
            data-card-image-panel
            className="relative min-h-[210px] overflow-hidden bg-neutral-900 sm:min-h-[260px] md:min-h-[360px] xl:min-h-[420px]"
          >
            <FallbackImage
              data-card-image
              sources={getTourImageSources(tour)}
              alt={tour?.title || "Cape Frontier tour"}
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
              decoding="async"
              onFinalError={(event) => {
                event.currentTarget.style.display = "none";
                event.currentTarget.parentNode.style.background =
                  "linear-gradient(135deg,#0f2027,#203a43,#2c5364)";
              }}
            />

            <div
              className="absolute inset-0 z-10"
              style={{
                background:
                  "linear-gradient(to top, rgba(0,0,0,0.86) 0%, rgba(0,0,0,0.32) 48%, rgba(0,0,0,0.10) 100%)",
              }}
            />

            <div className="absolute -right-24 -top-24 z-10 h-56 w-56 rounded-full bg-green-200/20 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 z-10 h-52 w-52 rounded-full bg-blue-300/10 blur-3xl" />

            <div className="absolute left-4 right-4 top-4 z-20 flex items-start justify-between gap-2 sm:left-5 sm:right-5 sm:top-5 sm:gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-white/25 bg-green-200/95 px-3 py-1.5 font-bitter text-[11px] font-semibold text-green-950 shadow-lg sm:px-4 sm:text-xs">
                  {categoryLabel}
                </span>

                <span className="rounded-full border border-white/20 bg-white/15 px-3 py-1.5 font-bitter text-[11px] text-white/90 shadow-lg backdrop-blur-md sm:px-4 sm:text-xs">
                  {typeLabel}
                </span>
              </div>

              <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-2xl border border-white/20 bg-white/15 shadow-lg backdrop-blur-md sm:h-14 sm:w-14">
                <span className="font-frank text-xl font-bold leading-none text-white">
                  {Number(tour?.rating || 4.8).toFixed(1)}
                </span>

                <span className="mt-1 font-bitter text-[10px] leading-none text-white/65">
                  rating
                </span>
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 z-20 p-4 sm:p-6 md:p-7 xl:p-8">
              <div className="relative">
                <span className="font-bitter text-[11px] uppercase tracking-[0.22em] text-white/55">
                  {categoryLabel} · {typeLabel}
                </span>

                <h3 className="mt-2 max-w-[12ch] font-frank text-2xl font-bold leading-[0.9] text-white drop-shadow-lg sm:text-4xl xl:text-5xl">
                  {tour?.title || "Cape Frontier Tour"}
                </h3>

                <div className="mt-3 h-px w-20 bg-green-200/80 sm:mt-5 sm:w-24" />
              </div>
            </div>
          </div>

          <div data-card-content-panel className="flex min-h-0 flex-col bg-white">
            <div className="flex min-h-0 flex-1 flex-col justify-start gap-3 p-4 sm:gap-4 sm:p-5 md:p-6 xl:gap-5 xl:p-8">
              <div data-card-stagger-item className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <span className="block font-bitter text-[11px] uppercase leading-none tracking-[0.2em] text-red-400">
                    From
                  </span>

                  <div className="mt-0.5">
                    <p className="flex items-end gap-2">
                      <span className="font-frank text-2xl font-bold leading-none tracking-tight text-neutral-950 sm:text-4xl xl:text-5xl">
                        {displayPrice}
                      </span>

                      <span className="mb-1 font-bitter text-sm text-neutral-400">
                        pp
                      </span>
                    </p>
                  </div>
                </div>

                <select
                  value={currency}
                  onChange={(event) => setCurrency(event.target.value)}
                  className="flex w-fit shrink-0 items-center justify-center rounded-2xl border border-black/10 bg-neutral-50 p-2.5 font-bitter text-sm text-neutral-700 transition-colors hover:border-red-300 focus:border-red-400 sm:p-3 sm:text-base"
                >
                  {supportedCurrencies.map((code) => (
                    <option key={code} value={code}>
                      {code}
                    </option>
                  ))}
                </select>
              </div>

              <div data-card-stagger-item className="grid grid-cols-2 gap-2 sm:gap-3">
                <div className="group rounded-2xl border border-black/5 bg-neutral-50 px-3 py-2.5 transition-all duration-300 hover:-translate-y-0.5 hover:border-green-300 hover:bg-green-200 sm:px-4 sm:py-4">
                  <div className="flex items-center gap-2 text-neutral-400 transition-colors group-hover:text-green-900">
                    <img
                      src="/icons/mapPin.png"
                      className="h-4 w-4 object-contain"
                      alt=""
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                    />

                    <span className="block font-bitter text-[11px] uppercase tracking-wide">
                      Location
                    </span>
                  </div>

                  <p className="mt-1 font-bitter text-xs leading-snug text-neutral-700 transition-colors group-hover:text-green-950 sm:mt-2 sm:text-sm">
                    {locationText}
                  </p>
                </div>

                <div className="group rounded-2xl border border-black/5 bg-neutral-50 px-3 py-2.5 transition-all duration-300 hover:-translate-y-0.5 hover:border-green-300 hover:bg-green-200 sm:px-4 sm:py-4">
                  <div className="flex items-center gap-2 text-neutral-400 transition-colors group-hover:text-green-900">
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="shrink-0"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>

                    <span className="block font-bitter text-[11px] uppercase tracking-wide">
                      Duration
                    </span>
                  </div>

                  <p className="mt-1 font-bitter text-xs leading-snug text-neutral-700 transition-colors group-hover:text-green-950 sm:mt-2 sm:text-sm">
                    {toText(tour?.duration, "Flexible")}
                  </p>
                </div>
              </div>

              <div data-card-stagger-item className="cf-card-description rounded-2xl border border-black/5 bg-white px-3 py-2.5 sm:px-4 sm:py-3">
                <p className="font-bitter text-[10px] font-black uppercase tracking-[0.18em] text-neutral-400">
                  About this tour
                </p>
                <p className="mt-1 line-clamp-3 font-bitter text-xs leading-5 text-neutral-600 sm:text-sm sm:leading-6">
                  {toText(tour?.description, "A guided Cape Frontier experience with flexible planning and local support.")}
                </p>
              </div>

              <div data-card-stagger-item className="cf-card-review">
                <button
                  type="button"
                  onClick={() => setReviewOpen((value) => !value)}
                  className="w-full rounded-2xl border border-green-100 bg-green-50/70 px-3 py-2.5 text-left transition-colors duration-300 hover:border-green-300 hover:bg-green-200 sm:rounded-3xl sm:px-5 sm:py-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <StarRating count={tour?.stars || 5} />

                      <span className="text-sm font-semibold text-neutral-800">
                        {Number(tour?.rating || 4.8).toFixed(1)}
                      </span>
                    </div>

                    <span className="font-bitter text-xs text-neutral-500">
                      {reviewOpen ? "Close review" : "Read review"}
                    </span>
                  </div>

                  <p
                    className={`mt-1.5 font-bitter text-xs italic leading-relaxed text-neutral-600 transition-all duration-300 sm:mt-3 sm:text-sm ${
                      reviewOpen ? "line-clamp-3" : "line-clamp-2"
                    }`}
                  >
                    “{toText(tour?.mainReview, "A highly rated Cape Town experience.")}”
                  </p>

                  <div className="mt-2 flex items-center justify-between gap-2 sm:mt-4 sm:gap-3">
                    <p className="truncate font-bitter text-xs text-neutral-500">
                      Reviewed by{" "}
                      <span className="text-neutral-700">
                        {toText(tour?.mainReviewerName, "Traveller")}
                      </span>
                      {tour?.mainReviewerCountry ? ` · ${tour.mainReviewerCountry}` : ""}
                    </p>

                    <div className="flex shrink-0 items-center gap-2">
                      <span className="grid h-7 w-7 place-items-center rounded-full border-2 border-white bg-green-100 text-[10px] font-bold text-green-800 shadow-sm">
                        {getReviewInitials(tour)}
                      </span>

                      <span className="whitespace-nowrap font-bitter text-xs text-neutral-600">
                        +{tour?.otherReviews || 0}
                      </span>
                    </div>
                  </div>
                </button>
              </div>

              <div className="cf-mobile-info grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div className="rounded-2xl bg-green-200/80 px-3 py-2 font-bitter text-xs font-semibold leading-snug text-green-950">
                  {getBestGroupDiscount(tour)}
                </div>
                {getPickupSummary(tour) && (
                  <div className="rounded-2xl bg-neutral-100 px-3 py-2 font-bitter text-xs font-semibold leading-snug text-neutral-700">
                    {getPickupSummary(tour)}
                  </div>
                )}
              </div>
            </div>

            <div className="shrink-0 overflow-hidden">
              <div className="flex items-center justify-between gap-3 border-t border-black/5 bg-neutral-50 px-3 py-3 sm:px-5 sm:py-4 md:px-6 xl:px-8">
                <button
                  type="button"
                  onClick={goToTourPage}
                  className="flex items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 font-bitter text-sm font-medium text-neutral-600 transition-all duration-200 hover:border-red-300 hover:text-red-400 active:scale-95"
                >
                  {CTA_LABELS.fullDetails || "Details"}
                </button>

                <button
                  type="button"
                  onClick={goToBooking}
                  className="hero-gradient flex items-center justify-center gap-2 rounded-full px-5 py-2 font-bitter text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:opacity-90 active:scale-95"
                >
                  {CTA_LABELS.requestTrip || "Request Trip"}

                  <img
                    src="/icons/go.png"
                    alt=""
                    className="h-4 w-4 object-contain"
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function FixedCategoryNav({
  activeCategory,
  currentTourIndex,
  currentTourTotal,
  onSelect,
  sections,
  mobileNavRef,
  mobileNavScrollerRef,
  mobileCategoryItemRefs,
  metrics,
  pinned,
}) {
  return (
    <>
      <aside
        className="fixed z-[90] hidden h-fit w-32 pointer-events-auto transition-opacity duration-150 xl:block"
        style={{
          top: `${metrics.desktopNavTop}px`,
          left: `${metrics.navLeft || 12}px`,
          opacity: pinned ? 1 : 0,
          visibility: pinned ? "visible" : "visible",
          pointerEvents: pinned ? "auto" : "none",
        }}
      >
        <div className="w-full overflow-hidden rounded-[1.75rem] border border-white/10 bg-black/42 p-2 shadow-[0_14px_38px_rgba(0,0,0,0.11)] backdrop-blur-md">
          <div className="mt-2.5 flex flex-col gap-1.5">
            {sections.map((section, index) => (
              <BrowseButton
                key={section.id}
                section={section}
                index={index}
                active={activeCategory === section.id}
                compact
                onClick={() => onSelect(section.id)}
              />
            ))}
          </div>

          <div className="mt-2.5 rounded-2xl border border-white/10 bg-white/[0.07] px-3 py-2">
            <div className="flex items-center justify-between gap-2">
              <CategoryProgressDots
                total={currentTourTotal}
                activeIndex={currentTourIndex}
              />
              <span className="shrink-0 font-bitter text-[10px] font-bold text-green-200">
                {currentTourIndex + 1}/{currentTourTotal || 1}
              </span>
            </div>
          </div>
        </div>
      </aside>

      <div
        ref={mobileNavRef}
        data-mobile-category-nav
        className="fixed left-4 right-4 z-[220] pointer-events-auto transition-opacity duration-150 xl:hidden"
        style={{
          top: `${metrics.mobileTop}px`,
          opacity: pinned ? 1 : 0,
          visibility: pinned ? "visible" : "visible",
          pointerEvents: pinned ? "auto" : "none",
        }}
      >
        <div className="rounded-[1.25rem] border border-white/10 bg-black/72 p-1.5 shadow-[0_12px_35px_rgba(0,0,0,0.16)] backdrop-blur-md sm:p-2">
          <div
            ref={mobileNavScrollerRef}
            className="flex snap-x snap-mandatory gap-1.5 overflow-x-auto scroll-smooth pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] md:grid md:grid-cols-4 md:overflow-visible md:pb-0 [&::-webkit-scrollbar]:hidden"
          >
            {sections.map((section, index) => (
              <div
                key={section.id}
                ref={(el) => {
                  if (el) mobileCategoryItemRefs.current[section.id] = el;
                }}
                className="min-w-[8rem] flex-1 snap-start md:min-w-0"
              >
                <BrowseButton
                  section={section}
                  index={index}
                  active={activeCategory === section.id}
                  compact
                  onClick={() => onSelect(section.id)}
                />
              </div>
            ))}
          </div>

          <div className="mt-1.5 rounded-2xl border border-white/10 bg-white/[0.07] px-2.5 py-1.5">
            <div className="flex items-center justify-between gap-3">
              <div className="relative flex flex-1 items-center overflow-hidden py-0.5">
                <span className="absolute left-1 right-1 top-1/2 h-px -translate-y-1/2 bg-white/12" />
                <div className="relative z-10">
                  <CategoryProgressDots
                    total={currentTourTotal}
                    activeIndex={currentTourIndex}
                  />
                </div>
              </div>

              <span className="shrink-0 rounded-full bg-green-200 px-2 py-0.5 font-bitter text-[9px] font-bold text-green-950">
                {String(currentTourIndex + 1).padStart(2, "0")} /{" "}
                {String(currentTourTotal || 1).padStart(2, "0")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function ScrollDriverSection({ section, sectionTours, registerSection, metrics }) {
  const count = Math.max(sectionTours.length, 1);
  const height = metrics.stepDistance * count;

  return (
    <section
      ref={(node) => registerSection(section.id, node)}
      id={section.id}
      data-category-section={section.id}
      className="relative z-0"
      style={{
        height: `${height}px`,
        scrollMarginTop: `${metrics.scrollMarginTop}px`,
      }}
      aria-label={`${section.label} tours`}
    >
      <div className="pointer-events-none sticky top-0 h-px w-px opacity-0" />
    </section>
  );
}

export default function ToursBrowser() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeTourByCategory, setActiveTourByCategory] = useState({});
  const [pinned, setPinned] = useState(false);

  const browserRef = useRef(null);
  const mobileNavRef = useRef(null);
  const mobileNavScrollerRef = useRef(null);
  const mobileCategoryItemRefs = useRef({});
  const sectionRefs = useRef({});

  const getMetrics = useCallback(() => {
    if (typeof window === "undefined") {
      return {
        height: 800,
        width: 390,
        mobileTop: 74,
        mobileNavHeight: 112,
        cardTop: 198,
        cardHeight: 440,
        cardWidth: 640,
        cardLeft: 16,
        desktopNavTop: 276,
        desktopCardTop: 92,
        desktopCardLeft: 192,
        stepDistance: 720,
        scrollMarginTop: 198,
        triggerLine: 200,
      };
    }

    const height = Math.round(window.visualViewport?.height || window.innerHeight || 800);
    const width = Math.round(window.innerWidth || window.visualViewport?.width || 390);
    const viewportTop = Math.round(window.visualViewport?.offsetTop || 0);
    const baseMobileTop = width < 640 ? 64 : width < 1024 ? 74 : 82;
    const mobileTop = viewportTop + baseMobileTop;
    const mobileNavHeight = Math.round(mobileNavRef.current?.offsetHeight || 112);
    const isDesktop = width >= 1280;
    const isTablet = width >= 768 && width < 1280;

    const navLeft = Math.round(Math.max(12, width / 2 - 34 * 16));
    const desktopCardLeft = navLeft + 152;
    const desktopCardWidth = Math.min(860, Math.max(700, width - desktopCardLeft - 32));
    const desktopTargetHeight = Math.min(560, Math.max(470, height - 132));
    const desktopCardTop = Math.max(48, Math.round(height / 2 - desktopTargetHeight / 2));
    const desktopCardHeight = desktopTargetHeight;

    const mobileCardTop = mobileTop + mobileNavHeight + 12;
    const mobileCardHeight = Math.max(
      width < 390 ? 360 : 390,
      Math.min(isTablet ? 610 : 540, height - mobileCardTop - 18)
    );

    const cardHeight = isDesktop ? desktopCardHeight : mobileCardHeight;
    const cardTop = isDesktop ? desktopCardTop : mobileCardTop;
    const cardLeft = isDesktop ? desktopCardLeft : 16;
    const cardWidth = isDesktop ? desktopCardWidth : Math.max(320, width - 32);
    const stepDistance = Math.round(height * (isDesktop ? 0.82 : isTablet ? 0.88 : 0.9));
    const triggerLine = isDesktop ? desktopCardTop + 4 : mobileCardTop + 4;

    return {
      height,
      width,
      mobileTop,
      mobileNavHeight,
      cardTop,
      cardHeight,
      cardWidth,
      cardLeft,
      desktopNavTop: Math.max(16, Math.round(height / 2 - 124)),
      navLeft,
      desktopCardTop,
      desktopCardLeft,
      stepDistance,
      scrollMarginTop: triggerLine,
      triggerLine,
    };
  }, []);

  const [metrics, setMetrics] = useState(getMetrics);

  const visibleSections = useMemo(() => {
    return browseSections
      .map((section) => ({
        ...section,
        label: section.label || humanizeId(section.id, "Tours"),
        tours: tours.filter(section.match),
      }))
      .filter((section) => section.tours.length > 0);
  }, []);

  const currentSection = useMemo(() => {
    return (
      visibleSections.find((section) => section.id === activeCategory) ||
      visibleSections[0]
    );
  }, [activeCategory, visibleSections]);

  const currentTourTotal = currentSection?.tours?.length || 0;
  const currentTourIndex = Math.max(
    0,
    Math.min(
      activeTourByCategory[currentSection?.id] ?? 0,
      Math.max(currentTourTotal - 1, 0)
    )
  );
  const activeTour = currentSection?.tours?.[currentTourIndex] || currentSection?.tours?.[0];

  const registerSection = useCallback((id, node) => {
    if (node) sectionRefs.current[id] = node;
  }, []);

  const syncMetrics = useCallback(() => {
    const next = getMetrics();

    setMetrics((current) => {
      if (
        current.height === next.height &&
        current.width === next.width &&
        current.mobileTop === next.mobileTop &&
        current.mobileNavHeight === next.mobileNavHeight &&
        current.cardTop === next.cardTop &&
        current.cardHeight === next.cardHeight &&
        current.cardWidth === next.cardWidth &&
        current.cardLeft === next.cardLeft &&
        current.stepDistance === next.stepDistance
      ) {
        return current;
      }

      return next;
    });

    return next;
  }, [getMetrics]);

  const updateActiveFromScroll = useCallback(() => {
    const nextMetrics = syncMetrics();

    if (!visibleSections.length || typeof window === "undefined") return;

    const browser = browserRef.current;
    const browserRect = browser?.getBoundingClientRect();

    if (!browserRect) return;

    const prePinLead = nextMetrics.width >= 1280 ? 0 : nextMetrics.width >= 768 ? 0 : 0;

    const uiVisible =
      browserRect.top <= nextMetrics.triggerLine + prePinLead &&
      browserRect.bottom >= nextMetrics.triggerLine + Math.min(nextMetrics.cardHeight * 0.25, 120);

    const browserActive =
      browserRect.top <= nextMetrics.triggerLine &&
      browserRect.bottom >= nextMetrics.triggerLine + Math.min(nextMetrics.cardHeight * 0.3, 140);

    setPinned((current) => (current === uiVisible ? current : uiVisible));

    if (!browserActive) {
      if (uiVisible && visibleSections[0]?.id) {
        setActiveCategory((current) => current || visibleSections[0].id);
        setActiveTourByCategory((current) =>
          current[visibleSections[0].id] == null
            ? { ...current, [visibleSections[0].id]: 0 }
            : current
        );
      }

      return;
    }

    let nextActive = null;

    for (const section of visibleSections) {
      const el = sectionRefs.current[section.id];
      if (!el) continue;

      const rect = el.getBoundingClientRect();

      if (rect.top <= nextMetrics.triggerLine && rect.bottom > nextMetrics.triggerLine) {
        const localDistance = Math.max(0, nextMetrics.triggerLine - rect.top);
        const rawIndex = Math.floor(localDistance / nextMetrics.stepDistance);
        const index = Math.max(0, Math.min(rawIndex, section.tours.length - 1));

        nextActive = {
          sectionId: section.id,
          index,
        };
        break;
      }
    }

    if (!nextActive) return;

    setActiveCategory((current) =>
      current === nextActive.sectionId ? current : nextActive.sectionId
    );

    setActiveTourByCategory((current) =>
      current[nextActive.sectionId] === nextActive.index
        ? current
        : { ...current, [nextActive.sectionId]: nextActive.index }
    );
  }, [syncMetrics, visibleSections]);

  useEffect(() => {
    if (!activeCategory && visibleSections[0]?.id) {
      setActiveCategory(visibleSections[0].id);
      setActiveTourByCategory({ [visibleSections[0].id]: 0 });
    }
  }, [activeCategory, visibleSections]);

  useEffect(() => {
    if (!activeCategory || typeof window === "undefined" || window.innerWidth >= 1280) {
      return;
    }

    const scroller = mobileNavScrollerRef.current;
    const item = mobileCategoryItemRefs.current[activeCategory];

    if (!scroller || !item) return;

    scroller.scrollTo({
      left: Math.max(item.offsetLeft - 8, 0),
      behavior: "smooth",
    });
  }, [activeCategory]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    let rafId = null;

    const requestUpdate = () => {
      if (rafId) return;

      rafId = window.requestAnimationFrame(() => {
        rafId = null;
        updateActiveFromScroll();
      });
    };

    requestUpdate();

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    window.addEventListener("orientationchange", requestUpdate);
    window.visualViewport?.addEventListener("resize", requestUpdate);
    window.visualViewport?.addEventListener("scroll", requestUpdate);
    window.lenis?.on?.("scroll", requestUpdate);

    window.setTimeout(requestUpdate, 80);
    window.setTimeout(requestUpdate, 260);
    window.setTimeout(requestUpdate, 680);

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);

      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      window.removeEventListener("orientationchange", requestUpdate);
      window.visualViewport?.removeEventListener("resize", requestUpdate);
      window.visualViewport?.removeEventListener("scroll", requestUpdate);
      window.lenis?.off?.("scroll", requestUpdate);
    };
  }, [updateActiveFromScroll]);

  const scrollToCategory = (id) => {
    const el = sectionRefs.current[id] || document.getElementById(id);
    if (!el || typeof window === "undefined") return;

    const nextMetrics = syncMetrics();

    setActiveCategory(id);
    setActiveTourByCategory((current) =>
      current[id] === 0 ? current : { ...current, [id]: 0 }
    );

    const top = Math.max(
      0,
      el.getBoundingClientRect().top + window.scrollY - nextMetrics.triggerLine
    );

    if (window.lenis?.scrollTo) {
      window.lenis.scrollTo(top, { duration: 0.85, force: true });
      return;
    }

    window.scrollTo({ top, behavior: "smooth" });
  };

  return (
    <div
      ref={browserRef}
      className="relative min-h-screen overflow-visible bg-stone-200/0"
      data-tours-browser
    >
      <style>{`
        .cf-pinned-tour-card {
          height: var(--cf-card-height);
          max-height: var(--cf-card-height);
        }

        .cf-pinned-tour-card [data-card-grid] {
          height: 100%;
          min-height: 0;
        }

        @media (max-width: 767px) {
          .cf-pinned-tour-card [data-card-grid] {
            grid-template-rows: 39% minmax(0, 61%);
          }

          .cf-pinned-tour-card [data-card-image-panel] {
            height: 100%;
            min-height: 0;
          }

          .cf-pinned-tour-card [data-card-content-panel] {
            min-height: 0;
          }

          .cf-pinned-tour-card .cf-mobile-info {
            display: none;
          }

          .cf-pinned-tour-card .cf-card-description p:last-child {
            -webkit-line-clamp: 2;
          }
        }

        @media (min-width: 768px) and (max-width: 1279px) {
          .cf-pinned-tour-card [data-card-grid],
          .cf-pinned-tour-card [data-card-image-panel] {
            min-height: 0;
          }
        }

        @media (max-width: 390px), (max-height: 720px) {
          .cf-pinned-tour-card .cf-card-description,
          .cf-pinned-tour-card .cf-mobile-info {
            display: none;
          }
        }

        @media (min-width: 1280px) {
          .cf-pinned-tour-card .cf-card-description p:last-child {
            -webkit-line-clamp: 2;
          }
        }

        @keyframes cfTourSwap {
          from {
            opacity: 0;
            transform: translateY(12px) scale(0.99);
            filter: blur(3px);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
          }
        }

        .cf-tour-swap-shell {
          animation: cfTourSwap 320ms ease-out both;
        }
      `}</style>

      <FixedCategoryNav
        activeCategory={activeCategory}
        currentTourIndex={currentTourIndex}
        currentTourTotal={currentTourTotal}
        onSelect={scrollToCategory}
        sections={visibleSections}
        mobileNavRef={mobileNavRef}
        mobileNavScrollerRef={mobileNavScrollerRef}
        mobileCategoryItemRefs={mobileCategoryItemRefs}
        metrics={metrics}
        pinned={pinned}
      />

      <div
        className="fixed z-[170] transition-opacity duration-150"
        style={{
          top: `${metrics.cardTop}px`,
          left: metrics.width >= 1280 ? `${metrics.cardLeft}px` : "16px",
          width: metrics.width >= 1280 ? `${metrics.cardWidth}px` : "calc(100vw - 32px)",
          opacity: pinned && activeTour ? 1 : 0,
          visibility: pinned && activeTour ? "visible" : "hidden",
          pointerEvents: pinned && activeTour ? "auto" : "none",
        }}
      >
        {activeTour && (
          <div key={`${activeCategory}-${activeTour.id || activeTour.slug}`} className="cf-tour-swap-shell">
            <TourCard tour={activeTour} cardHeight={metrics.cardHeight} />
          </div>
        )}
      </div>

      <main className="relative z-0 mx-auto w-full max-w-7xl px-4 xl:px-0">
        <div className="xl:ml-[10rem] xl:max-w-[64rem]">
          {visibleSections.map((section) => (
            <ScrollDriverSection
              key={section.id}
              section={section}
              sectionTours={section.tours}
              registerSection={registerSection}
              metrics={metrics}
            />
          ))}
        </div>
      </main>
    </div>
  );
}