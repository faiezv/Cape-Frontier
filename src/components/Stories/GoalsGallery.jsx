import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import vehicles from "../../data/vehicles.js";
import { resolveImage } from "../../utils/ImageLoader.js";
import mapPinIcon from "/public/icons/mapPin.png";

gsap.registerPlugin(ScrollTrigger);

// ============================================================
// 1. AUTO-LOADED MEDIA (videos + images from heroGallery folders)
// ============================================================

const videoModules = import.meta.glob(
  "/src/assets/videos/heroGallery/**/*.{mp4,webm,ogg,mov}",
  { eager: true }
);

const imageModules = import.meta.glob(
  "/src/assets/images/heroGallery/**/*.{jpg,jpeg,png,webp,avif}",
  { eager: true }
);

const mediaMetaOverrides = {
  // "sunset-drive.mp4": { title: "Sunset Drive", location: "Camps Bay, Cape Town" },
};

const humanizeFilename = (filename) => {
  const nameOnly = filename.replace(/\.[^/.]+$/, "");
  return nameOnly
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const buildVideoList = () => {
  return Object.entries(videoModules)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([fullPath, mod], index) => {
      const filename = fullPath.split("/").pop();
      const override = mediaMetaOverrides[filename] || {};
      return {
        id: filename,
        title: override.title || humanizeFilename(filename),
        location: override.location || "Seapoint, Cape Town",
        src: mod.default,
        aspect: override.aspect || "portrait",
        index,
      };
    });
};

const buildImageList = () => {
  return Object.entries(imageModules)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([fullPath, mod], index) => {
      const filename = fullPath.split("/").pop();
      const override = mediaMetaOverrides[filename] || {};
      return {
        id: filename,
        title: override.title || humanizeFilename(filename),
        location: override.location || "Seapoint, Cape Town",
        src: mod.default,
        aspect: override.aspect || "landscape",
        index,
      };
    });
};

const videos = buildVideoList();
const images = buildImageList();

const IMAGES_INITIAL_COUNT = 10;

// ============================================================
// 2. VEHICLE HELPERS
// ============================================================

const fallbackFleetImages = [
  "/images/content/vehicles/1.webp",
  "/images/content/vehicles/2.webp",
  "/images/content/vehicles/3.webp",
  "/images/content/vehicles/4.webp",
  "/images/content/vehicles/5.webp",
];

const getVehicleImage = (vehicle) => {
  if (typeof vehicle === "string") return vehicle;
  return (
    vehicle?.image ||
    vehicle?.img ||
    vehicle?.src ||
    vehicle?.photo ||
    vehicle?.cover ||
    vehicle?.images?.[0] ||
    vehicle?.gallery?.[0] ||
    null
  );
};

const getVehicleTitle = (vehicle, index) => {
  if (typeof vehicle === "string") return `Cape Frontier vehicle ${index + 1}`;
  return (
    vehicle?.title ||
    vehicle?.name ||
    vehicle?.model ||
    vehicle?.label ||
    `Cape Frontier vehicle ${index + 1}`
  );
};

const getVehicleDescription = (vehicle) => {
  if (typeof vehicle === "string") {
    return "Comfortable Cape Frontier transport used for private and group tour operations.";
  }
  return (
    vehicle?.description ||
    vehicle?.desc ||
    vehicle?.summary ||
    vehicle?.note ||
    "Comfortable Cape Frontier transport used for private and group tour operations."
  );
};

const getVehicleCapacity = (vehicle) => {
  if (typeof vehicle === "string") return "Tour vehicle";
  return (
    vehicle?.capacity ||
    vehicle?.seats ||
    vehicle?.passengers ||
    vehicle?.type ||
    "Tour vehicle"
  );
};

const getFleetItems = () => {
  if (!Array.isArray(vehicles) || vehicles.length === 0) {
    return fallbackFleetImages.map((src, index) => ({
      id: `fallback-${index}`,
      image: resolveImage(src),
      title: `Cape Frontier vehicle ${index + 1}`,
      description:
        "Comfortable Cape Frontier transport used for private and group tour operations.",
      capacity: "Tour vehicle",
    }));
  }

  const mappedVehicles = vehicles
    .map((vehicle, index) => ({
      id: vehicle?.id || vehicle?.slug || vehicle?.title || vehicle?.name || index,
      image: resolveImage(getVehicleImage(vehicle)),
      title: getVehicleTitle(vehicle, index),
      description: getVehicleDescription(vehicle),
      capacity: getVehicleCapacity(vehicle),
    }))
    .filter((vehicle) => vehicle.image);

  return mappedVehicles.length
    ? mappedVehicles
    : fallbackFleetImages.map((src, index) => ({
        id: `fallback-${index}`,
        image: resolveImage(src),
        title: `Cape Frontier vehicle ${index + 1}`,
        description:
          "Comfortable Cape Frontier transport used for private and group tour operations.",
        capacity: "Tour vehicle",
      }));
};

// ============================================================
// 3. STAR RATING
// ============================================================

const StarRating = ({ rating = 4.7 }) => {
  const rounded = Math.round(Number(rating) || 0);
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <svg
          key={index}
          className="h-3.5 w-3.5"
          viewBox="0 0 24 24"
          fill={index < rounded ? "#22C55E" : "none"}
          stroke="#22C55E"
          strokeWidth="1.7"
          aria-hidden="true"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
};

// ============================================================
// 4. MAIN COMPONENT
// ============================================================

const GoalsGallery = () => {
  const [activeTab, setActiveTab] = useState("images");

  const [selectedVideo, setSelectedVideo] = useState(videos[0] || null);
  const [isGalleryManuallyPaused, setIsGalleryManuallyPaused] = useState(false);
  const [isGalleryInView, setIsGalleryInView] = useState(false);
  const [selectedFleetImage, setSelectedFleetImage] = useState(null);

  const [visibleImageCount, setVisibleImageCount] = useState(IMAGES_INITIAL_COUNT);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const fleetItems = useMemo(() => getFleetItems(), []);

  const galleryRef = useRef(null);
  const imagesSectionRef = useRef(null);
  const playerRef = useRef(null);
  const thumbVideoRefs = useRef([]);
  const previousVideoRef = useRef(selectedVideo);
  const lightboxThumbStripRef = useRef(null);
  const lightboxImageRef = useRef(null);

  // banner illustration refs
  const compassRef = useRef(null);
  const cameraRef = useRef(null);
  const mountainRef = useRef(null);
  const routeLineRef = useRef(null);

  const isGalleryPaused = isGalleryManuallyPaused || !isGalleryInView;

  const hasVideos = videos.length > 0;
  const hasImages = images.length > 0;

  const visibleImages = images.slice(0, visibleImageCount);
  const hasMoreImages = visibleImageCount < images.length;
  const isExpanded = visibleImageCount > IMAGES_INITIAL_COUNT;

  const lightboxImage = lightboxIndex !== null ? images[lightboxIndex] : null;

  // ============================================================
  // RESET IMAGE COUNT WHEN SWITCHING TABS
  // ============================================================

  useEffect(() => {
    setVisibleImageCount(IMAGES_INITIAL_COUNT);
  }, [activeTab]);

  // ============================================================
  // BANNER ILLUSTRATION ANIMATION (subtle float + draw)
  // ============================================================

  useLayoutEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) return undefined;

    const ctx = gsap.context(() => {
      if (compassRef.current) {
        gsap.to(compassRef.current, {
          rotate: 12,
          duration: 3.4,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });
      }

      if (cameraRef.current) {
        gsap.to(cameraRef.current, {
          y: -6,
          duration: 2.6,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          delay: 0.2,
        });
      }

      if (mountainRef.current) {
        gsap.to(mountainRef.current, {
          y: -4,
          duration: 3.1,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          delay: 0.5,
        });
      }

      if (routeLineRef.current) {
        const length = routeLineRef.current.getTotalLength();
        gsap.set(routeLineRef.current, {
          strokeDasharray: length,
          strokeDashoffset: length,
        });
        gsap.to(routeLineRef.current, {
          strokeDashoffset: 0,
          duration: 1.8,
          ease: "power2.out",
          delay: 0.15,
        });
      }
    }, galleryRef);

    return () => ctx.revert();
  }, []);

  // ============================================================
  // GALLERY INTRO
  // ============================================================

  useLayoutEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      const introItems = gsap.utils.toArray(".gallery-intro-item");
      const galleryItems = gsap.utils.toArray(".gallery-item");
      const fleetCards = gsap.utils.toArray(".fleet-card");
      const all = [...introItems, ...galleryItems, ...fleetCards];

      if (reducedMotion) {
        gsap.set(all, { autoAlpha: 1, y: 0 });
        return;
      }

      gsap.set(all, { autoAlpha: 0, y: 12, willChange: "transform, opacity" });

      const introTl = gsap.timeline({
        scrollTrigger: {
          trigger: galleryRef.current,
          start: "top 86%",
          once: true,
          invalidateOnRefresh: true,
        },
        onComplete: () => gsap.set(all, { willChange: "auto" }),
      });

      introTl
        .to(introItems, { autoAlpha: 1, y: 0, duration: 0.38, stagger: 0.04, ease: "power2.out" })
        .to(
          galleryItems,
          { autoAlpha: 1, y: 0, duration: 0.38, stagger: 0.025, ease: "power2.out" },
          "-=0.2"
        )
        .to(
          fleetCards,
          { autoAlpha: 1, y: 0, duration: 0.34, stagger: 0.03, ease: "power2.out" },
          "-=0.12"
        );
    }, galleryRef);

    return () => ctx.revert();
  }, [activeTab]);

  // ============================================================
  // SEE MORE / SEE LESS
  // ============================================================

  const revealMoreImages = () => {
    setVisibleImageCount((prev) => Math.min(prev + IMAGES_INITIAL_COUNT, images.length));
  };

  const collapseImages = () => {
    setVisibleImageCount(IMAGES_INITIAL_COUNT);
    imagesSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useLayoutEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) return;

    const cards = gsap.utils.toArray(".gallery-image-card");
    const newlyRevealed = cards.slice(Math.max(0, visibleImageCount - IMAGES_INITIAL_COUNT));

    if (!newlyRevealed.length || visibleImageCount <= IMAGES_INITIAL_COUNT) return;

    gsap.fromTo(
      newlyRevealed,
      { autoAlpha: 0, y: 14 },
      { autoAlpha: 1, y: 0, duration: 0.36, stagger: 0.03, ease: "power2.out" }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleImageCount]);

  // ============================================================
  // DETECT GALLERY VISIBILITY
  // ============================================================

  useLayoutEffect(() => {
    let frame = null;

    const updateVisibility = () => {
      frame = null;
      if (!galleryRef.current) return;

      const rect = galleryRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      const visiblePixels = Math.max(0, Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0));
      const ratio = visiblePixels / Math.min(rect.height, viewportHeight);

      setIsGalleryInView(ratio >= 0.45);
    };

    const requestUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(updateVisibility);
    };

    updateVisibility();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    window.addEventListener("orientationchange", requestUpdate);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      window.removeEventListener("orientationchange", requestUpdate);
    };
  }, []);

  // ============================================================
  // PLAY / PAUSE MAIN VIDEO
  // ============================================================

  useLayoutEffect(() => {
    if (activeTab !== "videos" || !playerRef.current) return;

    if (isGalleryPaused) {
      playerRef.current.pause();
    } else {
      const playPromise = playerRef.current.play();
      if (playPromise?.catch) playPromise.catch(() => {});
    }
  }, [isGalleryPaused, selectedVideo, activeTab]);

  // ============================================================
  // SELECTED VIDEO TRANSITION
  // ============================================================

  useLayoutEffect(() => {
    if (!selectedVideo || previousVideoRef.current?.id === selectedVideo.id) return;
    previousVideoRef.current = selectedVideo;

    if (playerRef.current) {
      gsap.fromTo(
        playerRef.current,
        { opacity: 0, y: 8, scale: 0.99 },
        { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: "power2.out" }
      );
    }

    const activeThumbs = galleryRef.current?.querySelectorAll(".active-video-thumb");
    if (activeThumbs?.length) {
      gsap.fromTo(activeThumbs, { scale: 0.96 }, { scale: 1, duration: 0.26, ease: "power2.out" });
    }
  }, [selectedVideo]);

  // ============================================================
  // THUMBNAIL HOVER PLAYBACK
  // ============================================================

  const handleThumbEnter = (event) => {
    if (isGalleryPaused) return;
    const video = event.currentTarget;
    video.currentTime = 0;
    video.play().catch(() => {});
  };

  const handleThumbLeave = (event) => {
    const video = event.currentTarget;
    video.pause();
    try {
      video.currentTime = 0;
    } catch {
      // ignore
    }
  };

  const selectVideo = (video) => {
    if (video.id === selectedVideo?.id) return;
    setSelectedVideo(video);
  };

  // ============================================================
  // LIGHTBOX
  // ============================================================

  const openLightbox = (image) => {
    const index = images.findIndex((item) => item.id === image.id);
    setLightboxIndex(index === -1 ? 0 : index);
  };

  const closeLightbox = () => setLightboxIndex(null);

  const showPrevImage = (e) => {
    e?.stopPropagation();
    setLightboxIndex((prev) => (prev === null ? prev : (prev - 1 + images.length) % images.length));
  };

  const showNextImage = (e) => {
    e?.stopPropagation();
    setLightboxIndex((prev) => (prev === null ? prev : (prev + 1) % images.length));
  };

  useEffect(() => {
    if (lightboxIndex === null) return undefined;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") showPrevImage();
      if (e.key === "ArrowRight") showNextImage();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [lightboxIndex]);

  useEffect(() => {
    if (lightboxIndex === null || !lightboxThumbStripRef.current) return;
    const activeThumb = lightboxThumbStripRef.current.querySelector(
      `[data-thumb-index="${lightboxIndex}"]`
    );
    activeThumb?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [lightboxIndex]);

  useLayoutEffect(() => {
    if (lightboxIndex === null || !lightboxImageRef.current) return;
    gsap.fromTo(
      lightboxImageRef.current,
      { autoAlpha: 0, scale: 0.985 },
      { autoAlpha: 1, scale: 1, duration: 0.28, ease: "power2.out" }
    );
  }, [lightboxIndex]);

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div ref={galleryRef} className="relative w-full">
      {/* ========================================================
          HEADER / BANNER — light theme with animated line-art
      ======================================================== */}
      <header className="gallery-intro-item relative mx-auto w-full max-w-6xl overflow-hidden rounded-t-[2rem] border border-b-0 border-black/[0.06] bg-white px-5 py-6 shadow-[0_10px_36px_rgba(15,23,42,0.05)] sm:px-8 sm:py-7">
        {/* soft color wash */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-green-100/70 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 bottom-0 h-48 w-48 rounded-full bg-blue-100/50 blur-3xl" />

        {/* animated dotted route line */}
        <svg
          className="pointer-events-none absolute left-0 top-0 hidden h-full w-full opacity-[0.35] sm:block"
          viewBox="0 0 800 160"
          fill="none"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            ref={routeLineRef}
            d="M20 130 C 160 40, 260 150, 400 70 S 620 20, 780 90"
            stroke="#16A34A"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="1 10"
          />
        </svg>

        {/* floating line-art icons */}
        <svg
          ref={compassRef}
          className="pointer-events-none absolute right-8 top-6 h-10 w-10 text-green-500/60 sm:h-12 sm:w-12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M14.5 9.5l-2 5-3 1.5 2-5 3-1.5z" strokeLinejoin="round" />
        </svg>

        <svg
          ref={cameraRef}
          className="pointer-events-none absolute left-10 top-10 h-8 w-8 text-blue-400/50 sm:h-10 sm:w-10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          aria-hidden="true"
        >
          <path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 011 1v9a1 1 0 01-1 1H4a1 1 0 01-1-1V9a1 1 0 011-1z" strokeLinejoin="round" />
          <circle cx="12" cy="13" r="3.2" />
        </svg>

        <svg
          ref={mountainRef}
          className="pointer-events-none absolute bottom-4 right-16 h-9 w-9 text-green-400/50 sm:h-11 sm:w-11"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          aria-hidden="true"
        >
          <path d="M3 18l6-9 4 6 2-3 6 6H3z" strokeLinejoin="round" strokeLinecap="round" />
        </svg>

        <div className="relative flex flex-col items-center text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1 font-bitter text-[10px] font-black uppercase tracking-[0.2em] text-green-700">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            Cape Frontier moments
          </span>

          <h2 className="mt-3 font-frank text-4xl font-bold leading-[0.92] tracking-tight text-black sm:text-5xl md:text-6xl">
            Gallery & Fleet
          </h2>

          <p className="mt-2.5 max-w-xl font-bitter text-xs leading-relaxed text-black/45 sm:text-sm">
            A glimpse into the places, experiences and vehicles behind Cape
            Frontier — photos and video from real tours.
          </p>

          {hasVideos && hasImages && (
            <div className="relative mt-5 inline-flex rounded-full border border-black/[0.07] bg-black/[0.03] p-1">
              <button
                type="button"
                onClick={() => setActiveTab("images")}
                className={`relative flex items-center gap-1.5 rounded-full px-5 py-2.5 font-bitter text-[10px] font-black uppercase tracking-[0.14em] transition-colors duration-300 ${
                  activeTab === "images"
                    ? "bg-black text-white shadow-sm"
                    : "text-black/40 hover:text-black/70"
                }`}
              >
                Images
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[9px] ${
                    activeTab === "images" ? "bg-white/20 text-white" : "bg-black/[0.06] text-black/40"
                  }`}
                >
                  {images.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("videos")}
                className={`relative flex items-center gap-1.5 rounded-full px-5 py-2.5 font-bitter text-[10px] font-black uppercase tracking-[0.14em] transition-colors duration-300 ${
                  activeTab === "videos"
                    ? "bg-black text-white shadow-sm"
                    : "text-black/40 hover:text-black/70"
                }`}
              >
                Videos
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[9px] ${
                    activeTab === "videos" ? "bg-white/20 text-white" : "bg-black/[0.06] text-black/40"
                  }`}
                >
                  {videos.length}
                </span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ========================================================
          IMAGES SECTION
      ======================================================== */}

      {hasImages && activeTab === "images" && (
        <section
          ref={imagesSectionRef}
          className="relative mx-auto w-full max-w-6xl overflow-hidden rounded-b-[2rem] border border-t-0 border-black/[0.06] bg-white p-4 shadow-[0_16px_46px_rgba(15,23,42,0.06)] sm:p-5"
        >
          <div className="pointer-events-none absolute -left-32 top-10 h-56 w-56 rounded-full bg-green-100/30 blur-3xl" />

          <div className="relative z-10 mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="font-bitter text-[10px] font-black uppercase tracking-[0.18em] text-green-600">
                Explore the moments
              </p>
              <h3 className="mt-1 font-frank text-2xl font-bold leading-none text-black lg:text-3xl">
                Photo highlights
              </h3>
            </div>
            <p className="hidden max-w-[13rem] text-right font-bitter text-[10px] leading-relaxed text-black/35 lg:block">
              Tap an image to view it in full, with next and previous.
            </p>
          </div>

          <div className="relative z-10 columns-2 gap-2.5 sm:columns-3 lg:columns-4 [column-fill:_balance]">
            {visibleImages.map((image) => (
              <button
                key={image.id}
                type="button"
                onClick={() => openLightbox(image)}
                className="gallery-item gallery-image-card group relative mb-2.5 block w-full overflow-hidden rounded-[1rem] border border-black/[0.06] transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-md"
              >
                <img
                  src={image.src}
                  alt={image.title}
                  className="w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                  loading="lazy"
                  decoding="async"
                />

                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                <div className="absolute bottom-2.5 left-2.5 right-2.5 translate-y-1 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                  <p className="truncate font-frank text-sm font-bold leading-none text-white">
                    {image.title}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {(hasMoreImages || isExpanded) && (
            <div className="relative z-10 mt-4 flex justify-center gap-3">
              {hasMoreImages && (
                <button
                  type="button"
                  onClick={revealMoreImages}
                  className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-6 py-2.5 font-bitter text-[10px] font-black uppercase tracking-[0.16em] text-black/70 shadow-sm transition hover:-translate-y-0.5 hover:border-green-300 hover:text-green-700 hover:shadow-md"
                >
                  See more
                  <span className="rounded-full bg-black/[0.06] px-1.5 py-0.5 text-[9px]">
                    +{Math.min(IMAGES_INITIAL_COUNT, images.length - visibleImageCount)}
                  </span>
                </button>
              )}

              {isExpanded && (
                <button
                  type="button"
                  onClick={collapseImages}
                  className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-black/[0.02] px-6 py-2.5 font-bitter text-[10px] font-black uppercase tracking-[0.16em] text-black/45 transition hover:-translate-y-0.5 hover:border-black/20 hover:text-black/70"
                >
                  See less
                </button>
              )}
            </div>
          )}
        </section>
      )}

      {/* ========================================================
          IMAGE LIGHTBOX
      ======================================================== */}

      {lightboxImage && (
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/70 p-3 backdrop-blur-md sm:p-6"
          onClick={closeLightbox}
        >
          <div
            className="relative w-full max-w-4xl rounded-[1.8rem] border border-white/20 bg-white/[0.03] p-2 shadow-[0_30px_80px_rgba(0,0,0,0.5)] backdrop-blur-xl sm:p-3"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeLightbox}
              className="absolute -top-12 right-0 z-20 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white backdrop-blur-md transition hover:bg-white/20 sm:right-1"
              aria-label="Close image"
            >
              <span className="relative block h-4 w-4">
                <span className="absolute left-0 top-1/2 h-[2px] w-full -translate-y-1/2 rotate-45 rounded-full bg-current" />
                <span className="absolute left-0 top-1/2 h-[2px] w-full -translate-y-1/2 -rotate-45 rounded-full bg-current" />
              </span>
            </button>

            <div className="relative flex items-center justify-center overflow-hidden rounded-[1.4rem] bg-black/40">
              {images.length > 1 && (
                <button
                  type="button"
                  onClick={showPrevImage}
                  className="absolute left-2 top-1/2 z-20 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur-md transition hover:bg-white/20 sm:left-4 sm:h-12 sm:w-12"
                  aria-label="Previous image"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
                  </svg>
                </button>
              )}

              <img
                ref={lightboxImageRef}
                key={lightboxImage.id}
                src={lightboxImage.src}
                alt={lightboxImage.title}
                className="max-h-[68dvh] w-full rounded-[1.2rem] object-contain"
              />

              {images.length > 1 && (
                <button
                  type="button"
                  onClick={showNextImage}
                  className="absolute right-2 top-1/2 z-20 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur-md transition hover:bg-white/20 sm:right-4 sm:h-12 sm:w-12"
                  aria-label="Next image"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
                  </svg>
                </button>
              )}
            </div>

            <div className="flex items-center justify-between px-2 pt-3">
              <p className="truncate font-frank text-lg font-bold text-white sm:text-xl">
                {lightboxImage.title}
              </p>
              <span className="shrink-0 font-bitter text-[10px] font-bold text-white/40">
                {lightboxIndex + 1} / {images.length}
              </span>
            </div>

            <div
              ref={lightboxThumbStripRef}
              className="mt-3 flex gap-2 overflow-x-auto px-2 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {images.map((image, index) => {
                const isActive = index === lightboxIndex;
                return (
                  <button
                    key={image.id}
                    type="button"
                    data-thumb-index={index}
                    onClick={() => setLightboxIndex(index)}
                    className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-[0.7rem] border transition ${
                      isActive
                        ? "border-green-300 opacity-100 ring-2 ring-green-300/60"
                        : "border-white/15 opacity-50 hover:opacity-80"
                    }`}
                  >
                    <img src={image.src} alt="" className="h-full w-full object-cover" loading="lazy" decoding="async" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          VIDEOS SECTION — unified filmstrip layout (no mosaic)
      ======================================================== */}

      {hasVideos && activeTab === "videos" && (
        <section className="relative mx-auto w-full max-w-6xl overflow-hidden rounded-b-[2rem] border border-t-0 border-black/[0.06] bg-white p-4 shadow-[0_16px_46px_rgba(15,23,42,0.06)] sm:p-5">
          <div className="pointer-events-none absolute -right-32 top-10 h-56 w-56 rounded-full bg-blue-100/30 blur-3xl" />

          <div className="relative z-10 grid gap-5 lg:grid-cols-[1fr_0.72fr] lg:items-start">
            {/* Player */}
            <div className="gallery-item min-w-0">
              <div className="mb-3 flex items-center justify-between gap-3 px-1">
                <div>
                  <p className="font-bitter text-[9px] font-black uppercase tracking-[0.18em] text-green-600">
                    Now viewing
                  </p>
                  {selectedVideo && (
                    <h3 className="mt-0.5 truncate font-frank text-xl font-bold leading-none text-black sm:text-2xl">
                      {selectedVideo.title}
                    </h3>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setIsGalleryManuallyPaused((prev) => !prev)}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-black/10 bg-black/[0.03] text-black/60 transition hover:border-green-300 hover:bg-green-400 hover:text-green-950"
                  aria-label={isGalleryPaused ? "Play gallery video" : "Pause gallery video"}
                >
                  {isGalleryPaused ? (
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M7 5h4v14H7zM13 5h4v14h-4z" />
                    </svg>
                  )}
                </button>
              </div>

              {selectedVideo && (
                <div
                  className={`relative flex items-center justify-center overflow-hidden rounded-[1.3rem] border border-black/[0.05] bg-gradient-to-b from-gray-900 to-black shadow-inner ${
                    selectedVideo.aspect === "portrait" ? "min-h-[24rem] sm:min-h-[30rem]" : "min-h-[16rem] sm:min-h-[20rem]"
                  }`}
                >
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06),transparent_60%)]" />
                  <video
                    ref={playerRef}
                    key={selectedVideo.id}
                    src={selectedVideo.src}
                    className={`relative z-10 max-h-[58vh] rounded-[0.9rem] object-contain shadow-2xl ring-1 ring-white/10 ${
                      selectedVideo.aspect === "portrait" ? "h-full w-auto max-w-full" : "h-auto w-full"
                    }`}
                    controls
                    autoPlay={!isGalleryPaused}
                    muted
                    loop
                    playsInline
                  />
                </div>
              )}

              {selectedVideo && (
                <div className="mt-3 flex items-center justify-between gap-4 px-1">
                  <div className="flex min-w-0 items-center gap-1.5">
                    <img src={mapPinIcon} className="h-3.5 w-3.5 shrink-0 object-contain opacity-50" alt="" aria-hidden="true" />
                    <p className="truncate font-bitter text-[11px] font-semibold italic text-black/45">
                      {selectedVideo.location || "Seapoint, Cape Town"}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="font-frank text-base font-bold text-black">4.7</span>
                    <StarRating rating={4.7} />
                  </div>
                </div>
              )}
            </div>

            {/* Filmstrip */}
            <div className="gallery-item min-w-0">
              <p className="mb-3 px-1 font-bitter text-[10px] font-black uppercase tracking-[0.18em] text-green-600">
                All clips
              </p>

              <div className="flex gap-2.5 overflow-x-auto pb-1 lg:grid lg:grid-cols-3 lg:gap-2.5 lg:overflow-visible [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {videos.map((video, index) => {
                  const isSelected = selectedVideo?.id === video.id;
                  return (
                    <button
                      key={video.id}
                      type="button"
                      onClick={() => selectVideo(video)}
                      className={`gallery-item group relative aspect-[3/4] w-28 shrink-0 overflow-hidden rounded-[1rem] border text-left transition-all duration-300 sm:w-32 lg:w-full ${
                        isSelected
                          ? "active-video-thumb border-green-400 shadow-[0_0_0_2px_rgba(74,222,128,0.25),0_8px_18px_rgba(0,0,0,0.10)]"
                          : "border-black/[0.06] opacity-90 hover:-translate-y-0.5 hover:opacity-100 hover:shadow-sm"
                      }`}
                    >
                      <video
                        ref={(el) => {
                          thumbVideoRefs.current[index] = el;
                        }}
                        src={video.src}
                        className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                        muted
                        preload="metadata"
                        playsInline
                        onMouseEnter={handleThumbEnter}
                        onMouseLeave={handleThumbLeave}
                      />

                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/5 to-transparent" />

                      {isSelected && (
                        <span className="absolute left-2 top-2 h-1.5 w-1.5 rounded-full bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.8)]" />
                      )}

                      <div className="absolute bottom-2 left-2 right-2">
                        <p className="truncate font-frank text-xs font-bold leading-none text-white">
                          {video.title}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================
          STATUS PILL
      ======================================================== */}

      <div className="mx-auto mt-2 flex w-full max-w-6xl px-1">
        <span className="rounded-full border border-green-200 bg-green-50 px-3 py-1.5 font-bitter text-[9px] font-black uppercase tracking-[0.14em] text-green-700">
          Fleet ready
        </span>
      </div>

      {/* ========================================================
          FLEET
      ======================================================== */}

      <section className="fleet-section relative z-10 mx-auto mt-2 w-full max-w-6xl overflow-hidden rounded-[2rem] border border-black/[0.06] bg-white p-4 shadow-[0_14px_38px_rgba(15,23,42,0.05)] sm:p-5">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 top-0 h-64 w-64 rounded-full bg-green-100/50 blur-3xl" />
          <div className="absolute -bottom-24 right-0 h-64 w-64 rounded-full bg-blue-100/40 blur-3xl" />
        </div>

        <div className="relative z-10 mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="font-bitter text-[9px] font-black uppercase tracking-[0.2em] text-green-600">
              Vehicle visuals
            </p>
            <h3 className="mt-1 font-frank text-3xl font-bold leading-none text-black">
              See our fleet
            </h3>
          </div>
          <p className="hidden max-w-sm text-right font-bitter text-xs leading-relaxed text-black/95 lg:block">
            Vehicles are matched to the route, group size, and operational
            needs of each booking.
          </p>
        </div>

        <div className="relative z-10 flex gap-2.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] lg:grid lg:grid-cols-5 lg:overflow-visible [&::-webkit-scrollbar]:hidden">
          {fleetItems.map((vehicle) => (
            <button
              key={vehicle.id}
              type="button"
              onClick={() => setSelectedFleetImage(vehicle)}
              className="fleet-card group relative min-w-[10.5rem] place-items-center overflow-hidden rounded-[1.2rem] border border-black/[0.06] bg-white text-left transition duration-300 hover:-translate-y-1 hover:border-black/15 hover:shadow-md lg:min-w-0"
            >
              <div className="relative h-28 overflow-hidden lg:h-32">
                <img
                  src={vehicle.image}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  alt={vehicle.title}
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-2 left-2">
                  <span className="rounded-full bg-white/90 px-2 py-1 font-bitter text-[7px] font-black uppercase tracking-[0.12em] text-black">
                    View
                  </span>
                </div>
              </div>

              <div className="p-3">
                <p className="truncate font-frank text-base font-bold leading-none text-black">
                  {vehicle.title}
                </p>
                <p className="mt-1 font-bitter text-[8px] font-black uppercase tracking-[0.12em] text-green-600">
                  {vehicle.capacity}
                </p>
                <p className="mt-2 hidden line-clamp-2 font-bitter text-[10px] leading-relaxed text-black/90 lg:block">
                  {/* {vehicle.description} */}
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ========================================================
          FLEET IMAGE MODAL
      ======================================================== */}

      {selectedFleetImage && (
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md"
          onClick={() => setSelectedFleetImage(null)}
        >
          <div
            className="relative w-full max-w-4xl overflow-hidden rounded-[2rem] bg-white p-2 shadow-2xl sm:p-3"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedFleetImage(null)}
              className="absolute right-4 top-4 z-20 grid h-10 w-10 place-items-center rounded-full bg-black/70 text-white backdrop-blur-md transition hover:bg-black"
              aria-label="Close fleet image"
            >
              <span className="relative block h-4 w-4">
                <span className="absolute left-0 top-1/2 h-[2px] w-full -translate-y-1/2 rotate-45 rounded-full bg-current" />
                <span className="absolute left-0 top-1/2 h-[2px] w-full -translate-y-1/2 -rotate-45 rounded-full bg-current" />
              </span>
            </button>

            <img
              src={selectedFleetImage.image}
              alt={selectedFleetImage.title}
              className="max-h-[74dvh] w-full rounded-[1.5rem] object-contain"
            />

            <div className="p-3 sm:p-4">
              <h3 className="font-frank text-3xl font-bold leading-none text-black">
                {selectedFleetImage.title}
              </h3>
              <p className="mt-1 font-bitter text-[9px] font-black uppercase tracking-[0.14em] text-green-700">
                {selectedFleetImage.capacity}
              </p>
              <p className="mt-3 max-w-2xl font-bitter text-md leading-relaxed text-black">
                {selectedFleetImage.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalsGallery;