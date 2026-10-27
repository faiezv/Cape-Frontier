import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import { resolveImage } from "../../utils/ImageLoader";

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
  },
);

/* ============================================================
   SLIDER TUNING
============================================================ */
const SLIDE_MS = 700; // slide transition length
const SLIDE_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const WHEEL_IDLE_MS = 140; // wheel must go quiet this long before the next step
const WHEEL_MIN_DELTA = 4; // ignore tiny trackpad noise
const SWIPE_MIN_PX = 50; // touch swipe distance needed to step

/* ============================================================
   ACTIVITY ICONS
============================================================ */
const ActivityIcon = ({ type, monochrome = false }) => {
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
        <svg viewBox="0 0 24 24" fill="none" stroke={stroke} className={common}>
          <path d="M5 17h14" />
          <path d="M6 17l1.5-6h9L18 17" />
          <path d="M8 11l1.5-3h5L16 11" />
          <circle cx="8" cy="18" r="1.5" />
          <circle cx="16" cy="18" r="1.5" />
        </svg>
      );

    case "wine":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={stroke} className={common}>
          <path d="M8 3h8l-1 6a3 3 0 0 1-6 0L8 3Z" />
          <path d="M12 12v7" />
          <path d="M8 21h8" />
        </svg>
      );

    case "scenic":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={stroke} className={common}>
          <path d="M3 19l6-8 4 5 3-4 5 7" />
          <path d="M3 19h18" />
          <circle cx="17" cy="6" r="2" />
        </svg>
      );

    case "adventure":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={stroke} className={common}>
          <path d="M12 3l2.5 5.5L20 11l-5.5 2.5L12 19l-2.5-5.5L4 11l5.5-2.5L12 3Z" />
        </svg>
      );

    case "safari":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={stroke} className={common}>
          <circle cx="12" cy="12" r="8" />
          <path d="M12 7v10M7 12h10" />
          <path d="M9 9l6 6M15 9l-6 6" />
        </svg>
      );

    case "meal":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={stroke} className={common}>
          <path d="M7 3v8" />
          <path d="M5 3v5a2 2 0 0 0 4 0V3" />
          <path d="M7 11v10" />
          <path d="M16 3v18" />
          <path d="M16 3c3 2 3 6 0 8" />
        </svg>
      );

    case "accommodation":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={stroke} className={common}>
          <path d="M4 20V8l8-5 8 5v12" />
          <path d="M8 20v-5h8v5" />
          <path d="M9 9h2v2H9zM13 9h2v2h-2z" />
        </svg>
      );

    case "leisure":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={stroke} className={common}>
          <path d="M3 18c3-4 5-4 8 0s5 4 10 0" />
          <path d="M5 13c3-4 5-4 8 0s5 4 6 0" />
        </svg>
      );

    case "wildlife":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={stroke} className={common}>
          <path d="M5 16c1-4 4-6 7-6s6 2 7 6" />
          <path d="M8 9l-1-3M16 9l1-3" />
          <circle cx="9" cy="12" r=".7" />
          <circle cx="15" cy="12" r=".7" />
        </svg>
      );

    default:
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={stroke} className={common}>
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
    const resolved = resolveImage(activity.image);

    if (resolved) {
      return resolved;
    }
  }

  return activityImages[activity?.type] || null;
};

/* ============================================================
   ROUTE LABELS
============================================================ */
const generateRouteLabels = (routeTitle, days) => {
  if (!routeTitle) return [];

  const locations = routeTitle
    .split("→")
    .map((s) => s.trim())
    .filter(Boolean);

  const labels = new Array(locations.length).fill(null);

  if (locations.length > 0) {
    labels[0] = "Depart";
    labels[locations.length - 1] = "Return";
  }

  days?.forEach((day) => {
    if (!day.title) return;

    const firstLocation = day.title.split("→")[0]?.trim();

    if (!firstLocation) return;

    const index = locations.findIndex(
      (loc) => loc.toLowerCase() === firstLocation.toLowerCase(),
    );

    if (index !== -1 && index !== 0 && index !== locations.length - 1) {
      labels[index] = `Day ${day.day}`;
    }
  });

  const dayCount = days?.length || 0;

  if (dayCount > 0) {
    const existingDayIndices = labels
      .map((label, idx) => (label?.startsWith("Day") ? idx : -1))
      .filter((idx) => idx !== -1);

    if (existingDayIndices.length < dayCount) {
      const step = locations.length / (dayCount + 1);

      for (let i = 0; i < dayCount; i++) {
        const idx = Math.round(step * (i + 1));

        if (idx > 0 && idx < locations.length - 1 && !labels[idx]) {
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
    match: ["shared/pickup/1.webp"],
  },

  {
    keywords: ["robertson"],
    match: ["wacky_wine_weekend"],
  },

  {
    keywords: ["route 62"],
    match: ["montagu_street", "wacky_wine_weekend"],
  },

  {
    keywords: ["montagu"],
    match: ["montagu_street"],
  },

  {
    keywords: ["barrydale"],
    match: ["montagu_street"],
  },

  {
    keywords: ["oudtshoorn"],
    match: ["cango_caves"],
  },

  {
    keywords: ["cango caves"],
    match: ["cango_caves"],
  },

  {
    keywords: ["klein karoo"],
    match: ["cango_caves", "montagu_street"],
  },

  {
    keywords: ["hermanus"],
    match: ["hermanus"],
  },

  {
    keywords: ["betty", "bettys bay"],
    match: ["bettys_bay_seen"],
  },

  {
    keywords: ["knysna"],
    match: ["knysna_river", "harbour"],
  },

  {
    keywords: ["benguela"],
    match: ["benguela_cove"],
  },

  {
    keywords: ["lagoon"],
    match: ["benguela_cove"],
  },

  {
    keywords: ["botlierskop"],
    match: ["botlierskop_landscape"],
  },
  {
    keywords: ["gondwana"],
    match: ["gamedrive"],
  },
];

/* ============================================================
   FIND ASSET BY PARTIAL FILENAME
============================================================ */
const findTourAsset = (parts = []) => {
  const keys = Object.keys(tourImageAssets);

  for (const part of parts) {
    const normalizedPart = part.toLowerCase().replace(/[^a-z0-9]/g, "");

    if (!normalizedPart) continue;

    const match = keys.find((key) => {
      // Normalize the full key (remove non-alphanumeric)
      const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, "");
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

  const normalizedLocation = location.toLowerCase().trim();

  /* Explicit location rules first */
  for (const rule of routeStopImageRules) {
    const matchesLocation = rule.keywords.some((keyword) =>
      normalizedLocation.includes(keyword),
    );

    if (!matchesLocation) continue;

    const image = findTourAsset(rule.match);

    if (image) {
      return image;
    }

    // Explicit rule matched, but asset not found → stop here
    return null;
  }

  /* Generic filename matching – only reached if NO rule matched */
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
   SLIDER HELPERS
============================================================ */

/*
  Flattens days into one continuous list of slides:

    Day 1: [overview, activity, activity, ...]
    Day 2: [overview, activity, activity, ...]

  Because it is ONE list, "last activity -> next day" and
  "first activity -> previous day" are just step +1 / -1.
*/
const buildSlides = (days) => {
  const slides = [];
  const dayStarts = [];

  days.forEach((day, dayIndex) => {
    dayStarts[dayIndex] = slides.length;

    const activities = day.activities || [];
    const hasRoute = Boolean(day.route);
    const hasStay = Boolean(day.accommodation?.title);

    if (hasRoute || hasStay || !activities.length) {
      slides.push({ type: "overview", dayIndex });
    }

    activities.forEach((activity, activityIndex) => {
      slides.push({
        type: "activity",
        dayIndex,
        activityIndex,
        activityCount: activities.length,
      });
    });
  });

  return { slides, dayStarts };
};

/* Can this slide still scroll natively in the given direction? */
const hasRoomToScroll = (el, dir) => {
  if (!el) return false;

  const max = el.scrollHeight - el.clientHeight;

  if (max <= 1) return false;

  return dir > 0 ? el.scrollTop < max - 1 : el.scrollTop > 1;
};

const getEdges = (el) => {
  if (!el) return { top: true, bottom: true };

  const max = el.scrollHeight - el.clientHeight;

  return {
    top: el.scrollTop <= 1,
    bottom: el.scrollTop >= max - 1,
  };
};

const getGoogleMapsUrl = (routeTitle) => {
  if (!routeTitle) return null;

  const locations = routeTitle
    .split("→")
    .map((loc) => loc.trim())
    .filter(Boolean);

  if (locations.length < 2) return null;

  const origin = encodeURIComponent(locations[0]);
  const destination = encodeURIComponent(locations[locations.length - 1]);

  let waypoints = "";

  if (locations.length > 2) {
    const middle = locations.slice(1, -1);
    waypoints = `&waypoints=${middle.map(encodeURIComponent).join("|")}`;
  }

  return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}${waypoints}&travelmode=driving`;
};

const getMealsLabel = (meals) => {
  if (!meals) return "";

  const list = [];

  if (meals.breakfast) list.push("Breakfast");
  if (meals.lunch) list.push("Lunch");
  if (meals.dinner) list.push("Dinner");

  return list.join(" · ");
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
  const segmentDuration = totalDuration / (locations.length - 1);

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
              const image = getRouteStopImage(location);

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
                        labels[index] === "Depart" || labels[index] === "Return"
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
                          <circle cx="12" cy="12" r="8" />
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
const TourItinerary = ({ itinerary }) => {
  const days = itinerary?.days || [];

  const routeLabels = generateRouteLabels(itinerary?.route?.title, days);

  const { slides, dayStarts } = useMemo(() => buildSlides(days), [days]);
  const slideCount = slides.length;

  /* `current` = index into `slides`, null = modal closed */
  const [current, setCurrent] = useState(null);

  const currentRef = useRef(null);
  const lockUntilRef = useRef(0);
  const panelRef = useRef(null);
  const scrollerRefs = useRef({});

  const isOpen = current !== null;

  const registerScroller = useCallback((index, el) => {
    if (el) scrollerRefs.current[index] = el;
  }, []);

  const goToSlide = useCallback(
    (index) => {
      const next = Math.max(0, Math.min(slideCount - 1, index));

      if (next === currentRef.current) return;

      currentRef.current = next;
      lockUntilRef.current = performance.now() + SLIDE_MS + 50;
      setCurrent(next);
    },
    [slideCount],
  );

  const stepSlide = useCallback(
    (dir) => {
      if (currentRef.current === null) return;
      goToSlide(currentRef.current + dir);
    },
    [goToSlide],
  );

  const openDay = (dayIndex) => {
    const target = dayStarts[dayIndex] ?? 0;

    currentRef.current = target;
    lockUntilRef.current = 0;
    setCurrent(target);
  };

  const closeDay = useCallback(() => {
    currentRef.current = null;
    setCurrent(null);
  }, []);

  /* ==========================================================
     LOCK PAGE BEHIND MODAL (+ pause Lenis if it is global)
  ========================================================== */
  useEffect(() => {
    if (!isOpen) return undefined;

    const body = document.body;
    const html = document.documentElement;
    const scrollY = window.scrollY;

    body.dataset.scrollPosition = String(scrollY);

    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    body.style.overflow = "hidden";

    html.style.overflow = "hidden";

    // No-op unless your Lenis instance is exposed as window.lenis
    window.lenis?.stop?.();

    return () => {
      const savedScrollY = Number(body.dataset.scrollPosition || 0);

      body.style.position = "";
      body.style.top = "";
      body.style.left = "";
      body.style.right = "";
      body.style.width = "";
      body.style.overflow = "";

      html.style.overflow = "";

      window.scrollTo(0, savedScrollY);

      window.lenis?.start?.();
    };
  }, [isOpen]);

  /* ==========================================================
     WHEEL / TOUCH / KEYBOARD -> SLIDER STEPS
     Native listeners, because React's wheel handler is passive
     and cannot preventDefault.
  ========================================================== */
  useEffect(() => {
    if (!isOpen) return undefined;

    const panel = panelRef.current;

    if (!panel) return undefined;

    const getScroller = () => scrollerRefs.current[currentRef.current];

    /* ---------- WHEEL ---------- */
    const onWheel = (event) => {
      event.stopPropagation(); // keep Lenis / window out of it

      if (event.ctrlKey) return; // pinch-zoom
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;

      const dir = Math.sign(event.deltaY);

      if (!dir) return;

      const now = performance.now();

      // Tall slide: let it scroll natively until it hits its edge
      if (hasRoomToScroll(getScroller(), dir)) {
        lockUntilRef.current = Math.max(
          lockUntilRef.current,
          now + WHEEL_IDLE_MS + 80,
        );
        return;
      }

      event.preventDefault();

      // Transition running, or trackpad inertia still arriving
      if (now < lockUntilRef.current) {
        lockUntilRef.current = Math.max(
          lockUntilRef.current,
          now + WHEEL_IDLE_MS,
        );
        return;
      }

      if (Math.abs(event.deltaY) < WHEEL_MIN_DELTA) return;

      stepSlide(dir);
    };

    /* ---------- TOUCH ---------- */
    let touchStartY = 0;
    let touchStartX = 0;
    let startEdges = { top: true, bottom: true };

    const onTouchStart = (event) => {
      const touch = event.touches[0];

      touchStartY = touch.clientY;
      touchStartX = touch.clientX;
      startEdges = getEdges(getScroller());
    };

    const onTouchEnd = (event) => {
      const touch = event.changedTouches[0];

      const dy = touchStartY - touch.clientY;
      const dx = touchStartX - touch.clientX;

      if (Math.abs(dy) < SWIPE_MIN_PX || Math.abs(dy) < Math.abs(dx)) return;

      const dir = dy > 0 ? 1 : -1;

      // Only step if the slide was already at that edge when the swipe began
      if (dir > 0 && !startEdges.bottom) return;
      if (dir < 0 && !startEdges.top) return;

      if (performance.now() < lockUntilRef.current) return;

      stepSlide(dir);
    };

    /* ---------- KEYBOARD ---------- */
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        closeDay();
        return;
      }

      const forward = event.key === "ArrowDown" || event.key === "PageDown";
      const backward = event.key === "ArrowUp" || event.key === "PageUp";

      if (!forward && !backward) return;

      event.preventDefault();

      const dir = forward ? 1 : -1;
      const scroller = getScroller();

      if (hasRoomToScroll(scroller, dir)) {
        scroller.scrollBy({ top: dir * 140, behavior: "smooth" });
        return;
      }

      if (performance.now() < lockUntilRef.current) return;

      stepSlide(dir);
    };

    panel.addEventListener("wheel", onWheel, { passive: false });
    panel.addEventListener("touchstart", onTouchStart, { passive: true });
    panel.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("keydown", onKeyDown);

    return () => {
      panel.removeEventListener("wheel", onWheel);
      panel.removeEventListener("touchstart", onTouchStart);
      panel.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, stepSlide, closeDay]);

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
            {itinerary.intro?.title || "Your Itinerary"}
          </h2>
        </div>

        {/* ROUTE TIMELINE */}
        <RouteTimeline route={itinerary.route} labels={routeLabels} />

        {/* DAY CARDS */}
        <div className="mt-14">
          <div className="mb-8 flex items-center gap-8">
            <div className="flex-1">
              <h3 className="font-frank text-2xl font-bold text-neutral-950 sm:text-3xl lg:text-4xl">
                Explore the Days
              </h3>

              <p className="mt-2 font-bitter text-sm text-neutral-500">
                Select a day to see the full experience.
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
            {days.map((day, index) => (
              <DayCard
                key={`day-${day.day}-${index}`}
                day={day}
                index={index}
                onClick={() => openDay(index)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ======================================================
          MODAL
          data-lenis-prevent tells Lenis to leave everything
          inside the modal alone.
      ====================================================== */}
      {isOpen && (
        <div
          data-lenis-prevent
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-2 backdrop-blur-sm sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeDay();
            }
          }}
        >
          <div
            ref={panelRef}
            className="relative flex h-[92dvh] w-full max-w-4xl flex-col overflow-hidden rounded-[1.5rem] bg-white shadow-2xl sm:h-[90vh] sm:rounded-[1.75rem]"
          >
            {/* CLOSE */}
            <button
              onClick={closeDay}
              className="absolute right-3 top-3 z-50 flex h-9 w-9 items-center justify-center rounded-full border border-red-200 bg-red-50/90 text-sm text-red-600 shadow-md transition hover:bg-red-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 sm:right-4 sm:top-4 sm:h-10 sm:w-10"
              aria-label="Close"
            >
              ✕
            </button>

            {/* ==================================================
                DAY SLIDER
            ================================================== */}
            <DayStage
              days={days}
              slides={slides}
              dayStarts={dayStarts}
              current={current}
              routeTitle={itinerary.route?.title}
              onStep={stepSlide}
              onGoTo={goToSlide}
              registerScroller={registerScroller}
            />

            {/* ==================================================
                SUPPORT BANNER (compact on mobile)
            ================================================== */}
            <div className="shrink-0 border-t border-blue-100 bg-white">
              <div className="hero-gradient px-4 py-2.5 sm:px-7 sm:py-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 leading-tight">
                    <p className="font-bitter text-[10px] font-bold uppercase tracking-[0.14em] text-white/70">
                      Need help?
                      <span className="ml-1.5 font-semibold normal-case tracking-normal">
                        · 08h00–17:00
                      </span>
                    </p>

                    <p className="mt-0.5 truncate font-bitter text-xs font-semibold text-white/90 sm:text-sm">
                      (+27) 00 000 0000
                      <span className="hidden sm:inline">
                        {" "}
                        · support@cape-frontier.co.za
                      </span>
                    </p>
                  </div>

                  <button
                    type="button"
                    className="shrink-0 rounded-full bg-white px-3.5 py-2 font-bitter text-[11px] font-bold text-blue-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:px-4 sm:text-xs"
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
function DayCard({ day, index, onClick }) {
  const activityTypes = day.activities?.map((a) => a.type) || [];

  const previewTypes = activityTypes.slice(0, 3);

  const extraCount = activityTypes.length - previewTypes.length;

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
          <ActivityIcon type={getDayIcon(day)} monochrome />
        </div>

        {/* DAY TITLE – shrinks on hover */}
        <span
          className="inline-flex items-center gap-2 rounded-full px-4 py-2 font-frank 
          text-7xl font-bold text-blue-700 transition-all duration-300 
          group-hover:text-black/80 group-hover:text-4xl group-hover:-translate-x-4"
        >
          Day {day.day}
        </span>

        {/* IMAGE ARRAY – hidden initially, slides up on hover */}
        <div className="flex overflow-x-auto gap-2 opacity-0 translate-y-2 transition-all duration-300 ease-out group-hover:opacity-100 group-hover:translate-y-0">
          {day.activities?.map((activity, index) => (
            <img
              key={activity.id ?? index}
              src={resolveImage(activity.image)} // try this
              alt={activity.name ?? "Activity"}
              className="h-12 w-12 flex-shrink-0 bg-red-400 object-cover"
            />
          ))}
        </div>

        {/* TITLE */}
        <h3
          className="mt-4 font-frank text-xl font-bold leading-tight text-neutral-950
        group-hover:text-xs group-hover:text-black/60 transition  duration-400"
        >
          {day.title}
        </h3>

        {/* BOTTOM */}
        <div className="mt-auto w-full">
          {previewTypes.length > 0 && (
            <div className="flex items-center gap-1.5">
              {previewTypes.map((type, i) => (
                <span
                  key={i}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 text-blue-600 ring-1 ring-blue-100"
                >
                  <ActivityIcon type={type} />
                </span>
              ))}

              {extraCount > 0 && (
                <span className="ml-1 font-bitter text-xs font-semibold text-neutral-400">
                  +{extraCount} more
                </span>
              )}
            </div>
          )}

          {day.meals && <MealBadges meals={day.meals} compact />}

          <div className="mt-4 flex items-center gap-2 font-bitter text-xs font-bold text-neutral-400 transition-colors duration-300 group-hover:text-blue-600">
            <span>Explore day</span>

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
   DAY STAGE (the slider)
============================================================ */
function DayStage({
  days,
  slides,
  dayStarts,
  current,
  routeTitle,
  onStep,
  onGoTo,
  registerScroller,
}) {
  const [reduceMotion] = useState(
    () =>
      typeof window !== "undefined" &&
      Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches),
  );

  const activeSlide = slides[current];
  const dayIndex = activeSlide?.dayIndex ?? 0;

  const mapsUrl = useMemo(() => getGoogleMapsUrl(routeTitle), [routeTitle]);

  /* Blue glow + scale pulse whenever the day changes (not on first open) */
  const [pulseKey, setPulseKey] = useState(0);
  const prevDayRef = useRef(dayIndex);

  useEffect(() => {
    if (prevDayRef.current === dayIndex) return;

    prevDayRef.current = dayIndex;

    if (!reduceMotion) {
      setPulseKey((key) => key + 1);
    }
  }, [dayIndex, reduceMotion]);

  if (!activeSlide) return null;

  const day = days[dayIndex];

  const dayStart = dayStarts[dayIndex];
  const dayEnd = (dayStarts[dayIndex + 1] ?? slides.length) - 1;

  const isLastOfDay = current === dayEnd;
  const hasMoreSlides = current < slides.length - 1;
  const mealsLabel = getMealsLabel(day.meals);

  const hintLabel = isLastOfDay
    ? `Continue to Day ${days[dayIndex + 1]?.day ?? ""}`
    : activeSlide.type === "overview"
      ? "Start the day"
      : "Next stop";

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <style>{`
        @keyframes tiDayPulse {
          0% {
            transform: scale(1);
            color: #0a0a0a;
            filter: drop-shadow(0 0 0 rgba(37, 99, 235, 0));
          }
          40% {
            transform: scale(1.22);
            color: #2563eb;
            filter:
              drop-shadow(0 0 8px rgba(37, 99, 235, 0.9))
              drop-shadow(0 0 22px rgba(59, 130, 246, 0.6));
          }
          100% {
            transform: scale(1);
            color: #0a0a0a;
            filter: drop-shadow(0 0 0 rgba(37, 99, 235, 0));
          }
        }

        @keyframes tiDayGlow {
          0% { opacity: 0; transform: scale(0.6); }
          35% { opacity: 1; transform: scale(1.1); }
          100% { opacity: 0; transform: scale(1.6); }
        }

        @keyframes tiStageFlash {
          0% { opacity: 0; }
          30% { opacity: 1; }
          100% { opacity: 0; }
        }

        .ti-day-pulse {
          animation: tiDayPulse 900ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .ti-day-glow {
          background: radial-gradient(
            closest-side,
            rgba(59, 130, 246, 0.55),
            rgba(59, 130, 246, 0)
          );
          animation: tiDayGlow 1000ms ease-out both;
        }

        .ti-stage-flash {
          box-shadow: inset 0 0 70px rgba(59, 130, 246, 0.35);
          animation: tiStageFlash 1000ms ease-out both;
        }
      `}</style>

      {/* DAY NAVIGATION */}
      <div className="shrink-0 border-b border-blue-100 bg-white px-4 py-1 shadow-sm sm:px-8 sm:py-2">
        <div className="relative flex items-center justify-center gap-3 py-1.5 sm:gap-4 sm:py-2">
          <button
            onClick={() => onGoTo(dayStarts[dayIndex - 1])}
            disabled={dayIndex === 0}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-blue-200 bg-white font-bitter text-sm font-bold text-blue-700 shadow-sm transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-30 sm:h-9 sm:w-9"
            aria-label="Previous day"
          >
            ←
          </button>

          <div className="relative flex flex-col items-center text-center">
            {/* GLOW (re-mounts on every day change) */}
            {pulseKey > 0 && (
              <span
                key={`glow-${pulseKey}`}
                aria-hidden="true"
                className="ti-day-glow pointer-events-none absolute -inset-x-6 -inset-y-3 rounded-full"
              />
            )}

            <h3
              key={`day-${pulseKey}`}
              className={`relative font-frank text-2xl font-bold leading-none text-neutral-950 sm:text-4xl ${
                pulseKey > 0 ? "ti-day-pulse" : ""
              }`}
            >
              Day {day.day}
            </h3>

            <p className="relative mt-1 flex max-w-[11.5rem] items-center justify-center gap-1.5 truncate font-bitter text-[10px] text-neutral-400 sm:max-w-none">
              <span className="font-bold uppercase tracking-[0.12em]">
                {dayIndex + 1} / {days.length}
              </span>

              {mealsLabel && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="truncate">Meals: {mealsLabel}</span>
                </>
              )}
            </p>
          </div>

          <button
            onClick={() => onGoTo(dayStarts[dayIndex + 1])}
            disabled={dayIndex === days.length - 1}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-blue-200 bg-white font-bitter text-sm font-bold text-blue-700 shadow-sm transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-30 sm:h-9 sm:w-9"
            aria-label="Next day"
          >
            →
          </button>
        </div>
      </div>

      {/* STAGE */}
      <div className="relative min-h-0 flex-1 overflow-hidden bg-gradient-to-b from-blue-50 via-white to-white">
        {/* soft glows */}
        <div className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-sky-200/50 blur-3xl" />
        <div className="pointer-events-none absolute -left-24 bottom-0 h-56 w-56 rounded-full bg-blue-100/60 blur-3xl" />

        {/* SLIDES */}
        {slides.map((slide, i) => {
          const offset = i - current;
          const isActive = offset === 0;
          const isNear = Math.abs(offset) <= 1;
          const slideDay = days[slide.dayIndex];

          return (
            <div
              key={`${slide.dayIndex}-${slide.type}-${slide.activityIndex ?? "overview"}`}
              aria-hidden={!isActive}
              className="absolute inset-0"
              style={{
                transform: `translate3d(0, ${offset * 100}%, 0)`,
                opacity: isActive ? 1 : 0,
                visibility: isNear ? "visible" : "hidden",
                pointerEvents: isActive ? "auto" : "none",
                willChange: "transform, opacity",
                transition: reduceMotion
                  ? "none"
                  : `transform ${SLIDE_MS}ms ${SLIDE_EASE}, opacity ${Math.round(
                      SLIDE_MS * 0.7,
                    )}ms ease, visibility 0s linear ${isNear ? 0 : SLIDE_MS}ms`,
              }}
            >
              <div
                ref={(el) => registerScroller(i, el)}
                className="h-full overflow-y-auto overscroll-contain"
                style={{
                  touchAction: "pan-y",
                  WebkitOverflowScrolling: "touch",
                }}
              >
                {slide.type === "overview" ? (
                  <OverviewSlide day={slideDay} mapsUrl={mapsUrl} />
                ) : (
                  <ActivitySlide
                    activity={slideDay.activities[slide.activityIndex]}
                    activityIndex={slide.activityIndex}
                    activityCount={slide.activityCount}
                  />
                )}
              </div>
            </div>
          );
        })}

        {/* DAY-CHANGE FLASH */}
        {pulseKey > 0 && (
          <span
            key={`flash-${pulseKey}`}
            aria-hidden="true"
            className="ti-stage-flash pointer-events-none absolute inset-0 z-20"
          />
        )}

        {/* PROGRESS RAIL (this day only) */}
        <div className="pointer-events-none absolute inset-y-0 right-1.5 z-10 flex items-center sm:right-4">
          <div className="pointer-events-auto flex flex-col items-center rounded-full bg-white/80 px-0.5 py-1 shadow-sm ring-1 ring-blue-100 backdrop-blur">
            {Array.from({ length: dayEnd - dayStart + 1 }, (_, n) => {
              const index = dayStart + n;
              const active = index === current;

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => onGoTo(index)}
                  aria-label={`Go to step ${n + 1}`}
                  aria-current={active ? "step" : undefined}
                  className="group p-1"
                >
                  <span
                    className={`block rounded-full transition-all duration-300 ${
                      active
                        ? "h-6 w-1.5 bg-blue-600"
                        : "h-1.5 w-1.5 bg-blue-200 group-hover:bg-blue-400"
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* NEXT HINT (with a fade so text never clashes with the pill) */}
        {hasMoreSlides && (
          <>
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-14 bg-gradient-to-t from-white via-white/85 to-transparent"
            />

            <div className="pointer-events-none absolute inset-x-0 bottom-2 z-10 flex justify-center">
              <button
                type="button"
                onClick={() => onStep(1)}
                className="pointer-events-auto inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-white px-3 py-1.5 font-bitter text-[10px] font-bold text-blue-700 shadow-md transition hover:-translate-y-0.5 sm:gap-2 sm:px-4 sm:py-2 sm:text-[11px]"
              >
                <span>{hintLabel}</span>
                <span aria-hidden="true" className="animate-bounce">
                  ↓
                </span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   OVERVIEW SLIDE  (route -> stay)
============================================================ */
function OverviewSlide({ day, mapsUrl }) {
  const routeStops = day.route
    ? day.route
        .split("→")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  const hasRoute = routeStops.length > 0;
  const hasStay = Boolean(day.accommodation?.title);

  const accommodationImage = day.accommodation?.image
    ? resolveImage(day.accommodation.image)
    : null;

  if (!hasRoute && !hasStay) {
    return (
      <div className="flex h-full items-center justify-center px-8 text-center font-bitter text-sm text-neutral-500">
        Details for this day are coming soon.
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col justify-center px-4 pb-20 pt-5 pr-9 sm:px-8 sm:pb-16 sm:pt-8 sm:pr-14">
      <div className="space-y-4 pl-10">
        {/* ROUTE */}
        {hasRoute && (
          <section className="relative">
            <FlowNode>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="M12 21s-7-5.25-7-11a7 7 0 1 1 14 0c0 5.75-7 11-7 11Z" />
                <circle cx="12" cy="10" r="2.5" />
              </svg>
            </FlowNode>

            {hasStay && (
              <span
                aria-hidden="true"
                className="absolute -bottom-4 -left-6 top-[52px] w-px bg-blue-200"
              />
            )}

            <div className="rounded-2xl border border-blue-100 bg-white/80 p-4 shadow-[0_10px_30px_rgba(37,99,235,0.06)] backdrop-blur sm:p-5">
              <span className="font-bitter text-[10px] font-bold uppercase tracking-[0.18em] text-blue-500">
                The route
              </span>

              <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-2">
                {routeStops.map((stop, i) => {
                  const isLast =
                    i === routeStops.length - 1 && routeStops.length > 1;

                  return (
                    <React.Fragment key={`${stop}-${i}`}>
                      {i > 0 && (
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-3.5 w-3.5 text-blue-300"
                          aria-hidden="true"
                        >
                          <path d="m9 6 6 6-6 6" />
                        </svg>
                      )}

                      <span
                        className={`rounded-full px-3 py-1.5 font-bitter text-xs font-semibold ${
                          isLast
                            ? "bg-blue-600 text-white shadow-sm"
                            : "bg-blue-50 text-neutral-700 ring-1 ring-blue-100"
                        }`}
                      >
                        {stop}
                      </span>
                    </React.Fragment>
                  );
                })}
              </div>

              {mapsUrl && (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-neutral-900 px-4 py-2 font-bitter text-xs font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-neutral-800 hover:shadow-md"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                  >
                    <path d="M9 20l-5.447-2.724A1 1 0 0 1 3 16.382V5.618a1 1 0 0 1 1.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0 0 21 18.382V7.618a1 1 0 0 0-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  Open full route in Google Maps
                </a>
              )}
            </div>
          </section>
        )}

        {/* STAY */}
        {hasStay && (
          <section className="relative">
            <FlowNode>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="M4 20V8l8-5 8 5v12" />
                <path d="M9 20v-5h6v5" />
              </svg>
            </FlowNode>

            {hasRoute && (
              <span
                aria-hidden="true"
                className="absolute -left-6 -top-4 h-9 w-px bg-blue-200"
              />
            )}

            <div className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-[0_14px_40px_rgba(37,99,235,0.08)] sm:flex">
              {accommodationImage && (
                <div className="h-36 w-full shrink-0 sm:h-auto sm:w-52">
                  <img
                    src={accommodationImage}
                    alt={day.accommodation.title}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                </div>
              )}

              <div className="min-w-0 p-5 sm:p-6">
                <span className="font-bitter text-[10px] font-bold uppercase tracking-[0.18em] text-blue-500">
                  Where you'll stay
                </span>

                <h4 className="mt-1 font-frank text-xl font-bold leading-tight text-neutral-950 sm:text-2xl">
                  {day.accommodation.title}
                </h4>

                {day.accommodation.location && (
                  <p className="mt-1 font-bitter text-sm text-neutral-500">
                    {day.accommodation.location}
                  </p>
                )}

                {day.accommodation.availabilityNote && (
                  <p className="mt-3 font-bitter text-sm leading-6 text-neutral-600">
                    {day.accommodation.availabilityNote}
                  </p>
                )}

                {day.accommodation.options?.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {day.accommodation.options.map((option, index) => (
                      <span
                        key={`${option}-${index}`}
                        className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 font-bitter text-xs font-semibold text-neutral-700 ring-1 ring-blue-100"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                        {option}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   ACTIVITY SLIDE
============================================================ */
function ActivitySlide({ activity, activityIndex, activityCount }) {
  const image = getActivityImage(activity);

  return (
    <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col justify-center gap-4 px-4 pb-20 pt-4 pr-9 sm:gap-5 sm:px-8 sm:pb-16 sm:pt-6 sm:pr-14">
      {image && (
        <div className="shrink-0 overflow-hidden rounded-2xl border border-blue-100 bg-neutral-100 shadow-[0_18px_50px_rgba(37,99,235,0.12)] sm:rounded-[1.5rem]">
          <img
            src={image}
            alt={activity.title}
            loading="lazy"
            decoding="async"
            className="h-[22dvh] max-h-72 min-h-[7rem] w-full object-cover sm:h-[30vh] sm:max-h-80 sm:min-h-[10rem]"
          />
        </div>
      )}

      <div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-bitter text-[10px] font-bold uppercase tracking-[0.18em] text-blue-500">
            Stop {activityIndex + 1} of {activityCount}
          </span>

          {activity.optional && (
            <span className="rounded-full bg-blue-50 px-2 py-1 font-bitter text-[9px] font-bold uppercase tracking-[0.08em] text-blue-600">
              Optional
            </span>
          )}
        </div>

        <div className="mt-2.5 flex items-center gap-3 sm:mt-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 ring-1 ring-blue-100 sm:h-12 sm:w-12">
            <ActivityIcon type={activity.type} />
          </span>

          <h4 className="font-frank text-xl font-bold leading-tight text-neutral-950 sm:text-3xl">
            {activity.title}
          </h4>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 sm:mt-4">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 font-bitter text-xs font-bold text-neutral-800 shadow-sm ring-1 ring-blue-100">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-3.5 w-3.5 text-blue-500"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="8" />
              <path d="M12 8v4l2.5 2" />
            </svg>
            {activity.time || "Flexible"}
          </span>

          {activity.duration && (
            <span className="rounded-full bg-blue-50 px-3 py-1.5 font-bitter text-xs font-semibold text-neutral-600 ring-1 ring-blue-100">
              {activity.duration}
            </span>
          )}
        </div>

        {activity.description && (
          <p className="mt-3 font-bitter text-[13px] leading-6 text-neutral-600 sm:mt-4 sm:text-base sm:leading-7">
            {activity.description}
          </p>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   MEAL BADGES
============================================================ */
function MealBadges({ meals, compact = false }) {
  const available = [];

  if (meals.breakfast) {
    available.push("Breakfast");
  }

  if (meals.lunch) {
    available.push("Lunch");
  }

  if (meals.dinner) {
    available.push("Dinner");
  }

  if (!available.length) {
    return null;
  }

  return (
    <div className={`flex flex-wrap gap-2 ${compact ? "mt-3" : ""}`}>
      {available.map((meal) => (
        <span
          key={meal}
          className={`rounded-full border border-blue-100 bg-white font-bitter text-[10px] font-bold text-neutral-600 shadow-sm ${
            compact ? "px-2.5 py-1" : "px-3 py-1.5"
          }`}
        >
          {meal}
        </span>
      ))}
    </div>
  );
}

/* ============================================================
   DAY ICON
============================================================ */
function getDayIcon(day) {
  const types = day.activities?.map((a) => a.type).filter(Boolean) || [];

  if (types.includes("safari")) {
    return "safari";
  }

  if (types.includes("wine")) {
    return "wine";
  }

  if (types.includes("adventure")) {
    return "adventure";
  }

  if (types.includes("wildlife")) {
    return "wildlife";
  }

  if (types.includes("scenic")) {
    return "scenic";
  }

  return "transfer";
}

function FlowNode({ children }) {
  return (
    <span className="absolute -left-10 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-white text-blue-600 shadow-sm ring-1 ring-blue-200">
      {children}
    </span>
  );
}

export default TourItinerary;