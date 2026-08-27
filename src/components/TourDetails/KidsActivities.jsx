import { createPortal } from "react-dom";
import { useEffect, useMemo, useState, useRef } from "react";
import { KIDS_ACTIVITIES } from "../../data/kidsActivities";

const formatPrice = (price) => {
  if (price === null || price === undefined) return "Check rate";
  if (price === 0) return "Free";
  return `R${price.toLocaleString("en-ZA")}`;
};

export default function KidsActivities({
  childFriendly,
  adultCount = 0,
  childCount = 0,
  toddlerCount = 0,
  selectedActivity,
  onActivityChange,
}) {
  const [open, setOpen] = useState(false);
  const [expandedId, setExpandedId] = useState(
    KIDS_ACTIVITIES[0]?.id ?? null
  );
  const [confirmedId, setConfirmedId] = useState(null);
  const scrollContainerRef = useRef(null);

  // Selected activity
  const selected = useMemo(
    () => KIDS_ACTIVITIES.find((a) => a.id === selectedActivity),
    [selectedActivity]
  );

  // Calculate activity total
  const calculateActivityTotal = (activity) => {
    if (!activity) return 0;
    const adultTotal = (activity.adultPrice ?? 0) * adultCount;
    const childTotal = (activity.childPrice ?? 0) * childCount;
    const toddlerTotal = (activity.toddlerPrice ?? 0) * toddlerCount;
    return adultTotal + childTotal + toddlerTotal;
  };

  const activityTotal = calculateActivityTotal(selected);

  const selectedPricing = selected
    ? {
        adultUnitPrice: selected.adultPrice ?? 0,
        adultTotal: (selected.adultPrice ?? 0) * adultCount,
        childUnitPrice: selected.childPrice ?? 0,
        childTotal: (selected.childPrice ?? 0) * childCount,
        toddlerUnitPrice: selected.toddlerPrice ?? 0,
        toddlerTotal: (selected.toddlerPrice ?? 0) * toddlerCount,
      }
    : null;

  // Handle Lenis + body/html overflow
  useEffect(() => {
    if (!open) {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      if (window.lenis) window.lenis.start();
      return;
    }

    const htmlOverflow = document.documentElement.style.overflow;
    const bodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    if (window.lenis) window.lenis.stop();

    return () => {
      document.documentElement.style.overflow = htmlOverflow || "";
      document.body.style.overflow = bodyOverflow || "";
      if (window.lenis) window.lenis.start();
    };
  }, [open]);

  const handleActivitySelect = (activityId) => {
    onActivityChange(activityId);
    setConfirmedId(activityId);
    setTimeout(() => {
      setOpen(false);
      setExpandedId(KIDS_ACTIVITIES[0]?.id ?? null);
      setTimeout(() => setConfirmedId(null), 250);
    }, 650);
  };

  const handleNoActivity = () => {
    onActivityChange(null);
    setConfirmedId("none");
    setTimeout(() => {
      setOpen(false);
      setTimeout(() => setConfirmedId(null), 250);
    }, 500);
  };

  if (!childFriendly) {
    return (
      <div className="my-2 rounded-xl border border-black/5 bg-black/[0.025] px-3 py-2.5 opacity-60">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-black/5 text-[11px] font-black">
            K
          </div>
          <div>
            <p className="text-2xl font-black text-black">Kids activities</p>
            <p className="text-[10px] text-black/45">
              Not available for this tour.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Modal
  const modal = (
    <div
      className={`
        fixed inset-0 z-[99999]
        flex items-center justify-center
        transition-opacity duration-300
        
        ${
          open
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }
      `}
      data-lenis-prevent
    >
      <div
        className={`
          flex w-full max-w-3xl
          max-h-[90vh]
          flex-col
          overflow-hidden
          rounded-2xl
          border-2 border-blue-600
          bg-white
          shadow-[0_25px_80px_rgba(0,0,0,0.18)]
          transition-all duration-300 ease-out
          ${
            open
              ? "translate-y-0 scale-100"
              : "translate-y-3 scale-[0.97]"
          }
        `}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-black/5 px-4 py-3 sm:px-5">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-2xl font-black text-black">
                Kids activities
              </h3>
              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[8px] font-black text-blue-600">
                OPTIONAL
              </span>
            </div>
            <p className="mt-0.5 text-[10px] text-black/40 sm:text-xs">
              Choose an additional family-friendly activity.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="
              flex h-8 w-8 shrink-0
              items-center justify-center
              rounded-full bg-black/5
              text-lg font-bold text-black/50
              transition-all duration-200
              hover:rotate-90 hover:bg-black/10 hover:text-black
            "
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Scrollable list */}
        <div
          ref={scrollContainerRef}
          className="
            min-h-0 flex-1
            overflow-y-auto overscroll-contain
            p-3 sm:p-4
            touch-pan-y
            [-webkit-overflow-scrolling:touch]
          "
          style={{ touchAction: "pan-y" }}
        >
          <div className="space-y-2">
            {/* No activity */}
            <button
              type="button"
              onClick={handleNoActivity}
              className={`
                relative w-full overflow-hidden
                rounded-xl border
                px-3 py-2.5
                text-left
                transition-all duration-300
                ${
                  !selectedActivity
                    ? "border-blue-600 bg-blue-50"
                    : "border-black/5 bg-white hover:border-emerald-300 hover:bg-emerald-50/60"
                }
              `}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-black">No additional activity</p>
                  <p className="mt-0.5 text-[10px] text-black/40">
                    Continue with the tour only.
                  </p>
                </div>
                <span className="shrink-0 text-xs font-black text-black/40">
                  R0
                </span>
              </div>
              {confirmedId === "none" && (
                <div className="absolute inset-0 flex items-center justify-center bg-emerald-50">
                  <span className="flex items-center gap-2 text-xs font-black text-emerald-600">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white">
                      ✓
                    </span>
                    Confirmed
                  </span>
                </div>
              )}
            </button>

            {/* Activities */}
            {KIDS_ACTIVITIES.map((activity) => {
              const isExpanded = expandedId === activity.id;
              const isSelected = selectedActivity === activity.id;
              const isConfirmed = confirmedId === activity.id;

              const adultTotal = (activity.adultPrice ?? 0) * adultCount;
              const childTotal = (activity.childPrice ?? 0) * childCount;
              const toddlerTotal = (activity.toddlerPrice ?? 0) * toddlerCount;
              const total = adultTotal + childTotal + toddlerTotal;

              return (
                <div
                  key={activity.id}
                  className={`
                    relative overflow-hidden
                    rounded-xl border
                    transition-all duration-300
                    ${
                      isSelected
                        ? "border-blue-600 bg-blue-50/60"
                        : isExpanded
                        ? "border-emerald-300 bg-emerald-50/30"
                        : "border-black/5 bg-white"
                    }
                  `}
                >
                  {/* Header */}
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedId(isExpanded ? null : activity.id)
                    }
                    className="
                      group flex w-full items-center
                      justify-between gap-3
                      px-3 py-2.5
                      text-left
                      transition-colors duration-200
                      hover:bg-emerald-50/50
                    "
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <p className="truncate text-xs font-black text-black sm:text-sm">
                        {activity.name}
                      </p>
                      <span className="shrink-0 rounded-full bg-black/5 px-1.5 py-0.5 text-[8px] font-black uppercase text-black/50 sm:px-2 sm:text-[9px]">
                        {activity.category}
                      </span>
                    </div>
                    <span
                      className={`
                        shrink-0 text-sm text-black/35
                        transition-transform duration-300
                        ${isExpanded ? "rotate-180" : ""}
                      `}
                    >
                      ↓
                    </span>
                  </button>

                  {/* Expandable content */}
                  <div
                    className={`
                      grid transition-[grid-template-rows,opacity]
                      duration-300 ease-out
                      ${
                        isExpanded
                          ? "grid-rows-[1fr] opacity-100"
                          : "grid-rows-[0fr] opacity-0"
                      }
                    `}
                  >
                    <div className="min-h-0 overflow-hidden">
                      <div className="border-t border-black/5 px-3 pb-3 pt-3">
                        {/* Description */}
                        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                          <p className="text-[10px] leading-relaxed text-black/50 sm:text-[11px]">
                            {activity.description || activity.toddlerNote}
                          </p>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[9px] text-black/40 sm:justify-end">
                            <span>📍 {activity.location}</span>
                            <span>⏱ {activity.duration}</span>
                            {activity.environment && (
                              <span>{activity.environment}</span>
                            )}
                          </div>
                        </div>

                        {/* Pricing */}
                        <div className="mt-4 flex items-center justify-center gap-6 border-t border-black/5 pt-4 sm:gap-10">
                          <div className="min-w-[60px] text-center">
                            <p className="text-[9px] font-black uppercase tracking-wide text-black/55 sm:text-[10px]">
                              Adult
                            </p>
                            <p className="mt-1 text-lg font-black leading-none text-black sm:text-xl">
                              {formatPrice(activity.adultPrice)}
                            </p>
                          </div>
                          <div className="min-w-[60px] text-center">
                            <p className="text-[9px] font-black uppercase tracking-wide text-black/55 sm:text-[10px]">
                              Child
                            </p>
                            <p className="mt-1 text-lg font-black leading-none text-black sm:text-xl">
                              {formatPrice(activity.childPrice)}
                            </p>
                          </div>
                          <div className="min-w-[60px] text-center">
                            <p className="text-[9px] font-black uppercase tracking-wide text-black/55 sm:text-[10px]">
                              Toddler
                            </p>
                            <p className="mt-1 text-lg font-black leading-none text-black sm:text-xl">
                              {formatPrice(activity.toddlerPrice)}
                            </p>
                          </div>
                        </div>

                        {/* Calculation */}
                        <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50/60 p-3">
                          <div className="mb-2 flex items-center justify-between">
                            <p className="text-[9px] font-black uppercase tracking-wide text-blue-700">
                              How your price is calculated
                            </p>
                            <span className="text-[8px] font-bold text-blue-600/60">
                              {adultCount + childCount + toddlerCount} guest
                              {adultCount + childCount + toddlerCount !== 1
                                ? "s"
                                : ""}
                            </span>
                          </div>
                          <div className="space-y-1.5">
                            {adultCount > 0 && (
                              <div className="flex items-center justify-between gap-3 text-[10px]">
                                <span className="text-black/55">Adults</span>
                                <span className="font-bold text-black">
                                  {adultCount} × {formatPrice(activity.adultPrice)}{" "}
                                  = {formatPrice(adultTotal)}
                                </span>
                              </div>
                            )}
                            {childCount > 0 && (
                              <div className="flex items-center justify-between gap-3 text-[10px]">
                                <span className="text-black/55">Children</span>
                                <span className="font-bold text-black">
                                  {childCount} × {formatPrice(activity.childPrice)}{" "}
                                  = {formatPrice(childTotal)}
                                </span>
                              </div>
                            )}
                            {toddlerCount > 0 && (
                              <div className="flex items-center justify-between gap-3 text-[10px]">
                                <span className="text-black/55">Toddlers</span>
                                <span className="font-bold text-black">
                                  {toddlerCount} × {formatPrice(activity.toddlerPrice)}{" "}
                                  = {formatPrice(toddlerTotal)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Select button + total */}
                        <div className="mt-3 flex items-center justify-between gap-3 border-t border-black/5 pt-3">
                          <div className="min-w-0">
                            <p className="text-[8px] font-black uppercase tracking-wide text-black/35 sm:text-[9px]">
                              Your activity total
                            </p>
                            <p className="text-lg font-black leading-none text-blue-600 sm:text-xl">
                              {total > 0 ? `+ ${formatPrice(total)}` : "FREE"}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleActivitySelect(activity.id);
                            }}
                            className="
                              shrink-0
                              rounded-lg
                              bg-blue-600
                              px-4 py-2
                              text-[10px]
                              font-black
                              text-white
                              shadow-sm
                              transition-all duration-200
                              hover:-translate-y-0.5
                              hover:bg-blue-700
                              hover:shadow-md
                              active:translate-y-0
                            "
                          >
                            {isSelected ? "SELECTED ✓" : "SELECT ACTIVITY"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Confirmed overlay */}
                  <div
                    className={`
                      absolute inset-0 z-20
                      flex items-center justify-center
                      bg-emerald-50/95
                      transition-all duration-300
                      ${
                        isConfirmed
                          ? "scale-100 opacity-100"
                          : "pointer-events-none scale-105 opacity-0"
                      }
                    `}
                  >
                    <div className="flex items-center gap-2 text-emerald-600">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-sm font-black text-white">
                        ✓
                      </span>
                      <span className="text-sm font-black">
                        Activity confirmed
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  // ============================================================
  // Compact selector – now with blue border & stacked mobile layout
  // ============================================================
  return (
    <>
      <div
        className="
          w-full relative my-2
          rounded-4xl border-2 border-blue-600
          bg-white shadow-sm
          transition-all duration-200
          hover:shadow-md
        "
      >
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="
            group flex w-full items-center justify-between
            gap-3 p-10
            text-left
            transition-colors duration-200
            hover:bg-blue-50/30
          "
        >
          {/* Left side: icon + content */}
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[11px] font-black text-white transition-transform duration-200 group-hover:scale-105">
              K
            </div>

            <div className="min-w-0 flex-1">
              {/* Title row with optional badge */}
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-bitter text-2xl font-black">
                  Kids activities
                </p>
                <span className="rounded-full bg-blue-50 px-1.5 py-0.5 text-[8px] font-black text-blue-600">
                  OPTIONAL
                </span>
              </div>

              {/* Description */}
              <p className="truncate text-[10px] text-black/45">
                {selected
                  ? `${selected.name} · ${formatPrice(activityTotal)}`
                  : "Add a family-friendly activity"}
              </p>

              {/* Select/Change button – visible only on mobile, stacked below */}
              <div className="mt-1 sm:hidden">
                <span className="inline-block text-[10px] font-black text-blue-600">
                  {selected ? "CHANGE" : "SELECT"}
                </span>
              </div>
            </div>
          </div>

          {/* Select/Change button – visible on larger screens (right side) */}
          <span className="hidden sm:inline-block shrink-0 text-[10px] font-black text-blue-600">
            {selected ? "CHANGE" : "SELECT"}
          </span>
        </button>
      </div>

      {typeof document !== "undefined" &&
        createPortal(modal, document.body)}
    </>
  );
}