import React, { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

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

const fleetImages = [
  "/images/content/vehicles/1.webp",
  "/images/content/vehicles/2.webp",
  "/images/content/vehicles/3.webp",
  "/images/content/vehicles/4.webp",
  "/images/content/vehicles/5.webp",
];

const starPositions = {
  1: "md:absolute md:left-1/2 md:top-0 md:-translate-x-1/2 md:rotate-[-2deg]",
  2: "md:absolute md:left-4 md:top-28 md:rotate-[-8deg]",
  3: "md:absolute md:right-4 md:top-28 md:rotate-[8deg]",
  4: "md:absolute md:left-8 md:bottom-16 md:rotate-[5deg]",
  5: "md:absolute md:left-1/2 md:top-[52%] md:-translate-x-1/2 md:-translate-y-1/2 md:rotate-0",
  6: "md:absolute md:right-8 md:bottom-16 md:rotate-[-5deg]",
};

const getThumbSize = (aspect) => {
  if (aspect === "landscape") {
    return "w-40 h-28 sm:w-48 sm:h-32 md:w-52 md:h-36";
  }

  return "w-24 h-40 sm:w-28 sm:h-48 md:w-32 md:h-56";
};

const GoalsGallery = () => {
  const [selectedVideo, setSelectedVideo] = useState(videos[0]);
  const [isGalleryPaused, setIsGalleryPaused] = useState(false);

  const galleryRef = useRef(null);
  const leftPanelRef = useRef(null);
  const rightPanelRef = useRef(null);
  const metaRef = useRef(null);
  const playerRef = useRef(null);
  const selectedVideoRef = useRef(null);
  const ratingRef = useRef(null);
  const fleetRefs = useRef([]);
  const thumbVideoRefs = useRef([]);
  const pauseButtonRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(".gallery-title-word", {
        yPercent: 110,
        rotate: 3,
      });

      gsap.set(".video-star-card", {
        opacity: 0,
        y: 70,
        scale: 0.88,
        rotateX: 12,
        transformPerspective: 900,
      });

      gsap.set(".gallery-left-copy", {
        opacity: 0,
        y: 24,
      });

      gsap.set(".gallery-fleet-img", {
        opacity: 0,
        y: 24,
        scale: 0.9,
      });

      gsap.set(".gallery-pause-circle", {
        opacity: 0,
        scale: 0.86,
        xPercent: -50,
        yPercent: -50,
        transformOrigin: "center center",
      });

      gsap.set(rightPanelRef.current, {
        opacity: 0,
        y: 60,
        scale: 0.96,
      });

      const introTl = gsap.timeline({
        scrollTrigger: {
          trigger: galleryRef.current,
          start: "top 78%",
          end: "top 30%",
          scrub: 1.15,
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
            duration: 0.7,
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
            duration: 0.8,
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
            duration: 1,
            stagger: {
              each: 0.08,
              from: "center",
            },
            ease: "back.out(1.45)",
          },
          "<0.05"
        )
        .to(
          ".gallery-fleet-img",
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.65,
            stagger: 0.06,
            ease: "back.out(1.5)",
          },
          "<0.25"
        )
        .to(
          rightPanelRef.current,
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1,
            ease: "power3.out",
          },
          "<0.1"
        );

      gsap.to(".video-star-card", {
        y: (i) => (i % 2 === 0 ? -18 : 18),
        ease: "none",
        scrollTrigger: {
          trigger: leftPanelRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1.4,
        },
      });

      gsap.fromTo(
        ".gallery-flair-pill",
        {
          opacity: 0,
          y: 18,
          scale: 0.92,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          stagger: 0.08,
          ease: "back.out(1.6)",
          scrollTrigger: {
            trigger: rightPanelRef.current,
            start: "top 82%",
            end: "top 45%",
            scrub: 1,
          },
        }
      );

      ScrollTrigger.refresh();
    }, galleryRef);

    return () => ctx.revert();
  }, []);

  useLayoutEffect(() => {
    const mediaEls = [
      ...thumbVideoRefs.current.filter(Boolean),
      selectedVideoRef.current,
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
            "inset 0 0 80px rgba(0,0,0,0.65), 0 0 0px rgba(96,165,250,0)",
          borderColor: "rgba(255,255,255,0.06)",
        },
        {
          scale: 1,
          xPercent: -50,
          yPercent: -50,
          boxShadow:
            "inset 0 0 80px rgba(0,0,0,0.65), 0 0 42px rgba(96,165,250,0.28)",
          borderColor: "rgba(147,197,253,0.28)",
          duration: 0.38,
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
          y: 24,
          scale: 0.97,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.45,
          stagger: 0.08,
          ease: "power3.out",
        }
      );

      gsap.fromTo(
        ratingRef.current,
        {
          opacity: 0,
          x: -14,
        },
        {
          opacity: 1,
          x: 0,
          duration: 0.35,
          ease: "power3.out",
        }
      );

      gsap.fromTo(
        ".active-video-thumb",
        {
          boxShadow: "0 0 0px rgba(187, 247, 208, 0)",
        },
        {
          boxShadow: "0 0 34px rgba(187, 247, 208, 0.45)",
          duration: 0.45,
          ease: "power3.out",
        }
      );
    }, galleryRef);

    return () => ctx.revert();
  }, [selectedVideo]);

  return (
    <div
      ref={galleryRef}
      className="relative flex h-fit flex-col items-center overflow-hidden rounded-4xl bg-black/60 md:flex-row"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-10 top-10 h-72 w-72 rounded-full bg-green-200/15 blur-3xl" />
        <div className="absolute bottom-10 right-10 h-80 w-80 rounded-full bg-blue-300/15 blur-3xl" />
      </div>

      {/* Left half – Gallery */}
      <div
        ref={leftPanelRef}
        className="z-10 flex h-fit w-full flex-col items-center justify-center px-4 py-10 font-bitter md:w-2/3 md:px-6"
      >
        {/* Gallery header */}
        <div className="flex h-full w-full flex-col items-center justify-center text-center text-white">
          <div className="overflow-hidden">
            <p className="gallery-title-word inline-block font-frank text-6xl font-bold leading-none md:text-7xl">
              GALLERY
            </p>
          </div>

          <p className="gallery-left-copy mt-3 max-w-md text-xl font-bitter opacity-75">
            Select a video to view
          </p>

          <p className="gallery-left-copy mt-2 max-w-lg text-sm leading-relaxed text-white/45">
            Guest clips arranged like a star map of Cape Town moments. Tap any
            frame to bring it into focus.
          </p>
        </div>

        {/* Star video selector */}
        <div className="relative mt-8 flex min-h-fit w-full max-w-2xl flex-wrap items-center justify-center gap-3 pb-10 md:h-[620px] md:pb-0">
          <button
            ref={pauseButtonRef}
            type="button"
            onClick={() => setIsGalleryPaused((prev) => !prev)}
            aria-label={
              isGalleryPaused
                ? "Play all gallery videos"
                : "Pause all gallery videos"
            }
            className="gallery-pause-circle absolute left-1/2 top-1/2 z-0 hidden h-72 w-72 place-items-center rounded-full border border-white/[0.06] bg-black/[0.42] shadow-[inset_0_0_80px_rgba(0,0,0,0.65)] backdrop-blur-[2px] transition-colors duration-500 hover:border-blue-300/20 hover:bg-black/[0.55] md:grid"
          >
            <span className="absolute inset-8 rounded-full border border-white/[0.04] bg-white/[0.015]" />

            <span className="relative grid h-24 w-24 place-items-center rounded-full border border-white/[0.08] bg-black/55 text-white/45 shadow-[0_0_40px_rgba(0,0,0,0.45)] transition-all duration-500 hover:text-blue-100/80">
              {isGalleryPaused ? (
                <svg
                  className="h-7 w-7"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              ) : (
                <svg
                  className="h-7 w-7"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M7 5h4v14H7zM13 5h4v14h-4z" />
                </svg>
              )}

              <span className="absolute -bottom-7 whitespace-nowrap text-[9px] font-bold uppercase tracking-[0.22em] text-white/30">
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
                className={`video-star-card group relative z-10 cursor-pointer overflow-hidden rounded-2xl border transition-all duration-300 hover:scale-105 hover:border-green-200/70 hover:shadow-2xl hover:shadow-green-200/10 ${
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
                    autoPlay={!isGalleryPaused}
                    loop
                    playsInline
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

                  <div className="absolute bottom-2 left-2 right-2 text-left">
                    <p className="truncate font-frank text-lg font-bold leading-none text-white">
                      {video.title}
                    </p>

                    <p className="mt-1 truncate text-[10px] font-bold uppercase tracking-[0.12em] text-white/50">
                      {video.aspect}
                    </p>
                  </div>

                  {isSelected && (
                    <div className="absolute right-2 top-2 rounded-full bg-green-200 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-green-950">
                      Active
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Images gallery */}
        <div className="w-full max-w-2xl px-2 text-xl font-bold text-white/50">
          See our fleet
        </div>

        <div className="images mt-3 flex w-full max-w-2xl items-stretch justify-center gap-2">
          {fleetImages.map((src, index) => (
            <img
              key={src}
              ref={(el) => (fleetRefs.current[index] = el)}
              src={src}
              className="gallery-fleet-img h-20 flex-1 rounded-xl border border-white/10 object-cover shadow-lg shadow-black/25 transition-all duration-300 hover:h-24 hover:border-green-200/70"
              alt={`Cape Frontier fleet ${index + 1}`}
              loading="lazy"
            />
          ))}
        </div>
      </div>

      {/* Right half – Selected video player */}
      <div
        ref={rightPanelRef}
        className="z-10 flex w-full flex-col justify-center self-stretch p-4 md:w-1/3 md:p-5"
      >
        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.08] p-4 shadow-2xl shadow-black/30 backdrop-blur-md md:p-5">
          <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-green-200/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 left-6 h-48 w-48 rounded-full bg-blue-300/20 blur-3xl" />

          <div ref={metaRef} className="relative z-10 text-white">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="gallery-flair-pill rounded-full border border-white/10 bg-white/10 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white/70">
                Now viewing
              </div>

              <div className="gallery-flair-pill rounded-full bg-green-200 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-green-950">
                Guest clip
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/10">
                <img src="/icons/mapPin.png" className="h-6" alt="" />
              </div>

              <div className="min-w-0">
                <p className="font-frank text-3xl font-bold leading-none md:text-4xl">
                  {selectedVideo.title}
                </p>

                <p className="mt-2 font-bitter text-sm font-semibold italic text-white/55">
                  {selectedVideo.location || "Seapoint, Cape Town"}
                </p>
              </div>
            </div>

            <div
              ref={ratingRef}
              className="mt-5 flex flex-wrap items-center gap-3"
            >
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/25 px-4 py-2">
                <p className="font-frank text-2xl font-bold leading-none">
                  4.7
                </p>
                <img src="/icons/5stars.png" className="h-8" alt="5 stars" />
              </div>

              <div className="rounded-full border border-white/10 bg-white/10 px-4 py-2 font-bitter text-xs font-bold text-white/65">
                Cape Town experience
              </div>
            </div>

            <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
              <p className="font-bitter text-sm italic leading-relaxed text-white/70">
                “Amazing destination and guide! Must go again!”
              </p>
            </div>
          </div>

          <div
            ref={playerRef}
            className="relative z-10 mt-5 flex w-full items-center justify-center rounded-[1.5rem] border border-white/10 bg-black/35 p-3 shadow-xl shadow-black/30"
          >
            <video
              ref={selectedVideoRef}
              key={selectedVideo.id}
              src={selectedVideo.src}
              className={`rounded-[1.1rem] object-contain shadow-2xl ${
                selectedVideo.aspect === "portrait"
                  ? "max-h-[62vh] w-auto max-w-full"
                  : "max-h-[46vh] w-full"
              }`}
              controls
              autoPlay={!isGalleryPaused}
              muted
              loop
              playsInline
            />
          </div>

          <div className="relative z-10 mt-4 grid grid-cols-3 gap-2">
            <div className="gallery-flair-pill rounded-2xl border border-white/10 bg-white/[0.08] p-3 text-center">
              <p className="font-frank text-xl font-bold leading-none text-white">
                HD
              </p>
              <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.14em] text-white/40">
                Clips
              </p>
            </div>

            <div className="gallery-flair-pill rounded-2xl border border-white/10 bg-white/[0.08] p-3 text-center">
              <p className="font-frank text-xl font-bold leading-none text-white">
                6
              </p>
              <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.14em] text-white/40">
                Videos
              </p>
            </div>

            <div className="gallery-flair-pill rounded-2xl border border-green-200/30 bg-green-200/15 p-3 text-center">
              <p className="font-frank text-xl font-bold leading-none text-green-100">
                Fleet
              </p>
              <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.14em] text-green-100/50">
                Ready
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoalsGallery;