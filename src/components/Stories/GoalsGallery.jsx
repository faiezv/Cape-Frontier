import React, { useLayoutEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import vehicles from "../../data/vehicles.js";
import { resolveImage } from "../../utils/ImageLoader.js";
import mapPinIcon from "/public/icons/mapPin.png";

gsap.registerPlugin(ScrollTrigger);

// ============================================================
// 1. VIDEO RESOLVER
// ============================================================

const videoModules = import.meta.glob(
  "/src/assets/videos/**/*.{mp4,webm,ogg}",
  {
    eager: true,
  }
);

const videoMap = {};

for (const fullPath in videoModules) {
  const filename = fullPath.split("/").pop();
  videoMap[filename] = videoModules[fullPath].default;
}

const resolveVideo = (path) => {
  if (!path) return "";

  const filename = path.split("/").pop();

  return videoMap[filename] || path;
};

// ============================================================
// 2. VIDEO DATA
// ============================================================

const videosRaw = [
  {
    id: 1,
    title: "Lovely day",
    location: "Seapoint, Cape Town",
    src: "/videos/video1.mp4",
    aspect: "portrait",
  },

    {
    id: 2,
    title: "Lovely day",
    location: "Seapoint, Cape Town",
    src: "/videos/video2.mp4",
    aspect: "portrait",
  },

  {
    id: 3,
    title: "Video 3",
    location: "Seapoint, Cape Town",
    src: "/videos/video3.mp4",
    aspect: "portrait",
  },

  {
    id: 4,
    title: "Cape Point Beach Haven For Tourists!",
    location: "Seapoint, Cape Town",
    src: "/videos/video4.mp4",
    aspect: "landscape",
  },

  {
    id: 5,
    title: "Video 5",
    location: "Seapoint, Cape Town",
    src: "/videos/video5.mp4",
    aspect: "portrait",
  },

  {
    id: 6,
    title: "Video 6",
    location: "Seapoint, Cape Town",
    src: "/videos/video6.mp4",
    aspect: "landscape",
  },

  // {
  //   id: 7,
  //   title: "Cobra Experience",
  //   location: "Cape Town",
  //   src: "/videos/tours/adrenaline/cobra/VID 5.mp4",
  //   aspect: "portrait",
  // },

  {
    id: 8,
    title: "Cobra Adventure",
    location: "Cape Town",
    src: "/videos/tours/adrenaline/cobra/Vid 1.mp4",
    aspect: "portrait",
  },

  {
    id: 9,
    title: "Cobra Thrill",
    location: "Cape Town",
    src: "/videos/tours/adrenaline/cobra/Vid 3.mp4",
    aspect: "portrait",
  },

  {
    id: 10,
    title: "Cobra Dash",
    location: "Cape Town",
    src: "/videos/tours/adrenaline/cobra/Vid 4.mp4",
    aspect: "landscape",
  },

  {
    id: 11,
    title: "Cobra Morning",
    location: "Cape Town",
    src: "/videos/tours/adrenaline/cobra/7.mp4",
    aspect: "portrait",
  },
];

const videos = videosRaw.map((video) => ({
  ...video,
  src: resolveVideo(video.src),
}));

// ============================================================
// 3. VEHICLE HELPERS
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
  if (typeof vehicle === "string") {
    return `Cape Frontier vehicle ${index + 1}`;
  }

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
  if (typeof vehicle === "string") {
    return "Tour vehicle";
  }

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
      id:
        vehicle?.id ||
        vehicle?.slug ||
        vehicle?.title ||
        vehicle?.name ||
        index,

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
// 4. STAR RATING
// ============================================================

const StarRating = ({ rating = 4.7 }) => {
  const rounded = Math.round(Number(rating) || 0);

  return (
    <div
      className="flex items-center gap-0.5"
      aria-label={`${rating} out of 5 stars`}
    >
      {Array.from({ length: 5 }).map((_, index) => (
        <svg
          key={index}
          className="h-3.5 w-3.5"
          viewBox="0 0 24 24"
          fill={index < rounded ? "#BBF7D0" : "none"}
          stroke="#BBF7D0"
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
// 5. MAIN COMPONENT
// ============================================================

const GoalsGallery = () => {
  const [selectedVideo, setSelectedVideo] = useState(videos[0]);
  const [isGalleryManuallyPaused, setIsGalleryManuallyPaused] =
    useState(false);
  const [isGalleryInView, setIsGalleryInView] = useState(false);
  const [selectedFleetImage, setSelectedFleetImage] = useState(null);

  const fleetItems = useMemo(() => getFleetItems(), []);

  const galleryRef = useRef(null);

  const playerRef = useRef(null);
  const mobilePlayerRef = useRef(null);

  const thumbVideoRefs = useRef([]);
  const mobileThumbVideoRefs = useRef([]);

  const previousVideoRef = useRef(selectedVideo);

  const isGalleryPaused =
    isGalleryManuallyPaused || !isGalleryInView;

  // ============================================================
  // GALLERY INTRO
  // ============================================================

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const introItems = gsap.utils.toArray(".gallery-intro-item");
      const galleryItems = gsap.utils.toArray(".gallery-item");
      const fleetCards = gsap.utils.toArray(".fleet-card");

      gsap.set([...introItems, ...galleryItems, ...fleetCards], {
        opacity: 0,
        y: 18,
      });

      const introTl = gsap.timeline({
        scrollTrigger: {
          trigger: galleryRef.current,
          start: "top 84%",
          once: true,
          invalidateOnRefresh: true,
        },
      });

      introTl
        .to(introItems, {
          opacity: 1,
          y: 0,
          duration: 0.42,
          stagger: 0.045,
          ease: "power3.out",
        })
        .to(
          galleryItems,
          {
            opacity: 1,
            y: 0,
            duration: 0.42,
            stagger: 0.035,
            ease: "power3.out",
          },
          "-=0.2"
        )
        .to(
          fleetCards,
          {
            opacity: 1,
            y: 0,
            duration: 0.38,
            stagger: 0.04,
            ease: "power3.out",
          },
          "-=0.12"
        );
    }, galleryRef);

    return () => ctx.revert();
  }, []);

  // ============================================================
  // DETECT GALLERY VISIBILITY
  // ============================================================

  useLayoutEffect(() => {
    let frame = null;

    const updateVisibility = () => {
      frame = null;

      if (!galleryRef.current) return;

      const rect = galleryRef.current.getBoundingClientRect();

      const viewportHeight =
        window.innerHeight ||
        document.documentElement.clientHeight;

      const visiblePixels = Math.max(
        0,
        Math.min(rect.bottom, viewportHeight) -
          Math.max(rect.top, 0)
      );

      const ratio =
        visiblePixels /
        Math.min(rect.height, viewportHeight);

      setIsGalleryInView(ratio >= 0.45);
    };

    const requestUpdate = () => {
      if (frame) return;

      frame = window.requestAnimationFrame(updateVisibility);
    };

    updateVisibility();

    window.addEventListener("scroll", requestUpdate, {
      passive: true,
    });

    window.addEventListener("resize", requestUpdate);

    window.addEventListener(
      "orientationchange",
      requestUpdate
    );

    return () => {
      if (frame) {
        window.cancelAnimationFrame(frame);
      }

      window.removeEventListener(
        "scroll",
        requestUpdate
      );

      window.removeEventListener(
        "resize",
        requestUpdate
      );

      window.removeEventListener(
        "orientationchange",
        requestUpdate
      );
    };
  }, []);

  // ============================================================
  // PLAY / PAUSE MAIN VIDEO
  // ============================================================

  useLayoutEffect(() => {
    const mediaEls = [
      playerRef.current,
      mobilePlayerRef.current,
    ].filter(Boolean);

    mediaEls.forEach((video) => {
      if (isGalleryPaused) {
        video.pause();
      } else {
        const playPromise = video.play();

        if (playPromise?.catch) {
          playPromise.catch(() => {});
        }
      }
    });
  }, [isGalleryPaused, selectedVideo]);

  // ============================================================
  // SELECTED VIDEO TRANSITION
  // ============================================================

  useLayoutEffect(() => {
    if (
      previousVideoRef.current?.id === selectedVideo.id
    ) {
      return;
    }

    previousVideoRef.current = selectedVideo;

    const players = [
      playerRef.current,
      mobilePlayerRef.current,
    ].filter(Boolean);

    players.forEach((player) => {
      gsap.fromTo(
        player,
        {
          opacity: 0,
          y: 10,
          scale: 0.985,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.28,
          ease: "power2.out",
        }
      );
    });

    const activeThumbs =
      galleryRef.current?.querySelectorAll(
        ".active-video-thumb"
      );

    if (activeThumbs?.length) {
      gsap.fromTo(
        activeThumbs,
        {
          scale: 0.97,
        },
        {
          scale: 1,
          duration: 0.25,
          ease: "power2.out",
        }
      );
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
      // Ignore unloaded media.
    }
  };

  // ============================================================
  // SELECT VIDEO
  // ============================================================

  const selectVideo = (video) => {
    if (video.id === selectedVideo.id) return;

    setSelectedVideo(video);
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div
      ref={galleryRef}
      className="relative w-full"
    >
      {/* ========================================================
          HEADER
      ======================================================== */}
      <header className="gallery-intro-item mx-auto w-full max-w-6xl overflow-hidden rounded-t-[2rem] border border-b-0 border-black/[0.06] bg-white/95 px-5 py-6 shadow-[0_12px_40px_rgba(15,23,42,0.06)] backdrop-blur-md sm:px-7 sm:py-7">
        <div className="relative flex flex-col items-center text-center">
          <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-green-200/20 blur-3xl" />

          <p className="relative font-bitter text-[10px] font-black uppercase tracking-[0.22em] text-green-700">
            Cape Frontier moments
          </p>

          <h2 className="relative mt-2 font-frank text-4xl font-bold leading-[0.9] tracking-tight text-black sm:text-5xl md:text-6xl">
            Gallery & Fleet
          </h2>

          <p className="relative mt-3 max-w-xl font-bitter text-xs leading-relaxed text-black/45 sm:text-sm">
            A glimpse into the places, experiences and
            vehicles behind Cape Frontier.
          </p>
        </div>
      </header>

      {/* ========================================================
          MAIN GALLERY
      ======================================================== */}

      <section className="relative mx-auto w-full max-w-6xl overflow-hidden rounded-b-[2rem] bg-[#090909] p-3 shadow-[0_22px_60px_rgba(15,23,42,0.16)] sm:p-4 lg:p-5">
        {/* Subtle background atmosphere */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-32 top-20 h-72 w-72 rounded-full bg-green-300/[0.08] blur-3xl" />

          <div className="absolute -bottom-32 right-0 h-80 w-80 rounded-full bg-blue-300/[0.07] blur-3xl" />
        </div>

        {/* ======================================================
            DESKTOP
        ====================================================== */}

        <div className="relative z-10 hidden gap-4 md:grid md:grid-cols-[1.15fr_0.85fr] lg:gap-5">
          {/* ====================================================
              LEFT — VIDEO MOSAIC
          ==================================================== */}

          <div className="gallery-item min-w-0 rounded-[1.6rem] border border-white/[0.07] bg-white/[0.025] p-4 lg:p-5">
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <p className="font-bitter text-[10px] font-black uppercase tracking-[0.18em] text-green-200/70">
                  Explore the moments
                </p>

                <h3 className="mt-1 font-frank text-2xl font-bold leading-none text-white lg:text-3xl">
                  Recent experiences
                </h3>
              </div>

              <p className="hidden max-w-[13rem] text-right font-bitter text-[10px] leading-relaxed text-white/30 lg:block">
                Select a frame to bring the experience
                into focus.
              </p>
            </div>

            <div className="grid grid-cols-4 auto-rows-[5.8rem] gap-2.5 lg:auto-rows-[6.5rem]">
              {videos.map((video, index) => {
                const isSelected =
                  selectedVideo.id === video.id;

                /*
                 * Editorial grid:
                 * first item gets more visual weight,
                 * landscape clips get wider placement.
                 */
                const placement =
                  index === 0
                    ? "col-span-2 row-span-2"
                    : index === 1
                    ? "col-span-1 row-span-2"
                    : video.aspect === "landscape"
                    ? "col-span-2"
                    : "col-span-1";

                return (
                  <button
                    key={video.id}
                    type="button"
                    onClick={() => selectVideo(video)}
                    className={`gallery-item group relative min-h-0 overflow-hidden rounded-[1rem] border text-left transition-[transform,border-color,opacity] duration-300 ${placement} ${
                      isSelected
                        ? "active-video-thumb border-green-200/90 shadow-[0_0_0_1px_rgba(187,247,208,0.18),0_12px_30px_rgba(0,0,0,0.35)]"
                        : "border-white/[0.08] hover:-translate-y-0.5 hover:border-white/20"
                    }`}
                  >
                    <video
                      ref={(el) => {
                        thumbVideoRefs.current[index] = el;
                      }}
                      src={video.src}
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.045]"
                      muted
                      preload="metadata"
                      playsInline
                      onMouseEnter={handleThumbEnter}
                      onMouseLeave={handleThumbLeave}
                    />

                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

                    {/* Active indicator */}
                    {isSelected && (
                      <div className="absolute left-2.5 top-2.5 flex items-center gap-1.5 rounded-full bg-green-200 px-2.5 py-1.5 font-bitter text-[8px] font-black uppercase tracking-[0.12em] text-green-950">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-700" />
                        Active
                      </div>
                    )}

                    <div className="absolute bottom-2.5 left-2.5 right-2.5">
                      <p className="truncate font-frank text-sm font-bold leading-none text-white lg:text-base">
                        {video.title}
                      </p>

                      <p className="mt-1 truncate font-bitter text-[8px] font-bold uppercase tracking-[0.12em] text-white/45">
                        {video.aspect}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ====================================================
              RIGHT — SELECTED VIDEO
          ==================================================== */}

          <div className="gallery-item min-w-0">
            <div className="flex h-full flex-col overflow-hidden rounded-[1.6rem] border border-white/[0.07] bg-white/[0.035] p-3 shadow-2xl shadow-black/20 lg:p-4">
              {/* Top label */}
              <div className="mb-3 flex items-center justify-between gap-3 px-1">
                <div>
                  <p className="font-bitter text-[9px] font-black uppercase tracking-[0.18em] text-green-200/70">
                    Now viewing
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setIsGalleryManuallyPaused(
                      (prev) => !prev
                    )
                  }
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/10 bg-white/[0.07] text-white/70 transition hover:border-green-200/40 hover:bg-green-200 hover:text-green-950"
                  aria-label={
                    isGalleryPaused
                      ? "Play gallery video"
                      : "Pause gallery video"
                  }
                >
                  {isGalleryPaused ? (
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  ) : (
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M7 5h4v14H7zM13 5h4v14h-4z" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Main video */}
              <div
                className={`relative flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-[1.25rem] bg-black/60 ${
                  selectedVideo.aspect === "portrait"
                    ? "min-h-[27rem]"
                    : "min-h-[20rem]"
                }`}
              >
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.04),transparent_60%)]" />

                <video
                  ref={playerRef}
                  key={`desktop-${selectedVideo.id}`}
                  src={selectedVideo.src}
                  className={`relative z-10 max-h-[54vh] rounded-[0.9rem] object-contain shadow-2xl ${
                    selectedVideo.aspect === "portrait"
                      ? "h-full w-auto max-w-full"
                      : "h-auto w-full"
                  }`}
                  controls
                  autoPlay={!isGalleryPaused}
                  muted
                  loop
                  playsInline
                />
              </div>

              {/* Metadata */}
              <div className="mt-4 px-1 pb-1 text-white">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="font-frank text-2xl font-bold leading-[0.95] lg:text-3xl">
                      {selectedVideo.title}
                    </h3>

                    <div className="mt-2 flex items-center gap-1.5">
                      <img
                        src={mapPinIcon}
                        className="h-3.5 w-3.5 shrink-0 object-contain opacity-70"
                        alt=""
                        aria-hidden="true"
                      />

                      <p className="truncate font-bitter text-[11px] font-semibold italic text-white/45">
                        {selectedVideo.location ||
                          "Seapoint, Cape Town"}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <span className="font-frank text-xl font-bold">
                      4.7
                    </span>

                    <StarRating rating={4.7} />
                  </div>
                </div>

                <p className="mt-3 border-l border-green-200/30 pl-3 font-bitter text-[11px] italic leading-relaxed text-white/45">
                  “Amazing destination and guide! Must
                  go again!”
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================
            MOBILE
        ====================================================== */}

        <div className="relative z-10 md:hidden">
          {/* Intro */}
          <div className="gallery-item mb-4 px-1 pt-2 text-center">
            <p className="font-bitter text-[9px] font-black uppercase tracking-[0.2em] text-green-200/70">
              Explore the moments
            </p>

            <p className="mt-1 font-bitter text-xs leading-relaxed text-white/35">
              Tap a clip to bring it into focus.
            </p>
          </div>

          {/* Main player */}
          <div className="gallery-item overflow-hidden rounded-[1.45rem] border border-white/[0.08] bg-white/[0.035] p-2.5 shadow-2xl shadow-black/30">
            <div className="mb-3 flex items-center justify-between gap-3 px-1">
              <div className="min-w-0">
                <p className="font-bitter text-[8px] font-black uppercase tracking-[0.18em] text-green-200/70">
                  Now viewing
                </p>

                <h3 className="truncate font-frank text-xl font-bold leading-none text-white">
                  {selectedVideo.title}
                </h3>
              </div>

              <button
                type="button"
                onClick={() =>
                  setIsGalleryManuallyPaused(
                    (prev) => !prev
                  )
                }
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/10 bg-white/[0.08] text-white/80"
                aria-label={
                  isGalleryPaused
                    ? "Play gallery video"
                    : "Pause gallery video"
                }
              >
                {isGalleryPaused ? (
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                ) : (
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M7 5h4v14H7zM13 5h4v14h-4z" />
                  </svg>
                )}
              </button>
            </div>

            <div className="relative flex min-h-[17rem] items-center justify-center overflow-hidden rounded-[1.15rem] bg-black/60">
              <video
                ref={mobilePlayerRef}
                key={`mobile-${selectedVideo.id}`}
                src={selectedVideo.src}
                className={`w-full rounded-[0.9rem] object-contain ${
                  selectedVideo.aspect === "portrait"
                    ? "max-h-[54dvh]"
                    : "max-h-[38dvh]"
                }`}
                controls
                autoPlay={!isGalleryPaused}
                muted
                loop
                playsInline
              />
            </div>

            <div className="px-1 pb-1 pt-3">
              <div className="flex items-center gap-2">
                <img
                  src={mapPinIcon}
                  className="h-3.5 w-3.5 shrink-0 object-contain opacity-60"
                  alt=""
                  aria-hidden="true"
                />

                <p className="truncate font-bitter text-[10px] font-semibold italic text-white/40">
                  {selectedVideo.location ||
                    "Seapoint, Cape Town"}
                </p>
              </div>

              <div className="mt-2 flex items-center gap-2">
                <span className="font-frank text-lg font-bold text-white">
                  4.7
                </span>

                <StarRating rating={4.7} />
              </div>
            </div>
          </div>

          {/* Mobile thumbnails */}
          <div className="gallery-item mt-3">
            <div className="flex snap-x snap-mandatory gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {videos.map((video, index) => {
                const isSelected =
                  selectedVideo.id === video.id;

                return (
                  <button
                    key={video.id}
                    type="button"
                    onClick={() => selectVideo(video)}
                    className={`group relative h-[6.2rem] min-w-[8.5rem] snap-start overflow-hidden rounded-[1rem] border transition ${
                      isSelected
                        ? "active-video-thumb border-green-200/90 shadow-[0_0_0_1px_rgba(187,247,208,0.18)]"
                        : "border-white/10 opacity-65"
                    }`}
                  >
                    <video
                      ref={(el) => {
                        mobileThumbVideoRefs.current[index] =
                          el;
                      }}
                      src={video.src}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      muted
                      preload="metadata"
                      playsInline
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                    {isSelected && (
                      <span className="absolute left-2 top-2 h-1.5 w-1.5 rounded-full bg-green-200 shadow-[0_0_10px_rgba(187,247,208,0.8)]" />
                    )}

                    <div className="absolute bottom-2 left-2 right-2 text-left">
                      <p className="truncate font-frank text-sm font-bold leading-none text-white">
                        {video.title}
                      </p>

                      <p className="mt-1 truncate font-bitter text-[8px] font-black uppercase tracking-[0.12em] text-white/45">
                        {video.aspect}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          STATUS PILL
      ======================================================== */}

      <div className="mx-auto mt-3 flex w-full max-w-6xl px-1">
        <span className="rounded-full bg-green-200 px-3 py-1.5 font-bitter text-[9px] font-black uppercase tracking-[0.14em] text-green-950">
          Fleet ready
        </span>
      </div>

      {/* ========================================================
          FLEET
      ======================================================== */}

      <section className="fleet-section relative z-10 mx-auto mt-3 w-full max-w-6xl overflow-hidden rounded-[2rem] bg-[#090909] p-4 shadow-[0_18px_45px_rgba(15,23,42,0.12)] sm:p-5 lg:p-6">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 top-0 h-64 w-64 rounded-full bg-green-200/[0.07] blur-3xl" />

          <div className="absolute -bottom-24 right-0 h-64 w-64 rounded-full bg-blue-300/[0.06] blur-3xl" />
        </div>

        <div className="relative z-10 mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="font-bitter text-[9px] font-black uppercase tracking-[0.2em] text-green-200/70">
              Vehicle visuals
            </p>

            <h3 className="mt-1 font-frank text-3xl font-bold leading-none text-white">
              See our fleet
            </h3>
          </div>

          <p className="hidden max-w-sm text-right font-bitter text-xs leading-relaxed text-white/30 lg:block">
            Vehicles are matched to the route, group size,
            and operational needs of each booking.
          </p>
        </div>

        <div className="relative z-10 flex gap-2.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] lg:grid lg:grid-cols-5 lg:overflow-visible [&::-webkit-scrollbar]:hidden">
          {fleetItems.map((vehicle, index) => (
            <button
              key={vehicle.id}
              type="button"
              onClick={() =>
                setSelectedFleetImage(vehicle)
              }
              className="fleet-card group relative min-w-[10.5rem] overflow-hidden rounded-[1.2rem] border border-white/[0.07] bg-white/[0.035] text-left transition duration-300 hover:-translate-y-1 hover:border-white/15 hover:bg-white/[0.06] lg:min-w-0"
            >
              <div className="relative h-28 overflow-hidden lg:h-32">
                <img
                  src={vehicle.image}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  alt={vehicle.title}
                  loading="lazy"
                  decoding="async"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />

                <div className="absolute bottom-2 left-2">
                  <span className="rounded-full bg-white/90 px-2 py-1 font-bitter text-[7px] font-black uppercase tracking-[0.12em] text-black">
                    View
                  </span>
                </div>
              </div>

              <div className="p-3">
                <p className="truncate font-frank text-base font-bold leading-none text-white">
                  {vehicle.title}
                </p>

                <p className="mt-1 font-bitter text-[8px] font-black uppercase tracking-[0.12em] text-green-200/80">
                  {vehicle.capacity}
                </p>

                <p className="mt-2 hidden line-clamp-2 font-bitter text-[10px] leading-relaxed text-white/35 lg:block">
                  {vehicle.description}
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
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md"
          onClick={() => setSelectedFleetImage(null)}
        >
          <div
            className="relative w-full max-w-4xl overflow-hidden rounded-[2rem] bg-white p-2 shadow-2xl sm:p-3"
            onClick={(event) =>
              event.stopPropagation()
            }
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

              <p className="mt-1 font-bitter text-[9px] font-black uppercase tracking-[0.14em] text-green-800">
                {selectedFleetImage.capacity}
              </p>

              <p className="mt-3 max-w-2xl font-bitter text-sm leading-relaxed text-black/55">
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