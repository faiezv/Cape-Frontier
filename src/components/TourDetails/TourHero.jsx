import React, { useEffect, useState } from "react";

import TourVideoStrip from "./TourVideoStrip.jsx";
import { resolveImage } from "/src/utils/ImageLoader.js";

const FALLBACK_BG = "#3b5b7a";

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

  return (
    <section className="relative px-3 pb-4 pt-22 sm:px-6 sm:pb-6 sm:pt-22 lg:px-8 lg:pb-8 lg:pt-24">
      {/* ====================================================== */}
      {/* HERO FRAME (Padded & Rounded)                          */}
      {/* ====================================================== */}

      <div
        className="relative mx-auto max-w-[1600px] overflow-hidden rounded-3xl shadow-2xl 
        h-[24vh] sm:h-[75vh] min-h-[280px] sm:min-h-[400px] lg:h-[50vh] 
        md:rounded-[2.5rem]"
        style={{ backgroundColor: bgColor }}
      >
        {/* MAIN IMAGE: Uses object-cover to fill the space without blurring */}
        <img
          src={heroImage}
          alt={tour?.title || "Cape Frontier tour"}
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />

        {/* SOFT BOTTOM CONTRAST (text only) */}
        <div className="absolute inset-x-0 bottom-0 h-[65%] bg-gradient-to-t from-black/70 via-black/35 to-transparent" />

        {/* LIGHT TOP CONTRAST (nav / back button) */}
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/30 to-transparent" />

        {/* ==================================================== */}
        {/* HERO CONTENT — TITLE + TAGS (TOP-ALIGNED)             */}
        {/* ==================================================== */}

        <div className="relative z-10 mx-auto flex h-full max-w-6xl items-start justify-center px-4 pt-16 text-center sm:px-6 sm:pt-20 md:pt-24 lg:pt-28">
          <div className="flex w-full max-w-4xl flex-col items-center">
            {/* TITLE */}
            <h1
              className="
                max-w-5xl
                font-bitter text-4xl font-bold
                leading-[0.94] tracking-[-0.025em]
                text-white
                drop-shadow-[0_4px_20px_rgba(0,0,0,0.75)]
                sm:text-5xl
                md:text-6xl
                lg:text-7xl
              "
            >
              {tour?.title || "Cape Frontier Tour"}
            </h1>

            {/* TAGS */}
            {tags.length > 0 && (
              <div className="mt-6 flex flex-wrap justify-center gap-2 sm:mt-8">
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