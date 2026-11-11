import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import gsap from "gsap";
import ToursBanner from "./ToursBanner";
import ToursBrowser from "./ToursBrowser";

import SeeAllTours from "../About/SeeAllTours.jsx";
const Tours = () => {
  return (
    <div className="relative w-full overflow-x-hidden bg-white text-black">

      {/* <section className="relative z-10 max-w-5xl mx-auto">
        <ToursBanner />
      </section> */}
      <section className="relative z-10  overflow-visibl ">
        <ToursBrowser />
        {/* <SeeAllTours
          targetId="featured-tours"
          fallbackId="journey-start"
          label="Browse all tours"
        /> */}
      </section>
    </div>
  );
};

export default Tours;
