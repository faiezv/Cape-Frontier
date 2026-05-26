import React, { useLayoutEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import vehicles from "../../data/vehicles.js";

gsap.registerPlugin(ScrollTrigger);

// ============================================================
// 1. VIDEO DATA
// ============================================================

const videos = [
  {
    id: 1,
    title: "Lovely day",
    location: "Seapoint, Cape Town",
    src: "/videos/video1.mp4",
    aspect: "portrait",
  },
  {
    id: 2,
    title: "Video 2",
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
];

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
      image: src,
      title: `Cape Frontier vehicle ${index + 1}`,
      description:
        "Comfortable Cape Frontier transport used for private and group tour operations.",
      capacity: "Tour vehicle",
    }));
  }

  const mappedVehicles = vehicles
    .map((vehicle, index) => ({
      id: vehicle?.id || vehicle?.slug || vehicle?.title || vehicle?.name || index,
      image: getVehicleImage(vehicle),
      title: getVehicleTitle(vehicle, index),
      description: getVehicleDescription(vehicle),
      capacity: getVehicleCapacity(vehicle),
    }))
    .filter((vehicle) => vehicle.image);

  return mappedVehicles.length
    ? mappedVehicles
    : fallbackFleetImages.map((src, index) => ({
        id: `fallback-${index}`,
        image: src,
        title: `Cape Frontier vehicle ${index + 1}`,
        description:
          "Comfortable Cape Frontier transport used for private and group tour operations.",
        capacity: "Tour vehicle",
      }));
};

// ============================================================
// 3. LAYOUT HELPERS
// ============================================================

const starPositions = {
  1: "md:absolute md:left-1/2 md:top-0 md:-translate-x-1/2 md:rotate-[-2deg]",
  2: "md:absolute md:left-8 md:top-24 md:rotate-[-7deg]",
  3: "md:absolute md:right-8 md:top-24 md:rotate-[7deg]",
  4: "md:absolute md:left-10 md:bottom-12 md:rotate-[4deg]",
  5: "md:absolute md:left-1/2 md:top-[53%] md:-translate-x-1/2 md:-translate-y-1/2 md:rotate-0",
  6: "md:absolute md:right-10 md:bottom-12 md:rotate-[-4deg]",
};

const getThumbSize = (aspect) => {
  if (aspect === "landscape") {
    return "w-40 h-28 sm:w-48 sm:h-32 md:w-44 md:h-30 lg:w-48 lg:h-32";
  }

  return "w-24 h-40 sm:w-28 sm:h-48 md:w-28 md:h-48 lg:w-30 lg:h-52";
};

const StarRating = ({ rating = 4.7 }) => {
  const rounded = Math.round(Number(rating) || 0);

  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
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
// 4. MAIN COMPONENT
// ============================================================

const GoalsGallery = () => {
  const [selectedVideo, setSelectedVideo] = useState(videos[0]);
  const [isGalleryManuallyPaused, setIsGalleryManuallyPaused] = useState(false);
  const [isGalleryInView, setIsGalleryInView] = useState(false);
  const [selectedFleetImage, setSelectedFleetImage] = useState(null);

  const isGalleryPaused = isGalleryManuallyPaused || !isGalleryInView;

  const fleetItems = useMemo(() => getFleetItems(), []);

  const galleryRef = useRef(null);
  const leftPanelRef = useRef(null);
  const rightPanelRef = useRef(null);
  const metaRef = useRef(null);
  const playerRef = useRef(null);
  const selectedVideoRef = useRef(null);
  const mobileSelectedVideoRef = useRef(null);
  const ratingRef = useRef(null);
  const fleetRefs = useRef([]);
  const thumbVideoRefs = useRef([]);
  const mobileThumbVideoRefs = useRef([]);
  const pauseButtonRef = useRef(null);

  // ============================================================
  // 5. GALLERY INTRO + DESKTOP MOTION
  // ============================================================

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(".gallery-title-word", {
        yPercent: 110,
        rotate: 3,
      });

      gsap.set(".video-star-card", {
        opacity: 0,
        y: 48,
        scale: 0.9,
        rotateX: 10,
        transformPerspective: 900,
      });

      gsap.set(".gallery-left-copy", {
        opacity: 0,
        y: 18,
      });

      gsap.set(".gallery-fleet-img", {
        opacity: 0,
        y: 18,
        scale: 0.94,
      });

      gsap.set(".gallery-pause-circle", {
        opacity: 0,
        scale: 0.88,
        xPercent: -50,
        yPercent: -50,
        transformOrigin: "center center",
      });

      gsap.set(rightPanelRef.current, {
        opacity: 0,
        y: 42,
        scale: 0.97,
      });

      const introTl = gsap.timeline({
        scrollTrigger: {
          trigger: galleryRef.current,
          start: "top 82%",
          once: true,
          invalidateOnRefresh: true,
        },
      });

      introTl
        .to(".gallery-title-word", {
          yPercent: 0,
          rotate: 0,
          duration: 1,
          stagger: 0.08,
          ease: "power4.out",
        })
        .to(
          ".gallery-left-copy",
          {
            opacity: 1,
            y: 0,
            duration: 0.65,
            stagger: 0.08,
            ease: "power3.out",
          },
          "<0.2"
        )
        .to(
          ".gallery-pause-circle",
          {
            opacity: 1,
            scale: 1,
            xPercent: -50,
            yPercent: -50,
            duration: 0.7,
            ease: "power3.out",
          },
          "<0.1"
        )
        .to(
          ".video-star-card",
          {
            opacity: 1,
            y: 0,
            scale: 1,
            rotateX: 0,
            duration: 0.82,
            stagger: {
              each: 0.07,
              from: "center",
            },
            ease: "back.out(1.3)",
          },
          "<0.05"
        )
        .to(
          rightPanelRef.current,
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.82,
            ease: "power3.out",
          },
          "<0.08"
        )
        .to(
          ".gallery-fleet-img",
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.5,
            stagger: 0.05,
            ease: "power3.out",
          },
          "<0.2"
        );

      gsap.fromTo(
        ".gallery-flair-pill",
        {
          opacity: 0,
          y: 14,
          scale: 0.94,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          stagger: 0.06,
          duration: 0.35,
          ease: "power3.out",
          scrollTrigger: {
            trigger: rightPanelRef.current,
            start: "top 86%",
            once: true,
          },
        }
      );

      gsap.fromTo(
        ".fleet-card",
        {
          opacity: 0,
          y: 22,
          scale: 0.98,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          stagger: 0.05,
          duration: 0.42,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".fleet-section",
            start: "top 88%",
            once: true,
          },
        }
      );

      ScrollTrigger.refresh();
    }, galleryRef);

    return () => ctx.revert();
  }, []);

  // ============================================================
  // 6. AUTO PLAY ON ENTER / AUTO PAUSE ON EXIT
  // ============================================================

  useLayoutEffect(() => {
    let frame = null;

    const updateVisibility = () => {
      frame = null;

      if (!galleryRef.current) return;

      const rect = galleryRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      const visiblePixels = Math.max(
        0,
        Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0)
      );

      // Works for tall sections too:
      // 50% means at least half of the visible viewport area the component can occupy is visible.
      const ratio = visiblePixels / Math.min(rect.height, viewportHeight);

      setIsGalleryInView(ratio >= 0.5);
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

  useLayoutEffect(() => {
    const mediaEls = [
      selectedVideoRef.current,
      mobileSelectedVideoRef.current,
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

    if (pauseButtonRef.current) {
      gsap.fromTo(
        pauseButtonRef.current,
        {
          scale: 0.96,
          xPercent: -50,
          yPercent: -50,
          boxShadow:
            "inset 0 0 58px rgba(0,0,0,0.55), 0 0 0px rgba(96,165,250,0)",
          borderColor: "rgba(255,255,255,0.06)",
        },
        {
          scale: 1,
          xPercent: -50,
          yPercent: -50,
          boxShadow:
            "inset 0 0 58px rgba(0,0,0,0.55), 0 0 32px rgba(96,165,250,0.24)",
          borderColor: "rgba(147,197,253,0.24)",
          duration: 0.32,
          ease: "power3.out",
          yoyo: true,
          repeat: 1,
        }
      );
    }
  }, [isGalleryPaused, selectedVideo]);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        [metaRef.current, playerRef.current],
        {
          opacity: 0,
          y: 18,
          scale: 0.98,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.38,
          stagger: 0.06,
          ease: "power3.out",
        }
      );

      gsap.fromTo(
        ratingRef.current,
        {
          opacity: 0,
          x: -12,
        },
        {
          opacity: 1,
          x: 0,
          duration: 0.3,
          ease: "power3.out",
        }
      );

      gsap.fromTo(
        ".active-video-thumb",
        {
          outlineColor: "rgba(187,247,208,0)",
        },
        {
          outlineColor: "rgba(187,247,208,0.9)",
          duration: 0.28,
          ease: "power2.out",
        }
      );
    }, galleryRef);

    return () => ctx.revert();
  }, [selectedVideo]);

  return (
    <div ref={galleryRef} className="relative w-full">
      {/* ============================================================
          SHARED GALLERY + FLEET TITLE
      ============================================================ */}
      <div className="mx-auto max-w-5xl px-0">
        <div className="rounded-t-[2rem] border border-black/5 bg-white/90 p-4 shadow-[0_16px_42px_rgba(15,23,42,0.07)] backdrop-blur-md sm:p-5 md:p-6">
          <div className="flex flex-col items-center ">
              <p className="font-bitter text-[10px] font-black uppercase tracking-[0.2em] text-green-700">
                Cape Frontier moments
              </p>

              <h2 className="font-frank text-4xl font-bold leading-none text-black sm:text-5xl">
                Gallery & Fleet
              </h2>
{/* 
              <p className="mt-2 max-w-2xl font-bitter text-sm leading-relaxed text-black/50">
                Watch real guest clips, then browse the vehicles used to support your Cape Town route.
              </p>
            */}
          </div>
        </div>
      </div>

      {/* ============================================================
          MAIN VIDEO GALLERY
      ============================================================ */}
      <div className="relative mx-auto flex h-fit w-full max-w-5xl flex-col items-center overflow-visible rounded-b-[2rem] bg-black/60 md:flex-row md:items-stretch md:overflow-hidden md:p-4 lg:p-5">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-10 top-10 h-72 w-72 rounded-full bg-green-200/15 blur-3xl" />
          <div className="absolute bottom-10 right-10 h-80 w-80 rounded-full bg-blue-300/15 blur-3xl" />
        </div>

        {/* ============================================================
            MOBILE PLAYER: STAYS VISIBLE WHILE BROWSING
        ============================================================ */}
        <div className="relative z-20 w-full p-3 md:hidden">
          <div className="text-center text-white">
            <p className="font-bitter text-sm text-white/55 max-w-[60%] mx-auto">
              Tap a clip below. The playing video stays visible while you browse.
            </p>
          </div>

          <div className="sticky top-[4.75rem] z-30 mt-4 overflow-hidden rounded-[1.65rem] border border-white/10 bg-black/80 p-3 shadow-[0_20px_55px_rgba(0,0,0,0.36)] backdrop-blur-xl">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-bitter text-[10px] font-bold uppercase tracking-[0.18em] text-green-200/80">
                  Now viewing
                </p>
                <p className="truncate font-frank text-2xl font-bold leading-none text-white">
                  {selectedVideo.title}
                </p>
                <p className="mt-1 truncate font-bitter text-xs text-white/45">
                  {selectedVideo.location || "Seapoint, Cape Town"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsGalleryManuallyPaused((prev) => !prev)}
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/10 bg-white/10 text-white/80"
                aria-label={
                  isGalleryPaused
                    ? "Play all gallery videos"
                    : "Pause all gallery videos"
                }
              >
                {isGalleryPaused ? (
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7 5h4v14H7zM13 5h4v14h-4z" />
                  </svg>
                )}
              </button>
            </div>

            <div className="relative flex max-h-[42dvh] min-h-[13rem] items-center justify-center overflow-hidden rounded-[1.25rem] bg-black/55">
              <video
                ref={mobileSelectedVideoRef}
                key={`mobile-${selectedVideo.id}`}
                src={selectedVideo.src}
                className={`h-full w-full object-contain ${
                  selectedVideo.aspect === "portrait"
                    ? "max-h-[42dvh]"
                    : "max-h-[34dvh]"
                }`}
                controls
                autoPlay={!isGalleryPaused}
                muted
                loop
                playsInline
              />
            </div>
          </div>

          <div className="mt-4 flex snap-x snap-mandatory gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {videos.map((video, index) => {
              const isSelected = selectedVideo.id === video.id;

              return (
                <button
                  key={video.id}
                  type="button"
                  onClick={() => setSelectedVideo(video)}
                  className={`relative h-24 min-w-[8.5rem] snap-center overflow-hidden rounded-2xl border outline outline-2 outline-offset-2 outline-transparent transition ${
                    isSelected
                      ? "active-video-thumb border-green-200/90 ring-2 ring-green-200/40"
                      : "border-white/10 opacity-75"
                  }`}
                >
                  <video
                    ref={(el) => (mobileThumbVideoRefs.current[index] = el)}
                    src={video.src}
                    className="h-full w-full object-cover"
                    muted
                    preload="metadata"
                    playsInline
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

                  <div className="absolute bottom-2 left-2 right-2 text-left">
                    <p className="truncate font-frank text-base font-bold leading-none text-white">
                      {video.title}
                    </p>

                    <p className="mt-0.5 truncate font-bitter text-[9px] font-black uppercase tracking-[0.12em] text-white/45">
                      {video.aspect}
                    </p>
                  </div>

                  {isSelected && (
                    <div className="absolute right-2 top-2 rounded-full bg-green-200 px-2 py-1 font-bitter text-[8px] font-black uppercase tracking-[0.12em] text-green-950">
                      Active
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ============================================================
            DESKTOP LEFT: COMPACT GALLERY
        ============================================================ */}
        <div
          ref={leftPanelRef}
          className="z-10 hidden h-fit w-full flex-col gap-20 items-center justify-center px-4 py-7 font-bitter md:flex md:w-[58%] md:px-4 lg:px-5"
        >
          <div className="flex h-full w-full flex-col items-center justify-center text-center text-white">
            <p className="gallery-left-copy max-w-md font-bitter text-sm font-bold uppercase tracking-[0.18em] text-green-200/80">
              Select a video to view
            </p>

            <p className="gallery-left-copy max-w-lg text-xs leading-relaxed text-white/42">
              Tap any frame to bring it into the main display.
            </p>
          </div>

          <div className="relative mt-6 flex min-h-fit w-full max-w-xl flex-wrap items-center justify-center gap-3 pb-7 md:h-[500px] md:pb-0">
            <button
              ref={pauseButtonRef}
              type="button"
              onClick={() => setIsGalleryManuallyPaused((prev) => !prev)}
              aria-label={
                isGalleryPaused
                  ? "Play all gallery videos"
                  : "Pause all gallery videos"
              }
              className="gallery-pause-circle absolute left-1/2 top-1/2 z-0 hidden h-60 w-60 place-items-center rounded-full bg-black/[0.34] shadow-[inset_0_0_58px_rgba(0,0,0,0.55)] backdrop-blur-[2px] transition-colors duration-500 hover:bg-black/[0.5] md:grid"
            >
              <span className="absolute inset-8 rounded-full bg-white/[0.018]" />

              <span className="relative grid h-20 w-20 place-items-center rounded-full bg-black/55 text-white/45 shadow-[0_0_34px_rgba(0,0,0,0.42)] transition-all duration-500 hover:text-blue-100/80">
                {isGalleryPaused ? (
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7 5h4v14H7zM13 5h4v14h-4z" />
                  </svg>
                )}

                <span className="absolute -bottom-7 whitespace-nowrap font-bitter text-[9px] font-bold uppercase tracking-[0.2em] text-white/30">
                  {isGalleryPaused ? "Play all" : "Pause all"}
                </span>
              </span>
            </button>

            {videos.map((video, index) => {
              const isSelected = selectedVideo.id === video.id;

              return (
                <button
                  key={video.id}
                  type="button"
                  onClick={() => setSelectedVideo(video)}
                  className={`video-star-card group relative z-10 cursor-pointer overflow-hidden rounded-2xl border outline outline-2 outline-offset-2 outline-transparent transition-all duration-300 hover:scale-105 hover:border-green-200/70 ${
                    starPositions[video.id]
                  } ${
                    isSelected
                      ? "active-video-thumb border-green-200/90 shadow-2xl shadow-green-200/20"
                      : "border-white/10 shadow-md shadow-black/30"
                  }`}
                >
                  <div
                    className={`relative ${getThumbSize(
                      video.aspect
                    )} overflow-hidden`}
                  >
                    <video
                      ref={(el) => (thumbVideoRefs.current[index] = el)}
                      src={video.src}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      muted
                      preload="metadata"
                      playsInline
                      onMouseEnter={(event) => {
                        if (!isGalleryPaused) {
                          event.currentTarget.play().catch(() => {});
                        }
                      }}
                      onMouseLeave={(event) => {
                        event.currentTarget.pause();
                        event.currentTarget.currentTime = 0;
                      }}
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

                    <div className="absolute bottom-2 left-2 right-2 text-left">
                      <p className="truncate font-frank text-base font-bold leading-none text-white">
                        {video.title}
                      </p>

                      <p className="mt-1 truncate font-bitter text-[9px] font-bold uppercase tracking-[0.12em] text-white/50">
                        {video.aspect}
                      </p>
                    </div>

                    {isSelected && (
                      <div className="absolute right-2 top-2 rounded-full bg-green-200 px-2 py-1 font-bitter text-[8px] font-bold uppercase tracking-[0.12em] text-green-950">
                        Active
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ============================================================
            DESKTOP RIGHT: CLEAN MAIN DISPLAY
        ============================================================ */}
        <div
          ref={rightPanelRef}
          className="z-10 hidden w-full flex-col justify-center self-stretch p-4 md:flex md:w-[42%] md:p-4 lg:p-5"
        >
          <div className="relative overflow-hidden rounded-[1.75rem] bg-white/[0.075] p-3 shadow-2xl shadow-black/20 backdrop-blur-md lg:p-4">
            <div className="pointer-events-none absolute -right-24 -top-24 h-52 w-52 rounded-full bg-green-200/16 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 left-0 h-48 w-48 rounded-full bg-blue-300/14 blur-3xl" />

            <div
              ref={playerRef}
              className="relative z-10 flex w-full items-center justify-center rounded-[1.2rem] bg-black/45 p-2 shadow-xl shadow-black/20"
            >
              <video
                ref={selectedVideoRef}
                key={selectedVideo.id}
                src={selectedVideo.src}
                className={`rounded-[0.95rem] object-contain shadow-2xl ${
                  selectedVideo.aspect === "portrait"
                    ? "max-h-[48vh] w-auto max-w-full"
                    : "max-h-[34vh] w-full"
                }`}
                controls
                autoPlay={!isGalleryPaused}
                muted
                loop
                playsInline
              />
            </div>

            <div ref={metaRef} className="relative z-10 mt-3 text-white">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-frank text-2xl font-bold leading-none lg:text-3xl">
                    {selectedVideo.title}
                  </p>

                  <div className="mt-2 flex min-w-0 items-center gap-1.5">
                    <img
                      src="/icons/mapPin.png"
                      className="h-4 w-4 shrink-0 object-contain opacity-80"
                      alt=""
                      aria-hidden="true"
                    />
                    <p className="truncate font-bitter text-xs font-semibold italic text-white/55">
                      {selectedVideo.location || "Seapoint, Cape Town"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsGalleryManuallyPaused((prev) => !prev)}
                  className="gallery-flair-pill grid h-9 w-9 shrink-0 place-items-center rounded-full bg-green-200 text-green-950"
                  aria-label={
                    isGalleryPaused
                      ? "Play gallery video"
                      : "Pause gallery video"
                  }
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

              <div ref={ratingRef} className="mt-3 flex items-center gap-2">
                <p className="font-frank text-xl font-bold leading-none">4.7</p>
                <StarRating rating={4.7} />
              </div>

              <p className="mt-3 rounded-[1rem] bg-black/18 px-3 py-2 font-bitter text-xs italic leading-relaxed text-white/62">
                “Amazing destination and guide! Must go again!”
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap gap-2 mt-4">
        <span className="rounded-full bg-green-200 px-3 py-2 font-bitter text-[10px] font-black uppercase tracking-[0.14em] text-green-950">
          Fleet ready
        </span>
      </div>

      {/* ============================================================
          SEPARATE FLEET SECTION
      ============================================================ */}
      <section className="fleet-section relative z-10 mx-auto mt-4 w-full max-w-5xl overflow-hidden rounded-[2rem] bg-black/60 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.08)] sm:p-5 lg:p-6">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-12 top-4 h-52 w-52 rounded-full bg-green-200/15 blur-3xl" />
          <div className="absolute -right-12 bottom-0 h-56 w-56 rounded-full bg-blue-300/15 blur-3xl" />
        </div>

        <div className="relative z-10 mb-4 flex items-end justify-between gap-3">
          <div>
            <p className="font-bitter text-[10px] font-black uppercase tracking-[0.2em] text-green-200">
              Vehicle visuals
            </p>
            <p className="mt-1 font-frank text-3xl font-bold leading-none text-white">
              See our fleet
            </p>
          </div>

          <p className="hidden max-w-sm text-right font-bitter text-sm leading-relaxed text-white/48 lg:block">
            Vehicles are matched to the route, group size, and operational needs
            of each booking.
          </p>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] lg:grid lg:grid-cols-5 lg:overflow-visible lg:pb-0 [&::-webkit-scrollbar]:hidden">
          {fleetItems.map((vehicle, index) => (
            <button
              key={vehicle.id}
              type="button"
              onClick={() => setSelectedFleetImage(vehicle)}
              className="fleet-card group relative z-10 min-w-[11rem] overflow-hidden rounded-[1.35rem] bg-white/[0.08] text-left transition duration-300 hover:-translate-y-1 hover:bg-white/[0.12] lg:min-w-0"
            >
              <div className="relative h-24 overflow-hidden rounded-[1.35rem]  lg:h-28">
                <img
                  ref={(el) => (fleetRefs.current[index] = el)}
                  src={vehicle.image}
                  className="gallery-fleet-img h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  alt={vehicle.title}
                  loading="lazy"
                  decoding="async"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                <div className="absolute bottom-2 left-2 rounded-full bg-white/90 px-2.5 py-1 font-bitter text-[9px] font-black uppercase tracking-[0.12em] text-black">
                  View image
                </div>
              </div>

              <div className="p-3">
                <p className="line-clamp-1 font-frank text-lg font-bold leading-none text-white">
                  {vehicle.title}
                </p>

                <p className="mt-1 font-bitter text-[10px] font-bold uppercase tracking-[0.12em] text-green-200">
                  {vehicle.capacity}
                </p>

                <p className="mt-2 hidden text-xs leading-relaxed text-white/45 lg:line-clamp-3">
                  {vehicle.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ============================================================
          FLEET IMAGE POPUP
      ============================================================ */}
      {selectedFleetImage && (
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/72 p-4 backdrop-blur-sm"
          onClick={() => setSelectedFleetImage(null)}
        >
          <div
            className="relative w-full max-w-4xl overflow-hidden rounded-[2rem] bg-white p-3 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedFleetImage(null)}
              className="absolute right-4 top-4 z-20 grid h-10 w-10 place-items-center rounded-full bg-black/70 text-white backdrop-blur-md"
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

            <div className="p-3">
              <p className="font-frank text-3xl font-bold leading-none text-black">
                {selectedFleetImage.title}
              </p>

              <p className="mt-1 font-bitter text-xs font-bold uppercase tracking-[0.14em] text-green-800">
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