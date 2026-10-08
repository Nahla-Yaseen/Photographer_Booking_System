import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  CheckCircle, CreditCard, Lock, Mail, User, Phone,
  AlertCircle, ShieldCheck, ArrowRight, Loader2, RefreshCw
} from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import { useBooking } from "../../context/BookingContext";
import { useAuth } from "../../context/AuthContext";
import { PHOTOGRAPHERS } from "../../data/mockData";

const PAYMENT_API = import.meta.env.VITE_PAYMENT_API_URL ?? (import.meta.env.PROD ? "" : "http://localhost:5000");

export default function PaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, photographersList } = useAuth();
  const { booking, confirmBooking } = useBooking();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [wasCancelled, setWasCancelled] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("cancelled") === "true") {
      setWasCancelled(true);
    }
  }, [location.search]);

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

  // Fallback demo completion if user wants to test without live Stripe keys
  const completeBookingProcess = (paymentRef = "DEMO-CARD-" + Date.now().toString().slice(-6)) => {
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

  // Launch Stripe Checkout Hosted Page
  const handleStripePayment = async (e) => {
    e?.preventDefault();
    if (!customerInfo.email || !customerInfo.email.includes("@")) {
      setError("Please provide a valid email address to receive your confirmation & invoice.");
      return;
    }
    setError("");
    setProcessing(true);

    const pendingBookingData = {
      booking,
      photographer: {
        ...photographer,
        name: photographerName,
        id: photographer?.id || booking.photographerId,
      },
      customerInfo: {
        name: customerInfo.name || user?.name || "Valued Client",
        email: customerInfo.email || user?.email || "customer@shuttermoments.com",
        phone: customerInfo.phone || user?.phone || "+94 77 123 4567",
        clientId: user?.id || null,
        userId: user?.id || null,
      },
      depositAmount,
      totalAmount,
    };

    try {
      sessionStorage.setItem("shutter_pending_booking", JSON.stringify(pendingBookingData));
    } catch (e) {
      console.warn("sessionStorage error:", e);
    }

    try {
      const resp = await fetch(`${PAYMENT_API}/api/payment/stripe/create-checkout-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          booking,
          customerInfo,
          amount: depositAmount,
          currency: "lkr",
          returnOrigin: window.location.origin,
        }),
      });

      const text = await resp.text();
      let data = {};
      try {
        data = JSON.parse(text);
      } catch (parseErr) {
        throw new Error(`Server returned HTTP ${resp.status}: ${text.slice(0, 150)}`);
      }

      if (!resp.ok || !data.success) {
        throw new Error(data.error || `Payment server error (Status ${resp.status})`);
      }

      if (data.url) {
        // Redirect directly to Stripe hosted checkout
        window.location.href = data.url;
      } else {
        throw new Error("No checkout redirect URL received from payment server.");
      }
    } catch (err) {
      setProcessing(false);
      console.error("[Stripe Checkout Error]", err);
      setError(
        `${err.message}. If STRIPE_SECRET_KEY is not yet added in Vercel Environment Variables, please add it in your Vercel Dashboard.`
      );
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
              { label: "Payment & Confirmation", active: true },
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

          {wasCancelled && (
            <div style={{
              maxWidth: 960,
              margin: "0 auto 24px",
              padding: "14px 20px",
              background: "rgba(245, 158, 11, 0.15)",
              border: "1px solid rgba(245, 158, 11, 0.4)",
              borderRadius: 10,
              color: "#fde68a",
              display: "flex",
              alignItems: "center",
              gap: 12,
              fontSize: "0.9rem"
            }}>
              <AlertCircle size={20} style={{ flexShrink: 0, color: "var(--gold-400)" }} />
              <div>
                <strong>Payment Incomplete:</strong> Your previous checkout session was cancelled. You can review your details below and try again whenever you are ready.
              </div>
            </div>
          )}

          <div className="payment-grid" style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 24, maxWidth: 1000, margin: "0 auto" }}>
            {/* Left: Payment Form */}
            <div>
              <div className="card" style={{ padding: 32, background: "var(--navy-800)", border: "1px solid var(--navy-600)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <CreditCard size={24} color="#60a5fa" />
                    <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 800, color: "#ffffff" }}>
                      Stripe Card Payment
                    </h2>
                  </div>
                  <span style={{
                    fontSize: "0.75rem",
                    padding: "4px 10px",
                    borderRadius: 20,
                    background: "rgba(59, 130, 246, 0.15)",
                    border: "1px solid rgba(59, 130, 246, 0.3)",
                    color: "#60a5fa",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: 4
                  }}>
                    <ShieldCheck size={13} /> Stripe Certified
                  </span>
                </div>
                
                <div style={{
                  marginBottom: 20,
                  background: "rgba(34, 197, 94, 0.1)",
                  border: "1px solid rgba(34, 197, 94, 0.25)",
                  color: "#86efac",
                  padding: "14px 18px",
                  borderRadius: 8
                }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                    <CheckCircle size={18} style={{ marginTop: 2, flexShrink: 0, color: "#4ade80" }} />
                    <div style={{ fontSize: "0.85rem", lineHeight: 1.5 }}>
                      <strong>30% Advance Deposit Required:</strong> Pay <strong>Rs. {depositAmount.toLocaleString()}</strong> via Stripe's encrypted checkout to lock in your photographer. The remaining 70% (Rs. {(totalAmount - depositAmount).toLocaleString()}) is payable on event day.
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
                    fontSize: "0.85rem",
                    lineHeight: 1.5
                  }}>
                    {error}
                  </div>
                )}

                <form onSubmit={handleStripePayment}>
                  {/* Customer Contact Details Section */}
                  <div style={{
                    marginBottom: 22,
                    background: "var(--navy-700)",
                    border: "1px solid var(--navy-600)",
                    borderRadius: 10,
                    padding: 18
                  }}>
                    <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#ffffff", marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}>
                      <User size={15} color="var(--gold-400)" /> Customer & Invoice Details
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
                          placeholder="e.g. John Silva"
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
                          placeholder="+94 77 123 4567"
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: "0.78rem", display: "flex", alignItems: "center", gap: 4 }}>
                        <Mail size={13} /> Email Address (Official Receipt dispatched here)
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
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <button 
                      type="submit" 
                      className="btn btn-primary w-full btn-lg" 
                      style={{
                        fontWeight: 800,
                        fontSize: "1rem",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: 10,
                        padding: "14px 20px",
                        background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                        border: "none",
                        boxShadow: "0 4px 14px rgba(99, 102, 241, 0.4)"
                      }}
                      disabled={processing}
                    >
                      {processing ? (
                        <>
                          <Loader2 size={18} className="animate-spin" /> Redirecting to Stripe...
                        </>
                      ) : (
                        <>
                          <Lock size={18} /> Pay Rs. {depositAmount.toLocaleString()} with Stripe
                          <ArrowRight size={18} />
                        </>
                      )}
                    </button>

                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 16,
                      fontSize: "0.78rem",
                      color: "var(--text-muted)",
                      paddingTop: 8
                    }}>
                      <span>💳 Visa / Mastercard / Amex</span>
                      <span>•</span>
                      <span>🔒 256-bit SSL Encrypted</span>
                    </div>

                    {/* Developer / Demo Instant Test Option if Stripe keys are not yet entered */}
                    {error && (
                      <div style={{ marginTop: 12, textAlign: "center" }}>
                        <button
                          type="button"
                          onClick={() => completeBookingProcess()}
                          className="btn btn-secondary w-full"
                          style={{ fontSize: "0.82rem", padding: "8px 12px", borderStyle: "dashed" }}
                        >
                          🧪 Instant Demo Complete (Bypass Stripe for Local / Testing)
                        </button>
                      </div>
                    )}
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
