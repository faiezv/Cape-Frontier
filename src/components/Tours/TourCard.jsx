import {
  useState,
  useEffect,
  useMemo,
} from "react";

import { useLoadingNavigate } from "../useLoadingNavigate.jsx";

import {
  CTA_LABELS,
  SUPPORTED_CURRENCIES,
} from "/src/data/tours.js";

import {
  toText,
  getPickupSummary,
  getBestGroupDiscount,
  FallbackImage,
  getTourImageSources,
  formatMoney,
  convertPrice,
  getLocationText,
  getTypeText,
  getCategoryText,
  getSupportedCurrencies,
} from "./Helpers.jsx";

import { resolveTourImage } from "/src/utils/ImageLoader.js";

export default function TourCard({
  tour,
  cardHeight,
  isMobile,
}) {
  const navigate = useLoadingNavigate();

  /*
   * ---------------------------------------------------------
   * CURRENCY
   * ---------------------------------------------------------
   */

  const [currency, setCurrency] =
    useState(
      () =>
        tour?.baseCurrency ||
        SUPPORTED_CURRENCIES[0] ||
        "ZAR"
    );

  /*
   * ---------------------------------------------------------
   * MOBILE INFO
   * ---------------------------------------------------------
   */

  const [mobileInfoOpen, setMobileInfoOpen] =
    useState(null);

  /*
   * ---------------------------------------------------------
   * IMAGE SOURCES
   * ---------------------------------------------------------
   */

  const imageSources = useMemo(() => {
    const sources =
      getTourImageSources(tour);

    if (!Array.isArray(sources)) {
      return [];
    }

    return sources
      .filter(Boolean)
      .map((source) =>
        resolveTourImage(source)
      )
      .filter(Boolean);
  }, [tour]);

  /*
   * ---------------------------------------------------------
   * SUPPORTED CURRENCIES
   * ---------------------------------------------------------
   */

  const supportedCurrencies =
    getSupportedCurrencies(tour);

  /*
   * ---------------------------------------------------------
   * CLOSE MOBILE INFO WHEN SCROLLING
   * ---------------------------------------------------------
   */

  useEffect(() => {
    if (!mobileInfoOpen) {
      return;
    }

    let lastScrollY =
      window.scrollY;

    const handleScroll = () => {
      const currentScrollY =
        window.scrollY;

      if (
        Math.abs(
          currentScrollY -
            lastScrollY
        ) > 4
      ) {
        setMobileInfoOpen(null);
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener(
      "scroll",
      handleScroll,
      {
        passive: true,
      }
    );

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll
      );
    };
  }, [mobileInfoOpen]);

  /*
   * ---------------------------------------------------------
   * VALIDATE CURRENCY
   * ---------------------------------------------------------
   */

  useEffect(() => {
    if (
      !supportedCurrencies.includes(
        currency
      )
    ) {
      setCurrency(
        tour?.baseCurrency ||
          supportedCurrencies[0] ||
          "ZAR"
      );
    }
  }, [
    currency,
    supportedCurrencies,
    tour?.baseCurrency,
  ]);

  /*
   * ---------------------------------------------------------
   * TOUR PATH
   * ---------------------------------------------------------
   */

  const getTourPath = (
    tourData
  ) => {
    return `/tours/${
      tourData?.slug ||
      tourData?.id ||
      ""
    }`;
  };

  /*
   * ---------------------------------------------------------
   * PRICE
   * ---------------------------------------------------------
   */

  const basePrice = Number(
    tour?.priceBase ??
      tour?.price ??
      0
  );

  const displayPrice =
    formatMoney(
      convertPrice(
        basePrice,
        currency
      ),
      currency
    );

  /*
   * ---------------------------------------------------------
   * TOUR INFORMATION
   * ---------------------------------------------------------
   */

  const categoryLabel =
    getCategoryText(tour);

  const typeLabel =
    getTypeText(tour);

  const locationText =
    getLocationText(tour);

  /*
   * ---------------------------------------------------------
   * NAVIGATION
   * ---------------------------------------------------------
   */

  const goToTourPage = () => {
    navigate(
      getTourPath(tour),
      {
        state: {
          tour,
          selectedCurrency:
            currency,
        },
      }
    );
  };

  const goToBooking = () => {
    navigate(
      `${getTourPath(
        tour
      )}#booking`,
      {
        state: {
          tour: {
            ...tour,
            priceBase:
              basePrice,
          },

          selectedCurrency:
            currency,

          scrollToBooking: true,
        },
      }
    );
  };

  /*
   * ---------------------------------------------------------
   * CARD HEIGHT
   *
   * IMPORTANT:
   *
   * cardHeight is intentionally NOT applied here.
   *
   * The right-side content determines the natural height
   * of the card.
   *
   * On desktop the image is stretched by CSS Grid to the
   * exact same height as the content column.
   *
   * On mobile the image gets a smaller fixed visual height
   * because the image sits above the content.
   * ---------------------------------------------------------
   */

  return (
    <article
      key={
        tour?.id ||
        tour?.slug
      }
      className="
        cf-pinned-tour-card
        relative
        m-4
        overflow-hidden
        rounded-[1.5rem]
        border
        border-black/5
        bg-white
        shadow-[0_14px_42px_rgba(0,0,0,0.08)]
        sm:rounded-[2rem]
        sm:shadow-[0_18px_60px_rgba(0,0,0,0.08)]
        lg:m-0
      "
      data-tour-card
    >
      <div
        className="
          relative
          w-full
          overflow-hidden
        "
      >
        <div
          data-card-grid
          className="
            grid
            w-full
            grid-cols-1
            bg-white
            font-bitter
            text-black
            md:grid-cols-2
            md:items-stretch
          "
        >
          {/* =====================================================
              IMAGE PANEL
          ===================================================== */}

          <div
            data-card-image-panel
            className="
              relative
              h-[180px]
              overflow-hidden
              bg-neutral-900
              sm:h-[210px]
              md:h-auto
              md:min-h-0
            "
          >
            <FallbackImage
              data-card-image
              sources={
                imageSources
              }
              alt={
                tour?.title ||
                "Cape Frontier tour"
              }
              className="
                absolute
                inset-0
                h-full
                w-full
                object-cover
              "
              loading="lazy"
              decoding="async"
              onFinalError={(
                event
              ) => {
                event.currentTarget.style.display =
                  "none";

                if (
                  event.currentTarget
                    .parentNode
                ) {
                  event.currentTarget.parentNode.style.background =
                    "linear-gradient(135deg,#0f2027,#203a43,#2c5364)";
                }
              }}
            />

            {/* IMAGE GRADIENT */}

            <div
              className="absolute inset-0 z-10"
              style={{
                background:
                  "linear-gradient(to top, rgba(0,0,0,0.86) 0%, rgba(0,0,0,0.32) 48%, rgba(0,0,0,0.10) 100%)",
              }}
            />

            {/* DECORATION */}

            <div className="absolute -right-24 -top-24 z-10 h-56 w-56 rounded-full bg-green-200/20 blur-3xl" />

            <div className="absolute -bottom-20 -left-20 z-10 h-52 w-52 rounded-full bg-blue-300/10 blur-3xl" />

            {/* =================================================
                IMAGE HEADER
            ================================================= */}

            <div className="absolute left-4 right-4 top-4 z-20 flex items-start justify-between gap-2 sm:left-5 sm:right-5 sm:top-5 sm:gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-white/25 bg-green-200/95 px-3 py-1.5 font-bitter text-[11px] font-semibold text-green-950 shadow-lg sm:px-4 sm:text-xs">
                  {categoryLabel}
                </span>

                <span className="rounded-full border border-white/20 bg-white/15 px-3 py-1.5 font-bitter text-[11px] text-white/90 shadow-lg backdrop-blur-md sm:px-4 sm:text-xs">
                  {typeLabel}
                </span>
              </div>

              <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-2xl border border-white/20 bg-white/15 shadow-lg backdrop-blur-md sm:h-14 sm:w-14">
                <span className="font-frank text-xl font-bold leading-none text-white">
                  {Number(
                    tour?.rating ||
                      4.8
                  ).toFixed(1)}
                </span>

                <span className="mt-1 font-bitter text-[10px] leading-none text-white/65">
                  rating
                </span>
              </div>
            </div>

            {/* =================================================
                IMAGE TITLE
            ================================================= */}

            <div className="absolute bottom-0 left-0 right-0 z-20 p-4 sm:p-6 md:p-7 xl:p-8">
              <div className="relative">
                <span className="font-bitter text-[11px] uppercase tracking-[0.22em] text-white/55">
                  {categoryLabel} ·{" "}
                  {typeLabel}
                </span>

                <h3 className="mt-2 max-w-[12ch] font-frank text-2xl font-bold leading-[0.9] text-white drop-shadow-lg sm:text-4xl xl:text-5xl">
                  {tour?.title ||
                    "Cape Frontier Tour"}
                </h3>

                <div className="mt-3 h-px w-20 bg-green-200/80 sm:mt-5 sm:w-24" />
              </div>
            </div>
          </div>

          {/* =====================================================
              CONTENT PANEL
          ===================================================== */}

          <div
            data-card-content-panel
            className="
              flex
              min-w-0
              flex-col
              bg-white
            "
          >
            <div
              className="
                flex
                w-full
                flex-col
                gap-3
                p-4
                sm:gap-4
                sm:p-5
                md:p-6
                xl:gap-5
                xl:p-8
              "
            >
              {/* =================================================
                  FOOTER / CTA
              ================================================= */}

              <div className="shrink-0 overflow-hidden">
                <div className="flex items-center justify-between gap-3 border-b border-black/5 bg-neutral-50 px-3 sm:px-5 sm:py-2 md:px-6 xl:px-8">
                  {/* DETAILS */}

                  <button
                    type="button"
                    onClick={
                      goToTourPage
                    }
                    className="flex flex-1 items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 font-bitter text-sm font-medium text-neutral-600 transition-all duration-200 hover:border-red-300 hover:text-red-400 active:scale-95"
                  >
                    See Details
                  </button>

                  {/* BOOKING */}

                  <button
                    type="button"
                    onClick={
                      goToBooking
                    }
                    className="hero-gradient flex flex-2 items-center justify-center gap-2 rounded-full px-5 py-2 font-bitter text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:opacity-90 active:scale-95"
                  >
                    {CTA_LABELS.requestTrip ||
                      "Request Trip"}

                    <img
                      src="/icons/go.png"
                      alt=""
                      className="h-4 w-4 object-contain"
                    />
                  </button>
                </div>
              </div>

              {/* =================================================
                  PRICE ROW
              ================================================= */}

              <div
                data-card-stagger-item
                className="flex shrink-0 items-start justify-between gap-3"
              >
                <div className="min-w-0">
                  <span className="block font-bitter text-[11px] uppercase leading-none tracking-[0.2em] text-red-400">
                    From
                  </span>

                  <div className="mt-0.5">
                    <p className="flex items-end gap-2">
                      <span className="font-frank text-2xl font-bold leading-none tracking-tight text-neutral-950 sm:text-4xl xl:text-5xl">
                        {
                          displayPrice
                        }
                      </span>

                      <span className="mb-1 font-bitter text-sm text-neutral-400">
                        pp
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-start gap-2">
                  {/* CURRENCY */}

                  <select
                    value={
                      currency
                    }
                    onChange={(
                      event
                    ) =>
                      setCurrency(
                        event
                          .target
                          .value
                      )
                    }
                    className="flex w-fit shrink-0 items-center justify-center rounded-2xl border border-black/10 bg-neutral-50 p-2.5 font-bitter text-sm text-neutral-700 transition-colors hover:border-red-300 focus:border-red-400 sm:p-3 sm:text-base"
                  >
                    {supportedCurrencies.map(
                      (code) => (
                        <option
                          key={
                            code
                          }
                          value={
                            code
                          }
                        >
                          {
                            code
                          }
                        </option>
                      )
                    )}
                  </select>

                  {/* MOBILE ICONS */}

                  <div className="flex items-center gap-2 sm:hidden">
                    {/* LOCATION */}

                    <button
                      type="button"
                      onClick={() =>
                        setMobileInfoOpen(
                          (
                            previous
                          ) =>
                            previous ===
                            "location"
                              ? null
                              : "location"
                        )
                      }
                      className="group flex h-11 w-11 items-center justify-center rounded-2xl border border-black/5 bg-neutral-50 transition-all duration-300 hover:border-green-300 hover:bg-green-200 active:scale-95"
                    >
                      <img
                        src="/icons/mapPin.png"
                        className="h-4 w-4 object-contain opacity-70 transition-opacity group-hover:opacity-100"
                        alt="Location"
                      />
                    </button>

                    {/* DURATION */}

                    <button
                      type="button"
                      onClick={() =>
                        setMobileInfoOpen(
                          (
                            previous
                          ) =>
                            previous ===
                            "duration"
                              ? null
                              : "duration"
                        )
                      }
                      className="group flex h-11 w-11 items-center justify-center rounded-2xl border border-black/5 bg-neutral-50 transition-all duration-300 hover:border-green-300 hover:bg-green-200 active:scale-95"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-neutral-500 transition-colors group-hover:text-green-950"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                        />

                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* =================================================
                  MOBILE INFO
              ================================================= */}

              <div
                className={`shrink-0 overflow-hidden transition-all duration-300 sm:hidden ${
                  mobileInfoOpen
                    ? "max-h-24 opacity-100"
                    : "max-h-0 opacity-0"
                }`}
              >
                <div className="rounded-2xl border border-green-100 bg-green-50/60 px-3 py-3">
                  <p className="font-bitter text-[10px] font-black uppercase tracking-[0.16em] text-neutral-400">
                    {
                      mobileInfoOpen ===
                      "location"
                        ? "Location"
                        : "Duration"
                    }
                  </p>

                  <p className="mt-1 font-bitter text-sm leading-relaxed text-neutral-700">
                    {
                      mobileInfoOpen ===
                      "location"
                        ? locationText
                        : toText(
                            tour?.duration,
                            "Flexible"
                          )
                    }
                  </p>
                </div>
              </div>

              {/* =================================================
                  DESKTOP INFO CARDS
              ================================================= */}

              <div
                data-card-stagger-item
                className="hidden shrink-0 grid-cols-2 gap-2 sm:grid sm:gap-3"
              >
                {/* LOCATION */}

                <div className="group min-h-0 rounded-2xl border border-black/5 bg-neutral-50 px-3 py-2.5 transition-all duration-300 hover:-translate-y-0.5 hover:border-green-300 hover:bg-green-200 sm:px-4 sm:py-4">
                  <div className="flex items-center gap-2 text-neutral-400 transition-colors group-hover:text-green-900">
                    <img
                      src="/icons/mapPin.png"
                      className="h-4 w-4 object-contain"
                      alt=""
                    />

                    <span className="block font-bitter text-[11px] uppercase tracking-wide">
                      Location
                    </span>
                  </div>

                  <p className="mt-1 font-bitter text-xs leading-snug text-neutral-700 transition-colors group-hover:text-green-950 sm:mt-2 sm:text-sm">
                    {
                      locationText
                    }
                  </p>
                </div>

                {/* DURATION */}

                <div className="group min-h-0 rounded-2xl border border-black/5 bg-neutral-50 px-3 py-2.5 transition-all duration-300 hover:-translate-y-0.5 hover:border-green-300 hover:bg-green-200 sm:px-4 sm:py-4">
                  <div className="flex items-center gap-2 text-neutral-400 transition-colors group-hover:text-green-900">
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="shrink-0"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                      />

                      <polyline points="12 6 12 12 16 14" />
                    </svg>

                    <span className="block font-bitter text-[11px] uppercase tracking-wide">
                      Duration
                    </span>
                  </div>

                  <p className="mt-1 font-bitter text-xs leading-snug text-neutral-700 transition-colors group-hover:text-green-950 sm:mt-2 sm:text-sm">
                    {toText(
                      tour?.duration,
                      "Flexible"
                    )}
                  </p>
                </div>
              </div>

              {/* =================================================
                  ABOUT
              ================================================= */}

              <div
                data-card-stagger-item
                className="min-h-0 shrink-0 overflow-hidden rounded-2xl border border-black/5 bg-white px-3 py-2.5 sm:px-4 sm:py-3"
              >
                <p className="font-bitter text-[10px] font-black uppercase tracking-[0.18em] text-neutral-400">
                  About this tour
                </p>

                <p className="mt-1 line-clamp-3 font-bitter text-xs leading-5 text-neutral-600 sm:text-sm sm:leading-6">
                  {toText(
                    tour?.description,
                    "A guided Cape Frontier experience with flexible planning and local support."
                  )}
                </p>
              </div>

              {/* =================================================
                  EXTRA INFO
              ================================================= */}

              {!isMobile && (
                <div className="grid shrink-0 grid-cols-1 gap-2 sm:grid-cols-2">
                  <div className="rounded-2xl bg-green-200/80 px-3 py-2 font-bitter text-xs font-semibold leading-snug text-green-950">
                    {getBestGroupDiscount(
                      tour
                    )}
                  </div>

                  {getPickupSummary(
                    tour
                  ) && (
                    <div className="rounded-2xl bg-neutral-100 px-3 py-2 font-bitter text-xs font-semibold leading-snug text-neutral-700">
                      {getPickupSummary(
                        tour
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* =================================================
                  NO FLEXIBLE SPACER
                  
                  IMPORTANT:
                  Removed the flex-1 spacer because it was
                  contributing to the forced card height.
              ================================================= */}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
