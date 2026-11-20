import React, {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Seo from "../components/Seo";
import SiteFooter from "../components/SiteFooter";

gsap.registerPlugin(ScrollTrigger);

// ============================================================
// CONFIG
// ============================================================

// Video order. The FIRST entry is the ambient hero clip. Anything not listed
// follows afterwards in alphabetical order. Matching ignores case, extension,
// spaces, dashes and underscores.
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

const IMAGES_INITIAL_COUNT = 9;
const IMAGES_STEP = 12;

const DEFAULT_LOCATION = "Seapoint, Cape Town";
const mediaMetaOverrides = {};

// Navbar panel reveals itself after this much scroll (doubled from the
// original 60 so the brand band stays clean at the top of the page).
const SCROLL_HIDE_LIMIT = 120;

// Fixed ambient hero clip (title matched against VIDEO_ORDER).
const HERO_VIDEO_TITLE = "Welcome to Cape Frontier";

// Where the Experience section buttons send people. Change to match your routes.
const TOURS_PATH = "/tours";

// Video rail auto-scroll speed in px per second. Lower = slower.
// 20 is very gentle, 30 is calm, 45 is brisk.
const AUTO_SCROLL_SPEED = 30;

// Highlight cards in the Experience section.
// imageKey = filename or title of a photo in heroGallery (optional).
// Leave it "" to auto-pick an unused gallery photo.
const EXPERIENCE_HIGHLIGHTS = [
  {
    key: "mountain",
    title: "Table Mountain hikes",
    text: "Guided routes with the best views over the city and the Atlantic.",
    icon: "mountain",
    imageKey: "",
  },
  {
    key: "bokaap",
    title: "Bo-Kaap walks",
    text: "Colourful streets, local stories and Cape Malay culture up close.",
    icon: "pin",
    imageKey: "A Beautiful Part of an Unforgettable Day",
  },
  {
    key: "winelands",
    title: "Cape Winelands routes",
    text: "Relaxed tastings and scenic drives through the Western Cape.",
    icon: "wine",
    imageKey: "Beautiful Scenery in Stellies",
  },
];

// ============================================================
// 1. MEDIA
// ============================================================

const videoModules = import.meta.glob(
  "/src/assets/videos/heroGallery/**/*.{mp4,webm,ogg,mov}",
  { eager: true },
);
const imageModules = import.meta.glob(
  "/src/assets/images/heroGallery/**/*.{jpg,jpeg,png,webp,avif}",
  { eager: true },
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
        id: path,
        filename,
        title: o.title || humanize(filename),
        location: o.location || DEFAULT_LOCATION,
        src: mod.default,
        aspect: o.aspect || null,
      };
    });

const orderVideos = (list, order) => {
  const rank = new Map(order.map((key, i) => [normalize(key), i]));
  const rankOf = (v) =>
    rank.get(normalize(v.title)) ?? rank.get(normalize(v.filename)) ?? Infinity;

  if (import.meta.env?.DEV) {
    const known = new Set(
      list.flatMap((v) => [normalize(v.title), normalize(v.filename)]),
    );
    const missing = order.filter((k) => !known.has(normalize(k)));
    if (missing.length) {
      console.warn(
        "[Gallery] VIDEO_ORDER entries with no matching video:",
        missing,
        "Available:",
        list.map((v) => v.title),
      );
    }
  }

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
// 2. SHARED
// ============================================================

const Styles = () => (
  <style>{`
    @media (prefers-reduced-motion: no-preference) {
      @keyframes gf-rise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
      @keyframes gf-fade { from { opacity: 0; } to { opacity: 1; } }
      @keyframes gf-shine {
        0%   { transform: translateX(-150%) skewX(-18deg); }
        55%, 100% { transform: translateX(550%) skewX(-18deg); }
      }
      .gf-rise { animation: gf-rise .4s cubic-bezier(.2,.7,.2,1) both; }
      .gf-fade { animation: gf-fade .25s ease-out both; }
      .gf-shine { animation: gf-shine 3.2s ease-in-out infinite; }
    }
  `}</style>
);

export const CloseIcon = () => (
  <span className="relative block h-4 w-4" aria-hidden="true">
    <span className="absolute left-0 top-1/2 h-[2px] w-full -translate-y-1/2 rotate-45 rounded-full bg-current" />
    <span className="absolute left-0 top-1/2 h-[2px] w-full -translate-y-1/2 -rotate-45 rounded-full bg-current" />
  </span>
);

const Chevron = ({ dir }) => (
  <svg
    className="h-5 w-5"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d={dir === "left" ? "M15 18l-6-6 6-6" : "M9 18l6-6-6-6"}
    />
  </svg>
);

export const useDialog = (onKeyDown) => {
  const handlerRef = useRef(onKeyDown);
  handlerRef.current = onKeyDown;
  useEffect(() => {
    const handle = (e) => handlerRef.current(e);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.lenis?.stop?.();
    window.addEventListener("keydown", handle);
    return () => {
      document.body.style.overflow = prev;
      window.lenis?.start?.();
      window.removeEventListener("keydown", handle);
    };
  }, []);
};

export const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500";

export const hoverZoom = "[@media(hover:hover)]:group-hover:scale-105";

const formatTime = (s) => {
  if (!Number.isFinite(s) || s <= 0) return "";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
};

// ============================================================
// 3. IMAGES
// ============================================================

const ImageCard = memo(({ image, index, onOpen }) => {
  const [loaded, setLoaded] = useState(false);

  const imgRef = useCallback((el) => {
    if (el?.complete && el.naturalWidth) setLoaded(true);
  }, []);

  return (
    <button
      type="button"
      onClick={() => onOpen(index)}
      style={{ animationDelay: `${(index % IMAGES_STEP) * 30}ms` }}
      className={`gf-rise group relative min-w-0 touch-manipulation overflow-hidden rounded-xl bg-neutral-100 sm:rounded-2xl ${focusRing} ${
        index === 0 ? "col-span-2 row-span-2" : ""
      }`}
    >
      <img
        ref={imgRef}
        src={image.src}
        alt={image.title}
        loading={index < 6 ? "eager" : "lazy"}
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
        className={`absolute inset-0 h-full w-full transform-gpu object-cover transition-[opacity,transform] duration-500 ease-out ${hoverZoom} ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
      />
      <span className="pointer-events-none absolute inset-x-0 bottom-0 hidden truncate bg-gradient-to-t from-black/60 to-transparent px-3 pb-2.5 pt-8 text-left font-frank text-sm font-bold text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100 sm:block">
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
    <div ref={sectionRef} className="w-full min-w-0 max-w-full scroll-mt-4">
      <div className="grid auto-rows-[7.25rem] grid-flow-dense grid-cols-2 gap-2 min-[400px]:auto-rows-[8.5rem] sm:auto-rows-[10rem] sm:grid-cols-3 sm:gap-2.5 lg:auto-rows-[11rem] lg:grid-cols-4">
        {images.slice(0, visible).map((image, i) => (
          <ImageCard key={image.id} image={image} index={i} onOpen={onOpen} />
        ))}
      </div>

      {(hasMore || expanded) && (
        <div className="mt-5 flex flex-wrap justify-center gap-2.5 sm:gap-3">
          {hasMore && (
            <button
              type="button"
              onClick={() =>
                setVisible((v) => Math.min(v + IMAGES_STEP, images.length))
              }
              className={`min-h-11 rounded-full border border-black/10 bg-white px-6 py-2.5 font-bitter text-sm font-bold text-black/70 shadow-sm transition hover:border-blue-300 hover:text-blue-700 ${focusRing}`}
            >
              See more ({images.length - visible} left)
            </button>
          )}
          {expanded && (
            <button
              type="button"
              onClick={collapse}
              className={`min-h-11 rounded-full border border-black/10 px-6 py-2.5 font-bitter text-sm font-bold text-black/45 transition hover:text-black/70 ${focusRing}`}
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

  const prev = useCallback(
    () => onChange((index - 1 + count) % count),
    [index, count, onChange],
  );
  const next = useCallback(
    () => onChange((index + 1) % count),
    [index, count, onChange],
  );

  useDialog((e) => {
    if (e.key === "Escape") onClose();
    if (e.key === "ArrowLeft") prev();
    if (e.key === "ArrowRight") next();
  });

  useEffect(() => {
    [1, -1].forEach((d) => {
      new Image().src = images[(index + d + count) % count].src;
    });
    stripRef.current
      ?.querySelector(`[data-thumb-index="${index}"]`)
      ?.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
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
      className="gf-fade fixed inset-0 z-[99999] flex items-center justify-center bg-black/85 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-[max(0.75rem,env(safe-area-inset-top))] sm:p-6"
      onClick={onClose}
    >
      <div
        className="relative w-full min-w-0 max-w-4xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          autoFocus
          aria-label="Close image"
          className={`absolute right-2 top-2 z-30 grid h-11 w-11 place-items-center rounded-full bg-black/55 text-white transition hover:bg-black/75 sm:-top-12 sm:right-0 sm:h-10 sm:w-10 sm:bg-white/10 sm:hover:bg-white/20 ${focusRing}`}
        >
          <CloseIcon />
        </button>

        <div
          className="relative flex items-center justify-center overflow-hidden rounded-xl bg-black sm:rounded-2xl"
          onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
          onTouchEnd={onTouchEnd}
        >
          {count > 1 && (
            <button
              type="button"
              onClick={prev}
              aria-label="Previous image"
              className={`absolute left-2 top-1/2 z-20 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-black/40 text-white transition hover:bg-black/60 sm:left-4 sm:h-12 sm:w-12 ${focusRing}`}
            >
              <Chevron dir="left" />
            </button>
          )}
          <img
            key={image.id}
            src={image.src}
            alt={image.title}
            className="gf-fade max-h-[58dvh] w-full object-contain landscape:max-h-[52dvh] sm:max-h-[70dvh]"
          />
          {count > 1 && (
            <button
              type="button"
              onClick={next}
              aria-label="Next image"
              className={`absolute right-2 top-1/2 z-20 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-black/40 text-white transition hover:bg-black/60 sm:right-4 sm:h-12 sm:w-12 ${focusRing}`}
            >
              <Chevron dir="right" />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between gap-4 px-1 pt-3">
          <p className="truncate font-frank text-base font-bold text-white sm:text-xl">
            {image.title}
          </p>
          <span className="shrink-0 font-bitter text-xs font-bold text-white/60">
            {index + 1} / {count}
          </span>
        </div>

        <div
          ref={stripRef}
          className="mt-2.5 flex touch-pan-x gap-2 overflow-x-auto overscroll-x-contain pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:mt-3 [&::-webkit-scrollbar]:hidden"
        >
          {images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              data-thumb-index={i}
              onClick={() => onChange(i)}
              aria-label={`View ${img.title}`}
              aria-current={i === index}
              className={`relative h-12 w-[4.5rem] shrink-0 overflow-hidden rounded-lg border transition sm:h-14 sm:w-20 ${focusRing} ${
                i === index
                  ? "border-blue-300 ring-2 ring-blue-300/60"
                  : "border-white/15 opacity-50 hover:opacity-80"
              }`}
            >
              <img
                src={img.src}
                alt=""
                className="h-full w-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================================
// 4. AMBIENT HERO VIDEO (autoplay loop + play/pause + mute toggle)
// ============================================================

const PlayIcon = () => (
  <svg
    className="h-5 w-5"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M8 5v14l11-7z" />
  </svg>
);

const PauseIcon = () => (
  <svg
    className="h-5 w-5"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M7 5h4v14H7zM13 5h4v14h-4z" />
  </svg>
);

const VolumeOnIcon = () => (
  <svg
    className="h-5 w-5"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M11 5 6 9H2v6h4l5 4z" />
    <path d="M15.5 8.5a5 5 0 0 1 0 7" />
    <path d="M19 5a10 10 0 0 1 0 14" />
  </svg>
);

const VolumeOffIcon = () => (
  <svg
    className="h-5 w-5"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M11 5 6 9H2v6h4l5 4z" />
    <path d="m22 9-6 6" />
    <path d="m16 9 6 6" />
  </svg>
);

const AmbientVideo = ({ video }) => {
  const playerRef = useRef(null);
  const stageRef = useRef(null);
  const [inView, setInView] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [muted, setMuted] = useState(true); // autoplay requires muted on first play
  const [detected, setDetected] = useState({});

  const aspect = video.aspect || detected[video.id] || "landscape";
  const shouldPlay = !userPaused && inView;

  const noteAspect = useCallback((id, el) => {
    if (!el?.videoWidth) return;
    const next = el.videoWidth >= el.videoHeight ? "landscape" : "portrait";
    setDetected((d) => (d[id] === next ? d : { ...d, [id]: next }));
  }, []);

  // Pause when out of view for perf; resume when back in view (unless user
  // explicitly paused).
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const v = playerRef.current;
    if (!v) return;
    if (shouldPlay) v.play().catch(() => {});
    else v.pause();
  }, [shouldPlay, video]);

  // React's `muted` prop on <video> is unreliable — set it imperatively.
  useEffect(() => {
    const v = playerRef.current;
    if (v) v.muted = muted;
  }, [muted]);

  const togglePlay = () => setUserPaused((p) => !p);
  const toggleMute = () => setMuted((m) => !m);

  return (
    <div
      ref={stageRef}
      className={`group/video relative w-full overflow-hidden rounded-2xl bg-neutral-950 shadow-[0_12px_40px_rgba(15,23,42,0.12)] sm:rounded-3xl ${
        aspect === "landscape"
          ? "aspect-video"
          : "h-[min(66dvh,34rem)] sm:h-[min(72dvh,40rem)]"
      }`}
    >
      <video
        ref={playerRef}
        key={video.id}
        src={video.src}
        className="gf-fade h-full w-full object-contain"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        onLoadedMetadata={(e) => noteAspect(video.id, e.currentTarget)}
      />

      {/* Controls overlay — always visible, glass buttons */}
      <div className="absolute bottom-3 right-3 z-10 flex items-center gap-2 sm:bottom-4 sm:right-4">
        <button
          type="button"
          onClick={togglePlay}
          aria-label={userPaused ? "Play video" : "Pause video"}
          aria-pressed={userPaused}
          className={`grid h-11 w-11 place-items-center rounded-full bg-black/55 text-white backdrop-blur transition hover:bg-black/75 active:scale-95 ${focusRing}`}
        >
          {userPaused ? <PlayIcon /> : <PauseIcon />}
        </button>
        <button
          type="button"
          onClick={toggleMute}
          aria-label={muted ? "Unmute video" : "Mute video"}
          aria-pressed={!muted}
          className={`grid h-11 w-11 place-items-center rounded-full bg-black/55 text-white backdrop-blur transition hover:bg-black/75 active:scale-95 ${focusRing}`}
        >
          {muted ? <VolumeOffIcon /> : <VolumeOnIcon />}
        </button>
      </div>

      {/* Small hint pill while muted, hidden when unmuted */}
      {muted && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-3 left-3 z-10 hidden items-center gap-1.5 rounded-full bg-black/55 px-3 py-1.5 text-[11px] font-bold text-white backdrop-blur sm:bottom-4 sm:left-4 sm:inline-flex"
        >
          <VolumeOffIcon />
          Tap <VolumeOnIcon /> for sound
        </div>
      )}
    </div>
  );
};

// ============================================================
// 5. VIDEO SECTION (auto-scrolling rail + popup player with prev/next)
// ============================================================

const VideoThumb = memo(({ video, index, onOpen }) => {
  const videoRef = useRef(null);
  const barRef = useRef(null);
  const [duration, setDuration] = useState(0);
  const [previewing, setPreviewing] = useState(false);

  const startPreview = () => {
    const v = videoRef.current;
    if (!v) return;
    setPreviewing(true);
    v.currentTime = 0;
    v.play().catch(() => {});
  };

  const stopPreview = () => {
    const v = videoRef.current;
    if (!v) return;
    setPreviewing(false);
    v.pause();
    try {
      v.currentTime = 0;
    } catch {
      /* ignore */
    }
    if (barRef.current) barRef.current.style.width = "0%";
  };

  const onTimeUpdate = (e) => {
    const v = e.currentTarget;
    if (barRef.current && v.duration) {
      barRef.current.style.width = `${(v.currentTime / v.duration) * 100}%`;
    }
  };

  return (
    <button
      type="button"
      onClick={() => onOpen(index)}
      aria-label={`Play ${video.title}`}
      className={`group relative block w-44 shrink-0 snap-start overflow-hidden rounded-2xl border border-black/[0.06] bg-neutral-900 text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl sm:w-52 lg:w-60 ${focusRing}`}
    >
      <div className="relative aspect-[3/4]">
        <video
          ref={videoRef}
          src={`${video.src}#t=0.1`}
          className={`h-full w-full object-cover transition-transform duration-500 ${hoverZoom}`}
          muted
          playsInline
          preload="metadata"
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
          onTimeUpdate={onTimeUpdate}
          onMouseEnter={startPreview}
          onMouseLeave={stopPreview}
        />

        <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />

        {/* Duration chip */}
        {duration > 0 && (
          <span className="pointer-events-none absolute left-2.5 top-2.5 rounded-full bg-black/55 px-2 py-0.5 font-bitter text-[11px] font-bold tabular-nums text-white backdrop-blur">
            {formatTime(duration)}
          </span>
        )}

        {/* Centre play button */}
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute left-1/2 top-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-blue-700 shadow-lg backdrop-blur transition duration-300 ${
            previewing
              ? "scale-75 opacity-0"
              : "scale-100 opacity-90 [@media(hover:hover)]:group-hover:scale-110 [@media(hover:hover)]:group-hover:bg-blue-600 [@media(hover:hover)]:group-hover:text-white"
          }`}
        >
          <svg
            className="ml-0.5 h-6 w-6"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>

        {/* Title */}
        <span className="absolute inset-x-3 bottom-4 line-clamp-2 font-frank text-sm font-bold leading-tight text-white sm:text-base">
          {video.title}
        </span>

        {/* Preview progress */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-white/20"
        >
          <span ref={barRef} className="block h-full w-0 bg-blue-400" />
        </span>
      </div>
    </button>
  );
});

const VideoRail = ({ list, onOpen, paused = false }) => {
  const railRef = useRef(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  // Auto-scroll state (refs so the rAF loop never causes re-renders).
  const posRef = useRef(0);
  const holdRef = useRef(false); // hover / touch / focus
  const inViewRef = useRef(true);
  const pausedRef = useRef(paused);
  const resumeAtRef = useRef(0);
  const phaseRef = useRef("run"); // "run" | "rewind"

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  const update = useCallback(() => {
    const el = railRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = railRef.current;
    if (!el) return undefined;
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [update, list.length]);

  // Slow auto-scroll to the right. Pauses on hover/touch/focus, when the rail
  // is off-screen, or while the video popup is open. Rewinds to the start
  // after lingering at the end. Disabled for reduced-motion users.
  useEffect(() => {
    const el = railRef.current;
    if (!el) return undefined;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      return undefined;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        inViewRef.current = entry.isIntersecting;
      },
      { threshold: 0.1 },
    );
    io.observe(el);

    let raf;
    let last = performance.now();

    const tick = (now) => {
      const dt = Math.min(now - last, 64);
      last = now;
      const max = el.scrollWidth - el.clientWidth;

      const active =
        max > 4 &&
        !pausedRef.current &&
        !holdRef.current &&
        inViewRef.current &&
        now >= resumeAtRef.current;

      if (active) {
        // If the user scrolled manually, continue from where they are.
        if (Math.abs(el.scrollLeft - posRef.current) > 2) {
          posRef.current = el.scrollLeft;
        }

        if (phaseRef.current === "rewind") {
          posRef.current = 0;
          el.scrollTo({ left: 0, behavior: "smooth" });
          phaseRef.current = "run";
          resumeAtRef.current = now + 1800;
        } else if (posRef.current >= max - 1) {
          phaseRef.current = "rewind";
          resumeAtRef.current = now + 1500; // linger at the end
        } else {
          posRef.current = Math.min(
            max,
            posRef.current + (AUTO_SCROLL_SPEED * dt) / 1000,
          );
          el.scrollLeft = posRef.current;
        }
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [list.length]);

  const hold = () => {
    holdRef.current = true;
  };
  const release = (delay = 0) => {
    holdRef.current = false;
    resumeAtRef.current = performance.now() + delay;
  };

  const scrollByPage = (dir) => {
    const el = railRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  const arrowClass = `hidden h-11 w-11 place-items-center rounded-full border border-black/10 bg-white text-neutral-700 shadow-sm transition hover:border-blue-300 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-black/10 disabled:hover:text-neutral-700 sm:grid ${focusRing}`;

  return (
    <section aria-labelledby="videos-heading">
      <div className="mb-4 flex items-end justify-between gap-4 sm:mb-5">
        <div className="min-w-0">
          <h2
            id="videos-heading"
            className="font-frank text-2xl font-bold leading-none sm:text-3xl"
          >
            More from our tours
          </h2>
          <p className="mt-2 font-bitter text-xs text-neutral-500 sm:text-sm">
            Guest stories and moments from the trail.{" "}
            <span className="text-neutral-400">
              {list.length} {list.length === 1 ? "clip" : "clips"}. Hover a clip
              for a preview, click to watch.
            </span>
          </p>
        </div>

        {list.length > 2 && (
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={() => scrollByPage(-1)}
              disabled={!canPrev}
              aria-label="Scroll videos left"
              className={arrowClass}
            >
              <Chevron dir="left" />
            </button>
            <button
              type="button"
              onClick={() => scrollByPage(1)}
              disabled={!canNext}
              aria-label="Scroll videos right"
              className={arrowClass}
            >
              <Chevron dir="right" />
            </button>
          </div>
        )}
      </div>

      {/* No snap / scroll-smooth classes here: both fight with the per-frame
          scrollLeft updates used by the auto-scroll. */}
      <div
        ref={railRef}
        onMouseEnter={hold}
        onMouseLeave={() => release(600)}
        onFocus={hold}
        onBlur={() => release(600)}
        onTouchStart={hold}
        onTouchEnd={() => release(2500)}
        className="flex gap-3 overflow-x-auto overscroll-x-contain px-0.5 pb-4 pt-1 sm:gap-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="list"
        aria-label="More tour videos"
      >
        {list.map((video, i) => (
          <div role="listitem" key={video.id} className="shrink-0">
            <VideoThumb video={video} index={i} onOpen={onOpen} />
          </div>
        ))}
      </div>
    </section>
  );
};

const VideoModal = ({ list, index, onChange, onClose }) => {
  const video = list[index];
  const count = list.length;

  const prev = useCallback(
    () => onChange((index - 1 + count) % count),
    [index, count, onChange],
  );
  const next = useCallback(
    () => onChange((index + 1) % count),
    [index, count, onChange],
  );

  useDialog((e) => {
    if (e.key === "Escape") onClose();
    if (e.key === "ArrowLeft" && count > 1) prev();
    if (e.key === "ArrowRight" && count > 1) next();
  });

  if (!video || typeof document === "undefined") return null;

  const navClass = `absolute top-1/2 z-20 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-black/45 text-white backdrop-blur transition hover:bg-black/70 sm:h-12 sm:w-12 ${focusRing}`;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={video.title}
      className="gf-fade fixed inset-0 z-[99999] flex items-center justify-center bg-black/85 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-[max(0.75rem,env(safe-area-inset-top))] sm:p-6"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          autoFocus
          aria-label="Close video"
          className={`absolute right-2 top-2 z-30 grid h-11 w-11 place-items-center rounded-full bg-black/55 text-white transition hover:bg-black/75 sm:-top-12 sm:right-0 sm:h-10 sm:w-10 sm:bg-white/10 sm:hover:bg-white/20 ${focusRing}`}
        >
          <CloseIcon />
        </button>

        <div className="relative overflow-hidden rounded-xl bg-black sm:rounded-2xl">
          {count > 1 && (
            <button
              type="button"
              onClick={prev}
              aria-label="Previous video"
              className={`${navClass} left-2 sm:left-4`}
            >
              <Chevron dir="left" />
            </button>
          )}

          <video
            key={video.id}
            src={video.src}
            className="gf-fade max-h-[72dvh] w-full object-contain"
            controls
            autoPlay
            playsInline
            onEnded={count > 1 ? next : undefined}
          />

          {count > 1 && (
            <button
              type="button"
              onClick={next}
              aria-label="Next video"
              className={`${navClass} right-2 sm:right-4`}
            >
              <Chevron dir="right" />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between gap-4 px-1 pt-3">
          <p className="truncate font-frank text-base font-bold text-white sm:text-xl">
            {video.title}
          </p>
          <span className="shrink-0 font-bitter text-xs font-bold text-white/60">
            {index + 1} / {count}
          </span>
        </div>

        {count > 1 && (
          <p className="px-1 pt-1 font-bitter text-xs text-white/40">
            Plays the next clip automatically. Use the arrow keys to skip.
          </p>
        )}
      </div>
    </div>,
    document.body,
  );
};

// ============================================================
// 6. EXPERIENCE SECTION (highlight cards with photos + CTA)
// ============================================================

const findImage = (key) =>
  key
    ? images.find(
        (i) =>
          normalize(i.title) === normalize(key) ||
          normalize(i.filename) === normalize(key),
      )
    : undefined;

// Resolve each card's photo: explicit imageKey first, then unused gallery
// photos in order.
const experienceCards = (() => {
  const used = new Set();
  const withKeys = EXPERIENCE_HIGHLIGHTS.map((h) => {
    const image = findImage(h.imageKey);
    if (image) used.add(image.id);
    return { ...h, image };
  });
  const spare = images.filter((i) => !used.has(i.id));
  return withKeys.map((h) =>
    h.image ? h : { ...h, image: spare.shift() || null },
  );
})();

const ExperienceIcon = ({ name }) => {
  const paths = {
    mountain: (
      <>
        <path d="M3 20 9 9l4 6 3-4 5 9z" />
        <path d="m9 9 1.5 2.5" />
      </>
    ),
    pin: (
      <>
        <path d="M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),
    wine: (
      <>
        <path d="M8 3h8l-1 7a3 3 0 0 1-6 0z" />
        <path d="M12 13v7M8 21h8" />
      </>
    ),
  };
  return (
    <svg
      className="h-6 w-6"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
};

const ExperienceSection = ({ onExplore }) => {
  const sectionRef = useRef(null);

  // Staggered reveal on scroll.
  useLayoutEffect(() => {
    const root = sectionRef.current;
    if (!root) return undefined;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      return undefined;
    }

    const ctx = gsap.context(() => {
      gsap.from("[data-reveal]", {
        y: 28,
        opacity: 0,
        duration: 0.7,
        ease: "power3.out",
        stagger: 0.12,
        clearProps: "transform,opacity",
        scrollTrigger: {
          trigger: root,
          start: "top 80%",
          once: true,
        },
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} aria-labelledby="experience-heading">
      <div className="relative overflow-hidden rounded-3xl border border-blue-100 bg-white/70 p-5 shadow-[0_12px_40px_rgba(15,23,42,0.08)] backdrop-blur sm:p-8 lg:p-10">
        {/* Soft decorative glows */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-blue-200/40 blur-3xl"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-indigo-200/40 blur-3xl"
        />

        <div className="relative">
          {/* Heading */}
          <div data-reveal className="mx-auto max-w-2xl text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-600">
              The Cape Frontier experience
            </p>
            <h2
              id="experience-heading"
              className="mt-2 font-frank text-2xl font-bold leading-tight text-neutral-900 sm:text-3xl lg:text-4xl"
            >
              Moments like these are waiting for you
            </h2>
            <p className="mt-3 font-bitter text-sm leading-relaxed text-neutral-600 sm:text-base">
              Every photo and clip above is from a real tour. Pick an experience
              and we will take care of the rest.
            </p>
          </div>

          {/* Highlight cards with photos */}
          <ul className="mt-8 grid gap-4 sm:mt-10 sm:grid-cols-3 sm:gap-5">
            {experienceCards.map((h) => (
              <li key={h.key} data-reveal>
                <button
                  type="button"
                  onClick={onExplore}
                  className={`group flex h-full w-full flex-col overflow-hidden rounded-2xl border border-black/[0.06] bg-white text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg ${focusRing}`}
                >
                  {/* Photo */}
                  <span className="relative block aspect-[4/3] w-full overflow-hidden bg-neutral-100">
                    {h.image && (
                      <img
                        src={h.image.src}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className={`absolute inset-0 h-full w-full transform-gpu object-cover transition-transform duration-500 ease-out ${hoverZoom}`}
                      />
                    )}
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"
                    />
                    <span className="absolute bottom-3 left-3 grid h-11 w-11 place-items-center rounded-xl bg-blue-600 text-white shadow-md shadow-black/30 transition group-hover:bg-blue-700">
                      <ExperienceIcon name={h.icon} />
                    </span>
                  </span>

                  {/* Text */}
                  <span className="flex flex-1 flex-col items-start gap-2 p-5">
                    <span className="font-frank text-lg font-bold text-neutral-900">
                      {h.title}
                    </span>
                    <span className="font-bitter text-sm leading-relaxed text-neutral-600">
                      {h.text}
                    </span>
                    <span className="mt-auto inline-flex items-center gap-1 pt-2 text-sm font-bold text-blue-600 transition group-hover:gap-2">
                      Explore tours
                      <svg
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M5 12h14M13 6l6 6-6 6" />
                      </svg>
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>

          {/* CTA banner: thick gradient outline, soft blue fill, gradient button with shine */}
          <div
            data-reveal
            className="hero-gradient-bl mt-8 rounded-full bg-blue-250 p-[5px] shadow-[0_10px_30px_rgba(30,64,175,0.2)] sm:mt-10"
          >
            <div className="flex flex-col items-center gap-5 rounded-full bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100 px-5 py-8 text-center sm:flex-row sm:justify-between sm:gap-6 sm:px-8 sm:text-left">
              <div>
                <p className="font-frank text-xl font-bold leading-tight text-neutral-900 sm:text-2xl">
                  Ready to make your own memories?
                </p>
                <p className="mt-1 font-bitter text-sm text-neutral-700 sm:text-base">
                  Small-group and private tours across Cape Town and the Western
                  Cape.
                </p>
              </div>

              <button
                type="button"
                onClick={onExplore}
                className={`group relative inline-flex shrink-0 items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/30 ring-1 ring-inset ring-white/20 transition duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-600/40 hover:brightness-110 active:translate-y-0 active:scale-95 ${focusRing}`}
              >
                {/* Moving highlight */}
                <span
                  aria-hidden="true"
                  className="gf-shine pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 bg-gradient-to-r from-transparent via-white/60 to-transparent"
                />
                <span className="relative">Browse our tours</span>
                <svg
                  className="relative h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// ============================================================
// 7. MAIN COMPONENT
// ============================================================

const GALLERY_TITLE =
  "Cape Town Tour Gallery | Real Photos & Videos | Cape Frontier";
const GALLERY_DESCRIPTION =
  "Browse real photos and welcome videos from Cape Frontier's small-group and private Cape Town tours — Table Mountain hikes, Bo-Kaap walks, V&A Waterfront evenings, Cape Winelands routes and guest stories from the Western Cape.";

const HERO_DESCRIPTION =
  "Small-group and private Cape Town tours — Table Mountain hikes, Bo-Kaap walks and Cape Winelands wine routes. Browse our tours to plan your next adventure.";

const Gallery = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [videoIndex, setVideoIndex] = useState(null);
  const bgRef = useRef(null);
  const imagesSectionRef = useRef(null);

  // Fixed ambient hero — "Welcome to Cape Frontier".
  const welcomeVideo = useMemo(
    () =>
      videos.find((v) => normalize(v.title) === normalize(HERO_VIDEO_TITLE)) ||
      videos[0],
    [],
  );

  const remainingVideos = useMemo(
    () => (welcomeVideo ? videos.filter((v) => v.id !== welcomeVideo.id) : []),
    [welcomeVideo],
  );

  // Navbar panel past the doubled hide limit.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SCROLL_HIDE_LIMIT);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Animated background gradient (same as Tours).
  useLayoutEffect(() => {
    if (!bgRef.current) return undefined;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: document.body,
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
      },
    });

    tl.to(bgRef.current, {
      backgroundPosition: "100% 100%",
      ease: "none",
    });

    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
    };
  }, []);

  // Refresh ScrollTrigger after assets settle.
  useEffect(() => {
    const onLoad = () => ScrollTrigger.refresh();
    if (document.readyState === "complete") {
      ScrollTrigger.refresh();
    } else {
      window.addEventListener("load", onLoad);
    }
    return () => window.removeEventListener("load", onLoad);
  }, []);

  const openLightbox = useCallback((i) => setLightboxIndex(i), []);
  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const openVideo = useCallback((i) => setVideoIndex(i), []);
  const closeVideo = useCallback(() => setVideoIndex(null), []);

  const scrollToGallery = useCallback(() => {
    imagesSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, []);

  const goToTours = useCallback(() => navigate(TOURS_PATH), [navigate]);

  return (
    <>
      <Seo
        title={GALLERY_TITLE}
        description={GALLERY_DESCRIPTION}
        path="/gallery"
        regionalTag={false}
      />

      <Styles />

      {/* Animated background layer */}
      <div
        ref={bgRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 h-full w-full bg-[linear-gradient(135deg,#ffffff_0%,#eff6ff_40%,#e0e7ff_100%)] bg-[length:200%_200%]"
      />

      {/* Navbar white panel (after scrolling past the doubled limit) */}
      <div
        aria-hidden="true"
        className={`pointer-events-none fixed inset-x-0 top-0 z-40 h-[73px] bg-white shadow-md transition-all duration-500 ease-out sm:h-[81px] lg:h-[85px] ${
          scrolled ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
        }`}
      />

      <div className="relative min-h-screen w-full text-neutral-900">
        {/* Brand band behind the navbar — reduced height so only a thin
            sliver of blue peeks out below the navbar. */}
        <div
          aria-hidden="true"
          className="hero-gradient-bl absolute inset-x-0 top-0 h-[84px] bg-blue-950 sm:h-[92px] lg:h-[96px]"
        />

        {/* Content wrapper — padding-top matches the band height above. */}
        <div className="relative pt-[84px] sm:pt-[92px] lg:pt-[96px]">
          <div className="relative mx-auto w-full max-w-[1500px] px-4 pb-16 pt-6 sm:px-6 sm:pt-8">
            <div className="space-y-12 sm:space-y-16">
              {/* ── HERO ── */}
              {welcomeVideo && (
                <section className="flex flex-col gap-6 lg:grid lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-10">
                  {/* Mobile title — sits above the video */}
                  <h1 className="text-center font-frank text-3xl font-bold leading-tight text-neutral-900 sm:text-4xl lg:hidden">
                    {welcomeVideo.title}
                  </h1>

                  {/* Ambient video with play/pause + mute controls */}
                  <div className="min-w-0">
                    <AmbientVideo video={welcomeVideo} />
                  </div>

                  {/* Text block */}
                  <div className="text-center lg:text-left">
                    <p className="hidden text-[11px] font-bold uppercase tracking-[0.2em] text-blue-600 lg:block">
                      Cape Frontier Tours
                    </p>
                    <h1 className="hidden font-frank text-3xl font-bold leading-tight text-neutral-900 sm:text-4xl lg:block lg:text-5xl">
                      {welcomeVideo.title}
                    </h1>
                    <p className="mx-auto mt-4 max-w-xl font-bitter text-sm leading-relaxed text-neutral-600 sm:text-base lg:mx-0 lg:text-lg">
                      {HERO_DESCRIPTION}
                    </p>

                    <div className="mt-6 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
                      <button
                        type="button"
                        onClick={scrollToGallery}
                        className={`inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700 active:scale-95 ${focusRing}`}
                      >
                        See gallery
                        <svg
                          className="h-4 w-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M12 5v14M5 12l7 7 7-7" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className={`inline-flex items-center justify-center gap-2 rounded-full border border-neutral-300 bg-white px-6 py-3 text-sm font-bold text-neutral-800 transition hover:border-neutral-400 hover:bg-neutral-50 active:scale-95 ${focusRing}`}
                      >
                        <svg
                          className="h-4 w-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M19 12H5M11 6l-6 6 6 6" />
                        </svg>
                        Back
                      </button>
                    </div>
                  </div>
                </section>
              )}

              {/* ── IMAGES ── */}
              {hasImages && (
                <section ref={imagesSectionRef} className="scroll-mt-24">
                  <div className="mb-4 flex items-end justify-between gap-4 sm:mb-5">
                    <h2 className="font-frank text-2xl font-bold leading-none sm:text-3xl">
                      Photo highlights
                    </h2>
                    <p className="hidden font-bitter text-xs text-neutral-400 lg:block">
                      Tap a photo to view it full size.
                    </p>
                  </div>
                  <ImageGrid onOpen={openLightbox} />
                </section>
              )}

              {/* ── VIDEOS: auto-scrolling rail with previews ── */}
              {remainingVideos.length > 0 && (
                <VideoRail
                  list={remainingVideos}
                  onOpen={openVideo}
                  paused={videoIndex !== null}
                />
              )}

              {/* ── EXPERIENCE: photo cards + CTA ── */}
              {(hasImages || hasVideos) && (
                <ExperienceSection onExplore={goToTours} />
              )}

              {/* Fallback if no media has been added yet */}
              {!hasVideos && !hasImages && (
                <div className="rounded-3xl border border-neutral-200 bg-white p-10 text-center">
                  <p className="font-frank text-2xl font-bold">
                    Gallery coming soon
                  </p>
                  <p className="mt-2 text-sm text-neutral-600">
                    Photos and videos from our tours will appear here shortly.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Site footer — below everything */}
      <div
        id="contact-details"
        className="mx-auto w-full max-w-7xl scroll-mt-40 px-4 pb-6 sm:px-6 sm:pb-8 lg:px-8"
      >
        <SiteFooter />
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <Lightbox
          index={lightboxIndex}
          onChange={setLightboxIndex}
          onClose={closeLightbox}
        />
      )}

      {/* Video popup player */}
      {videoIndex !== null && (
        <VideoModal
          list={remainingVideos}
          index={videoIndex}
          onChange={setVideoIndex}
          onClose={closeVideo}
        />
      )}
    </>
  );
};

export default Gallery;