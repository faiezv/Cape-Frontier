// api/_lib/verifyPriceToken.js
import crypto from "crypto";

const TOKEN_TTL_MS = 15 * 60 * 1000; // 15 minutes

function getSecret() {
  const secret = process.env.PRICE_SIGNING_SECRET;
  if (!secret) throw new Error("PRICE_SIGNING_SECRET not set");
  return secret;
}

/**
 * Sign a payload into a `<base64url>.<hmac>` token.
 * The token's payload is public (base64 isn't encryption) — its
 * integrity is what the signature guarantees. Never put secrets in here.
 */
export function signPricePayload(payload) {
  const secret = getSecret();
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto
    .createHmac("sha256", secret)
    .update(encoded)
    .digest("base64url");
  return `${encoded}.${sig}`;
}

/**
 * Verify a token's signature and expiry. Returns the decoded payload
 * on success, or null on any failure (missing, malformed, tampered,
 * expired, no secret configured).
 */
export function verifyPriceToken(token) {
  if (!token) return null;
  let secret;
  try {
    secret = getSecret();
  } catch {
    return null;
  }

  const [encoded, sig] = String(token).split(".");
  if (!encoded || !sig) return null;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(encoded)
    .digest("base64url");

  // Constant-time comparison — avoid leaking signature bytes via timing.
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return null;
  if (!crypto.timingSafeEqual(a, b)) return null;

  try {
    const payload = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf8"),
    );
    if (payload.exp && Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

export { TOKEN_TTL_MS };