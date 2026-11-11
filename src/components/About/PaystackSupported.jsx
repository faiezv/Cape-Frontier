import React from "react";

// Same accepted methods as the footer (Visa, Mastercard, Apple Pay, Google Pay, QR).
const badgeBase =
  "flex h-7 items-center justify-center gap-1 rounded-md border border-black/10 bg-white px-2 sm:h-8 sm:px-2.5";

const PAYMENT_METHODS = [
  {
    label: "Visa",
    node: (
      <span className="text-[12px] font-extrabold italic tracking-tight text-[#1A1F71]">
        VISA
      </span>
    ),
  },
  {
    label: "Mastercard",
    node: (
      <svg viewBox="0 0 32 20" aria-hidden="true" className="h-4 w-auto">
        <circle cx="11" cy="10" r="9" fill="#EB001B" />
        <circle cx="21" cy="10" r="9" fill="#F79E1B" />
        <path d="M16 2.52A9 9 0 0 1 16 17.48A9 9 0 0 1 16 2.52z" fill="#FF5F00" />
      </svg>
    ),
  },
  {
    label: "Apple Pay",
    node: (
      <>
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="h-4 w-4 shrink-0 text-black"
          fill="currentColor"
        >
          <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
        </svg>
        <span className="text-[13px] font-semibold leading-none tracking-tight text-black">
          Pay
        </span>
      </>
    ),
  },
  {
    label: "Google Pay",
    node: (
      <>
        <span className="text-[13px] font-bold leading-none">
          <span className="text-[#4285F4]">G</span>
          <span className="text-[#EA4335]">o</span>
          <span className="text-[#FBBC05]">o</span>
          <span className="text-[#4285F4]">g</span>
          <span className="text-[#34A853]">l</span>
          <span className="text-[#EA4335]">e</span>
        </span>
        <span className="text-[12px] font-semibold text-neutral-600">Pay</span>
      </>
    ),
  },
  {
    label: "QR",
    node: (
      <>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="h-4 w-4 shrink-0 text-neutral-700"
        >
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <path d="M14 14h3v3h-3zM20 14v.01M14 20h.01M17 20h4v-3" />
        </svg>
        <span className="text-[11px] font-bold text-neutral-700">QR</span>
      </>
    ),
  },
];

function PaystackSupported() {
  return (
    <div className="relative z-20 w-full ">
      <div
        className="
          paystack-sponsored-pill
          mx-auto flex max-w-5xl flex-col items-start gap-3
          rounded-3xl border border-black/8
          bg-white/90 px-4 py-3
          font-mont text-black
          shadow-[0_16px_40px_rgba(15,23,42,0.08)]
          backdrop-blur-md
          sm:flex-row sm:items-center sm:justify-between sm:gap-6
          sm:rounded-full sm:px-6 sm:py-3
        "
      >
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-200 text-green-950 ring-1 ring-green-300/70">
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="3" y="11" width="18" height="10" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </span>

          <div className="min-w-0">
            <p className="truncate font-bitter text-[10px] font-black uppercase tracking-[0.18em] text-black/45 sm:text-[11px]">
              Secure checkout
            </p>
            <p className="truncate font-frank text-sm font-bold leading-tight text-black/75 sm:text-base">
              Online payments powered by{" "}
              <span className="text-blue-700">Paystack</span>
            </p>
          </div>
        </div>

        <ul
          aria-label="Accepted payment methods"
          className="flex shrink-0 flex-wrap items-center gap-1.5 sm:gap-2"
        >
          {PAYMENT_METHODS.map(({ label, node }) => (
            <li key={label} aria-label={label} className={badgeBase}>
              {node}
            </li>
          ))}
        </ul>
      </div>

      <style>{`
        @keyframes paystackSponsoredPillReveal {
          from { opacity: 0; transform: translateY(8px) scale(0.985); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .paystack-sponsored-pill {
          animation: paystackSponsoredPillReveal 0.45s ease-out both;
        }
        @media (prefers-reduced-motion: reduce) {
          .paystack-sponsored-pill { animation: none; }
        }
      `}</style>
    </div>
  );
}

export default PaystackSupported;