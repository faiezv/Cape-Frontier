import React from "react";

const TourQuickInfo = ({
  tour,
  formatMoney,
  formatCompactMoney,
  getShortLocation,
  PriceIcon,
  MapPinIcon,
  DurationIcon,
  RatingIcon,
}) => {
  if (!tour) return null;

  const items = [
    {
      label: "From",
      value: `${formatMoney(tour.priceBase)} pp`,
      mobileValue: `${formatCompactMoney(tour.priceBase)} pp`,
      icon: <PriceIcon />,
      accent: "price",
    },
    {
      label: "Location",
      value: tour.location,
      mobileValue: getShortLocation(tour.location),
      icon: <MapPinIcon />,
      accent: "default",
    },
    {
      label: "Duration",
      value: tour.duration,
      mobileValue: tour.duration,
      icon: <DurationIcon />,
      accent: "default",
    },
    {
      label: "Rating",
      value: `${tour.rating} / 5`,
      mobileValue: `${tour.rating}`,
      icon: <RatingIcon />,
      accent: "rating",
    },
  ];

  return (
    <section className="relative z-20 mx-auto -mt-8 max-w-6xl px-4 lg:-mt-11 lg:px-5">
      <div className="overflow-hidden rounded-[1.5rem] border border-blue-100 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.12)]">
        <div className="grid grid-cols-2 sm:grid-cols-4">
          {items.map((item, index) => (
            <QuickInfoItem
              key={item.label}
              {...item}
              isLast={index === items.length - 1}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

function QuickInfoItem({
  label,
  value,
  mobileValue,
  icon,
  accent,
  isLast,
}) {
  const isPrice = accent === "price";
  const isRating = accent === "rating";

  return (
    <div
      className={`
        group relative flex min-w-0 items-center gap-3
        px-4 py-4
        transition-colors duration-300
        hover:bg-blue-50/50
        sm:px-5 sm:py-5
        lg:px-6 lg:py-6
        ${!isLast ? "sm:border-r sm:border-blue-100" : ""}
        ${label === "From" ? "border-b border-blue-100 sm:border-b-0" : ""}
        ${label === "Location" ? "border-b border-blue-100 sm:border-b-0" : ""}
      `}
    >
      {/* ICON */}
      <div
        className={`
          relative flex h-10 w-10 shrink-0 items-center justify-center
          rounded-full
          transition-all duration-300
          group-hover:scale-105
          sm:h-11 sm:w-11
          ${
            isPrice
              ? "bg-blue-600 text-white shadow-[0_6px_18px_rgba(37,99,235,0.25)]"
              : isRating
                ? "bg-amber-50 text-amber-600 ring-1 ring-amber-100"
                : "bg-blue-50 text-blue-700 ring-1 ring-blue-100"
          }
        `}
      >
        {icon}
      </div>

      {/* TEXT */}
      <div className="min-w-0">
        <span className="block font-bitter text-[9px] font-bold uppercase tracking-[0.15em] text-blue-400 sm:text-[10px]">
          {label}
        </span>

        <p
          className={`
            mt-1 truncate font-bitter leading-tight
            ${
              isPrice
                ? "text-base font-bold text-blue-700 sm:text-lg"
                : isRating
                  ? "text-base font-bold text-neutral-950 sm:text-lg"
                  : "text-sm font-bold text-neutral-950 sm:text-base"
            }
          `}
        >
          <span className="lg:hidden">
            {mobileValue || value}
          </span>

          <span className="hidden lg:inline">
            {value}
          </span>
        </p>
      </div>

      {/* SUBTLE HOVER ACCENT */}
      <span className="absolute bottom-0 left-5 right-5 h-px origin-left scale-x-0 bg-blue-500 transition-transform duration-300 group-hover:scale-x-100" />
    </div>
  );
}

export default TourQuickInfo;
