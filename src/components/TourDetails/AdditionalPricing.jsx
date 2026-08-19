import React from "react";

/**
 * Renders optional extras based on their type.
 *
 * selectedExtras:
 * {
 *   "Extra Name": number,  // quantity
 *   "Private Fee": true,  // fixed
 *   "Custom Request": true // request
 * }
 */
const AdditionalPricing = ({
  additionalPricing = [],
  selectedExtras = {},
  onExtrasChange,
}) => {
  const handleChange = (category, value) => {
    const newExtras = { ...selectedExtras };

    // Remove falsy values so checkout only receives active extras
    if (!value) {
      delete newExtras[category];
    } else {
      newExtras[category] = value;
    }

    onExtrasChange(newExtras);
  };

  const increaseQuantity = (category, currentValue) => {
    handleChange(category, currentValue + 1);
  };

  const decreaseQuantity = (category, currentValue) => {
    handleChange(category, Math.max(0, currentValue - 1));
  };

  const formatPrice = (price) => {
    if (price === null || price === undefined || price === "") {
      return null;
    }

    return Number(price).toLocaleString("en-ZA");
  };

  const renderExtra = (extra) => {
    const {
      type,
      category,
      price,
      unit,
      note,
    } = extra;

    const currentValue =
      selectedExtras[category] ??
      (type === "quantity" ? 0 : false);

    switch (type) {
      /* =====================================================
         QUANTITY
      ===================================================== */
      case "quantity": {
        const quantity = Number(currentValue) || 0;
        const formattedPrice = formatPrice(price);

        return (
          <div
            key={category}
            className="
              group
              flex
              items-center
              justify-between
              gap-4
              rounded-2xl
              border
              border-black/8
              bg-white
              px-4
              py-4
              transition-all
              duration-200
              hover:border-black/15
              hover:shadow-sm
            "
          >
            {/* Info */}
            <div className="min-w-0 flex-1">
              <div className="font-medium text-gray-900">
                {category}
              </div>

              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
                {formattedPrice && (
                  <span className="font-medium text-gray-700">
                    R{formattedPrice}
                    {unit && (
                      <span className="font-normal text-gray-400">
                        {" "}
                        / {unit}
                      </span>
                    )}
                  </span>
                )}
              </div>

              {note && (
                <p className="mt-1 text-xs leading-relaxed text-gray-400">
                  {note}
                </p>
              )}
            </div>

            {/* Quantity controls */}
            <div
              className="
                flex
                shrink-0
                items-center
                overflow-hidden
                rounded-xl
                border
                border-black/10
                bg-gray-50
              "
            >
              <button
                type="button"
                onClick={() =>
                  decreaseQuantity(category, quantity)
                }
                disabled={quantity === 0}
                aria-label={`Decrease ${category}`}
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  text-lg
                  text-gray-600
                  transition
                  hover:bg-gray-100
                  disabled:cursor-not-allowed
                  disabled:opacity-30
                "
              >
                −
              </button>

              <span
                className="
                  flex
                  h-10
                  min-w-10
                  items-center
                  justify-center
                  border-x
                  border-black/10
                  bg-white
                  px-2
                  text-sm
                  font-semibold
                  text-gray-900
                "
              >
                {quantity}
              </span>

              <button
                type="button"
                onClick={() =>
                  increaseQuantity(category, quantity)
                }
                aria-label={`Increase ${category}`}
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  text-lg
                  text-gray-600
                  transition
                  hover:bg-gray-100
                "
              >
                +
              </button>
            </div>
          </div>
        );
      }

      /* =====================================================
         FIXED
      ===================================================== */
      case "fixed": {
        const checked = !!selectedExtras[category];
        const formattedPrice = formatPrice(price);

        return (
          <label
            key={category}
            className={`
              group
              flex
              cursor-pointer
              items-center
              justify-between
              gap-4
              rounded-2xl
              border
              px-4
              py-4
              transition-all
              duration-200
              ${
                checked
                  ? "border-black/20 bg-gray-50"
                  : "border-black/8 bg-white hover:border-black/15"
              }
            `}
          >
            <div className="flex min-w-0 items-center gap-3">
              {/* Custom checkbox */}
              <input
                type="checkbox"
                checked={checked}
                onChange={(e) =>
                  handleChange(
                    category,
                    e.target.checked
                  )
                }
                className="
                  h-5
                  w-5
                  shrink-0
                  cursor-pointer
                  accent-black
                "
              />

              <div className="min-w-0">
                <div className="font-medium text-gray-900">
                  {category}
                </div>

                {note && (
                  <p className="mt-1 text-xs leading-relaxed text-gray-400">
                    {note}
                  </p>
                )}
              </div>
            </div>

            <span
              className={`
                shrink-0
                text-sm
                font-medium
                ${
                  checked
                    ? "text-gray-900"
                    : "text-gray-500"
                }
              `}
            >
              {formattedPrice
                ? `+ R${formattedPrice} flat rate`
                : "Flat rate"}
            </span>
          </label>
        );
      }

      /* =====================================================
         REQUEST
      ===================================================== */
      case "request": {
        const checked = !!selectedExtras[category];

        return (
          <label
            key={category}
            className={`
              group
              flex
              cursor-pointer
              items-center
              justify-between
              gap-4
              rounded-2xl
              border
              px-4
              py-4
              transition-all
              duration-200
              ${
                checked
                  ? "border-black/20 bg-gray-50"
                  : "border-black/8 bg-white hover:border-black/15"
              }
            `}
          >
            <div className="flex min-w-0 items-center gap-3">
              <input
                type="checkbox"
                checked={checked}
                onChange={(e) =>
                  handleChange(
                    category,
                    e.target.checked
                  )
                }
                className="
                  h-5
                  w-5
                  shrink-0
                  cursor-pointer
                  accent-black
                "
              />

              <div className="min-w-0">
                <div className="font-medium text-gray-900">
                  {category}
                </div>

                {note && (
                  <p className="mt-1 text-xs leading-relaxed text-gray-400">
                    {note}
                  </p>
                )}
              </div>
            </div>

            <span
              className="
                shrink-0
                text-sm
                font-medium
                text-gray-500
              "
            >
              +0
            </span>
          </label>
        );
      }

      /* =====================================================
         EXTERNAL
      ===================================================== */
      case "external":
        return (
          <div
            key={category}
            className="
              flex
              items-center
              justify-between
              gap-4
              rounded-2xl
              border
              border-black/8
              bg-gray-50/70
              px-4
              py-4
            "
          >
            <div className="min-w-0">
              <div className="font-medium text-gray-900">
                {category}
              </div>

              <p className="mt-1 text-xs leading-relaxed text-gray-400">
                {note || "Available separately"}
              </p>
            </div>

            <a
              href={extra.url || extra.link || note}
              target="_blank"
              rel="noopener noreferrer"
              className="
                shrink-0
                rounded-lg
                border
                border-black/10
                bg-white
                px-3
                py-2
                text-xs
                font-medium
                text-gray-700
                transition
                hover:border-black/20
                hover:text-black
              "
            >
              Paid on site ↗
            </a>
          </div>
        );

      default:
        return null;
    }
  };

  if (!additionalPricing.length) {
    return null;
  }

  return (
    <section className="mt-6">
      {/* Header */}
      <div className="mb-3">
        <h3 className="text-base font-semibold tracking-tight text-gray-900">
          Optional extras
        </h3>

        <p className="mt-1 text-sm text-gray-400">
          Enhance your experience with these optional additions.
        </p>
      </div>

      {/* Extras */}
      <div className="space-y-3">
        {additionalPricing.map(renderExtra)}
      </div>
    </section>
  );
};

export default AdditionalPricing;