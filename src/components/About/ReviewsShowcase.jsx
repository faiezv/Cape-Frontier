import React, { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import tours from '../../data/tours.js'
import allReviews from '../../data/reviews.js'
import { resolveTourImage } from '../../utils/ImageLoader.js'

// Import icons directly (or resolve via resolveImage)
import mapPinIcon from '../../../public/icons/mapPin.png'

gsap.registerPlugin(ScrollTrigger)

// Layout: first 3 reviews in the top row, next 4 in the bottom row,
// everything after that lives inside the collapsible "See more reviews" area.
const TOP_ROW_COUNT = 3
const BOTTOM_ROW_COUNT = 4

const pastelCards = [
  '#BEE9F7',
  '#D8F5C9',
  '#FFE08A',
  '#C9D7FF',
  '#FFD1A6',
]

const RATING_LABELS = ['Excellent', 'Amazing', 'Good', 'Decent', 'Terrible']

const getTier = (rating) => {
  if (rating >= 4.8) return 'Excellent'
  if (rating >= 4.4) return 'Amazing'
  if (rating >= 4.0) return 'Good'
  if (rating >= 3.2) return 'Decent'
  return 'Needs Work'
}

const getStarCount = (rating) => Math.max(1, Math.min(5, Math.round(rating)))

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
  // If the review has an explicit tourSlug, trust that and skip text matching.
  if (review.tourSlug && Array.isArray(tours)) {
    const exact = tours.find((tour) => tour.slug === review.tourSlug)
    if (exact) return exact
  }

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

// -----------------------------------------------------------------------------
// Single review card used in every row of the grid.
// -----------------------------------------------------------------------------
const ReviewCard = ({ review, index, delay = 0 }) => {
  const pastel = pastelCards[index % pastelCards.length]
  const location = getReviewLocation(review)
  const tour = getReviewTour(review)

  return (
    <motion.article
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, delay, ease: 'easeOut' }}
      className="relative flex h-full min-w-0 flex-col overflow-hidden rounded-[28px] border border-white/40 shadow-[0_18px_46px_rgba(15,10,113,0.10)]"
      style={{ backgroundColor: pastel }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.38),transparent_32%)]" />

      <div className="relative z-10 flex h-full flex-col">
        <div className="relative overflow-hidden">
          <img
            src={review.img}
            className="h-40 w-full object-cover"
            alt={tour?.title || review.tour || 'Tour'}
            loading="lazy"
          />

          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/30 to-transparent" />

          <div className="absolute right-3 top-3 rounded-full bg-white/85 px-3 py-1 text-[11px] font-bold text-black/70 shadow-sm backdrop-blur-sm">
            {review.rating} / 5
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-3 p-4">
          <div className="inline-flex w-fit max-w-full items-center gap-1.5 rounded-full bg-white/78 px-3 py-1 font-bitter text-[10px] font-black uppercase tracking-[0.16em] text-black/55 backdrop-blur-sm">
            <img src={mapPinIcon} className="h-3.5 w-3.5 shrink-0 object-contain" alt="" />
            <span className="truncate">{location}</span>
          </div>

          <div className="min-w-0">
            <p className="line-clamp-2 font-frank text-xl font-bold leading-tight text-black/80">
              {review.title}
            </p>

            <p className="mt-2 line-clamp-4 font-frank text-sm leading-snug text-black/68">
              {review.desc}
            </p>
          </div>

          <div className="mt-auto flex items-center justify-between gap-3 rounded-[20px] bg-white/50 px-3.5 py-3 shadow-inner backdrop-blur-[2px]">
            <div className="flex min-w-0 items-center gap-3">
              <img
                src={review.avatar}
                className="h-10 w-10 shrink-0 rounded-full border border-white/60 object-cover shadow-sm"
                alt={review.name}
                loading="lazy"
              />

              <div className="min-w-0">
                <p className="truncate font-frank text-sm font-bold text-black/80">
                  {review.name}
                </p>
                <p className="truncate text-xs text-black/50">{review.date}</p>
              </div>
            </div>

            {review.verified && (
              <div className="shrink-0 rounded-full bg-white/75 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-black/50 shadow-sm">
                Verified
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  )
}

function ReviewsShowcase({
  // Optional override. When omitted, the component reads directly from
  // src/data/reviews.js (only entries with verified: true). Pass `tourSlug`
  // to narrow it to one tour's reviews (e.g. embedded on a tour page).
  reviews,
  tourSlug,
  // Optional: override what happens on click. By default the button scrolls
  // to the element with id={reviewFormId} and asks it to open.
  onWriteReview,
  reviewFormId = 'leave-review',
}) {
  const [showMoreReviews, setShowMoreReviews] = useState(false)
  const sectionRef = useRef(null)

  // ---------------------------------------------------------------------------
  // Source list: explicit `reviews` prop wins if passed (even an empty array),
  // otherwise fall back to the moderated data: verified only, optionally
  // narrowed to a single tour via tourSlug.
  // ---------------------------------------------------------------------------
  const sourceReviews = useMemo(() => {
    if (reviews) return reviews

    const verified = allReviews.filter((r) => r.verified)

    if (!tourSlug) return verified

    const forTour = verified.filter((r) => r.tourSlug === tourSlug)
    // If this specific tour has no verified reviews yet, show the general
    // pool rather than an empty/broken grid.
    return forTour.length ? forTour : verified
  }, [reviews, tourSlug])

  // ---------------------------------------------------------------------------
  // Resolve all images in the reviews data (memoized)
  // ---------------------------------------------------------------------------
  const resolvedReviews = useMemo(() => {
    const list = sourceReviews.length ? sourceReviews : [
      {
        id: 'fallback',
        img: '/images/tours/default/1.webp', // fallback
        title: 'A truly memorable Cape Town route',
        desc: 'From the scenery to the pacing of the day...',
        name: 'Aaliyah M',
        date: 'May 2026',
        avatar: '/images/content/reviews/profile-photos/1.webp',
        rating: 5,
        verified: true,
      },
    ]

    return list.map((review, i) => ({
      ...review,
      img: resolveTourImage(review.img),
      avatar: resolveTourImage(
        review.avatar || `/images/content/reviews/profile-photos/${(i % 8) + 1}.webp`
      ),
    }))
  }, [sourceReviews])

  // ---------------------------------------------------------------------------
  // Row splitting: 3 on top, up to 4 on the bottom, the rest is collapsible.
  // ---------------------------------------------------------------------------
  const topRow = resolvedReviews.slice(0, TOP_ROW_COUNT)
  const bottomRow = resolvedReviews.slice(
    TOP_ROW_COUNT,
    TOP_ROW_COUNT + BOTTOM_ROW_COUNT
  )
  const extraReviews = resolvedReviews.slice(TOP_ROW_COUNT + BOTTOM_ROW_COUNT)

  // "See more" is hidden when there are 3 or fewer reviews overall.
  const showSeeMore = resolvedReviews.length > TOP_ROW_COUNT && extraReviews.length > 0

  // ---------------------------------------------------------------------------
  // Aggregate rating summary, computed from the reviews being displayed.
  // ---------------------------------------------------------------------------
  const stats = useMemo(() => {
    const total = resolvedReviews.length || 1
    const average =
      resolvedReviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) / total

    const distribution = [5, 4, 3, 2, 1].map((stars) => {
      const count = resolvedReviews.filter(
        (r) => getStarCount(Number(r.rating) || 0) === stars
      ).length
      return Math.round((count / total) * 100)
    })

    return {
      average: Math.round(average * 10) / 10,
      distribution,
      count: resolvedReviews.length,
    }
  }, [resolvedReviews])

  // Expanding/collapsing the extra reviews changes page height, so tell
  // ScrollTrigger to recalculate once the animation has had time to settle.
  useLayoutEffect(() => {
    const timer = window.setTimeout(() => ScrollTrigger.refresh(), 400)
    return () => window.clearTimeout(timer)
  }, [showMoreReviews])

  const handleWriteReview = (e) => {
    if (onWriteReview) {
      e.preventDefault()
      onWriteReview()
      return
    }

    const target = document.getElementById(reviewFormId)
    if (!target) return // no form on this page: fall back to the plain #anchor

    e.preventDefault()
    target.scrollIntoView({ behavior: 'smooth', block: 'center' })
    // Tells the form block to expand itself.
    window.dispatchEvent(new CustomEvent('open-review-form'))
  }

  return (
    <section
      ref={sectionRef}
      aria-label="Traveller reviews"
      className="relative mx-auto w-full max-w-6xl overflow-visible pb-12"
    >
      <div className="relative overflow-hidden rounded-[32px] bg-transparent">
        <div className="pointer-events-none absolute inset-0 rounded-[32px] bg-transparent" />
        <div className="pointer-events-none absolute inset-x-2 bottom-2 top-[58%] rounded-[30px] hero-gradient opacity-95 sm:inset-x-3 sm:bottom-3 sm:top-[54%]" />
        <div className="pointer-events-none absolute inset-0 rounded-[32px] border border-black/5" />

        <div className="relative z-10 flex w-full flex-col gap-5 px-2 pb-5 pt-5 sm:gap-6 sm:px-4 sm:pb-6 sm:pt-6 lg:px-6 lg:pb-8">
          {/* ---------- RATING SUMMARY ---------- */}
          <div className="grid grid-cols-1 gap-5 rounded-[28px] border border-black/6 bg-white/90 p-5 shadow-[0_22px_50px_rgba(15,10,113,0.07)] sm:p-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.2fr)] lg:items-center lg:gap-8 lg:p-7">
            <div className="flex items-center justify-between gap-4 lg:justify-start lg:gap-5">
              <div>
                <p className="font-frank text-xs uppercase tracking-[0.22em] text-black/50 sm:text-sm">
                  Overall Rating
                </p>

                <p className="mt-2 font-frank text-4xl font-bold leading-none text-green-700 sm:text-5xl">
                  {getTier(stats.average)}
                </p>

                <div className="mt-3 flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg
                        key={i}
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill={i < getStarCount(stats.average) ? '#22C55E' : '#FFFFFF'}
                        stroke="#22C55E"
                        strokeWidth="1.5"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                  </div>

                  <span className="font-frank text-xs text-black/50 sm:text-sm">
                    {stats.count} {stats.count === 1 ? 'review' : 'reviews'}
                  </span>
                </div>
              </div>

              <div className="rounded-2xl bg-green-50 px-4 py-3 text-center shadow-inner">
                <p className="font-frank text-2xl font-bold text-green-700 sm:text-3xl">
                  {stats.average}
                </p>

                <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-green-800/60">
                  out of 5
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              {RATING_LABELS.map((label, i) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="w-16 shrink-0 text-xs font-medium text-black/55 sm:w-20">
                    {label}
                  </span>

                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-black/8">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${stats.distribution[i]}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.7, ease: 'easeOut', delay: i * 0.06 }}
                      className="h-full rounded-full bg-green-500"
                    />
                  </div>

                  <span className="w-10 shrink-0 text-right text-xs text-black/45">
                    {stats.distribution[i]}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ---------- WRITE A REVIEW CTA ---------- */}
          <div className="flex justify-center">
            <a
              href={`#${reviewFormId}`}
              onClick={handleWriteReview}
              className="group flex items-center justify-center gap-3 rounded-2xl bg-green-600 px-6 py-4 font-frank text-base font-bold text-white shadow-[0_16px_34px_rgba(22,163,74,0.22)] transition hover:-translate-y-0.5 hover:bg-green-700 sm:text-lg"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="shrink-0"
              >
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
              </svg>

              <span className="tracking-[0.08em]">Write your review</span>
            </a>
          </div>

          {/* ---------- REVIEW CARDS ---------- */}
          <div className="flex flex-col gap-5 sm:gap-6">
            {/* top row: first 3 reviews */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
              {topRow.map((review, i) => (
                <ReviewCard
                  key={review.id ?? `top-${i}`}
                  review={review}
                  index={i}
                  delay={i * 0.07}
                />
              ))}
            </div>

            {/* bottom row: next 4 reviews */}
            {bottomRow.length > 0 && (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6">
                {bottomRow.map((review, i) => (
                  <ReviewCard
                    key={review.id ?? `bottom-${i}`}
                    review={review}
                    index={TOP_ROW_COUNT + i}
                    delay={i * 0.07}
                  />
                ))}
              </div>
            )}

            {/* collapsible: anything past 7 reviews; hidden for 3 or fewer */}
            {showSeeMore && (
              <>
                <AnimatePresence initial={false}>
                  {showMoreReviews && (
                    <motion.div
                      key="extra-reviews"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: 'easeOut' }}
                      className="overflow-hidden"
                    >
                      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6">
                        {extraReviews.map((review, i) => (
                          <ReviewCard
                            key={review.id ?? `extra-${i}`}
                            review={review}
                            index={TOP_ROW_COUNT + BOTTOM_ROW_COUNT + i}
                            delay={(i % 4) * 0.05}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex justify-center">
                  <motion.button
                    type="button"
                    onClick={() => setShowMoreReviews((current) => !current)}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    aria-expanded={showMoreReviews}
                    className="group flex items-center gap-3 rounded-full border border-black/10 bg-white px-5 py-3 font-bitter text-xs font-black uppercase tracking-[0.18em] text-black/70 shadow-[0_12px_28px_rgba(0,0,0,0.08)] transition duration-300 hover:border-blue-400/40 hover:text-blue-700"
                  >
                    <span>
                      {showMoreReviews
                        ? 'Show fewer reviews'
                        : `See more reviews (${extraReviews.length})`}
                    </span>

                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-200 text-black">
                      <Chevron open={showMoreReviews} />
                    </span>
                  </motion.button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default ReviewsShowcase