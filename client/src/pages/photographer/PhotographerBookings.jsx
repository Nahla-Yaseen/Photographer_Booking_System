import { useState } from "react";
import {
  Search, Eye, Check, X, CalendarCheck, Clock, MapPin,
  User, Camera, AlertCircle, CheckCircle2, DollarSign
} from "lucide-react";
import PhotographerSidebar from "../../components/layout/PhotographerSidebar";
import { useAuth } from "../../context/AuthContext";
import { useBooking } from "../../context/BookingContext";

export default function PhotographerBookings() {
  const { user } = useAuth();
  const { allBookings, updateBookingStatus } = useBooking();
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [notification, setNotification] = useState(null);

  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelReason, setCancelReason] = useState("Photographer medical emergency / urgent health issue");
  const [customReason, setCustomReason] = useState("");

  const showNotification = (msg, type = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const photographerName = user?.name || "Alex Morgan";

  // Filter bookings assigned to this photographer or match
  const myBookings = allBookings.filter((b) => {
    const bPhotog = (b.photographer || "").toLowerCase();
    const myName = photographerName.toLowerCase();
    return bPhotog.includes(myName) || myName.includes(bPhotog) || b.photographerId === user?.id;
  });

  const handleUpdateStatus = (id, newStatus) => {
    updateBookingStatus(id, newStatus);
    const booking = myBookings.find((b) => b.id === id);
    const client = booking?.client || "Client";

    if (newStatus === "Completed") {
      showNotification(`Booking ${id} marked as Completed! Shoot successful.`, "success");
    }

    if (selectedBooking && selectedBooking.id === id) {
      setSelectedBooking((prev) => ({ ...prev, status: newStatus }));
    }
  };

  const handleConfirmCancellation = () => {
    if (!cancelTarget) return;
    const finalReason = customReason.trim() ? customReason.trim() : cancelReason;

    updateBookingStatus(cancelTarget.id, "Cancelled", finalReason, `Photographer (${photographerName})`);
    showNotification(`Booking ${cancelTarget.id} cancelled. Urgent cancellation email sent to ${cancelTarget.clientEmail || cancelTarget.client}.`, "error");

    if (selectedBooking && selectedBooking.id === cancelTarget.id) {
      setSelectedBooking((prev) => ({ ...prev, status: "Cancelled", cancellationReason: finalReason }));
    }

    setCancelTarget(null);
    setCustomReason("");
  };

  const filtered = myBookings.filter((b) => {
    const matchesFilter = activeFilter === "All" || b.status?.toLowerCase() === activeFilter.toLowerCase();
    const matchesSearch =
      (b.id || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.event || b.photographyType || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.client || "").toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const filterCounts = {
    All: myBookings.length,
    Confirmed: myBookings.filter((b) => b.status === "Confirmed").length,
    Completed: myBookings.filter((b) => b.status === "Completed").length,
    Cancelled: myBookings.filter((b) => b.status === "Cancelled").length,
  };

  const getStatusBadge = (status) => {
    const map = {
      Confirmed: "badge-confirmed",
      Completed: "badge-completed",
      Cancelled: "badge-cancelled",
    };
    return <span className={`badge ${map[status] || "badge-confirmed"}`}>{status}</span>;
  };

  return (
    <div className="admin-layout">
      <PhotographerSidebar />
      <main className="admin-main">
        {/* Toast */}
        {notification && (
          <div className={`alert ${notification.type === "error" ? "alert-error" : "alert-success"} animate-fade-up admin-toast`}>
            {notification.type === "error" ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
            <div style={{ flex: 1, fontSize: "0.85rem", fontWeight: 500 }}>{notification.msg}</div>
            <button className="btn btn-ghost btn-sm" onClick={() => setNotification(null)} style={{ padding: 2 }}>
              <X size={14} />
            </button>
          </div>
        )}

        {/* Header */}
        <div className="admin-page-header animate-fade-up">
          <div>
            <h1 style={{ fontSize: "1.6rem", fontWeight: 800, marginBottom: 4 }}>Manage Shoot Bookings</h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
              Track all photography assignments, mark confirmed shoots as completed or cancelled
            </p>
          </div>
        </div>

        {/* Filter Chips - NO PENDING TAB */}
        <div className="filter-chips-row animate-fade-up delay-1">
          {["All", "Confirmed", "Completed", "Cancelled"].map((tab) => (
            <button
              key={tab}
              className={`filter-chip ${activeFilter === tab ? "active" : ""}`}
              onClick={() => setActiveFilter(tab)}
            >
              <span>{tab}</span>
              <span className="filter-count">{filterCounts[tab] || 0}</span>
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="admin-search-bar animate-fade-up delay-1">
          <div className="input-icon-wrapper" style={{ maxWidth: 380, flex: 1 }}>
            <Search size={16} className="input-icon" />
            <input
              type="text"
              className="form-control"
              placeholder="Search by ID, client, or event type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>
            Showing {filtered.length} of {myBookings.length} assignments
          </div>
        </div>

        {/* Table */}
        <div className="table-wrapper animate-fade-up delay-2">
          <table className="data-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Event Type</th>
                <th>Client Name</th>
                <th>Date & Time</th>
                <th>Location</th>
                <th>Amount (Rs.)</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)" }}>
                    No shoot bookings found under "{activeFilter}" filter.
                  </td>
                </tr>
              ) : (
                filtered.map((b) => (
                  <tr key={b.id}>
                    <td>
                      <span style={{ fontFamily: "monospace", fontSize: "0.82rem", color: "var(--gold-400)", fontWeight: 700 }}>
                        {b.id}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{b.event || b.photographyType}</td>
                    <td>{b.client}</td>
                    <td>
                      <div style={{ fontSize: "0.82rem" }}>{b.date}</div>
                      <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{b.time}</div>
                    </td>
                    <td style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                      {b.location || "Colombo"}
                    </td>
                    <td style={{ fontWeight: 700, color: "var(--gold-400)" }}>
                      Rs. {(b.amount || b.totalAmount || 0)?.toLocaleString()}
                    </td>
                    <td>{getStatusBadge(b.status || "Confirmed")}</td>
                    <td>
                      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        <button
                          className="btn btn-ghost btn-sm"
                          title="View Details"
                          onClick={() => setSelectedBooking(b)}
                        >
                          <Eye size={14} />
                        </button>
                        {b.status === "Confirmed" && (
                          <>
                            <button
                              className="btn btn-ghost btn-sm"
                              style={{ color: "#38bdf8", border: "1px solid rgba(56,189,248,0.25)" }}
                              title="Mark as Completed"
                              onClick={() => handleUpdateStatus(b.id, "Completed")}
                            >
                              <Check size={13} /> Complete
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              style={{ padding: "4px 8px", fontSize: "0.75rem" }}
                              title="Critical Situation Cancellation"
                              onClick={() => setCancelTarget(b)}
                            >
                              <X size={13} /> Cancel
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Booking Details Modal */}
        {selectedBooking && (
          <div className="modal-backdrop animate-fade-in" onClick={() => setSelectedBooking(null)}>
            <div className="modal-content animate-fade-up" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
              <div className="modal-header">
                <div>
                  <h3 className="modal-title">Shoot Reservation Details</h3>
                  <div style={{ fontFamily: "monospace", fontSize: "0.78rem", color: "var(--gold-400)", marginTop: 2 }}>
                    {selectedBooking.id}
                  </div>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => setSelectedBooking(null)}>
                  <X size={18} />
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Current Status</span>
                  {getStatusBadge(selectedBooking.status || "Confirmed")}
                </div>

                <div className="booking-modal-grid">
                  <div className="booking-modal-item">
                    <User size={15} color="var(--gold-400)" />
                    <div>
                      <div className="b-label">Client Name</div>
                      <div className="b-val">{selectedBooking.client}</div>
                    </div>
                  </div>
                  <div className="booking-modal-item">
                    <Camera size={15} color="var(--gold-400)" />
                    <div>
                      <div className="b-label">Event Category</div>
                      <div className="b-val">{selectedBooking.event || selectedBooking.photographyType}</div>
                    </div>
                  </div>
                  <div className="booking-modal-item">
                    <Clock size={15} color="var(--gold-400)" />
                    <div>
                      <div className="b-label">Date & Time</div>
                      <div className="b-val">{selectedBooking.date} ({selectedBooking.time})</div>
                    </div>
                  </div>
                  <div className="booking-modal-item">
                    <MapPin size={15} color="var(--gold-400)" />
                    <div>
                      <div className="b-label">Event Location</div>
                      <div className="b-val">{selectedBooking.location || "Colombo"}</div>
                    </div>
                  </div>
                </div>

                {selectedBooking.selectedServices && selectedBooking.selectedServices.length > 0 && (
                  <div style={{ padding: 12, borderRadius: "var(--radius-md)", background: "rgba(255,255,255,0.03)", border: "1px solid var(--glass-border)" }}>
                    <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: 6 }}>Selected Add-ons</div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {selectedBooking.selectedServices.map((s, idx) => (
                        <span key={idx} className="badge badge-pending" style={{ fontSize: "0.75rem" }}>
                          {s.name} (+Rs. {s.price?.toLocaleString()})
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ padding: 16, borderRadius: "var(--radius-md)", border: "1px solid var(--glass-border)", background: "rgba(244,168,32,0.04)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Total Payout</span>
                    <span style={{ fontFamily: "Outfit", fontWeight: 800, color: "var(--gold-400)", fontSize: "1.1rem" }}>
                      Rs. {(selectedBooking.amount || selectedBooking.totalAmount || 0)?.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Actions inside modal */}
                {selectedBooking.status === "Confirmed" && (
                  <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                    <button
                      className="btn btn-primary flex-1"
                      onClick={() => handleUpdateStatus(selectedBooking.id, "Completed")}
                    >
                      <Check size={16} /> Mark as Completed
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => {
                        setCancelTarget(selectedBooking);
                        setSelectedBooking(null);
                      }}
                    >
                      <X size={16} /> Cancel Shoot
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Critical Situation Cancellation Modal */}
        {cancelTarget && (
          <div className="modal-backdrop animate-fade-in" onClick={() => setCancelTarget(null)}>
            <div className="modal-content animate-fade-up" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520, border: "1px solid rgba(239, 68, 68, 0.4)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(239, 68, 68, 0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <AlertCircle size={22} color="#ef4444" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800 }}>Critical Situation Cancellation</h3>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Booking #{cancelTarget.id} • {cancelTarget.client}</div>
                </div>
              </div>

              <div className="alert alert-danger" style={{ marginBottom: 18, background: "rgba(239, 68, 68, 0.12)", border: "1px solid rgba(239, 68, 68, 0.3)", color: "#fca5a5", fontSize: "0.85rem", padding: "12px 14px", borderRadius: 8 }}>
                <strong>Client Notification:</strong> An official cancellation notification email will be dispatched to <strong>{cancelTarget.clientEmail || cancelTarget.client}</strong> informing the client of your emergency and processing their 30% advance deposit refund or priority rescheduling.
              </div>

              <div className="form-group" style={{ marginBottom: 14 }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: "0.82rem" }}>Select Reason for Cancellation</label>
                <select
                  className="form-control"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                >
                  <option value="Photographer medical emergency / urgent health issue">Photographer medical emergency / urgent health issue</option>
                  <option value="Critical equipment failure / Camera lens damage">Critical equipment failure / Camera lens damage</option>
                  <option value="Severe weather hazard / Unsafe shooting conditions">Severe weather hazard / Unsafe shooting conditions</option>
                  <option value="Family emergency / Bereavement">Family emergency / Bereavement</option>
                  <option value="Other critical circumstance">Other critical circumstance (specify below)</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 20 }}>
                <label className="form-label" style={{ fontSize: "0.82rem" }}>Direct Explanation to Customer (Optional)</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Explain the critical situation or offer alternate dates..."
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                />
              </div>

              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button className="btn btn-secondary" onClick={() => setCancelTarget(null)}>
                  Abort
                </button>
                <button
                  className="btn btn-danger"
                  style={{ display: "flex", alignItems: "center", gap: 6 }}
                  onClick={handleConfirmCancellation}
                >
                  Confirm & Send Cancellation Email
                </button>
              </div>
            </div>
          </div>
        )}

        <style>{`
          .admin-page-header { margin-bottom: 20px; }
          .admin-toast {
            position: fixed; top: 24px; right: 24px; z-index: 999;
            max-width: 480px; box-shadow: var(--shadow-lg);
          }
          .filter-chips-row {
            display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap;
          }
          .filter-chip {
            display: flex; align-items: center; gap: 8px;
            background: var(--navy-800); border: 1px solid var(--navy-600);
            padding: 8px 16px; border-radius: var(--radius-full);
            color: var(--text-secondary); cursor: pointer; font-size: 0.85rem;
            transition: var(--transition);
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          }
          .filter-chip:hover {
            background: var(--navy-700); color: #ffffff;
            border-color: var(--navy-500);
          }
          .filter-chip.active {
            background: rgba(37,99,235,0.2);
            border-color: #3b82f6;
            color: #60a5fa; font-weight: 700;
          }
          .filter-count {
            background: rgba(255,255,255,0.08); font-size: 0.72rem;
            padding: 2px 7px; border-radius: 10px; font-weight: 700;
            color: var(--text-secondary);
          }
          .admin-search-bar {
            display: flex; align-items: center; justify-content: space-between;
            margin-bottom: 16px; gap: 16px; flex-wrap: wrap;
          }
          .booking-modal-grid {
            display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
          }
          .booking-modal-item {
            display: flex; gap: 10px; align-items: flex-start;
            padding: 10px 12px; border-radius: var(--radius-sm);
            background: var(--navy-700); border: 1px solid var(--navy-600);
          }
          .b-label { font-size: 0.72rem; color: var(--text-muted); font-weight: 600; }
          .b-val { font-size: 0.85rem; font-weight: 700; color: #ffffff; margin-top: 2px; }
        `}</style>
      </main>
    </div>
  );
}
