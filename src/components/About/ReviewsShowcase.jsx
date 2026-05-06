import React, { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import tours from '../../data/tours.js'

gsap.registerPlugin(ScrollTrigger)

const pastelCards = [
  '#BEE9F7', // Bo-Kaap sky blue
  '#D8F5C9', // soft mint green
  '#FFE08A', // warm pastel yellow
  '#C9D7FF', // pastel blue-lilac
  '#FFD1A6', // soft peach
]

const DefaultNumberBadge = ({ children }) => (
  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-black font-frank text-xl font-black text-white shadow-[0_12px_24px_rgba(0,0,0,0.12)] sm:h-16 sm:w-16 sm:text-2xl">
    {children}
  </div>
)

const getTier = (rating) => {
  if (rating >= 4.8) return 'Excellent'
  if (rating >= 4.4) return 'Amazing'
  if (rating >= 4.0) return 'Good'
  if (rating >= 3.2) return 'Decent'
  return 'Needs Work'
}

const getStarCount = (rating) => Math.max(1, Math.min(5, Math.round(rating)))

const formatReviewCode = (value) => {
  const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8)
  if (cleaned.length <= 4) return cleaned
  return `${cleaned.slice(0, 4)}-${cleaned.slice(4)}`
}

const getProfileAvatar = (index, fallbackAvatar) =>
  `/images/reviews/profile-photos/${(index % 8) + 1}.webp` || fallbackAvatar

const normalizeText = (value = '') =>
  String(value)
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()

const compactText = (value = '') => normalizeText(value).replace(/\s+/g, '')

const getReviewSearchText = (review = {}) =>
  normalizeText(
    [
      review.tour,
      review.tourTitle,
      review.tourName,
      review.route,
      review.title,
      review.desc,
      review.review,
    ]
      .filter(Boolean)
      .join(' ')
  )

const getTourSearchText = (tour = {}) =>
  normalizeText(
    [
      tour.title,
      tour.slug,
      tour.type,
      tour.category,
      tour.location,
      tour.duration,
      ...(tour.tags || []),
      ...(tour.highlights || []),
    ]
      .filter(Boolean)
      .join(' ')
  )

const findTourForReview = (review = {}) => {
  const reviewText = getReviewSearchText(review)
  const reviewCompact = compactText(reviewText)

  if (!reviewText || !Array.isArray(tours)) return null

  const exactMatch = tours.find((tour) => {
    const tourTitle = normalizeText(tour.title)
    const tourSlug = normalizeText(tour.slug)
    const tourCompact = compactText(tour.title)

    return (
      (tourTitle && reviewText.includes(tourTitle)) ||
      (tourSlug && reviewText.includes(tourSlug)) ||
      (tourCompact && reviewCompact.includes(tourCompact))
    )
  })

  if (exactMatch) return exactMatch

  const scoredTours = tours
    .map((tour) => {
      const tourText = getTourSearchText(tour)
      const titleWords = normalizeText(tour.title)
        .split(' ')
        .filter((word) => word.length > 3)

      const tagWords = [
        tour.type,
        tour.category,
        ...(tour.tags || []),
        ...(tour.highlights || []),
      ]
        .flatMap((value) => normalizeText(value).split(' '))
        .filter((word) => word.length > 3)

      const titleScore = titleWords.reduce(
        (score, word) => score + (reviewText.includes(word) ? 3 : 0),
        0
      )

      const tagScore = tagWords.reduce(
        (score, word) => score + (reviewText.includes(word) ? 1 : 0),
        0
      )

      const locationScore = normalizeText(tour.location)
        .split(' ')
        .filter((word) => word.length > 3)
        .reduce((score, word) => score + (reviewText.includes(word) ? 2 : 0), 0)

      const routeScore = tourText && reviewText.includes(tourText) ? 5 : 0

      return {
        tour,
        score: titleScore + tagScore + locationScore + routeScore,
      }
    })
    .sort((a, b) => b.score - a.score)

  return scoredTours[0]?.score > 0 ? scoredTours[0].tour : null
}

const getReviewTour = (review = {}) => findTourForReview(review)

const getReviewLocation = (review = {}) =>
  getReviewTour(review)?.location ||
  review.location ||
  review.tourLocation ||
  review.place ||
  review.route ||
  'Cape Town, South Africa'

const Chevron = ({ open }) => (
  <svg
    className={`h-4 w-4 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
)

const AnimatedNumberBadge = ({ children, NumberBadge }) => {
  const badgeRef = useRef(null)

  useLayoutEffect(() => {
    const badge = badgeRef.current

    if (!badge) return undefined

    const shine = badge.querySelector('.badge-shine')
    const wash = badge.querySelector('.badge-color-wash')

    const ctx = gsap.context(() => {
      gsap.set(badge, {
        transformOrigin: 'center center',
        force3D: true,
        willChange: 'transform',
      })

      gsap.set(shine, {
        xPercent: -150,
        force3D: true,
      })

      gsap.set(wash, {
        opacity: 0,
      })

      const tl = gsap.timeline({
        repeat: -1,
        repeatDelay: 1.35,
      })

      tl.to(
        badge,
        {
          scale: 1.025,
          duration: 1.2,
          yoyo: true,
          repeat: 1,
          ease: 'sine.inOut',
        },
        0
      )
        .to(
          wash,
          {
            opacity: 0.32,
            duration: 0.55,
            yoyo: true,
            repeat: 1,
            ease: 'sine.inOut',
          },
          0
        )
        .fromTo(
          shine,
          {
            xPercent: -150,
          },
          {
            xPercent: 260,
            duration: 0.62,
            ease: 'power2.inOut',
          },
          0.18
        )
        .fromTo(
          shine,
          {
            xPercent: -150,
          },
          {
            xPercent: 260,
            duration: 0.62,
            ease: 'power2.inOut',
          },
          0.9
        )
    }, badge)

    return () => ctx.revert()
  }, [])

  return (
    <div
      ref={badgeRef}
      className="relative inline-flex shrink-0 overflow-hidden rounded-[28px]"
    >
      <NumberBadge>{children}</NumberBadge>

      <span className="badge-color-wash pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(187,247,208,0.48),rgba(96,165,250,0.42),rgba(15,10,113,0.34))] mix-blend-screen" />
      <span className="badge-shine pointer-events-none absolute inset-y-0 left-[-65%] w-[46%] skew-x-[-22deg] bg-white/28" />
    </div>
  )
}

function ReviewsShowcase({
  reviews = [],
  NumberBadge = DefaultNumberBadge,
  onSeeAllReviews,
  onSubmitReview,
}) {
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0)
  const [isReviewAutoPlaying, setIsReviewAutoPlaying] = useState(true)
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false)
  const [reviewCode, setReviewCode] = useState('')
  const [reviewForm, setReviewForm] = useState({
    tour: '',
    title: '',
    rating: 5,
    review: '',
    name: '',
  })

  const sectionRef = useRef(null)
  const bannerShellRef = useRef(null)
  const bannerRef = useRef(null)
  const teaserButtonRef = useRef(null)
  const reviewCoupleRef = useRef(null)
  const mainReviewCardRef = useRef(null)
  const previousPreviewRef = useRef(null)
  const nextPreviewRef = useRef(null)
  const ratingPanelRef = useRef(null)
  const ratingBarRefs = useRef([])
  const autoplayProgressRef = useRef(null)
  const touchStartRef = useRef({ x: 0, y: 0 })

  const safeReviews = reviews.length
    ? reviews
    : [
        {
          img: './images/2.png',
          title: 'A truly memorable Cape Town route',
          desc: 'From the scenery to the pacing of the day, everything felt thoughtfully arranged. The guide made the route feel relaxed, informed, and personal.',
          name: 'Aaliyah M',
          date: 'May 2026',
          avatar: '/images/reviews/profile-photos/p2.png',
          rating: 4.9,
          breakdown: [72, 18, 7, 2, 1],
        },
      ]

  const review = safeReviews[currentReviewIndex]
  const previousReview =
    safeReviews[(currentReviewIndex - 1 + safeReviews.length) % safeReviews.length]
  const nextReview = safeReviews[(currentReviewIndex + 1) % safeReviews.length]

  const currentPastel = pastelCards[currentReviewIndex % pastelCards.length]
  const previousPastel =
    pastelCards[(currentReviewIndex - 1 + pastelCards.length) % pastelCards.length]
  const nextPastel = pastelCards[(currentReviewIndex + 1) % pastelCards.length]

  const currentTour = getReviewTour(review)
  const previousTour = getReviewTour(previousReview)
  const nextTour = getReviewTour(nextReview)

  const canSubmitReview =
    reviewCode.length === 9 &&
    reviewForm.title.trim() &&
    reviewForm.review.trim() &&
    reviewForm.name.trim()

  const tourOptions = useMemo(
    () => safeReviews.map((item) => item.title.replace(/\.\.\.$/, '')),
    [safeReviews]
  )

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      if (!bannerShellRef.current || !bannerRef.current) return

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: bannerShellRef.current,
          start: 'top 70%',
          end: 'top 40%',
          scrub: true,
        },
      })

      tl.fromTo(
        bannerRef.current,
        {
          y: 0,
          backgroundColor: 'rgba(255, 255, 255, 0)',
          boxShadow: '0 18px 40px rgba(0,0,0,0.05)',
        },
        {
          y: -8,
          backgroundColor: 'rgba(255,255,255,0.98)',
          boxShadow: '0 24px 60px rgba(15,10,113,0.12)',
          ease: 'none',
        },
        0
      )

      if (teaserButtonRef.current) {
        tl.fromTo(
          teaserButtonRef.current,
          {
            y: -50,
            opacity: 0,
          },
          {
            y: -16,
            opacity: 1,
            duration: 2,
            ease: 'sine.in',
          },
          0
        )
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [isReviewFormOpen])

  useLayoutEffect(() => {
    const mainCard = mainReviewCardRef.current
    const previousPreview = previousPreviewRef.current
    const nextPreview = nextPreviewRef.current
    const ratingPanel = ratingPanelRef.current
    const bars = ratingBarRefs.current.filter(Boolean)

    if (!mainCard) return undefined

    const ctx = gsap.context(() => {
      gsap.killTweensOf([mainCard, previousPreview, nextPreview, ratingPanel, ...bars].filter(Boolean))

      gsap.fromTo(
        mainCard,
        {
          autoAlpha: 0,
          y: 18,
          scale: 0.985,
          filter: 'blur(5px)',
        },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          filter: 'blur(0px)',
          duration: 0.42,
          ease: 'power3.out',
        }
      )

      gsap.fromTo(
        [previousPreview, nextPreview].filter(Boolean),
        {
          autoAlpha: 0,
          y: 12,
          scale: 0.96,
        },
        {
          autoAlpha: 0.42,
          y: 0,
          scale: 1,
          duration: 0.36,
          stagger: 0.06,
          ease: 'power2.out',
        }
      )

      if (ratingPanel) {
        gsap.fromTo(
          ratingPanel,
          {
            autoAlpha: 0,
            x: 16,
          },
          {
            autoAlpha: 1,
            x: 0,
            duration: 0.36,
            ease: 'power2.out',
          }
        )
      }

      if (bars.length) {
        bars.forEach((bar) => {
          const width = bar.dataset.width || '0%'
          gsap.fromTo(
            bar,
            {
              width: '0%',
            },
            {
              width,
              duration: 0.55,
              ease: 'power3.out',
            }
          )
        })
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [currentReviewIndex])


  useLayoutEffect(() => {
    if (!isReviewAutoPlaying || isReviewFormOpen || safeReviews.length <= 1) {
      gsap.killTweensOf(autoplayProgressRef.current)

      if (autoplayProgressRef.current) {
        gsap.set(autoplayProgressRef.current, {
          scaleX: 0,
          transformOrigin: 'left center',
        })
      }

      return undefined
    }

    const progress = autoplayProgressRef.current

    if (progress) {
      gsap.fromTo(
        progress,
        {
          scaleX: 0,
          transformOrigin: 'left center',
        },
        {
          scaleX: 1,
          duration: 5,
          ease: 'none',
        }
      )
    }

    const timer = window.setTimeout(() => {
      setCurrentReviewIndex((prevIndex) => (prevIndex + 1) % safeReviews.length)
    }, 5000)

    return () => {
      window.clearTimeout(timer)
      gsap.killTweensOf(progress)
    }
  }, [currentReviewIndex, isReviewAutoPlaying, isReviewFormOpen, safeReviews.length])

  const prev = () => {
    setCurrentReviewIndex(
      (prevIndex) => (prevIndex - 1 + safeReviews.length) % safeReviews.length
    )
  }

  const next = () => {
    setCurrentReviewIndex((prevIndex) => (prevIndex + 1) % safeReviews.length)
  }

  const handleManualPrev = () => {
    setIsReviewAutoPlaying(false)
    prev()
  }

  const handleManualNext = () => {
    setIsReviewAutoPlaying(false)
    next()
  }

  const handleReviewTouchStart = (e) => {
    const touch = e.touches[0]
    touchStartRef.current = { x: touch.clientX, y: touch.clientY }
  }

  const handleReviewTouchEnd = (e) => {
    const touch = e.changedTouches[0]
    const deltaX = touch.clientX - touchStartRef.current.x
    const deltaY = touch.clientY - touchStartRef.current.y

    if (Math.abs(deltaX) < 50) return
    if (Math.abs(deltaY) > Math.abs(deltaX)) return

    setIsReviewAutoPlaying(false)

    if (deltaX < 0) next()
    else prev()
  }

  const handleSeeAllReviews = () => {
    if (onSeeAllReviews) {
      onSeeAllReviews()
      return
    }

    console.log('See all reviews clicked')
  }

  const handleSubmitReview = (e) => {
    e.preventDefault()
    if (!canSubmitReview) return

    const payload = {
      code: reviewCode,
      ...reviewForm,
    }

    if (onSubmitReview) {
      onSubmitReview(payload)
      return
    }

    console.log('Review submitted', payload)
  }

  return (
    <section
      ref={sectionRef}
      aria-labelledby="reviews-showcase-title"
      className="relative mx-auto w-full max-w-5xl overflow-visible"
    >
      <div
        ref={reviewCoupleRef}
        className="relative overflow-hidden rounded-[32px] bg-transparent"
      >
        <div className="pointer-events-none absolute inset-0 rounded-[32px] bg-transparent" />
        <div className="pointer-events-none absolute inset-x-2 bottom-2 top-[58%] rounded-[30px] hero-gradient opacity-95 sm:inset-x-3 sm:bottom-3 sm:top-[54%]" />
        {/* <div className="pointer-events-none absolute inset-x-2 top-[52%] h-28 rounded-t-[30px] bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.70)_46%,rgba(255,255,255,0)_100%)] sm:inset-x-3 sm:top-[49%]" /> */}
        <div className="pointer-events-none absolute inset-0 rounded-[32px] border border-black/5" />

        <div className="relative z-10 flex w-full flex-col gap-5 px-2 pb-5 sm:gap-6 sm:px-4 sm:pb-6 lg:px-6 lg:pb-8">
      <div ref={bannerShellRef} className="relative h-full overflow-visible pt-8 pb-4 sm:pt-10 sm:pb-5">
        <div
          ref={bannerRef}
          className="relative z-20 overflow-hidden rounded-[28px] border border-black/6 bg-white/88 shadow-[0_14px_34px_rgba(15,10,113,0.06)]"
        >
          <div className="w-full text-left">
            <div className="flex flex-col gap-5 p-5 transition-colors sm:p-6 lg:p-8">
              <div className="flex min-w-0 items-center gap-4 sm:gap-5 md:gap-6">
                <div className="shrink-0">
                  <AnimatedNumberBadge NumberBadge={NumberBadge}>2</AnimatedNumberBadge>
                </div>

                <div className="min-w-0 flex-1">
                  <p
                    className="font-bitter text-[10px] font-black uppercase tracking-[0.2em] sm:text-sm sm:tracking-[0.24em]"
                    style={{ color: 'var(--color-brand-lightblue)' }}
                  >
                    Feedback step
                  </p>

                  <p
                    id="reviews-showcase-title"
                    className="mt-1 font-frank text-3xl font-semibold leading-[0.95] sm:mt-2 sm:text-5xl lg:text-6xl"
                    style={{ color: 'var(--color-brand-darkblue)' }}
                  >
                    Leave your review.
                  </p>
                </div>

                {isReviewFormOpen && (
                  <div className="hidden shrink-0 items-center gap-3 md:flex">
                    <button
                      type="button"
                      onClick={() => setIsReviewFormOpen(false)}
                      className="group flex items-center gap-3 rounded-full border border-black/10 bg-white px-4 py-2.5 font-bitter text-xs font-black uppercase tracking-[0.18em] text-black/70 shadow-[0_12px_28px_rgba(0,0,0,0.08)] transition duration-300 hover:-translate-y-0.5 hover:border-blue-400/40 hover:text-blue-700"
                    >
                      <span>Close form</span>

                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-green-200 text-black transition-transform duration-300 group-hover:translate-y-0.5">
                        <Chevron open />
                      </span>
                    </button>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <p className="max-w-2xl font-mont text-sm leading-7 text-black/60 sm:text-base md:text-lg">
                  <span className="font-bold text-black">Share your experience</span> using your
                  traveller code and help future guests discover what made your route memorable.
                </p>

                {isReviewFormOpen && (
                  <div className="flex items-center gap-3 self-start md:hidden">
                  <button
                    type="button"
                    onClick={() => setIsReviewFormOpen(false)}
                    className="group flex items-center gap-3 rounded-full border border-black/10 bg-white px-4 py-2.5 font-bitter text-xs font-black uppercase tracking-[0.18em] text-black/70 shadow-[0_12px_28px_rgba(0,0,0,0.08)] transition duration-300 hover:-translate-y-0.5 hover:border-blue-400/40 hover:text-blue-700"
                  >
                    <span>Close form</span>

                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-green-200 text-black transition-transform duration-300 group-hover:translate-y-0.5">
                      <Chevron open />
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>
          </div>

          <AnimatePresence initial={false}>
            {isReviewFormOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.28, ease: 'easeOut' }}
                className="overflow-hidden"
              >
                <form
                  onSubmit={handleSubmitReview}
                  className="grid gap-4 bg-white/92 p-5 sm:p-6 lg:grid-cols-2 lg:gap-5 lg:p-8"
                >
                  <div className="lg:col-span-2">
                    <label className="mb-2 block font-bitter text-xs font-black uppercase tracking-[0.18em] text-black/45">
                      Traveller code
                    </label>

                    <input
                      value={reviewCode}
                      onChange={(e) => setReviewCode(formatReviewCode(e.target.value))}
                      placeholder="AB12-CD34"
                      className="w-full rounded-2xl border border-black/10 bg-black/[0.03] px-4 py-3 font-mono text-base tracking-[0.2em] text-black outline-none transition focus:border-black/20 focus:bg-white"
                    />

                    <p className="mt-2 text-xs text-black/45">
                      Use your 8-character alphanumeric code in this format: XXXX-XXXX
                    </p>
                  </div>

                  <div>
                    <label className="mb-2 block font-bitter text-xs font-black uppercase tracking-[0.18em] text-black/45">
                      Tour
                    </label>

                    <select
                      value={reviewForm.tour}
                      onChange={(e) =>
                        setReviewForm((prevValue) => ({
                          ...prevValue,
                          tour: e.target.value,
                        }))
                      }
                      className="w-full rounded-2xl border border-black/10 bg-black/[0.03] px-4 py-3 font-mont text-black outline-none transition focus:border-black/20 focus:bg-white"
                    >
                      <option value="">Select a tour</option>

                      {tourOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block font-bitter text-xs font-black uppercase tracking-[0.18em] text-black/45">
                      Rating
                    </label>

                    <select
                      value={reviewForm.rating}
                      onChange={(e) =>
                        setReviewForm((prevValue) => ({
                          ...prevValue,
                          rating: Number(e.target.value),
                        }))
                      }
                      className="w-full rounded-2xl border border-black/10 bg-black/[0.03] px-4 py-3 font-mont text-black outline-none transition focus:border-black/20 focus:bg-white"
                    >
                      {[5, 4, 3, 2, 1].map((value) => (
                        <option key={value} value={value}>
                          {value} / 5
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block font-bitter text-xs font-black uppercase tracking-[0.18em] text-black/45">
                      Review title
                    </label>

                    <input
                      value={reviewForm.title}
                      onChange={(e) =>
                        setReviewForm((prevValue) => ({
                          ...prevValue,
                          title: e.target.value,
                        }))
                      }
                      placeholder="A route worth taking"
                      className="w-full rounded-2xl border border-black/10 bg-black/[0.03] px-4 py-3 font-mont text-black outline-none transition focus:border-black/20 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block font-bitter text-xs font-black uppercase tracking-[0.18em] text-black/45">
                      Your name
                    </label>

                    <input
                      value={reviewForm.name}
                      onChange={(e) =>
                        setReviewForm((prevValue) => ({
                          ...prevValue,
                          name: e.target.value,
                        }))
                      }
                      placeholder="Aaliyah M"
                      className="w-full rounded-2xl border border-black/10 bg-black/[0.03] px-4 py-3 font-mont text-black outline-none transition focus:border-black/20 focus:bg-white"
                    />
                  </div>

                  <div className="lg:col-span-2">
                    <label className="mb-2 block font-bitter text-xs font-black uppercase tracking-[0.18em] text-black/45">
                      Your review
                    </label>

                    <textarea
                      rows={5}
                      value={reviewForm.review}
                      onChange={(e) =>
                        setReviewForm((prevValue) => ({
                          ...prevValue,
                          review: e.target.value,
                        }))
                      }
                      placeholder="Tell future travellers what made this route special..."
                      className="w-full resize-none rounded-2xl border border-black/10 bg-black/[0.03] px-4 py-3 font-mont text-black outline-none transition focus:border-black/20 focus:bg-white"
                    />
                  </div>

                  <div className="flex flex-col gap-3 lg:col-span-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-black/45">
                      Reviews can only be submitted with a valid traveller code.
                    </p>

                    <div className="flex flex-col gap-3 sm:flex-row">
                      <button
                        type="button"
                        onClick={() => setIsReviewFormOpen(false)}
                        className="rounded-xl border border-black/10 px-5 py-3 font-bitter text-sm font-black text-black/70 transition hover:bg-black/[0.03]"
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        disabled={!canSubmitReview}
                        className="hero-gradient rounded-xl px-5 py-3 font-bitter text-sm font-black text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45"
                      >
                        Submit review
                      </button>
                    </div>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {!isReviewFormOpen && (
          <button
            ref={teaserButtonRef}
            type="button"
            onClick={() => {
              setIsReviewAutoPlaying(false)
              setIsReviewFormOpen(true)
            }}
            className="mx-auto flex max-w-md -translate-y-px items-center justify-center gap-3 rounded-b-full border border-black/8 bg-white px-5 py-3 font-bitter text-sm font-black text-black/65 transition-colors hover:text-blue-700"
          >
            Open review form
            <span className="rounded-full bg-green-100 px-2 py-1 font-bitter text-[10px] font-black uppercase tracking-[0.14em] text-green-800">
              Quick
            </span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-5 pb-0 sm:grid-cols-2 sm:items-stretch sm:gap-6">
        {/* left */}
        <div
          onTouchStart={handleReviewTouchStart}
          onTouchEnd={handleReviewTouchEnd}
          className="relative min-h-[410px] min-w-0 overflow-hidden rounded-[32px] sm:min-h-[430px] sm:h-full"
        >
          <div className="hidden sm:block leading-none">
            <div
              ref={previousPreviewRef}
              className="absolute left-0 top-7 h-[72%] w-[68%] overflow-hidden rounded-[28px] opacity-40 shadow-[0_16px_34px_rgba(0,0,0,0.08)]"
              style={{
                backgroundColor: previousPastel,
                transform: 'translateX(-12px) scale(0.95)',
              }}
            >
              <img
                src={previousReview.img}
                className="h-32 w-full object-cover opacity-75"
                alt="Previous review"
              />

              <div className="p-4">
                <p className="line-clamp-2 font-frank text-lg font-bold text-black/65">
                  {previousReview.title}...
                </p>

                <p className="mt-2 line-clamp-1 font-bitter text-[10px] font-black uppercase tracking-[0.14em] text-black/45">
                  {previousTour?.location || 'Cape Town, South Africa'}
                </p>
              </div>
            </div>

            <div
              ref={nextPreviewRef}
              className="absolute right-0 top-7 h-[72%] w-[68%] overflow-hidden rounded-[28px] opacity-40 shadow-[0_16px_34px_rgba(0,0,0,0.08)]"
              style={{
                backgroundColor: nextPastel,
                transform: 'translateX(12px) scale(0.95)',
              }}
            >
              <img
                src={nextReview.img}
                className="h-32 w-full object-cover opacity-75"
                alt="Next review"
              />

              <div className="p-4">
                <p className="line-clamp-2 font-frank text-lg font-bold text-black/65">
                  {nextReview.title}...
                </p>

                <p className="mt-2 line-clamp-1 font-bitter text-[10px] font-black uppercase tracking-[0.14em] text-black/45">
                  {nextTour?.location || 'Cape Town, South Africa'}
                </p>
              </div>
            </div>
          </div>

          <div
            key={currentReviewIndex}
            ref={mainReviewCardRef}
            className="relative z-10 h-full min-h-[410px] overflow-hidden rounded-[32px] border border-white/40 shadow-[0_22px_60px_rgba(0,0,0,0.10)] sm:min-h-[430px]"
            style={{ backgroundColor: currentPastel }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.38),transparent_32%)]" />

            <div className="relative z-10 flex h-full flex-col">
              <div className="relative overflow-hidden">
                <img
                  src={review.img}
                  className="h-44 w-full object-cover sm:h-48 lg:h-52"
                  alt="Tour"
                />

                <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/25 to-transparent" />


                <div className="absolute right-4 top-4 rounded-full bg-white/80 px-3 py-1 text-[11px] font-bold text-black/65 backdrop-blur-sm">
                  {review.rating} / 5
                </div>
              </div>

              <div className="flex flex-1 flex-col px-4 pb-4 pt-3 sm:gap-4 sm:p-5">
                <div className="min-w-0">
                  <div className="inline-flex w-fit max-w-full items-center gap-1.5 rounded-full bg-white/78 px-3 py-1 font-bitter text-[10px] font-black uppercase tracking-[0.16em] text-black/55 backdrop-blur-sm">
                    <img src="./icons/mapPin.png" className="h-3.5 w-3.5 shrink-0 object-contain" alt="" />
                    <span className="truncate">{currentTour?.location || getReviewLocation(review)}</span>
                    {currentTour?.title && (
                      <span className="sr-only">Matched tour: {currentTour.title}</span>
                    )}
                  </div>
                </div>

                <div className="mt-auto min-w-0 pt-7 sm:pt-0">
                  <p className="line-clamp-2 font-frank text-2xl font-bold leading-none text-black/80 sm:text-[1.85rem]">
                    {review.title}
                  </p>

                  <p className="mt-3 line-clamp-3 font-frank text-sm leading-snug text-black/68 sm:line-clamp-4 sm:text-[15px]">
                    {review.desc}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3 rounded-[22px] bg-white/45 px-4 py-3 backdrop-blur-[2px]">
                  <div className="flex min-w-0 items-center gap-3">
                    <img
                      src={getProfileAvatar(currentReviewIndex, review.avatar)}
                      className="h-11 w-11 shrink-0 rounded-full border border-white/50 object-cover shadow-sm"
                      alt="Reviewer"
                    />

                    <div className="min-w-0">
                      <p className="truncate font-frank text-sm font-bold text-black/80 sm:text-base">
                        {review.name}
                      </p>
                      <p className="text-xs text-black/50 sm:text-sm">{review.date}</p>
                    </div>
                  </div>

                  <div className="rounded-full bg-white/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-black/45">
                    Verified
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* mobile compact review controls */}
        <div className="sm:hidden">
          <div className="rounded-[24px] border border-black/6 bg-white/82 p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-bitter text-[10px] font-black uppercase tracking-[0.16em] text-black/40">
                  Traveller rating
                </p>

                <div className="mt-1 flex items-center gap-2">
                  <span className="font-frank text-2xl font-bold leading-none text-green-700">
                    {review.rating}
                  </span>
                  <span className="font-bitter text-[10px] font-black uppercase tracking-[0.12em] text-black/45">
                    / 5 · {getTier(review.rating)}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsReviewAutoPlaying((current) => !current)}
                className="inline-flex shrink-0 items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-2 font-bitter text-[10px] font-black uppercase tracking-[0.12em] text-black/60"
                aria-pressed={!isReviewAutoPlaying}
              >
                {isReviewAutoPlaying ? 'Pause' : 'Play'}
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full ${
                    isReviewAutoPlaying ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                  }`}
                  aria-hidden="true"
                >
                  {isReviewAutoPlaying ? 'Ⅱ' : '▶'}
                </span>
              </button>
            </div>

            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-black/10">
              <div
                ref={autoplayProgressRef}
                className="h-full origin-left rounded-full bg-green-600"
                style={{ transform: 'scaleX(0)' }}
              />
            </div>

            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={handleManualPrev}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white text-black/70"
                aria-label="Previous review"
              >
                <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>

              <div className="flex min-w-0 flex-1 items-center justify-center gap-1.5">
                {safeReviews.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setIsReviewAutoPlaying(false)
                      setCurrentReviewIndex(i)
                    }}
                    className={`h-2 rounded-full transition-all ${
                      i === currentReviewIndex ? 'w-7 bg-green-700' : 'w-2 bg-black/18'
                    }`}
                    aria-label={`Go to review ${i + 1}`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={handleManualNext}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white text-black/70"
                aria-label="Next review"
              >
                <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>

            <button
              type="button"
              onClick={handleSeeAllReviews}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-green-600 px-4 py-3 font-frank text-sm font-bold text-white"
            >
              <span className="tracking-[0.08em]">See all reviews</span>
              <img src="./icons/topRightArrow.png" className="h-4" alt="" />
            </button>
          </div>
        </div>

        {/* right */}
        <div ref={ratingPanelRef}
          className="hidden min-w-0 flex-col gap-5 rounded-[32px] border border-black/6 bg-white/88 p-4 sm:flex sm:h-full sm:p-5 lg:gap-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-frank text-xs uppercase tracking-[0.22em] text-black/50 sm:text-sm">
                  Overall Rating
                </p>

                <p className="mt-2 font-frank text-4xl font-bold leading-none text-green-700 sm:text-5xl">
                  {getTier(review.rating)}
                </p>
              </div>

              <div className="rounded-2xl bg-green-50 px-4 py-3 text-center">
                <p className="font-frank text-2xl font-bold text-green-700 sm:text-3xl">
                  {review.rating}
                </p>

                <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-green-800/60">
                  out of 5
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg
                    key={i}
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill={i < getStarCount(review.rating) ? '#22C55E' : '#FFFFFF'}
                    stroke="#22C55E"
                    strokeWidth="1.5"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>

              <span className="font-frank text-sm text-black/50">
                Based on recent traveller feedback
              </span>
            </div>

            <div className="mt-1 flex flex-col gap-3">
              {['Excellent', 'Amazing', 'Good', 'Decent', 'Terrible'].map((tier, i) => (
                <div key={tier} className="flex items-center gap-3">
                  <span className="w-16 shrink-0 text-xs font-medium text-black/55 sm:w-20">
                    {tier}
                  </span>

                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-black/10">
                    <div
                      ref={(el) => {
                        ratingBarRefs.current[i] = el
                      }}
                      data-width={`${review.breakdown[i]}%`}
                      className="h-full rounded-full bg-green-500"
                      style={{ width: `${review.breakdown[i]}%` }}
                    />
                  </div>

                  <span className="w-10 shrink-0 text-right text-xs text-black/45">
                    {review.breakdown[i]}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-auto flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={handleManualPrev}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-black/12 bg-white text-black/80 transition-colors hover:bg-black/5"
              >
                <svg
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>

              <button
                onClick={handleManualNext}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-black/12 bg-white text-black/80 transition-colors hover:bg-black/5"
              >
                <svg
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>

              <div className="ml-1 flex items-center gap-2">
                {safeReviews.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setIsReviewAutoPlaying(false)
                      setCurrentReviewIndex(i)
                    }}
                    className={`h-2.5 rounded-full transition-all ${
                      i === currentReviewIndex ? 'w-8 bg-green-700' : 'w-2.5 bg-black/18'
                    }`}
                    aria-label={`Go to review ${i + 1}`}
                  />
                ))}
              </div>            </div>

            <div className="h-1.5 overflow-hidden rounded-full bg-black/10">
              <div
                ref={autoplayProgressRef}
                className="h-full origin-left rounded-full bg-green-600"
                style={{ transform: 'scaleX(0)' }}
              />
            </div>

            <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-3">
              <button
                type="button"
                onClick={() => setIsReviewAutoPlaying((current) => !current)}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl border border-black/12 bg-white px-4 py-4 font-bitter text-[11px] font-black uppercase tracking-[0.14em] text-black/65 transition-colors hover:bg-black/5 sm:px-5"
                aria-pressed={!isReviewAutoPlaying}
              >
                {isReviewAutoPlaying ? 'Pause' : 'Play'}
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full ${
                    isReviewAutoPlaying ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                  }`}
                  aria-hidden="true"
                >
                  {isReviewAutoPlaying ? 'Ⅱ' : '▶'}
                </span>
              </button>

              <button
                type="button"
                onClick={handleSeeAllReviews}
                className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-green-600 px-5 py-4 font-frank text-base font-bold text-white shadow-[0_16px_34px_rgba(22,163,74,0.22)] transition hover:bg-green-700 sm:text-lg"
              >
                <span className="tracking-[0.08em]">See all reviews</span>

                <img
                  src="./icons/topRightArrow.png"
                  className="h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  alt=""
                />
              </button>
            </div>
          </div>
        </div>
      </div>
        </div>
      </div>
    </section>
  )
}

export default ReviewsShowcase