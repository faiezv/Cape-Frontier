const TourRequirements = ({ requirements }) => {
  if (!requirements?.length) return null;

  return (
    <section className="w-full">
      {/* HEADER */}
      <div className="mb-6">
        <span className="mb-1 block font-bitter text-xs font-bold uppercase tracking-[0.12em] text-blue-600">
          Before You Book
        </span>

        <h2 className="font-bitter text-2xl font-bold text-neutral-950 md:text-3xl">
          Requirements
        </h2>
      </div>

      {/* REQUIREMENTS */}
      <div className="rounded-[1.5rem] border border-blue-100 bg-blue-50/60 p-3 sm:p-4">
        <div className="space-y-3">
          {requirements.map((item, index) => {
            const text =
              typeof item === "string"
                ? item
                : item.text;

            return (
              <div
                key={`${text}-${index}`}
                className="flex gap-4 rounded-[1.15rem] border border-blue-100 bg-white px-4 py-4 transition duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-sm"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 font-bitter text-sm font-bold text-blue-700">
                  {index + 1}
                </span>

                <p className="font-bitter text-sm leading-6 text-neutral-700 sm:text-[15px]">
                  {text}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TourRequirements;
