// src/components/TourOptions.jsx

import { useEffect } from "react";

const TourOptions = ({
  tour,
  selectedOption,
  onOptionChange,
}) => {
  const options = Array.isArray(tour?.options)
    ? tour.options
    : [];

  // Nothing to render if this tour has no options
  if (options.length === 0) {
    return null;
  }

  console.log('TourOptions component is rendering!', { options, selectedOption });

  return (
    <section className="mx-auto w-full max-w-6xl px-4 sm:px-6">
      <div className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_12px_35px_rgba(0,0,0,0.05)]">

        {/* ====================================================
            HEADER
        ==================================================== */}

        <div className="border-b border-black/10 bg-stone-50 px-5 py-4 sm:px-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-400">
            Select your experience
          </p>

          <div className="mt-1 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="font-frank text-xl font-bold text-neutral-950 sm:text-2xl">
              Choose an option
            </h2>

            {!selectedOption && (
              <p className="text-xs font-medium text-neutral-400">
                Select an option to continue
              </p>
            )}
          </div>
        </div>

        {/* ====================================================
            OPTIONS
        ==================================================== */}

        <div className="grid grid-cols-1 gap-2 p-2 sm:grid-cols-2 lg:grid-cols-4">
          {options.map((option) => {
            const isSelected =
              selectedOption === option.id;

            return (
              <button
                key={option.id}
                type="button"
                onClick={() =>
                  onOptionChange(option.id)
                }
                aria-pressed={isSelected}
                className={`
                  group relative overflow-hidden rounded-xl
                  border text-left
                  transition-all duration-300 ease-out
                  ${
                    isSelected
                      ? "border-blue-950 bg-blue-950 text-white shadow-lg"
                      : "border-black/10 bg-white text-neutral-950 hover:-translate-y-0.5 hover:border-black/20 hover:shadow-md"
                  }
                `}
              >
                <div className="p-4 sm:p-5">

                  {/* ------------------------------------------
                      TOP ROW
                  ------------------------------------------ */}

                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p
                        className={`text-[10px] font-bold uppercase tracking-[0.14em] transition-colors duration-300 ${
                          isSelected
                            ? "text-blue-200"
                            : "text-neutral-400"
                        }`}
                      >
                        Option
                      </p>

                      <h3
                        className={`
                          mt-1 text-base font-bold leading-tight
                          transition-all duration-300
                          sm:text-lg
                          ${
                            isSelected
                              ? "text-white"
                              : "text-neutral-950"
                          }
                        `}
                      >
                        {option.name ||
                          option.title ||
                          "Option"}
                      </h3>
                    </div>

                    {/* Selected indicator */}

                    <span
                      className={`
                        flex h-6 w-6 shrink-0 items-center justify-center
                        rounded-full border
                        transition-all duration-300
                        ${
                          isSelected
                            ? "scale-100 border-white bg-white text-blue-950"
                            : "scale-90 border-neutral-200 bg-neutral-50 text-transparent"
                        }
                      `}
                    >
                      ✓
                    </span>
                  </div>

                  {/* ------------------------------------------
                      PRICE
                  ------------------------------------------ */}

                  <div className="mt-4">
                    <span
                      className={`
                        font-frank text-2xl font-bold leading-none
                        transition-colors duration-300
                        sm:text-3xl
                        ${
                          isSelected
                            ? "text-white"
                            : "text-neutral-950"
                        }
                      `}
                    >
                      R
                      {Number(
                        option.pricePerPerson || 0
                      ).toLocaleString("en-ZA")}
                    </span>

                    <span
                      className={`
                        ml-1 text-[10px] font-bold uppercase tracking-wider
                        transition-colors duration-300
                        ${
                          isSelected
                            ? "text-blue-200"
                            : "text-neutral-400"
                        }
                      `}
                    >
                      / person
                    </span>
                  </div>

                  {/* ------------------------------------------
                      DESCRIPTION
                      Only active option is visible
                  ------------------------------------------ */}

                  <div
                    className={`
                      grid transition-all duration-300 ease-out
                      ${
                        isSelected
                          ? "mt-3 grid-rows-[1fr] opacity-100"
                          : "mt-0 grid-rows-[0fr] opacity-0"
                      }
                    `}
                  >
                    <div className="overflow-hidden">
                      <p
                        className={`
                          text-xs leading-5
                          ${
                            isSelected
                              ? "text-blue-100"
                              : "text-transparent"
                          }
                        `}
                      >
                        {option.description ||
                          option.note ||
                          ""}
                      </p>
                    </div>
                  </div>

                  {/* ------------------------------------------
                      BOTTOM LABEL
                  ------------------------------------------ */}

                  <div
                    className={`
                      mt-4 border-t pt-3
                      transition-colors duration-300
                      ${
                        isSelected
                          ? "border-white/15"
                          : "border-black/5"
                      }
                    `}
                  >
                    <span
                      className={`
                        text-[10px] font-bold uppercase tracking-[0.14em]
                        ${
                          isSelected
                            ? "text-blue-200"
                            : "text-neutral-400"
                        }
                      `}
                    >
                      {isSelected
                        ? "Selected"
                        : "Select option"}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TourOptions;