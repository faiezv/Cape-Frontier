const TourGroupPricing = ({ groupPricing }) => {
  if (
    !groupPricing?.enabled ||
    !groupPricing?.tiers?.length
  ) {
    return null;
  }

  return (
    <section className="w-full">
      {/* HEADER */}

      <div className="flex items-center justify-center gap-4 py-4">
        <img src="/icons/savemore.png" className="h-16" alt="save-more-icon" />
        <div className="">
          <span className="mb-1 block font-bitter text-xs font-bold uppercase tracking-[0.12em] text-emerald-600">
            Group Savings
          </span>

          <h2 className="font-bitter text-2xl font-bold text-neutral-950 md:text-3xl">
            Save More as a Group
          </h2>
        </div>
      </div>

      {/* GROUP PRICING */}
      <div className="overflow-hidden rounded-[1.5rem] border border-emerald-100 bg-emerald-50/60">
        <div className="space-y-3 p-3 sm:p-4">
          {groupPricing.tiers.map((tier, index) => (
            <article
              key={`${tier.minPeople}-${index}`}
              className="flex flex-col gap-4 rounded-[1.15rem] border border-emerald-100 bg-white p-4 transition duration-300 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-sm sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:p-5"
            >
              {/* DETAILS */}
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-bitter text-sm font-bold text-neutral-950 sm:text-base">
                    {tier.minPeople}+ people
                  </h3>

                  {tier.label && (
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-bitter text-[10px] font-bold uppercase tracking-[0.08em] text-emerald-700">
                      {tier.label}
                    </span>
                  )}
                </div>

                {tier.note && (
                  <p className="mt-1.5 max-w-2xl font-bitter text-xs leading-5 text-neutral-600 sm:text-sm">
                    {tier.note}
                  </p>
                )}
              </div>

              {/* PRICE */}
              <div className="flex shrink-0 items-baseline gap-2">
                <strong className="font-bitter text-lg font-bold text-emerald-700 sm:text-xl">
                  R
                  {Number(tier.perPerson).toLocaleString(
                    "en-ZA",
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }
                  )}
                </strong>

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

export default TourGroupPricing;
