import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import TourVideoStrip from "./TourVideoStrip.jsx";
import { resolveImage } from "/src/utils/ImageLoader.js";

const FALLBACK_BG = "#3b5b7a";

/**
 * Narrow feather on all four edges: just enough to hide the seam
 * between the sharp image and the backdrop.
 */
const FEATHER_MASK = {
  WebkitMaskImage:
    "linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 4%, black 94%, transparent 100%)",
  maskImage:
    "linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 4%, black 94%, transparent 100%)",
  WebkitMaskComposite: "source-in",
  maskComposite: "intersect",
};

/**
 * Samples the image down to a tiny canvas and returns its average
 * colour (only visible while the image loads). Fails silently.
 */
function sampleImageColor(src, onColor) {
  if (!src || typeof window === "undefined") return () => {};

  let cancelled = false;
  const img = new window.Image();
  img.crossOrigin = "anonymous";

  img.onload = () => {
    if (cancelled) return;

    try {
      const size = 24;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;

      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      ctx.drawImage(img, 0, 0, size, size);

      const { data } = ctx.getImageData(0, 0, size, size);

      let r = 0;
      let g = 0;
      let b = 0;
      let count = 0;

      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] < 128) continue;
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
        count += 1;
      }

      if (!count) return;

      const lighten = 0.85;
      const rr = Math.round((r / count) * lighten);
      const gg = Math.round((g / count) * lighten);
      const bb = Math.round((b / count) * lighten);

      onColor(`rgb(${rr}, ${gg}, ${bb})`);
    } catch {
      // Canvas tainted or unavailable: keep fallback colour
    }
  };

  img.src = src;

  return () => {
    cancelled = true;
  };
}

const TourHero = ({ tour }) => {
  const navigate = useNavigate();
  const [bgColor, setBgColor] = useState(FALLBACK_BG);

  const heroImage = tour
    ? resolveImage(tour?.image || tour?.images?.[0] || tour?.imageFolder)
    : null;

  useEffect(() => {
    if (!heroImage) return undefined;
    return sampleImageColor(heroImage, setBgColor);
  }, [heroImage]);

  if (!tour) return null;

  const videos = Array.isArray(tour?.videos)
    ? tour.videos.filter(Boolean)
    : [];

  const hasVideos = videos.length > 0;

  const tags = [tour?.type, tour?.category, tour?.experienceType].filter(
    Boolean
  );

  const heroDescription = tour?.seo?.description || tour?.description || "";

  return (
    <section className="relative">
      {/* ====================================================== */}
      {/* HERO                                                    */}
      {/* ====================================================== */}

      <div
        className="relative min-h-[720px] overflow-hidden sm:min-h-[780px] lg:min-h-[820px]"
        style={{ backgroundColor: bgColor }}
      >
        {/* BACKDROP: same photo, lightly blurred so it still reads as the photo */}
        <img
          src={heroImage}
          alt=""
          aria-hidden="true"
          decoding="async"
          className="absolute inset-0 h-full w-full scale-110 object-cover blur-md brightness-105 saturate-125"
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />

        {/* SHARP COVER IMAGE: real width, narrow feathered edges */}
        <img
          src={heroImage}
          alt={tour?.title || "Cape Frontier tour"}
          fetchPriority="high"
          decoding="async"
          className="absolute inset-y-0 left-1/2 h-full w-auto max-w-full -translate-x-1/2 object-contain"
          style={FEATHER_MASK}
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />

        {/* SOFT BOTTOM CONTRAST (text only) */}
        <div className="absolute inset-x-0 bottom-0 h-[65%] bg-gradient-to-t from-black/70 via-black/35 to-transparent" />

        {/* LIGHT TOP CONTRAST (nav / back button) */}
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/30 to-transparent" />

        {/* ==================================================== */}
        {/* BACK BUTTON — FIXED TO VIEWPORT                      */}
        {/* ==================================================== */}

        <div className="fixed left-4 top-24 z-50 sm:left-6 sm:top-28 lg:left-8 lg:top-32">
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
              <path d="M19 12H5" strokeLinecap="round" strokeLinejoin="round" />
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
            {/* TITLE */}
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

            {/* TAGS */}
            {tags.length > 0 && (
              <div className="mt-8 flex flex-wrap justify-center gap-2">
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

            {/* DESCRIPTION */}
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
          </div>
        </div>
      </div>

      {/* VIDEO STRIP */}
      {hasVideos && <TourVideoStrip videos={videos} />}
    </section>
  );
};

function formatTag(value) {
  if (!value) return "";

  return String(value)
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default TourHero;