import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import tours from "../../data/tours.js";
import TourCard from "./TourCard.jsx";
import FixedCategoryNav from "./FixedCategoryNav.jsx";

const BREAKPOINT = 768;

export default function ToursBrowser() {
  const containerRef            = useRef(null);
  const stageRef                = useRef(null);
  const mobileNavRef            = useRef(null);
  const mobileNavScrollerRef    = useRef(null);
  const mobileCategoryItemRefs  = useRef({});
  const cardRefs                = useRef({});

  const [activeCategory, setActiveCategory] = useState("adrenaline");
  const [currentIndex,   setCurrentIndex]   = useState(0);
  const [isMobile,       setIsMobile]       = useState(false);
  const [cardHeight,     setCardHeight]     = useState(0);

  const [touchStartX, setTouchStartX] = useState(0);
  const [touchStartY, setTouchStartY] = useState(0);
  const [touchDeltaX, setTouchDeltaX] = useState(0);
  const [isDragging,  setIsDragging]  = useState(false);

  // ── Categories & tours ────────────────────────────────────────────────────

  const categorySections = useMemo(() => {
    const grouped = {
      adrenaline: tours.filter((t) => t.type === "adrenaline"),
      hiking:     tours.filter((t) => t.type === "hiking"),
      historical: tours.filter((t) => t.type === "historical"),
      packages:   tours.filter((t) => t.type === "packages" || t.type === "wine_routes"),
    };
    return Object.entries(grouped).map(([id, tourList]) => ({
      id,
      label: id.charAt(0).toUpperCase() + id.slice(1),
      tours: tourList,
    }));
  }, []);

  const allTours = useMemo(() =>
    categorySections.flatMap((section) =>
      section.tours.map((tour, index) => ({
        ...tour,
        categoryId:      section.id,
        categoryLabel:   section.label,
        tourIndex:       index,
        totalInCategory: section.tours.length,
      }))
    ),
  [categorySections]);

  const filteredTours = useMemo(
    () => allTours.filter((t) => t.categoryId === activeCategory),
    [allTours, activeCategory]
  );

  // ── Reset index when category changes ────────────────────────────────────

  useEffect(() => { setCurrentIndex(0); }, [activeCategory]);

  useEffect(() => {
    if (currentIndex >= filteredTours.length)
      setCurrentIndex(Math.max(0, filteredTours.length - 1));
  }, [filteredTours, currentIndex]);

  // ── Responsive ────────────────────────────────────────────────────────────

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < BREAKPOINT);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // ── Measure active card height so side buttons can match it exactly ───────

  useEffect(() => {
    const currentTour = filteredTours[currentIndex];
    if (!currentTour) return;

    const el = cardRefs.current[currentTour.id];
    if (!el) return;

    const measure = () => {
      const h = el.getBoundingClientRect().height;
      if (h > 0) setCardHeight(h);
    };

    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [filteredTours, currentIndex]);

  // ── Lenis sync ────────────────────────────────────────────────────────────

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    let raf = null;
    const notify = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => window.lenis?.resize());
    };
    const ro = new ResizeObserver(notify);
    ro.observe(el);
    return () => { ro.disconnect(); if (raf) cancelAnimationFrame(raf); };
  }, []);

  useEffect(() => {
    const t = setTimeout(() => window.lenis?.resize(), 450);
    return () => clearTimeout(t);
  }, [activeCategory, currentIndex, isMobile]);

  // ── Navigation ────────────────────────────────────────────────────────────

  const goToTour = useCallback(
    (index) => {
      if (index >= 0 && index < filteredTours.length) setCurrentIndex(index);
    },
    [filteredTours]
  );

  const goToPrev  = useCallback(() => goToTour(currentIndex - 1), [currentIndex, goToTour]);
  const goToNext  = useCallback(() => goToTour(currentIndex + 1), [currentIndex, goToTour]);
  const goToFirst = useCallback(() => goToTour(0),                  [goToTour]);
  const goToLast  = useCallback(() => goToTour(filteredTours.length - 1), [filteredTours.length, goToTour]);

  const handleCategorySelect = useCallback((id) => setActiveCategory(id), []);
  const handleTourChange     = useCallback(
    (idx) => { if (idx >= 0 && idx < filteredTours.length) goToTour(idx); },
    [filteredTours, goToTour]
  );

  // ── Swipe ─────────────────────────────────────────────────────────────────

  const handleTouchStart = useCallback((e) => {
    const t = e.touches[0];
    setTouchStartX(t.clientX);
    setTouchStartY(t.clientY);
    setTouchDeltaX(0);
    setIsDragging(true);
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!isDragging) return;
    const t  = e.touches[0];
    const dx = t.clientX - touchStartX;
    const dy = t.clientY - touchStartY;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10) {
      e.preventDefault();
      setTouchDeltaX(dx);
    }
  }, [isDragging, touchStartX, touchStartY]);

  const handleTouchEnd = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    if (Math.abs(touchDeltaX) > 50) {
      if (touchDeltaX < 0) goToNext(); else goToPrev();
    }
    setTouchDeltaX(0);
  }, [isDragging, touchDeltaX, goToNext, goToPrev]);

  // ── Keyboard ──────────────────────────────────────────────────────────────

  useEffect(() => {
    const onKey = (e) => {
      const el = containerRef.current;
      if (!el) return;
      const { top, bottom } = el.getBoundingClientRect();
      if (top >= window.innerHeight || bottom <= 0) return;
      if (e.key === "ArrowLeft")  { e.preventDefault(); goToPrev(); }
      if (e.key === "ArrowRight") { e.preventDefault(); goToNext(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goToPrev, goToNext]);

  // ── Derived ───────────────────────────────────────────────────────────────

  const currentTour      = filteredTours[currentIndex] || null;
  const currentTourIndex = currentTour?.tourIndex       ?? 0;
  const currentTourTotal = currentTour?.totalInCategory ?? 0;
  const isFirst          = currentIndex === 0;
  const isLast           = currentIndex === filteredTours.length - 1;
  const prevTour         = filteredTours[currentIndex - 1] || null;
  const nextTour         = filteredTours[currentIndex + 1] || null;

  const trackTransform = () => {
    const base      = -currentIndex * 100;
    const dragOffset = isDragging
      ? (touchDeltaX / (stageRef.current?.offsetWidth || 1)) * 100
      : 0;
    return `translateX(${base + dragOffset}%)`;
  };

  // ── Shared button style ───────────────────────────────────────────────────

  const sideButtonClass =
    "relative z-20 flex items-center justify-center w-10 rounded-2xl border border-white/25 text-white hover:scale-105 focus:outline-none shadow-lg transition-all duration-200 overflow-hidden flex-shrink-0";

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <main className="tours-browser w-full overflow-x-hidden  text-white pt-10">
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

        {/* ── Stage ───────────────────────────────────────────────────────── */}
        <div ref={stageRef} className="relative z-10 w-full pointer-events-auto my-4">

          {/*
            KEY FIX: the row that holds [prev] [card] [next] uses
            `items-stretch` so all three children fill the same height.
            Each side-button wrapper also uses `self-stretch` and renders
            its <button> as h-full so the blurred background and chevron
            span the full card height.
          */}
          <div
            className="flex items-stretch gap-1 mb-20"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* ── Prev button ─────────────────────────────────────────────── */}
            <AnimatePresence>
              {!isFirst && !isMobile && (
                <motion.div
                  key="prev"
                  className="flex-shrink-0 self-stretch flex"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 40 }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  onAnimationComplete={() => window.lenis?.resize()}
                  style={cardHeight ? { height: cardHeight } : undefined}
                >
                  <button
                    type="button"
                    onClick={goToPrev}
                    className={sideButtonClass}
                    style={{ width: 40, height: "100%" }}
                    aria-label="Previous tour"
                  >
                    {prevTour?.image && (
                      <img
                        src={prevTour.image}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover blur-lg scale-110 pointer-events-none"
                      />
                    )}
                    <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
                    <svg
                      className="w-6 h-6 relative z-10 flex-shrink-0"
                      fill="none" stroke="currentColor" strokeWidth="2.5"
                      strokeLinecap="round" strokeLinejoin="round"
                      viewBox="0 0 24 24"
                    >
                      <path d="M15 18l-6-6 6-6" />
                    </svg>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Card track ──────────────────────────────────────────────── */}
            <div
              className="flex-1 min-w-0 overflow-hidden"
              style={{ contain: "layout style paint" }}
            >
              <div
                className="flex will-change-transform"
                style={{
                  transform:  trackTransform(),
                  transition: isDragging
                    ? "none"
                    : "transform 500ms cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                }}
              >
                {filteredTours.map((tour, index) => (
                  <motion.div
                    key={tour.id}
                    ref={(el) => {
                      if (el) cardRefs.current[tour.id] = el;
                      else    delete cardRefs.current[tour.id];
                    }}
                    className="flex-shrink-0 w-full"
                    animate={{ opacity: currentIndex === index ? 1 : 0 }}
                    transition={{ opacity: { duration: 0.4, ease: "easeInOut" } }}
                    style={{ willChange: "opacity" }}
                  >
                    <TourCard tour={tour} isMobile={isMobile} isCarousel />
                  </motion.div>
                ))}
              </div>
            </div>

            {/* ── Next button ─────────────────────────────────────────────── */}
            <AnimatePresence>
              {!isLast && !isMobile && (
                <motion.div
                  key="next"
                  className="flex-shrink-0 self-stretch flex"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 40 }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  onAnimationComplete={() => window.lenis?.resize()}
                  style={cardHeight ? { height: cardHeight } : undefined}
                >
                  <button
                    type="button"
                    onClick={goToNext}
                    className={sideButtonClass}
                    style={{ width: 40, height: "100%" }}
                    aria-label="Next tour"
                  >
                    {nextTour?.image && (
                      <img
                        src={nextTour.image}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover blur-lg scale-110 pointer-events-none"
                      />
                    )}
                    <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
                    <svg
                      className="w-6 h-6 relative z-10 flex-shrink-0"
                      fill="none" stroke="currentColor" strokeWidth="2.5"
                      strokeLinecap="round" strokeLinejoin="round"
                      viewBox="0 0 24 24"
                    >
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>
    </main>
  );
}