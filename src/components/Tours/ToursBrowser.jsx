/*
===============================================================================
TOURSBROWSER QUICK SCAN REFERENCE
===============================================================================

PURPOSE
- Displays Cape Frontier tours by category.
- Mobile/tablet: category navbar pins above the tour cards.
- Desktop: category navbar stays on the left.
- Each category uses a pinned card deck where tours transition one after another.
- Cards are intentionally NOT stretched to fill the full viewport so more content
  can be added underneath later.

-------------------------------------------------------------------------------
1) IMPORTS
-------------------------------------------------------------------------------
- React hooks:
  useRef, useEffect, useLayoutEffect, useState, useCallback, useMemo
- createPortal:
  used for the decked details overlay modal.
- GSAP / ScrollTrigger / ScrollToPlugin:
  used for card pinning, scroll snapping, reveal animations, and scroll-to-category.
- useNavigate:
  routes users to the full tour page or booking section.
- tours data:
  comes from /src/data/tours.js and drives all categories/cards.

-------------------------------------------------------------------------------
2) TOP CONSTANTS + NAV OFFSETS
-------------------------------------------------------------------------------
- DESKTOP_DECK_PIN_TOP_OFFSET:
  desktop card deck pin start offset.
- MOBILE_NAV_TOP_OFFSET:
  base mobile nav offset.
- getMobileNavTopOffset():
  returns different top offsets for phone/tablet/large screens.
- getDeckPinTopOffset():
  calculates how far below the pinned navbar the card deck should start.
  This prevents cards from sliding underneath the mobile/tablet navbar.
  mobileCardGap adds extra breathing room below the navbar.

-------------------------------------------------------------------------------
3) CATEGORY DEFINITIONS
-------------------------------------------------------------------------------
- TYPE_LABELS:
  maps tour type ids to readable labels.
- CATEGORY_LABELS:
  maps tour modifiers to readable labels.
- browseSections:
  controls the category navbar:
  Adrenaline, Hiking, Historical, Packages.
  Wine routes are grouped under Packages.

-------------------------------------------------------------------------------
4) TEXT + DATA HELPERS
-------------------------------------------------------------------------------
- toText():
  safely converts strings, numbers, arrays, and objects into readable text.
- getLocationText():
  extracts a readable location from tour.location or stops.
- getStopText():
  extracts stop names for previews.
- getCategoryText() / getTypeText():
  returns readable labels for each tour.
- getGroupDiscountText(), getCancellationText(), getWeatherText():
  builds trust/policy copy for side pills.

-------------------------------------------------------------------------------
5) IMAGE FALLBACK HELPERS
-------------------------------------------------------------------------------
- uniqueList():
  removes duplicate image paths.
- getImagePathAliases():
  tries alternate known folder names when an image path fails.
  Example: paragliding / para-gliding, langa / langa-township.
- getTourImageSources():
  builds fallback source list for a tour image.
- getReviewAvatarSources():
  builds fallback source list for review avatars.
- FallbackImage:
  reusable image component that tries multiple sources before hiding/fallback.

-------------------------------------------------------------------------------
6) SMALL UI COMPONENTS
-------------------------------------------------------------------------------
- ReviewAvatars:
  stacked avatar bubbles used inside tour cards.
- StarRating:
  normal SVG stars for ratings.
- FloatingTooltip:
  hover tooltip used around the review area.
- TickItem / PreviewSection:
  reusable blocks for the learn-more drawer previews.
- GroupDiscountPreview / PickupPreview / StopsPreview:
  preview sections shown in the details drawer.

-------------------------------------------------------------------------------
7) LEARN MORE DRAWER
-------------------------------------------------------------------------------
- LearnMoreDrawer:
  expandable detail area for non-decked cards.
  Shows:
  tour description, highlights, pickup, group discount, images, included items,
  stops, and need-to-know items.
- DeckDetailsOverlay:
  when a card is inside the pinned deck, details open in a portal overlay instead
  of expanding inside the pinned card stack.

-------------------------------------------------------------------------------
8) TOUR CARD
-------------------------------------------------------------------------------
- TourCard:
  the main visual card for each tour.
  Handles:
  - image panel
  - price/currency conversion
  - location + duration cards
  - review preview area
  - details button
  - request trip button
  - route navigation to /tours/:slug and /tours/:slug#booking

Important refs:
- cardRef: whole card
- imgRef: image being animated
- contentRef: right-side content animation
- priceRef: price reveal
- review refs: open/close review animation
- chevronRef: details arrow rotation

Important state:
- open: details drawer/overlay state
- reviewOpen: expands review preview
- currency: selected currency display

-------------------------------------------------------------------------------
9) CATEGORY SECTION / PINNED CARD DECK
-------------------------------------------------------------------------------
- CategorySection:
  one full category group.
  It creates a pinned deck of cards for that category.

Important logic:
- cards are positioned absolute inside pinRef.
- each card is stacked by z-index.
- ScrollTrigger pins pinRef.
- timeline clips the previous card upward and reveals the next card.
- snap locks to full-opacity card states so text/images do not stop mid-fade.
- onSnapComplete hard-sets the active image/content to the clean final state.

Important note:
- setPinHeight() uses natural card height, not remaining viewport height.
  This keeps cards from stretching and leaves room for future content underneath.

-------------------------------------------------------------------------------
10) DESKTOP SIDE PILLS
-------------------------------------------------------------------------------
- DesktopTourSidePills:
  visible on xl screens only.
  Shows:
  - group discount / save more
  - cancellation summary
  - weather planning note
- These are outside the card but tied to the active stacked card.

-------------------------------------------------------------------------------
11) CATEGORY NAVBAR
-------------------------------------------------------------------------------
- BrowseButton:
  each category tab in the nav.
- CategoryProgressDots:
  small progress dots showing current tour index within active category.

Mobile/tablet navbar:
- mobileNavRef is pinned with ScrollTrigger.
- mobileNavScrollerRef allows horizontal scrolling.
- mobileCategoryItemRefs stores each category tab.
- active category auto-scrolls into view so Historical/Packages do not sit off-screen.
- mobile heading text was removed for compactness.

Desktop navbar:
- railSlotRef and railRef control the left-side rail.
- progress is kept inside the desktop rail to avoid overlapping cards.

-------------------------------------------------------------------------------
12) MAIN TOURSBROWSER COMPONENT
-------------------------------------------------------------------------------
- visibleSections:
  filters tours into the category groups.
- currentSection/currentTourIndex:
  tracks current category and active card number.
- activateCategory():
  updates active category when nav is clicked.
- handleTourProgress():
  updates active category and active tour while scrolling.
- scrollTo():
  scrolls to category section with the correct navbar/card offset.

-------------------------------------------------------------------------------
MAINTENANCE NOTES
-------------------------------------------------------------------------------
- Do not reintroduce full viewport card stretching unless specifically requested.
- Keep mobile navbar pinning logic stable; it is sensitive to ScrollTrigger timing.
- When changing card heights, run ScrollTrigger.refresh().
- If images show black bars, avoid yPercent image movement inside dark panels.
- Prefer data from tours.js and reviews.js instead of hardcoding tour/review content.

===============================================================================
*/

import {
  useRef,
  useEffect,
  useLayoutEffect,
  useState,
  useCallback,
  useMemo,
  forwardRef,
} from "react";
import { createPortal } from "react-dom";
import { gsap } from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useNavigate } from "react-router-dom";
import { tours, TOUR_TYPES, TOUR_MODIFIERS, FX_RATES } from "/src/data/tours.js";
import reviews from "/src/data/reviews.js";

gsap.registerPlugin(ScrollToPlugin, ScrollTrigger);

const DESKTOP_DECK_PIN_TOP_OFFSET = 104;
const MOBILE_NAV_TOP_OFFSET = 48;

const getMobileNavTopOffset = () => {
  if (typeof window === "undefined") return MOBILE_NAV_TOP_OFFSET;
  return window.innerWidth < 640 ? 46 : window.innerWidth < 1024 ? 58 : 72;
};

const getDeckPinTopOffset = () => {
  if (typeof window === "undefined") return DESKTOP_DECK_PIN_TOP_OFFSET;

  if (window.innerWidth < 1280) {
    const nav = document.querySelector("[data-mobile-category-nav]");
    const mobileCardGap = window.innerWidth < 768 ? 28 : 16;
    return getMobileNavTopOffset() + (nav?.offsetHeight || 118) + mobileCardGap;
  }

  return DESKTOP_DECK_PIN_TOP_OFFSET;
};

const TYPE_LABELS = {
  [TOUR_TYPES.ADRENALINE]: "Adrenaline",
  [TOUR_TYPES.HIKING]: "Guided Hike",
  [TOUR_TYPES.HISTORICAL]: "Historical Tour",
  [TOUR_TYPES.PACKAGES]: "Package Tour",
  [TOUR_TYPES.WINE_ROUTES]: "Wine Route",
};

const CATEGORY_LABELS = {
  [TOUR_MODIFIERS.HALF_DAY]: "Half Day",
  [TOUR_MODIFIERS.FULL_DAY]: "Full Day",
  [TOUR_MODIFIERS.PRIVATE]: "Private",
  [TOUR_MODIFIERS.PACKAGE]: "Package",
  [TOUR_MODIFIERS.CUSTOM]: "Custom",
};

const browseSections = [
  {
    id: TOUR_TYPES.ADRENALINE,
    label: "Adrenaline",
    icon: "/icons/browseTour/flag.png",
    match: (tour) => tour.type === TOUR_TYPES.ADRENALINE,
  },
  {
    id: TOUR_TYPES.HIKING,
    label: "Hiking",
    icon: "/icons/browseTour/leisure.png",
    match: (tour) => tour.type === TOUR_TYPES.HIKING,
  },
  {
    id: TOUR_TYPES.HISTORICAL,
    label: "Historical",
    icon: "/icons/browseTour/present.png",
    match: (tour) => tour.type === TOUR_TYPES.HISTORICAL,
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

const reviewProfiles = [
  {
    name: "Olivia",
    initials: "OR",
    image: "/images/reviews/profile-photos/1.webp",
  },
  {
    name: "Aisha",
    initials: "AK",
    image: "/images/reviews/profile-photos/2.webp",
  },
  {
    name: "Daniel",
    initials: "DM",
    image: "/images/reviews/profile-photos/3.webp",
  },
];

function toText(value, fallback = "") {
  if (value == null) return fallback;
  if (typeof value === "string" || typeof value === "number") return String(value);

  if (Array.isArray(value)) {
    return value
      .map((item) => toText(item))
      .filter(Boolean)
      .join(" · ");
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

function getLocationText(tour) {
  if (typeof tour.location === "string") return tour.location;

  if (Array.isArray(tour.location)) {
    const locations = tour.location.map((item) => toText(item)).filter(Boolean);
    return locations.length ? locations.join(" · ") : "Cape Town";
  }

  if (tour.location && typeof tour.location === "object") {
    return toText(tour.location, "Cape Town");
  }

  const stopNames = tour.stops?.map((stop) => toText(stop?.name)).filter(Boolean);

  if (stopNames?.length > 1) return `${stopNames.length} Cape Town stops`;
  if (stopNames?.length === 1) return stopNames[0];

  return "Cape Town";
}

function getStopText(stop) {
  return toText(stop?.name || stop, "Tour stop");
}

function getCategoryText(tour) {
  return CATEGORY_LABELS[tour.category] || toText(tour.category, "Tour");
}

function getTypeText(tour) {
  return TYPE_LABELS[tour.type] || toText(tour.type, "Guided Tour");
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
    if (path.includes(from)) {
      aliases.push(path.replace(from, to));
    }
  });

  return aliases;
}

function getTourImageSources(tour) {
  const baseSources = [
    tour?.image,
    ...(Array.isArray(tour?.images) ? tour.images : []),
    tour?.cover,
    tour?.img,
  ];

  return uniqueList(baseSources.flatMap(getImagePathAliases));
}

function getReviewAvatarSources(review) {
  const avatar = toText(review?.avatar);
  const match = avatar.match(/(\d+)\.(webp|png|jpg|jpeg)$/i);
  const id = review?.id || match?.[1] || 1;

  return uniqueList([
    `/images/content/reviews/profile-photos/${id}.webp`,
    `/images/reviews/profile-photos/${id}.webp`,
    avatar,
    "/images/content/reviews/profile-photos/1.webp",
    "/images/reviews/profile-photos/1.webp",
  ]);
}

const FallbackImage = forwardRef(function FallbackImage(
  { sources = [], onFinalError, onError, ...props },
  ref,
) {
  const cleanSources = uniqueList(Array.isArray(sources) ? sources : [sources]);
  const [sourceIndex, setSourceIndex] = useState(0);
  const src = cleanSources[sourceIndex] || "";

  useEffect(() => {
    setSourceIndex(0);
  }, [cleanSources.join("|")]);

  return (
    <img
      ref={ref}
      {...props}
      src={src}
      onError={(event) => {
        onError?.(event);

        if (sourceIndex < cleanSources.length - 1) {
          setSourceIndex((index) => index + 1);
          return;
        }

        onFinalError?.(event);
      }}
    />
  );
});


function normalizeReviewText(value, fallback = "") {
  return toText(value, fallback).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function getReviewAvatar(review) {
  return getReviewAvatarSources(review)[0];
}

function getInitials(name = "Guest") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function getReviewsForTour(tour) {
  const allReviews = Array.isArray(reviews) ? reviews : [];
  const tourTitle = normalizeReviewText(tour?.title);
  const tourType = normalizeReviewText(getTypeText(tour));
  const tourCategory = normalizeReviewText(getCategoryText(tour));

  const exactMatches = allReviews.filter((review) => {
    const reviewTour = normalizeReviewText(review?.tour);
    const reviewTitle = normalizeReviewText(review?.title);

    return (
      (tourTitle && reviewTour && (reviewTour.includes(tourTitle) || tourTitle.includes(reviewTour))) ||
      (tourTitle && reviewTitle && reviewTitle.includes(tourTitle.split(" ")[0]))
    );
  });

  if (exactMatches.length >= 2) return exactMatches.slice(0, 4);
  if (exactMatches.length === 1) {
    const otherMatches = allReviews.filter((review) => review.id !== exactMatches[0].id).slice(0, 3);
    return [...exactMatches, ...otherMatches].slice(0, 4);
  }

  const relatedMatches = allReviews.filter((review) => {
    const haystack = normalizeReviewText(`${review?.tour || ""} ${review?.title || ""} ${review?.desc || ""}`);

    return (
      (tourType && haystack.includes(tourType.split(" ")[0])) ||
      (tourCategory && haystack.includes(tourCategory.split(" ")[0])) ||
      haystack.includes("cape town")
    );
  });

  const fallbackStart = Math.abs(Number(tour?.id || 0)) % Math.max(allReviews.length, 1);
  const fallback = [...allReviews.slice(fallbackStart), ...allReviews.slice(0, fallbackStart)];

  return (relatedMatches.length ? relatedMatches : fallback).slice(0, 4);
}

const reviewPastelClasses = [
  "bg-green-200/78",
  "bg-blue-100/78",
  "bg-emerald-100/82",
];

function ReviewMiniReplaceCard({ tour, tourReviews, slotIndex = 0, className = "" }) {
  const cardRef = useRef(null);
  const wordsRef = useRef(null);
  const currentIndexRef = useRef(slotIndex);
  const isAnimatingRef = useRef(false);
  const [activeIndex, setActiveIndex] = useState(slotIndex);
  const [toneIndex, setToneIndex] = useState(slotIndex);

  const activeReview =
    tourReviews[activeIndex % Math.max(tourReviews.length, 1)] || {
      title: "Smooth Cape Town experience",
      desc: "Organised, friendly, and easy to enjoy from pickup to the final stop.",
      name: "Cape Frontier guest",
      country: "Traveller",
      date: "2026",
      rating: 4.8,
      tour: tour?.title || "Cape Town tour",
      verified: true,
      id: slotIndex + 1,
    };

  const replaceReview = useCallback(() => {
    if (!wordsRef.current || !cardRef.current || tourReviews.length <= 1 || isAnimatingRef.current) return;

    isAnimatingRef.current = true;

    const nextIndex = (currentIndexRef.current + 3) % tourReviews.length;
    const wordParts = wordsRef.current.querySelectorAll("[data-review-word-part]");

    const tl = gsap.timeline({
      defaults: {
        overwrite: "auto",
      },
      onComplete: () => {
        isAnimatingRef.current = false;
      },
    });

    tl.to(cardRef.current, {
      y: -2,
      scale: 0.992,
      autoAlpha: 0.86,
      duration: 0.18,
      ease: "power2.inOut",
    })
      .to(
        wordParts,
        {
          y: -12,
          autoAlpha: 0,
          filter: "blur(2px)",
          stagger: 0.022,
          duration: 0.18,
          ease: "power2.in",
        },
        0,
      )
      .add(() => {
        currentIndexRef.current = nextIndex;
        setActiveIndex(nextIndex);
        setToneIndex((prev) => (prev + 1) % reviewPastelClasses.length);
      })
      .set(wordParts, {
        y: 12,
        autoAlpha: 0,
        filter: "blur(2px)",
      })
      .to(cardRef.current, {
        y: 0,
        scale: 1,
        autoAlpha: 1,
        duration: 0.24,
        ease: "power3.out",
      })
      .to(
        wordParts,
        {
          y: 0,
          autoAlpha: 1,
          filter: "blur(0px)",
          stagger: 0.03,
          duration: 0.23,
          ease: "power3.out",
        },
        "-=0.18",
      );
  }, [tourReviews.length]);

  useEffect(() => {
    if (tourReviews.length <= 1) return undefined;

    const interval = window.setInterval(replaceReview, 5600 + slotIndex * 520);

    return () => window.clearInterval(interval);
  }, [replaceReview, tourReviews.length, slotIndex]);

  return (
    <article
      ref={cardRef}
      className={`relative min-w-0 overflow-hidden rounded-[0.95rem] px-3 py-2.5 shadow-[0_8px_20px_rgba(22,101,52,0.07)] ring-1 ring-white/55 transition-colors duration-500 ${reviewPastelClasses[toneIndex]} ${className}`}
      data-tour-review-card
    >
      <div className="pointer-events-none absolute -right-8 -top-8 h-20 w-20 rounded-full bg-white/35 blur-2xl" />

      <div ref={wordsRef} className="relative z-10">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <div className="relative grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-full bg-white/80 text-[9px] font-bold text-green-900 shadow-sm">
              <span>{getInitials(activeReview.name)}</span>
              <FallbackImage
                sources={getReviewAvatarSources(activeReview)}
                alt={activeReview.name || "Guest"}
                className="absolute inset-0 h-full w-full object-cover"
                loading="lazy"
                decoding="async"
                onFinalError={(event) => {
                  event.currentTarget.style.display = "none";
                }}
              />
            </div>

            <div className="min-w-0">
              <p
                data-review-word-part
                className="line-clamp-1 font-frank text-base font-bold leading-none text-green-950"
              >
                {toText(activeReview.title, "Guest experience")}
              </p>

              <p
                data-review-word-part
                className="mt-1 truncate font-bitter text-[8px] font-black uppercase tracking-[0.13em] text-green-900/45"
              >
                {toText(activeReview.tour, tour?.title || "Cape Frontier tour")}
              </p>
            </div>
          </div>

          <p
            data-review-word-part
            className="shrink-0 rounded-full bg-white/75 px-2 py-1 font-frank text-sm font-bold leading-none text-green-950 shadow-sm"
          >
            {Number(activeReview.rating || 4.8).toFixed(1)}
          </p>
        </div>

        <div className="mt-2 flex items-center justify-between gap-2 border-t border-green-900/10 pt-2">
          <div className="min-w-0">
            <p
              data-review-word-part
              className="truncate font-bitter text-[10px] font-bold text-green-950"
            >
              {toText(activeReview.name, "Cape Frontier guest")}
              {activeReview.country ? ` · ${activeReview.country}` : ""}
            </p>
          </div>

          <button
            type="button"
            onClick={replaceReview}
            className="shrink-0 rounded-full bg-white px-2.5 py-1 font-bitter text-[8px] font-black uppercase tracking-[0.12em] text-green-950 shadow-sm transition hover:-translate-y-0.5"
          >
            Click to see review
          </button>
        </div>
      </div>
    </article>
  );
}

function ReviewFlipCard({ tour }) {
  const wrapRef = useRef(null);
  const tourReviews = useMemo(() => getReviewsForTour(tour), [tour]);

  useLayoutEffect(() => {
    if (!wrapRef.current) return undefined;

    const ctx = gsap.context(() => {
      const reviewCards = wrapRef.current.querySelectorAll("[data-tour-review-card]");
      const words = wrapRef.current.querySelectorAll("[data-review-word-part]");

      gsap.set(words, {
        autoAlpha: 0,
        y: 10,
      });

      gsap.fromTo(
        reviewCards,
        {
          autoAlpha: 0,
          y: 10,
          scale: 0.992,
        },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          stagger: 0.06,
          duration: 0.3,
          ease: "power3.out",
          scrollTrigger: {
            trigger: wrapRef.current,
            start: "top 94%",
            once: true,
            onEnter: () => {
              gsap.to(words, {
                autoAlpha: 1,
                y: 0,
                stagger: 0.016,
                duration: 0.22,
                ease: "power3.out",
              });
            },
          },
        },
      );
    }, wrapRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={wrapRef}
      className="relative z-10 mt-2 grid grid-cols-1 gap-2 overflow-visible pb-0 md:grid-cols-2 lg:grid-cols-3"
    >
      {[0, 1, 2].map((slotIndex) => (
        <ReviewMiniReplaceCard
          key={`${tour?.id || tour?.slug || "tour"}-review-face-${slotIndex}`}
          tour={tour}
          tourReviews={tourReviews}
          slotIndex={slotIndex}
          className={
            slotIndex === 0
              ? ""
              : slotIndex === 1
                ? "hidden md:block"
                : "hidden lg:block"
          }
        />
      ))}
    </div>
  );
}


function ReviewAvatars() {
  return (
    <div className="flex -space-x-2">
      {reviewProfiles.map((profile) => (
        <div
          key={profile.name}
          className="relative h-7 w-7 rounded-full border-2 border-white bg-green-100 flex items-center justify-center overflow-hidden shadow-sm"
          title={profile.name}
        >
          <span className="text-[10px] font-bold text-green-800">
            {profile.initials}
          </span>

          <img
            src={profile.image}
            alt={profile.name}
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
            decoding="async"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        </div>
      ))}
    </div>
  );
}

function StarRating({ count = 0 }) {
  return (
    <span className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill={i < count ? "#f59e0b" : "none"}
          stroke={i < count ? "#f59e0b" : "#d1d5db"}
          strokeWidth="2"
        >
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
        </svg>
      ))}
    </span>
  );
}

function FloatingTooltip({
  children,
  text = "Review",
  badgeText = "Open",
  position = "top",
  followCursor = true,
  className = "",
}) {
  const tooltipRef = useRef(null);
  const xTo = useRef(null);
  const yTo = useRef(null);

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-3",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-3",
    left: "right-full top-1/2 -translate-y-1/2 mr-3",
    right: "left-full top-1/2 -translate-y-1/2 ml-3",
  };

  const arrowClasses = {
    top: "left-1/2 top-full -translate-x-1/2 border-x-8 border-x-transparent border-t-8 border-t-blue-600",
    bottom: "left-1/2 bottom-full -translate-x-1/2 border-x-8 border-x-transparent border-b-8 border-b-blue-600",
    left: "left-full top-1/2 -translate-y-1/2 border-y-8 border-y-transparent border-l-8 border-l-blue-600",
    right: "right-full top-1/2 -translate-y-1/2 border-y-8 border-y-transparent border-r-8 border-r-blue-600",
  };

  useLayoutEffect(() => {
    if (!tooltipRef.current || !followCursor) return;

    gsap.set(tooltipRef.current, {
      x: 18,
      y: 18,
      scale: 0.96,
      transformOrigin: "left top",
    });

    xTo.current = gsap.quickTo(tooltipRef.current, "x", {
      duration: 0.24,
      ease: "power3.out",
    });

    yTo.current = gsap.quickTo(tooltipRef.current, "y", {
      duration: 0.24,
      ease: "power3.out",
    });

    return () => {
      xTo.current = null;
      yTo.current = null;
    };
  }, [followCursor]);

  const handleMouseMove = (e) => {
    if (!followCursor || !xTo.current || !yTo.current) return;

    const rect = e.currentTarget.getBoundingClientRect();

    xTo.current(e.clientX - rect.left + 18);
    yTo.current(e.clientY - rect.top + 18);
  };

  const handleMouseEnter = () => {
    if (!followCursor || !tooltipRef.current) return;

    gsap.to(tooltipRef.current, {
      autoAlpha: 1,
      scale: 1,
      duration: 0.18,
      ease: "power2.out",
    });
  };

  const handleMouseLeave = () => {
    if (!followCursor || !tooltipRef.current) return;

    gsap.to(tooltipRef.current, {
      autoAlpha: 0,
      scale: 0.96,
      duration: 0.16,
      ease: "power2.inOut",
    });
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative group/tooltip ${className}`}
    >
      {children}

      <div
        ref={tooltipRef}
        className={`
          pointer-events-none absolute z-50
          ${followCursor
            ? "left-0 top-0 opacity-0"
            : positionClasses[position] || positionClasses.top
          }
          ${followCursor
            ? ""
            : "opacity-0 translate-y-1 scale-95 group-hover/tooltip:opacity-100 group-hover/tooltip:translate-y-0 group-hover/tooltip:scale-100 group-focus-within/tooltip:opacity-100 group-focus-within/tooltip:translate-y-0 group-focus-within/tooltip:scale-100 transition-all duration-300 ease-out"
          }
        `}
      >
        <div className="relative flex items-center gap-2 rounded-full bg-blue-600 px-3 py-1.5 shadow-lg shadow-blue-600/20 border border-white/20">
          <span className="h-2 w-2 rounded-full bg-green-200 animate-pulse" />

          <span className="text-[11px] font-bitter font-semibold text-white whitespace-nowrap">
            {text}
          </span>

          <span className="rounded-full bg-green-200 px-2 py-0.5 text-[10px] font-bitter font-bold text-green-950">
            {badgeText}
          </span>

          {!followCursor && (
            <span
              className={`absolute ${arrowClasses[position] || arrowClasses.top}`}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function TickItem({ text }) {
  if (!text) return null;

  return (
    <div className="flex gap-3 rounded-2xl bg-white border border-black/5 px-4 py-3">
      <span className="h-6 w-6 rounded-full bg-green-200 text-green-950 flex items-center justify-center text-xs font-bold shrink-0">
        ✓
      </span>

      <p className="text-sm text-neutral-650 font-bitter leading-snug">{text}</p>
    </div>
  );
}

function PreviewSection({ eyebrow, title, children }) {
  return (
    <section className="rounded-3xl bg-neutral-50/80 border border-black/5 p-5">
      <span className="text-[10px] uppercase tracking-[0.22em] text-neutral-400 font-bitter">
        {eyebrow}
      </span>

      <h4 className="mt-1 font-frank text-2xl font-bold text-neutral-950 leading-none">
        {title}
      </h4>

      <div className="mt-4">{children}</div>
    </section>
  );
}

function GroupDiscountPreview({ groupDiscount }) {
  if (!groupDiscount?.enabled || !groupDiscount?.rules?.length) return null;

  return (
    <PreviewSection eyebrow="Save More" title="Group discount">
      <div className="space-y-2">
        {groupDiscount.rules.map((rule, index) => (
          <div
            key={index}
            className="flex items-center justify-between gap-3 rounded-2xl bg-white border border-black/5 px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <img
                src="/icons/savemore.png"
                alt="savemore"
                className="h-5 w-5 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />

              <span className="text-sm text-neutral-600 font-bitter">
                {rule.minPeople}+ people
              </span>
            </div>

            <span className="text-sm font-bold text-green-700 font-bitter">
              {rule.discountPercent}% off
            </span>
          </div>
        ))}
      </div>
    </PreviewSection>
  );
}

function PickupPreview({ pickupOptions = [] }) {
  if (!pickupOptions.length) return null;

  return (
    <PreviewSection eyebrow="Pickup" title="Pickup options">
      <div className="flex flex-wrap gap-2">
        {pickupOptions.map((option) => {
          const isCustom = option.toLowerCase().includes("custom");

          return (
            <span
              key={option}
              className={`rounded-full border px-3 py-1.5 text-xs font-bitter ${isCustom
                  ? "bg-green-200 border-green-300 text-green-950 font-semibold shadow-sm"
                  : "bg-white border-black/10 text-neutral-600"
                }`}
            >
              {option}
            </span>
          );
        })}
      </div>
    </PreviewSection>
  );
}

function StopsPreview({ stops = [], onFullTour }) {
  if (!stops.length) return null;

  const visibleStops = stops.slice(0, 6);

  return (
    <PreviewSection eyebrow="Route Preview" title="Stops / itinerary">
      <div className="space-y-2">
        {visibleStops.map((stop, index) => (
          <button
            key={stop?.id || stop?.name || index}
            type="button"
            onClick={onFullTour}
            className="w-full text-left flex items-center gap-3 rounded-2xl bg-white border border-black/5 px-4 py-3 hover:bg-green-200 transition-colors"
          >
            <span className="h-7 w-7 rounded-full bg-neutral-100 border border-black/5 flex items-center justify-center text-xs font-bold text-neutral-700 shrink-0">
              {index + 1}
            </span>

            <div>
              <p className="text-sm font-semibold text-neutral-850 font-bitter">
                {getStopText(stop)}
              </p>

              {toText(stop?.time || stop?.duration || stop?.note) && (
                <p className="mt-0.5 text-xs text-neutral-500 font-bitter">
                  {toText(stop?.time || stop?.duration || stop?.note)}
                </p>
              )}
            </div>
          </button>
        ))}

        {stops.length > visibleStops.length && (
          <p className="pt-1 text-xs text-neutral-400 font-bitter">
            +{stops.length - visibleStops.length} more stops shown on the full tour page.
          </p>
        )}
      </div>
    </PreviewSection>
  );
}

function LearnMoreDrawer({ tour, isOpen, onFullTour, onBook, onClose }) {
  const wrapRef = useRef(null);
  const innerRef = useRef(null);
  const didMount = useRef(false);

  const images = tour.images?.length ? tour.images : tour.image ? [tour.image] : [];
  const highlights = tour.highlights || [];
  const included = tour.included || [];

  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    const inner = innerRef.current;

    if (!wrap || !inner) return;

    if (!didMount.current) {
      didMount.current = true;

      if (isOpen) {
        gsap.set(wrap, { height: "auto", opacity: 1 });
        gsap.set(inner, { y: 0, scale: 1 });
        return;
      }

      gsap.set(wrap, { height: 0, opacity: 0 });
      return;
    }

    gsap.killTweensOf([wrap, inner]);
    gsap.killTweensOf(inner.querySelectorAll("[data-preview-item]"));

    if (isOpen) {
      gsap.set(wrap, { height: "auto", opacity: 1 });
      gsap.set(inner, { y: 46, scale: 0.985, transformOrigin: "center top" });

      const height = inner.offsetHeight;

      const tl = gsap.timeline();

      tl.fromTo(
        wrap,
        { height: 0, opacity: 0 },
        {
          height,
          opacity: 1,
          duration: 0.65,
          ease: "expo.out",
          onComplete: () => {
            gsap.set(wrap, { height: "auto" });
            ScrollTrigger.refresh();
          },
        },
        0
      )
        .to(
          inner,
          {
            y: 0,
            scale: 1,
            duration: 0.65,
            ease: "expo.out",
          },
          0
        )
        .fromTo(
          Array.from(inner.querySelectorAll("[data-preview-item]")),
          { opacity: 0, y: 22 },
          {
            opacity: 1,
            y: 0,
            duration: 0.48,
            stagger: 0.055,
            ease: "power3.out",
          },
          0.14
        );
    } else {
      const height = inner.offsetHeight;

      gsap.to(inner, {
        y: 34,
        scale: 0.985,
        duration: 0.36,
        ease: "power3.inOut",
      });

      gsap.fromTo(
        wrap,
        { height, opacity: 1 },
        {
          height: 0,
          opacity: 0,
          duration: 0.42,
          ease: "expo.inOut",
          onComplete: () => {
            gsap.set(inner, { y: 0, scale: 1 });
            ScrollTrigger.refresh();
          },
        }
      );
    }
  }, [isOpen]);

  return (
    <div ref={wrapRef} style={{ overflow: "visible", height: 0, opacity: 0 }}>
      <div ref={innerRef} className="relative bg-none pt-7">
        <div className="relative border-t border-black/5 px-6 md:px-8 py-8 bg-none">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close details"
            className="absolute left-1/2 -translate-x-1/2 -top-6 z-[120] inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/92 backdrop-blur-md shadow-[0_12px_28px_rgba(0,0,0,0.14)] border border-black/8 hover:bg-white active:scale-95 transition-all duration-200"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-neutral-700"
            >
              <path d="M18 6L6 18" />
              <path d="M6 6l12 12" />
            </svg>
          </button>

          <div className="relative max-h-180 sm:max-h-140 overflow-hidden rounded-4xl bg-white">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-8">
              <div className="flex flex-col gap-2">
                <div data-preview-item>
                  <PreviewSection eyebrow="Preview" title="About this tour">
                    <p className="text-sm text-neutral-600 font-bitter leading-relaxed">
                      {toText(tour.description)}
                    </p>
                  </PreviewSection>
                </div>

                {highlights.length > 0 && (
                  <div data-preview-item className="relative">
                    <PreviewSection eyebrow="Highlights" title="What stands out">
                      <div className="grid grid-cols-1 gap-3">
                        {highlights.slice(0, 3).map((item, index) => (
                          <TickItem key={index} text={toText(item)} />
                        ))}
                      </div>
                    </PreviewSection>
                  </div>
                )}

                <div data-preview-item>
                  <PickupPreview pickupOptions={tour.pickupOptions} />
                </div>

                <div data-preview-item>
                  <GroupDiscountPreview groupDiscount={tour.groupDiscount} />
                </div>
              </div>

              <div className="flex flex-col gap-5">
                {images.length > 0 && (
                  <div data-preview-item>
                    <div className="grid grid-cols-3 gap-3 rounded-[1.75rem] bg-neutral-50/90 p-2.5 sm:p-3">
                      {images.slice(0, 3).map((image, index) => (
                        <FallbackImage
                          key={`${tour.slug}-preview-image-${index}`}
                          sources={getImagePathAliases(image)}
                          alt={`${tour.title} ${index + 1}`}
                          className="h-36 sm:h-44 w-full rounded-3xl object-cover"
                          loading="lazy"
                          decoding="async"
                          onFinalError={(event) => {
                            event.currentTarget.style.display = "none";
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {included.length > 0 && (
                  <div data-preview-item className="relative">
                    <PreviewSection eyebrow="Included" title="Included perks">
                      <div className="grid grid-cols-1 gap-3">
                        {included.slice(0, 3).map((item, index) => (
                          <TickItem key={index} text={toText(item)} />
                        ))}
                      </div>
                    </PreviewSection>
                  </div>
                )}

                <div data-preview-item>
                  <StopsPreview stops={tour.stops} onFullTour={onFullTour} />
                </div>

                {tour.needToKnow?.length > 0 && (
                  <div data-preview-item>
                    <PreviewSection eyebrow="Before You Go" title="Need to know">
                      <div className="grid grid-cols-1 gap-3">
                        {tour.needToKnow.slice(0, 3).map((item, index) => (
                          <TickItem key={index} text={toText(item)} />
                        ))}
                      </div>
                    </PreviewSection>
                  </div>
                )}
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-[165px] sm:h-[190px] bg-gradient-to-t from-white via-white/96 via-70% to-white/0 flex items-end justify-center px-4 pb-4 sm:pb-5 pointer-events-none">
              <div className="pointer-events-auto w-full max-w-2xl rounded-[2rem] bg-white/94 backdrop-blur-md border border-black/10 shadow-[0_18px_55px_rgba(0,0,0,0.14)] px-5 py-4 sm:px-6 sm:py-5">
                <div className="text-center">
                  <p className="text-lg sm:text-xl text-neutral-900 font-bitter font-semibold">
                    Continue Exploring
                  </p>

                  <p className="mt-2 text-sm sm:text-[15px] text-neutral-700 font-bitter leading-relaxed max-w-xl mx-auto">
                    Open the full tour page for the complete itinerary, map locations, traveller notes, FAQs, and the booking form.
                  </p>
                </div>

                <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-2.5">
                  <button
                    onClick={onFullTour}
                    className="w-full sm:w-auto hero-gradient text-white text-sm font-bitter font-semibold px-6 py-2.5 rounded-full hover:opacity-90 active:scale-95 transition-all duration-200"
                  >
                    See Full Details
                  </button>

                  <button
                    onClick={onBook}
                    className="w-full sm:w-auto rounded-full border border-black/10 bg-neutral-950 text-white px-6 py-2.5 text-sm font-bitter font-semibold hover:bg-green-900 active:scale-95 transition-all duration-200"
                  >
                    Request Trip
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TourCard({ tour, decked = false }) {
  const cardRef = useRef(null);
  const imgRef = useRef(null);
  const contentRef = useRef(null);
  const priceRef = useRef(null);
  const shimmerRef = useRef(null);
  const chevronRef = useRef(null);

  const ctaWrapRef = useRef(null);
  const metaWrapRef = useRef(null);
  const reviewWrapRef = useRef(null);
  const reviewCardRef = useRef(null);
  const reviewQuoteRef = useRef(null);
  const reviewAnimReady = useRef(false);

  const [open, setOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [currency, setCurrency] = useState("ZAR");

  const navigate = useNavigate();

  const supportedCurrencies =
    tour.supportedCurrencies?.length > 0
      ? tour.supportedCurrencies
      : ["ZAR", "USD", "EUR", "GBP"];

  const basePrice = Number(tour.priceBase ?? tour.price ?? 0);
  const categoryLabel = getCategoryText(tour);
  const typeLabel = getTypeText(tour);
  const locationText = getLocationText(tour);

  const convertPrice = (baseAmount, targetCurrency) => {
    return baseAmount * (FX_RATES[targetCurrency] || 1);
  };

  const formatMoney = (amount, currencyCode) =>
    new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: currencyCode,
      maximumFractionDigits: 2,
    }).format(amount);

  const displayPrice = formatMoney(convertPrice(basePrice, currency), currency);

  const goToTourPage = () => {
    navigate(`/tours/${tour.slug}`, {
      state: {
        tour,
        selectedCurrency: currency,
      },
    });
  };

  const goToBooking = () => {
    navigate(`/tours/${tour.slug}#booking`, {
      state: {
        tour: {
          ...tour,
          priceBase: basePrice,
        },
        selectedCurrency: currency,
      },
    });
  };

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    if (decked) {
      gsap.set(card, { opacity: 1, y: 0 });
      gsap.set(imgRef.current, { scale: 1 });
      gsap.set(contentRef.current, { opacity: 1, x: 0 });
      gsap.set(priceRef.current, { opacity: 1, y: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.set(card, { opacity: 0, y: 52 });
      gsap.set(imgRef.current, { scale: 1.1 });
      gsap.set(contentRef.current, { opacity: 0, x: 24 });
      gsap.set(priceRef.current, { opacity: 0, y: 18 });

      ScrollTrigger.create({
        trigger: card,
        start: "top 87%",
        once: true,
        onEnter: () => {
          const tl = gsap.timeline({ defaults: { ease: "expo.out" } });

          tl.to(card, { opacity: 1, y: 0, duration: 0.9 })
            .to(imgRef.current, { scale: 1, duration: 1.3, ease: "power2.out" }, 0)
            .to(contentRef.current, { opacity: 1, x: 0, duration: 0.8 }, 0.2)
            .to(priceRef.current, { opacity: 1, y: 0, duration: 0.65 }, 0.38);
        },
      });
    }, card);

    return () => ctx.revert();
  }, [decked]);

  useLayoutEffect(() => {
    const cta = ctaWrapRef.current;
    const meta = metaWrapRef.current;
    const reviewWrap = reviewWrapRef.current;
    const reviewCard = reviewCardRef.current;
    const reviewQuote = reviewQuoteRef.current;

    if (!cta || !meta || !reviewWrap || !reviewCard) return;

    if (!reviewAnimReady.current) {
      reviewAnimReady.current = true;

      gsap.set([cta, meta], {
        height: "auto",
        autoAlpha: 1,
        y: 0,
        overflow: "visible",
        pointerEvents: "auto",
      });

      gsap.set(reviewWrap, {
        flexGrow: 0,
        flexBasis: "auto",
        overflow: "visible",
      });

      gsap.set(reviewCard, {
        height: "auto",
        overflow: "visible",
      });

      return;
    }

    gsap.killTweensOf([cta, meta, reviewWrap, reviewCard, reviewQuote]);

    const tl = gsap.timeline({
      defaults: {
        overwrite: "auto",
      },
      onComplete: () => {
        ScrollTrigger.refresh();
      },
    });

    const collapseBlock = (el, at = 0) => {
      const currentHeight = el.offsetHeight || el.scrollHeight;

      tl.fromTo(
        el,
        {
          height: currentHeight,
          autoAlpha: 1,
          y: 0,
          overflow: "hidden",
          pointerEvents: "auto",
        },
        {
          height: 0,
          autoAlpha: 0,
          y: -8,
          duration: 0.34,
          ease: "power3.inOut",
          onComplete: () => {
            gsap.set(el, {
              height: 0,
              overflow: "hidden",
              pointerEvents: "none",
            });
          },
        },
        at
      );
    };

    const expandBlock = (el, at = 0) => {
      gsap.set(el, {
        height: "auto",
        autoAlpha: 1,
        y: 0,
        overflow: "hidden",
        pointerEvents: "auto",
      });

      const targetHeight = el.scrollHeight;

      tl.fromTo(
        el,
        {
          height: 0,
          autoAlpha: 0,
          y: -8,
          overflow: "hidden",
        },
        {
          height: targetHeight,
          autoAlpha: 1,
          y: 0,
          duration: 0.42,
          ease: "power3.out",
          onComplete: () => {
            gsap.set(el, {
              height: "auto",
              overflow: "visible",
              pointerEvents: "auto",
              clearProps: "transform",
            });
          },
        },
        at
      );
    };

    if (reviewOpen) {
      collapseBlock(meta, 0);
      collapseBlock(cta, 0.03);

      tl.to(
        reviewWrap,
        {
          flexGrow: 1,
          duration: 0.48,
          ease: "power3.inOut",
        },
        0
      );

      tl.to(
        reviewCard,
        {
          scale: 1.01,
          duration: 0.34,
          ease: "power2.out",
        },
        0.04
      );
    } else {
      tl.to(
        reviewWrap,
        {
          flexGrow: 0,
          duration: 0.38,
          ease: "power3.inOut",
        },
        0
      );

      tl.to(
        reviewCard,
        {
          scale: 1,
          duration: 0.28,
          ease: "power2.out",
        },
        0
      );

      expandBlock(meta, 0.02);
      expandBlock(cta, 0.05);
    }

    if (reviewQuote) {
      tl.fromTo(
        reviewQuote,
        {
          autoAlpha: 0.72,
          y: reviewOpen ? 8 : -4,
        },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.28,
          ease: "power2.out",
        },
        0.08
      );
    }

    return () => tl.kill();
  }, [reviewOpen]);

  useEffect(() => {
    if (!decked || !open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [decked, open]);

  const handleMouseMove = useCallback((e) => {
    if (!cardRef.current || !imgRef.current || !shimmerRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * 100;
    const py = ((e.clientY - rect.top) / rect.height) * 100;

    gsap.to(shimmerRef.current, {
      background: `radial-gradient(circle at ${px}% ${py}%, rgba(255,255,255,0.18) 0%, transparent 62%)`,
      duration: 0.3,
      ease: "none",
    });

    gsap.to(imgRef.current, {
      scale: 1.045,
      x: (px - 50) * 0.045,
      y: (py - 50) * 0.035,
      duration: 0.55,
      ease: "power2.out",
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    gsap.to(shimmerRef.current, {
      background: "transparent",
      duration: 0.5,
    });

    gsap.to(imgRef.current, {
      scale: 1,
      x: 0,
      y: 0,
      duration: 0.75,
      ease: "power3.out",
    });
  }, []);

  const handleToggle = () => {
    const next = !open;

    setOpen(next);
    setReviewOpen(false);

    gsap.to(chevronRef.current, {
      rotate: next ? 180 : 0,
      duration: 0.35,
      ease: "power2.inOut",
    });

    gsap.fromTo(
      cardRef.current,
      { outline: "2px solid rgba(239,68,68,0.4)" },
      {
        outline: "2px solid rgba(239,68,68,0)",
        duration: 0.55,
        ease: "power2.out",
      }
    );
  };

  const closeDetails = () => {
    setOpen(false);

    gsap.to(chevronRef.current, {
      rotate: 0,
      duration: 0.35,
      ease: "power2.inOut",
    });
  };

  const handleReviewToggle = () => {
    setReviewOpen((prev) => !prev);
    setOpen(false);

    gsap.to(chevronRef.current, {
      rotate: 0,
      duration: 0.35,
      ease: "power2.inOut",
    });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`w-full rounded-[1.5rem] sm:rounded-[2rem] shadow-[0_14px_42px_rgba(0,0,0,0.08)] sm:shadow-[0_18px_60px_rgba(0,0,0,0.08)] my-3 sm:my-5 overflow-hidden relative border border-black/5 bg-white ${decked ? "max-xl:my-0" : ""}`}
      data-tour-card
      style={{ opacity: decked ? 1 : 0 }}
    >
      <div
        ref={shimmerRef}
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 10,
          pointerEvents: "none",
          borderRadius: "inherit",
        }}
      />

      <div className="relative">
        <div
          className={`absolute inset-0 z-30 bg-black/55 backdrop-blur-[1.5px] transition-all duration-500 ease-out pointer-events-none ${open ? "opacity-100" : "opacity-0"
            }`}
        />

        <div
          className={`grid grid-cols-1 md:grid-cols-2 text-black font-bitter bg-white min-h-[auto] md:min-h-[390px] xl:min-h-[420px] transition-all duration-500 ease-out ${decked ? "max-xl:min-h-0" : ""} ${open ? "scale-[0.985] brightness-75" : "scale-100 brightness-100"
            }`}
        >
          <div data-card-image-panel className="relative overflow-hidden min-h-[210px] sm:min-h-[260px] md:min-h-[360px] xl:min-h-[420px] bg-neutral-900">
            <FallbackImage
              data-card-image
              ref={imgRef}
              sources={getTourImageSources(tour)}
              alt={tour.title}
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
              decoding="async"
              style={{ willChange: "transform" }}
              onFinalError={(e) => {
                e.currentTarget.style.display = "none";
                e.currentTarget.parentNode.style.background =
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

            <div className="absolute -top-24 -right-24 z-10 h-56 w-56 rounded-full bg-green-200/20 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 z-10 h-52 w-52 rounded-full bg-blue-300/10 blur-3xl" />

            <div className="absolute top-4 left-4 right-4 z-20 flex items-start justify-between gap-2 sm:top-5 sm:left-5 sm:right-5 sm:gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-green-200/95 border border-white/25 px-3 py-1.5 text-[11px] text-green-950 font-bitter font-semibold shadow-lg sm:px-4 sm:text-xs">
                  {categoryLabel}
                </span>

                <span className="rounded-full bg-white/15 backdrop-blur-md border border-white/20 px-3 py-1.5 text-[11px] text-white/90 font-bitter shadow-lg sm:px-4 sm:text-xs">
                  {typeLabel}
                </span>
              </div>

              <div className="h-12 w-12 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex flex-col items-center justify-center shadow-lg shrink-0 sm:h-14 sm:w-14">
                <span className="text-white font-frank text-xl font-bold leading-none">
                  {tour.rating}
                </span>

                <span className="text-[10px] text-white/65 font-bitter leading-none mt-1">
                  rating
                </span>
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 z-20 p-4 sm:p-6 md:p-7 xl:p-8">
              <div className="relative">
                <span className="text-white/55 text-[11px] uppercase tracking-[0.22em] font-bitter">
                  {categoryLabel} · {typeLabel}
                </span>

                <h3 className="mt-2 text-white font-frank text-2xl sm:text-4xl xl:text-5xl font-bold leading-[0.9] drop-shadow-lg max-w-[12ch]">
                  {tour.title}
                </h3>

                <div className="mt-3 h-px w-20 bg-green-200/80 sm:mt-5 sm:w-24" />
              </div>
            </div>
          </div>

          <div ref={contentRef} data-card-content-panel className="flex flex-col bg-white">
            <div className={`p-4 sm:p-5 md:p-6 xl:p-8 flex flex-col justify-start gap-3 sm:gap-4 xl:gap-5 ${decked ? "max-xl:p-3 max-xl:gap-2.5" : ""}`}>
              <div data-card-stagger-item className="flex items-center justify-between gap-4">
                <div>
                  <span className="block leading-none text-[11px] uppercase tracking-[0.2em] text-red-400 font-bitter">
                    From
                  </span>

                  <div ref={priceRef} style={{ opacity: 0 }} className="mt-0.5">
                    <p className="flex items-end gap-2">
                      <span className="font-frank font-bold text-neutral-950 tracking-tight leading-none text-2xl sm:text-4xl xl:text-5xl">
                        {displayPrice}
                      </span>

                      <span className="text-sm text-neutral-400 font-bitter mb-1">
                        pp
                      </span>
                    </p>
                  </div>
                </div>

                <div className="">
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-fit flex justify-center items-center p-2.5 sm:p-3
                    rounded-2xl text-sm sm:text-base border border-black/10 bg-neutral-50 text-neutral-700 
                    font-bitter hover:border-red-300 focus:border-red-400 transition-colors"
                  >
                    {supportedCurrencies.map((code) => (
                      <option key={code} value={code}>
                        {code}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div ref={metaWrapRef} data-card-stagger-item className="grid grid-cols-2 gap-2 sm:gap-3">
                <div className="group rounded-2xl bg-neutral-50 border border-black/5 px-3 py-2.5 sm:px-4 sm:py-4 transition-all duration-300 hover:bg-green-200 hover:border-green-300 hover:-translate-y-0.5">
                  <div className="flex items-center gap-2 text-neutral-400 group-hover:text-green-900 transition-colors">
                    <img
                      src="/icons/mapPin.png"
                      className="h-4 w-4 object-contain"
                      alt="pin"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />

                    <span className="block text-[11px] uppercase tracking-wide font-bitter">
                      Location
                    </span>
                  </div>

                  <p className="mt-1 text-xs sm:mt-2 sm:text-sm text-neutral-700 group-hover:text-green-950 leading-snug font-bitter transition-colors">
                    {locationText}
                  </p>
                </div>

                <div className="group rounded-2xl bg-neutral-50 border border-black/5 px-3 py-2.5 sm:px-4 sm:py-4 transition-all duration-300 hover:bg-green-200 hover:border-green-300 hover:-translate-y-0.5">
                  <div className="flex items-center gap-2 text-neutral-400 group-hover:text-green-900 transition-colors">
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

                    <span className="block text-[11px] uppercase tracking-wide font-bitter">
                      Duration
                    </span>
                  </div>

                  <p className="mt-1 text-xs sm:mt-2 sm:text-sm text-neutral-700 group-hover:text-green-950 leading-snug font-bitter transition-colors">
                    {toText(tour.duration, "Flexible")}
                  </p>
                </div>
              </div>

              <div
                data-card-stagger-item
                ref={reviewWrapRef}
                className={`${reviewOpen ? "flex min-h-[260px] max-xl:min-h-0" : "block"}`}
              >
                <FloatingTooltip
                  text="Review"
                  badgeText={reviewOpen ? "Close" : "Open"}
                  position="top"
                  followCursor={true}
                  className={`w-full ${reviewOpen ? "flex" : "block"}`}
                >
                  <button
                    ref={reviewCardRef}
                    type="button"
                    onClick={handleReviewToggle}
                    className={`w-full text-left rounded-2xl sm:rounded-3xl border px-3 py-2.5 sm:px-5 sm:py-4 overflow-hidden transition-colors duration-500
                      ${reviewOpen
                        ? "h-full min-h-[260px] max-xl:min-h-0 flex flex-col justify-between bg-green-200 border-green-300 shadow-sm will-change-transform"
                        : "bg-green-50/70 border-green-100 hover:bg-green-200 hover:border-green-300"
                      }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <StarRating count={tour.stars} />

                        <span className="text-sm font-semibold text-neutral-800">
                          {tour.rating}
                        </span>
                      </div>

                      <span className="text-xs text-neutral-500 font-bitter">
                        {reviewOpen ? "Click to close" : "Read review"}
                      </span>
                    </div>

                    <p
                      ref={reviewQuoteRef}
                      className={`mt-1.5 text-xs sm:mt-3 sm:text-sm text-neutral-600 italic leading-relaxed transition-all duration-300
                        ${reviewOpen ? "line-clamp-none sm:text-base" : "line-clamp-2"}`}
                    >
                      “{toText(tour.mainReview, "A highly rated Cape Town experience.")}”
                    </p>

                    <div className="mt-2 flex items-center justify-between gap-2 sm:mt-4 sm:gap-3">
                      <p className="text-xs text-neutral-500 font-bitter">
                        Reviewed by{" "}
                        <span className="text-neutral-700">
                          {toText(tour.mainReviewerName, "Traveller")}
                        </span>
                        {tour.mainReviewerCountry
                          ? ` · ${toText(tour.mainReviewerCountry)}`
                          : ""}
                      </p>

                      <div className="flex items-center gap-2">
                        <ReviewAvatars />

                        <span className="text-xs text-neutral-600 font-bitter whitespace-nowrap">
                          +{tour.otherReviews || 0} reviews
                        </span>
                      </div>
                    </div>
                  </button>
                </FloatingTooltip>
              </div>
            </div>

            <div ref={ctaWrapRef} data-card-stagger-item className="overflow-hidden">
              <div className="px-3 sm:px-5 md:px-6 xl:px-8 py-3 sm:py-4 border-t border-black/5 bg-neutral-50 flex items-center justify-between gap-3">
                <button
                  onClick={handleToggle}
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-full border border-black/10 text-neutral-600
                    bg-white text-sm font-bitter font-medium hover:border-red-300 hover:text-red-400 active:scale-95 transition-all duration-200"
                >
                  <svg
                    ref={chevronRef}
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    style={{ display: "block", transformOrigin: "center" }}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>

                  {open ? "Close" : "Details"}
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    goToBooking();
                  }}
                  className="px-5 py-2 hero-gradient rounded-full text-sm font-bitter font-semibold text-white
                    flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all duration-200 shadow-sm"
                >
                  Request Trip

                  <img
                    src="/icons/go.png"
                    alt=""
                    className="w-4 h-4 object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {!decked && (
        <div
          className={`relative z-40 transition-all duration-500 ease-out ${open ? "-mt-[32rem] sm:-mt-44 md:-mt-48" : "mt-0"
            }`}
        >
          <LearnMoreDrawer
            tour={tour}
            isOpen={open}
            onFullTour={goToTourPage}
            onBook={goToBooking}
            onClose={closeDetails}
          />
        </div>
      )}

      {decked &&
        open &&
        createPortal(
          <DeckDetailsOverlay
            tour={tour}
            onFullTour={goToTourPage}
            onBook={goToBooking}
            onClose={closeDetails}
          />,
          document.body
        )}
    </div>
  );
}

function CategorySection({ section, sectionTours, onTourProgress }) {
  const sectionRef = useRef(null);
  const pinRef = useRef(null);
  const cardRefs = useRef([]);
  const lastProgressIndexRef = useRef(-1);

  useLayoutEffect(() => {
    const sectionEl = sectionRef.current;
    const pinEl = pinRef.current;
    const cards = cardRefs.current.filter(Boolean);

    if (!sectionEl || !pinEl || !cards.length) return;

    const mm = gsap.matchMedia();

    mm.add("(min-width: 0px)", () => {
      const getCardParts = (card) => ({
        imagePanel: card.querySelector("[data-card-image-panel]"),
        image: card.querySelector("[data-card-image]"),
        contentPanel: card.querySelector("[data-card-content-panel]"),
        staggerItems: Array.from(card.querySelectorAll("[data-card-stagger-item]")),
        sidePills: Array.from(card.querySelectorAll("[data-side-pill]")),
      });

      const cardParts = cards.map(getCardParts);

      const setPinHeight = () => {
        const deckOffset = getDeckPinTopOffset();
        pinEl.style.setProperty("--tour-deck-offset", `${deckOffset}px`);

        const tallestCard = Math.max(
          ...cards.map((card) => card.offsetHeight || card.scrollHeight || 520)
        );

        gsap.set(pinEl, {
          minHeight: Math.max(tallestCard + 28, 520),
        });
      };

      const setProgress = (index) => {
        const safeIndex = Math.max(0, Math.min(index, cards.length - 1));

        if (lastProgressIndexRef.current === safeIndex) return;

        lastProgressIndexRef.current = safeIndex;
        onTourProgress?.(section.id, safeIndex);
      };

      setPinHeight();

      gsap.set(cards, {
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
        width: "100%",
        autoAlpha: 0,
        clipPath: "inset(0% 0% 100% 0%)",
        transformOrigin: "center center",
        willChange: "clip-path, transform, opacity",
      });

      cards.forEach((card, index) => {
        const parts = cardParts[index];

        gsap.set(card, {
          zIndex: cards.length - index,
          pointerEvents: index === 0 ? "auto" : "none",
          autoAlpha: index === 0 ? 1 : 0,
          clipPath: index === 0 ? "inset(0% 0% 0% 0%)" : "inset(0% 0% 100% 0%)",
          y: 0,
        });

        if (parts.imagePanel) {
          gsap.set(parts.imagePanel, {
            yPercent: 0,
            willChange: "transform",
          });
        }

        if (parts.image) {
          gsap.set(parts.image, {
            scale: 1.06,
            yPercent: 0,
            willChange: "transform",
          });
        }

        if (parts.contentPanel) {
          gsap.set(parts.contentPanel, {
            autoAlpha: 1,
          });
        }

        if (parts.staggerItems?.length) {
          gsap.set(parts.staggerItems, {
            autoAlpha: index === 0 ? 1 : 0,
            y: index === 0 ? 0 : 20,
            willChange: "transform, opacity",
          });
        }

        if (parts.sidePills?.length) {
          gsap.set(parts.sidePills, {
            autoAlpha: index === 0 ? 1 : 0,
            x: index === 0 ? 0 : 18,
            scale: index === 0 ? 1 : 0.96,
            willChange: "transform, opacity",
          });
        }
      });

      const transitions = Math.max(cards.length - 1, 1);

      let tl;

      const getFullOpacitySnapEntries = () => {
        const totalDuration = Math.max(
          tl?.duration?.() || transitions + 1.35,
          1
        );

        const fullOpacityOffset = 0.92;

        const entries = [{ progress: 0, index: 0 }];

        for (let index = 1; index < cards.length; index += 1) {
          entries.push({
            progress: Math.min(1, (index - 1 + fullOpacityOffset) / totalDuration),
            index,
          });
        }

        entries.push({
          progress: 1,
          index: cards.length - 1,
        });

        return entries;
      };

      const getClosestSnapEntry = (progress) => {
        const entries = getFullOpacitySnapEntries();

        return entries.reduce((closest, entry) =>
          Math.abs(entry.progress - progress) < Math.abs(closest.progress - progress)
            ? entry
            : closest
        );
      };

      tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionEl,
          start: () => `top ${getDeckPinTopOffset()}px`,
          end: () => `+=${(transitions + 1.05) * (window.innerWidth < 768 ? 500 : window.innerWidth < 1024 ? 520 : 560)}`,
          pin: pinEl,
          pinSpacing: true,
          scrub: 0.16,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          snap:
            cards.length > 1
              ? {
                snapTo: (progress) => getClosestSnapEntry(progress).progress,
                duration: { min: 0.12, max: 0.22 },
                delay: 0.02,
                ease: "power3.out",
                inertia: false,
              }
              : false,
          onEnter: () => setProgress(0),
          onEnterBack: () => setProgress(cards.length - 1),
          onUpdate: (self) => {
            const nextIndex = getClosestSnapEntry(self.progress).index;
            setProgress(nextIndex);
          },
          onSnapComplete: (self) => {
            const snapIndex = getClosestSnapEntry(self.progress).index;
            const parts = cardParts[snapIndex];

            cards.forEach((card, index) => {
              gsap.set(card, {
                autoAlpha: index === snapIndex ? 1 : 0,
                pointerEvents: index === snapIndex ? "auto" : "none",
                clipPath:
                  index === snapIndex
                    ? "inset(0% 0% 0% 0%)"
                    : "inset(0% 0% 100% 0%)",
                y: index === snapIndex ? 0 : -18,
              });
            });

            if (parts?.image) {
              gsap.set(parts.image, {
                yPercent: 0,
                scale: 1.06,
              });
            }

            if (parts?.staggerItems?.length) {
              gsap.set(parts.staggerItems, {
                autoAlpha: 1,
                y: 0,
              });
            }
          },
          onRefresh: setPinHeight,
        },
      });

      cards.forEach((card, index) => {
        if (index === 0) return;

        const previousCard = cards[index - 1];
        const currentCard = cards[index];
        const previous = cardParts[index - 1];
        const current = cardParts[index];
        const at = index - 1;

        tl.set(
          currentCard,
          {
            autoAlpha: 1,
            pointerEvents: "auto",
            clipPath: "inset(0% 0% 0% 0%)",
            y: 0,
          },
          at
        );
        tl.set(previousCard, { pointerEvents: "none" }, at + 0.68);

        if (previous.staggerItems?.length) {
          tl.to(
            previous.staggerItems,
            {
              autoAlpha: 0,
              y: -18,
              stagger: 0.028,
              duration: 0.2,
              ease: "none",
            },
            at
          );
        }

        if (previous.sidePills?.length) {
          tl.to(
            previous.sidePills,
            {
              autoAlpha: 0,
              x: 18,
              scale: 0.96,
              stagger: 0.035,
              duration: 0.22,
              ease: "none",
            },
            at
          );
        }

        if (current.staggerItems?.length) {
          tl.fromTo(
            current.staggerItems,
            {
              autoAlpha: 0,
              y: 20,
            },
            {
              autoAlpha: 1,
              y: 0,
              stagger: 0.04,
              duration: 0.32,
              ease: "none",
            },
            at + 0.13
          );
        }

        if (current.sidePills?.length) {
          tl.fromTo(
            current.sidePills,
            {
              autoAlpha: 0,
              x: 18,
              scale: 0.96,
            },
            {
              autoAlpha: 1,
              x: 0,
              scale: 1,
              stagger: 0.045,
              duration: 0.32,
              ease: "none",
            },
            at + 0.14
          );
        }

        if (previous.image) {
          tl.to(
            previous.image,
            {
              yPercent: 0,
              scale: 1.075,
              duration: 0.62,
              ease: "none",
            },
            at
          );
        }

        if (current.image) {
          tl.fromTo(
            current.image,
            {
              yPercent: 0,
              scale: 1.075,
            },
            {
              yPercent: 0,
              scale: 1.06,
              duration: 0.62,
              ease: "none",
            },
            at
          );
        }

        tl.to(
          previousCard,
          {
            clipPath: "inset(0% 0% 100% 0%)",
            y: -18,
            duration: 0.7,
            ease: "none",
          },
          at
        );

        tl.set(previousCard, { autoAlpha: 0 }, at + 0.71);

        tl.set(previousCard, { autoAlpha: 0 }, at + 0.71);
      });

      tl.to({}, { duration: 0.65 });

      ScrollTrigger.refresh();

      return () => {
        tl.scrollTrigger?.kill();
        tl.kill();

        gsap.set(pinEl, { clearProps: "minHeight" });

        gsap.set(cards, {
          clearProps:
            "position,left,right,top,width,transform,opacity,visibility,zIndex,pointerEvents,willChange,clipPath",
        });

        cardParts.forEach((parts) => {
          if (parts.imagePanel) {
            gsap.set(parts.imagePanel, { clearProps: "transform,willChange" });
          }

          if (parts.image) {
            gsap.set(parts.image, { clearProps: "transform,willChange" });
          }

          if (parts.contentPanel) {
            gsap.set(parts.contentPanel, { clearProps: "opacity,visibility" });
          }

          if (parts.staggerItems?.length) {
            gsap.set(parts.staggerItems, {
              clearProps: "transform,opacity,visibility,willChange",
            });
          }

          if (parts.sidePills?.length) {
            gsap.set(parts.sidePills, {
              clearProps: "transform,opacity,visibility,willChange",
            });
          }
        });
      };
    });

    return () => mm.revert();
  }, [section.id, sectionTours, onTourProgress]);

  return (
    <section ref={sectionRef} id={section.id} className="relative z-10 scroll-mt-[14rem] md:scroll-mt-[13rem] xl:scroll-mt-28 py-3 md:py-4">
      <div ref={pinRef} className="relative z-10 w-full overflow-visible">
        <div className="lg:absolute lg:left-0 lg:right-0 lg:top-0">
          <div className="space-y-5 lg:space-y-0">
            {sectionTours.map((tour, index) => (
              <div
                key={tour.id}
                ref={(el) => {
                  cardRefs.current[index] = el;
                }}
                className="relative"
              >
                <div className="relative">
                  <TourCard tour={tour} decked />
                  <DesktopTourSidePills
                    tour={tour}
                    section={section}
                    sectionSize={sectionTours.length}
                  />
                </div>

                <ReviewFlipCard tour={tour} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function DeckDetailsOverlay({ tour, onFullTour, onBook, onClose }) {
  const overlayRef = useRef(null);
  const shellRef = useRef(null);

  useLayoutEffect(() => {
    const overlay = overlayRef.current;
    const shell = shellRef.current;

    if (!overlay || !shell) return;

    gsap.set(overlay, {
      autoAlpha: 0,
      backdropFilter: "blur(0px)",
    });

    gsap.set(shell, {
      autoAlpha: 0,
      scale: 0.78,
      y: 36,
      borderRadius: "999px",
      maxWidth: "22rem",
      maxHeight: "10rem",
      overflow: "hidden",
      transformOrigin: "center center",
    });

    const tl = gsap.timeline({
      defaults: {
        ease: "expo.out",
      },
    });

    tl.to(overlay, {
      autoAlpha: 1,
      backdropFilter: "blur(6px)",
      duration: 0.28,
    })
      .to(
        shell,
        {
          autoAlpha: 1,
          scale: 1,
          y: 0,
          maxWidth: "64rem",
          maxHeight: "calc(100vh - 7rem)",
          borderRadius: "2rem",
          duration: 0.62,
        },
        0.04
      )
      .fromTo(
        shell.querySelectorAll("[data-drawer-animate]"),
        {
          autoAlpha: 0,
          y: 18,
        },
        {
          autoAlpha: 1,
          y: 0,
          stagger: 0.045,
          duration: 0.38,
          ease: "power3.out",
        },
        0.28
      );

    return () => tl.kill();
  }, []);

  const handleClose = () => {
    const overlay = overlayRef.current;
    const shell = shellRef.current;

    if (!overlay || !shell) {
      onClose();
      return;
    }

    gsap
      .timeline({
        defaults: {
          ease: "power3.inOut",
        },
        onComplete: onClose,
      })
      .to(shell, {
        scale: 0.82,
        y: 28,
        autoAlpha: 0,
        maxWidth: "22rem",
        maxHeight: "10rem",
        borderRadius: "999px",
        duration: 0.26,
      })
      .to(
        overlay,
        {
          autoAlpha: 0,
          backdropFilter: "blur(0px)",
          duration: 0.2,
        },
        0.08
      );
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-999 flex items-center justify-center bg-black/45 p-4 sm:p-6"
    >
      <div className="flex h-full w-full items-center justify-center">
        <div
          ref={shellRef}
          className="flex min-h-0 w-full flex-col shadow-[0_24px_80px_rgba(0,0,0,0.24)]"
        >
          <div data-drawer-animate className="min-h-0 flex-1 overflow-y-auto">
            <LearnMoreDrawer
              tour={tour}
              isOpen={true}
              onFullTour={onFullTour}
              onBook={onBook}
              onClose={handleClose}
            />
          </div>
        </div>
      </div>
    </div>
  );
}


function WeatherIcon({ className = "h-4 w-4" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M17.5 19H8a5 5 0 1 1 1.1-9.88A6.5 6.5 0 0 1 21 12.5" />
      <path d="M16 13v6" />
      <path d="M13 16h6" />
    </svg>
  );
}

function getGroupDiscountText(tour) {
  const rules = tour.groupDiscount?.rules || [];
  if (!tour.groupDiscount?.enabled || !rules.length) {
    return "Group-friendly pricing";
  }

  const bestRule = rules.reduce((best, rule) => {
    if (!best) return rule;
    return Number(rule.discountPercent || 0) > Number(best.discountPercent || 0)
      ? rule
      : best;
  }, null);

  if (!bestRule) return "Group-friendly pricing";

  return `Up to ${bestRule.discountPercent}% off for ${bestRule.minPeople}+ guests`;
}

function getCancellationText(tour) {
  const summary = toText(tour.cancellationPolicy?.summary || tour.cancellationPolicy);
  if (summary) return summary;

  return "Refund or reschedule options available";
}

function getWeatherText(tour) {
  const weatherNote = tour.needToKnow
    ?.map((item) => toText(item))
    .find((item) => /weather|wind|rain|sea|conditions/i.test(item));

  if (weatherNote) return weatherNote;

  return "Weather-aware planning before departure";
}

function DesktopTourSidePills({ tour }) {
  return (
    <div className="pointer-events-none absolute left-[calc(100%+0.75rem)] top-1/2 z-30 hidden w-48 -translate-y-1/2 flex-col gap-2 xl:flex">
      <div
        data-side-pill
        className="rounded-3xl border border-green-300/60 bg-green-200/95 px-4 py-4 shadow-[0_14px_36px_rgba(22,101,52,0.14)] backdrop-blur-md"
      >
        <p className="font-bitter text-[11px] font-bold uppercase tracking-[0.16em] text-green-950/70">
          Save more
        </p>
        <p className="mt-1 font-bitter text-sm font-semibold leading-snug text-green-950">
          {getGroupDiscountText(tour)}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div
          data-side-pill
          className="rounded-2xl border border-black/5 bg-white/95 px-3 py-3 shadow-[0_10px_28px_rgba(0,0,0,0.08)] backdrop-blur-md"
        >
          <p className="font-bitter text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-400">
            Cancel
          </p>
          <p className="mt-1 font-bitter text-[11px] leading-snug text-neutral-700 line-clamp-3">
            {getCancellationText(tour)}
          </p>
        </div>

        <div
          data-side-pill
          className="rounded-2xl border border-black/5 bg-white/95 px-3 py-3 shadow-[0_10px_28px_rgba(0,0,0,0.08)] backdrop-blur-md"
        >
          <div className="flex items-center gap-1.5 text-neutral-400">
            <WeatherIcon className="h-3.5 w-3.5" />
            <p className="font-bitter text-[10px] font-bold uppercase tracking-[0.14em]">
              Weather
            </p>
          </div>
          <p className="mt-1 font-bitter text-[11px] leading-snug text-neutral-700 line-clamp-3">
            {getWeatherText(tour)}
          </p>
        </div>
      </div>
    </div>
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
            className={`block rounded-full border transition-colors duration-200 ${isVertical ? "h-3 w-3" : "h-2.5 w-2.5"
              } ${complete
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
      className={`group relative w-full rounded-2xl text-left transition-all duration-300 ${compact ? "px-2.5 py-2" : "px-3.5 py-3"
        } ${active
          ? "bg-white/95 text-neutral-950 shadow-[0_10px_30px_rgba(0,0,0,0.12)]"
          : "text-white/72 hover:text-white hover:bg-white/10"
        }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`h-8 w-8 rounded-lg flex items-center justify-center border transition-all duration-300 shrink-0 ${active
              ? "bg-green-200 border-green-300"
              : "bg-white/8 border-white/10 group-hover:bg-white/12"
            }`}
        >
          <img
            src={section.icon}
            className="h-6 w-6 object-contain"
            alt={section.label}
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        </div>

        <div className="min-w-0 flex-1">
          <p
            className={`text-[9px] font-bitter tracking-[0.14em] uppercase leading-none ${active ? "text-neutral-400" : "text-white/35"
              }`}
          >
            0{index + 1}
          </p>

          <p className="mt-0.5 font-bitter text-[12px] font-semibold leading-tight truncate">
            {section.label}
          </p>
        </div>
      </div>

      {active && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-red-400" />
      )}
    </button>
  );
}

export default function ToursBrowser() {
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeTourByCategory, setActiveTourByCategory] = useState({});

  const browserRef = useRef(null);
  const railSlotRef = useRef(null);
  const railRef = useRef(null);
  const desktopRailPortalRef = useRef(null);
  const mobileNavRef = useRef(null);
  const mobileNavScrollerRef = useRef(null);
  const mobileCategoryItemRefs = useRef({});
  const activeCategoryRef = useRef(null);

  const visibleSections = useMemo(() => {
    return browseSections
      .map((section) => ({
        ...section,
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
    Math.min(activeTourByCategory[currentSection?.id] ?? 0, Math.max(currentTourTotal - 1, 0))
  );

  const activateCategory = useCallback((sectionId) => {
    if (!sectionId) return;

    const changed = activeCategoryRef.current !== sectionId;

    activeCategoryRef.current = sectionId;
    setActiveCategory(sectionId);

    if (changed) {
      setActiveTourByCategory((prev) =>
        prev[sectionId] === 0 ? prev : { ...prev, [sectionId]: 0 }
      );
    }
  }, []);

  const handleTourProgress = useCallback((sectionId, index) => {
    if (!sectionId) return;

    activeCategoryRef.current = sectionId;
    setActiveCategory((prev) => (prev === sectionId ? prev : sectionId));
    setActiveTourByCategory((prev) =>
      prev[sectionId] === index ? prev : { ...prev, [sectionId]: index }
    );
  }, []);

  useEffect(() => {
    activeCategoryRef.current = activeCategory;
  }, [activeCategory]);

  useEffect(() => {
    if (!activeCategory || typeof window === "undefined" || window.innerWidth >= 1280) {
      return;
    }

    const scroller = mobileNavScrollerRef.current;
    const item = mobileCategoryItemRefs.current[activeCategory];

    if (!scroller || !item) return;

    const isMobile = window.innerWidth < 768;
    const leftPadding = isMobile ? 6 : 10;
    const targetLeft = Math.max(item.offsetLeft - leftPadding, 0);

    scroller.scrollTo({
      left: targetLeft,
      behavior: "smooth",
    });
  }, [activeCategory]);

  useEffect(() => {
    if (!activeCategory && visibleSections[0]?.id) {
      activateCategory(visibleSections[0].id);
    }
  }, [activeCategory, visibleSections, activateCategory]);

  useLayoutEffect(() => {
    if (typeof window === "undefined") return undefined;

    const browser = browserRef.current;
    const desktopRail = desktopRailPortalRef.current;

    if (!browser || !desktopRail) return undefined;

    let frame = null;

    const updateDesktopRail = () => {
      frame = null;

      if (window.innerWidth < 1280) {
        desktopRail.style.opacity = "0";
        desktopRail.style.visibility = "hidden";
        desktopRail.style.pointerEvents = "none";
        return;
      }

      const rect = browser.getBoundingClientRect();

      /*
        Desktop nav is intentionally simple:
        - original desktop rail stays hidden as layout/ScrollTrigger backup
        - this fixed body-level rail appears while the ToursBrowser section is active
        - no ScrollTrigger pin state is required for desktop rail reappearing after return
      */
      const active = rect.top <= 120 && rect.bottom > 180;

      desktopRail.style.opacity = active ? "1" : "0";
      desktopRail.style.visibility = active ? "visible" : "hidden";
      desktopRail.style.pointerEvents = active ? "none" : "none";
    };

    const requestUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(updateDesktopRail);
    };

    const requestUpdateSoon = () => {
      requestUpdate();
      window.setTimeout(requestUpdate, 80);
      window.setTimeout(requestUpdate, 240);
      window.setTimeout(requestUpdate, 600);
      window.setTimeout(requestUpdate, 1000);
    };

    requestUpdateSoon();

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdateSoon);
    window.addEventListener("orientationchange", requestUpdateSoon);
    window.addEventListener("pageshow", requestUpdateSoon);
    window.addEventListener("focus", requestUpdateSoon);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);

      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdateSoon);
      window.removeEventListener("orientationchange", requestUpdateSoon);
      window.removeEventListener("pageshow", requestUpdateSoon);
      window.removeEventListener("focus", requestUpdateSoon);
    };
  }, [visibleSections.length]);


  useLayoutEffect(() => {
    const browser = browserRef.current;
    const railSlot = railSlotRef.current;
    const rail = railRef.current;

    if (!browser || !railSlot || !rail) return;

    let mm;

    const ctx = gsap.context(() => {
      gsap.set(railSlot, {
        zIndex: 90,
        pointerEvents: "none",
      });

      gsap.set(rail, {
        pointerEvents: "auto",
        force3D: true,
      });

      gsap.fromTo(
        rail,
        {
          opacity: 0,
          x: -12,
          filter: "blur(5px)",
        },
        {
          opacity: 1,
          x: 0,
          filter: "blur(0px)",
          duration: 0.75,
          ease: "expo.out",
        }
      );

      mm = gsap.matchMedia();

      mm.add("(min-width: 1280px)", () => {
        const getRailPinDistance = () => {
          const naturalHeight = browser.scrollHeight || browser.offsetHeight || 0;

          const deckScrollDistance = visibleSections.reduce((total, section) => {
            const transitions = Math.max((section.tours?.length || 1) - 1, 1);
            return total + (transitions + 1.25) * 560;
          }, 0);

          const railHeight = railSlot.offsetHeight || 320;
          const safetyBuffer = window.innerHeight * 0.9;

          return Math.max(
            naturalHeight + deckScrollDistance - railHeight,
            deckScrollDistance + safetyBuffer,
            window.innerHeight * 3
          );
        };

        const pinTrigger = ScrollTrigger.create({
          id: "tours-desktop-left-nav-pin",
          trigger: browser,
          start: "top top",
          end: () => `+=${getRailPinDistance()}`,
          pin: railSlot,
          pinSpacing: false,
          pinReparent: true,
          anticipatePin: 1,
          refreshPriority: 2,
          invalidateOnRefresh: true,
          onRefresh: () => {
            gsap.set(railSlot, { autoAlpha: 1, zIndex: 90 });
            gsap.set(rail, { autoAlpha: 1 });
          },
          onUpdate: () => {
            gsap.set(railSlot, { autoAlpha: 1, zIndex: 90 });
            gsap.set(rail, { autoAlpha: 1 });
          },
        });

        return () => {
          pinTrigger.kill();
        };
      });

      mm.add("(max-width: 767px)", () => {
        const mobileNav = mobileNavRef.current;

        if (!mobileNav) return undefined;

        gsap.set(mobileNav, {
          zIndex: 220,
          force3D: true,
        });

        const getMobileNavPinDistance = () => {
          const naturalHeight = browser.scrollHeight || browser.offsetHeight || 0;

          const deckScrollDistance = visibleSections.reduce((total, section) => {
            const transitions = Math.max((section.tours?.length || 1) - 1, 1);
            return total + (transitions + 1.25) * 500;
          }, 0);

          const navHeight = mobileNav.offsetHeight || 142;
          const safetyBuffer = window.innerHeight * 0.9;

          const documentHeight =
            document.documentElement.scrollHeight || document.body.scrollHeight || 0;

          return Math.max(
            naturalHeight + deckScrollDistance - navHeight,
            deckScrollDistance + safetyBuffer,
            documentHeight,
            window.innerHeight * 12
          );
        };

        const pinTrigger = ScrollTrigger.create({
          id: "tours-mobile-category-nav-pin",
          trigger: browser,
          start: () => `top ${getMobileNavTopOffset()}px`,
          end: () => `+=${getMobileNavPinDistance()}`,
          pin: mobileNav,
          pinSpacing: false,
          pinReparent: true,
          pinType: "fixed",
          anticipatePin: 1,
          refreshPriority: 2,
          invalidateOnRefresh: true,
          onRefresh: () => {
            const navHeight = mobileNav.offsetHeight || 142;
            document.documentElement.style.setProperty("--tour-category-nav-height", `${navHeight}px`);
            gsap.set(mobileNav, {
              autoAlpha: 1,
              zIndex: 240,
              pointerEvents: "auto",
            });
          },
          onUpdate: () => {
            gsap.set(mobileNav, {
              autoAlpha: 1,
              zIndex: 240,
              pointerEvents: "auto",
            });
          },
        });

        return () => {
          pinTrigger.kill();
          gsap.set(mobileNav, { clearProps: "all" });
        };
      });

      mm.add("(min-width: 768px) and (max-width: 1279px)", () => {
        const mobileNav = mobileNavRef.current;

        if (!mobileNav) return undefined;

        gsap.set(mobileNav, {
          zIndex: 220,
          force3D: true,
        });

        const getTabletNavPinDistance = () => {
          const naturalHeight = browser.scrollHeight || browser.offsetHeight || 0;

          const deckScrollDistance = visibleSections.reduce((total, section) => {
            const transitions = Math.max((section.tours?.length || 1) - 1, 1);
            const step = window.innerWidth < 1024 ? 520 : 540;
            return total + (transitions + 1.25) * step;
          }, 0);

          const navHeight = mobileNav.offsetHeight || 142;
          const safetyBuffer = window.innerHeight * 0.9;

          const documentHeight =
            document.documentElement.scrollHeight || document.body.scrollHeight || 0;

          return Math.max(
            naturalHeight + deckScrollDistance - navHeight,
            deckScrollDistance + safetyBuffer,
            documentHeight,
            window.innerHeight * 12
          );
        };

        const pinTrigger = ScrollTrigger.create({
          id: "tours-tablet-category-nav-pin",
          trigger: browser,
          start: () => `top ${getMobileNavTopOffset()}px`,
          end: () => `+=${getTabletNavPinDistance()}`,
          pin: mobileNav,
          pinSpacing: false,
          pinReparent: true,
          pinType: "fixed",
          anticipatePin: 1,
          refreshPriority: 2,
          invalidateOnRefresh: true,
          onRefresh: () => {
            const navHeight = mobileNav.offsetHeight || 142;
            document.documentElement.style.setProperty("--tour-category-nav-height", `${navHeight}px`);
            gsap.set(mobileNav, {
              autoAlpha: 1,
              zIndex: 240,
              pointerEvents: "auto",
            });
          },
          onUpdate: () => {
            gsap.set(mobileNav, {
              autoAlpha: 1,
              zIndex: 240,
              pointerEvents: "auto",
            });
          },
        });

        return () => {
          pinTrigger.kill();
          gsap.set(mobileNav, { clearProps: "all" });
        };
      });

      const refreshFrame = window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          ScrollTrigger.refresh();
          ScrollTrigger.update();
        });
      });

      return () => {
        window.cancelAnimationFrame(refreshFrame);
      };
    }, browser);

    return () => {
      if (mm) mm.revert();
      ctx.revert();
    };
  }, [visibleSections, activateCategory]);

  const scrollTo = (id) => {
    const el = document.getElementById(id);

    if (!el) return;

    activateCategory(id);

    gsap.to(window, {
      scrollTo: {
        y: el,
        offsetY: getDeckPinTopOffset() + 18,
      },
      duration: 0.78,
      ease: "power3.inOut",
    });
  };

  return (
    <>
      {createPortal(
        <aside
          ref={desktopRailPortalRef}
          data-desktop-category-rail-portal
          className="fixed hidden xl:block z-[300] pointer-events-none transition-opacity duration-150"
          style={{
            top: "calc(50vh - 7.75rem)",
            left: "max(0.75rem, calc(50% - 32rem - 9rem))",
            width: "8rem",
            opacity: 0,
            visibility: "hidden",
          }}
        >
          <div className="w-full overflow-y-auto rounded-[1.75rem] bg-black/42 backdrop-blur-md border border-white/10 shadow-[0_14px_38px_rgba(0,0,0,0.11)] p-2 pointer-events-auto">
            <div className="mt-2.5 flex flex-col gap-1.5">
              {visibleSections.map((section, index) => (
                <BrowseButton
                  key={`desktop-portal-${section.id}`}
                  section={section}
                  index={index}
                  active={activeCategory === section.id}
                  compact
                  onClick={() => scrollTo(section.id)}
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
        </aside>,
        document.body,
      )}

      <div ref={browserRef} className="relative bg-stone-200/0 overflow-visible pt-5 sm:pt-6 lg:pt-7 xl:pt-0">


      <aside
        ref={railSlotRef}
        className="hidden xl:block absolute z-[90] pointer-events-none opacity-0"
        style={{
          top: "calc(50vh - 7.75rem)",
          left: "max(0.75rem, calc(50% - 32rem - 9rem))",
          width: "8rem",
        }}
      >
        <div
          ref={railRef}
          className="w-full overflow-y-auto rounded-[1.75rem] bg-black/42 backdrop-blur-md border border-white/10 shadow-[0_14px_38px_rgba(0,0,0,0.11)] p-2 pointer-events-auto"
          style={{ opacity: 0 }}
        >
          <div className="mt-2.5 flex flex-col gap-1.5">
            {visibleSections.map((section, index) => (
              <BrowseButton
                key={section.id}
                section={section}
                index={index}
                active={activeCategory === section.id}
                compact
                onClick={() => scrollTo(section.id)}
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

      <main className="relative z-10 max-w-5xl mx-auto px-4 xl:px-0 pb-24 w-full overflow-visible">
        <div
          ref={mobileNavRef}
          data-mobile-category-nav
          className="relative z-[220] mt-8 mb-3 pointer-events-auto sm:mt-10 xl:hidden"
        >
          <div className="rounded-[1.25rem] border border-white/10 bg-black/72 p-1.5 backdrop-blur-md shadow-[0_12px_35px_rgba(0,0,0,0.16)] sm:p-2">
            <div
              ref={mobileNavScrollerRef}
              className="flex snap-x snap-mandatory gap-1.5 overflow-x-auto scroll-smooth pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] md:grid md:grid-cols-4 md:overflow-visible md:pb-0 [&::-webkit-scrollbar]:hidden"
            >
              {visibleSections.map((section, index) => (
                <div
                  key={section.id}
                  ref={(el) => {
                    if (el) {
                      mobileCategoryItemRefs.current[section.id] = el;
                    }
                  }}
                  className="min-w-[8rem] flex-1 snap-start md:min-w-0"
                >
                  <BrowseButton
                    section={section}
                    index={index}
                    active={activeCategory === section.id}
                    compact
                    onClick={() => scrollTo(section.id)}
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
                  {String(currentTourIndex + 1).padStart(2, "0")} / {String(currentTourTotal || 1).padStart(2, "0")}
                </span>
              </div>
            </div>
          </div>
        </div>
        {visibleSections.map((section) => (
          <CategorySection
            key={section.id}
            section={section}
            sectionTours={section.tours}
            onTourProgress={handleTourProgress}
          />
        ))}
      </main>
      </div>
    </>
  );
}