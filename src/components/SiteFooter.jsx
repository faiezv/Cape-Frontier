import React, { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { WhatsAppIcon, WHATSAPP_URL } from './WhatsApp'
import { resolveImage } from '../utils/ImageLoader.js'

// ─── Config ──────────────────────────────────────────────────────────────────

const SITE_URL = 'https://cape-frontier.co.za' // swap to .com if that is the live domain
const SITEMAP_URL = `${SITE_URL}/sitemap.xml`

const CONTACT_EMAIL = 'admin@cape-frontier.co.za'
const CONTACT_NUMBER = '(+27)72 264 7284'
const CONTACT_TEL = '+27722647284'

// Background photo for the blue copyright bar (dimmed by an overlay below).
const footerBgImage = resolveImage(
  '/src/assets/images/content/random/siteFooter.webp'
)

// Same section ids the Navbar scrolls to on the home page.
const sectionIdMap = {
  About: 'about',
  Stories: 'stories',
  Gallery: 'gallery',
  FAQ: 'faq',
}

const exploreLinks = [
  { label: 'Home', target: 'Home' },
  { label: 'About', target: 'About' },
  { label: 'Stories', target: 'Stories' },
  { label: 'Gallery', target: 'Gallery' },
  { label: 'Tours', target: '/tours' },
  { label: 'FAQ', target: 'FAQ' },
]

const tourLinks = [
  { label: 'Adrenaline', target: '/tours' },
  { label: 'Hiking', target: '/tours' },
  { label: 'Historical', target: '/tours' },
  { label: 'Packages', target: '/tours' },
  { label: 'All tours', target: '/tours' },
]

const policyLinks = [
  { label: 'Booking policy', target: '/policies#booking-policy' },
  { label: 'Pickup policy', target: '/policies#pickup-policy' },
  { label: 'Payment flow', target: '/policies#payment-policy' },
  { label: 'Cancellations', target: '/policies#cancellation-policy' },
  { label: 'Rescheduling', target: '/policies#reschedule-policy' },
  { label: 'Private tours', target: '/policies#private-tour-policy' },
  { label: 'Vehicles', target: '/policies#vehicle-policy' },
]

// `target` navigates inside the app, `href` opens a normal link.
const informationLinks = [
  { label: 'Privacy policy', target: '/policies' },
  { label: 'Terms & conditions', target: '/policies' },
  { label: 'Pickup information', target: '/policies#pickup-policy' },
  { label: 'Tour availability', target: '/tours' },
  {
    label: 'Accessibility',
    href: `mailto:${CONTACT_EMAIL}?subject=Accessibility%20request`,
  },
  { label: 'Sitemap', href: SITEMAP_URL, external: true },
]

// Set `href` to link a logo through to the partner's site.
const affiliations = [
  {
    label: 'The Capetonian',
    logo: '/assets/brand/logo-the-capetonian.webp',
    href: null,
  },
  {
    label: 'Love Cape Town',
    logo: '/assets/brand/logo-love-ct-blue.webp',
    href: null,
  },
]

// Only methods with enabled: true are shown.
// EFT and Capitec Pay need extra KYC review on Paystack before they work,
// so flip them to true once Paystack has activated them.
//
// Every badge renders on its own (inline glyph + text), so nothing depends on
// image files. To use an official logo instead, set `icon` to its path
// (e.g. '/icons/payments/visa.svg'); if that file is missing, the badge
// falls back to the inline version automatically.
const paymentMethods = [
  { label: 'Visa', glyph: 'visa', icon: null, enabled: true },
  { label: 'Mastercard', glyph: 'mastercard', icon: null, enabled: true },
  { label: 'Apple Pay', glyph: 'applepay', icon: null, enabled: true },
  { label: 'Google Pay', glyph: 'googlepay', icon: null, enabled: true },
  { label: 'QR', glyph: 'qr', icon: null, enabled: true },
  { label: 'EFT', glyph: 'bank', icon: null, enabled: false },
  { label: 'Capitec Pay', glyph: null, icon: null, enabled: false },
]

// ─── Small pieces ────────────────────────────────────────────────────────────

const glyphProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  className: 'h-4 w-4 shrink-0',
}

function Glyph({ name }) {
  switch (name) {
    case 'mastercard':
      return (
        <svg viewBox="0 0 32 20" aria-hidden="true" className="h-4 w-auto shrink-0">
          <circle cx="11" cy="10" r="9" fill="#EB001B" />
          <circle cx="21" cy="10" r="9" fill="#F79E1B" />
          <path d="M16 2.52A9 9 0 0 1 16 17.48A9 9 0 0 1 16 2.52z" fill="#FF5F00" />
        </svg>
      )
    case 'qr':
      return (
        <svg {...glyphProps}>
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <path d="M14 14h3v3h-3zM20 14v.01M14 20h.01M17 20h4v-3" />
        </svg>
      )
    case 'bank':
      return (
        <svg {...glyphProps}>
          <path d="M3 9l9-5 9 5M5 10v8M10 10v8M14 10v8M19 10v8M3 20h18" />
        </svg>
      )
    default:
      return null
  }
}

function PaymentBadge({ label, glyph, icon }) {
  const imgRef = useRef(null)
  const [failed, setFailed] = useState(!icon)

  // With prerendered pages the image can fail before React attaches onError,
  // so also check once on mount.
  useEffect(() => {
    const img = imgRef.current
    if (img && img.complete && img.naturalWidth === 0) setFailed(true)
  }, [])

  if (failed || !icon) {
    if (glyph === 'applepay') {
      return (
        <li
          aria-label="Apple Pay"
          className="flex h-8 items-center justify-center gap-1 rounded-md border border-black/15 bg-white px-2.5"
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            focusable="false"
            className="h-4 w-4 shrink-0 text-black"
            fill="currentColor"
          >
            <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
          </svg>
          <span className="text-[13px] font-semibold leading-none tracking-tight text-black">
            Pay
          </span>
        </li>
      )
    }

    if (glyph === 'googlepay') {
      return (
        <li
          aria-label="Google Pay"
          className="flex h-8 items-center justify-center gap-1 rounded-md border border-black/15 bg-white px-3"
        >
          <span className="text-[13px] font-bold leading-none">
            <span className="text-[#4285F4]">G</span>
            <span className="text-[#EA4335]">o</span>
            <span className="text-[#FBBC05]">o</span>
            <span className="text-[#4285F4]">g</span>
            <span className="text-[#34A853]">l</span>
            <span className="text-[#EA4335]">e</span>
          </span>
          <span className="text-[12px] font-semibold text-neutral-600">Pay</span>
        </li>
      )
    }
  }

  const textClass =
    glyph === 'visa'
      ? 'text-[12px] font-extrabold italic tracking-tight text-[#1A1F71]'
      : 'text-[11px] font-bold text-neutral-700'

  return (
    <li className="flex h-8 items-center justify-center gap-1.5 rounded-md border border-black/10 bg-white px-2.5 text-neutral-700">
      {!failed && icon ? (
        <img
          ref={imgRef}
          src={icon}
          alt={label}
          loading="lazy"
          onError={() => setFailed(true)}
          className="h-4 w-auto max-w-[3.5rem] object-contain"
        />
      ) : (
        <>
          <Glyph name={glyph} />
          <span className={`whitespace-nowrap ${textClass}`}>
            {glyph === 'visa' ? 'VISA' : label}
          </span>
        </>
      )}
    </li>
  )
}

// Shared look for every footer link: grey, blue + underline on hover.
const linkClass =
  'text-neutral-600 underline-offset-4 decoration-blue-600/70 transition hover:text-[#071f4f] hover:underline focus-visible:underline focus-visible:outline-none'

function ColumnHeading({ children }) {
  return (
    <p className="mb-3 text-[10px] font-black uppercase tracking-[0.22em] text-blue-500">
      {children}
    </p>
  )
}

// ─── Footer ──────────────────────────────────────────────────────────────────

/**
 * showDetails: the big top section (brand, navigation, tours, policies,
 * contact). Pass `showDetails={false}` on pages that already show their own
 * contact block (e.g. the Contact page) to keep only the bottom bars.
 */
function SiteFooter({ showDetails = true }) {
  const navigate = useNavigate()
  const location = useLocation()

  const scrollWindowTo = (y) => {
    if (window.lenis) {
      window.lenis.scrollTo(Math.max(0, y), { duration: 1, force: true })
      return
    }
    window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' })
  }

  const scrollToTop = () => scrollWindowTo(0)

  // Same rules as the Navbar: paths navigate, section names scroll on the
  // home page (or go home first and ask it to scroll via router state).
  const goTo = (target, event) => {
    event?.preventDefault?.()
    if (!target) return

    if (target.startsWith('/')) {
      navigate(target)
      return
    }

    const sectionId = target === 'Home' ? 'top' : sectionIdMap[target]
    if (!sectionId) return

    if (location.pathname !== '/') {
      navigate('/', { state: { scrollTo: sectionId } })
      return
    }

    if (sectionId === 'top') {
      scrollToTop()
      return
    }

    const el = document.getElementById(sectionId)
    if (el) scrollWindowTo(el.getBoundingClientRect().top + window.scrollY)
  }

  const renderLink = (item) => {
    if (item.href) {
      return (
        <a
          href={item.href}
          {...(item.external
            ? { target: '_blank', rel: 'noopener noreferrer' }
            : {})}
          className={linkClass}
        >
          {item.label}
        </a>
      )
    }

    return (
      <button
        type="button"
        onClick={(event) => goTo(item.target, event)}
        className={`${linkClass} text-left`}
      >
        {item.label}
      </button>
    )
  }

  return (
    <footer className="shrink-0">
      <div className="overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/82 shadow-[0_20px_60px_rgba(7,31,79,0.10)] backdrop-blur-xl">
        {/* Brand, navigation, tours, policies, contact */}
        {showDetails && (
          <div className="px-4 py-8 sm:px-6 sm:py-10">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-[1.35fr_0.8fr_0.9fr_1fr_1.3fr] lg:gap-10">
              {/* Brand */}
              <div className="sm:col-span-2 lg:col-span-1">
                <img
                  src="/assets/brand/logo-cf.webp"
                  alt="Cape Frontier Travel & Tours"
                  loading="lazy"
                  className="h-16 w-auto object-contain object-left sm:h-20"
                />

                <p className="mt-3 max-w-xs font-bitter text-sm leading-6 text-neutral-600">
                  Guided Cape Town routes, local pickup support and manual
                  booking confirmation. Choose your tour, confirm your group,
                  pay online, then receive confirmation.
                </p>
              </div>

              {/* Explore */}
              <nav aria-label="Explore">
                <ColumnHeading>Explore</ColumnHeading>
                <ul className="space-y-2 text-sm">
                  {exploreLinks.map((item) => (
                    <li key={item.label}>{renderLink(item)}</li>
                  ))}
                </ul>
              </nav>

              {/* Tours */}
              <nav aria-label="Tours">
                <ColumnHeading>Tours</ColumnHeading>
                <ul className="space-y-2 text-sm">
                  {tourLinks.map((item) => (
                    <li key={item.label}>{renderLink(item)}</li>
                  ))}
                </ul>
              </nav>

              {/* Policies */}
              <nav aria-label="Policies">
                <ColumnHeading>Before you book</ColumnHeading>
                <ul className="space-y-2 text-sm">
                  {policyLinks.map((item) => (
                    <li key={item.label}>{renderLink(item)}</li>
                  ))}
                </ul>
              </nav>

              {/* Contact */}
              <div className="sm:col-span-2 lg:col-span-1">
                <ColumnHeading>Contact</ColumnHeading>

                <ul className="space-y-3 text-sm">
                  <li>
                    <a
                      href={`mailto:${CONTACT_EMAIL}`}
                      className={`${linkClass} break-words font-semibold text-[#071f4f]`}
                    >
                      {CONTACT_EMAIL}
                    </a>
                  </li>

                  <li>
                    <a
                      href={`tel:${CONTACT_TEL}`}
                      className={`${linkClass} font-semibold text-[#071f4f]`}
                    >
                      {CONTACT_NUMBER}
                    </a>
                    <p className="mt-0.5 text-xs text-neutral-500">
                      Booking and support
                    </p>
                  </li>

                  <li className="flex items-start gap-2 text-neutral-600">
                    <svg
                      className="mt-0.5 h-4 w-4 shrink-0 text-blue-500"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden="true"
                    >
                      <path d="M12 21s7-4.4 7-11a7 7 0 1 0-14 0c0 6.6 7 11 7 11Z" />
                      <circle cx="12" cy="10" r="2.5" />
                    </svg>
                    <span>Cape Town based, with local pickup support</span>
                  </li>
                </ul>

                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 text-sm font-bold text-[#06371d] shadow-[0_10px_24px_rgba(37,211,102,0.30)] transition hover:-translate-y-0.5 hover:bg-[#1ebe5b] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-green-300"
                >
                  <WhatsAppIcon className="h-5 w-5 text-white" />
                  Chat on WhatsApp
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Information links + sitemap */}
        <div
          className={`px-4 py-4 sm:px-6 ${
            showDetails ? 'border-t border-black/5' : ''
          }`}
        >
          <ul className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs sm:justify-end sm:text-sm">
            {informationLinks.map((item, index) => (
              <React.Fragment key={item.label}>
                {index > 0 && (
                  <li
                    aria-hidden="true"
                    className="hidden text-black/20 sm:inline"
                  >
                    |
                  </li>
                )}

                <li>{renderLink(item)}</li>
              </React.Fragment>
            ))}
          </ul>
        </div>

        {/* Affiliations + accepted payments */}
        <div className="border-t border-black/5 px-4 py-5 sm:px-6">
          <div className="flex flex-col items-center gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-5">
              <p className="text-xs font-semibold text-neutral-500">
                Proudly affiliated with
              </p>

              <ul
                aria-label="Affiliations"
                className="flex items-center justify-center gap-6"
              >
                {affiliations.map(({ label, logo, href }) => {
                  const img = (
                    <img
                      src={logo}
                      alt={label}
                      loading="lazy"
                      className="h-9 w-auto object-contain sm:h-11"
                    />
                  )

                  return (
                    <li key={label}>
                      {href ? (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={label}
                          className="block transition hover:opacity-80"
                        >
                          {img}
                        </a>
                      ) : (
                        img
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>

            <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
              <p className="text-xs font-semibold text-neutral-500">
                We accept
              </p>

              <ul
                aria-label="Accepted payment methods"
                className="flex flex-wrap items-center justify-center gap-2"
              >
                {paymentMethods
                  .filter((method) => method.enabled)
                  .map((method) => (
                    <PaymentBadge key={method.label} {...method} />
                  ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="relative isolate overflow-hidden border-t border-black/5 bg-blue-900 px-4 py-4 sm:px-6">
          {/* Dimmed background image */}
          <img
            src={footerBgImage}
            alt=""
            aria-hidden="true"
            loading="lazy"
            className="pointer-events-none absolute inset-0 -z-20 h-full w-full object-cover"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 bg-blue-950/25"
          />

          <div className="relative flex flex-col gap-4 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
            <div className="flex items-center justify-center gap-3 sm:justify-start">
              <img
                src="/icons/ZAR.png"
                alt="South African Rand"
                className="h-9 w-9 shrink-0 rounded-full border border-white/10 object-cover shadow-[0_6px_18px_rgba(0,0,0,0.18)]"
              />

              <div>
                <p className="text-sm font-semibold text-white">
                  © {new Date().getFullYear()} Cape Frontier Travel & Tours
                </p>

                <p className="mt-1 text-sm text-white/80">
                  Designed and built with <b>{'<3'}</b> by{' '}
                  <span className="font-semibold text-white/85">
                    F. Viljoen & FO Creative
                  </span>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={scrollToTop}
              aria-label="Back to top"
              className="group inline-flex items-center justify-center gap-2 self-center rounded-full border border-white/20 px-4 py-2 text-xs font-bold text-white/85 transition hover:-translate-y-0.5 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 sm:self-auto"
            >
              Back to top
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className="h-3.5 w-3.5 transition group-hover:-translate-y-0.5"
              >
                <path d="M12 19V5M5 12l7-7 7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default SiteFooter