import React, { useEffect, useState, useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const featuredTours = [
  {
    img: './images/tours/adrenaline/paragliding/2.webp',
    name: 'Table Mountain Boulders Penguins and Cape Point Day Tour',
    rating: '4.8',
    stars: 5,
    reviews: 124,
    price: 'ZAR 1,450',
  },
  {
    img: './images/tours/historical/langa/1.webp',
    name: 'Wine Tour: Paarl, Franshoek & Stellenbosch, including 3 wineries',
    rating: '4.9',
    stars: 5,
    reviews: 98,
    price: 'ZAR 2,650',
  },
  {
    img: './images/tours/hiking/platteklip/2.webp',
    name: 'Robben Island Guided Tour, Pickup and Back',
    rating: '4.7',
    stars: 4,
    reviews: 76,
    price: 'ZAR 5,500',
  },
  {
    img: './images/tours/adrenaline/snorkelling/2.webp',
    name: 'Lions Head Guided Day Tour, including presents.',
    rating: '4.6',
    stars: 4,
    reviews: 210,
    price: 'ZAR 2,550',
  },
]

function SuggestedTours() {

  const tourCardRefs = useRef([])
  const tourLoopRef = useRef(null)

  const [hoveredTour, setHoveredTour] = useState(null)

  useLayoutEffect(() => {
    const cards = tourCardRefs.current.filter(Boolean)
    if (!cards.length) return

    tourLoopRef.current?.kill()

    const tl = gsap.timeline({
      repeat: -1,
      repeatDelay: 0.4,
    })

    tl.to(cards, {
      y: -14,
      duration: 0.3,
      stagger: 0.2,
      ease: 'power2.out',
    }).to(cards, {
      y: 0,
      duration: 0.3,
      stagger: 0.2,
      ease: 'power2.in',
    })

    tourLoopRef.current = tl

    return () => tl.kill()
  }, [])

  useEffect(() => {
    const cards = tourCardRefs.current.filter(Boolean)
    if (!cards.length) return

    if (hoveredTour === null) {
      cards.forEach((card) => gsap.killTweensOf(card))

      gsap.to(cards, {
        opacity: 1,
        y: 0,
        duration: 0.2,
        ease: 'power2.out',
        onComplete: () => {
          tourLoopRef.current?.restart()
        },
      })

      return
    }

    tourLoopRef.current?.pause()

    cards.forEach((card, index) => {
      gsap.killTweensOf(card)

      gsap.to(card, {
        opacity: index === hoveredTour ? 1 : 0.1,
        y: index === hoveredTour ? -14 : 0,
        duration: 0.2,
        ease: 'power2.out',
      })
    })
  }, [hoveredTour])

  return (
    <div className="relative max-w-5xl mx-auto">
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[98%] rounded-[28px] bg-blue-700 md:h-[80%]" />

        <div className="relative px-4 pb-6 pt-6 sm:px-6 lg:px-8">
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {featuredTours.map((tour, index) => (
                <div
                key={tour.name}
                ref={(el) => (tourCardRefs.current[index] = el)}
                onMouseEnter={() => setHoveredTour(index)}
                onMouseLeave={() => setHoveredTour(null)}
                className="min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-white/8 p-3 shadow-[0_12px_30px_rgba(0,0,0,0.12)] backdrop-blur-sm"
                >
                <img
                    src={tour.img}
                    className="mb-4 h-40 w-full rounded-xl object-cover sm:h-44 lg:h-48 xl:h-44"
                    alt={tour.name}
                />

                <p className="font-frank text-sm font-bold leading-tight text-white sm:text-base">
                    {tour.name}
                </p>

                <p className="mt-4 font-frank text-sm text-white">
                    <span className="opacity-75">From</span>{' '}
                    <span className="text-lg font-bold sm:text-xl">{tour.price}.00</span>
                </p>

                <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="font-frank font-bold text-white">{tour.rating}</span>

                    <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <svg
                        key={i}
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill={i < tour.stars ? '#FACC15' : 'none'}
                        stroke="#FACC15"
                        strokeWidth="1.5"
                        >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                    ))}
                    </div>

                    <span className="font-frank text-white/60">({tour.reviews})</span>
                </div>
                </div>
            ))}
            </div>
        </div>
        </div>
  )
}

export default SuggestedTours   