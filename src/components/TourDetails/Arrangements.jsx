const TourArrangements = ({ arrangements }) => {
  if (!arrangements) return null;

  const {
    availability,
    duration,
    operatingTime,
    departure,
    return: returnTime,
    location,
    clothing,
    thingsToBring,
    passengerPolicy,
    sunsetNote,
  } = arrangements;

  return (
    <section className="w-full">
      {/* HEADER */}
      <div className="mb-6">
        <span className="mb-1 block font-bitter text-xs font-bold uppercase tracking-[0.12em] text-blue-600">
          Planning Your Visit
        </span>

        <h2 className="font-bitter text-2xl font-bold text-neutral-950 md:text-3xl">
          Arrangements
        </h2>
      </div>

      <div className="rounded-[1.5rem] border border-blue-100 bg-blue-50/60 p-3 sm:p-4">
        {/* BASIC DETAILS */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {availability && (
            <DetailCard
              label="Availability"
              value={availability}
            />
          )}

          {duration && (
            <DetailCard
              label="Duration"
              value={duration}
            />
          )}

          {operatingTime && (
            <DetailCard
              label="Operating Time"
              value={operatingTime}
            />
          )}

          {departure && (
            <DetailCard
              label="Departure"
              value={departure}
            />
          )}

          {returnTime && (
            <DetailCard
              label="Return"
              value={returnTime}
            />
          )}

          {location && (
            <DetailCard
              label="Location"
              value={location}
            />
          )}
        </div>

        {/* CLOTHING + THINGS TO BRING */}
        {(clothing?.length > 0 ||
          thingsToBring?.length > 0) && (
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {clothing?.length > 0 && (
              <ListCard
                label="What to Wear"
                items={clothing}
              />
            )}

            {thingsToBring?.length > 0 && (
              <ListCard
                label="Things to Bring"
                items={thingsToBring}
              />
            )}
          </div>
        )}

        {/* PASSENGER POLICY */}
        {passengerPolicy && (
          <div className="mt-3 rounded-[1.15rem] border border-blue-100 bg-white p-4">
            <p className="font-bitter text-[11px] font-bold uppercase tracking-[0.1em] text-blue-600">
              Passenger Policy
            </p>

            <div className="mt-2 flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50 font-bitter text-sm font-bold text-blue-700">
                ✓
              </span>

              <p className="font-bitter text-sm leading-6 text-neutral-700 sm:text-[15px]">
                {passengerPolicy}
              </p>
            </div>
          </div>
        )}

        {/* SUNSET NOTE */}
        {sunsetNote && (
          <div className="mt-3 rounded-[1.15rem] border border-blue-100 bg-white p-4">
            <p className="font-bitter text-[11px] font-bold uppercase tracking-[0.1em] text-blue-600">
              Please Note
            </p>

            <p className="mt-1.5 font-bitter text-sm leading-6 text-neutral-600 sm:text-[15px]">
              {sunsetNote}
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

/* --------------------------------
   DETAIL CARD
--------------------------------- */

const DetailCard = ({ label, value }) => {
  return (
    <div className="rounded-[1.15rem] border border-blue-100 bg-white p-4 transition duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-sm">
      <p className="font-bitter text-[11px] font-bold uppercase tracking-[0.1em] text-blue-600">
        {label}
      </p>

      <p className="mt-1.5 font-bitter text-sm font-bold leading-6 text-neutral-950 sm:text-[15px]">
        {value}
      </p>
    </div>
  );
};

/* --------------------------------
   LIST CARD
--------------------------------- */

const ListCard = ({ label, items }) => {
  return (
    <div className="rounded-[1.15rem] border border-blue-100 bg-white p-4">
      <p className="font-bitter text-[11px] font-bold uppercase tracking-[0.1em] text-blue-600">
        {label}
      </p>

      <ul className="mt-3 space-y-2.5">
        {items.map((item, index) => (
          <li
            key={`${item}-${index}`}
            className="flex gap-3"
          >
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-50 font-bitter text-xs font-bold text-blue-700">
              ✓
            </span>

            <span className="font-bitter text-sm leading-6 text-neutral-700">
              {item}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TourArrangements;
