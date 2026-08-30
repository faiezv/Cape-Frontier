import { useEffect, useRef, useCallback, useState } from "react";
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
      className={`group relative w-full rounded-full text-left transition-all duration-300 ${
        compact ? "px-3 py-2.5" : "px-4 py-3"
      } ${
        active
          ? "bg-blue-600 text-white shadow-[0_8px_25px_rgba(37,99,235,0.25)]"
          : "bg-white text-neutral-700 shadow-sm hover:bg-neutral-50 hover:text-neutral-900"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-all duration-300 ${
            active
              ? "border-white/30 bg-white/20"
              : "border-neutral-200 bg-white/50 group-hover:bg-white"
          }`}
        >
          <img
            src={icon}
            className={`h-5 w-5 object-contain transition-all duration-300 ${
              active ? "scale-105 brightness-0 invert" : "opacity-70 group-hover:opacity-100"
            }`}
            alt={displayTitle}
            draggable={false}
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className={`text-[9px] font-bitter uppercase leading-none tracking-[0.14em] ${
            active ? "text-white/80" : "text-neutral-400"
          }`}>
            0{index + 1}
          </p>
          <p className={`mt-0.5 truncate font-bitter text-[12px] font-semibold leading-tight ${
            active ? "text-white" : "text-neutral-700"
          }`}>
            {displayTitle}
          </p>
        </div>
      </div>
      {active && (
        <span className="absolute right-3 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-white/60" />
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
  categoryTours = [],
  onFirst,
  onLast,
  isFirst,
  isLast,
}) {
  const totalTours = categoryTours.length;
  const safeIndex = Math.min(Math.max(0, currentTourIndex), totalTours - 1);
  const scrollTimeoutRef = useRef(null);

  // ----- Animation state for tour circles -----
  const [displayedTours, setDisplayedTours] = useState(categoryTours);
  const [animPhase, setAnimPhase] = useState('idle'); // 'idle' | 'exiting' | 'entering'
  const [animDirection, setAnimDirection] = useState(null); // 'left' | 'right' | null
  const prevCategoryIndexRef = useRef(sections.findIndex(s => s.id === activeCategory));
  const exitTimerRef = useRef(null);
  const enterTimerRef = useRef(null);

  // Trigger animation when activeCategory changes
  useEffect(() => {
    const currentIndex = sections.findIndex(s => s.id === activeCategory);
    const prevIndex = prevCategoryIndexRef.current;
    if (currentIndex !== prevIndex && prevIndex !== -1) {
      const direction = currentIndex > prevIndex ? 'right' : 'left';
      setAnimDirection(direction);
      setAnimPhase('exiting');

      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
      if (enterTimerRef.current) clearTimeout(enterTimerRef.current);

      exitTimerRef.current = window.setTimeout(() => {
        setDisplayedTours(categoryTours);
        setAnimPhase('entering');

        enterTimerRef.current = window.setTimeout(() => {
          setAnimPhase('idle');
          setAnimDirection(null);
          prevCategoryIndexRef.current = currentIndex;
        }, 400);
      }, 400);
    } else {
      if (categoryTours !== displayedTours) {
        setDisplayedTours(categoryTours);
      }
      prevCategoryIndexRef.current = currentIndex;
    }

    return () => {
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
      if (enterTimerRef.current) clearTimeout(enterTimerRef.current);
    };
  }, [activeCategory, sections, categoryTours, displayedTours]);

  // Update displayedTours when categoryTours changes while idle
  useEffect(() => {
    if (animPhase === 'idle') {
      setDisplayedTours(categoryTours);
    }
  }, [categoryTours, animPhase]);

  // ----- Scroll category into view (mobile pill strip only) -----
  // This must NEVER be able to touch page/window scroll — it only ever
  // sets scrollLeft on the nav's own scroller element, computed manually.
  // scrollIntoView({block:'nearest'}) was removed here: when the browser
  // doesn't treat mobileNavScrollerRef as a valid scrollport for the
  // active pill, it walks up the DOM and scrolls the page itself instead
  // — which was firing on every mount (this effect runs once on initial
  // render regardless of deps), producing an instant jump to wherever
  // this nav sits on the page, on every load and every remount.
  const didMountRef = useRef(false);
  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return; // skip the very first run — nothing to scroll to yet
    }

    const container = mobileNavScrollerRef?.current;
    const activeItem = mobileCategoryItemRefs?.current?.[activeCategory];
    if (!container || !activeItem) return;

    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      const itemLeft = activeItem.offsetLeft;
      const itemWidth = activeItem.offsetWidth;
      const containerWidth = container.clientWidth;
      const targetScroll = itemLeft - containerWidth / 2 + itemWidth / 2;

      container.scrollTo({
        left: Math.max(0, targetScroll),
        behavior: 'smooth',
      });
    }, 100);

    return () => {
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, [activeCategory, mobileNavScrollerRef, mobileCategoryItemRefs]);

  // ----- Tour navigation handlers -----
  const handlePrevTour = useCallback(() => {
    if (safeIndex > 0) onTourChange(safeIndex - 1);
  }, [safeIndex, onTourChange]);

  const handleNextTour = useCallback(() => {
    if (safeIndex < totalTours - 1) onTourChange(safeIndex + 1);
  }, [safeIndex, totalTours, onTourChange]);

  const handleCircleClick = useCallback((index) => {
    if (index !== safeIndex) onTourChange(index);
  }, [safeIndex, onTourChange]);

  // ----- Animation classes & styles (JavaScript, no type annotations) -----
  const getCircleClass = (idx) => {
    let base = "relative h-10 w-10 shrink-0 overflow-hidden rounded-full border-2 transition-all duration-200";
    if (idx === safeIndex && animPhase === 'idle') {
      base += " border-blue-600 shadow-[0_0_0_3px_rgba(37,99,235,0.20)]";
    } else {
      base += " border-neutral-300 hover:border-neutral-400";
    }
    return base;
  };

  const getCircleStyle = (idx) => {
    const delay = idx * 50; // stagger 50ms per item
    let animation = '';
    if (animPhase === 'exiting') {
      const exitDir = animDirection === 'right' ? 'slideOutLeft' : 'slideOutRight';
      animation = `${exitDir} 400ms ease forwards`;
    } else if (animPhase === 'entering') {
      const enterDir = animDirection === 'right' ? 'slideInRight' : 'slideInLeft';
      animation = `${enterDir} 400ms ease forwards`;
    }
    return {
      animation,
      animationDelay: animation ? `${delay}ms` : '0ms',
    };
  };

  // ----- Inject keyframe animations (once) -----
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideOutLeft {
        0% { opacity: 1; transform: translateX(0); }
        100% { opacity: 0; transform: translateX(-40px); }
      }
      @keyframes slideOutRight {
        0% { opacity: 1; transform: translateX(0); }
        100% { opacity: 0; transform: translateX(40px); }
      }
      @keyframes slideInRight {
        0% { opacity: 0; transform: translateX(40px); }
        100% { opacity: 1; transform: translateX(0); }
      }
      @keyframes slideInLeft {
        0% { opacity: 0; transform: translateX(-40px); }
        100% { opacity: 1; transform: translateX(0); }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div
      ref={mobileNavRef}
      data-mobile-category-nav
      className="w-auto lg:w-full max-w-3xl m-4 z-[220] sm:max-w-xl sm:mx-auto md:max-w-2xl md:mx-auto pointer-events-auto transition-opacity duration-300 opacity-100"
      style={{ top: `${metrics.mobileTop}px` }}
    >
      {/* Categories – floating pills with white background */}
      <div
        ref={mobileNavScrollerRef}
        className="flex snap-x snap-mandatory gap-2 overflow-x-auto scroll-smooth pb-1 [-ms-overflow-style:none] [scrollbar-width:none] md:grid md:grid-cols-4 md:overflow-visible [&::-webkit-scrollbar]:hidden"
      >
        {sections.map((section, index) => (
          <div
            key={section.id}
            ref={(el) => {
              if (el) mobileCategoryItemRefs.current[section.id] = el;
            }}
            className="min-w-[8.5rem] flex-1 snap-start md:min-w-0"
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

      {/* Unified bar: tour circles (white half) + navigation buttons (glass half) */}
      <div className="mt-2 overflow-hidden rounded-xl shadow-sm">
        {/* Tour image circles – animated – solid white half */}
        <div className="bg-white p-2">
          <div className="flex items-center justify-center gap-2 overflow-x-auto scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {displayedTours.map((tour, idx) => (
              <button
                key={`${activeCategory}-${tour.id}`}
                onClick={() => handleCircleClick(idx)}
                className={getCircleClass(idx)}
                style={getCircleStyle(idx)}
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
                  className="fallback flex h-full w-full items-center justify-center bg-blue-100 text-blue-700 text-xs font-bold"
                  style={{ display: tour.image ? 'none' : 'flex' }}
                >
                  {idx + 1}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation buttons – frosted glass half */}
        <div className="border-t border-white/30 bg-white/20 p-2 backdrop-blur-md">
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={onFirst}
              disabled={isFirst}
              className={`flex items-center justify-center rounded-full font-medium transition-all duration-200
                px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm
                ${
                  isFirst
                    ? "cursor-not-allowed opacity-30"
                    : "bg-white/40 text-neutral-800 hover:bg-white/60 active:scale-95 backdrop-blur-sm"
                }`}
              aria-label="First tour"
            >
              <span className="hidden sm:inline">First</span>
              <svg className="h-4 w-4 sm:hidden" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M11 19l-7-7 7-7" /><path d="M18 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={handlePrevTour}
              disabled={safeIndex === 0}
              className={`flex items-center justify-center gap-1 rounded-full font-medium transition-all duration-200
                px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm
                ${
                  safeIndex === 0
                    ? "cursor-not-allowed opacity-30"
                    : "bg-white/40 text-neutral-800 hover:bg-white/60 active:scale-95 backdrop-blur-sm"
                }`}
              aria-label="Previous tour"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M15 18l-6-6 6-6" />
              </svg>
              <span className="hidden sm:inline">Prev</span>
            </button>
            <button
              type="button"
              onClick={handleNextTour}
              disabled={safeIndex === totalTours - 1}
              className={`flex items-center justify-center gap-1 rounded-full font-medium transition-all duration-200
                px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm
                ${
                  safeIndex === totalTours - 1
                    ? "cursor-not-allowed opacity-30"
                    : "bg-white/40 text-neutral-800 hover:bg-white/60 active:scale-95 backdrop-blur-sm"
                }`}
              aria-label="Next tour"
            >
              <span className="hidden sm:inline">Next</span>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
            <button
              type="button"
              onClick={onLast}
              disabled={isLast}
              className={`flex items-center justify-center rounded-full font-medium transition-all duration-200
                px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm
                ${
                  isLast
                    ? "cursor-not-allowed opacity-30"
                    : "bg-white/40 text-neutral-800 hover:bg-white/60 active:scale-95 backdrop-blur-sm"
                }`}
              aria-label="Last tour"
            >
              <span className="hidden sm:inline">Last</span>
              <svg className="h-4 w-4 sm:hidden" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M13 5l7 7-7 7" /><path d="M6 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}