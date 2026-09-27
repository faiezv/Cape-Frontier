// api/paystack-verify.js
const PAYSTACK_BASE_URL = "https://api.paystack.co";

const ZERO_DECIMAL = new Set(["JPY", "KRW"]);

const getReference = (req) => {
  if (req.method === "GET") {
    return req.query?.reference || req.query?.trxref || "";
  }
  return req.body?.reference || req.body?.trxref || "";
};

const toMinorUnit = (amount, currency) => {
  const n = Number(amount);
  if (!Number.isFinite(n) || n < 0) return 0;
  return ZERO_DECIMAL.has(String(currency).toUpperCase())
    ? Math.round(n)
    : Math.round(n * 100);
};

export default async function handler(req, res) {
  if (!["GET", "POST"].includes(req.method)) {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const secretKey =
      process.env.VERCEL_ENV === "production"
        ? process.env.PAYSTACK_SECRET_KEY
        : process.env.PAYSTACK_SECRET_KEY_TEST;

    if (!secretKey) {
      return res.status(500).json({
        error:
          process.env.VERCEL_ENV === "production"
            ? "Missing PAYSTACK_SECRET_KEY"
            : "Missing PAYSTACK_SECRET_KEY_TEST",
      });
    }

    const reference = String(getReference(req) || "").trim();

    if (!reference) {
      return res.status(400).json({ error: "Missing Paystack reference" });
    }

    const paystackRes = await fetch(
      `${PAYSTACK_BASE_URL}/transaction/verify/${encodeURIComponent(reference)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
        },
      },
    );

    const paystackData = await paystackRes.json();

    if (!paystackRes.ok || !paystackData?.status) {
      return res.status(paystackRes.status || 500).json({
        success: false,
        error:
          paystackData?.message ||
          paystackData?.error ||
          "Failed to verify Paystack transaction",
        paystack: paystackData,
      });
    }

    const transaction = paystackData.data;
    const paidByGateway = transaction?.status === "success";
    const currency = String(transaction?.currency || "ZAR").toUpperCase();

    // Amount cross-check: initialize stashed `verifiedTotalMajor` in
    // metadata. If Paystack charged a different amount, refuse to
    // confirm the booking even though the gateway says success.
    let integrityOk = true;
    let expectedAmount = null;

    if (paidByGateway) {
      const meta = transaction?.metadata || {};
      const verifiedTotalMajor = Number(meta.verifiedTotalMajor);

      if (Number.isFinite(verifiedTotalMajor) && verifiedTotalMajor > 0) {
        expectedAmount = toMinorUnit(verifiedTotalMajor, currency);
        if (Number(transaction?.amount) !== expectedAmount) {
          integrityOk = false;
          console.error("[paystack/verify] Amount mismatch:", {
            reference,
            charged: transaction?.amount,
            expected: expectedAmount,
            currency,
          });
        }
      } else {
        // No verified amount in metadata — this transaction didn't
        // go through our initialize handler (or metadata was stripped).
        integrityOk = false;
        console.error(
          "[paystack/verify] Missing verifiedTotalMajor for reference",
          reference,
        );
      }
    }

    return res.status(200).json({
      success: true,
      paid: paidByGateway && integrityOk,
      integrityOk,
      reference,
      status: transaction?.status,
      amount: transaction?.amount,
      expectedAmount,
      currency,
      paidAt: transaction?.paid_at,
      channel: transaction?.channel,
      gatewayResponse: transaction?.gateway_response,
      customer: transaction?.customer || null,
      authorization: transaction?.authorization || null,
      metadata: transaction?.metadata || {},
      paystack: transaction,
    });
  } catch (error) {
    console.error("Paystack verify error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to verify Paystack transaction",
      details: error?.message || "Unknown Paystack error",
    });
  }
}