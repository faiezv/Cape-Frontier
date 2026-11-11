import React, { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Gallery from "../Stories/Gallery"; // Adjust the import path as needed

// Import the image resolver and vehicle data
import { resolveTourImage } from "../../utils/ImageLoader";
import { vehicles } from "../../data/vehicles"; // adjust path as needed

gsap.registerPlugin(ScrollTrigger);

// ----- Data (icons are public URLs) -----
const chips = [
  { title: "Save more as a group!", isNew: false },
  { title: "Hiking Trails", isNew: true },
  { title: "Historical Locations", isNew: true },
];

const differenceCards = [
  {
    icon: "/icons/5stars.png",
    title: "Top Tier Service",
    desc: "Premium planning, clear communication, and a guided experience that feels organised before you even leave your accommodation.",
  },
  {
    icon: "/icons/group.png",
    title: "Local Expertise",
    desc: "Cape Town routes are shaped around timing, viewpoints, pickup flow, and the local details that make each stop feel meaningful.",
  },
  {
    icon: "/icons/global.png",
    title: "High Availability",
    desc: "On-demand vehicle planning gives Cape Frontier more flexibility to support bookings without relying on one fixed vehicle setup.",
  },
];

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
const FleetCard = memo(({ vehicle, onOpen }) => (
  <button
    type="button"
    onClick={() => onOpen(vehicle)}
    className={`group w-[9.5rem] shrink-0 snap-start touch-manipulation overflow-hidden rounded-2xl border border-black/[0.06] bg-white text-left transition hover:-translate-y-0.5 hover:shadow-md min-[400px]:w-[10.5rem] lg:w-auto ${focusRing}`}
  >
    <div className="h-24 overflow-hidden min-[400px]:h-28 lg:h-32">
      <img
        src={vehicle.image}
        alt={vehicle.title}
        loading="lazy"
        decoding="async"
        className={`h-full w-full object-cover transition-transform duration-500 ${hoverZoom}`}
      />
    </div>
    <div className="p-2.5 sm:p-3">
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
      className="gf-fade fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-[max(0.75rem,env(safe-area-inset-top))] sm:p-4"
      onClick={onClose}
    >
      {/* The card itself does not scroll, so the close button always stays put;
          only its content area scrolls on short screens. */}
      <div
        className="relative flex max-h-full w-full min-w-0 max-w-4xl flex-col overflow-hidden rounded-2xl bg-white p-2 shadow-2xl sm:rounded-3xl sm:p-3"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          autoFocus
          aria-label="Close fleet image"
          className={`absolute right-4 top-4 z-20 grid h-11 w-11 place-items-center rounded-full bg-black/70 text-white transition hover:bg-black sm:h-10 sm:w-10 ${focusRing}`}
        >
          <CloseIcon />
        </button>

        <div className="min-h-0 overflow-y-auto overscroll-contain">
          <img
            src={vehicle.image}
            alt={vehicle.title}
            className="max-h-[50dvh] w-full rounded-xl object-contain sm:max-h-[64dvh] sm:rounded-2xl"
          />
          <div className="p-3 sm:p-4">
            <h3 className="font-frank text-2xl font-bold leading-none text-black sm:text-3xl">{vehicle.title}</h3>
            <p className="mt-1.5 font-bitter text-sm font-bold text-green-700">{vehicle.capacity}</p>
            <p className="mt-3 max-w-2xl font-bitter text-sm leading-relaxed text-black/80 sm:text-base">{vehicle.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ----- Helper: Animated Words -----
const AnimatedWords = ({ text }) => {
  const words = text.split(" ");
  return (
    <span aria-label={text}>
      {words.map((word, index) => (
        <React.Fragment key={`${word}-${index}`}>
          <span className="inline-block overflow-hidden align-bottom pb-[0.08em]">
            <span className="wmud-word inline-block will-change-transform">
              {word}
            </span>
          </span>
          {index !== words.length - 1 && " "}
        </React.Fragment>
      ))}
    </span>
  );
};

// ----- Main Component -----
const WhatMakesUsDifferent = () => {
  const pageRef = useRef(null);
  const headerRef = useRef(null);

  const [fleetVehicle, setFleetVehicle] = useState(null);
  const openFleet = useCallback((v) => setFleetVehicle(v), []);
  const closeFleet = useCallback(() => setFleetVehicle(null), []);

  // Resolve vehicle images for the fleet display (from vehicles data)
  const vehicleImages = vehicles
    .filter((v) =>
      [
        "mitsubishi-xpander",
        "hyundai-staria-white",
        "hyundai-staria-silver",
      ].includes(v.id),
    )
    .map((v) => resolveTourImage(v.image));

  // ----- GSAP ANIMATIONS (FULLY PRESERVED) -----
  useLayoutEffect(() => {
    if (!pageRef.current) return;

    const lenis = window.lenis;
    const syncLenis = () => ScrollTrigger.update();

    if (lenis?.on) {
      lenis.on("scroll", syncLenis);
    }

    const ctx = gsap.context(() => {
      const words = gsap.utils.toArray(".wmud-word");
      const pills = gsap.utils.toArray(".wmud-pill");
      const newBubbles = gsap.utils.toArray(".new-tour-bubble");
      const diffCards = gsap.utils.toArray(".diff-card");
      const trustCardEls = gsap.utils.toArray(".trust-card");
      const trustIcons = gsap.utils.toArray(".trust-icon-wrap");
      const trustCopyItems = gsap.utils.toArray(".trust-copy > *");
      const parallaxImgs = gsap.utils.toArray(".parallax-img");
      const promoPieces = gsap.utils.toArray(".promo-piece");
      const isTouch =
        window.matchMedia("(pointer: coarse)").matches ||
        window.innerWidth < 768;
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (reduceMotion) {
        gsap.set(
          [
            ...words,
            ...pills,
            ...newBubbles,
            ...diffCards,
            ...trustCardEls,
            ...trustIcons,
            ...trustCopyItems,
            ...promoPieces,
            ".wmud-subcopy",
          ],
          {
            y: 0,
            yPercent: 0,
            x: 0,
            scale: 1,
            rotate: 0,
            autoAlpha: 1,
          },
        );
        return;
      }

      gsap.set(words, { yPercent: 115 });
      gsap.set(".wmud-subcopy", { y: 24, autoAlpha: 0 });
      gsap.set(pills, {
        y: 22,
        scale: 0.86,
        rotate: -2,
        autoAlpha: 0,
        transformOrigin: "center center",
      });
      gsap.set(newBubbles, {
        scale: 0,
        rotate: 12,
        autoAlpha: 0,
        transformOrigin: "center center",
      });

      const introTl = gsap.timeline({
        scrollTrigger: {
          trigger: headerRef.current,
          start: "top 75%",
          end: "bottom 35%",
          scrub: 0.8,
          invalidateOnRefresh: true,
        },
      });

      introTl
        .to(words, { yPercent: 0, stagger: 0.045, ease: "none" })
        .to(".wmud-subcopy", { y: 0, autoAlpha: 1, ease: "none" }, ">-0.05")
        .to(
          pills,
          {
            y: 0,
            scale: 1,
            rotate: 0,
            autoAlpha: 1,
            stagger: 0.08,
            ease: "none",
          },
          ">",
        )
        .to(
          newBubbles,
          { scale: 1, rotate: 0, autoAlpha: 1, stagger: 0.08, ease: "none" },
          ">-0.05",
        );

      let pillPulsePlayed = false;
      ScrollTrigger.create({
        trigger: headerRef.current,
        start: "bottom 36%",
        once: true,
        onEnter: () => {
          if (pillPulsePlayed) return;
          pillPulsePlayed = true;
          gsap
            .timeline()
            .to(pills, {
              backgroundColor: "#bbf7d0",
              boxShadow:
                "0 0 0 7px rgba(187, 247, 208, 0.7), 0 14px 32px rgba(34, 197, 94, 0.22)",
              scale: 1.08,
              y: -3,
              stagger: 0.06,
              duration: 0.24,
              ease: "power2.out",
            })
            .to(pills, {
              backgroundColor: "#ffffff",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              scale: 1,
              y: 0,
              stagger: 0.04,
              duration: 0.28,
              ease: "power2.out",
            });
        },
      });

      gsap.fromTo(
        promoPieces,
        { y: isTouch ? 18 : 32, scale: 0.98, autoAlpha: 0 },
        {
          y: 0,
          scale: 1,
          autoAlpha: 1,
          stagger: 0.07,
          duration: isTouch ? 0.32 : 0.46,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".promo-banner",
            start: "top 86%",
            once: true,
          },
        },
      );

      gsap.fromTo(
        diffCards,
        { y: isTouch ? 18 : 34, scale: 0.97, autoAlpha: 0 },
        {
          y: 0,
          scale: 1,
          autoAlpha: 1,
          stagger: isTouch ? 0.05 : 0.1,
          duration: isTouch ? 0.32 : 0.46,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".diff-grid",
            start: "top 86%",
            once: true,
          },
        },
      );

      gsap.fromTo(
        trustCardEls,
        { y: isTouch ? 22 : 46, scale: 0.97, autoAlpha: 0 },
        {
          y: 0,
          scale: 1,
          autoAlpha: 1,
          stagger: isTouch ? 0.05 : 0.11,
          duration: isTouch ? 0.34 : 0.5,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".trust-section",
            start: "top 84%",
            once: true,
          },
        },
      );

      gsap.fromTo(
        trustIcons,
        { y: 12, scale: 0.82, rotate: -5, autoAlpha: 0 },
        {
          y: 0,
          scale: 1,
          autoAlpha: 1,
          stagger: 0.06,
          duration: 0.34,
          ease: "back.out(1.45)",
          scrollTrigger: {
            trigger: ".trust-section",
            start: "top 76%",
            once: true,
          },
        },
      );

      gsap.fromTo(
        trustCopyItems,
        { y: 12, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          stagger: 0.025,
          duration: 0.3,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".trust-section",
            start: "top 72%",
            once: true,
          },
        },
      );

      if (!isTouch) {
        parallaxImgs.forEach((img) => {
          const frame = img.closest(".parallax-frame");
          const isSoft = img.classList.contains("soft-parallax");
          gsap.fromTo(
            img,
            { yPercent: isSoft ? -2 : -4, scale: isSoft ? 1.02 : 1.04 },
            {
              yPercent: isSoft ? 2 : 4,
              scale: isSoft ? 1.01 : 1.025,
              ease: "none",
              scrollTrigger: {
                trigger: frame || img,
                start: "top bottom",
                end: "bottom top",
                scrub: 1.1,
                invalidateOnRefresh: true,
              },
            },
          );
        });
      }

      requestAnimationFrame(() => ScrollTrigger.refresh());
    }, pageRef);

    return () => {
      ctx.revert();
      if (lenis?.off) {
        lenis.off("scroll", syncLenis);
      }
    };
  }, []);

  // ----- JSX (with resolved images) -----
  return (
    <section
      ref={pageRef}
      className="relative z-20 w-full pt-16 sm:pt-20 bg-white overflow-hidden"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-8  px-4 sm:px-6 lg:px-8">
        {/* HEADER */}
        <div
          ref={headerRef}
          className="relative z-30 mx-auto flex w-full max-w-4xl flex-col items-center gap-6 text-center"
        >
          <img
            src="/icons/infoDark.png"
            className="h-9 w-auto"
            alt="Info icon"
          />
          <h2 className="font-bitter text-4xl sm:text-5xl lg:text-6xl font-bold text-black leading-tight">
            <AnimatedWords text="What makes us different?" />
          </h2>
          <p className="wmud-subcopy max-w-2xl text-base sm:text-lg text-gray-600 leading-relaxed">
            Discover the unique features and benefits that set us apart from the
            competition. Benefit from our expertise and commitment.
          </p>
        </div>

        {/* PILLS */}
        <div className="wmud-pill-wrap relative z-10 flex flex-wrap justify-center gap-4">
          {chips.map((item) => (
            <div
              key={item.title}
              className="wmud-pill relative rounded-full bg-white px-6 py-2.5 font-bitter text-sm font-medium text-black shadow-sm transition-shadow hover:shadow-md will-change-transform"
            >
              {item.title}
              {item.isNew && (
                <span className="new-tour-bubble absolute -right-3 -top-3 rounded-full bg-red-500 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide text-white shadow-md">
                  New tour
                </span>
              )}
            </div>
          ))}
        </div>

        {/* DIFFERENCE CARDS */}
        <div className="diff-grid relative z-10 flex gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] md:grid md:grid-cols-3 md:overflow-visible md:pb-0 [&::-webkit-scrollbar]:hidden">
          {differenceCards.map((item) => (
            <div
              key={item.title}
              className="diff-card flex min-w-[76vw] flex-col items-start gap-3 rounded-2xl bg-white/80 p-5 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-1 hover:shadow-lg sm:min-w-[18rem] md:min-w-0"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
                <img
                  src={item.icon}
                  className="h-9 w-auto object-contain"
                  alt=""
                />
              </div>
              <p className="font-frank text-2xl font-bold text-black">
                {item.title}
              </p>
              <p className="font-bitter text-sm text-gray-500 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>

        {/* <div 
          id="gallery"
          className="mx-auto max-w-5xl rounded-lg px-4 sm:px-6 lg:px-0">
          <Gallery />
        </div> */}
        {/* Fleet */}
        <section className="mx-auto mt-3 w-full min-w-0 max-w-6xl overflow-hidden rounded-3xl border border-black/[0.06] bg-white p-3 shadow-[0_10px_30px_rgba(15,23,42,0.05)] [contain-intrinsic-size:auto_22rem] [content-visibility:auto] sm:mt-4 sm:rounded-[2rem] sm:p-5">
          <div className="mb-3 flex items-end justify-between gap-4 sm:mb-4">
            <h3 className="font-frank text-2xl font-bold leading-none text-black sm:text-3xl">
              Our fleet
            </h3>
            <p className="hidden max-w-sm text-right font-bitter text-xs leading-relaxed text-black/60 lg:block">
              Vehicles are matched to the route, group size and needs of each
              booking.
            </p>
          </div>

          {/* On phones the strip runs edge to edge inside the card (negative margin
            + matching padding) so cards slide off the screen edge naturally. */}
          <div className="-mx-3 flex snap-x touch-pan-x [contain:inline-size] gap-2.5 overflow-x-auto overscroll-x-contain scroll-px-3 px-3 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:-mx-5 sm:scroll-px-5 sm:px-5 lg:mx-0 lg:grid lg:grid-cols-5 lg:overflow-visible lg:px-0 [&::-webkit-scrollbar]:hidden">
            {fleetItems.map((v) => (
              <FleetCard key={v.id} vehicle={v} onOpen={openFleet} />
            ))}
          </div>
        </section>
        {lightboxIndex !== null && (
          <Lightbox
            index={lightboxIndex}
            onChange={setLightboxIndex}
            onClose={closeLightbox}
          />
        )}
        {fleetVehicle && (
          <FleetModal vehicle={fleetVehicle} onClose={closeFleet} />
        )}

        {/* PROMO BANNER */}
        <div className="promo-banner relative z-10">
          <div className="promo-piece mx-auto flex max-w-2xl items-center gap-3 rounded-full bg-green-100 px-4 py-2.5 shadow-sm transition hover:shadow-md">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white shadow-sm">
              <img
                src="/icons/approvedGreen.png"
                className="h-6 w-6 object-contain"
                alt=""
              />
            </span>
            <p className="min-w-0 font-bitter text-sm font-semibold text-green-900 leading-snug">
              Book your group, pay securely, and receive manual confirmation.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhatMakesUsDifferent;
