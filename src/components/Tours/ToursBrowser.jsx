import React, {
  useLayoutEffect,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import gsap from "gsap";

import { ScrollTrigger } from "gsap/ScrollTrigger";

import { ScrollToPlugin } from "gsap/ScrollToPlugin";

import tours, {
  TOUR_TYPES,
} from "../../data/tours.js";

import TourCard from "./TourCard.jsx";

import FixedCategoryNav from "./FixedCategoryNav.jsx";

gsap.registerPlugin(
  ScrollTrigger,
  ScrollToPlugin
);

// --------------------------------------------------
// CONFIG
// --------------------------------------------------

const NAV_OFFSET = 6;

const CARD_HEIGHT = 680;

const HOLD_DISTANCE = 700;

const TRANSITION_DISTANCE = 1100;

const TOTAL_DISTANCE =
  HOLD_DISTANCE + TRANSITION_DISTANCE;

// --------------------------------------------------
// COMPONENT
// --------------------------------------------------

export default function ToursBrowser() {
  const containerRef = useRef(null);

  const stageRef = useRef(null);

  const mobileNavRef = useRef(null);

  const mobileNavScrollerRef = useRef(null);

  const mobileCategoryItemRefs =
    useRef({});

  const [activeCategory, setActiveCategory] =
    useState("adrenaline");

  const [currentTourIndex, setCurrentTourIndex] =
    useState(0);

  const [currentTourTotal, setCurrentTourTotal] =
    useState(1);

  const [pinned, setPinned] =
    useState(false);


  // --------------------------------------------------
  // CATEGORY GROUPING
  // --------------------------------------------------

  const categorySections = useMemo(() => {
    const grouped = {
      adrenaline: tours.filter(
        (tour) =>
          tour.type ===
          TOUR_TYPES.ADRENALINE
      ),

      hiking: tours.filter(
        (tour) =>
          tour.type ===
          TOUR_TYPES.HIKING
      ),

      historical: tours.filter(
        (tour) =>
          tour.type ===
          TOUR_TYPES.HISTORICAL
      ),

      packages: tours.filter(
        (tour) =>
          tour.type ===
            TOUR_TYPES.PACKAGES ||
          tour.type ===
            TOUR_TYPES.WINE_ROUTES
      ),
    };

    return [
      {
        id: "adrenaline",

        label: "Adrenaline",

        tours: grouped.adrenaline,
      },

      {
        id: "hiking",

        label: "Hiking",

        tours: grouped.hiking,
      },

      {
        id: "historical",

        label: "Historical",

        tours: grouped.historical,
      },

      {
        id: "packages",

        label: "Packages",

        tours: grouped.packages,
      },
    ];
  }, []);

  // --------------------------------------------------
  // FLATTEN TOURS
  // --------------------------------------------------

  const allTours = useMemo(() => {
    return categorySections.flatMap(
      (section) =>
        section.tours.map(
          (tour, index) => ({
            ...tour,

            categoryId: section.id,

            categoryLabel:
              section.label,

            tourIndex: index,

            totalInCategory:
              section.tours.length,
          })
        )
    );
  }, [categorySections]);

  // --------------------------------------------------
  // GSAP
  // --------------------------------------------------

useLayoutEffect(() => {
  const ctx = gsap.context(() => {

    // -----------------------------------
    // SCOPED SELECTORS ONLY
    // -----------------------------------

    const wrappers =
      gsap.utils.toArray(
        containerRef.current.querySelectorAll(
          ".tour-trigger"
        )
      );

    const cards =
      gsap.utils.toArray(
        containerRef.current.querySelectorAll(
          ".tour-stage-card"
        )
      );

    // -----------------------------------
    // INITIAL CARD STATES
    // -----------------------------------

    cards.forEach((card, index) => {
      gsap.set(card, {
        yPercent:
          index === 0 ? 0 : 115,

        scale:
          index === 0 ? 1 : 0.985,

        zIndex:
          1000 - index,
      });
    });

    // -----------------------------------
    // PIN NAVBAR
    // -----------------------------------

    ScrollTrigger.create({
      trigger: containerRef.current,

      start: "top top",

      endTrigger: ".scroll-end",

      end: "bottom bottom",

      pin: ".first-panel",

      pinSpacing: false,

      anticipatePin: 1,

      onEnter: () =>
        setPinned(true),

      onLeave: () =>
        setPinned(false),

      onEnterBack: () =>
        setPinned(true),

      onLeaveBack: () =>
        setPinned(false),
    });

    // -----------------------------------
    // PIN ENTIRE STAGE
    // -----------------------------------

    ScrollTrigger.create({
      trigger: containerRef.current,

      start: `top top+=${NAV_OFFSET}`,

      endTrigger: ".scroll-end",

      end: "bottom bottom",

      pin: stageRef.current,

      pinSpacing: false,

      anticipatePin: 1,
    });

    // -----------------------------------
    // TOUR TRANSITIONS
    // -----------------------------------

    wrappers.forEach(
      (wrapper, index) => {
        const currentCard =
          cards[index];

        const nextCard =
          cards[index + 1];

        const currentTour =
          allTours[index];

        // -----------------------------------
        // ACTIVE TOUR DETECTION
        // -----------------------------------

        ScrollTrigger.create({
          trigger: wrapper,

          start:
            "top top+=450",

          end:
            `+=${TOTAL_DISTANCE}`,

          onEnter: () => {
            setActiveCategory(
              currentTour.categoryId
            );

            setCurrentTourIndex(
              currentTour.tourIndex
            );

            setCurrentTourTotal(
              currentTour.totalInCategory
            );
          },

          onEnterBack: () => {
            setActiveCategory(
              currentTour.categoryId
            );

            setCurrentTourIndex(
              currentTour.tourIndex
            );

            setCurrentTourTotal(
              currentTour.totalInCategory
            );
          },
        });

        // -----------------------------------
        // TIMELINE
        // -----------------------------------

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: wrapper,

            start: `top top+=${NAV_OFFSET}`,

            end: `+=${TOTAL_DISTANCE}`,

            scrub: 1.1,
          },
        });

        // -----------------------------------
        // HOLD CURRENT CARD
        // -----------------------------------

        tl.to(
          {},

          {
            duration:
              HOLD_DISTANCE /
              TOTAL_DISTANCE,
          }
        );

        // -----------------------------------
        // NEXT CARD SLIDES OVER
        // -----------------------------------

        if (nextCard) {
          tl.set(
            nextCard,

            {
              zIndex: 3000 + index,
            },

            0
          );

          tl.to(
            nextCard,

            {
              yPercent: 0,

              scale: 1,

              ease: "power3.out",

              duration:
                TRANSITION_DISTANCE /
                TOTAL_DISTANCE,
            }
          );

          // DEMOTE OLD CARD UNDER STACK

          tl.call(
            () => {
              gsap.set(
                currentCard,

                {
                  zIndex: 1,
                }
              );
            },

            null,

            0.98
          );
        }
      }
    );

    ScrollTrigger.refresh();
  }, containerRef);

  return () => ctx.revert();
}, [allTours]);


  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------

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
  return (

    <main className="w-full overflow-x-hidden bg-linear-to-br from-white to-blue-600 text-white">
      <section
        ref={containerRef}
        className="
          relative
          mx-auto
          w-full
          max-w-5xl
          px-3
          md:px-4
        "
      >
        {/* -------------------------------- */}
        {/* NAVBAR */}
        {/* -------------------------------- */}

        <div
          className="
            first-panel
            absolute
            left-0
            top-0
            z-[5000]
            w-full
            pointer-events-none
          "
        >
          <FixedCategoryNav
            activeCategory={
              activeCategory
            }
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

              mobileTop: 12,
            }}
            onSelect={(
              categoryId
            ) => {
              const target =
                document.querySelector(
                  `[data-category="${categoryId}"]`
                );

              if (!target) return;

              gsap.to(window, {
                duration: 1,

                ease: "power3.out",

                scrollTo: {
                  y: target,

                  offsetY:
                    NAV_OFFSET,
                },
              });
            }}
          />
        </div>

        {/* -------------------------------- */}
        {/* SCROLL TRACK */}
        {/* -------------------------------- */}

        <div
          className="relative"
          style={{
            paddingTop: `${NAV_OFFSET}px`,
          }}
        >
          {allTours.map((tour) => (
            <section
              key={tour.id}
              className={`
                tour-trigger
                relative
              `}
              data-category={
                tour.categoryId
              }
              style={{
                height: `${TOTAL_DISTANCE}px`,
              }}
            />
          ))}
        </div>

        {/* -------------------------------- */}
        {/* SINGLE SHARED STAGE */}
        {/* -------------------------------- */}

        <div
          ref={stageRef}

          className={`
            absolute
            left-0
            top-[10rem]
            z-[100]
            w-full
            overflow-visible
            pointer-events-none
          `}
        >
          {/* CARD VIEWPORT */}

          <div
            className="
              relative
              overflow-hidden
            "
            style={{
              height: `${CARD_HEIGHT}px`,
            }}
          >
            {allTours.map(
              (tour) => (
                <div
                  key={tour.id}
                  className="
                    tour-stage-card
                    absolute
                    left-0
                    top-0
                    w-full
                    will-change-transform
                    pointer-events-auto
                  "
                >
                  <TourCard
                    tour={tour}
                    cardHeight={
                      CARD_HEIGHT
                    }
                  />
                </div>
              )
            )}
          </div>
        </div>

        {/* -------------------------------- */}
        {/* FINAL RELEASE */}
        {/* -------------------------------- */}


        <div className="scroll-end h-px w-full" />
      </section>
    </main>
  );
}