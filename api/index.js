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

// High-Contrast, Universal HTML Email Templates (Gmail Mobile / Dark Mode Compatible)
function getConfirmationTemplate(booking, clientEmail, clientName) {
  const deposit = (booking.totalAmount || booking.amount || 0) * 0.3;
  const balance = (booking.totalAmount || booking.amount || 0) * 0.7;
  const photographerName = typeof booking.photographer === "string" 
    ? booking.photographer 
    : booking.photographer?.name || booking.photographerName || "Professional Photographer";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>Booking Confirmed – Shutter Moments</title>
  <style>
    :root { color-scheme: light dark; supported-color-schemes: light dark; }
    @media (prefers-color-scheme: dark) {
      .dark-bg { background-color: #0f172a !important; }
      .dark-card { background-color: #1e293b !important; border-color: #334155 !important; }
      .dark-text { color: #f8fafc !important; }
      .dark-muted { color: #94a3b8 !important; }
      .dark-table-row { border-bottom-color: #334155 !important; }
    }
  </style>
</head>
<body class="dark-bg" style="margin: 0; padding: 20px 10px; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" align="center" style="max-width: 600px; margin: 0 auto;">
    <tr>
      <td>
        <table class="dark-card" width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#ffffff" style="background-color: #ffffff; border-radius: 12px; border: 1px solid #cbd5e1; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.06);">
          <!-- Header Banner -->
          <tr>
            <td bgcolor="#1e3a8a" style="background-color: #1e3a8a; padding: 30px 20px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff !important; font-size: 24px; font-weight: 800; letter-spacing: 0.5px; text-shadow: 0 1px 2px rgba(0,0,0,0.3);">
                📸 SHUTTER MOMENTS
              </h1>
              <p style="margin: 8px 0 0; color: #dbeafe !important; font-size: 14px; font-weight: 600;">
                Official Booking Confirmation &amp; Deposit Receipt
              </p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 28px 22px;">
              <!-- Deposit Paid Badge -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
                <tr>
                  <td align="center">
                    <span style="display: inline-block; background-color: #dcfce7; color: #14532d; border: 1px solid #86efac; padding: 7px 18px; border-radius: 24px; font-weight: 800; font-size: 13px; letter-spacing: 0.3px;">
                      ✓ 30% Advance Deposit Paid &amp; Confirmed
                    </span>
                  </td>
                </tr>
              </table>

              <!-- Greeting -->
              <p class="dark-text" style="margin: 0 0 10px; color: #0a0a0a; font-size: 17px; font-weight: 800;">
                Dear ${clientName || "Valued Client"},
              </p>
              <p class="dark-muted" style="margin: 0 0 22px; color: #1e293b; font-size: 15px; line-height: 1.6; font-weight: 500;">
                Congratulations! Your photography session has been successfully reserved and your date is locked in. We have securely processed your 30% advance deposit.
              </p>

              <!-- Booking Details Box -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#f8fafc" style="background-color: #f8fafc; border: 2px solid #e2e8f0; border-radius: 10px; margin-bottom: 22px; padding: 6px 16px;">
                <tr>
                  <td style="padding: 11px 0; border-bottom: 1px solid #e2e8f0; color: #334155; font-size: 13px; font-weight: 700;">Booking ID</td>
                  <td style="padding: 11px 0; border-bottom: 1px solid #e2e8f0; color: #1d4ed8; font-size: 15px; font-weight: 800; text-align: right;">${booking.id || "N/A"}</td>
                </tr>
                <tr>
                  <td style="padding: 11px 0; border-bottom: 1px solid #e2e8f0; color: #334155; font-size: 13px; font-weight: 700;">Photography Type</td>
                  <td class="dark-text" style="padding: 11px 0; border-bottom: 1px solid #e2e8f0; color: #0a0a0a; font-size: 14px; font-weight: 800; text-align: right;">${booking.photographyType || booking.event || "Photo Shoot"}</td>
                </tr>
                <tr>
                  <td style="padding: 11px 0; border-bottom: 1px solid #e2e8f0; color: #334155; font-size: 13px; font-weight: 700;">Photographer</td>
                  <td class="dark-text" style="padding: 11px 0; border-bottom: 1px solid #e2e8f0; color: #0a0a0a; font-size: 14px; font-weight: 800; text-align: right;">${photographerName}</td>
                </tr>
                <tr>
                  <td style="padding: 11px 0; border-bottom: 1px solid #e2e8f0; color: #334155; font-size: 13px; font-weight: 700;">Scheduled Date</td>
                  <td class="dark-text" style="padding: 11px 0; border-bottom: 1px solid #e2e8f0; color: #0a0a0a; font-size: 14px; font-weight: 800; text-align: right;">${booking.eventDate || booking.date || "Scheduled Date"}</td>
                </tr>
                <tr>
                  <td style="padding: 11px 0; border-bottom: 1px solid #e2e8f0; color: #334155; font-size: 13px; font-weight: 700;">Time Slot</td>
                  <td class="dark-text" style="padding: 11px 0; border-bottom: 1px solid #e2e8f0; color: #0a0a0a; font-size: 14px; font-weight: 800; text-align: right;">${booking.slotLabel || booking.time || "Scheduled Time"}</td>
                </tr>
                <tr>
                  <td style="padding: 11px 0; color: #334155; font-size: 13px; font-weight: 700;">Location</td>
                  <td class="dark-text" style="padding: 11px 0; color: #0a0a0a; font-size: 14px; font-weight: 800; text-align: right;">${booking.location || "On-site"}</td>
                </tr>
              </table>

              <!-- Financial Breakdown Box -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#f0fdf4" style="background-color: #f0fdf4; border: 2px solid #86efac; border-radius: 10px; margin-bottom: 24px; padding: 12px 16px;">
                <tr>
                  <td style="padding: 7px 0; color: #1f2937; font-size: 14px; font-weight: 700;">Total Booking Amount</td>
                  <td class="dark-text" style="padding: 7px 0; color: #0a0a0a; font-size: 16px; font-weight: 800; text-align: right;">Rs. ${(booking.totalAmount || booking.amount || 0).toLocaleString()}</td>
                </tr>
                <tr>
                  <td style="padding: 7px 0; color: #15803d; font-size: 14px; font-weight: 800;">30% Advance Deposit (Paid)</td>
                  <td style="padding: 7px 0; color: #15803d; font-size: 16px; font-weight: 800; text-align: right;">Rs. ${deposit.toLocaleString()} ✓</td>
                </tr>
                <tr>
                  <td style="padding: 7px 0; color: #9a3412; font-size: 13px; font-weight: 700;">Remaining Balance (Due on Event Day)</td>
                  <td style="padding: 7px 0; color: #c2410c; font-size: 15px; font-weight: 800; text-align: right;">Rs. ${balance.toLocaleString()}</td>
                </tr>
              </table>

              <!-- Notice -->
              <p class="dark-muted" style="margin: 0 0 10px; color: #475569; font-size: 13px; line-height: 1.6;">
                Your photographer will contact you ahead of time to coordinate any special requests. If you have any questions or need to make changes, simply reply to this email or contact us at <a href="mailto:mohamedysn130@gmail.com" style="color: #1d4ed8; text-decoration: underline; font-weight: 700;">mohamedysn130@gmail.com</a>.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td bgcolor="#f8fafc" style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 18px 20px; text-align: center; color: #64748b; font-size: 12px; line-height: 1.5;">
              &copy; ${new Date().getFullYear()} Shutter Moments Photography. All rights reserved.<br>
              Premium Professional Photography &amp; Creative Media Studio
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function getCancellationTemplate(booking, clientEmail, clientName, reason, cancelledBy) {
  const deposit = ((booking.totalAmount || booking.amount || 0) * 0.3);
  const photographerName = typeof booking.photographer === "string" 
    ? booking.photographer 
    : booking.photographer?.name || booking.photographerName || "Professional Photographer";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>Booking Cancellation Notice – Shutter Moments</title>
  <style>
    :root { color-scheme: light dark; supported-color-schemes: light dark; }
    @media (prefers-color-scheme: dark) {
      .dark-bg { background-color: #0f172a !important; }
      .dark-card { background-color: #1e293b !important; border-color: #334155 !important; }
      .dark-text { color: #f8fafc !important; }
      .dark-muted { color: #94a3b8 !important; }
      .dark-table-row { border-bottom-color: #334155 !important; }
    }
  </style>
</head>
<body class="dark-bg" style="margin: 0; padding: 20px 10px; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" align="center" style="max-width: 600px; margin: 0 auto;">
    <tr>
      <td>
        <table class="dark-card" width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#ffffff" style="background-color: #ffffff; border-radius: 12px; border: 1px solid #cbd5e1; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.06);">
          <!-- Header Banner -->
          <tr>
            <td bgcolor="#991b1b" style="background-color: #991b1b; padding: 30px 20px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff !important; font-size: 24px; font-weight: 800; letter-spacing: 0.5px; text-shadow: 0 1px 2px rgba(0,0,0,0.3);">
                ⚠️ SHUTTER MOMENTS
              </h1>
              <p style="margin: 8px 0 0; color: #fee2e2 !important; font-size: 14px; font-weight: 600;">
                Urgent: Booking Cancellation Notice
              </p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 28px 22px;">
              <!-- Status Badge -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
                <tr>
                  <td align="center">
                    <span style="display: inline-block; background-color: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; padding: 7px 18px; border-radius: 24px; font-weight: 800; font-size: 13px; letter-spacing: 0.3px;">
                      Booking Cancelled (${cancelledBy || "Management"})
                    </span>
                  </td>
                </tr>
              </table>

              <!-- Greeting -->
              <p class="dark-text" style="margin: 0 0 10px; color: #0a0a0a; font-size: 17px; font-weight: 800;">
                Dear ${clientName || "Valued Client"},
              </p>
              <p class="dark-muted" style="margin: 0 0 22px; color: #1e293b; font-size: 15px; line-height: 1.6; font-weight: 500;">
                We sincerely apologize to inform you that due to unexpected circumstances, your photography booking has been cancelled by ${cancelledBy || "our management"}.
              </p>

              <!-- Reason Box -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#fff1f2" style="background-color: #fff1f2; border: 2px solid #fecdd3; border-radius: 10px; padding: 14px 16px; margin-bottom: 22px;">
                <tr>
                  <td>
                    <strong style="color: #9f1239; font-size: 13px; display: block; margin-bottom: 4px; font-weight: 800;">Reason for Cancellation:</strong>
                    <span style="color: #881337; font-size: 15px; font-weight: 700; line-height: 1.4;">${reason || "Emergency situation beyond our control."}</span>
                  </td>
                </tr>
              </table>

              <!-- Booking Details Box -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#f8fafc" style="background-color: #f8fafc; border: 2px solid #e2e8f0; border-radius: 10px; margin-bottom: 22px; padding: 6px 16px;">
                <tr>
                  <td style="padding: 11px 0; border-bottom: 1px solid #e2e8f0; color: #334155; font-size: 13px; font-weight: 700;">Booking ID</td>
                  <td style="padding: 11px 0; border-bottom: 1px solid #e2e8f0; color: #dc2626; font-size: 15px; font-weight: 800; text-align: right;">${booking.id || "N/A"}</td>
                </tr>
                <tr>
                  <td style="padding: 11px 0; border-bottom: 1px solid #e2e8f0; color: #334155; font-size: 13px; font-weight: 700;">Photography Type</td>
                  <td class="dark-text" style="padding: 11px 0; border-bottom: 1px solid #e2e8f0; color: #0a0a0a; font-size: 14px; font-weight: 800; text-align: right;">${booking.photographyType || booking.event || "Photo Shoot"}</td>
                </tr>
                <tr>
                  <td style="padding: 11px 0; border-bottom: 1px solid #e2e8f0; color: #334155; font-size: 13px; font-weight: 700;">Photographer</td>
                  <td class="dark-text" style="padding: 11px 0; border-bottom: 1px solid #e2e8f0; color: #0a0a0a; font-size: 14px; font-weight: 800; text-align: right;">${photographerName}</td>
                </tr>
                <tr>
                  <td style="padding: 11px 0; color: #334155; font-size: 13px; font-weight: 700;">Scheduled Date</td>
                  <td class="dark-text" style="padding: 11px 0; color: #0a0a0a; font-size: 14px; font-weight: 800; text-align: right;">${booking.eventDate || booking.date || "Scheduled Date"}</td>
                </tr>
              </table>

              <!-- 100% Refund Guarantee Box -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#fefce8" style="background-color: #fefce8; border: 2px solid #fef08a; border-radius: 10px; padding: 14px 16px; margin-bottom: 24px;">
                <tr>
                  <td>
                    <strong style="color: #854d0e; font-size: 14px; display: block; margin-bottom: 6px; font-weight: 800;">💰 100% Advance Deposit Refund Policy:</strong>
                    <span style="color: #713f12; font-size: 13px; line-height: 1.6; font-weight: 600; display: block;">
                      Because this cancellation was initiated by our team, your 30% advance deposit payment of <strong style="color: #15803d; font-size: 14px;">Rs. ${deposit.toLocaleString()}</strong> is fully eligible for an immediate 100% refund or priority free rescheduling to any available date of your choice.
                    </span>
                  </td>
                </tr>
              </table>

              <!-- Assistance Note -->
              <p class="dark-muted" style="margin: 0; color: #475569; font-size: 13px; line-height: 1.6;">
                If you have questions regarding your refund or wish to reschedule, please reply directly to this email or reach us at <a href="mailto:mohamedysn130@gmail.com" style="color: #1d4ed8; text-decoration: underline; font-weight: 700;">mohamedysn130@gmail.com</a>.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td bgcolor="#f8fafc" style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 18px 20px; text-align: center; color: #64748b; font-size: 12px; line-height: 1.5;">
              &copy; ${new Date().getFullYear()} Shutter Moments Customer Care Team<br>
              Direct Support: mohamedysn130@gmail.com
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
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
