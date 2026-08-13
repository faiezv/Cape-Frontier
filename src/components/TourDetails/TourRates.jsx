const TourRates = ({ rates }) => {
  if (!rates) return null;

  const formatPrice = (price, currency = "ZAR") => {
    if (price === undefined || price === null) {
      return null;
    }

    const symbol =
      currency === "ZAR"
        ? "R"
        : currency === "USD"
          ? "$"
          : currency === "GBP"
            ? "£"
            : currency === "EUR"
              ? "€"
              : "";

    return `${symbol}${Number(price).toLocaleString(
      "en-ZA",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`;
  };

  const rateEntries = Object.entries(rates);

  return (
    <section className="tour-rates">
      <div className="tour-rates__header">
        <span className="tour-rates__eyebrow">
          Pricing
        </span>

        <h2 className="tour-rates__title">
          Rates
        </h2>
      </div>

      <div className="tour-rates__list">
        {rateEntries.map(([key, rate]) => {
          if (!rate || typeof rate !== "object") {
            return null;
          }

          const label = key
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, (char) =>
              char.toUpperCase()
            );

          return (
            <article
              key={key}
              className="tour-rates__item"
            >
              <div className="tour-rates__content">
                <h3 className="tour-rates__label">
                  {label}
                </h3>

                {rate.duration && (
                  <span className="tour-rates__duration">
                    {rate.duration}
                  </span>
                )}

                {rate.policy && (
                  <p className="tour-rates__policy">
                    {rate.policy}
                  </p>
                )}
              </div>

              <div className="tour-rates__price">
                {rate.price !== undefined && (
                  <strong>
                    {formatPrice(
                      rate.price,
                      rate.currency
                    )}
                  </strong>
                )}

                {rate.pricePerKm !== undefined && (
                  <strong>
                    {formatPrice(
                      rate.pricePerKm,
                      rate.currency
                    )}
                  </strong>
                )}

                {rate.pricePerPerson !== undefined && (
                  <strong>
                    {formatPrice(
                      rate.pricePerPerson,
                      rate.currency
                    )}
                  </strong>
                )}

                {rate.unit && (
                  <span className="tour-rates__unit">
                    {rate.unit}
                  </span>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default TourRates;