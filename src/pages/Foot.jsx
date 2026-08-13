import React from "react";

const Foot = () => {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    if (window.lenis) {
      window.lenis.scrollTo(0, {
        duration: 1.4,
        easing: (t) =>
          Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      });
    } else {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  const tourLinks = [
    {
      title: "Half Day Tours",
      description:
        "Short escapes around Cape Town and the Peninsula.",
      href: "/tours?duration=half-day",
    },
    {
      title: "Full Day Tours",
      description:
        "Make a full day of the Cape and discover more.",
      href: "/tours?duration=full-day",
    },
    {
      title: "Packages",
      description:
        "Extended experiences, stays and multi-day adventures.",
      href: "/tours?category=packages",
    },
  ];

  const contactLinks = [
    {
      label: "WhatsApp",
      href: "https://wa.me/",
      icon: "/icons/landing/whatsapp.png",
    },
    {
      label: "Email",
      href: "mailto:info@cape-frontier.co.za",
      icon: "/icons/landing/gmail.png",
    },
    {
      label: "Instagram",
      href: "https://instagram.com/",
      icon: "/icons/landing/instagram.png",
    },
  ];

  return (
    <footer className="relative isolate overflow-hidden bg-black text-white">
      {/* ============================================================
          BACKGROUND
      ============================================================ */}

      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-[-10%] top-[8%] h-[28rem] w-[28rem] rounded-full bg-green-400/[0.07] blur-[120px]" />

        <div className="absolute bottom-[-15%] right-[-5%] h-[30rem] w-[30rem] rounded-full bg-purple-500/[0.07] blur-[130px]" />

        <div className="absolute inset-x-0 bottom-0 h-[30rem] bg-gradient-to-t from-green-400/[0.055] via-transparent to-transparent" />

        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      {/* ============================================================
          CONTENT
      ============================================================ */}

      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        {/* ==========================================================
            MAIN AREA
        ========================================================== */}

        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
          {/* ========================================================
              LEFT — CTA
          ======================================================== */}

          <div className="flex flex-col justify-between">
            <div>
              <p className="mb-3 font-bitter text-[10px] font-black uppercase tracking-[0.24em] text-green-200">
                Cape Frontier
              </p>

              <h2 className="max-w-3xl font-frank text-[clamp(3.2rem,8vw,7rem)] font-bold leading-[0.82] tracking-[-0.045em] text-white">
                Have a
                <br />
                question?
              </h2>

              <p className="mt-6 max-w-xl font-bitter text-sm leading-7 text-white/45 sm:text-base">
                Have a question about a tour, booking or
                Cape Peninsula experience? Reach out to us
                anytime — we’re here to help you plan your
                trip.
              </p>

              {/* CTA buttons */}
              <div className="mt-7 flex flex-col gap-2.5 sm:flex-row sm:items-center">
                <a
                  href="/contact"
                  className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-green-400 px-7 py-3.5 font-bitter text-[10px] font-black uppercase tracking-[0.15em] text-white shadow-[0_12px_35px_rgba(74,222,128,0.1)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(74,222,128,0.18)] sm:w-auto"
                >
                  Contact Us
                </a>

                <a
                  href="/tours"
                  className="inline-flex w-full items-center justify-center rounded-full border border-white/10 bg-white/[0.025] px-7 py-3.5 font-bitter text-[10px] font-black uppercase tracking-[0.15em] text-white/65 transition duration-300 hover:border-white/20 hover:bg-white/[0.06] hover:text-white sm:w-auto"
                >
                  Explore Tours
                </a>
              </div>
            </div>

            {/* ======================================================
                CONTACT / SOCIALS
            ====================================================== */}

            <div className="mt-10 sm:mt-14">
              <p className="mb-3 font-bitter text-[9px] font-black uppercase tracking-[0.18em] text-white/25">
                Get in touch
              </p>

              <div className="flex flex-wrap gap-2">
                {contactLinks.map((contact) => (
                  <a
                    key={contact.label}
                    href={contact.href}
                    target={
                      contact.href.startsWith("http")
                        ? "_blank"
                        : undefined
                    }
                    rel={
                      contact.href.startsWith("http")
                        ? "noreferrer"
                        : undefined
                    }
                    aria-label={contact.label}
                    className="group flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.035] px-2.5 py-2 transition duration-300 hover:border-white/20 hover:bg-white/[0.08]"
                  >
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-white/[0.06]">
                      <img
                        src={contact.icon}
                        alt=""
                        className="h-4 w-4 object-contain transition duration-300 group-hover:scale-110"
                      />
                    </span>

                    <span className="pr-1 font-bitter text-[9px] font-bold uppercase tracking-[0.1em] text-white/40 transition group-hover:text-white/80">
                      {contact.label}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* ========================================================
              RIGHT — BRAND
          ======================================================== */}

          <div className="flex flex-col">
            <div className="rounded-[2rem] border border-white/[0.08] bg-white/[0.035] p-5 backdrop-blur-md sm:p-7">
              <img
                src="/assets/logoSlogan.png"
                className="h-auto w-full max-w-[22rem] object-contain"
                alt="Cape Frontier"
              />

              <div className="mt-6 border-t border-white/[0.07] pt-5">
                <p className="max-w-md font-bitter text-xs leading-6 text-white/40">
                  Discover Cape Town, the Cape Peninsula
                  and beyond through experiences designed
                  around the places worth remembering.
                </p>
              </div>
            </div>

            {/* ======================================================
                QUICK NAVIGATION
            ====================================================== */}

            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2">
              <a
                href="/"
                className="rounded-xl border border-white/[0.06] bg-white/[0.025] px-4 py-3 font-bitter text-[9px] font-black uppercase tracking-[0.14em] text-white/40 transition duration-300 hover:border-white/15 hover:bg-white/[0.06] hover:text-white"
              >
                Home
              </a>

              <a
                href="/tours"
                className="rounded-xl border border-white/[0.06] bg-white/[0.025] px-4 py-3 font-bitter text-[9px] font-black uppercase tracking-[0.14em] text-white/40 transition duration-300 hover:border-white/15 hover:bg-white/[0.06] hover:text-white"
              >
                Tours
              </a>

              <a
                href="/about"
                className="rounded-xl border border-white/[0.06] bg-white/[0.025] px-4 py-3 font-bitter text-[9px] font-black uppercase tracking-[0.14em] text-white/40 transition duration-300 hover:border-white/15 hover:bg-white/[0.06] hover:text-white"
              >
                About
              </a>

              <a
                href="/contact"
                className="rounded-xl border border-white/[0.06] bg-white/[0.025] px-4 py-3 font-bitter text-[9px] font-black uppercase tracking-[0.14em] text-white/40 transition duration-300 hover:border-white/15 hover:bg-white/[0.06] hover:text-white"
              >
                Contact
              </a>
            </div>
          </div>
        </div>

        {/* ==========================================================
            TOUR CATEGORIES
        ========================================================== */}

        <section className="mt-12 sm:mt-16">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="font-bitter text-[9px] font-black uppercase tracking-[0.2em] text-green-200/65">
                Start exploring
              </p>

              <h3 className="mt-1 font-frank text-2xl font-bold leading-none text-white sm:text-3xl">
                Find your experience
              </h3>
            </div>

            <a
              href="/tours"
              className="hidden font-bitter text-[9px] font-black uppercase tracking-[0.14em] text-white/30 transition hover:text-white sm:block"
            >
              View all tours →
            </a>
          </div>

          <div className="grid gap-2.5 sm:grid-cols-3">
            {tourLinks.map((tour, index) => (
              <a
                key={tour.title}
                href={tour.href}
                className="group relative overflow-hidden rounded-[1.5rem] border border-white/[0.07] bg-white/[0.035] p-5 transition duration-300 hover:-translate-y-1 hover:border-white/15 hover:bg-white/[0.06] sm:p-6"
              >
                {/* Large background number */}
                <span className="pointer-events-none absolute right-4 top-2 font-frank text-6xl font-bold leading-none text-white/[0.035] transition duration-300 group-hover:text-white/[0.065]">
                  0{index + 1}
                </span>

                <div className="relative">
                  <div className="mb-8 grid h-8 w-8 place-items-center rounded-full border border-green-200/20 bg-green-200/[0.07]">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-200" />
                  </div>

                  <h4 className="font-frank text-xl font-bold leading-none text-white sm:text-2xl">
                    {tour.title}
                  </h4>

                  <p className="mt-2 max-w-xs font-bitter text-[10px] leading-relaxed text-white/35 sm:text-xs">
                    {tour.description}
                  </p>

                  <span className="mt-5 inline-block font-bitter text-[8px] font-black uppercase tracking-[0.15em] text-green-200/55 transition duration-300 group-hover:text-green-200">
                    Explore →
                  </span>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* ==========================================================
            BOTTOM BAR
        ========================================================== */}

        <div className="mt-10 border-t border-white/[0.08] pt-5 sm:mt-14">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            {/* Copyright */}
            <p className="font-bitter text-[9px] leading-relaxed text-white/30">
              <span className="font-bold text-white/55">
                © {currentYear} Cape Frontier.
              </span>{" "}
              All Rights Reserved.
            </p>

            {/* Legal links */}
            <nav className="flex flex-wrap gap-x-5 gap-y-2">
              <a
                href="/contact"
                className="font-bitter text-[9px] font-bold uppercase tracking-[0.1em] text-white/30 transition hover:text-white/75"
              >
                Contact
              </a>

              <a
                href="/privacy"
                className="font-bitter text-[9px] font-bold uppercase tracking-[0.1em] text-white/30 transition hover:text-white/75"
              >
                Privacy Policy
              </a>

              <a
                href="/terms"
                className="font-bitter text-[9px] font-bold uppercase tracking-[0.1em] text-white/30 transition hover:text-white/75"
              >
                Terms & Conditions
              </a>
            </nav>

            {/* Back to top */}
            <button
              type="button"
              onClick={scrollToTop}
              className="group flex w-fit items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.035] px-2.5 py-2 transition duration-300 hover:border-white/20 hover:bg-white/[0.08]"
              aria-label="Back to top"
            >
              <span className="pl-1 font-bitter text-[8px] font-black uppercase tracking-[0.14em] text-white/30 transition group-hover:text-white/70">
                Back to top
              </span>

              <span className="grid h-7 w-7 place-items-center rounded-full bg-white/[0.07]">
                <img
                  src="/icons/upArrow.png"
                  className="h-3.5 w-3.5 object-contain transition duration-300 group-hover:-translate-y-0.5"
                  alt=""
                />
              </span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Foot;