import useMoney from "../../utils/useMoney.js";

const AdditionalPricing = ({ pricing = [] }) => {
  const { money } = useMoney();

  if (!pricing.length) return null;

  // Returns { text, showUnit }
  const getPrice = (item) => {
    // Priced on request: never a number, never "Free"
    if (item.type === "request") {
      return { text: "On request", showUnit: false };
    }

    const amount = Number(item.price);
    if (!Number.isFinite(amount)) return { text: null, showUnit: false };

    // Third-party priced items with no amount shouldn't read as "Free"
    if (amount === 0 && item.type === "external") {
      return { text: "Paid separately", showUnit: false };
    }

    if (amount === 0) return { text: "Free", showUnit: false };

    // Prices are stored in ZAR; only convert those
    const isZar = !item.currency || item.currency === "ZAR";
    const text = isZar
      ? money(amount)
      : `${item.currency} ${amount.toLocaleString("en-ZA", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`;

    return { text, showUnit: true };
  };

  return (
    <section className="w-full py-4">
      <div className="rounded-[1.5rem] border border-blue-100 bg-blue-50/60 p-3 sm:p-4">
        <div className="space-y-3">
          {pricing.map((item, index) => {
            const { text, showUnit } = getPrice(item);

            return (
              <article
                key={`${item.category}-${index}`}
                className="flex flex-col gap-4 rounded-[1.15rem] border border-blue-100 bg-white p-4 transition duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-sm sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:p-5"
              >
                {/* CONTENT */}
                <div className="min-w-0">
                  <h3 className="font-bitter text-sm font-bold text-neutral-950 sm:text-base">
                    {item.category}
                  </h3>

                  {item.note && (
                    <p className="mt-1.5 max-w-2xl font-bitter text-xs leading-5 text-neutral-600 sm:text-sm">
                      {item.note}
                    </p>
                  )}
                </div>

                {/* PRICE */}
                <div className="flex shrink-0 items-baseline gap-2">
                  <strong className="font-bitter text-lg font-bold text-blue-700 sm:text-xl">
                    {text}
                  </strong>

                  {showUnit && item.unit && (
                    <span className="font-bitter text-xs font-medium text-neutral-500">
                      {item.unit}
                    </span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default AdditionalPricing; 