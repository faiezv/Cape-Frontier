// src/utils/bookingPricing.js

import { formatMoney } from '../components/Tours/Helpers.jsx';
export const PRIVATE_TOUR_FEE_ZAR = 750;
export const CUSTOM_TRIP_FEE_ZAR = 500;

export const FX_RATES = {
  ZAR: 1,
  USD: 0.054,
  EUR: 0.05,
  GBP: 0.043,
};

export const normalizeAdditionalPricingType = (type) => {
  const normalized = String(type || "").toLowerCase().trim();

  // Support old typo in existing tour data
  if (normalized === "quanity" || normalized === "quanitity") {
    return "quantity";
  }

  return normalized;
};

export const convertPrice = (
  amount = 0,
  targetCurrency = "ZAR"
) => {
  const numericAmount = Number(amount || 0);

  if (!Number.isFinite(numericAmount)) return 0;

  return (
    numericAmount *
    (FX_RATES[targetCurrency] || 1)
  );
};

export { formatMoney };


/**
 * Find the selected tour option.
 *
 * formData.selectedOption contains the option ID.
 */
export const getSelectedTourOption = (
  tour,
  selectedOption
) => {
  if (!Array.isArray(tour?.options)) {
    return null;
  }

  if (!selectedOption) {
    return null;
  }

  return (
    tour.options.find(
      (option) => option.id === selectedOption
    ) || null
  );
};

/**
 * Calculate the price of the selected tour.options item.
 *
 * option.pricePerPerson is multiplied by participants.
 */
export const getSelectedOptionPricing = ({
  tour,
  selectedOption,
  participantCount,
  currency,
}) => {
  const option = getSelectedTourOption(
    tour,
    selectedOption
  );

  if (!option) {
    return {
      option: null,
      pricePerPerson: 0,
      total: 0,
    };
  }

  const pricePerPerson = convertPrice(
    option.pricePerPerson,
    currency
  );

  const total =
    pricePerPerson *
    Math.max(Number(participantCount || 1), 1);

  return {
    option,
    pricePerPerson,
    total,
  };
};

/**
 * Calculate fixed / quantity additional pricing.
 *
 * request/external do not automatically add money.
 */
export const getAdditionalPricing = ({
  tour,
  formData,
  currency,
}) => {
  const pricing = Array.isArray(
    tour?.additionalPricing
  )
    ? tour.additionalPricing
    : [];

  const selections =
    formData?.additionalPricing || {};

  const items = pricing.map((item, index) => {
    const category =
      item.category ||
      item.id ||
      `option-${index}`;

    const selection =
      selections[category] || {};

    const type =
      normalizeAdditionalPricingType(
        item.type
      );

    const selected = Boolean(
      selection.selected
    );

    const quantity =
      Math.max(
        Number(selection.quantity || 0),
        0
      );

    let total = 0;

    if (selected && type === "fixed") {
      total = convertPrice(
        item.price,
        currency
      );
    }

    if (
      selected &&
      type === "quantity"
    ) {
      total =
        convertPrice(
          item.price,
          currency
        ) * quantity;
    }

    return {
      ...item,
      category,
      type,
      selected,
      quantity,
      convertedPrice: convertPrice(
        item.price,
        currency
      ),
      total,
    };
  });

  const total = items.reduce(
    (sum, item) => sum + item.total,
    0
  );

  return {
    items,
    total,
  };
};

/**
 * Complete booking price calculation.
 */
export const calculateBookingPricing = ({
  tour,
  formData,
  participantCount,
  currency,
  groupDiscountPercent = 0,
}) => {
  const participants = Math.max(
    Number(participantCount || 1),
    1
  );

  const pricePerPerson = convertPrice(
    tour?.priceBase,
    currency
  );

  const baseSubtotal =
    pricePerPerson * participants;

  const groupDiscountAmount =
    groupDiscountPercent > 0
      ? baseSubtotal *
        (groupDiscountPercent / 100)
      : 0;

  const discountedTourSubtotal =
    Math.max(
      baseSubtotal -
        groupDiscountAmount,
      0
    );

  const privateFee = formData?.isPrivate
    ? convertPrice(
        PRIVATE_TOUR_FEE_ZAR,
        currency
      )
    : 0;

  const customFee = formData?.isCustom
    ? convertPrice(
        CUSTOM_TRIP_FEE_ZAR,
        currency
      )
    : 0;

  const selectedOptionPricing =
    getSelectedOptionPricing({
      tour,
      selectedOption:
        formData?.selectedOption,
      participantCount: participants,
      currency,
    });

  const additionalPricing =
    getAdditionalPricing({
      tour,
      formData,
      currency,
    });

  const estimatedTotal =
    discountedTourSubtotal +
    privateFee +
    customFee +
    selectedOptionPricing.total +
    additionalPricing.total;

  return {
    currency,

    participants,

    pricePerPerson,

    baseSubtotal,

    groupDiscountPercent,

    groupDiscountAmount,

    discountedTourSubtotal,

    privateFee,

    customFee,

    selectedOption:
      selectedOptionPricing.option,

    selectedOptionPricePerPerson:
      selectedOptionPricing.pricePerPerson,

    selectedOptionTotal:
      selectedOptionPricing.total,

    additionalPricingItems:
      additionalPricing.items,

    additionalPricingTotal:
      additionalPricing.total,

    estimatedTotal,
  };
};