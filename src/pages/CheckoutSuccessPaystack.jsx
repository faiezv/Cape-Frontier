import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import gsap from "gsap";

// ---------- Helpers (unchanged) ----------
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

const getStoredCheckout = () => {
  try {
    const raw = sessionStorage.getItem("lastCheckout");
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error("Could not read lastCheckout:", error);
    return null;
  }
};

const setStoredCheckout = (nextCheckout) => {
  try {
    sessionStorage.setItem("lastCheckout", JSON.stringify(nextCheckout));
  } catch (error) {
    console.error("Could not update lastCheckout:", error);
  }
};

const getEmailStatusLabel = (emailStatus) => {
  if (emailStatus === "sent") return "Email confirmation sent";
  if (emailStatus === "sending") return "Sending email confirmation";
  if (emailStatus === "failed") return "Email needs manual follow-up";
  return "Email pending";
};

const getPaymentStatusLabel = (paymentStatus) => {
  if (paymentStatus === "success") return "Successful";
  if (paymentStatus === "verifying") return "Verifying";
  if (paymentStatus === "error") return "Needs review";
  return "Pending";
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

// ---------- UI sub-components (unchanged) ----------
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

// ========== MAIN COMPONENT ==========
const CheckoutSuccessPaystack = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Refs for animations (unchanged)
  const pageRef = useRef(null);
  const heroRef = useRef(null);
  const badgeRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const firstScreenCardsRef = useRef(null);
  const ctaRowRef = useRef(null);
  const glowLeftRef = useRef(null);
  const glowRightRef = useRef(null);

  const [countdown, setCountdown] = useState(300);

  // ---------- Paystack reference ----------
  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );
  const reference = searchParams.get("reference") || searchParams.get("trxref");

  // Initial checkout data from router state or sessionStorage
  const initialCheckout = useMemo(() => {
    if (location.state?.bookingDetails) {
      return {
        tour: location.state.tour,
        bookingDetails: location.state.bookingDetails,
        selectedCurrency: location.state.selectedCurrency,
        totalAmountLabel: location.state.totalAmountLabel,
        pricingSummary: location.state.pricingSummary,
        notes: location.state.notes,
        checkoutStops: location.state.checkoutStops || [],
        bookingReference: location.state.bookingReference,
        emailPayload: location.state.emailPayload || null,
        paymentProvider: "paystack",
      };
    }
    return getStoredCheckout();
  }, [location.state]);

  const [storedCheckout, setStoredCheckoutState] = useState(initialCheckout);

  // ---------- REF to avoid dependency loop ----------
  // Always holds the latest checkout data without causing re-renders of the effect
  const storedCheckoutRef = useRef(storedCheckout);
  useEffect(() => {
    storedCheckoutRef.current = storedCheckout;
  }, [storedCheckout]);

  // Payment status
  const [paymentStatus, setPaymentStatus] = useState(
    reference ? "verifying" : "error"
  );
  const [paymentMessage, setPaymentMessage] = useState(
    reference
      ? "Verifying your Paystack payment before finalising the booking."
      : "No payment reference found. Please contact support."
  );

  // Email status
  const [emailStatus, setEmailStatus] = useState("idle");

  // ---------- Derived data (unchanged) ----------
  const tour = location.state?.tour || storedCheckout?.tour || null;
  const bookingDetails =
    location.state?.bookingDetails || storedCheckout?.bookingDetails || null;

  const selectedCurrency =
    location.state?.selectedCurrency ||
    storedCheckout?.selectedCurrency ||
    storedCheckout?.emailPayload?.selectedCurrency ||
    "ZAR";

  const totalAmountLabel =
    location.state?.totalAmountLabel ||
    storedCheckout?.totalAmountLabel ||
    storedCheckout?.emailPayload?.totalAmount ||
    null;

  const pricingSummary =
    location.state?.pricingSummary || storedCheckout?.pricingSummary || null;

  const notes = location.state?.notes || storedCheckout?.notes || "";

  const bookingReference =
    location.state?.bookingReference ||
    storedCheckout?.bookingReference ||
    storedCheckout?.emailPayload?.bookingReference ||
    storedCheckout?.emailPayload?.bookingRef ||
    reference ||
    "Pending confirmation";

  const customerEmail =
    bookingDetails?.email ||
    storedCheckout?.emailPayload?.customerEmail ||
    "customer email";

  const ccParticipantEmails = normalizeEmails(
    bookingDetails?.ccParticipantEmails?.length
      ? bookingDetails.ccParticipantEmails
      : bookingDetails?.participantEmails?.length
        ? bookingDetails.participantEmails
        : storedCheckout?.emailPayload?.ccParticipantEmails?.length
          ? storedCheckout.emailPayload.ccParticipantEmails
          : storedCheckout?.emailPayload?.participantEmails
  );

  const pickupLocation = getPickupLocation(
    bookingDetails || storedCheckout?.emailPayload
  );

  const pickupTime = getPickupTime(
    bookingDetails || storedCheckout?.emailPayload
  );

  const isPrivate = Boolean(
    bookingDetails?.isPrivate ||
      bookingDetails?.pricingOptions?.isPrivate ||
      storedCheckout?.emailPayload?.isPrivate
  );

  const isCustom = Boolean(
    bookingDetails?.isCustom ||
      bookingDetails?.pricingOptions?.isCustom ||
      storedCheckout?.emailPayload?.isCustom
  );

  const participants =
    bookingDetails?.participants ||
    pricingSummary?.participants ||
    storedCheckout?.emailPayload?.participants ||
    1;

  const paymentStatusLabel = getPaymentStatusLabel(paymentStatus);
  const emailStatusLabel = getEmailStatusLabel(emailStatus);
  const isVerifyingPayment = paymentStatus === "verifying";
  const isPaymentError = paymentStatus === "error";

  // Scroll to top on mount (unchanged)
  useEffect(() => {
    window.scrollTo(0, 0);
    if (window.lenis) {
      window.lenis.scrollTo(0, { immediate: true, force: true });
      window.lenis.start();
    }
  }, []);

  // ---------- Paystack verification + email ----------
  useEffect(() => {
    if (!reference) return; // no reference, stay in error state
    let cancelled = false;

    const verifyAndSendEmail = async () => {
      try {
        setPaymentStatus("verifying");
        setPaymentMessage("Verifying your Paystack payment...");

        // Call your paystack-verify API endpoint
        const res = await fetch(`/api/paystack-verify?reference=${reference}`);
        const data = await res.json();

        if (!data.status) {
          throw new Error(data.message || "Payment not successful");
        }

        if (cancelled) return;

        // Payment confirmed
        setPaymentStatus("success");
        setPaymentMessage(
          "Payment verified. Cape Frontier will confirm final pickup and vehicle details via WhatsApp."
        );

        // Build final checkout data using the REF, not the state variable
        const currentCheckout = storedCheckoutRef.current || getStoredCheckout() || {};
        const finalBookingReference =
          currentCheckout.bookingReference ||
          currentCheckout.emailPayload?.bookingReference ||
          reference;

        const emailPayload = {
          ...(currentCheckout.emailPayload || {}),
          bookingReference: finalBookingReference,
          bookingRef: finalBookingReference,
          paymentId: reference,
          paymentProvider: "paystack",
          paystackReference: reference,
        };

        const updatedCheckout = {
          ...currentCheckout,
          bookingReference: finalBookingReference,
          verifiedPayment: data,
          emailPayload,
          paymentProvider: "paystack",
        };

        setStoredCheckout(updatedCheckout);  // updates state but will NOT re-run this effect
        setStoredCheckoutState(updatedCheckout);

        // Send booking email
        await sendBookingEmail(emailPayload, reference);
      } catch (error) {
        if (cancelled) return;
        console.error("Paystack verification error:", error);
        setPaymentStatus("error");
        setPaymentMessage(
          error.message ||
            "Payment verification failed. Please contact Cape Frontier with your reference."
        );
        setEmailStatus("failed"); // leave "pending" state
      }
    };

    const sendBookingEmail = async (payload, paystackRef) => {
      const emailSentKey = `cape-frontier-email-sent:${paystackRef}`;
      if (sessionStorage.getItem(emailSentKey)) {
        setEmailStatus("sent");
        return;
      }

      if (
        payload.customerEmail &&
        payload.customerName &&
        payload.tourTitle &&
        payload.date
      ) {
        setEmailStatus("sending");
        try {
          const emailRes = await fetch("/api/send-booking-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

          if (!emailRes.ok) {
            throw new Error("Email API returned an error");
          }

          sessionStorage.setItem(emailSentKey, "true");
          setEmailStatus("sent");

          // Update checkout to reflect email sent
          const emailedCheckout = {
            ...storedCheckoutRef.current,
            emailSent: true,
            emailSentAt: new Date().toISOString(),
          };
          setStoredCheckout(emailedCheckout);
          setStoredCheckoutState(emailedCheckout);
        } catch (emailError) {
          console.error("Booking email failed:", emailError);
          setEmailStatus("failed");
        }
      } else {
        console.warn("Incomplete email payload:", payload);
        setEmailStatus("failed");
      }
    };

    verifyAndSendEmail();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reference]); // Only reference; storedCheckout is accessed via ref

  // ---------- Animations (unchanged) ----------
  useLayoutEffect(() => {
    if (!pageRef.current) return;
    const ctx = gsap.context(() => {
      const animatedItems = [
        badgeRef.current,
        titleRef.current,
        subtitleRef.current,
        firstScreenCardsRef.current,
        ctaRowRef.current,
      ].filter(Boolean);

      gsap.set(animatedItems, { opacity: 0, y: 22, filter: "blur(5px)" });
      if (badgeRef.current) {
        gsap.set(badgeRef.current, { scale: 0.72, y: -14, filter: "blur(4px)" });
      }

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.fromTo(heroRef.current, { opacity: 0 }, { opacity: 1, duration: 0.35 })
        .to(badgeRef.current, {
          opacity: 1,
          scale: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.62,
          ease: "back.out(1.75)",
        })
        .to(titleRef.current, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.58 }, "-=0.34")
        .to(subtitleRef.current, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.48 }, "-=0.34")
        .to(firstScreenCardsRef.current, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.58 }, "-=0.26")
        .to(ctaRowRef.current, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.42 }, "-=0.2");

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

  // Countdown timer (unchanged)
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

  // ---------- JSX (unchanged) ----------
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
                  {isVerifyingPayment ? (
                    <span className="h-10 w-10 animate-spin rounded-full border-4 border-white/45 border-t-[#071f4f] md:h-12 md:w-12" />
                  ) : isPaymentError ? (
                    <span className="font-frank text-4xl font-black text-red-700">!</span>
                  ) : (
                    <img
                      src="/icons/approved.png"
                      alt="Success"
                      className="h-10 w-10 md:h-12 md:w-12"
                    />
                  )}
                </div>

                <p className="mt-5 font-bitter text-[10px] font-black uppercase tracking-[0.3em] text-blue-500">
                  {isVerifyingPayment
                    ? "Verifying payment"
                    : isPaymentError
                      ? "Payment needs review"
                      : "Payment complete"}
                </p>

                <h1
                  ref={titleRef}
                  className="mt-3 font-frank text-5xl font-bold leading-[0.86] text-[#071f4f] sm:text-6xl md:text-7xl"
                >
                  {isVerifyingPayment
                    ? "Confirming booking."
                    : isPaymentError
                      ? "Payment not confirmed."
                      : "Booking confirmed."}
                </h1>

                <p
                  ref={subtitleRef}
                  className="mx-auto mt-4 max-w-xl font-bitter text-sm leading-6 text-slate-600 sm:text-base md:text-lg lg:mx-0"
                >
                  {paymentMessage}
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
                    Customer confirmation
                  </p>
                  <h2 className="mt-2 font-frank text-3xl font-bold leading-none">
                    {emailStatus === "sent"
                      ? "Email sent to customer."
                      : emailStatus === "sending"
                        ? "Sending customer email."
                        : emailStatus === "failed"
                          ? "Email needs manual follow-up."
                          : "Email pending."}
                  </h2>
                  <p className="mt-3 break-words text-sm font-semibold leading-6 text-white/72">
                    {emailStatus === "sent"
                      ? "Confirmation details have been sent to "
                      : emailStatus === "sending"
                        ? "Confirmation details are being sent to "
                        : emailStatus === "failed"
                          ? "Payment is verified, but the email should be checked manually for "
                          : "Email confirmation will be sent to "}
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
                      <p className="mt-1 text-sm font-bold text-slate-900">
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
                  <Pill tone={emailStatus === "failed" ? "neutral" : "blue"}>
                    {emailStatusLabel}
                  </Pill>
                  <Pill tone="dark">Vehicle confirmed later</Pill>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default CheckoutSuccessPaystack;