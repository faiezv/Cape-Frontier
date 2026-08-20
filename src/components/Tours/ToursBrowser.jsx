import React, {
  useLayoutEffect,
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import tours, { TOUR_TYPES } from "../../data/tours.js";
import TourCard from "./TourCard.jsx";
import FixedCategoryNav from "./FixedCategoryNav.jsx";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

const BREAKPOINT = 768;
const BUTTON_ROW_HEIGHT = 52;

export default function ToursBrowser() {
  const containerRef = useRef(null);
  const stageRef = useRef(null);
  const mobileNavRef = useRef(null);
  const mobileNavScrollerRef = useRef(null);
  const mobileCategoryItemRefs = useRef({});

  const triggerRefs = useRef([]);
  const tourScrollTriggers = useRef([]);

  const [activeCategory, setActiveCategory] = useState("adrenaline");
  const [currentTourIndex, setCurrentTourIndex] = useState(0);
  const [currentTourTotal, setCurrentTourTotal] = useState(1);
  const [currentGlobalIndex, setCurrentGlobalIndex] = useState(0);
  const [pinned, setPinned] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Sizing state
  const [cardHeight, setCardHeight] = useState(400);
  const [stageHeight, setStageHeight] = useState(652);
  const [stageTop, setStageTop] = useState("80px");
  const [holdDistance, setHoldDistance] = useState(700);
  const [transitionDistance, setTransitionDistance] = useState(1100);
  const [totalDistance, setTotalDistance] = useState(1800);
  const [activeDetectionOffset, setActiveDetectionOffset] = useState(450);
  const [navOffset, setNavOffset] = useState(6);

  const [navHeight, setNavHeight] = useState(120);
  const isScrollingRef = useRef(false);

  // ─── Dynamic sizing ─────────────────────────────────────────────
  const computeSizes = useCallback(() => {
    const mobile = window.innerWidth < BREAKPOINT;
    setIsMobile(mobile);

    if (mobile) {
      const topMargin = 70;
      const bottomMargin = 12;
      const availableHeight = window.innerHeight - topMargin - bottomMargin;
      const calculatedCardHeight = Math.max(420, availableHeight - BUTTON_ROW_HEIGHT);

      setStageTop(`${topMargin}px`);
      setCardHeight(calculatedCardHeight);
      setStageHeight(calculatedCardHeight + BUTTON_ROW_HEIGHT);
      setHoldDistance(150);
      setTransitionDistance(300);
      setTotalDistance(450);
      setActiveDetectionOffset(250);
      setNavOffset(4);
      return;
    }

    // Desktop
    const topMargin = 80;
    const bottomMargin = 20;
    const availableHeight = window.innerHeight - topMargin - bottomMargin;
    const calculatedCardHeight = Math.min(680, Math.max(450, availableHeight - BUTTON_ROW_HEIGHT));
    const calculatedStageHeight = calculatedCardHeight + BUTTON_ROW_HEIGHT;
    const ratio = calculatedCardHeight / 680;
    const hold = Math.max(200, 700 * ratio);
    const transition = Math.max(300, 1100 * ratio);

    setStageTop(`${topMargin}px`);
    setCardHeight(calculatedCardHeight);
    setStageHeight(calculatedStageHeight);
    setHoldDistance(hold);
    setTransitionDistance(transition);
    setTotalDistance(hold + transition);
    setActiveDetectionOffset(Math.min(450, hold * 0.6));
    setNavOffset(6);
  }, []);

  useEffect(() => {
    computeSizes();
    window.addEventListener("resize", computeSizes);
    return () => window.removeEventListener("resize", computeSizes);
  }, [computeSizes]);

  // ─── Measure nav height ────────────────────────────────────────
  useEffect(() => {
    const navEl = mobileNavRef.current;
    if (!navEl) return;

    const updateHeight = () => {
      setNavHeight(navEl.offsetHeight || 120);
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, [activeCategory]);

  // ─── Category grouping ──────────────────────────────────────────
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

  // ─── Flatten all tours ──────────────────────────────────────────
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

  // ─── Update active tour from scroll (blocked during programmatic scroll) ──
  const updateActiveTour = useCallback(
    (tour) => {
      if (isScrollingRef.current) return;
      if (!tour) return;
      setActiveCategory(tour.categoryId);
      setCurrentTourIndex(tour.tourIndex);
      setCurrentTourTotal(tour.totalInCategory);

      const globalIndex = allTours.findIndex((item) => item.id === tour.id);
      if (globalIndex !== -1) {
        setCurrentGlobalIndex(globalIndex);
      }
    },
    [allTours]
  );

  // ─── GSAP + ScrollTrigger setup ─────────────────────────────────
  useLayoutEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      const wrappers = triggerRefs.current.filter(Boolean);
      const cards = gsap.utils.toArray(
        containerRef.current.querySelectorAll(".tour-stage-card")
      );

      tourScrollTriggers.current = [];

      gsap.set(cards, { clearProps: "all" });

      cards.forEach((card, index) => {
        gsap.set(card, {
          yPercent: index === 0 ? 0 : 115,
          scale: index === 0 ? 1 : 0.985,
          zIndex: 1000 - index,
          autoAlpha: 1,
        });
      });

      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top top",
        endTrigger: ".scroll-end",
        end: "bottom bottom",
        pin: ".first-panel",
        pinSpacing: false,
        anticipatePin: 1,
        onEnter: () => setPinned(true),
        onLeave: () => setPinned(false),
        onEnterBack: () => setPinned(true),
        onLeaveBack: () => setPinned(false),
      });

      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top top",
        endTrigger: ".scroll-end",
        end: "bottom bottom",
        pin: stageRef.current,
        pinSpacing: false,
        anticipatePin: 1,
      });

      wrappers.forEach((wrapper, index) => {
        const currentCard = cards[index];
        const nextCard = cards[index + 1];
        const currentTour = allTours[index];
        if (!currentTour) return;

        const activeTrigger = ScrollTrigger.create({
          trigger: wrapper,
          start: `top top+=${activeDetectionOffset}`,
          end: `+=${totalDistance}`,
          onEnter: () => updateActiveTour(currentTour),
          onEnterBack: () => updateActiveTour(currentTour),
        });
        tourScrollTriggers.current[index] = activeTrigger;

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: wrapper,
            start: `top top+=${navOffset}`,
            end: `+=${totalDistance}`,
            scrub: 1.1,
          },
        });

        tl.to({}, { duration: holdDistance / totalDistance });

        if (nextCard) {
          tl.set(nextCard, { zIndex: 3000 + index }, 0);
          tl.to(nextCard, {
            yPercent: 0,
            scale: 1,
            ease: "power3.out",
            duration: transitionDistance / totalDistance,
          });
          tl.to(currentCard, { autoAlpha: 0, duration: 0.02 }, 0.98);
          tl.call(() => {
            gsap.set(currentCard, { zIndex: 1 });
          }, null, 0.98);
        }
      });

      ScrollTrigger.refresh();
    }, containerRef);

    return () => {
      ctx.revert();
      tourScrollTriggers.current = [];
    };
  }, [
    allTours,
    navOffset,
    totalDistance,
    activeDetectionOffset,
    holdDistance,
    transitionDistance,
    updateActiveTour,
    stageHeight,
  ]);

  // ─── Navigation: scroll to a specific tour ──────────────────────
  const goToTour = useCallback(
    (index) => {
      if (index < 0 || index >= allTours.length) return;

      const wrapper = triggerRefs.current[index];
      if (!wrapper) {
        console.warn(`No wrapper element found for index ${index}`);
        return;
      }

      ScrollTrigger.refresh();

      // Block ScrollTrigger updates during the scroll
      isScrollingRef.current = true;

      // Calculate target scroll position so the wrapper's top is at navHeight + 5 from viewport top
      const rect = wrapper.getBoundingClientRect();
      const targetY = rect.top + window.scrollY - navHeight + 5;

      gsap.to(window, {
        duration: 0.9,
        ease: "power3.inOut",
        scrollTo: { y: targetY, autoKill: true },
        onComplete: () => {
          isScrollingRef.current = false;
        },
        onInterrupt: () => {
          isScrollingRef.current = false;
        },
      });
    },
    [allTours.length, navHeight]
  );

  // ─── Tour change handler (called from FixedCategoryNav) ────────
  const handleTourChange = useCallback(
    (categoryIndex) => {
      const category = categorySections.find((s) => s.id === activeCategory);
      if (!category) return;
      const tour = category.tours[categoryIndex];
      if (!tour) return;
      const globalIndex = allTours.findIndex((t) => t.id === tour.id);
      if (globalIndex !== -1) {
        // Instant highlight
        setCurrentTourIndex(categoryIndex);
        setCurrentGlobalIndex(globalIndex);
        goToTour(globalIndex);
      }
    },
    [activeCategory, categorySections, allTours, goToTour]
  );

  // ─── Tours for the active category ──────────────────────────────
  const activeCategoryTours = useMemo(() => {
    const section = categorySections.find((s) => s.id === activeCategory);
    return section ? section.tours : [];
  }, [categorySections, activeCategory]);

  // ─── Global Previous / Next ─────────────────────────────────────
  const handlePrev = useCallback(() => {
    if (currentGlobalIndex > 0) {
      goToTour(currentGlobalIndex - 1);
    }
  }, [currentGlobalIndex, goToTour]);

  const handleNext = useCallback(() => {
    if (currentGlobalIndex < allTours.length - 1) {
      goToTour(currentGlobalIndex + 1);
    }
  }, [currentGlobalIndex, allTours.length, goToTour]);

  const isFirst = currentGlobalIndex === 0;
  const isLast = currentGlobalIndex === allTours.length - 1;

  // ─── Render ──────────────────────────────────────────────────────
  return (
    <main className="w-full overflow-x-hidden bg-gradient-to-br from-white to-blue-600 text-white">
      <section ref={containerRef} className="relative mx-auto w-full max-w-5xl px-3 md:px-4">
        <div className="first-panel absolute left-0 top-0 z-[5000] w-full pointer-events-none">
          <FixedCategoryNav
            activeCategory={activeCategory}
            currentTourIndex={currentTourIndex}
            currentTourTotal={currentTourTotal}
            pinned={pinned}
            sections={categorySections}
            mobileNavRef={mobileNavRef}
            mobileNavScrollerRef={mobileNavScrollerRef}
            mobileCategoryItemRefs={mobileCategoryItemRefs}
            metrics={{
              desktopNavTop: 24,
              navLeft: 12,
              mobileTop: 12,
            }}
            onSelect={(categoryId) => {
              setActiveCategory(categoryId);
              setCurrentTourIndex(0);
              const index = allTours.findIndex(
                (tour) => tour.categoryId === categoryId
              );
              if (index !== -1) {
                setCurrentGlobalIndex(index);
                goToTour(index);
              }
            }}
            onTourChange={handleTourChange}
            categoryTours={activeCategoryTours}
          />
        </div>

        <div className="relative" style={{ paddingTop: `${navOffset}px` }}>
          {allTours.map((tour, index) => (
            <section
              key={tour.id}
              ref={(el) => { triggerRefs.current[index] = el; }}
              className="tour-trigger relative"
              data-category={tour.categoryId}
              data-tour-index={index}
              style={{ height: `${totalDistance}px` }}
            />
          ))}
        </div>

        <div
          ref={stageRef}
          className="absolute left-0 z-[100] w-full pointer-events-none"
          style={{
            top: stageTop,
            height: `${stageHeight}px`,
          }}
        >
          <div className="flex h-full w-full flex-col">
            <div
              className="flex shrink-0 items-center justify-center gap-4 pointer-events-auto"
              style={{ height: `${BUTTON_ROW_HEIGHT}px` }}
            >
              <button
                type="button"
                onClick={handlePrev}
                disabled={isFirst}
                className="rounded-full bg-white/20 px-5 py-2 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/30 disabled:cursor-not-allowed disabled:opacity-40"
              >
                ‹ Previous
              </button>
              <span className="min-w-[55px] text-center text-sm font-medium text-white/70">
                {currentGlobalIndex + 1} / {allTours.length}
              </span>
              <button
                type="button"
                onClick={handleNext}
                disabled={isLast}
                className="rounded-full bg-white/20 px-5 py-2 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/30 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next ›
              </button>
            </div>

            <div className="relative min-h-0 flex-1 overflow-hidden">
              {allTours.map((tour) => (
                <div
                  key={tour.id}
                  className="tour-stage-card absolute inset-0 h-full w-full will-change-transform pointer-events-auto"
                >
                  <TourCard tour={tour} cardHeight={cardHeight} isMobile={isMobile} />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="scroll-end h-px w-full" />
      </section>
    </main>
  );
}