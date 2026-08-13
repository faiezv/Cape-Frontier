const TourHighlights = ({ highlights }) => {
  if (!highlights?.length) return null;

  return (
    <section className="w-full">
      {/* HEADER */}
      <div className="mb-6">
        <span className="mb-1 block font-bitter text-xs font-bold uppercase tracking-[0.12em] text-blue-600">
          Experience
        </span>

        <h2 className="font-bitter text-2xl font-bold text-neutral-950 md:text-3xl">
          Highlights
        </h2>
      </div>

      {/* HIGHLIGHTS */}
      <div className="grid gap-3 sm:grid-cols-2">
        {highlights.map((highlight, index) => {
          const text =
            typeof highlight === "string"
              ? highlight
              : highlight.text;

          return (
            <div
              key={`${text}-${index}`}
              className="group flex gap-4 rounded-[1.25rem] border border-blue-100 bg-blue-50/60 p-4 transition duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:shadow-sm"
            >
              {/* ICON */}
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white font-bitter text-sm font-bold text-blue-700 shadow-sm ring-1 ring-blue-100 transition-transform duration-300 group-hover:scale-105">
                ✓
              </span>

              {/* TEXT */}
              <p className="self-center font-bitter text-sm font-medium leading-6 text-neutral-700 sm:text-[15px]">
                {text}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default TourHighlights;
