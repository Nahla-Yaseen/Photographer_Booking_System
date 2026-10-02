import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure Nodemailer Transporter
// If SMTP credentials exist in .env (e.g. Gmail App Password), use them;
// otherwise, use an Ethereal test transporter for safe development testing.
let transporter = null;

async function getTransporter() {
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  // Development Fallback: Ethereal test account or local logging
  if (!transporter) {
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log("Using Ethereal Mailer for test email delivery.");
    } catch (err) {
      console.warn("Could not create Ethereal account, defaulting to JSON transport", err);
      transporter = nodemailer.createTransport({ jsonTransport: true });
    }
  }
  return transporter;
}

// HTML Email Templates
function getConfirmationTemplate(booking, clientEmail, clientName) {
  const deposit = booking.totalAmount * 0.3;
  const balance = booking.totalAmount * 0.7;
  const photographerName = typeof booking.photographer === "string" 
    ? booking.photographer 
    : booking.photographer?.name || "Professional Photographer";

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b1120; color: #f1f5f9; margin: 0; padding: 20px; }
      .container { max-width: 600px; margin: 0 auto; background: #0f172a; border: 1px solid #1e293b; border-radius: 12px; overflow: hidden; }
      .header { background: linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%); padding: 30px 24px; text-align: center; border-bottom: 2px solid #3b82f6; }
      .header h1 { margin: 0; color: #ffffff; font-size: 24px; letter-spacing: 1px; }
      .header p { margin: 8px 0 0; color: #94a3b8; font-size: 14px; }
      .content { padding: 24px; }
      .badge { display: inline-block; background: rgba(34, 197, 94, 0.2); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.4); padding: 4px 12px; border-radius: 20px; font-weight: 600; font-size: 13px; }
      .details-card { background: #1e293b; border-radius: 8px; padding: 18px; margin: 20px 0; }
      .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #334155; font-size: 14px; }
      .detail-row:last-child { border-bottom: none; }
      .detail-label { color: #94a3b8; }
      .detail-value { color: #ffffff; font-weight: 600; }
      .financial-box { background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 8px; padding: 16px; margin-top: 20px; }
      .deposit-row { color: #4ade80; font-weight: bold; font-size: 16px; }
      .footer { padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #1e293b; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>📸 SHUTTER MOMENTS</h1>
        <p>Premium Photography Booking Confirmation</p>
      </div>
      <div class="content">
        <div style="text-align: center; margin-bottom: 20px;">
          <span class="badge">✓ 30% Advance Deposit Received</span>
        </div>
        <p>Dear <strong>${clientName || "Valued Client"}</strong>,</p>
        <p>Congratulations! Your photography session has been successfully confirmed. We have received your 30% advance deposit payment.</p>
        
        <div class="details-card">
          <div class="detail-row">
            <span class="detail-label">Booking ID</span>
            <span class="detail-value" style="color: #60a5fa;">${booking.id}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Photography Type</span>
            <span class="detail-value">${booking.photographyType || booking.event || "Photo Shoot"}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Assigned Photographer</span>
            <span class="detail-value">${photographerName}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Scheduled Date</span>
            <span class="detail-value">${booking.eventDate || booking.date}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Time Slot</span>
            <span class="detail-value">${booking.slotLabel || booking.time}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Location</span>
            <span class="detail-value">${booking.location || "On-site"}</span>
          </div>
        </div>

        <div class="financial-box">
          <div class="detail-row">
            <span class="detail-label">Total Booking Amount</span>
            <span class="detail-value">Rs. ${(booking.totalAmount || 0).toLocaleString()}</span>
          </div>
          <div class="detail-row deposit-row">
            <span>Advance Deposit Paid (30%)</span>
            <span>Rs. ${deposit.toLocaleString()}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Remaining Balance Due on Event Day (70%)</span>
            <span class="detail-value" style="color: #fbbf24;">Rs. ${balance.toLocaleString()}</span>
          </div>
        </div>

        <p style="margin-top: 24px; font-size: 13px; color: #94a3b8; line-height: 1.6;">
          Your photographer will contact you prior to the session to finalize shooting plans. If you need any assistance, please reply directly to this email or call our hotline.
        </p>
      </div>
      <div class="footer">
        &copy; ${new Date().getFullYear()} Shutter Moments. All rights reserved. • High Precision Photography Services
      </div>
    </div>
  </body>
  </html>
  `;
}

function getCancellationTemplate(booking, clientEmail, clientName, reason, cancelledBy) {
  const photographerName = typeof booking.photographer === "string" 
    ? booking.photographer 
    : booking.photographer?.name || "Professional Photographer";

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b1120; color: #f1f5f9; margin: 0; padding: 20px; }
      .container { max-width: 600px; margin: 0 auto; background: #0f172a; border: 1px solid #1e293b; border-radius: 12px; overflow: hidden; }
      .header { background: linear-gradient(135deg, #7f1d1d 0%, #0f172a 100%); padding: 30px 24px; text-align: center; border-bottom: 2px solid #ef4444; }
      .header h1 { margin: 0; color: #ffffff; font-size: 24px; letter-spacing: 1px; }
      .header p { margin: 8px 0 0; color: #fca5a5; font-size: 14px; }
      .content { padding: 24px; }
      .badge-cancel { display: inline-block; background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.4); padding: 6px 16px; border-radius: 20px; font-weight: 700; font-size: 13px; }
      .reason-box { background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 8px; padding: 16px; margin: 20px 0; color: #fecaca; }
      .details-card { background: #1e293b; border-radius: 8px; padding: 18px; margin: 20px 0; }
      .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #334155; font-size: 14px; }
      .detail-row:last-child { border-bottom: none; }
      .detail-label { color: #94a3b8; }
      .detail-value { color: #ffffff; font-weight: 600; }
      .refund-notice { background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 8px; padding: 16px; margin-top: 20px; color: #fef08a; font-size: 13px; line-height: 1.5; }
      .footer { padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #1e293b; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>⚠️ SHUTTER MOMENTS</h1>
        <p>Urgent: Booking Cancellation Notice</p>
      </div>
      <div class="content">
        <div style="text-align: center; margin-bottom: 20px;">
          <span class="badge-cancel">Booking Cancelled (${cancelledBy || "Management"})</span>
        </div>
        <p>Dear <strong>${clientName || "Valued Client"}</strong>,</p>
        <p>We deeply regret to inform you that due to critical/unforeseen circumstances, your photography booking has been cancelled by ${cancelledBy || "the management / photographer"}.</p>
        
        <div class="reason-box">
          <strong style="color: #ffffff; display: block; margin-bottom: 4px;">Reason for Cancellation:</strong>
          ${reason || "Critical situation / emergency beyond control."}
        </div>

        <div class="details-card">
          <div class="detail-row">
            <span class="detail-label">Booking ID</span>
            <span class="detail-value" style="color: #f87171;">${booking.id}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Photography Type</span>
            <span class="detail-value">${booking.photographyType || booking.event || "Photo Shoot"}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Photographer</span>
            <span class="detail-value">${photographerName}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Scheduled Date</span>
            <span class="detail-value">${booking.eventDate || booking.date}</span>
          </div>
        </div>

        <div class="refund-notice">
          <strong>💰 Advance Payment Refund Policy:</strong><br>
          Because this cancellation was initiated due to a critical circumstance on our side, your 30% advance deposit payment of <strong>Rs. ${((booking.totalAmount || 0) * 0.3).toLocaleString()}</strong> is fully eligible for a 100% immediate refund or free rescheduling to another date with a priority photographer. Our support desk is already processing your case.
        </div>

        <p style="margin-top: 24px; font-size: 13px; color: #94a3b8;">
          If you have any questions or would like to reschedule immediately, please reach out to us at <strong style="color: #60a5fa;">support@shuttermoments.com</strong> or call our 24/7 client helpline.
        </p>
      </div>
      <div class="footer">
        &copy; ${new Date().getFullYear()} Shutter Moments Support Team
      </div>
    </div>
  </body>
  </html>
  `;
}

// Send Email Route
app.post("/api/send-email", async (req, res) => {
  try {
    const { to, subject, type, booking, clientName, reason, cancelledBy } = req.body;

    if (!to) {
      return res.status(400).json({ success: false, error: "Recipient email is required" });
    }

    const mailer = await getTransporter();

    let html = "";
    let emailSubject = subject;

    if (type === "confirmation") {
      emailSubject = emailSubject || `Booking Confirmed #${booking?.id} – Shutter Moments`;
      html = getConfirmationTemplate(booking || {}, to, clientName);
    } else if (type === "cancellation") {
      emailSubject = emailSubject || `Urgent: Booking Cancellation Notice #${booking?.id} – Shutter Moments`;
      html = getCancellationTemplate(booking || {}, to, clientName, reason, cancelledBy);
    } else {
      html = req.body.html || `<p>${req.body.text || "Notification from Shutter Moments"}</p>`;
    }

    const info = await mailer.sendMail({
      from: process.env.EMAIL_FROM || '"Shutter Moments Photography" <bookings@shuttermoments.com>',
      to,
      subject: emailSubject,
      html,
    });

    let previewUrl = null;
    try {
      previewUrl = nodemailer.getTestMessageUrl(info);
    } catch (e) {}

    console.log(`[Email Sent] Type: ${type}, To: ${to}, ID: ${info.messageId}`);
    if (previewUrl) {
      console.log(`[Email Preview URL]: ${previewUrl}`);
    }

    return res.json({
      success: true,
      messageId: info.messageId,
      previewUrl: previewUrl || null,
      message: `Email successfully dispatched to ${to}`,
    });
  } catch (error) {
    console.error("Email send error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to send email",
    });
  }
});

// ── PayHere Secure Hash Generation ──────────────────────────────────────────
// The Merchant Secret NEVER leaves this server.
// Formula (from PayHere docs):
//   hash = MD5( merchant_id + order_id + amount_2dp + currency + MD5(merchant_secret).toUpperCase() ).toUpperCase()
app.post("/api/payment/hash", (req, res) => {
  try {
    const { order_id, amount, currency } = req.body;

    const merchantId     = process.env.PAYHERE_MERCHANT_ID;
    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;

    if (!merchantId || !merchantSecret) {
      return res.status(500).json({
        success: false,
        error: "PayHere credentials not configured in server/.env",
      });
    }
    if (!order_id || amount == null || !currency) {
      return res.status(400).json({
        success: false,
        error: "order_id, amount and currency are required",
      });
    }

    // Format amount to exactly 2 decimal places (PayHere requirement)
    const formattedAmount = Number(amount).toFixed(2);

    // Step 1 – hash the secret
    const secretHash = crypto
      .createHash("md5")
      .update(merchantSecret)
      .digest("hex")
      .toUpperCase();

    // Step 2 – build the final hash
    const raw = `${merchantId}${order_id}${formattedAmount}${currency}${secretHash}`;
    const hash = crypto
      .createHash("md5")
      .update(raw)
      .digest("hex")
      .toUpperCase();

    // Log for debugging – secret is NEVER logged
    console.log(
      `[PayHere Hash] merchant_id=${merchantId} order_id=${order_id} amount=${formattedAmount} currency=${currency} hash=${hash}`
    );

    const notifyUrl =
      process.env.PAYHERE_NOTIFY_URL ||
      "https://grunge-deserve-ambush.ngrok-free.dev/api/payment/notify";

    return res.json({
      success: true,
      merchant_id: merchantId,
      hash,
      notify_url: notifyUrl,
    });
  } catch (err) {
    console.error("[PayHere Hash Error]", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ── In-Memory Verified Payments Store ─────────────────────────────────────────
// Records payments verified via authentic PayHere Webhook (IPN)
const verifiedPayments = new Map();

// ── PayHere IPN Webhook Listener ──────────────────────────────────────────────
// PayHere sends an HTTP POST request to this URL when payment succeeds or fails.
// Payload format: application/x-www-form-urlencoded
app.post("/api/payment/notify", (req, res) => {
  try {
    const {
      merchant_id,
      order_id,
      payment_id,
      payhere_amount,
      payhere_currency,
      status_code,
      md5sig,
      custom_1,
      custom_2,
      status_message,
      method,
      card_holder_name,
      card_no,
    } = req.body;

    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;
    const configuredMerchantId = process.env.PAYHERE_MERCHANT_ID;

    console.log(
      `[PayHere Webhook Received] Order: ${order_id}, Payment ID: ${payment_id}, Status: ${status_code}, Amount: ${payhere_amount} ${payhere_currency}`
    );

    // 1. Verify merchant_id
    if (merchant_id !== configuredMerchantId) {
      console.error("[PayHere Webhook] Invalid merchant_id:", merchant_id);
      return res.status(400).send("Invalid merchant_id");
    }

    // 2. Verify md5sig
    // Formula: strtoupper(md5(merchant_id + order_id + payhere_amount + payhere_currency + status_code + strtoupper(md5(merchant_secret))))
    const secretHash = crypto
      .createHash("md5")
      .update(merchantSecret)
      .digest("hex")
      .toUpperCase();

    const expectedMd5sig = crypto
      .createHash("md5")
      .update(
        `${merchant_id}${order_id}${payhere_amount}${payhere_currency}${status_code}${secretHash}`
      )
      .digest("hex")
      .toUpperCase();

    if (expectedMd5sig !== md5sig) {
      console.error(
        `[PayHere Webhook] Hash verification failed! Expected: ${expectedMd5sig}, Received: ${md5sig}`
      );
      return res.status(400).send("Signature verification failed");
    }

    // 3. Process status code
    // 2 = Success, 0 = Pending, -1 = Canceled, -2 = Failed, -3 = Chargedback
    if (String(status_code) === "2") {
      console.log(
        `[PayHere Webhook] SUCCESSFUL PAYMENT VERIFIED for Order: ${order_id}, Payment ID: ${payment_id}`
      );
      verifiedPayments.set(order_id, {
        order_id,
        payment_id,
        amount: payhere_amount,
        currency: payhere_currency,
        status: "paid",
        statusCode: status_code,
        method: method || "PayHere",
        cardHolderName: card_holder_name || "",
        cardNo: card_no || "",
        verifiedAt: new Date().toISOString(),
      });
      return res.status(200).send("OK");
    } else {
      console.warn(
        `[PayHere Webhook] Non-success status code: ${status_code} (${status_message}) for order: ${order_id}`
      );
      verifiedPayments.set(order_id, {
        order_id,
        payment_id,
        amount: payhere_amount,
        currency: payhere_currency,
        status: "failed",
        statusCode: status_code,
        statusMessage: status_message,
        verifiedAt: new Date().toISOString(),
      });
      return res.status(200).send("Payment status recorded");
    }
  } catch (err) {
    console.error("[PayHere Webhook Error]", err);
    return res.status(500).send("Internal server error");
  }
});

// ── Payment Verification Query Endpoint ───────────────────────────────────────
// Allows client to check if PayHere webhook has verified payment for an order
app.get("/api/payment/verify/:orderId", (req, res) => {
  const { orderId } = req.params;
  const payment = verifiedPayments.get(orderId);

  if (!payment) {
    return res.status(404).json({
      success: false,
      paid: false,
      message: "No verified PayHere webhook received for this order ID yet.",
    });
  }

  return res.json({
    success: true,
    paid: payment.status === "paid",
    payment,
  });
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Only listen when running standalone locally, not on Vercel Serverless Functions
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Shutter Moments backend mailer server running on port ${PORT}`);
  });
}

process.on("uncaughtException", (err) => {
  console.error("[Mailer Server Uncaught Exception]:", err);
});

process.on("unhandledRejection", (reason) => {
  console.error("[Mailer Server Unhandled Rejection]:", reason);
});

export default app;
