// pages/api/payfast-verify.js
import { updateBookingStatus } from './payfast-webhook';

export default async function handler(req, res) {
  const { reference, pf_payment_id } = req.query;

  if (!reference) {
    return res.status(400).json({ error: 'Missing booking reference' });
  }

  // In production, you could call PayFast's API to verify, but they don't have a public query endpoint.
  // As a fallback, if we have a pf_payment_id from the URL, we can trust it (only after user returns).
  // For safety, you could also check amount, etc.
  if (pf_payment_id) {
    console.warn(`Manual override: marking ${reference} as paid (pf_payment_id=${pf_payment_id})`);
    updateBookingStatus(reference, 'paid', { pfPaymentId: pf_payment_id, manualOverride: true });
    return res.json({ status: 'paid', pfPaymentId: pf_payment_id });
  }

  res.json({ status: 'pending' });
}