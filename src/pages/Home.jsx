import React, { useEffect, useLayoutEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import Hero from '../components/Hero.jsx'
import About from '../components/About/About.jsx'
import Stories from '../components/Stories/Stories.jsx'
import Tours from '../components/Tours/Tours.jsx'
import Contact from '../components/Contact.jsx'

gsap.registerPlugin(ScrollTrigger)

const Home = () => {
  const location = useLocation()

  const pageRef = useRef(null)
  const heroRef = useRef(null)
  const aboutRef = useRef(null)

  useEffect(() => {
    const scrollTarget = location.state?.scrollTo

    if (!scrollTarget || !window.lenis) return undefined

    const timer = window.setTimeout(() => {
      if (scrollTarget === 'top') {
        window.lenis.scrollTo(0, {
          immediate: true,
          force: true,
        })
      } else {
        const element = document.getElementById(scrollTarget)

        if (element) {
          const y = element.getBoundingClientRect().top + window.scrollY

          window.lenis.scrollTo(y, {
            immediate: true,
            force: true,
          })
        }
      }

      window.requestAnimationFrame(() => {
        ScrollTrigger.refresh(true)
      })
    }, 700)

    return () => window.clearTimeout(timer)
  }, [location.key, location.state])

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      if (!heroRef.current || !aboutRef.current) return

      const resetHero = () => {
        gsap.set(heroRef.current, {
          clearProps: 'filter',
          scale: 1,
          opacity: 1,
          x: 0,
          y: 0,
          transformOrigin: 'center top',
        })
      }

      const getHeroScrollDistance = () => {
        const heroHeight = heroRef.current?.offsetHeight || 0
        const visualHeight = window.visualViewport?.height || 0
        const windowHeight = window.innerHeight || 0

        return Math.max(heroHeight, visualHeight, windowHeight, 1)
      }

      resetHero()

      gsap.set(aboutRef.current, {
        y: 40,
      })

      const tl = gsap.timeline({
        scrollTrigger: {
          id: 'home-hero-pin-scale',
          trigger: heroRef.current,

          /*
            Important fix:
            The old trigger used aboutRef with start: 'top bottom'.
            On touch Chrome, the layout viewport and the visible viewport can disagree while
            the address bar / tab bar / bottom UI are visible. That can make the trigger start
            before scrollY 0, so the hero scale animation is already progressed on first load.

            Using the hero itself as the trigger and starting at 'top top' makes the animation
            begin at the real page top instead of being calculated from the next section.
          */
          start: 'top top',
          end: () => `+=${getHeroScrollDistance()}`,
          scrub: true,
          pin: heroRef.current,
          pinSpacing: false,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          refreshPriority: 2,

          onRefreshInit: () => {
            if (window.scrollY <= 2) {
              resetHero()
            }
          },

          onRefresh: (self) => {
            if (window.scrollY <= 2) {
              self.animation?.progress(0)
              resetHero()
            }
          },
        },
      })

      tl.to(
        aboutRef.current,
        {
          y: 0,
          ease: 'none',
        },
        0
      ).to(
        heroRef.current,
        {
          scale: 0.6,
          opacity: 0.72,
          ease: 'none',
        },
        0
      )

      const refresh = () => {
        if (window.scrollY <= 2) {
          resetHero()
        }

        ScrollTrigger.refresh(true)
      }

      const refreshOne = window.setTimeout(refresh, 80)
      const refreshTwo = window.setTimeout(refresh, 320)
      const refreshThree = window.setTimeout(refresh, 900)

      window.addEventListener('load', refresh, { once: true })

      if (document.fonts?.ready) {
        document.fonts.ready.then(refresh).catch(() => {})
      }

      return () => {
        window.clearTimeout(refreshOne)
        window.clearTimeout(refreshTwo)
        window.clearTimeout(refreshThree)
        window.removeEventListener('load', refresh)
      }
    }, pageRef)

    return () => ctx.revert()
  }, [])

  return (
    <div
      ref={pageRef}
      className="flex flex-col overflow-x-hidden bg-white text-white"
    >
      <section
        id="home"
        ref={heroRef}
        className="relative z-10 overflow-hidden"
      >
        <Hero />
      </section>

      <section
        id="about"
        ref={aboutRef}
        className="relative z-20 -mt-6 rounded-t-[2rem] bg-white text-black sm:-mt-8 lg:-mt-10"
      >
        <About />
      </section>

      <section id="stories" className="relative z-20">
        <Stories />
      </section>

      <section id="tours" className="relative z-20">
        <Tours />
      </section>

      <section id="contact" className="relative z-20">
        <Contact />
      </section>
    </div>
  )
}

export default Home