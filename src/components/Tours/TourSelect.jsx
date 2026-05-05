import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import DatePicker from 'react-datepicker'
import gsap from 'gsap'
import 'react-datepicker/dist/react-datepicker.css'

const TOURS = [
  'Table Mountain Hike',
  'Cape Point Explorer',
  'Winelands & Franschhoek',
  'Boulders Beach Penguins',
  'Cape Town City Walk',
  'Stellenbosch Wine Route',
  'Robben Island Tour',
  "Chapman's Peak Sunset",
]

function TourSelect() {
  const [destination, setDestination] = useState('')
  const [date, setDate] = useState(null)
  const [participants, setParticipants] = useState(1)
  const [participantsConfirmed, setParticipantsConfirmed] = useState(false)
  const [activeModal, setActiveModal] = useState(null)
  const [viewportWidth, setViewportWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  )
  const [mobileStep, setMobileStep] = useState(0)
  const [justCompletedStep, setJustCompletedStep] = useState(null)
  const [searchAttempted, setSearchAttempted] = useState(false)
  const [pendingPositiveFeedback, setPendingPositiveFeedback] = useState(null)
  const [selectionFeedback, setSelectionFeedback] = useState(null)
  const [searchError, setSearchError] = useState(null)

  const mobileTileRefs = useRef({})
  const desktopTileRefs = useRef({})
  const errorBarRef = useRef(null)

  const isDeckMobile = viewportWidth < 700

  useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth)
    onResize()

    window.addEventListener('resize', onResize)

    return () => window.removeEventListener('resize', onResize)
  }, [])

  const getRecommendedStep = () => {
    if (!destination) return 0
    if (!date) return 1
    if (!participantsConfirmed) return 2
    return 3
  }

  useEffect(() => {
    if (!isDeckMobile) return

    const recommendedStep = getRecommendedStep()
    setMobileStep((prev) => Math.min(prev, recommendedStep))
  }, [isDeckMobile, destination, date, participantsConfirmed])

  const close = () => setActiveModal(null)

  const formattedDate = date
    ? date.toLocaleDateString('en-ZA', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : 'Select date'

  const canSearch = Boolean(destination && date && participantsConfirmed)
  const recommendedStep = getRecommendedStep()
  const hasDetails = Boolean(destination || date || participants !== 1 || participantsConfirmed)

  useEffect(() => {
    if (canSearch) {
      setSearchAttempted(false)
      setSearchError(null)
    }
  }, [canSearch])

  useEffect(() => {
    if (!activeModal) return

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [activeModal])

  const getPositiveFeedbackText = (stepIndex) => {
    if (stepIndex === 0) return 'Tour saved'
    if (stepIndex === 1) return 'Date saved'
    if (stepIndex === 2) return 'Guests saved'
    return 'Saved'
  }

  const completeStepWithDelay = (stepIndex, nextStep) => {
    close()

    setPendingPositiveFeedback({
      id: Date.now(),
      stepIndex,
      nextStep,
    })
  }

  useEffect(() => {
    if (!pendingPositiveFeedback) return
    if (activeModal) return

    const { stepIndex, nextStep, id } = pendingPositiveFeedback

    const target = isDeckMobile
      ? mobileTileRefs.current[stepIndex]
      : desktopTileRefs.current[stepIndex]

    if (!target) {
      if (isDeckMobile) {
        setMobileStep(nextStep)
      }

      setPendingPositiveFeedback(null)
      return
    }

    setJustCompletedStep(stepIndex)
    setSelectionFeedback({
      id,
      stepIndex,
      text: getPositiveFeedbackText(stepIndex),
    })

    gsap.killTweensOf(target)

    const tl = gsap.timeline({
      delay: 0.16,
      defaults: {
        ease: 'power3.out',
      },
      onComplete: () => {
        setJustCompletedStep(null)

        if (isDeckMobile) {
          setMobileStep(nextStep)
        }

        setPendingPositiveFeedback(null)
        setSelectionFeedback(null)

        gsap.set(target, {
          clearProps: 'transform,backgroundColor,borderColor,boxShadow',
        })
      },
    })

    tl.to(target, {
      y: -5,
      scale: 1.01,
      backgroundColor: '#f0fdf4',
      borderColor: '#bbf7d0',
      boxShadow: '0 18px 44px rgba(34,197,94,0.16)',
      duration: 0.24,
    })
      .to(target, {
        y: 0,
        scale: 1,
        duration: 0.28,
        ease: 'back.out(1.7)',
      })
      .to(
        target,
        {
          backgroundColor: '#ffffff',
          borderColor: 'rgba(0,0,0,0.08)',
          boxShadow: '0 10px 26px rgba(0,0,0,0.05)',
          duration: 0.42,
          ease: 'power2.out',
        },
        '+=0.18'
      )

    return () => tl.kill()
  }, [pendingPositiveFeedback, activeModal, isDeckMobile])

  useEffect(() => {
    if (!searchError || !errorBarRef.current) return

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

    const timer = setTimeout(() => {
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

    return () => clearTimeout(timer)
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

      if (isDeckMobile) {
        if (!destination) setMobileStep(0)
        else if (!date) setMobileStep(1)
        else if (!participantsConfirmed) setMobileStep(2)
      }

      return
    }

    setSearchError(null)
    console.log('Search submitted', { destination, date, participants })
  }

  const handleResetDetails = () => {
    setDestination('')
    setDate(null)
    setParticipants(1)
    setParticipantsConfirmed(false)
    setActiveModal(null)
    setMobileStep(0)
    setJustCompletedStep(null)
    setSearchAttempted(false)
    setPendingPositiveFeedback(null)
    setSelectionFeedback(null)
    setSearchError(null)

    gsap.killTweensOf([
      ...Object.values(mobileTileRefs.current),
      ...Object.values(desktopTileRefs.current),
    ])
  }

  const mobileCards = useMemo(
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
        onClick: () => destination && setActiveModal('date'),
      },
      {
        key: 'participants',
        label: 'Who?',
        value: `${participants} ${participants === 1 ? 'participant' : 'participants'}`,
        preview:
          destination && date
            ? participantsConfirmed
              ? `${destination} • ${formattedDate} • ${participants} ${
                  participants === 1 ? 'guest' : 'guests'
                }`
              : 'Confirm your guest count'
            : 'Destination and date required first',
        icon: './icons/guest.png',
        status: participantsConfirmed ? 'Done' : mobileStep === 2 ? 'Current' : 'Pending',
        complete: Boolean(participantsConfirmed),
        onClick: () => destination && date && setActiveModal('participants'),
      },
      {
        key: 'search',
        value: canSearch ? 'Search available' : 'Complete the steps above',
        preview: canSearch
          ? `${destination} • ${formattedDate} • ${participants} ${
              participants === 1 ? 'guest' : 'guests'
            }`
          : 'Finish the selections to continue',
        icon: './icons/go.png',
        status: canSearch ? 'Ready' : mobileStep === 3 ? 'Current' : 'Pending',
        complete: canSearch,
        isSearch: true,
      },
    ],
    [destination, formattedDate, participants, participantsConfirmed, canSearch, date, mobileStep]
  )

  const getDeckStyle = (index) => {
    const offset = index - mobileStep

    if (offset === 0) {
      return {
        transform: 'translateY(0px) scale(1)',
        opacity: 1,
        zIndex: 40,
        pointerEvents: 'auto',
      }
    }

    if (offset > 0) {
      const y = 14 + (offset - 1) * 14
      const scale = Math.max(0.88, 1 - offset * 0.04)
      const opacity = Math.max(0.45, 1 - offset * 0.18)

      return {
        transform: `translateY(${y}px) scale(${scale})`,
        opacity,
        zIndex: 40 - offset,
        pointerEvents: 'none',
      }
    }

    const pastDepth = Math.abs(offset)
    const y = 8 + (pastDepth - 1) * 10
    const scale = Math.max(0.9, 0.97 - pastDepth * 0.03)
    const opacity = Math.max(0.35, 0.72 - pastDepth * 0.15)

    return {
      transform: `translateY(${y}px) scale(${scale})`,
      opacity,
      zIndex: 18 - pastDepth,
      pointerEvents: 'none',
    }
  }

  const stepBadgeClass = (status) => {
    if (status === 'Done' || status === 'Ready') {
      return 'bg-green-50 text-green-700 ring-1 ring-green-200'
    }

    if (status === 'Current') {
      return 'bg-blue-50 text-blue-700 ring-1 ring-blue-100'
    }

    return 'bg-black/[0.04] text-black/45 ring-1 ring-black/[0.05]'
  }

  const stepCardClass = (complete, isCurrent, isJustCompleted) => {
    if (isJustCompleted) {
      return 'bg-white ring-1 ring-green-200 shadow-[0_12px_32px_rgba(34,197,94,0.12)]'
    }

    if (complete) {
      return 'bg-white ring-1 ring-green-100 shadow-[0_10px_26px_rgba(0,0,0,0.05)]'
    }

    if (isCurrent) {
      return 'bg-white ring-1 ring-blue-200 shadow-[0_12px_34px_rgba(59,130,246,0.12)]'
    }

    return 'bg-white ring-1 ring-black/8 shadow-[0_10px_26px_rgba(0,0,0,0.05)]'
  }

  const stepIconClass = (complete, isCurrent, isJustCompleted) => {
    if (isJustCompleted) return 'bg-green-200'
    if (complete) return 'bg-green-100 ring-1 ring-green-200'
    if (isCurrent) return 'bg-blue-50 ring-1 ring-blue-100'
    return 'bg-black/[0.04]'
  }

  const searchCardClass = (complete, attempted) => {
    if (complete) return 'bg-green-50/80 ring-1 ring-green-200'
    if (attempted) return 'bg-red-400/95 text-white ring-1 ring-red-300'
    return 'bg-white ring-1 ring-black/8'
  }

  const searchTextClass = (complete, attempted) => {
    if (complete) return 'text-black/70'
    if (attempted) return 'text-white/90'
    return 'text-black/70'
  }

  const searchPreviewClass = (complete, attempted) => {
    if (complete) return 'text-black/45'
    if (attempted) return 'text-white/80'
    return 'text-black/45'
  }

  const searchButtonClass = (complete, attempted) => {
    if (complete) {
      return 'hero-gradient hover:opacity-90 shadow-[0_14px_30px_rgba(34,197,94,0.18)]'
    }

    if (attempted) {
      return 'bg-red-400 hover:bg-red-400 shadow-[0_14px_30px_rgba(248,113,113,0.22)]'
    }

    return 'bg-black hover:bg-black/85 shadow-[0_14px_30px_rgba(0,0,0,0.18)]'
  }

  const DesktopLabel = ({ children }) => (
    <div className="mb-1 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-black/35">
      <span className="h-1.5 w-1.5 rounded-full bg-green-200" />
      {children}
    </div>
  )

  const PositivePill = ({ show, text }) => {
    if (!show) return null

    return (
      <span className="ml-auto hidden shrink-0 items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-green-700 ring-1 ring-green-200 sm:flex">
        <svg
          className="h-3 w-3"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
        {text}
      </span>
    )
  }

  const LeaderStep = () => (
    <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-black/45">
      {[1, 2, 3, 4].map((n, idx) => {
        const stepIndex = n - 1
        const isActive = mobileStep === stepIndex
        const isDone = stepIndex < recommendedStep || (stepIndex === 3 && canSearch)

        return (
          <div key={n} className="flex items-center gap-2">
            <div
              className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] tracking-normal transition-all duration-300 ${
                isDone
                  ? 'bg-green-200 text-green-900 shadow-[0_0_0_3px_rgba(187,247,208,0.35)]'
                  : isActive
                    ? 'bg-blue-600 text-white'
                    : 'bg-black/8 text-black/45'
              }`}
            >
              {n}
            </div>

            {idx < 3 && <div className="h-px w-5 bg-black/12" />}
          </div>
        )
      })}
    </div>
  )

  const modalNode =
    activeModal && typeof document !== 'undefined'
      ? createPortal(
          <div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-4 backdrop-blur-md"
            onClick={close}
          >
            <div
              className="w-full max-w-[92vw] overflow-hidden rounded-2xl bg-white font-mont shadow-2xl sm:max-w-md"
              onClick={(e) => e.stopPropagation()}
              style={{ animation: 'modal-in 0.2s ease both' }}
            >
              <div className="flex items-center justify-between border-b border-black/10 px-4 py-4 text-black sm:px-5">
                <h3 className="text-sm font-semibold sm:text-base">
                  {activeModal === 'destination' && 'Select a tour'}
                  {activeModal === 'date' && 'Choose a date'}
                  {activeModal === 'participants' && 'Number of guests'}
                </h3>

                <button
                  onClick={close}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-black/40 transition-colors hover:bg-gray-100 hover:text-black"
                >
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {activeModal === 'destination' && (
                <div className="max-h-72 overflow-y-auto py-2">
                  {TOURS.map((tour) => (
                    <button
                      key={tour}
                      onClick={() => {
                        setDestination(tour)
                        setParticipantsConfirmed(false)
                        completeStepWithDelay(0, 1)
                      }}
                      className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm transition-colors hover:bg-gray-50 sm:px-5 ${
                        destination === tour ? 'font-semibold text-black' : 'text-black/70'
                      }`}
                    >
                      <span className="pr-4">{tour}</span>

                      {destination === tour && (
                        <svg
                          className="h-4 w-4 shrink-0 text-green-600"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {activeModal === 'date' && (
                <div className="flex justify-center overflow-x-auto p-3 sm:p-4 [&_.react-datepicker]:border-none [&_.react-datepicker]:shadow-none [&_.react-datepicker__day:hover]:rounded-full [&_.react-datepicker__day:hover]:bg-gray-100 [&_.react-datepicker__day--selected]:rounded-full [&_.react-datepicker__day--selected]:bg-black [&_.react-datepicker__header]:border-black/10 [&_.react-datepicker__header]:bg-white">
                  <DatePicker
                    selected={date}
                    onChange={(d) => {
                      setDate(d)
                      setParticipantsConfirmed(false)
                      completeStepWithDelay(1, 2)
                    }}
                    minDate={new Date()}
                    inline
                  />
                </div>
              )}

              {activeModal === 'participants' && (
                <div className="px-4 py-5 text-black sm:px-5 sm:py-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium sm:text-base">Guests</p>
                      <p className="text-xs text-black/40 sm:text-sm">Adults &amp; children</p>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-4">
                      <button
                        onClick={() => setParticipants((p) => Math.max(1, p - 1))}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-black/20 text-lg transition-colors hover:border-black disabled:opacity-30"
                        disabled={participants === 1}
                      >
                        −
                      </button>

                      <span className="w-6 text-center text-base">{participants}</span>

                      <button
                        onClick={() => setParticipants((p) => Math.min(20, p + 1))}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-black/20 text-lg transition-colors hover:border-black"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setParticipantsConfirmed(true)
                      completeStepWithDelay(2, 3)
                    }}
                    className="mt-6 w-full rounded-xl bg-black py-3 text-sm font-semibold text-white transition-colors hover:bg-black/80"
                  >
                    Confirm
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
      <div className="relative mx-auto w-full max-w-5xl overflow-visible rounded-[24px] bg-white/16 p-2 shadow-[0_20px_60px_rgba(0,0,0,0.18)] backdrop-blur-md sm:rounded-[28px] sm:p-3">
        <button
          type="button"
          onClick={handleResetDetails}
          disabled={!hasDetails}
          className="absolute -top-7 right-2 z-20 rounded-full border border-white/20 bg-white/20 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/75 backdrop-blur-md transition hover:bg-white/30 hover:text-white disabled:pointer-events-none disabled:opacity-0"
        >
          reset details
        </button>

        {isDeckMobile ? (
          <div className="relative min-h-[236px] overflow-hidden rounded-[18px]">
            {mobileCards.map((card, index) => {
              const isCurrent = mobileStep === index
              const isJustCompleted = justCompletedStep === index
              const isFeedbackActive = selectionFeedback?.stepIndex === index

              return (
                <div
                  key={card.key}
                  style={getDeckStyle(index)}
                  className="absolute inset-x-0 top-0 transition-all duration-500 ease-out"
                >
                  <div className="overflow-hidden rounded-[22px] border border-black/8 bg-white shadow-[0_16px_32px_rgba(0,0,0,0.12)]">
                    {card.isSearch ? (
                      <div className="flex min-h-[184px] flex-col gap-3 px-4 py-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex flex-col gap-2">
                            <LeaderStep />
                          </div>

                          <div
                            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${stepBadgeClass(card.status)}`}
                          >
                            {card.status}
                          </div>
                        </div>

                        <div
                          className={`flex items-center gap-3 rounded-2xl px-3 py-3 ${searchCardClass(
                            card.complete,
                            searchAttempted
                          )}`}
                        >
                          <div
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                              card.complete
                                ? 'bg-green-200'
                                : searchAttempted
                                  ? 'bg-white/20'
                                  : 'bg-black/[0.04]'
                            }`}
                          >
                            <img src={card.icon} className="h-5 w-auto" alt="Search" />
                          </div>

                          <div className="min-w-0">
                            <div
                              className={`truncate text-sm ${searchTextClass(
                                card.complete,
                                searchAttempted
                              )}`}
                            >
                              {card.value}
                            </div>

                            <div
                              className={`mt-1 truncate text-xs ${searchPreviewClass(
                                card.complete,
                                searchAttempted
                              )}`}
                            >
                              {card.preview}
                            </div>
                          </div>
                        </div>

                        <div className="mt-auto flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setMobileStep((prev) => Math.max(0, prev - 1))}
                            className="rounded-xl border border-black/10 px-4 py-3 text-sm font-semibold text-black/70 transition hover:bg-black/[0.03]"
                          >
                            Back
                          </button>

                          <button
                            type="button"
                            onClick={handleSearchClick}
                            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-5 py-3 text-base font-bold text-white transition ${searchButtonClass(
                              canSearch,
                              searchAttempted
                            )}`}
                          >
                            <span>Search</span>
                            <img src="./icons/go.png" className="h-5 w-auto" alt="Go" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="px-4 py-4">
                        <div className="mb-3 flex items-start justify-between gap-3">
                          <div className="flex flex-col gap-2">
                            <LeaderStep />
                          </div>

                          <div
                            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${stepBadgeClass(card.status)}`}
                          >
                            {card.status}
                          </div>
                        </div>

                        <button
                          ref={(el) => {
                            mobileTileRefs.current[index] = el
                          }}
                          type="button"
                          onClick={card.onClick}
                          className={`flex min-h-[96px] w-full items-center gap-3 rounded-[18px] border border-transparent px-3 text-left transition-all duration-300 hover:-translate-y-0.5 ${stepCardClass(
                            card.complete,
                            isCurrent,
                            isJustCompleted
                          )}`}
                        >
                          <div
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-colors duration-300 ${stepIconClass(
                              card.complete,
                              isCurrent,
                              isJustCompleted
                            )}`}
                          >
                            <img src={card.icon} className="h-5 w-auto" alt={card.key} />
                          </div>

                          <div className="min-w-0 flex-1">
                            {card.label && (
                              <div className="mb-1 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-black/35">
                                <span className="h-1.5 w-1.5 rounded-full bg-green-200" />
                                {card.label}
                              </div>
                            )}

                            <div className="truncate text-sm font-semibold text-black/75">
                              {card.value}
                            </div>

                            <div className="mt-1 truncate text-xs text-black/45">
                              {card.preview}
                            </div>
                          </div>

                          <PositivePill
                            show={isFeedbackActive}
                            text={selectionFeedback?.text}
                          />
                        </button>

                        <div className="mt-3 flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => setMobileStep((prev) => Math.max(0, prev - 1))}
                            disabled={mobileStep === 0}
                            className="rounded-xl border border-black/10 px-4 py-2.5 text-sm font-semibold text-black/70 transition hover:bg-black/[0.03] disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            Back
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setMobileStep((prev) =>
                                Math.min(3, Math.max(prev + 1, recommendedStep))
                              )
                            }
                            className="rounded-xl bg-black px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-black/85"
                          >
                            Continue
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}

            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-[linear-gradient(to_top,rgba(255,255,255,0.16),transparent)]" />
          </div>
        ) : (
          <div className="grid max-w-full overflow-hidden rounded-[18px] bg-white shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)] min-[700px]:grid-cols-2 min-[1100px]:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_200px]">
            <button
              ref={(el) => {
                desktopTileRefs.current[0] = el
              }}
              type="button"
              onClick={() => setActiveModal('destination')}
              className="group flex min-w-0 items-center gap-3 border border-transparent bg-white px-4 py-4 text-left ring-1 ring-black/8 transition-all duration-300 hover:bg-gray-50 sm:px-5 sm:py-5 min-[700px]:min-h-[92px] min-[1100px]:border-r min-[1100px]:border-gray-200"
            >
              <img
                src="./icons/car.png"
                className={`h-8 w-auto shrink-0 rounded-full p-2 transition-transform duration-300 group-hover:scale-105 sm:h-9 md:h-10 ${
                  destination ? 'bg-green-100 ring-1 ring-green-200' : 'bg-black/[0.04]'
                }`}
                alt="Destination"
              />

              <div className="min-w-0 flex-1">
                <DesktopLabel>Where?</DesktopLabel>

                <div className="truncate text-sm font-semibold text-black/75">
                  {destination || 'Select destination'}
                </div>
              </div>

              <PositivePill
                show={selectionFeedback?.stepIndex === 0}
                text={selectionFeedback?.text}
              />
            </button>

            <button
              ref={(el) => {
                desktopTileRefs.current[1] = el
              }}
              type="button"
              onClick={() => setActiveModal('date')}
              className="group flex min-w-0 items-center gap-3 border border-transparent border-t-gray-200 bg-white px-4 py-4 text-left ring-1 ring-black/8 transition-all duration-300 hover:bg-gray-50 sm:px-5 sm:py-5 min-[700px]:border-l-0 min-[700px]:border-t min-[700px]:min-h-[92px] min-[1100px]:border-r min-[1100px]:border-t-0 min-[1100px]:border-gray-200"
            >
              <img
                src="./icons/calendar.png"
                className={`h-8 w-auto shrink-0 rounded-full p-2 transition-transform duration-300 group-hover:scale-105 sm:h-9 md:h-10 ${
                  date ? 'bg-green-100 ring-1 ring-green-200' : 'bg-black/[0.04]'
                }`}
                alt="Date"
              />

              <div className="min-w-0 flex-1">
                <DesktopLabel>When?</DesktopLabel>

                <div className="truncate text-sm font-semibold text-black/75">
                  {formattedDate}
                </div>
              </div>

              <PositivePill
                show={selectionFeedback?.stepIndex === 1}
                text={selectionFeedback?.text}
              />
            </button>

            <button
              ref={(el) => {
                desktopTileRefs.current[2] = el
              }}
              type="button"
              onClick={() => setActiveModal('participants')}
              className="group flex min-w-0 items-center gap-3 border border-transparent border-t-gray-200 bg-white px-4 py-4 text-left ring-1 ring-black/8 transition-all duration-300 hover:bg-gray-50 sm:px-5 sm:py-5 min-[700px]:min-h-[92px] min-[700px]:border-r min-[700px]:border-gray-200 min-[1100px]:border-t-0"
            >
              <img
                src="./icons/guest.png"
                className={`h-8 w-auto shrink-0 rounded-full p-2 transition-transform duration-300 group-hover:scale-105 sm:h-9 md:h-10 ${
                  participantsConfirmed
                    ? 'bg-green-100 ring-1 ring-green-200'
                    : 'bg-black/[0.04]'
                }`}
                alt="Participants"
              />

              <div className="min-w-0 flex-1">
                <DesktopLabel>Who?</DesktopLabel>

                <div className="truncate text-sm font-semibold text-black/75">
                  {participants} {participants === 1 ? 'participant' : 'participants'}
                </div>
              </div>

              <PositivePill
                show={selectionFeedback?.stepIndex === 2}
                text={selectionFeedback?.text}
              />
            </button>

            <div className="min-w-0 border-t border-gray-200 bg-white p-3 sm:p-4 min-[700px]:p-4 min-[1100px]:border-t-0">
              <button
                type="button"
                onClick={handleSearchClick}
                className={`flex h-full min-h-[56px] w-full max-w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-base font-bold text-white transition sm:text-lg ${searchButtonClass(
                  canSearch,
                  searchAttempted
                )}`}
              >
                <span>Search</span>
                <img src="./icons/go.png" className="h-5 w-auto sm:h-6" alt="Go" />
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
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v5" />
                  <path d="M12 16h.01" />
                </svg>
              </div>

              <div className="min-w-0">
                <p className="text-sm font-semibold text-red-700">Missing details</p>
                <p className="truncate text-xs text-red-600/80">{searchError.message}</p>
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
      `}</style>
    </>
  )
}

export default TourSelect