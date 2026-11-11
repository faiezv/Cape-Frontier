// src/components/Tours/CurrencySelector.jsx
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { CURRENCIES, useCurrency } from "../../utils/currency";

const flagSrc = (cc, width = 40) => `https://flagcdn.com/w${width}/${cc}.png`;

const PANEL_MAX_WIDTH = 416; // 26rem
const GAP = 8;
const MARGIN = 8;

function Flag({ cc }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span className="inline-flex h-4 w-6 shrink-0 items-center justify-center rounded-[3px] bg-neutral-200 text-[9px] font-bold uppercase text-neutral-600">
        {cc}
      </span>
    );
  }

  return (
    <img
      src={flagSrc(cc, 40)}
      srcSet={`${flagSrc(cc, 80)} 2x`}
      width="24"
      height="16"
      alt=""
      aria-hidden="true"
      loading="lazy"
      onError={() => setFailed(true)}
      className="h-4 w-6 shrink-0 rounded-[3px] object-cover shadow-sm ring-1 ring-black/10"
    />
  );
}

const Chevron = ({ open }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className={`h-4 w-4 shrink-0 transition-transform duration-300 ${
      open ? "rotate-180" : ""
    }`}
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export default function CurrencySelector({ className = "" }) {
  const { code, live, setCode } = useCurrency();
  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState(false);
  const [pos, setPos] = useState(null);

  const buttonRef = useRef(null);
  const panelRef = useRef(null);

  const current = CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0];

  const updatePosition = useCallback(() => {
    const btn = buttonRef.current;
    if (!btn) return;

    const rect = btn.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const width = Math.min(vw * 0.92, PANEL_MAX_WIDTH);
    const left = Math.min(
      Math.max(rect.left + rect.width / 2 - width / 2, MARGIN),
      vw - width - MARGIN,
    );

    const spaceBelow = vh - rect.bottom - GAP - MARGIN;
    const spaceAbove = rect.top - GAP - MARGIN;
    const openUp = spaceBelow < 340 && spaceAbove > spaceBelow;

    setPos({
      left,
      width,
      openUp,
      top: rect.bottom + GAP,
      bottom: vh - rect.top + GAP,
      maxHeight: Math.max(openUp ? spaceAbove : spaceBelow, 200),
    });
  }, []);

  // Position the panel, keep it attached on scroll/resize, animate in
  useLayoutEffect(() => {
    if (!open) {
      setShown(false);
      return undefined;
    }

    updatePosition();
    const raf = requestAnimationFrame(() => setShown(true));

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, updatePosition]);

  // Close on outside click / Escape
  useEffect(() => {
    if (!open) return undefined;

    const onPointerDown = (e) => {
      if (buttonRef.current?.contains(e.target)) return;
      if (panelRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    const onKey = (e) => e.key === "Escape" && setOpen(false);

    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const choose = (next) => {
    setCode(next);
    setOpen(false);
  };

  const panel =
    open && pos && typeof document !== "undefined"
      ? createPortal(
          <div
            ref={panelRef}
            id="currency-panel"
            role="dialog"
            aria-label="Choose currency"
            style={{
              left: pos.left,
              width: pos.width,
              maxHeight: pos.maxHeight,
              ...(pos.openUp ? { bottom: pos.bottom } : { top: pos.top }),
            }}
            className={`fixed z-[1000] flex flex-col rounded-3xl border border-neutral-200 bg-white p-4 shadow-2xl shadow-blue-900/15 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              pos.openUp ? "origin-bottom" : "origin-top"
            } ${
              shown
                ? "translate-y-0 scale-100 opacity-100"
                : `${pos.openUp ? "translate-y-2" : "-translate-y-2"} scale-95 opacity-0`
            }`}
          >
            <p className="mb-3 shrink-0 text-center text-[11px] font-bold uppercase tracking-[0.18em] text-neutral-400">
              Show prices in
            </p>

            <div
              data-lenis-prevent
              className="grid min-h-0 flex-1 grid-cols-2 gap-2 overflow-y-auto overscroll-contain sm:grid-cols-3"
            >
              {CURRENCIES.map((c) => {
                const active = c.code === code;
                return (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => choose(c.code)}
                    aria-pressed={active}
                    className={`flex items-center gap-2.5 rounded-2xl border px-3 py-2.5 text-left transition active:scale-95 ${
                      active
                        ? "border-blue-600 bg-blue-50 shadow-sm"
                        : "border-neutral-200 bg-white hover:border-blue-300 hover:bg-blue-50/50"
                    }`}
                  >
                    <Flag cc={c.cc} />
                    <span className="min-w-0">
                      <span
                        className={`block text-sm font-bold leading-none ${
                          active ? "text-blue-700" : "text-neutral-900"
                        }`}
                      >
                        {c.code}
                      </span>
                      <span className="mt-1 block truncate text-[10px] font-medium leading-none text-neutral-500">
                        {c.name}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>

            <p className="mt-3 shrink-0 text-center text-[11px] leading-relaxed text-neutral-500">
              Other currencies are approximate{live ? " (live rates)" : ""}.
              Bookings are charged in South African rand (ZAR), and your bank
              converts the amount at its own rate.
            </p>
          </div>,
          document.body,
        )
      : null;

  return (
    <div className={`relative w-full sm:w-auto ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="currency-panel"
        aria-label={`Currency: ${current.name}. Change currency`}
        className="flex w-full items-center justify-center gap-2 rounded-full border border-neutral-300 bg-white px-4 py-3 text-sm font-semibold text-neutral-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 sm:w-auto"
      >
        <Flag cc={current.cc} />
        <span>{current.code}</span>
        <Chevron open={open} />
      </button>

      {panel}
    </div>
  );
}