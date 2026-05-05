import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

const ScrollToTop = () => {
  const location = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    if (window.lenis) {
      window.lenis.start();
    }

    if (navigationType !== "POP") {
      window.scrollTo(0, 0);

      if (window.lenis) {
        window.lenis.scrollTo(0, { immediate: true, force: true });
      }
    }
  }, [location.pathname, navigationType]);

  return null;
};

export default ScrollToTop;