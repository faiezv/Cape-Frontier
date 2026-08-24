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

const BUTTON_ROW_HEIGHT_DESKTOP = 52;
const BUTTON_ROW_HEIGHT_MOBILE = 64;

const MOBILE_NAV_GAP = 18;

// Space between the fixed site navbar and the tours browser UI
const NAVBAR_OFFSET = 20;

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

  // ─────────────────────────────────────────────────────────────
  // Sizing
  // ─────────────────────────────────────────────────────────────

  const [cardHeight, setCardHeight] = useState(400);
  const [stageHeight, setStageHeight] = useState(652);
  const [stageTop, setStageTop] = useState("80px");

  const [buttonRowHeight, setButtonRowHeight] = useState(
    BUTTON_ROW_HEIGHT_DESKTOP
  );

  const [holdDistance, setHoldDistance] = useState(700);
  const [transitionDistance, setTransitionDistance] = useState(1100);
  const [totalDistance, setTotalDistance] = useState(1800);

  // This is now kept only as a sizing value.
  // Navigation/animation positioning uses navOffset consistently.
  const [activeDetectionOffset, setActiveDetectionOffset] = useState(450);

  // IMPORTANT:
  // This is the actual ScrollTrigger top offset used by both
  // card animation and programmatic navigation.
  const [navOffset, setNavOffset] = useState(6);

  const [navHeight, setNavHeight] = useState(120);

  const isScrollingRef = useRef(false);

  // ─────────────────────────────────────────────────────────────
  // Dynamic sizing
  // ─────────────────────────────────────────────────────────────

  const computeSizes = useCallback(() => {
    const mobile = window.innerWidth < BREAKPOINT;

    setIsMobile(mobile);

    if (mobile) {
      const buttonRow = BUTTON_ROW_HEIGHT_MOBILE;

      const topMargin =
        (mobileNavRef.current?.offsetHeight || 96) +
        MOBILE_NAV_GAP +
        NAVBAR_OFFSET;

      const bottomMargin = 12;

      const availableHeight =
        window.innerHeight - topMargin - bottomMargin;

      const calculatedCardHeight = Math.max(
        420,
        availableHeight - buttonRow
      );

      setStageTop(`${topMargin}px`);
      setButtonRowHeight(buttonRow);
      setCardHeight(calculatedCardHeight);
      setStageHeight(calculatedCardHeight + buttonRow);

      setHoldDistance(150);
      setTransitionDistance(300);
      setTotalDistance(450);

      setActiveDetectionOffset(250);

      // IMPORTANT:
      // Card animation starts at top += 4px.
      setNavOffset(4);

      return;
    }

    // ───────────────────────────────────────────────────────────
    // Desktop
    // ───────────────────────────────────────────────────────────

    const buttonRow = BUTTON_ROW_HEIGHT_DESKTOP;

    const topMargin = 80 + NAVBAR_OFFSET;
    const bottomMargin = 20;

    const availableHeight =
      window.innerHeight - topMargin - bottomMargin;

    const calculatedCardHeight = Math.min(
      680,
      Math.max(450, availableHeight - buttonRow)
    );

    const calculatedStageHeight =
      calculatedCardHeight + buttonRow;

    const ratio = calculatedCardHeight / 680;

    const hold = Math.max(200, 700 * ratio);
    const transition = Math.max(300, 1100 * ratio);

    setStageTop(`${topMargin}px`);
    setButtonRowHeight(buttonRow);
    setCardHeight(calculatedCardHeight);
    setStageHeight(calculatedStageHeight);

    setHoldDistance(hold);
    setTransitionDistance(transition);
    setTotalDistance(hold + transition);

    setActiveDetectionOffset(
      Math.min(450, hold * 0.6)
    );

    // IMPORTANT:
    // This MUST match the ScrollTrigger animation start.
    setNavOffset(6);
  }, []);

  useEffect(() => {
    computeSizes();

    window.addEventListener("resize", computeSizes);

    return () => {
      window.removeEventListener("resize", computeSizes);
    };
  }, [computeSizes]);

  // ─────────────────────────────────────────────────────────────
  // Measure mobile navigation height
  // ─────────────────────────────────────────────────────────────

  useEffect(() => {
    const navEl = mobileNavRef.current;

    if (!navEl) return;

    const updateHeight = () => {
      setNavHeight(navEl.offsetHeight || 120);
      computeSizes();
    };

    updateHeight();

    window.addEventListener("resize", updateHeight);

    let ro;

    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(updateHeight);
      ro.observe(navEl);
    }

    return () => {
      window.removeEventListener("resize", updateHeight);

      if (ro) {
        ro.disconnect();
      }
    };
  }, [activeCategory, computeSizes]);

  // ─────────────────────────────────────────────────────────────
  // Category grouping
  // ─────────────────────────────────────────────────────────────

  const categorySections = useMemo(() => {
    const grouped = {
      adrenaline: tours.filter(
        (t) => t.type === TOUR_TYPES.ADRENALINE
      ),

      hiking: tours.filter(
        (t) => t.type === TOUR_TYPES.HIKING
      ),

      historical: tours.filter(
        (t) => t.type === TOUR_TYPES.HISTORICAL
      ),

      packages: tours.filter(
        (t) =>
          t.type === TOUR_TYPES.PACKAGES ||
          t.type === TOUR_TYPES.WINE_ROUTES
      ),
    };

    return Object.entries(grouped).map(
      ([id, tourList]) => ({
        id,
        label:
          id.charAt(0).toUpperCase() +
          id.slice(1),
        tours: tourList,
      })
    );
  }, []);

  // ─────────────────────────────────────────────────────────────
  // Flatten all tours
  // ─────────────────────────────────────────────────────────────

  const allTours = useMemo(() => {
    return categorySections.flatMap(
      (section) =>
        section.tours.map((tour, index) => ({
          ...tour,

          categoryId: section.id,
          categoryLabel: section.label,

          tourIndex: index,
          totalInCategory: section.tours.length,
        }))
    );
  }, [categorySections]);

  // ─────────────────────────────────────────────────────────────
  // Update active tour from scroll
  // ─────────────────────────────────────────────────────────────

  const updateActiveTour = useCallback(
    (tour) => {
      if (isScrollingRef.current) return;
      if (!tour) return;

      setActiveCategory(tour.categoryId);

      setCurrentTourIndex(tour.tourIndex);

      setCurrentTourTotal(
        tour.totalInCategory
      );

      const globalIndex = allTours.findIndex(
        (item) => item.id === tour.id
      );

      if (globalIndex !== -1) {
        setCurrentGlobalIndex(globalIndex);
      }
    },
    [allTours]
  );

  // ─────────────────────────────────────────────────────────────
  // GSAP + ScrollTrigger setup
  // ─────────────────────────────────────────────────────────────

  useLayoutEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      const wrappers =
        triggerRefs.current.filter(Boolean);

      const cards = gsap.utils.toArray(
        containerRef.current.querySelectorAll(
          ".tour-stage-card"
        )
      );

      tourScrollTriggers.current = [];

      // Reset card properties
      gsap.set(cards, {
        clearProps: "all",
      });

      // Initial card positions
      cards.forEach((card, index) => {
        gsap.set(card, {
          yPercent: index === 0 ? 0 : 115,
          scale: index === 0 ? 1 : 0.985,
          zIndex: 1000 - index,
          autoAlpha: 1,
        });
      });

      // ─────────────────────────────────────────────────────────
      // Pin navigation
      // ─────────────────────────────────────────────────────────

      ScrollTrigger.create({
        trigger: containerRef.current,

        start: "top top",

        endTrigger: ".scroll-end",
        end: "bottom bottom",

        pin: ".first-panel",

        pinSpacing: false,
        anticipatePin: 1,
        invalidateOnRefresh: true,

        onEnter: () => {
          setPinned(true);
        },

        onLeave: () => {
          setPinned(false);
        },

        onEnterBack: () => {
          setPinned(true);
        },

        onLeaveBack: () => {
          setPinned(false);
        },
      });

      // ─────────────────────────────────────────────────────────
      // Pin tour stage
      // ─────────────────────────────────────────────────────────

      ScrollTrigger.create({
        trigger: containerRef.current,

        start: "top top",

        endTrigger: ".scroll-end",
        end: "bottom bottom",

        pin: stageRef.current,

        pinSpacing: false,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      });

      // ─────────────────────────────────────────────────────────
      // Individual tour animations
      // ─────────────────────────────────────────────────────────

      wrappers.forEach((wrapper, index) => {
        const currentCard = cards[index];
        const nextCard = cards[index + 1];

        const currentTour = allTours[index];

        if (!currentTour) return;

        // ───────────────────────────────────────────────────────
        // Active tour trigger
        //
        // IMPORTANT:
        // This now uses the EXACT SAME start position as the
        // animation and goToTour().
        // ───────────────────────────────────────────────────────

        const activeTrigger = ScrollTrigger.create({
          trigger: wrapper,

          start: `top top+=${navOffset}`,

          end: `+=${totalDistance}`,

          invalidateOnRefresh: true,

          onEnter: () => {
            updateActiveTour(currentTour);
          },

          onEnterBack: () => {
            updateActiveTour(currentTour);
          },
        });

        tourScrollTriggers.current[index] =
          activeTrigger;

        // ───────────────────────────────────────────────────────
        // Card animation
        // ───────────────────────────────────────────────────────

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: wrapper,

            // EXACT SAME POSITION
            start: `top top+=${navOffset}`,

            end: `+=${totalDistance}`,

            scrub: 1.1,

            invalidateOnRefresh: true,
          },
        });

        // Hold current card
        tl.to(
          {},
          {
            duration:
              holdDistance / totalDistance,
          }
        );

        if (nextCard) {
          // Bring next card above current card
          tl.set(
            nextCard,
            {
              zIndex: 3000 + index,
            },
            0
          );

          // Slide next card completely into place
          tl.to(
            nextCard,
            {
              yPercent: 0,
              scale: 1,

              ease: "power3.out",

              duration:
                transitionDistance /
                totalDistance,
            }
          );

          // Hide current card after transition
          tl.to(
            currentCard,
            {
              autoAlpha: 0,
              duration: 0.02,
            },
            0.98
          );

          // Push old card behind everything
          tl.call(
            () => {
              gsap.set(currentCard, {
                zIndex: 1,
              });
            },
            null,
            0.98
          );
        }
      });

      ScrollTrigger.refresh();
    }, containerRef);

    // ───────────────────────────────────────────────────────────
    // Refresh after fonts/images load
    // ───────────────────────────────────────────────────────────

    let cancelled = false;

    const refresh = () => {
      if (!cancelled) {
        ScrollTrigger.refresh();
      }
    };

    const fontsReady =
      document.fonts?.ready
        ?.then(refresh)
        .catch(() => {});

    const rafId = requestAnimationFrame(() => {
      requestAnimationFrame(refresh);
    });

    window.addEventListener("load", refresh);

    const images =
      containerRef.current.querySelectorAll("img");

    const imageListeners = [];

    images.forEach((img) => {
      if (!img.complete) {
        const onLoad = () => refresh();

        img.addEventListener(
          "load",
          onLoad,
          { once: true }
        );

        imageListeners.push([
          img,
          onLoad,
        ]);
      }
    });

    return () => {
      cancelled = true;

      cancelAnimationFrame(rafId);

      window.removeEventListener(
        "load",
        refresh
      );

      imageListeners.forEach(
        ([img, onLoad]) => {
          img.removeEventListener(
            "load",
            onLoad
          );
        }
      );

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

  // ─────────────────────────────────────────────────────────────
  // Navigation: scroll to a specific tour
  // ─────────────────────────────────────────────────────────────

  const goToTour = useCallback(
    (index) => {
      if (
        index < 0 ||
        index >= allTours.length
      ) {
        return;
      }

      const wrapper =
        triggerRefs.current[index];

      const tour = allTours[index];

      if (!wrapper || !tour) {
        console.warn(
          `No wrapper element found for index ${index}`
        );

        return;
      }

      // Make sure ScrollTrigger has current measurements
      ScrollTrigger.refresh();

      isScrollingRef.current = true;

      // ─────────────────────────────────────────
      // IMPORTANT FIX
      //
      // The card animation starts at:
      //
      // top top += navOffset
      //
      // Therefore navigation MUST scroll to:
      //
      // wrapperTop - navOffset
      //
      // NOT wrapperTop - navHeight.
      // ─────────────────────────────────────────

      const targetY =
        wrapper.getBoundingClientRect().top +
        window.scrollY -
        navOffset;

      // ─────────────────────────────────────────
      // Immediately update navigation state
      // ─────────────────────────────────────────

      setActiveCategory(
        tour.categoryId
      );

      setCurrentTourIndex(
        tour.tourIndex
      );

      setCurrentTourTotal(
        tour.totalInCategory
      );

      setCurrentGlobalIndex(index);

      // ─────────────────────────────────────────
      // Smooth scroll
      // ─────────────────────────────────────────

      gsap.to(window, {
        duration: 0.9,

        ease: "power3.inOut",

        scrollTo: {
          y: targetY,
          autoKill: true,
        },

        // Keep ScrollTrigger synced during the
        // programmatic scroll.
        onUpdate: () => {
          ScrollTrigger.update();
        },

        // ─────────────────────────────────────
        // FINAL POSITION
        // ─────────────────────────────────────

        onComplete: () => {
          // Force the exact final scroll position.
          window.scrollTo(
            0,
            targetY
          );

          ScrollTrigger.update();

          // Explicitly restore selected tour
          // state because updateActiveTour is
          // blocked while programmatic scrolling.
          setActiveCategory(
            tour.categoryId
          );

          setCurrentTourIndex(
            tour.tourIndex
          );

          setCurrentTourTotal(
            tour.totalInCategory
          );

          setCurrentGlobalIndex(
            index
          );

          // Wait one frame before allowing
          // normal ScrollTrigger active updates.
          requestAnimationFrame(() => {
            isScrollingRef.current = false;

            ScrollTrigger.update();
          });
        },

        onInterrupt: () => {
          isScrollingRef.current = false;

          ScrollTrigger.update();
        },
      });
    },
    [allTours, navOffset]
  );

  // ─────────────────────────────────────────────────────────────
  // Tour change from FixedCategoryNav
  // ─────────────────────────────────────────────────────────────

  const handleTourChange = useCallback(
    (categoryIndex) => {
      const category =
        categorySections.find(
          (s) => s.id === activeCategory
        );

      if (!category) return;

      const tour =
        category.tours[categoryIndex];

      if (!tour) return;

      const globalIndex =
        allTours.findIndex(
          (t) => t.id === tour.id
        );

      if (globalIndex !== -1) {
        setCurrentTourIndex(
          categoryIndex
        );

        setCurrentGlobalIndex(
          globalIndex
        );

        goToTour(globalIndex);
      }
    },
    [
      activeCategory,
      categorySections,
      allTours,
      goToTour,
    ]
  );

  // ─────────────────────────────────────────────────────────────
  // Tours for active category
  // ─────────────────────────────────────────────────────────────

  const activeCategoryTours = useMemo(() => {
    const section =
      categorySections.find(
        (s) => s.id === activeCategory
      );

    return section
      ? section.tours
      : [];
  }, [
    categorySections,
    activeCategory,
  ]);

  // ─────────────────────────────────────────────────────────────
  // Previous / Next
  // ─────────────────────────────────────────────────────────────

  const handlePrev = useCallback(() => {
    if (currentGlobalIndex > 0) {
      goToTour(
        currentGlobalIndex - 1
      );
    }
  }, [
    currentGlobalIndex,
    goToTour,
  ]);

  const handleNext = useCallback(() => {
    if (
      currentGlobalIndex <
      allTours.length - 1
    ) {
      goToTour(
        currentGlobalIndex + 1
      );
    }
  }, [
    currentGlobalIndex,
    allTours.length,
    goToTour,
  ]);

  const isFirst =
    currentGlobalIndex === 0;

  const isLast =
    currentGlobalIndex ===
    allTours.length - 1;

  // ─────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────

  return (
    <main className="w-full overflow-x-hidden bg-gradient-to-br from-white to-blue-600 text-white">
      <section
        ref={containerRef}
        className="relative mx-auto w-full max-w-5xl px-3 md:px-4"
      >
        {/* ─────────────────────────────────────────────────────
            Fixed / pinned navigation
        ───────────────────────────────────────────────────── */}

        <div
          className="first-panel absolute left-0 z-[5000] w-full pointer-events-none"
        >
          <div className="mt-20"></div>
          <FixedCategoryNav
            activeCategory={activeCategory}
            currentTourIndex={
              currentTourIndex
            }
            currentTourTotal={
              currentTourTotal
            }
            pinned={pinned}
            sections={categorySections}
            mobileNavRef={mobileNavRef}
            mobileNavScrollerRef={
              mobileNavScrollerRef
            }
            mobileCategoryItemRefs={
              mobileCategoryItemRefs
            }
            metrics={{
              desktopNavTop: 24,
              navLeft: 12,
              mobileTop: 100,
            }}
            onSelect={(categoryId) => {
              setActiveCategory(
                categoryId
              );

              setCurrentTourIndex(0);

              const index =
                allTours.findIndex(
                  (tour) =>
                    tour.categoryId ===
                    categoryId
                );

              if (index !== -1) {
                setCurrentGlobalIndex(
                  index
                );

                goToTour(index);
              }
            }}
            onTourChange={
              handleTourChange
            }
            categoryTours={
              activeCategoryTours
            }
          />
        </div>

        {/* ─────────────────────────────────────────────────────
            ScrollTrigger wrappers
        ───────────────────────────────────────────────────── */}

        <div
          className="relative"
          style={{
            paddingTop: `${navOffset}px`,
          }}
        >
          {allTours.map(
            (tour, index) => (
              <section
                key={tour.id}
                ref={(el) => {
                  triggerRefs.current[index] =
                    el;
                }}
                className="tour-trigger relative"
                data-category={
                  tour.categoryId
                }
                data-tour-index={
                  index
                }
                style={{
                  height: `${totalDistance}px`,
                }}
              />
            )
          )}
        </div>

        {/* ─────────────────────────────────────────────────────
            Tour card stage
        ───────────────────────────────────────────────────── */}

        <div
          ref={stageRef}
          className="absolute left-0 z-[100] w-full pointer-events-none"
          style={{
            top: stageTop,
            height: `${stageHeight}px`,
          }}
        >
          <div className="flex h-full w-full flex-col">

            {/* ───────────────────────────────────────────────
                Previous / Next controls
            ─────────────────────────────────────────────── */}

            <div className="mt-30"></div>
            <div
              className="flex m-2 shrink-0 items-center justify-center gap-3 md:gap-4 pointer-events-auto"
            >
              <button
                type="button"
                onClick={handlePrev}
                disabled={isFirst}
                aria-label="Previous tour"
                className={
                  isMobile
                    ? "flex items-center gap-1.5 rounded-full bg-white text-blue-700 px-6 py-3 text-base font-bold shadow-lg shadow-black/20 transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
                    : "rounded-full bg-white/20 px-5 py-2 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/30 disabled:cursor-not-allowed disabled:opacity-40"
                }
              >
                ‹ Previous
              </button>

              <span className="min-w-[55px] text-center text-sm font-medium text-white/70">
                {currentGlobalIndex + 1} /{" "}
                {allTours.length}
              </span>

              <button
                type="button"
                onClick={handleNext}
                disabled={isLast}
                aria-label="Next tour"
                className={
                  isMobile
                    ? "flex items-center gap-1.5 rounded-full bg-white text-blue-700 px-6 py-3 text-base font-bold shadow-lg shadow-black/20 transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
                    : "rounded-full bg-white/20 px-5 py-2 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/30 disabled:cursor-not-allowed disabled:opacity-40"
                }
              >
                Next ›
              </button>
            </div>

            {/* ───────────────────────────────────────────────
                Cards
            ─────────────────────────────────────────────── */}

            <div className="relative min-h-0 flex-1 overflow-hidden">
              {allTours.map(
                (tour) => (
                  <div
                    key={tour.id}
                    className="tour-stage-card absolute inset-0 h-full w-full will-change-transform pointer-events-auto"
                  >
                    <TourCard
                      tour={tour}
                      cardHeight={
                        cardHeight
                      }
                      isMobile={
                        isMobile
                      }
                    />
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────
            ScrollTrigger end marker
        ───────────────────────────────────────────────────── */}

        <div className="scroll-end h-px w-full" />
      </section>
    </main>
  );
}