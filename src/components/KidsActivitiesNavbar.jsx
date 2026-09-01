// components/KidsActivitiesNavbar.jsx
import { createPortal } from "react-dom";
import { useState, useRef, useEffect } from "react";
import { KIDS_ACTIVITIES } from "../data/kidsActivities";

const formatPrice = (price) => {
  if (price === null || price === undefined) return "Check rate";
  if (price === 0) return "Free";
  return `R${price.toLocaleString("en-ZA")}`;
};

export const KidsActivitiesNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const scrollContainerRef = useRef(null);
  const popupTimeoutRef = useRef(null);

  const handleMouseEnter = () => {
    clearTimeout(popupTimeoutRef.current);
    setIsPopupOpen(true);
  };

  const handleMouseLeave = () => {
    popupTimeoutRef.current = setTimeout(() => {
      setIsPopupOpen(false);
    }, 600);
  };

  // Scroll lock + Lenis
  useEffect(() => {
    if (!isOpen) {
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
  }, [isOpen]);

  // Close popup when modal opens
  useEffect(() => {
    if (isOpen) {
      clearTimeout(popupTimeoutRef.current);
      setIsPopupOpen(false);
    }
  }, [isOpen]);

  // Cleanup timeout
  useEffect(() => {
    return () => clearTimeout(popupTimeoutRef.current);
  }, []);

  // Modal content
  const modal = (
    <div
      className={`
        fixed inset-0 z-[99999]
        flex items-center justify-center
        transition-opacity duration-300
        ${isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}
      `}
      data-lenis-prevent
      onClick={() => setIsOpen(false)}
    >
      <div
        className={`
          flex w-full max-w-3xl max-h-[90vh]
          flex-col overflow-hidden
          rounded-2xl border-2 border-blue-600
          bg-white shadow-[0_25px_80px_rgba(0,0,0,0.18)]
          transition-all duration-300 ease-out
          ${isOpen ? "translate-y-0 scale-100" : "translate-y-3 scale-[0.97]"}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-black/5 px-4 py-3 sm:px-5">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-2xl font-black text-black">Kiddies activities</h3>
              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[8px] font-black text-blue-600">
                OPTIONAL
              </span>
            </div>
            <p className="mt-0.5 text-[10px] text-black/40 sm:text-xs">
              Family‑friendly options available on tour
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black/5 text-lg font-bold text-black/50 transition-all duration-200 hover:rotate-90 hover:bg-black/10 hover:text-black"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Scrollable list */}
        <div
          ref={scrollContainerRef}
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3 sm:p-4 touch-pan-y [-webkit-overflow-scrolling:touch]"
          style={{ touchAction: "pan-y" }}
        >
          <div className="space-y-2">
            {KIDS_ACTIVITIES.map((activity) => {
              const isExpanded = expandedId === activity.id;

              return (
                <div
                  key={activity.id}
                  className={`
                    relative overflow-hidden
                    rounded-xl border
                    transition-all duration-300
                    ${isExpanded ? "border-emerald-300 bg-emerald-50/30" : "border-black/5 bg-white"}
                  `}
                >
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : activity.id)}
                    className="group flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left transition-colors duration-200 hover:bg-emerald-50/50"
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

                  <div
                    className={`
                      grid transition-[grid-template-rows,opacity]
                      duration-300 ease-out
                      ${isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}
                    `}
                  >
                    <div className="min-h-0 overflow-hidden">
                      <div className="border-t border-black/5 px-3 pb-3 pt-3">
                        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                          <p className="text-[10px] leading-relaxed text-black/50 sm:text-[11px]">
                            {activity.description || activity.toddlerNote}
                          </p>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[9px] text-black/40 sm:justify-end">
                            <span>📍 {activity.location}</span>
                            <span>⏱ {activity.duration}</span>
                            {activity.environment && <span>{activity.environment}</span>}
                          </div>
                        </div>

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

                        <div className="mt-3 flex justify-end border-t border-black/5 pt-3">
                          <span className="text-[8px] font-black uppercase tracking-wide text-blue-600">
                            Info only – no selection
                          </span>
                        </div>
                      </div>
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

  return (
    <>
      <div
        className="relative inline-block"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <button
          type="button"
          onClick={() => {
            clearTimeout(popupTimeoutRef.current);
            setIsOpen(true);
          }}
          className="
            flex items-center gap-2
            rounded-full border border-white/14
            bg-white px-3 py-1.5
            text-sm font-extrabold text-blue-600
            shadow-[0_8px_30px_rgba(0,0,0,0.16)]
            transition duration-300
            hover:-translate-y-0.5 hover:bg-blue-50
          "
        >
          <span>🎯</span> Kids Activities
        </button>

        {isPopupOpen && (
          <div
            className="
              absolute top-full left-1/2 -translate-x-1/2
              mt-0.5
              w-72 bg-white rounded-xl shadow-2xl border border-blue-100/50
              p-5 z-50
              transition-all duration-200 ease-out
              opacity-100 translate-y-0
              pointer-events-auto
            "
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rotate-45 bg-white border-t border-l border-blue-100/50" />

            <div className="flex justify-center mb-3">
              <svg width="180" height="70" viewBox="0 0 180 70" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="35" cy="30" r="11" fill="#FBBF24" />
                <rect x="29" y="39" width="12" height="16" rx="4" fill="#F59E0B" />
                <circle cx="75" cy="30" r="11" fill="#34D399" />
                <rect x="69" y="39" width="12" height="16" rx="4" fill="#10B981" />
                <circle cx="115" cy="30" r="11" fill="#60A5FA" />
                <rect x="109" y="39" width="12" height="16" rx="4" fill="#3B82F6" />
                <circle cx="155" cy="30" r="11" fill="#F472B6" />
                <rect x="149" y="39" width="12" height="16" rx="4" fill="#EC4899" />
                <line x1="46" y1="34" x2="64" y2="34" stroke="#FCD34D" strokeWidth="4" strokeLinecap="round" />
                <line x1="86" y1="34" x2="104" y2="34" stroke="#A7F3D0" strokeWidth="4" strokeLinecap="round" />
                <line x1="126" y1="34" x2="144" y2="34" stroke="#BFDBFE" strokeWidth="4" strokeLinecap="round" />
                <rect x="32" y="53" width="5" height="10" rx="2" fill="#F59E0B" />
                <rect x="39" y="53" width="5" height="10" rx="2" fill="#F59E0B" />
                <rect x="72" y="53" width="5" height="10" rx="2" fill="#10B981" />
                <rect x="79" y="53" width="5" height="10" rx="2" fill="#10B981" />
                <rect x="112" y="53" width="5" height="10" rx="2" fill="#3B82F6" />
                <rect x="119" y="53" width="5" height="10" rx="2" fill="#3B82F6" />
                <rect x="152" y="53" width="5" height="10" rx="2" fill="#EC4899" />
                <rect x="159" y="53" width="5" height="10" rx="2" fill="#EC4899" />
                <circle cx="31" cy="28" r="1.5" fill="#1F2937" />
                <circle cx="39" cy="28" r="1.5" fill="#1F2937" />
                <circle cx="71" cy="28" r="1.5" fill="#1F2937" />
                <circle cx="79" cy="28" r="1.5" fill="#1F2937" />
                <circle cx="111" cy="28" r="1.5" fill="#1F2937" />
                <circle cx="119" cy="28" r="1.5" fill="#1F2937" />
                <circle cx="151" cy="28" r="1.5" fill="#1F2937" />
                <circle cx="159" cy="28" r="1.5" fill="#1F2937" />
              </svg>
            </div>

            <h4 className="text-center font-bold text-gray-800">Kiddies Activities</h4>
            <p className="text-center text-sm text-gray-500 mt-1">
              Fun adventures for little ones!
            </p>

            <button
              onClick={() => {
                clearTimeout(popupTimeoutRef.current);
                setIsPopupOpen(false);
                setIsOpen(true);
              }}
              className="
                mt-4 w-full bg-blue-600 hover:bg-blue-700
                text-white font-bold py-2.5 px-4 rounded-lg
                transition-colors shadow-sm
              "
            >
              View Activities
            </button>
          </div>
        )}
      </div>

      {typeof document !== "undefined" && createPortal(modal, document.body)}
    </>
  );
};