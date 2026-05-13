import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import gsap from "gsap";

const formatDate = (dateValue) => {
  if (!dateValue) return "Date to be confirmed";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) return dateValue;

  return new Intl.DateTimeFormat("en-ZA", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const normalizeEmails = (emails) => {
  if (!Array.isArray(emails)) return [];

  return emails.map((email) => String(email || "").trim()).filter(Boolean);
};

const getPickupLocation = (bookingDetails) => {
  return (
    bookingDetails?.pickupLocation ||
    bookingDetails?.pickup ||
    "Pickup location to be confirmed"
  );
};

const getPickupTime = (bookingDetails) => {
  return (
    bookingDetails?.pickupTimeLabel ||
    bookingDetails?.pickupTime ||
    bookingDetails?.preferredPickupTime ||
    bookingDetails?.time ||
    "To be confirmed"
  );
};

const Pill = ({ children, tone = "neutral" }) => {
  const tones = {
    neutral: "bg-white/80 text-slate-600 border-white/70",
    green: "bg-green-200 text-green-950 border-green-300/60",
    blue: "bg-blue-100 text-blue-700 border-blue-200/70",
    dark: "bg-[#071f4f] text-white border-[#071f4f]",
  };

  return (
    <span
      className={`inline-flex w-fit items-center rounded-full border px-3 py-1.5 text-xs font-bold ${tones[tone] || tones.neutral}`}
    >
      {children}
    </span>
  );
};

const DetailCard = ({ label, value, note, tone = "white" }) => {
  const tones = {
    white: "bg-white/88 text-slate-900",
    blue: "bg-blue-50 text-slate-900",
    green: "bg-green-50 text-slate-900",
    dark: "bg-[#071f4f] text-white",
  };

  return (
    <div
      className={`rounded-[1.35rem] p-4 shadow-[0_12px_30px_rgba(7,31,79,0.06)] ${tones[tone] || tones.white}`}
    >
      <p
        className={`text-[10px] font-bold uppercase tracking-[0.2em] ${
          tone === "dark" ? "text-white/45" : "text-slate-400"
        }`}
      >
        {label}
      </p>

      <p
        className={`mt-2 break-words font-frank text-2xl font-bold leading-none ${
          tone === "dark" ? "text-white" : "text-[#071f4f]"
        }`}
      >
        {value}
      </p>

      {note && (
        <p
          className={`mt-2 text-xs leading-5 ${
            tone === "dark" ? "text-white/60" : "text-slate-500"
          }`}
        >
          {note}
        </p>
      )}
    </div>
  );
};

const EmailChip = ({ email }) => (
  <span className="inline-flex max-w-full items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-blue-500 shadow-sm">
      <svg
        className="h-3.5 w-3.5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M20 21a8 8 0 0 0-16 0" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    </span>

    <span className="truncate">{email}</span>
  </span>
);

const CheckoutSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const pageRef = useRef(null);
  const heroRef = useRef(null);
  const badgeRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const firstScreenCardsRef = useRef(null);
  const ctaRowRef = useRef(null);
  const summaryRef = useRef(null);
  const glowLeftRef = useRef(null);
  const glowRightRef = useRef(null);

  const [countdown, setCountdown] = useState(300);

  const snapshot = useMemo(() => {
    try {
      const raw = sessionStorage.getItem("lastCheckout");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const tour = location.state?.tour || snapshot?.tour || null;
  const bookingDetails =
    location.state?.bookingDetails || snapshot?.bookingDetails || null;

  const selectedCurrency =
    location.state?.selectedCurrency || snapshot?.selectedCurrency || "ZAR";

  const totalAmountLabel =
    location.state?.totalAmountLabel || snapshot?.totalAmountLabel || null;

  const pricingSummary =
    location.state?.pricingSummary || snapshot?.pricingSummary || null;

  const notes = location.state?.notes || snapshot?.notes || "";

  const searchParams = new URLSearchParams(location.search);
  const paymentIntentId = searchParams.get("payment_intent");

  const bookingReference = location.state?.bookingReference || null;
  const customerEmail = bookingDetails?.email || "customer email";
  const ccParticipantEmails = normalizeEmails(
    bookingDetails?.ccParticipantEmails?.length
      ? bookingDetails.ccParticipantEmails
      : bookingDetails?.participantEmails
  );

  const pickupLocation = getPickupLocation(bookingDetails);
  const pickupTime = getPickupTime(bookingDetails);

  const isPrivate = Boolean(
    bookingDetails?.isPrivate || bookingDetails?.pricingOptions?.isPrivate
  );

  const isCustom = Boolean(
    bookingDetails?.isCustom || bookingDetails?.pricingOptions?.isCustom
  );

  const participants = bookingDetails?.participants || pricingSummary?.participants || 1;

  useEffect(() => {
    window.scrollTo(0, 0);

    if (window.lenis) {
      window.lenis.scrollTo(0, { immediate: true, force: true });
      window.lenis.start();
    }
  }, []);

  useLayoutEffect(() => {
    if (!pageRef.current) return;

    const ctx = gsap.context(() => {
      const animatedItems = [
        badgeRef.current,
        titleRef.current,
        subtitleRef.current,
        firstScreenCardsRef.current,
        ctaRowRef.current,
        summaryRef.current,
      ].filter(Boolean);

      gsap.set(animatedItems, {
        opacity: 0,
        y: 22,
        filter: "blur(5px)",
      });

      if (badgeRef.current) {
        gsap.set(badgeRef.current, {
          scale: 0.72,
          y: -14,
          filter: "blur(4px)",
        });
      }

      const tl = gsap.timeline({
        defaults: {
          ease: "power3.out",
        },
      });

      tl.fromTo(
        heroRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.35 }
      )
        .to(badgeRef.current, {
          opacity: 1,
          scale: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.62,
          ease: "back.out(1.75)",
        })
        .to(
          titleRef.current,
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.58,
          },
          "-=0.34"
        )
        .to(
          subtitleRef.current,
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.48,
          },
          "-=0.34"
        )
        .to(
          firstScreenCardsRef.current,
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.58,
          },
          "-=0.26"
        )
        .to(
          ctaRowRef.current,
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.42,
          },
          "-=0.2"
        )
        .to(
          summaryRef.current,
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.55,
          },
          "-=0.18"
        );

      gsap.to(glowLeftRef.current, {
        x: 18,
        y: -16,
        scale: 1.05,
        duration: 5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      gsap.to(glowRightRef.current, {
        x: -18,
        y: 18,
        scale: 1.08,
        duration: 6,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      gsap.to(badgeRef.current, {
        y: -4,
        duration: 2.4,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }, pageRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate("/");
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  const formatCountdown = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${mins}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <div
      ref={pageRef}
      className="relative min-h-screen overflow-x-hidden bg-[#eef7f6] text-slate-950"
    >
      <img
        src="/images/section2-bg.png"
        alt=""
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-10"
      />

      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.94)_0%,rgba(232,246,255,0.88)_48%,rgba(220,252,231,0.9)_100%)]" />

      <div
        ref={glowLeftRef}
        className="pointer-events-none absolute left-[6%] top-[12%] h-52 w-52 rounded-full bg-green-200/55 blur-3xl md:h-72 md:w-72"
      />

      <div
        ref={glowRightRef}
        className="pointer-events-none absolute right-[7%] top-[15%] h-56 w-56 rounded-full bg-blue-400/20 blur-3xl md:h-80 md:w-80"
      />

      <div className="relative z-10">
        <section
          ref={heroRef}
          className="flex min-h-screen items-center justify-center px-4 py-6 sm:px-6 md:px-10 xl:px-16"
        >
          <div className="mx-auto w-full max-w-6xl">
            <div className="grid items-center gap-6 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="text-center lg:text-left">
                <div
                  ref={badgeRef}
                  className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-200 to-blue-400 shadow-[0_20px_60px_rgba(96,165,250,0.28)] lg:mx-0 md:h-24 md:w-24"
                >
                  <img
                    src="/icons/approved.png"
                    alt="Success"
                    className="h-10 w-10 md:h-12 md:w-12"
                  />
                </div>

                <p className="mt-5 font-bitter text-[10px] font-black uppercase tracking-[0.3em] text-blue-500">
                  Payment complete
                </p>

                <h1
                  ref={titleRef}
                  className="mt-3 font-frank text-5xl font-bold leading-[0.86] text-[#071f4f] sm:text-6xl md:text-7xl"
                >
                  Booking confirmed.
                </h1>

                <p
                  ref={subtitleRef}
                  className="mx-auto mt-4 max-w-xl font-bitter text-sm leading-6 text-slate-600 sm:text-base md:text-lg lg:mx-0"
                >
                  Your payment was successful. Cape Frontier now confirms pickup,
                  vehicle allocation, and final trip arrangements.
                </p>

                <div ref={ctaRowRef} className="mt-6 flex flex-col gap-3 sm:flex-row lg:justify-start">
                  <button
                    onClick={() => window.print()}
                    className="rounded-full bg-white px-6 py-3 text-sm font-bold text-slate-700 shadow-[0_10px_28px_rgba(7,31,79,0.06)] transition hover:-translate-y-0.5 hover:bg-green-200 hover:text-green-950"
                  >
                    Print receipt
                  </button>

                  <button
                    onClick={() => navigate("/")}
                    className="hero-gradient-bl rounded-full px-6 py-3 font-frank text-sm font-bold text-white shadow-[0_14px_34px_rgba(7,31,79,0.18)] transition hover:-translate-y-0.5"
                  >
                    Return home
                  </button>
                </div>

                <p className="mt-4 text-sm text-slate-500">
                  Returning to home in {formatCountdown(countdown)}
                </p>
              </div>

              <div
                ref={firstScreenCardsRef}
                className="rounded-[2rem] bg-white/94 p-4 shadow-[0_22px_70px_rgba(7,31,79,0.09)] sm:p-5 md:p-6"
              >
                <div className="rounded-[1.5rem] bg-[#071f4f] p-5 text-white">
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/45">
                    Customer confirmation email
                  </p>

                  <h2 className="mt-2 font-frank text-3xl font-bold leading-none">
                    Email sent to customer.
                  </h2>

                  <p className="mt-3 break-words text-sm font-semibold leading-6 text-white/72">
                    Confirmation details have been sent to{" "}
                    <span className="text-green-200">{customerEmail}</span>.
                  </p>

                  {ccParticipantEmails.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2 border-t border-white/10 pt-4">
                      {ccParticipantEmails.map((email) => (
                        <EmailChip key={email} email={email} />
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <DetailCard
                    label="Booking ref"
                    value={bookingReference}
                    note="Save this reference for support."
                  />

                  <DetailCard
                    label="Amount paid"
                    value={totalAmountLabel || "Paid"}
                    note={selectedCurrency}
                    tone="green"
                  />

                  <DetailCard
                    label="Pickup time"
                    value={pickupTime}
                    note="Final timing is manually confirmed."
                    tone="dark"
                  />

                  <DetailCard
                    label="Trip date"
                    value={formatDate(bookingDetails?.date)}
                    note={`${participants} guest${Number(participants) > 1 ? "s" : ""}`}
                    tone="blue"
                  />
                </div>

                <div className="mt-4 rounded-[1.5rem] bg-stone-50 p-4">
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm">
                      <img
                        src="/icons/mapPin.png"
                        alt=""
                        className="h-5 w-5 object-contain"
                      />
                    </span>

                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                        Pickup location
                      </p>

                      <p className="mt-1 text-sm font-bold leading-6 text-slate-900">
                        {pickupLocation}
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Vehicle is confirmed after purchase and selected based on group
                        size, route, luggage, availability, and operations.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {isPrivate && <Pill tone="green">Private tour</Pill>}
                  {isCustom && <Pill tone="green">Custom trip</Pill>}
                  <Pill tone="blue">Email confirmation sent</Pill>
                  <Pill tone="dark">Vehicle confirmed later</Pill>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section ref={summaryRef} className="px-4 pb-12 sm:px-6 md:px-10 xl:px-16">
          <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="overflow-hidden rounded-[2rem] bg-white/95 shadow-[0_20px_60px_rgba(7,31,79,0.07)]">
              <div className="bg-gradient-to-r from-green-100/80 to-blue-100/80 p-5 md:p-7">
                <p className="font-bitter text-[10px] font-black uppercase tracking-[0.25em] text-blue-500">
                  Confirmed tour
                </p>

                <h2 className="mt-2 font-frank text-3xl font-bold leading-none text-[#071f4f]">
                  {tour?.title || tour?.info || "Your Tour"}
                </h2>
              </div>

              <div className="p-5 md:p-7">
                {tour?.image && (
                  <div className="mb-5 h-56 w-full overflow-hidden rounded-[1.5rem] bg-stone-100">
                    <img
                      src={tour.image}
                      alt={tour.title || tour.info}
                      className="h-full w-full object-cover object-center"
                    />
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {tour?.location && <Pill tone="green">{tour.location}</Pill>}
                  {tour?.duration && <Pill tone="blue">{tour.duration}</Pill>}
                  <Pill tone="dark">{selectedCurrency}</Pill>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-[2rem] bg-white/95 shadow-[0_20px_60px_rgba(7,31,79,0.07)]">
              <div className="bg-gradient-to-r from-blue-100/80 to-green-100/80 p-5 md:p-7">
                <p className="font-bitter text-[10px] font-black uppercase tracking-[0.25em] text-blue-500">
                  Next steps
                </p>

                <h3 className="mt-2 font-frank text-3xl font-bold leading-none text-[#071f4f]">
                  What happens now
                </h3>
              </div>

              <div className="grid gap-3 p-5 md:p-7">
                <div className="rounded-[1.25rem] bg-green-50/80 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                    Payment status
                  </p>
                  <p className="mt-2 font-frank text-2xl font-bold text-green-700">
                    Successful
                  </p>
                </div>

                <div className="rounded-[1.25rem] bg-blue-50/70 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                    Customer
                  </p>
                  <p className="mt-2 font-frank text-xl font-bold text-slate-800">
                    {bookingDetails?.fullName || "Guest"}
                  </p>
                  <p className="mt-1 break-words text-sm text-slate-600">
                    {customerEmail}
                  </p>
                  {bookingDetails?.mobile && (
                    <p className="mt-1 text-sm text-slate-600">
                      {bookingDetails.mobile}
                    </p>
                  )}
                </div>

                <div className="rounded-[1.25rem] bg-white p-4 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                    Operational reminder
                  </p>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    Cape Frontier still confirms the final pickup details, vehicle,
                    and any private/custom arrangements manually after payment.
                  </p>
                </div>

                {notes && (
                  <div className="rounded-[1.25rem] bg-stone-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                      Custom notes
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mx-auto mt-8 h-1 max-w-6xl rounded-full hero-gradient" />
        </section>
      </div>
    </div>
  );
};

export default CheckoutSuccess;