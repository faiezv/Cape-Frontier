import React, { useRef } from "react";

import Hero from "./Hero.jsx";
import PaystackSupported from "./PaystackSupported.jsx";
import WhatMakesUsDifferent from "./WhatMakesUsDifferent.jsx";
import FeaturedTours from "./FeaturedTours.jsx";
import Tours from "../Tours/Tours.jsx";

import bgPattern from "/assets/content/clip-art/section1-bg.png";

// <TourCategories /> is intentionally not rendered: the same four categories
// are already the tabs inside <Tours />. Re-import it if you want it back.

const About = () => {
  const toursSectionRef = useRef(null);

  return (
    <div className="relative flex w-full max-w-full flex-col bg-white">
      {/* Background pattern */}
      <img
        src={bgPattern}
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-70"
        alt=""
      />

      <Hero />

      {/* Tour browser (single entry point for finding a tour) */}
      <section id="tours" ref={toursSectionRef} className="relative z-30">
        <Tours />
      </section>

      {/* Featured tours, then payment trust note, in one container */}
      <section className="relative z-20 w-full">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 py-12 sm:px-6 lg:px-8">
          <div id="journey-start" className="scroll-mt-24">
            <FeaturedTours />
          </div>

          <PaystackSupported />
        </div>
      </section>

      <section className="relative z-20 w-full scroll-mt-24">
        <WhatMakesUsDifferent />
      </section>
    </div>
  );
};

export default About;