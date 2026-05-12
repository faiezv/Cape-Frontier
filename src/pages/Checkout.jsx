import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { useLocation, useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { appearance, stripePromise } from "/config/stripe.js";
import { FX_RATES } from "../data/tours.js";
import vehicles from "../data/vehicles.js";

gsap.registerPlugin(ScrollTrigger);

const DEFAULT_PRIVATE_TOUR_FEE_ZAR = 750;
const DEFAULT_CUSTOM_TRIP_FEE_ZAR = 500;

const getTourReturnPath = (tour) => {
  const rawSlug =
    tour?.slug ||
    tour?.canonicalSlug ||
    tour?.canonicalPath?.split("/").filter(Boolean).pop() ||
    tour?.title ||
    tour?.info ||
    "";

  const slug = String(rawSlug)
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug ? `/tours/${slug}` : "/";
};

const getBasePriceZar = (tour) => {
  if (typeof tour?.priceBase === "number" && Number.isFinite(tour.priceBase)) {
    return tour.priceBase;
  }

  const raw = String(tour?.price || "").replace(/[^\d.]/g, "");
  const parsed = parseFloat(raw);

  return Number.isFinite(parsed) ? parsed : 0;
};

const convertFromZar = (amountZar, currency) => {
  const safeAmount = Number(amountZar);
  const code = String(currency || "ZAR").toUpperCase();
  const rate = Number(FX_RATES[code] ?? 1);

  if (!Number.isFinite(safeAmount)) return 0;
  if (!Number.isFinite(rate)) return 0;

  return safeAmount * rate;
};

const formatMoney = (amount, currency) => {
  const safeAmount = Number(amount);
  const code = String(currency || "ZAR").toUpperCase();

  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: code,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(safeAmount) ? safeAmount : 0);
};

const formatDisplayTime = (value) => {
  if (!value) return "";

  const text = String(value).trim();
  if (!text) return "";

  if (/\b(am|pm)\b/i.test(text)) return text;

  return text.replace(/\b([01]?\d|2[0-3]):([0-5]\d)\b/g, (_, hourText, minuteText) => {
    const hour = Number(hourText);
    const suffix = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;

    return `${displayHour}:${minuteText} ${suffix}`;
  });
};

const toMinorUnit = (amount, currency) => {
  const safeAmount = Number(amount);
  const code = String(currency || "ZAR").toUpperCase();

  if (!Number.isFinite(safeAmount)) return 0;

  const ZERO_DECIMAL = new Set(["JPY", "KRW"]);

  return ZERO_DECIMAL.has(code)
    ? Math.round(safeAmount)
    : Math.round(safeAmount * 100);
};

const normalizeEmails = (emails) => {
  if (!Array.isArray(emails)) return [];

  return emails.map((email) => String(email || "").trim()).filter(Boolean);
};

const getPickupTime = (tour, bookingDetails) => {
  const directTime =
    bookingDetails?.pickupTime ||
    bookingDetails?.preferredPickupTime ||
    bookingDetails?.pickupTimeLabel ||
    bookingDetails?.time ||
    bookingDetails?.pickup?.time ||
    tour?.pickupTime ||
    tour?.startTime ||
    tour?.departureTime;

  if (directTime) return formatDisplayTime(directTime);

  const pickupStop = tour?.stops?.find((stop) => {
    const text = `${stop?.id || ""} ${stop?.name || ""}`.toLowerCase();
    return (text.includes("pickup") || text.includes("meeting")) && stop?.time;
  });

  if (pickupStop?.time) return formatDisplayTime(pickupStop.time);

  const firstTimedStop = tour?.stops?.find((stop) => stop?.time);

  return firstTimedStop?.time ? formatDisplayTime(firstTimedStop.time) : "To be confirmed";
};

const InfoPill = ({ children, tone = "neutral" }) => {
  const tones = {
    neutral: "border-white/70 bg-white/80 text-slate-600",
    green: "border-[#071f4f]/20 bg-[#071f4f] text-white",
    blue: "border-[#071f4f]/15 bg-[#eef4ff] text-[#071f4f]",
    dark: "border-[#071f4f] bg-[#071f4f] text-white",
    stone: "border-stone-200 bg-stone-100 text-slate-600",
  };

  return (
    <span
      className={`inline-flex w-fit items-center rounded-full border px-3 py-1.5 text-xs font-bold ${tones[tone] || tones.neutral}`}
    >
      {children}
    </span>
  );
};

const SummaryRow = ({ label, value, strong = false }) => (
  <div className="flex items-start justify-between gap-4 text-sm">
    <span className="text-slate-500">{label}</span>
    <span
      className={`max-w-[62%] text-right leading-5 ${
        strong ? "font-bold text-slate-950" : "font-semibold text-slate-700"
      }`}
    >
      {value}
    </span>
  </div>
);

const MiniCard = ({ label, value, note, tone = "blue" }) => {
  const toneClasses = {
    blue: "from-[#eef4ff] to-white",
    green: "from-[#eef4ff] to-white",
    stone: "from-stone-50 to-white",
  };

  return (
    <div
      className={`rounded-[1.35rem] bg-gradient-to-br ${toneClasses[tone] || toneClasses.blue} p-4 shadow-[0_10px_26px_rgba(7,31,79,0.05)]`}
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>
      <p className="mt-2 break-words font-bold leading-5 text-slate-900">{value}</p>
      {note && <p className="mt-1 text-xs leading-5 text-slate-500">{note}</p>}
    </div>
  );
};

const PolicyNote = ({ title, children }) => (
  <div className="rounded-2xl bg-white/72 p-4 shadow-[0_10px_24px_rgba(7,31,79,0.04)]">
    <p className="text-sm font-bold text-[#071f4f]">{title}</p>
    <p className="mt-1 text-xs leading-5 text-slate-500">{children}</p>
  </div>
);

const EmailChip = ({ email }) => (
  <span className="inline-flex max-w-full items-center gap-2 rounded-full bg-[#eef4ff] px-3 py-1.5 text-xs font-semibold text-[#071f4f]">
    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-[#071f4f] shadow-sm">
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

const VehicleOptionCard = ({ vehicle }) => (
  <div className="group overflow-hidden rounded-[1.35rem] bg-white shadow-[0_12px_28px_rgba(7,31,79,0.06)]">
    <div className="relative h-28 overflow-hidden bg-slate-100">
      <img
        src={vehicle.image}
        alt={vehicle.name}
        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        loading="lazy"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />

      <div className="absolute bottom-2 left-2 rounded-full bg-white/92 px-2.5 py-1 text-[10px] font-bold text-slate-900 shadow-sm">
        {vehicle.color} · {vehicle.capacity}
      </div>
    </div>

    <div className="p-3">
      <p className="font-frank text-xl font-bold leading-none text-[#071f4f]">
        {vehicle.name}
      </p>

      <p className="mt-1 text-[11px] font-semibold leading-4 text-slate-500">
        {vehicle.type}
      </p>

      <div className="mt-2 flex flex-wrap gap-1.5">
        <span className="rounded-full bg-[#eef4ff] px-2 py-1 text-[10px] font-bold text-[#071f4f]">
          {vehicle.luggage}
        </span>
        <span className="rounded-full bg-[#f3f6fb] px-2 py-1 text-[10px] font-bold text-[#071f4f]">
          {vehicle.transmission}
        </span>
      </div>
    </div>
  </div>
);


const RevealButton = ({ active, title, detail, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`group flex w-full items-center justify-between gap-3 rounded-[1.25rem] border p-4 text-left transition ${
      active
        ? "border-green-300 bg-green-200 text-green-950"
        : "border-black/5 bg-white/82 text-slate-700 shadow-[0_10px_24px_rgba(7,31,79,0.04)] hover:-translate-y-0.5 hover:bg-white"
    }`}
  >
    <span>
      <span className="block text-sm font-bold">{title}</span>
      {detail && (
        <span className={`mt-1 block text-xs leading-5 ${active ? "text-green-950/70" : "text-slate-500"}`}>
          {detail}
        </span>
      )}
    </span>

    <span
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-lg font-bold transition ${
        active ? "bg-white/70 rotate-45 text-green-950" : "bg-slate-50 group-hover:bg-[#eef4ff]"
      }`}
    >
      +
    </span>
  </button>
);

const RevealPanel = ({ open, children }) => {
  return (
    <div
      className={`overflow-hidden rounded-[1.5rem] transition-all duration-500 ease-out ${
        open
          ? "max-h-[3200px] translate-y-0 opacity-100"
          : "max-h-0 -translate-y-2 opacity-0 pointer-events-none"
      }`}
      aria-hidden={!open}
    >
      <div
        className={`transition-all duration-500 ease-out ${
          open ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
        }`}
      >
        {children}
      </div>
    </div>
  );
};


const CheckoutForm = ({
  totalAmountLabel,
  currency,
  tour,
  bookingDetails,
  notes,
  pricingSummary,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [successFade, setSuccessFade] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setLoading(true);
    setMessage("");

    sessionStorage.setItem(
      "lastCheckout",
      JSON.stringify({
        tour,
        bookingDetails,
        selectedCurrency: currency,
        totalAmountLabel,
        pricingSummary,
        notes,
        savedAt: new Date().toISOString(),
      })
    );

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/success`,
      },
      redirect: "if_required",
    });

    if (error) {
      setMessage(error.message || "Payment failed.");
      setLoading(false);
      return;
    }

    if (paymentIntent?.status === "succeeded") {
      const emailPayload = {
        customerName: bookingDetails.fullName,
        customerEmail: bookingDetails.email,
        mobile: bookingDetails.mobile,
        tourTitle: tour.title || tour.info,
        tourId: tour.id,
        tourSlug: tour.slug,
        date: bookingDetails.date,
        pickupTime: bookingDetails.pickupTimeLabel,
        participants: bookingDetails.participants,
        participantEmails: bookingDetails.participantEmails || [],
        ccParticipantEmails: bookingDetails.ccParticipantEmails || [],
        ccParticipants: Boolean(bookingDetails.ccParticipants),
        isPrivate: Boolean(bookingDetails.isPrivate),
        isCustom: Boolean(bookingDetails.isCustom),
        pricingOptions: bookingDetails.pricingOptions || {},
        pricingSummary,
        customerNotes: notes,
        pickupLocation:
          bookingDetails.pickupLocation ||
          bookingDetails.pickup ||
          "Not provided",
        pickupCoords: bookingDetails.pickupCoords || null,
        selectedCurrency: currency,
        totalAmount: totalAmountLabel,
        paymentId: paymentIntent.id,
        policyAcknowledgement: {
          customerBooksOwnGroup: true,
          participantsMustMatchOwnParty: true,
          lowerRatesRequireFullSelectedGroupPayment: true,
          finalPickupVehicleOperationallyConfirmed: true,
        },
      };

      console.log("Email payload being sent:", emailPayload);

      try {
        const emailRes = await fetch("/api/send-booking-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(emailPayload),
        });

        const emailData = await emailRes.json();

        console.log("Email API response:", emailData);

        if (!emailRes.ok) {
          console.error("Booking email failed:", emailData);
        }
      } catch (emailError) {
        console.error("Booking email request failed:", emailError);
      }

      setSuccessFade(true);

      await new Promise((resolve) => {
        window.setTimeout(resolve, 400);
      });

      navigate("/success", {
        state: {
          tour,
          bookingDetails,
          selectedCurrency: currency,
          totalAmountLabel,
          pricingSummary,
          notes,
        },
      });

      return;
    }

    setMessage("Payment was not completed. Please try again.");
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4 overflow-visible">
      {successFade && (
        <>
          <style>{`
            @keyframes checkoutFadeToWhite {
              from {
                opacity: 0;
              }
              to {
                opacity: 1;
              }
            }
          `}</style>

          <div
            className="fixed inset-0 z-[120] bg-white"
            style={{ animation: "checkoutFadeToWhite 400ms ease-out forwards" }}
            aria-hidden="true"
          />
        </>
      )}

      <div className="rounded-[1.35rem] bg-white p-3 shadow-[0_14px_34px_rgba(7,31,79,0.06)] md:p-4">
        <PaymentElement />
      </div>

      <button
        type="submit"
        disabled={!stripe || loading}
        className="hero-gradient-bl group relative flex w-full items-center justify-center overflow-hidden rounded-[1.35rem] px-6 py-4 font-frank text-xl font-bold text-white shadow-[0_18px_42px_rgba(7,31,79,0.22)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_52px_rgba(7,31,79,0.30)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className="pointer-events-none absolute inset-0 translate-x-[-120%] bg-white/20 blur-xl transition duration-700 group-hover:translate-x-[120%]" />
        <span className="relative">{loading ? "Processing..." : "Pay"}</span>
      </button>

      {message && (
        <div className="rounded-2xl bg-red-500 px-4 py-3 text-sm text-white">
          {message}
        </div>
      )}
    </form>
  );
};

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { tour, bookingDetails, selectedCurrency } = location.state || {};

  const pageRef = useRef(null);
  const heroRef = useRef(null);
  const checkoutGridRef = useRef(null);
  const leftRef = useRef(null);
  const rightColumnRef = useRef(null);
  const rightPinRef = useRef(null);
  const rightRef = useRef(null);
  const infoMenuRef = useRef(null);

  const [notes, setNotes] = useState(bookingDetails?.customerNotes || "");
  const [clientSecret, setClientSecret] = useState("");
  const [checkoutError, setCheckoutError] = useState("");
  const [loadingSession, setLoadingSession] = useState(true);
  const [paymentCompact, setPaymentCompact] = useState(false);
  const [showMobileBackTop, setShowMobileBackTop] = useState(false);
  const [openPanels, setOpenPanels] = useState({
    trip: true,
    custom: false,
    vehicles: false,
    summary: true,
    policies: false,
  });

  const togglePanel = (key) => {
    setOpenPanels((current) => ({
      ...current,
      [key]: !current[key],
    }));
  };

  const currency = useMemo(() => {
    return String(selectedCurrency || tour?.baseCurrency || "ZAR").toUpperCase();
  }, [selectedCurrency, tour]);

  const handleBackToBooking = () => {
    if (window.lenis?.start) {
      window.lenis.start();
    }

    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "auto";
    }

    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate(getTourReturnPath(tour), {
      state: {
        tour,
        selectedCurrency: currency,
        restorePreviousScroll: true,
      },
      replace: true,
    });
  };

  const handleScrollToTop = () => {
    if (window.lenis?.scrollTo) {
      window.lenis.scrollTo(0, {
        duration: 0.75,
        force: true,
      });

      return;
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handlePaymentPanelWheel = (event) => {
    const deltaY = event.deltaY || 0;

    if (Math.abs(deltaY) < 1) return;

    /*
      The Stripe iframe handles its own pointer/wheel behavior.
      This handler mainly fixes the surrounding pinned payment card, which can
      otherwise trap wheel scrolling when the cursor is over empty card space.
    */
    event.preventDefault();
    event.stopPropagation();

    const currentY = window.scrollY || window.pageYOffset || 0;
    const nextY = Math.max(0, currentY + deltaY);

    if (window.lenis) {
      window.lenis.scrollTo(nextY, {
        duration: 0.45,
        force: true,
      });

      return;
    }

    window.scrollTo({
      top: nextY,
      behavior: "auto",
    });
  };

  useEffect(() => {
    if (!tour || !bookingDetails) {
      navigate("/");
    }
  }, [tour, bookingDetails, navigate]);

  useEffect(() => {
    let rafId = null;

    const updateMobileBackTop = () => {
      rafId = null;

      if (typeof window === "undefined" || window.innerWidth >= 768 || !infoMenuRef.current) {
        setShowMobileBackTop(false);
        return;
      }

      const menuBottom = infoMenuRef.current.getBoundingClientRect().bottom;
      const triggerPoint = window.innerHeight * 0.2;

      setShowMobileBackTop(menuBottom <= triggerPoint);
    };

    const requestUpdate = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(updateMobileBackTop);
    };

    requestUpdate();

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    if (window.lenis?.on) {
      window.lenis.on("scroll", requestUpdate);
    }

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);

      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);

      if (window.lenis?.off) {
        window.lenis.off("scroll", requestUpdate);
      }
    };
  }, [loadingSession, checkoutError, openPanels]);

  useLayoutEffect(() => {
    if (!tour || !bookingDetails || loadingSession || checkoutError) return;
    if (!pageRef.current || !heroRef.current || !leftRef.current || !rightRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        heroRef.current,
        { opacity: 0, y: 18, filter: "blur(5px)" },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.6,
          ease: "power3.out",
        }
      );

      if (leftRef.current) {
        gsap.fromTo(
          leftRef.current,
          { opacity: 0, y: 26 },
          {
            opacity: 1,
            y: 0,
            duration: 0.65,
            ease: "power3.out",
            delay: 0.08,
          }
        );
      }
    }, pageRef);

    return () => ctx.revert();
  }, [tour, bookingDetails, loadingSession, checkoutError]);

  /*
    Manual GSAP pin for the payment column.
    This avoids ScrollTrigger's built-in pin mechanics, which can fail in this
    project because of transformed smooth-scroll wrappers, grid layout, and Stripe
    iframes. We use GSAP to set the payment column to relative / fixed / absolute
    based on scroll position. This has proven more reliable than CSS sticky here.
  */
  useLayoutEffect(() => {
    if (!tour || !bookingDetails || loadingSession || checkoutError || !clientSecret) return;
    if (
      !checkoutGridRef.current ||
      !leftRef.current ||
      !rightColumnRef.current ||
      !rightPinRef.current
    ) {
      return;
    }

    const grid = checkoutGridRef.current;
    const left = leftRef.current;
    const column = rightColumnRef.current;
    const pinColumn = rightPinRef.current;
    const lenis = window.lenis;

    let rafId = null;
    let resizeTimer = null;

    const getPinTop = () => 96;

    const resetPin = () => {
      gsap.set(column, {
        minHeight: "auto",
      });

      gsap.set(pinColumn, {
        clearProps: "position,top,left,width,zIndex,x,y,transform",
      });
    };

    const updatePin = () => {
      rafId = null;

      if (window.innerWidth < 1024) {
        resetPin();
        return;
      }

      const scrollY = window.scrollY || window.pageYOffset;
      const pinTop = getPinTop();

      const gridTop = grid.getBoundingClientRect().top + scrollY;
      const leftHeight = left.offsetHeight || 0;
      const columnRect = column.getBoundingClientRect();
      const columnLeft = columnRect.left;
      const columnWidth = column.offsetWidth;
      const panelHeight = pinColumn.offsetHeight || 0;

      const startY = gridTop - pinTop;
      const endY = gridTop + leftHeight - panelHeight - pinTop;

      gsap.set(column, {
        minHeight: `${Math.max(panelHeight, 1)}px`,
      });

      if (scrollY < startY || leftHeight <= panelHeight) {
        gsap.set(pinColumn, {
          position: "relative",
          top: "auto",
          left: "auto",
          width: "100%",
          zIndex: 1,
          x: 0,
          y: 0,
          clearProps: "transform",
        });

        return;
      }

      if (scrollY >= endY) {
        gsap.set(pinColumn, {
          position: "absolute",
          top: `${Math.max(0, leftHeight - panelHeight)}px`,
          left: 0,
          width: "100%",
          zIndex: 30,
          x: 0,
          y: 0,
          clearProps: "transform",
        });

        return;
      }

      gsap.set(pinColumn, {
        position: "fixed",
        top: `${pinTop}px`,
        left: `${columnLeft}px`,
        width: `${columnWidth}px`,
        zIndex: 60,
        x: 0,
        y: 0,
        clearProps: "transform",
      });
    };

    const requestUpdate = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(updatePin);
    };

    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        resetPin();
        requestUpdate();
      }, 120);
    };

    const setupTimer = window.setTimeout(() => {
      requestUpdate();
    }, 850);

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", onResize);

    if (lenis?.on) {
      lenis.on("scroll", requestUpdate);
    }

    const lateTimers = [1200, 1800].map((delay) =>
      window.setTimeout(requestUpdate, delay)
    );

    return () => {
      window.clearTimeout(setupTimer);
      window.clearTimeout(resizeTimer);
      lateTimers.forEach((timer) => window.clearTimeout(timer));

      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }

      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", onResize);

      if (lenis?.off) {
        lenis.off("scroll", requestUpdate);
      }

      resetPin();
    };
  }, [tour, bookingDetails, loadingSession, checkoutError, clientSecret, paymentCompact]);

  const basePriceZar = useMemo(() => {
    return getBasePriceZar(tour);
  }, [tour]);

  const participants = useMemo(() => {
    const parsed = parseInt(bookingDetails?.participants, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
  }, [bookingDetails]);

  const pricePerPerson = useMemo(() => {
    return convertFromZar(basePriceZar, currency);
  }, [basePriceZar, currency]);

  const pricingOptions = bookingDetails?.pricingOptions || {};

  const isPrivate = Boolean(bookingDetails?.isPrivate || pricingOptions?.isPrivate);
  const isCustom = Boolean(bookingDetails?.isCustom || pricingOptions?.isCustom);

  const privateFee = useMemo(() => {
    if (!isPrivate) return 0;

    const fee = Number(pricingOptions?.privateFee);
    if (Number.isFinite(fee) && fee > 0) return fee;

    return convertFromZar(DEFAULT_PRIVATE_TOUR_FEE_ZAR, currency);
  }, [isPrivate, pricingOptions?.privateFee, currency]);

  const customFee = useMemo(() => {
    if (!isCustom) return 0;

    const fee = Number(pricingOptions?.customFee);
    if (Number.isFinite(fee) && fee > 0) return fee;

    return convertFromZar(DEFAULT_CUSTOM_TRIP_FEE_ZAR, currency);
  }, [isCustom, pricingOptions?.customFee, currency]);

  const subtotalBeforeDiscount = useMemo(() => {
    const provided = Number(pricingOptions?.subtotalBeforeGroupDiscount);
    if (Number.isFinite(provided) && provided > 0) return provided;

    return pricePerPerson * participants;
  }, [pricingOptions?.subtotalBeforeGroupDiscount, pricePerPerson, participants]);

  const groupDiscountPercent = useMemo(() => {
    const provided = Number(pricingOptions?.groupDiscountPercent);
    return Number.isFinite(provided) && provided > 0 ? provided : 0;
  }, [pricingOptions?.groupDiscountPercent]);

  const groupDiscountAmount = useMemo(() => {
    const provided = Number(pricingOptions?.groupDiscountAmount);
    if (Number.isFinite(provided) && provided > 0) return provided;

    return groupDiscountPercent > 0
      ? subtotalBeforeDiscount * (groupDiscountPercent / 100)
      : 0;
  }, [pricingOptions?.groupDiscountAmount, groupDiscountPercent, subtotalBeforeDiscount]);

  const discountedTourSubtotal = useMemo(() => {
    const provided = Number(pricingOptions?.discountedTourSubtotal);
    if (Number.isFinite(provided) && provided >= 0) return provided;

    return Math.max(subtotalBeforeDiscount - groupDiscountAmount, 0);
  }, [pricingOptions?.discountedTourSubtotal, subtotalBeforeDiscount, groupDiscountAmount]);

  const subtotalTours = discountedTourSubtotal;

  const totalPrice = useMemo(() => {
    const provided = Number(pricingOptions?.estimatedTotal);
    if (Number.isFinite(provided) && provided > 0) return provided;

    return discountedTourSubtotal + privateFee + customFee;
  }, [pricingOptions?.estimatedTotal, discountedTourSubtotal, privateFee, customFee]);

  const totalAmountLabel = useMemo(() => {
    return formatMoney(totalPrice, currency);
  }, [totalPrice, currency]);

  const totalMinorUnit = useMemo(() => {
    return toMinorUnit(totalPrice, currency);
  }, [totalPrice, currency]);

  const participantEmails = useMemo(() => {
    return normalizeEmails(
      bookingDetails?.ccParticipantEmails?.length
        ? bookingDetails.ccParticipantEmails
        : bookingDetails?.participantEmails
    );
  }, [bookingDetails]);

  const ccParticipantEmails = useMemo(() => {
    return normalizeEmails(bookingDetails?.ccParticipantEmails);
  }, [bookingDetails]);

  const pickupDisplay =
    bookingDetails?.pickupLocation || bookingDetails?.pickup || "Not provided";

  const pickupCoordLabel = bookingDetails?.pickupCoords
    ? `${Number(bookingDetails.pickupCoords.lat).toFixed(6)}, ${Number(
        bookingDetails.pickupCoords.lng
      ).toFixed(6)}`
    : "Not selected on map";

  const pickupTimeLabel = useMemo(() => {
    return getPickupTime(tour, bookingDetails);
  }, [tour, bookingDetails]);

  const checkoutStops = useMemo(() => {
    if (!Array.isArray(tour?.stops)) return [];

    return tour.stops
      .map((stop, index) => ({
        id: stop?.id || index + 1,
        name: stop?.name || stop?.title || `Stop ${index + 1}`,
        time: formatDisplayTime(stop?.time || ""),
        duration: stop?.duration || "",
      }))
      .filter((stop) => stop.name);
  }, [tour]);

  const displayedVehicles = useMemo(() => {
    return vehicles.slice(0, 3);
  }, []);

  const enrichedBookingDetails = useMemo(
    () => ({
      ...bookingDetails,
      participantEmails,
      ccParticipantEmails,
      isPrivate,
      isCustom,
      pickupTimeLabel,
      pricingOptions: {
        ...pricingOptions,
        currency,
        basePriceZar,
        pricePerPerson,
        participants,
        subtotalBeforeDiscount,
        groupDiscountPercent,
        groupDiscountAmount,
        discountedTourSubtotal,
        subtotalTours,
        isPrivate,
        privateFee,
        isCustom,
        customFee,
        totalPrice,
        totalMinorUnit,
        totalAmountLabel,
      },
    }),
    [
      bookingDetails,
      participantEmails,
      ccParticipantEmails,
      isPrivate,
      isCustom,
      pickupTimeLabel,
      pricingOptions,
      currency,
      basePriceZar,
      pricePerPerson,
      participants,
      subtotalBeforeDiscount,
      groupDiscountPercent,
      groupDiscountAmount,
      discountedTourSubtotal,
      subtotalTours,
      privateFee,
      customFee,
      totalPrice,
      totalMinorUnit,
      totalAmountLabel,
    ]
  );

  const pricingSummary = useMemo(
    () => ({
      currency,
      basePriceZar,
      pricePerPerson,
      participants,
      subtotalBeforeDiscount,
      groupDiscountPercent,
      groupDiscountAmount,
      discountedTourSubtotal,
      subtotalTours,
      isPrivate,
      privateFee,
      isCustom,
      customFee,
      totalPrice,
      totalMinorUnit,
      totalAmountLabel,
    }),
    [
      currency,
      basePriceZar,
      pricePerPerson,
      participants,
      subtotalBeforeDiscount,
      groupDiscountPercent,
      groupDiscountAmount,
      discountedTourSubtotal,
      subtotalTours,
      isPrivate,
      privateFee,
      isCustom,
      customFee,
      totalPrice,
      totalMinorUnit,
      totalAmountLabel,
    ]
  );

  useEffect(() => {
    if (!tour || !bookingDetails) return;

    if (!Number.isFinite(totalMinorUnit) || totalMinorUnit < 1) {
      setCheckoutError("Invalid total amount. Check the tour price format.");
      setLoadingSession(false);
      return;
    }

    const createPaymentIntent = async () => {
      try {
        setLoadingSession(true);
        setCheckoutError("");
        setClientSecret("");

        const res = await fetch("/api/payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tourId: tour.id,
            tourSlug: tour.slug,
            participants,
            currency,
            email: bookingDetails.email,
            isPrivate,
            isCustom,
            privateFee,
            customFee,
            totalAmount: totalPrice,
            totalMinorUnit,
            pricingOptions: {
              isPrivate,
              isCustom,
              privateFee,
              customFee,
              subtotalBeforeGroupDiscount: subtotalBeforeDiscount,
              groupDiscountPercent,
              groupDiscountAmount,
              discountedTourSubtotal,
              subtotalTours,
              totalPrice,
            },
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to create payment intent.");
        }

        if (!data.clientSecret) {
          throw new Error("No client secret returned from server.");
        }

        setClientSecret(data.clientSecret);
      } catch (err) {
        console.error("Checkout session error:", err);
        setCheckoutError(err.message || "Could not start checkout.");
      } finally {
        setLoadingSession(false);
      }
    };

    createPaymentIntent();
  }, [
    tour,
    bookingDetails,
    participants,
    currency,
    isPrivate,
    isCustom,
    privateFee,
    customFee,
    subtotalBeforeDiscount,
    groupDiscountPercent,
    groupDiscountAmount,
    discountedTourSubtotal,
    subtotalTours,
    totalPrice,
    totalMinorUnit,
  ]);

  if (!tour || !bookingDetails) return null;

  if (loadingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-6">
        <div className="text-center">
          <div className="relative mx-auto mb-6 h-16 w-16">
            <div className="absolute inset-0 rounded-full border border-[#071f4f]/10" />
            <div className="absolute inset-1 rounded-full border-4 border-transparent border-t-[#071f4f] animate-spin" />
            <div className="absolute inset-[1.35rem] rounded-full bg-[#071f4f]" />
          </div>

          <div className="font-frank text-xl text-slate-900 md:text-2xl">
            Securing checkout session
          </div>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Preparing the payment form for {currency}.
          </p>

          <div className="mx-auto mt-6 flex w-fit items-center gap-1.5">
            <span className="h-2 w-2 animate-bounce rounded-full bg-[#071f4f] [animation-delay:-0.24s]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-[#071f4f] [animation-delay:-0.12s]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-[#071f4f]" />
          </div>
        </div>
      </div>
    );
  }

  if (checkoutError) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-stone-50 px-6">
        <img
          src="/images/section2-bg.png"
          alt=""
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-10"
        />

        <div className="absolute inset-0 bg-gradient-to-br from-white/85 via-[#eef4ff]/85 to-[#e8f0fb]/92" />

        <div className="relative z-10 w-full max-w-xl rounded-[2rem] bg-white/95 p-8 text-center shadow-[0_20px_60px_rgba(7,31,79,0.08)]">
          <div className="font-frank text-2xl text-slate-800 md:text-3xl">
            Checkout could not start
          </div>

          <div className="mt-3 font-bitter text-slate-600">{checkoutError}</div>

          <button
            onClick={handleBackToBooking}
            className="mt-6 rounded-full bg-[#071f4f] px-6 py-3 font-frank text-white transition hover:bg-[#0b2d70]"
          >
            Back to booking
          </button>
        </div>
      </div>
    );
  }

  const options = {
    clientSecret,
    appearance: {
      ...appearance,
      variables: {
        ...(appearance?.variables || {}),
        colorPrimary: "#071f4f",
        colorText: "#071f4f",
      },
    },
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

      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.94)_0%,rgba(232,246,255,0.88)_48%,rgba(238,244,255,0.92)_100%)]" />
      <div className="pointer-events-none absolute right-[7%] top-[14%] h-64 w-64 rounded-full bg-[#071f4f]/18 blur-3xl" />

      {showMobileBackTop && (
        <button
          type="button"
          onClick={handleScrollToTop}
          className="fixed left-1/2 top-3 z-[80] inline-flex -translate-x-1/2 items-center gap-2 rounded-full bg-[#071f4f] px-4 py-2 text-xs font-bold text-white shadow-[0_14px_34px_rgba(7,31,79,0.25)] transition hover:-translate-y-0.5 md:hidden"
        >
          <span aria-hidden="true">↑</span>
          Back to top
        </button>
      )}

      <div className="relative z-10 min-h-screen px-3 py-4 sm:px-5 sm:py-5 md:px-8 xl:px-16">
        <div className="mx-auto max-w-7xl">
          <div
            ref={heroRef}
            className="mb-5 flex items-center justify-between gap-4"
          >
            <button
              onClick={handleBackToBooking}
              className="inline-flex w-fit items-center gap-2 rounded-full bg-white/90 px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-[0_12px_30px_rgba(7,31,79,0.06)] transition hover:-translate-y-0.5 hover:bg-[#071f4f] hover:text-white"
            >
              <span aria-hidden="true">←</span>
              <span>Back to tour booking</span>
            </button>
          </div>

          <div ref={checkoutGridRef} className="grid overflow-visible gap-4 lg:grid-cols-[minmax(0,1.08fr)_minmax(360px,0.82fr)] lg:items-start lg:gap-6">
            <section
              ref={leftRef}
              className="order-2 overflow-hidden rounded-[1.65rem] bg-white/92 shadow-[0_20px_60px_rgba(7,31,79,0.08)] lg:order-1 lg:rounded-[2rem]"
            >
              <div className="relative min-h-[190px] overflow-hidden bg-slate-900 sm:min-h-[230px] md:min-h-[290px]">
                <img
                  src={tour.image}
                  alt={tour.title || tour.info}
                  className="absolute inset-0 h-full w-full object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/86 via-slate-950/38 to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-5 text-white md:p-7">
                  <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/75">
                    Checkout summary
                  </p>

                  <h1 className="mt-2 max-w-3xl font-frank text-3xl font-bold leading-[0.9] sm:text-4xl md:text-5xl">
                    {tour.title || tour.info}
                  </h1>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {tour.duration && <InfoPill>{tour.duration}</InfoPill>}
                    {tour.location && <InfoPill>{tour.location}</InfoPill>}
                    <InfoPill tone="green">
                      {participants} guest{participants > 1 ? "s" : ""}
                    </InfoPill>
                  </div>
                </div>
              </div>

              <div className="space-y-4 p-4 md:p-6 lg:p-7">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[1.5rem] bg-[#071f4f] p-4 text-white shadow-[0_16px_38px_rgba(7,31,79,0.16)] sm:p-5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/45">
                      Pickup
                    </p>

                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/65">
                          Time
                        </p>

                        <div className="mt-1 break-words font-frank text-4xl font-bold leading-[0.9] md:text-5xl">
                          {pickupTimeLabel}
                        </div>
                      </div>

                      <div className="rounded-[1.15rem] bg-white/10 p-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/65">
                          Date
                        </p>

                        <div className="mt-1 break-words font-frank text-2xl font-bold leading-none">
                          {bookingDetails.date || "Date TBC"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[1.5rem] bg-white p-4 shadow-[0_14px_34px_rgba(7,31,79,0.05)] sm:p-5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                      Main participant
                    </p>

                    <p className="mt-2 font-frank text-2xl leading-none text-slate-950">
                      {bookingDetails.fullName || "Not provided"}
                    </p>

                    <p className="mt-2 break-words text-sm font-semibold text-slate-600">
                      {bookingDetails.email || "No email"}
                    </p>

                    <p className="mt-1 text-sm font-bold text-slate-900">
                      {bookingDetails.mobile || "No mobile"}
                    </p>

                    {participantEmails.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2 border-t border-black/5 pt-3">
                        {participantEmails.map((email) => (
                          <EmailChip key={email} email={email} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {Object.values(openPanels).some(Boolean) && (
                  <div className="rounded-2xl border border-green-200 bg-green-50 p-3 text-center text-xs font-bold leading-5 text-green-900 sm:hidden">
                    Details open underneath the menu. Choose a card, then scroll down to view it.
                  </div>
                )}

                <div ref={infoMenuRef} className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
                  <RevealButton
                    active={openPanels.trip}
                    title="Trip details"
                    detail="Pickup, booking tags"
                    onClick={() => togglePanel("trip")}
                  />

                  <RevealButton
                    active={openPanels.custom}
                    title="Custom notes"
                    detail={isCustom ? "Editable" : "Custom off"}
                    onClick={() => togglePanel("custom")}
                  />

                  <RevealButton
                    active={openPanels.vehicles}
                    title="Vehicles"
                    detail="Confirmed later"
                    onClick={() => togglePanel("vehicles")}
                  />

                  <RevealButton
                    active={openPanels.summary}
                    title="Summary"
                    detail="Total and CS brief"
                    onClick={() => togglePanel("summary")}
                  />

                  <RevealButton
                    active={openPanels.policies}
                    title="Policies"
                    detail="Refunds and rules"
                    onClick={() => togglePanel("policies")}
                  />
                </div>

                <RevealPanel open={openPanels.trip}>
                  <div className="grid gap-4 lg:grid-cols-[1fr_0.8fr]">
                    <div className="rounded-[1.5rem] bg-stone-50 p-5">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm">
                            <img
                              src="/icons/mapPin.png"
                              className="h-5 w-5 object-contain"
                              alt=""
                            />
                          </span>

                          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                            Trip and pickup
                          </p>
                        </div>

                        <InfoPill tone="green">
                          {bookingDetails.date || "Date not selected"}
                        </InfoPill>
                      </div>

                      <p className="mt-3 text-sm font-bold leading-6 text-slate-900">
                        {pickupDisplay}
                      </p>

                      <p className="mt-2 text-xs leading-5 text-slate-500">
                        Coordinates: {pickupCoordLabel}
                      </p>

                      {checkoutStops.length > 0 && (
                        <div className="mt-4 rounded-2xl bg-white/82 p-3">
                          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                            Route stops
                          </p>

                          <div className="mt-3 grid gap-2">
                            {checkoutStops.map((stop, index) => (
                              <div
                                key={`${stop.id}-${stop.name}-${index}`}
                                className="grid grid-cols-[auto_1fr] gap-3 rounded-xl border border-black/5 bg-white p-2.5"
                              >
                                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#eef4ff] text-[11px] font-bold text-[#071f4f]">
                                  {index + 1}
                                </span>

                                <div className="min-w-0">
                                  <p className="truncate text-xs font-bold text-slate-900">
                                    {stop.name}
                                  </p>

                                  {(stop.time || stop.duration) && (
                                    <p className="mt-0.5 text-[11px] font-semibold text-slate-500">
                                      {[stop.time, stop.duration].filter(Boolean).join(" · ")}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <p className="mt-3 rounded-2xl bg-white/80 p-3 text-xs leading-5 text-slate-500">
                        Pickup is included unless stated otherwise. Cape Frontier confirms
                        the final pickup point, vehicle details, and operational timing
                        manually after payment.
                      </p>
                    </div>

                    <div className="rounded-[1.5rem] bg-white p-5 shadow-[0_14px_34px_rgba(7,31,79,0.05)]">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                        Related booking info
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <InfoPill tone="blue">{currency}</InfoPill>
                        {isPrivate && <InfoPill tone="green">Private tour selected</InfoPill>}
                        {isCustom && <InfoPill tone="green">Custom trip selected</InfoPill>}
                        {ccParticipantEmails.length > 0 && (
                          <InfoPill tone="dark">{ccParticipantEmails.length} CC email(s)</InfoPill>
                        )}
                        {!isPrivate && !isCustom && ccParticipantEmails.length === 0 && (
                          <InfoPill tone="stone">Standard booking</InfoPill>
                        )}
                      </div>

                      <p className="mt-3 text-xs leading-5 text-slate-500">
                        These options affect what Cape Frontier needs to confirm after payment.
                      </p>
                    </div>
                  </div>
                </RevealPanel>

                <RevealPanel open={openPanels.custom}>
                  <div className={`rounded-[1.5rem] p-5 shadow-[0_14px_34px_rgba(7,31,79,0.05)] ${
                    isCustom ? "bg-white" : "bg-stone-50"
                  }`}>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                        Custom trip request notes
                      </p>

                      <InfoPill tone={isCustom ? "green" : "stone"}>
                        {isCustom ? "Enabled" : "Custom tour not selected"}
                      </InfoPill>
                    </div>

                    {isCustom ? (
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows="4"
                        className="mt-3 w-full resize-none rounded-2xl bg-stone-50 p-3 text-sm text-slate-700 outline-none transition focus:bg-white focus:ring-2 focus:ring-[#071f4f]/20"
                        placeholder="Custom route requests, special pickup timing, accessibility needs, dietary restrictions, allergies, luggage notes..."
                      />
                    ) : (
                      <p className="mt-3 rounded-2xl bg-white/80 p-3 text-sm leading-6 text-slate-500">
                        Special request notes are only available when the customer selected
                        the custom trip option on the booking form.
                      </p>
                    )}
                  </div>
                </RevealPanel>

                <RevealPanel open={openPanels.vehicles}>
                  <div className="rounded-[1.5rem] bg-white p-5 shadow-[0_14px_34px_rgba(7,31,79,0.05)]">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                          Possible vehicle options
                        </p>

                        <h3 className="mt-2 font-frank text-3xl font-bold leading-none text-[#071f4f]">
                          Vehicle confirmed after purchase.
                        </h3>

                        <p className="mt-2 max-w-2xl text-xs leading-5 text-slate-500">
                          Customers do not choose a vehicle at checkout. Cape Frontier
                          confirms the most suitable vehicle after payment based on group
                          size, route, luggage, availability, and operational planning.
                        </p>
                      </div>

                      <InfoPill tone="blue">Operational allocation</InfoPill>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {displayedVehicles.map((vehicle) => (
                        <VehicleOptionCard key={vehicle.id} vehicle={vehicle} />
                      ))}
                    </div>
                  </div>
                </RevealPanel>

                <RevealPanel open={openPanels.summary}>
                  <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
                    <div className="rounded-[1.5rem] bg-[#071f4f] p-5 text-white">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">
                        Customer service brief
                      </p>

                      <div className="mt-4 space-y-3 text-xs leading-5 text-white/72">
                        <p>
                          Customer is booking their own group only. Participants must match
                          the customer’s own party size.
                        </p>
                        <p>
                          If fewer guests arrive than booked, the original booking total
                          still applies.
                        </p>
                        <p>
                          Vehicle is confirmed after purchase and selected by Cape Frontier
                          based on group size, luggage, route, and operational needs.
                        </p>
                      </div>
                    </div>

                    <div className="rounded-[1.5rem] bg-white p-5 shadow-[0_14px_34px_rgba(7,31,79,0.05)]">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                        Checkout summary
                      </p>

                      <div className="mt-4 space-y-3">
                        <SummaryRow
                          label="Guests"
                          value={`${participants} guest${participants > 1 ? "s" : ""}`}
                        />
                        <SummaryRow
                          label="Per person"
                          value={formatMoney(pricePerPerson, currency)}
                        />
                        <SummaryRow
                          label="Tour subtotal"
                          value={`${formatMoney(pricePerPerson, currency)} × ${participants} = ${formatMoney(subtotalBeforeDiscount, currency)}`}
                        />
                        <SummaryRow
                          label="Group discount"
                          value={
                            groupDiscountAmount > 0
                              ? `-${formatMoney(groupDiscountAmount, currency)} · ${groupDiscountPercent}% saved`
                              : "No group discount applied"
                          }
                        />
                        <SummaryRow
                          label="Discounted tour total"
                          value={formatMoney(discountedTourSubtotal, currency)}
                          strong
                        />
                        <SummaryRow
                          label="Private tour fee"
                          value={isPrivate ? formatMoney(privateFee, currency) : "Not added"}
                        />
                        <SummaryRow
                          label="Custom trip fee"
                          value={isCustom ? formatMoney(customFee, currency) : "Not added"}
                        />
                      </div>

                      {groupDiscountAmount > 0 && (
                        <div className="mt-4 rounded-[1.35rem] border border-green-200 bg-green-50 p-4">
                          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-green-700">
                            Group saving
                          </p>

                          <div className="mt-1 font-frank text-2xl font-bold leading-none text-green-950">
                            {formatMoney(groupDiscountAmount, currency)} saved
                          </div>

                          <p className="mt-1 text-xs font-semibold text-green-900/70">
                            {groupDiscountPercent}% discount for {participants} guest{participants > 1 ? "s" : ""}
                          </p>
                        </div>
                      )}

                      <div className="mt-4 rounded-[1.35rem] bg-[#071f4f] p-4 text-white">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">
                          Total due
                        </p>

                        <div className="mt-1 font-frank text-3xl font-bold leading-none">
                          {totalAmountLabel}
                        </div>

                        <p className="mt-1 text-xs font-semibold text-white/55">
                          {participants} guest{participants > 1 ? "s" : ""} · {currency}
                        </p>
                      </div>
                    </div>
                  </div>
                </RevealPanel>

                <RevealPanel open={openPanels.policies}>
                  <div className="mb-4 flex justify-center">
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 rounded-full border border-[#071f4f]/10 bg-white px-4 py-2 text-xs font-bold text-[#071f4f] shadow-[0_10px_24px_rgba(7,31,79,0.06)]"
                      aria-label="Policy information"
                    >
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#071f4f] text-[11px] text-white">
                        i
                      </span>
                      Policy information
                    </button>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <PolicyNote title="Booking policy reminder">
                      Lower per-person rates apply only when the selected participant
                      count is booked and paid for in full.
                    </PolicyNote>

                    <PolicyNote title="Cancellation reminder">
                      Cancellation within 24 hours after booking allows a full refund.
                      2–3 days before trip has a 20% penalty. Within 24 hours before
                      the trip has no refund.
                    </PolicyNote>

                    <PolicyNote title="Weather policy">
                      Weather-related cancellations may allow a refund or reschedule,
                      depending on availability.
                    </PolicyNote>

                    <PolicyNote title="Private/custom handling">
                      Private and custom requests require final operational confirmation
                      from Cape Frontier after payment.
                    </PolicyNote>
                  </div>
                </RevealPanel>
              </div>
            </section>

            <div ref={rightColumnRef} className="order-1 relative min-h-[1px] w-full self-start lg:order-2">
              <div ref={rightPinRef} className="relative h-fit w-full">
                <aside
                  ref={rightRef}
                  onWheel={handlePaymentPanelWheel}
                  className="h-fit max-h-[calc(100svh-1rem)] overflow-visible rounded-[1.5rem] bg-white/94 shadow-[0_20px_60px_rgba(7,31,79,0.08)] lg:rounded-[2rem]"
                >
              <div
                onPointerDown={() => setPaymentCompact(true)}
                onMouseEnter={() => setPaymentCompact(true)}
                onFocusCapture={() => setPaymentCompact(true)}
                className="space-y-3 overflow-visible p-3 pb-5 sm:p-4 sm:pb-6 md:p-5 md:pb-7"
              >
                <div className="flex items-center justify-between gap-3 px-1">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#071f4f]">
                      Payment
                    </p>
                    <p className="text-xs text-slate-500">
                      Final details confirmed after purchase.
                    </p>
                  </div>

                  <span className="rounded-full bg-[#071f4f] px-3 py-1.5 text-xs font-bold text-white">
                    Secure
                  </span>
                </div>
                {clientSecret ? (
                  <Elements
                    stripe={stripePromise}
                    options={options}
                    key={clientSecret}
                  >
                    <CheckoutForm
                      totalAmountLabel={totalAmountLabel}
                      currency={currency}
                      tour={tour}
                      bookingDetails={enrichedBookingDetails}
                      notes={isCustom ? notes : ""}
                      pricingSummary={pricingSummary}
                    />
                  </Elements>
                ) : (
                  <div className="rounded-[1.5rem] bg-[#eef4ff]/70 p-6 text-center text-[#071f4f]">
                    <div className="mx-auto h-10 w-10 rounded-full border-4 border-[#071f4f]/10 border-t-[#071f4f] animate-spin" />

                    <p className="mt-4 font-bitter text-sm font-bold">
                      Loading secure payment form...
                    </p>

                    <p className="mt-1 text-xs text-[#071f4f]/65">
                      This usually takes a few seconds.
                    </p>
                  </div>
                )}

              </div>
                </aside>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;