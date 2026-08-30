import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import tours from "../../data/tours.js";
import TourCard from "./TourCard.jsx";
import FixedCategoryNav from "./FixedCategoryNav.jsx";

const BREAKPOINT = 768;

export default function ToursBrowser() {

  const mobileNavRef = useRef(null);
  const mobileNavScrollerRef = useRef(null);
  const mobileCategoryItemRefs = useRef({});

  const containerRef = useRef(null);
  const stageRef = useRef(null);
  const dragRef = useRef({ startX: 0, startY: 0, deltaX: 0, dragging: false });

  const [activeCategory, setActiveCategory] = useState("adrenaline");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [dragDelta, setDragDelta] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const categorySections = useMemo(() => {
    const grouped = {
      adrenaline: tours.filter((t) => t.type === "adrenaline"),
      hiking: tours.filter((t) => t.type === "hiking"),
      historical: tours.filter((t) => t.type === "historical"),
      packages: tours.filter((t) => t.type === "packages" || t.type === "wine_routes"),
    };
    return Object.entries(grouped).map(([id, tourList]) => ({
      id,
      label: id.charAt(0).toUpperCase() + id.slice(1),
      tours: tourList,
    }));
  }, []);

  const filteredTours = useMemo(() => {
    return categorySections
      .find((s) => s.id === activeCategory)
      ?.tours.map((tour, index) => ({ ...tour, tourIndex: index, totalInCategory: categorySections.find(s => s.id === activeCategory).tours.length }))
      ?? [];
  }, [categorySections, activeCategory]);

  useEffect(() => setCurrentIndex(0), [activeCategory]);

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

  // Fixed-height cards + fixed-size images mean this component's height
  // never changes after mount, so Lenis/ScrollTrigger never need to
  // recalculate mid-scroll. This single resize call after category/index
  // changes is all that's needed now.
  useEffect(() => {
    const t = setTimeout(() => window.lenis?.resize(), 300);
    return () => clearTimeout(t);
  }, [activeCategory, currentIndex, isMobile]);

  const goToTour = useCallback((index) => {
    if (index < 0 || index >= filteredTours.length) return;
    setCurrentIndex(index);
  }, [filteredTours]);

  const goToPrev = useCallback(() => goToTour(currentIndex - 1), [currentIndex, goToTour]);
  const goToNext = useCallback(() => goToTour(currentIndex + 1), [currentIndex, goToTour]);
  const goToFirst = useCallback(() => goToTour(0), [goToTour]);
  const goToLast = useCallback(() => goToTour(filteredTours.length - 1), [filteredTours.length, goToTour]);

  const handleTouchStart = useCallback((e) => {
    const t = e.touches[0];
    dragRef.current = { startX: t.clientX, startY: t.clientY, deltaX: 0, dragging: true };
    setIsDragging(true);
  }, []);

  const handleTouchMove = useCallback((e) => {
    const d = dragRef.current;
    if (!d.dragging) return;
    const t = e.touches[0];
    const deltaX = t.clientX - d.startX;
    const deltaY = t.clientY - d.startY;
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
      e.preventDefault();
      d.deltaX = deltaX;
      setDragDelta(deltaX);
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    const d = dragRef.current;
    if (!d.dragging) return;
    d.dragging = false;
    setIsDragging(false);
    if (Math.abs(d.deltaX) > 50) {
      d.deltaX < 0 ? goToNext() : goToPrev();
    }
    setDragDelta(0);
  }, [goToNext, goToPrev]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (rect.top >= window.innerHeight || rect.bottom <= 0) return;
      if (e.key === "ArrowLeft") { e.preventDefault(); goToPrev(); }
      else if (e.key === "ArrowRight") { e.preventDefault(); goToNext(); }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToPrev, goToNext]);

  const currentTour = filteredTours[currentIndex] || null;
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === filteredTours.length - 1;
  const prevTour = filteredTours[currentIndex - 1] || null;
  const nextTour = filteredTours[currentIndex + 1] || null;

  const trackTransform = `translateX(${
    -currentIndex * 100 + (isDragging ? (dragDelta / (stageRef.current?.offsetWidth || 1)) * 100 : 0)
  }%)`;

  const NavThumb = ({ tour, onClick, side }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={!tour}
      className="relative hidden md:flex flex-shrink-0 self-stretch w-10 items-center justify-center rounded-2xl border border-white/25 text-white hover:scale-105 focus:outline-none shadow-lg overflow-hidden transition-opacity duration-200"
      style={{ opacity: tour ? 1 : 0, pointerEvents: tour ? "auto" : "none" }}
      aria-label={side === "prev" ? "Previous tour" : "Next tour"}
    >
      {tour && (
        <img
          src={tour.image || "/placeholder-image.jpg"}
          alt=""
          width={80}
          height={600}
          className="absolute inset-0 w-full h-full object-cover blur-lg scale-110"
        />
      )}
      <div className="absolute inset-0 bg-white/10 backdrop-blur-sm hover:bg-white/20" />
      <svg className="w-6 h-6 relative z-10" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d={side === "prev" ? "M15 18l-6-6 6-6" : "M9 18l6-6-6-6"} />
      </svg>
    </button>
  );

  return (
    <main className="w-full overflow-x-hidden bg-gradient-to-br from-white to-blue-600 text-white py-10">
      <section ref={containerRef} className="relative mx-auto w-full max-w-5xl px-3 md:px-4">
        <FixedCategoryNav
          activeCategory={activeCategory}
          currentTourIndex={currentTour?.tourIndex ?? 0}
          currentTourTotal={currentTour?.totalInCategory ?? 0}
          sections={categorySections}
          mobileNavRef={mobileNavRef}
          mobileNavScrollerRef={mobileNavScrollerRef}
          mobileCategoryItemRefs={mobileCategoryItemRefs}
          metrics={{ desktopNavTop: 24, navLeft: 12, mobileTop: 100 }}
          onSelect={setActiveCategory}
          onTourChange={goToTour}
          categoryTours={filteredTours}
          onFirst={goToFirst}
          onLast={goToLast}
          isFirst={isFirst}
          isLast={isLast}
        />
        <div
          ref={stageRef}
          className="relative z-10 my-4 flex items-stretch gap-1 overflow-hidden"
          style={{ height: 600 }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <NavThumb tour={prevTour} onClick={goToPrev} side="prev" />

          <div
            className="flex flex-1 min-w-0"
            style={{
              transform: trackTransform,
              transition: isDragging ? "none" : "transform 500ms cubic-bezier(0.25,0.46,0.45,0.94)",
            }}
          >
            {filteredTours.map((tour, index) => (
              <div
                key={tour.id}
                className="flex-shrink-0 w-full transition-opacity duration-300"
                style={{ opacity: currentIndex === index ? 1 : 0 }}
              >
                <TourCard tour={tour} isMobile={isMobile} isCarousel={true} />
              </div>
            ))}
          </div>

          <NavThumb tour={nextTour} onClick={goToNext} side="next" />
        </div>
      </section>
    </main>
  );
}