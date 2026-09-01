// api/reviews/notify.js
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const REVIEW_CODE_PATTERN = /^TOUR-[A-Z0-9]{8}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const BRAND = {
  primary: "#071f4f",
  bg: "#f6f8fb",
  text: "#111827",
  muted: "#64748b",
  border: "#e5e7eb",
};

const escapeHtml = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

function validatePayload(review) {
  if (!review || typeof review !== "object") {
    return "Missing review payload";
  }

  const { code, title, rating, review: reviewText, name, email } = review;

  if (!code || !REVIEW_CODE_PATTERN.test(code)) {
    return "Invalid or missing tour reference";
  }
  if (!title || !String(title).trim()) {
    return "Missing review title";
  }
  if (!reviewText || !String(reviewText).trim()) {
    return "Missing review text";
  }
  if (!name || !String(name).trim()) {
    return "Missing reviewer name";
  }
  if (!email || !EMAIL_PATTERN.test(String(email).trim())) {
    return "Invalid or missing reviewer email";
  }
  if (rating === undefined || rating === null || Number.isNaN(Number(rating))) {
    return "Missing or invalid rating";
  }
  const numericRating = Number(rating);
  if (numericRating < 1 || numericRating > 5) {
    return "Rating out of range";
  }

  return null;
}

// ----- Admin notification email (unchanged) -----
function buildAdminEmailHtml(review) {
  const { code, tour, title, rating, review: reviewText, name, email } = review;

  return `
    <div style="font-family: Arial, Helvetica, sans-serif; max-width: 560px; margin: 0 auto; color: ${BRAND.text}; background: ${BRAND.bg}; padding: 24px 12px;">
      <div style="background: ${BRAND.primary}; padding: 24px 28px; border-radius: 16px 16px 0 0;">
        <p style="margin: 0; color: #ffffff; font-size: 12px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; opacity: 0.75;">
          New review submitted
        </p>
        <p style="margin: 6px 0 0; color: #ffffff; font-size: 22px; font-weight: 700;">
          ${escapeHtml(title)}
        </p>
      </div>

      <div style="border: 1px solid ${BRAND.border}; border-top: none; border-radius: 0 0 16px 16px; padding: 24px 28px; background: #ffffff;">
        <table role="presentation" width="100%" style="border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="padding: 6px 0; color: ${BRAND.muted}; width: 140px;">Tour reference</td>
            <td style="padding: 6px 0; font-family: monospace; font-weight: 600;">${escapeHtml(code)}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: ${BRAND.muted};">Selected tour</td>
            <td style="padding: 6px 0; font-weight: 600;">${escapeHtml(tour || "—")}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: ${BRAND.muted};">Rating</td>
            <td style="padding: 6px 0; font-weight: 600;">${escapeHtml(String(rating))} / 5</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: ${BRAND.muted};">Reviewer</td>
            <td style="padding: 6px 0; font-weight: 600;">${escapeHtml(name)}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: ${BRAND.muted};">Email</td>
            <td style="padding: 6px 0; font-weight: 600;">${escapeHtml(email)}</td>
          </tr>
        </table>

        <div style="margin-top: 18px; padding: 16px 18px; background: #f9fafb; border-radius: 12px; border: 1px solid #f0f0f0;">
          <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #374151; white-space: pre-wrap;">${escapeHtml(reviewText)}</p>
        </div>

        <p style="margin: 20px 0 0; font-size: 12px; color: #9ca3af;">
          Verify this reference matches an actual booking before publishing. Hit reply to respond directly to ${escapeHtml(name)}.
        </p>
      </div>
    </div>
  `;
}

function buildAdminEmailText(review) {
  const { code, tour, title, rating, review: reviewText, name, email } = review;

  return [
    `New review submitted`,
    ``,
    `Title: ${title}`,
    `Tour reference: ${code}`,
    `Selected tour: ${tour || "—"}`,
    `Rating: ${rating} / 5`,
    `Reviewer: ${name}`,
    `Email: ${email}`,
    ``,
    `Review:`,
    reviewText,
    ``,
    `Verify this reference matches an actual booking before publishing.`,
  ].join("\n");
}

// ----- Customer confirmation email -----
function buildCustomerEmailHtml(review) {
  const { code, tour, title, rating, name } = review;

  return `
    <div style="font-family: Arial, Helvetica, sans-serif; max-width: 560px; margin: 0 auto; color: ${BRAND.text}; background: ${BRAND.bg}; padding: 24px 12px;">
      <div style="background: ${BRAND.primary}; padding: 24px 28px; border-radius: 16px 16px 0 0;">
        <p style="margin: 0; color: #ffffff; font-size: 12px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; opacity: 0.75;">
          Thank you for your review
        </p>
        <p style="margin: 6px 0 0; color: #ffffff; font-size: 22px; font-weight: 700;">
          ${escapeHtml(title)}
        </p>
      </div>

      <div style="border: 1px solid ${BRAND.border}; border-top: none; border-radius: 0 0 16px 16px; padding: 24px 28px; background: #ffffff;">
        <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.6;">
          Dear ${escapeHtml(name)},
        </p>
        <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.6;">
          Thank you for taking the time to share your experience with us. Your feedback is incredibly valuable and helps other travellers make informed decisions.
        </p>
        <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.6;">
          Please note that we manually verify the tour reference before publishing a review. Once confirmed, your review will appear on our website shortly.
        </p>

        <div style="margin-top: 20px; padding: 16px 18px; background: #f9fafb; border-radius: 12px; border: 1px solid #f0f0f0;">
          <p style="margin: 0; font-size: 13px; color: #6b7280;">
            <strong>Reference:</strong> ${escapeHtml(code)}<br />
            <strong>Tour:</strong> ${escapeHtml(tour || "—")}<br />
            <strong>Rating:</strong> ${escapeHtml(String(rating))} / 5
          </p>
        </div>

        <p style="margin: 24px 0 0; font-size: 12px; color: #9ca3af;">
          If you have any questions or need to update your review, simply reply to this email.
        </p>
      </div>
    </div>
  `;
}

function buildCustomerEmailText(review) {
  const { code, tour, title, rating, name } = review;

  return [
    `Thank you for your review`,
    ``,
    `Dear ${name},`,
    ``,
    `Thank you for taking the time to share your experience with us. Your feedback is incredibly valuable and helps other travellers make informed decisions.`,
    ``,
    `Please note that we manually verify the tour reference before publishing a review. Once confirmed, your review will appear on our website shortly.`,
    ``,
    `Reference: ${code}`,
    `Tour: ${tour || "—"}`,
    `Rating: ${rating} / 5`,
    `Title: ${title}`,
    ``,
    `If you have any questions or need to update your review, simply reply to this email.`,
  ].join("\n");
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!process.env.RESEND_API_KEY) {
    console.error("Cape Frontier review notify: missing RESEND_API_KEY");
    return res.status(500).json({ error: "Missing RESEND_API_KEY" });
  }

  // Fallbacks mirror send-booking.js so a missing/typo'd env var
  // degrades gracefully instead of hard-failing silently.
  const fromEmail =
    process.env.RESEND_FROM_EMAIL || "Cape Frontier <onboarding@resend.dev>";
  const adminEmail =
    process.env.RESEND_ADMIN_EMAIL || "admin@cape-frontier.co.za";

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ error: "Invalid JSON body" });
    }
  }

  const review = body?.review;

  const validationError = validatePayload(review);
  if (validationError) {
    console.warn("Cape Frontier review notify: validation failed", {
      error: validationError,
      body,
    });
    return res.status(400).json({ error: validationError });
  }

  // Log before sending so a failed send still leaves a trace in
  // Vercel's function logs (Project → Deployments → Functions).
  console.log("Cape Frontier review notify: sending", {
    fromEmail,
    adminEmail,
    customerEmail: review.email,
    code: review.code,
  });

  // Build both emails
  const adminEmailPayload = {
    from: fromEmail,
    to: [adminEmail],
    replyTo: review.email, // reply to admin goes to the reviewer
    subject: `New review submitted — ${review.code}`,
    html: buildAdminEmailHtml(review),
    text: buildAdminEmailText(review),
  };

  const customerEmailPayload = {
    from: fromEmail,
    to: [review.email],
    subject: `Thank you for your review — ${review.code}`,
    html: buildCustomerEmailHtml(review),
    text: buildCustomerEmailText(review),
  };

  try {
    // Send both emails concurrently (independent operations)
    const [adminResult, customerResult] = await Promise.allSettled([
      resend.emails.send(adminEmailPayload),
      resend.emails.send(customerEmailPayload),
    ]);

    const errors = [];

    if (adminResult.status === "rejected") {
      console.error(
        "Cape Frontier review notify: admin email failed",
        adminResult.reason
      );
      errors.push(`Admin email: ${adminResult.reason?.message || "unknown error"}`);
    } else if (adminResult.value?.error) {
      console.error(
        "Cape Frontier review notify: admin email Resend error",
        adminResult.value.error
      );
      errors.push(`Admin email: ${adminResult.value.error.message}`);
    }

    if (customerResult.status === "rejected") {
      console.error(
        "Cape Frontier review notify: customer email failed",
        customerResult.reason
      );
      errors.push(`Customer email: ${customerResult.reason?.message || "unknown error"}`);
    } else if (customerResult.value?.error) {
      console.error(
        "Cape Frontier review notify: customer email Resend error",
        customerResult.value.error
      );
      errors.push(`Customer email: ${customerResult.value.error.message}`);
    }

    // If any error occurred, return a 502 with details
    if (errors.length > 0) {
      return res.status(502).json({
        error: "Failed to send one or more notification emails",
        details: errors,
      });
    }

    // Both emails sent successfully
    const adminId = adminResult.value?.data?.id;
    const customerId = customerResult.value?.data?.id;

    console.log("Cape Frontier review notify: sent", {
      adminEmailId: adminId,
      customerEmailId: customerId,
    });

    return res.status(200).json({
      ok: true,
      adminEmailId: adminId,
      customerEmailId: customerId,
    });
  } catch (err) {
    console.error("Cape Frontier review notify: unexpected error", err);
    return res.status(500).json({
      error: "Unexpected error sending notifications",
      details: err?.message,
    });
  }
}