/**
 * Email Notification Service — Shutter Moments
 * Uses EmailJS with automatic fallback to Backend Nodemailer (Gmail SMTP).
 */

import emailjs from "@emailjs/browser";

const SERVICE_ID   = import.meta.env.VITE_EMAILJS_SERVICE_ID || "service_86yu5zb";
const CONFIRM_TPL  = import.meta.env.VITE_EMAILJS_CONFIRMATION_TEMPLATE_ID || "template_qzp0rvj";
const CANCEL_TPL   = import.meta.env.VITE_EMAILJS_CANCELLATION_TEMPLATE_ID || "template_jmmo72r";
const PUBLIC_KEY   = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || "Veny-yKedmPsL3DZ7";

const fmt = (amount) =>
  `LKR ${Number(amount || 0).toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;

// Backend Server Mailer Fallback
async function sendViaBackend(type, booking, toEmail, toName, reason = "", cancelledBy = "Management") {
  try {
    const apiUrl = import.meta.env.VITE_PAYMENT_API_URL ?? (import.meta.env.PROD ? "" : "http://localhost:5000");
    const resp = await fetch(`${apiUrl}/api/send-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: toEmail,
        type,
        booking,
        clientName: toName,
        reason,
        cancelledBy,
      }),
    });
    const data = await resp.json();
    console.log("[Backend Mailer] Response:", data);
    return data;
  } catch (err) {
    console.warn("[Backend Mailer Error]:", err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Send booking CONFIRMATION email when deposit is paid.
 */
export async function sendConfirmationEmail(booking, clientEmail, clientName) {
  const toEmail = clientEmail || booking?.clientEmail || "";
  const toName  = clientName  || booking?.client      || "Valued Customer";

  if (!toEmail || !toEmail.includes("@")) {
    console.warn("[EmailService] No valid client email — skipping confirmation.");
    return { success: false, error: "No valid email address." };
  }

  const deposit  = booking?.depositPaid      || (booking?.totalAmount || booking?.amount || 0) * 0.3;
  const balance  = booking?.balanceRemaining || (booking?.totalAmount || booking?.amount || 0) * 0.7;
  const services = booking?.selectedServices?.length > 0
    ? booking.selectedServices.map((s) => `${typeof s === "string" ? s : s.name} (+${fmt(s.price || 0)})`).join(", ")
    : "Standard Photography Package";

  const photographerName = typeof booking?.photographer === "string"
    ? booking.photographer
    : booking?.photographer?.name || booking?.photographerName || "Your Photographer";

  const params = {
    to_email:          toEmail,
    to_name:           toName,
    booking_id:        booking?.id               || "N/A",
    event_type:        booking?.event            || booking?.photographyType || "Photography Session",
    photographer_name: photographerName,
    event_date:        booking?.eventDate        || booking?.date || "TBD",
    event_time:        booking?.slotLabel        || booking?.time || "TBD",
    location:          booking?.location         || "On-site",
    selected_services: services,
    total_amount:      fmt(booking?.totalAmount  || booking?.amount),
    deposit_paid:      fmt(deposit),
    balance_remaining: fmt(balance),
    booking_status:    "Confirmed ✓",
    reply_to:          "mohamedysn130@gmail.com",
  };

  // 1. Try EmailJS
  try {
    if (SERVICE_ID && CONFIRM_TPL && PUBLIC_KEY) {
      const result = await emailjs.send(SERVICE_ID, CONFIRM_TPL, params, PUBLIC_KEY);
      console.log("[EmailJS] ✅ Confirmation email sent →", toEmail, "| Status:", result.status);
      return { success: true, result };
    }
  } catch (emailjsError) {
    console.warn("[EmailJS] Send failed, trying backend mailer fallback...", emailjsError);
  }

  // 2. Fallback: Backend Nodemailer
  return await sendViaBackend("confirmation", booking, toEmail, toName);
}

/**
 * Send booking CANCELLATION email when admin or photographer cancels.
 */
export async function sendCancellationEmail(booking, clientEmail, clientName, reason, cancelledBy = "Management") {
  const toEmail = clientEmail || booking?.clientEmail || "";
  const toName  = clientName  || booking?.client      || "Valued Customer";

  if (!toEmail || !toEmail.includes("@")) {
    console.warn("[EmailService] No valid client email — skipping cancellation.");
    return { success: false, error: "No valid email address." };
  }

  const photographerName = typeof booking?.photographer === "string"
    ? booking.photographer
    : booking?.photographer?.name || booking?.photographerName || "Your Photographer";

  const params = {
    to_email:            toEmail,
    to_name:             toName,
    booking_id:          booking?.id           || "N/A",
    event_type:          booking?.event        || booking?.photographyType || "Photography Session",
    photographer_name:   photographerName,
    event_date:          booking?.eventDate    || booking?.date || "TBD",
    event_time:          booking?.slotLabel    || booking?.time || "TBD",
    location:            booking?.location     || "On-site",
    total_amount:        fmt(booking?.totalAmount || booking?.amount),
    deposit_paid:        fmt(booking?.depositPaid || 0),
    cancellation_reason: reason                || "Unforeseen emergency — we sincerely apologise.",
    cancelled_by:        cancelledBy,
    refund_note:         "Your 30% deposit will be refunded within 3–5 business days.",
    reply_to:            "mohamedysn130@gmail.com",
  };

  // 1. Try EmailJS
  try {
    if (SERVICE_ID && CANCEL_TPL && PUBLIC_KEY) {
      const result = await emailjs.send(SERVICE_ID, CANCEL_TPL, params, PUBLIC_KEY);
      console.log("[EmailJS] ✅ Cancellation email sent →", toEmail, "| Status:", result.status);
      return { success: true, result };
    }
  } catch (emailjsError) {
    console.warn("[EmailJS] Send failed, trying backend mailer fallback...", emailjsError);
  }

  // 2. Fallback: Backend Nodemailer
  return await sendViaBackend("cancellation", booking, toEmail, toName, reason, cancelledBy);
}
