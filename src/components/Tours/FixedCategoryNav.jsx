import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const TOUR_CATEGORIES_ICON = {
  adrenaline: "/icons/catIcons/adrenaline.svg",
  hiking: "/icons/catIcons/hiking.svg",
  packages: "/icons/catIcons/packages.svg",
  historical: "/icons/catIcons/historical.svg",
  wineRoutes: "/icons/catIcons/wine-routes.svg",
};

function CategoryProgressDots({
  total = 0,
  activeIndex = 0,
  orientation = "horizontal",
}) {
  if (!total) return null;

  const safeIndex = Math.max(0, Math.min(activeIndex, total - 1));
  const isVertical = orientation === "vertical";

  return (
    <div
      className={`flex ${
        isVertical ? "flex-col items-center" : "items-center"
      } gap-2`}
      aria-label={`Tour ${safeIndex + 1} of ${total}`}
    >
      {Array.from({ length: total }).map((_, index) => {
        const complete = index <= safeIndex;
        const current = index === safeIndex;

        return (
          <span
            key={index}
            className={`block rounded-full border transition-colors duration-200 ${
              isVertical ? "h-3 w-3" : "h-2.5 w-2.5"
            } ${
              complete
                ? "border-green-300 bg-green-200 shadow-[0_0_0_3px_rgba(187,247,208,0.18)]"
                : "border-white/15 bg-white/12"
            } ${current ? "scale-110" : "scale-100"}`}
          />
        );
      })}
    </div>
  );
}

function BrowseButton({
  section,
  index,
  active,
  onClick,
  compact = false,
}) {
  const icon =
    section.icon ||
    TOUR_CATEGORIES_ICON[section.id] ||
    "/icons/default.svg";

  // Use section.label if available, otherwise fallback to section.title or "Untitled"
  const displayTitle = section.label || section.title || "Untitled";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative w-full rounded-2xl text-left transition-all duration-300 ${
        compact ? "px-2.5 py-2" : "px-3.5 py-3"
      } ${
        active
          ? "bg-white/95 text-neutral-950 shadow-[0_10px_30px_rgba(0,0,0,0.12)]"
          : "text-white/72 hover:bg-white/10 hover:text-white"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-all duration-300 ${
            active
              ? "border-green-300 bg-green-200"
              : "border-white/10 bg-white/8 group-hover:bg-white/12"
          }`}
        >
          <img
            src={icon}
            className={`h-5 w-5 object-contain transition-all duration-300 ${
              active ? "scale-105" : "opacity-80 group-hover:opacity-100"
            }`}
            alt={displayTitle}
            draggable={false}
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
        </div>

        <div className="min-w-0 flex-1">
          {/* Number badge – grey when inactive, neutral when active */}
          <p
            className={`text-[9px] font-bitter uppercase leading-none tracking-[0.14em] ${
              active ? "text-neutral-400" : "text-white/35"
            }`}
          >
            0{index + 1}
          </p>

          {/* Category title – red only when active, otherwise grey/white */}
          <p
            className={`mt-0.5 truncate font-bitter text-[12px] font-semibold leading-tight ${
              active ? "text-black/80" : "text-white/60"
            }`}
          >
            {displayTitle}
          </p>
        </div>
      </div>

      {/* Active indicator dot – only visible for active category */}
      {active && (
        <span className="absolute right-3 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-red-400" />
      )}
    </button>
  );
}

export default function FixedCategoryNav({
  activeCategory,
  currentTourIndex,
  currentTourTotal,
  onSelect,
  sections,
  mobileNavRef,
  mobileNavScrollerRef,
  mobileCategoryItemRefs,
  metrics,
  pinned,
}) {
  const navigate = useNavigate();
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

useEffect(() => {
  const container = mobileNavScrollerRef?.current;
  const activeItem =
    mobileCategoryItemRefs?.current?.[activeCategory];

  if (!container || !activeItem) return;

  const containerRect = container.getBoundingClientRect();
  const itemRect = activeItem.getBoundingClientRect();

  const itemLeft = activeItem.offsetLeft;
  const itemWidth = itemRect.width;

  const targetScroll =
    itemLeft -
    containerRect.width / 2 +
    itemWidth / 2;

  container.scrollTo({
    left: targetScroll,
    behavior: "smooth",
  });
}, [activeCategory]);

  return (
    <div
      ref={mobileNavRef}
      data-mobile-category-nav
      className={`
        w-auto lg:w-full max-w-3xl mx-4  z-[220] mt-12
        sm:max-w-xl sm:mx-auto
        md:max-w-2xl md:mx-auto
        pointer-events-auto
        will-change-transform
        transition-all duration-500 ease-out
        ${scrollDirection === "up" ? "translate-y-8 opacity-100" : "translate-y-0 opacity-100"}
      `}
      style={{
        top: `${metrics.mobileTop}px`,
        visibility: pinned ? "visible" : "visible",
        pointerEvents: pinned ? "auto" : "none",
      }}
    >
      <div className="rounded-[1.25rem] border border-white/10 bg-black/72 p-1.5 shadow-[0_12px_35px_rgba(0,0,0,0.16)] backdrop-blur-md sm:p-2">
        <div
          ref={mobileNavScrollerRef}
          className="
            flex snap-x snap-mandatory gap-1.5
            overflow-x-auto scroll-smooth pb-0.5
            [-ms-overflow-style:none]
            [scrollbar-width:none]
            md:grid md:grid-cols-4
            md:overflow-visible md:pb-0
            [&::-webkit-scrollbar]:hidden
          "
        >
          {sections.map((section, index) => (
            <div
              key={section.id}
              ref={(el) => {
                if (el) mobileCategoryItemRefs.current[section.id] = el;
              }}
              className="min-w-[8rem] flex-1 snap-start md:min-w-0"
            >
              <BrowseButton
                section={section}
                index={index}
                active={activeCategory === section.id}
                compact
                onClick={() => onSelect(section.id)}
              />
            </div>
          ))}
        </div>

        <div className="mt-1.5 rounded-2xl border border-white/10 bg-white/[0.07] px-2.5 py-1.5">
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex flex-1 items-center overflow-hidden py-0.5">
              <span className="absolute left-1 right-1 top-1/2 h-px -translate-y-1/2 bg-white/12" />
              <div className="relative z-10">
                <CategoryProgressDots
                  total={currentTourTotal}
                  activeIndex={currentTourIndex}
                />
              </div>
            </div>

            <span className="shrink-0 rounded-full bg-green-200 px-2 py-0.5 font-bitter text-[9px] font-bold text-green-950">
              {String(currentTourIndex + 1).padStart(2, "0")} /{" "}
              {String(currentTourTotal || 1).padStart(2, "0")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}