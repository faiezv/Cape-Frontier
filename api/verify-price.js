// api/verify-price.js
import crypto from "crypto";
import { computePricing } from "../src/utils/pricingEngine.js";
import allTours from "../src/data/tours.js";
import { KIDS_ACTIVITIES } from "../src/data/kidsActivities.js";

export default function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      tourId,
      adultCount,
      childAges,
      currency,
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

    const pricing = computePricing({
      tour,
      childAges: Array.isArray(childAges) ? childAges : [],
      adultCount: Math.max(0, Number(adultCount) || 0),
      currency,
      selectedOption,
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

    const secret = process.env.PRICE_SIGNING_SECRET;
    if (!secret) {
      return res
        .status(500)
        .json({ error: "Server misconfigured: PRICE_SIGNING_SECRET not set" });
    }

    const payload = {
      tourId,
      adultCount,
      childAges,
      currency,
      selectedOption: selectedOption || null,
      selectedExtras: selectedExtras || {},
      isPrivate: Boolean(isPrivate),
      isCustom: Boolean(isCustom),
      selectedKidsActivity: selectedKidsActivity || null,
      finalTotal: pricing.finalTotal,
      exp: Date.now() + 15 * 60 * 1000,
    };

    const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
    const sig = crypto
      .createHmac("sha256", secret)
      .update(encoded)
      .digest("base64url");

    return res.status(200).json({
      token: `${encoded}.${sig}`,
      finalTotal: pricing.finalTotal,
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[verify-price] error:", err);
    return res
      .status(500)
      .json({ error: err?.message || "Verification failed" });
  }
}