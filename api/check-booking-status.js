// pages/api/check-booking-status.js
import { getBookingStatus } from './payfast-webhook';

export default async function handler(req, res) {
  const { reference } = req.query;
  if (!reference) return res.status(400).json({ error: 'Missing reference' });
  const statusData = getBookingStatus(reference);
  res.json({ status: statusData.status });
}