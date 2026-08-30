import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const ScrollToTop = () => {
  const location = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    let cancelled = false;

    const applyReset = () => {
      if (cancelled) return;
      const lenis = window.lenis;

      // Freeze Lenis before repositioning so it can't interpolate a
      // smooth scroll *toward* 0 (which looks like the jump) — we want
      // an instant, already-there reset.
      lenis?.stop();
      window.scrollTo(0, 0);
      lenis?.scrollTo(0, { immediate: true, force: true });

      // Stale ScrollTriggers from the previous route's now-unmounted
      // DOM (pins, spacers) can leave incorrect scroll bounds behind.
      // Refresh once the new route has painted, then hand scroll back
      // to Lenis.
      requestAnimationFrame(() => {
        if (cancelled) return;
        ScrollTrigger.refresh(true);
        lenis?.start();
      });
    };

    if (window.lenis) {
      if (navigationType !== "POP") {
        applyReset();
      } else {
        window.lenis.start();
      }
      return;
    }

    // Lenis hasn't been created yet (this can happen on the very first
    // mount, since child effects run before App's effect). Wait for
    // App to signal it's ready instead of silently no-op'ing.
    const onReady = () => {
      if (navigationType !== "POP") {
        applyReset();
      } else {
        window.lenis?.start();
      }
    };
    window.addEventListener("lenis:ready", onReady, { once: true });

    // Still do the native reset immediately so there's no visible delay
    // even before Lenis exists.
    if (navigationType !== "POP") {
      window.scrollTo(0, 0);
    }

    return () => {
      cancelled = true;
      window.removeEventListener("lenis:ready", onReady);
    };
  }, [location.pathname, navigationType]);

  return null;
};
export default ScrollToTop;