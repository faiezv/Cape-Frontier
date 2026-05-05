import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      customerName,
      customerEmail,
      mobile,
      tourTitle,
      date,
      participants,
      pickupLocation,
      pickupCoords,
      selectedCurrency,
      totalAmount,
      paymentId,
    } = req.body;

    if (!customerName || !customerEmail || !tourTitle || !date) {
      return res.status(400).json({
        error: "Missing required booking details",
      });
    }

    // const fromEmail = `Cape Frontier <${process.env.RESEND_FROM_EMAIL}>`; uncomment when bought domain.
    const fromEmail = `Cape Frontier <onboarding@resend.dev>`;
    const adminEmail = process.env.RESEND_ADMIN_EMAIL;
    const replyToEmail = process.env.RESEND_REPLY_TO_EMAIL;

    const customerHtml = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
        <h2>Booking received - Cape Frontier</h2>

        <p>Hi ${customerName},</p>

        <p>
          Thank you for your booking. We have received your booking request and payment details.
        </p>

        <h3>Booking details</h3>
        <p><strong>Tour:</strong> ${tourTitle}</p>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Participants:</strong> ${participants}</p>
        <p><strong>Pickup location:</strong> ${pickupLocation}</p>
        <p><strong>Total paid:</strong> ${totalAmount}</p>

        <p>
          Cape Frontier will confirm your final pickup time and vehicle details after reviewing your booking.
        </p>

        <p>
          If you have any questions, simply reply to this email.
        </p>

        <p>
          Kind regards,<br />
          Cape Frontier Travel & Tours
        </p>
      </div>
    `;

    const adminHtml = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
        <h2>New Cape Frontier Booking</h2>

        <h3>Customer details</h3>
        <p><strong>Name:</strong> ${customerName}</p>
        <p><strong>Email:</strong> ${customerEmail}</p>
        <p><strong>Mobile:</strong> ${mobile || "Not provided"}</p>

        <h3>Tour details</h3>
        <p><strong>Tour:</strong> ${tourTitle}</p>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Participants:</strong> ${participants}</p>
        <p><strong>Pickup location:</strong> ${pickupLocation}</p>
        <p><strong>Pickup coordinates:</strong> ${
          pickupCoords ? `${pickupCoords.lat}, ${pickupCoords.lng}` : "Not provided"
        }</p>
        <p><strong>Total paid:</strong> ${totalAmount}</p>
        <p><strong>Currency:</strong> ${selectedCurrency}</p>

        <h3>Payment</h3>
        <p><strong>Stripe PaymentIntent ID:</strong> ${paymentId || "Not supplied"}</p>

        <p>
          Reply to this email to respond directly to the customer.
        </p>
      </div>
    `;

    await resend.emails.send({
      from: fromEmail,
      to: [customerEmail],
      replyTo: replyToEmail,
      subject: `Booking received: ${tourTitle}`,
      html: customerHtml,
    });

    await resend.emails.send({
      from: fromEmail,
      to: [adminEmail],
      replyTo: customerEmail,
      subject: `New booking: ${tourTitle}`,
      html: adminHtml,
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Resend booking email error:", error);

    return res.status(500).json({
      error: "Failed to send booking emails",
    });
  }
}