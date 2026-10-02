import { Link } from "react-router-dom";
import { CalendarCheck, Clock, TrendingUp, Users, CheckCircle, AlertCircle, DollarSign, ArrowUpRight } from "lucide-react";
import AdminSidebar from "../../components/layout/AdminSidebar";
import { useBooking } from "../../context/BookingContext";
import { calculateReports } from "../../services/firestoreService";

const statusBadge = (s) => {
  const m = { Confirmed: "badge-confirmed", Cancelled: "badge-cancelled", Completed: "badge-completed" };
  return <span className={`badge ${m[s] || "badge-confirmed"}`}>{s}</span>;
};

export default function AdminDashboard() {
  const { allBookings } = useBooking();
  const reports = calculateReports(allBookings);

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-main">
        {/* Header */}
        <div className="admin-page-header animate-fade-up">
          <div>
            <h1 style={{ fontSize: "1.6rem", fontWeight: 800, marginBottom: 4 }}>Analytics & Overview</h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Connected to photographerdb-da521 Firestore • Real-time bookings, payments & reports</p>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 6 }}>
              <CalendarCheck size={14} color="var(--gold-400)" />
              {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </div>
          </div>
        </div>

        {/* Financial Revenue Summary Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }} className="animate-fade-up">
          <div className="card-elevated" style={{ padding: 20, borderLeft: "4px solid #2563eb", background: "var(--navy-800)", border: "1px solid var(--navy-600)" }}>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: 6, fontWeight: 600 }}>Total Gross Bookings Value</div>
            <div style={{ fontSize: "1.6rem", fontWeight: 900, color: "#ffffff" }}>
              Rs. {reports.totalGrossRevenue.toLocaleString()}
            </div>
            <div style={{ fontSize: "0.75rem", color: "#60a5fa", marginTop: 4, fontWeight: 600 }}>
              Across {reports.totalBookings} active reservations
            </div>
          </div>

          <div className="card-elevated" style={{ padding: 20, borderLeft: "4px solid #16a34a", background: "var(--navy-800)", border: "1px solid var(--navy-600)" }}>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: 6, fontWeight: 600 }}>30% Advance Payments Collected</div>
            <div style={{ fontSize: "1.6rem", fontWeight: 900, color: "#4ade80" }}>
              Rs. {reports.advanceCollected.toLocaleString()}
            </div>
            <div style={{ fontSize: "0.75rem", color: "#86efac", marginTop: 4, fontWeight: 600 }}>
              Confirmed upfront deposits received
            </div>
          </div>

          <div className="card-elevated" style={{ padding: 20, borderLeft: "4px solid #d97706", background: "var(--navy-800)", border: "1px solid var(--navy-600)" }}>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: 6, fontWeight: 600 }}>70% Remaining Balance Due</div>
            <div style={{ fontSize: "1.6rem", fontWeight: 900, color: "var(--gold-400)" }}>
              Rs. {reports.remainingBalance.toLocaleString()}
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--gold-300)", marginTop: 4, fontWeight: 600 }}>
              Collectable on shoot event days
            </div>
          </div>
        </div>

        {/* Operational Stats */}
        <div className="admin-stats-grid animate-fade-up delay-1">
          <div className="stat-card stat-blue">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div className="stat-value">{reports.totalBookings}</div>
                <div className="stat-label">Total Bookings</div>
              </div>
              <CalendarCheck size={28} opacity={0.4} />
            </div>
          </div>
          <div className="stat-card stat-green">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div className="stat-value">{reports.confirmed}</div>
                <div className="stat-label">Confirmed (30% Paid)</div>
              </div>
              <CheckCircle size={28} opacity={0.4} />
            </div>
          </div>
          <div className="stat-card stat-cyan">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div className="stat-value">{reports.completed}</div>
                <div className="stat-label">Completed Shoots</div>
              </div>
              <TrendingUp size={28} opacity={0.4} />
            </div>
          </div>
          <div className="stat-card stat-red">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div className="stat-value">{reports.cancelled}</div>
                <div className="stat-label">Critical Cancellations</div>
              </div>
              <Users size={28} opacity={0.4} />
            </div>
          </div>
          <div className="stat-card stat-gold">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div className="stat-value">{reports.cancellationRate}%</div>
                <div className="stat-label">Cancellation Rate</div>
              </div>
              <AlertCircle size={28} opacity={0.4} />
            </div>
          </div>
        </div>

        <div className="admin-dash-grid animate-fade-up delay-2">
          {/* Recent Live Bookings Table */}
          <div className="card-elevated" style={{ padding: 24, gridColumn: "span 2" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <h3 style={{ fontSize: "1rem", fontWeight: 700, margin: 0 }}>Recent Reservations (Live Firestore)</h3>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 2 }}>Synced in real time across clients and photographers</div>
              </div>
              <Link to="/admin/bookings" className="btn btn-ghost btn-sm" style={{ display: "flex", alignItems: "center", gap: 4 }}>
                Manage All Bookings <ArrowUpRight size={14} />
              </Link>
            </div>
            <div className="table-wrapper" style={{ borderRadius: "var(--radius-md)" }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>Event Type</th>
                    <th>Client</th>
                    <th>Photographer</th>
                    <th>Date & Time</th>
                    <th>Total (Rs.)</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {allBookings.slice(0, 7).map((b, i) => (
                    <tr key={b.id || i}>
                      <td>
                        <span style={{ fontFamily: "monospace", fontSize: "0.8rem", color: "var(--gold-400)" }}>{b.id}</span>
                      </td>
                      <td style={{ fontWeight: 600, fontSize: "0.85rem" }}>{b.event || b.photographyType}</td>
                      <td style={{ fontSize: "0.82rem" }}>{b.client}</td>
                      <td style={{ fontSize: "0.82rem", color: "var(--text-secondary)", fontWeight: 600 }}>
                        {b.photographerName || (b.photographer && b.photographer !== "Professional Photographer" ? b.photographer : null) || "Alex Morgan"}
                      </td>
                      <td style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{b.date} • {b.time}</td>
                      <td style={{ fontWeight: 700, color: "var(--gold-400)" }}>
                        Rs. {(b.amount || b.totalAmount || 0).toLocaleString()}
                      </td>
                      <td>{statusBadge(b.status || "Confirmed")}</td>
                    </tr>
                  ))}
                  {allBookings.length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ textAlign: "center", padding: 30, color: "var(--text-muted)" }}>
                        No bookings found in Firestore.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      <style>{`
        .admin-page-header {
          display: flex; justify-content: space-between; align-items: flex-start;
          margin-bottom: 24px; flex-wrap: wrap; gap: 12px;
        }
        .admin-stats-grid {
          display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; margin-bottom: 28px;
        }
        .admin-dash-grid {
          display: grid; grid-template-columns: 1fr 2fr; gap: 24px;
        }
        @media (max-width: 1100px) {
          .admin-stats-grid { grid-template-columns: repeat(3, 1fr); }
          .admin-dash-grid { grid-template-columns: 1fr; }
          .admin-dash-grid > *:last-child { grid-column: span 1; }
        }
      `}</style>
    </div>
  );
}
