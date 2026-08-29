import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import tours, { TOUR_TYPES } from "../../data/tours.js";
import TourCard from "./TourCard.jsx";
import FixedCategoryNav from "./FixedCategoryNav.jsx";

const BREAKPOINT = 768;
const MOBILE_NAV_GAP = 18;
const NAVBAR_OFFSET = 20;

export default function ToursBrowser() {
  const containerRef = useRef(null);
  const stageRef = useRef(null);
  const trackRef = useRef(null);
  const mobileNavRef = useRef(null);
  const mobileNavScrollerRef = useRef(null);
  const mobileCategoryItemRefs = useRef({});

  // Refs to each rendered card, keyed by tour id, used to measure the
  // active card's real height so the prev/next buttons can match it.
  const cardRefs = useRef({});

  const [activeCategory, setActiveCategory] = useState("adrenaline");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Height (px) of the currently active card. Drives the row height so
  // the prev/next buttons (self-stretch) match the visible card instead
  // of the tallest card in the category.
  const [stageHeight, setStageHeight] = useState(null);

  // Swipe state
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchStartY, setTouchStartY] = useState(0);
  const [touchDeltaX, setTouchDeltaX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // ── Categories & Tours ──────────────────────────────────────────────

  const categorySections = useMemo(() => {
    const grouped = {
      adrenaline: tours.filter((t) => t.type === TOUR_TYPES.ADRENALINE),
      hiking: tours.filter((t) => t.type === TOUR_TYPES.HIKING),
      historical: tours.filter((t) => t.type === TOUR_TYPES.HISTORICAL),
      packages: tours.filter(
        (t) => t.type === TOUR_TYPES.PACKAGES || t.type === TOUR_TYPES.WINE_ROUTES
      ),
    };
    return Object.entries(grouped).map(([id, tourList]) => ({
      id,
      label: id.charAt(0).toUpperCase() + id.slice(1),
      tours: tourList,
    }));
  }, []);

  const allTours = useMemo(() => {
    return categorySections.flatMap((section) =>
      section.tours.map((tour, index) => ({
        ...tour,
        categoryId: section.id,
        categoryLabel: section.label,
        tourIndex: index,
        totalInCategory: section.tours.length,
      }))
    );
  }, [categorySections]);

  const filteredTours = useMemo(() => {
    return allTours.filter((t) => t.categoryId === activeCategory);
  }, [allTours, activeCategory]);

  useEffect(() => {
    setCurrentIndex(0);
  }, [activeCategory]);

  useEffect(() => {
    if (currentIndex >= filteredTours.length) {
      setCurrentIndex(Math.max(0, filteredTours.length - 1));
    }
  }, [filteredTours, currentIndex]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < BREAKPOINT);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // ── Navigation ──────────────────────────────────────────────────────

  const goToTour = useCallback(
    (index) => {
      if (index < 0 || index >= filteredTours.length) return;
      setCurrentIndex(index);
    },
    [filteredTours]
  );

  const goToPrev = useCallback(() => goToTour(currentIndex - 1), [currentIndex, goToTour]);
  const goToNext = useCallback(() => goToTour(currentIndex + 1), [currentIndex, goToTour]);
  const goToFirst = useCallback(() => goToTour(0), [goToTour]);
  const goToLast = useCallback(() => goToTour(filteredTours.length - 1), [filteredTours.length, goToTour]);

  const handleCategorySelect = useCallback((categoryId) => {
    setActiveCategory(categoryId);
  }, []);

  const handleTourChange = useCallback(
    (categoryIndex) => {
      if (categoryIndex >= 0 && categoryIndex < filteredTours.length) {
        goToTour(categoryIndex);
      }
    },
    [filteredTours, goToTour]
  );

  // ── Height measurement ──────────────────────────────────────────────
  // Measures the DOM height of whichever card is currently active and
  // syncs it into state so the row (and therefore the stretched
  // prev/next buttons) can be pinned to that exact height.

  const measureActiveCard = useCallback(() => {
    const activeId = filteredTours[currentIndex]?.id;
    if (activeId == null) return;
    const el = cardRefs.current[activeId];
    if (el) {
      setStageHeight(el.offsetHeight);
    }
  }, [filteredTours, currentIndex]);

  // Re-measure whenever the active card changes.
  useEffect(() => {
    measureActiveCard();
  }, [measureActiveCard]);

  // Re-measure if the active card's own content resizes (images loading,
  // fonts swapping in, dynamic text, etc).
  useEffect(() => {
    const activeId = filteredTours[currentIndex]?.id;
    const el = activeId != null ? cardRefs.current[activeId] : null;
    if (!el || typeof ResizeObserver === "undefined") return;

    const ro = new ResizeObserver(() => measureActiveCard());
    ro.observe(el);
    return () => ro.disconnect();
  }, [currentIndex, filteredTours, measureActiveCard]);

  // Re-measure on viewport resize (e.g. rotation, window resize) since
  // wrapping/line-breaks can change the card's height at new widths.
  useEffect(() => {
    window.addEventListener("resize", measureActiveCard);
    return () => window.removeEventListener("resize", measureActiveCard);
  }, [measureActiveCard]);

  // ── Swipe / Touch ──────────────────────────────────────────────────

  const handleTouchStart = useCallback((e) => {
    const touch = e.touches[0];
    setTouchStartX(touch.clientX);
    setTouchStartY(touch.clientY);
    setTouchDeltaX(0);
    setIsDragging(true);
  }, []);

  const handleTouchMove = useCallback(
    (e) => {
      if (!isDragging) return;
      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStartX;
      const deltaY = touch.clientY - touchStartY;
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
        e.preventDefault();
        setTouchDeltaX(deltaX);
      }
    },
    [isDragging, touchStartX, touchStartY]
  );

  const handleTouchEnd = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    const threshold = 50;
    if (Math.abs(touchDeltaX) > threshold) {
      if (touchDeltaX < 0) goToNext();
      else goToPrev();
    }
    setTouchDeltaX(0);
  }, [isDragging, touchDeltaX, goToNext, goToPrev]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") { e.preventDefault(); goToPrev(); }
      else if (e.key === "ArrowRight") { e.preventDefault(); goToNext(); }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToPrev, goToNext]);

  // ── Derived ──────────────────────────────────────────────────────

  const currentTour = filteredTours[currentIndex] || null;
  const currentTourIndex = currentTour ? currentTour.tourIndex : 0;
  const currentTourTotal = currentTour ? currentTour.totalInCategory : 0;
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === filteredTours.length - 1;

  const prevTour = filteredTours[currentIndex - 1] || null;
  const nextTour = filteredTours[currentIndex + 1] || null;

  const getTrackTransform = () => {
    const base = -currentIndex * 100;
    const dragOffset = isDragging
      ? (touchDeltaX / (stageRef.current?.offsetWidth || 1)) * 100
      : 0;
    return `translateX(${base + dragOffset}%)`;
  };

  // ── Render ──────────────────────────────────────────────────────

  return (
    <main className="w-full overflow-x-hidden bg-gradient-to-br from-white to-blue-600 text-white py-10">
      <section ref={containerRef} className="relative mx-auto w-full max-w-5xl px-3 md:px-4">
        <FixedCategoryNav
          activeCategory={activeCategory}
          currentTourIndex={currentTourIndex}
          currentTourTotal={currentTourTotal}
          sections={categorySections}
          mobileNavRef={mobileNavRef}
          mobileNavScrollerRef={mobileNavScrollerRef}
          mobileCategoryItemRefs={mobileCategoryItemRefs}
          metrics={{ desktopNavTop: 24, navLeft: 12, mobileTop: 100 }}
          onSelect={handleCategorySelect}
          onTourChange={handleTourChange}
          categoryTours={filteredTours}
          onFirst={goToFirst}
          onLast={goToLast}
          isFirst={isFirst}
          isLast={isLast}
        />

        <div ref={stageRef} className="relative z-10 w-full pointer-events-auto my-4">
          <div
            className="relative w-full overflow-hidden mb-20"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Main flex row – height is pinned to the active card's
                measured height so prev/next buttons (self-stretch)
                match the visible card, not the tallest card in the
                category. */}
            <div
              className="flex items-stretch gap-1"
              style={{
                height: stageHeight ? `${stageHeight}px` : "auto",
                transition: "height 300ms ease",
              }}
            >
              {/* Previous button – hidden on mobile */}
              <AnimatePresence>
                {!isFirst && (
                  <motion.div
                    key="prev"
                    className="hidden md:flex flex-shrink-0 self-stretch"
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                  >
                    <button
                      type="button"
                      onClick={goToPrev}
                      className="relative z-20 flex items-center justify-center w-10 rounded-2xl border border-white/25 text-white hover:scale-105 focus:outline-none shadow-lg transition-all duration-200 overflow-hidden"
                      style={{ height: "100%" }}
                      aria-label="Previous tour"
                    >
                      {prevTour && (
                        <img
                          src={prevTour.image || "/placeholder-image.jpg"}
                          alt=""
                          className="absolute inset-0 w-full h-full object-cover filter blur-lg scale-110"
                        />
                      )}
                      <div className="absolute inset-0 bg-white/10 backdrop-blur-sm transition-colors duration-200 hover:bg-white/20"></div>
                      <svg className="w-6 h-6 relative z-10" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <path d="M15 18l-6-6 6-6" />
                      </svg>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Track – flex:1. Every card in the category stays
                  mounted (only opacity toggles) so the horizontal
                  slide transform works, but the row's height is no
                  longer left to "auto" (which would take the tallest
                  child) — it's driven by stageHeight above. */}
              <motion.div
                ref={trackRef}
                className="flex flex-1 min-w-0 items-start will-change-transform"
                style={{
                  transform: getTrackTransform(),
                  transition: isDragging ? "none" : "transform 500ms cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                  height: "auto",
                }}
              >
                {filteredTours.map((tour, index) => (
                  <motion.div
                    key={tour.id}
                    ref={(el) => {
                      if (el) {
                        cardRefs.current[tour.id] = el;
                      } else {
                        delete cardRefs.current[tour.id];
                      }
                    }}
                    className="flex-shrink-0 w-full"
                    animate={{ opacity: currentIndex === index ? 1 : 0 }}
                    transition={{ opacity: { duration: 0.4, ease: "easeInOut" } }}
                    style={{ willChange: 'opacity' }}
                  >
                    <TourCard tour={tour} isMobile={isMobile} isCarousel={true} />
                  </motion.div>
                ))}
              </motion.div>

              {/* Next button – hidden on mobile */}
              <AnimatePresence>
                {!isLast && (
                  <motion.div
                    key="next"
                    className="hidden md:flex flex-shrink-0 self-stretch"
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                  >
                    <button
                      type="button"
                      onClick={goToNext}
                      className="relative z-20 flex items-center justify-center w-10 rounded-2xl border border-white/25 text-white hover:scale-105 focus:outline-none shadow-lg transition-all duration-200 overflow-hidden"
                      style={{ height: "100%" }}
                      aria-label="Next tour"
                    >
                      {nextTour && (
                        <img
                          src={nextTour.image || "/placeholder-image.jpg"}
                          alt=""
                          className="absolute inset-0 w-full h-full object-cover filter blur-lg scale-110"
                        />
                      )}
                      <div className="absolute inset-0 bg-white/10 backdrop-blur-sm transition-colors duration-200 hover:bg-white/20"></div>
                      <svg className="w-6 h-6 relative z-10" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}