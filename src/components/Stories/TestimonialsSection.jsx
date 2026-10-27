import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import reviews from "../../data/reviews.js";
import tours from "../../data/tours.js";
import { resolveImage } from "../../utils/ImageLoader.js";

gsap.registerPlugin(ScrollTrigger);

// Layout: first 3 reviews on the top row, next 4 on the bottom row,
// anything after that lives inside the collapsible "See more reviews" area.
const TOP_ROW_COUNT = 3;
const BOTTOM_ROW_COUNT = 4;

const REVIEW_CODE_PREFIX = "TOUR-";
const REVIEW_CODE_PATTERN = /^TOUR-[A-Z0-9]{8}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMPTY_REVIEW_FORM = {
  tour: "",
  title: "",
  rating: 5,
  review: "",
  name: "",
  email: "",
};

// Tour references look like TOUR-H8VUM5DN: an 8-char alphanumeric code
// prefixed with "TOUR-". Whatever the traveller types is normalised into
// that exact shape as they type.
const formatReviewCode = (value) => {
  const alphanumeric = value
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .replace(/^TOUR/, "")
    .slice(0, 8);

  return alphanumeric ? `${REVIEW_CODE_PREFIX}${alphanumeric}` : "";
};

// Notifies the team by email that a new review has come in.
// Backed by /api/reviews/notify (Resend on the server).
async function sendReviewEmailNotification(payload) {
  const response = await fetch("/api/reviews/notify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ review: payload }),
  });

  if (!response.ok) {
    let message = "Failed to send review notification email";
    try {
      const data = await response.json();
      if (data?.error) message = data.error;
    } catch {
      // ignore parse errors, use default message
    }
    throw new Error(message);
  }

  return response.json().catch(() => ({}));
}

const StarRating = ({ rating = 5, size = "w-5 h-5" }) => {
  const filledStars = Math.max(0, Math.min(5, Math.round(Number(rating) || 0)));
  const emptyStars = 5 - filledStars;

  return (
    <div className="flex gap-1">
      {[...Array(filledStars)].map((_, i) => (
        <svg
          key={`filled-${i}`}
          className={`${size} fill-current text-yellow-500`}
          viewBox="0 0 20 20"
        >
          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
        </svg>
      ))}

      {[...Array(emptyStars)].map((_, i) => (
        <svg
          key={`empty-${i}`}
          className={`${size} fill-current text-gray-300`}
          viewBox="0 0 20 20"
        >
          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
        </svg>
      ))}
    </div>
  );
};

const TourReviewImage = ({ src, alt }) => {
  return (
    <img
      src={src}
      alt={alt}
      className="z-10 h-full w-full object-cover transition-transform duration-500 hover:scale-110"
      loading="lazy"
    />
  );
};

const ReviewMeta = ({ review }) => {
  return (
    <div className="mt-auto flex items-center justify-between border-t border-green-300/50 pt-3">
      <div className="flex min-w-0 items-center gap-3">
        <img
          src={resolveImage(review.avatar)}
          alt={review.name}
          className="h-9 w-9 shrink-0 rounded-full border-2 border-white object-cover shadow-sm lg:h-10 lg:w-10"
          loading="lazy"
        />

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-black">
            {review.name}
          </p>

          <p className="truncate text-xs text-gray-600">
            {review.country} · {review.date}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1 text-xs font-bold text-green-900">
        <span>{review.rating}</span>

        <svg
          className="h-5 w-5 text-green-700 opacity-60"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      </div>
    </div>
  );
};

// Small "Read full review" trigger shared by every card.
const ReadMoreButton = ({ onClick }) => (
  <button
    type="button"
    onClick={(e) => {
      e.stopPropagation();
      onClick();
    }}
    className="mb-3 flex w-fit items-center gap-1.5 text-xs font-black uppercase tracking-[0.14em] text-green-900 transition hover:text-green-700"
  >
    Read full review
    <svg
      className="h-3.5 w-3.5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 17 17 7M8 7h9v9" />
    </svg>
  </button>
);

// Bottom-row / "see more" card.
const CompactReviewCard = ({ review, onOpen }) => (
  <div className="z-10 flex h-full flex-col overflow-hidden rounded-2xl bg-green-200 shadow-lg transition-transform duration-300 hover:scale-[1.02]">
    <div className="flex flex-grow flex-col p-5">
      <div className="mb-3 flex gap-1">
        <StarRating rating={review.rating} />
      </div>

      <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-green-900/70">
        {review.tour}
      </p>

      <div className="mb-3 font-frank text-4xl font-bold leading-none text-black">
        {review.title}
      </div>

      <div className="scrollbar-thin scrollbar-thumb-green-400 scrollbar-track-green-100 relative mb-2 h-24 overflow-y-auto pr-2">
        <p className="text-sm leading-relaxed text-gray-800">{review.desc}</p>

        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-green-200 to-transparent" />
      </div>

      <ReadMoreButton onClick={() => onOpen(review)} />

      <ReviewMeta review={review} />
    </div>
  </div>
);

// Full-detail modal opened from any card.
const ReviewModal = ({ review, onClose }) => {
  useEffect(() => {
    if (!review) return undefined;

    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [review, onClose]);

  if (!review) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Review: ${review.title}`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-green-200 shadow-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close review"
          className="absolute right-3 top-3 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-black shadow-md transition hover:bg-white"
        >
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
          >
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>

        <div className="overflow-y-auto">
          {review.img && (
            <div className="relative h-52 shrink-0 overflow-hidden sm:h-64">
              <img
                src={resolveImage(review.img)}
                alt={review.tour}
                className="h-full w-full object-cover"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10" />

              <div className="absolute bottom-3 left-4 z-20 flex flex-wrap items-center gap-2">
                <div className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-black shadow-sm">
                  {review.tour}
                </div>

                {review.verified && (
                  <div className="rounded-full bg-green-200 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-green-950 shadow-sm">
                    Verified
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-4 p-5 sm:p-7">
            <div className="flex items-center gap-3">
              <StarRating rating={review.rating} />
              <span className="text-sm font-bold text-green-900">
                {review.rating} / 5
              </span>
            </div>

            <h3 className="font-frank text-3xl font-bold leading-tight text-black sm:text-4xl">
              {review.title}
            </h3>

            <p className="whitespace-pre-line text-base leading-relaxed text-gray-800">
              {review.desc}
            </p>

            <div className="flex items-center gap-3 border-t border-green-300/60 pt-4">
              <img
                src={resolveImage(review.avatar)}
                alt={review.name}
                className="h-12 w-12 shrink-0 rounded-full border-2 border-white object-cover shadow-sm"
              />

              <div className="min-w-0">
                <p className="truncate text-base font-semibold text-black">
                  {review.name}
                </p>
                <p className="truncate text-sm text-gray-600">
                  {review.country} · {review.date}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Chevron = ({ open }) => (
  <svg
    className={`h-4 w-4 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
);

// -----------------------------------------------------------------------------
// "Leave your review" block
// -----------------------------------------------------------------------------
const HdIcon = () => (
  <svg
    className="h-7 w-7 sm:h-8 sm:w-8"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="2" y="5" width="20" height="14" rx="3" />
    <path d="M6.5 9v6M6.5 12h3M9.5 9v6" />
    <path d="M13 9v6h1.5a3 3 0 0 0 0-6H13Z" />
  </svg>
);

const DefaultNumberBadge = ({ children }) => (
  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-black font-frank text-xl font-black text-white shadow-[0_12px_24px_rgba(0,0,0,0.12)] sm:h-16 sm:w-16 sm:text-2xl">
    {children}
  </div>
);

const AnimatedNumberBadge = ({ children, NumberBadge }) => {
  const badgeRef = useRef(null);

  useLayoutEffect(() => {
    const badge = badgeRef.current;
    if (!badge) return undefined;

    const shine = badge.querySelector(".badge-shine");
    const wash = badge.querySelector(".badge-color-wash");

    const ctx = gsap.context(() => {
      gsap.set(badge, {
        transformOrigin: "center center",
        force3D: true,
        willChange: "transform",
      });

      gsap.set(shine, { xPercent: -150, force3D: true });
      gsap.set(wash, { opacity: 0 });

      const tl = gsap.timeline({ repeat: -1, repeatDelay: 1.35 });

      tl.to(
        badge,
        {
          scale: 1.025,
          duration: 1.2,
          yoyo: true,
          repeat: 1,
          ease: "sine.inOut",
        },
        0,
      )
        .to(
          wash,
          {
            opacity: 0.32,
            duration: 0.55,
            yoyo: true,
            repeat: 1,
            ease: "sine.inOut",
          },
          0,
        )
        .fromTo(
          shine,
          { xPercent: -150 },
          { xPercent: 260, duration: 0.62, ease: "power2.inOut" },
          0.18,
        )
        .fromTo(
          shine,
          { xPercent: -150 },
          { xPercent: 260, duration: 0.62, ease: "power2.inOut" },
          0.9,
        );
    }, badge);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={badgeRef}
      className="relative inline-flex shrink-0 overflow-hidden rounded-[28px]"
    >
      <NumberBadge>{children}</NumberBadge>

      <span className="badge-color-wash pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(187,247,208,0.48),rgba(96,165,250,0.42),rgba(15,10,113,0.34))] mix-blend-screen" />
      <span className="badge-shine pointer-events-none absolute inset-y-0 left-[-65%] w-[46%] skew-x-[-22deg] bg-white/28" />
    </div>
  );
};

// Shown in place of the form once a review has been submitted successfully.
const ReviewSuccessPanel = ({ onClose }) => (
  <div className="flex flex-col items-center gap-4 bg-white/95 px-6 py-10 text-center sm:px-10 sm:py-14">
    <motion.div
      initial={{ scale: 0.4, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 18 }}
      className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500 text-white shadow-[0_16px_34px_rgba(22,163,74,0.35)] sm:h-20 sm:w-20"
    >
      <motion.svg
        width="30"
        height="30"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
      >
        <path d="M4 12.5 9.5 18 20 6" />
      </motion.svg>
    </motion.div>

    <motion.div
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.25, duration: 0.4 }}
    >
      <p className="font-frank text-2xl font-bold text-black/85 sm:text-3xl">
        Review submitted!
      </p>
      <p className="mx-auto mt-3 max-w-md font-mont text-sm leading-6 text-black/60 sm:text-base">
        Thanks for sharing your trip. Our team checks every submission against
        your tour reference to keep things genuine, and yours will go live on
        the site within{" "}
        <span className="font-bold text-black/75">24–48 hours</span>.
      </p>
    </motion.div>

    <motion.button
      type="button"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4 }}
      className="mt-2 rounded-xl border border-black/10 px-5 py-2.5 font-bitter text-xs font-black uppercase tracking-[0.16em] text-black/60 transition hover:bg-black/[0.03]"
    >
      Close
    </motion.button>
  </div>
);

const labelClass =
  "mb-2 block font-bitter text-xs font-black uppercase tracking-[0.18em] text-black/45";
const fieldClass =
  "w-full rounded-2xl border border-black/10 bg-black/[0.03] px-4 py-3 font-mont text-black outline-none transition focus:border-black/20 focus:bg-white disabled:opacity-60";

const LeaveReviewBlock = ({
  NumberBadge = DefaultNumberBadge,
  onSubmitReview,
  onOpenChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [reviewCode, setReviewCode] = useState("");
  const [reviewForm, setReviewForm] = useState(EMPTY_REVIEW_FORM);
  // idle | submitting | success | error
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const bannerShellRef = useRef(null);
  const bannerRef = useRef(null);

  // Tour dropdown is sourced straight from /src/data/tours.js.
  const tourOptions = useMemo(
    () =>
      Array.isArray(tours) ? tours.map((t) => t.title).filter(Boolean) : [],
    [],
  );

  const canSubmit =
    REVIEW_CODE_PATTERN.test(reviewCode) &&
    Boolean(reviewForm.title.trim()) &&
    Boolean(reviewForm.review.trim()) &&
    Boolean(reviewForm.name.trim()) &&
    EMAIL_PATTERN.test(reviewForm.email.trim()) &&
    status !== "submitting";

  // Let the parent know when the form opens/closes (used to pause the
  // mobile carousel while someone is typing).
  useEffect(() => {
    onOpenChange?.(isOpen);
  }, [isOpen, onOpenChange]);

  useEffect(() => {
    const open = () => setIsOpen(true);
    window.addEventListener("open-review-form", open);
    return () => window.removeEventListener("open-review-form", open);
  }, []);

  // Banner scroll animation
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      if (!bannerShellRef.current || !bannerRef.current) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: bannerShellRef.current,
          start: "top 70%",
          end: "top 40%",
          scrub: true,
        },
      });

      tl.fromTo(
        bannerRef.current,
        {
          y: 0,
          backgroundColor: "rgba(255, 255, 255, 0)",
          boxShadow: "0 18px 40px rgba(0,0,0,0.05)",
        },
        {
          y: -8,
          backgroundColor: "rgba(255,255,255,0.98)",
          boxShadow: "0 24px 60px rgba(15,10,113,0.12)",
          ease: "none",
        },
        0,
      );
    }, bannerShellRef);

    return () => ctx.revert();
  }, [isOpen]);

  const updateField = (field) => (e) =>
    setReviewForm((prev) => ({ ...prev, [field]: e.target.value }));

  const closeForm = () => {
    setIsOpen(false);
    setStatus("idle");
    setError("");
    setReviewCode("");
    setReviewForm(EMPTY_REVIEW_FORM);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    const payload = { code: reviewCode, ...reviewForm };

    setStatus("submitting");
    setError("");

    try {
      if (onSubmitReview) {
        await onSubmitReview(payload);
      } else {
        await sendReviewEmailNotification(payload);
      }
      setStatus("success");
    } catch (err) {
      console.error("Review submission failed", err);
      setStatus("error");
      setError(
        err?.message ||
          "Something went wrong sending your review — please try again.",
      );
    }
  };

  const CloseFormButton = (
    <button
      type="button"
      onClick={closeForm}
      className="group flex items-center gap-3 rounded-full border border-black/10 bg-white px-4 py-2.5 font-bitter text-xs font-black uppercase tracking-[0.18em] text-black/70 shadow-[0_12px_28px_rgba(0,0,0,0.08)] transition duration-300 hover:-translate-y-0.5 hover:border-blue-400/40 hover:text-blue-700"
    >
      <span>Close form</span>

      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-green-200 text-black transition-transform duration-300 group-hover:translate-y-0.5">
        <Chevron open />
      </span>
    </button>
  );

  return (
    <div
      id="leave-review"
      ref={bannerShellRef}
      aria-labelledby="leave-review-title"
      className="relative mt-7 overflow-visible pb-2 pt-3 md:mt-10"
    >
      <div
        ref={bannerRef}
        className="relative z-20 overflow-hidden rounded-[28px] border border-black/6 bg-white/88 shadow-[0_14px_34px_rgba(15,10,113,0.06)]"
      >
        {/* Header hidden once the submission succeeds */}
        {status !== "success" && (
          <div className="flex flex-col gap-5 p-5 transition-colors sm:p-6 lg:p-8">
            <div className="flex min-w-0 items-center gap-4 sm:gap-5 md:gap-6">
              <div className="shrink-0">
                <AnimatedNumberBadge NumberBadge={NumberBadge}>
                  <HdIcon />
                </AnimatedNumberBadge>
              </div>

              <div className="min-w-0 flex-1">
                <p
                  className="font-bitter text-[10px] font-black uppercase tracking-[0.2em] sm:text-sm sm:tracking-[0.24em]"
                  style={{ color: "var(--color-brand-lightblue)" }}
                >
                  Feedback step
                </p>

                <p
                  id="leave-review-title"
                  className="mt-1 font-frank text-3xl font-semibold leading-[0.95] sm:mt-2 sm:text-5xl lg:text-6xl"
                  style={{ color: "var(--color-brand-darkblue)" }}
                >
                  Leave your review.
                </p>
              </div>

              {isOpen && (
                <div className="hidden shrink-0 items-center gap-3 md:flex">
                  {CloseFormButton}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <p className="max-w-2xl font-mont text-sm leading-7 text-black/60 sm:text-base md:text-lg">
                <span className="font-bold text-black">
                  Share your experience
                </span>{" "}
                using your tour reference and help future guests discover what
                made your route memorable.
              </p>

              {isOpen && (
                <div className="flex items-center gap-3 self-start md:hidden">
                  {CloseFormButton}
                </div>
              )}
            </div>

            {!isOpen && (
              <motion.button
                type="button"
                onClick={() => setIsOpen(true)}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="group relative mt-1 flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl hero-gradient px-6 py-4 font-frank text-base font-bold text-white shadow-[0_18px_40px_rgba(15,10,113,0.28)] transition-shadow duration-300 hover:shadow-[0_22px_48px_rgba(15,10,113,0.36)] sm:py-5 sm:text-lg"
              >
                <span className="pointer-events-none absolute inset-y-0 left-[-40%] w-1/3 -skew-x-12 bg-white/25 transition-transform duration-700 group-hover:translate-x-[260%]" />

                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="shrink-0"
                >
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
                </svg>

                <span className="tracking-[0.01em]">Write a review</span>

                <span className="rounded-full bg-white/20 px-2.5 py-1 font-bitter text-[10px] font-black uppercase tracking-[0.14em]">
                  2 min
                </span>
              </motion.button>
            )}
          </div>
        )}

        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              className="overflow-hidden"
            >
              {status === "success" ? (
                <ReviewSuccessPanel onClose={closeForm} />
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="grid gap-4 bg-white/92 p-5 sm:p-6 lg:grid-cols-2 lg:gap-5 lg:p-8"
                >
                  <div className="lg:col-span-2">
                    <label className={labelClass}>Tour reference</label>

                    <input
                      value={reviewCode}
                      onChange={(e) =>
                        setReviewCode(formatReviewCode(e.target.value))
                      }
                      placeholder="TOUR-H8VUM5DN"
                      disabled={status === "submitting"}
                      className="w-full rounded-2xl border border-black/10 bg-black/[0.03] px-4 py-3 font-mono text-base tracking-[0.14em] text-black outline-none transition focus:border-black/20 focus:bg-white disabled:opacity-60"
                    />

                    <p className="mt-2 text-xs text-black/45">
                      Use your tour reference from your booking confirmation, in
                      this format: TOUR-XXXXXXXX
                    </p>
                  </div>

                  <div>
                    <label className={labelClass}>Tour</label>

                    <select
                      value={reviewForm.tour}
                      onChange={updateField("tour")}
                      disabled={status === "submitting"}
                      className={fieldClass}
                    >
                      <option value="">Select a tour</option>

                      {tourOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>Rating</label>

                    <select
                      value={reviewForm.rating}
                      onChange={(e) =>
                        setReviewForm((prev) => ({
                          ...prev,
                          rating: Number(e.target.value),
                        }))
                      }
                      disabled={status === "submitting"}
                      className={fieldClass}
                    >
                      {[5, 4, 3, 2, 1].map((value) => (
                        <option key={value} value={value}>
                          {value} / 5
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>Review title</label>

                    <input
                      value={reviewForm.title}
                      onChange={updateField("title")}
                      placeholder="A route worth taking"
                      disabled={status === "submitting"}
                      className={fieldClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Your name</label>

                    <input
                      value={reviewForm.name}
                      onChange={updateField("name")}
                      placeholder="Aaliyah M"
                      disabled={status === "submitting"}
                      className={fieldClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Your email</label>

                    <input
                      type="email"
                      value={reviewForm.email}
                      onChange={updateField("email")}
                      placeholder="you@example.com"
                      disabled={status === "submitting"}
                      className={fieldClass}
                    />

                    <p className="mt-2 text-xs text-black/45">
                      Only used if we have a question about your review — never
                      shown publicly.
                    </p>
                  </div>

                  <div className="lg:col-span-2">
                    <label className={labelClass}>Your review</label>

                    <textarea
                      rows={5}
                      value={reviewForm.review}
                      onChange={updateField("review")}
                      placeholder="Tell future travellers what made this route special..."
                      disabled={status === "submitting"}
                      className={`${fieldClass} resize-none`}
                    />
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between lg:col-span-2">
                    <p
                      className={`text-xs ${
                        status === "error" ? "text-red-600" : "text-black/45"
                      }`}
                    >
                      {status === "error"
                        ? error
                        : "Reviews can only be submitted with a valid tour reference and email."}
                    </p>

                    <div className="flex flex-col gap-3 sm:flex-row">
                      <button
                        type="button"
                        onClick={closeForm}
                        disabled={status === "submitting"}
                        className="rounded-xl border border-black/10 px-5 py-3 font-bitter text-sm font-black text-black/70 transition hover:bg-black/[0.03] disabled:opacity-60"
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        disabled={!canSubmit}
                        className="hero-gradient rounded-xl px-5 py-3 font-bitter text-sm font-black text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45"
                      >
                        {status === "submitting"
                          ? "Submitting…"
                          : "Submit review"}
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const useIsMobileReviews = () => {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth < 768;
  });

  useEffect(() => {
    const update = () => {
      setIsMobile(window.innerWidth < 768);
    };

    update();

    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);

    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, []);

  return isMobile;
};

const TestimonialsSection = ({ NumberBadge, onSubmitReview }) => {
  const isMobileReviews = useIsMobileReviews();
  const [activeTopReviewIndex, setActiveTopReviewIndex] = useState(0);
  const [showMoreReviews, setShowMoreReviews] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const topTrackRef = useRef(null);
  const topCardRefs = useRef([]);

  // First 3 on top, next 4 on the bottom, the rest is collapsible.
  const topReviews = reviews.slice(0, TOP_ROW_COUNT);
  const bottomReviews = reviews.slice(
    TOP_ROW_COUNT,
    TOP_ROW_COUNT + BOTTOM_ROW_COUNT,
  );
  const extraReviews = reviews.slice(TOP_ROW_COUNT + BOTTOM_ROW_COUNT);

  // "See more" is hidden when there are 3 or fewer reviews overall.
  const showSeeMore = reviews.length > TOP_ROW_COUNT && extraReviews.length > 0;

  const closeModal = () => setSelectedReview(null);

  useEffect(() => {
    // Pause the mobile auto-rotation while a review or the form is open.
    if (
      !isMobileReviews ||
      topReviews.length <= 1 ||
      selectedReview ||
      isFormOpen
    )
      return undefined;

    const interval = window.setInterval(() => {
      setActiveTopReviewIndex((current) => (current + 1) % topReviews.length);
    }, 2600);

    return () => window.clearInterval(interval);
  }, [isMobileReviews, topReviews.length, selectedReview, isFormOpen]);

  useLayoutEffect(() => {
    if (!isMobileReviews) return;

    const track = topTrackRef.current;
    const activeCard = topCardRefs.current[activeTopReviewIndex];

    if (!track || !activeCard) return;

    const targetLeft =
      activeCard.offsetLeft -
      track.offsetLeft -
      (track.clientWidth - activeCard.clientWidth) / 2;

    track.scrollTo({
      left: Math.max(0, targetLeft),
      behavior: "smooth",
    });
  }, [activeTopReviewIndex, isMobileReviews]);

  // Expanding/collapsing changes page height, so let ScrollTrigger
  // recalculate once the animation has settled.
  useLayoutEffect(() => {
    const timer = window.setTimeout(() => ScrollTrigger.refresh(), 600);
    return () => window.clearTimeout(timer);
  }, [showMoreReviews]);

  return (
    <div className="w-full px-4 py-5 font-bitter md:py-">
      <div className="mx-auto max-w-5xl">
        {/* top reviews */}
        <div
          ref={topTrackRef}
          className="mb-7 flex h-[32rem] snap-x snap-mandatory items-center gap-3 overflow-x-auto pb-3 [-ms-overflow-style:none] [scrollbar-width:none] md:mb-10 md:grid md:h-auto md:grid-cols-3 md:items-stretch md:gap-4 md:overflow-visible md:pb-0 [&::-webkit-scrollbar]:hidden"
        >
          {topReviews.map((review, index) => {
            const isActiveMobile =
              isMobileReviews && index === activeTopReviewIndex;

            return (
              <div
                key={review.id}
                ref={(el) => {
                  topCardRefs.current[index] = el;
                }}
                onClick={() => setActiveTopReviewIndex(index)}
                className={`relative z-10 flex h-[30rem] snap-center flex-col overflow-hidden rounded-2xl bg-green-200 shadow-lg transition-all duration-500 ease-out hover:scale-[1.02] md:h-full md:min-w-0 ${
                  isMobileReviews
                    ? isActiveMobile
                      ? "min-w-[84vw] scale-100 opacity-100 shadow-xl"
                      : "min-w-[64vw] scale-[0.92] opacity-70"
                    : ""
                }`}
              >
                <div className="absolute z-20 flex gap-1 p-4">
                  <StarRating rating={review.rating} />
                </div>

                <div className="relative h-40 overflow-hidden md:h-48">
                  <TourReviewImage
                    src={resolveImage(review.img)}
                    alt={review.tour}
                  />

                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10" />

                  <div className="absolute bottom-3 left-3 z-20 flex flex-wrap items-center gap-2">
                    <div className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-black shadow-sm backdrop-blur-sm">
                      {review.tour}
                    </div>

                    {review.verified && (
                      <div className="rounded-full bg-green-200 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-green-950 shadow-sm">
                        Verified
                      </div>
                    )}
                  </div>
                </div>

                <div className="z-10 flex flex-grow flex-col p-4 md:p-5">
                  <div
                    className={`mb-2 line-clamp-2 min-h-[3.55rem] font-frank text-3xl font-bold leading-none text-black transition-all duration-500 md:mb-3 md:min-h-0 md:text-3xl lg:text-4xl ${
                      isMobileReviews && !isActiveMobile
                        ? "scale-[0.96] opacity-70"
                        : "scale-100 opacity-100"
                    }`}
                  >
                    {review.title}
                  </div>

                  <div
                    className={`scrollbar-thin scrollbar-thumb-green-400 scrollbar-track-green-100 relative mb-2 h-[4.5rem] overflow-hidden pr-2 transition-opacity duration-500 md:h-24 md:overflow-y-auto ${
                      isMobileReviews && !isActiveMobile
                        ? "opacity-45"
                        : "opacity-100"
                    }`}
                  >
                    <p className="text-sm leading-relaxed text-gray-800">
                      {review.desc}
                    </p>

                    <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-green-200 to-transparent" />
                  </div>

                  <ReadMoreButton onClick={() => setSelectedReview(review)} />

                  <ReviewMeta review={review} />
                </div>
              </div>
            );
          })}
        </div>

        <div className="-mt-3 mb-5 flex items-center justify-center gap-1.5 md:hidden">
          {topReviews.map((review, index) => (
            <button
              key={`top-review-dot-${review.id}`}
              type="button"
              onClick={() => setActiveTopReviewIndex(index)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === activeTopReviewIndex
                  ? "w-7 bg-green-700"
                  : "w-2 bg-black/18"
              }`}
              aria-label={`Show top review ${index + 1}`}
            />
          ))}
        </div>

        {/* bottom reviews: next 4 (md and up; mobile keeps the carousel only) */}
        {bottomReviews.length > 0 && (
          <div className="hidden grid-cols-2 gap-3 md:grid lg:grid-cols-4">
            {bottomReviews.map((review) => (
              <CompactReviewCard
                key={review.id}
                review={review}
                onOpen={setSelectedReview}
              />
            ))}
          </div>
        )}

        {/* collapsible: anything past 7 reviews; hidden entirely for 3 or fewer */}
        {showSeeMore && (
          <div className="hidden md:block">
            <div
              className={`grid transition-[grid-template-rows,opacity] duration-500 ease-out ${
                showMoreReviews
                  ? "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0"
              }`}
              aria-hidden={!showMoreReviews}
            >
              <div className="min-h-0 overflow-hidden">
                <div className="grid grid-cols-2 gap-3 pt-3 lg:grid-cols-4">
                  {extraReviews.map((review) => (
                    <CompactReviewCard
                      key={review.id}
                      review={review}
                      onOpen={setSelectedReview}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="mb-4 mt-5 flex justify-center">
              <button
                type="button"
                onClick={() => setShowMoreReviews((current) => !current)}
                aria-expanded={showMoreReviews}
                className="group flex items-center gap-3 rounded-full border border-black/10 bg-white px-5 py-3 text-xs font-black uppercase tracking-[0.18em] text-black/70 shadow-[0_12px_28px_rgba(0,0,0,0.08)] transition duration-300 hover:-translate-y-0.5 hover:border-green-500/50 hover:text-green-800"
              >
                <span>
                  {showMoreReviews
                    ? "Show fewer reviews"
                    : `See more reviews (${extraReviews.length})`}
                </span>

                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-200 text-black">
                  <Chevron open={showMoreReviews} />
                </span>
              </button>
            </div>
          </div>
        )}

        {/* leave your review */}
        <LeaveReviewBlock
          NumberBadge={NumberBadge}
          onSubmitReview={onSubmitReview}
          onOpenChange={setIsFormOpen}
        />
      </div>

      <ReviewModal review={selectedReview} onClose={closeModal} />

      <style>{`
        .scrollbar-thin::-webkit-scrollbar {
          width: 4px;
        }

        .scrollbar-thin::-webkit-scrollbar-track {
          background: #bbf7d0;
          border-radius: 10px;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #4ade80;
          border-radius: 10px;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #22c55e;
        }
      `}</style>
    </div>
  );
};

export default TestimonialsSection;
