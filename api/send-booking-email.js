import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const BRAND = {
  name: "Cape Frontier",
  fullName: "Cape Frontier Travel & Tours",
  website: process.env.BRAND_WEBSITE_URL || "https://preview.cape-frontier.co.za",
  logoUrl:
    process.env.BRAND_LOGO_URL ||
    "https://preview.cape-frontier.co.za/assets/brand/logo.png",
  primary: "#071f4f",
  greenSoft: "#dcfce7",
  greenBorder: "#bbf7d0",
  greenText: "#14532d",
  amberSoft: "#fff7ed",
  amberBorder: "#fed7aa",
  amberText: "#9a3412",
  bg: "#f6f8fb",
  text: "#111827",
  muted: "#64748b",
  border: "#e5e7eb",
};

const WHATSAPP_NUMBER =
  process.env.BRAND_WHATSAPP_NUMBER || "+27 00 000 0000";

const CONTACT_EMAIL =
  process.env.RESEND_REPLY_TO_EMAIL || "admin@cape-frontier.co.za";

const escapeHtml = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const clean = (value, fallback = "Not provided") => {
  if (value === undefined || value === null || value === "") return fallback;
  return escapeHtml(value);
};

const cleanArray = (value) => (Array.isArray(value) ? value.filter(Boolean) : []);

const yesNo = (value) => (value ? "Yes" : "No");

const formatCoords = (coords) => {
  if (!coords?.lat || !coords?.lng) return "Not provided";
  return `${coords.lat}, ${coords.lng}`;
};

const getTotalPaid = (data) =>
  data.totalAmount || data.pricingSummary?.totalAmountLabel || "Not provided";

const getCurrency = (data) =>
  data.selectedCurrency || data.pricingSummary?.currency || "ZAR";

const getBookingReference = (data) =>
  data.bookingReference ||
  data.bookingRef ||
  data.confirmationRef ||
  "Booking reference not supplied";

const getTourStops = (data) => {
  const rawStops =
    data.tourStops ||
    data.stops ||
    data.itineraryStops ||
    data.tripStops ||
    data.pricingSummary?.tourStops ||
    [];

  if (!Array.isArray(rawStops)) return [];

  return rawStops
    .map((stop) => {
      if (!stop) return null;
      if (typeof stop === "string") return stop;

      return (
        stop.name ||
        stop.title ||
        stop.label ||
        stop.location ||
        stop.stopName ||
        null
      );
    })
    .filter(Boolean);
};

const tableRow = (label, value) => `
  <tr>
    <td class="cf-mobile-row-label" style="padding:9px 0;color:${BRAND.muted};font-size:14px;vertical-align:top;width:42%;">
      ${escapeHtml(label)}
    </td>
    <td class="cf-mobile-row-value" style="padding:9px 0;color:${BRAND.text};font-size:14px;font-weight:700;text-align:right;vertical-align:top;">
      ${clean(value)}
    </td>
  </tr>
`;

const simpleSection = (title, content, icon = "") => `
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 18px;border-top:1px solid ${BRAND.border};">
    <tr>
      <td style="padding:18px 0 0;">
        <p class="cf-mobile-section-title" style="margin:0 0 10px;color:${BRAND.primary};font-size:12px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;">
          ${icon ? `<span style="display:inline-block;margin-right:7px;color:${BRAND.primary};font-size:15px;font-weight:900;line-height:1;vertical-align:-1px;">ⓘ</span>` : ""}
          ${escapeHtml(title)}
        </p>
        ${content}
      </td>
    </tr>
  </table>
`;

const adminSection = (title, content) => `
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 18px;border:1px solid ${BRAND.border};border-radius:20px;overflow:hidden;background:#ffffff;">
    <tr>
      <td style="padding:15px 18px;background:#f8fafc;border-bottom:1px solid ${BRAND.border};">
        <p style="margin:0;color:${BRAND.primary};font-size:11px;font-weight:800;letter-spacing:0.16em;text-transform:uppercase;">
          ${escapeHtml(title)}
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding:18px;">
        ${content}
      </td>
    </tr>
  </table>
`;

const pill = (text, tone = "blue") => {
  const tones = {
    blue: "background:#eef4ff;color:#071f4f;border:1px solid #dbeafe;",
    green: "background:#dcfce7;color:#14532d;border:1px solid #bbf7d0;",
    amber: "background:#fff7ed;color:#9a3412;border:1px solid #fed7aa;",
    dark: "background:#071f4f;color:#ffffff;border:1px solid #071f4f;",
  };

  return `
    <span class="cf-mobile-pill" style="display:inline-block;margin:0 6px 8px 0;padding:7px 11px;border-radius:999px;font-size:12px;font-weight:800;${tones[tone] || tones.blue}">
      ${escapeHtml(text)}
    </span>
  `;
};

const list = (items) => {
  const cleanItems = cleanArray(items);

  if (!cleanItems.length) {
    return `<p class="cf-mobile-p" style="margin:0;color:${BRAND.muted};font-size:14px;">None provided</p>`;
  }

  return `
    <ul class="cf-mobile-list" style="margin:0;padding-left:18px;color:${BRAND.text};font-size:14px;line-height:1.7;">
      ${cleanItems.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
    </ul>
  `;
};

const stopsList = (stops) => {
  if (!stops.length) {
    return `<p class="cf-mobile-p" style="margin:12px 0 0;color:${BRAND.muted};font-size:13px;line-height:1.7;">Tour stops will be confirmed with your booking details.</p>`;
  }

  return `
    <div style="margin-top:14px;padding-top:14px;border-top:1px solid ${BRAND.border};">
      <p class="cf-mobile-section-title" style="margin:0 0 9px;color:${BRAND.primary};font-size:11px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;">
        Tour stops
      </p>
      <ul class="cf-mobile-list" style="margin:0;padding-left:18px;color:${BRAND.text};font-size:13px;line-height:1.7;">
        ${stops.map((stop) => `<li>${clean(stop)}</li>`).join("")}
      </ul>
    </div>
  `;
};

const customerLayout = ({ preheader, children }) => `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Cape Frontier booking receipt</title>
    <style>
      @media only screen and (max-width: 520px) {
        .cf-mobile-wrap {
          padding: 10px 6px !important;
        }

        .cf-mobile-card {
          border-radius: 14px !important;
        }

        .cf-mobile-header {
          padding: 12px 14px !important;
        }

        .cf-mobile-logo {
          width: 118px !important;
          max-width: 118px !important;
          margin-bottom: 8px !important;
        }

        .cf-mobile-brand {
          font-size: 13px !important;
          line-height: 1.15 !important;
        }

        .cf-mobile-subtitle,
        .cf-mobile-muted {
          font-size: 9.5px !important;
          line-height: 1.35 !important;
        }

        .cf-mobile-content {
          padding: 12px !important;
        }

        .cf-mobile-ref-label {
          font-size: 8.5px !important;
          letter-spacing: 0.12em !important;
        }

        .cf-mobile-ref {
          font-size: 22px !important;
          line-height: 1.08 !important;
          letter-spacing: 0.01em !important;
        }

        .cf-mobile-ref-note {
          font-size: 9.5px !important;
          line-height: 1.35 !important;
        }

        .cf-mobile-p,
        .cf-mobile-list,
        .cf-mobile-list li {
          font-size: 10px !important;
          line-height: 1.45 !important;
        }

        .cf-mobile-row-label,
        .cf-mobile-row-value {
          font-size: 9.8px !important;
          line-height: 1.35 !important;
          padding-top: 5px !important;
          padding-bottom: 5px !important;
        }

        .cf-mobile-section-title {
          font-size: 8.5px !important;
          line-height: 1.15 !important;
          letter-spacing: 0.1em !important;
        }

        .cf-mobile-pill {
          font-size: 9.5px !important;
          padding: 5px 8px !important;
          margin: 0 4px 6px 0 !important;
        }

        .cf-mobile-icon-cell {
          height: 40px !important;
          padding: 0 6px !important;
          vertical-align: middle !important;
        }
.cf-mobile-icon-text {
          font-size: 9px !important;
          line-height: 1.25 !important;
          text-align: center !important;
        }

        .cf-mobile-footer {
          padding: 12px 14px !important;
        }
      }
    </style>
  </head>

  <body style="margin:0;padding:0;background:${BRAND.bg};font-family:Arial,Helvetica,sans-serif;color:${BRAND.text};">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
      ${escapeHtml(preheader)}
    </div>

    <table class="cf-mobile-wrap" role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${BRAND.bg};padding:20px 12px;">
      <tr>
        <td align="center">
          <table class="cf-mobile-card" role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;width:100%;background:#ffffff;border:1px solid ${BRAND.border};border-radius:18px;overflow:hidden;">
            <tr>
              <td class="cf-mobile-header" style="padding:18px 22px 16px;border-bottom:1px solid ${BRAND.border};">
                <img
                  class="cf-mobile-logo"
                  src="${BRAND.logoUrl}"
                  alt="${BRAND.name}"
                  width="150"
                  style="display:block;margin:0 auto 11px;max-width:150px;width:150px;height:auto;"
                />

                <p class="cf-mobile-brand" style="margin:0;color:${BRAND.primary};font-size:17px;font-weight:900;">
                  Cape Frontier
                </p>
                <p class="cf-mobile-subtitle" style="margin:5px 0 0;color:${BRAND.muted};font-size:12px;line-height:1.5;">
                  Booking receipt and confirmation notice
                </p>
              </td>
            </tr>

            <tr>
              <td class="cf-mobile-content" style="padding:22px;">
                ${children}
              </td>
            </tr>

            <tr>
              <td class="cf-mobile-footer" style="padding:18px 22px;background:#f8fafc;border-top:1px solid ${BRAND.border};">
                <p class="cf-mobile-p" style="margin:0;color:${BRAND.text};font-size:13px;line-height:1.7;">
                  Need help? Reply to this email or contact Cape Frontier on WhatsApp.
                </p>
                <p class="cf-mobile-muted" style="margin:8px 0 0;color:${BRAND.muted};font-size:12px;line-height:1.6;">
                  Email: ${CONTACT_EMAIL}<br />
                  WhatsApp: ${WHATSAPP_NUMBER}<br />
                  ${BRAND.fullName} · ${BRAND.website.replace("https://", "")}
                </p>
              </td>
            </tr>
          </table>

          <p class="cf-mobile-muted" style="max-width:620px;margin:14px auto 0;color:#94a3b8;font-size:11px;line-height:1.6;text-align:center;">
            This is a transactional booking email sent after checkout.
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>
`;

const adminLayout = ({ preheader, badge, title, intro, children }) => `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>${escapeHtml(title)}</title>
  </head>

  <body style="margin:0;padding:0;background:${BRAND.bg};font-family:Arial,Helvetica,sans-serif;color:${BRAND.text};">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
      ${escapeHtml(preheader)}
    </div>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${BRAND.bg};padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:720px;width:100%;background:#ffffff;border-radius:28px;overflow:hidden;box-shadow:0 18px 50px rgba(7,31,79,0.10);">
            <tr>
              <td style="background:${BRAND.primary};padding:30px 26px 26px;text-align:center;">
                <img
                  src="${BRAND.logoUrl}"
                  alt="${BRAND.name}"
                  width="240"
                  style="display:block;margin:0 auto 18px;max-width:240px;width:75%;height:auto;"
                />

                <div style="display:inline-block;background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.18);border-radius:999px;padding:8px 14px;color:#ffffff;font-size:11px;font-weight:800;letter-spacing:0.13em;text-transform:uppercase;">
                  ${escapeHtml(badge)}
                </div>

                <h1 style="margin:18px 0 0;color:#ffffff;font-size:31px;line-height:1.05;font-weight:900;">
                  ${escapeHtml(title)}
                </h1>

                <p style="margin:12px auto 0;max-width:560px;color:rgba(255,255,255,0.78);font-size:15px;line-height:1.7;">
                  ${escapeHtml(intro)}
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:26px 24px 30px;">
                ${children}
              </td>
            </tr>

            <tr>
              <td style="background:#f8fafc;padding:22px 24px;text-align:center;border-top:1px solid ${BRAND.border};">
                <p style="margin:0;color:${BRAND.primary};font-size:14px;font-weight:900;">
                  ${BRAND.fullName}
                </p>

                <p style="margin:7px 0 0;color:${BRAND.muted};font-size:12px;line-height:1.6;">
                  Admin booking notification generated from the Cape Frontier checkout.
                </p>

                <p style="margin:14px 0 0;">
                  <a href="${BRAND.website}" style="color:${BRAND.primary};font-size:12px;font-weight:800;text-decoration:none;">
                    ${BRAND.website.replace("https://", "")}
                  </a>
                </p>
              </td>
            </tr>
          </table>

          <p style="max-width:680px;margin:16px auto 0;color:#94a3b8;font-size:11px;line-height:1.6;text-align:center;">
            This internal email was sent because a booking/payment action was completed on the Cape Frontier website.
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>
`;

const customerReferenceBlock = (data) => {
  const bookingReference = getBookingReference(data);
  const totalPaid = getTotalPaid(data);
  const currency = getCurrency(data);

  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 16px;border:2px solid ${BRAND.primary};border-radius:18px;overflow:hidden;">
      <tr>
        <td style="padding:24px 18px;background:${BRAND.primary};text-align:center;">
          <p class="cf-mobile-ref-label" style="margin:0;color:rgba(255,255,255,0.65);font-size:11px;font-weight:900;letter-spacing:0.18em;text-transform:uppercase;">
            Booking reference
          </p>

          <p class="cf-mobile-ref" style="margin:10px 0 0;color:#ffffff;font-size:36px;font-weight:900;line-height:1.1;letter-spacing:0.03em;word-break:break-word;">
            ${clean(bookingReference)}
          </p>

          <p class="cf-mobile-ref-note" style="margin:10px 0 0;color:rgba(255,255,255,0.78);font-size:13px;line-height:1.5;">
            Keep this reference for pickup, support and booking changes.
          </p>
        </td>
      </tr>

      <tr>
        <td style="padding:16px 18px;background:#ffffff;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
            ${tableRow("Booking status", "Booking confirmation pending")}
            ${tableRow("Total paid", totalPaid)}
            ${tableRow("Currency", currency)}
          </table>
        </td>
      </tr>
    </table>
  `;
};

const customerIconCards = () => `
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:4px 0 16px;">
    <tr>
      <td width="50%" align="center" valign="top" style="padding:0 5px 0 0;text-align:center;">
        <table role="presentation" width="100%" height="46" cellspacing="0" cellpadding="0" style="width:100%;height:46px;min-height:46px;background:${BRAND.greenSoft};border:1px solid ${BRAND.greenBorder};border-radius:14px;">
          <tr>
            <td class="cf-mobile-icon-cell" align="center" valign="middle" height="46" style="height:46px;padding:0 8px;text-align:center;vertical-align:middle;">
              <p class="cf-mobile-icon-text" align="center" style="display:block;width:100%;margin:0 auto;color:${BRAND.greenText};font-size:11px;line-height:1.25;font-weight:900;text-align:center;">
                <span style="display:inline-block;margin-right:5px;color:${BRAND.greenText};font-size:12px;font-weight:900;line-height:1;vertical-align:0;">✓</span>
                Payment Received
              </p>
            </td>
          </tr>
        </table>
      </td>

      <td width="50%" align="center" valign="top" style="padding:0 0 0 5px;text-align:center;">
        <table role="presentation" width="100%" height="46" cellspacing="0" cellpadding="0" style="width:100%;height:46px;min-height:46px;background:#eef4ff;border:1px solid #dbeafe;border-radius:14px;">
          <tr>
            <td class="cf-mobile-icon-cell" align="center" valign="middle" height="46" style="height:46px;padding:0 8px;text-align:center;vertical-align:middle;">
              <p class="cf-mobile-icon-text" align="center" style="display:block;width:100%;margin:0 auto;color:${BRAND.primary};font-size:11px;line-height:1.25;font-weight:900;text-align:center;">
                <span style="display:inline-block;margin-right:5px;color:${BRAND.primary};font-size:12px;font-weight:900;line-height:1;vertical-align:0;">#</span>
                Reference Saved
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
`;

const adminReferenceBlock = (data) => {
  const bookingReference = getBookingReference(data);
  const totalPaid = getTotalPaid(data);
  const currency = getCurrency(data);

  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 20px;border-radius:24px;overflow:hidden;background:${BRAND.primary};">
      <tr>
        <td style="padding:26px 20px;text-align:center;">
          <p style="margin:0;color:rgba(255,255,255,0.58);font-size:11px;font-weight:900;letter-spacing:0.18em;text-transform:uppercase;">
            Booking reference
          </p>

          <p style="margin:10px 0 0;color:#ffffff;font-size:32px;font-weight:900;line-height:1.15;letter-spacing:0.03em;word-break:break-word;">
            ${clean(bookingReference)}
          </p>

          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:18px;">
            <tr>
              <td style="padding:0;color:rgba(255,255,255,0.68);font-size:12px;font-weight:700;text-align:left;">
                Amount paid
              </td>
              <td style="padding:0;color:#ffffff;font-size:20px;font-weight:900;text-align:right;">
                ${clean(totalPaid)}
              </td>
            </tr>
            <tr>
              <td style="padding:6px 0 0;color:rgba(255,255,255,0.62);font-size:12px;text-align:left;">
                ${clean(data.participants || 1)} guest${Number(data.participants) > 1 ? "s" : ""}
              </td>
              <td style="padding:6px 0 0;color:rgba(255,255,255,0.62);font-size:12px;text-align:right;">
                ${clean(currency)}
              </td>
            </tr>
            <tr>
              <td style="padding:10px 0 0;color:rgba(255,255,255,0.68);font-size:12px;font-weight:700;text-align:left;">
                Payment ID
              </td>
              <td style="padding:10px 0 0;color:rgba(255,255,255,0.82);font-size:12px;font-weight:700;text-align:right;word-break:break-word;">
                ${clean(data.paymentId || "Not supplied")}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;
};

const buildCustomerHtml = (data) => {
  const {
    customerName,
    tourTitle,
    tourId,
    date,
    pickupTime,
    participants,
    customerNotes,
    pickupLocation,
    pickupCoords,
  } = data;

  const bookingReference = getBookingReference(data);
  const tourStops = getTourStops(data);

  return customerLayout({
    preheader: `Booking confirmation pending for ${tourTitle}. Booking reference: ${bookingReference}.`,
    children: `
      ${customerReferenceBlock(data)}

      <div style="margin:0 0 12px;">
        ${pill("Payment received", "green")}
        ${pill("Booking confirmation pending", "amber")}
        ${pill("WhatsApp confirmation within 24 hours", "blue")}
      </div>


      <p class="cf-mobile-p" style="margin:0 0 18px;color:${BRAND.text};font-size:15px;line-height:1.7;">
        Hi <strong>${clean(customerName)}</strong>, thank you for booking with Cape Frontier.
        Your payment has been received. Your booking confirmation will be sent via WhatsApp within 24 hours.
      </p>

      ${customerIconCards()}

      ${simpleSection(
        "Booking details",
        `
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
            ${tableRow("Booking reference", bookingReference)}
            ${tableRow("Tour", tourTitle)}
            ${tableRow("Tour ID", tourId)}
            ${tableRow("Date", date)}
            ${tableRow("Pickup time", pickupTime || "To be confirmed")}
            ${tableRow("Participants", `${participants || 1} guest${Number(participants) > 1 ? "s" : ""}`)}
          </table>
        `
      )}

      ${simpleSection(
        "Pickup details",
        `
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
            ${tableRow("Pickup location", pickupLocation)}
            ${tableRow("Coordinates", formatCoords(pickupCoords))}
          </table>

          <p class="cf-mobile-p" style="margin:10px 0 0;color:${BRAND.muted};font-size:13px;line-height:1.7;">
            Cape Frontier will confirm the final pickup point, timing and vehicle details via WhatsApp.
          </p>

          ${stopsList(tourStops)}
        `
      )}

      ${simpleSection(
        "What happens next",
        `
          <ol class="cf-mobile-list" style="margin:0;padding-left:20px;color:${BRAND.text};font-size:14px;line-height:1.8;">
            <li>Keep your booking reference ready: <strong>${clean(bookingReference)}</strong>.</li>
            <li>Cape Frontier reviews your booking details.</li>
            <li>Your booking confirmation will be sent via WhatsApp within 24 hours.</li>
            <li>Your final pickup timing and vehicle details will be included in the WhatsApp confirmation.</li>
          </ol>
        `,
        "i"
      )}

      ${simpleSection(
        "Important policy summary",
        `
          <p class="cf-mobile-p" style="margin:0;color:${BRAND.text};font-size:14px;line-height:1.8;">
            You are booking for your own group only. The selected participant count must match your own party size.
            Lower per-person rates only apply when the selected group size is booked and paid for in full.
          </p>

          <p class="cf-mobile-p" style="margin:10px 0 0;color:${BRAND.text};font-size:14px;line-height:1.8;">
            Cancellation within 24 hours after booking allows a full refund. Cancellation 2–3 days before the trip has a 20% penalty.
            Cancellation within 24 hours before the trip has no refund. Weather-related cancellations may allow a refund or reschedule depending on availability.
          </p>
        `,
        "i"
      )}

      ${simpleSection(
        "Contact",
        `
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
            ${tableRow("Email", CONTACT_EMAIL)}
            ${tableRow("WhatsApp", WHATSAPP_NUMBER)}
          </table>

          <p class="cf-mobile-p" style="margin:10px 0 0;color:${BRAND.muted};font-size:13px;line-height:1.7;">
            WhatsApp number is provisional until the client confirms the final booking contact number.
          </p>
        `
      )}

      ${
        customerNotes
          ? simpleSection(
              "Your notes",
              `<p class="cf-mobile-p" style="margin:0;color:${BRAND.text};font-size:14px;line-height:1.7;">${clean(customerNotes)}</p>`
            )
          : ""
      }
    `,
  });
};

const buildAdminHtml = (data) => {
  const {
    customerName,
    customerEmail,
    mobile,
    tourTitle,
    tourId,
    tourSlug,
    date,
    pickupTime,
    participants,
    participantEmails,
    ccParticipantEmails,
    isPrivate,
    isCustom,
    pricingOptions,
    pricingSummary,
    customerNotes,
    pickupLocation,
    pickupCoords,
    paymentId,
    policyAcknowledgement,
  } = data;

  const bookingReference = getBookingReference(data);

  return adminLayout({
    preheader: `New paid booking: ${tourTitle}. Booking reference: ${bookingReference}. Payment ID: ${paymentId || "not supplied"}.`,
    badge: "Admin notification",
    title: "New booking received",
    intro:
      "A customer completed checkout. Booking reference and payment ID are shown below for tracking.",
    children: `
      ${adminReferenceBlock(data)}

      <div style="margin:0 0 18px;">
        ${pill("New paid booking", "green")}
        ${pill(`Booking ref ${bookingReference}`, "dark")}
        ${pill("Booking confirmation pending", "amber")}
        ${isPrivate ? pill("Private tour", "dark") : pill("Standard booking", "blue")}
        ${isCustom ? pill("Custom request", "blue") : ""}
      </div>

      ${adminSection(
        "Action checklist",
        `
          <ol style="margin:0;padding-left:20px;color:${BRAND.text};font-size:14px;line-height:1.8;">
            <li>Use booking reference <strong>${clean(bookingReference)}</strong> for customer support and internal tracking.</li>
            <li>Use payment ID <strong>${clean(paymentId || "Not supplied")}</strong> when checking the payment provider dashboard.</li>
            <li>Send the customer booking confirmation via WhatsApp within 24 hours.</li>
            <li>Review date, pickup location and route details.</li>
            <li>Confirm suitable vehicle based on group size, luggage and route.</li>
            <li>Contact customer if any details need clarification.</li>
          </ol>
        `
      )}

      ${adminSection(
        "Customer details",
        `
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
            ${tableRow("Name", customerName)}
            ${tableRow("Email", customerEmail)}
            ${tableRow("Mobile", mobile)}
            ${tableRow("WhatsApp follow-up", WHATSAPP_NUMBER)}
          </table>
        `
      )}

      ${adminSection(
        "Tour and booking details",
        `
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
            ${tableRow("Booking reference", bookingReference)}
            ${tableRow("Tour", tourTitle)}
            ${tableRow("Tour ID", tourId)}
            ${tableRow("Tour slug", tourSlug)}
            ${tableRow("Date", date)}
            ${tableRow("Pickup time", pickupTime || "To be confirmed")}
            ${tableRow("Participants", `${participants || 1} guest${Number(participants) > 1 ? "s" : ""}`)}
            ${tableRow("Private tour", yesNo(isPrivate))}
            ${tableRow("Custom trip", yesNo(isCustom))}
          </table>
        `
      )}

      ${adminSection(
        "Pickup details",
        `
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
            ${tableRow("Pickup location", pickupLocation)}
            ${tableRow("Pickup coordinates", formatCoords(pickupCoords))}
          </table>
          ${stopsList(getTourStops(data))}
        `
      )}

      ${adminSection(
        "Payment and settlement",
        `
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
            ${tableRow("Booking reference", bookingReference)}
            ${tableRow("Payment status", "Succeeded / received from checkout")}
            ${tableRow("Total paid", getTotalPaid(data))}
            ${tableRow("Currency", getCurrency(data))}
            ${tableRow("Payment ID", paymentId || "Not supplied")}
            ${tableRow("Payment provider", "Secure online checkout")}
            ${tableRow("Settlement destination", "Cape Frontier merchant account")}
            ${tableRow("Settlement process", "Provider-managed payout according to account schedule")}
          </table>

          <p style="margin:14px 0 0;color:${BRAND.muted};font-size:12px;line-height:1.7;">
            Card brand, last four digits, issuing bank and payout/bank details are not included in the current checkout email payload.
            To show masked card details later, add them from the verified payment provider response before calling this API.
          </p>
        `
      )}

      ${adminSection(
        "Customer notes",
        customerNotes
          ? `<p style="margin:0;color:${BRAND.text};font-size:14px;line-height:1.7;">${clean(customerNotes)}</p>`
          : `<p style="margin:0;color:${BRAND.muted};font-size:14px;">No notes provided.</p>`
      )}

      ${adminSection(
        "Participant emails",
        `
          <p style="margin:0 0 10px;color:${BRAND.muted};font-size:13px;">Participant emails:</p>
          ${list(participantEmails)}

          <p style="margin:14px 0 10px;color:${BRAND.muted};font-size:13px;">
            CC participant emails:
          </p>
          ${list(ccParticipantEmails)}
        `
      )}

      ${adminSection(
        "Pricing summary",
        `
          <pre style="margin:0;white-space:pre-wrap;word-break:break-word;background:#0f172a;color:#e2e8f0;border-radius:16px;padding:14px;font-size:12px;line-height:1.6;">${escapeHtml(
            JSON.stringify(pricingSummary || {}, null, 2)
          )}</pre>
        `
      )}

      ${adminSection(
        "Pricing options",
        `
          <pre style="margin:0;white-space:pre-wrap;word-break:break-word;background:#0f172a;color:#e2e8f0;border-radius:16px;padding:14px;font-size:12px;line-height:1.6;">${escapeHtml(
            JSON.stringify(pricingOptions || {}, null, 2)
          )}</pre>
        `
      )}

      ${adminSection(
        "Policy acknowledgement",
        `
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
            ${tableRow("Customer books own group only", yesNo(policyAcknowledgement?.customerBooksOwnGroup))}
            ${tableRow("Participants match own party", yesNo(policyAcknowledgement?.participantsMustMatchOwnParty))}
            ${tableRow("Lower rates require full selected group payment", yesNo(policyAcknowledgement?.lowerRatesRequireFullSelectedGroupPayment))}
            ${tableRow("Vehicle confirmed operationally", yesNo(policyAcknowledgement?.finalPickupVehicleOperationallyConfirmed))}
          </table>
        `
      )}
    `,
  });
};

const buildCustomerText = (data) => {
  const bookingReference = getBookingReference(data);
  const stops = getTourStops(data);

  return `
Cape Frontier booking receipt

BOOKING REFERENCE:
${bookingReference}

Hi ${data.customerName},

Thank you for booking with Cape Frontier. Your payment has been received. Your booking confirmation will be sent via WhatsApp within 24 hours.

Booking:
Booking reference: ${bookingReference}
Tour: ${data.tourTitle}
Tour ID: ${data.tourId || "Not supplied"}
Date: ${data.date}
Pickup time: ${data.pickupTime || "To be confirmed"}
Participants: ${data.participants || 1}
Pickup location: ${data.pickupLocation || "Not provided"}

Tour stops:
${stops.length ? stops.map((stop) => `- ${stop}`).join("\n") : "Tour stops will be confirmed with your booking details."}

Payment:
Booking status: Booking confirmation pending
Total paid: ${getTotalPaid(data)}
Currency: ${getCurrency(data)}

Contact:
Email: ${CONTACT_EMAIL}
WhatsApp: ${WHATSAPP_NUMBER}

Cape Frontier will manually confirm your final pickup time and vehicle details via WhatsApp.

Kind regards,
Cape Frontier Travel & Tours
`.trim();
};

const buildAdminText = (data) => {
  const bookingReference = getBookingReference(data);
  const stops = getTourStops(data);

  return `
New Cape Frontier paid booking

BOOKING REFERENCE:
${bookingReference}

PAYMENT ID:
${data.paymentId || "Not supplied"}

Customer:
Name: ${data.customerName}
Email: ${data.customerEmail}
Mobile: ${data.mobile || "Not provided"}

Booking:
Booking reference: ${bookingReference}
Tour: ${data.tourTitle}
Tour ID: ${data.tourId || "Not supplied"}
Tour slug: ${data.tourSlug || "Not supplied"}
Date: ${data.date}
Pickup time: ${data.pickupTime || "To be confirmed"}
Participants: ${data.participants || 1}
Pickup location: ${data.pickupLocation || "Not provided"}

Tour stops:
${stops.length ? stops.map((stop) => `- ${stop}`).join("\n") : "Tour stops not supplied."}

Payment:
Total paid: ${getTotalPaid(data)}
Currency: ${getCurrency(data)}
Payment ID: ${data.paymentId || "Not supplied"}

Notes:
${data.customerNotes || "No notes provided"}

Action required:
Send the customer booking confirmation via WhatsApp within 24 hours.
Use booking reference ${bookingReference}, review booking, confirm vehicle, confirm pickup details, and contact the customer if needed.
`.trim();
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      bookingReference,
      bookingRef,
      confirmationRef,

      customerName,
      customerEmail,
      mobile,

      tourTitle,
      tourId,
      tourSlug,

      date,
      pickupTime,
      participants,

      participantEmails = [],
      ccParticipantEmails = [],
      ccParticipants = false,

      isPrivate = false,
      isCustom = false,

      pricingOptions = {},
      pricingSummary = {},

      customerNotes = "",

      pickupLocation = "Not provided",
      pickupCoords = null,

      selectedCurrency = "ZAR",
      totalAmount,
      paymentId,

      tourStops = [],
      stops = [],
      itineraryStops = [],
      tripStops = [],

      policyAcknowledgement = {},
    } = req.body || {};

    if (!customerName || !customerEmail || !tourTitle || !date) {
      return res.status(400).json({
        error: "Missing required booking details",
      });
    }

    if (!process.env.RESEND_API_KEY) {
      return res.status(500).json({
        error: "Missing RESEND_API_KEY",
      });
    }

    const fromEmail =
      process.env.RESEND_FROM_EMAIL || "Cape Frontier <onboarding@resend.dev>";

    const adminEmail =
      process.env.RESEND_ADMIN_EMAIL || "admin@cape-frontier.co.za";

    const replyToEmail =
      process.env.RESEND_REPLY_TO_EMAIL || "admin@cape-frontier.co.za";

    const data = {
      bookingReference,
      bookingRef,
      confirmationRef,

      customerName,
      customerEmail,
      mobile,

      tourTitle,
      tourId,
      tourSlug,

      date,
      pickupTime,
      participants,

      participantEmails,
      ccParticipantEmails,
      ccParticipants,

      isPrivate,
      isCustom,

      pricingOptions,
      pricingSummary,

      customerNotes,

      pickupLocation,
      pickupCoords,

      selectedCurrency,
      totalAmount,
      paymentId,

      tourStops,
      stops,
      itineraryStops,
      tripStops,

      policyAcknowledgement,
    };

    const finalBookingReference = getBookingReference(data);

    console.log("Cape Frontier email env:", {
      fromEmail,
      adminEmail,
      replyToEmail,
      bookingReference: finalBookingReference,
      paymentId,
      tourId,
      tourSlug,
      logoUrl: BRAND.logoUrl,
      website: BRAND.website,
      whatsapp: WHATSAPP_NUMBER,
    });

    const ccEmails =
      ccParticipants && cleanArray(ccParticipantEmails).length
        ? cleanArray(ccParticipantEmails)
        : undefined;

    const customerResult = await resend.emails.send({
      from: fromEmail,
      to: [customerEmail],
      cc: ccEmails,
      replyTo: replyToEmail,
      subject: `Cape Frontier booking confirmation pending · ${finalBookingReference}`,
      html: buildCustomerHtml(data),
      text: buildCustomerText(data),
    });

    const adminResult = await resend.emails.send({
      from: fromEmail,
      to: [adminEmail],
      replyTo: customerEmail,
      subject: `New paid booking · ${finalBookingReference} · ${tourTitle}`,
      html: buildAdminHtml(data),
      text: buildAdminText(data),
    });

    return res.status(200).json({
      success: true,
      bookingReference: finalBookingReference,
      paymentId: paymentId || null,
      tourId: tourId || null,
      customerEmailId: customerResult?.data?.id || null,
      adminEmailId: adminResult?.data?.id || null,
    });
  } catch (error) {
    console.error("Resend booking email error:", error);

    return res.status(500).json({
      error: "Failed to send booking emails",
      details: error?.message || "Unknown email error",
    });
  }
}