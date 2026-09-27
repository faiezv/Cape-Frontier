// api/verify-price.js
import { computePricing } from "../src/utils/pricingEngine.js";
import allTours from "../src/data/tours.js";
import { KIDS_ACTIVITIES } from "../src/data/kidsActivities.js";
import { signPricePayload, TOKEN_TTL_MS } from "./_lib/verifyPriceToken.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      tourId,
      adultCount,
      childAges,
      currency = "ZAR",
      selectedOption,
      selectedExtras,
      isPrivate,
      isCustom,
      selectedKidsActivity,
    } = req.body || {};

    const tour = allTours.find(
      (t) => t.id === tourId || t.slug === tourId,
    );
    if (!tour) {
      return res.status(404).json({ error: "Tour not found" });
    }

    const safeAdultCount = Math.max(0, Number(adultCount) || 0);
    const safeChildAges = Array.isArray(childAges) ? childAges : [];
    const safeCurrency = String(currency || "ZAR").toUpperCase();

    // Recompute from scratch — client-supplied prices are ignored.
    const pricing = computePricing({
      tour,
      childAges: safeChildAges,
      adultCount: safeAdultCount,
      currency: safeCurrency,
      selectedOption: selectedOption || null,
      selectedExtras: selectedExtras || {},
      formData: {
        isPrivate: Boolean(isPrivate),
        isCustom: Boolean(isCustom),
        selectedKidsActivity: selectedKidsActivity || null,
      },
      kidsActivities: KIDS_ACTIVITIES,
    });

    if (pricing.isCustomQuote) {
      return res.status(200).json({ isCustomQuote: true });
    }

    if (!Number.isFinite(pricing.finalTotal) || pricing.finalTotal <= 0) {
      return res.status(500).json({
        error: "Pricing engine returned an invalid total",
      });
    }

    const token = signPricePayload({
      tourId: tour.id ?? tour.slug ?? tourId,
      adultCount: safeAdultCount,
      childAges: safeChildAges,
      currency: safeCurrency,
      selectedOption: selectedOption || null,
      selectedExtras: selectedExtras || {},
      isPrivate: Boolean(isPrivate),
      isCustom: Boolean(isCustom),
      selectedKidsActivity: selectedKidsActivity || null,
      finalTotal: pricing.finalTotal,
      exp: Date.now() + TOKEN_TTL_MS,
    });

    return res.status(200).json({
      token,
      finalTotal: pricing.finalTotal,
      currency: safeCurrency,
    });
  } catch (err) {
    console.error("[verify-price] error:", err);
    return res
      .status(500)
      .json({ error: err?.message || "Verification failed" });
  }
}