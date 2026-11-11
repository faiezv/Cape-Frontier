import React from "react";
import useMoney from "../../utils/useMoney.js";

const InfoIcon = ({ children }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-4 w-4 shrink-0"
    aria-hidden="true"
  >
    {children}
  </svg>
);

const TourPricing = ({ pricing = [], minAge, childFriendly }) => {
  const { money } = useMoney();

  if (!pricing.length) return null;

  const age = Number(minAge);
  const hasMinAge = Number.isFinite(age) && age > 0;
  const notChildFriendly = childFriendly === false;
  const showNotice = hasMinAge || notChildFriendly;

  return (
    <section className="w-full">
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

        {/* AGE / FAMILY NOTICE */}
        {showNotice && (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-blue-100 bg-white/60 px-5 py-3 sm:px-6">
            {hasMinAge && (
              <span className="inline-flex items-center gap-1.5 font-bitter text-xs font-semibold text-neutral-700 sm:text-sm">
                <span className="text-blue-600">
                  <InfoIcon>
                    <circle cx="12" cy="8" r="3.5" />
                    <path d="M5 20c0-3.9 3.1-7 7-7s7 3.1 7 7" />
                  </InfoIcon>
                </span>
                Minimum age: {age}+
              </span>
            )}

            {notChildFriendly && (
              <span className="inline-flex items-center gap-1.5 font-bitter text-xs font-semibold text-amber-800 sm:text-sm">
                <span className="text-amber-600">
                  <InfoIcon>
                    <circle cx="12" cy="12" r="9" />
                    <path d="m5.6 5.6 12.8 12.8" />
                  </InfoIcon>
                </span>
                Not suitable for children
              </span>
            )}
          </div>
        )}

        {/* ITEMS */}
        <div className="space-y-3 p-3 sm:p-4">
          {pricing.map((item, index) => {
            const amount = Number(item.pricePerPerson) || 0;
            const isFree = amount === 0;

            return (
              <article
                key={`${item.category}-${index}`}
                className="grid grid-cols-1 gap-3 rounded-[1.15rem] border border-blue-100 bg-white p-4 transition duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-sm sm:grid-cols-[1fr_auto] sm:items-center sm:gap-6 sm:p-5"
              >
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

                <div className="flex items-baseline gap-2 sm:justify-end">
                  <span className="font-bitter text-lg font-bold text-blue-700 sm:text-xl">
                    {isFree ? "Free" : money(amount)}
                  </span>

                  {!isFree && (
                    <span className="font-bitter text-xs font-medium text-neutral-500">
                      per person
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

export default TourPricing;