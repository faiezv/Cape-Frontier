
const SecurityAndLiability = ({ security }) => {
  if (!security) return null;

  const {
    heading,
    cardPreAuthorisation,
    cashDeposit,
  } = security;

  return (
    <section className="w-full">
      {/* HEADER */}
      <div className="mb-6">
        <span className="mb-1 block font-bitter text-xs font-bold uppercase tracking-[0.12em] text-blue-600">
          Security
        </span>

        <h2 className="font-bitter text-2xl font-bold text-neutral-950 md:text-3xl">
          Security & Liability
        </h2>
      </div>

      {/* MAIN CARD */}
      <div className="overflow-hidden rounded-[1.5rem] border border-blue-100 bg-blue-50/60">
        {/* HEADING */}
        {heading && (
          <div className="border-b border-blue-100 px-5 py-5 sm:px-6">
            <h3 className="font-bitter text-base font-bold text-neutral-950 sm:text-lg">
              {heading}
            </h3>
          </div>
        )}

        {/* CARD PRE-AUTHORISATION */}
        {cardPreAuthorisation && (
          <div className="border-b border-blue-100 px-5 py-5 sm:px-6">
            <div className="rounded-[1.15rem] border border-blue-100 bg-white p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="font-bitter text-xs font-bold uppercase tracking-[0.1em] text-blue-600">
                    Card Pre-Authorisation
                  </p>

                  {cardPreAuthorisation.description && (
                    <p className="mt-2 font-bitter text-sm leading-6 text-neutral-600">
                      {cardPreAuthorisation.description}
                    </p>
                  )}
                </div>

                {cardPreAuthorisation.amount && (
                  <div className="shrink-0 rounded-full bg-blue-50 px-4 py-2 font-bitter text-sm font-bold text-blue-700 ring-1 ring-blue-100">
                    {cardPreAuthorisation.currency ===
                    "ZAR"
                      ? "R"
                      : cardPreAuthorisation.currency}{" "}
                    {Number(
                      cardPreAuthorisation.amount
                    ).toLocaleString()}
                  </div>
                )}
              </div>

              {cardPreAuthorisation.release && (
                <div className="mt-4 flex gap-3 rounded-xl bg-blue-50/70 px-4 py-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white font-bitter text-xs font-bold text-blue-700 shadow-sm">
                    ✓
                  </span>

                  <p className="font-bitter text-xs leading-5 text-neutral-600 sm:text-sm">
                    {cardPreAuthorisation.release}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* CASH DEPOSIT */}
        {cashDeposit && (
          <div className="px-5 py-5 sm:px-6">
            <div className="rounded-[1.15rem] border border-blue-100 bg-white p-5">
              <p className="font-bitter text-xs font-bold uppercase tracking-[0.1em] text-blue-600">
                Cash Deposit
              </p>

              {/* AMOUNT */}
              <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                {cashDeposit.amountZAR && (
                  <span className="font-bitter text-xl font-bold text-neutral-950">
                    R
                    {Number(
                      cashDeposit.amountZAR
                    ).toLocaleString()}
                  </span>
                )}

                {cashDeposit.alternativeAmountUSD && (
                  <span className="font-bitter text-sm font-bold text-blue-600">
                    or $
                    {Number(
                      cashDeposit.alternativeAmountUSD
                    ).toLocaleString()}
                  </span>
                )}
              </div>

              {/* DETAILS */}
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {cashDeposit.paymentMethod && (
                  <div className="rounded-xl bg-blue-50/70 p-3">
                    <p className="font-bitter text-[10px] font-bold uppercase tracking-[0.1em] text-blue-600">
                      Payment Method
                    </p>

                    <p className="mt-1 font-bitter text-sm font-bold text-neutral-800">
                      {cashDeposit.paymentMethod}
                    </p>
                  </div>
                )}

                {cashDeposit.paidAt && (
                  <div className="rounded-xl bg-blue-50/70 p-3">
                    <p className="font-bitter text-[10px] font-bold uppercase tracking-[0.1em] text-blue-600">
                      Paid At
                    </p>

                    <p className="mt-1 font-bitter text-sm font-bold text-neutral-800">
                      {cashDeposit.paidAt}
                    </p>
                  </div>
                )}
              </div>

              {/* REFUND POLICY */}
              {cashDeposit.refundPolicy && (
                <div className="mt-4 border-t border-blue-100 pt-4">
                  <p className="font-bitter text-sm leading-6 text-neutral-600">
                    {cashDeposit.refundPolicy}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default SecurityAndLiability;
