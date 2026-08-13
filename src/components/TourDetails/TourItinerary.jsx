import React, { useState, useEffect } from "react";
import accommodationImg from '/src/assets/images/tours/packages/3-day-garden-route/oudstshoorn-acc.webp';
/* ============================================================
   VITE TOUR IMAGE ASSETS
   Data uses paths such as:

   image: "tours/images/shared/route-62.webp"

   Actual files live at:

   src/assets/images/tours/shared/route-62.webp

   import.meta.glob lets Vite discover the assets at build time
   without requiring one import per image.
============================================================ */
const tourImageAssets = import.meta.glob(
  "/src/assets/images/tours/**/*.{webp,png,jpg,jpeg}",
  {
    eager: true,
    query: "?url",
    import: "default",
  }
);

/* ============================================================
   RESOLVE TOUR IMAGE
============================================================ */
// const  resolveImage  = (imagePath) => {
//   if (!imagePath || typeof imagePath !== "string") {
//     return null;
//   }

//   // Remove leading slash and any "src/assets/images/" prefix
//   const normalized = imagePath
//     .replace(/^\/+/, "")
//     .replace(/^src\/assets\/images\//, "");

//   let globPath;

//   // Handle paths starting with "images/tours/" → map to "tours/"
//   if (normalized.startsWith("images/tours/")) {
//     const rest = normalized.replace("images/tours/", "");
//     globPath = `/src/assets/images/tours/${rest}`;
//   }
//   // Handle paths starting with "tours/images/" (original format)
//   else if (normalized.startsWith("tours/images/")) {
//     globPath = `/src/assets/images/${normalized.replace("tours/images/", "tours/")}`;
//   }
//   // Handle paths starting with "tours/"
//   else if (normalized.startsWith("tours/")) {
//     globPath = `/src/assets/images/${normalized}`;
//   }
//   // Fallback: assume it's already relative to tours/
//   else {
//     globPath = `/src/assets/images/tours/${normalized}`;
//   }

//   // Try direct match
//   if (tourImageAssets[globPath]) {
//     return tourImageAssets[globPath];
//   }

//   // Fallback matching by suffix (case-insensitive)
//   const suffix = globPath.replace("/src/assets/", "");
//   const matchingKey = Object.keys(tourImageAssets).find((key) =>
//     key.replace("/src/assets/", "").toLowerCase() === suffix.toLowerCase()
//   );

//   return matchingKey ? tourImageAssets[matchingKey] : null;
// };

import { resolveImage } from "../../utils/ImageLoader"

/* ============================================================
   ACTIVITY ICONS
============================================================ */
const ActivityIcon = ({
  type,
  monochrome = false,
}) => {
  const common = "h-6 w-6 stroke-[1.7]";

  const getStroke = () => {
    if (monochrome) return "currentColor";

    switch (type) {
      case "transfer":
        return "#64748b";
      case "wine":
        return "#7c3aed";
      case "scenic":
        return "#059669";
      case "adventure":
        return "#f97316";
      case "safari":
        return "#d97706";
      case "meal":
        return "#b45309";
      case "accommodation":
        return "#1e3a8a";
      case "leisure":
        return "#0d9488";
      case "wildlife":
        return "#16a34a";
      default:
        return "#2563eb";
    }
  };

  const stroke = getStroke();

  switch (type) {
    case "transfer":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke={stroke}
          className={common}
        >
          <path d="M5 17h14" />
          <path d="M6 17l1.5-6h9L18 17" />
          <path d="M8 11l1.5-3h5L16 11" />
          <circle cx="8" cy="18" r="1.5" />
          <circle cx="16" cy="18" r="1.5" />
        </svg>
      );

    case "wine":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke={stroke}
          className={common}
        >
          <path d="M8 3h8l-1 6a3 3 0 0 1-6 0L8 3Z" />
          <path d="M12 12v7" />
          <path d="M8 21h8" />
        </svg>
      );

    case "scenic":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke={stroke}
          className={common}
        >
          <path d="M3 19l6-8 4 5 3-4 5 7" />
          <path d="M3 19h18" />
          <circle cx="17" cy="6" r="2" />
        </svg>
      );

    case "adventure":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke={stroke}
          className={common}
        >
          <path d="M12 3l2.5 5.5L20 11l-5.5 2.5L12 19l-2.5-5.5L4 11l5.5-2.5L12 3Z" />
        </svg>
      );

    case "safari":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke={stroke}
          className={common}
        >
          <circle cx="12" cy="12" r="8" />
          <path d="M12 7v10M7 12h10" />
          <path d="M9 9l6 6M15 9l-6 6" />
        </svg>
      );

    case "meal":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke={stroke}
          className={common}
        >
          <path d="M7 3v8" />
          <path d="M5 3v5a2 2 0 0 0 4 0V3" />
          <path d="M7 11v10" />
          <path d="M16 3v18" />
          <path d="M16 3c3 2 3 6 0 8" />
        </svg>
      );

    case "accommodation":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke={stroke}
          className={common}
        >
          <path d="M4 20V8l8-5 8 5v12" />
          <path d="M8 20v-5h8v5" />
          <path d="M9 9h2v2H9zM13 9h2v2h-2z" />
        </svg>
      );

    case "leisure":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke={stroke}
          className={common}
        >
          <path d="M3 18c3-4 5-4 8 0s5 4 10 0" />
          <path d="M5 13c3-4 5-4 8 0s5 4 6 0" />
        </svg>
      );

    case "wildlife":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke={stroke}
          className={common}
        >
          <path d="M5 16c1-4 4-6 7-6s6 2 7 6" />
          <path d="M8 9l-1-3M16 9l1-3" />
          <circle cx="9" cy="12" r=".7" />
          <circle cx="15" cy="12" r=".7" />
        </svg>
      );

    default:
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke={stroke}
          className={common}
        >
          <circle cx="12" cy="12" r="8" />
          <path d="M12 8v4l3 2" />
        </svg>
      );
  }
};

/* ============================================================
   FALLBACK ACTIVITY IMAGES

   These are only used when an activity does NOT have its own
   `image` property.
============================================================ */
const activityImages = {
  transfer: null,
  wine: null,
  scenic: null,
  adventure: null,
  safari: null,
  meal: null,
  accommodation: null,
  leisure: null,
  wildlife: null,
};

/* ============================================================
   RESOLVE ACTIVITY IMAGE

   Priority:
   1. activity.image
   2. type fallback
   3. nothing
============================================================ */
const getActivityImage = (activity) => {
  if (activity?.image) {
    const resolved =  resolveImage (
      activity.image
    );

    if (resolved) {
      return resolved;
    }
  }

  return activityImages[activity?.type] || null;
};

/* ============================================================
   ROUTE LOCATION TYPE
============================================================ */
const getLocationType = (location) => {
  const loc = location.toLowerCase();

  if (
    loc.includes("wine") ||
    loc.includes("robertson")
  ) {
    return "wine";
  }

  if (
    loc.includes("cave") ||
    loc.includes("cango")
  ) {
    return "adventure";
  }

  if (
    loc.includes("game") ||
    loc.includes("reserve") ||
    loc.includes("botlierskop")
  ) {
    return "safari";
  }

  if (
    loc.includes("whale") ||
    loc.includes("hermanus")
  ) {
    return "wildlife";
  }

  if (
    loc.includes("penguin") ||
    loc.includes("betty")
  ) {
    return "wildlife";
  }

  if (
    loc.includes("knysna") ||
    loc.includes("waterfront") ||
    loc.includes("quays")
  ) {
    return "leisure";
  }

  if (
    loc.includes("benguela") ||
    loc.includes("lagoon")
  ) {
    return "wine";
  }

  return "scenic";
};

/* ============================================================
   ROUTE LABELS
============================================================ */
const generateRouteLabels = (
  routeTitle,
  days
) => {
  if (!routeTitle) return [];

  const locations = routeTitle
    .split("→")
    .map((s) => s.trim())
    .filter(Boolean);

  const labels = new Array(
    locations.length
  ).fill(null);

  if (locations.length > 0) {
    labels[0] = "Depart";
    labels[locations.length - 1] = "Return";
  }

  days?.forEach((day) => {
    if (!day.title) return;

    const firstLocation = day.title
      .split("→")[0]
      ?.trim();

    if (!firstLocation) return;

    const index = locations.findIndex(
      (loc) =>
        loc.toLowerCase() ===
        firstLocation.toLowerCase()
    );

    if (
      index !== -1 &&
      index !== 0 &&
      index !== locations.length - 1
    ) {
      labels[index] = `Day ${day.day}`;
    }
  });

  const dayCount = days?.length || 0;

  if (dayCount > 0) {
    const existingDayIndices = labels
      .map((label, idx) =>
        label?.startsWith("Day")
          ? idx
          : -1
      )
      .filter((idx) => idx !== -1);

    if (
      existingDayIndices.length <
      dayCount
    ) {
      const step =
        locations.length /
        (dayCount + 1);

      for (
        let i = 0;
        i < dayCount;
        i++
      ) {
        const idx = Math.round(
          step * (i + 1)
        );

        if (
          idx > 0 &&
          idx < locations.length - 1 &&
          !labels[idx]
        ) {
          labels[idx] = `Day ${i + 1}`;
        }
      }
    }
  }

  return labels;
};

/* ============================================================
   ROUTE STOP IMAGE RESOLVER
============================================================ */
const routeStopImageRules = [
  {
    keywords: ["cape town"],
    match: [
      "shared/pickup/1.webp",
    ],
  },

  {
    keywords: ["robertson"],
    match: [
      "wacky_wine_weekend",
    ],
  },

  {
    keywords: ["route 62"],
    match: [
      "montagu_street",
      "wacky_wine_weekend",
    ],
  },

  {
    keywords: ["montagu"],
    match: [
      "montagu_street",
    ],
  },

  {
    keywords: ["barrydale"],
    match: [
      "montagu_street",
    ],
  },

  {
    keywords: ["oudtshoorn"],
    match: [
      "cango_caves",
    ],
  },

  {
    keywords: ["cango caves"],
    match: [
      "cango_caves",
    ],
  },

  {
    keywords: ["klein karoo"],
    match: [
      "cango_caves",
      "montagu_street",
    ],
  },

  {
    keywords: ["hermanus"],
    match: [
      "hermanus",
    ],
  },

  {
    keywords: ["betty", "bettys bay"],
    match: [
      "bettys_bay_seen",
    ],
  },

  {
    keywords: ["knysna"],
    match: [
      "knysna_river",
      "harbour",
    ],
  },

  {
    keywords: ["benguela"],
    match: [
      "benguela_cove",
    ],
  },

  {
    keywords: ["lagoon"],
    match: [
      "benguela_cove",
    ],
  },

  {
    keywords: ["botlierskop"],
    match: [
      "botlierskop_landscape",
    ],
  },{
    keywords: ["gondwana"],
    match: [
      "gamedrive",
    ],
  },
];

/* ============================================================
   FIND ASSET BY PARTIAL FILENAME
============================================================ */
const findTourAsset = (parts = []) => {
  const keys = Object.keys(tourImageAssets);

  for (const part of parts) {
    const normalizedPart = part
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");

    if (!normalizedPart) continue;

    const match = keys.find((key) => {
      // Normalize the full key (remove non-alphanumeric)
      const normalizedKey = key
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");
      // Check if the full key contains the normalized part
      return normalizedKey.includes(normalizedPart);
    });

    if (match) {
      return tourImageAssets[match];
    }
  }

  return null;
};

/* ============================================================
   ROUTE STOP IMAGE
============================================================ */
const getRouteStopImage = (location) => {
  if (!location) return null;

  const normalizedLocation = location
    .toLowerCase()
    .trim();

  /* Explicit location rules first */
  for (const rule of routeStopImageRules) {
    const matchesLocation = rule.keywords.some((keyword) =>
      normalizedLocation.includes(keyword)
    );

    if (!matchesLocation) continue;

    const image = findTourAsset(rule.match);

    if (image) {
      return image;
    }

    // 🔥 NEW: Explicit rule matched, but asset not found → stop here
    return null;
  }

  /* Generic filename matching – now only reached if NO rule matched */
  const locationWords = normalizedLocation
    .split(/\s+/)
    .filter((word) => word.length > 3);

  if (locationWords.length) {
    const image = findTourAsset(locationWords);

    if (image) {
      return image;
    }
  }

  return null;
};

/* ============================================================
   ROUTE TIMELINE
============================================================ */
const RouteTimeline = ({ route, labels }) => {
  if (!route?.title) return null;

  const locations = route.title
    .split("→")
    .map((s) => s.trim())
    .filter(Boolean);

  if (locations.length < 2) return null;

  const totalDuration = 8;
  const segmentDuration =
    totalDuration / (locations.length - 1);

  return (
    <div className="relative mx-auto mt-10 w-full">
      <style>{`
        @keyframes carMove {
          0% {
            left: 0%;
          }

          100% {
            left: 100%;
          }
        }

        @keyframes stopLight {
          0%,
          100% {
            box-shadow:
              0 0 0 2px rgba(147, 197, 253, 0.35),
              0 4px 16px rgba(0, 0, 0, 0.12);
          }

          10%,
          28% {
            box-shadow:
              0 0 0 3px rgba(37, 99, 235, 0.35),
              0 0 24px rgba(37, 99, 235, 0.65),
              0 4px 18px rgba(37, 99, 235, 0.25);
          }
        }
      `}</style>

      <div className="relative overflow-hidden rounded-[1.5rem] bg-white px-5 py-6 shadow-[0_20px_60px_rgba(37,99,235,0.07)] sm:px-8">
        <div className="relative">

          {/* ROUTE LINE */}
          <div className="absolute left-0 right-0 top-1/2 h-0.5 -translate-y-1/2 bg-neutral-900" />

          {/* STOPS */}
          <div className="relative flex items-start justify-between">
            {locations.map((location, index) => {
              const image =
                getRouteStopImage(location);

              return (
                <div
                  key={`${location}-${index}`}
                  className="relative z-10 flex flex-col items-center"
                  style={{
                    width: `${100 / locations.length}%`,
                  }}
                >
                  {/* DESKTOP LABEL */}
                  {labels?.[index] && (
                    <span
                      className={`mb-2 hidden rounded-full px-3 py-1 font-bitter text-[10px] font-bold uppercase tracking-wider shadow-sm sm:inline-flex ${
                        labels[index] === "Depart" ||
                        labels[index] === "Return"
                          ? "bg-neutral-900 text-white"
                          : "bg-blue-600 text-white"
                      }`}
                    >
                      {labels[index]}
                    </span>
                  )}

                  {/* STOP */}
                  <div
                    className="route-stop relative h-12 w-12 overflow-hidden rounded-full border-2 border-white bg-neutral-100 shadow-[0_4px_16px_rgba(0,0,0,0.12)] ring-2 ring-blue-100"
                    style={{
                      animation: `stopLight ${totalDuration}s linear ${
                        index * segmentDuration
                      }s infinite`,
                    }}
                  >
                    {image ? (
                      <img
                        src={image}
                        alt={location}
                        className="h-full w-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-blue-50 text-blue-600">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          className="h-5 w-5"
                        >
                          <circle
                            cx="12"
                            cy="12"
                            r="8"
                          />
                          <path d="M12 8v4l3 2" />
                        </svg>
                      </div>
                    )}

                    {/* LIGHT OVERLAY */}
                    <div className="pointer-events-none absolute inset-0 rounded-full bg-blue-500/0" />
                  </div>

                  {/* LOCATION TEXT */}
                  <span className="mt-2 hidden max-w-full truncate px-1 text-center font-bitter text-[10px] font-semibold text-neutral-600 sm:block sm:text-xs">
                    {location}
                  </span>
                </div>
              );
            })}
          </div>

          {/* MOVING CAR */}
          <div
            className="absolute top-1/2 z-30 -translate-x-1/2 -translate-y-1/2"
            style={{
              animation: `carMove ${totalDuration}s linear infinite`,
              left: "0%",
              willChange: "left",
            }}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-[0_4px_16px_rgba(0,0,0,0.2)]">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                className="h-6 w-6 text-neutral-900"
              >
                <path d="M5 17h14" />
                <path d="M6 17l1.5-6h9L18 17" />
                <path d="M8 11l1.5-3h5L16 11" />

                <circle
                  cx="8"
                  cy="18"
                  r="1.5"
                  fill="currentColor"
                  stroke="none"
                />

                <circle
                  cx="16"
                  cy="18"
                  r="1.5"
                  fill="currentColor"
                  stroke="none"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
/* ============================================================
   MAIN COMPONENT
============================================================ */
const TourItinerary = ({
  itinerary,
}) => {
  const [activeDay, setActiveDay] =
    useState(null);

  const days =
    itinerary?.days || [];

  const routeLabels =
    generateRouteLabels(
      itinerary?.route?.title,
      days
    );

  /* ==========================================================
     LOCK PAGE BEHIND MODAL
  ========================================================== */
  useEffect(() => {
    if (activeDay !== null) {
      const body =
        document.body;

      const html =
        document.documentElement;

      const scrollY =
        window.scrollY;

      body.dataset.scrollPosition =
        String(scrollY);

      body.style.position =
        "fixed";

      body.style.top =
        `-${scrollY}px`;

      body.style.left = "0";
      body.style.right = "0";
      body.style.width = "100%";
      body.style.overflow =
        "hidden";

      html.style.overflow =
        "hidden";

      return () => {
        const savedScrollY =
          Number(
            body.dataset
              .scrollPosition || 0
          );

        body.style.position =
          "";

        body.style.top = "";
        body.style.left = "";
        body.style.right = "";
        body.style.width = "";
        body.style.overflow =
          "";

        html.style.overflow =
          "";

        window.scrollTo(
          0,
          savedScrollY
        );
      };
    }

    return undefined;
  }, [activeDay]);

  const openDay = (index) => {
    setActiveDay(index);
  };

  const closeDay = () => {
    setActiveDay(null);
  };

  const goPrev = () => {
    setActiveDay((current) =>
      current > 0
        ? current - 1
        : current
    );
  };

  const goNext = () => {
    setActiveDay((current) =>
      current <
      days.length - 1
        ? current + 1
        : current
    );
  };

  if (!itinerary?.days?.length) {
    return null;
  }

  return (
    <section
      id="tour-itinerary"
      className="relative border-y border-blue-100 bg-white"
      style={{
        overflowAnchor: "none",
      }}
    >
      {/* BACKGROUND */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-10%] top-[-20%] h-[500px] w-[500px] rounded-full bg-blue-100/40 blur-3xl" />

        <div className="absolute bottom-[-20%] right-[-10%] h-[450px] w-[450px] rounded-full bg-sky-100/30 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-16 lg:px-5 lg:py-24">

        {/* HEADER */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="font-bitter text-[11px] font-bold uppercase tracking-[0.24em] text-blue-600">
            Your Journey
          </span>

          <h2 className="mt-3 font-frank text-4xl font-bold leading-[0.95] text-neutral-950 sm:text-5xl lg:text-6xl">
            {itinerary.intro?.title ||
              "Your Itinerary"}
          </h2>
        </div>

        {/* ROUTE TIMELINE */}
        <RouteTimeline
          route={
            itinerary.route
          }
          labels={
            routeLabels
          }
        />

        {/* DAY CARDS */}
        <div className="mt-14">
          <div className="mb-8 flex items-center gap-8">
            <div className="flex-1">
              <h3 className="font-frank text-2xl font-bold text-neutral-950 sm:text-3xl lg:text-4xl">
                Explore the Days
              </h3>

              <p className="mt-2 font-bitter text-sm text-neutral-500">
                Select a day to see
                the full experience.
              </p>
            </div>

            {itinerary.route?.title && (
              <div className="hidden flex-1 font-bitter text-sm text-neutral-500 lg:block">
                {itinerary.route.title}
              </div>
            )}
          </div>

          <div
            className={`grid gap-4 ${
              days.length === 1
                ? "max-w-sm grid-cols-1"
                : days.length === 2
                  ? "grid-cols-1 sm:grid-cols-2"
                  : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            }`}
          >
            {days.map(
              (day, index) => (
                <DayCard
                  key={`day-${day.day}-${index}`}
                  day={day}
                  index={index}
                  onClick={() =>
                    openDay(index)
                  }
                />
              )
            )}
          </div>
        </div>
      </div>

      {/* ======================================================
          MODAL
      ====================================================== */}
      {activeDay !== null && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm sm:p-6"
          onMouseDown={(
            event
          ) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeDay();
            }
          }}
        >
          {/* MODAL */}
          <div
            className="relative flex h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-[1.75rem] bg-white shadow-2xl"
            onWheel={(event) => {
              event.stopPropagation();
            }}
            onTouchMove={(
              event
            ) => {
              event.stopPropagation();
            }}
            style={{
              WebkitOverflowScrolling:
                "touch",
            }}
          >
            {/* CLOSE */}
            <button
              onClick={closeDay}
              className="absolute right-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-red-200 bg-red-50/90 text-red-600 shadow-md transition hover:bg-red-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
              aria-label="Close"
            >
              ✕
            </button>

            {/* ==================================================
                SCROLLABLE ITINERARY
            ================================================== */}
            <div
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
              style={{
                WebkitOverflowScrolling:
                  "touch",
                overscrollBehaviorY:
                  "contain",
                touchAction:
                  "pan-y",
              }}
            >
              <ExpandedDay
                day={
                  days[activeDay]
                }
                activeDay={
                  activeDay
                }
                days={days}
                goPrev={goPrev}
                goNext={goNext}
                routeTitle={
                  itinerary.route
                    ?.title
                }
              />
            </div>

            {/* ==================================================
                ALWAYS VISIBLE SUPPORT BANNER
            ================================================== */}
            <div className="shrink-0 border-t border-blue-100 bg-white p-">
              <div className="hero-gradient rounded-b-[1.25rem] px-5 sm:px-7 sm:py-">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                  <div className="min-w-0">
                    <span className="font-bold uppercase text-white/70">
                      Need help?
                    </span>
                  <p className="font-semibold text-white/80">08h00-17:00</p>

                  </div>

                  <p className="font-semibold text-white/80">(+27) 00 000 0000</p>
                  <p className="font-semibold text-white/80">support@cape-frontier.co.za</p>

                  <button
                    type="button"
                    className="shrink-0 self-start rounded-full bg-white m-2 p-2 px-4 font-bitter text-xs font-bold text-blue-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:self-center"
                  >
                    Contact support →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

/* ============================================================
   DAY CARD
============================================================ */
function DayCard({
  day,
  index,
  onClick,
}) {
  const activityTypes =
    day.activities?.map(
      (a) => a.type
    ) || [];

  const previewTypes =
    activityTypes.slice(0, 3);

  const extraCount =
    activityTypes.length -
    previewTypes.length;

  
  
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative min-h-[420px] overflow-hidden rounded-[1.5rem] border border-blue-100 text-left shadow-[0_15px_45px_rgba(37,99,235,0.06)] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-2 hover:border-blue-200 hover:shadow-[0_25px_60px_rgba(37,99,235,0.12)] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-sky-50" />

      <div className="absolute left-1/2 top-[-100px] h-56 w-56 -translate-x-1/2 rounded-full bg-blue-200/30 blur-3xl opacity-60 transition-all duration-700 group-hover:scale-110" />

      <div className="card-glow group relative flex h-full min-h-[420px] flex-col items-start px-5 py-7 transition duration-300">

       {/* ICON – fades away on hover */}
        <div className="mt-4 flex h-16 w-16 items-center justify-center rounded-full border border-blue-100 bg-white text-neutral-900 shadow-[0_10px_30px_rgba(37,99,235,0.08)] transition-all duration-500 group-hover:scale-105 group-hover:border-blue-200 group-hover:opacity-0">
          <ActivityIcon
            type={getDayIcon(day)}
            monochrome
          />
        </div>

        {/* DAY TITLE – shrinks on hover */}
        <span className="inline-flex items-center gap-2 rounded-full px-4 py-2 font-frank 
          text-7xl font-bold text-blue-700 transition-all duration-300 
          group-hover:text-black/80 group-hover:text-4xl group-hover:-translate-x-4">
          Day {day.day}
        </span>

        {/* IMAGE ARRAY – hidden initially, slides up on hover */}
        <div className="flex overflow-x-auto gap-2 opacity-0 translate-y-2 transition-all duration-300 ease-out group-hover:opacity-100 group-hover:translate-y-0">
          {day.activities?.map((activity, index) => (
            <img
              key={activity.id ?? index}
              src={ resolveImage (activity.image)}  // try this
              alt={activity.name ?? "Activity"}
              className="h-12 w-12 flex-shrink-0 bg-red-400 object-cover"
            />
          ))}
        </div>

        {/* TITLE */}
        <h3 className="mt-4 font-frank text-xl font-bold leading-tight text-neutral-950
        group-hover:text-xs group-hover:text-black/60 transition  duration-400">
          {day.title}
        </h3>

        {/* BOTTOM */}
        <div className="mt-auto w-full">
          {previewTypes.length > 0 && (
            <div className="flex items-center gap-1.5">
              {previewTypes.map(
                (type, i) => (
                  <span
                    key={i}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 text-blue-600 ring-1 ring-blue-100"
                  >
                    <ActivityIcon
                      type={type}
                    />
                  </span>
                )
              )}

              {extraCount > 0 && (
                <span className="ml-1 font-bitter text-xs font-semibold text-neutral-400">
                  +{extraCount} more
                </span>
              )}
            </div>
          )}

          {day.meals && (
            <MealBadges
              meals={day.meals}
              compact
            />
          )}

          <div className="mt-4 flex items-center gap-2 font-bitter text-xs font-bold text-neutral-400 transition-colors duration-300 group-hover:text-blue-600">
            <span>
              Explore day
            </span>

            <span className="flex h-6 w-6 items-center justify-center rounded-full border border-neutral-200 bg-white transition-transform duration-500 group-hover:translate-y-0.5">
              ↓
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

/* ============================================================
   EXPANDED DAY
============================================================ */
function ExpandedDay({
  day,
  activeDay,
  days,
  goPrev,
  goNext,
  routeTitle,
}) {
  // Build Google Maps URL from routeTitle
  const getGoogleMapsUrl = () => {
    if (!routeTitle) return null;

    const locations = routeTitle
      .split("→")
      .map((loc) => loc.trim())
      .filter(Boolean);

    if (locations.length < 2) return null;

    const origin = encodeURIComponent(locations[0]);
    const destination = encodeURIComponent(
      locations[locations.length - 1]
    );

    let waypoints = "";
    if (locations.length > 2) {
      const middle = locations.slice(1, -1);
      waypoints = `&waypoints=${middle
        .map(encodeURIComponent)
        .join("|")}`;
    }

    return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}${waypoints}&travelmode=driving`;
  };

  const mapsUrl = getGoogleMapsUrl();

  return (
    <article>
      {/* STICKY DAY NAVIGATION */}
      <div className="sticky top-0 z-20 border-b border-blue-100 bg-white px-5 py-3 shadow-sm sm:px-8">
        <div className="relative flex justify-center items-center gap-4 py-4">
          <button
            onClick={goPrev}
            disabled={
              activeDay === 0
            }
            className="flex h-8 w-8 items-center justify-center rounded-full border border-blue-200 bg-white font-bitter
             text-sm font-bold text-black shadow-sm transition 
             hover:bg disabled:cursor-not-allowed disabled:opacity-30 sm:h-9 sm:w-9"
            aria-label="Previous day"
          >
            ←
          </button>

          <div className="flex flex-col items-center text-center">
            <h3 className="font-frank text-3xl font-bold leading-none text-neutral-950 sm:text-4xl">
              Day {day.day}
            </h3>
            <span className="mt-1 font-bitter text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-400">
              {activeDay + 1} / {days.length}
            </span>
          </div>

          <button
            onClick={goNext}
            disabled={
              activeDay ===
              days.length - 1
            }
            className="flex h-8 w-8 items-center justify-center rounded-full border border-blue-200 bg-white font-bitter text-sm font-bold text-blue-700 shadow-sm transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-30 sm:h-9 sm:w-9"
            aria-label="Next day"
          >
            →
          </button>
        </div>
      </div>

      {/* HEADER (non-sticky content) */}
      <div className="relative overflow-hidden border-b border-blue-300 bg-gradient-to-br from-blue- to-blue-500 px-5 py-7 sm:px-8 sm:py-9">
        <div className="absolute right-[-80px] top-[-100px] h-64 w-64 rounded-full bg-blue-400 blur-3xl" />

        <div className="relative ">

          {/* MEALS */}
          {day.meals && (
            <div className="mt-">
              <MealBadges
                meals={day.meals}
              />
            </div>
          )}

          {/* TITLE */}
          <h3 className="mt-5 max-w-4xl font-frank text-2xl font-bold leading-tight text-neutral-950 sm:text-3xl">
            {/* {day.title} */}
          </h3>

          {/* WHERE YOU'LL STAY */}
          {day.accommodation?.title && (
            <div className="mt-6 rounded-[1.25rem] border border-blue-100 bg-blue-50 p-4 shadow-sm sm:p-5">
              <div className="flex items-start gap-8">
                <div className="flex h-50 w-50 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white ring-1 ring-blue-100">
                  <img
                    src={ resolveImage (accommodationImg)} // or your imported path
                    alt="Accommodation"
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="min-w-0">
                  <span className="font-bitter text-[10px] font-bold uppercase tracking-[0.18em] text-blue-500">
                    Where you'll
                    stay
                  </span>

                  <h4 className="mt-1 font-frank text-lg font-bold text-neutral-950 sm:text-xl">
                    {
                      day
                        .accommodation
                        .title
                    }
                  </h4>

                  {
                    day
                      .accommodation
                      .location && (
                      <p className="mt-1 font-bitter text-sm text-neutral-500">
                        {
                          day
                            .accommodation
                            .location
                        }
                      </p>
                    )
                  }

                  {
                    day
                      .accommodation
                      .availabilityNote && (
                      <p className="mt-3 font-bitter text-sm leading-6 text-neutral-600">
                        {
                          day
                            .accommodation
                            .availabilityNote
                        }
                      </p>
                    )
                  }

                  {
                    day
                      .accommodation
                      .options
                      ?.length >
                      0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {day.accommodation.options.map(
                          (
                            option,
                            index
                          ) => (
                            <span
                              key={`${option}-${index}`}
                              className="rounded-full border border-blue-100 bg-white px-3 py-1.5 font-bitter text-xs font-semibold text-neutral-700"
                            >
                              {option}
                            </span>
                          )
                        )}
                      </div>
                    )
                  }
                </div>
              </div>
            </div>
          )}

          {/* ROUTE OVERVIEW */}
          {day.route && (
            <div className="mt-5 rounded-[1rem] border border-blue-100 bg-blue-50 px-4 py-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4 justify-center items-center">
                {/* Left column: Google Maps button */}
                {mapsUrl && (
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-white px-4 py-2 font-bitter text-xs font-bold text-blue-700 shadow-sm ring-1 ring-blue-100 transition hover:bg-blue-100 hover:shadow-md"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      className="h-4 w-4"
                    >
                      <path d="M9 20l-5.447-2.724A1 1 0 0 1 3 16.382V5.618a1 1 0 0 1 1.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0 0 21 18.382V7.618a1 1 0 0 0-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    View route on Google Maps
                  </a>
                )}

                {/* Right column: icon + location text */}
                <div className="flex flex-1 items-start gap-2">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-blue-600 ring-1 ring-blue-100">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      className="h-3.5 w-3.5"
                    >
                      <path d="M12 21s-7-5.25-7-11a7 7 0 1 1 14 0c0 5.75-7 11-7 11Z" />
                      <circle cx="12" cy="10" r="2.5" />
                    </svg>
                  </span>
                  <p className="font-bitter text-sm leading-6 text-neutral-600">
                    {day.route}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ACTIVITIES */}
      {day.activities?.length >
        0 && (
        <div className="px-5 py-7 sm:px-8 sm:py-9">
          <div className="space-y-3">
            {day.activities.map(
              (
                activity,
                index
              ) => (
                <ActivityRow
                  key={`${activity.title}-${index}`}
                  activity={
                    activity
                  }
                  index={
                    index
                  }
                />
              )
            )}
          </div>
        </div>
      )}
    </article>
  );
}

/* ============================================================
   ACTIVITY ROW
============================================================ */
function ActivityRow({
  activity,
  index,
}) {
  /*
    THIS IS THE IMPORTANT CHANGE:

    Uses:
      activity.image

    before:
      activityImages[activity.type]
  */
  const image =
    getActivityImage(
      activity
    );


  return (
    <div
      className="group relative overflow-hidden rounded-[1.25rem] 
      border border-blue-100 bg-gradient-to-r from-white via-white to-blue-50/40 
      transition-all duration-400 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-[0_12px_35px_rgba(37,99,235,0.08)]"
      style={{
        animationDelay: `${
          index * 70
        }ms`,
      }}
    >
      <div className="flex items-center justify-center gap-3 sm:gap-5">

        {/* TIME */}
        <div className="hidden w shrink-0 pt-2 sm:block m-2">
          <span className="font-bitter text-[10px] font-bold uppercase tracking-[0.12em] text-blue-500">
            Time
          </span>

          <p className="mt-1 font-bitter text-base sm:text-lg font-bold text-neutral-900">
            {activity.time ||
              "Flexible"}
          </p>

          {activity.duration && (
            <p className="mt-1 font-bitter text-[10px] text-neutral-400">
              {
                activity.duration
              }
            </p>
          )}
        </div>

        {/* ICON */}
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 ring-1 ring-blue-100 transition-all duration-300 group-hover:scale-105 group-hover:bg-blue-600 group-hover:text-white">
          <ActivityIcon
            type={
              activity.type
            }
          />
        </div>

        {/* CONTENT */}
        <div className="min-w-0 flex-1 py-1">
          <div className="flex flex-wrap items-center gap-2">
            <h5 className="font-frank text-lg font-bold leading-tight text-neutral-950">
              {
                activity.title
              }
            </h5>

            {activity.optional && (
              <span className="rounded-full bg-blue-50 px-2 py-1 font-bitter text-[9px] font-bold uppercase tracking-[0.08em] text-blue-600">
                Optional
              </span>
            )}
          </div>

          {/* MOBILE TIME */}
          <div className="mt-1 flex flex-wrap gap-2 sm:hidden">
            <span className="font-bitter text-sm font-semibold text-blue-600">
              {activity.time ||
                "Flexible"}
            </span>

            {activity.duration && (
              <>
                <span className="text-neutral-300">
                  •
                </span>

                <span className="font-bitter text-[10px] text-neutral-500">
                  {
                    activity.duration
                  }
                </span>
              </>
            )}
          </div>

          <p className="mt-2 max-w-3xl font-bitter text-sm leading-6 text-neutral-600">
            {
              activity.description
            }
          </p>
        </div>

        {/* ACTIVITY IMAGE */}
        {image && (
          <div className="hidden h-50 overflow-hidden  sm:block">
            <img
              src={ resolveImage (image)}
              alt={
                activity.title
              }
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
              decoding="async"
            />
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   MEAL BADGES
============================================================ */
function MealBadges({
  meals,
  compact = false,
}) {
  const available = [];

  if (meals.breakfast) {
    available.push(
      "Breakfast"
    );
  }

  if (meals.lunch) {
    available.push(
      "Lunch"
    );
  }

  if (meals.dinner) {
    available.push(
      "Dinner"
    );
  }

  if (!available.length) {
    return null;
  }

  return (
    <div
      className={`flex flex-wrap gap-2 ${
        compact
          ? "mt-3"
          : ""
      }`}
    >
      {available.map(
        (meal) => (
          <span
            key={meal}
            className={`rounded-full border border-blue-100 bg-white font-bitter text-[10px] font-bold text-neutral-600 shadow-sm ${
              compact
                ? "px-2.5 py-1"
                : "px-3 py-1.5"
            }`}
          >
            {meal}
          </span>
        )
      )}
    </div>
  );
}

/* ============================================================
   ACCOMMODATION
============================================================ */
function Accommodation({
  accommodation,
}) {
  return (
    <div className="border-t border-blue-100 bg-gradient-to-br from-blue-50/60 to-white px-5 py-7 sm:px-8">
      <div className="flex gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-blue-600 shadow-sm ring-1 ring-blue-100">
          <ActivityIcon
            type="accommodation"
          />
        </div>

        <div className="min-w-0">
          <span className="font-bitter text-[10px] font-bold uppercase tracking-[0.18em] text-blue-500">
            Stay
          </span>

          <h4 className="mt-1 font-frank text-xl font-bold text-neutral-950">
            {
              accommodation.title
            }
          </h4>

          {
            accommodation.location && (
              <p className="mt-1 font-bitter text-sm text-neutral-500">
                {
                  accommodation.location
                }
              </p>
            )
          }

          {
            accommodation.availabilityNote && (
              <p className="mt-3 max-w-2xl font-bitter text-sm leading-6 text-neutral-600">
                {
                  accommodation.availabilityNote
                }
              </p>
            )
          }

          {
            accommodation.options
              ?.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {accommodation.options.map(
                  (
                    option,
                    index
                  ) => (
                    <span
                      key={`${option}-${index}`}
                      className="rounded-full border border-blue-100 bg-white px-3 py-1.5 font-bitter text-xs font-semibold text-neutral-700 shadow-sm"
                    >
                      {option}
                    </span>
                  )
                )}
              </div>
            )
          }
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   DAY ICON
============================================================ */
function getDayIcon(day) {
  const types =
    day.activities
      ?.map(
        (a) => a.type
      )
      .filter(Boolean) ||
    [];

  if (
    types.includes(
      "safari"
    )
  ) {
    return "safari";
  }

  if (
    types.includes(
      "wine"
    )
  ) {
    return "wine";
  }

  if (
    types.includes(
      "adventure"
    )
  ) {
    return "adventure";
  }

  if (
    types.includes(
      "wildlife"
    )
  ) {
    return "wildlife";
  }

  if (
    types.includes(
      "scenic"
    )
  ) {
    return "scenic";
  }

  return "transfer";
}

export default TourItinerary;