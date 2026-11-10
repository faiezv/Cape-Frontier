import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { Link } from "react-router-dom";
// TODO: adjust this path to wherever useLoadingNavigate lives
import { useLoadingNavigate } from "./useLoadingNavigate";
import { resolveImage } from "../utils/ImageLoader.js";

import { site } from "../utils/siteConfig.js";

// useLayoutEffect warns during SSR; fall back to useEffect on the server.
const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

// Vite gives a string, Next.js gives { src, width, height } - support both.
const toSrc = (img) => (typeof img === "string" ? img : img.src);

// -----------------------------------------------------------------------------
// Hero images: every .webp in src/assets/images/content/hero/ is picked up
// automatically at build time. Other formats (the .png screenshots) are ignored
// on purpose, so stray files never end up in the slideshow.
//
// Order: numbered files first by number (1.webp, 2.webp, ... 10.webp), then any
// non-numbered files alphabetically. 1.webp is always the first slide (and the
// LCP image), so give it the best photo.
//
// Filenames are case-sensitive on Vercel (Linux).
// -----------------------------------------------------------------------------
const heroModules = import.meta.glob("/src/assets/images/content/hero/*.webp", {
  eager: true,
  query: "?url",
  import: "default",
});

const fileName = (path) => path.split("/").pop();

const leadingNumber = (path) => {
  const match = fileName(path).match(/^(\d+)/);
  return match ? parseInt(match[1], 10) : Infinity;
};

const slides = Object.entries(heroModules)
  .sort(([a], [b]) => {
    const diff = leadingNumber(a) - leadingNumber(b);
    if (diff !== 0 && !Number.isNaN(diff)) return diff;
    return fileName(a).localeCompare(fileName(b), undefined, { numeric: true });
  })
  .map(([path, image], index) => ({
    key: path,
    image,
    alt: `Cape Frontier tours in Cape Town, photo ${index + 1}`,
  }));

if (import.meta.env?.DEV && slides.length === 0) {
  console.warn(
    "[Hero] No .webp files found in src/assets/images/content/hero/",
  );
}

const SLIDE_MS = 6500;
const PROMO_MS = 5000; // how long each promo stays visible

// Hero photo: calm by design. Photos only cross-fade (no zoom, no movement) and
// nothing about them reacts to scrolling. Set SLIDE_AUTOPLAY to false for one
// still photo (the first one).
const SLIDE_AUTOPLAY = true;
const FADE_S = 1.8; // cross-fade length in seconds

// -----------------------------------------------------------------------------
// Promotions shown under the tour select block.
// `short` = the one-line subtitle, `badge` = the small chip (tablet and up).
// Every colour for a promo lives in its own class strings so a promo is one
// self-contained object. (Tailwind needs full class names, no templating.)
// -----------------------------------------------------------------------------
const promos = [
  {
    key: "peninsula",
    title: "Cape Peninsula Tour",
    short: "Entry fees included.",
    badge: "Limited time",
    cta: "View tour",
    to: "/tours/peninsula-tour-2", // tour slug
    image: resolveImage(
      "src/assets/images/tours/packages/peninsula-tour/1.webp",
    ),
    // colours: ocean blue -> cyan
    card: "bg-[linear-gradient(110deg,#0938ef_0%,#2f6bff_55%,#22d3ee_100%)] text-white",
    badgeClass: "bg-white/20 text-white ring-1 ring-white/40",
    ctaClass: "bg-white text-[#0938ef] group-hover:bg-sky-50",
  },
  {
    key: "heritage",
    title: "Heritage Cape Flats Community Tour",
    short: "Groups of 7–10 save 20%.",
    badge: "Must experience",
    cta: "View tour",
    to: "/tours/heritage-faith-cape-flats-community-tour", // TODO: replace with the real slug
    image: resolveImage(
      "src/assets/images/tours/historical/cape-flats-heritage-faith/1.webp",
    ),
    // colours: emerald -> lime
    card: "bg-[linear-gradient(110deg,#047857_0%,#10b981_55%,#bef264_100%)] text-white",
    badgeClass: "bg-white/20 text-white ring-1 ring-white/40",
    ctaClass: "bg-white text-emerald-700 group-hover:bg-emerald-50",
  },
];

// All promo CSS lives in one constant, so the <style> node never changes.
//
// Why this does not flicker:
//  - the first promo is in the markup as "active" from the very first paint, so
//    there is no hidden -> visible switch on load (transitions only run on change)
//  - animations touch transform / opacity only (compositor friendly)
//  - the card has a fixed height and its photo sits in a fixed box, so a late
//    font or image can never move anything
//  - the progress bars render an empty track until the clock starts, then fill
//    from zero
const PROMO_CSS = `
  @keyframes promoFill {
    from { transform: scaleX(0); }
    to   { transform: scaleX(1); }
  }
  /* One diagonal light sweep, then a long rest. transform only. */
  @keyframes promoShine {
    0%        { transform: translateX(-160%) skewX(-24deg); }
    22%, 100% { transform: translateX(700%)  skewX(-24deg); }
  }

  /* Slides share one grid cell and cross-fade. Inactive slides become
     visibility:hidden after the fade so they can't be focused or clicked. */
  .promo-slide {
    opacity: 0;
    visibility: hidden;
    transform: translateY(8px);
    pointer-events: none;
    transition: opacity 0.4s ease, transform 0.4s ease, visibility 0s linear 0.4s;
  }
  .promo-slide[data-active="true"] {
    opacity: 1;
    visibility: visible;
    transform: none;
    pointer-events: auto;
    transition: opacity 0.5s ease 0.1s, transform 0.55s cubic-bezier(0.22, 1, 0.36, 1) 0.1s, visibility 0s;
  }

  .promo-slide[data-active="true"] .promo-shine { animation: promoShine 6.5s ease-in-out 0.6s infinite; }

  .promo-fill { transform-origin: left; animation: promoFill ${PROMO_MS}ms linear forwards; }

  @media (prefers-reduced-motion: reduce) {
    .promo-slide, .promo-slide[data-active="true"] { transition: none; transform: none; }
    .promo-slide[data-active="true"] .promo-shine { animation: none; }
    .promo-shine { display: none; }
    .promo-fill { animation: none; transform: scaleX(1); }
  }
`;

// -----------------------------------------------------------------------------
// PromoBanner
// Compact colour card: round photo, title + one line, offer chip, arrow.
// One promo at a time, thin progress bars underneath.
// `ready` (page loaded + fonts in) only starts the rotation clock.
// The outer wrapper (innerRef) hides on scroll down and returns on scroll up,
// exactly like TourSelect (see the effect in Hero). The slides inside animate
// with CSS only, so the two never touch the same element.
// -----------------------------------------------------------------------------
const PromoBanner = ({
  innerRef,
  active,
  onSelect,
  paused,
  setPaused,
  onGo,
  ready,
}) => (
  <div
    ref={innerRef}
    onMouseEnter={() => setPaused(true)}
    onMouseLeave={() => setPaused(false)}
    className="relative mt-3 w-full max-w-xl self-center px-2 sm:mt-0 sm:px-0"
  >
    <style>{PROMO_CSS}</style>

    <div className="grid">
      {promos.map((p, i) => {
        const isActive = i === active;

        return (
          <div
            key={p.key}
            data-active={isActive}
            className="promo-slide col-start-1 row-start-1"
          >
            <Link
              to={p.to}
              onClick={(e) => onGo(e, p.to)}
              aria-label={`${p.cta}: ${p.title}`}
              aria-hidden={!isActive}
              tabIndex={isActive ? 0 : -1}
              className={`group relative isolate flex h-[60px] w-full transform-gpu items-center gap-3 overflow-hidden rounded-2xl p-2 pr-2.5 shadow-[0_10px_24px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:h-[68px] sm:gap-3.5 ${p.card}`}
            >
              {/* top gloss */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-1/2 bg-gradient-to-b from-white/20 to-transparent"
              />
              {/* light sweep */}
              <span
                aria-hidden="true"
                className="promo-shine pointer-events-none absolute inset-y-0 left-0 -z-10 w-[10%] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.45),transparent)]"
              />

              {/* Round cover photo */}
              <span
                aria-hidden="true"
                className="aspect-square h-full shrink-0 overflow-hidden rounded-xl bg-black/10 ring-2 ring-white/70"
              >
                {p.image && (
                  <img
                    src={toSrc(p.image)}
                    alt=""
                    loading="eager"
                    decoding="async"
                    draggable={false}
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  />
                )}
              </span>

              {/* Copy */}
              <span className="min-w-0 flex-1 leading-tight">
                <strong className="block truncate text-[14px] font-extrabold sm:text-base">
                  {p.title}
                </strong>
                <span className="mt-0.5 block truncate text-[12px] font-medium text-white/90 sm:text-[13px]">
                  {p.short}
                </span>
              </span>

              {/* Offer chip (tablet and up) */}
              <span
                aria-hidden="true"
                className={`hidden shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.06em] sm:inline-block ${p.badgeClass}`}
              >
                {p.badge}
              </span>

              {/* Arrow */}
              <span
                aria-hidden="true"
                className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full shadow-[0_4px_10px_rgba(0,0,0,0.22)] transition-colors sm:h-9 sm:w-9 ${p.ctaClass}`}
              >
                <svg
                  className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14m-6-6 6 6-6 6" />
                </svg>
              </span>
            </Link>
          </div>
        );
      })}
    </div>

    {/* Progress bars: the active one fills over PROMO_MS, all are clickable */}
    <div className="mt-0.5 flex justify-center gap-2">
      {promos.map((p, i) => {
        const isActive = i === active;

        return (
          <button
            key={p.key}
            type="button"
            aria-label={`Show ${p.title}`}
            aria-current={isActive}
            onClick={() => onSelect(i)}
            className="py-2"
          >
            <span className="relative block h-1 w-8 overflow-hidden rounded-full bg-white/40 shadow-[0_1px_3px_rgba(0,0,0,0.35)] transition-colors hover:bg-white/60 sm:w-10">
              {isActive && ready && (
                <span
                  aria-hidden="true"
                  style={{ animationPlayState: paused ? "paused" : "running" }}
                  className="promo-fill absolute inset-0 rounded-full bg-white"
                />
              )}
            </span>
          </button>
        );
      })}
    </div>
  </div>
);

const ArrowDown = ({ className = "h-4 w-4" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    aria-hidden="true"
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
);

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  // Only slide 1 is in the server HTML (it is the LCP image).
  // The rest mount after window load so they never compete with it.
  const [extrasReady, setExtrasReady] = useState(false);
  const [promoState, setPromoState] = useState({ active: 0 });
  const [promoPaused, setPromoPaused] = useState(false);
  // True once the page has loaded and fonts are ready: starts the promo clock.
  const [promoReady, setPromoReady] = useState(false);

  const heroRef = useRef(null);
  const contentRef = useRef(null);
  const promoRef = useRef(null);
  const scrollRef = useRef(null);
  const shineRef = useRef(null);
  const arrowRef = useRef(null);
  const bgRefs = useRef([]);
  const prevSlide = useRef(0);
  // Promo timer bookkeeping so hover pauses/resumes instead of restarting
  const promoElapsed = useRef(0); // ms already shown for the current promo
  const promoLastActive = useRef(0);

  // Route changes go through the loading bar. A plain <Link> calls react-router's
  // navigate() directly, which never touches the bar.
  const loadingNavigate = useLoadingNavigate();
  const goTo = (e, to) => {
    // let ctrl/cmd/shift/middle-click open a new tab as usual
    if (
      e.defaultPrevented ||
      e.button !== 0 ||
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      e.altKey
    )
      return;
    e.preventDefault();
    loadingNavigate(to);
  };

  const safeScroll = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    window.scrollBy({ top: window.innerHeight * 0.9, behavior: "smooth" });
  };

  // Load slides 2+ once the page has finished loading
  useEffect(() => {
    if (document.readyState === "complete") {
      setExtrasReady(true);
      return;
    }
    const onLoad = () => setExtrasReady(true);
    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);

  // Wait for page load + web fonts before starting the promo rotation, so the
  // first rotation never happens while text is still being swapped in.
  useEffect(() => {
    let cancelled = false;

    const loaded = new Promise((resolve) => {
      if (document.readyState === "complete") resolve();
      else window.addEventListener("load", resolve, { once: true });
    });
    const fonts = document.fonts?.ready ?? Promise.resolve();

    Promise.all([loaded, fonts]).then(() => {
      if (cancelled) return;
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          if (!cancelled) setPromoReady(true);
        }),
      );
    });

    return () => {
      cancelled = true;
    };
  }, []);

  // NOTE: there is no ScrollTrigger in this component. Home.jsx pins the whole
  // hero and About slides up over it; a second pin in here would nest inside
  // Home's pin and cause jitter.

  // Promo banner hide / show, the same as TourSelect: it hides by moving UP
  // (and fading), and reveals by coming back DOWN into place. The banner sits in the pinned hero, so it stays at the same
  // spot on screen. TourSelect is part of the page, so it only comes back into
  // view when you are back at the top; the banner therefore only returns at the
  // top of the page too, not on any scroll up. Uses the native scroll event,
  // which Lenis keeps updating, so it works with or without Lenis.
  useEffect(() => {
    const el = promoRef.current;
    if (!el) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const TOP_PX = 5; // at or above this scroll position counts as "at the top"
    let hidden = false;

    const show = () => {
      if (!hidden) return;
      hidden = false;
      gsap.to(el, {
        y: 0,
        autoAlpha: 1,
        duration: 0.4,
        ease: "power3.out",
        overwrite: true,
      });
    };

    const hide = () => {
      if (hidden) return;
      hidden = true;
      gsap.to(el, {
        y: reduceMotion ? 0 : -40,
        autoAlpha: 0,
        duration: reduceMotion ? 0.01 : 0.35,
        ease: "power3.out",
        overwrite: true,
      });
    };

    const onScroll = () => {
      if ((window.scrollY || 0) <= TOP_PX) show();
      else hide();
    };

    gsap.set(el, { y: 0, autoAlpha: 1, force3D: true });
    onScroll(); // correct state if the page loads already scrolled
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      gsap.killTweensOf(el);
      gsap.set(el, { clearProps: "transform,opacity,visibility" });
    };
  }, []);

  // Intro + looping animations
  useIsoLayoutEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const ctx = gsap.context(() => {
      const first = bgRefs.current[0];

      // Slide 1 is the only <img> in the server HTML. React does not repair a
      // mismatched `src` during hydration, so if the server build emitted a
      // different asset URL than the client bundle, the browser keeps the
      // broken one. Re-assert the client URL and retry if it failed to decode.
      if (first && slides[0]) {
        const want = toSrc(slides[0].image);
        if (
          first.getAttribute("src") !== want ||
          (first.complete && first.naturalWidth === 0)
        ) {
          first.setAttribute("src", want);
        }
      }

      if (reduceMotion) return;

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      // NOTE: the promo banner is NOT animated with GSAP. It animates with CSS
      // (see PROMO_CSS); GSAP would fight those transforms and opacity.

      if (scrollRef.current) {
        tl.from(scrollRef.current, { y: 60, opacity: 0, duration: 0.55 });
      }

      if (arrowRef.current) {
        gsap.to(arrowRef.current, {
          y: 6,
          duration: 0.95,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      }

      if (shineRef.current) {
        gsap.fromTo(
          shineRef.current,
          { xPercent: -150 },
          {
            xPercent: 220,
            duration: 2.3,
            repeat: -1,
            repeatDelay: 1.1,
            ease: "none",
          },
        );
      }
    }, heroRef);

    return () => ctx.revert();
  }, []);

  // Automatic slideshow (pauses in background tabs, off for reduced motion)
  useEffect(() => {
    if (!SLIDE_AUTOPLAY || !extrasReady || slides.length <= 1) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const interval = setInterval(() => {
      if (document.hidden) return;
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, SLIDE_MS);

    return () => clearInterval(interval);
  }, [extrasReady]);

  // Rotate promos (one visible at a time; pauses on hover / hidden tab)
  const selectPromo = (next) =>
    setPromoState((s) => (s.active === next ? s : { active: next }));

  useEffect(() => {
    // Don't start the clock until the page is settled
    if (!promoReady || promos.length <= 1) return;

    // A different promo is showing (auto or click): start its clock over
    if (promoLastActive.current !== promoState.active) {
      promoLastActive.current = promoState.active;
      promoElapsed.current = 0;
    }

    // Hovering: keep the elapsed time, run nothing
    if (promoPaused) return;

    const startedAt = Date.now();
    let id;

    const advance = () => {
      // Don't rotate in a background tab; check again shortly
      if (document.hidden) {
        id = setTimeout(advance, 500);
        return;
      }
      setPromoState((s) => ({ active: (s.active + 1) % promos.length }));
    };

    id = setTimeout(advance, Math.max(0, PROMO_MS - promoElapsed.current));

    return () => {
      clearTimeout(id);
      // Remember how long this promo has been visible so resuming continues
      promoElapsed.current += Date.now() - startedAt;
    };
  }, [promoReady, promoPaused, promoState.active]);

  // Slide cross-fade: slow and still (no zoom, no movement) so it stays calm.
  useEffect(() => {
    const prev = prevSlide.current;
    const next = currentSlide;
    if (prev === next) return;

    const prevBg = bgRefs.current[prev];
    const nextBg = bgRefs.current[next];
    if (!prevBg || !nextBg) return;

    gsap.killTweensOf([prevBg, nextBg]);
    gsap.set(nextBg, { opacity: 0 });

    gsap
      .timeline()
      .to(prevBg, { opacity: 0, duration: FADE_S, ease: "power1.inOut" }, 0)
      .to(nextBg, { opacity: 1, duration: FADE_S, ease: "power1.inOut" }, 0);

    prevSlide.current = next;
  }, [currentSlide]);

  const visibleSlides = extrasReady ? slides : slides.slice(0, 1);

  return (
    <section
      ref={heroRef}
      aria-label="Cape Frontier hero"
      className="relative h-[100svh] min-h-[100svh] w-full max-w-full overflow-x-hidden overflow-y-clip bg-[#0b1220] font-frank text-white"
    >
      {/* Photo layer: a plain full-size box, the photos sit still inside it. */}
      <div className="absolute inset-0">
        {/* Real <img> elements: crawlable, preloadable, and alt-texted.
            Slide 1 is eager + high priority; the rest are added after load. */}
        {visibleSlides.map((slide, index) => (
          <img
            key={slide.key}
            ref={(el) => {
              bgRefs.current[index] = el;
            }}
            src={toSrc(slide.image)}
            alt={slide.alt}
            aria-hidden={index !== currentSlide}
            loading={index === 0 ? "eager" : "lazy"}
            fetchPriority={index === 0 ? "high" : "auto"}
            decoding={index === 0 ? "sync" : "async"}
            draggable={false}
            onError={(e) =>
              console.error("[Hero] image failed to load:", e.currentTarget.src)
            }
            className={`absolute inset-0 h-full w-full object-cover will-change-transform ${
              index === 0 ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
      </div>

      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.14),transparent_36%)]" />

      <div className="relative z-20 flex h-full flex-col">
        <div
          ref={contentRef}
          className="flex flex-1 flex-col items-center px-4 pb-24 pt-24 sm:px-6 sm:pb-12 sm:pt-12 md:px-8 md:pb-24 md:pt-28 lg:px-10 lg:pt-32"
        >
          {/* SEO: the page needs exactly one <h1>. */}
          <h1 className="sr-only">{site.heroH1}</h1>

          {/* Spacer that reserves room for the TourSelect, which Home.jsx
              renders above the hero. Adjust the min heights if the banner
              overlaps the search box. */}
          <div className="w-full max-w-5xl min-h-[200px] sm:min-h-[200px] md:min-h-[100px] lg:min-h-[80px]" />

          {/* Promo banner: Cape Peninsula + Heritage, one at a time */}
          <PromoBanner
            innerRef={promoRef}
            active={promoState.active}
            onSelect={selectPromo}
            paused={promoPaused}
            onGo={goTo}
            setPaused={setPromoPaused}
            ready={promoReady}
          />
        </div>

        {/* Bottom scroll CTA - a real link, so it works without JS too */}
        <a
          ref={scrollRef}
          href="#featured-tours"
          onClick={(e) => {
            e.preventDefault();
            safeScroll("featured-tours");
          }}
          className="absolute bottom-0 left-0 z-30 flex w-full max-w-full items-center justify-center overflow-hidden border-t border-white/10 bg-[linear-gradient(90deg,#002dcb_0%,#0938ef_50%,#002dcb_100%)] px-4 py-3 text-sm font-medium text-white/95 shadow-[0_-8px_30px_rgba(0,0,0,0.16)] backdrop-blur-md sm:py-4 sm:text-base md:text-lg"
        >
          <div
            ref={shineRef}
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-[-30%] w-[26%] skew-x-[-24deg] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.24),transparent)]"
          />

          <div className="relative z-10 flex items-center gap-3 leading-none">
            <div className="flex gap-6">
              <span>Explore beyond the ordinary.</span>
              <span ref={arrowRef}>
                <ArrowDown className="h-5 w-5 -translate-y-1" />
              </span>
            </div>
          </div>
        </a>
      </div>
    </section>
  );
};

export default Hero;