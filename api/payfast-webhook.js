// pages/api/payfast-webhook.js
import crypto from 'crypto';

// In‑memory store – replace with your database
const bookingStore = new Map();

export function updateBookingStatus(reference, status, extra = {}) {
  const existing = bookingStore.get(reference) || {};
  bookingStore.set(reference, {
    ...existing,
    status,
    updatedAt: new Date().toISOString(),
    ...extra,
  });
  console.log(`[Webhook] ${reference} → ${status}`);
}

export function getBookingStatus(reference) {
  return bookingStore.get(reference) || { status: 'pending' };
}

// Optional: validate ITN with PayFast server (recommended)
async function validateITN(data) {
  try {
    const response = await fetch('https://sandbox.payfast.co.za/eng/query/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(data).toString(),
    });
    const text = await response.text();
    return text === 'VALID';
  } catch (error) {
    console.error('ITN validation error:', error);
    return false;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');

  const pfData = { ...req.body };
  const receivedSignature = pfData.signature;
  delete pfData.signature;

  const passphrase = process.env.PAYFAST_PASSPHRASE;

  // Recalculate signature
  const signatureString = Object.keys(pfData)
    .sort()
    .map(key => `${key}=${encodeURIComponent(pfData[key]).replace(/%20/g, '+')}`)
    .join('&');

  let toSign = signatureString;
  if (passphrase && passphrase.trim() !== '') {
    toSign += `&passphrase=${encodeURIComponent(passphrase).replace(/%20/g, '+')}`;
  }
  const calculatedSignature = crypto.createHash('md5').update(toSign).digest('hex');

  if (receivedSignature !== calculatedSignature) {
    console.error('Invalid PayFast signature');
    return res.status(400).send('Invalid signature');
  }

  // Optional: validate with PayFast server
  const isValid = await validateITN(pfData);
  if (!isValid) {
    console.error('ITN validation failed');
    // In sandbox, you might still accept – but for production, reject
    // return res.status(400).send('ITN validation failed');
  }

  const paymentStatus = pfData.payment_status;
  const bookingReference = pfData.m_payment_id;
  const pfPaymentId = pfData.pf_payment_id;
  const amountGross = pfData.amount_gross;

  if (!bookingReference) {
    return res.status(400).send('Missing booking reference');
  }

  if (paymentStatus === 'COMPLETE') {
    updateBookingStatus(bookingReference, 'paid', { pfPaymentId, amountGross });
    // Optionally trigger email here (but success page will also handle)
  } else if (paymentStatus === 'FAILED') {
    updateBookingStatus(bookingReference, 'failed', { pfPaymentId });
  } else {
    updateBookingStatus(bookingReference, 'pending');
  }

  res.status(200).send('OK');
}