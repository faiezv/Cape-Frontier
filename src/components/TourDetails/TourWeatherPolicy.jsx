import skyBanner from "../../assets/images/content/random/sky-banner.webp";
import weatherIcon from "../../assets/icons/weather.png";

const TourWeatherPolicy = ({ weather }) => {
  if (!weather) return null;

  return (
    <section className="w-full">
      {/* HEADER */}
      <div className="flex items-center gap-4 py-4">
        <img src={weatherIcon} alt="weather-icon" className="h-16"/>
        <div className="">
          <span className="mb-1 block font-bitter text-xs font-bold uppercase tracking-[0.12em] text-blue-600">
            Weather Policy
          </span>

          <h2 className="font-bitter text-2xl font-bold text-neutral-950 md:text-3xl">
            Weather
          </h2>
        </div>

      </div>

      {/* POLICY CARD */}
      <div className="overflow-hidden rounded-[1.5rem] border border-blue-100 bg-blue-50/60">
        {/* SUMMARY */}
        {weather.summary && (
          <div
            className="relative overflow-hidden bg-cover bg-center"
            style={{
              backgroundImage: `url(${skyBanner})`,
            }}
          >
            {/* DARK OVERLAY */}
            <div className="absolute inset-0 bg-neutral-950/55" />

            {/* CONTENT */}
            <div className="relative px-5 py-8 sm:px-6 sm:py-10">
              <p className="max-w-3xl font-bitter text-base font-bold leading-7 text-white sm:text-lg sm:leading-8">
                {weather.summary}
              </p>
            </div>
          </div>
        )}

        {/* ITEMS */}
        {weather.items?.length > 0 && (
          <div className="border-t border-blue-100 px-5 py-4 sm:px-6">
            <ul className="space-y-3">
              {weather.items.map((item, index) => {
                const text =
                  typeof item === "string"
                    ? item
                    : item.text;

                return (
                  <li
                    key={`${text}-${index}`}
                    className="flex gap-3"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white font-bitter text-xs font-bold text-blue-700 shadow-sm ring-1 ring-blue-100">
                      ✓
                    </span>

                    <span className="self-center font-bitter text-sm leading-6 text-neutral-700">
                      {text}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* SAFETY NOTICE */}
        <div className="border-t border-blue-100 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3 rounded-[1.15rem] border border-emerald-200 bg-emerald-50 px-4 py-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white font-bitter text-sm font-bold text-emerald-700 shadow-sm">
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

export default TourWeatherPolicy;