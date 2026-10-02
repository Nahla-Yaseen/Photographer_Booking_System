import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Search, Filter, Eye, Download, CalendarCheck,
  Clock, MapPin, ChevronDown,
} from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import { useAuth } from "../../context/AuthContext";
import { useBooking } from "../../context/BookingContext";
import { downloadInvoicePDF } from "../../utils/invoiceGenerator";

const TABS = ["All", "Confirmed", "Completed", "Cancelled"];

const statusBadge = (s) => {
  const m = { Confirmed: "badge-confirmed", Cancelled: "badge-cancelled", Completed: "badge-completed" };
  return <span className={`badge ${m[s] || "badge-confirmed"}`}>{s}</span>;
};

export default function MyBookings() {
  const { allBookings } = useBooking();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  // Filter bookings belonging to logged-in user
  const userBookings = (allBookings || []).filter(b => {
    if (!user) return true;
    const userEmail = (user.email || "").trim().toLowerCase();
    const userName = (user.name || "").trim().toLowerCase();
    const userId = user.id || user.firebaseUid;

    const bEmail = (b.clientEmail || "").trim().toLowerCase();
    const bName = (b.client || "").trim().toLowerCase();
    const bId = b.clientId || b.userId;

    const matchEmail = Boolean(userEmail && bEmail && bEmail === userEmail);
    const matchName = Boolean(userName && bName && bName === userName);
    const matchId = Boolean(userId && bId && bId === userId);

    return matchEmail || matchName || matchId;
  });

  const filtered = userBookings.filter(b => {
    const matchTab = activeTab === "All" || (b.status || "").toLowerCase() === activeTab.toLowerCase();
    const matchSearch =
      (b.event || b.photographyType || "").toLowerCase().includes(search.toLowerCase()) ||
      (b.id || "").toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="page-content" style={{ paddingTop: 88 }}>
        <div className="container" style={{ padding: "40px 24px" }}>

          {/* Header */}
          <div className="page-head animate-fade-up">
            <div>
              <h1 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: 4, color: "#ffffff" }}>My Bookings</h1>
              <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>
                {user ? `Welcome back, ${user.name}. Track and manage all your photography reservations.` : "Manage and track all your photography bookings"}
              </p>
            </div>
            <Link to="/book" className="btn btn-primary">+ New Booking</Link>
          </div>

          {/* Tabs */}
          <div className="bookings-tabs animate-fade-up delay-1">
            {TABS.map(t => (
              <button
                key={t}
                className={`booking-tab ${activeTab === t ? "active" : ""}`}
                onClick={() => setActiveTab(t)}
              >
                {t}
                <span className="tab-count">
                  {t === "All" ? userBookings.length : userBookings.filter(b => (b.status || "").toLowerCase() === t.toLowerCase()).length}
                </span>
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="bookings-toolbar animate-fade-up delay-2">
            <div className="input-icon-wrapper" style={{ maxWidth: 340 }}>
              <Search size={16} className="input-icon" />
              <input className="form-control" placeholder="Search by event or booking ID…"
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <button className="btn btn-ghost btn-sm"><Filter size={14} /> Filter</button>
          </div>

          {/* Table */}
          <div className="table-wrapper animate-fade-up delay-3">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Event</th>
                  <th>Date</th>
                  <th>Time / Package</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(b => {
                  const displayTime = b.time || b.slotLabel || (b.startTime ? `${b.startTime} – ${b.endTime}` : "Scheduled Time");
                  const timeStart = displayTime.includes("–") ? displayTime.split("–")[0].trim() : displayTime.includes("-") ? displayTime.split("-")[0].trim() : displayTime;
                  const packageLabel = b.package || b.packageType || (b.bookingType === "time_based" ? "Hourly Shoot" : "Standard Package");
                  const totalAmountNum = Number(b.totalAmount ?? b.amount ?? 0);
                  const addOnServices = Array.isArray(b.services)
                    ? b.services
                    : Array.isArray(b.selectedServices)
                    ? b.selectedServices.map(s => typeof s === "string" ? s : s.name)
                    : [];
                  const photogName = b.photographer || b.photographerName || "Professional Photographer";

                  return (
                    <React.Fragment key={b.id}>
                      <tr style={{ cursor: "pointer" }} onClick={() => setExpandedId(expandedId === b.id ? null : b.id)}>
                        <td><span className="booking-id">{b.id}</span></td>
                        <td><span style={{ fontWeight: 600 }}>{b.event || b.photographyType || "Photo Shoot"}</span></td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.82rem" }}>
                            <CalendarCheck size={13} color="var(--gold-400)" /> {b.date || "Upcoming Date"}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontSize: "0.8rem" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                              <Clock size={12} color="var(--text-muted)" /> {timeStart}
                            </div>
                            <div style={{ color: "var(--text-muted)", marginTop: 2 }}>{packageLabel}</div>
                          </div>
                        </td>
                        <td><span style={{ fontWeight: 700, color: "var(--gold-400)" }}>Rs. {totalAmountNum.toLocaleString()}</span></td>
                        <td>{statusBadge(b.status || "Confirmed")}</td>
                        <td>
                          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <button className="btn btn-ghost btn-sm" onClick={e => { e.stopPropagation(); setExpandedId(expandedId === b.id ? null : b.id); }}>
                              <Eye size={14} /> View
                            </button>
                            <ChevronDown size={16} color="var(--text-muted)"
                              style={{ transform: expandedId === b.id ? "rotate(180deg)" : "none", transition: "var(--transition)" }} />
                          </div>
                        </td>
                      </tr>
                      {expandedId === b.id && (
                        <tr key={`${b.id}-detail`}>
                          <td colSpan={7} style={{ padding: 0 }}>
                            <div className="booking-expand">
                              <div className="expand-grid">
                                <div className="expand-item">
                                  <span className="expand-label">Photographer</span>
                                  <span className="expand-val">{photogName}</span>
                                </div>
                                <div className="expand-item">
                                  <span className="expand-label"><MapPin size={12} /> Location</span>
                                  <span className="expand-val">{b.location || "On-site"}</span>
                                </div>
                                <div className="expand-item">
                                  <span className="expand-label">Add-on Services</span>
                                  <span className="expand-val">
                                    {addOnServices.length > 0 ? addOnServices.join(", ") : "None"}
                                  </span>
                                </div>
                                <div className="expand-item">
                                  <span className="expand-label">Full Time</span>
                                  <span className="expand-val">{displayTime}</span>
                                </div>
                              </div>
                              <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                                <button 
                                  className="btn btn-ghost btn-sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    downloadInvoicePDF(b, { name: b.client || user?.name, email: b.clientEmail || user?.email, phone: b.clientPhone || user?.phone });
                                  }}
                                >
                                  <Download size={14} /> Invoice (PDF)
                                </button>
                                {b.status === "Pending" && (
                                  <button className="btn btn-danger btn-sm">Cancel Booking</button>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: "48px 16px", color: "var(--text-muted)" }}>
                      <div style={{ marginBottom: 12 }}>No bookings found for your account.</div>
                      <Link to="/book" className="btn btn-primary btn-sm">Book Your First Shoot</Link>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Booking Note */}
          <div className="card" style={{ padding: 20, marginTop: 24 }}>
            <h4 style={{ fontSize: "0.85rem", fontWeight: 700, marginBottom: 10, color: "#2563eb" }}>Booking Notes</h4>
            <ul style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                "You can cancel only pending bookings.",
                "Once a booking is confirmed, it cannot be cancelled.",
                "Contact our support for any changes.",
              ].map((n, i) => (
                <li key={i} style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <span style={{ color: "#2563eb", marginTop: 2 }}>•</span> {n}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <style>{`
        .page-head {
          display: flex; justify-content: space-between; align-items: flex-start;
          margin-bottom: 28px; flex-wrap: wrap; gap: 16px;
        }
        .bookings-tabs {
          display: flex; gap: 4px; margin-bottom: 20px; flex-wrap: wrap;
          background: var(--navy-800); border: 1px solid var(--navy-600);
          border-radius: var(--radius-md); padding: 6px;
        }
        .booking-tab {
          display: flex; align-items: center; gap: 8px;
          padding: 8px 16px; border-radius: calc(var(--radius-md) - 2px);
          background: none; border: none; color: var(--text-muted);
          font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: var(--transition);
        }
        .booking-tab.active { background: #2563eb; color: #ffffff; }
        .booking-tab:not(.active):hover { background: var(--navy-700); color: #ffffff; }
        .tab-count {
          background: rgba(255,255,255,0.08); border-radius: var(--radius-full);
          padding: 1px 7px; font-size: 0.7rem;
        }
        .booking-tab.active .tab-count { background: rgba(255,255,255,0.25); }
        .bookings-toolbar { display: flex; gap: 12px; margin-bottom: 16px; align-items: center; }
        .booking-id { font-size: 0.78rem; color: #60a5fa; font-weight: 700; font-family: monospace; }
        .booking-expand {
          padding: 20px 24px;
          background: var(--navy-700);
          border-top: 1px solid var(--navy-600);
          animation: fadeInUp 0.2s ease;
        }
        .expand-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
        .expand-item { display: flex; flex-direction: column; gap: 4px; }
        .expand-label { font-size: 0.72rem; color: var(--text-muted); font-weight: 600; letter-spacing: 0.04em; display: flex; align-items: center; gap: 4px; }
        .expand-val { font-size: 0.85rem; font-weight: 600; }
        @media (max-width: 768px) { .expand-grid { grid-template-columns: repeat(2, 1fr); } }
      `}</style>
    </div>
  );
}
