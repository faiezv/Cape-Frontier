import { useEffect, useRef, useCallback } from "react";
import { resolveImage } from '../../utils/ImageLoader';

const TOUR_CATEGORIES_ICON = {
  adrenaline: "/icons/catIcons/adrenaline.svg",
  hiking: "/icons/catIcons/hiking.svg",
  packages: "/icons/catIcons/packages.svg",
  historical: "/icons/catIcons/historical.svg",
  wineRoutes: "/icons/catIcons/wine-routes.svg",
};

function BrowseButton({ section, index, active, onClick, compact = false }) {
  const icon = section.icon || TOUR_CATEGORIES_ICON[section.id] || "/icons/default.svg";
  const displayTitle = section.label || section.title || "Untitled";
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
            src={icon}
            className={`h-5 w-5 object-contain transition-all duration-300 ${
              active ? "scale-105" : "opacity-80 group-hover:opacity-100"
            }`}
            alt={displayTitle}
            draggable={false}
            onError={(event) => event.currentTarget.style.display = "none"}
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className={`text-[9px] font-bitter uppercase leading-none tracking-[0.14em] ${
            active ? "text-neutral-400" : "text-white/35"
          }`}>
            0{index + 1}
          </p>
          <p className={`mt-0.5 truncate font-bitter text-[12px] font-semibold leading-tight ${
            active ? "text-black/80" : "text-white/60"
          }`}>
            {displayTitle}
          </p>
        </div>
      </div>
      {active && (
        <span className="absolute right-3 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-red-400" />
      )}
    </button>
  );
}

export default function FixedCategoryNav({
  activeCategory,
  currentTourIndex,
  currentTourTotal,
  onSelect,
  onTourChange,
  sections,
  mobileNavRef,
  mobileNavScrollerRef,
  mobileCategoryItemRefs,
  metrics,
  // pinned prop removed – no longer used
  categoryTours = [],
}) {
  const totalTours = categoryTours.length;
  const safeIndex = Math.min(Math.max(0, currentTourIndex), totalTours - 1);

  // Debounce the auto‑scroll to avoid fighting with user swipes
  const scrollTimeoutRef = useRef(null);

  // Auto‑scroll active category into view on mobile
  useEffect(() => {
    const container = mobileNavScrollerRef?.current;
    const activeItem = mobileCategoryItemRefs?.current?.[activeCategory];
    if (!container || !activeItem) return;

    // Clear any pending scroll to prevent race conditions
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = setTimeout(() => {
      // Use native scrollIntoView – it’s reliable and handles edge cases
      activeItem.scrollIntoView({
        inline: 'center',
        behavior: 'smooth',
        block: 'nearest',
      });
    }, 100); // small delay to let layout settle

    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [activeCategory, mobileNavScrollerRef, mobileCategoryItemRefs]);

  const handlePrevTour = useCallback(() => {
    if (safeIndex > 0) onTourChange(safeIndex - 1);
  }, [safeIndex, onTourChange]);

  const handleNextTour = useCallback(() => {
    if (safeIndex < totalTours - 1) onTourChange(safeIndex + 1);
  }, [safeIndex, totalTours, onTourChange]);

  const handleCircleClick = useCallback((index) => {
    if (index !== safeIndex) onTourChange(index);
  }, [safeIndex, onTourChange]);

  return (
    <div
      ref={mobileNavRef}
      data-mobile-category-nav
      className={`
        w-auto lg:w-full max-w-3xl mx-4 z-[220]
        sm:max-w-xl sm:mx-auto
        md:max-w-2xl md:mx-auto
        pointer-events-auto
        transition-opacity duration-300
        opacity-100
      `}
      style={{
        top: `${metrics.mobileTop}px`,
      }}
    >
      <div className="rounded-[1.25rem] border border-white/10 bg-black/72 p-1.5 shadow-[0_12px_35px_rgba(0,0,0,0.16)] backdrop-blur-md sm:p-2">
        {/* Category row */}
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

        {/* Tour navigation bar */}
        <div className="mt-1.5 rounded-2xl border border-white/10 bg-white/[0.07] px-3 py-2">
          <div className="flex items-center gap-2">
            {/* Previous button */}
            <button
              type="button"
              onClick={handlePrevTour}
              disabled={safeIndex === 0}
              className={`flex items-center justify-center gap-1 rounded-full font-bold transition-all duration-200
                px-4 py-2 text-sm sm:px-3 sm:py-1 sm:text-xs
                ${
                  safeIndex === 0
                    ? "cursor-not-allowed opacity-30"
                    : "bg-white/10 hover:bg-white/20 active:scale-95"
                }`}
              aria-label="Previous tour"
            >
              <svg className="h-5 w-5 sm:h-3.5 sm:w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M15 18l-6-6 6-6" />
              </svg>
              <span className="hidden sm:inline">Previous</span>
            </button>

            {/* Circle row */}
            <div className="flex-1 overflow-x-auto scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="flex gap-1.5">
                {categoryTours.map((tour, idx) => (
                  <button
                    key={`${activeCategory}-${tour.id}`}
                    onClick={() => handleCircleClick(idx)}
                    className={`relative h-8 w-8 shrink-0 overflow-hidden rounded-full border-2 transition-all duration-200 ${
                      idx === safeIndex
                        ? "border-green-300 scale-110 shadow-[0_0_0_3px_rgba(187,247,208,0.18)]"
                        : "border-white/20 hover:border-white/40"
                    }`}
                  >
                    <img
                      src={tour.image ? resolveImage(tour.image) : ''}
                      alt={`Tour ${idx + 1}`}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const parent = e.currentTarget.parentElement;
                        const fallback = parent?.querySelector('.fallback');
                        if (fallback) fallback.style.display = 'flex';
                      }}
                      style={{ display: tour.image ? 'block' : 'none' }}
                    />
                    <div
                      className="fallback flex h-full w-full items-center justify-center bg-blue-600 text-white text-xs font-bold"
                      style={{ display: tour.image ? 'none' : 'flex' }}
                    >
                      {idx + 1}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Next button */}
            <button
              type="button"
              onClick={handleNextTour}
              disabled={safeIndex === totalTours - 1}
              className={`flex items-center justify-center gap-1 rounded-full font-bold transition-all duration-200
                px-4 py-2 text-sm sm:px-3 sm:py-1 sm:text-xs
                ${
                  safeIndex === totalTours - 1
                    ? "cursor-not-allowed opacity-30"
                    : "bg-white/10 hover:bg-white/20 active:scale-95"
                }`}
              aria-label="Next tour"
            >
              <span className="hidden sm:inline">Next</span>
              <svg className="h-5 w-5 sm:h-3.5 sm:w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}