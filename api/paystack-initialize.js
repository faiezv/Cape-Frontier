// api/paystack-initialize.js
import { verifyPriceToken } from "./_lib/verifyPriceToken.js";
import { getSite } from "./_lib/site.js";
import { FX_RATES } from "../src/data/fxRates.js";

const PAYSTACK_BASE_URL = "https://api.paystack.co";

// Paystack can only charge currencies enabled on the account.
// Customers see prices in their chosen currency; we charge in this one.
const CHARGE_CURRENCY = "ZAR";

const ZERO_DECIMAL = new Set(["JPY", "KRW"]);

const toSafeString = (value, fallback = "") => {
  if (value === undefined || value === null) return fallback;
  return String(value).trim();
};

const toMinorUnit = (amount, currency) => {
  const n = Number(amount);
  if (!Number.isFinite(n) || n < 0) return 0;
  return ZERO_DECIMAL.has(String(currency).toUpperCase())
    ? Math.round(n)
    : Math.round(n * 100);
};

// FX_RATES are ZAR -> display currency, so converting back is a division.
const toChargeAmount = (amount, fromCurrency) => {
  const code = String(fromCurrency || CHARGE_CURRENCY).toUpperCase();
  if (code === CHARGE_CURRENCY) return Number(amount);

  const rate = Number(FX_RATES[code]);
  if (!Number.isFinite(rate) || rate <= 0) return NaN;

  return Number(amount) / rate;
};

const buildCallbackUrl = (raw, origin) => {
  const value = toSafeString(raw);
  if (!value) return null;
  try {
    const u = new URL(value, origin);
    return `${origin}${u.pathname}${u.search}`;
  } catch {
    return null;
  }
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const secretKey =
      process.env.VERCEL_ENV === "production"
        ? process.env.PAYSTACK_SECRET_KEY
        : process.env.PAYSTACK_SECRET_KEY_TEST;

    if (!secretKey) {
      return res.status(500).json({
        error:
          process.env.VERCEL_ENV === "production"
            ? "Missing PAYSTACK_SECRET_KEY"
            : "Missing PAYSTACK_SECRET_KEY_TEST",
      });
    }

    const {
      email,
      currency = "ZAR",
      bookingReference,
      callbackUrl,
      metadata = {},
      priceToken,
    } = req.body || {};

    const customerEmail = toSafeString(email);
    if (!customerEmail) {
      return res.status(400).json({ error: "Customer email is required" });
    }

    const safeBookingReference = toSafeString(bookingReference);
    if (!safeBookingReference) {
      return res.status(400).json({ error: "Booking reference is required" });
    }

    // In every deployed environment (production / preview), a signed
    // price token is mandatory. Only `development` (vercel dev or a
    // local Vite run that never reached /api) is allowed to slip
    // through, because the endpoint isn't publicly reachable there.
    const requireToken = process.env.VERCEL_ENV !== "development";
    if (requireToken && !priceToken) {
      return res.status(400).json({
        error: "Missing price token. Please re-verify the price.",
      });
    }

    const verified = verifyPriceToken(priceToken);
    if (requireToken && !verified) {
      return res.status(400).json({
        error: "Invalid or expired price token. Please re-verify the price.",
      });
    }

    // Amount comes ONLY from the signed payload when a token exists.
    // The client-supplied `amount` is used only in the dev fallback.
    let displayCurrency;
    let displayTotal;

    if (verified) {
      displayCurrency = String(verified.currency || "ZAR").toUpperCase();
      const requestCurrency = String(currency || "ZAR").toUpperCase();

      if (displayCurrency !== requestCurrency) {
        return res.status(400).json({
          error: "Currency mismatch between token and request",
        });
      }

      displayTotal = Number(verified.finalTotal);
    } else {
      // Dev-only fallback. Client amount is in minor units of `currency`.
      displayCurrency = String(currency || "ZAR").toUpperCase();
      displayTotal =
        Number(req.body?.amount) /
        (ZERO_DECIMAL.has(displayCurrency) ? 1 : 100);
    }

    // Convert the display total into the currency we actually charge.
    const chargeCurrency = CHARGE_CURRENCY;
    const chargeTotal = toChargeAmount(displayTotal, displayCurrency);

    if (!Number.isFinite(chargeTotal) || chargeTotal <= 0) {
      return res.status(400).json({ error: "Invalid payment amount" });
    }

    const amountInSubunit = toMinorUnit(chargeTotal, chargeCurrency);

    if (!amountInSubunit || amountInSubunit < 1) {
      return res.status(400).json({ error: "Invalid payment amount" });
    }

    const paystackReference = `PSK-${safeBookingReference}-${Date.now()}`;

    // Stash the amounts in metadata so /paystack-verify can cross-check
    // after the transaction succeeds. verifiedTotalMajor is in ZAR
    // (what Paystack actually charges).
    const payload = {
      email: customerEmail,
      amount: amountInSubunit,
      currency: chargeCurrency,
      reference: paystackReference,
      metadata: {
        ...metadata,
        bookingReference: safeBookingReference,
        paymentProvider: "paystack",
        verifiedTourId: verified?.tourId || null,
        verifiedAdultCount: verified?.adultCount ?? null,
        verifiedChildAges: verified?.childAges ?? null,
        verifiedTotalMajor: chargeTotal,
        chargeCurrency,
        displayCurrency,
        displayTotal,
      },
    };

    const callback = buildCallbackUrl(callbackUrl, getSite(req).origin);
    if (callback) payload.callback_url = callback;

    const paystackRes = await fetch(
      `${PAYSTACK_BASE_URL}/transaction/initialize`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    );

    const paystackData = await paystackRes.json();

    if (!paystackRes.ok || !paystackData?.status) {
      return res.status(paystackRes.status || 500).json({
        error:
          paystackData?.message ||
          paystackData?.error ||
          "Failed to initialize Paystack transaction",
        paystack: paystackData,
      });
    }

    return res.status(200).json({
      success: true,
      authorization_url: paystackData.data?.authorization_url,
      access_code: paystackData.data?.access_code,
      reference: paystackData.data?.reference || paystackReference,
      bookingReference: safeBookingReference,
      amountCharged: amountInSubunit,
      currency: chargeCurrency,
      displayCurrency,
      displayTotal,
    });
  } catch (error) {
    console.error("Paystack initialize error:", error);
    return res.status(500).json({
      error: "Failed to initialize Paystack transaction",
      details: error?.message || "Unknown Paystack error",
    });
  }
}