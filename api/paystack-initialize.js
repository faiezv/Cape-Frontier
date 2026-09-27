// api/paystack-initialize.js
import { verifyPriceToken } from "./_lib/verifyPriceToken.js";

const PAYSTACK_BASE_URL = "https://api.paystack.co";

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

    // Amount comes ONLY from the signed payload. The client-supplied
    // `amount` field is ignored outright.
    let amountInSubunit;
    let chargeCurrency;

    if (verified) {
      const tokenCurrency = String(verified.currency || "ZAR").toUpperCase();
      const requestCurrency = String(currency || "ZAR").toUpperCase();

      if (tokenCurrency !== requestCurrency) {
        return res.status(400).json({
          error: "Currency mismatch between token and request",
        });
      }

      amountInSubunit = toMinorUnit(verified.finalTotal, tokenCurrency);
      chargeCurrency = tokenCurrency;

      if (!amountInSubunit || amountInSubunit < 1) {
        return res
          .status(400)
          .json({ error: "Token contains an invalid amount" });
      }
    } else {
      // Dev-only fallback.
      amountInSubunit = toMinorUnit(req.body?.amount, currency);
      chargeCurrency = String(currency || "ZAR").toUpperCase();
      if (!amountInSubunit || amountInSubunit < 1) {
        return res.status(400).json({ error: "Invalid payment amount" });
      }
    }

    const paystackReference = `PSK-${safeBookingReference}-${Date.now()}`;

    // Stash the verified amount in metadata so /paystack-verify can
    // cross-check after the transaction succeeds.
    const verifiedTotalMajor = verified
      ? Number(verified.finalTotal)
      : Number(req.body?.amount) / (ZERO_DECIMAL.has(chargeCurrency) ? 1 : 100);

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
        verifiedTotalMajor,
      },
    };

    if (toSafeString(callbackUrl)) {
      payload.callback_url = toSafeString(callbackUrl);
    }

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
    });
  } catch (error) {
    console.error("Paystack initialize error:", error);
    return res.status(500).json({
      error: "Failed to initialize Paystack transaction",
      details: error?.message || "Unknown Paystack error",
    });
  }
}