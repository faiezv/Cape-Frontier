import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { tours } from "../data/tours";
import Booking from "./Booking";
import ContactPlatforms from "/src/components/ContactPlatforms.jsx";
import { useLoadingNavigate } from "/src/components/useLoadingNavigate.jsx";

gsap.registerPlugin(ScrollToPlugin, ScrollTrigger);

const PIN_TOP_OFFSET = 96;

const formatMoney = (amount, currencyCode = "ZAR") =>
  new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: 2,
  }).format(amount);

const formatCompactMoney = (amount, currencyCode = "ZAR") =>
  new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: 0,
  }).format(amount);

const getItemText = (item) => {
  if (!item) return "";
  return typeof item === "string" ? item : item.text || item.name || "";
};

const getShortLocation = (location = "") => {
  const firstPart = location.split(",")[0]?.trim();
  return firstPart || location || "Pickup";
};

const formatTimeWithPeriod = (value = "") => {
  if (!value) return "";

  const text = String(value).replace(/\b(am|pm)\b/gi, (match) =>
    match.toUpperCase()
  );

  return text.replace(
    /\b([01]?\d|2[0-3])(?::|h)([0-5]\d)\b(?!\s*(?:AM|PM))/g,
    (_, hourText, minuteText) => {
      const hour = Number(hourText);
      const period = hour >= 12 ? "PM" : "AM";
      const displayHour = hour % 12 || 12;

      return `${displayHour}:${minuteText} ${period}`;
    }
  );
};

const getAllTourGalleryImages = (tour) => {
  if (!tour) return [];

  return [
    tour.image,
    ...(tour.images || []),
    ...(tour.destinationGalleries || []).flatMap(
      (destination) => destination.images || []
    ),
    ...(tour.stops || []).flatMap((stop) => stop.images || []),
  ]
    .filter(Boolean)
    .filter((src, index, array) => array.indexOf(src) === index);
};

const formatBadgeLabel = (value = "") =>
  String(value)
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const getHeroBadges = (tour) => {
  if (!tour) return [];

  const badges = [tour.category, tour.duration, tour.type]
    .map(formatBadgeLabel)
    .filter(Boolean);

  const seen = new Set();

  return badges.filter((badge) => {
    const key = badge.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const getRelatedTours = (tour) => {
  if (!tour) return [];

  const sameType = tours.filter(
    (item) => item.slug !== tour.slug && item.type === tour.type
  );

  const sameCategory = tours.filter(
    (item) =>
      item.slug !== tour.slug &&
      item.category === tour.category &&
      !sameType.some((match) => match.slug === item.slug)
  );

  const capeTownFallback = tours.filter(
    (item) =>
      item.slug !== tour.slug &&
      /cape town|sea point|cbd|camps bay|peninsula|table/i.test(
        `${item.location || ""} ${item.title || ""}`
      ) &&
      !sameType.some((match) => match.slug === item.slug) &&
      !sameCategory.some((match) => match.slug === item.slug)
  );

  return [...sameType, ...sameCategory, ...capeTownFallback].slice(0, 4);
};

const BookingIcon = ({ className = "h-4 w-4" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M8 6h13" />
    <path d="M8 12h13" />
    <path d="M8 18h13" />
    <path d="m3 6 1 1 2-2" />
    <path d="m3 12 1 1 2-2" />
    <path d="m3 18 1 1 2-2" />
  </svg>
);

const RouteIcon = ({ className = "h-4 w-4" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M6 19a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
    <path d="M18 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
    <path d="M8.2 14.8 15.8 9.2" />
  </svg>
);

export default function TourDetails() {
  const { slug } = useParams();
  const navigate = useLoadingNavigate();
  const location = useLocation();

  const mobileBookingRef = useRef(null);
  const desktopBookingRef = useRef(null);
  const readyCardRef = useRef(null);
  const contentColumnRef = useRef(null);
  const desktopContentSectionRef = useRef(null);

  const itinerarySectionRef = useRef(null);
  const itineraryPinRef = useRef(null);
  const itineraryTextRefs = useRef([]);
  const itineraryImageRefs = useRef([]);
  const activeItineraryIndexRef = useRef(0);

  const [activeItineraryIndex, setActiveItineraryIndex] = useState(0);

  const [isCompactLayout, setIsCompactLayout] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(max-width: 1023px)").matches;
  });
  const [showAllGalleryImages, setShowAllGalleryImages] = useState(false);
  const [mobileGalleryVisibleCount, setMobileGalleryVisibleCount] = useState(3);

  const tour = tours.find((item) => item.slug === slug);

  const galleryImages = useMemo(() => {
    if (!tour) return [];
    return getAllTourGalleryImages(tour);
  }, [tour]);

  const visibleGalleryImages = useMemo(() => {
    if (galleryImages.length <= 9) return galleryImages;
    return galleryImages.slice(0, 8);
  }, [galleryImages]);

  const extraGalleryImages = useMemo(() => {
    if (galleryImages.length <= 9) return [];
    return galleryImages.slice(8);
  }, [galleryImages]);

  const hiddenGalleryCount = extraGalleryImages.length;
  const hasHiddenGalleryImages = hiddenGalleryCount > 0;

  const mobileHiddenGalleryCount = Math.max(
    galleryImages.length - mobileGalleryVisibleCount,
    0
  );

  const hasMoreMobileGalleryImages = isCompactLayout && mobileHiddenGalleryCount > 0;

  const galleryImagesForLayout = useMemo(() => {
    if (isCompactLayout) {
      return galleryImages.slice(0, mobileGalleryVisibleCount);
    }

    return visibleGalleryImages;
  }, [galleryImages, isCompactLayout, mobileGalleryVisibleCount, visibleGalleryImages]);

  const heroBadges = useMemo(() => getHeroBadges(tour), [tour]);

  const relatedTours = useMemo(() => getRelatedTours(tour), [tour]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const media = window.matchMedia("(max-width: 1023px)");

    const updateLayout = () => {
      setIsCompactLayout(media.matches);
    };

    updateLayout();

    if (media.addEventListener) {
      media.addEventListener("change", updateLayout);
    } else {
      media.addListener(updateLayout);
    }

    return () => {
      if (media.removeEventListener) {
        media.removeEventListener("change", updateLayout);
      } else {
        media.removeListener(updateLayout);
      }
    };
  }, []);

  useEffect(() => {
    setShowAllGalleryImages(false);
    setMobileGalleryVisibleCount(3);
    activeItineraryIndexRef.current = 0;
    setActiveItineraryIndex(0);
  }, [slug]);

  useEffect(() => {
    if (!tour) return;

    document.title =
      tour.seo?.title || `${tour.title} | Cape Frontier Travel & Tours`;

    const metaDescription =
      document.querySelector("meta[name='description']") ||
      document.createElement("meta");

    metaDescription.setAttribute("name", "description");
    metaDescription.setAttribute(
      "content",
      tour.seo?.description || tour.description
    );

    document.head.appendChild(metaDescription);
  }, [tour]);

  /*
    KEEP: desktop booking card pin logic.
    Only styling around the pinned card changed.
  */
  useLayoutEffect(() => {
    if (!tour || !readyCardRef.current || !desktopContentSectionRef.current) return;

    const mm = gsap.matchMedia();

    mm.add("(min-width: 1024px)", () => {
      const trigger = ScrollTrigger.create({
        trigger: readyCardRef.current,
        start: `top ${PIN_TOP_OFFSET}px`,
        endTrigger: desktopContentSectionRef.current,
        end: () => {
          const pinnedHeight = readyCardRef.current?.offsetHeight || 0;
          return `bottom ${PIN_TOP_OFFSET + pinnedHeight + 24}px`;
        },
        pin: true,
        pinSpacing: false,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      });

      ScrollTrigger.refresh();

      return () => trigger.kill();
    });

    return () => mm.revert();
  }, [tour]);

  /*
    KEEP: stop-by-stop desktop pin logic.
    Visual sizes were tightened, but ScrollTrigger pin/snap behavior is preserved.
  */
  useLayoutEffect(() => {
    if (!tour || !itineraryPinRef.current || !itinerarySectionRef.current) {
      return;
    }

    const textFrames = itineraryTextRefs.current.filter(Boolean);
    const imageFrames = itineraryImageRefs.current.filter(Boolean);

    if (textFrames.length < 2 || imageFrames.length < 2) return;

    const mm = gsap.matchMedia();

    mm.add("(min-width: 1024px)", () => {
      const stopCount = textFrames.length;
      const snapStep = 1 / Math.max(stopCount - 1, 1);

      gsap.set(textFrames, {
        position: "absolute",
        inset: 0,
        autoAlpha: 0,
        y: 26,
        filter: "blur(1px)",
        pointerEvents: "none",
        willChange: "transform, opacity, filter",
      });

      gsap.set(textFrames[0], {
        autoAlpha: 1,
        y: 0,
        filter: "blur(0px)",
        pointerEvents: "auto",
      });

      gsap.set(imageFrames, {
        position: "absolute",
        inset: 0,
        xPercent: 105,
        opacity: 1,
        scale: 0.98,
        willChange: "transform",
      });

      gsap.set(imageFrames[0], {
        xPercent: 0,
        scale: 1,
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: itinerarySectionRef.current,
          start: "top top",
          end: () => `+=${Math.max(stopCount - 1, 1) * 560}`,
          pin: itineraryPinRef.current,
          pinSpacing: true,
          scrub: 0.35,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          snap: {
            snapTo: (progress) => Math.round(progress / snapStep) * snapStep,
            duration: { min: 0.08, max: 0.22 },
            delay: 0.01,
            ease: "power3.out",
          },
          onUpdate: (self) => {
            const nextIndex = Math.max(
              0,
              Math.min(stopCount - 1, Math.round(self.progress * (stopCount - 1)))
            );

            if (activeItineraryIndexRef.current !== nextIndex) {
              activeItineraryIndexRef.current = nextIndex;
              setActiveItineraryIndex(nextIndex);
            }
          },
        },
      });

      tl.addLabel("stop-0", 0);

      textFrames.forEach((frame, index) => {
        if (index === 0) return;

        const previousText = textFrames[index - 1];
        const currentText = textFrames[index];
        const previousImage = imageFrames[index - 1];
        const currentImage = imageFrames[index];

        const transitionStart = index - 0.42;

        tl.addLabel(`stop-${index}`, index);

        tl.to(
          previousText,
          {
            y: -24,
            autoAlpha: 0,
            filter: "blur(1px)",
            pointerEvents: "none",
            duration: 0.18,
            ease: "none",
          },
          transitionStart
        );

        tl.to(
          currentText,
          {
            y: 0,
            autoAlpha: 1,
            filter: "blur(0px)",
            pointerEvents: "auto",
            duration: 0.18,
            ease: "none",
          },
          transitionStart + 0.14
        );

        tl.to(
          previousImage,
          {
            xPercent: -105,
            scale: 0.98,
            duration: 0.34,
            ease: "none",
          },
          transitionStart
        );

        tl.to(
          currentImage,
          {
            xPercent: 0,
            scale: 1,
            duration: 0.34,
            ease: "none",
          },
          transitionStart
        );
      });

      tl.to({}, { duration: 0.15 }, stopCount - 1);

      ScrollTrigger.refresh();

      return () => {
        tl.scrollTrigger?.kill();
        tl.kill();

        gsap.set([...textFrames, ...imageFrames], {
          clearProps:
            "position,inset,transform,opacity,visibility,filter,pointerEvents,willChange,scale",
        });
      };
    });

    return () => mm.revert();
  }, [tour]);

  useEffect(() => {
    if (location.hash !== "#booking") return;

    const target = isCompactLayout
      ? mobileBookingRef.current
      : desktopBookingRef.current;

    if (!target) return;

    setTimeout(() => {
      gsap.to(window, {
        scrollTo: {
          y: target,
          offsetY: isCompactLayout ? 64 : 80,
        },
        duration: 0.85,
        ease: "expo.inOut",
      });
    }, 200);
  }, [location.hash, isCompactLayout]);

  if (!tour) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center">
        <h1 className="font-frank text-4xl font-bold">Tour not found</h1>

        <p className="mt-3 font-bitter text-neutral-500">
          This tour may have been moved or renamed.
        </p>

        <button
          onClick={() => navigate("/")}
          className="hero-gradient mt-6 rounded-full px-6 py-3 font-bitter font-semibold text-white"
        >
          Back Home
        </button>
      </main>
    );
  }

  const scrollToBooking = () => {
    const target = isCompactLayout
      ? mobileBookingRef.current
      : desktopBookingRef.current;

    if (!target) return;

    gsap.to(window, {
      scrollTo: {
        y: target,
        offsetY: isCompactLayout ? 64 : 80,
      },
      duration: 0.85,
      ease: "expo.inOut",
    });
  };

  const scrollToItinerary = () => {
    gsap.to(window, {
      scrollTo: {
        y: "#itinerary",
        offsetY: 0,
      },
      duration: 1,
      ease: "expo.inOut",
    });
  };

  const goBackToPreviousScroll = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate("/");
  };

  const toggleGalleryImages = () => {
    setShowAllGalleryImages((current) => !current);

    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });

    window.setTimeout(() => {
      ScrollTrigger.refresh();
    }, 260);
  };

  const showMoreMobileGalleryImages = () => {
    setMobileGalleryVisibleCount((current) =>
      Math.min(current + 3, galleryImages.length)
    );

    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });

    window.setTimeout(() => {
      ScrollTrigger.refresh();
    }, 260);
  };

  useEffect(() => {
    if (!location.hash) return

    const id = location.hash.replace('#', '')

    const element = document.getElementById(id)

    if (!element) return

    requestAnimationFrame(() => {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    })
  }, [location])

  return (
    <main className="bg-white text-black">
      <style>{`
        .short-screen-route-skip {
          display: none;
        }

        @media (min-width: 1024px) and (max-height: 599px) {
          .normal-route-skip {
            display: none !important;
          }

          .short-screen-route-skip {
            display: flex;
          }
        }
      `}</style>
      {/* HERO */}
      <section className="relative min-h-[68svh] overflow-hidden bg-black text-white sm:min-h-[70svh] lg:min-h-[88vh]">
        <img
          src={tour.image}
          alt={tour.title}
          className="absolute inset-0 h-full w-full object-cover object-center"
          fetchPriority="high"
          decoding="async"
        />

        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.92),rgba(0,0,0,0.52),rgba(0,0,0,0.16))]" />

        <div className="relative z-10 mx-auto flex min-h-[68svh] max-w-6xl items-end justify-center px-4 pb-14 pt-24 text-center sm:min-h-[70svh] sm:px-5 sm:pb-14 lg:min-h-[88vh] lg:items-center lg:py-16">
          <div className="flex max-w-4xl flex-col items-center justify-center">
            <div className="mb-4 flex flex-wrap justify-center gap-2 lg:mb-5">
              {heroBadges.map((badge, index) => (
                <span
                  key={badge}
                  className={
                    index === 0
                      ? "rounded-full bg-green-200 px-3 py-1.5 font-bitter text-[11px] font-semibold text-green-950 lg:px-4 lg:text-xs"
                      : "rounded-full border border-white/20 bg-white/15 px-3 py-1.5 font-bitter text-[11px] backdrop-blur-md lg:px-4 lg:text-xs"
                  }
                >
                  {badge}
                </span>
              ))}
            </div>

            <h1 className="max-w-[22rem] font-frank text-[2.45rem] font-bold leading-[0.92] sm:max-w-3xl sm:text-5xl md:text-6xl lg:text-7xl">
              {tour.title}
            </h1>

            <p className="mt-4 max-w-[22rem] font-bitter text-sm leading-relaxed text-white/75 sm:max-w-xl md:text-base lg:max-w-2xl">
              {tour.description}
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3 lg:mt-8">
              <button
                onClick={scrollToBooking}
                className="hero-gradient rounded-full px-6 py-3 font-bitter text-sm font-semibold text-white shadow-lg transition-all active:scale-95 lg:px-7"
              >
                <span className="sm:hidden">Book</span>
                <span className="hidden sm:inline">Book this tour</span>
              </button>

              <button
                onClick={scrollToItinerary}
                className="hidden rounded-full border border-white/20 bg-white/10 px-7 py-3 font-bitter text-sm font-semibold backdrop-blur-md transition-all hover:bg-white/20 md:inline-flex"
              >
                View route
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK INFO */}
      <section className="relative z-20 mx-auto -mt-7 max-w-6xl px-4 lg:-mt-10 lg:px-5">
        <div className="grid grid-cols-2 gap-2 rounded-[1rem] border border-blue-100 bg-blue-50/90 p-2 shadow-[0_18px_60px_rgba(37,99,235,0.12)] backdrop-blur sm:grid-cols-4 lg:gap-3 lg:rounded-[1.35rem] lg:bg-white lg:p-4">
          <InfoCard
            icon={<PriceIcon />}
            label="From"
            value={`${formatMoney(tour.priceBase)} pp`}
            mobileValue={`${formatCompactMoney(tour.priceBase)} pp`}
          />

          <InfoCard
            icon={<MapPinIcon />}
            label="Location"
            value={tour.location}
            mobileValue={getShortLocation(tour.location)}
          />

          <InfoCard
            icon={<DurationIcon />}
            label="Duration"
            value={tour.duration}
            mobileValue={tour.duration}
          />

          <InfoCard
            icon={<RatingIcon />}
            label="Rating"
            value={`${tour.rating} / 5`}
            mobileValue={`${tour.rating}`}
          />
        </div>
      </section>

      {/* TOUR CONTENT */}
      <section
        ref={desktopContentSectionRef}
        className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 pt-12 pb-12 sm:px-5 lg:px-5 lg:pt-20 lg:pb-14 lg:grid-cols-[1.32fr_0.68fr] xl:gap-10"
      >
        <div ref={contentColumnRef} className="space-y-9">
          <ContentBlock eyebrow="Overview" title="About this experience">
            <p className="font-bitter leading-relaxed text-neutral-600">
              {tour.description}
            </p>
          </ContentBlock>

          <ContentBlock eyebrow="Gallery" title="Tour photos">
            {galleryImagesForLayout.length > 0 ? (
              <>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {galleryImagesForLayout.map((image, index) => (
                    <button
                      key={`${image}-${index}`}
                      type="button"
                      className={`group relative overflow-hidden rounded-[1.25rem] bg-blue-50 ${index === 0 ? "sm:col-span-2 xl:col-span-2" : ""
                        }`}
                    >
                      <img
                        src={image}
                        alt={`${tour.title} gallery image ${index + 1}`}
                        loading={index < 3 ? "eager" : "lazy"}
                        decoding="async"
                        onLoad={() => ScrollTrigger.refresh()}
                        className={`w-full object-cover transition duration-500 group-hover:scale-[1.04] ${index === 0 ? "h-56 md:h-72" : "h-40"
                          }`}
                      />
                    </button>
                  ))}

                  {((isCompactLayout && hasMoreMobileGalleryImages) || (!isCompactLayout && hasHiddenGalleryImages && !showAllGalleryImages)) && (
                    <button
                      type="button"
                      onClick={isCompactLayout ? showMoreMobileGalleryImages : toggleGalleryImages}
                      className="group flex h-40 flex-col items-center justify-center rounded-[1.25rem] border border-blue-100 bg-blue-50/85 p-4 text-center transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-100"
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white font-bitter text-lg font-bold text-blue-700 shadow-sm">
                        +
                      </span>
                      <span className="mt-3 font-bitter text-sm font-bold text-neutral-950">
                        Click to see more
                      </span>
                      <span className="mt-1 font-bitter text-xs text-blue-600">
                        {isCompactLayout
                          ? `${Math.min(3, mobileHiddenGalleryCount)} more photos`
                          : `${hiddenGalleryCount} more photos`}
                      </span>
                    </button>
                  )}
                </div>

                {!isCompactLayout && hasHiddenGalleryImages && (
                  <div
                    className={`grid grid-cols-1 gap-3 overflow-hidden transition-[max-height,opacity,margin] duration-700 ease-out sm:grid-cols-2 xl:grid-cols-3 ${showAllGalleryImages
                      ? "mt-3 max-h-[2600px] opacity-100"
                      : "mt-0 max-h-0 opacity-0"
                      }`}
                  >
                    {extraGalleryImages.map((image, index) => (
                      <button
                        key={`${image}-extra-${index}`}
                        type="button"
                        className="group overflow-hidden rounded-[1.25rem] bg-blue-50"
                      >
                        <img
                          src={image}
                          alt={`${tour.title} extra gallery image ${index + 9}`}
                          loading="lazy"
                          decoding="async"
                          onLoad={() => ScrollTrigger.refresh()}
                          className="h-40 w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                        />
                      </button>
                    ))}
                  </div>
                )}

                {!isCompactLayout && showAllGalleryImages && hasHiddenGalleryImages && (
                  <button
                    type="button"
                    onClick={toggleGalleryImages}
                    className="mt-4 inline-flex rounded-full border border-blue-100 bg-white px-4 py-2 font-bitter text-xs font-bold text-blue-700 transition hover:bg-blue-50"
                  >
                    Collapse photos
                  </button>
                )}
              </>
            ) : (
              <div className="rounded-[1.25rem] border border-blue-100 bg-blue-50/70 p-6 font-bitter text-sm text-neutral-500">
                Gallery images coming soon.
              </div>
            )}
          </ContentBlock>

          <IncludedExcludedGrid tour={tour} />

          <ContentBlock eyebrow="Highlights" title="Perks">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {tour.highlights?.map((item, index) => (
                <TickCard key={index} text={getItemText(item)} />
              ))}
            </div>
          </ContentBlock>
        </div>

        <aside className="hidden h-fit lg:block lg:pt-0">
          <div ref={readyCardRef} className="space-y-4">
            <button
              type="button"
              onClick={goBackToPreviousScroll}
              className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50/80 px-4 py-2 font-bitter text-xs font-bold text-blue-700 transition hover:border-blue-200 hover:bg-blue-100"
            >
              <span aria-hidden="true">←</span>
              Back to tours
            </button>

            <div className="rounded-[1.35rem] border border-blue-100 bg-blue-50/70 p-5 shadow-[0_18px_50px_rgba(37,99,235,0.08)]"
            >
              <span className="inline-flex rounded-full bg-green-200 px-3 py-1 font-bitter text-[10px] font-bold uppercase tracking-[0.14em] text-green-950">
                current tour
              </span>

              <h3 className="mt-3 font-frank text-3xl font-bold leading-none">
                Request {tour.title}
              </h3>

              <p className="mt-3 font-bitter text-sm leading-relaxed text-neutral-600">
                This opens the booking form with <strong>{tour.title}</strong>{" "}
                already attached.
              </p>

              <button
                onClick={scrollToBooking}
                className="hero-gradient mt-5 flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 font-bitter text-sm font-semibold text-white"
              >
                <BookingIcon />
                Request this tour
              </button>

              {relatedTours.length > 0 && (
                <div className="mt-6">
                  <p className="font-bitter text-[10px] font-bold uppercase tracking-[0.18em] text-blue-600">
                    Related tours
                  </p>

                  <div className="mt-3 space-y-2">
                    {relatedTours.map((item) => (
                      <RelatedTourCard
                        key={item.slug}
                        tour={item}
                        onClick={() => navigate(`/tours/${item.slug}`)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </aside>
      </section>

      {/* ITINERARY */}
      <section
        ref={itinerarySectionRef}
        id="itinerary"
        className="overflow-hidden border-y border-blue-100 bg-blue-50/45"
      >
        <div
          ref={itineraryPinRef}
          className="mx-auto max-w-6xl px-4 py-10 lg:px-5 lg:py-10"
        >
          <div className="relative z-30 flex flex-col gap-5 rounded-[1.25rem] bg-blue-50/85 p-4 lg:flex-row lg:items-end lg:justify-between lg:gap-6 lg:p-5">
            <div className="max-w-2xl">
              <span className="font-bitter text-[11px] uppercase tracking-[0.24em] text-blue-600">
                Full Itinerary
              </span>

              <h2 className="mt-2 font-frank text-3xl font-bold leading-none sm:text-4xl lg:text-5xl">
                Your route, stop by stop
              </h2>

              <p className="mt-3 font-bitter text-sm leading-relaxed text-neutral-600 lg:hidden">
                Compact route preview. Open a stop only when you need more
                detail.
              </p>

              <p className="mt-4 hidden font-bitter leading-relaxed text-neutral-600 lg:block">
                Scroll through the route while each stop detail and image snaps
                into the same focused frame.
              </p>
            </div>

            <div className="hidden rounded-full border border-blue-100 bg-white px-4 py-2 font-bitter text-xs font-semibold text-neutral-500 shadow-[0_12px_30px_rgba(37,99,235,0.06)] lg:block">
              snap through {tour.stops?.length || 0} stops
            </div>
          </div>

          {/* Desktop pinned animation */}
          <div className="hidden lg:grid lg:grid-cols-[0.96fr_1.04fr] lg:items-start lg:gap-8">
            <div className="relative min-h-[460px] overflow-hidden rounded-[1.5rem] border border-blue-100 bg-white p-7 shadow-[0_20px_65px_rgba(37,99,235,0.08)] lg:min-h-[500px] lg:p-8">
              {tour.stops?.map((stop, index) => (
                <div
                  key={`${stop.id || stop.name}-text-${index}`}
                  ref={(el) => {
                    itineraryTextRefs.current[index] = el;
                  }}
                  className="relative"
                >
                  <ItineraryTextFrame
                    stop={stop}
                    index={index}
                    activeTime={tour.stops?.[activeItineraryIndex]?.time}
                  />
                </div>
              ))}

            </div>

            <div className="space-y-4">
              <div className="relative min-h-[460px] overflow-hidden rounded-[1.5rem] lg:min-h-[500px]">
                {tour.stops?.map((stop, index) => (
                  <div
                    key={`${stop.id || stop.name}-image-${index}`}
                    ref={(el) => {
                      itineraryImageRefs.current[index] = el;
                    }}
                    className="relative"
                  >
                    <ItineraryImageFrame stop={stop} index={index} />
                  </div>
                ))}
              </div>

              <div className="short-screen-route-skip justify-center">
                <button
                  type="button"
                  onClick={scrollToBooking}
                  className="hero-gradient inline-flex items-center justify-center rounded-full px-7 py-3 font-bitter text-sm font-semibold text-white shadow-[0_14px_34px_rgba(0,0,0,0.14)] transition hover:-translate-y-0.5 active:scale-95"
                >
                  Skip to booking form
                </button>
              </div>
            </div>
          </div>

          <div className="normal-route-skip relative z-40 mt-6 hidden justify-center lg:flex">
            <button
              type="button"
              onClick={scrollToBooking}
              className="hero-gradient inline-flex items-center justify-center rounded-full px-7 py-3 font-bitter text-sm font-semibold text-white shadow-[0_14px_34px_rgba(0,0,0,0.14)] transition hover:-translate-y-0.5 active:scale-95"
            >
              Skip to booking form
            </button>
          </div>

          {/* Mobile/tablet full route swipe - renders every stop */}
          <div className="mt-8 lg:hidden">
            <MobileItineraryCarousel stops={tour.stops || []} />
          </div>

          <div className="mt-6 lg:hidden">
            <MobileRequestCard
              tour={tour}
              relatedTours={relatedTours}
              scrollToBooking={scrollToBooking}
              navigate={navigate}
            />
          </div>


        </div>
      </section>

      {/* BOOKING FORM AT BOTTOM */}
      <section
        ref={(el) => {
          mobileBookingRef.current = el;
          desktopBookingRef.current = el;
        }}
        id="booking"
        className="py-12 text-white sm:py-14 lg:py-16"
      >
        <Booking embeddedTour={tour} bookingData={location.state?.bookingData} />
      </section>

      {/* CONTACT OPTIONS */}
      <section className="max-w-5xl mx-auto flex justify-center border border-black/5 px-4 py-10 sm:px-5 lg:py-12">
        <ContactPlatforms />
      </section>

      {/* NEED TO KNOW + FAQ */}
      <section className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 py-12 sm:px-5 lg:px-5 lg:py-14 lg:grid-cols-2">
        <ContentBlock eyebrow="Before you go" title="Need to know">
          <div className="grid grid-cols-1 gap-3">
            {tour.needToKnow?.map((item, index) => (
              <TickCard key={index} text={getItemText(item)} />
            ))}
          </div>
        </ContentBlock>

        <ContentBlock eyebrow="Questions" title="FAQ">
          <div className="grid grid-cols-1 gap-3">
            {tour.faqs?.map((faq, index) => (
              <div
                key={index}
                className="rounded-[1.25rem] border border-blue-100 bg-blue-50/65 p-5"
              >
                <p className="font-bitter font-semibold text-neutral-900">
                  {faq.question}
                </p>

                <p className="mt-2 font-bitter text-sm leading-relaxed text-neutral-600">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </ContentBlock>
      </section>
    </main>
  );
}

function PriceIcon() {
  return (
    <span className="font-bitter text-xs font-black leading-none lg:text-sm">
      R
    </span>
  );
}

function MapPinIcon() {
  return (
    <img
      src="/icons/mapPin.png"
      alt=""
      className="h-4 w-4 object-contain lg:h-5 lg:w-5"
      loading="lazy"
      decoding="async"
    />
  );
}

function DurationIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 lg:h-5 lg:w-5"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4l2.5 2" />
    </svg>
  );
}

function RatingIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-4 w-4 text-blue-700 lg:h-5 lg:w-5"
      aria-hidden="true"
    >
      <path d="m12 2.8 2.8 5.7 6.3.9-4.55 4.45 1.08 6.27L12 17.15l-5.63 2.97 1.08-6.27L2.9 9.4l6.3-.9L12 2.8Z" />
    </svg>
  );
}

function InfoCard({ label, value, icon, mobileValue }) {
  return (
    <div className="rounded-[0.9rem] border border-blue-100 bg-white/78 p-2 shadow-[0_8px_22px_rgba(37,99,235,0.05)] lg:rounded-[1.1rem] lg:p-4">
      <div className="flex h-full min-h-[3.1rem] items-center gap-2 lg:min-h-[3.6rem] lg:gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-700 shadow-sm lg:h-10 lg:w-10">
          {icon}
        </span>

        <div className="min-w-0 flex-1">
          <span className="block truncate font-bitter text-[9px] uppercase tracking-[0.14em] text-blue-400 sm:text-[10px] lg:text-[11px]">
            {label}
          </span>

          <p className="mt-0.5 truncate font-bitter text-[11px] font-semibold leading-snug text-neutral-900 sm:text-xs lg:text-base">
            <span className="lg:hidden">{mobileValue || value}</span>
            <span className="hidden lg:inline">{value}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

function MobileTripEssentials({ tour, galleryImages, scrollToBooking }) {
  const visibleGallery = galleryImages.slice(0, 4);

  return (
    <section className="mx-auto max-w-6xl px-4 py-7 sm:px-5 lg:hidden">
      <div className="rounded-[1.25rem] border border-blue-100 bg-blue-50/70 p-3 shadow-[0_14px_40px_rgba(37,99,235,0.08)] sm:p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="font-bitter text-[10px] uppercase tracking-[0.22em] text-blue-600">
              Essentials
            </span>

            <h2 className="mt-1 truncate font-frank text-2xl font-bold leading-none sm:text-3xl">
              Trip info
            </h2>
          </div>

          <button
            type="button"
            onClick={scrollToBooking}
            className="hero-gradient flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 font-bitter text-xs font-semibold text-white"
          >
            <BookingIcon />
            Book
          </button>
        </div>

        <div className="mt-4 grid grid-cols-4 gap-2">
          <MiniFact icon="P" label="Pickup" value="Included" />
          <MiniFact icon="C" label="Confirm" value="Manual" />
          <MiniFact icon="S" label="Secure" value="Checkout" />
          <MiniFact icon="G" label="Group" value="Rates" />
        </div>

        <div className="mt-4 space-y-2">
          {tour.included?.length > 0 && (
            <MobileAccordion title="Included" count={tour.included.length} defaultOpen>
              <div className="grid gap-2 sm:grid-cols-2">
                {tour.included.slice(0, 6).map((item, index) => (
                  <CompactLineItem key={index} text={getItemText(item)} />
                ))}
              </div>
            </MobileAccordion>
          )}

          {tour.excluded?.length > 0 && (
            <MobileAccordion title="Not included" count={tour.excluded.length}>
              <div className="grid gap-2 sm:grid-cols-2">
                {tour.excluded.slice(0, 6).map((item, index) => (
                  <CompactLineItem
                    key={index}
                    text={getItemText(item)}
                    variant="plain"
                  />
                ))}
              </div>
            </MobileAccordion>
          )}

          {tour.highlights?.length > 0 && (
            <MobileAccordion
              title="Highlights"
              count={tour.highlights.length}
            >
              <div className="grid gap-2 sm:grid-cols-2">
                {tour.highlights.slice(0, 4).map((item, index) => (
                  <CompactLineItem key={index} text={getItemText(item)} />
                ))}
              </div>
            </MobileAccordion>
          )}

          {visibleGallery.length > 0 && (
            <MobileAccordion title="Photos" count={galleryImages.length}>
              <div className="grid grid-cols-4 gap-2">
                {visibleGallery.map((image, index) => (
                  <img
                    key={`${image}-${index}`}
                    src={image}
                    alt={`${tour.title} preview ${index + 1}`}
                    loading="lazy"
                    decoding="async"
                    className="h-16 w-full rounded-[0.9rem] object-cover sm:h-24"
                  />
                ))}
              </div>
            </MobileAccordion>
          )}
        </div>
      </div>
    </section>
  );
}

function MobileAfterBookingInfo({ tour }) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-7 sm:px-5 lg:hidden">
      <div className="space-y-2">
        {tour.needToKnow?.length > 0 && (
          <MobileAccordion title="Need to know" count={tour.needToKnow.length}>
            <div className="grid gap-2 sm:grid-cols-2">
              {tour.needToKnow.slice(0, 6).map((item, index) => (
                <CompactLineItem key={index} text={getItemText(item)} />
              ))}
            </div>
          </MobileAccordion>
        )}

        {tour.faqs?.length > 0 && (
          <MobileAccordion title="FAQ" count={tour.faqs.length}>
            <div className="space-y-2">
              {tour.faqs.slice(0, 5).map((faq, index) => (
                <div
                  key={index}
                  className="rounded-[1rem] border border-blue-100 bg-white p-4"
                >
                  <p className="font-bitter text-sm font-semibold text-neutral-900">
                    {faq.question}
                  </p>

                  <p className="mt-2 font-bitter text-xs leading-relaxed text-neutral-600">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </MobileAccordion>
        )}
      </div>
    </section>
  );
}

function MobileAccordion({ title, count, defaultOpen = false, children }) {
  return (
    <details
      open={defaultOpen}
      className="group rounded-[1rem] border border-blue-100 bg-white shadow-[0_8px_24px_rgba(37,99,235,0.05)]"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-3 font-bitter [&::-webkit-details-marker]:hidden">
        <span className="text-sm font-semibold text-neutral-900">{title}</span>

        <span className="flex items-center gap-2">
          {typeof count === "number" && (
            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-500">
              {count}
            </span>
          )}

          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-700 transition-transform group-open:rotate-45">
            +
          </span>
        </span>
      </summary>

      <div className="px-3 pb-3">{children}</div>
    </details>
  );
}

function MiniFact({ icon, label, value }) {
  return (
    <div className="rounded-[0.9rem] border border-blue-100 bg-white p-2 text-center">
      <span className="mx-auto flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 font-bitter text-[10px] font-bold text-blue-700 shadow-sm">
        {icon}
      </span>

      <p className="mt-1.5 truncate font-bitter text-[10px] font-semibold leading-tight text-neutral-900 sm:text-xs">
        {value}
      </p>

      <p className="mt-0.5 hidden font-bitter text-[9px] uppercase tracking-[0.14em] text-blue-400 sm:block">
        {label}
      </p>
    </div>
  );
}

function CompactLineItem({ text, variant = "tick" }) {
  return (
    <div className="flex gap-2 rounded-[0.9rem] border border-blue-100 bg-white p-3">
      <span
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-bitter text-xs font-bold ${variant === "plain"
          ? "bg-blue-50 text-blue-500"
          : "bg-green-200 text-green-950"
          }`}
      >
        {variant === "plain" ? "—" : "✓"}
      </span>

      <p className="font-bitter text-xs leading-relaxed text-neutral-600 sm:text-sm">
        {text}
      </p>
    </div>
  );
}

function ContentBlock({ eyebrow, title, children }) {
  return (
    <section>
      <span className="font-bitter text-[11px] uppercase tracking-[0.24em] text-blue-600">
        {eyebrow}
      </span>

      <h2 className="mt-2 font-frank text-4xl font-bold leading-none md:text-5xl">
        {title}
      </h2>

      <div className="mt-5">{children}</div>
    </section>
  );
}

function IncludedExcludedGrid({ tour }) {
  const included = tour.included || [];
  const excluded = tour.excluded || [];

  if (!included.length && !excluded.length) return null;

  return (
    <ContentBlock eyebrow="Trip clarity" title="Included and not included">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="rounded-[1.25rem] border border-green-200 bg-green-50/80 p-4">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-200 font-bitter text-sm font-bold text-green-950">
              ✓
            </span>
            <p className="font-bitter text-sm font-bold text-green-950">
              Included
            </p>
          </div>

          <div className="space-y-2">
            {included.slice(0, 6).map((item, index) => (
              <CompactLineItem key={index} text={getItemText(item)} />
            ))}
          </div>
        </div>

        {excluded.length > 0 && (
          <div className="rounded-[1.25rem] border border-blue-100 bg-blue-50/80 p-4">
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white font-bitter text-sm font-bold text-blue-600">
                —
              </span>
              <p className="font-bitter text-sm font-bold text-neutral-900">
                Not included
              </p>
            </div>

            <div className="space-y-2">
              {excluded.slice(0, 6).map((item, index) => (
                <CompactLineItem
                  key={index}
                  text={getItemText(item)}
                  variant="plain"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </ContentBlock>
  );
}

function TickCard({ text }) {
  return (
    <div className="flex gap-3 rounded-[1.1rem] border border-blue-100 bg-blue-50/55 p-4">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-200 text-green-950">
        ✓
      </span>

      <p className="font-bitter text-sm leading-relaxed text-neutral-600">
        {text}
      </p>
    </div>
  );
}

function MobileRequestCard({ tour, relatedTours, scrollToBooking, navigate }) {
  return (
    <div className="rounded-[1.25rem] border border-blue-100 bg-white p-4 shadow-[0_14px_36px_rgba(37,99,235,0.08)]">
      <span className="inline-flex rounded-full bg-green-200 px-3 py-1 font-bitter text-[10px] font-bold uppercase tracking-[0.14em] text-green-950">
        current tour
      </span>

      <h3 className="mt-3 font-frank text-3xl font-bold leading-none">
        Request {tour.title}
      </h3>

      <p className="mt-3 font-bitter text-sm leading-relaxed text-neutral-600">
        This opens the booking form with <strong>{tour.title}</strong> already attached.
      </p>

      <button
        type="button"
        onClick={scrollToBooking}
        className="hero-gradient mt-5 flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 font-bitter text-sm font-semibold text-white"
      >
        <BookingIcon />
        Request this tour
      </button>

      {relatedTours.length > 0 && (
        <div className="mt-5">
          <p className="font-bitter text-[10px] font-bold uppercase tracking-[0.18em] text-blue-600">
            Related tours
          </p>

          <div className="mt-3 space-y-2">
            {relatedTours.slice(0, 3).map((item) => (
              <RelatedTourCard
                key={item.slug}
                tour={item}
                onClick={() => navigate(`/tours/${item.slug}`)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function RelatedTourCard({ tour, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center gap-3 rounded-[1rem] border border-blue-100 bg-white p-2 text-left transition hover:-translate-y-0.5 hover:border-blue-200"
    >
      <img
        src={tour.image}
        alt=""
        className="h-14 w-16 shrink-0 rounded-[0.8rem] object-cover"
        loading="lazy"
        decoding="async"
      />

      <div className="min-w-0 flex-1">
        <p className="truncate font-bitter text-xs font-bold text-neutral-950">
          {tour.title}
        </p>
        <p className="mt-1 truncate font-bitter text-[10px] text-blue-500">
          {tour.location || "Cape Town"}
        </p>
      </div>

      <RouteIcon className="h-4 w-4 shrink-0 text-blue-500 transition group-hover:translate-x-0.5" />
    </button>
  );
}

function getTimeParts(value = "") {
  const formatted = formatTimeWithPeriod(value);

  if (!formatted) {
    return {
      hour: "--",
      minute: "--",
      period: "",
      label: "",
    };
  }

  const match = formatted.match(/\b(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?\b/i);

  if (!match) {
    return {
      hour: formatted,
      minute: "",
      period: "",
      label: formatted,
    };
  }

  return {
    hour: match[1],
    minute: match[2] || "00",
    period: (match[3] || "").toUpperCase(),
    label: formatted,
  };
}

function AnimatedStopTime({ time }) {
  const nextParts = useMemo(() => getTimeParts(time), [time]);
  const [displayParts, setDisplayParts] = useState(nextParts);
  const displayPartsRef = useRef(nextParts);

  const hourRef = useRef(null);
  const minuteRef = useRef(null);
  const periodRef = useRef(null);

  useEffect(() => {
    displayPartsRef.current = displayParts;
  }, [displayParts]);

  useLayoutEffect(() => {
    const currentParts = displayPartsRef.current;

    if (currentParts.label === nextParts.label) return undefined;

    const hourChanged =
      currentParts.hour !== nextParts.hour ||
      currentParts.period !== nextParts.period;

    const minuteChanged = currentParts.minute !== nextParts.minute;

    const targets = [
      ...(hourChanged ? [hourRef.current, periodRef.current] : []),
      ...(hourChanged || minuteChanged ? [minuteRef.current] : []),
    ].filter(Boolean);

    if (!targets.length) {
      displayPartsRef.current = nextParts;
      setDisplayParts(nextParts);
      return undefined;
    }

    const tl = gsap.timeline({
      defaults: {
        overwrite: "auto",
      },
      onComplete: () => {
        displayPartsRef.current = nextParts;
      },
    });

    tl.to(targets, {
      y: -16,
      autoAlpha: 0,
      duration: 0.16,
      ease: "power2.in",
      stagger: 0.025,
      onComplete: () => {
        setDisplayParts(nextParts);
      },
    });

    tl.fromTo(
      targets,
      {
        y: 18,
        autoAlpha: 0,
      },
      {
        y: 0,
        autoAlpha: 1,
        duration: 0.24,
        ease: "power2.out",
        stagger: 0.025,
      }
    );

    return () => tl.kill();
  }, [nextParts.hour, nextParts.minute, nextParts.period, nextParts.label]);

  return (
    <div className="rounded-[1.15rem] border border-blue-100 bg-white/95 px-4 py-2.5 shadow-[0_16px_34px_rgba(37,99,235,0.10)]">
      <p className="font-bitter text-[10px] font-bold uppercase tracking-[0.18em] text-blue-500">
        Time
      </p>

      <div className="mt-1 flex items-end gap-1 overflow-hidden font-frank font-bold leading-none text-neutral-950">
        <span ref={hourRef} className="inline-block text-3xl">
          {displayParts.hour}
        </span>

        {displayParts.minute && (
          <>
            <span className="pb-0.5 text-2xl">:</span>
            <span ref={minuteRef} className="inline-block text-3xl">
              {displayParts.minute}
            </span>
          </>
        )}

        {displayParts.period && (
          <span
            ref={periodRef}
            className="inline-block pb-1.5 pl-1 font-bitter text-xs font-black tracking-[0.16em] text-blue-600"
          >
            {displayParts.period}
          </span>
        )}
      </div>
    </div>
  );
}

function ItineraryTextFrame({ stop, index, activeTime }) {
  const hasMapLink = Boolean(stop.exactLocation?.googleMapsUrl);

  return (
    <div className="flex h-full flex-col p-5 lg:p-6">
      <div>
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-200 font-bitter text-sm font-bold text-green-950 shadow-[0_10px_22px_rgba(0,0,0,0.08)]">
            {index + 1}
          </div>

          <div>
            <span className="font-bitter text-[11px] uppercase tracking-[0.24em] text-blue-600">
              {stop.duration || "Tour stop"}
            </span>

            <h3 className="mt-1 font-frank text-3xl font-bold leading-none md:text-[2.15rem]">
              {stop.name}
            </h3>
          </div>
        </div>

        <p className="font-bitter text-sm leading-relaxed text-neutral-600">
          {stop.description || stop.note}
        </p>

        <div className="mt-4">
          <AnimatedStopTime time={activeTime || stop.time} />
        </div>

        {stop.exactLocation &&
          (hasMapLink ? (
            <a
              href={stop.exactLocation.googleMapsUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 flex items-start gap-3 rounded-[1.1rem] border border-blue-100 bg-blue-50/70 p-4 transition-colors hover:bg-green-200"
            >
              <img
                src="/icons/mapPin.png"
                alt=""
                className="mt-0.5 h-5 w-5 object-contain"
              />

              <div>
                <p className="font-bitter text-sm font-semibold text-neutral-900">
                  {stop.exactLocation.label}
                </p>

                <p className="mt-1 font-bitter text-xs text-neutral-500">
                  {stop.exactLocation.address}
                </p>
              </div>
            </a>
          ) : (
            <div className="mt-4 flex items-start gap-3 rounded-[1.1rem] border border-blue-100 bg-blue-50/70 p-4">
              <img
                src="/icons/mapPin.png"
                alt=""
                className="mt-0.5 h-5 w-5 object-contain opacity-70"
              />

              <div>
                <p className="font-bitter text-sm font-semibold text-neutral-900">
                  {stop.exactLocation.label}
                </p>

                <p className="mt-1 font-bitter text-xs text-neutral-500">
                  {stop.exactLocation.address}
                </p>
              </div>
            </div>
          ))}

        {stop.touristComments?.length > 0 && (
          <div className="mt-4">
            <p className="font-bitter text-[10px] font-bold uppercase tracking-[0.18em] text-blue-600">
              Comments
            </p>

            <div className="mt-1.5 space-y-1.5">
              {stop.touristComments.slice(0, 2).map((comment, commentIndex) => (
                <div
                  key={`${comment.name}-${commentIndex}`}
                  className="rounded-[1rem] border border-blue-100 bg-blue-50/70 p-3"
                >
                  <p className="font-bitter text-sm leading-relaxed text-neutral-600">
                    “{comment.text}”
                  </p>

                  <p className="mt-1.5 font-bitter text-xs font-semibold text-neutral-900">
                    {comment.name} · {comment.country}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ItineraryImageFrame({ stop, index }) {
  const stopImages = stop.images || [];
  const isPickupStop =
    stop.id?.toLowerCase().includes("pickup") ||
    stop.name?.toLowerCase().includes("pickup") ||
    stop.name?.toLowerCase().includes("meeting point");

  const mainImage = stopImages[0];

  return (
    <div className="flex h-full flex-col">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="inline-flex rounded-full border border-blue-100 bg-white px-3 py-1 font-bitter text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-500 shadow-[0_10px_24px_rgba(37,99,235,0.06)]">
          stop {index + 1}
        </span>

        <span className="inline-flex rounded-full border border-blue-100 bg-white px-3 py-1 font-bitter text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-500 shadow-[0_10px_24px_rgba(37,99,235,0.06)]">
          {isPickupStop ? "pickup preview" : `${stopImages.length || 0} photos`}
        </span>
      </div>

      {mainImage ? (
        <img
          src={mainImage}
          alt={`${stop.name} main`}
          loading="lazy"
          decoding="async"
          onLoad={() => ScrollTrigger.refresh()}
          className={`w-full rounded-[1.35rem] border border-blue-100 bg-neutral-100 object-cover shadow-[0_18px_45px_rgba(0,0,0,0.10)] ${isPickupStop ? "h-[338px]" : "h-[224px]"
            }`}
        />
      ) : (
        <div
          className={`flex items-center justify-center rounded-[1.35rem] border border-blue-100 bg-neutral-100 font-bitter text-sm text-neutral-400 shadow-[0_18px_45px_rgba(0,0,0,0.10)] ${isPickupStop ? "h-[338px]" : "h-[224px]"
            }`}
        >
          Stop image coming soon
        </div>
      )}

      {!isPickupStop && stopImages.length > 1 && (
        <div className="mt-3 grid grid-cols-3 gap-3">
          {stopImages.slice(1, 4).map((image, imageIndex) => (
            <img
              key={`${stop.name}-${image}-${imageIndex}`}
              src={image}
              alt={`${stop.name} ${imageIndex + 2}`}
              loading="lazy"
              decoding="async"
              onLoad={() => ScrollTrigger.refresh()}
              className="h-24 w-full rounded-[1rem] border border-blue-100 bg-neutral-100 object-cover shadow-[0_12px_28px_rgba(0,0,0,0.08)]"
            />
          ))}
        </div>
      )}
    </div>
  );
}

function MobileItineraryCarousel({ stops }) {
  if (!stops.length) return null;

  return (
    <div className="-mx-4 overflow-visible sm:-mx-5">
      <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-4 touch-pan-x overscroll-x-contain sm:px-5 [scrollbar-width:thin]">
        {stops.map((stop, index) => {
          const mainImage = stop.images?.[0];
          const hasMapLink = Boolean(stop.exactLocation?.googleMapsUrl);

          return (
            <article
              key={stop.id || stop.name || index}
              className="min-h-[32rem] w-[84vw] max-w-[23rem] shrink-0 snap-center rounded-[1.35rem] border border-blue-100 bg-white p-3 shadow-[0_16px_38px_rgba(37,99,235,0.08)]"
            >
              {mainImage ? (
                <img
                  src={mainImage}
                  alt={`${stop.name} preview`}
                  loading="lazy"
                  decoding="async"
                  className="h-44 w-full rounded-[1rem] border border-blue-100 bg-blue-50 object-cover"
                />
              ) : (
                <div className="flex h-44 w-full items-center justify-center rounded-[1rem] border border-blue-100 bg-blue-50 font-bitter text-xs text-neutral-400">
                  Stop image coming soon
                </div>
              )}

              <div className="mt-4 flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-200 font-bitter text-xs font-bold text-green-950">
                  {index + 1}
                </div>

                <div className="min-w-0 flex-1">
                  <span className="block truncate font-bitter text-[10px] uppercase tracking-[0.18em] text-blue-600">
                    {stop.duration || "Tour stop"}
                  </span>

                  <h3 className="mt-1 font-frank text-2xl font-bold leading-none text-neutral-950">
                    {stop.name}
                  </h3>
                </div>
              </div>

              {stop.time && (
                <div className="mt-4 rounded-[1rem] border border-blue-100 bg-blue-50/75 px-4 py-3">
                  <p className="font-bitter text-[10px] font-bold uppercase tracking-[0.18em] text-blue-500">
                    Time
                  </p>
                  <p className="mt-1 font-frank text-3xl font-bold leading-none text-neutral-950">
                    {formatTimeWithPeriod(stop.time)}
                  </p>
                </div>
              )}

              {(stop.description || stop.note) && (
                <p className="mt-4 line-clamp-5 font-bitter text-xs leading-relaxed text-neutral-600">
                  {stop.description || stop.note}
                </p>
              )}

              {hasMapLink && (
                <a
                  href={stop.exactLocation.googleMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 flex w-fit items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 font-bitter text-xs font-bold text-blue-700"
                >
                  <img
                    src="/icons/mapPin.png"
                    alt=""
                    className="h-4 w-4 object-contain"
                  />
                  Open location
                </a>
              )}
            </article>
          );
        })}
      </div>

      <p className="p-4 text-center font-bitter text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-500 sm:px-5">
        swipe through all {stops.length} stops
      </p>
    </div>
  );
}

function MobileItineraryStop({ stop, index }) {
  const hasMapLink = Boolean(stop.exactLocation?.googleMapsUrl);
  const hasExtraDetail = Boolean(
    stop.description || stop.note || stop.exactLocation
  );

  return (
    <article className="rounded-[1.1rem] border border-blue-100 bg-white p-4 shadow-[0_12px_35px_rgba(37,99,235,0.06)]">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-200 font-bitter text-xs font-bold text-green-950">
          {index + 1}
        </div>

        <div className="min-w-0 flex-1">
          <span className="block truncate font-bitter text-[10px] uppercase tracking-[0.18em] text-blue-600">
            {formatTimeWithPeriod(stop.time) || "Tour stop"} {stop.duration ? `· ${stop.duration}` : ""}
          </span>

          <h3 className="mt-1 truncate font-frank text-2xl font-bold leading-none text-neutral-950">
            {stop.name}
          </h3>
        </div>

        {hasMapLink && (
          <a
            href={stop.exactLocation.googleMapsUrl}
            target="_blank"
            rel="noreferrer"
            aria-label={`Open ${stop.name} on map`}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-blue-100 bg-blue-50"
          >
            <img
              src="/icons/mapPin.png"
              alt=""
              className="h-4 w-4 object-contain"
            />
          </a>
        )}
      </div>

      {hasExtraDetail && (
        <details className="group mt-4">
          <summary className="flex cursor-pointer list-none items-center justify-between rounded-[0.9rem] bg-blue-50 px-3 py-2 font-bitter text-xs font-semibold text-neutral-600 [&::-webkit-details-marker]:hidden">
            View stop details

            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-bold transition-transform group-open:rotate-45">
              +
            </span>
          </summary>

          <div className="mt-3 rounded-[1rem] border border-blue-100 bg-blue-50/70 p-3">
            {(stop.description || stop.note) && (
              <p className="font-bitter text-xs leading-relaxed text-neutral-600">
                {stop.description || stop.note}
              </p>
            )}

            {stop.exactLocation && (
              <div className="mt-3 flex gap-2">
                <img
                  src="/icons/mapPin.png"
                  alt=""
                  className="mt-0.5 h-4 w-4 object-contain opacity-70"
                />

                <div>
                  <p className="font-bitter text-xs font-semibold text-neutral-900">
                    {stop.exactLocation.label}
                  </p>

                  <p className="mt-0.5 font-bitter text-[11px] leading-relaxed text-neutral-500">
                    {stop.exactLocation.address}
                  </p>
                </div>
              </div>
            )}
          </div>
        </details>
      )}
    </article>
  );
}
