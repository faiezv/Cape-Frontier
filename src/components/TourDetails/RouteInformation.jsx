import mapsBanner from "../../assets/images/content/random/maps-banner.webp";

const RouteInformation = ({ route }) => {
  if (!route) return null;

  return (
    <section className="w-full">
      {/* HEADER */}
      <div className="mb-6">
        <span className="mb-1 block font-bitter text-xs font-bold uppercase tracking-[0.12em] text-blue-600">
          Route
        </span>

        <h2 className="font-bitter text-2xl font-bold text-neutral-950 md:text-3xl">
          Route Information
        </h2>
      </div>

      {/* MAIN CARD */}
      <div className="overflow-hidden rounded-[1.5rem] border border-blue-100 bg-blue-50/60">
        {/* ROUTE DESCRIPTION */}
        {(route.title || route.description) && (
          <div className="border-b border-blue-100 px-5 py-5 sm:px-6">
            {route.title && (
              <h3 className="font-bitter text-base font-bold text-neutral-950 sm:text-lg">
                {route.title}
              </h3>
            )}

            {route.description && (
              <p className="mt-2 max-w-3xl font-bitter text-sm leading-7 text-neutral-600 sm:text-[15px]">
                {route.description}
              </p>
            )}
          </div>
        )}

        {/* ROUTE DETAILS */}
        {route.items?.length > 0 && (
          <div 
            className="space-y-3 p-4 sm:p-5"
           
            style={{
              backgroundImage: `url(${mapsBanner})`,
              backgroundSize: "400px auto",
              backgroundPosition: "center",
            }}

          >
            {route.items.map((item, index) => {
              const text =
                typeof item === "string"
                  ? item
                  : item.text;

              return (
                <div
                  key={`${text}-${index}`}
                  className="relative flex gap-4 overflow-hidden rounded-[1.15rem] border border-blue-100 bg-cover bg-center px-4 py-4 transition hover:border-blue-200 hover:shadow-sm"
                >
                  {/* SUBTLE MAP OVERLAY */}
                  <div className="absolute inset-0 bg-white/85" />

                  {/* NUMBER */}
                  <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 font-bitter text-sm font-bold text-blue-700">
                    {index + 1}
                  </span>

                  {/* ROUTE TEXT */}
                  <p className="relative font-bitter text-sm leading-6 text-neutral-700 sm:text-[15px]">
                    {text}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* EXCLUDED ROUTE */}
        {route.excluded && (
          <div className="border-t border-blue-100 px-5 py-5 sm:px-6">
            <div className="rounded-[1.15rem] border border-blue-100 bg-white p-4">
              <p className="font-bitter text-xs font-bold uppercase tracking-[0.1em] text-blue-600">
                Route Restriction
              </p>

              <p className="mt-2 font-bitter text-sm leading-6 text-neutral-700">
                {route.excluded}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default RouteInformation;