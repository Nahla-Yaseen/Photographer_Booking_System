import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle, CreditCard, Lock, Mail, User, Phone,
  AlertCircle, ExternalLink, HelpCircle, ShieldCheck, ChevronDown, ChevronUp
} from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import { useBooking } from "../../context/BookingContext";
import { useAuth } from "../../context/AuthContext";
import { PHOTOGRAPHERS } from "../../data/mockData";

const PAYMENT_API = import.meta.env.VITE_PAYMENT_API_URL ?? (import.meta.env.PROD ? "" : "http://localhost:5000");


export default function PaymentPage() {
  const navigate = useNavigate();
  const { user, photographersList } = useAuth();
  const { booking, confirmBooking } = useBooking();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [showGuide, setShowGuide] = useState(false);

  // Auto-fill customer details from registered customer account
  const [customerInfo, setCustomerInfo] = useState(() => {
    let saved = null;
    try {
      const local = localStorage.getItem("shutter_user");
      if (local) saved = JSON.parse(local);
    } catch (e) {}
    return {
      name: user?.name || saved?.name || "",
      email: user?.email || saved?.email || "",
      phone: user?.phone || saved?.phone || "",
    };
  });

  useEffect(() => {
    if (user?.name || user?.email || user?.phone) {
      setCustomerInfo((prev) => ({
        name: user.name || prev.name,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
      }));
    }
  }, [user]);

  // Merge live Firestore photographers with static mock data
  const allPhotographers = [
    ...(photographersList || []),
    ...PHOTOGRAPHERS.filter(mp => !(photographersList || []).some(lp => lp.id === mp.id)),
  ];

  const photographer =
    allPhotographers.find(p => p.id === booking.photographerId) ||
    allPhotographers.find(p => p.name === booking.photographer || p.name === booking.photographerName);

  const photographerName =
    photographer?.name ||
    booking.photographerName ||
    (typeof booking.photographer === "string" && booking.photographer !== "Professional Photographer" ? booking.photographer : null) ||
    "Alex Morgan";

  const servicesTotal = (booking.selectedServices || []).reduce((a, s) => a + s.price, 0);
  const slotCount = Math.max(1, booking.selectedSlotIds?.length || 1);
  const isTimeBased = booking.bookingType === "time_based";
  const photoPrice = isTimeBased
    ? (photographer?.hourlyRate || Math.round((photographer?.price || 36000) / 6) || 6000) * slotCount
    : (photographer?.price || 45000);

  const totalAmount = photoPrice + servicesTotal;
  const depositAmount = Math.round(totalAmount * 0.3); // 30% deposit

  const merchantId = "(from server)"; // displayed only; real value comes from backend

  // Finalize booking after payment
  const completeBookingProcess = (paymentRef = "PAYHERE-SANDBOX-" + Date.now()) => {
    confirmBooking(
      {
        ...photographer,
        name: photographerName,
        id: photographer?.id || booking.photographerId,
      },
      {
        name: customerInfo.name || user?.name || "Valued Client",
        email: customerInfo.email || user?.email || "customer@shuttermoments.com",
        phone: customerInfo.phone || user?.phone || "+94 77 123 4567",
        clientId: user?.id || null,
        userId: user?.id || null,
        paymentRef,
      }
    );
    navigate("/booking-confirmation");
  };

  // Launch PayHere Sandbox Checkout Popup
  const handlePayHerePayment = async (e) => {
    e?.preventDefault();
    if (!customerInfo.email) {
      setError("Please provide an email address to receive your confirmation & invoice.");
      return;
    }
    setError("");
    setProcessing(true);

    const orderId         = "ORD-" + Date.now().toString().slice(-8);
    const formattedAmount = depositAmount.toFixed(2);

    // ── Fetch hash and notify_url from backend (secret never leaves server) ──
    let backendMerchantId, hash, backendNotifyUrl;
    try {
      const resp = await fetch(`${PAYMENT_API}/api/payment/hash`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ order_id: orderId, amount: formattedAmount, currency: "LKR" }),
      });
      const data = await resp.json();
      if (!resp.ok || !data.success) {
        throw new Error(data.error || "Backend hash request failed");
      }
      backendMerchantId = data.merchant_id;
      hash              = data.hash;
      backendNotifyUrl  = data.notify_url || import.meta.env.VITE_PAYHERE_NOTIFY_URL || "https://grunge-deserve-ambush.ngrok-free.dev/api/payment/notify";
    } catch (err) {
      setProcessing(false);
      setError(`Could not reach payment server: ${err.message}. Make sure the backend is running (npm run dev in /server).`);
      return;
    }

    if (window.payhere) {
      const paymentObject = {
        sandbox:     true,
        merchant_id: backendMerchantId,
        return_url:  window.location.origin + "/booking-confirmation",
        cancel_url:  window.location.href,
        notify_url:  backendNotifyUrl,
        order_id:    orderId,
        items:       `${booking.photographyType || "Photo Shoot"} (30% Advance Deposit)`,
        amount:      formattedAmount,
        currency:    "LKR",
        hash:        hash,
        first_name:  (customerInfo.name || "Customer").split(" ")[0] || "Customer",
        last_name:   (customerInfo.name || "").split(" ").slice(1).join(" ") || "Client",
        email:       customerInfo.email,
        phone:       customerInfo.phone || "+94771234567",
        address:     booking.location || "Colombo",
        city:        "Colombo",
        country:     "Sri Lanka",
        delivery_address: booking.location || "Colombo",
        delivery_city:    "Colombo",
        delivery_country: "Sri Lanka",
        custom_1:    photographerName,
        custom_2:    booking.eventDate || "",
      };

      // PayHere Callbacks
      window.payhere.onCompleted = async function onCompleted(confirmedOrderId) {
        const finalOrderId = confirmedOrderId || orderId;
        // Attempt server-side verification via webhook status endpoint
        try {
          const verifyResp = await fetch(`${PAYMENT_API}/api/payment/verify/${finalOrderId}`);
          if (verifyResp.ok) {
            const verifyData = await verifyResp.json();
            if (verifyData.paid) {
              setProcessing(false);
              completeBookingProcess(`PAYHERE-VERIFIED-${verifyData.payment?.payment_id || finalOrderId}`);
              return;
            }
          }
        } catch (e) {
          console.log("[Payment verification query note]", e.message);
        }

        // PayHere client modal confirmed completion
        setProcessing(false);
        completeBookingProcess(`PAYHERE-COMPLETED-${finalOrderId}`);
      };

      window.payhere.onDismissed = function onDismissed() {
        setProcessing(false);
        setError("PayHere popup was closed. No payment was taken. Click the button again when you are ready to pay.");
      };

      window.payhere.onError = function onError(payError) {
        setProcessing(false);
        console.error("PayHere Error:", payError);
        setError(`PayHere error: ${payError || "Gateway returned an error."}`);
      };

      try {
        window.payhere.startPayment(paymentObject);
      } catch (err) {
        setProcessing(false);
        console.warn("PayHere startPayment error:", err);
        setError("Could not launch PayHere popup. Check the browser console for details.");
      }
    } else {
      setProcessing(false);
      setError("PayHere SDK is not loaded. Ensure you have an active internet connection to load https://www.payhere.lk/lib/payhere.js.");
    }
  };

  return (
    <div className="page-wrapper" style={{ minHeight: "100vh" }}>
      <Navbar />
      <div className="page-content" style={{ paddingTop: 88 }}>
        <div className="container" style={{ padding: "40px 24px" }}>
          
          {/* 4 Steps Wizard Bar */}
          <div className="step-bar" style={{ marginBottom: 32 }}>
            {[
              { label: "Check Availability", done: true },
              { label: "Event Details & Slots", done: true },
              { label: "Add Services", done: true },
              { label: "Confirmation", active: true },
            ].map((s, i) => (
              <div key={i} className="step-item">
                {i > 0 && <div className={`step-connector done`} />}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div className={`step-circle ${s.done && !s.active ? "done" : s.active ? "active" : ""}`}>
                    {s.done && !s.active ? <CheckCircle size={15} /> : i + 1}
                  </div>
                  <div className="step-label" style={{ color: s.active ? "#60a5fa" : "#4ade80", fontWeight: s.active ? 700 : 500 }}>
                    {s.label}
                  </div>
                </div>
              </div>
            ))}
          </div>

        


          <div className="payment-grid" style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 24 }}>
            {/* Left: Payment Form */}
            <div>
              <div className="card" style={{ padding: 32, background: "var(--navy-800)", border: "1px solid var(--navy-600)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                  <CreditCard size={24} color="#60a5fa" />
                  <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 800, color: "#ffffff" }}>
                    Advance Payment & Details
                  </h2>
                </div>
                
                <div style={{
                  marginBottom: 20,
                  background: "rgba(245, 158, 11, 0.12)",
                  border: "1px solid rgba(245, 158, 11, 0.3)",
                  color: "#fde68a",
                  padding: "14px 18px",
                  borderRadius: 8
                }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                    <AlertCircle size={18} style={{ marginTop: 2, flexShrink: 0, color: "var(--gold-400)" }} />
                    <div style={{ fontSize: "0.85rem", lineHeight: 1.5 }}>
                      <strong>30% Advance Confirmation:</strong> Pay <strong>Rs. {depositAmount.toLocaleString()}</strong> to lock in your photographer and time slot. An instant confirmation email with your official invoice receipt will be sent to your inbox. The 70% balance is payable on event day.
                    </div>
                  </div>
                </div>

                {error && (
                  <div style={{
                    marginBottom: 16,
                    padding: "12px 16px",
                    background: "rgba(239, 68, 68, 0.15)",
                    border: "1px solid rgba(239, 68, 68, 0.35)",
                    borderRadius: 8,
                    color: "#fca5a5",
                    fontSize: "0.85rem"
                  }}>
                    {error}
                  </div>
                )}

                <form onSubmit={handlePayHerePayment}>
                  {/* Customer Contact Details Section */}
                  <div style={{
                    marginBottom: 22,
                    background: "var(--navy-700)",
                    border: "1px solid var(--navy-600)",
                    borderRadius: 10,
                    padding: 18
                  }}>
                    <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#ffffff", marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}>
                      <User size={15} color="var(--gold-400)" /> Customer Details (Auto-filled from registered account)
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                      <div className="form-group">
                        <label className="form-label" style={{ fontSize: "0.78rem" }}>Full Name</label>
                        <input
                          type="text"
                          className="form-control"
                          required
                          value={customerInfo.name}
                          onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label" style={{ fontSize: "0.78rem" }}>Phone Number</label>
                        <input
                          type="text"
                          className="form-control"
                          required
                          value={customerInfo.phone}
                          onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: "0.78rem", display: "flex", alignItems: "center", gap: 4 }}>
                        <Mail size={13} /> Email Address (Official Booking Receipt & Invoice dispatched here)
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        required
                        value={customerInfo.email}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                        placeholder="your-email@example.com"
                      />
                    </div>
                  </div>

                  {/* Payment Buttons */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <button 
                      type="submit" 
                      className="btn btn-primary w-full btn-lg" 
                      style={{
                        fontWeight: 800,
                        fontSize: "1rem",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: 8,
                      }}
                      disabled={processing}
                    >
                      {processing ? "Launching PayHere Sandbox..." : (
                        <>
                          <Lock size={18} /> Pay Rs. {depositAmount.toLocaleString()} via PayHere Sandbox
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Right: Order Summary */}
            <div>
              <div className="card" style={{ padding: 24, background: "var(--navy-800)", border: "1px solid var(--navy-600)" }}>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#ffffff", marginBottom: 20 }}>
                  Order Summary
                </h3>

                <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: "0.88rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-muted)" }}>Photography Type</span>
                    <span style={{ fontWeight: 600, color: "#ffffff" }}>{booking.photographyType || "Photo Shoot"}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-muted)" }}>Photographer</span>
                    <span style={{ fontWeight: 700, color: "#60a5fa" }}>{photographerName}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-muted)" }}>Date</span>
                    <span style={{ fontWeight: 600, color: "#ffffff" }}>{booking.eventDate || "Selected Date"}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-muted)" }}>Time Slot</span>
                    <span style={{ fontWeight: 600, color: "#ffffff" }}>{booking.slotLabel || `${booking.startTime} – ${booking.endTime}`}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-muted)" }}>Location</span>
                    <span style={{ fontWeight: 600, color: "#ffffff" }}>{booking.location || "On-site"}</span>
                  </div>
                  
                  {booking.selectedServices?.length > 0 && (
                    <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid var(--navy-600)" }}>
                      <span style={{ color: "var(--text-muted)", display: "block", marginBottom: 6, fontWeight: 600 }}>Add-ons:</span>
                      {booking.selectedServices.map(s => (
                        <div key={s.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, color: "var(--text-secondary)" }}>
                          <span>{s.name}</span>
                          <span>Rs. {s.price.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--navy-600)", display: "flex", justifyContent: "space-between", fontSize: "1rem" }}>
                    <span style={{ color: "#ffffff", fontWeight: 600 }}>Total Session Price</span>
                    <span style={{ fontWeight: 800, color: "var(--gold-400)" }}>Rs. {totalAmount.toLocaleString()}</span>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", color: "#4ade80", fontWeight: 700, fontSize: "1rem" }}>
                    <span>30% Advance Deposit (Due Now)</span>
                    <span>Rs. {depositAmount.toLocaleString()}</span>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)", fontSize: "0.85rem", fontWeight: 600 }}>
                    <span>70% Remaining Balance</span>
                    <span>Rs. {(totalAmount - depositAmount).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
