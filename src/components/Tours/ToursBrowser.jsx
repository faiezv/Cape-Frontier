import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import tours, { TOUR_TYPES } from "../../data/tours.js";
import TourCard from "./TourCard.jsx";
import FixedCategoryNav from "./FixedCategoryNav.jsx";

const BREAKPOINT = 768;

export default function ToursBrowser() {
  const containerRef = useRef(null);
  const stageRef = useRef(null);
  const trackRef = useRef(null);
  const mobileNavRef = useRef(null);
  const mobileNavScrollerRef = useRef(null);
  const mobileCategoryItemRefs = useRef({});
  const cardRefs = useRef({});

  const [activeCategory, setActiveCategory] = useState("adrenaline");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  const [touchStartX, setTouchStartX] = useState(0);
  const [touchStartY, setTouchStartY] = useState(0);
  const [touchDeltaX, setTouchDeltaX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // ── Categories & Tours ──────────────────────────────────────────────
  const categorySections = useMemo(() => {
    const grouped = {
      adrenaline: tours.filter((t) => t.type === "adrenaline"),
      hiking: tours.filter((t) => t.type === "hiking"),
      historical: tours.filter((t) => t.type === "historical"),
      packages: tours.filter(
        (t) => t.type === "packages" || t.type === "wine_routes"
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

  // ── Lenis sync: this is the actual fix for the jump ─────────────────
  // Any time this component's real rendered height changes (images
  // loading in, category switch, mobile breakpoint switch, card content
  // changing), Lenis's cached scroll bounds go stale. If Lenis
  // recalculates bounds while stale, the visible scroll position can
  // snap to a clamped value — which looks exactly like "jump to the
  // start of a component". A ResizeObserver on the stage keeps Lenis's
  // internal measurements honest in real time instead of only on
  // window resize.
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;

    let raf = null;
    const notifyLenis = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        window.lenis?.resize();
      });
    };

    const ro = new ResizeObserver(notifyLenis);
    ro.observe(el);

    return () => {
      ro.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // Also resize explicitly after category/index changes settle and after
  // the crossfade transition finishes, since ResizeObserver can fire a
  // beat later than you want for a transform-based transition.
  useEffect(() => {
    const t = setTimeout(() => window.lenis?.resize(), 450);
    return () => clearTimeout(t);
  }, [activeCategory, currentIndex, isMobile]);

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

  // Scope arrow-key nav to when the carousel is actually on screen, so it
  // can't hijack navigation (or implicitly assume scroll focus) while the
  // user is elsewhere on the page — e.g. while Hero/About/Stories are in view.
  useEffect(() => {
    const handleKeyDown = (e) => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;
      if (!inView) return;

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

  return (
    <main className="tours-browser w-full overflow-x-hidden bg-gradient-to-br from-white to-blue-600 text-white py-10">
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
            style={{
              minHeight: '600px',
              height: 'auto',
              contain: 'layout style paint',
              willChange: 'transform',
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="flex items-stretch gap-1" style={{ minHeight: '600px' }}>
              <AnimatePresence>
                {!isFirst && (
                  <motion.div
                    key="prev"
                    className="hidden md:flex flex-shrink-0 self-stretch"
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    onAnimationComplete={() => window.lenis?.resize()}
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

              <motion.div
                ref={trackRef}
                className="flex flex-1 min-w-0 items-start will-change-transform"
                style={{
                  transform: getTrackTransform(),
                  transition: isDragging ? "none" : "transform 500ms cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                  height: "auto",
                  minHeight: '600px',
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

              <AnimatePresence>
                {!isLast && (
                  <motion.div
                    key="next"
                    className="hidden md:flex flex-shrink-0 self-stretch"
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    onAnimationComplete={() => window.lenis?.resize()}
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