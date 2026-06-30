// pages/api/payfast-init.js
import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, name, amount, bookingReference, metadata = {} } = req.body;

  if (!email || !amount || !bookingReference) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const merchantId = process.env.PAYFAST_MERCHANT_ID;
  const merchantKey = process.env.PAYFAST_MERCHANT_KEY;
  const passphrase = process.env.PAYFAST_PASSPHRASE;
  const isSandbox = process.env.PAYFAST_MODE === 'sandbox';
  const baseUrl = process.env.BASE_URL || `https://${req.headers.host}`;

  if (!merchantId || !merchantKey) {
    return res.status(500).json({ error: 'PayFast not configured' });
  }

  const amountDecimal = parseFloat(amount).toFixed(2);
  if (isNaN(amountDecimal) || amountDecimal <= 0) {
    return res.status(400).json({ error: 'Invalid amount' });
  }

  const returnUrl = `${baseUrl}/success`;
  const cancelUrl = `${baseUrl}/cancel`;
  const notifyUrl = `${baseUrl}/api/payfast-webhook`;

  const nameParts = (name || '').trim().split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  // TRUNCATE custom_str1 to max 255 characters
  let metadataString = JSON.stringify(metadata);
  if (metadataString.length > 255) {
    metadataString = metadataString.substring(0, 252) + '...';
    console.warn(`Metadata truncated from ${metadataString.length} to 255 chars`);
  }

  const pfData = {
    merchant_id: merchantId,
    merchant_key: merchantKey,
    return_url: returnUrl,
    cancel_url: cancelUrl,
    notify_url: notifyUrl,
    m_payment_id: bookingReference,
    amount: amountDecimal,
    item_name: (metadata.tourTitle || 'Tour Booking').substring(0, 100),
    item_description: `Booking ${bookingReference}`,
    email_address: email,
    name_first: firstName,
    name_last: lastName,
    custom_str1: metadataString,
  };

  // Remove empty fields
  Object.keys(pfData).forEach(key => {
    if (pfData[key] === '' || pfData[key] === undefined || pfData[key] === null) {
      delete pfData[key];
    }
  });

  // Generate signature – NO passphrase if empty/undefined
  const signatureString = Object.keys(pfData)
    .sort()
    .map(key => `${key}=${encodeURIComponent(pfData[key]).replace(/%20/g, '+')}`)
    .join('&');

  let toSign = signatureString;
  if (passphrase && passphrase.trim() !== '') {
    toSign += `&passphrase=${encodeURIComponent(passphrase).replace(/%20/g, '+')}`;
  }
  const signature = crypto.createHash('md5').update(toSign).digest('hex');
  pfData.signature = signature;

  const actionUrl = isSandbox
    ? 'https://sandbox.payfast.co.za/eng/process'
    : 'https://www.payfast.co.za/eng/process';

  res.status(200).json({ actionUrl, payfastData: pfData, bookingReference });
}