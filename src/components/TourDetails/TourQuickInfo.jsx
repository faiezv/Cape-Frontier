import React, { useLayoutEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import reviews from "../../data/reviews.js";

const TourQuickInfo = ({
  tour,
  formatMoney,
  formatCompactMoney,
  getShortLocation,
  PriceIcon,
  MapPinIcon,
  DurationIcon,
  RatingIcon,
}) => {
  const safeTour = tour || {};

  const [activeItem, setActiveItem] = useState("price");

  const detailsRef = useRef(null);
  const detailContentRef = useRef(null);

  const tourReviews = useMemo(() => {
    if (!Array.isArray(reviews)) return [];

    const tourId = safeTour.id;
    const tourSlug = safeTour.slug;
    const tourTitle = safeTour.title || safeTour.name;

    return reviews.filter((review) => {
      if (!review) return false;

      const reviewTourId =
        review.tourId ||
        review.tour?.id ||
        review.tour_id;

      const reviewTourSlug =
        review.tourSlug ||
        review.tour?.slug ||
        review.tour_slug;

      const reviewTourName =
        review.tourName ||
        review.tourTitle ||
        review.tour?.title ||
        review.tour?.name;

      if (tourId && reviewTourId && reviewTourId === tourId) {
        return true;
      }

      if (tourSlug && reviewTourSlug && reviewTourSlug === tourSlug) {
        return true;
      }

      if (
        tourTitle &&
        reviewTourName &&
        String(reviewTourName).toLowerCase() ===
          String(tourTitle).toLowerCase()
      ) {
        return true;
      }

      return false;
    });
  }, [safeTour]);

  const averageRating = useMemo(() => {
    const ratings = tourReviews
      .map((review) => Number(review?.rating))
      .filter(Number.isFinite);

    if (!ratings.length) return null;

    return (
      ratings.reduce((total, rating) => total + rating, 0) / ratings.length
    );
  }, [tourReviews]);

  const formattedRating =
    typeof averageRating === "number" && Number.isFinite(averageRating)
      ? averageRating.toFixed(1)
      : null;

  const items = [
    {
      id: "price",
      label: "Price",
      icon: <PriceIcon />,
      title: "Starting price",
      value: formatMoney?.(safeTour.priceBase) || "Contact us",
      description:
        "This is the starting price per person for this experience. Your final price may vary depending on the selected options, group size, and extras.",
      accent: "price",
    },
    {
      id: "location",
      label: "Location",
      icon: <MapPinIcon />,
      title: "Where you'll go",
      value: safeTour.location || "Location available on request",
      description:
        "Your experience takes place here. Pickup options and the exact meeting point may depend on the tour and your selected booking preferences.",
      accent: "default",
    },
    {
      id: "duration",
      label: "Duration",
      icon: <DurationIcon />,
      title: "How long it takes",
      value: safeTour.duration || "Duration available on request",
      description:
        "This is the approximate duration of the experience, including the main activities described for this tour.",
      accent: "default",
    },
    {
      id: "reviews",
      label: "Reviews",
      icon: <RatingIcon />,
      title: "Guest reviews",
      value:
        tourReviews.length > 0
          ? `${formattedRating || "—"} / 5`
          : "Be the first to review this tour",
      description:
        tourReviews.length > 0
          ? `Based on ${tourReviews.length} ${
              tourReviews.length === 1 ? "guest review" : "guest reviews"
            }.`
          : "There are no reviews for this tour yet. Be the first guest to share your experience.",
      accent: "rating",
    },
  ];

  const activeItemData =
    items.find((item) => item.id === activeItem) || items[0];

  useLayoutEffect(() => {
    if (!detailsRef.current || !detailContentRef.current) return;

    const content = detailContentRef.current;

    gsap.killTweensOf([detailsRef.current, content]);

    gsap.set(content, {
      opacity: 0,
      y: 8,
    });

    gsap.fromTo(
      detailsRef.current,
      {
        height: 0,
      },
      {
        height: "auto",
        duration: 0.35,
        ease: "power3.out",
      }
    );

    gsap.to(content, {
      opacity: 1,
      y: 0,
      duration: 0.3,
      delay: 0.08,
      ease: "power2.out",
    });
  }, [activeItem]);

  if (!tour) return null;

  const handleSelect = (id) => {
    setActiveItem(id);
  };

  return (
    <section className="relative z-20 mx-auto w-full max-w-6xl px-4 py-5 sm:px-5 lg:px-6">
      <div className="overflow-hidden rounded-[1.5rem] border border-blue-100 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.10)]">

        {/* ------------------------------------------------ */}
        {/* INDICATOR                                       */}
        {/* ------------------------------------------------ */}

        <div className="border-b border-blue-50 bg-blue-50/40 px-4 py-2.5 text-center sm:px-6">
          <p className="font-bitter text-[10px] font-bold uppercase tracking-[0.18em] text-blue-500 sm:text-[11px]">
            Tap an icon to explore
          </p>
        </div>

        {/* ------------------------------------------------ */}
        {/* ICON BUTTONS                                    */}
        {/* ------------------------------------------------ */}

        <div className="grid grid-cols-4 border-b border-blue-100">

          {items.map((item) => {
            const isActive = activeItem === item.id;
            const isPrice = item.accent === "price";
            const isRating = item.accent === "rating";

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item.id)}
                aria-label={`Show ${item.label}`}
                aria-pressed={isActive}
                className={`
                  group relative flex min-h-[76px]
                  flex-col items-center justify-center
                  gap-1.5 px-2 py-3
                  transition-all duration-300
                  focus:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-inset
                  focus-visible:ring-blue-500
                  sm:min-h-[88px]
                  sm:gap-2
                  sm:py-4
                  ${
                    isActive
                      ? "bg-blue-50/70"
                      : "bg-white hover:bg-blue-50/40"
                  }
                  ${
                    item.id !== "reviews"
                      ? "border-r border-blue-100"
                      : ""
                  }
                `}
              >
                {/* Active indicator */}
                <span
                  className={`
                    absolute left-1/2 top-0 h-1
                    -translate-x-1/2 rounded-b-full
                    transition-all duration-300
                    ${
                      isActive
                        ? "w-10 bg-blue-600 sm:w-14"
                        : "w-0 bg-transparent"
                    }
                  `}
                />

                {/* Icon */}
                <span
                  className={`
                    flex h-10 w-10 items-center justify-center
                    rounded-full
                    transition-all duration-300
                    sm:h-11 sm:w-11
                    ${
                      isActive
                        ? isPrice
                          ? "bg-blue-600 text-white shadow-[0_6px_18px_rgba(37,99,235,0.25)]"
                          : isRating
                            ? "bg-amber-100 text-amber-600"
                            : "bg-blue-100 text-blue-700"
                        : isPrice
                          ? "bg-blue-50 text-blue-600"
                          : isRating
                            ? "bg-amber-50 text-amber-500"
                            : "bg-neutral-100 text-neutral-500"
                    }
                    group-hover:scale-105
                  `}
                >
                  {item.icon}
                </span>

                {/* Small label */}
                <span
                  className={`
                    font-bitter text-[9px]
                    font-bold uppercase
                    tracking-[0.12em]
                    transition-colors duration-300
                    sm:text-[10px]
                    ${
                      isActive
                        ? isRating
                          ? "text-amber-600"
                          : "text-blue-600"
                        : "text-neutral-400"
                    }
                  `}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* ------------------------------------------------ */}
        {/* ACTIVE VALUE CONTAINER                          */}
        {/* ------------------------------------------------ */}

        <div
          ref={detailsRef}
          className="h-0 overflow-hidden"
        >
          <div
            ref={detailContentRef}
            className="px-5 py-5 sm:px-7 sm:py-6 lg:px-8"
          >
            <div
              className={`
                rounded-2xl border p-4
                sm:p-5
                ${
                  activeItemData.accent === "price"
                    ? "border-blue-100 bg-blue-50/50"
                    : activeItemData.accent === "rating"
                      ? "border-amber-100 bg-amber-50/40"
                      : "border-neutral-100 bg-neutral-50/70"
                }
              `}
            >
              {/* Label */}
              <div className="mb-2 flex items-center gap-2">
                <span
                  className={`
                    flex h-7 w-7 shrink-0 items-center justify-center
                    rounded-full
                    ${
                      activeItemData.accent === "price"
                        ? "bg-blue-600 text-white"
                        : activeItemData.accent === "rating"
                          ? "bg-amber-100 text-amber-600"
                          : "bg-blue-100 text-blue-700"
                    }
                  `}
                >
                  {React.cloneElement(activeItemData.icon, {
                    className: "h-3.5 w-3.5",
                  })}
                </span>

                <span
                  className={`
                    font-bitter text-[10px]
                    font-bold uppercase
                    tracking-[0.16em]
                    ${
                      activeItemData.accent === "rating"
                        ? "text-amber-600"
                        : "text-blue-500"
                    }
                  `}
                >
                  {activeItemData.title}
                </span>
              </div>

              {/* Main value */}
              <p
                className={`
                  break-words font-bitter
                  text-lg font-bold leading-snug
                  sm:text-xl
                  ${
                    activeItemData.accent === "price"
                      ? "text-blue-700"
                      : activeItemData.accent === "rating"
                        ? "text-neutral-950"
                        : "text-neutral-950"
                  }
                `}
              >
                {activeItemData.value}
              </p>

              {/* Description */}
              <p className="mt-2 max-w-3xl font-bitter text-xs leading-relaxed text-neutral-500 sm:text-sm">
                {activeItemData.description}
              </p>

              {/* Reviews */}
              {activeItem === "reviews" && (
                <ReviewsPreview reviews={tourReviews} />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ====================================================== */
/* REVIEWS                                               */
/* ====================================================== */

function ReviewsPreview({ reviews }) {
  if (!reviews.length) {
    return (
      <div className="mt-4 border-t border-amber-100 pt-4">
        <p className="font-bitter text-sm font-semibold text-neutral-800">
          Be the first to review this tour
        </p>

        <p className="mt-1 font-bitter text-xs leading-relaxed text-neutral-500">
          After experiencing the tour, share your feedback and help future
          guests decide if this experience is right for them.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-5 border-t border-blue-100 pt-4">
      <div className="space-y-3">
        {reviews.slice(0, 3).map((review, index) => {
          const rating = Number(review?.rating);

          const reviewTitle =
            review?.title ||
            review?.headline ||
            "Guest review";

          const reviewText =
            review?.desc ||
            review?.description ||
            review?.review ||
            review?.text ||
            "";

          const reviewerName =
            review?.name ||
            review?.author ||
            "Guest";

          return (
            <div
              key={review?.id || `${reviewerName}-${index}`}
              className="rounded-xl border border-neutral-100 bg-white p-3.5 sm:p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-bitter text-sm font-bold text-neutral-900">
                    {reviewTitle}
                  </p>

                  <p className="mt-0.5 font-bitter text-xs text-neutral-400">
                    {reviewerName}
                  </p>
                </div>

                {Number.isFinite(rating) && (
                  <span className="shrink-0 rounded-full bg-amber-50 px-2 py-1 font-bitter text-[10px] font-bold text-amber-600">
                    ★ {rating.toFixed(1)}
                  </span>
                )}
              </div>

              {reviewText && (
                <p className="mt-2 font-bitter text-xs leading-relaxed text-neutral-600">
                  {reviewText}
                </p>
              )}

              {review?.date && (
                <p className="mt-2 font-bitter text-[10px] text-neutral-400">
                  {review.date}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {reviews.length > 3 && (
        <p className="mt-3 text-center font-bitter text-xs font-semibold text-blue-600">
          + {reviews.length - 3} more{" "}
          {reviews.length - 3 === 1 ? "review" : "reviews"}
        </p>
      )}
    </div>
  );
}

export default TourQuickInfo;