import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'

import { formatMoney } from './Helpers.jsx'

// Slightly darker than before so the buttons read against bright hero photos.
const actionBtn =
  'inline-flex items-center justify-center gap-2 rounded-full bg-sky-500 px-6 py-3 font-bitter text-xs font-black uppercase tracking-[0.08em] text-white shadow-[0_8px_20px_rgba(0,0,0,0.25)] transition hover:bg-sky-600 active:scale-95 disabled:cursor-wait disabled:opacity-90 sm:px-8 sm:py-3.5 sm:text-sm'

// Headline shown in the featured panel (featured tour only) — replaces the
// tour name with the campaign line.
const FEATURED_HEADLINE = 'Be the reason a child smiles today'

const DESCRIPTION_MAX_LINES = 3

// Formatted at render time so a currency change is picked up immediately
const formatPrice = (tour) => {
  if (!tour?.priceAmount) return null
  try {
    return formatMoney(Number(tour.priceAmount), tour.priceCurrency)
  } catch (error) {
    return `${tour.priceCurrency} ${Number(tour.priceAmount).toFixed(2)}`
  }
}

const SpinnerIcon = ({ className = 'h-4 w-4' }) => (
  <svg
    className={`animate-spin ${className}`}
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <circle
      cx="12"
      cy="12"
      r="9"
      stroke="currentColor"
      strokeOpacity="0.25"
      strokeWidth="3"
    />
    <path
      d="M21 12a9 9 0 0 0-9-9"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
    />
  </svg>
)

// Keeps a paragraph to N lines. If the text overflows, it truncates by
// binary-search and appends " (...)" so the reader sees a literal indicator.
// Falls back to plain rendering when nothing is truncated.
function ClampedDescription({ text, className = '', lines = DESCRIPTION_MAX_LINES }) {
  const ref = useRef(null)
  const [value, setValue] = useState(text || '')

  useLayoutEffect(() => {
    const el = ref.current
    if (!el || !text) {
      setValue(text || '')
      return undefined
    }

    let cancelled = false

    const measure = () => {
      if (cancelled) return
      const cs = getComputedStyle(el)
      const lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.5
      const maxH = lh * lines
      const width = el.clientWidth
      if (!width) return

      const probe = document.createElement('div')
      probe.style.cssText =
        'position:absolute;visibility:hidden;pointer-events:none;left:-9999px;top:0;white-space:pre-wrap;word-break:break-word;' +
        `width:${width}px;` +
        `font-family:${cs.fontFamily};font-size:${cs.fontSize};font-style:${cs.fontStyle};font-weight:${cs.fontWeight};` +
        `line-height:${cs.lineHeight};letter-spacing:${cs.letterSpacing};word-spacing:${cs.wordSpacing};`
      document.body.appendChild(probe)

      probe.textContent = text
      if (probe.scrollHeight <= maxH + 1) {
        setValue(text)
        document.body.removeChild(probe)
        return
      }

      let lo = 0
      let hi = text.length
      let best = ''
      while (lo <= hi) {
        const mid = (lo + hi) >> 1
        probe.textContent = text.slice(0, mid).trimEnd() + ' (...)'
        if (probe.scrollHeight <= maxH + 1) {
          best = probe.textContent
          lo = mid + 1
        } else {
          hi = mid - 1
        }
      }
      setValue(best || text.trimEnd() + ' (...)')
      document.body.removeChild(probe)
    }

    measure()

    if (typeof document !== 'undefined' && document.fonts?.ready) {
      document.fonts.ready.then(() => measure())
    }

    window.addEventListener('resize', measure)

    return () => {
      cancelled = true
      window.removeEventListener('resize', measure)
    }
  }, [text, lines])

  return (
    <p ref={ref} className={`line-clamp-3 ${className}`}>
      {value}
    </p>
  )
}

// Featured tour + tour cards.
//
// - Click a card to preview it; click the same card again to return to the
//   featured tour. Scrolling the card grid also returns to the featured tour.
// - The filter dropdown, currency selector and close button live in the parent
//   modal header (TourSelect.jsx) and float transparently over the panel.
// - `onSeeDetails(tour)` should route via the app's client-side navigator
//   so the framer-motion page transition curtain covers the modal while it's
//   still open (the parent navigates without closing first). This component
//   shows a spinner on the See details button while that navigation is in
//   flight; the modal unmounts naturally once the old page exits.
//   When `onSeeDetails` is absent, a plain <a href> is used instead.
function DestinationModal({
  tourOptions,
  selectedTitle,
  featuredId,
  onSelect,
  onSeeDetails,
  filterType = 'all',
}) {
  const [loading, setLoading] = useState(true)
  const [activeTitle, setActiveTitle] = useState(null)
  const [detailsLoading, setDetailsLoading] = useState(false)

  const cardRefs = useRef([])
  const gridRef = useRef(null)

  const filteredTours = useMemo(
    () => (filterType === 'all' ? tourOptions : tourOptions.filter((t) => t.type === filterType)),
    [tourOptions, filterType]
  )

  const featuredTour = useMemo(
    () => tourOptions.find((t) => t.id === featuredId) || tourOptions[0],
    [tourOptions, featuredId]
  )

  const previewTour =
    (activeTitle && tourOptions.find((t) => t.title === activeTitle)) || featuredTour

  const isFeatured = Boolean(previewTour && featuredId != null && previewTour.id === featuredId)
  const previewPrice = formatPrice(previewTour)
  const headingText = isFeatured ? FEATURED_HEADLINE : previewTour?.title || ''

  const choose = (title) => {
    setActiveTitle((current) => (current === title ? null : title))
  }

  // See details: route links navigate without closing (the parent handles
  // that so the curtain covers the modal). Spinner only for route links —
  // hash links resolve on the same page and the modal closes instead.
  const handleDetailsClick = () => {
    if (!previewTour || detailsLoading) return
    if (!onSeeDetails) return
    const isRoute =
      typeof previewTour.link === 'string' && previewTour.link.startsWith('/')
    if (isRoute) setDetailsLoading(true)
    onSeeDetails(previewTour)
  }

  // Safety net: if navigation is ever blocked, don't leave the button stuck.
  useEffect(() => {
    if (!detailsLoading) return undefined
    const t = window.setTimeout(() => setDetailsLoading(false), 8000)
    return () => window.clearTimeout(t)
  }, [detailsLoading])

  // Scrolling the card grid returns the panel to the featured tour.
  useEffect(() => {
    const el = gridRef.current
    if (!el) return undefined
    let raf = 0
    const reset = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => setActiveTitle(null))
    }
    el.addEventListener('scroll', reset, { passive: true })
    return () => {
      el.removeEventListener('scroll', reset)
      cancelAnimationFrame(raf)
    }
  }, [])

  useEffect(() => {
    setLoading(true)
    const hidden = cardRefs.current.filter(Boolean)
    if (hidden.length) gsap.set(hidden, { opacity: 0, y: 12 })

    const timer = setTimeout(() => {
      setLoading(false)
      const rows = cardRefs.current.filter(Boolean)
      if (rows.length) {
        gsap.to(rows, {
          opacity: 1,
          y: 0,
          stagger: 0.04,
          duration: 0.4,
          ease: 'power2.out',
          clearProps: 'opacity,transform',
        })
      }
    }, 300)

    return () => {
      clearTimeout(timer)
      const rows = cardRefs.current.filter(Boolean)
      if (rows.length) gsap.killTweensOf(rows)
    }
  }, [filterType])

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      {previewTour && (
        <div
          key={previewTour.title}
          className="tour-preview-fade relative min-h-[clamp(300px,38vh,380px)] w-full shrink-0 overflow-hidden bg-black"
        >
          <img
            src={previewTour.image}
            alt={previewTour.title}
            className="absolute inset-0 h-full w-full object-cover"
            loading="eager"
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent" />

          <div className="relative flex min-h-[clamp(300px,38vh,380px)] flex-col justify-end gap-2 p-5 pt-14 sm:gap-2.5 sm:p-6 sm:pt-16">
            {isFeatured && (
              <span className="w-fit rounded-full bg-white/20 px-3 py-1 font-bitter text-[11px] font-black uppercase tracking-[0.16em] text-white ring-1 ring-white/30 backdrop-blur-md sm:text-xs">
                ✨ Featured tour
              </span>
            )}

            {!isFeatured && previewTour.tagline && (
              <p className="font-bitter text-[11px] font-bold uppercase tracking-[0.2em] text-sky-300 drop-shadow sm:text-xs">
                {previewTour.tagline}
              </p>
            )}

            <h2 className="max-w-2xl font-frank text-3xl font-black leading-tight text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.55)] sm:text-4xl">
              {headingText}
            </h2>

            {previewTour.description && (
              <ClampedDescription
                text={previewTour.description}
                className="max-w-2xl font-mont text-base font-medium leading-relaxed text-white/90 drop-shadow-[0_2px_6px_rgba(0,0,0,0.55)] sm:text-lg sm:leading-relaxed"
              />
            )}

            <div className="mt-1 flex flex-wrap items-center gap-3">
              {onSeeDetails ? (
                <button
                  type="button"
                  onClick={handleDetailsClick}
                  disabled={detailsLoading}
                  aria-busy={detailsLoading || undefined}
                  className={actionBtn}
                >
                  {detailsLoading ? (
                    <>
                      <SpinnerIcon className="h-4 w-4" />
                      <span>Loading</span>
                    </>
                  ) : (
                    'See details'
                  )}
                </button>
              ) : (
                <a href={previewTour.link} className={actionBtn}>
                  See details
                </a>
              )}

              <button
                type="button"
                onClick={() => onSelect(previewTour.title, previewTour.id)}
                className={actionBtn}
              >
                Book now
              </button>

              {previewPrice && (
                <span className="font-mont text-base font-bold text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.55)] sm:text-lg">
                  From {previewPrice}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      <div
        ref={gridRef}
        className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6"
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        data-lenis-prevent
      >
        {loading && (
          <div className="pointer-events-none absolute inset-x-0 top-10 z-10 flex justify-center">
            <div className="tour-loader-dots">
              <span />
              <span />
              <span />
            </div>
          </div>
        )}

        {filteredTours.length === 0 ? (
          <div className="flex h-32 items-center justify-center font-mont text-sm text-black/40">
            No tours match this type.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
            {filteredTours.map((tour, index) => {
              const isConfirmed = selectedTitle === tour.title
              const isPreviewed = previewTour?.title === tour.title
              return (
                <button
                  key={tour.title}
                  ref={(el) => {
                    cardRefs.current[index] = el
                  }}
                  type="button"
                  onClick={() => choose(tour.title)}
                  aria-pressed={isPreviewed}
                  className={`relative h-36 w-full overflow-hidden rounded-2xl bg-neutral-900 text-left transition-all duration-200 sm:h-44 ${
                    isPreviewed
                      ? 'scale-[1.02] ring-[3px] ring-sky-400 shadow-[0_12px_26px_rgba(56,189,248,0.35)]'
                      : 'ring-2 ring-transparent'
                  }`}
                  style={{ opacity: 0, transform: 'translateY(12px)', willChange: 'transform, opacity' }}
                >
                  <img
                    src={tour.image}
                    alt=""
                    loading="eager"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  <div className="absolute inset-x-0 bottom-0 p-3.5 sm:p-4">
                    <p className="line-clamp-2 font-frank text-base font-black leading-tight text-white drop-shadow sm:text-lg">
                      {tour.title}
                    </p>
                    {tour.duration && (
                      <p className="mt-1 font-mont text-xs font-semibold text-white/75">
                        {tour.duration}
                      </p>
                    )}
                  </div>

                  {isConfirmed && (
                    <span className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-green-500 shadow-md">
                      <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>

      <style>{`
        .tour-preview-fade { animation: tour-preview-in 0.3s ease-out both; }
        @keyframes tour-preview-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .tour-loader-dots { display: flex; align-items: center; justify-content: center; gap: 8px; }
        .tour-loader-dots span {
          display: block; width: 12px; height: 12px; border-radius: 50%;
          background: #38bdf8;
          animation: tourDotPulse 1.2s ease-in-out infinite both;
        }
        .tour-loader-dots span:nth-child(1) { animation-delay: -0.32s; }
        .tour-loader-dots span:nth-child(2) { animation-delay: -0.16s; }
        @keyframes tourDotPulse {
          0%, 80%, 100% { transform: scale(0.5); opacity: 0.3; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}

export default DestinationModal