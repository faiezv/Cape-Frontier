import React from "react";
import cobraImage from "../../assets/images/content/vehicles/cobra.webp";

const VehicleDetails = ({ vehicle }) => {
  if (!vehicle) return null;

  const details = [
    ["Class", vehicle.class],
    ["Doors", vehicle.doors],
    ["Seats", vehicle.seats],
    ["Fuel", vehicle.fuel],
    ["Gearbox", vehicle.gearbox],
    ["Engine", vehicle.engine],
  ].filter(([, value]) => value);

  return (
    <section className="w-full">
      {/* HEADER */}
      <div className="mb-6">
        <span className="mb-1 block font-bitter text-xs font-bold uppercase tracking-[0.12em] text-blue-600">
          Vehicle
        </span>

        <h2 className="font-bitter text-2xl font-bold text-neutral-950 md:text-3xl">
          Vehicle Details
        </h2>
      </div>

      {/* MAIN CARD */}
      <div className="overflow-hidden rounded-[1.5rem] border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-blue-50/60">
        <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr]">

          {/* IMAGE */}
          <div className="relative min-h-[240px] overflow-hidden bg-blue-50 sm:min-h-[320px] lg:min-h-full">
            <img
              src={cobraImage}
              alt="Backdraft Racing Cobra"
              className="
                scale-75
                min-h
                w-full
                object-contain
                transition-transform
                duration-700
                hover:scale-[1]
                lg:absolute
                lg
              "
            />

            {/* IMAGE OVERLAY */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

            {/* VEHICLE LABEL */}
            {/* <div className="absolute bottom-4 left-4">
              <span className="inline-flex rounded-full border border-white/30 bg-white/90 px-3 py-1.5 font-bitter text-xs font-bold text-neutral-900 shadow-sm backdrop-blur">
                Modern Classic
              </span>
            </div> */}
          </div>

          {/* DETAILS */}
          <div className="p-4 sm:p-5 lg:p-6">

            {/* DETAILS GRID */}
            {details.length > 0 && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {details.map(([label, value]) => (
                  <div
                    key={label}
                    className="
                      rounded-[1.15rem]
                      border
                      border-blue-100
                      bg-white
                      px-4
                      py-4
                      transition-all
                      duration-300
                      hover:-translate-y-0.5
                      hover:border-blue-200
                      hover:shadow-[0_10px_25px_rgba(37,99,235,0.08)]
                    "
                  >
                    <p className="font-bitter text-[10px] font-bold uppercase tracking-[0.1em] text-blue-600 sm:text-[11px]">
                      {label}
                    </p>

                    <p className="mt-1.5 font-bitter text-sm font-bold text-neutral-950">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* FEATURES */}
            {vehicle.features?.length > 0 && (
              <div className="mt-3 rounded-[1.15rem] border border-blue-100 bg-white px-4 py-4">
                <p className="font-bitter text-[10px] font-bold uppercase tracking-[0.1em] text-blue-600 sm:text-[11px]">
                  Features
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {vehicle.features.map((feature, index) => (
                    <span
                      key={`${feature}-${index}`}
                      className="
                        rounded-full
                        border
                        border-blue-100
                        bg-blue-50
                        px-3
                        py-1.5
                        font-bitter
                        text-xs
                        font-bold
                        text-blue-700
                        transition-colors
                        duration-200
                        hover:border-blue-200
                        hover:bg-blue-100
                      "
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </section>
  );
};

export default VehicleDetails;