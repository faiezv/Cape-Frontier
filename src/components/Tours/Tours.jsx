import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import TourBrowser from "./ToursBrowser";
import ToursBanner from "./ToursBanner";
import Test from './test'


const Tours = () => {


  return (
    <div className="relative w-full overflow-x-hidden bg-white text-black">
      <section className="relative z-10 w-full">
        <ToursBanner />
      </section>

      <section className="relative z-10 w-full overflow-visible bg-blue-200">
        <TourBrowser />
        {/* <Test /> */}
      </section>
    </div>
  );
};

export default Tours;