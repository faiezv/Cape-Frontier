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
// Point this at the real Instagram profile; the QR image is the one the Contact page used.
const INSTAGRAM_URL = 'https://www.instagram.com/'
const INSTAGRAM_QR = '/assets/brand/instagram.png'

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
  { label: 'Rescheduling', mobileHidden: true, target: '/policies#reschedule-policy' },
  { label: 'Private tours', mobileHidden: true, target: '/policies#private-tour-policy' },
  { label: 'Vehicles', mobileHidden: true, target: '/policies#vehicle-policy' },
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

// Gmail logo (multi-colour). Aspect ratio 256:193.
const GmailIcon = ({ className = 'h-3.5 w-[18.5px]' }) => (
  <svg
    viewBox="0 0 256 193"
    aria-hidden="true"
    focusable="false"
    className={className}
  >
    <path fill="#4285F4" d="M58.182 192.05V93.14L27.507 65.077 0 49.504v125.091c0 9.658 7.825 17.455 17.455 17.455h40.727Z" />
    <path fill="#34A853" d="M197.818 192.05h40.727c9.659 0 17.455-7.826 17.455-17.455V49.505l-31.156 17.837-27.026 25.798v98.91Z" />
    <path fill="#EA4335" d="m58.182 93.14-4.174-38.647 4.174-36.989L128 69.868l69.818-52.364 4.67 34.992-4.67 40.644L128 145.504 58.182 93.14Z" />
    <path fill="#FBBC04" d="M197.818 17.504V93.14L256 49.504V26.231c0-21.585-24.64-33.89-41.89-20.945l-16.292 12.218Z" />
    <path fill="#C5221F" d="m0 49.504 26.759 20.07L58.182 93.14V17.504L41.89 5.286C24.61-7.66 0 4.646 0 26.23v23.273Z" />
  </svg>
)

// Shared look for every footer link: grey, blue + underline on hover.
const linkClass =
  'text-neutral-600 underline-offset-4 decoration-blue-600/70 transition hover:text-[#071f4f] hover:underline focus-visible:underline focus-visible:outline-none'

function ColumnHeading({ children }) {
  return (
    <div className="mb-4">
      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-500">
        {children}
      </p>
      <span
        aria-hidden="true"
        className="mt-2 block h-0.5 w-6 rounded-full bg-blue-500/40"
      />
    </div>
  )
}

// ─── Footer ──────────────────────────────────────────────────────────────────

/**
 * showDetails: the big top section (brand, navigation, tours, policies,
 * contact). Pass `showDetails={false}` on pages that already show their own
 * contact block (e.g. the Contact page) to keep only the bottom bars.
 */
function SiteFooter({ showDetails = true, showBackToTop }) {
  const navigate = useNavigate()
  const location = useLocation()

  // Brand block, contact details and the Instagram QR only show on /tours.
  const isTours = /^\/tours\/?$/.test(location.pathname)

  // Back-to-top is visible on every page. Pass showBackToTop={false} to hide it.
  const backToTopVisible = showBackToTop ?? true

  // Lean footer everywhere except /tours: one navigation row, no columns.
  const showNav = showDetails && !isTours
  const legalLinks = showNav
    ? informationLinks.filter(
      (item) => !['Pickup information', 'Tour availability'].includes(item.label)
    )
    : informationLinks

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

  // Compact action button used in the mobile contact row
  const actionBtn =
    'flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-black/10 bg-white px-2 text-xs font-bold text-[#071f4f] transition active:scale-95'

  return (
    <footer className="shrink-0">
      <div className="overflow-hidden rounded-3xl border border-white/70 bg-white/85 shadow-[0_20px_60px_rgba(7,31,79,0.10)] backdrop-blur-xl sm:rounded-[1.75rem]">
        {/* Navigation columns (+ brand, contact and QR on /tours only) */}
        {showDetails && isTours && (
          <div className="px-5 pb-6 pt-6 sm:px-8 sm:py-10">
            <div
              className="grid grid-cols-2 gap-x-6 gap-y-7 sm:grid-cols-3 sm:gap-x-8 sm:gap-y-9 lg:grid-cols-[1.2fr_0.7fr_0.8fr_0.9fr_1.6fr] lg:gap-x-12"
            >
              {/* Brand: logo + one line on mobile, full block on larger screens */}
              {isTours && (
                <div className="col-span-2 flex items-center gap-3 sm:col-span-3 sm:block lg:col-span-1">
                  <img
                    src="/assets/brand/logo-cf.webp"
                    alt="Cape Frontier Travel & Tours"
                    loading="lazy"
                    className="h-12 w-auto shrink-0 object-contain object-left sm:h-20"
                  />

                  <p className="font-bitter text-xs leading-5 text-neutral-600 sm:mt-3 sm:max-w-xs sm:text-sm sm:leading-6">
                    <span className="sm:hidden">
                      Guided Cape Town routes with local pickup support.
                    </span>
                    <span className="hidden sm:inline">
                      Guided Cape Town routes, local pickup support and manual
                      booking confirmation. Choose your tour, confirm your
                      group, pay online, then receive confirmation.
                    </span>
                  </p>
                </div>
              )}

              {/* Explore */}
              <nav aria-label="Explore">
                <ColumnHeading>Explore</ColumnHeading>
                <ul className="space-y-2 text-sm">
                  {exploreLinks.map((item) => (
                    <li key={item.label}>{renderLink(item)}</li>
                  ))}
                </ul>
              </nav>

              {/* Tours (hidden on mobile: "Tours" in Explore covers it) */}
              <nav aria-label="Tours" className="hidden sm:block">
                <ColumnHeading>Tours</ColumnHeading>
                <ul className="space-y-2 text-sm">
                  {tourLinks.map((item) => (
                    <li key={item.label}>{renderLink(item)}</li>
                  ))}
                </ul>
              </nav>

              {/* Policies (shortened on mobile) */}
              <nav aria-label="Policies">
                <ColumnHeading>Before you book</ColumnHeading>
                <ul className="space-y-2 text-sm">
                  {policyLinks.map((item) => (
                    <li
                      key={item.label}
                      className={item.mobileHidden ? 'hidden sm:block' : undefined}
                    >
                      {renderLink(item)}
                    </li>
                  ))}
                  <li className="sm:hidden">
                    <button
                      type="button"
                      onClick={() => navigate('/policies')}
                      className="text-sm font-semibold text-blue-600 underline-offset-4 hover:underline"
                    >
                      All policies →
                    </button>
                  </li>
                </ul>
              </nav>

              {/* Contact + Instagram QR (/tours only) */}
              {isTours && (
                <div className="col-span-2 sm:col-span-3 lg:col-span-1">
                  <ColumnHeading>Contact</ColumnHeading>

                  {/* Mobile: three compact actions in one row */}
                  <div className="grid grid-cols-3 gap-2 sm:hidden">
                    <a href={`mailto:${CONTACT_EMAIL}`} className={actionBtn}>
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                        className="h-4 w-4 text-blue-600"
                      >
                        <rect x="3" y="5" width="18" height="14" rx="2" />
                        <path d="m3 7 9 6 9-6" />
                      </svg>
                      Email
                    </a>

                    <a href={`tel:${CONTACT_TEL}`} className={actionBtn}>
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                        className="h-4 w-4 text-blue-600"
                      >
                        <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z" />
                      </svg>
                      Call
                    </a>

                    <a
                      href={WHATSAPP_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl bg-[#25D366] px-2 text-xs font-bold text-[#06371d] transition active:scale-95"
                    >
                      <WhatsAppIcon className="h-4 w-4 text-white" />
                      WhatsApp
                    </a>
                  </div>

                  {/* sm and up */}
                  <div className="hidden sm:block">
                    <a
                      href={`mailto:${CONTACT_EMAIL}`}
                      className={`${linkClass} inline-flex items-center gap-2 break-words text-sm font-semibold text-[#071f4f]`}
                    >
                      <GmailIcon />
                      {CONTACT_EMAIL}
                    </a>

                    {/* Label swaps to the number on hover; the link still opens WhatsApp */}
                    <a
                      href={WHATSAPP_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Chat on WhatsApp"
                      className="group mt-4 flex min-h-[44px] w-fit items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 text-sm font-bold text-[#06371d] shadow-[0_10px_24px_rgba(37,211,102,0.30)] transition hover:-translate-y-0.5 hover:bg-[#1ebe5b] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-green-300"
                    >
                      <WhatsAppIcon className="h-5 w-5 shrink-0 text-white" />
                      <span className="inline-grid overflow-hidden">
                        <span className="col-start-1 row-start-1 transition-all duration-300 ease-out group-hover:-translate-y-full group-hover:opacity-0 group-focus-visible:-translate-y-full group-focus-visible:opacity-0">
                          Chat on WhatsApp
                        </span>
                        <span
                          aria-hidden="true"
                          className="col-start-1 row-start-1 translate-y-full whitespace-nowrap opacity-0 transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100"
                        >
                          {CONTACT_NUMBER}
                        </span>
                      </span>
                    </a>
                  </div>

                  {/* Instagram QR */}
                  <a
                    href={INSTAGRAM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Follow Cape Frontier on Instagram"
                    className="mt-4 flex w-full items-center gap-4 rounded-2xl border border-black/5 bg-white/70 p-3 shadow-[0_8px_24px_rgba(7,31,79,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(7,31,79,0.12)] sm:w-fit"
                  >
                    <img
                      src={INSTAGRAM_QR}
                      alt="Scan to follow Cape Frontier on Instagram"
                      loading="lazy"
                      className="h-28 w-28 shrink-0 rounded-lg object-contain sm:h-36 sm:w-36 lg:h-40 lg:w-40"
                    />
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">
                        Instagram
                      </p>
                      <p className="mt-1 text-xs font-semibold leading-4 text-[#071f4f]">
                        Scan to follow us
                      </p>
                    </div>
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Links: on /tours the columns above carry navigation, so this row is
            only the legal links. Everywhere else it is one clean row: site
            navigation on the left, legal links + sitemap on the right. */}
        <div
          className={`px-5 py-5 sm:px-8 sm:py-6 ${showDetails && isTours ? 'border-t border-black/5' : ''
            }`}
        >
          <div className="flex flex-col items-center gap-4 lg:flex-row lg:justify-between">
            {showNav && (
              <ul
                aria-label="Site navigation"
                className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-semibold"
              >
                {exploreLinks.map((item) => (
                  <li key={item.label}>{renderLink(item)}</li>
                ))}
              </ul>
            )}

            <ul
              aria-label="Legal"
              className={`flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-[11px] sm:text-xs ${showNav ? 'lg:justify-end' : 'w-full sm:justify-end'
                }`}
            >
              {legalLinks.map((item) => (
                <li key={item.label}>{renderLink(item)}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Affiliations + accepted payments */}
        <div className="border-t border-black/5 px-5 py-4 sm:px-8 sm:py-5">
          <div className="flex flex-col items-center gap-4 sm:gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 sm:gap-5">
              <p className="text-[11px] font-semibold text-neutral-500 sm:text-xs">
                Proudly affiliated with
              </p>

              <ul
                aria-label="Affiliations"
                className="flex items-center justify-center gap-5 sm:gap-6"
              >
                {affiliations.map(({ label, logo, href }) => {
                  const img = (
                    <img
                      src={logo}
                      alt={label}
                      loading="lazy"
                      className="h-8 w-auto object-contain sm:h-11"
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

            <div className="flex flex-col items-center gap-2 sm:flex-row sm:gap-4">
              <p className="text-[11px] font-semibold text-neutral-500 sm:text-xs">
                We accept
              </p>

              <ul
                aria-label="Accepted payment methods"
                className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2"
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
        <div className="relative isolate overflow-hidden border-t border-black/5 bg-blue-900 px-5 py-3 sm:px-8 sm:py-4">
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
            className="pointer-events-none absolute inset-0 -z-10 bg-blue-950/15"
          />

          {/* One row on every screen size: text left, back-to-top right */}
          <div className="relative flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <img
                src="/icons/ZAR.png"
                alt="South African Rand"
                className="h-8 w-8 shrink-0 rounded-full border border-white/10 object-cover shadow-[0_6px_18px_rgba(0,0,0,0.18)] sm:h-9 sm:w-9"
              />

              <div className="min-w-0">
                <p className="text-xs font-semibold text-white sm:text-sm">
                  © {new Date().getFullYear()} Cape Frontier Travel & Tours
                </p>

                <p className="mt-0.5 text-[11px] text-white/80 sm:mt-1 sm:text-sm">
                  Designed and built with <b>{'<3'}</b> by{' '}
                  <span className="font-semibold text-white/90">
                    F. Viljoen & FO Creative
                  </span>
                </p>
              </div>
            </div>

            {backToTopVisible && (
              <button
                type="button"
                onClick={scrollToTop}
                aria-label="Back to top"
                className="group inline-flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full border border-white/25 text-xs font-bold text-white/90 transition hover:-translate-y-0.5 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 sm:h-auto sm:w-auto sm:px-4 sm:py-2"
              >
                <span className="hidden sm:inline">Back to top</span>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  className="h-4 w-4 transition group-hover:-translate-y-0.5 sm:h-3.5 sm:w-3.5"
                >
                  <path d="M12 19V5M5 12l7-7 7 7" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </footer>
  )
}

export default SiteFooter
