import React from "react";

const TourSafetyPolicy = ({ safety }) => {
  if (!safety) return null;

  return (
    <section className="w-full">
      {/* HEADER */}
      <div className="mb-6">
        <span className="mb-1 block font-bitter text-xs font-bold uppercase tracking-[0.12em] text-blue-600">
          Safety Policy
        </span>

        <h2 className="font-bitter text-2xl font-bold text-neutral-950 md:text-3xl">
          Safety & Compliance
        </h2>
      </div>

      {/* POLICY CARD */}
      <div className="overflow-hidden rounded-[1.5rem] border border-blue-100 bg-blue-50/60">
        {/* SUMMARY */}
        {safety.summary && (
          <div className="border-b border-blue-100 px-5 py-5 sm:px-6">
            <div className="rounded-[1.15rem] border border-blue-100 bg-white/80 px-4 py-4">
              <p className="font-bitter text-sm font-medium leading-7 text-neutral-700 sm:text-[15px]">
                {safety.summary}
              </p>
            </div>
          </div>
        )}

        {/* SAFETY ITEMS */}
        {safety.items?.length > 0 && (
          <div className="divide-y divide-blue-100">
            {safety.items.map((item, index) => {
              const text =
                typeof item === "string"
                  ? item
                  : item?.text;

              if (!text) return null;

              return (
                <div
                  key={`${text}-${index}`}
                  className="
                    group
                    flex
                    gap-4
                    px-5
                    py-4
                    transition-colors
                    duration-200
                    hover:bg-white/60
                    sm:px-6
                  "
                >
                  {/* CHECK */}
                  <span
                    className="
                      mt-0.5
                      flex
                      h-7
                      w-7
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      bg-white
                      font-bitter
                      text-xs
                      font-bold
                      text-emerald-600
                      shadow-sm
                      ring-1
                      ring-blue-100
                      transition-all
                      duration-200
                      group-hover:bg-emerald-500
                      group-hover:text-white
                      group-hover:ring-emerald-500
                    "
                  >
                    ✓
                  </span>

                  {/* TEXT */}
                  <p className="self-center font-bitter text-sm leading-6 text-neutral-700">
                    {text}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* SAFETY NOTICE */}
        <div className="border-t border-blue-100 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3 rounded-[1.15rem] border border-emerald-200 bg-emerald-50 px-4 py-3">
            <span
              className="
                flex
                h-8
                w-8
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-white
                font-bitter
                text-sm
                font-bold
                text-emerald-600
                shadow-sm
              "
            >
              ✓
            </span>

            <p className="font-bitter text-sm font-bold text-emerald-800">
              Safety comes first.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TourSafetyPolicy;
