import React, { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { tours } from "../data/tours";
import Booking from "./Booking";

gsap.registerPlugin(ScrollToPlugin, ScrollTrigger);

const PIN_TOP_OFFSET = 96;

const formatMoney = (amount, currencyCode = "ZAR") =>
  new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: 2,
  }).format(amount);

const getAllTourGalleryImages = (tour) => {
  if (!tour) return [];

  return [
    tour.image,
    ...(tour.images || []),
    ...(tour.destinationGalleries || []).flatMap(
      (destination) => destination.images || []
    ),
    ...(tour.stops || []).flatMap((stop) => stop.images || []),
  ]
    .filter(Boolean)
    .filter((src, index, array) => array.indexOf(src) === index);
};

export default function TourDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const bookingRef = useRef(null);
  const readyCardRef = useRef(null);
  const contentColumnRef = useRef(null);

  const itinerarySectionRef = useRef(null);
  const itineraryPinRef = useRef(null);
  const itineraryTextRefs = useRef([]);
  const itineraryImageRefs = useRef([]);

  const tour = tours.find((item) => item.slug === slug);

  const galleryImages = useMemo(() => {
    if (!tour) return [];
    return getAllTourGalleryImages(tour);
  }, [tour]);

  useEffect(() => {
    if (!tour) return;

    document.title =
      tour.seo?.title || `${tour.title} | Cape Frontier Travel & Tours`;

    const metaDescription =
      document.querySelector("meta[name='description']") ||
      document.createElement("meta");

    metaDescription.setAttribute("name", "description");
    metaDescription.setAttribute(
      "content",
      tour.seo?.description || tour.description
    );

    document.head.appendChild(metaDescription);
  }, [tour]);

  useLayoutEffect(() => {
    if (!tour || !readyCardRef.current || !contentColumnRef.current) return;

    const mm = gsap.matchMedia();

    mm.add("(min-width: 1024px)", () => {
      const trigger = ScrollTrigger.create({
        trigger: readyCardRef.current,
        start: `top ${PIN_TOP_OFFSET}px`,
        endTrigger: contentColumnRef.current,
        end: () => {
          const readyCardHeight = readyCardRef.current?.offsetHeight || 0;
          return `bottom ${PIN_TOP_OFFSET + readyCardHeight}px`;
        },
        pin: true,
        pinSpacing: false,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      });

      ScrollTrigger.refresh();

      return () => trigger.kill();
    });

    return () => mm.revert();
  }, [tour]);

  useLayoutEffect(() => {
    if (!tour || !itineraryPinRef.current || !itinerarySectionRef.current) {
      return;
    }

    const textFrames = itineraryTextRefs.current.filter(Boolean);
    const imageFrames = itineraryImageRefs.current.filter(Boolean);

    if (textFrames.length < 2 || imageFrames.length < 2) return;

    const mm = gsap.matchMedia();

    mm.add("(min-width: 768px)", () => {
      const stopCount = textFrames.length;
      const snapStep = 1 / Math.max(stopCount - 1, 1);

      gsap.set(textFrames, {
        position: "absolute",
        inset: 0,
        autoAlpha: 0,
        y: 26,
        filter: "blur(1px)",
        pointerEvents: "none",
        willChange: "transform, opacity, filter",
      });

      gsap.set(textFrames[0], {
        autoAlpha: 1,
        y: 0,
        filter: "blur(0px)",
        pointerEvents: "auto",
      });

      gsap.set(imageFrames, {
        position: "absolute",
        inset: 0,
        xPercent: 105,
        opacity: 1,
        scale: 0.98,
        willChange: "transform",
      });

      gsap.set(imageFrames[0], {
        xPercent: 0,
        scale: 1,
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: itinerarySectionRef.current,
          start: "top top",
          end: () => `+=${Math.max(stopCount - 1, 1) * 560}`,
          pin: itineraryPinRef.current,
          pinSpacing: true,
          scrub: 0.35,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          snap: {
            snapTo: (progress) => Math.round(progress / snapStep) * snapStep,
            duration: { min: 0.08, max: 0.22 },
            delay: 0.01,
            ease: "power3.out",
          },
        },
      });

      tl.addLabel("stop-0", 0);

      textFrames.forEach((frame, index) => {
        if (index === 0) return;

        const previousText = textFrames[index - 1];
        const currentText = textFrames[index];
        const previousImage = imageFrames[index - 1];
        const currentImage = imageFrames[index];

        const transitionStart = index - 0.42;

        tl.addLabel(`stop-${index}`, index);

        tl.to(
          previousText,
          {
            y: -24,
            autoAlpha: 0,
            filter: "blur(1px)",
            pointerEvents: "none",
            duration: 0.18,
            ease: "none",
          },
          transitionStart
        );

        tl.to(
          currentText,
          {
            y: 0,
            autoAlpha: 1,
            filter: "blur(0px)",
            pointerEvents: "auto",
            duration: 0.18,
            ease: "none",
          },
          transitionStart + 0.14
        );

        tl.to(
          previousImage,
          {
            xPercent: -105,
            scale: 0.98,
            duration: 0.34,
            ease: "none",
          },
          transitionStart
        );

        tl.to(
          currentImage,
          {
            xPercent: 0,
            scale: 1,
            duration: 0.34,
            ease: "none",
          },
          transitionStart
        );
      });

      tl.to({}, { duration: 0.15 }, stopCount - 1);

      ScrollTrigger.refresh();

      return () => {
        tl.scrollTrigger?.kill();
        tl.kill();

        gsap.set([...textFrames, ...imageFrames], {
          clearProps:
            "position,inset,transform,opacity,visibility,filter,pointerEvents,willChange,scale",
        });
      };
    });

    return () => mm.revert();
  }, [tour]);

  useEffect(() => {
    if (location.hash === "#booking" && bookingRef.current) {
      setTimeout(() => {
        gsap.to(window, {
          scrollTo: {
            y: bookingRef.current,
            offsetY: 80,
          },
          duration: 1,
          ease: "expo.inOut",
        });
      }, 250);
    }
  }, [location.hash]);

  if (!tour) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center">
        <h1 className="font-frank text-4xl font-bold">Tour not found</h1>

        <p className="mt-3 font-bitter text-neutral-500">
          This tour may have been moved or renamed.
        </p>

        <button
          onClick={() => navigate("/")}
          className="hero-gradient mt-6 rounded-full px-6 py-3 font-bitter font-semibold text-white"
        >
          Back Home
        </button>
      </main>
    );
  }

  const scrollToBooking = () => {
    gsap.to(window, {
      scrollTo: {
        y: bookingRef.current,
        offsetY: 80,
      },
      duration: 1,
      ease: "expo.inOut",
    });
  };

  const scrollToItinerary = () => {
    gsap.to(window, {
      scrollTo: {
        y: "#itinerary",
        offsetY: 0,
      },
      duration: 1,
      ease: "expo.inOut",
    });
  };

  return (
    <main className="bg-white text-black">
      {/* HERO */}
      <section className="relative min-h-[92vh] overflow-hidden bg-black text-white">
        <img
          src={tour.image}
          alt={tour.title}
          className="absolute inset-0 h-full w-full object-cover"
          fetchPriority="high"
          decoding="async"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/20" />

        <div className="relative z-10 mx-auto flex min-h-[92vh] max-w-6xl items-end px-5 pb-16">
          <div className="max-w-3xl">
            <div className="mb-5 flex flex-wrap gap-2">
              <span className="rounded-full bg-green-200 px-4 py-1.5 font-bitter text-xs font-semibold text-green-950">
                {tour.category}
              </span>

              <span className="rounded-full border border-white/20 bg-white/15 px-4 py-1.5 font-bitter text-xs backdrop-blur-md">
                {tour.type}
              </span>

              <span className="rounded-full border border-white/20 bg-white/15 px-4 py-1.5 font-bitter text-xs backdrop-blur-md">
                {tour.duration}
              </span>
            </div>

            <h1 className="font-frank text-5xl font-bold leading-[0.9] md:text-7xl">
              {tour.title}
            </h1>

            <p className="mt-6 max-w-2xl font-bitter leading-relaxed text-white/75">
              {tour.description}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                onClick={scrollToBooking}
                className="hero-gradient rounded-full px-7 py-3 font-bitter text-sm font-semibold text-white shadow-lg transition-all active:scale-95"
              >
                Request This Trip
              </button>

              <button
                onClick={scrollToItinerary}
                className="rounded-full border border-white/20 bg-white/10 px-7 py-3 font-bitter text-sm font-semibold backdrop-blur-md transition-all hover:bg-white/20"
              >
                View Itinerary
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK INFO */}
      <section className="relative z-20 mx-auto -mt-10 max-w-6xl px-5">
        <div className="grid grid-cols-1 gap-3 rounded-[2rem] border border-black/5 bg-white p-5 shadow-[0_18px_60px_rgba(0,0,0,0.12)] md:grid-cols-4">
          <InfoCard label="From" value={`${formatMoney(tour.priceBase)} pp`} />
          <InfoCard label="Location" value={tour.location} />
          <InfoCard label="Duration" value={tour.duration} />
          <InfoCard label="Rating" value={`${tour.rating} / 5`} />
        </div>
      </section>

      {/* CONTENT */}
      <section className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-5 py-16 lg:grid-cols-[1.3fr_0.7fr]">
        <div ref={contentColumnRef} className="space-y-10">
          <ContentBlock eyebrow="Overview" title="About this experience">
            <p className="font-bitter leading-relaxed text-neutral-600">
              {tour.description}
            </p>
          </ContentBlock>

          <ContentBlock eyebrow="Gallery" title="Tour photos">
            {galleryImages.length > 0 ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {galleryImages.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    className={`group overflow-hidden rounded-3xl bg-neutral-100 ${
                      index === 0 ? "sm:col-span-2 xl:col-span-2" : ""
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${tour.title} gallery image ${index + 1}`}
                      loading={index < 3 ? "eager" : "lazy"}
                      decoding="async"
                      onLoad={() => ScrollTrigger.refresh()}
                      className={`w-full object-cover transition duration-500 group-hover:scale-[1.04] ${
                        index === 0 ? "h-56 md:h-80" : "h-44"
                      }`}
                    />
                  </button>
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-black/5 bg-neutral-50 p-6 font-bitter text-sm text-neutral-500">
                Gallery images coming soon.
              </div>
            )}
          </ContentBlock>

          <ContentBlock eyebrow="Highlights" title="What makes it special">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {tour.highlights?.map((item, index) => (
                <TickCard key={index} text={item.text} />
              ))}
            </div>
          </ContentBlock>

          <ContentBlock eyebrow="Included" title="Included perks">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {tour.included?.map((item, index) => (
                <TickCard key={index} text={item.text} />
              ))}
            </div>
          </ContentBlock>

          {tour.excluded?.length > 0 && (
            <ContentBlock eyebrow="Not included" title="Extras to confirm">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {tour.excluded.map((item, index) => (
                  <PlainCard key={index} text={item.text} />
                ))}
              </div>
            </ContentBlock>
          )}
        </div>

        <aside className="h-fit">
          <div
            ref={readyCardRef}
            className="rounded-[2rem] border border-black/5 bg-neutral-50 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.06)]"
          >
            <h3 className="font-frank text-3xl font-bold leading-none">
              Ready to go?
            </h3>

            <p className="mt-3 font-bitter text-sm leading-relaxed text-neutral-500">
              Request this trip and the selected tour will be attached to your
              booking form.
            </p>

            <button
              onClick={scrollToBooking}
              className="hero-gradient mt-6 w-full rounded-full px-6 py-3 font-bitter text-sm font-semibold text-white"
            >
              Request Trip
            </button>

            <div className="mt-6 space-y-3">
              {tour.pickupOptions?.slice(0, 5).map((option) => (
                <div
                  key={option}
                  className={`rounded-2xl border px-4 py-3 font-bitter text-sm ${
                    option.toLowerCase().includes("custom")
                      ? "border-green-300 bg-green-200 font-semibold text-green-950"
                      : "border-black/5 bg-white text-neutral-600"
                  }`}
                >
                  {option}
                </div>
              ))}
            </div>
          </div>
        </aside>
      </section>

      {/* ITINERARY */}
      <section
        ref={itinerarySectionRef}
        id="itinerary"
        className="overflow-hidden border-y border-black/5 bg-neutral-50"
      >
        <div ref={itineraryPinRef} className="mx-auto max-w-6xl px-5 py-12">
          <div className="relative z-30 flex flex-col gap-6 rounded-[2rem] bg-neutral-50/95 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <span className="font-bitter text-[11px] uppercase tracking-[0.24em] text-red-400">
                Full Itinerary
              </span>

              <h2 className="mt-2 font-frank text-4xl font-bold leading-none md:text-5xl">
                Stop-by-stop route
              </h2>

              <p className="mt-4 font-bitter leading-relaxed text-neutral-600">
                Scroll through the route while each stop detail and image snaps
                into the same focused frame.
              </p>
            </div>

            <div className="hidden rounded-full border border-black/5 bg-white px-4 py-2 font-bitter text-xs font-semibold text-neutral-500 shadow-[0_12px_30px_rgba(0,0,0,0.05)] md:block">
              snap through {tour.stops?.length || 0} stops
            </div>
          </div>

          {/* Desktop pinned animation */}
          <div className="hidden md:grid md:min-h-[540px] md:grid-cols-[0.82fr_1.18fr] md:items-center md:gap-10">
            <div className="relative min-h-[430px] overflow-hidden rounded-[2.5rem] border border-black/5 bg-white p-9 shadow-[0_24px_80px_rgba(0,0,0,0.08)] lg:p-10">
              {tour.stops?.map((stop, index) => (
                <div
                  key={`${stop.id || stop.name}-text-${index}`}
                  ref={(el) => {
                    itineraryTextRefs.current[index] = el;
                  }}
                  className="relative"
                >
                  <ItineraryTextFrame stop={stop} index={index} />
                </div>
              ))}
            </div>

            <div className="relative min-h-[430px] overflow-hidden rounded-[2.5rem]">
              {tour.stops?.map((stop, index) => (
                <div
                  key={`${stop.id || stop.name}-image-${index}`}
                  ref={(el) => {
                    itineraryImageRefs.current[index] = el;
                  }}
                  className="relative"
                >
                  <ItineraryImageFrame stop={stop} index={index} />
                </div>
              ))}
            </div>
          </div>

          {/* Mobile normal layout */}
          <div className="space-y-6 md:hidden">
            {tour.stops?.map((stop, index) => (
              <MobileItineraryStop
                key={stop.id || stop.name || index}
                stop={stop}
                index={index}
              />
            ))}
          </div>
        </div>
      </section> 
      
      {/* BOOKING FORM AT BOTTOM */}
      <section ref={bookingRef} id="booking" className="py-16 text-white">
        <Booking embeddedTour={tour} />
      </section>

      {/* NEED TO KNOW */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <ContentBlock eyebrow="Before you go" title="Need to know">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {tour.needToKnow?.map((item, index) => (
              <TickCard key={index} text={item.text} />
            ))}
          </div>
        </ContentBlock>
      </section>



      {/* FAQ UNDER BOOKING FORM */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <ContentBlock eyebrow="Questions" title="FAQ">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {tour.faqs?.map((faq, index) => (
              <div
                key={index}
                className="rounded-3xl border border-black/5 bg-neutral-50 p-5"
              >
                <p className="font-bitter font-semibold text-neutral-900">
                  {faq.question}
                </p>

                <p className="mt-2 font-bitter text-sm leading-relaxed text-neutral-600">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </ContentBlock>
      </section>
    </main>
  );
}

function InfoCard({ label, value }) {
  return (
    <div className="rounded-3xl border border-black/5 bg-neutral-50 p-5">
      <span className="block font-bitter text-[11px] uppercase tracking-[0.2em] text-neutral-400">
        {label}
      </span>

      <p className="mt-2 font-bitter text-sm font-semibold leading-snug text-neutral-900 md:text-base">
        {value}
      </p>
    </div>
  );
}

function ContentBlock({ eyebrow, title, children }) {
  return (
    <section>
      <span className="font-bitter text-[11px] uppercase tracking-[0.24em] text-red-400">
        {eyebrow}
      </span>

      <h2 className="mt-2 font-frank text-4xl font-bold leading-none md:text-5xl">
        {title}
      </h2>

      <div className="mt-6">{children}</div>
    </section>
  );
}

function TickCard({ text }) {
  return (
    <div className="flex gap-3 rounded-3xl border border-black/5 bg-neutral-50 p-5">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-200 text-green-950">
        ✓
      </span>

      <p className="font-bitter text-sm leading-relaxed text-neutral-600">
        {text}
      </p>
    </div>
  );
}

function PlainCard({ text }) {
  return (
    <div className="flex gap-3 rounded-3xl border border-black/5 bg-white p-5">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-black/5 text-neutral-500">
        —
      </span>

      <p className="font-bitter text-sm leading-relaxed text-neutral-600">
        {text}
      </p>
    </div>
  );
}

function ItineraryTextFrame({ stop, index }) {
  const hasMapLink = Boolean(stop.exactLocation?.googleMapsUrl);

  return (
    <div className="flex h-full flex-col justify-between p-4">
      <div>
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-green-200 font-bitter text-sm font-bold text-green-950 shadow-[0_10px_22px_rgba(0,0,0,0.08)]">
            {index + 1}
          </div>

          <div>
            <span className="font-bitter text-[11px] uppercase tracking-[0.24em] text-red-400">
              {stop.time || "Tour stop"}{" "}
              {stop.duration ? `· ${stop.duration}` : ""}
            </span>

            <h3 className="mt-1 font-frank text-3xl font-bold leading-none md:text-4xl">
              {stop.name}
            </h3>
          </div>
        </div>

        <p className="font-bitter text-sm leading-relaxed text-neutral-600">
          {stop.description || stop.note}
        </p>

        {stop.exactLocation &&
          (hasMapLink ? (
            <a
              href={stop.exactLocation.googleMapsUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-6 flex items-start gap-3 rounded-3xl border border-black/5 bg-neutral-50 p-4 transition-colors hover:bg-green-200"
            >
              <img
                src="/icons/mapPin.png"
                alt=""
                className="mt-0.5 h-5 w-5 object-contain"
              />

              <div>
                <p className="font-bitter text-sm font-semibold text-neutral-900">
                  {stop.exactLocation.label}
                </p>

                <p className="mt-1 font-bitter text-xs text-neutral-500">
                  {stop.exactLocation.address}
                </p>
              </div>
            </a>
          ) : (
            <div className="mt-6 flex items-start gap-3 rounded-3xl border border-black/5 bg-neutral-50 p-4">
              <img
                src="/icons/mapPin.png"
                alt=""
                className="mt-0.5 h-5 w-5 object-contain opacity-70"
              />

              <div>
                <p className="font-bitter text-sm font-semibold text-neutral-900">
                  {stop.exactLocation.label}
                </p>

                <p className="mt-1 font-bitter text-xs text-neutral-500">
                  {stop.exactLocation.address}
                </p>
              </div>
            </div>
          ))}
      </div>

      {stop.touristComments?.length > 0 && (
        <div className="mt-6 space-y-2">
          {stop.touristComments.slice(0, 2).map((comment, commentIndex) => (
            <div
              key={`${comment.name}-${commentIndex}`}
              className="rounded-3xl border border-black/5 bg-neutral-50 p-4"
            >
              <p className="font-bitter text-sm leading-relaxed text-neutral-600">
                “{comment.text}”
              </p>

              <p className="mt-2 font-bitter text-xs font-semibold text-neutral-900">
                {comment.name} · {comment.country}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ItineraryImageFrame({ stop, index }) {
  const stopImages = stop.images || [];
  const isPickupStop =
    stop.id?.toLowerCase().includes("pickup") ||
    stop.name?.toLowerCase().includes("pickup") ||
    stop.name?.toLowerCase().includes("meeting point");

  const mainImage = stopImages[0];

  return (
    <div className="flex h-full flex-col">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="inline-flex rounded-full border border-black/5 bg-white px-3 py-1 font-bitter text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500 shadow-[0_10px_24px_rgba(0,0,0,0.05)]">
          stop {index + 1}
        </span>

        <span className="inline-flex rounded-full border border-black/5 bg-white px-3 py-1 font-bitter text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500 shadow-[0_10px_24px_rgba(0,0,0,0.05)]">
          {isPickupStop ? "pickup preview" : `${stopImages.length || 0} photos`}
        </span>
      </div>

      {mainImage ? (
        <img
          src={mainImage}
          alt={`${stop.name} main`}
          loading="lazy"
          decoding="async"
          onLoad={() => ScrollTrigger.refresh()}
          className={`w-full rounded-[2rem] border border-black/5 bg-neutral-100 object-cover shadow-[0_18px_45px_rgba(0,0,0,0.10)] ${
            isPickupStop ? "h-[376px]" : "h-[248px]"
          }`}
        />
      ) : (
        <div
          className={`flex items-center justify-center rounded-[2rem] border border-black/5 bg-neutral-100 font-bitter text-sm text-neutral-400 shadow-[0_18px_45px_rgba(0,0,0,0.10)] ${
            isPickupStop ? "h-[376px]" : "h-[248px]"
          }`}
        >
          Stop image coming soon
        </div>
      )}

      {!isPickupStop && stopImages.length > 1 && (
        <div className="mt-3 grid grid-cols-3 gap-3">
          {stopImages.slice(1, 4).map((image, imageIndex) => (
            <img
              key={`${stop.name}-${image}-${imageIndex}`}
              src={image}
              alt={`${stop.name} ${imageIndex + 2}`}
              loading="lazy"
              decoding="async"
              onLoad={() => ScrollTrigger.refresh()}
              className="h-28 w-full rounded-2xl border border-black/5 bg-neutral-100 object-cover shadow-[0_12px_28px_rgba(0,0,0,0.08)]"
            />
          ))}
        </div>
      )}
    </div>
  );
}

function MobileItineraryStop({ stop, index }) {
  const stopImages = stop.images || [];
  const mainImage = stopImages[0];
  const hasMapLink = Boolean(stop.exactLocation?.googleMapsUrl);

  return (
    <article className="rounded-[2rem] border border-black/5 bg-white p-5 shadow-[0_18px_50px_rgba(0,0,0,0.06)]">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-200 font-bitter text-sm font-bold text-green-950">
          {index + 1}
        </div>

        <div>
          <span className="font-bitter text-[11px] uppercase tracking-[0.2em] text-red-400">
            {stop.time || "Tour stop"} {stop.duration ? `· ${stop.duration}` : ""}
          </span>

          <h3 className="mt-1 font-frank text-3xl font-bold leading-none">
            {stop.name}
          </h3>
        </div>
      </div>

      {mainImage ? (
        <img
          src={mainImage}
          alt={stop.name}
          loading="lazy"
          decoding="async"
          className="mb-5 h-52 w-full rounded-3xl object-cover"
        />
      ) : (
        <div className="mb-5 flex h-52 items-center justify-center rounded-3xl bg-neutral-100 font-bitter text-sm text-neutral-400">
          Stop image coming soon
        </div>
      )}

      <p className="font-bitter text-sm leading-relaxed text-neutral-600">
        {stop.description || stop.note}
      </p>

      {stop.exactLocation &&
        (hasMapLink ? (
          <a
            href={stop.exactLocation.googleMapsUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-5 flex items-start gap-3 rounded-3xl border border-black/5 bg-neutral-50 p-4 transition-colors hover:bg-green-200"
          >
            <img
              src="/icons/mapPin.png"
              alt=""
              className="mt-0.5 h-5 w-5 object-contain"
            />

            <div>
              <p className="font-bitter text-sm font-semibold text-neutral-900">
                {stop.exactLocation.label}
              </p>

              <p className="mt-1 font-bitter text-xs text-neutral-500">
                {stop.exactLocation.address}
              </p>
            </div>
          </a>
        ) : (
          <div className="mt-5 flex items-start gap-3 rounded-3xl border border-black/5 bg-neutral-50 p-4">
            <img
              src="/icons/mapPin.png"
              alt=""
              className="mt-0.5 h-5 w-5 object-contain opacity-70"
            />

            <div>
              <p className="font-bitter text-sm font-semibold text-neutral-900">
                {stop.exactLocation.label}
              </p>

              <p className="mt-1 font-bitter text-xs text-neutral-500">
                {stop.exactLocation.address}
              </p>
            </div>
          </div>
        ))}
    </article>
  );
}