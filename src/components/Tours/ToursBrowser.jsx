import {
  useRef,
  useEffect,
  useLayoutEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { createPortal } from "react-dom";
import { gsap } from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useNavigate } from "react-router-dom";
import { tours, TOUR_TYPES, TOUR_MODIFIERS, FX_RATES } from "/src/data/tours.js";

gsap.registerPlugin(ScrollToPlugin, ScrollTrigger);

const DESKTOP_DECK_PIN_TOP_OFFSET = 104;
const RESPONSIVE_DECK_PIN_TOP_OFFSET = 176;

const getDeckPinTopOffset = () => {
  if (typeof window === "undefined") return DESKTOP_DECK_PIN_TOP_OFFSET;
  return window.innerWidth < 1280
    ? RESPONSIVE_DECK_PIN_TOP_OFFSET
    : DESKTOP_DECK_PIN_TOP_OFFSET;
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
          ${
            followCursor
              ? "left-0 top-0 opacity-0"
              : positionClasses[position] || positionClasses.top
          }
          ${
            followCursor
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
                className="h-6 w-6 object-contain"
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
              className={`rounded-full border px-3 py-1.5 text-xs font-bitter ${
                isCustom
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
                        <img
                          key={`${tour.slug}-preview-image-${index}`}
                          src={image}
                          alt={`${tour.title} ${index + 1}`}
                          className="h-36 sm:h-44 w-full rounded-3xl object-cover"
                          loading="lazy"
                          decoding="async"
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
      className="w-full rounded-[1.5rem] sm:rounded-[2rem] shadow-[0_14px_42px_rgba(0,0,0,0.08)] sm:shadow-[0_18px_60px_rgba(0,0,0,0.08)] my-3 sm:my-5 overflow-hidden relative border border-black/5 bg-white"
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
          className={`absolute inset-0 z-30 bg-black/55 backdrop-blur-[1.5px] transition-all duration-500 ease-out pointer-events-none ${
            open ? "opacity-100" : "opacity-0"
          }`}
        />

        <div
          className={`grid grid-cols-1 md:grid-cols-2 text-black font-bitter bg-white min-h-[auto] md:min-h-[390px] xl:min-h-[420px] transition-all duration-500 ease-out ${
            open ? "scale-[0.985] brightness-75" : "scale-100 brightness-100"
          }`}
        >
          <div data-card-image-panel className="relative overflow-hidden min-h-[210px] sm:min-h-[280px] md:min-h-[390px] xl:min-h-[420px] bg-black">
            <img
              data-card-image
              ref={imgRef}
              src={tour.image}
              alt={tour.title}
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
              decoding="async"
              style={{ willChange: "transform" }}
              onError={(e) => {
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

            <div className="absolute top-5 left-5 right-5 z-20 flex items-start justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-green-200/95 border border-white/25 px-4 py-1.5 text-xs text-green-950 font-bitter font-semibold shadow-lg">
                  {categoryLabel}
                </span>

                <span className="rounded-full bg-white/15 backdrop-blur-md border border-white/20 px-4 py-1.5 text-xs text-white/90 font-bitter shadow-lg">
                  {typeLabel}
                </span>
              </div>

              <div className="h-14 w-14 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex flex-col items-center justify-center shadow-lg shrink-0">
                <span className="text-white font-frank text-xl font-bold leading-none">
                  {tour.rating}
                </span>

                <span className="text-[10px] text-white/65 font-bitter leading-none mt-1">
                  rating
                </span>
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 z-20 p-5 sm:p-6 md:p-7 xl:p-8">
              <div className="relative">
                <span className="text-white/55 text-[11px] uppercase tracking-[0.22em] font-bitter">
                  {categoryLabel} · {typeLabel}
                </span>

                <h3 className="mt-3 text-white font-frank text-3xl sm:text-4xl xl:text-5xl font-bold leading-[0.9] drop-shadow-lg max-w-[12ch]">
                  {tour.title}
                </h3>

                <div className="mt-5 h-px w-24 bg-green-200/80" />
              </div>
            </div>
          </div>

          <div ref={contentRef} data-card-content-panel className="flex flex-col bg-white">
            <div className="flex-1 p-4 sm:p-5 md:p-7 xl:p-8 flex flex-col justify-between gap-3.5 sm:gap-5 xl:gap-6">
              <div data-card-stagger-item className="flex items-end justify-between gap-5">
                <div>
                  <span className="block leading-none text-[11px] uppercase tracking-[0.2em] text-red-400 font-bitter">
                    From
                  </span>

                  <div ref={priceRef} style={{ opacity: 0 }} className="mt-0.5">
                    <p className="flex items-end gap-2">
                      <span className="font-frank font-bold text-neutral-950 tracking-tight leading-none text-3xl sm:text-4xl xl:text-5xl">
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
                    className="w-fit flex justify-center items-center p-4
                    rounded-2xl text-lg border border-black/10 bg-neutral-50 text-neutral-700 
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

              <div ref={metaWrapRef} data-card-stagger-item className="grid grid-cols-2 gap-3">
                <div className="group rounded-2xl bg-neutral-50 border border-black/5 px-4 py-4 transition-all duration-300 hover:bg-green-200 hover:border-green-300 hover:-translate-y-0.5">
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

                  <p className="mt-2 text-sm text-neutral-700 group-hover:text-green-950 leading-snug font-bitter transition-colors">
                    {locationText}
                  </p>
                </div>

                <div className="group rounded-2xl bg-neutral-50 border border-black/5 px-4 py-4 transition-all duration-300 hover:bg-green-200 hover:border-green-300 hover:-translate-y-0.5">
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

                  <p className="mt-2 text-sm text-neutral-700 group-hover:text-green-950 leading-snug font-bitter transition-colors">
                    {toText(tour.duration, "Flexible")}
                  </p>
                </div>
              </div>

              <div
                data-card-stagger-item
                ref={reviewWrapRef}
                className={`${reviewOpen ? "flex min-h-[260px]" : "block"}`}
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
                    className={`w-full text-left rounded-3xl border px-5 py-4 overflow-hidden transition-colors duration-500
                      ${
                        reviewOpen
                          ? "h-full min-h-[260px] flex flex-col justify-between bg-green-200 border-green-300 shadow-sm will-change-transform"
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
                      className={`mt-3 text-sm text-neutral-600 italic leading-relaxed transition-all duration-300
                        ${reviewOpen ? "line-clamp-none text-base" : "line-clamp-2"}`}
                    >
                      “{toText(tour.mainReview, "A highly rated Cape Town experience.")}”
                    </p>

                    <div className="mt-4 flex items-center justify-between gap-3">
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
              <div className="px-4 sm:px-6 md:px-7 xl:px-8 py-3.5 sm:py-5 border-t border-black/5 bg-neutral-50 flex items-center justify-between gap-3">
                <button
                  onClick={handleToggle}
                  className="flex items-center justify-center gap-2 px-5 py-2 rounded-full border border-black/10 text-neutral-600
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
                  className="px-6 py-2 hero-gradient rounded-full text-sm font-bitter font-semibold text-white
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
          className={`relative z-40 transition-all duration-500 ease-out ${
            open ? "-mt-[32rem] sm:-mt-44 md:-mt-48" : "mt-0"
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

function CategorySection({ section, sectionTours }) {
  const sectionRef = useRef(null);
  const pinRef = useRef(null);
  const cardRefs = useRef([]);

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
      });

      const cardParts = cards.map(getCardParts);

      const setPinHeight = () => {
        const tallestCard = Math.max(
          ...cards.map((card) => card.offsetHeight || card.scrollHeight || 520)
        );

        gsap.set(pinEl, {
          minHeight: Math.max(tallestCard + 8, window.innerWidth < 1024 ? 430 : 490),
        });
      };

      setPinHeight();

      gsap.set(cards, {
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
        width: "100%",
        autoAlpha: 1,
        clipPath: "inset(0% 0% 0% 0%)",
        transformOrigin: "center center",
        willChange: "clip-path, transform",
      });

      cards.forEach((card, index) => {
        const parts = cardParts[index];

        gsap.set(card, {
          zIndex: cards.length - index,
          pointerEvents: index === 0 ? "auto" : "none",
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
            yPercent: index === 0 ? 0 : 8,
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
      });

      const transitions = Math.max(cards.length - 1, 1);

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionEl,
          start: () => `top ${getDeckPinTopOffset()}px`,
          end: () => `+=${transitions * (window.innerWidth < 768 ? 320 : window.innerWidth < 1024 ? 360 : 400)}`,
          pin: pinEl,
          pinSpacing: true,
          scrub: 0.32,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          snap:
            cards.length > 1
              ? {
                  snapTo: (value) => {
                    const steps = cards.length - 1;
                    return Math.round(value * steps) / steps;
                  },
                  duration: { min: 0.07, max: 0.16 },
                  delay: 0.01,
                  ease: "power2.out",
                }
              : false,
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

        tl.set(currentCard, { pointerEvents: "auto" }, at);
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

        if (previous.image) {
          tl.to(
            previous.image,
            {
              yPercent: -12,
              scale: 1.08,
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
              yPercent: 9,
              scale: 1.08,
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
      });

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
        });
      };
    });

    return () => mm.revert();
  }, [section.id, sectionTours]);

  return (
    <section ref={sectionRef} id={section.id} className="scroll-mt-24 md:scroll-mt-28 py-2 md:py-3">
      <div ref={pinRef} className="relative w-full overflow-visible">
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
                <TourCard tour={tour} decked />
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


function BrowseButton({ section, index, active, onClick, compact = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative w-full rounded-2xl text-left transition-all duration-300 ${
        compact ? "px-3 py-2.5" : "px-3.5 py-3"
      } ${
        active
          ? "bg-white/95 text-neutral-950 shadow-[0_10px_30px_rgba(0,0,0,0.12)]"
          : "text-white/72 hover:text-white hover:bg-white/10"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`h-9 w-9 rounded-xl flex items-center justify-center border transition-all duration-300 shrink-0 ${
            active
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
            className={`text-[9px] font-bitter tracking-[0.14em] uppercase leading-none ${
              active ? "text-neutral-400" : "text-white/35"
            }`}
          >
            0{index + 1}
          </p>

          <p className="mt-1 font-bitter text-[13px] font-semibold leading-tight truncate">
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
  const [showMobileNav, setShowMobileNav] = useState(false);

  const browserRef = useRef(null);
  const railSlotRef = useRef(null);
  const railRef = useRef(null);
  const mobileNavRef = useRef(null);

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

  useEffect(() => {
    if (!activeCategory && visibleSections[0]?.id) {
      setActiveCategory(visibleSections[0].id);
    }
  }, [activeCategory, visibleSections]);

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

      mm.add("(max-width: 1279px)", () => {
        const mobileNavTrigger = ScrollTrigger.create({
          trigger: browser,
          start: "top top+=64",
          end: "bottom top+=120",
          onEnter: () => setShowMobileNav(true),
          onEnterBack: () => setShowMobileNav(true),
          onLeave: () => setShowMobileNav(false),
          onLeaveBack: () => setShowMobileNav(false),
        });

        return () => {
          mobileNavTrigger.kill();
          setShowMobileNav(false);
        };
      });

      mm.add("(min-width: 1280px)", () => {
        const pinTrigger = ScrollTrigger.create({
          trigger: browser,
          start: "top top",
          end: "bottom bottom",
          pin: railSlot,
          pinSpacing: false,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        });

        return () => {
          pinTrigger.kill();
        };
      });

      visibleSections.forEach((section) => {
        ScrollTrigger.create({
          trigger: `#${section.id}`,
          start: "top center",
          end: "bottom center",
          onEnter: () => setActiveCategory(section.id),
          onEnterBack: () => setActiveCategory(section.id),
        });
      });

      ScrollTrigger.refresh();
    }, browser);

    return () => {
      if (mm) mm.revert();
      ctx.revert();
    };
  }, [visibleSections]);


  const scrollTo = (id) => {
    const el = document.getElementById(id);

    if (!el) return;

    gsap.to(window, {
      scrollTo: {
        y: el,
        offsetY: getDeckPinTopOffset() + 18,
      },
      duration: 0.9,
      ease: "expo.inOut",
    });
  };

  return (
    <div ref={browserRef} className="relative bg-stone-200/0 overflow-visible">
      <div
        ref={mobileNavRef}
        className={`xl:hidden fixed left-0 right-0 top-16 md:top-20 z-[120] px-4 pt-3 transition-all duration-300 ${
          showMobileNav
            ? "translate-y-0 opacity-100 pointer-events-auto"
            : "-translate-y-4 opacity-0 pointer-events-none"
        }`}
      >
        <div className="mx-auto max-w-5xl">
          <div className="rounded-[1.5rem] border border-white/10 bg-black/68 p-2 backdrop-blur-md shadow-[0_12px_35px_rgba(0,0,0,0.16)] sm:p-2.5">
            <div className="mb-2 flex items-center justify-between px-1 sm:px-2">
              <div>
                <p className="font-bitter text-[9px] uppercase tracking-[0.2em] text-white/45 leading-none">
                  Browse tours
                </p>
                <p className="mt-1 font-bitter text-sm font-semibold text-white/92">
                  {currentSection?.label || "Tours"}
                </p>
              </div>
              <div className="rounded-full bg-white/8 px-2.5 py-1 font-bitter text-[10px] uppercase tracking-[0.16em] text-white/55">
                categories
              </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 md:grid md:grid-cols-4 md:overflow-visible md:pb-0">
              {visibleSections.map((section, index) => (
                <div key={section.id} className="min-w-[9rem] flex-1 md:min-w-0">
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
          </div>
        </div>
      </div>

      <div className="xl:hidden h-[8.75rem] md:h-[8.25rem]" />

      <aside
        ref={railSlotRef}
        className="hidden xl:block absolute z-[90] pointer-events-none"
        style={{
          top: "calc(50vh - 7.75rem)",
          left: "max(1rem, calc(50% - 32rem - 11rem))",
          width: "10rem",
        }}
      >
        <div
          ref={railRef}
          className="w-full overflow-y-auto rounded-[1.75rem] bg-black/42 backdrop-blur-md border border-white/10 shadow-[0_14px_38px_rgba(0,0,0,0.11)] p-2.5 pointer-events-auto"
          style={{ opacity: 0 }}
        >
          {/* <div className="px-2.5 pt-2 pb-3 border-b border-white/10">
            <p className="text-[9px] uppercase tracking-[0.22em] text-white/42 font-bitter">
              Browse
            </p>

            <h3 className="mt-1 font-frank text-xl leading-none text-white">
              Tours
            </h3>
          </div> */}

          <div className="mt-2.5 flex flex-col gap-1.5">
            {visibleSections.map((section, index) => (
              <BrowseButton
                key={section.id}
                section={section}
                index={index}
                active={activeCategory === section.id}
                onClick={() => scrollTo(section.id)}
              />
            ))}
          </div>
        </div>
      </aside>

      <main className="relative z-10 max-w-5xl mx-auto px-0 pb-24 w-full overflow-visible">
        {visibleSections.map((section) => (
          <CategorySection
            key={section.id}
            section={section}
            sectionTours={section.tours}
          />
        ))}
      </main>
    </div>
  );
}