import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import DatePicker from 'react-datepicker'
import gsap from 'gsap'
import tours from '../../data/tours.js'
import 'react-datepicker/dist/react-datepicker.css'

import { useNavigate } from 'react-router-dom'
import { useLoadingNavigate } from "../useLoadingNavigate.jsx"

// -----------------------------------------------------------------------------
// data helpers (unchanged)
// -----------------------------------------------------------------------------
const FALLBACK_TOURS = [
  'Table Mountain Hike',
  'Cape Point Explorer',
  'Winelands & Franschhoek',
  'Boulders Beach Penguins',
  'Cape Town City Walk',
  'Stellenbosch Wine Route',
  'Robben Island Tour',
  "Chapman's Peak Sunset",
]

const getTourTitle = (tour) => {
  if (typeof tour === 'string') return tour
  return tour?.title || tour?.name || ''
}

const getTourImage = (tour) => {
  if (typeof tour === 'string') return './images/content/random/1.webp'

  return (
    tour?.image ||
    tour?.img ||
    tour?.cover ||
    tour?.gallery?.[0] ||
    tour?.images?.[0] ||
    './images/content/random/1.webp'
  )
}

const getTourLocation = (tour) => {
  if (typeof tour === 'string') return 'Cape Town, South Africa'
  return tour?.location || tour?.area || 'Cape Town, South Africa'
}

const getTourLink = (tour) => {
  if (typeof tour === 'string') return '#tours'
  return tour?.canonicalPath || (tour?.slug ? `/tours/${tour.slug}` : '#tours')
}

const formatTourPrice = (tour) => {
  if (typeof tour === 'string') return null

  const amount = tour?.priceBase ?? tour?.price ?? tour?.fromPrice
  const currency = tour?.baseCurrency || 'ZAR'

  if (!amount) return null

  try {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(Number(amount))
  } catch {
    return `${currency} ${Number(amount).toLocaleString('en-ZA')}`
  }
}

const getTourMeta = (tour) => {
  if (typeof tour === 'string') return 'Guided Cape Town experience'

  return [tour?.duration, tour?.category, tour?.type]
    .filter(Boolean)
    .join(' • ') || 'Guided Cape Town experience'
}

const getTourOptions = () => {
  if (!Array.isArray(tours) || !tours.length) {
    return FALLBACK_TOURS.map((title) => ({
      title,
      image: './images/content/random/1.webp',
      location: 'Cape Town, South Africa',
      meta: 'Guided Cape Town experience',
      price: null,
      duration: null,
      category: null,
      link: '#tours',
      raw: title,
    }))
  }

  const options = tours
    .map((tour) => ({
      title: getTourTitle(tour),
      image: getTourImage(tour),
      location: getTourLocation(tour),
      meta: getTourMeta(tour),
      price: formatTourPrice(tour),
      duration: tour?.duration || null,
      category: tour?.category || tour?.type || null,
      link: getTourLink(tour),
      raw: tour,
    }))
    .filter((tour) => tour.title)

  return options.length ? options : FALLBACK_TOURS.map((title) => ({
    title,
    image: './images/content/random/1.webp',
    location: 'Cape Town, South Africa',
    meta: 'Guided Cape Town experience',
    price: null,
    duration: null,
    category: null,
    link: '#tours',
    raw: title,
  }))
}

// -----------------------------------------------------------------------------
// component
// -----------------------------------------------------------------------------
function TourSelect() {
  const [destination, setDestination] = useState('')
  const [date, setDate] = useState(null)
  const [adults, setAdults] = useState(1)
  const [children, setChildren] = useState(0)
  const [participantsConfirmed, setParticipantsConfirmed] = useState(false)
  const [activeModal, setActiveModal] = useState(null)
  const [viewportWidth, setViewportWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  )
  const [mobileStep, setMobileStep] = useState(0)
  const [justCompletedStep, setJustCompletedStep] = useState(null)
  const [selectionFeedback, setSelectionFeedback] = useState(null)
  const [searchAttempted, setSearchAttempted] = useState(false)
  const [searchError, setSearchError] = useState(null)
  const [preventSameDay, setPreventSameDay] = useState(false) // dev-only toggle

  const mobileCardRef = useRef(null)
  const desktopTileRefs = useRef({})
  const errorBarRef = useRef(null)

  // Refs for animated text elements (mobile)
  const mobileValueTextRef = useRef(null)
  const mobilePreviewTextRef = useRef(null)

  // Refs for desktop tiles (value and preview per tile)
  const desktopValueRefs = useRef({})
  const desktopPreviewRefs = useRef({})

  // Refs for progress line animation
  const line1Ref = useRef(null)
  const line2Ref = useRef(null)

  const isMobileLayout = viewportWidth < 700
  const tourOptions = useMemo(() => getTourOptions(), [])

  const navigate = useLoadingNavigate()

  useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth)
    onResize()

    window.addEventListener('resize', onResize)

    return () => window.removeEventListener('resize', onResize)
  }, [])

  const formattedDate = date
    ? date.toLocaleDateString('en-ZA', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
    : 'Select date'

  const participants = adults + children

  const canSearch = Boolean(destination && date && participantsConfirmed)
  const hasDetails = Boolean(
    destination || date || adults !== 1 || children !== 0 || participantsConfirmed
  )

  const getRecommendedStep = () => {
    if (!destination) return 0
    if (!date) return 1
    if (!participantsConfirmed) return 2
    return 3
  }

  const recommendedStep = getRecommendedStep()

  useEffect(() => {
    if (!isMobileLayout) return

    setMobileStep((previousStep) => Math.min(previousStep, recommendedStep))
  }, [isMobileLayout, destination, date, participantsConfirmed, recommendedStep])

  useEffect(() => {
    if (!canSearch) return

    setSearchAttempted(false)
    setSearchError(null)
  }, [canSearch])

  // ✅ FIX: Animate progress lines when recommendedStep changes or on mount
  useLayoutEffect(() => {
    const animateLine = (lineRef, shouldFill) => {
      if (!lineRef.current) return
      gsap.killTweensOf(lineRef.current)
      gsap.to(lineRef.current, {
        width: shouldFill ? '100%' : '0%',
        duration: 0.5,
        ease: 'power2.out',
        overwrite: true,
      })
    }

    // Small delay to ensure DOM after state update
    const timeoutId = setTimeout(() => {
      animateLine(line1Ref, recommendedStep >= 1)
      animateLine(line2Ref, recommendedStep >= 2)
    }, 30)

    return () => clearTimeout(timeoutId)
  }, [recommendedStep])

  // Also set initial widths on mount (avoid flicker)
  useEffect(() => {
    if (line1Ref.current) line1Ref.current.style.width = recommendedStep >= 1 ? '100%' : '0%'
    if (line2Ref.current) line2Ref.current.style.width = recommendedStep >= 2 ? '100%' : '0%'
  }, [])

  // Improved modal scroll locking
  useEffect(() => {
    if (!activeModal) return;

    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalBodyPosition = document.body.style.position;
    const originalBodyTop = document.body.style.top;
    const scrollY = window.scrollY;

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';

    const allowScroll = (e) => {
      const scrollable = e.target.closest('.modal-scrollable');
      if (scrollable) return;
      e.preventDefault();
    };

    window.addEventListener('wheel', allowScroll, { passive: false });
    window.addEventListener('touchmove', allowScroll, { passive: false });

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.body.style.position = originalBodyPosition;
      document.body.style.top = originalBodyTop;
      document.body.style.width = '';
      window.scrollTo(0, scrollY);

      window.removeEventListener('wheel', allowScroll);
      window.removeEventListener('touchmove', allowScroll);
    };
  }, [activeModal]);

  const close = () => setActiveModal(null)

  // Core animation function with fade + translate and single feedback message
  const animateSavedFeedback = (
    stepIndex,
    nextStep,
    updatedValue,
    updatedPreview,
    targetStepIndex
  ) => {
    setJustCompletedStep(targetStepIndex)

    let valueEl, previewEl

    if (isMobileLayout) {
      valueEl = mobileValueTextRef.current
      previewEl = mobilePreviewTextRef.current
    } else {
      valueEl = desktopValueRefs.current[targetStepIndex]
      previewEl = desktopPreviewRefs.current[targetStepIndex]
    }

    if (!valueEl || !previewEl) {
      // Fallback
      setSelectionFeedback({
        id: Date.now(),
        stepIndex: targetStepIndex,
        text: stepIndex === 0 ? '✓ Tour saved' : stepIndex === 1 ? '✓ Date saved' : '✓ Guests saved',
      })
      setTimeout(() => {
        setJustCompletedStep(null)
        setSelectionFeedback(null)
        if (isMobileLayout) setMobileStep(Math.min(nextStep, 2))
      }, 650)
      return
    }

    const oldValue = valueEl.innerText
    const oldPreview = previewEl.innerText
    const feedbackText = stepIndex === 0 ? '✓ Tour saved' : stepIndex === 1 ? '✓ Date saved' : '✓ Guests saved'
    const originalValueColor = valueEl.style.color

    const tl = gsap.timeline({
      onComplete: () => {
        setJustCompletedStep(null)
        if (isMobileLayout) setMobileStep(Math.min(nextStep, 2))
      },
    })

    // Fade out and translate up both elements
    tl.to([valueEl, previewEl], {
      opacity: 0,
      y: -8,
      duration: 0.2,
      ease: 'power2.in',
    })
      // Change value text to feedback (green), keep preview text unchanged
      .call(() => {
        valueEl.innerText = feedbackText
        valueEl.style.color = '#16a34a' // green-600
      })
      // Fade in feedback (only value changes, preview fades back with old content)
      .set([valueEl, previewEl], { y: 6, opacity: 0 })
      .to([valueEl, previewEl], {
        opacity: 1,
        y: 0,
        duration: 0.25,
        ease: 'back.out(0.6)',
      })
      // Hold
      .to({}, { duration: 0.55 })
      // Fade out feedback + preview
      .to([valueEl, previewEl], {
        opacity: 0,
        y: -6,
        duration: 0.2,
        ease: 'power2.in',
      })
      // Restore updated values
      .call(() => {
        valueEl.innerText = updatedValue
        valueEl.style.color = originalValueColor || ''
        previewEl.innerText = updatedPreview
      })
      // Set initial position for updated values
      .set([valueEl, previewEl], { y: 8, opacity: 0 })
      // Fade in updated values with upward motion
      .to([valueEl, previewEl], {
        opacity: 1,
        y: 0,
        duration: 0.25,
        ease: 'back.out(0.7)',
      })
  }

  const completeStepWithDelay = (stepIndex, nextStep, updatedValue, updatedPreview, targetStepIndex) => {
    close()

    setTimeout(() => {
      animateSavedFeedback(stepIndex, nextStep, updatedValue, updatedPreview, targetStepIndex)
    }, 120)
  }

  useLayoutEffect(() => {
    if (!isMobileLayout || !mobileCardRef.current) return undefined

    const card = mobileCardRef.current

    gsap.killTweensOf(card)

    gsap.fromTo(
      card,
      {
        autoAlpha: 0,
        y: 14,
        scale: 0.985,
        filter: 'blur(4px)',
      },
      {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        filter: 'blur(0px)',
        duration: 0.26,
        ease: 'power2.out',
      }
    )

    return undefined
  }, [mobileStep, isMobileLayout])

  useEffect(() => {
    if (!searchError || !errorBarRef.current) return undefined

    const el = errorBarRef.current

    gsap.killTweensOf(el)

    gsap.fromTo(
      el,
      {
        height: 0,
        y: -10,
        autoAlpha: 0,
      },
      {
        height: 'auto',
        y: 0,
        autoAlpha: 1,
        duration: 0.28,
        ease: 'power2.out',
      }
    )

    const timer = window.setTimeout(() => {
      gsap.to(el, {
        height: 0,
        y: -8,
        autoAlpha: 0,
        duration: 0.24,
        ease: 'power2.in',
        onComplete: () => {
          setSearchError(null)
        },
      })
    }, 3600)

    return () => window.clearTimeout(timer)
  }, [searchError?.id])

  const getMissingDetails = () => {
    const missing = []

    if (!destination) missing.push('destination')
    if (!date) missing.push('date')
    if (!participantsConfirmed) missing.push('guests')

    return missing
  }

  const handleSearchClick = () => {
    if (!canSearch) {
      const missing = getMissingDetails()

      setSearchAttempted(true)
      setSearchError({
        id: Date.now(),
        message: `Please select ${missing.join(', ')} before searching.`,
      })

      if (isMobileLayout) {
        if (!destination) setMobileStep(0)
        else if (!date) setMobileStep(1)
        else if (!participantsConfirmed) setMobileStep(2)
      }

      return
    }

    setSearchError(null)

    const selectedTour = tourOptions.find(
      (tour) => tour.title === destination
    )

    if (!selectedTour) {
      setSearchError({
        id: Date.now(),
        message: 'Selected tour could not be found.',
      })
      return
    }

    const slug =
      selectedTour.raw?.slug ||
      selectedTour.raw?.canonicalPath?.split('/').pop()

    if (!slug) {
      setSearchError({
        id: Date.now(),
        message: 'Tour link is unavailable.',
      })
      return
    }

    navigate(`/tours/${slug}#booking`, {
      state: {
        bookingData: {
          destination,
          date: date ? date.toISOString() : null,
          adults,
          children,
          participants,
        },
      },
    })
  }

  const handleResetDetails = () => {
    setDestination('')
    setDate(null)
    setAdults(1)
    setChildren(0)
    setParticipantsConfirmed(false)
    setActiveModal(null)
    setMobileStep(0)
    setJustCompletedStep(null)
    setSelectionFeedback(null)
    setSearchAttempted(false)
    setSearchError(null)

    gsap.killTweensOf([mobileCardRef.current, ...Object.values(desktopTileRefs.current)].filter(Boolean))
  }

  // Card definitions
  const cards = useMemo(
    () => [
      {
        key: 'destination',
        label: 'Where?',
        value: destination || 'Select destination',
        preview: destination ? `Selected: ${destination}` : 'Choose your route first',
        icon: './icons/car.png',
        status: destination ? 'Done' : mobileStep === 0 ? 'Current' : 'Pending',
        complete: Boolean(destination),
        onClick: () => setActiveModal('destination'),
      },
      {
        key: 'date',
        label: 'When?',
        value: formattedDate,
        preview: destination
          ? date
            ? `${destination} • ${formattedDate}`
            : `${destination} selected`
          : 'Destination required first',
        icon: './icons/calendar.png',
        status: date ? 'Done' : mobileStep === 1 ? 'Current' : 'Pending',
        complete: Boolean(date),
        onClick: () => {
          if (!destination) {
            setMobileStep(0)
            setSearchError({
              id: Date.now(),
              message: 'Please select a destination before choosing a date.',
            })
            return
          }

          setActiveModal('date')
        },
      },
      {
        key: 'participants',
        label: 'Who?',
        value: `${participants} ${participants === 1 ? 'participant' : 'participants'}`,
        preview:
          destination && date
            ? participantsConfirmed
              ? `${adults} ${adults === 1 ? 'adult' : 'adults'}${children ? ` • ${children} ${children === 1 ? 'child' : 'children'}` : ''
              }`
              : 'Confirm adults and children'
            : 'Destination and date required first',
        icon: './icons/guest.png',
        status: participantsConfirmed ? 'Done' : mobileStep === 2 ? 'Current' : 'Pending',
        complete: Boolean(participantsConfirmed),
        onClick: () => {
          if (!destination) {
            setMobileStep(0)
            setSearchError({
              id: Date.now(),
              message: 'Please select a destination first.',
            })
            return
          }

          if (!date) {
            setMobileStep(1)
            setSearchError({
              id: Date.now(),
              message: 'Please select a date before choosing guests.',
            })
            return
          }

          setActiveModal('participants')
        },
      },
      {
        key: 'search',
        label: 'Ready?',
        value: canSearch ? 'Ready to search' : 'Complete booking details',
        preview: canSearch
          ? `${destination} • ${formattedDate} • ${adults} ${adults === 1 ? 'adult' : 'adults'
          }${children ? ` • ${children} ${children === 1 ? 'child' : 'children'}` : ''}`
          : 'Finish the selections to continue',
        icon: './icons/go.png',
        status: canSearch ? 'Ready' : mobileStep === 3 ? 'Current' : 'Pending',
        complete: canSearch,
        isSearch: true,
      },
    ],
    [destination, formattedDate, adults, children, participants, participantsConfirmed, canSearch, date, mobileStep]
  )

  const currentCard = cards[Math.min(mobileStep, 2)] || cards[0]

  const iconShellClass = (complete, isCurrent, isJustCompleted) => {
    if (isJustCompleted) return 'bg-green-300 text-green-950'
    if (complete) return 'bg-green-100 ring-1 ring-green-200'
    if (isCurrent) return 'bg-blue-50 ring-1 ring-blue-100'
    return 'bg-black/[0.04]'
  }

  const fieldCardClass = (complete, isCurrent, isJustCompleted) => {
    if (isJustCompleted) {
      return 'border-green-200 bg-white shadow-[0_14px_34px_rgba(34,197,94,0.12)]'
    }

    if (complete) {
      return 'border-green-100 bg-white shadow-[0_10px_26px_rgba(0,0,0,0.05)]'
    }

    if (isCurrent) {
      return 'border-blue-100 bg-white shadow-[0_14px_34px_rgba(59,130,246,0.10)]'
    }

    return 'border-black/8 bg-white shadow-[0_10px_26px_rgba(0,0,0,0.05)]'
  }

  const searchButtonClass = (complete, attempted) => {
    if (complete) {
      return 'hero-gradient hover:opacity-90 shadow-[0_14px_30px_rgba(34,197,94,0.18)]'
    }

    if (attempted) {
      return 'bg-red-400 hover:bg-red-400 shadow-[0_14px_30px_rgba(248,113,113,0.22)]'
    }

    return 'bg-[#020817] hover:bg-black shadow-[0_14px_30px_rgba(0,0,0,0.18)]'
  }

  const ResetIcon = () => (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 12a9 9 0 1 0 3-6.7" />
      <path d="M3 4v5h5" />
    </svg>
  )

  const SameDayToggle = () => {
    // Only show in development mode
    const isDev = typeof process !== 'undefined' && process.env.NODE_ENV === 'development'
    if (!isDev) return null

    return (
      <div className="flex items-center gap-2 shrink-0 ml-2">
        <button
          type="button"
          onClick={() => setPreventSameDay(!preventSameDay)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preventSameDay ? 'bg-blue-600' : 'bg-black/20'
            }`}
          aria-label="Prevent same-day bookings"
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preventSameDay ? 'translate-x-6' : 'translate-x-1'
              }`}
          />
        </button>
        <span className="font-mont text-[11px] font-black uppercase tracking-[0.08em] text-black/60">
          Block same-day
        </span>
      </div>
    )
  }

  const StepProgress = () => (
    <div className="flex w-full items-center gap-2">
      <span className={`hidden shrink-0 rounded-full px-3 py-1.5 font-bitter text-[10px] font-black uppercase tracking-[0.16em] sm:inline-flex ${canSearch
          ? 'bg-green-100 text-green-800 ring-1 ring-green-300'
          : 'bg-blue-100 text-blue-800 ring-1 ring-blue-200'
        }`}>
        {canSearch ? 'Ready to search' : `Step ${Math.min(mobileStep + 1, 3)} of 3`}
      </span>

      <div className="flex min-w-0 flex-1 items-center">
        {[1, 2, 3].map((stepNumber, index) => {
          const isActive = index === recommendedStep  // current step to complete
          const isDone = index < recommendedStep       // already completed

          return (
            <div key={stepNumber} className="flex min-w-0 flex-1 items-center last:flex-none">
              <button
                type="button"
                onClick={() => setMobileStep(Math.min(index, recommendedStep))}
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-bitter text-[11px] font-black tracking-normal transition-all duration-300 ${isDone
                    ? 'bg-green-300 text-green-950 shadow-[0_0_0_3px_rgba(134,239,172,0.35)]'
                    : isActive
                      ? 'bg-blue-600 text-white shadow-[0_10px_24px_rgba(37,99,235,0.22)]'
                      : 'bg-black/7 text-black/40'
                  }`}
                aria-label={`Go to step ${stepNumber}`}
              >
                {stepNumber}
              </button>

              {index < 2 && (
                <div className="relative mx-2 h-px flex-1 bg-black/14 overflow-hidden">
                  <div
                    ref={index === 0 ? line1Ref : line2Ref}
                    className="absolute left-0 top-0 h-full bg-blue-500 will-change-[width]"
                    style={{ width: index === 0 ? (recommendedStep >= 1 ? '100%' : '0%') : (recommendedStep >= 2 ? '100%' : '0%') }}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>

      <SameDayToggle />

      <span className={`shrink-0 rounded-full px-2.5 py-1 font-bitter text-[9px] font-black uppercase tracking-[0.12em] sm:hidden ${canSearch
          ? 'bg-green-100 text-green-800 ring-1 ring-green-300'
          : 'bg-blue-100 text-blue-800 ring-1 ring-blue-200'
        }`}>
        {canSearch ? 'Ready' : 'Current'}
      </span>

      <button
        type="button"
        onClick={handleResetDetails}
        disabled={!hasDetails}
        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-black/8 bg-white text-black/45 transition hover:text-blue-700 disabled:pointer-events-none disabled:opacity-30"
        aria-label="Reset booking details"
        title="Reset details"
      >
        <ResetIcon />
      </button>
    </div>
  )

  const handleMobileContinue = () => {
    if (canSearch && mobileStep >= 2) {
      handleSearchClick()
      return
    }

    if (!currentCard.complete) {
      currentCard.onClick()
      return
    }

    setMobileStep((previousStep) => Math.min(2, previousStep + 1))
  }

  // Selection handlers with animation
  const handleDestinationSelect = (tourTitle) => {
    const newValue = tourTitle
    const newPreview = `Selected: ${tourTitle}`
    setDestination(tourTitle)
    setParticipantsConfirmed(false)
    completeStepWithDelay(0, 1, newValue, newPreview, 0)
  }

  const handleDateSelect = (selectedDate) => {
    const newFormattedDate = selectedDate.toLocaleDateString('en-ZA', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
    const newValue = newFormattedDate
    const newPreview = destination ? `${destination} • ${newFormattedDate}` : newFormattedDate
    setDate(selectedDate)
    setParticipantsConfirmed(false)
    completeStepWithDelay(1, 2, newValue, newPreview, 1)
  }

  const handleParticipantsConfirm = () => {
    const newValue = `${participants} ${participants === 1 ? 'participant' : 'participants'}`
    const newPreview = `${adults} ${adults === 1 ? 'adult' : 'adults'}${children ? ` • ${children} ${children === 1 ? 'child' : 'children'}` : ''
      }`
    setParticipantsConfirmed(true)
    completeStepWithDelay(2, 3, newValue, newPreview, 2)
  }

  // Custom day renderer for date picker to show red cross on disabled days
  const renderDayContents = (day, dateObj) => {
    const isToday = dateObj && new Date().toDateString() === dateObj.toDateString()
    const isDisabled = preventSameDay && isToday

    return (
      <div className="relative flex items-center justify-center">
        <span>{day}</span>
        {isDisabled && (
          <span className="absolute inset-0 flex items-center justify-center text-red-500 text-lg font-bold opacity-80">
            ✗
          </span>
        )}
      </div>
    )
  }

  const modalNode =
    activeModal && typeof document !== 'undefined'
      ? createPortal(
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-4 backdrop-blur-md"
          onClick={close}
        >
          <div
            className={`modal-content flex max-h-[88vh] w-full flex-col overflow-hidden rounded-2xl bg-white font-mont shadow-2xl sm:max-h-[85vh] ${activeModal === 'date'
                ? 'max-w-md sm:max-w-lg md:max-w-xl'
                : activeModal === 'participants'
                  ? 'max-w-[94vw] sm:max-w-md'
                  : 'max-w-[94vw] sm:max-w-xl'
              }`}
            onClick={(event) => event.stopPropagation()}
            style={{ animation: 'modal-in 0.2s ease both' }}
          >
            <div className="flex items-center justify-end px-3 py-2 text-black sm:px-4">
              <button
                type="button"
                onClick={close}
                className="flex h-8 w-8 items-center justify-center rounded-full text-black/40 transition-colors hover:bg-gray-100 hover:text-black"
                aria-label="Close"
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {activeModal === 'destination' && (
              <div className="modal-scrollable max-h-[76vh] overflow-y-auto overscroll-contain pb-2 sm:max-h-[34rem]">
                {tourOptions.map((tour) => {
                  const selected = destination === tour.title

                  return (
                    <div
                      key={tour.title}
                      className={`mx-2 mb-1.5 rounded-2xl border transition ${selected
                          ? 'border-green-400 bg-green-100'
                          : 'border-black/8 bg-white hover:bg-blue-50/40'
                        }`}
                    >
                      <div className="flex w-full items-center gap-2.5 p-2 text-left sm:p-2.5">
                        <button
                          type="button"
                          onClick={() => handleDestinationSelect(tour.title)}
                          className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
                        >
                          <img
                            src={tour.image}
                            className="h-14 w-16 shrink-0 rounded-xl object-cover sm:h-16 sm:w-20"
                            alt=""
                            loading="lazy"
                            decoding="async"
                          />

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <p className="line-clamp-2 font-frank text-sm font-black leading-tight text-black/82 sm:text-base">
                                {tour.title}
                              </p>

                              {selected && (
                                <svg
                                  className="h-4 w-4 shrink-0 text-green-700"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2.5"
                                  aria-hidden="true"
                                >
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              )}
                            </div>

                            <div className="mt-1 flex flex-wrap items-center gap-1.5">
                              <span className="line-clamp-1 rounded-full bg-black/[0.04] px-2 py-0.5 font-mont text-[10px] text-black/55">
                                {tour.location}
                              </span>

                              {tour.duration && (
                                <span className="rounded-full bg-blue-50 px-2 py-0.5 font-mont text-[10px] text-blue-800">
                                  {tour.duration}
                                </span>
                              )}

                              {tour.price && (
                                <span className="rounded-full bg-green-100 px-2 py-0.5 font-bitter text-[10px] font-black text-green-800">
                                  From {tour.price}
                                </span>
                              )}
                            </div>
                          </div>
                        </button>

                        <a
                          href={tour.link}
                          onClick={(event) => event.stopPropagation()}
                          className="inline-flex shrink-0 items-center gap-1 rounded-full bg-blue-100 px-2.5 py-1.5 font-bitter text-[9px] font-black uppercase tracking-[0.1em] text-blue-800 transition hover:bg-blue-200"
                        >
                          Details
                          <svg
                            className="h-3 w-3"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <path d="M7 17 17 7" />
                            <path d="M9 7h8v8" />
                          </svg>
                        </a>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {activeModal === 'date' && (
              <div className="flex justify-center p-4 pb-6 sm:p-6 md:p-8">
                <div className="datepicker-large">
                  <DatePicker
                    selected={date}
                    onChange={handleDateSelect}
                    minDate={new Date()}
                    renderDayContents={renderDayContents}
                    filterDate={(dateObj) => {
                      if (preventSameDay) {
                        const today = new Date()
                        return dateObj.toDateString() !== today.toDateString()
                      }
                      return true
                    }}
                    inline
                  />
                </div>
              </div>
            )}

            {activeModal === 'participants' && (
              <div className="px-4 pb-5 pt-2 text-black sm:px-6 sm:pb-6">
                <div className="mb-4 flex justify-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-blue-50 shadow-md ring-1 ring-blue-200">
                    <img
                      src="./icons/guest.png"
                      className="h-10 w-auto"
                      alt="Guests"
                      aria-hidden="true"
                    />
                  </div>
                </div>

                <div className="grid gap-3">
                  <div className="flex items-center justify-between gap-4 rounded-2xl border border-black/8 bg-black/[0.02] px-4 py-3">
                    <div>
                      <p className="font-bitter text-sm font-black uppercase tracking-[0.12em]">
                        Adults
                      </p>
                      <p className="font-mont text-xs text-black/40">Ages 13+</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setAdults((previous) => Math.max(1, previous - 1))
                          setParticipantsConfirmed(false)
                        }}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-black/20 text-lg transition-colors hover:border-black disabled:opacity-30"
                        disabled={adults === 1}
                      >
                        −
                      </button>

                      <span className="w-7 text-center font-mont text-base">{adults}</span>

                      <button
                        type="button"
                        onClick={() => {
                          setAdults((previous) => Math.min(20, previous + 1))
                          setParticipantsConfirmed(false)
                        }}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-black/20 text-lg transition-colors hover:border-black"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4 rounded-2xl border border-black/8 bg-black/[0.02] px-4 py-3">
                    <div>
                      <p className="font-bitter text-sm font-black uppercase tracking-[0.12em]">
                        Children
                      </p>
                      <p className="font-mont text-xs text-black/40">Ages 0–12</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setChildren((previous) => Math.max(0, previous - 1))
                          setParticipantsConfirmed(false)
                        }}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-black/20 text-lg transition-colors hover:border-black disabled:opacity-30"
                        disabled={children === 0}
                      >
                        −
                      </button>

                      <span className="w-7 text-center font-mont text-base">{children}</span>

                      <button
                        type="button"
                        onClick={() => {
                          setChildren((previous) => Math.min(20, previous + 1))
                          setParticipantsConfirmed(false)
                        }}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-black/20 text-lg transition-colors hover:border-black"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl bg-green-50 px-4 py-3 font-mont text-xs text-green-800 ring-1 ring-green-200">
                  Total guests: <span className="font-bold">{participants}</span>
                </div>

                <button
                  type="button"
                  onClick={handleParticipantsConfirm}
                  className="mt-4 w-full rounded-xl bg-black py-3 font-bitter text-sm font-black uppercase tracking-[0.12em] text-white transition-colors hover:bg-black/80"
                >
                  Confirm guests
                </button>
              </div>
            )}
          </div>
        </div>,
        document.body
      )
      : null

  return (
    <>
      <div className="relative mx-auto w-full max-w-5xl overflow-visible rounded-[26px] border border-black/8 bg-white/92 p-3 shadow-[0_18px_50px_rgba(15,23,42,0.10)] sm:rounded-[28px] sm:p-4">
        <div className="mb-3 px-1">
          <StepProgress />
        </div>

        {isMobileLayout ? (
          <div className="rounded-[22px] bg-white">
            <button
              ref={mobileCardRef}
              type="button"
              onClick={currentCard.isSearch ? handleSearchClick : currentCard.onClick}
              className={`flex min-h-[128px] w-full items-center gap-4 rounded-[22px] border px-4 text-left transition-all duration-300 ${fieldCardClass(
                currentCard.complete,
                currentCard.status === 'Current',
                justCompletedStep === mobileStep
              )}`}
            >
              <div
                className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full transition-colors duration-300 ${iconShellClass(
                  currentCard.complete,
                  currentCard.status === 'Current',
                  justCompletedStep === mobileStep
                )}`}
              >
                <img
                  src={currentCard.icon}
                  className="h-7 w-auto"
                  alt=""
                  aria-hidden="true"
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-1.5 font-bitter text-[11px] font-black uppercase tracking-[0.18em] text-black/35">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-300" />
                  {currentCard.label}
                </div>

                <div
                  ref={mobileValueTextRef}
                  className="truncate font-frank text-xl font-black leading-tight text-[#020817]"
                >
                  {currentCard.value}
                </div>

                <div
                  ref={mobilePreviewTextRef}
                  className="mt-1 line-clamp-2 font-mont text-sm text-black/45"
                >
                  {currentCard.preview}
                </div>
              </div>
            </button>

            <div className="mt-4 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setMobileStep((previousStep) => Math.max(0, previousStep - 1))}
                disabled={mobileStep === 0}
                className="rounded-2xl border border-black/10 px-5 py-3 font-bitter text-sm font-black text-black/45 transition hover:bg-black/[0.03] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Back
              </button>

              <button
                type="button"
                onClick={handleMobileContinue}
                className={`flex min-w-[9.5rem] items-center justify-center gap-2 rounded-2xl px-5 py-3 font-bitter text-sm font-black uppercase tracking-[0.08em] text-white transition ${canSearch && mobileStep >= 2
                    ? searchButtonClass(canSearch, searchAttempted)
                    : 'bg-[#020817] hover:bg-black shadow-[0_14px_30px_rgba(0,0,0,0.18)]'
                  }`}
              >
                <span>{canSearch && mobileStep >= 2 ? 'Search' : 'Continue'}</span>
                <img
                  src={canSearch && mobileStep >= 2 ? './icons/go.png' : './icons/topRightArrow.png'}
                  className="h-4 w-auto"
                  alt=""
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>
        ) : (
          <div className="grid max-w-full overflow-hidden rounded-[22px] border border-black/8 bg-white min-[700px]:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_190px] min-[1100px]:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_220px]">
            {cards.slice(0, 3).map((card, index) => (
              <button
                key={card.key}
                ref={(el) => {
                  desktopTileRefs.current[index] = el
                }}
                type="button"
                onClick={card.onClick}
                className={`group flex min-w-0 items-center gap-3 border-black/8 bg-white px-4 py-4 text-left transition-all duration-300 hover:bg-blue-50/35 sm:px-5 sm:py-5 min-[700px]:min-h-[92px] min-[700px]:px-3 min-[900px]:px-5 ${index < 2
                    ? 'border-b min-[700px]:border-b-0 min-[700px]:border-r'
                    : 'border-b min-[700px]:border-b-0 min-[700px]:border-r'
                  }`}
              >
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-colors duration-300 group-hover:scale-105 ${card.complete ? 'bg-green-100 ring-1 ring-green-200' : 'bg-black/[0.04]'
                    }`}
                >
                  <img src={card.icon} className="h-6 w-auto" alt="" aria-hidden="true" />
                </div>

                <div className="min-w-0 flex-1">
                  <div
                    ref={(el) => {
                      desktopValueRefs.current[index] = el
                    }}
                    className="truncate font-frank text-base font-black text-black/75"
                  >
                    {card.value}
                  </div>

                  <div
                    ref={(el) => {
                      desktopPreviewRefs.current[index] = el
                    }}
                    className="mt-0.5 hidden truncate font-mont text-xs text-black/40 sm:block"
                  >
                    {card.preview}
                  </div>
                </div>
              </button>
            ))}

            <div className="min-w-0 bg-white p-3 sm:p-4 min-[700px]:p-3 min-[1100px]:p-4">
              <button
                type="button"
                onClick={handleSearchClick}
                className={`flex h-full min-h-[60px] w-full max-w-full items-center justify-center gap-2 rounded-full px-5 py-3 font-bitter text-base font-black uppercase tracking-[0.08em] text-white transition sm:text-lg ${searchButtonClass(
                  canSearch,
                  searchAttempted
                )}`}
              >
                <span>Search</span>
                <img src="./icons/go.png" className="h-5 w-auto sm:h-6" alt="" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-2 flex w-fit max-w-5xl items-center gap-2 rounded-2xl border border-green-300/80 bg-green-100/95 px-3 py-2">
        <img
          src="./icons/savemore.png"
          className="h-5 w-5 shrink-0 object-contain"
          alt=""
          aria-hidden="true"
        />
        <p className="truncate font-bitter text-[11px] font-black uppercase tracking-[0.1em] text-green-900">
          Save more when you book as a group
        </p>
      </div>

      {searchError && (
        <div className="mx-auto w-full max-w-5xl px-2">
          <div
            ref={errorBarRef}
            className="mt-2 overflow-hidden rounded-2xl border border-red-200 bg-red-50/95 shadow-[0_14px_34px_rgba(248,113,113,0.14)] backdrop-blur-md"
          >
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v5" />
                  <path d="M12 16h.01" />
                </svg>
              </div>

              <div className="min-w-0">
                <p className="font-bitter text-sm font-black text-red-700">Missing details</p>
                <p className="truncate font-mont text-xs text-red-600/80">{searchError.message}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {modalNode}

      <style>{`
        @keyframes modal-in {
          from {
            opacity: 0;
            transform: scale(0.96) translateY(6px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        .modal-scrollable {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 #f1f5f9;
          overscroll-behavior: contain;
        }
        
        .modal-scrollable::-webkit-scrollbar {
          width: 6px;
        }
        
        .modal-scrollable::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        
        .modal-scrollable::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        
        .modal-scrollable::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        
        .datepicker-large .react-datepicker {
          font-size: 1.1rem;
          width: 100%;
        }
        
        .datepicker-large .react-datepicker__month-container {
          width: 100%;
        }
        
        .datepicker-large .react-datepicker__day-name,
        .datepicker-large .react-datepicker__day,
        .datepicker-large .react-datepicker__time-name {
          width: 2.8rem;
          line-height: 2.8rem;
          margin: 0.2rem;
        }
        
        .datepicker-large .react-datepicker__header {
          padding-top: 0.8rem;
        }
        
        .datepicker-large .react-datepicker__current-month {
          font-size: 1.3rem;
          padding: 0.5rem 0;
        }
        
        .datepicker-large .react-datepicker__navigation {
          top: 1rem;
        }
        
        .datepicker-large .react-datepicker__day--selected,
        .datepicker-large .react-datepicker__day--keyboard-selected {
          background-color: #2563eb;
          border-radius: 0.75rem;
        }
        
        /* Style for disabled day with red cross */
        .react-datepicker__day--disabled {
          position: relative;
          cursor: not-allowed;
        }
        
        @media (max-width: 640px) {
          .datepicker-large .react-datepicker__day-name,
          .datepicker-large .react-datepicker__day,
          .datepicker-large .react-datepicker__time-name {
            width: 2.2rem;
            line-height: 2.2rem;
            margin: 0.1rem;
            font-size: 0.9rem;
          }
        }
      `}</style>
    </>
  )
}

export default TourSelect
