const AdditionalPricing = ({ pricing = [] }) => {
  if (!pricing.length) return null;

  return (
    <section className="w-full">
      {/* HEADER
      <div className="mb-6">
        <span className="mb-1 block font-bitter text-xs font-bold uppercase tracking-[0.12em] text-blue-600">
          Additional Costs
        </span>

        <h2 className="font-bitter text-2xl font-bold text-neutral-950 md:text-3xl">
          Additional Pricing
        </h2>
      </div> */}

      {/* PRICING LIST */}
      <div className="rounded-[1.5rem] border border-blue-100 bg-blue-50/60 p-3 sm:p-4">
        <div className="space-y-3">
          {pricing.map((item, index) => (
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
                  {item.currency === "ZAR" && "R"}
                  {Number(item.price).toLocaleString(
                    "en-ZA",
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }
                  )}
                </strong>

                {item.unit && (
                  <span className="font-bitter text-xs font-medium text-neutral-500">
                    {item.unit}
                  </span>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AdditionalPricing;
