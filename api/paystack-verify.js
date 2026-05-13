const PAYSTACK_BASE_URL = "https://api.paystack.co";

const getReference = (req) => {
  if (req.method === "GET") {
    return req.query?.reference || req.query?.trxref || "";
  }

  return req.body?.reference || req.body?.trxref || "";
};

export default async function handler(req, res) {
  if (!["GET", "POST"].includes(req.method)) {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!secretKey) {
      return res.status(500).json({
        error: "Missing PAYSTACK_SECRET_KEY",
      });
    }

    const reference = String(getReference(req) || "").trim();

    if (!reference) {
      return res.status(400).json({
        error: "Missing Paystack reference",
      });
    }

    const paystackRes = await fetch(
      `${PAYSTACK_BASE_URL}/transaction/verify/${encodeURIComponent(reference)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
        },
      }
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
    const paid = transaction?.status === "success";

    return res.status(200).json({
      success: true,
      paid,
      reference,
      status: transaction?.status,
      amount: transaction?.amount,
      currency: transaction?.currency,
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
