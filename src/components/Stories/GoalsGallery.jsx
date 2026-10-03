import React, { memo, useCallback, useEffect, useRef, useState } from "react";

import vehicles from "../../data/vehicles.js";
import { resolveImage } from "../../utils/ImageLoader.js";

// ============================================================
// CONFIG
// ============================================================

// Video order. List titles or filenames in the order you want them shown.
// The FIRST entry is the clip that plays first. Anything not listed follows
// afterwards in alphabetical order. Matching ignores case, extension, spaces,
// dashes and underscores. Leave empty ([]) for plain alphabetical order.
const VIDEO_ORDER = [
  "Welcome to Cape Frontier",
  "V&A Waterfront, Cape Town",
  "Unforgettable View on Table Mountain",
  "Unique experience with Cobra Sundowner",
  "Welcome to Bo-Kaap!",
  "Cobra Sundowner Experience",
  "A Day to Remember",
  "A Truly Special Experience",
  "An Unforgettable Encounter",
  "Beautiful views, thank you Cape Frontier",
  "Incredible Scenery",
  "Refreshing experience at Seapoint",
  "Thats Ben",
  "This is Sarah",
];

// 9 + the featured tile (2x2) fills whole rows at 2, 3 and 4 columns.
// Each "See more" adds 12 (divisible by 2, 3 and 4) so rows stay full.
const IMAGES_INITIAL_COUNT = 9;
const IMAGES_STEP = 12;

// Videos use the same idea: 6 per page (divisible by the 3 / 6 column layouts).
const VIDEOS_INITIAL_COUNT = 6;
const VIDEOS_STEP = 6;

const DEFAULT_LOCATION = "Seapoint, Cape Town";

// Optional per-file overrides, keyed by filename:
// Videos auto-detect portrait/landscape once loaded. Set aspect here to get the
// correct player shape immediately (no resize on first load), e.g.:
// "welcome.mp4": { title: "Welcome to Cape Frontier", aspect: "landscape" }
const mediaMetaOverrides = {};

// ============================================================
// 1. MEDIA (recursive glob: includes sub-folders of heroGallery)
// ============================================================

const videoModules = import.meta.glob(
  "/src/assets/videos/heroGallery/**/*.{mp4,webm,ogg,mov}",
  { eager: true }
);
const imageModules = import.meta.glob(
  "/src/assets/images/heroGallery/**/*.{jpg,jpeg,png,webp,avif}",
  { eager: true }
);

const normalize = (s = "") =>
  s
    .toLowerCase()
    .replace(/\.(mp4|webm|ogg|mov|jpe?g|png|webp|avif)$/i, "")
    .replace(/[\s_-]+/g, " ")
    .trim();

const humanize = (filename) =>
  filename
    .replace(/\.[^/.]+$/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/(^|\s)\S/g, (c) => c.toUpperCase());

const buildList = (modules) =>
  Object.entries(modules)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([path, mod]) => {
      const filename = path.split("/").pop();
      const o = mediaMetaOverrides[filename] || {};
      return {
        id: path, // full path: unique even if two folders share a filename
        filename,
        title: o.title || humanize(filename),
        location: o.location || DEFAULT_LOCATION,
        src: mod.default,
        aspect: o.aspect || null, // null = auto-detect from video metadata
      };
    });

const orderVideos = (list, order) => {
  const rank = new Map(order.map((key, i) => [normalize(key), i]));
  const rankOf = (v) => rank.get(normalize(v.title)) ?? rank.get(normalize(v.filename)) ?? Infinity;

  if (import.meta.env?.DEV) {
    const known = new Set(list.flatMap((v) => [normalize(v.title), normalize(v.filename)]));
    const missing = order.filter((k) => !known.has(normalize(k)));
    if (missing.length) {
      console.warn("[GoalsGallery] VIDEO_ORDER entries with no matching video:", missing, "Available:", list.map((v) => v.title));
    }
  }

  // Array.sort is stable, so unlisted videos keep their alphabetical order.
  return [...list].sort((a, b) => {
    const ra = rankOf(a);
    const rb = rankOf(b);
    if (ra === rb) return 0;
    return ra < rb ? -1 : 1;
  });
};

const videos = orderVideos(buildList(videoModules), VIDEO_ORDER);
const images = buildList(imageModules);

const hasVideos = videos.length > 0;
const hasImages = images.length > 0;

// ============================================================
// 2. FLEET (computed once at module load)
// ============================================================

const fallbackFleetImages = [1, 2, 3, 4, 5].map((n) => `/images/content/vehicles/${n}.webp`);
const DEFAULT_DESC =
  "Comfortable Cape Frontier transport used for private and group tour operations.";

const pick = (v, keys) => {
  for (const k of keys) if (v?.[k]) return v[k];
  return null;
};

const toFleetItem = (v, i) => {
  const isStr = typeof v === "string";
  const fallbackTitle = `Cape Frontier vehicle ${i + 1}`;
  return {
    id: (!isStr && pick(v, ["id", "slug", "title", "name"])) || `vehicle-${i}`,
    image: resolveImage(
      isStr
        ? v
        : pick(v, ["image", "img", "src", "photo", "cover"]) || v?.images?.[0] || v?.gallery?.[0]
    ),
    title: isStr ? fallbackTitle : pick(v, ["title", "name", "model", "label"]) || fallbackTitle,
    description: isStr ? DEFAULT_DESC : pick(v, ["description", "desc", "summary", "note"]) || DEFAULT_DESC,
    capacity: isStr ? "Tour vehicle" : pick(v, ["capacity", "seats", "passengers", "type"]) || "Tour vehicle",
  };
};

const fleetSource = Array.isArray(vehicles) && vehicles.length ? vehicles : fallbackFleetImages;
let fleetItems = fleetSource.map(toFleetItem).filter((v) => v.image);
if (!fleetItems.length) fleetItems = fallbackFleetImages.map(toFleetItem);

// ============================================================
// 3. SMALL PIECES
// ============================================================

// Entrance + ambient motion live in CSS: no JS animation library needed,
// and everything switches off under prefers-reduced-motion.
const Styles = () => (
  <style>{`
    @media (prefers-reduced-motion: no-preference) {
      @keyframes gf-rise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
      @keyframes gf-fade { from { opacity: 0; } to { opacity: 1; } }
      @keyframes gf-bob  { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
      .gf-rise { animation: gf-rise .4s cubic-bezier(.2,.7,.2,1) both; }
      .gf-fade { animation: gf-fade .25s ease-out both; }
      .gf-bob  { animation: gf-bob 4.5s ease-in-out infinite; }
    }
  `}</style>
);

const StarRating = ({ rating = 4.7 }) => {
  const rounded = Math.round(Number(rating) || 0);
  return (
    <div className="flex items-center gap-0.5" role="img" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} className="h-3.5 w-3.5" viewBox="0 0 24 24" fill={i < rounded ? "#22C55E" : "none"} stroke="#22C55E" strokeWidth="1.7" aria-hidden="true">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
};

const CloseIcon = () => (
  <span className="relative block h-4 w-4" aria-hidden="true">
    <span className="absolute left-0 top-1/2 h-[2px] w-full -translate-y-1/2 rotate-45 rounded-full bg-current" />
    <span className="absolute left-0 top-1/2 h-[2px] w-full -translate-y-1/2 -rotate-45 rounded-full bg-current" />
  </span>
);

const Chevron = ({ dir }) => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d={dir === "left" ? "M15 18l-6-6 6-6" : "M9 18l6-6-6-6"} />
  </svg>
);

// Locks page scroll and wires a key handler while a dialog is mounted.
const useDialog = (onKeyDown) => {
  const handlerRef = useRef(onKeyDown);
  handlerRef.current = onKeyDown;
  useEffect(() => {
    const handle = (e) => handlerRef.current(e);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handle);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", handle);
    };
  }, []);
};

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500";

// ============================================================
// 4. IMAGES
// ============================================================

const ImageCard = memo(({ image, index, onOpen }) => {
  const [loaded, setLoaded] = useState(false);

  // Cached images can finish loading before React attaches onLoad.
  const imgRef = useCallback((el) => {
    if (el?.complete && el.naturalWidth) setLoaded(true);
  }, []);

  return (
    <button
      type="button"
      onClick={() => onOpen(index)}
      style={{ animationDelay: `${(index % IMAGES_STEP) * 30}ms` }}
      className={`gf-rise group relative overflow-hidden rounded-2xl bg-neutral-100 ${focusRing} ${
        index === 0 ? "col-span-2 row-span-2" : ""
      }`}
    >
      {/* No decoding="async" and a GPU layer from the start: lazy + async
          decode + a hover-only transform is what left tiles blank until hover.
          The opacity fade is tied to the real load event, so a tile is either
          a plain placeholder or the finished photo, never a half-painted box. */}
      <img
        ref={imgRef}
        src={image.src}
        alt={image.title}
        loading={index < 6 ? "eager" : "lazy"}
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
        className={`absolute inset-0 h-full w-full transform-gpu object-cover transition-[opacity,transform] duration-500 ease-out group-hover:scale-105 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
      />
      <span className="pointer-events-none absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/60 to-transparent px-3 pb-2.5 pt-8 text-left font-frank text-sm font-bold text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
        {image.title}
      </span>
    </button>
  );
});

const ImageGrid = ({ onOpen }) => {
  const [visible, setVisible] = useState(IMAGES_INITIAL_COUNT);
  const sectionRef = useRef(null);

  const hasMore = visible < images.length;
  const expanded = visible > IMAGES_INITIAL_COUNT;

  const collapse = () => {
    setVisible(IMAGES_INITIAL_COUNT);
    sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div ref={sectionRef} className="scroll-mt-4 p-4 sm:p-5">
      <div className="mb-4 flex items-end justify-between gap-4">
        <h3 className="font-frank text-2xl font-bold leading-none text-black lg:text-3xl">Photo highlights</h3>
        <p className="hidden font-bitter text-xs text-black/40 lg:block">Tap a photo to view it full size.</p>
      </div>

      <div className="grid auto-rows-[8.5rem] grid-flow-dense grid-cols-2 gap-2.5 sm:auto-rows-[10rem] sm:grid-cols-3 lg:auto-rows-[11rem] lg:grid-cols-4">
        {images.slice(0, visible).map((image, i) => (
          <ImageCard key={image.id} image={image} index={i} onOpen={onOpen} />
        ))}
      </div>

      {(hasMore || expanded) && (
        <div className="mt-5 flex justify-center gap-3">
          {hasMore && (
            <button
              type="button"
              onClick={() => setVisible((v) => Math.min(v + IMAGES_STEP, images.length))}
              className={`rounded-full border border-black/10 bg-white px-6 py-2.5 font-bitter text-sm font-bold text-black/70 shadow-sm transition hover:border-green-300 hover:text-green-700 ${focusRing}`}
            >
              See more ({images.length - visible} left)
            </button>
          )}
          {expanded && (
            <button
              type="button"
              onClick={collapse}
              className={`rounded-full border border-black/10 px-6 py-2.5 font-bitter text-sm font-bold text-black/45 transition hover:text-black/70 ${focusRing}`}
            >
              See less
            </button>
          )}
        </div>
      )}
    </div>
  );
};

const Lightbox = ({ index, onChange, onClose }) => {
  const image = images[index];
  const stripRef = useRef(null);
  const touchX = useRef(null);
  const count = images.length;

  const prev = useCallback(() => onChange((index - 1 + count) % count), [index, count, onChange]);
  const next = useCallback(() => onChange((index + 1) % count), [index, count, onChange]);

  useDialog((e) => {
    if (e.key === "Escape") onClose();
    if (e.key === "ArrowLeft") prev();
    if (e.key === "ArrowRight") next();
  });

  // Warm the cache for the neighbours so next/prev feels instant.
  useEffect(() => {
    [1, -1].forEach((d) => {
      new Image().src = images[(index + d + count) % count].src;
    });
    stripRef.current
      ?.querySelector(`[data-thumb-index="${index}"]`)
      ?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [index, count]);

  const onTouchEnd = (e) => {
    if (touchX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    touchX.current = null;
    if (Math.abs(dx) > 50) (dx > 0 ? prev : next)();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={image.title}
      className="gf-fade fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 p-3 sm:p-6"
      onClick={onClose}
    >
      <div className="relative w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={onClose}
          autoFocus
          aria-label="Close image"
          className={`absolute -top-12 right-0 z-20 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20 ${focusRing}`}
        >
          <CloseIcon />
        </button>

        <div
          className="relative flex items-center justify-center overflow-hidden rounded-2xl bg-black"
          onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
          onTouchEnd={onTouchEnd}
        >
          {count > 1 && (
            <button type="button" onClick={prev} aria-label="Previous image" className={`absolute left-2 top-1/2 z-20 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-black/40 text-white transition hover:bg-black/60 sm:left-4 sm:h-12 sm:w-12 ${focusRing}`}>
              <Chevron dir="left" />
            </button>
          )}
          <img key={image.id} src={image.src} alt={image.title} className="gf-fade max-h-[70dvh] w-full object-contain" />
          {count > 1 && (
            <button type="button" onClick={next} aria-label="Next image" className={`absolute right-2 top-1/2 z-20 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-black/40 text-white transition hover:bg-black/60 sm:right-4 sm:h-12 sm:w-12 ${focusRing}`}>
              <Chevron dir="right" />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between gap-4 px-1 pt-3">
          <p className="truncate font-frank text-lg font-bold text-white sm:text-xl">{image.title}</p>
          <span className="shrink-0 font-bitter text-xs font-bold text-white/50">
            {index + 1} / {count}
          </span>
        </div>

        <div
          ref={stripRef}
          className="mt-3 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              data-thumb-index={i}
              onClick={() => onChange(i)}
              aria-label={`View ${img.title}`}
              aria-current={i === index}
              className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-lg border transition ${focusRing} ${
                i === index ? "border-green-300 ring-2 ring-green-300/60" : "border-white/15 opacity-50 hover:opacity-80"
              }`}
            >
              <img src={img.src} alt="" className="h-full w-full object-cover" loading="lazy" decoding="async" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================================
// 5. VIDEOS
// ============================================================

const VideoGallery = () => {
  const [selected, setSelected] = useState(videos[0]); // first in VIDEO_ORDER
  const [manualPause, setManualPause] = useState(false);
  const [inView, setInView] = useState(false);
  const [visible, setVisible] = useState(VIDEOS_INITIAL_COUNT);
  const [detected, setDetected] = useState({}); // id -> "portrait" | "landscape"

  const stageRef = useRef(null);
  const playerRef = useRef(null);
  const paused = manualPause || !inView;
  const aspect = selected.aspect || detected[selected.id] || "portrait";
  const hasMore = visible < videos.length;
  const expanded = visible > VIDEOS_INITIAL_COUNT;

  const noteAspect = useCallback((id, el) => {
    if (!el?.videoWidth) return;
    const next = el.videoWidth >= el.videoHeight ? "landscape" : "portrait";
    setDetected((d) => (d[id] === next ? d : { ...d, [id]: next }));
  }, []);

  // One IntersectionObserver instead of scroll/resize listeners.
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const v = playerRef.current;
    if (!v) return;
    if (paused) v.pause();
    else v.play().catch(() => {});
  }, [paused, selected]);

  const onThumbEnter = (e) => {
    if (paused) return;
    const v = e.currentTarget;
    v.currentTime = 0;
    v.play().catch(() => {});
  };
  const onThumbLeave = (e) => {
    const v = e.currentTarget;
    v.pause();
    try { v.currentTime = 0; } catch { /* ignore */ }
  };

  return (
    <div className="grid gap-5 p-4 sm:p-5 lg:grid-cols-[1fr_0.72fr] lg:items-start">
      {/* Player */}
      <div className="min-w-0">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="font-bitter text-xs font-bold text-green-600">Now playing</p>
            <h3 className="mt-0.5 truncate font-frank text-xl font-bold leading-tight text-black sm:text-2xl">
              {selected.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setManualPause((p) => !p)}
            aria-label={paused ? "Play gallery video" : "Pause gallery video"}
            className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border border-black/10 text-black/60 transition hover:border-green-300 hover:bg-green-400 hover:text-green-950 ${focusRing}`}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d={paused ? "M8 5v14l11-7z" : "M7 5h4v14H7zM13 5h4v14h-4z"} />
            </svg>
          </button>
        </div>

        {/* Fixed-size stage: switching clips never shifts the layout. */}
        <div
          ref={stageRef}
          className={`overflow-hidden rounded-2xl bg-neutral-950 ${
            aspect === "landscape" ? "aspect-video" : "h-[min(72vh,38rem)]"
          }`}
        >
          <video
            ref={playerRef}
            key={selected.id}
            src={selected.src}
            className="gf-fade h-full w-full object-contain"
            controls
            autoPlay={!paused}
            muted
            loop
            playsInline
            preload="metadata"
            onLoadedMetadata={(e) => noteAspect(selected.id, e.currentTarget)}
          />
        </div>

        {/*
        <div className="mt-3 flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-1.5">
            <img src="/icons/mapPin.png" alt="" aria-hidden="true" className="h-3.5 w-3.5 shrink-0 object-contain opacity-50" />
            <p className="truncate font-bitter text-xs font-semibold italic text-black/50">{selected.location}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="font-frank text-base font-bold text-black">4.7</span>
            <StarRating rating={4.7} />
          </div>
        </div>
        */}
      </div>

      {/* Filmstrip: paged grid, same See more / See less behaviour as photos */}
      <div className="min-w-0">
        <p className="mb-3 font-bitter text-xs font-bold text-green-600">All clips ({videos.length})</p>

        <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-6 lg:grid-cols-3">
          {videos.slice(0, visible).map((video, i) => {
            const active = video.id === selected.id;
            return (
              <button
                key={video.id}
                type="button"
                onClick={() => setSelected(video)}
                aria-label={`Play ${video.title}`}
                aria-current={active}
                style={{ animationDelay: `${(i % VIDEOS_STEP) * 30}ms` }}
                className={`gf-rise group relative aspect-[3/4] w-full overflow-hidden rounded-xl border text-left transition ${focusRing} ${
                  active
                    ? "border-green-400 ring-2 ring-green-400/30"
                    : "border-black/[0.06] opacity-90 hover:opacity-100"
                }`}
              >
                <video
                  src={`${video.src}#t=0.1`}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  muted
                  playsInline
                  preload="metadata"
                  onLoadedMetadata={(e) => noteAspect(video.id, e.currentTarget)}
                  onMouseEnter={onThumbEnter}
                  onMouseLeave={onThumbLeave}
                />
                <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/5 to-transparent" />
                {active && <span className="absolute left-2 top-2 h-2 w-2 rounded-full bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.8)]" />}
                <span className="absolute inset-x-2 bottom-2 line-clamp-2 font-frank text-xs font-bold leading-tight text-white">
                  {video.title}
                </span>
              </button>
            );
          })}
        </div>

        {(hasMore || expanded) && (
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            {hasMore && (
              <button
                type="button"
                onClick={() => setVisible((v) => Math.min(v + VIDEOS_STEP, videos.length))}
                className={`rounded-full border border-black/10 bg-white px-5 py-2.5 font-bitter text-sm font-bold text-black/70 shadow-sm transition hover:border-green-300 hover:text-green-700 ${focusRing}`}
              >
                See more ({videos.length - visible} left)
              </button>
            )}
            {expanded && (
              <button
                type="button"
                onClick={() => setVisible(VIDEOS_INITIAL_COUNT)}
                className={`rounded-full border border-black/10 px-5 py-2.5 font-bitter text-sm font-bold text-black/45 transition hover:text-black/70 ${focusRing}`}
              >
                See less
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================
// 6. FLEET
// ============================================================

const FleetCard = memo(({ vehicle, onOpen }) => (
  <button
    type="button"
    onClick={() => onOpen(vehicle)}
    className={`group w-[10.5rem] shrink-0 snap-start overflow-hidden rounded-2xl border border-black/[0.06] bg-white text-left transition hover:-translate-y-0.5 hover:shadow-md lg:w-auto ${focusRing}`}
  >
    <div className="h-28 overflow-hidden lg:h-32">
      <img
        src={vehicle.image}
        alt={vehicle.title}
        loading="lazy"
        decoding="async"
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
    </div>
    <div className="p-3">
      <p className="truncate font-frank text-base font-bold leading-tight text-black">{vehicle.title}</p>
      <p className="mt-1 truncate font-bitter text-xs font-bold text-green-600">{vehicle.capacity}</p>
    </div>
  </button>
));

const FleetModal = ({ vehicle, onClose }) => {
  useDialog((e) => e.key === "Escape" && onClose());
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={vehicle.title}
      className="gf-fade fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div className="relative w-full max-w-4xl overflow-hidden rounded-3xl bg-white p-2 shadow-2xl sm:p-3" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={onClose}
          autoFocus
          aria-label="Close fleet image"
          className={`absolute right-4 top-4 z-20 grid h-10 w-10 place-items-center rounded-full bg-black/70 text-white transition hover:bg-black ${focusRing}`}
        >
          <CloseIcon />
        </button>
        <img src={vehicle.image} alt={vehicle.title} className="max-h-[72dvh] w-full rounded-2xl object-contain" />
        <div className="p-3 sm:p-4">
          <h3 className="font-frank text-3xl font-bold leading-none text-black">{vehicle.title}</h3>
          <p className="mt-1.5 font-bitter text-sm font-bold text-green-700">{vehicle.capacity}</p>
          <p className="mt-3 max-w-2xl font-bitter text-base leading-relaxed text-black/80">{vehicle.description}</p>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// 7. MAIN COMPONENT
// ============================================================

const SECTION_TEXT = {
  images: "Photos from real Cape Frontier tours.",
  videos: "Welcome clips and guest stories from real tours.",
};

const TABS = [
  { key: "images", label: "Images", count: images.length, show: hasImages },
  { key: "videos", label: "Videos", count: videos.length, show: hasVideos },
].filter((t) => t.show);

const GoalsGallery = () => {
  const [tab, setTab] = useState(hasImages ? "images" : "videos");
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [fleetVehicle, setFleetVehicle] = useState(null);

  const openLightbox = useCallback((i) => setLightboxIndex(i), []);
  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const openFleet = useCallback((v) => setFleetVehicle(v), []);
  const closeFleet = useCallback(() => setFleetVehicle(null), []);

  return (
    <div className="relative w-full">
      <Styles />

      {/* Media card */}
      <section className="mx-auto w-full max-w-6xl overflow-hidden rounded-[2rem] border border-black/[0.06] bg-white shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
        <header className="relative flex flex-col items-center gap-3 overflow-hidden border-b border-black/[0.05] px-5 py-5 text-center sm:py-6">
          {/* cheap gradient wash instead of large blurred divs */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_90%_at_100%_0%,rgba(187,247,208,0.55),transparent),radial-gradient(40%_80%_at_0%_100%,rgba(191,219,254,0.45),transparent)]"
          />
          <svg aria-hidden="true" className="gf-bob pointer-events-none absolute right-6 top-5 hidden h-12 w-12 text-green-500/50 sm:block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
            <circle cx="12" cy="12" r="9" />
            <path d="M14.5 9.5l-2 5-3 1.5 2-5 3-1.5z" strokeLinejoin="round" />
          </svg>

          {TABS.length > 1 && (
            <div role="tablist" aria-label="Media type" className="relative inline-flex rounded-full border border-black/[0.07] bg-black/[0.03] p-1">
              {TABS.map((t) => {
                const active = tab === t.key;
                return (
                  <button
                    key={t.key}
                    role="tab"
                    type="button"
                    aria-selected={active}
                    onClick={() => setTab(t.key)}
                    className={`flex items-center gap-1.5 rounded-full px-5 py-2.5 font-bitter text-sm font-bold transition-colors ${focusRing} ${
                      active ? "bg-black text-white shadow-sm" : "text-black/45 hover:text-black/75"
                    }`}
                  >
                    {t.label}
                    <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${active ? "bg-white/20" : "bg-black/[0.06]"}`}>
                      {t.count}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          <p aria-live="polite" className="relative max-w-md font-bitter text-xs leading-relaxed text-black/55 sm:text-sm">
            {SECTION_TEXT[tab]}
          </p>
        </header>

        {tab === "images" && hasImages && <ImageGrid onOpen={openLightbox} />}
        {tab === "videos" && hasVideos && <VideoGallery />}
      </section>

      {/* Fleet */}
      <section className="mx-auto mt-4 w-full max-w-6xl overflow-hidden rounded-[2rem] border border-black/[0.06] bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)] [contain-intrinsic-size:auto_22rem] [content-visibility:auto] sm:p-5">
        <div className="mb-4 flex items-end justify-between gap-4">
          <h3 className="font-frank text-3xl font-bold leading-none text-black">Our fleet</h3>
          <p className="hidden max-w-sm text-right font-bitter text-xs leading-relaxed text-black/60 lg:block">
            Vehicles are matched to the route, group size and needs of each booking.
          </p>
        </div>

        <div className="flex snap-x gap-2.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] lg:grid lg:grid-cols-5 lg:overflow-visible [&::-webkit-scrollbar]:hidden">
          {fleetItems.map((v) => (
            <FleetCard key={v.id} vehicle={v} onOpen={openFleet} />
          ))}
        </div>
      </section>

      {lightboxIndex !== null && (
        <Lightbox index={lightboxIndex} onChange={setLightboxIndex} onClose={closeLightbox} />
      )}
      {fleetVehicle && <FleetModal vehicle={fleetVehicle} onClose={closeFleet} />}
    </div>
  );
};

export default GoalsGallery;