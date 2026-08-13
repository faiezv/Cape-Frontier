const TourCancellationPolicy = ({ policy }) => {
  if (!policy) return null;

  return (
    <section className="w-full">
      {/* HEADER */}
      <div className="mb-6">
        <span className="mb-1 block font-bitter text-xs font-bold uppercase tracking-[0.12em] text-blue-600">
          Booking Policy
        </span>

        <h2 className="font-bitter text-2xl font-bold text-neutral-950 md:text-3xl">
          Cancellation Policy
        </h2>
      </div>

      {/* POLICY CARD */}
      <div className="overflow-hidden rounded-[1.5rem] border border-blue-100 bg-blue-50/60">
        {/* SUMMARY */}
        {policy.summary && (
          <div className="border-b border-blue-100 px-5 py-5 sm:px-6">
            <p className="max-w-3xl font-bitter text-sm leading-7 text-neutral-700 sm:text-base">
              {policy.summary}
            </p>
          </div>
        )}

        {/* ITEMS */}
        {policy.items?.length > 0 && (
          <ul className="divide-y divide-blue-100">
            {policy.items.map((item, index) => {
              const text =
                typeof item === "string"
                  ? item
                  : item.text;

              return (
                <li
                  key={`${text}-${index}`}
                  className="flex gap-4 px-5 py-4 transition-colors hover:bg-white/60 sm:px-6"
                >
                  {/* CHECK ICON */}
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white font-bitter text-sm font-bold text-blue-700 shadow-sm ring-1 ring-blue-100">
                    ✓
                  </span>

                  {/* TEXT */}
                  <span className="font-bitter text-sm leading-6 text-neutral-700 sm:text-[15px]">
                    {text}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
};

export default TourCancellationPolicy;

