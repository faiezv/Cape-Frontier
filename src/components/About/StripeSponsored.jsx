import React from 'react'

function StripeSponsored() {
  return (
    <div className="relative z-20 w-full px-4 mb-8 sm:px-6">
      <div
        className="
          paystack-sponsored-pill
          mx-auto flex max-w-5xl items-center justify-between gap-3
          rounded-full border border-black/8
          bg-white/90 px-4 py-2.5
          font-mont text-black
          shadow-[0_16px_40px_rgba(15,23,42,0.08)]
          backdrop-blur-md
          sm:px-6 sm:py-3
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
              Online payments powered by <span className="text-blue-700">Paystack</span>
            </p>
          </div>
        </div>

        <div className="hidden shrink-0 items-center gap-2 md:flex">
          <span className="rounded-full bg-blue-50 px-3 py-1.5 font-bitter text-[10px] font-black uppercase tracking-[0.12em] text-blue-800 ring-1 ring-blue-100">
            Card payments
          </span>

          <span className="rounded-full bg-green-50 px-3 py-1.5 font-bitter text-[10px] font-black uppercase tracking-[0.12em] text-green-800 ring-1 ring-green-100">
            Local support
          </span>

          <span className="rounded-full bg-black/[0.04] px-3 py-1.5 font-bitter text-[10px] font-black uppercase tracking-[0.12em] text-black/55 ring-1 ring-black/[0.04]">
            Encrypted
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-2 md:hidden">
          <span className="rounded-full bg-blue-50 px-2.5 py-1 font-bitter text-[9px] font-black uppercase tracking-[0.12em] text-blue-800 ring-1 ring-blue-100">
            Paystack
          </span>
        </div>
      </div>

      <style>{`
        @keyframes paystackSponsoredPillReveal {
          from {
            opacity: 0;
            transform: translateY(8px) scale(0.985);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .paystack-sponsored-pill {
          animation: paystackSponsoredPillReveal 0.45s ease-out both;
        }
      `}</style>
    </div>
  )
}

export default StripeSponsored