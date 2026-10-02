import { useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle, Download, Home, CalendarCheck, MapPin, Clock, Package, Check, Loader2 } from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import { useBooking } from "../../context/BookingContext";
import { useAuth } from "../../context/AuthContext";
import { downloadInvoicePDF } from "../../utils/invoiceGenerator";

export default function BookingConfirmation() {
  const { confirmedBooking } = useBooking();
  const { user } = useAuth();
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!confirmedBooking) {
    return (
      <div className="page-wrapper" style={{ background: "var(--navy-900)", minHeight: "100vh" }}>
        <Navbar />
        <div className="page-content" style={{ paddingTop: 120 }}>
          <div className="container" style={{ maxWidth: 560, textAlign: "center", padding: "40px 20px" }}>
            <div className="card" style={{ padding: 40, background: "var(--navy-800)", border: "1px solid var(--navy-600)", borderRadius: 16 }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(96, 165, 250, 0.12)", color: "#60a5fa", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                <CalendarCheck size={32} />
              </div>
              <h2 style={{ color: "#ffffff", fontSize: "1.35rem", fontWeight: 800, marginBottom: 12 }}>
                No Active Booking Found
              </h2>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem", lineHeight: 1.6, marginBottom: 28 }}>
                You do not have an active confirmed booking. Please select a photographer, date, and complete your 30% advance deposit via PayHere Sandbox.
              </p>
              <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                <Link to="/book" className="btn btn-primary">
                  Book a Session
                </Link>
                <Link to="/" className="btn btn-secondary">
                  Go to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const b = confirmedBooking;

  const photographerName =
    typeof b.photographer === "string" && b.photographer !== "Professional Photographer"
      ? b.photographer
      : b.photographer?.name || (b.photographerName && b.photographerName !== "Professional Photographer" ? b.photographerName : "Alex Morgan");
  const displayDate = b.eventDate || b.date || "Upcoming Date";
  const displayTime = b.slotLabel || b.time || (b.startTime ? `${b.startTime} – ${b.endTime}` : "Scheduled Time");
  const photoPrice = (b.totalAmount || b.amount || 0) - (b.selectedServices || []).reduce((a, s) => a + s.price, 0);

  const handleDownloadInvoice = async () => {
    try {
      setDownloading(true);
      const clientInfo = {
        name: b.client || user?.name || "Customer",
        email: b.clientEmail || user?.email || "customer@shuttermoments.com",
        phone: b.clientPhone || user?.phone || "+94 77 123 4567",
      };
      const saved = await downloadInvoicePDF(b, clientInfo);
      if (saved) {
        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 5000);
      }
    } catch (err) {
      console.error("PDF download failed:", err);
      alert("Failed to download PDF invoice. Please check browser permissions.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="page-content" style={{ paddingTop: 88 }}>
        <div className="container" style={{ padding: "60px 24px" }}>

          {/* 4 Steps Wizard Bar */}
          <div className="step-bar">
            {[
              { label: "Check Availability", done: true },
              { label: "Event Details & Slots", done: true },
              { label: "Add Services", done: true },
              { label: "Confirmation", active: true },
            ].map((s, i) => (
              <div key={i} className="step-item">
                {i > 0 && <div className={`step-connector done`} />}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div className={`step-circle ${s.done ? "done" : s.active ? "active" : ""}`}>
                    {s.done || s.active ? <CheckCircle size={16} /> : i + 1}
                  </div>
                  <div className="step-label" style={{ color: s.active ? "#60a5fa" : "#34d399", fontWeight: s.active ? 700 : 500 }}>
                    {s.label}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Confirmation Card */}
          <div className="confirm-layout animate-fade-up">
            {/* Success Hero */}
            <div className="confirm-hero">
              <div className="confirm-circle-outer">
                <div className="confirm-circle-inner">
                  <CheckCircle size={48} color="var(--green-400)" />
                </div>
              </div>
              <h1 className="confirm-title">Your booking is confirmed! 🎉</h1>
              <p className="confirm-subtitle">
                We have sent your 30% advance confirmation receipt and booking details to your email.
              </p>
              <div className="confirm-id">
                <span style={{ color: "var(--text-muted)" }}>Booking ID:</span>
                <span className="booking-id-pill">{b.id}</span>
              </div>

              <div className="confirm-detail-cards">
                <div className="confirm-detail-item">
                  <CalendarCheck size={16} color="var(--gold-400)" />
                  <div>
                    <div className="cd-label">Event Type</div>
                    <div className="cd-val">{b.photographyType || b.event}</div>
                  </div>
                </div>
                <div className="confirm-detail-item">
                  <Package size={16} color="var(--gold-400)" />
                  <div>
                    <div className="cd-label">Photographer</div>
                    <div className="cd-val">{photographerName}</div>
                  </div>
                </div>
                <div className="confirm-detail-item">
                  <CalendarCheck size={16} color="var(--gold-400)" />
                  <div>
                    <div className="cd-label">Date</div>
                    <div className="cd-val">{displayDate}</div>
                  </div>
                </div>
                <div className="confirm-detail-item">
                  <Clock size={16} color="var(--gold-400)" />
                  <div>
                    <div className="cd-label">Time Slot</div>
                    <div className="cd-val">{displayTime}</div>
                  </div>
                </div>
                <div className="confirm-detail-item">
                  <MapPin size={16} color="var(--gold-400)" />
                  <div>
                    <div className="cd-label">Location</div>
                    <div className="cd-val">{b.location}</div>
                  </div>
                </div>
              </div>

              {downloadSuccess && (
                <div style={{
                  margin: "16px auto",
                  maxWidth: 400,
                  background: "rgba(34, 197, 94, 0.15)",
                  border: "1px solid rgba(34, 197, 94, 0.4)",
                  color: "#4ade80",
                  padding: "10px 16px",
                  borderRadius: 8,
                  fontSize: "0.85rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8
                }}>
                  <Check size={16} /> Official Invoice PDF downloaded to your chosen folder!
                </div>
              )}

              <div className="confirm-actions">
                <button
                  className="btn btn-primary"
                  onClick={handleDownloadInvoice}
                  disabled={downloading}
                  style={{ minWidth: 190 }}
                >
                  {downloading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Preparing PDF...
                    </>
                  ) : (
                    <>
                      <Download size={16} /> Download Invoice (PDF)
                    </>
                  )}
                </button>
                <Link to="/" className="btn btn-secondary"><Home size={16} /> Back to Home</Link>
              </div>
            </div>

            {/* Summary Panel */}
            <div className="confirm-summary-panel">
              <div className="card-elevated" style={{ padding: 28 }}>
                <h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: 20 }}>Booking Details</h3>

                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {[
                    { label: "Event Type", val: b.photographyType || b.event },
                    { label: "Photographer", val: photographerName },
                    { label: "Date", val: displayDate },
                    { label: "Time Slot", val: displayTime },
                    { label: "Location", val: b.location },
                  ].map((r, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", gap: 8 }}>
                      <span style={{ color: "var(--text-muted)" }}>{r.label}</span>
                      <span style={{ fontWeight: 600, textAlign: "right" }}>{r.val}</span>
                    </div>
                  ))}
                </div>

                {b.selectedServices && b.selectedServices.length > 0 && (
                  <>
                    <div className="divider" />
                    <div style={{ fontWeight: 700, fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: 12, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                      Additional Services
                    </div>
                    {b.selectedServices.map((s, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", marginBottom: 8 }}>
                        <span style={{ color: "var(--text-muted)" }}>{s.name}</span>
                        <span style={{ fontWeight: 600 }}>Rs. {s.price.toLocaleString()}</span>
                      </div>
                    ))}
                  </>
                )}

                <div className="divider" />

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 700, fontSize: "0.9rem" }}>Total Amount</span>
                  <span style={{ fontWeight: 900, fontSize: "1.2rem", color: "var(--gold-400)" }}>
                    Rs. {b.totalAmount.toLocaleString()}
                  </span>
                </div>

                <div className="divider" />

                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  <div style={{ fontWeight: 700, color: "var(--white)", marginBottom: 8 }}>Payment Status</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <span>• Payment Method: Card / 30% Advance Deposit</span>
                    <span>• Deposit Paid (30%): <span style={{ color: "#34d399", fontWeight: 700 }}>Rs. {(b.totalAmount * 0.3).toLocaleString()}</span></span>
                    <span>• Remaining Balance: <span style={{ color: "var(--amber-500)" }}>Rs. {(b.totalAmount * 0.7).toLocaleString()}</span> (Due on Event Day)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .confirm-layout {
          display: grid; grid-template-columns: 1fr 340px; gap: 32px; align-items: start;
        }
        .confirm-hero {
          background: var(--navy-800);
          border: 1px solid var(--navy-600);
          border-radius: var(--radius-xl); padding: 52px 40px;
          text-align: center; position: relative; overflow: hidden;
          box-shadow: var(--shadow-md);
        }
        .confirm-circle-outer {
          width: 100px; height: 100px; border-radius: 50%; margin: 0 auto 24px;
          background: rgba(34, 197, 94, 0.15); border: 2px solid rgba(74, 222, 128, 0.4);
          display: flex; align-items: center; justify-content: center;
          animation: pulse-ring 2s infinite;
        }
        .confirm-circle-inner {
          width: 72px; height: 72px; border-radius: 50%;
          background: rgba(34, 197, 94, 0.2);
          display: flex; align-items: center; justify-content: center;
        }
        .confirm-title {
          font-size: clamp(1.4rem, 3vw, 2rem); font-weight: 900; margin-bottom: 10px; color: #ffffff;
        }
        .confirm-subtitle { color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 20px; }
        .confirm-id {
          display: flex; align-items: center; justify-content: center; gap: 10px;
          font-size: 0.85rem; margin-bottom: 32px; color: var(--text-muted);
        }
        .booking-id-pill {
          background: rgba(37, 99, 235, 0.2); color: #60a5fa;
          border: 1px solid rgba(59, 130, 246, 0.4);
          padding: 4px 14px; border-radius: 20px; font-weight: 700;
          letter-spacing: 0.05em;
        }
        .confirm-detail-cards {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
          gap: 12px; margin-bottom: 36px; text-align: left;
        }
        .confirm-detail-item {
          background: var(--navy-700); border: 1px solid var(--navy-600);
          border-radius: var(--radius-md); padding: 14px;
          display: flex; align-items: flex-start; gap: 10px;
        }
        .cd-label { font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 4px; }
        .cd-val { font-size: 0.85rem; font-weight: 700; color: #ffffff; }
        .confirm-actions { display: flex; justify-content: center; gap: 16px; flex-wrap: wrap; }
        @keyframes pulse-ring {
          0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(16,185,129,0.3); }
          50% { transform: scale(1.04); box-shadow: 0 0 0 10px rgba(16,185,129,0); }
        }
        @media (max-width: 900px) {
          .confirm-layout { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
