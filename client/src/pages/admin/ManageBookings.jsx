import { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  Eye,
  Trash2,
  Search,
  Check,
  X,
  Calendar,
  Mail,
  User,
  Camera,
  MapPin,
  AlertCircle,
  Download,
  AlertTriangle,
  Send
} from "lucide-react";
import AdminSidebar from "../../components/layout/AdminSidebar";
import { useBooking } from "../../context/BookingContext";
import { useAuth } from "../../context/AuthContext";
import { PHOTOGRAPHERS } from "../../data/mockData";
import { downloadInvoicePDF } from "../../utils/invoiceGenerator";

export default function ManageBookings() {
  const { allBookings, updateBookingStatus, removeBooking } = useBooking();
  const { photographersList } = useAuth();
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelReason, setCancelReason] = useState("Photographer medical emergency / Critical availability conflict");
  const [customReason, setCustomReason] = useState("");
  const [notification, setNotification] = useState(null);

  const getPhotographerDisplay = (b) => {
    if (b.photographer && b.photographer !== "Professional Photographer") {
      return b.photographer;
    }
    if (b.photographerName && b.photographerName !== "Professional Photographer") {
      return b.photographerName;
    }
    if (b.photographerId) {
      const live = (photographersList || []).find((p) => p.id === b.photographerId);
      if (live?.name) return live.name;
      const mock = (PHOTOGRAPHERS || []).find((p) => p.id === b.photographerId);
      if (mock?.name) return mock.name;
    }
    const matched = (photographersList || []).find(
      (p) => p.specialization?.toLowerCase() === (b.event || b.photographyType || "").toLowerCase()
    );
    if (matched?.name) return matched.name;
    return photographersList?.[0]?.name || PHOTOGRAPHERS?.[0]?.name || "Alex Morgan";
  };

  const showNotification = (msg, type = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4500);
  };

  const handleUpdateStatus = (id, newStatus) => {
    updateBookingStatus(id, newStatus);

    const booking = allBookings.find((b) => b.id === id);
    const clientName = booking ? booking.client : "Client";

    if (newStatus === "Confirmed") {
      showNotification(
        `Booking ${id} is Confirmed! Notification sent to ${clientName}.`,
        "success"
      );
    } else if (newStatus === "Completed") {
      showNotification(
        `Booking ${id} marked as Completed! Shoot accomplished successfully.`,
        "success"
      );
    } else {
      showNotification(`Booking ${id} status updated to ${newStatus}.`, "info");
    }

    if (selectedBooking && selectedBooking.id === id) {
      setSelectedBooking((prev) => ({ ...prev, status: newStatus }));
    }
  };

  const handleConfirmCancellation = () => {
    if (!cancelTarget) return;
    const finalReason = customReason.trim() ? customReason.trim() : cancelReason;

    updateBookingStatus(cancelTarget.id, "Cancelled", finalReason, "Admin Management", cancelTarget);

    showNotification(
      `Booking ${cancelTarget.id} has been cancelled. Urgent cancellation email sent to ${cancelTarget.clientEmail || cancelTarget.client} with refund details.`,
      "error"
    );

    if (selectedBooking && selectedBooking.id === cancelTarget.id) {
      setSelectedBooking((prev) => ({ ...prev, status: "Cancelled", cancellationReason: finalReason }));
    }

    setCancelTarget(null);
    setCustomReason("");
  };

  const handleDelete = (id) => {
    if (window.confirm(`Permanently remove booking ${id}?`)) {
      removeBooking(id);
      if (selectedBooking && selectedBooking.id === id) {
        setSelectedBooking(null);
      }
      showNotification(`Booking ${id} deleted successfully.`, "info");
    }
  };

  const filtered = allBookings.filter((b) => {
    const matchesFilter = activeFilter === "All" || b.status?.toLowerCase() === activeFilter.toLowerCase();
    const matchesSearch =
      (b.id || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.event || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.client || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      getPhotographerDisplay(b).toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status) => {
    const map = {
      Confirmed: "badge-confirmed",
      Cancelled: "badge-cancelled",
      Completed: "badge-completed",
    };
    return <span className={`badge ${map[status] || "badge-confirmed"}`}>{status}</span>;
  };

  const filterCounts = {
    All: allBookings.length,
    Confirmed: allBookings.filter((b) => b.status === "Confirmed").length,
    Completed: allBookings.filter((b) => b.status === "Completed").length,
    Cancelled: allBookings.filter((b) => b.status === "Cancelled").length,
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-main">
        {/* Floating Notification */}
        {notification && (
          <div className={`alert alert-${notification.type} admin-toast animate-slide-in`}>
            {notification.type === "success" && <CheckCircle2 size={18} />}
            {notification.type === "error" && <XCircle size={18} />}
            {notification.type === "info" && <CheckCircle2 size={18} />}
            <span>{notification.msg}</span>
          </div>
        )}

        {/* Page Header */}
        <div className="admin-page-header animate-fade-up">
          <div>
            <h1 style={{ fontSize: "1.6rem", fontWeight: 800, marginBottom: 4 }}>
              Manage Bookings
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
              Live Firestore bookings, payment receipts & cancellation dispatches
            </p>
          </div>
        </div>

        {/* Status Filters */}
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

        {/* Search & Actions Bar */}
        <div className="admin-search-bar animate-fade-up delay-1">
          <div className="input-icon-wrapper" style={{ maxWidth: 380, flex: 1 }}>
            <Search size={16} className="input-icon" />
            <input
              type="text"
              className="form-control"
              placeholder="Search by ID, client, event, photographer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>
            Showing {filtered.length} of {allBookings.length} reservations
          </div>
        </div>

        {/* Bookings Table */}
        <div className="table-wrapper animate-fade-up delay-2">
          <table className="data-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Event Type</th>
                <th>Client</th>
                <th>Photographer</th>
                <th>Date & Time</th>
                <th>Deposit (30%)</th>
                <th>Total (Rs.)</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)" }}>
                    No matching bookings found
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
                    <td>
                      <div>{b.client}</div>
                      <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{b.clientEmail || "Email on file"}</div>
                    </td>
                    <td style={{ color: "var(--text-secondary)", fontWeight: 600 }}>{getPhotographerDisplay(b)}</td>
                    <td>
                      <div style={{ fontSize: "0.82rem" }}>{b.date}</div>
                      <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{b.time}</div>
                    </td>
                    <td style={{ color: "#34d399", fontWeight: 700, fontSize: "0.82rem" }}>
                      Rs. {((b.amount || b.totalAmount || 0) * 0.3).toLocaleString()}
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
                        <button
                          className="btn btn-ghost btn-sm"
                          title="Download PDF Invoice"
                          onClick={() => downloadInvoicePDF(b, { name: b.client, email: b.clientEmail, phone: b.clientPhone })}
                        >
                          <Download size={14} />
                        </button>
                        {b.status === "Confirmed" && (
                          <>
                            <button
                              className="btn btn-ghost btn-sm"
                              style={{ color: "#38bdf8", border: "1px solid rgba(56,189,248,0.2)" }}
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
                        <button
                          className="btn btn-ghost btn-sm"
                          title="Delete Record"
                          onClick={() => handleDelete(b.id)}
                        >
                          <Trash2 size={13} color="var(--text-muted)" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* View Details Modal */}
        {selectedBooking && (
          <div className="modal-overlay" onClick={() => setSelectedBooking(null)}>
            <div className="modal-box animate-scale-up" style={{ maxWidth: 540 }} onClick={(e) => e.stopPropagation()}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>
                  Booking Details #{selectedBooking.id}
                </h3>
                <button className="btn btn-ghost btn-sm" onClick={() => setSelectedBooking(null)}>
                  <X size={18} />
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div className="booking-modal-grid">
                  <div className="booking-modal-item">
                    <User size={16} color="var(--gold-400)" />
                    <div>
                      <div className="b-label">Client</div>
                      <div className="b-val">{selectedBooking.client}</div>
                    </div>
                  </div>
                  <div className="booking-modal-item">
                    <Mail size={16} color="var(--gold-400)" />
                    <div>
                      <div className="b-label">Email</div>
                      <div className="b-val">{selectedBooking.clientEmail || "Email on file"}</div>
                    </div>
                  </div>
                  <div className="booking-modal-item">
                    <Camera size={16} color="var(--gold-400)" />
                    <div>
                      <div className="b-label">Photographer</div>
                      <div className="b-val">{getPhotographerDisplay(selectedBooking)}</div>
                    </div>
                  </div>
                  <div className="booking-modal-item">
                    <Calendar size={16} color="var(--gold-400)" />
                    <div>
                      <div className="b-label">Event Date & Time</div>
                      <div className="b-val">{selectedBooking.date} • {selectedBooking.time}</div>
                    </div>
                  </div>
                  <div className="booking-modal-item">
                    <MapPin size={16} color="var(--gold-400)" />
                    <div>
                      <div className="b-label">Location</div>
                      <div className="b-val">{selectedBooking.location || "On-site"}</div>
                    </div>
                  </div>
                  <div className="booking-modal-item">
                    <AlertCircle size={16} color="var(--gold-400)" />
                    <div>
                      <div className="b-label">Financial Breakdown</div>
                      <div className="b-val" style={{ color: "#34d399" }}>
                        30% Paid: Rs. {((selectedBooking.amount || selectedBooking.totalAmount || 0) * 0.3).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>

                {selectedBooking.cancellationReason && (
                  <div style={{ padding: "12px 16px", background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: 8, color: "#fca5a5", fontSize: "0.85rem" }}>
                    <strong>Cancellation Reason:</strong> {selectedBooking.cancellationReason}
                  </div>
                )}

                <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                  <button
                    className="btn btn-secondary flex-1"
                    onClick={() => downloadInvoicePDF(selectedBooking, { name: selectedBooking.client, email: selectedBooking.clientEmail })}
                  >
                    <Download size={16} /> Download Invoice PDF
                  </button>

                  {selectedBooking.status === "Confirmed" && (
                    <>
                      <button
                        className="btn btn-primary flex-1"
                        onClick={() => handleUpdateStatus(selectedBooking.id, "Completed")}
                      >
                        <Check size={16} /> Mark Completed
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => {
                          setCancelTarget(selectedBooking);
                          setSelectedBooking(null);
                        }}
                      >
                        <X size={16} /> Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Critical Situation Cancellation Modal */}
        {cancelTarget && (
          <div className="modal-overlay" onClick={() => setCancelTarget(null)}>
            <div className="modal-box animate-scale-up" style={{ maxWidth: 520, border: "1px solid rgba(239, 68, 68, 0.4)" }} onClick={(e) => e.stopPropagation()}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(239, 68, 68, 0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <AlertTriangle size={22} color="#ef4444" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800 }}>Critical Situation Cancellation</h3>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Booking #{cancelTarget.id} • {cancelTarget.client}</div>
                </div>
              </div>

              <div className="alert alert-danger" style={{ marginBottom: 18, background: "rgba(239, 68, 68, 0.12)", border: "1px solid rgba(239, 68, 68, 0.3)", color: "#fca5a5", fontSize: "0.85rem", padding: "12px 14px", borderRadius: 8 }}>
                <strong>Automated Client Email:</strong> An official cancellation notification email will be dispatched to <strong>{cancelTarget.clientEmail || cancelTarget.client}</strong> informing them of the critical cancellation and explaining that their 30% advance deposit (Rs. {((cancelTarget.amount || cancelTarget.totalAmount || 0) * 0.3).toLocaleString()}) is eligible for an immediate 100% refund or priority rescheduling.
              </div>

              <div className="form-group" style={{ marginBottom: 14 }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: "0.82rem" }}>Select Reason for Cancellation</label>
                <select
                  className="form-control"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                >
                  <option value="Photographer medical emergency / Critical availability conflict">Photographer medical emergency / Critical availability conflict</option>
                  <option value="Severe weather hazard / Unsafe shooting environment">Severe weather hazard / Unsafe shooting environment</option>
                  <option value="Critical technical equipment breakdown / Studio emergency">Critical technical equipment breakdown / Studio emergency</option>
                  <option value="Location permit revoked / Access restricted by venue">Location permit revoked / Access restricted by venue</option>
                  <option value="Other critical circumstance">Other critical circumstance (specify below)</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 20 }}>
                <label className="form-label" style={{ fontSize: "0.82rem" }}>Additional Explanation or Specific Message to Client (Optional)</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Provide any specific context or direct contact notes for the customer..."
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
                  <Send size={15} /> Confirm Cancellation & Send Email
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
          .filter-chips-row { display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; }
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
          .booking-modal-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
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
