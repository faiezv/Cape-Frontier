import { flushSync } from "react-dom";

import { useEffect } from "react";
import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useLoadingBar } from "./LoadingBar";

export function useLoadingNavigate() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    startLoading,
    completeLoading,
  } = useLoadingBar();

  useEffect(() => {
    completeLoading();
  }, [location.pathname]);

  return (to, options = {}) => {
    // support navigate(-1)
    if (typeof to === "number") {
      flushSync(() => {
        startLoading();
      });

      setTimeout(() => {
        navigate(to);
      }, 120);

      return;
    }

    const current =
      location.pathname + location.search;

    const target =
      typeof to === "string"
        ? to
        : to.pathname;

    if (target === current) return;

    // FORCE loading bar render immediately
    flushSync(() => {
      startLoading();
    });

    // allow browser paint before navigation
    setTimeout(() => {
      navigate(to, options);
    }, 120);
  };
}
