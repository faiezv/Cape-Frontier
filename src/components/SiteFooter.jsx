import React, {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { Link, useLocation } from "react-router-dom";
import { WhatsAppIcon, WHATSAPP_URL } from "./WhatsApp";
import { resolveImage } from "../utils/ImageLoader.js";
import { site } from "../utils/siteConfig.js";

// ============================================================
// CONFIG
// ============================================================

const isZA = site.key === "coza";

const SITE_URL = site.origin;
const SITEMAP_URL = `${SITE_URL}/sitemap.xml`;
const BRAND_NAME = "Cape Frontier Travel & Tours";
const LOGO_SRC = "/assets/brand/logo-cf.webp";

const CONTACT_EMAIL = "admin@cape-frontier.co.za";
// Local format for .co.za, international format for .com
const CONTACT_NUMBER = isZA ? "072 264 7284" : "+27 72 264 7284";
const CONTACT_TEL = "+27722647284";
const LOCATION_TEXT = "Cape Town, South Africa";

// TODO: replace with the real profile URL (e.g. https://www.instagram.com/yourhandle).
const INSTAGRAM_URL = "https://www.instagram.com/";
const INSTAGRAM_QR = "/assets/brand/instagram.png";

const BLURB = isZA
  ? "Guided Cape Town routes with local pickup support. Prices are in rand, and you pay online once your booking is confirmed."
  : "Guided Cape Town routes with local pickup support. Plan from abroad, pay online, then receive confirmation by email.";
const CURRENCY_ALT = isZA
  ? "South African Rand"
  : "Prices shown in South African Rand";

const footerBgImage = resolveImage(
  "/src/assets/images/content/random/siteFooter.webp",
);

// ============================================================
// LINK DATA
// `to` = internal route. `section` = id of a section on the home page
// (the home page reads location.state.scrollTo, same as the navbar).
// ============================================================

const tourLinks = [
  { label: "Adrenaline", to: "/tours?type=adrenaline" },
  { label: "Hiking", to: "/tours?type=hiking" },
  { label: "Historical", to: "/tours?type=historical" },
  { label: "Packages", to: "/tours?type=packages" },
  { label: "All tours", to: "/tours" },
];

const policyLinks = [
  { label: "Booking policy", to: "/policies#booking-policy" },
  { label: "Pickup policy", to: "/policies#pickup-policy" },
  { label: "Payment flow", to: "/policies#payment-policy" },
  { label: "Cancellations", to: "/policies#cancellation-policy" },
  { label: "Rescheduling", to: "/policies#reschedule-policy" },
  { label: "Private tours", to: "/policies#private-tour-policy" },
  { label: "Vehicles", to: "/policies#vehicle-policy" },
];

const legalLinks = [
  { label: "Privacy policy", to: "/policies" },
  { label: "Terms & conditions", to: "/policies" },
  {
    label: "Accessibility",
    href: `mailto:${CONTACT_EMAIL}?subject=Accessibility%20request`,
  },
  { label: "Sitemap", href: SITEMAP_URL, external: true },
];

const affiliations = [
  {
    label: "Cape Town Tourism",
    logo: "/assets/brand/logo-ct-tourism.webp",
    href: "https://www.capetown.travel",
  },
  {
    label: "The Capetonian",
    logo: "/assets/brand/logo-the-capetonian.webp",
    href: null,
  },
  {
    label: "Love Cape Town",
    logo: "/assets/brand/logo-love-ct-blue.webp",
    href: null,
  },
];

const paymentMethods = [
  { label: "Visa", glyph: "visa" },
  { label: "Mastercard", glyph: "mastercard" },
  { label: "Apple Pay", glyph: "applepay" },
  { label: "Google Pay", glyph: "googlepay" },
  { label: "QR payments", glyph: "qr" },
];

// ============================================================
// SMALL PIECES
// ============================================================

const ICONS = {
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="m3.5 7.5 8.5 6 8.5-6" />
    </>
  ),
  phone: (
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z" />
  ),
  pin: (
    <>
      <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  external: (
    <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
  ),
  close: <path d="M18 6 6 18M6 6l12 12" />,
  instagram: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <path d="M17.5 6.5h.01" />
    </>
  ),
};

function Icon({ name, className = "h-4 w-4" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={`shrink-0 ${className}`}
    >
      {ICONS[name]}
    </svg>
  );
}

// Filled heart (an SVG so it scales properly, unlike the ♥ glyph)
function HeartIcon({ className = "h-5 w-5" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      role="img"
      aria-label="love"
      fill="currentColor"
      className={className}
    >
      <path d="M12 21s-7.6-4.7-9.6-9.4C1 8.2 2.9 4.8 6.3 4.8c2 0 3.7 1.1 5.7 3.4 2-2.3 3.7-3.4 5.7-3.4 3.4 0 5.3 3.4 3.9 6.8C19.6 16.3 12 21 12 21Z" />
    </svg>
  );
}

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600";
const focusRingLight =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

// Footer column links: quiet by default, brand blue on hover
const linkClass = `inline-block rounded-sm py-1 font-bitter text-[14px] leading-6 text-neutral-700 decoration-blue-300 underline-offset-4 transition-colors duration-200 hover:text-blue-700 hover:underline motion-reduce:transition-none ${focusRing}`;

// Bottom bar legal links: black text, soft blue wash on hover
const legalLinkClass = `inline-flex items-center rounded-full px-3 py-1 font-bitter text-[13px] font-semibold leading-5 text-black transition-colors duration-200 hover:bg-blue-50 hover:text-blue-700 motion-reduce:transition-none ${focusRing}`;

// Sentence-case column heading, no ornament
function ColumnHeading({ id, children }) {
  return (
    <h3
      id={id}
      className="mb-2.5 font-frank text-[17px] font-bold leading-tight text-neutral-900"
    >
      {children}
    </h3>
  );
}

function PaymentBadge({ label, glyph }) {
  const base =
    "flex h-8 items-center justify-center gap-1.5 rounded-lg border border-black/[0.08] bg-white px-2.5";

  let visual = null;

  switch (glyph) {
    case "visa":
      visual = (
        <span className="text-[13px] font-extrabold italic tracking-tight text-[#1A1F71]">
          VISA
        </span>
      );
      break;
    case "mastercard":
      visual = (
        <>
          <svg viewBox="0 0 32 20" aria-hidden="true" className="h-4 w-auto">
            <circle cx="11" cy="10" r="9" fill="#EB001B" />
            <circle cx="21" cy="10" r="9" fill="#F79E1B" />
            <path
              d="M16 2.52A9 9 0 0 1 16 17.48A9 9 0 0 1 16 2.52z"
              fill="#FF5F00"
            />
          </svg>
          <span className="hidden text-[11px] font-bold text-neutral-700 sm:inline">
            Mastercard
          </span>
        </>
      );
      break;
    case "applepay":
      visual = (
        <>
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="h-4 w-4 text-black"
            fill="currentColor"
          >
            <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
          </svg>
          <span className="text-[13px] font-semibold leading-none text-black">
            Pay
          </span>
        </>
      );
      break;
    case "googlepay":
      visual = (
        <>
          <span className="text-[13px] font-bold leading-none">
            <span className="text-[#4285F4]">G</span>
            <span className="text-[#EA4335]">o</span>
            <span className="text-[#FBBC05]">o</span>
            <span className="text-[#4285F4]">g</span>
            <span className="text-[#34A853]">l</span>
            <span className="text-[#EA4335]">e</span>
          </span>
          <span className="text-[12px] font-semibold text-neutral-600">
            Pay
          </span>
        </>
      );
      break;
    case "qr":
      visual = (
        <>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="h-4 w-4 text-neutral-700"
          >
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <path d="M14 14h3v3h-3zM20 14v.01M14 20h.01M17 20h4v-3" />
          </svg>
          <span className="text-[11px] font-bold text-neutral-700">QR</span>
        </>
      );
      break;
    default:
      return null;
  }

  return (
    <li className={base}>
      <span className="sr-only">{label}</span>
      <span aria-hidden="true" className="flex items-center gap-1.5">
        {visual}
      </span>
    </li>
  );
}

// One row of the contact card (icon + small label + value).
// The parent needs the `group` class for the hover fill.
function InfoRow({ icon, label, children }) {
  return (
    <div className="flex items-center gap-3">
      <span
        aria-hidden="true"
        className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-blue-50 text-blue-600 transition-colors duration-200 group-hover:bg-blue-600 group-hover:text-white motion-reduce:transition-none"
      >
        <Icon name={icon} className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="font-bitter text-[11px] font-medium leading-none text-neutral-500">
          {label}
        </p>
        <div className="mt-1 font-bitter text-[13px] font-semibold leading-snug text-neutral-900">
          {children}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// INSTAGRAM QR DIALOG
// ============================================================

function InstagramDialog({ onClose }) {
  const dialogRef = useRef(null);
  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.lenis?.stop?.();

    const onKey = (e) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab" || !dialog) return;

      const focusable = dialog.querySelectorAll(
        "a[href], button:not([disabled])",
      );
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.lenis?.start?.();
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  // z-index sits above the fixed navbar (z-[9990]) and its mobile sidebar.
  return createPortal(
    <div
      className="sf-fade fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        onClick={(e) => e.stopPropagation()}
        className="sf-pop relative flex w-full max-w-sm flex-col items-center rounded-[2rem] bg-white p-6 shadow-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          autoFocus
          aria-label="Close dialog"
          className={`absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-neutral-100 text-neutral-600 transition hover:bg-neutral-200 ${focusRing}`}
        >
          <Icon name="close" className="h-4 w-4" />
        </button>

        <div className="mt-2 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white shadow-lg">
          <Icon name="instagram" className="h-7 w-7" />
        </div>

        <h2
          id={titleId}
          className="mt-4 text-center font-frank text-2xl font-bold text-neutral-950"
        >
          Follow us on Instagram
        </h2>
        <p
          id={descId}
          className="mt-1 text-center font-bitter text-sm text-neutral-600"
        >
          Scan the QR code with your phone camera to follow our latest
          adventures.
        </p>

        <div className="mt-6 w-full max-w-[240px] rounded-2xl border border-neutral-100 bg-neutral-50 p-4 shadow-inner">
          <img
            src={INSTAGRAM_QR}
            alt="QR code linking to the Cape Frontier Instagram profile"
            className="h-full w-full object-contain mix-blend-multiply"
          />
        </div>

        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={`mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 font-bitter text-sm font-bold text-white shadow-[0_8px_20px_rgba(37,99,235,0.24)] transition hover:bg-blue-700 active:scale-95 ${focusRing}`}
        >
          Open Instagram
          <Icon name="external" className="h-4 w-4" />
          <span className="sr-only">(opens in a new tab)</span>
        </a>
      </div>
    </div>,
    document.body,
  );
}

// ============================================================
// FOOTER
// ============================================================

function SiteFooter({
  showBanner = true,
  structuredData = true,
  className = "",
}) {
  const location = useLocation();
  const [qrOpen, setQrOpen] = useState(false);
  const qrTriggerRef = useRef(null);

  const openQr = useCallback(() => setQrOpen(true), []);
  const closeQr = useCallback(() => {
    setQrOpen(false);
    requestAnimationFrame(() => qrTriggerRef.current?.focus());
  }, []);

  const scrollWindowTo = (y) => {
    const top = Math.max(0, y);
    if (window.lenis) {
      window.lenis.scrollTo(top, { duration: 1, force: true });
      return;
    }
    window.scrollTo({ top, behavior: "smooth" });
  };

  const scrollToTop = () => scrollWindowTo(0);

  // Same-page section links scroll smoothly; from other pages the router
  // navigates and the home page reads location.state.scrollTo.
  const handleSection = (event, section) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }
    if (location.pathname !== "/") return;

    event.preventDefault();

    if (section === "top") {
      scrollToTop();
      return;
    }

    const el = document.getElementById(section);
    if (el) scrollWindowTo(el.getBoundingClientRect().top + window.scrollY);
  };

  const isCurrent = (item) => {
    if (!item.to || item.section) return false;
    if (item.to.includes("?") || item.to.includes("#")) return false;
    return location.pathname === item.to;
  };

  const renderLink = (item, cls = linkClass) => {
    if (item.href) {
      return (
        <a
          href={item.href}
          className={`${cls} break-words`}
          {...(item.external
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
        >
          {item.label}
          {item.external && (
            <span className="sr-only"> (opens in a new tab)</span>
          )}
        </a>
      );
    }

    const to = item.section
      ? {
          pathname: item.to,
          hash: item.section === "top" ? "" : `#${item.section}`,
        }
      : item.to;

    return (
      <Link
        to={to}
        state={item.section ? { scrollTo: item.section } : undefined}
        onClick={
          item.section
            ? (event) => handleSection(event, item.section)
            : undefined
        }
        aria-current={isCurrent(item) ? "page" : undefined}
        className={cls}
      >
        {item.label}
      </Link>
    );
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    name: BRAND_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}${LOGO_SRC}`,
    email: CONTACT_EMAIL,
    telephone: CONTACT_TEL,
    areaServed: "Cape Town, Western Cape, South Africa",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Cape Town",
      addressRegion: "Western Cape",
      addressCountry: "ZA",
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: CONTACT_EMAIL,
      telephone: CONTACT_TEL,
      availableLanguage: ["English"],
    },
    ...(INSTAGRAM_URL.replace(/\/$/, "") !== "https://www.instagram.com"
      ? { sameAs: [INSTAGRAM_URL] }
      : {}),
  };

  return (
    <>
      {/* Only the dialog animates now. Names are prefixed "sf-" so they
          can't collide with the navbar or page styles. */}
      <style>{`
        @media (prefers-reduced-motion: no-preference) {
          @keyframes sf-fade { from { opacity: 0; } to { opacity: 1; } }
          @keyframes sf-pop { from { opacity: 0; transform: translateY(10px) scale(.97); } to { opacity: 1; transform: none; } }
          .sf-fade { animation: sf-fade .2s ease-out both; }
          .sf-pop { animation: sf-pop .25s cubic-bezier(.2,.7,.2,1) both; }
        }
      `}</style>

      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />
      )}

      {/* scroll-mt keeps the footer clear of the fixed navbar when it is
          scrolled or linked to. Nothing inside uses a z-index above the page
          content, so it always sits beneath the navbar layers. */}
      <footer
        id="site-footer"
        aria-labelledby="site-footer-heading"
        className={`w-full max-w-full shrink-0 scroll-mt-28 ${className}`}
      >
        <h2 id="site-footer-heading" className="sr-only">
          {BRAND_NAME} site footer
        </h2>

        {/* Warm paper surface, hairline border, soft shadow */}
        <div className="w-full max-w-full overflow-hidden rounded-3xl border border-black/[0.07] bg-[#F5F4ED] shadow-[0_12px_40px_rgba(7,31,79,0.08)] sm:rounded-[2rem]">
          {/* ── BRAND PANEL (inset, so it reads as a card on paper) ── */}
          {showBanner && (
            <div className="p-2.5 sm:p-3">
              <section
                aria-labelledby="footer-brand-heading"
                className="relative isolate overflow-hidden rounded-[1.4rem] bg-blue-950 px-5 py-6 sm:rounded-3xl sm:px-8 lg:px-10"
              >
                <img
                  src={footerBgImage}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  decoding="async"
                  className="pointer-events-none absolute inset-0 -z-20 h-full w-full object-cover"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 -z-10 bg-blue-950/80"
                />

                <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
                  <div className="min-w-0">
                    <Link
                      to="/"
                      aria-label={`${BRAND_NAME} home`}
                      onClick={(event) => handleSection(event, "top")}
                      className={`inline-block rounded-md ${focusRingLight}`}
                    >
                      <img
                        src={LOGO_SRC}
                        alt={BRAND_NAME}
                        loading="lazy"
                        decoding="async"
                        className="h-11 w-auto object-contain object-left brightness-0 invert sm:h-12"
                      />
                    </Link>

                    <p
                      id="footer-brand-heading"
                      className="mt-4 font-frank text-2xl font-bold leading-tight text-white sm:text-3xl lg:text-[2.1rem]"
                    >
                      Explore beyond the ordinary.
                    </p>

                    <p className="mt-2 max-w-xl font-bitter text-sm leading-relaxed text-blue-100/90 sm:text-[15px]">
                      {BLURB}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center lg:shrink-0">
                    <Link
                      to="/tours"
                      className={`group inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-white px-6 py-2.5 font-bitter text-sm font-bold text-blue-950 transition duration-200 hover:bg-blue-50 active:scale-[0.98] motion-reduce:transition-none ${focusRingLight}`}
                    >
                      Browse tours
                      <Icon
                        name="arrow"
                        className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none"
                      />
                    </Link>

                    <Link
                      to="/policies"
                      className={`inline-flex min-h-11 items-center justify-center rounded-full border border-white/30 px-6 py-2.5 font-bitter text-sm font-bold text-white transition duration-200 hover:bg-white/10 active:scale-[0.98] motion-reduce:transition-none ${focusRingLight}`}
                    >
                      How booking works
                    </Link>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* ── LINK COLUMNS + CONTACT & FOLLOW ──────────────── */}
          <div
            className={`grid grid-cols-2 gap-x-6 gap-y-6 px-5 pb-6 sm:px-8 lg:grid-cols-[0.6fr_1.1fr_2fr] lg:gap-x-8 lg:px-10 ${
              showBanner ? "pt-3" : "pt-7"
            }`}
          >
            <nav aria-labelledby="footer-tours" className="min-w-0">
              <ColumnHeading id="footer-tours">Tours</ColumnHeading>
              <ul>
                {tourLinks.map((item) => (
                  <li key={item.label}>{renderLink(item)}</li>
                ))}
              </ul>
            </nav>

            <nav aria-labelledby="footer-policies" className="min-w-0">
              <ColumnHeading id="footer-policies">
                Before you book
              </ColumnHeading>
              <ul className="lg:grid lg:grid-flow-col lg:grid-cols-2 lg:grid-rows-4 lg:gap-x-5">
                {policyLinks.map((item) => (
                  <li key={item.label}>{renderLink(item)}</li>
                ))}
              </ul>
            </nav>

            {/* Contact + Instagram in one card */}
            <section
              aria-labelledby="footer-contact"
              className="col-span-2 min-w-0 lg:col-span-1"
            >
              <ColumnHeading id="footer-contact">
                Contact &amp; follow
              </ColumnHeading>

              <div className="flex flex-col gap-4 rounded-2xl border border-black/[0.07] bg-white p-4 sm:flex-row sm:items-center sm:gap-5">
                <address className="min-w-0 flex-1 space-y-2.5 not-italic">
                  <a
                    href={`mailto:${CONTACT_EMAIL}`}
                    className={`group block rounded-lg ${focusRing}`}
                  >
                    <InfoRow icon="mail" label="Email">
                      <span className="[overflow-wrap:anywhere] decoration-blue-300 underline-offset-4 group-hover:underline">
                        {CONTACT_EMAIL}
                      </span>
                    </InfoRow>
                  </a>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                    <a
                      href={`tel:${CONTACT_TEL}`}
                      className={`group block min-w-0 rounded-lg ${focusRing}`}
                    >
                      <InfoRow icon="phone" label="Phone">
                        <span className="decoration-blue-300 underline-offset-4 group-hover:underline">
                          {CONTACT_NUMBER}
                        </span>
                      </InfoRow>
                    </a>

                    <a
                      href={WHATSAPP_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full border border-green-600/25 bg-green-50 px-2.5 font-bitter text-xs font-semibold text-green-900 transition-colors duration-200 hover:bg-green-100 motion-reduce:transition-none ${focusRing}`}
                    >
                      <WhatsAppIcon className="h-3.5 w-3.5 text-green-600" />
                      WhatsApp
                      <span className="sr-only">(opens in a new tab)</span>
                    </a>
                  </div>

                  <div className="group">
                    <InfoRow icon="pin" label="Based in">
                      {LOCATION_TEXT}
                    </InfoRow>
                  </div>
                </address>

                <span
                  aria-hidden="true"
                  className="hidden w-px self-stretch bg-black/[0.07] sm:block"
                />

                <button
                  ref={qrTriggerRef}
                  type="button"
                  onClick={openQr}
                  aria-haspopup="dialog"
                  className={`group flex shrink-0 items-center gap-3 rounded-xl text-left sm:w-[104px] sm:flex-col sm:gap-1.5 sm:text-center ${focusRing}`}
                >
                  <img
                    src={INSTAGRAM_QR}
                    alt=""
                    loading="lazy"
                    className="h-20 w-20 shrink-0 rounded-lg bg-white object-contain p-1 ring-1 ring-black/[0.07] transition duration-200 group-hover:ring-blue-300 sm:h-24 sm:w-24 motion-reduce:transition-none"
                  />
                  <span className="min-w-0">
                    <span className="flex items-center gap-1.5 font-bitter text-xs font-semibold text-neutral-800 sm:justify-center">
                      <Icon name="instagram" className="h-3.5 w-3.5 text-blue-600" />
                      Instagram
                    </span>
                    <span className="mt-1 block font-bitter text-xs leading-snug text-neutral-600 sm:sr-only">
                      Scan or tap to follow our tours and guest moments.
                    </span>
                  </span>
                </button>
              </div>
            </section>
          </div>

          {/* ── AFFILIATIONS + PAYMENTS ──────────────────────── */}
          <div className="border-t border-black/[0.07] px-5 py-3.5 sm:px-8 lg:px-10">
            <div className="flex flex-col items-center gap-4 lg:flex-row lg:justify-between lg:gap-8">
              <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-5">
                <p className="shrink-0 font-bitter text-xs font-medium text-neutral-500">
                  Proudly affiliated with
                </p>

                <ul
                  aria-label="Affiliations"
                  className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3"
                >
                  {affiliations.map(({ label, logo, href }) => {
                    const img = (
                      <img
                        src={logo}
                        alt={label}
                        loading="lazy"
                        decoding="async"
                        className="h-8 w-auto max-w-[110px] object-contain sm:h-9 sm:max-w-[130px]"
                      />
                    );

                    return (
                      <li key={label}>
                        {href ? (
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`block rounded-md transition hover:opacity-75 ${focusRing}`}
                          >
                            {img}
                            <span className="sr-only">
                              (opens in a new tab)
                            </span>
                          </a>
                        ) : (
                          img
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
                <p className="shrink-0 font-bitter text-xs font-medium text-neutral-500">
                  Secure payments
                </p>

                <ul
                  aria-label="Accepted payment methods"
                  className="flex flex-wrap items-center justify-center gap-2"
                >
                  {paymentMethods.map((method) => (
                    <PaymentBadge key={method.glyph} {...method} />
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* ── BOTTOM BAR: white, black text, one blue rule ──── */}
          <div className="border-t-2 border-blue-600 bg-white px-5 py-3.5 text-black sm:px-8 lg:px-10">
            <div className="flex flex-col items-center gap-3 lg:flex-row lg:justify-between lg:gap-6">
              <div className="flex min-w-0 items-center gap-3">
                {/* Padded tile + object-contain so the flag is never cropped */}
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#F5F4ED] ring-1 ring-black/[0.07]">
                  <img
                    src="/icons/ZAR.png"
                    alt={CURRENCY_ALT}
                    className="h-7 w-7 object-contain"
                  />
                </span>

                <div className="min-w-0 font-bitter">
                  <p className="text-sm font-bold text-black">
                    © {new Date().getFullYear()} {BRAND_NAME}
                  </p>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-1 text-xs text-black sm:text-[13px]">
                    Designed and built with
                    <HeartIcon className="h-[18px] w-[18px] shrink-0 text-rose-500 sm:h-5 sm:w-5" />
                    by
                    <span className="font-bold text-blue-700">
                      F. Viljoen &amp; FO Creative
                    </span>
                  </p>
                </div>
              </div>

              <nav aria-label="Legal">
                <ul className="flex flex-wrap items-center justify-center gap-1 lg:justify-end">
                  {legalLinks.map((item) => (
                    <li key={item.label}>
                      {renderLink(item, legalLinkClass)}
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </footer>

      {qrOpen && typeof document !== "undefined" && (
        <InstagramDialog onClose={closeQr} />
      )}
    </>
  );
}

export default SiteFooter;