import React from "react";

function StripeSponsored() {
  return (
    <div className="relative z-20 w-full px-4 sm:px-6">
      <div
        className="
          stripe-sponsored-separator
          mx-auto flex max-w-5xl items-center gap-4
          rounded-t-[2.25rem] border-t border-black/10
          bg-white/80 px-6 py-3
          sm:px-10 md:px-14
          font-mont
        "
      >
        {/* left line */}
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-black/10 to-black/10" />

        {/* center content */}
        <div className="flex shrink-0 items-center gap-3 text-black/30">
          <svg
            className="h-4 w-4 text-black/25"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="11" width="18" height="10" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>

          <span className="hidden text-[10px] font-bold uppercase tracking-[0.22em] sm:inline">
            Secure payments powered by
          </span>

          <span className="text-[10px] font-bold uppercase tracking-[0.2em] sm:hidden">
            Secure checkout
          </span>

          <div className="flex items-center opacity-55">
            <img
              src="/icons/stripeLogo.png"
              alt="Stripe logo"
              className="h-5 object-contain"
            />
            <img
              src="/icons/stripe.png"
              alt="Stripe"
              className="-ml-1 h-8 object-contain"
            />
          </div>
        </div>

        {/* right line */}
        <div className="h-px flex-1 bg-gradient-to-r from-black/10 via-black/10 to-transparent" />
      </div>

      <style>{`
        @keyframes stripeSeparatorReveal {
          from {
            opacity: 0;
            transform: translateY(6px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .stripe-sponsored-separator {
          animation: stripeSeparatorReveal 0.5s ease-out both;
        }
      `}</style>
    </div>
  );
}

export default StripeSponsored;