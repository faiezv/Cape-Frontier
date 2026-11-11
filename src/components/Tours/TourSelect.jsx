import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import DatePicker from 'react-datepicker'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import { resolveTourImage } from '../../utils/ImageLoader.js'
import tours from '../../data/tours.js'
import 'react-datepicker/dist/react-datepicker.css'

import { useLoadingNavigate } from '../useLoadingNavigate.jsx'
import CurrencySelector from './CurrencySelector.jsx'
import DestinationModal from './DestinationModal.jsx'

gsap.registerPlugin(ScrollTrigger)

// -----------------------------------------------------------------------------
// data helpers
// -----------------------------------------------------------------------------
const FEATURED_TOUR_ID = 12
const FALLBACK_IMAGE = './images/content/random/1.webp'
const FALLBACK_DESCRIPTION =
  'Guided Cape Town experience with local insight, scenic stops and easy online booking.'

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

const stripHtml = (value) => {
  if (!value || typeof value !== 'string') return ''
  if (typeof document !== 'undefined') {
    const tmp = document.createElement('div')
    tmp.innerHTML = value
    return (tmp.textContent || tmp.innerText || '').replace(/\s+/g, ' ').trim()
  }
  return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

const getTourTitle = (tour) => (typeof tour === 'string' ? tour : tour?.title || tour?.name || '')

const getTourDescription = (tour) => {
  if (typeof tour === 'string') return FALLBACK_DESCRIPTION
  const raw =
    tour?.shortDescription ||
    tour?.excerpt ||
    tour?.summary ||
    tour?.intro ||
    tour?.description ||
    ''
  return stripHtml(raw)
}

const getTourTagline = (tour) => {
  if (typeof tour === 'string') return ''
  const raw =
    tour?.tagline ||
    tour?.subtitle ||
    tour?.kicker ||
    tour?.heroLine ||
    ''
  return stripHtml(raw)
}

const getTourImage = (tour) => {
  if (typeof tour === 'string') return FALLBACK_IMAGE
  let imagePath =
    tour?.image ||
    tour?.img ||
    tour?.cover ||
    (tour?.gallery && tour.gallery[0]) ||
    (tour?.images && tour.images[0])
  if (!imagePath && tour?.imageFolder) {
    imagePath = `/src/assets/images/tours/${tour.imageFolder}/1.webp`
  }
  return resolveTourImage(imagePath) || FALLBACK_IMAGE
}

const getTourLocation = (tour) =>
  typeof tour === 'string' ? 'Cape Town, South Africa' : tour?.location || tour?.area || 'Cape Town, South Africa'

const getTourLink = (tour) => {
  if (typeof tour === 'string') return '#tours'
  return tour?.canonicalPath || (tour?.slug ? `/tours/${tour.slug}` : '#tours')
}

const getTourPrice = (tour) => {
  if (typeof tour === 'string') return { amount: null, currency: 'ZAR' }
  const amount = tour?.priceBase ?? tour?.price ?? tour?.fromPrice
  return { amount: amount ? Number(amount) : null, currency: tour?.baseCurrency || 'ZAR' }
}

const getTourMeta = (tour) => {
  if (typeof tour === 'string') return 'Guided Cape Town experience'
  return [tour?.duration, tour?.category, tour?.type].filter(Boolean).join(' • ') || 'Guided Cape Town experience'
}

const fallbackOptions = () =>
  FALLBACK_TOURS.map((title) => ({
    title,
    image: FALLBACK_IMAGE,
    description: FALLBACK_DESCRIPTION,
    tagline: '',
    location: 'Cape Town, South Africa',
    meta: 'Guided Cape Town experience',
    priceAmount: null,
    priceCurrency: 'ZAR',
    duration: null,
    category: null,
    type: 'other',
    link: '#tours',
    raw: title,
  }))

const getTourOptions = () => {
  if (!Array.isArray(tours) || !tours.length) return fallbackOptions()
  const options = tours
    .map((tour) => ({
      id: tour?.id,
      title: getTourTitle(tour),
      image: getTourImage(tour),
      description: getTourDescription(tour),
      tagline: getTourTagline(tour),
      location: getTourLocation(tour),
      meta: getTourMeta(tour),
      priceAmount: getTourPrice(tour).amount,
      priceCurrency: getTourPrice(tour).currency,
      duration: tour?.duration || null,
      category: tour?.category || tour?.type || null,
      type: tour?.type || 'other',
      link: getTourLink(tour),
      raw: tour,
    }))
    .filter((tour) => tour.title)
  return options.length ? options : fallbackOptions()
}

// -----------------------------------------------------------------------------
// advance-booking window
// -----------------------------------------------------------------------------
const DAY_MS = 24 * 60 * 60 * 1000
const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate())

const getMinBookableDate = (tour, now = new Date()) => {
  const daysInAdvance = tour && typeof tour === 'object' ? tour.daysInAdvance : undefined

  if (typeof daysInAdvance === 'number' && !Number.isNaN(daysInAdvance) && daysInAdvance >= 0) {
    const minDate = startOfDay(now)
    minDate.setDate(minDate.getDate() + daysInAdvance)
    return minDate
  }

  const cutoff = new Date(now.getTime() + DAY_MS)
  const cutoffMidnight = startOfDay(cutoff)
  if (cutoff.getTime() > cutoffMidnight.getTime()) {
    cutoffMidnight.setDate(cutoffMidnight.getDate() + 1)
  }
  return cutoffMidnight
}

const getAdvanceNoticeLabel = (tour) => {
  const daysInAdvance = tour && typeof tour === 'object' ? tour.daysInAdvance : undefined
  if (typeof daysInAdvance === 'number' && !Number.isNaN(daysInAdvance)) {
    if (daysInAdvance <= 0) return 'Same-day bookings allowed'
    return `Requires at least ${daysInAdvance} day${daysInAdvance === 1 ? '' : 's'} advance notice`
  }
  return 'No same-day bookings — book at least a day ahead'
}

// -----------------------------------------------------------------------------
// scroll lock (no layout jump)
// -----------------------------------------------------------------------------
const useScrollLock = (locked) => {
  useEffect(() => {
    if (!locked) {
      document.documentElement.style.overflow = ''
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
      if (window.lenis) window.lenis.start()
      return undefined
    }

    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
    const htmlOverflow = document.documentElement.style.overflow
    const bodyOverflow = document.body.style.overflow
    const bodyPadding = document.body.style.paddingRight

    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
    document.body.style.paddingRight = `${scrollbarWidth}px`
    if (window.lenis) window.lenis.stop()

    return () => {
      document.documentElement.style.overflow = htmlOverflow
      document.body.style.overflow = bodyOverflow
      document.body.style.paddingRight = bodyPadding
      if (window.lenis) window.lenis.start()
    }
  }, [locked])
}

const MODAL_TITLES = { destination: 'Select a tour', date: 'Choose a date', participants: 'Guests' }
const MODAL_WIDTHS = {
  destination: 'max-w-[94vw] sm:max-w-4xl',
  date: 'max-w-md sm:max-w-lg md:max-w-xl',
  participants: 'max-w-[94vw] sm:max-w-md',
}
const FEEDBACK_TEXT = ['✓ Tour saved', '✓ Date saved', '✓ Guests saved']
const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`

// -----------------------------------------------------------------------------
// component
// -----------------------------------------------------------------------------
function TourSelect() {
  const [destination, setDestination] = useState('')
  const [destinationId, setDestinationId] = useState(null)
  const [date, setDate] = useState(null)
  const [adults, setAdults] = useState(1)
  const [childAges, setChildAges] = useState([])
  const [participantsConfirmed, setParticipantsConfirmed] = useState(false)
  const [activeModal, setActiveModal] = useState(null)
  const [viewportWidth, setViewportWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  )
  const [mobileStep, setMobileStep] = useState(0)
  const [justCompletedStep, setJustCompletedStep] = useState(null)
  const [searchAttempted, setSearchAttempted] = useState(false)
  const [searchError, setSearchError] = useState(null)
  const [filterType, setFilterType] = useState('all')
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false)

  const mobileCardRef = useRef(null)
  const desktopTileRefs = useRef({})
  const errorBarRef = useRef(null)
  const mobileValueTextRef = useRef(null)
  const mobilePreviewTextRef = useRef(null)
  const mobileIconRef = useRef(null)
  const desktopValueRefs = useRef({})
  const desktopPreviewRefs = useRef({})
  const headerFilterRef = useRef(null)

  const navigate = useLoadingNavigate()

  const isMobileLayout = viewportWidth < 700
  const tourOptions = useMemo(() => getTourOptions(), [])

  const tourTypes = useMemo(
    () => ['all', ...Array.from(new Set(tourOptions.map((t) => t.type).filter(Boolean)))],
    [tourOptions]
  )

  const selectedTourRaw = useMemo(() => {
    const match =
      destinationId != null
        ? tourOptions.find((tour) => tour.id === destinationId)
        : tourOptions.find((tour) => tour.title === destination)
    return match ? match.raw : null
  }, [tourOptions, destination, destinationId])

  const isChildFriendly = useMemo(() => {
    if (!selectedTourRaw || typeof selectedTourRaw === 'string') return true
    return selectedTourRaw.childFriendly !== false
  }, [selectedTourRaw])

  const minBookableDate = useMemo(
    () => getMinBookableDate(selectedTourRaw),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedTourRaw, activeModal]
  )

  const advanceNoticeLabel = useMemo(
    () => (destination ? getAdvanceNoticeLabel(selectedTourRaw) : null),
    [destination, selectedTourRaw]
  )

  const formattedDate = date
    ? date.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'Select date'

  const children = childAges.length
  const participants = adults + children
  const canSearch = Boolean(destination && date && participantsConfirmed)
  const recommendedStep = !destination ? 0 : !date ? 1 : !participantsConfirmed ? 2 : 3

  // ---------------------------------------------------------------------------
  // effects
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth)
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    if (!isMobileLayout) return
    setMobileStep((prev) => Math.min(prev, recommendedStep))
  }, [isMobileLayout, destination, date, participantsConfirmed, recommendedStep])

  useEffect(() => {
    if (!canSearch) return
    setSearchAttempted(false)
    setSearchError(null)
  }, [canSearch])

  useEffect(() => {
    if (!headerMenuOpen) return undefined
    const onDown = (e) => {
      if (headerFilterRef.current && !headerFilterRef.current.contains(e.target)) {
        setHeaderMenuOpen(false)
      }
    }
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        setHeaderMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [headerMenuOpen])

  useScrollLock(!!activeModal)

  useLayoutEffect(() => {
    if (!isMobileLayout || !mobileCardRef.current) return undefined
    const card = mobileCardRef.current
    gsap.killTweensOf(card)
    gsap.fromTo(
      card,
      { autoAlpha: 0, y: 14, scale: 0.985, filter: 'blur(4px)' },
      { autoAlpha: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 0.26, ease: 'power2.out' }
    )
    return undefined
  }, [mobileStep, isMobileLayout])

  useEffect(() => {
    if (!searchError || !errorBarRef.current) return undefined
    const el = errorBarRef.current
    gsap.killTweensOf(el)
    gsap.fromTo(
      el,
      { height: 0, y: -10, autoAlpha: 0 },
      { height: 'auto', y: 0, autoAlpha: 1, duration: 0.28, ease: 'power2.out' }
    )
    const timer = window.setTimeout(() => {
      gsap.to(el, {
        height: 0,
        y: -8,
        autoAlpha: 0,
        duration: 0.24,
        ease: 'power2.in',
        onComplete: () => setSearchError(null),
      })
    }, 3600)
    return () => window.clearTimeout(timer)
  }, [searchError?.id])

  useEffect(() => {
    const timer = setTimeout(() => ScrollTrigger.refresh(), 50)
    return () => clearTimeout(timer)
  }, [searchError, activeModal, canSearch])

  // ---------------------------------------------------------------------------
  // saved-feedback animation
  // ---------------------------------------------------------------------------
  const close = () => setActiveModal(null)

  const animateSavedFeedback = (stepIndex, nextStep, updatedValue, updatedPreview, targetStepIndex) => {
    setJustCompletedStep(targetStepIndex)

    const valueEl = isMobileLayout ? mobileValueTextRef.current : desktopValueRefs.current[targetStepIndex]
    const previewEl = isMobileLayout ? mobilePreviewTextRef.current : desktopPreviewRefs.current[targetStepIndex]

    if (!valueEl || !previewEl) {
      setTimeout(() => {
        setJustCompletedStep(null)
        if (isMobileLayout) setMobileStep(Math.min(nextStep, 2))
      }, 650)
      return
    }

    const originalValueColor = valueEl.style.color

    const tl = gsap.timeline({
      onComplete: () => {
        gsap.delayedCall(0.7, () => {
          setJustCompletedStep(null)
          if (isMobileLayout) setMobileStep(Math.min(nextStep, 2))
        })
      },
    })

    tl.to([valueEl, previewEl], { opacity: 0, y: -8, duration: 0.2, ease: 'power2.in' })
      .call(() => {
        valueEl.innerText = FEEDBACK_TEXT[stepIndex]
        valueEl.style.color = '#16a34a'
      })
      .set([valueEl, previewEl], { y: 6, opacity: 0 })
      .to([valueEl, previewEl], { opacity: 1, y: 0, duration: 0.25, ease: 'back.out(0.6)' })
      .to({}, { duration: 0.55 })
      .to([valueEl, previewEl], { opacity: 0, y: -6, duration: 0.2, ease: 'power2.in' })
      .call(() => {
        valueEl.innerText = updatedValue
        valueEl.style.color = originalValueColor || ''
        previewEl.innerText = updatedPreview
      })
      .set([valueEl, previewEl], { y: 8, opacity: 0 })
      .to([valueEl, previewEl], { opacity: 1, y: 0, duration: 0.25, ease: 'back.out(0.7)' })
  }

  const completeStepWithDelay = (stepIndex, nextStep, updatedValue, updatedPreview, targetStepIndex) => {
    close()
    setTimeout(() => {
      animateSavedFeedback(stepIndex, nextStep, updatedValue, updatedPreview, targetStepIndex)
    }, 120)
  }

  // ---------------------------------------------------------------------------
  // navigation
  // ---------------------------------------------------------------------------
  const handleSearchClick = () => {
    if (!canSearch) {
      const missing = []
      if (!destination) missing.push('destination')
      if (!date) missing.push('date')
      if (!participantsConfirmed) missing.push('guests')

      setSearchAttempted(true)
      setSearchError({ id: Date.now(), message: `Please select ${missing.join(', ')} before searching.` })
      if (isMobileLayout) {
        if (!destination) setMobileStep(0)
        else if (!date) setMobileStep(1)
        else if (!participantsConfirmed) setMobileStep(2)
      }
      return
    }

    if (date && date < minBookableDate) {
      setSearchError({
        id: Date.now(),
        message: 'Your selected date no longer meets this tour\u2019s advance-booking window. Please choose a new date.',
      })
      setDate(null)
      setParticipantsConfirmed(false)
      if (isMobileLayout) setMobileStep(1)
      return
    }

    setSearchError(null)
    const selectedTour = tourOptions.find((tour) => tour.title === destination)
    if (!selectedTour) {
      setSearchError({ id: Date.now(), message: 'Selected tour could not be found.' })
      return
    }
    const slug = selectedTour.raw?.slug || selectedTour.raw?.canonicalPath?.split('/').pop()
    if (!slug) {
      setSearchError({ id: Date.now(), message: 'Tour link is unavailable.' })
      return
    }
    navigate(`/tours/${slug}#booking`, {
      state: {
        bookingData: {
          destination,
          date: date ? date.toISOString() : null,
          adults,
          children,
          childAges,
          participants,
        },
      },
    })
  }

  // "See details" — route links are navigated WITHOUT closing the modal so
  // the framer-motion page-transition curtain covers the still-open modal
  // (the modal unmounts naturally when the old page exits). The button in
  // DestinationModal shows a spinner while this navigation is in flight.
  //
  // Hash links resolve on the same page, so we DO close the modal before
  // scrolling — otherwise the modal would block the target section.
  const handleSeeDetails = (tour) => {
    if (!tour?.link) return

    if (tour.link.startsWith('/')) {
      navigate(tour.link)
      return
    }

    const id = tour.link.replace(/^#/, '')
    const el = id ? document.getElementById(id) : null
    if (!el) return
    close()
    const y = el.getBoundingClientRect().top + window.scrollY
    if (window.lenis) window.lenis.scrollTo(y, { duration: 0.85, force: true })
    else window.scrollTo({ top: y, behavior: 'smooth' })
  }

  // ---------------------------------------------------------------------------
  // guests helpers
  // ---------------------------------------------------------------------------
  const addChild = () => {
    if (!isChildFriendly || childAges.length >= 20) return
    setChildAges((prev) => [...prev, 6])
    setParticipantsConfirmed(false)
  }

  const updateChildAge = (index, delta) => {
    setChildAges((prev) => {
      const next = [...prev]
      next[index] = Math.min(17, Math.max(0, Number(next[index] || 0) + delta))
      return next
    })
    setParticipantsConfirmed(false)
  }

  const removeChild = (index) => {
    setChildAges((prev) => prev.filter((_, i) => i !== index))
    setParticipantsConfirmed(false)
  }

  // ---------------------------------------------------------------------------
  // selection handlers
  // ---------------------------------------------------------------------------
  const handleDestinationSelect = (tourTitle, tourId) => {
    const match =
      tourId != null
        ? tourOptions.find((tour) => tour.id === tourId)
        : tourOptions.find((tour) => tour.title === tourTitle)
    const rawTour = match ? match.raw : null
    const tourAllowsChildren = !(rawTour && typeof rawTour === 'object' && rawTour.childFriendly === false)

    setDestination(tourTitle)
    setDestinationId(tourId ?? null)
    setParticipantsConfirmed(false)

    if (!tourAllowsChildren) setChildAges([])

    if (date && date < getMinBookableDate(rawTour)) {
      setDate(null)
      setSearchError({
        id: Date.now(),
        message: `${tourTitle} needs more advance notice — please pick a new date.`,
      })
    }

    completeStepWithDelay(0, 1, tourTitle, `Selected: ${tourTitle}`, 0)
  }

  const handleDateSelect = (selectedDate) => {
    if (minBookableDate && selectedDate < minBookableDate) {
      setSearchError({
        id: Date.now(),
        message: 'That date is too soon for this tour — please choose a later date.',
      })
      return
    }

    const newFormattedDate = selectedDate.toLocaleDateString('en-ZA', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
    setDate(selectedDate)
    setParticipantsConfirmed(false)
    completeStepWithDelay(
      1,
      2,
      newFormattedDate,
      destination ? `${destination} • ${newFormattedDate}` : newFormattedDate,
      1
    )
  }

  const handleParticipantsConfirm = () => {
    setParticipantsConfirmed(true)
    completeStepWithDelay(
      2,
      3,
      plural(participants, 'participant', 'participants'),
      `${plural(adults, 'adult', 'adults')}${children ? ` • ${plural(children, 'child', 'children')}` : ''}`,
      2
    )
  }

  // ---------------------------------------------------------------------------
  // step cards
  // ---------------------------------------------------------------------------
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
            : advanceNoticeLabel || `${destination} selected`
          : 'Destination required first',
        icon: './icons/calendar.png',
        status: date ? 'Done' : mobileStep === 1 ? 'Current' : 'Pending',
        complete: Boolean(date),
        onClick: () => {
          if (!destination) {
            setMobileStep(0)
            setSearchError({ id: Date.now(), message: 'Please select a destination before choosing a date.' })
            return
          }
          setActiveModal('date')
        },
      },
      {
        key: 'participants',
        label: 'Who?',
        value: plural(participants, 'participant', 'participants'),
        preview:
          destination && date
            ? participantsConfirmed
              ? `${plural(adults, 'adult', 'adults')}${children ? ` • ${plural(children, 'child', 'children')}` : ''}`
              : 'Confirm adults and children'
            : 'Destination and date required first',
        icon: './icons/guest.png',
        status: participantsConfirmed ? 'Done' : mobileStep === 2 ? 'Current' : 'Pending',
        complete: Boolean(participantsConfirmed),
        onClick: () => {
          if (!destination) {
            setMobileStep(0)
            setSearchError({ id: Date.now(), message: 'Please select a destination first.' })
            return
          }
          if (!date) {
            setMobileStep(1)
            setSearchError({ id: Date.now(), message: 'Please select a date before choosing guests.' })
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
          ? `${destination} • ${formattedDate} • ${plural(adults, 'adult', 'adults')}${children ? ` • ${plural(children, 'child', 'children')}` : ''}`
          : 'Finish the selections to continue',
        icon: './icons/go.png',
        status: canSearch ? 'Ready' : mobileStep === 3 ? 'Current' : 'Pending',
        complete: canSearch,
        isSearch: true,
      },
    ],
    [destination, formattedDate, adults, children, participants, participantsConfirmed, canSearch, date, mobileStep, advanceNoticeLabel]
  )

  const currentCard = cards[Math.min(mobileStep, 2)] || cards[0]

  const handleMobileContinue = () => {
    if (canSearch && mobileStep >= 2) {
      handleSearchClick()
      return
    }
    if (!currentCard.complete) {
      currentCard.onClick()
      return
    }
    setMobileStep((prev) => Math.min(2, prev + 1))
  }

  // ---------------------------------------------------------------------------
  // style helpers
  // ---------------------------------------------------------------------------
  const iconShellClass = (complete, isCurrent, isJustCompleted) => {
    if (isJustCompleted) return 'bg-green-400 ring-4 ring-green-300 shadow-[0_0_18px_rgba(34,197,94,0.85)] scale-110'
    if (complete) return 'bg-green-100 ring-1 ring-green-200'
    if (isCurrent) return 'bg-blue-50 ring-1 ring-blue-100'
    return 'bg-black/[0.04]'
  }

  const fieldCardClass = (complete, isCurrent, isJustCompleted) => {
    if (isJustCompleted) return 'border-green-200 bg-white shadow-[0_14px_34px_rgba(34,197,94,0.12)]'
    if (complete) return 'border-green-100 bg-white shadow-[0_10px_26px_rgba(0,0,0,0.05)]'
    if (isCurrent) return 'border-blue-100 bg-white shadow-[0_14px_34px_rgba(59,130,246,0.10)]'
    return 'border-black/8 bg-white shadow-[0_10px_26px_rgba(0,0,0,0.05)]'
  }

  const searchButtonClass = (complete, attempted) => {
    if (complete) return 'hero-gradient hover:opacity-90 shadow-[0_14px_30px_rgba(34,197,94,0.18)]'
    if (attempted) return 'bg-red-400 hover:bg-red-400 shadow-[0_14px_30px_rgba(248,113,113,0.22)]'
    return 'bg-[#020817] hover:bg-black shadow-[0_14px_30px_rgba(0,0,0,0.18)]'
  }

  const renderDayContents = (day, dateObj) => {
    const isBeforeMin = Boolean(
      dateObj && minBookableDate && startOfDay(dateObj).getTime() < minBookableDate.getTime()
    )
    return (
      <div className="relative flex items-center justify-center">
        <span>{day}</span>
        {isBeforeMin && (
          <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-red-500 opacity-80">
            ✗
          </span>
        )}
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // modal
  // ---------------------------------------------------------------------------
  const isDestinationModal = activeModal === 'destination'

  const modalNode =
    activeModal && typeof document !== 'undefined'
      ? createPortal(
          <div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 px-4 pb-4 pt-24 backdrop-blur-md"
            onClick={close}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-label={MODAL_TITLES[activeModal]}
              className={`relative flex max-h-[calc(100dvh-7rem)] w-full flex-col overflow-hidden rounded-3xl bg-white ${MODAL_WIDTHS[activeModal]}`}
              onClick={(e) => e.stopPropagation()}
              style={{ animation: 'modal-in 0.25s cubic-bezier(0.16, 1, 0.3, 1) both' }}
            >
              <div
                className={
                  isDestinationModal
                    ? 'absolute inset-x-0 top-0 z-40 flex items-center justify-between gap-2 bg-transparent px-3 py-2.5 backdrop-blur-md sm:px-4 sm:py-3'
                    : 'relative z-40 flex shrink-0 items-center justify-between gap-2 border-b border-black/5 bg-white px-3 py-2.5 sm:px-4 sm:py-3'
                }
              >
                {isDestinationModal ? (
                  <div className="flex min-w-0 items-center gap-2">

                    <div className="rounded-full bg-white/15 ring-1 ring-white/30 backdrop-blur-md">
                      <CurrencySelector />
                    </div>
                    <div ref={headerFilterRef} className="relative">
                      <button
                        type="button"
                        onClick={() => setHeaderMenuOpen((open) => !open)}
                        aria-haspopup="listbox"
                        aria-expanded={headerMenuOpen}
                        className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-2 font-mont text-xs font-bold text-white ring-1 ring-white/30 backdrop-blur-md transition-colors hover:bg-white/25 sm:text-sm"
                      >
                        <span className="capitalize">{filterType === 'all' ? 'All tours' : filterType}</span>
                        <svg
                          className={`h-3.5 w-3.5 transition-transform duration-200 ${headerMenuOpen ? 'rotate-180' : ''}`}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="m6 9 6 6 6-6" />
                        </svg>
                      </button>

                      {headerMenuOpen && (
                        <ul
                          role="listbox"
                          className="absolute left-0 top-full z-50 mt-1.5 max-h-64 w-56 overflow-y-auto rounded-2xl bg-white p-1.5 shadow-[0_20px_50px_rgba(15,23,42,0.22)] ring-1 ring-black/10"
                          data-lenis-prevent
                        >
                          {tourTypes.map((type) => {
                            const active = type === filterType
                            return (
                              <li key={type} role="option" aria-selected={active}>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setFilterType(type)
                                    setHeaderMenuOpen(false)
                                  }}
                                  className={`flex w-full items-center justify-between rounded-xl px-4 py-2.5 text-left font-mont text-sm font-semibold capitalize transition-colors ${
                                    active ? 'bg-sky-50 text-sky-700' : 'text-black/70 hover:bg-black/5'
                                  }`}
                                >
                                  {type === 'all' ? 'All tours' : type}
                                  {active && (
                                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                      <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                  )}
                                </button>
                              </li>
                            )
                          })}
                        </ul>
                      )}
                    </div>

                  </div>
                ) : (
                  <span className="font-bitter text-sm font-black uppercase tracking-[0.12em] text-black/60">
                    {MODAL_TITLES[activeModal]}
                  </span>
                )}

                <button
                  type="button"
                  onClick={close}
                  aria-label="Close"
                  className="close-btn flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-600 text-white shadow-[0_6px_18px_rgba(220,38,38,0.4)] transition-colors hover:bg-red-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
                >
                  <svg
                    className="close-icon h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                </button>
              </div>

              {activeModal === 'destination' && (
                <DestinationModal
                  tourOptions={tourOptions}
                  selectedTitle={destination}
                  featuredId={FEATURED_TOUR_ID}
                  filterType={filterType}
                  onSelect={handleDestinationSelect}
                  onSeeDetails={handleSeeDetails}
                />
              )}

              {activeModal === 'date' && (
                <div className="flex flex-col items-center gap-2 p-4 pb-6 sm:p-6 md:p-8">
                  {advanceNoticeLabel && (
                    <p className="text-center font-mont text-xs font-semibold text-black/50">
                      {advanceNoticeLabel}
                    </p>
                  )}
                  <div className="datepicker-large">
                    <DatePicker
                      selected={date}
                      onChange={handleDateSelect}
                      minDate={minBookableDate}
                      renderDayContents={renderDayContents}
                      filterDate={(d) =>
                        !(minBookableDate && startOfDay(d).getTime() < minBookableDate.getTime())
                      }
                      inline
                    />
                  </div>
                </div>
              )}

              {activeModal === 'participants' && (
                <div className="flex-1 overflow-y-auto px-4 pb-5 pt-2 text-black sm:px-6 sm:pb-6">
                  <div className="mb-4 flex justify-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-blue-50 shadow-md ring-1 ring-blue-200">
                      <img src="./icons/guest.png" className="h-10 w-auto" alt="Guests" aria-hidden="true" />
                    </div>
                  </div>

                  <div className="grid gap-3">
                    <div className="flex items-center justify-between gap-4 rounded-2xl border border-black/8 bg-black/[0.02] px-4 py-3">
                      <div>
                        <p className="font-bitter text-sm font-black uppercase tracking-[0.12em]">Adults</p>
                        <p className="font-mont text-xs text-black/40">Ages 13+</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setAdults((prev) => Math.max(1, prev - 1))
                            setParticipantsConfirmed(false)
                          }}
                          disabled={adults === 1}
                          className="flex h-9 w-9 items-center justify-center rounded-full border border-black/20 text-lg transition-colors hover:border-black disabled:opacity-30"
                        >
                          −
                        </button>
                        <span className="w-7 text-center font-mont text-base">{adults}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setAdults((prev) => Math.min(20, prev + 1))
                            setParticipantsConfirmed(false)
                          }}
                          className="flex h-9 w-9 items-center justify-center rounded-full border border-black/20 text-lg transition-colors hover:border-black"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-black/8 bg-black/[0.02] px-4 py-3">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-bitter text-sm font-black uppercase tracking-[0.12em]">Children</p>
                          <p className="font-mont text-xs text-black/40">
                            {isChildFriendly ? "Add each child's age" : 'Not available for this tour'}
                          </p>
                        </div>
                        <span className="rounded-full bg-blue-50 px-2.5 py-1 font-mont text-[10px] font-black text-blue-700">
                          {childAges.length}
                        </span>
                      </div>

                      {!isChildFriendly && (
                        <div className="mt-3 flex items-center gap-2 rounded-lg border border-amber-200/80 bg-amber-50/70 px-3 py-2 font-mont text-xs text-amber-800">
                          <span aria-hidden="true">⚠️</span>
                          <span>This tour isn&apos;t child-friendly, so children can&apos;t be added.</span>
                        </div>
                      )}

                      <button
                        type="button"
                        disabled={!isChildFriendly}
                        onClick={addChild}
                        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 font-mont text-xs font-black uppercase tracking-[0.05em] text-blue-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
                      >
                        <span className="text-base leading-none">+</span> Add child
                      </button>

                      {childAges.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {childAges.map((age, index) => {
                            const numericAge = Number(age) || 0
                            let category, icon
                            if (numericAge <= 5) { category = 'Toddler'; icon = '🧒' }
                            else if (numericAge <= 11) { category = 'Child'; icon = '👦' }
                            else { category = 'Teen'; icon = '🧑' }

                            return (
                              <div
                                key={index}
                                className="flex items-center gap-2.5 rounded-xl border border-black/5 bg-white px-3 py-2 transition-colors duration-200 hover:border-blue-100 hover:bg-blue-50/40"
                              >
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-neutral-50 text-base shadow-sm">
                                  {icon}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="font-mont text-xs font-black text-neutral-900">{category} {index + 1}</p>
                                  <p className="font-mont text-[10px] text-neutral-400">{numericAge} yrs</p>
                                </div>
                                <div className="flex shrink-0 items-center rounded-lg border border-black/10 bg-white">
                                  <button
                                    type="button"
                                    onClick={() => updateChildAge(index, -1)}
                                    disabled={numericAge <= 0}
                                    className="flex h-7 w-7 items-center justify-center rounded-l-lg text-sm font-black text-neutral-500 transition hover:bg-blue-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-30"
                                    aria-label={`Decrease ${category} ${index + 1} age`}
                                  >
                                    −
                                  </button>
                                  <div className="flex h-7 min-w-[34px] items-center justify-center border-x border-black/5 px-1 font-mont text-xs font-black text-neutral-950">
                                    {numericAge}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => updateChildAge(index, 1)}
                                    disabled={numericAge >= 17}
                                    className="flex h-7 w-7 items-center justify-center rounded-r-lg text-sm font-black text-neutral-500 transition hover:bg-blue-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-30"
                                    aria-label={`Increase ${category} ${index + 1} age`}
                                  >
                                    +
                                  </button>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeChild(index)}
                                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-neutral-300 transition-all duration-200 hover:bg-red-50 hover:text-red-500"
                                  aria-label={`Remove ${category} ${index + 1}`}
                                >
                                  ×
                                </button>
                              </div>
                            )
                          })}
                        </div>
                      )}
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

  // ---------------------------------------------------------------------------
  // render
  // ---------------------------------------------------------------------------
  return (
    <>
      <div className="relative mx-auto w-full max-w-5xl overflow-visible rounded-[26px] p-3 sm:rounded-[28px] sm:p-4">
        {isMobileLayout ? (
          <div className="rounded-[22px] p-2">
            <button
              ref={mobileCardRef}
              type="button"
              onClick={currentCard.isSearch ? handleSearchClick : currentCard.onClick}
              className={`flex w-full items-center gap-4 rounded-[22px] border px-4 text-left transition-all duration-300 ${fieldCardClass(currentCard.complete, currentCard.status === 'Current', justCompletedStep === mobileStep)}`}
              style={{ height: '128px' }}
            >
              <div
                ref={mobileIconRef}
                className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full transition-colors duration-300 ${iconShellClass(currentCard.complete, currentCard.status === 'Current', justCompletedStep === mobileStep)}`}
              >
                <img src={currentCard.icon} className="h-7 w-auto" alt="" aria-hidden="true" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-1.5 font-bitter text-[11px] font-black uppercase tracking-[0.18em] text-black/35">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-300" />
                  {currentCard.label}
                </div>
                <div ref={mobileValueTextRef} className="h-6 truncate font-frank text-xl font-black leading-tight text-[#020817]">
                  {currentCard.value}
                </div>
                <div ref={mobilePreviewTextRef} className="mt-1 line-clamp-2 h-6 font-mont text-sm text-black/45">
                  {currentCard.preview}
                </div>
              </div>
            </button>

            <div className="m-2 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setMobileStep((prev) => Math.max(0, prev - 1))}
                disabled={mobileStep === 0}
                className="rounded-2xl border border-black/10 bg-white px-5 py-3 font-bitter text-sm font-black text-black/45 transition hover:bg-black/[0.03] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleMobileContinue}
                className={`flex min-w-[9.5rem] items-center justify-center gap-2 rounded-2xl px-5 py-3 font-bitter text-sm font-black uppercase tracking-[0.08em] text-white transition ${canSearch && mobileStep >= 2 ? searchButtonClass(canSearch, searchAttempted) : 'bg-[#020817] shadow-[0_14px_30px_rgba(0,0,0,0.18)] hover:bg-black'}`}
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
          <div className="grid max-w-full overflow-hidden rounded-[22px] border-4 border-blue-500 bg-white min-[700px]:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_190px] min-[1100px]:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_220px]">
            {cards.slice(0, 3).map((card, index) => (
              <button
                key={card.key}
                ref={(el) => {
                  desktopTileRefs.current[index] = el
                }}
                type="button"
                onClick={card.onClick}
                className="group flex min-w-0 items-center gap-3 border-b border-black/8 bg-white px-4 py-4 text-left transition-all duration-300 hover:bg-blue-50/35 sm:px-5 sm:py-5 min-[700px]:min-h-[92px] min-[700px]:border-b-0 min-[700px]:border-r min-[700px]:px-3 min-[900px]:px-5"
              >
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-colors duration-300 group-hover:scale-105 ${card.complete ? 'bg-green-100 ring-1 ring-green-200' : 'bg-black/[0.04]'}`}
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
                className={`flex h-full min-h-[60px] w-full max-w-full items-center justify-center gap-2 rounded-full px-5 py-3 font-bitter text-base font-black uppercase tracking-[0.08em] text-white transition sm:text-lg ${searchButtonClass(canSearch, searchAttempted)}`}
              >
                <span>Search</span>
                <img src="./icons/go.png" className="h-5 w-auto sm:h-6" alt="" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </div>

      {searchError && (
        <div className="mx-auto w-full max-w-5xl px-2">
          <div
            ref={errorBarRef}
            className="mt-2 overflow-hidden rounded-2xl border border-red-200 bg-red-50/95 shadow-[0_14px_34px_rgba(248,113,113,0.14)] backdrop-blur-md"
          >
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
          from { opacity: 0; transform: scale(0.96) translateY(6px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .datepicker-large .react-datepicker { font-size: 1.1rem; width: 100%; }
        .datepicker-large .react-datepicker__month-container { width: 100%; }
        .datepicker-large .react-datepicker__day-name,
        .datepicker-large .react-datepicker__day,
        .datepicker-large .react-datepicker__time-name {
          width: 2.8rem; line-height: 2.8rem; margin: 0.2rem;
        }
        .datepicker-large .react-datepicker__header { padding-top: 0.8rem; }
        .datepicker-large .react-datepicker__current-month { font-size: 1.3rem; padding: 0.5rem 0; }
        .datepicker-large .react-datepicker__navigation { top: 1rem; }
        .datepicker-large .react-datepicker__day--selected,
        .datepicker-large .react-datepicker__day--keyboard-selected {
          background-color: #2563eb; border-radius: 0.75rem;
        }
        .react-datepicker__day--disabled { position: relative; cursor: not-allowed; }
        @media (max-width: 640px) {
          .datepicker-large .react-datepicker__day-name,
          .datepicker-large .react-datepicker__day,
          .datepicker-large .react-datepicker__time-name {
            width: 2.2rem; line-height: 2.2rem; margin: 0.1rem; font-size: 0.9rem;
          }
        }
        .close-btn .close-icon { transform-style: preserve-3d; }
        @media (prefers-reduced-motion: no-preference) {
          @keyframes close-flip-x { from { transform: rotateX(0deg); } to { transform: rotateX(360deg); } }
          .close-btn:hover .close-icon,
          .close-btn:focus-visible .close-icon { animation: close-flip-x 0.6s ease-in-out; }
        }
      `}</style>
    </>
  )
}

export default TourSelect