import React, {
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

import tours, { TOUR_TYPES } from "../../data/tours.js";

import TourCard from "./TourCard.jsx";
import FixedCategoryNav from "./FixedCategoryNav.jsx";

gsap.registerPlugin(
  ScrollTrigger,
  ScrollToPlugin
);

export default function Test() {
  const containerRef = useRef(null);

  const mobileNavRef = useRef(null);
  const mobileNavScrollerRef = useRef(null);
  const mobileCategoryItemRefs = useRef({});

  const [activeCategory, setActiveCategory] =
    useState("adrenaline");

  const [currentTourIndex, setCurrentTourIndex] =
    useState(0);

  const [currentTourTotal, setCurrentTourTotal] =
    useState(1);

  const [pinned, setPinned] = useState(false);

  // -----------------------------------
  // CATEGORY GROUPING
  // -----------------------------------

  const categorySections = useMemo(() => {
    const grouped = {
      adrenaline: tours.filter(
        (tour) =>
          tour.type === TOUR_TYPES.ADRENALINE
      ),

      hiking: tours.filter(
        (tour) =>
          tour.type === TOUR_TYPES.HIKING
      ),

      historical: tours.filter(
        (tour) =>
          tour.type === TOUR_TYPES.HISTORICAL
      ),

      packages: tours.filter(
        (tour) =>
          tour.type === TOUR_TYPES.PACKAGES ||
          tour.type === TOUR_TYPES.WINE_ROUTES
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

  // -----------------------------------
  // FLATTEN TOURS
  // -----------------------------------

  const allTours = useMemo(() => {
    return categorySections.flatMap((section) =>
      section.tours.map((tour, index) => ({
        ...tour,

        categoryId: section.id,

        categoryLabel: section.label,

        tourIndex: index,

        totalInCategory:
          section.tours.length,
      }))
    );
  }, [categorySections]);

  // -----------------------------------
  // GSAP
  // -----------------------------------

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const items =
        gsap.utils.toArray(".tour-stack-item");

      // -----------------------------------
      // NAVBAR PIN
      // -----------------------------------

      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top top",
        end: "bottom bottom",

        pin: ".first-panel",
        pinSpacing: false,

        anticipatePin: 1,

        onEnter: () => setPinned(true),
        onLeave: () => setPinned(false),
        onEnterBack: () => setPinned(true),
        onLeaveBack: () => setPinned(false),
      });

      // -----------------------------------
      // STACKED TOUR CARDS
      // -----------------------------------

      items.forEach((item, index) => {
        const card =
          item.querySelector(".tour-card-shell");

        const nextItem = items[index + 1];

        const category =
          item.getAttribute("data-category");

        const cardIndex = Number(
          item.getAttribute(
            "data-tour-index"
          )
        );

        const total = Number(
          item.getAttribute(
            "data-tour-total"
          )
        );

        // -----------------------------------
        // PIN CARD
        // -----------------------------------

        ScrollTrigger.create({
          trigger: item,

          start: "top top+=92",

          end: "+=140%",

          pin: card,

          pinSpacing: false,

          anticipatePin: 1,

          onToggle: ({ isActive }) => {
            if (!isActive) return;

            setActiveCategory(category);

            setCurrentTourIndex(cardIndex);

            setCurrentTourTotal(total);
          },
        });

        // -----------------------------------
        // NEXT CARD OVERLAP
        // -----------------------------------

        if (nextItem) {
          const nextCard =
            nextItem.querySelector(
              ".tour-card-shell"
            );

          gsap.fromTo(
            nextCard,

            {
              yPercent: 105,
              scale: 0.985,
            },

            {
              yPercent: 0,
              scale: 1,

              ease: "none",

              scrollTrigger: {
                trigger: item,

                start: "top top+=92",

                end: "+=140%",

                scrub: 1.1,
              },
            }
          );
        }
      });

      ScrollTrigger.refresh();
    }, containerRef);

    return () => ctx.revert();
  }, [allTours]);

  return (
    <main className="w-full overflow-x-hidden bg-[#0f1115] text-white">
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
            z-[300]
            w-full
            pointer-events-none
          "
        >
          <FixedCategoryNav
            activeCategory={activeCategory}
            currentTourIndex={currentTourIndex}
            currentTourTotal={currentTourTotal}
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
            onSelect={(categoryId) => {
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
                  offsetY: 92,
                },
              });
            }}
          />
        </div>

        {/* -------------------------------- */}
        {/* STACK */}
        {/* -------------------------------- */}

        <div className="relative pt-[6.25rem]">
          {allTours.map((tour, index) => (
            <section
              key={tour.id}
              className="
                tour-stack-item
                relative
                h-[42vh]
              "
              data-category={
                tour.categoryId
              }
              data-tour-index={
                tour.tourIndex
              }
              data-tour-total={
                tour.totalInCategory
              }
              style={{
                zIndex: 10 + index,
              }}
            >
              {/* CARD */}

              <div
                className="
                  tour-card-shell
                  absolute
                  left-0
                  top-0
                  w-full
                  will-change-transform
                "
              >
                <TourCard
                  tour={tour}
                  cardHeight={680}
                />
              </div>
            </section>
          ))}
        </div>

        <div className="h-[60vh]" />
      </section>
    </main>
  );
}