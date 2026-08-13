import React from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

import TourVideoStrip from "./TourVideoStrip.jsx";
import { resolveTourImage } from "/src/utils/ImageLoader.js";

const TourHero = ({ tour }) => {
  const navigate = useNavigate();
  if (!tour) return null;

  /*
   * ------------------------------------------------------------
   * HERO IMAGE
   * ------------------------------------------------------------
   *
   * Tour data may contain:
   *
   * "/src/assets/images/tours/..."
   *
   * "/images/..."
   *
   * "tours/..."
   *
   * resolveTourImage() converts all of these into the
   * Vite-generated production asset URL.
   */
  const heroImage = resolveTourImage(
    tour?.image ||
      tour?.images?.[0] ||
      tour?.imageFolder
  );

  /*
   * ------------------------------------------------------------
   * VIDEOS
   * ------------------------------------------------------------
   */
  const videos = Array.isArray(tour?.videos)
    ? tour.videos.filter(Boolean)
    : [];

  const hasVideos = videos.length > 0;

  /*
   * ------------------------------------------------------------
   * TAGS
   * ------------------------------------------------------------
   */
  const tags = [
    tour?.type,
    tour?.category,
    tour?.experienceType,
  ].filter(Boolean);

  /*
   * ------------------------------------------------------------
   * DESCRIPTION
   * ------------------------------------------------------------
   *
   * Prefer SEO description when available,
   * otherwise use the normal tour description.
   */
  const heroDescription =
    tour?.seo?.description ||
    tour?.description ||
    "";

  return (
    <section className="relative">

      {/* ====================================================== */}
      {/* HERO                                                    */}
      {/* ====================================================== */}

      <div className="relative min-h-[720px] overflow-hidden bg-neutral-950 sm:min-h-[780px] lg:min-h-[820px]">

        {/* ---------------------------------------------------- */}
        {/* COVER IMAGE                                           */}
        {/* ---------------------------------------------------- */}

        <img
          src={heroImage}
          alt={tour?.title || "Cape Frontier tour"}
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
          onError={(event) => {
            /*
             * If something unexpected happens with the resolved
             * image, hide the broken image rather than showing
             * the browser's broken-image icon.
             */
            event.currentTarget.style.display = "none";
          }}
        />

        {/* ---------------------------------------------------- */}
        {/* GENERAL IMAGE OVERLAY                                  */}
        {/* ---------------------------------------------------- */}

        <div className="absolute inset-0 bg-neutral-950/25" />

        {/* ---------------------------------------------------- */}
        {/* BOTTOM TEXT CONTRAST                                   */}
        {/* ---------------------------------------------------- */}

        <div className="absolute inset-x-0 bottom-0 h-[78%] bg-gradient-to-t from-black/90 via-black/65 to-transparent" />

        {/* ---------------------------------------------------- */}
        {/* SIDE CONTRAST                                         */}
        {/* ---------------------------------------------------- */}

        <div className="absolute inset-y-0 left-0 w-full bg-gradient-to-r from-black/40 via-transparent to-black/20" />

        {/* ---------------------------------------------------- */}
        {/* TOP CONTRAST                                          */}
        {/* ---------------------------------------------------- */}

        <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-black/55 to-transparent" />

        {/* ==================================================== */}
        {/* BACK BUTTON                                           */}
        {/* ==================================================== */}

        <div className="absolute left-4 top-24 z-30 sm:left-6 sm:top-28 lg:left-8 lg:top-32">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="
              group inline-flex items-center gap-2
              rounded-full
              border border-white/30
              bg-white
              px-4 py-2.5
              font-bitter text-xs font-bold
              text-neutral-950
              shadow-[0_8px_30px_rgba(0,0,0,0.25)]
              transition-all duration-300
              hover:-translate-x-0.5
              hover:bg-blue-50
              sm:px-5 sm:py-3 sm:text-sm
            "
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5"
              aria-hidden="true"
            >
              <path
                d="M19 12H5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              <path
                d="M12 19l-7-7 7-7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            Back
          </button>
        </div>

        {/* ==================================================== */}
        {/* CENTERED HERO CONTENT                                  */}
        {/* ==================================================== */}

        <div className="relative z-10 mx-auto flex min-h-[720px] max-w-6xl items-end justify-center px-4 pb-24 text-center sm:min-h-[780px] sm:px-6 sm:pb-28 lg:min-h-[820px] lg:pb-32">

          <div className="flex w-full max-w-4xl flex-col items-center">

            {/* ------------------------------------------------ */}
            {/* TAGS                                              */}
            {/* ------------------------------------------------ */}

            {tags.length > 0 && (
              <div className="mb-7 flex flex-wrap justify-center gap-2">
                {tags.map((tag, index) => (
                  <span
                    key={`${tag}-${index}`}
                    className={`
                      rounded-full px-3.5 py-2
                      font-bitter text-[10px] font-bold
                      uppercase tracking-[0.1em]
                      shadow-sm backdrop-blur-md
                      sm:text-[11px]
                      ${
                        index === 0
                          ? "bg-white text-neutral-950"
                          : "border border-white/25 bg-black/30 text-white"
                      }
                    `}
                  >
                    {formatTag(tag)}
                  </span>
                ))}
              </div>
            )}

            {/* ------------------------------------------------ */}
            {/* TITLE                                              */}
            {/* ------------------------------------------------ */}

            <h1
              className="
                max-w-5xl
                font-bitter text-5xl font-bold
                leading-[0.94] tracking-[-0.025em]
                text-white
                drop-shadow-[0_4px_20px_rgba(0,0,0,0.75)]
                sm:text-6xl
                md:text-7xl
                lg:text-8xl
              "
            >
              {tour?.title || "Cape Frontier Tour"}
            </h1>

            {/* ------------------------------------------------ */}
            {/* DESCRIPTION                                       */}
            {/* ------------------------------------------------ */}

            {heroDescription && (
              <p
                className="
                  mt-7 max-w-2xl
                  font-bitter text-sm font-medium
                  leading-7 text-white
                  drop-shadow-[0_3px_10px_rgba(0,0,0,0.85)]
                  sm:text-base sm:leading-8
                  lg:text-lg lg:leading-8
                "
              >
                {heroDescription}
              </p>
            )}

            {/* ------------------------------------------------ */}
            {/* META                                              */}
            {/* ------------------------------------------------ */}

            <div className="mt-9 flex flex-wrap justify-center gap-x-7 gap-y-4">

              {/* LOCATION */}
              {tour?.location && (
                <HeroMeta
                  icon={<LocationIcon />}
                  text={tour.location}
                />
              )}

              {/* DURATION */}
              {tour?.duration && (
                <HeroMeta
                  icon={<ClockIcon />}
                  text={tour.duration}
                />
              )}

              {/* RATING */}
              {tour?.rating && (
                <HeroMeta
                  icon={<StarIcon />}
                  text={`${tour.rating} / 5`}
                  highlight
                />
              )}

            </div>
          </div>
        </div>
      </div>

      {/* ====================================================== */}
      {/* VIDEO STRIP                                             */}
      {/* ====================================================== */}

      {hasVideos && (
        <TourVideoStrip videos={videos} />
      )}
    </section>
  );
};


/* ============================================================ */
/* HERO META                                                     */
/* ============================================================ */

function HeroMeta({
  icon,
  text,
  highlight = false,
}) {
  return (
    <div className="flex items-center gap-2.5">

      <span
        className={`
          flex h-9 w-9 shrink-0 items-center justify-center
          rounded-full
          shadow-lg
          ${
            highlight
              ? "border border-white/30 bg-white text-blue-700"
              : "border border-white/20 bg-white/10 text-white backdrop-blur-md"
          }
        `}
      >
        {icon}
      </span>

      <span className="font-bitter text-sm font-bold text-white drop-shadow-md">
        {text}
      </span>

    </div>
  );
}


/* ============================================================ */
/* TAG FORMATTING                                                */
/* ============================================================ */

function formatTag(value) {
  if (!value) return "";

  return String(value)
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}


/* ============================================================ */
/* ICONS                                                          */
/* ============================================================ */

function LocationIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <circle
        cx="12"
        cy="10"
        r="2.5"
      />
    </svg>
  );
}


function ClockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
      />

      <path
        d="M12 7v5l3 2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}


function StarIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="m12 3 2.78 5.63 6.22.9L16.5 13.01l1.06 6.2L12 16.28 6.44 19.2l1.06-6.2L3 9.53l6.22-.9L12 3Z" />
    </svg>
  );
}


export default TourHero;