import React, { useLayoutEffect, useMemo, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import TestimonialsSection from './TestimonialsSection'
import Gallery from './GoalsGallery'
import reviews from '../../data/reviews.js'
import ContactPlatforms from '../ContactPlatforms.jsx'

gsap.registerPlugin(ScrollTrigger)

// ============================================================
// 1. STORY MEDIA + REVIEW HELPERS
// ============================================================

const storyImages = [
  '/images/tours/hiking/platteklip/1.webp',
  '/images/tours/hiking/platteklip/3.webp',
  '/images/tours/historical/robben-island/1.webp',
]

const fallbackTestimonial = {
  text:
    "The most incredible experience of my life. Cape Town's beauty from the ocean was breathtaking. The guides were professional and kind.",
  title: 'A memorable Cape Town experience',
  name: 'Sarah Johnson',
  country: 'USA',
  date: 'March 2024',
  rating: 5,
}

const getLatestReview = () => {
  if (!Array.isArray(reviews) || reviews.length === 0) return fallbackTestimonial

  const latest = reviews[reviews.length - 1]

  return {
    text:
      latest.desc ||
      latest.review ||
      latest.mainReview ||
      latest.text ||
      fallbackTestimonial.text,
    title:
      latest.title ||
      latest.tour ||
      latest.tourTitle ||
      latest.tourName ||
      fallbackTestimonial.title,
    name:
      latest.name ||
      latest.mainReviewerName ||
      latest.reviewerName ||
      fallbackTestimonial.name,
    country:
      latest.country ||
      latest.mainReviewerCountry ||
      latest.reviewerCountry ||
      fallbackTestimonial.country,
    date:
      latest.date ||
      latest.reviewDate ||
      latest.reviewYear ||
      fallbackTestimonial.date,
    rating: latest.rating || latest.stars || fallbackTestimonial.rating,
  }
}

const clampRating = (rating) => Math.max(0, Math.min(5, Number(rating) || 0))

// ============================================================
// 2. MAIN COMPONENT
// ============================================================

const Stories = () => {
  const sectionRef = useRef(null)
  const cardShellRef = useRef(null)
  const imageFrameRef = useRef(null)
  const imageRefs = useRef([])
  const quoteRef = useRef(null)
  const testimonialTextRef = useRef(null)
  const headingRef = useRef(null)
  const copyRef = useRef(null)
  const buttonsRef = useRef(null)
  const recentBadgeRef = useRef(null)
  const reviewMetaRef = useRef(null)
  const leaveReviewRef = useRef(null)

  const testimonial = useMemo(() => getLatestReview(), [])
  const rating = clampRating(testimonial.rating)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const images = imageRefs.current.filter(Boolean).slice(0, 3)

      gsap.set(cardShellRef.current, {
        autoAlpha: 0,
        y: 44,
        scale: 0.985,
      })

      gsap.set(imageFrameRef.current, {
        autoAlpha: 0,
        y: 80,
        rotate: -2,
        scale: 0.94,
      })

      gsap.set(images, {
        yPercent: 115,
        scale: 1.14,
        autoAlpha: 1,
        willChange: 'transform',
      })

      if (images[0]) {
        gsap.set(images[0], {
          yPercent: 0,
          scale: 1.08,
        })
      }

      gsap.set([quoteRef.current, testimonialTextRef.current], {
        autoAlpha: 0,
        y: 22,
      })

      gsap.set('.story-heading-word', {
        yPercent: 112,
        rotate: 2,
      })

      gsap.set([copyRef.current, buttonsRef.current, recentBadgeRef.current, reviewMetaRef.current], {
        autoAlpha: 0,
        y: 18,
      })

      if (reducedMotion) {
        gsap.set(
          [
            cardShellRef.current,
            imageFrameRef.current,
            quoteRef.current,
            testimonialTextRef.current,
            copyRef.current,
            buttonsRef.current,
            recentBadgeRef.current,
            reviewMetaRef.current,
          ],
          {
            autoAlpha: 1,
            y: 0,
            rotate: 0,
            scale: 1,
          }
        )

        gsap.set('.story-heading-word', {
          yPercent: 0,
          rotate: 0,
        })

        return
      }

      const introTl = gsap.timeline({
        defaults: {
          ease: 'power3.out',
        },
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 82%',
          end: 'top 38%',
          scrub: 0.9,
          invalidateOnRefresh: true,
        },
      })

      introTl
        .to(cardShellRef.current, {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.7,
        })
        .to(
          imageFrameRef.current,
          {
            autoAlpha: 1,
            y: 0,
            rotate: 0,
            scale: 1,
            duration: 0.78,
          },
          0.08
        )
        .to(
          quoteRef.current,
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.45,
          },
          0.14
        )
        .to(
          testimonialTextRef.current,
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.55,
          },
          0.22
        )
        .to(
          '.story-heading-word',
          {
            yPercent: 0,
            rotate: 0,
            duration: 0.55,
            stagger: 0.055,
            ease: 'power4.out',
          },
          0.28
        )
        .to(copyRef.current, { autoAlpha: 1, y: 0, duration: 0.42 }, 0.44)
        .to(buttonsRef.current, { autoAlpha: 1, y: 0, duration: 0.42 }, 0.5)
        .to(recentBadgeRef.current, { autoAlpha: 1, y: 0, duration: 0.36 }, 0.56)
        .to(reviewMetaRef.current, { autoAlpha: 1, y: 0, duration: 0.36 }, 0.62)

      if (images.length > 1) {
        const imageStackTl = gsap.timeline({
          scrollTrigger: {
            trigger: imageFrameRef.current,
            start: 'top 72%',
            endTrigger: cardShellRef.current,
            end: 'bottom 44%',
            scrub: 1.35,
            invalidateOnRefresh: true,
          },
        })

        images.forEach((image, index) => {
          if (index === 0) return

          imageStackTl
            .to(
              image,
              {
                yPercent: 0,
                scale: 1.08,
                duration: 1,
                ease: 'none',
              },
              index - 1
            )
            .to(
              images[index - 1],
              {
                yPercent: -42,
                scale: 1.02,
                duration: 1,
                ease: 'none',
              },
              index - 1
            )
        })
      }

      gsap.fromTo(
        leaveReviewRef.current,
        {
          autoAlpha: 0,
          y: 42,
          scale: 0.98,
        },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: leaveReviewRef.current,
            start: 'top 86%',
            end: 'top 52%',
            scrub: 0.8,
          },
        }
      )

      ScrollTrigger.refresh()
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <div
      ref={sectionRef}
      className="relative w-full overflow-hidden bg-white text-black"
      id="stories"
    >
      {/* ============================================================
          SECTION 1: REAL STORIES HERO
      ============================================================ */}
      <section className="relative z-30 w-full px-4 pt-8 sm:px-6 md:pt-12">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-[-12rem] top-20 h-96 w-96 rounded-full bg-green-200/45 blur-3xl" />
          <div className="absolute right-[-10rem] top-44 h-[30rem] w-[30rem] rounded-full bg-blue-200/30 blur-3xl" />
          <div className="absolute left-1/2 top-[34rem] h-80 w-80 -translate-x-1/2 rounded-full bg-yellow-100/35 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-5xl">
          <div
            ref={cardShellRef}
            className="overflow-hidden rounded-[2rem] border border-black/5 bg-white/88 p-4 shadow-[0_22px_70px_rgba(0,0,0,0.10)] backdrop-blur-md sm:p-5 md:p-6 lg:p-8"
          >
            {/* Top centered quote + latest testimonial */}
            <div className="mx-auto mb-7 max-w-4xl text-center md:my-24">
              <img
                ref={quoteRef}
                src="/icons/quote-green.png"
                className="mx-auto h-12 w-12 object-contain sm:h-14 sm:w-14"
                alt=""
                aria-hidden="true"
              />

              <p
                ref={testimonialTextRef}
                className="mt-4 font-frank text-4xl font-light leading-[0.95] tracking-[-0.04em] text-black/82 sm:text-5xl md:text-6xl lg:text-7xl"
              >
                “{testimonial.text}”
              </p>

              <div className="mx-auto mt-5 flex w-full max-w-2xl flex-col items-center gap-3 sm:mt-6 sm:flex-row sm:justify-center">
                <div
                  ref={recentBadgeRef}
                  className="inline-flex items-center gap-2 rounded-full border border-green-300/70 bg-green-200 px-4 py-2 font-bitter text-[10px] font-black uppercase tracking-[0.14em] text-green-950 shadow-[0_12px_26px_rgba(34,197,94,0.12)]"
                >
                  <img src="/icons/recent.png" alt="" className="h-4 w-4" />
                  <span>Recent testimonial</span>
                </div>

                <div
                  ref={reviewMetaRef}
                  className="flex w-full max-w-md flex-wrap items-center justify-center gap-2 rounded-full border border-black/6 bg-black/[0.025] px-4 py-2 sm:w-auto sm:justify-start"
                >
                  <div className="min-w-0 text-center sm:text-left">
                    <p className="truncate font-bitter text-sm font-semibold text-black/80">
                      {testimonial.name}
                    </p>
                    <p className="font-bitter text-xs text-black/48">
                      {testimonial.country}, {testimonial.date}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <svg
                        key={index}
                        className="h-3.5 w-3.5"
                        viewBox="0 0 24 24"
                        fill={index < Math.round(rating) ? '#22C55E' : 'none'}
                        stroke="#22C55E"
                        strokeWidth="1.6"
                        aria-hidden="true"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid items-center gap-6 lg:grid-cols-[0.96fr_1.04fr] lg:gap-8">
              {/* Left image frame: only 3 sliding images */}
              <div
                ref={imageFrameRef}
                className="relative min-h-[320px] w-full overflow-hidden rounded-[1.6rem] bg-black shadow-[0_24px_60px_rgba(10,38,20,0.16)] sm:min-h-[380px] md:min-h-[430px]"
              >
                {storyImages.map((src, index) => (
                  <img
                    key={src}
                    ref={(el) => {
                      imageRefs.current[index] = el
                    }}
                    src={src}
                    className="absolute inset-0 h-full w-full object-cover"
                    alt={`Cape Frontier guest story ${index + 1}`}
                    loading={index === 0 ? 'eager' : 'lazy'}
                    decoding={index === 0 ? 'sync' : 'async'}
                  />
                ))}

                <div className="absolute inset-0 bg-gradient-to-t from-blue-950/68 via-black/12 to-black/5" />

                <div className="absolute left-4 top-4 rounded-full border border-white/20 bg-white/14 px-3 py-2 font-bitter text-[10px] font-black uppercase tracking-[0.2em] text-white backdrop-blur-md">
                  Guest moments
                </div>

              </div>

              {/* Right story content */}
              <div className="flex w-full flex-col justify-center self-center">
                <div className="flex w-full flex-col justify-center lg:py-6">
                  <div>
                    <div
                      ref={headingRef}
                      className="overflow-hidden font-frank text-5xl font-bold leading-none tracking-tight text-black sm:text-6xl lg:text-7xl"
                    >
                      <span className="story-heading-word inline-block">REAL</span>{' '}
                      <span className="story-heading-word inline-block">STORIES.</span>
                    </div>

                    <div className="mt-2 overflow-hidden font-frank text-3xl font-bold leading-none tracking-tight sm:text-4xl lg:text-5xl">
                      <span className="story-heading-word inline-block bg-gradient-to-r from-green-700 via-emerald-500 to-blue-700 bg-clip-text text-transparent">
                        Beyond the Ordinary.
                      </span>
                    </div>

                    <p
                      ref={copyRef}
                      className="mt-5 max-w-xl font-bitter text-sm leading-relaxed text-black/58 sm:text-base"
                    >
                      Real guest feedback helps future travellers understand the
                      pace, atmosphere, and care behind each Cape Frontier route.
                      Explore recent stories, then choose the tour that feels right
                      for your own group.
                    </p>
                  </div>

                  <div ref={buttonsRef} className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <button className="flex min-h-[3.4rem] items-center justify-center rounded-full border border-blue-400/45 bg-white px-6 py-3 font-bitter text-sm font-semibold text-blue-700 shadow-[0_12px_28px_rgba(0,0,0,0.05)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-500 hover:text-white">
                      Read their stories
                    </button>

                    <button className="hero-gradient flex min-h-[3.4rem] items-center justify-center rounded-full px-6 py-3 font-bitter text-sm font-semibold text-white shadow-[0_14px_32px_rgba(0,0,0,0.10)] transition-all duration-300 hover:-translate-y-0.5">
                      View Tours
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ============================================================
          SECTION 2: TESTIMONIALS + GALLERY
      ============================================================ */}
      <section className="relative z-30 mx-auto w-full pt-8">
        <img
          src="/assets/content/clip-art/section1-bg.png"
          className="absolute inset-0 -z-10 h-full w-full object-cover opacity-100"
          alt=""
          aria-hidden="true"
        />

        {/* white backround offset */}
        <div className="absolute top-0 z-0 h-1/5 md:h-1/8  w-full bg-white" />

        <TestimonialsSection />

        <div className="mx-auto max-w-5xl rounded-lg px-4 sm:px-6 lg:px-0">
          <Gallery />
        </div>

        <ContactPlatforms className='w-5xl mx-auto ' />
        {/* <div ref={leaveReviewRef} className="mx-auto flex max-w-5xl flex-col px-4 sm:px-6 lg:px-0">
          <div className="z-10 my-10 grid w-full gap-5 rounded-[2rem] border border-black/5 bg-white p-6 font-bitter leading-none text-black shadow-[0_18px_45px_rgba(0,0,0,0.08)] sm:p-8 md:grid-cols-[0.25fr_0.75fr] md:items-center">
            <div className="flex gap-4">
              <img src="/icons/quote-green.png" className="h-10 sm:h-12" alt="" />
              <img src="/icons/quote-green.png" className="h-10 opacity-60 sm:h-12" alt="" />
            </div>

            <div className="leading-snug">
              <p className="font-frank text-4xl font-bold">Leave a review</p>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-black/55">
                After your Cape Frontier experience, use your traveller code to
                share feedback and help future guests choose with confidence.
              </p>

              <button className="hero-gradient mt-5 flex w-fit items-center gap-4 rounded-full px-6 py-3 text-white shadow-xl shadow-black/10">
                <span className="font-frank text-xl">Proceed</span>
                <img src="/icons/go.png" alt="" className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div> */}
      </section>
    </div>
  )
}

export default Stories