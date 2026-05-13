const PAYSTACK_BASE_URL = "https://api.paystack.co";

const toSafeString = (value, fallback = "") => {
  if (value === undefined || value === null) return fallback;
  return String(value).trim();
};

const toPositiveInteger = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return 0;
  return Math.round(amount);
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!secretKey) {
      return res.status(500).json({
        error: "Missing PAYSTACK_SECRET_KEY",
      });
    }

    const {
      email,
      amount,
      currency = "ZAR",
      bookingReference,
      callbackUrl,
      metadata = {},
    } = req.body || {};

    const customerEmail = toSafeString(email);
    const safeCurrency = toSafeString(currency, "ZAR").toUpperCase();
    const safeBookingReference = toSafeString(bookingReference);
    const safeCallbackUrl = toSafeString(callbackUrl);
    const amountInSubunit = toPositiveInteger(amount);

    if (!customerEmail) {
      return res.status(400).json({
        error: "Customer email is required",
      });
    }

    if (!amountInSubunit || amountInSubunit < 1) {
      return res.status(400).json({
        error: "Invalid payment amount",
      });
    }

    if (!safeBookingReference) {
      return res.status(400).json({
        error: "Booking reference is required",
      });
    }

    const paystackReference = `PSK-${safeBookingReference}-${Date.now()}`;

    const payload = {
      email: customerEmail,
      amount: amountInSubunit,
      currency: safeCurrency,
      reference: paystackReference,
      metadata: {
        ...metadata,
        bookingReference: safeBookingReference,
        paymentProvider: "paystack",
      },
    };

    if (safeCallbackUrl) {
      payload.callback_url = safeCallbackUrl;
    }

    const paystackRes = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

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
    });
  } catch (error) {
    console.error("Paystack initialize error:", error);

    return res.status(500).json({
      error: "Failed to initialize Paystack transaction",
      details: error?.message || "Unknown Paystack error",
    });
  }
}
