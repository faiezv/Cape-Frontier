// Tours.jsx

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useLayoutEffect,
} from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import TourBrowser from "./ToursBrowser";
import TourSelectDeck from "./TourSelectSideDeck";

gsap.registerPlugin(ScrollTrigger);

const RotatingLocationText = ({
  locations,
  intervalDuration = 2200,
  fadeInDuration = 0.18,
  fadeOutDuration = 0.26,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const textRef = useRef(null);
  const indexRef = useRef(0);

  useEffect(() => {
    indexRef.current = currentIndex;
  }, [currentIndex]);

  const rotateToNext = useCallback(() => {
    if (!textRef.current) return;

    const nextIndex = (indexRef.current + 1) % locations.length;

    gsap.to(textRef.current, {
      opacity: 0,
      y: -8,
      filter: "blur(4px)",
      duration: fadeOutDuration,
      ease: "power2.in",
      onComplete: () => {
        setCurrentIndex(nextIndex);

        requestAnimationFrame(() => {
          if (!textRef.current) return;

          gsap.fromTo(
            textRef.current,
            {
              opacity: 0,
              y: 8,
              filter: "blur(4px)",
            },
            {
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              duration: fadeInDuration,
              ease: "power2.out",
            }
          );
        });
      },
    });
  }, [locations.length, fadeInDuration, fadeOutDuration]);

  useEffect(() => {
    const interval = setInterval(rotateToNext, intervalDuration);
    return () => clearInterval(interval);
  }, [rotateToNext, intervalDuration]);

  return (
    <span className="inline-flex items-center rounded-full border border-blue-200/80 bg-blue-50 px-3 py-1.5 shadow-sm shadow-black/5">
      <span
        ref={textRef}
        className="inline-block min-w-[10ch] text-left font-semibold text-blue-700 will-change-transform"
      >
        {locations[currentIndex]}
      </span>
    </span>
  );
};

const ribbonItems = [
  { label: "Secure Online Payments" },
  { label: "Trusted Local Tour Operators", badge: "New" },
  { label: "Flexible Tour Dates" },
  { label: "Private Group Options", badge: "New" },
];

const Bubble = ({ children }) => (
  <span className="tour-pill-bubble absolute -right-2 -top-2 rounded-full bg-blue-600 px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.14em] text-white shadow-lg shadow-blue-600/25 ring-1 ring-white/25">
    {children}
  </span>
);

const Tours = () => {
  const sectionRef = useRef(null);
  const heroRef = useRef(null);
  const stepsRef = useRef(null);
  const browserSectionRef = useRef(null);

  const destinations = [
    "Stellenbosch",
    "Cape Town",
    "Franschhoek",
    "Paarl",
    "Somerset West",
    "Robertson",
  ];

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(".tours-hero-line", {
        opacity: 0,
        y: 26,
        filter: "blur(5px)",
      });

      gsap.set(".tours-step-card", {
        opacity: 0,
        y: 52,
        scale: 0.97,
        rotateX: 5,
        transformPerspective: 900,
      });

      gsap.set(".tour-ribbon-pill", {
        opacity: 0,
        y: 18,
        scale: 0.94,
      });

      gsap.set(".tour-pill-bubble", {
        opacity: 0,
        y: 6,
        scale: 0.6,
        rotate: -8,
      });

      const introTl = gsap.timeline({
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top 78%",
          end: "bottom 48%",
          scrub: 1.05,
        },
      });

      introTl
        .to(".tours-hero-line", {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.85,
          stagger: 0.12,
          ease: "power3.out",
        })
        .to(
          ".tours-step-card",
          {
            opacity: 1,
            y: 0,
            scale: 1,
            rotateX: 0,
            duration: 0.95,
            stagger: 0.1,
            ease: "power3.out",
          },
          "<0.18"
        )
        .to(
          ".tour-ribbon-pill",
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            stagger: 0.07,
            ease: "back.out(1.45)",
          },
          "<0.2"
        )
        .to(
          ".tour-pill-bubble",
          {
            opacity: 1,
            y: 0,
            scale: 1,
            rotate: 0,
            duration: 0.38,
            stagger: 0.08,
            ease: "back.out(1.8)",
          },
          "<0.05"
        );

      gsap.to(".tour-pill-bubble", {
        y: -1,
        scale: 1.05,
        duration: 1.2,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        stagger: 0.18,
      });

      gsap.fromTo(
        browserSectionRef.current,
        {
          opacity: 0,
          y: 44,
        },
        {
          opacity: 1,
          y: 0,
          ease: "power3.out",
          scrollTrigger: {
            trigger: browserSectionRef.current,
            start: "top 85%",
            end: "top 50%",
            scrub: 1,
          },
        }
      );

      ScrollTrigger.refresh();
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={sectionRef}
      className="relative w-full overflow-hidden text-black"
    >
      {/* section 1 */}
      <div className="relative z-10 w-full ">
        <div className="mx-auto flex max-w-5xl flex-col px-4 pb-4">
          {/* HERO TEXT */}
          <div
            ref={heroRef}
            className="flex flex-col items-center justify-center text-center font-frank py-12"
          >
            <p className="tours-hero-line text-4xl font-bold leading-none tracking-tight md:text-6xl">
              Book Your Adventure.
            </p>

            <div className="tours-hero-line mt-5 flex max-w-2xl flex-wrap items-center justify-center text-lg leading-tight text-black/70 md:text-2xl">
              <span>Book a trip to</span>
              <RotatingLocationText locations={destinations} />
              <span>and experience more than just a tour.</span>
            </div>
          </div>

          {/* FEATURE CARD */}
          <div
            ref={stepsRef}
            className="grid w-full gap-4 overflow-visible rounded-xl md:grid-cols-2"
          >
            {/* left 1/2 */}
            <div className="tours-step-card relative min-h-[320px] overflow-hidden rounded-lg">
              <img
                src="/images/content/random/7.webp"
                className="h-full w-full rounded-lg object-cover"
                alt="Platteklip Gorge hiking trail"
              />

              {/* CTA BANNER */}
              <div className="absolute bottom-0 flex w-full flex-col items-start justify-start rounded-lg p-4 font-bitter text-sm leading-none text-white">
                <div className="absolute inset-0 rounded-lg bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

                <div className="relative z-10 flex flex-col gap-2">
                  <p className="text-xl">
                    Platteklip Gorge Hiking Trail via Cable Car
                  </p>

                  <div className="flex items-center gap-2">
                    <img
                      src="/icons/info.png"
                      alt="info"
                      className="h-4 w-4"
                    />

                    <button className="font-bold text-purple-300 hover:underline">
                      Learn more about this classic tour.
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* right 1/2 */}
            <div className="tours-step-card flex min-h-[320px] w-full flex-col gap-3 overflow-visible">
              <div className="relative z-10 w-full flex-1">
                <TourSelectDeck />
              </div>

              {/* pills kept */}
              <div className="flex flex-wrap gap-2">
                {ribbonItems.map((item) => (
                  <div
                    key={item.label}
                    className="tour-ribbon-pill relative w-fit whitespace-nowrap rounded-full border-2 border-blue-600 px-4 py-1 font-bold text-blue-600"
                  >
                    {item.label}
                    {item.badge && <Bubble>{item.badge}</Bubble>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* section 2 */}
      <div className="relative z-10 w-full overflow-visible bg-blue-200">
        {/* <img
          src="/assets/content/clip-art/section1-bg.pn"
          className="pointer-events-none absolute inset-0 -z-10 h-full w-full select-none object-cover"
          alt=""
          aria-hidden="true"
        />   */}
        <TourBrowser />
      </div>
    </div>
  );
};

export default Tours;