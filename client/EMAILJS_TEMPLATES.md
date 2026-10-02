# EmailJS Template Setup Guide

Paste the HTML below into each EmailJS template body.
The variable names in {{double_braces}} are sent automatically by the app.

---

## Template 1: BOOKING CONFIRMATION
Template Name suggestion: `shutter_confirmation`

**Subject line:**
```
Booking Confirmed ? | {{event_type}} � {{booking_id}}
```

**Body (HTML):**
```html
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
  .container { max-width: 600px; margin: 30px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
  .header { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 40px 30px; text-align: center; }
  .header h1 { color: #f5a623; margin: 0; font-size: 28px; letter-spacing: 2px; }
  .header p { color: #ccc; margin: 8px 0 0; font-size: 14px; }
  .badge { background: #22c55e; color: white; display: inline-block; padding: 6px 20px; border-radius: 20px; font-weight: bold; margin: 20px 0; font-size: 14px; }
  .body { padding: 30px; }
  .greeting { font-size: 18px; color: #333; margin-bottom: 20px; }
  .detail-box { background: #f9fafb; border-left: 4px solid #f5a623; border-radius: 8px; padding: 20px; margin: 20px 0; }
  .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; font-size: 14px; }
  .detail-row:last-child { border-bottom: none; }
  .label { color: #666; font-weight: 600; }
  .value { color: #222; text-align: right; }
  .payment-box { background: #ecfdf5; border: 1px solid #86efac; border-radius: 8px; padding: 20px; margin: 20px 0; }
  .payment-box h3 { color: #16a34a; margin: 0 0 12px; }
  .amount-row { display: flex; justify-content: space-between; font-size: 14px; padding: 4px 0; }
  .total { font-weight: bold; color: #1e293b; font-size: 16px; }
  .footer { background: #1a1a2e; color: #888; text-align: center; padding: 20px; font-size: 12px; }
  .footer a { color: #f5a623; text-decoration: none; }
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <h1>&#128247; Shutter Moments</h1>
    <p>Professional Photography Studio</p>
    <div class="badge">&#10003; Booking Confirmed</div>
  </div>
  <div class="body">
    <p class="greeting">Dear {{to_name}},</p>
    <p>Your booking has been <strong>confirmed</strong>! Your 30% advance deposit has been received and your session is now reserved. Here are your booking details:</p>

    <div class="detail-box">
      <div class="detail-row"><span class="label">Booking ID</span><span class="value">{{booking_id}}</span></div>
      <div class="detail-row"><span class="label">Event Type</span><span class="value">{{event_type}}</span></div>
      <div class="detail-row"><span class="label">Photographer</span><span class="value">{{photographer_name}}</span></div>
      <div class="detail-row"><span class="label">Date</span><span class="value">{{event_date}}</span></div>
      <div class="detail-row"><span class="label">Time</span><span class="value">{{event_time}}</span></div>
      <div class="detail-row"><span class="label">Location</span><span class="value">{{location}}</span></div>
      <div class="detail-row"><span class="label">Services</span><span class="value">{{selected_services}}</span></div>
    </div>

    <div class="payment-box">
      <h3>&#128176; Payment Summary</h3>
      <div class="amount-row"><span>Total Package Amount</span><span class="total">{{total_amount}}</span></div>
      <div class="amount-row" style="color:#16a34a"><span>Deposit Paid (30%)</span><span>{{deposit_paid}}</span></div>
      <div class="amount-row" style="color:#dc2626"><span>Balance Remaining (due on day)</span><span>{{balance_remaining}}</span></div>
    </div>

    <p style="color:#555;font-size:14px;">Please bring the remaining balance on your session day. If you have any questions, reply to this email or contact us directly.</p>
    <p style="color:#555;font-size:14px;">We look forward to capturing your beautiful moments!</p>
  </div>
  <div class="footer">
    <p>&copy; 2026 Shutter Moments Photography Studio</p>
    <p><a href="mailto:{{reply_to}}">{{reply_to}}</a></p>
  </div>
</div>
</body>
</html>
```

---

## Template 2: BOOKING CANCELLATION
Template Name suggestion: `shutter_cancellation`

**Subject line:**
```
Important: Booking Cancellation Notice � {{booking_id}}
```

**Body (HTML):**
```html
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
  .container { max-width: 600px; margin: 30px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
  .header { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 40px 30px; text-align: center; }
  .header h1 { color: #f5a623; margin: 0; font-size: 28px; letter-spacing: 2px; }
  .badge { background: #ef4444; color: white; display: inline-block; padding: 6px 20px; border-radius: 20px; font-weight: bold; margin: 20px 0; font-size: 14px; }
  .body { padding: 30px; }
  .greeting { font-size: 18px; color: #333; margin-bottom: 20px; }
  .reason-box { background: #fef2f2; border-left: 4px solid #ef4444; border-radius: 8px; padding: 20px; margin: 20px 0; }
  .reason-box h3 { color: #dc2626; margin: 0 0 8px; }
  .detail-box { background: #f9fafb; border-left: 4px solid #94a3b8; border-radius: 8px; padding: 20px; margin: 20px 0; }
  .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; font-size: 14px; }
  .detail-row:last-child { border-bottom: none; }
  .label { color: #666; font-weight: 600; }
  .value { color: #222; text-align: right; }
  .refund-box { background: #eff6ff; border: 1px solid #93c5fd; border-radius: 8px; padding: 20px; margin: 20px 0; }
  .refund-box h3 { color: #1d4ed8; margin: 0 0 8px; }
  .footer { background: #1a1a2e; color: #888; text-align: center; padding: 20px; font-size: 12px; }
  .footer a { color: #f5a623; text-decoration: none; }
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <h1>&#128247; Shutter Moments</h1>
    <p>Professional Photography Studio</p>
    <div class="badge">&#10007; Booking Cancelled</div>
  </div>
  <div class="body">
    <p class="greeting">Dear {{to_name}},</p>
    <p>We regret to inform you that your booking has been <strong>cancelled</strong> by {{cancelled_by}}. We sincerely apologise for any inconvenience this has caused.</p>

    <div class="reason-box">
      <h3>Reason for Cancellation</h3>
      <p style="margin:0;color:#333;">{{cancellation_reason}}</p>
    </div>

    <div class="detail-box">
      <div class="detail-row"><span class="label">Booking ID</span><span class="value">{{booking_id}}</span></div>
      <div class="detail-row"><span class="label">Event Type</span><span class="value">{{event_type}}</span></div>
      <div class="detail-row"><span class="label">Photographer</span><span class="value">{{photographer_name}}</span></div>
      <div class="detail-row"><span class="label">Date</span><span class="value">{{event_date}}</span></div>
      <div class="detail-row"><span class="label">Time</span><span class="value">{{event_time}}</span></div>
      <div class="detail-row"><span class="label">Location</span><span class="value">{{location}}</span></div>
      <div class="detail-row"><span class="label">Amount Paid (Deposit)</span><span class="value">{{deposit_paid}}</span></div>
    </div>

    <div class="refund-box">
      <h3>&#128176; Refund Information</h3>
      <p style="margin:0;color:#1e40af;">{{refund_note}}</p>
    </div>

    <p style="color:#555;font-size:14px;">If you have any questions or need assistance rebooking, please contact us at <a href="mailto:{{reply_to}}">{{reply_to}}</a>.</p>
    <p style="color:#555;font-size:14px;">Once again, we deeply apologise for this inconvenience.</p>
  </div>
  <div class="footer">
    <p>&copy; 2026 Shutter Moments Photography Studio</p>
    <p><a href="mailto:{{reply_to}}">{{reply_to}}</a></p>
  </div>
</div>
</body>
</html>
```
