import React from "react";

const TourIncludedExcluded = ({ tour }) => {
  const included = tour?.included || [];
  const excluded = tour?.excluded || [];

  if (!included.length && !excluded.length) {
    return null;
  }

  return (
    <section className="w-full">
      {/* HEADER */}
      <div className="mb-6">
        <span className="mb-1 block font-bitter text-xs font-bold uppercase tracking-[0.12em] text-blue-600">
          Trip Clarity
        </span>

        <h2 className="font-bitter text-2xl font-bold text-neutral-950 md:text-3xl">
          Included & Not Included
        </h2>
      </div>

      {/* CARDS */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

        {/* ================================= */}
        {/* WHAT'S INCLUDED                   */}
        {/* ================================= */}

        {included.length > 0 && (
          <div
            className="
              group
              overflow-hidden
              rounded-[1.5rem]
              border
              border-emerald-200
              bg-gradient-to-br
              from-emerald-50
              via-white
              to-blue-50
              transition-all
              duration-300
              hover:border-emerald-300
              hover:shadow-[0_18px_45px_rgba(16,185,129,0.10)]
            "
          >
            {/* HEADER */}
            <div className="flex items-center gap-3 border-b border-emerald-200/70 px-5 py-4 sm:px-6">
              <span
                className="
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-emerald-500
                  font-bitter
                  text-sm
                  font-bold
                  text-white
                  shadow-[0_6px_18px_rgba(16,185,129,0.20)]
                "
              >
                ✓
              </span>

              <div>
                <p className="font-bitter text-xs font-bold uppercase tracking-[0.1em] text-emerald-700">
                  Included
                </p>

                <h3 className="mt-0.5 font-bitter text-base font-bold text-neutral-950">
                  What's included
                </h3>
              </div>
            </div>

            {/* ITEMS */}
            <div className="space-y-1.5 p-3 sm:p-4">
              {included.map((item, index) => (
                <CompactLineItem
                  key={`${getItemText(item)}-${index}`}
                  text={getItemText(item)}
                  variant="included"
                />
              ))}
            </div>
          </div>
        )}

        {/* ================================= */}
        {/* ADDITIONAL COSTS                  */}
        {/* ================================= */}

        {excluded.length > 0 && (
          <div
            className="
              group
              overflow-hidden
              rounded-[1.5rem]
              border
              border-red-200
              bg-gradient-to-br
              from-red-50
              via-white
              to-blue-50
              transition-all
              duration-300
              hover:border-red-300
              hover:shadow-[0_18px_45px_rgba(239,68,68,0.08)]
            "
          >
            {/* HEADER */}
            <div className="flex items-center gap-3 border-b border-red-200/70 px-5 py-4 sm:px-6">
              <span
                className="
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-red-400
                  font-bitter
                  text-sm
                  font-bold
                  text-white
                  shadow-[0_6px_18px_rgba(239,68,68,0.16)]
                "
              >
                −
              </span>

              <div>
                <p className="font-bitter text-xs font-bold uppercase tracking-[0.1em] text-red-500">
                  Not Included
                </p>

                <h3 className="mt-0.5 font-bitter text-base font-bold text-neutral-950">
                  Additional costs
                </h3>
              </div>
            </div>

            {/* ITEMS */}
            <div className="space-y-1.5 p-3 sm:p-4">
              {excluded.map((item, index) => (
                <CompactLineItem
                  key={`${getItemText(item)}-${index}`}
                  text={getItemText(item)}
                  variant="excluded"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};


/* ================================= */
/* LINE ITEM                         */
/* ================================= */

function CompactLineItem({
  text,
  variant = "included",
}) {
  const isIncluded = variant === "included";

  return (
    <div
      className={`
        group/item
        flex
        items-start
        gap-3
        rounded-[0.9rem]
        border
        border-transparent
        bg-white/70
        px-3
        py-3
        transition-all
        duration-250

        hover:bg-white
        hover:shadow-sm

        ${
          isIncluded
            ? `
              hover:border-emerald-200
              hover:bg-emerald-50 
            `
            : `
              hover:border-red-200
              hover:bg-red-50/60
            `
        }
      `}
    >
      {/* ICON */}
      <span
        className={`
          mt-0.5
          flex
          h-6
          w-6
          shrink-0
          items-center
          justify-center
          rounded-full
          bg-white
          font-bitter
          text-[11px]
          font-bold
          shadow-sm
          ring-1
          transition-all
          duration-250
          group-hover/item:b

          ${
            isIncluded
              ? `
                text-emerald-600
                ring-emerald-200
                group-hover/item:bg-emerald-500
                group-hover/item:text-white
                group-hover/item:ring-emerald-500
              `
              : `
                text-red-400
                ring-red-200
                group-hover/item:bg-red-400
                group-hover/item:text-white
                group-hover/item:ring-red-400
              `
          }
        `}
      >
        {isIncluded ? "✓" : "−"}
      </span>

      {/* TEXT */}
      <p
        className={`
          self-center
          font-bitter
          text-sm
          leading-6
          transition-colors
          duration-200

          ${
            isIncluded
              ? "text-neutral-700 group-hover/item:text-emerald-800"
              : "text-neutral-700 group-hover/item:text-red-700"
          }
        `}
      >
        {text}
      </p>
    </div>
  );
};


/* ================================= */
/* ITEM TEXT HELPER                  */
/* ================================= */

function getItemText(item) {
  if (typeof item === "string") {
    return item;
  }

  return item?.text || "";
}


export default TourIncludedExcluded;