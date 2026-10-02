/**
 * Email Notification Service — Shutter Moments
 * Uses EmailJS to send real emails directly from the browser.
 * No backend required. Works with Gmail, Outlook, or any mail provider.
 *
 * SETUP (one-time, ~5 minutes):
 *  1. Go to https://www.emailjs.com/ and create a FREE account
 *  2. Dashboard → Email Services → Add New Service → choose Gmail → connect your Gmail
 *  3. Copy your SERVICE ID  (e.g. "service_abc123")
 *  4. Dashboard → Email Templates → Create New Template (x2)
 *     Use the two templates in the EMAILJS_TEMPLATES.md file in /client
 *  5. Copy each TEMPLATE ID
 *  6. Dashboard → Account → copy your PUBLIC KEY
 *  7. Create client/.env with the 4 lines shown below and restart the server
 */

import emailjs from "@emailjs/browser";

const SERVICE_ID   = import.meta.env.VITE_EMAILJS_SERVICE_ID || "";
const CONFIRM_TPL  = import.meta.env.VITE_EMAILJS_CONFIRMATION_TEMPLATE_ID || "";
const CANCEL_TPL   = import.meta.env.VITE_EMAILJS_CANCELLATION_TEMPLATE_ID || "";
const PUBLIC_KEY   = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || "";

const isConfigured = SERVICE_ID && CONFIRM_TPL && CANCEL_TPL && PUBLIC_KEY;

const fmt = (amount) =>
  `LKR ${Number(amount || 0).toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;

/**
 * Send booking CONFIRMATION email when 30% deposit is paid.
 */
export async function sendConfirmationEmail(booking, clientEmail, clientName) {
  const toEmail = clientEmail || booking?.clientEmail || "";
  const toName  = clientName  || booking?.client      || "Valued Customer";

  if (!toEmail || !toEmail.includes("@")) {
    console.warn("[EmailJS] No valid client email — skipping confirmation.");
    return { success: false, error: "No valid email address." };
  }

  if (!isConfigured) {
    console.warn(
      "[EmailJS] ⚠ Not configured yet.\n" +
      "Add these 4 lines to  client/.env  then restart:\n\n" +
      "  VITE_EMAILJS_SERVICE_ID=service_xxxxxxx\n" +
      "  VITE_EMAILJS_CONFIRMATION_TEMPLATE_ID=template_xxxxxxx\n" +
      "  VITE_EMAILJS_CANCELLATION_TEMPLATE_ID=template_xxxxxxx\n" +
      "  VITE_EMAILJS_PUBLIC_KEY=xxxxxxxxxxxxxxxxxxxx\n\n" +
      "Get free credentials at https://www.emailjs.com"
    );
    return { success: false, error: "EmailJS not configured." };
  }

  const deposit  = booking?.depositPaid      || (booking?.totalAmount || booking?.amount || 0) * 0.3;
  const balance  = booking?.balanceRemaining || (booking?.totalAmount || booking?.amount || 0) * 0.7;
  const services = booking?.selectedServices?.length > 0
    ? booking.selectedServices.map((s) => `${s.name} (+${fmt(s.price)})`).join(", ")
    : "Standard Photography Package";

  const params = {
    to_email:          toEmail,
    to_name:           toName,
    booking_id:        booking?.id               || "N/A",
    event_type:        booking?.event            || booking?.photographyType || "Photography Session",
    photographer_name: booking?.photographer     || "Your Photographer",
    event_date:        booking?.date             || "TBD",
    event_time:        booking?.time             || booking?.slotLabel || "TBD",
    location:          booking?.location         || "On-site",
    selected_services: services,
    total_amount:      fmt(booking?.totalAmount  || booking?.amount),
    deposit_paid:      fmt(deposit),
    balance_remaining: fmt(balance),
    booking_status:    "Confirmed ✓",
    reply_to:          "shuttermoments.studio@gmail.com",
  };

  try {
    const result = await emailjs.send(SERVICE_ID, CONFIRM_TPL, params, PUBLIC_KEY);
    console.log("[EmailJS] ✅ Confirmation email sent →", toEmail, "| Status:", result.status);
    return { success: true, result };
  } catch (error) {
    console.error("[EmailJS] ❌ Confirmation email FAILED:", error);
    return { success: false, error: error.text || error.message };
  }
}

/**
 * Send booking CANCELLATION email when admin or photographer cancels.
 */
export async function sendCancellationEmail(booking, clientEmail, clientName, reason, cancelledBy = "Management") {
  const toEmail = clientEmail || booking?.clientEmail || "";
  const toName  = clientName  || booking?.client      || "Valued Customer";

  if (!toEmail || !toEmail.includes("@")) {
    console.warn("[EmailJS] No valid client email — skipping cancellation.");
    return { success: false, error: "No valid email address." };
  }

  if (!isConfigured) {
    console.warn(
      "[EmailJS] ⚠ Not configured yet. Add VITE_EMAILJS_* variables to client/.env"
    );
    return { success: false, error: "EmailJS not configured." };
  }

  const params = {
    to_email:            toEmail,
    to_name:             toName,
    booking_id:          booking?.id           || "N/A",
    event_type:          booking?.event        || booking?.photographyType || "Photography Session",
    photographer_name:   booking?.photographer || "Your Photographer",
    event_date:          booking?.date         || "TBD",
    event_time:          booking?.time         || booking?.slotLabel || "TBD",
    location:            booking?.location     || "On-site",
    total_amount:        fmt(booking?.totalAmount || booking?.amount),
    deposit_paid:        fmt(booking?.depositPaid || 0),
    cancellation_reason: reason      || "Unforeseen emergency — we sincerely apologise.",
    cancelled_by:        cancelledBy,
    refund_note:         "Your 30% deposit will be refunded within 3–5 business days.",
    reply_to:            "shuttermoments.studio@gmail.com",
  };

  try {
    const result = await emailjs.send(SERVICE_ID, CANCEL_TPL, params, PUBLIC_KEY);
    console.log("[EmailJS] ✅ Cancellation email sent →", toEmail, "| Status:", result.status);
    return { success: true, result };
  } catch (error) {
    console.error("[EmailJS] ❌ Cancellation email FAILED:", error);
    return { success: false, error: error.text || error.message };
  }
}
