const TourPricing = ({ pricing = [] }) => {
  if (!pricing.length) return null;

  return (
    <section className="w-full">
      {/* HEADER */}
      {/* <div className="mb-6">
        <span className="mb-1 block font-bitter text-xs font-bold uppercase tracking-[0.12em] text-blue-600">
          Pricing
        </span>

        <h2 className="font-bitter text-2xl font-bold text-neutral-950 md:text-3xl">
          Tour Pricing
        </h2>
      </div> */}

      {/* PRICING TABLE */}
      <div className="overflow-hidden rounded-[1.5rem] border border-blue-100 bg-blue-50/60">
        {/* TABLE HEADER */}
        <div className="hidden grid-cols-[1fr_auto] gap-6 border-b border-blue-100 px-5 py-4 sm:grid sm:px-6">
          <p className="font-bitter text-xs font-bold uppercase tracking-[0.1em] text-blue-600">
            Category
          </p>

          <p className="text-right font-bitter text-xs font-bold uppercase tracking-[0.1em] text-blue-600">
            Price
          </p>
        </div>

        {/* ITEMS */}
        <div className="space-y-3 p-3 sm:p-4">
          {pricing.map((item, index) => (
            <article
              key={`${item.category}-${index}`}
              className="grid grid-cols-1 gap-3 rounded-[1.15rem] border border-blue-100 bg-white p-4 transition duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-sm sm:grid-cols-[1fr_auto] sm:items-center sm:gap-6 sm:p-5"
            >
              {/* CATEGORY */}
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
              <div className="flex items-baseline gap-2 sm:justify-end">
                <span className="font-bitter text-lg font-bold text-blue-700 sm:text-xl">
                  R
                  {Number(item.pricePerPerson).toLocaleString(
                    "en-ZA",
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }
                  )}
                </span>

                <span className="font-bitter text-xs font-medium text-neutral-500">
                  per person
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TourPricing;
