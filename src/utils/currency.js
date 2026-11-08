// src/utils/currency.js
//
// Display-only currency switching.
//
// Paystack South Africa accounts charge and settle in ZAR only. Visitors paying
// with international Visa / Mastercard / Amex cards are charged the ZAR amount
// and their own bank converts it. So ZAR is the only currency that is actually
// charged; every other currency here is an approximate price for the visitor.
//
// Safe for SSG: the server snapshot is always ZAR, so the pre-rendered HTML is
// identical to what Google sees. Saved choices and live rates only load in the
// browser, after hydration.

import { useEffect, useSyncExternalStore } from "react";

export const BASE_CURRENCY = "ZAR";

export const CURRENCIES = [
  { code: "ZAR", cc: "za", name: "South African rand" },
  { code: "USD", cc: "us", name: "US dollar" },
  { code: "GBP", cc: "gb", name: "British pound" },
  { code: "EUR", cc: "eu", name: "Euro" },
  { code: "AUD", cc: "au", name: "Australian dollar" },
  { code: "CAD", cc: "ca", name: "Canadian dollar" },
  { code: "NGN", cc: "ng", name: "Nigerian naira" },
  { code: "GHS", cc: "gh", name: "Ghanaian cedi" },
  { code: "KES", cc: "ke", name: "Kenyan shilling" },
];

const CODES = CURRENCIES.map((c) => c.code);

// Units of each currency per 1 ZAR. PLACEHOLDERS only, used until live rates
// load or if the rate service is unreachable. Update them now and then.
const FALLBACK_RATES = {
  ZAR: 1,
  USD: 0.055,
  GBP: 0.042,
  EUR: 0.048,
  AUD: 0.084,
  CAD: 0.076,
  NGN: 82,
  GHS: 0.6,
  KES: 7.1,
};

const RATES_URL = "https://open.er-api.com/v6/latest/ZAR";
const CODE_KEY = "cf-currency";
const RATES_KEY = "cf-fx-rates";
const RATES_TTL = 12 * 60 * 60 * 1000; // 12 hours

const DEFAULT_STATE = Object.freeze({
  code: BASE_CURRENCY,
  rates: FALLBACK_RATES,
  live: false,
});

// ─── Tiny external store ─────────────────────────────────────────────────────

let state = DEFAULT_STATE;
const listeners = new Set();

const setState = (patch) => {
  state = { ...state, ...patch };
  listeners.forEach((fn) => fn());
};

const subscribe = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

const getSnapshot = () => state;
const getServerSnapshot = () => DEFAULT_STATE;

// ─── Rates (only fetched once a non-ZAR currency is in use) ──────────────────

let ratesRequested = false;

async function ensureRates() {
  if (ratesRequested || typeof window === "undefined") return;
  ratesRequested = true;

  try {
    const cached = JSON.parse(window.localStorage.getItem(RATES_KEY));
    if (cached && Date.now() - cached.at < RATES_TTL) {
      setState({ rates: { ...FALLBACK_RATES, ...cached.rates, ZAR: 1 }, live: true });
      return;
    }
  } catch {
    /* ignore bad cache */
  }

  try {
    const res = await fetch(RATES_URL);
    if (!res.ok) throw new Error("rates request failed");
    const data = await res.json();
    if (data?.result !== "success") throw new Error("rates unavailable");

    const rates = { ZAR: 1 };
    CODES.forEach((code) => {
      const r = Number(data.rates?.[code]);
      if (r > 0) rates[code] = r;
    });

    setState({ rates: { ...FALLBACK_RATES, ...rates }, live: true });
    try {
      window.localStorage.setItem(RATES_KEY, JSON.stringify({ at: Date.now(), rates }));
    } catch {
      /* storage unavailable */
    }
  } catch {
    ratesRequested = false; // allow a retry next time; fallback rates stay in use
  }
}

// ─── Start (browser only, called from the hook's effect) ─────────────────────

let started = false;

function start() {
  if (started || typeof window === "undefined") return;
  started = true;

  try {
    const saved = window.localStorage.getItem(CODE_KEY);
    if (saved && CODES.includes(saved)) {
      setState({ code: saved });
      if (saved !== BASE_CURRENCY) ensureRates();
    }
  } catch {
    /* storage unavailable */
  }
}

export function setCurrency(code) {
  if (!CODES.includes(code)) return;
  setState({ code });
  try {
    window.localStorage.setItem(CODE_KEY, code);
  } catch {
    /* storage unavailable */
  }
  if (code !== BASE_CURRENCY) ensureRates();
}

// ─── Formatting ──────────────────────────────────────────────────────────────

const formatters = {};
const getFormatter = (code) => {
  formatters[code] ??= new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: code,
    maximumFractionDigits: 0,
  });
  return formatters[code];
};

export function formatPrice(zarAmount, { code, rates }) {
  const zar = Number(zarAmount) || 0;

  if (code === BASE_CURRENCY) {
    return `R${Math.round(zar).toLocaleString("en-US")}`;
  }

  const rate = rates[code] ?? FALLBACK_RATES[code] ?? 1;
  return `≈ ${getFormatter(code).format(Math.round(zar * rate))}`;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useCurrency() {
  const snap = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    start();
  }, []);

  return {
    code: snap.code,
    live: snap.live,
    isBase: snap.code === BASE_CURRENCY,
    setCode: setCurrency,
    format: (zarAmount) => formatPrice(zarAmount, snap),
  };
}