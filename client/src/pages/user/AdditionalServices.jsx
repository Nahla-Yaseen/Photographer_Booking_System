import { useNavigate } from "react-router-dom";
import { CheckCircle, ChevronRight, Tag } from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import { useBooking } from "../../context/BookingContext";
import { useAuth } from "../../context/AuthContext";
import { ADDITIONAL_SERVICES, PHOTOGRAPHERS } from "../../data/mockData";

export default function AdditionalServices() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { booking, toggleService, confirmBooking } = useBooking();

  const photographer = PHOTOGRAPHERS.find(p => p.id === booking.photographerId);
  const servicesTotal = booking.selectedServices.reduce((a, s) => a + s.price, 0);

  // Price calculation based on booking type
  const slotCount = Math.max(1, booking.selectedSlotIds?.length || 1);
  const isTimeBased = booking.bookingType === "time_based";
  const photoPrice = isTimeBased
    ? (photographer?.hourlyRate || 6000) * slotCount
    : (photographer?.price || 45000);

  const total = photoPrice + servicesTotal;

  const isSelected = (id) => booking.selectedServices.some(s => s.id === id);

  const handleConfirm = () => {
    navigate("/payment");
  };

  return (
    <div className="page-wrapper" style={{ background: "var(--navy-900)", minHeight: "100vh" }}>
      <Navbar />
      <div className="page-content" style={{ paddingTop: 88 }}>
        <div className="container" style={{ padding: "40px 24px" }}>

          {/* 4 Steps Wizard Bar */}
          <div className="step-bar" style={{ marginBottom: 32 }}>
            {[
              { label: "Check Availability", done: true },
              { label: "Event Details & Slots", done: true },
              { label: "Add Services", active: true },
              { label: "Confirmation", step: 4 },
            ].map((s, i) => (
              <div key={i} className="step-item">
                {i > 0 && <div className="step-connector done" />}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div className={`step-circle ${s.done ? "done" : s.active ? "active" : ""}`}>
                    {s.done ? <CheckCircle size={15} /> : i + 1}
                  </div>
                  <div
                    className="step-label"
                    style={{
                      color: s.active ? "#60a5fa" : s.done ? "#34d399" : "var(--text-muted)",
                      fontWeight: s.active ? 700 : 500,
                    }}
                  >
                    {s.label}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="svc-grid">
            {/* Services List */}
            <div>
              <div className="card-elevated" style={{ padding: 28 }}>
                <h2 style={{ fontSize: "1.1rem", fontWeight: 800, marginBottom: 6 }}>
                  <Tag size={18} color="#60a5fa" style={{ display: "inline", marginRight: 8 }} />
                  Step 3: Select Additional Services
                </h2>
                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: 24 }}>
                  Enhance your photography experience with custom add-on services.
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {ADDITIONAL_SERVICES.map(svc => (
                    <div key={svc.id} className={`service-card ${isSelected(svc.id) ? "selected" : ""}`}>
                      <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                        <div className="svc-icon-box">{svc.icon}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: 4, color: "var(--white)" }}>{svc.name}</div>
                          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: 10 }}>{svc.description}</div>
                          <div style={{ fontWeight: 800, color: "#60a5fa", fontSize: "0.95rem" }}>
                            Rs. {svc.price.toLocaleString()}
                          </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                          <button
                            className={`btn btn-sm ${isSelected(svc.id) ? "btn-danger" : "btn-primary"}`}
                            onClick={() => toggleService(svc.id)}
                          >
                            {isSelected(svc.id) ? "Remove" : "Add this service"}
                          </button>
                          {isSelected(svc.id) && (
                            <span style={{ fontSize: "0.75rem", color: "#34d399", display: "flex", alignItems: "center", gap: 4 }}>
                              <CheckCircle size={12} /> Added
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Booking Summary */}
            <div>
              <div className="card-elevated" style={{ padding: 24 }}>
                <h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: 20 }}>Booking Summary</h3>

                <div className="summary-rows">
                  <div className="summary-row">
                    <span className="summary-label">Photography Type</span>
                    <span className="summary-val">{booking.photographyType || "—"}</span>
                  </div>
                  <div className="summary-row">
                    <span className="summary-label">Photographer</span>
                    <span className="summary-val">{photographer?.name || "—"}</span>
                  </div>
                  <div className="summary-row">
                    <span className="summary-label">Date</span>
                    <span className="summary-val">{booking.eventDate || "—"}</span>
                  </div>
                  <div className="summary-row">
                    <span className="summary-label">Time Slot(s)</span>
                    <span className="summary-val">{booking.slotLabel || `${booking.startTime} – ${booking.endTime}`}</span>
                  </div>
                  <div className="summary-row">
                    <span className="summary-label">Location</span>
                    <span className="summary-val" style={{ maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {booking.location || "—"}
                    </span>
                  </div>
                </div>

                <div className="divider" />

                <div style={{ fontWeight: 700, fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: 12, letterSpacing: "0.05em", textTransform: "uppercase" }}>Price Details</div>

                <div className="summary-rows">
                  <div className="summary-row">
                    <span className="summary-label">
                      {isTimeBased ? `Photography (${slotCount} hr${slotCount > 1 ? "s" : ""})` : "Photography Package"}
                    </span>
                    <span className="summary-val">Rs. {photoPrice.toLocaleString()}</span>
                  </div>
                  {booking.selectedServices.map(s => (
                    <div key={s.id} className="summary-row">
                      <span className="summary-label">{s.name}</span>
                      <span className="summary-val">Rs. {s.price.toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                <div className="divider" />

                <div className="summary-total">
                  <span>Total Amount</span>
                  <span className="summary-total-val">Rs. {total.toLocaleString()}</span>
                </div>

                <button className="btn btn-primary w-full" style={{ marginTop: 20, fontWeight: 700 }} onClick={handleConfirm}>
                  Confirm & Proceed <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .svc-grid { display: grid; grid-template-columns: 1fr 340px; gap: 28px; }
        .svc-icon-box {
          width: 52px; height: 52px; border-radius: var(--radius-md);
          background: rgba(37,99,235,0.15); display: flex; align-items: center;
          justify-content: center; font-size: 1.5rem; flex-shrink: 0;
        }
        .summary-rows { display: flex; flex-direction: column; gap: 10px; }
        .summary-row { display: flex; justify-content: space-between; align-items: center; }
        .summary-label { font-size: 0.8rem; color: var(--text-muted); }
        .summary-val { font-size: 0.82rem; font-weight: 600; text-align: right; }
        .summary-total {
          display: flex; justify-content: space-between; align-items: center;
          font-weight: 700; font-size: 0.92rem;
        }
        .summary-total-val {
          font-size: 1.15rem; font-weight: 800; color: #60a5fa;
        }
        @media (max-width: 1024px) { .svc-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}
