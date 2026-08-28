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

// Tell ScrollTrigger to ignore the resize events iOS Safari fires when the
// address bar collapses/expands during scroll. Without this, every scroll
// on iOS can trigger a full ScrollTrigger rebuild mid-gesture, which is the
// root cause of the flicker / wrong-tour-jump / incomplete-animation bugs.
ScrollTrigger.config({ ignoreMobileResize: true });

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
  const triggerInstances = useRef([]); // 👈 store ScrollTrigger instances for navigation

  const [activeCategory, setActiveCategory] = useState("adrenaline");
  const [currentTourIndex, setCurrentTourIndex] = useState(0);
  const [currentTourTotal, setCurrentTourTotal] = useState(1);
  const [currentGlobalIndex, setCurrentGlobalIndex] = useState(0);

  const [pinned, setPinned] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // ─── LOADING STATE ──────────────────────────────────────────
  const [isLoading, setIsLoading] = useState(true);
  const isReadyRef = useRef(false); // prevent multiple ready calls

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

  const [activeDetectionOffset, setActiveDetectionOffset] = useState(450);

  // IMPORTANT:
  // This is the actual ScrollTrigger top offset used by both
  // card animation and programmatic navigation.
  const [navOffset, setNavOffset] = useState(6);

  const [navHeight, setNavHeight] = useState(120);

  const isScrollingRef = useRef(false);

  // Tracks whether layout has actually changed (breakpoint switch, viewport
  // width change, tour-count change) since the last ScrollTrigger.refresh().
  // Avoids calling the expensive refresh() on every nav tap.
  const needsRefreshRef = useRef(false);

  // Only real width changes should trigger a recompute — iOS fires resize
  // events for address-bar show/hide that only change innerHeight.
  const lastWidthRef = useRef(
    typeof window !== "undefined" ? window.innerWidth : 0
  );

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

      // Card animation starts at top += 4px.
      setNavOffset(4);

      needsRefreshRef.current = true;

      return;
    }

    // ─── Desktop ──────────────────────────────────────────────

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

    // This MUST match the ScrollTrigger animation start.
    setNavOffset(6);

    needsRefreshRef.current = true;
  }, []);

  useEffect(() => {
    computeSizes();

    const handleResize = () => {
      // Ignore height-only changes (iOS address bar collapse/expand) —
      // only recompute when the viewport actually changes width.
      if (window.innerWidth === lastWidthRef.current) return;
      lastWidthRef.current = window.innerWidth;
      computeSizes();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
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
      // Only recompute the layout-dependent sizes; computeSizes() already
      // guards against being called redundantly via needsRefreshRef, and
      // this no longer has its own separate resize listener (see below),
      // so it won't compound with the window resize handler on iOS.
      computeSizes();
    };

    updateHeight();

    let ro;

    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(updateHeight);
      ro.observe(navEl);
    }

    return () => {
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

    // Clear old trigger instances
    triggerInstances.current = [];

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
          force3D: true,
        });
      });

      // ─── Pin navigation ──────────────────────────────────────

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

      // ─── Pin tour stage ─────────────────────────────────────

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

      // ─── Individual tour animations ────────────────────────
      // NOTE: previously this created TWO ScrollTrigger instances per tour
      // (one bare ScrollTrigger.create for the "active tour" logic, plus
      // the one implicitly created by the timeline below) with identical
      // trigger/start/end. That doubled the work ScrollTrigger.refresh()
      // has to do on every call, which is expensive on slower devices like
      // older iPhones. Now there is a single ScrollTrigger per tour, and
      // both the state-update callbacks and the card animation live on it.

      wrappers.forEach((wrapper, index) => {
        const currentCard = cards[index];
        const nextCard = cards[index + 1];

        const currentTour = allTours[index];

        if (!currentTour) return;

        // Card animation timeline — this ScrollTrigger instance is reused
        // for both the animation and the active-tour state updates.
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: wrapper,

            start: `top top+=${navOffset}`,

            end: `+=${totalDistance}`,

            scrub: 1.1,

            invalidateOnRefresh: true,

            onEnter: () => {
              updateActiveTour(currentTour);
            },

            onEnterBack: () => {
              updateActiveTour(currentTour);
            },
          },
        });

        // Store for later use in goToTour
        triggerInstances.current[index] = tl.scrollTrigger;
        tourScrollTriggers.current[index] = tl.scrollTrigger;

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
              force3D: true,

              duration:
                transitionDistance /
                totalDistance,
            }
          );

          // Hide current card after transition.
          // Bumped from 0.02 -> 0.06: on a scrubbed timeline tied directly
          // to scroll position, a near-zero-duration tween can land
          // between two scrub-update ticks on a dropped frame (common on
          // iOS mid-scroll) and never actually fire, leaving the old card
          // visibly overlapping the new one. A touch more duration gives
          // it room to always register.
          tl.to(
            currentCard,
            {
              autoAlpha: 0,
              duration: 0.06,
            },
            0.97
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
      needsRefreshRef.current = false;
    }, containerRef);

    // ─── READY STATE (loading spinner) ──────────────────────

    // Prevent multiple calls to mark ready
    isReadyRef.current = false;

    const markReady = () => {
      if (isReadyRef.current) return;
      isReadyRef.current = true;

      // Ensure ScrollTrigger is up to date
      ScrollTrigger.refresh();
      needsRefreshRef.current = false;

      // Wait one frame for the browser to paint
      requestAnimationFrame(() => {
        setIsLoading(false);
      });
    };

    // Refresh after fonts
    document.fonts?.ready
      ?.then(markReady)
      .catch(() => {});

    // Refresh after all images
    const images =
      containerRef.current.querySelectorAll("img");
    const imageListeners = [];

    images.forEach((img) => {
      if (!img.complete) {
        const onLoad = () => markReady();
        img.addEventListener("load", onLoad, { once: true });
        imageListeners.push([img, onLoad]);
      }
    });

    // Also mark ready after layout (RAF)
    const rafId = requestAnimationFrame(() => {
      requestAnimationFrame(markReady);
    });

    // Fallback: if nothing triggers, mark ready after 1.5s
    const timeoutId = setTimeout(markReady, 1500);

    // ─── Cleanup ─────────────────────────────────────────────

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timeoutId);

      window.removeEventListener("load", markReady);

      imageListeners.forEach(
        ([img, onLoad]) => {
          img.removeEventListener("load", onLoad);
        }
      );

      ctx.revert();

      tourScrollTriggers.current = [];
      triggerInstances.current = [];
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
  // Helper: update UI state for a given tour
  // ─────────────────────────────────────────────────────────────

  const updateStateForTour = useCallback((tour, index) => {
    setActiveCategory(tour.categoryId);
    setCurrentTourIndex(tour.tourIndex);
    setCurrentTourTotal(tour.totalInCategory);
    setCurrentGlobalIndex(index);
  }, []);

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

      const trigger = triggerInstances.current[index];
      const tour = allTours[index];

      if (!trigger || !tour) {
        console.warn(
          `No ScrollTrigger or tour found for index ${index}`
        );
        return;
      }

      // Only pay for a full re-measure when layout has actually changed
      // since the last refresh (breakpoint switch, tour count change,
      // etc). Calling ScrollTrigger.refresh() unconditionally on every
      // nav tap is expensive on slower devices and was also a source of
      // the "lands on wrong tour" bug when it ran mid-transition.
      if (needsRefreshRef.current) {
        ScrollTrigger.refresh();
        needsRefreshRef.current = false;
      }

      const runScroll = () => {
        // The exact scroll position where this tour's animation starts
        const targetY = trigger.start;

        // If already very close, just update state and exit
        if (Math.abs(window.scrollY - targetY) < 2) {
          isScrollingRef.current = false;
          updateStateForTour(tour, index);
          return;
        }

        isScrollingRef.current = true;

        // Update UI state immediately (snappy)
        updateStateForTour(tour, index);

        // Smooth scroll
        gsap.to(window, {
          duration: 0.9,

          ease: "power3.inOut",

          scrollTo: {
            y: targetY,
            autoKill: true,
          },

          onUpdate: () => {
            ScrollTrigger.update();
          },

          onComplete: () => {
            // Force the exact final scroll position.
            window.scrollTo(0, targetY);

            ScrollTrigger.update();

            // Explicitly restore selected tour state
            updateStateForTour(tour, index);

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
      };

      // Small delay only needed right after a refresh to let iOS settle
      // (address bar, viewport reflow). Skip it otherwise for snappier nav.
      if (needsRefreshRef.current === false) {
        runScroll();
      } else {
        setTimeout(runScroll, 50);
      }
    },
    [allTours, updateStateForTour]
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
  // First / Last handlers
  // ─────────────────────────────────────────────────────────────

  const handleFirst = useCallback(() => {
    goToTour(0);
  }, [goToTour]);

  const handleLast = useCallback(() => {
    goToTour(allTours.length - 1);
  }, [allTours.length, goToTour]);

  const isFirst =
    currentGlobalIndex === 0;

  const isLast =
    currentGlobalIndex ===
    allTours.length - 1;

  // ─────────────────────────────────────────────────────────────
  // Contact click handler
  // ─────────────────────────────────────────────────────────────

  const handleContactClick = useCallback(() => {
    const contact = document.querySelector("#contact");

    if (!contact) return;

    contact.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, []);

  // ─────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────

  return (
    <>
      {/* ─── LOADING SPINNER ─────────────────────────────────── */}
      {isLoading && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      )}

      <main className="w-full overflow-x-hidden bg-gradient-to-br from-white to-blue-600 text-white">
        <section
          ref={containerRef}
          className="relative mx-auto w-full max-w-5xl px-3 md:px-4"
        >
          {/* ─── Fixed / pinned navigation ───────────────────── */}

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

          {/* ─── ScrollTrigger wrappers ─────────────────────── */}

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

          {/* ─── Tour card stage ────────────────────────────── */}

          <div
            ref={stageRef}
            className="absolute left-0 z-[100] w-full pointer-events-none"
            style={{
              top: stageTop,
              height: `${stageHeight}px`,
            }}
          >
            <div className="flex h-full w-full flex-col">

              {/* ─── First / Last / Contact ──────────────────── */}

              <div className="mt-30"></div>

              <div
                className="
                  m-2
                  shrink-0
                  pointer-events-auto
                  flex
                  flex-col
                  items-center
                  justify-center
                  gap-3
                  md:flex-row
                  md:gap-5
                "
              >
                {/* First / Counter / Last + Mobile Help Icon */}
                <div className="flex items-center justify-center gap-3 md:gap-5">
                  {/* First */}
                  <button
                    type="button"
                    onClick={handleFirst}
                    disabled={isFirst}
                    aria-label="Go to first tour"
                    className={
                      isMobile
                        ? "flex items-center gap-1.5 rounded-full bg-white px-5 py-3 text-base font-bold text-blue-700 shadow-lg shadow-black/20 transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
                        : "rounded-full bg-white/20 px-5 py-2 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/30 disabled:cursor-not-allowed disabled:opacity-40"
                    }
                  >
                    ‹ First
                  </button>

                  {/* Counter */}
                  <span className="min-w-[55px] text-center text-sm font-medium text-white/70">
                    {currentGlobalIndex + 1} / {allTours.length}
                  </span>

                  {/* Last */}
                  <button
                    type="button"
                    onClick={handleLast}
                    disabled={isLast}
                    aria-label="Go to last tour"
                    className={
                      isMobile
                        ? "flex items-center gap-1.5 rounded-full bg-white px-5 py-3 text-base font-bold text-blue-700 shadow-lg shadow-black/20 transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
                        : "rounded-full bg-white/20 px-5 py-2 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/30 disabled:cursor-not-allowed disabled:opacity-40"
                    }
                  >
                    Last ›
                  </button>

                  {/* Mobile Help Icon (hidden on md and up) */}
                  <button
                    type="button"
                    onClick={handleContactClick}
                    aria-label="Contact us"
                    className="
                      md:hidden
                      flex
                      items-center
                      justify-center
                      h-10
                      w-10
                      rounded-full
                      bg-white
                      text-blue-700
                      shadow-lg
                      shadow-black/20
                      transition
                      active:scale-95
                    "
                  >
                    <span className="text-xl font-bold leading-none">
                      ?
                    </span>
                  </button>
                </div>

                {/* Secondary actions (desktop only) */}
                <div className="hidden md:flex items-center justify-center gap-5 md:gap-4">
                  {/* Contact CTA */}
                  <button
                    type="button"
                    onClick={handleContactClick}
                    className="
                      group
                      inline-flex
                      items-center
                      gap-2
                      p-2
                      whitespace-nowrap
                      text-xs
                      font-medium
                      tracking-wide
                      text-white/80
                      transition-all
                      duration-300
                      hover:bg-white
                      hover:px-30
                      md:ml-2
                      md:text-sm
                      rounded-2xl
                      hover:rounded-full
                      border border-white px-4
                    "
                  >
                    <span className="relative group-hover:text-black duration-300">
                      Need help? Contact us now
                    </span>
                    <img src="/icons/topRightArrow.png" className="h-3 group-hover:brightness-0 duration-300" alt="" />
                  </button>
                </div>
              </div>

              {/* ─── Cards ───────────────────────────────────── */}

              <div className="relative min-h-0 flex-1 overflow-hidden">
                {allTours.map(
                  (tour, index) => (
                    <div
                      key={tour.id}
                      className={`tour-stage-card absolute inset-0 h-full w-full pointer-events-auto ${
                        Math.abs(index - currentGlobalIndex) <= 1
                          ? "will-change-transform"
                          : ""
                      }`}
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

          {/* ─── ScrollTrigger end marker ───────────────────── */}

          <div className="scroll-end h-px w-full" />
        </section>
      </main>
    </>
  );
}