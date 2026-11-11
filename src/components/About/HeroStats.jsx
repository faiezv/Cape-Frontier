import React, { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";

const shouldReduceMotion = () => {
  if (typeof window === "undefined") return true;
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
};

/**
 * Looping stats strip.
 *
 * The card frame stays put and only the items fade in / hold / fade out.
 * Compared with the old version:
 * - the items hold for ~3.5s (was 0.7s), so they are readable most of the time
 * - the blank gap between loops is short
 * - the grid has a fixed min-height, so the card never collapses mid-fade
 * - reduced-motion users just see the static stats
 */
const HeroStats = ({ stats = [] }) => {
  const itemRefs = useRef([]);

  useLayoutEffect(() => {
    const items = itemRefs.current.filter(Boolean);
    if (!items.length || shouldReduceMotion()) return undefined;

    const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.2 });

    tl.fromTo(
      items,
      { opacity: 0, y: 14 },
      { opacity: 1, y: 0, duration: 0.4, stagger: 0.14, ease: "power2.out" },
    )
      .to({}, { duration: 3.5 }) // hold
      .to(items, {
        opacity: 0,
        y: -8,
        duration: 0.3,
        stagger: 0.1,
        ease: "power2.in",
      });

    return () => tl.kill();
  }, []);

  return (
    <dl className="grid min-h-[5.5rem] grid-cols-3 divide-x divide-neutral-200 rounded-2xl border border-neutral-200 bg-white/80 p-4 shadow-[0_14px_34px_rgba(15,23,42,0.06)] backdrop-blur-sm sm:p-5">
      {stats.map((item, index) => (
        <div
          key={item.label}
          ref={(el) => {
            itemRefs.current[index] = el;
          }}
          className="min-w-0 px-3 first:pl-0 last:pr-0"
        >
          <dt className="font-bitter text-xl font-bold leading-tight text-blue-800 sm:text-2xl">
            {item.value}
          </dt>
          <dd className="mt-1 font-mont text-sm leading-snug text-neutral-600">
            {item.label}
          </dd>
        </div>
      ))}
    </dl>
  );
};

export default HeroStats;