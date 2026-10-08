import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import crypto from "crypto";
import Stripe from "stripe";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Helper to get Stripe instance dynamically so changes to process.env are always read
function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key);
}

// Nodemailer Transporter using Gmail
function getTransporter() {
  const user = process.env.EMAIL_USER || "mohamedysn130@gmail.com";
  const pass = process.env.EMAIL_PASS || "nhtx fwpj lgdc prrf";
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user,
      pass,
    },
  });
}

// Email templates
function getConfirmationTemplate(booking, clientEmail, clientName) {
  const deposit = (booking.totalAmount || 0) * 0.3;
  const balance = (booking.totalAmount || 0) * 0.7;
  const photographerName = typeof booking.photographer === "string" 
    ? booking.photographer 
    : booking.photographer?.name || "Professional Photographer";

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body { font-family: sans-serif; background-color: #0b1120; color: #f1f5f9; margin: 0; padding: 20px; }
      .container { max-width: 600px; margin: 0 auto; background: #0f172a; border-radius: 12px; padding: 24px; border: 1px solid #1e293b; }
      .header { text-align: center; border-bottom: 2px solid #3b82f6; padding-bottom: 16px; margin-bottom: 20px; }
      .badge { display: inline-block; background: rgba(34, 197, 94, 0.2); color: #4ade80; padding: 4px 12px; border-radius: 20px; font-weight: bold; }
      .card { background: #1e293b; border-radius: 8px; padding: 16px; margin: 16px 0; }
      .row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #334155; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h2>📸 SHUTTER MOMENTS</h2>
        <p>Premium Photography Booking Confirmation</p>
      </div>
      <div style="text-align: center;"><span class="badge">✓ 30% Advance Deposit Paid</span></div>
      <p>Dear <strong>${clientName || "Valued Client"}</strong>,</p>
      <p>Your session has been successfully reserved!</p>
      <div class="card">
        <div class="row"><span>Booking ID</span><strong>${booking.id || "N/A"}</strong></div>
        <div class="row"><span>Photographer</span><strong>${photographerName}</strong></div>
        <div class="row"><span>Date</span><strong>${booking.eventDate || booking.date || "Scheduled"}</strong></div>
        <div class="row"><span>Time Slot</span><strong>${booking.slotLabel || booking.time || "Scheduled"}</strong></div>
        <div class="row"><span>Total</span><strong>Rs. ${(booking.totalAmount || 0).toLocaleString()}</strong></div>
        <div class="row"><span>Deposit Paid (30%)</span><strong style="color: #4ade80;">Rs. ${deposit.toLocaleString()}</strong></div>
        <div class="row"><span>Remaining Due</span><strong style="color: #fbbf24;">Rs. ${balance.toLocaleString()}</strong></div>
      </div>
    </div>
  </body>
  </html>`;
}

function getCancellationTemplate(booking, clientEmail, clientName, reason, cancelledBy) {
  const deposit = ((booking.totalAmount || booking.amount || 0) * 0.3);
  const photographerName = typeof booking.photographer === "string" 
    ? booking.photographer 
    : booking.photographer?.name || "Professional Photographer";

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0b1120; color: #f1f5f9; margin: 0; padding: 20px; }
      .container { max-width: 600px; margin: 0 auto; background: #0f172a; border-radius: 12px; padding: 24px; border: 1px solid #1e293b; }
      .header { text-align: center; border-bottom: 2px solid #ef4444; padding-bottom: 16px; margin-bottom: 20px; }
      .badge-cancel { display: inline-block; background: rgba(239, 68, 68, 0.2); color: #f87171; padding: 6px 16px; border-radius: 20px; font-weight: bold; }
      .reason-box { background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 8px; padding: 16px; margin: 16px 0; color: #fecaca; }
      .card { background: #1e293b; border-radius: 8px; padding: 16px; margin: 16px 0; }
      .row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #334155; }
      .refund-notice { background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 8px; padding: 16px; margin-top: 16px; color: #fef08a; font-size: 13px; line-height: 1.5; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h2 style="color: #ffffff; margin: 0;">⚠️ SHUTTER MOMENTS</h2>
        <p style="color: #fca5a5; margin: 6px 0 0;">Urgent: Booking Cancellation Notice</p>
      </div>
      <div style="text-align: center; margin-bottom: 16px;">
        <span class="badge-cancel">Booking Cancelled (${cancelledBy || "Management"})</span>
      </div>
      <p>Dear <strong>${clientName || "Valued Client"}</strong>,</p>
      <p>We regret to inform you that due to unexpected circumstances, your photography booking has been cancelled by ${cancelledBy || "management"}.</p>
      
      <div class="reason-box">
        <strong style="color: #ffffff; display: block; margin-bottom: 4px;">Reason for Cancellation:</strong>
        ${reason || "Emergency situation beyond our control."}
      </div>

      <div class="card">
        <div class="row"><span>Booking ID</span><strong style="color: #f87171;">${booking.id || "N/A"}</strong></div>
        <div class="row"><span>Photography Type</span><strong>${booking.photographyType || booking.event || "Photo Shoot"}</strong></div>
        <div class="row"><span>Photographer</span><strong>${photographerName}</strong></div>
        <div class="row"><span>Scheduled Date</span><strong>${booking.eventDate || booking.date || "Scheduled Date"}</strong></div>
      </div>

      <div class="refund-notice">
        <strong>💰 Advance Deposit Refund Policy:</strong><br>
        Because this cancellation was initiated from our side, your 30% advance deposit payment of <strong>Rs. ${deposit.toLocaleString()}</strong> is fully eligible for an immediate 100% refund or priority rescheduling.
      </div>
      <p style="margin-top: 20px; font-size: 13px; color: #94a3b8;">
        If you have any questions, reply to this email or contact support at <strong style="color: #60a5fa;">mohamedysn130@gmail.com</strong>.
      </p>
    </div>
  </body>
  </html>`;
}

// ── Main API Router ──────────────────────────────────────────────────────────
const router = express.Router();

// Health Check
router.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    stripeConfigured: Boolean(process.env.STRIPE_SECRET_KEY),
  });
});

// Stripe Config
router.get("/payment/stripe/config", (req, res) => {
  res.json({
    success: true,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || "",
    configured: Boolean(process.env.STRIPE_SECRET_KEY),
    currency: (process.env.STRIPE_CURRENCY || "lkr").toLowerCase(),
  });
});

// Create Stripe Checkout Session
router.post("/payment/stripe/create-checkout-session", async (req, res) => {
  try {
    const stripe = getStripe();
    if (!stripe) {
      return res.status(400).json({
        success: false,
        error: "STRIPE_SECRET_KEY is not configured in Vercel Environment Variables. Please add STRIPE_SECRET_KEY in Vercel Dashboard -> Settings -> Environment Variables.",
      });
    }

    const { booking, customerInfo, amount, currency: reqCurrency, returnOrigin } = req.body;

    if (!booking) {
      return res.status(400).json({ success: false, error: "Booking data is required" });
    }

    const depositAmount = Number(amount || booking.depositPaid || (booking.totalAmount ? booking.totalAmount * 0.3 : 15000));
    const currency = (reqCurrency || process.env.STRIPE_CURRENCY || "lkr").toLowerCase();
    const orderId = "ORD-" + Date.now().toString().slice(-8);

    const origin = (
      returnOrigin ||
      req.headers.origin ||
      req.headers.referer ||
      process.env.CLIENT_URL ||
      "http://localhost:5173"
    ).replace(/\/$/, "");

    const photographerName = typeof booking.photographer === "string"
      ? booking.photographer
      : booking.photographer?.name || booking.photographerName || "Professional Photographer";

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: currency,
            product_data: {
              name: `${booking.photographyType || booking.event || "Photography Session"} (30% Advance Deposit)`,
              description: `Booking #${orderId} with ${photographerName} on ${booking.eventDate || booking.date || "Scheduled Date"}`,
            },
            unit_amount: Math.round(depositAmount * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      customer_email: customerInfo?.email || booking.clientEmail || undefined,
      success_url: `${origin}/booking-confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/payment?cancelled=true`,
      metadata: {
        orderId,
        bookingId: booking.id || orderId,
        clientName: customerInfo?.name || booking.client || "Client",
        clientEmail: customerInfo?.email || booking.clientEmail || "",
        clientPhone: customerInfo?.phone || booking.clientPhone || "",
        photographerName,
        totalAmount: String(booking.totalAmount || Math.round(depositAmount / 0.3)),
        depositAmount: String(depositAmount),
        eventDate: booking.eventDate || booking.date || "",
        slotLabel: booking.slotLabel || booking.time || "",
        location: booking.location || "On-site",
        photographyType: booking.photographyType || booking.event || "Photo Shoot",
      },
    });

    return res.json({
      success: true,
      url: session.url,
      sessionId: session.id,
      orderId,
    });
  } catch (error) {
    console.error("[Stripe Create Checkout Error]:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to create Stripe checkout session",
    });
  }
});

// Verify Stripe Session
router.get("/payment/stripe/verify-session/:sessionId", async (req, res) => {
  try {
    const stripe = getStripe();
    if (!stripe) {
      return res.status(400).json({ success: false, error: "Stripe not configured on server" });
    }

    const { sessionId } = req.params;
    if (!sessionId) {
      return res.status(400).json({ success: false, error: "Session ID required" });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      return res.json({
        success: true,
        paid: true,
        session: {
          id: session.id,
          paymentIntent: session.payment_intent,
          amountTotal: session.amount_total / 100,
          currency: session.currency,
          customerDetails: session.customer_details,
          metadata: session.metadata,
        },
      });
    } else {
      return res.json({
        success: true,
        paid: false,
        status: session.payment_status,
      });
    }
  } catch (error) {
    console.error("[Stripe Verify Error]:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to verify Stripe session",
    });
  }
});

// Email Dispatch
router.post("/send-email", async (req, res) => {
  try {
    const { to, subject, type, booking, clientName, reason, cancelledBy } = req.body;
    if (!to) {
      return res.status(400).json({ success: false, error: "Recipient email is required" });
    }

    const mailer = await getTransporter();
    let html = "";
    let emailSubject = subject;

    if (type === "cancellation") {
      emailSubject = emailSubject || `⚠️ Urgent: Booking Cancellation Notice #${booking?.id || "N/A"} – Shutter Moments`;
      html = getCancellationTemplate(booking || {}, to, clientName, reason, cancelledBy);
    } else if (type === "confirmation") {
      emailSubject = emailSubject || `Booking Confirmed #${booking?.id || "N/A"} – Shutter Moments`;
      html = getConfirmationTemplate(booking || {}, to, clientName);
    } else {
      emailSubject = emailSubject || `Notification #${booking?.id || "N/A"} – Shutter Moments`;
      html = req.body.html || `<p>${req.body.text || "Notification"}</p>`;
    }

    const info = await mailer.sendMail({
      from: process.env.EMAIL_FROM || '"Shutter Moments Photography" <mohamedysn130@gmail.com>',
      to,
      subject: emailSubject,
      html,
    });

    console.log(`[Email Sent] Type: ${type}, To: ${to}, Message ID: ${info.messageId}`);
    return res.json({ success: true, messageId: info.messageId });
  } catch (err) {
    console.error("Email send error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PayHere Legacy Hash (kept for backward compatibility)
router.post("/payment/hash", (req, res) => {
  try {
    const { order_id, amount, currency } = req.body;
    const merchantId = process.env.PAYHERE_MERCHANT_ID;
    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;

    if (!merchantId || !merchantSecret) {
      return res.status(500).json({ success: false, error: "PayHere not configured" });
    }

    const formattedAmount = Number(amount).toFixed(2);
    const secretHash = crypto.createHash("md5").update(merchantSecret).digest("hex").toUpperCase();
    const raw = `${merchantId}${order_id}${formattedAmount}${currency}${secretHash}`;
    const hash = crypto.createHash("md5").update(raw).digest("hex").toUpperCase();

    return res.json({ success: true, merchant_id: merchantId, hash });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Mount router on BOTH "/api" AND "/" so Vercel rewrites will always match!
app.use("/api", router);
app.use("/", router);

// Global Error Handler ensures JSON is ALWAYS returned
app.use((err, req, res, next) => {
  console.error("[Unhandled API Error]:", err);
  res.status(500).json({
    success: false,
    error: err.message || "Internal server error",
  });
});

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Shutter Moments backend running on port ${PORT}`);
  });
}

export default app;
