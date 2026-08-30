// import { useEffect } from "react";
// import { useLocation, useNavigationType } from "react-router-dom";

// const ScrollToTop = () => {
//   const location = useLocation();
//   const navigationType = useNavigationType();

//   useEffect(() => {
//     if (window.lenis) {
//       window.lenis.start();
//     }

//     if (navigationType !== "POP") {
//       window.scrollTo(0, 0);

//       if (window.lenis) {
//         window.lenis.scrollTo(0, { immediate: true, force: true });
//       }
//     }
//   }, [location.pathname, navigationType]);

//   return null;
// };

// export default ScrollToTop;

import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

const ScrollToTop = () => {
  const location = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    // Only scroll on navigation (POP is back/forward – we let Lenis handle that)
    if (navigationType !== "POP") {
      // If we're already at the top during initial load, skip
      if (window.scrollY === 0 && window.lenis?.scroll === 0) return;
      
      if (window.lenis) {
        window.lenis.scrollTo(0, { immediate: true, force: true });
      } else {
        window.scrollTo(0, 0);
      }
    }
  }, [location.pathname, navigationType]);

  return null;
};

export default ScrollToTop;