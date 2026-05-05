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

    if (!scrollTarget || !window.lenis) return

    setTimeout(() => {
      if (scrollTarget === 'top') {
        window.lenis.scrollTo(0, { immediate: true })
      } else {
        const element = document.getElementById(scrollTarget)
        if (element) {
          const y = element.getBoundingClientRect().top + window.scrollY
          window.lenis.scrollTo(y, { immediate: true })
        }
      }

      ScrollTrigger.refresh()
    }, 900)
  }, [location.key])

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const lenis = window.lenis

      if (lenis) {
        lenis.on('scroll', ScrollTrigger.update)
      }

      gsap.set(aboutRef.current, {
        y:40,
      })

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: aboutRef.current,
          start: 'top bottom',
          end: 'top top',
          scrub: true,
          pin: heroRef.current, //what sticks
          pinSpacing: false,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          // markers: true,
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
          scale: .6,
          opacity: 0.72,
          ease: 'none',
        },
        0
      )

      ScrollTrigger.refresh()

      return () => {
        if (lenis?.off) {
          lenis.off('scroll', ScrollTrigger.update)
        }
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