import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const TOURS = [
  "Table Mountain Hike",
  "Cape Point Explorer",
  "Winelands & Franschhoek",
  "Boulders Beach Penguins",
  "Cape Town City Walk",
  "Stellenbosch Wine Route",
  "Robben Island Tour",
  "Chapman's Peak Sunset",
];

function TourSelectSideDeck() {
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState(null);
  const [participants, setParticipants] = useState(1);
  const [participantsConfirmed, setParticipantsConfirmed] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [mobileStep, setMobileStep] = useState(0);
  const [justCompletedStep, setJustCompletedStep] = useState(null);
  const [searchAttempted, setSearchAttempted] = useState(false);

  const close = () => setActiveModal(null);

  const formattedDate = date
    ? date.toLocaleDateString("en-ZA", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Select date";

  const canSearch = Boolean(destination && date && participantsConfirmed);

  const getRecommendedStep = () => {
    if (!destination) return 0;
    if (!date) return 1;
    if (!participantsConfirmed) return 2;
    return 3;
  };

  const recommendedStep = getRecommendedStep();

  useEffect(() => {
    setMobileStep((prev) => Math.min(prev, recommendedStep));
  }, [destination, date, participantsConfirmed, recommendedStep]);

  useEffect(() => {
    if (canSearch) setSearchAttempted(false);
  }, [canSearch]);

  useEffect(() => {
    if (!activeModal) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [activeModal]);

  const completeStepWithDelay = (stepIndex, nextStep) => {
    setJustCompletedStep(stepIndex);

    setTimeout(() => {
      setJustCompletedStep(null);
      setMobileStep(nextStep);
    }, 420);
  };

  const handleSearchClick = () => {
    if (!canSearch) {
      setSearchAttempted(true);
      return;
    }

    console.log("Search submitted", { destination, date, participants });
  };

  const mobileCards = useMemo(
    () => [
      {
        key: "destination",
        value: destination || "Select destination",
        preview: destination ? `Selected: ${destination}` : "Choose your route first",
        icon: "/icons/car.png",
        status: destination ? "Done" : mobileStep === 0 ? "Current" : "Pending",
        complete: Boolean(destination),
        onClick: () => setActiveModal("destination"),
      },
      {
        key: "date",
        value: formattedDate,
        preview: destination
          ? date
            ? `${destination} • ${formattedDate}`
            : `${destination} selected`
          : "Destination required first",
        icon: "/icons/calendar.png",
        status: date ? "Done" : mobileStep === 1 ? "Current" : "Pending",
        complete: Boolean(date),
        onClick: () => destination && setActiveModal("date"),
      },
      {
        key: "participants",
        value: `${participants} ${participants === 1 ? "participant" : "participants"}`,
        preview:
          destination && date
            ? participantsConfirmed
              ? `${destination} • ${formattedDate} • ${participants} ${
                  participants === 1 ? "guest" : "guests"
                }`
              : "Confirm your guest count"
            : "Destination and date required first",
        icon: "/icons/guest.png",
        status: participantsConfirmed ? "Done" : mobileStep === 2 ? "Current" : "Pending",
        complete: Boolean(participantsConfirmed),
        onClick: () => destination && date && setActiveModal("participants"),
      },
      {
        key: "search",
        value: canSearch ? "Search available" : "Complete the steps above",
        preview: canSearch
          ? `${destination} • ${formattedDate} • ${participants} ${
              participants === 1 ? "guest" : "guests"
            }`
          : "Finish the selections to continue",
        icon: "/icons/go.png",
        status: canSearch ? "Ready" : mobileStep === 3 ? "Current" : "Pending",
        complete: canSearch,
        isSearch: true,
      },
    ],
    [
      destination,
      formattedDate,
      participants,
      participantsConfirmed,
      canSearch,
      date,
      mobileStep,
    ]
  );

  const getDeckStyle = (index) => {
    const offset = index - mobileStep;

    if (offset === 0) {
      return {
        transform: "translateY(0px) scale(1)",
        opacity: 1,
        zIndex: 40,
        pointerEvents: "auto",
      };
    }

    if (offset > 0) {
      const y = 14 + (offset - 1) * 14;
      const scale = Math.max(0.88, 1 - offset * 0.04);
      const opacity = Math.max(0.45, 1 - offset * 0.18);

      return {
        transform: `translateY(${y}px) scale(${scale})`,
        opacity,
        zIndex: 40 - offset,
        pointerEvents: "none",
      };
    }

    const pastDepth = Math.abs(offset);
    const y = 8 + (pastDepth - 1) * 10;
    const scale = Math.max(0.9, 0.97 - pastDepth * 0.03);
    const opacity = Math.max(0.35, 0.72 - pastDepth * 0.15);

    return {
      transform: `translateY(${y}px) scale(${scale})`,
      opacity,
      zIndex: 18 - pastDepth,
      pointerEvents: "none",
    };
  };

  const stepBadgeClass = (status) => {
    if (status === "Done" || status === "Ready") return "bg-blue-50 text-blue-700";
    if (status === "Current") return "bg-blue-600 text-white";
    return "bg-black/5 text-black/45";
  };

  const stepCardClass = (complete, isCurrent, isJustCompleted) => {
    if (isJustCompleted) return "bg-blue-50/90 ring-2 ring-blue-300";
    if (complete) return "bg-blue-50/70 ring-1 ring-blue-200";
    if (isCurrent) return "bg-white ring-1 ring-blue-200";
    return "bg-white ring-1 ring-black/8";
  };

  const stepIconClass = (complete, isCurrent, isJustCompleted) => {
    if (isJustCompleted) return "bg-blue-200 step-pulse-blue";
    if (complete) return "bg-blue-200";
    if (isCurrent) return "bg-blue-50";
    return "bg-black/[0.04]";
  };

  const searchCardClass = (complete, attempted) => {
    if (complete) return "bg-blue-50/80 ring-1 ring-blue-200";
    if (attempted) return "bg-red-400/95 text-white ring-1 ring-red-300";
    return "bg-white ring-1 ring-black/8";
  };

  const searchTextClass = (complete, attempted) => {
    if (complete) return "text-black/70";
    if (attempted) return "text-white/90";
    return "text-black/70";
  };

  const searchPreviewClass = (complete, attempted) => {
    if (complete) return "text-black/45";
    if (attempted) return "text-white/80";
    return "text-black/45";
  };

  const searchButtonClass = (complete, attempted) => {
    if (complete) return "hero-gradient hover:opacity-90";
    if (attempted) return "bg-red-400 hover:bg-red-400";
    return "bg-black hover:bg-black/85";
  };

  const LeaderStep = () => (
    <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-black/45">
      {[1, 2, 3, 4].map((n, idx) => {
        const stepIndex = n - 1;
        const isActive = mobileStep === stepIndex;
        const isDone = stepIndex < recommendedStep || (stepIndex === 3 && canSearch);

        return (
          <div key={n} className="flex items-center gap-2">
            <div
              className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] tracking-normal transition-all duration-300 ${
                isDone
                  ? "bg-blue-100 text-blue-700 shadow-[0_0_0_3px_rgba(191,219,254,0.35)]"
                  : isActive
                    ? "bg-blue-600 text-white"
                    : "bg-black/8 text-black/45"
              } ${isActive ? "step-pulse-blue" : ""}`}
            >
              {n}
            </div>

            {idx < 3 && <div className="h-px w-5 bg-black/12" />}
          </div>
        );
      })}
    </div>
  );

  const modalNode =
    activeModal && typeof document !== "undefined"
      ? createPortal(
          <div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-4 backdrop-blur-md"
            onClick={close}
          >
            <div
              className="w-full max-w-[92vw] overflow-hidden rounded-2xl bg-white font-mont shadow-2xl sm:max-w-md"
              onClick={(e) => e.stopPropagation()}
              style={{ animation: "modal-in 0.2s ease both" }}
            >
              <div className="flex items-center justify-between border-b border-black/10 px-4 py-4 text-black sm:px-5">
                <h3 className="text-sm font-semibold sm:text-base">
                  {activeModal === "destination" && "Select a tour"}
                  {activeModal === "date" && "Choose a date"}
                  {activeModal === "participants" && "Number of guests"}
                </h3>

                <button
                  onClick={close}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-black/40 transition-colors hover:bg-gray-100 hover:text-black"
                >
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {activeModal === "destination" && (
                <div className="max-h-72 overflow-y-auto py-2">
                  {TOURS.map((tour) => (
                    <button
                      key={tour}
                      onClick={() => {
                        setDestination(tour);
                        setParticipantsConfirmed(false);
                        close();
                        completeStepWithDelay(0, 1);
                      }}
                      className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm transition-colors hover:bg-gray-50 sm:px-5 ${
                        destination === tour ? "font-semibold text-black" : "text-black/70"
                      }`}
                    >
                      <span className="pr-4">{tour}</span>

                      {destination === tour && (
                        <svg
                          className="h-4 w-4 shrink-0 text-blue-600"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {activeModal === "date" && (
                <div className="flex justify-center overflow-x-auto p-3 sm:p-4 [&_.react-datepicker]:border-none [&_.react-datepicker]:shadow-none [&_.react-datepicker__day:hover]:rounded-full [&_.react-datepicker__day:hover]:bg-gray-100 [&_.react-datepicker__day--selected]:rounded-full [&_.react-datepicker__day--selected]:bg-black [&_.react-datepicker__header]:border-black/10 [&_.react-datepicker__header]:bg-white">
                  <DatePicker
                    selected={date}
                    onChange={(d) => {
                      setDate(d);
                      setParticipantsConfirmed(false);
                      close();
                      completeStepWithDelay(1, 2);
                    }}
                    minDate={new Date()}
                    inline
                  />
                </div>
              )}

              {activeModal === "participants" && (
                <div className="px-4 py-5 text-black sm:px-5 sm:py-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium sm:text-base">Guests</p>
                      <p className="text-xs text-black/40 sm:text-sm">Adults & children</p>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-4">
                      <button
                        onClick={() => setParticipants((p) => Math.max(1, p - 1))}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-black/20 text-lg transition-colors hover:border-black disabled:opacity-30"
                        disabled={participants === 1}
                      >
                        −
                      </button>

                      <span className="w-6 text-center text-base">{participants}</span>

                      <button
                        onClick={() => setParticipants((p) => Math.min(20, p + 1))}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-black/20 text-lg transition-colors hover:border-black"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setParticipantsConfirmed(true);
                      close();
                      completeStepWithDelay(2, 3);
                    }}
                    className="mt-6 w-full rounded-xl bg-black py-3 text-sm font-semibold text-white transition-colors hover:bg-black/80"
                  >
                    Confirm
                  </button>
                </div>
              )}
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <div className="mx-auto w-full max-w-none overflow-visible rounded-[24px] bg-white/20 p-2 shadow-[0_20px_60px_rgba(0,0,0,0.14)] backdrop-blur-md">
        <div className="relative min-h-[236px] overflow-hidden rounded-[18px]">
          {mobileCards.map((card, index) => {
            const isCurrent = mobileStep === index;
            const isJustCompleted = justCompletedStep === index;

            return (
              <div
                key={card.key}
                style={getDeckStyle(index)}
                className="absolute inset-x-0 top-0 transition-all duration-500 ease-out"
              >
                <div className="overflow-hidden rounded-[22px] border border-black/8 bg-white shadow-[0_16px_32px_rgba(0,0,0,0.12)]">
                  {card.isSearch ? (
                    <div className="flex min-h-[184px] flex-col gap-3 px-4 py-4">
                      <div className="flex items-start justify-between gap-3">
                        <LeaderStep />

                        <div
                          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${stepBadgeClass(
                            card.status
                          )}`}
                        >
                          {card.status}
                        </div>
                      </div>

                      <div
                        className={`flex items-center gap-3 rounded-2xl px-3 py-3 ${searchCardClass(
                          card.complete,
                          searchAttempted
                        )}`}
                      >
                        <div
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                            card.complete
                              ? "bg-blue-200 step-pulse-blue"
                              : searchAttempted
                                ? "bg-white/20"
                                : "bg-black/[0.04]"
                          }`}
                        >
                          <img src={card.icon} className="h-5 w-auto" alt="Search" />
                        </div>

                        <div className="min-w-0">
                          <div
                            className={`truncate text-sm ${searchTextClass(
                              card.complete,
                              searchAttempted
                            )}`}
                          >
                            {card.value}
                          </div>
                          <div
                            className={`mt-1 truncate text-xs ${searchPreviewClass(
                              card.complete,
                              searchAttempted
                            )}`}
                          >
                            {card.preview}
                          </div>
                        </div>
                      </div>

                      <div className="mt-auto flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setMobileStep((prev) => Math.max(0, prev - 1))}
                          className="rounded-xl border border-black/10 px-4 py-3 text-sm font-semibold text-black/70 transition hover:bg-black/[0.03]"
                        >
                          Back
                        </button>

                        <button
                          type="button"
                          onClick={handleSearchClick}
                          className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-5 py-3 text-base font-bold text-white transition ${searchButtonClass(
                            canSearch,
                            searchAttempted
                          )}`}
                        >
                          <span>Search</span>
                          <img src="/icons/go.png" className="h-5 w-auto" alt="Go" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="px-4 py-4">
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <LeaderStep />

                        <div
                          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${stepBadgeClass(
                            card.status
                          )}`}
                        >
                          {card.status}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={card.onClick}
                        className={`flex min-h-[92px] w-full items-center gap-3 rounded-[18px] px-3 text-left transition-colors ${stepCardClass(
                          card.complete,
                          isCurrent,
                          isJustCompleted
                        )}`}
                      >
                        <div
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${stepIconClass(
                            card.complete,
                            isCurrent,
                            isJustCompleted
                          )}`}
                        >
                          <img src={card.icon} className="h-5 w-auto" alt={card.key} />
                        </div>

                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium text-black/70">
                            {card.value}
                          </div>
                          <div className="mt-1 truncate text-xs text-black/45">
                            {card.preview}
                          </div>
                        </div>
                      </button>

                      <div className="mt-3 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => setMobileStep((prev) => Math.max(0, prev - 1))}
                          disabled={mobileStep === 0}
                          className="rounded-xl border border-black/10 px-4 py-2.5 text-sm font-semibold text-black/70 transition hover:bg-black/[0.03] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Back
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setMobileStep((prev) =>
                              Math.min(3, Math.max(prev + 1, recommendedStep))
                            )
                          }
                          className="rounded-xl bg-black px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-black/85"
                        >
                          Continue
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-[linear-gradient(to_top,rgba(255,255,255,0.16),transparent)]" />
        </div>
      </div>

      {modalNode}

      <style>{`
        @keyframes modal-in {
          from {
            opacity: 0;
            transform: scale(0.96) translateY(6px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes step-pulse-blue {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(191,219,254,0.55);
          }
          50% {
            box-shadow: 0 0 0 8px rgba(191,219,254,0);
          }
        }

        .step-pulse-blue {
          animation: step-pulse-blue 1.8s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}

export default TourSelectSideDeck;