import React, { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import TestimonialsSection from "./TestimonialsSection";
import Gallery from "./GoalsGallery";

gsap.registerPlugin(ScrollTrigger);

const storyImages = [
  "/images/content/random/1.webp",
  "/images/content/random/2.webp",
  "/images/content/random/3.webp",
  "/images/content/random/4.webp",
  // "/images/content/random/5.webp",
];

const Stories = () => {
  const sectionRef = useRef(null);
  const imageFrameRef = useRef(null);
  const imageRefs = useRef([]);
  const headingRef = useRef(null);
  const buttonsRef = useRef(null);
  const recentBadgeRef = useRef(null);
  const reviewCardRef = useRef(null);
  const socialRef = useRef(null);
  const leaveReviewRef = useRef(null);

  const testimonial = {
    text: "The most incredible experience of my life. Cape Town's beauty from the ocean was breathtaking. The guides were professional and kind.",
    name: "Sarah Johnson",
    country: "USA",
    date: "March 2024",
    rating: 5,
  };

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const stackedImages = imageRefs.current.filter(Boolean);

      gsap.set(imageFrameRef.current, {
        opacity: 0,
        y: 80,
        rotate: -2,
        scale: 0.94,
      });

      gsap.set(stackedImages, {
        yPercent: 115,
        scale: 1.14,
        opacity: 1,
      });

      gsap.set(stackedImages[0], {
        yPercent: 0,
        scale: 1.08,
      });

      gsap.set(".story-heading-word", {
        yPercent: 115,
        rotate: 3,
      });

      gsap.set(buttonsRef.current, {
        opacity: 0,
        y: 28,
      });

      gsap.set(recentBadgeRef.current, {
        opacity: 0,
        x: -28,
      });

      gsap.set(reviewCardRef.current, {
        opacity: 0,
        y: 70,
        scale: 0.96,
        rotateX: 8,
        transformPerspective: 900,
      });

      gsap.set(socialRef.current, {
        opacity: 0,
        y: 20,
      });

      const introTl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 82%",
          end: "top 28%",
          scrub: 1.2,
        },
      });

      introTl
        .to(imageFrameRef.current, {
          opacity: 1,
          y: 0,
          rotate: 0,
          scale: 1,
          duration: 1,
          ease: "power3.out",
        })
        .to(
          ".story-heading-word",
          {
            yPercent: 0,
            rotate: 0,
            duration: 1,
            stagger: 0.08,
            ease: "power4.out",
          },
          "<0.1"
        )
        .to(
          buttonsRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: "power3.out",
          },
          "<0.25"
        )
        .to(
          recentBadgeRef.current,
          {
            opacity: 1,
            x: 0,
            duration: 0.65,
            ease: "power3.out",
          },
          "<0.3"
        )
        .to(
          reviewCardRef.current,
          {
            opacity: 1,
            y: 0,
            scale: 1,
            rotateX: 0,
            duration: 1,
            ease: "power3.out",
          },
          "<0.15"
        )
        .to(
          socialRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power3.out",
          },
          "<0.35"
        );

      const imageStackTl = gsap.timeline({
        scrollTrigger: {
          trigger: imageFrameRef.current,
          start: "top 72%",
          endTrigger: reviewCardRef.current,
          end: "center center",
          scrub: 1.35,
        },
      });

      stackedImages.forEach((img, index) => {
        if (index === 0) return;

        imageStackTl
          .to(
            img,
            {
              yPercent: 0,
              scale: 1.08,
              duration: 1,
              ease: "none",
            },
            index - 1
          )
          .to(
            stackedImages[index - 1],
            {
              yPercent: -42,
              scale: 1.02,
              duration: 1,
              ease: "none",
            },
            index - 1
          );
      });

      gsap.to(imageFrameRef.current, {
        y: -36,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1.4,
        },
      });

      gsap.fromTo(
        leaveReviewRef.current,
        {
          opacity: 0,
          y: 80,
          scale: 0.96,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: leaveReviewRef.current,
            start: "top 82%",
            end: "top 45%",
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
      className="relative w-full min-h-screen overflow-hidden bg-white text-black"
    >
      {/* <img src="./assets/content/clip-art/section3-bg.png" className='absolute z-20 w-full h-full content-cover' alt="" /> */}
      {/* Section 1 */}
      <section className="relative z-30 w-full bg-none px-4 pt-6 md:pt-10">


        <div className="pointer-events-none absolute inset-0 overflow-hidden ">
          <div className="absolute left-[-10rem] top-20 h-96 w-96 rounded-full bg-green-200/45 blur-3xl" />
          <div className="absolute right-[-8rem] top-40 h-[28rem] w-[28rem] rounded-full bg-blue-200/30 blur-3xl" />
          <div className="absolute left-1/2 top-[28rem] h-80 w-80 -translate-x-1/2 rounded-full bg-yellow-100/40 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-5xl">
          <div className="rounded-t-[2rem] border border-black/5 bg-white/80 px-4 py-6 shadow-2xl shadow-black/10 backdrop-blur-md md:px-6 lg:px-8">
            <div className="grid items-center gap-8 lg:grid-cols-[0.95fr_1.05fr]">
              {/* Animated image stack */}
              <div
                ref={imageFrameRef}
                className="relative h-[340px] w-full overflow-hidden rounded-[2rem] bg-black shadow-2xl shadow-green-950/15 md:h-[430px]"
              >
                {storyImages.map((src, index) => (
                  <img
                    key={src}
                    ref={(el) => (imageRefs.current[index] = el)}
                    src={src}
                    className="absolute inset-0 h-full w-full object-cover will-change-transform"
                    alt={`Cape Frontier story ${index + 1}`}
                    loading={index === 0 ? "eager" : "lazy"}
                  />
                ))}

                {/* GRADIENT OVERLAY */}
                {/* <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/5" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(187,247,208,0.22),transparent_35%)]" /> */}

                <div className="absolute left-4 top-4 rounded-full border border-white/25 bg-white/15 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.22em] text-white backdrop-blur-md">
                  Guest moments
                </div>

                <div className="absolute bottom-5 left-5 right-5">
                  <p className="mb-3 w-fit rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-black shadow-sm">
                    Scroll to reveal
                  </p>

                  {/* <h3 className="max-w-sm font-frank text-4xl font-bold leading-none text-white md:text-5xl">
                    Real Cape Town experiences, one frame at a time.
                  </h3> */}
                </div>
              </div>

              {/* Right text content */}
              <div className="flex min-h-full flex-col justify-between">
                <div className="relative mb-6">
                  <div className="absolute -left-3 -top-3 h-16 w-16 rounded-full bg-green-300/20 blur-xl" />

                  <img
                    src="/icons/quote-green.png"
                    className="relative h-12 w-12"
                    alt="quote"
                  />
                </div>

                <div>
                  <div
                    ref={headingRef}
                    className="overflow-hidden font-frank text-5xl font-bold leading-none tracking-tight md:text-6xl lg:text-7xl"
                  >
                    <span className="story-heading-word inline-block">
                      REAL
                    </span>{" "}
                    <span className="story-heading-word inline-block">
                      STORIES.
                    </span>
                  </div>

                  <div className="mt-2 overflow-hidden font-frank text-3xl font-bold leading-none tracking-tight md:text-5xl lg:text-5xl">
                    <span className="story-heading-word inline-block bg-gradient-to-r from-green-700 via-emerald-500 to-blue-700 bg-clip-text text-transparent">
                      Beyond the Ordinary.
                    </span>
                  </div>

                  <p className="mt-4 max-w-xl font-bitter text-sm leading-relaxed text-black/55 md:text-base">
                    A softer, cleaner review intro with motion that feels more
                    premium: image movement on the left, copy reveal on the
                    right, and the review card pulling into view underneath.
                  </p>

                  <div ref={buttonsRef} className="mt-5 flex flex-wrap gap-3">
                    <button className="rounded-full border border-blue-400/50 bg-white px-6 py-3 font-bitter text-sm font-semibold text-blue-700 shadow-md shadow-black/5 transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-400 hover:text-white hover:shadow-lg">
                      Read their stories
                    </button>

                    <button className="hero-gradient rounded-full px-8 py-3 font-bitter text-sm font-semibold text-white shadow-lg shadow-black/10 transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-xl">
                      View Tours
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* RECENT TESTIMONIALS */}
            <div
              ref={recentBadgeRef}
              className="my-8 flex w-fit items-center gap-3 rounded-full border border-amber-300/70 bg-amber-300/90 px-5 py-2 font-frank font-bold text-black shadow-lg shadow-amber-500/10"
            >
              <img src="/icons/recent.png" alt="" className="h-5 w-5" />
              <div>Recent Testimonials</div>
            </div>

            {/* SINGLE TESTIMONIAL */}
            <div className="w-full">
              <div
                ref={reviewCardRef}
                className="relative overflow-hidden rounded-[2rem] border border-black/5  p-6 shadow-xl shadow-black/5 md:p-8"
              >
                <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full blur-3xl" />

                <p className="relative font-frank text-3xl leading-none text-black/75 md:text-4xl">
                  "{testimonial.text}"
                </p>

                <div className="relative mt-6 border-t border-black/5 pt-4">
                  <p className="font-bitter text-sm font-semibold italic text-gray-800 md:text-base">
                    - {testimonial.name}{" "}
                    <span className="font-normal opacity-70">
                      {testimonial.country}, {testimonial.date}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Social icons */}
            <div
              ref={socialRef}
              className="mx-auto mt-8 flex w-fit flex-col items-center gap-4"
            >
              <div className="flex items-center justify-center gap-3 opacity-70">
                <img className="h-5 w-5 object-cover" src="/icons/facebook.png" alt="" />
                <img className="h-5 w-5 object-cover" src="/icons/x.png" alt="" />
                <img className="h-5 w-5 object-cover" src="/icons/pinterest.png" alt="" />
                <img className="h-5 w-5 object-cover" src="/icons/mail.png" alt="" />
                <img className="h-5 w-5 object-cover" src="/icons/share.png" alt="" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2 - Gallery and Testimonials */}
      <section className="relative z-30 mx-auto w-full ">
        <img
          src="/assets/content/clip-art/section2-bg.png"
          className="absolute inset-0 -z-10 h-full w-full object-cover opacity-100"
          alt="background"
        />

        <div className="absolute z-0 h-1/6 w-full bg-white" />

        <TestimonialsSection />

        <div className="mx-auto max-w-5xl rounded-lg">
          <Gallery />
        </div>

        <div ref={leaveReviewRef} className="mx-auto flex max-w-5xl flex-col">
          <div className="z-10 my-10 flex w-full items-center justify-center rounded-[2rem] border border-black/5 bg-white p-8 font-bitter leading-none text-black shadow-xl shadow-black/5">
            <div className="flex w-1/4 gap-5">
              <img src="/icons/quote-green.png" className="h-12" alt="" />
              <img src="/icons/quote-green.png" className="h-12 opacity-60" alt="" />
            </div>

            <div className="w-3/4 leading-snug">
              <p className="font-frank text-4xl font-bold">Leave a review</p>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-black/55">
                Experience the Cape's wonders and leave your review here with
                the rest of our guest stories.
              </p>
            </div>
          </div>

          <div className="z-10 flex w-full -translate-y-[130%] items-start justify-end px-10">
            <div className="hero-gradient flex items-center gap-8 rounded-full px-8 py-2 text-white shadow-xl shadow-black/10">
              <button className="font-frank text-2xl">Proceed</button>
              <img src="/icons/go.png" alt="" className="h-8 w-8" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Stories;