import Stripe from "stripe";
import tours, { SUPPORTED_CURRENCIES } from "../src/data/tours.js";

const FX_RATES = {
  ZAR: 1,
  USD: 0.054,
  EUR: 0.05,
  GBP: 0.043,
};

const toMinorUnit = (amount, currency) => {
  const safeAmount = Number(amount);
  const code = String(currency || "ZAR").toUpperCase();

  if (!Number.isFinite(safeAmount)) return 0;

  const ZERO_DECIMAL = new Set(["JPY", "KRW"]);

  return ZERO_DECIMAL.has(code)
    ? Math.round(safeAmount)
    : Math.round(safeAmount * 100);
};

const getTourById = (tourId) => {
  return tours.find((tour) => String(tour.id) === String(tourId));
};

const getBestGroupDiscount = (tour, participants) => {
  if (!tour?.groupDiscount?.enabled) return 0;

  const rules = tour.groupDiscount.rules || [];

  const matchingRules = rules.filter(
    (rule) => Number(participants) >= Number(rule.minPeople)
  );

  if (!matchingRules.length) return 0;

  return Math.max(
    ...matchingRules.map((rule) => Number(rule.discountPercent) || 0)
  );
};

export default async function handler(req, res) {
  console.log("Payment intent API hit:", req.method);
  console.log("Payment intent body:", req.body);

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({
        error: "Missing STRIPE_SECRET_KEY",
      });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const { tourId, participants, currency, email } = req.body;

    if (!tourId || !participants || !currency) {
      return res.status(400).json({
        error: "Missing required payment details",
        received: req.body,
      });
    }

    const tour = getTourById(tourId);

    if (!tour) {
      return res.status(400).json({
        error: "Invalid tour ID",
        receivedTourId: tourId,
        availableTourIds: tours.map((item) => item.id),
      });
    }

    const code = String(currency || "ZAR").toUpperCase();
    const safeParticipants = Number(participants);

    if (!Number.isInteger(safeParticipants) || safeParticipants < 1) {
      return res.status(400).json({
        error: "Invalid participants amount",
      });
    }

    const supportedCurrencies =
      tour.supportedCurrencies?.length > 0
        ? tour.supportedCurrencies
        : SUPPORTED_CURRENCIES;

    if (!supportedCurrencies.includes(code)) {
      return res.status(400).json({
        error: `Unsupported currency for this tour: ${code}`,
        supportedCurrencies,
      });
    }

    if (!FX_RATES[code]) {
      return res.status(400).json({
        error: `Missing FX rate for currency: ${code}`,
      });
    }

    const basePriceZar = Number(tour.priceBase);

    if (!Number.isFinite(basePriceZar) || basePriceZar < 1) {
      return res.status(400).json({
        error: "Invalid tour price",
        receivedTourPrice: tour.priceBase,
        tourId,
      });
    }

    const discountPercent = getBestGroupDiscount(tour, safeParticipants);
    const subtotalZar = basePriceZar * safeParticipants;
    const discountAmountZar = subtotalZar * (discountPercent / 100);
    const finalTotalZar = subtotalZar - discountAmountZar;

    const convertedTotal = finalTotalZar * FX_RATES[code];
    const amount = toMinorUnit(convertedTotal, code);

    if (!Number.isFinite(amount) || amount < 1) {
      return res.status(400).json({
        error: "Invalid payment amount",
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: code.toLowerCase(),
      receipt_email: email || undefined,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        tourId: String(tour.id),
        tourSlug: tour.slug || "",
        tourTitle: tour.title || "",
        participants: String(safeParticipants),
        baseCurrency: tour.baseCurrency || "ZAR",
        selectedCurrency: code,
        basePriceZar: String(basePriceZar),
        subtotalZar: String(subtotalZar),
        discountPercent: String(discountPercent),
        finalTotalZar: String(finalTotalZar),
      },
    });

    return res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount,
      currency: code,
      tour: {
        id: tour.id,
        title: tour.title,
        slug: tour.slug,
      },
      pricing: {
        participants: safeParticipants,
        basePriceZar,
        subtotalZar,
        discountPercent,
        finalTotalZar,
        convertedTotal,
        currency: code,
        minorUnitAmount: amount,
      },
    });
  } catch (error) {
    console.error("Payment intent error:", error);

    return res.status(500).json({
      error: error.message || "Failed to create payment intent",
    });
  }
}