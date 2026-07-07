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

// --------------------------------------------------
// CONFIG
// --------------------------------------------------
const DESKTOP = {
  NAV_OFFSET: 6,
  CARD_HEIGHT: 680,
  HOLD_DISTANCE: 700,
  TRANSITION_DISTANCE: 1100,
  STAGE_TOP: "10rem",
  ACTIVE_DETECTION_OFFSET: 450,
};

const MOBILE = {
  NAV_OFFSET: 4,
  CARD_HEIGHT: 600,        // increased from 560 to avoid clipping
  HOLD_DISTANCE: 300,
  TRANSITION_DISTANCE: 500,
  STAGE_TOP: "5rem",
  ACTIVE_DETECTION_OFFSET: 250,
};

const BREAKPOINT = 768;

export default function ToursBrowser() {
  const containerRef = useRef(null);
  const stageRef = useRef(null);
  const mobileNavRef = useRef(null);
  const mobileNavScrollerRef = useRef(null);
  const mobileCategoryItemRefs = useRef({});

  const [activeCategory, setActiveCategory] = useState("adrenaline");
  const [currentTourIndex, setCurrentTourIndex] = useState(0);
  const [currentTourTotal, setCurrentTourTotal] = useState(1);
  const [pinned, setPinned] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const CONFIG = useMemo(() => (isMobile ? MOBILE : DESKTOP), [isMobile]);
  const {
    NAV_OFFSET,
    CARD_HEIGHT,
    HOLD_DISTANCE,
    TRANSITION_DISTANCE,
    STAGE_TOP,
    ACTIVE_DETECTION_OFFSET,
  } = CONFIG;
  const TOTAL_DISTANCE = HOLD_DISTANCE + TRANSITION_DISTANCE;

  // Responsive listener
  const handleResize = useCallback(() => {
    setIsMobile(window.innerWidth < BREAKPOINT);
  }, []);
  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize]);

  // --------------------------------------------------
  // CATEGORY GROUPING
  // --------------------------------------------------
  const categorySections = useMemo(() => {
    const grouped = {
      adrenaline: tours.filter((t) => t.type === TOUR_TYPES.ADRENALINE),
      hiking: tours.filter((t) => t.type === TOUR_TYPES.HIKING),
      historical: tours.filter((t) => t.type === TOUR_TYPES.HISTORICAL),
      packages: tours.filter(
        (t) => t.type === TOUR_TYPES.PACKAGES || t.type === TOUR_TYPES.WINE_ROUTES
      ),
    };
    return Object.entries(grouped).map(([id, tours]) => ({
      id,
      label: id.charAt(0).toUpperCase() + id.slice(1),
      tours,
    }));
  }, []);

  // --------------------------------------------------
  // FLATTEN TOURS
  // --------------------------------------------------
  const allTours = useMemo(
    () =>
      categorySections.flatMap((section) =>
        section.tours.map((tour, i) => ({
          ...tour,
          categoryId: section.id,
          categoryLabel: section.label,
          tourIndex: i,
          totalInCategory: section.tours.length,
        }))
      ),
    [categorySections]
  );

  // --------------------------------------------------
  // GSAP SETUP
  // --------------------------------------------------
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Kill all previous triggers to avoid build-up
      ScrollTrigger.getAll().forEach((st) => st.kill());

      const wrappers = gsap.utils.toArray(
        containerRef.current.querySelectorAll(".tour-trigger")
      );
      const cards = gsap.utils.toArray(
        containerRef.current.querySelectorAll(".tour-stage-card")
      );

      // 2. Full reset – start with all cards visible, stacked off‑screen
      gsap.set(cards, { clearProps: "all" });
      cards.forEach((card, index) => {
        gsap.set(card, {
          yPercent: index === 0 ? 0 : 115,
          scale: index === 0 ? 1 : 0.985,
          zIndex: 1000 - index,
          autoAlpha: 1,          // ensure all start visible
        });
      });

      // 3. Pin the fixed category nav
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

      // 4. Pin the card stage (responsive top)
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: `top top+=${NAV_OFFSET}`,
        endTrigger: ".scroll-end",
        end: "bottom bottom",
        pin: stageRef.current,
        pinSpacing: false,
        anticipatePin: 1,
      });

      // 5. Tour transitions with auto‑fade fix
      wrappers.forEach((wrapper, index) => {
        const currentCard = cards[index];
        const nextCard = cards[index + 1];
        const currentTour = allTours[index];

        // Active tour detection
        ScrollTrigger.create({
          trigger: wrapper,
          start: `top top+=${ACTIVE_DETECTION_OFFSET}`,
          end: `+=${TOTAL_DISTANCE}`,
          onEnter: () => updateActiveTour(currentTour),
          onEnterBack: () => updateActiveTour(currentTour),
        });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: wrapper,
            start: `top top+=${NAV_OFFSET}`,
            end: `+=${TOTAL_DISTANCE}`,
            scrub: 1.1,
          },
        });

        // Hold phase
        tl.to({}, { duration: HOLD_DISTANCE / TOTAL_DISTANCE });

        // Transition phase (if there is a next card)
        if (nextCard) {
          // Bring next card to front
          tl.set(nextCard, { zIndex: 3000 + index }, 0);

          // Slide next card into view
          tl.to(nextCard, {
            yPercent: 0,
            scale: 1,
            ease: "power3.out",
            duration: TRANSITION_DISTANCE / TOTAL_DISTANCE,
          });

          // 🔥 FIX: fade out the old card once it's fully covered
          // Starts at 98% of the total scroll distance (almost the very end)
          tl.to(
            currentCard,
            {
              autoAlpha: 0,         // fades out & sets visibility:hidden
              duration: 0.02,       // quick fade, scrub will reverse it
            },
            0.98                   // position in timeline
          );

          // (optional) also demote its z-index for extra safety
          tl.call(
            () => gsap.set(currentCard, { zIndex: 1 }),
            null,
            0.98
          );
        }
      });

      ScrollTrigger.refresh();
    }, containerRef);

    return () => ctx.revert();
  }, [allTours, NAV_OFFSET, TOTAL_DISTANCE, ACTIVE_DETECTION_OFFSET]);

  const updateActiveTour = useCallback((tour) => {
    setActiveCategory(tour.categoryId);
    setCurrentTourIndex(tour.tourIndex);
    setCurrentTourTotal(tour.totalInCategory);
  }, []);

  // Scroll direction (optional – kept for any future use)
  const [scrollDirection, setScrollDirection] = useState("up");
  const lastScrollY = useRef(0);
  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (Math.abs(currentY - lastScrollY.current) < 4) return;
      setScrollDirection(currentY > lastScrollY.current ? "down" : "up");
      lastScrollY.current = currentY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------
  return (
    <main className="w-full overflow-x-hidden bg-gradient-to-br from-white to-blue-600 text-white">
      <section
        ref={containerRef}
        className="relative mx-auto w-full max-w-5xl px-3 md:px-4"
      >
        {/* Fixed category nav */}
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
              const target = document.querySelector(`[data-category="${categoryId}"]`);
              if (!target) return;
              gsap.to(window, {
                duration: 1,
                ease: "power3.out",
                scrollTo: { y: target, offsetY: NAV_OFFSET },
              });
            }}
          />
        </div>

        {/* Scroll track (spacers) */}
        <div className="relative" style={{ paddingTop: `${NAV_OFFSET}px` }}>
          {allTours.map((tour) => (
            <section
              key={tour.id}
              className="tour-trigger relative"
              data-category={tour.categoryId}
              style={{ height: `${TOTAL_DISTANCE}px` }}
            />
          ))}
        </div>

        {/* Shared card stage */}
        <div
          ref={stageRef}
          className="absolute left-0 z-[100] w-full overflow-visible pointer-events-none"
          style={{ top: STAGE_TOP }}
        >
          <div
            className="relative overflow-hidden"
            style={{ height: `${CARD_HEIGHT}px` }}
          >
            {allTours.map((tour) => (
              <div
                key={tour.id}
                className="tour-stage-card absolute left-0 top-0 w-full will-change-transform pointer-events-auto"
              >
                <TourCard
                  tour={tour}
                  cardHeight={CARD_HEIGHT}
                  isMobile={isMobile}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="scroll-end h-px w-full" />
      </section>
    </main>
  );
}
