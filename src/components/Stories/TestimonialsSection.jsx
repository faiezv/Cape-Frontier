import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import reviews from "../../data/reviews.js";

const StarRating = ({ rating = 5, size = "w-5 h-5" }) => {
  const filledStars = Math.max(0, Math.min(5, Math.round(Number(rating) || 0)));
  const emptyStars = 5 - filledStars;

  return (
    <div className="flex gap-1">
      {[...Array(filledStars)].map((_, i) => (
        <svg
          key={`filled-${i}`}
          className={`${size} fill-current text-yellow-500`}
          viewBox="0 0 20 20"
        >
          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
        </svg>
      ))}

      {[...Array(emptyStars)].map((_, i) => (
        <svg
          key={`empty-${i}`}
          className={`${size} fill-current text-gray-300`}
          viewBox="0 0 20 20"
        >
          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
        </svg>
      ))}
    </div>
  );
};

const TourReviewImage = ({ src, alt }) => {
  return (
    <img
      src={src}
      alt={alt}
      className="z-10 h-full w-full object-cover transition-transform duration-500 hover:scale-110"
      loading="lazy"
    />
  );
};

const ReviewMeta = ({ review }) => {
  return (
    <div className="mt-auto flex items-center justify-between border-t border-green-300/50 pt-3">
      <div className="flex min-w-0 items-center gap-3">
        <img
          src={review.avatar}
          alt={review.name}
          className="h-9 w-9 shrink-0 rounded-full border-2 border-white object-cover shadow-sm lg:h-10 lg:w-10"
          loading="lazy"
        />

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-black">
            {review.name}
          </p>

          <p className="truncate text-xs text-gray-600">
            {review.country} · {review.date}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1 text-xs font-bold text-green-900">
        <span>{review.rating}</span>

        <svg
          className="h-5 w-5 text-green-700 opacity-60"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      </div>
    </div>
  );
};

const useIsMobileReviews = () => {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth < 768;
  });

  useEffect(() => {
    const update = () => {
      setIsMobile(window.innerWidth < 768);
    };

    update();

    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);

    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, []);

  return isMobile;
};

const TestimonialsSection = () => {
  const isMobileReviews = useIsMobileReviews();
  const [activeTopReviewIndex, setActiveTopReviewIndex] = useState(0);
  const topTrackRef = useRef(null);
  const topCardRefs = useRef([]);

  const topReviews = reviews
    .filter((review) =>
      ["Shark Cage Diving", "Paragliding", "Delaire Graff"].includes(
        review.tour
      )
    )
    .slice(0, 3);

  const topReviewIds = new Set(topReviews.map((review) => review.id));

  const priorityBottomTours = [
    "Gun Range Experience",
    "Snorkelling",
    "Rust en Vrede",
    "Spier Wine Farm",
  ];

  const bottomReviews = [
    ...priorityBottomTours
      .map((tourName) => reviews.find((review) => review.tour === tourName))
      .filter(Boolean),
    ...reviews.filter((review) => !topReviewIds.has(review.id)),
  ]
    .filter(
      (review, index, array) =>
        array.findIndex((item) => item.id === review.id) === index
    )
    .filter((review) => !topReviewIds.has(review.id))
    .slice(0, 4);

  useEffect(() => {
    if (!isMobileReviews || topReviews.length <= 1) return undefined;

    const interval = window.setInterval(() => {
      setActiveTopReviewIndex((current) => (current + 1) % topReviews.length);
    }, 2600);

    return () => window.clearInterval(interval);
  }, [isMobileReviews, topReviews.length]);

  useLayoutEffect(() => {
    if (!isMobileReviews) return;

    const track = topTrackRef.current;
    const activeCard = topCardRefs.current[activeTopReviewIndex];

    if (!track || !activeCard) return;

    const targetLeft =
      activeCard.offsetLeft - track.offsetLeft - (track.clientWidth - activeCard.clientWidth) / 2;

    track.scrollTo({
      left: Math.max(0, targetLeft),
      behavior: "smooth",
    });
  }, [activeTopReviewIndex, isMobileReviews]);

  return (
    <div className="w-full px-4 py-5 font-bitter md:py-">
      <div className="mx-auto max-w-5xl">
          {/* top reviews */}
          <div
            ref={topTrackRef}
            className="mb-7 flex h-[30.5rem] snap-x snap-mandatory items-center gap-3 overflow-x-auto pb-3 [-ms-overflow-style:none] [scrollbar-width:none] md:mb-10 md:grid md:h-auto md:grid-cols-3 md:items-stretch md:gap-4 md:overflow-visible md:pb-0 [&::-webkit-scrollbar]:hidden"
          >
            {topReviews.map((review, index) => {
              const isActiveMobile = isMobileReviews && index === activeTopReviewIndex;

              return (
                <div
                  key={review.id}
                  ref={(el) => {
                    topCardRefs.current[index] = el;
                  }}
                  onClick={() => setActiveTopReviewIndex(index)}
                  className={`relative z-10 flex h-[28.75rem] snap-center flex-col overflow-hidden rounded-2xl bg-green-200 shadow-lg transition-all duration-500 ease-out hover:scale-[1.02] md:h-full md:min-w-0 ${
                    isMobileReviews
                      ? isActiveMobile
                        ? "min-w-[84vw] scale-100 opacity-100 shadow-xl"
                        : "min-w-[64vw] scale-[0.92] opacity-70"
                      : ""
                  }`}
                >
                <div className="absolute z-20 flex gap-1 p-4">
                  <StarRating rating={review.rating} />
                </div>

                <div className="relative h-40 overflow-hidden md:h-48">
                  <TourReviewImage src={review.img} alt={review.tour} />

                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10" />

                  <div className="absolute bottom-3 left-3 z-20 flex flex-wrap items-center gap-2">
                    <div className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-black shadow-sm backdrop-blur-sm">
                      {review.tour}
                    </div>

                    {review.verified && (
                      <div className="rounded-full bg-green-200 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-green-950 shadow-sm">
                        Verified
                      </div>
                    )}
                  </div>
                </div>

                <div className="z-10 flex flex-grow flex-col p-4 md:p-5">
                  <div className={`mb-2 line-clamp-2 min-h-[3.55rem] font-frank text-3xl font-bold leading-none text-black transition-all duration-500 md:mb-3 md:min-h-0 md:text-3xl lg:text-4xl ${isMobileReviews && !isActiveMobile ? "scale-[0.96] opacity-70" : "scale-100 opacity-100"}`}>
                    {review.title}
                  </div>

                  <div className={`scrollbar-thin scrollbar-thumb-green-400 scrollbar-track-green-100 relative mb-4 h-[4.5rem] overflow-hidden pr-2 transition-opacity duration-500 md:h-24 md:overflow-y-auto ${isMobileReviews && !isActiveMobile ? "opacity-45" : "opacity-100"}`}>
                    <p className="text-sm leading-relaxed text-gray-800">
                      {review.desc}
                    </p>

                    <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-green-200 to-transparent" />
                  </div>

                  <ReviewMeta review={review} />
                </div>
                </div>
              );
            })}
          </div>

          <div className="-mt-3 mb-5 flex items-center justify-center gap-1.5 md:hidden">
            {topReviews.map((review, index) => (
              <button
                key={`top-review-dot-${review.id}`}
                type="button"
                onClick={() => setActiveTopReviewIndex(index)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === activeTopReviewIndex ? "w-7 bg-green-700" : "w-2 bg-black/18"
                }`}
                aria-label={`Show top review ${index + 1}`}
              />
            ))}
          </div>
          {/* bottom reviews */}
          <div className="hidden grid-cols-4 gap-3 lg:grid">
            {bottomReviews.map((review) => (
              <div
                key={review.id}
                className="z-10 flex h-full flex-col overflow-hidden rounded-2xl bg-green-200 shadow-lg transition-transform duration-300 hover:scale-[1.02]"
              >
                <div className="flex flex-grow flex-col p-5">
                  <div className="mb-3 flex gap-1">
                    <StarRating rating={review.rating} />
                  </div>

                  <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-green-900/70">
                    {review.tour}
                  </p>

                  <div className="mb-3 font-frank text-4xl font-bold leading-none text-black">
                    {review.title}
                  </div>

                  <div className="scrollbar-thin scrollbar-thumb-green-400 scrollbar-track-green-100 relative mb-4 h-24 overflow-y-auto pr-2">
                    <p className="text-sm leading-relaxed text-gray-800">
                      {review.desc}
                    </p>

                    <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-green-200 to-transparent" />
                  </div>

                  <ReviewMeta review={review} />
                </div>
              </div>
            ))}
          </div>

        <div className="mb-10 mt-5 flex w-full items-center justify-center text-white md:mb-4 md:mt-7 lg:mb- lg:mt-8">
          <button
            type="button"
            className="hero-gradient z-20 flex items-center justify-center gap-12 rounded-full p-2 px-4 transition hover:scale-[1.02]"
          >
            <p>
              See <b>all reviews</b>
            </p>

            <img src="/icons/go.png" alt="" />
          </button>
        </div>
      </div>

      <style>{`
        .scrollbar-thin::-webkit-scrollbar {
          width: 4px;
        }

        .scrollbar-thin::-webkit-scrollbar-track {
          background: #bbf7d0;
          border-radius: 10px;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #4ade80;
          border-radius: 10px;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #22c55e;
        }
      `}</style>
    </div>
  );
};

export default TestimonialsSection;