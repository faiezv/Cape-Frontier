import { useLayoutEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ============================================================
// 1. CATEGORIES DATA
// Images must be inside: /public/images/tours/
// Browser path example:
// /public/images/tours/adrenaline/shark-cage-diving/1.webp
// becomes:
// /images/tours/adrenaline/shark-cage-diving/1.webp
// ============================================================

const CATEGORIES_DATA = [
  {
    id: 1,
    name: 'Adrenaline',
    slug: 'adrenaline',
    hasNewTour: true,
    description: 'Shark dives, paragliding, gun range & ocean thrills',
    image: '/images/tours/adrenaline/shark-cage-diving/1.webp',
  },
  {
    id: 2,
    name: 'Hiking',
    slug: 'hiking',
    hasNewTour: false,
    description: 'Lion’s Head and Table Mountain trail experiences',
    image: '/images/tours/hiking/lions-head/1.webp',
  },
  {
    id: 3,
    name: 'Historical',
    slug: 'historical',
    hasNewTour: true,
    description: 'Robben Island, Langa and cultural Cape Town stories',
    image: '/images/tours/historical/robben-island/1.webp',
  },
  {
    id: 4,
    name: 'Winery',
    slug: 'winery',
    hasNewTour: false,
    description: 'Premium wine estates, tastings and scenic routes',
    image: '/images/tours/wine-routes/delaire/3.png',
  },
];

// ============================================================
// 2. MAIN COMPONENT
// ============================================================

export default function PopularTours() {
  const [startIndex, setStartIndex] = useState(0);

  const sectionRef = useRef(null);
  const shellRef = useRef(null);
  const eyebrowMaskRef = useRef(null);
  const eyebrowRef = useRef(null);
  const titleRef = useRef(null);
  const copyRef = useRef(null);
  const gridRef = useRef(null);
  const navRef = useRef(null);
  const dotsRef = useRef(null);

  const itemsPerPage = 4;
  const totalCategories = CATEGORIES_DATA.length;

  const visibleCategories = CATEGORIES_DATA.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handlePrevious = () => {
    setStartIndex((prev) => Math.max(prev - itemsPerPage, 0));
  };

  const handleNext = () => {
    setStartIndex((prev) => {
      const newIndex = prev + itemsPerPage;
      return newIndex < totalCategories ? newIndex : prev;
    });
  };

  const isPrevDisabled = startIndex === 0;
  const isNextDisabled = startIndex + itemsPerPage >= totalCategories;

  useLayoutEffect(() => {
    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (reduceMotion) return;

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray('.popular-tour-card');
      const cardImages = gsap.utils.toArray('.popular-tour-card img');
      const navButtons = gsap.utils.toArray('.popular-tour-nav');
      const dots = gsap.utils.toArray('.popular-tour-dot');

      gsap.set(shellRef.current, {
        autoAlpha: 0,
        y: 90,
        scaleY: 0.52,
        clipPath: 'ellipse(46% 18% at 50% 0%)',
        transformOrigin: 'top center',
        willChange: 'transform, opacity, clip-path',
      });

      gsap.set(eyebrowMaskRef.current, {
        overflow: 'hidden',
      });

      gsap.set(eyebrowRef.current, {
        autoAlpha: 1,
        y: 62,
        scale: 0.96,
        willChange: 'transform',
      });

      gsap.set([titleRef.current, copyRef.current], {
        autoAlpha: 0,
        y: 28,
        willChange: 'transform, opacity',
      });

      gsap.set(cards, {
        autoAlpha: 0,
        y: 48,
        scale: 0.96,
        rotateX: -8,
        transformPerspective: 900,
        transformOrigin: 'center bottom',
        willChange: 'transform, opacity',
      });

      gsap.set(cardImages, {
        scale: 1.22,
        yPercent: -3,
        transformOrigin: 'center center',
        willChange: 'transform',
      });

      gsap.set(navButtons, {
        autoAlpha: 0,
        scale: 0.75,
        willChange: 'transform, opacity',
      });

      gsap.set(dots, {
        autoAlpha: 0,
        y: 12,
        willChange: 'transform, opacity',
      });

      const tl = gsap.timeline({
        defaults: {
          ease: 'none',
        },
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 82%',
          end: 'bottom 48%',
          scrub: 1.05,
          invalidateOnRefresh: true,
        },
      });

      tl.to(shellRef.current, {
        autoAlpha: 1,
        y: 0,
        scaleY: 1,
        clipPath: 'ellipse(145% 130% at 50% 0%)',
        duration: 1.05,
      })

        // Pill comes out from behind the halfmoon
        .to(
          eyebrowRef.current,
          {
            y: 0,
            scale: 1,
            duration: 0.45,
          },
          0.42
        )

        .to(
          titleRef.current,
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.4,
          },
          0.5
        )

        .to(
          copyRef.current,
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.4,
          },
          0.58
        )

        // Fast card reveal
        .to(
          cards,
          {
            autoAlpha: 1,
            duration: 0.18,
            stagger: 0.045,
          },
          0.72
        )

        // Card movement continues after visibility starts
        .to(
          cards,
          {
            y: 0,
            scale: 1,
            rotateX: 0,
            stagger: 0.075,
            duration: 0.55,
          },
          0.72
        )

        // End above scale 1 so image always covers rounded frame
        .to(
          cardImages,
          {
            scale: 1.08,
            yPercent: 0,
            stagger: 0.075,
            duration: 0.65,
          },
          0.72
        )

        .to(
          navButtons,
          {
            autoAlpha: 1,
            scale: 1,
            stagger: 0.08,
            duration: 0.3,
          },
          1.16
        )

        .to(
          dots,
          {
            autoAlpha: 1,
            y: 0,
            stagger: 0.08,
            duration: 0.3,
          },
          1.22
        );
    }, sectionRef);

    return () => ctx.revert();
  }, [startIndex]);

  return (
    <section
      ref={sectionRef}
      className="relative w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-0 py-10 md:py-16"
    >
      <div
        ref={shellRef}
        className="relative z-10 w-full mx-auto bg-white rounded-t-[999px] rounded-b-[2rem] p-5 sm:p-8 md:p-10 shadow-[0_20px_70px_rgba(0,0,0,0.08)]"
      >
        {/* Soft inner accent */}
        <div className="pointer-events-none absolute inset-x-8 top-6 h-28 rounded-full bg-green-200/25 blur-3xl" />

        {/* Section Header */}
        <div className="relative z-10 text-center font-bitter">
          <div className="flex flex-col items-center">
            <div
              ref={eyebrowMaskRef}
              className="relative overflow-hidden px-2 py-2"
            >
              <span
                ref={eyebrowRef}
                className="block px-6 py-2 text-green-700 font-semibold bg-green-200 rounded-full text-sm tracking-wide shadow-sm"
              >
                Curated Experiences
              </span>
            </div>

            <h2
              ref={titleRef}
              className="text-4xl md:text-5xl text-black font-semibold font-frank mt-2"
            >
              Popular Tours
            </h2>

            <p
              ref={copyRef}
              className="text-black/70 text-base max-w-md my-4 font-light font-mont leading-tight"
            >
              Discover the wild heart of the Cape — from ocean giants to
              mountain peaks.
            </p>
          </div>
        </div>

        {/* Carousel Grid */}
        <div className="relative z-10 mt-4" ref={gridRef}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {visibleCategories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>

          {/* Navigation Arrows only show if more than 4 categories */}
          {totalCategories > itemsPerPage && (
            <div ref={navRef}>
              <button
                onClick={handlePrevious}
                disabled={isPrevDisabled}
                className={`popular-tour-nav absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 sm:-translate-x-4 lg:-translate-x-6
                  w-10 h-10 rounded-full backdrop-blur-md bg-green-200 border border-black/30
                  flex items-center justify-center transition-all duration-300 z-20 shadow-md
                  ${
                    isPrevDisabled
                      ? 'opacity-30 cursor-not-allowed'
                      : 'hover:bg-green-300 hover:scale-105 hover:border-green-500/50'
                  }`}
                aria-label="Previous tours"
              >
                <ChevronLeft className="w-5 h-5 text-black/80" />
              </button>

              <button
                onClick={handleNext}
                disabled={isNextDisabled}
                className={`popular-tour-nav absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 sm:translate-x-4 lg:translate-x-6
                  w-10 h-10 rounded-full backdrop-blur-md bg-green-200 border border-black/30
                  flex items-center justify-center transition-all duration-300 z-20 shadow-md
                  ${
                    isNextDisabled
                      ? 'opacity-30 cursor-not-allowed'
                      : 'hover:bg-green-300 hover:scale-105 hover:border-green-500/50'
                  }`}
                aria-label="Next tours"
              >
                <ChevronRight className="w-5 h-5 text-black/80" />
              </button>
            </div>
          )}
        </div>

        {/* Pagination indicator only shows if more than 4 categories */}
        {totalCategories > itemsPerPage && (
          <div
            ref={dotsRef}
            className="relative z-10 flex justify-center gap-2 mt-10"
          >
            {Array.from({
              length: Math.ceil(totalCategories / itemsPerPage),
            }).map((_, idx) => {
              const isActive = idx === Math.floor(startIndex / itemsPerPage);

              return (
                <button
                  key={idx}
                  onClick={() => setStartIndex(idx * itemsPerPage)}
                  className={`popular-tour-dot h-1 transition-all duration-500 rounded-full ${
                    isActive
                      ? 'w-8 bg-blue-400'
                      : 'w-4 bg-black/20 hover:bg-black/40'
                  }`}
                  aria-label={`Go to page ${idx + 1}`}
                />
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

// ============================================================
// 3. CATEGORY CARD COMPONENT
// ============================================================

function CategoryCard({ category }) {
  const { name, hasNewTour, description, image } = category;

  return (
    <article className="popular-tour-card group relative rounded-[2rem] aspect-[4/5] w-full overflow-hidden bg-black">
      {/* Background Image */}
      <div className="absolute inset-0 rounded-[2rem] overflow-hidden">
        <img
          src={image}
          alt={`${name} tours in Cape Town`}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 block w-full h-full min-w-full min-h-full object-cover will-change-transform transition-transform duration-700 ease-out group-hover:scale-110"
        />

        <div className="absolute inset-0 bg-linear-to-b from-black/5 via-black/10 to-blue-950/85 transition-opacity duration-500 group-hover:opacity-90" />
      </div>

      {/* Overlay Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-end text-center p-6">
        <h3 className="text-2xl font-bold font-bitter tracking-wide text-white uppercase drop-shadow-sm">
          {name}
        </h3>

        <div className="w-8 h-px bg-white/50 my-3 transition-all duration-500 group-hover:w-14 group-hover:bg-green-200" />

        <p className="text-xs md:text-sm text-white/80 font-light max-w-[88%] leading-tight opacity-0 translate-y-3 transition-all duration-500 group-hover:opacity-100 group-hover:translate-y-0">
          {description}
        </p>
      </div>

      {/* NEW TOUR BADGE */}
      {hasNewTour && (
        <div className="absolute top-3 right-3 z-20">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-red-400 blur-md opacity-60 animate-pulse" />
            <div className="relative flex items-center gap-1.5 px-2 py-1 rounded-full bg-red-400 text-white text-[8px] font-bold uppercase tracking-wider shadow-lg">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              New Tours
            </div>
          </div>
        </div>
      )}

      {/* Hover corner accent */}
      <div className="absolute bottom-4 left-4 z-20 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
        <div className="w-8 h-[1px] bg-green-200/80" />
      </div>
    </article>
  );
}