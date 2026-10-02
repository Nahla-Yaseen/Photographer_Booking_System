import { useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarCheck, CheckCircle2, XCircle, Clock, DollarSign,
  Star, MapPin, Camera, User, ArrowRight, Check, X, Eye, AlertCircle
} from "lucide-react";
import PhotographerSidebar from "../../components/layout/PhotographerSidebar";
import { useAuth } from "../../context/AuthContext";
import { useBooking } from "../../context/BookingContext";

export default function PhotographerDashboard() {
  const { user, updatePhotographerProfile } = useAuth();
  const { allBookings, updateBookingStatus } = useBooking();
  const [notification, setNotification] = useState(null);

  const showNotification = (msg, type = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const photographerName = user?.name || "Photographer";

  // Filter bookings assigned to this photographer
  const myBookings = allBookings.filter((b) => {
    const bPhotog = (b.photographer || "").toLowerCase();
    const myName = photographerName.toLowerCase();
    return bPhotog.includes(myName) || myName.includes(bPhotog) || b.photographerId === user?.id;
  });

  const confirmedBookings = myBookings.filter((b) => b.status === "Confirmed");
  const completedBookings = myBookings.filter((b) => b.status === "Completed");
  const cancelledBookings = myBookings.filter((b) => b.status === "Cancelled");

  const totalEarnings = completedBookings.reduce(
    (acc, b) => acc + (b.amount || b.totalAmount || 0),
    0
  );

  const nextShoot = confirmedBookings[0] || null;

  const handleStatusChange = (id, newStatus) => {
    updateBookingStatus(id, newStatus);
    if (newStatus === "Completed") {
      showNotification(`Shoot ${id} marked as Completed! Great job.`, "success");
    } else if (newStatus === "Cancelled") {
      showNotification(`Booking ${id} has been cancelled.`, "error");
    }
  };

  const toggleAvailability = () => {
    const nextState = !(user?.available !== false);
    updatePhotographerProfile({ available: nextState });
    showNotification(
      nextState ? "You are now marked as Available for new client bookings." : "You are now marked as Away/Busy.",
      "info"
    );
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

        {/* Welcome Banner */}
        <div className="photo-welcome-card animate-fade-up">
          <div className="photo-welcome-left">
            <div className="photo-welcome-initials">
              {photographerName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
            </div>
            <div>
              <div className="photo-welcome-badge">
                <Star size={13} fill="currentColor" color="var(--gold-400)" />
                <span>{user?.rating || "5.0"} ({user?.reviews || "0"} client reviews)</span>
              </div>
              <h1 className="photo-welcome-title">Welcome back, {photographerName}!</h1>
              <p className="photo-welcome-sub">
                Specialization: <strong style={{ color: "#93c5fd" }}>{user?.specialization || "Photography"}</strong>{user?.experience ? ` · ${user.experience} Experience` : ""}
              </p>
            </div>
          </div>

          <div className="photo-welcome-right">
            <div className="avail-status-box">
              <div className="avail-status-text">
                <span className={`status-dot ${user?.available !== false ? "green" : "red"}`} />
                <span style={{ fontSize: "0.84rem", fontWeight: 600 }}>
                  {user?.available !== false ? "Available for Bookings" : "Currently Away / Busy"}
                </span>
              </div>
              <button
                className={`btn btn-sm ${user?.available !== false ? "btn-secondary" : "btn-primary"}`}
                onClick={toggleAvailability}
              >
                {user?.available !== false ? "Set as Away" : "Set as Available"}
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="photo-stats-grid animate-fade-up delay-1">
          <div className="stat-card photo-stat-card stat-blue">
            <div className="stat-icon-wrapper" style={{ background: "rgba(37,99,235,0.18)", color: "#60a5fa" }}>
              <Camera size={22} />
            </div>
            <div>
              <div className="stat-value">{myBookings.length}</div>
              <div className="stat-label">Total Assigned Shoots</div>
            </div>
          </div>

          <div className="stat-card photo-stat-card stat-green">
            <div className="stat-icon-wrapper" style={{ background: "rgba(34,197,94,0.18)", color: "#4ade80" }}>
              <CalendarCheck size={22} />
            </div>
            <div>
              <div className="stat-value">{confirmedBookings.length}</div>
              <div className="stat-label">Confirmed Upcoming</div>
            </div>
          </div>

          <div className="stat-card photo-stat-card stat-cyan">
            <div className="stat-icon-wrapper" style={{ background: "rgba(56,189,248,0.18)", color: "#38bdf8" }}>
              <CheckCircle2 size={22} />
            </div>
            <div>
              <div className="stat-value">{completedBookings.length}</div>
              <div className="stat-label">Completed Shoots</div>
            </div>
          </div>

          <div className="stat-card photo-stat-card stat-gold">
            <div className="stat-icon-wrapper" style={{ background: "rgba(244,168,32,0.18)", color: "var(--gold-400)" }}>
              <DollarSign size={22} />
            </div>
            <div>
              <div className="stat-value">Rs. {totalEarnings.toLocaleString()}</div>
              <div className="stat-label">Completed Revenue</div>
            </div>
          </div>
        </div>

        {/* Next Shoot Highlight Banner */}
        {nextShoot && (
          <div className="next-shoot-card animate-fade-up delay-2">
            <div className="next-shoot-header">
              <span className="next-shoot-pill">⚡ Next Upcoming Shoot</span>
              <span className="badge badge-confirmed">Confirmed</span>
            </div>
            <div className="next-shoot-body">
              <div>
                <h3 className="next-shoot-event">{nextShoot.event || nextShoot.photographyType}</h3>
                <div className="next-shoot-meta">
                  <span><User size={14} color="var(--gold-400)" /> Client: {nextShoot.client}</span>
                  <span><Clock size={14} color="var(--gold-400)" /> {nextShoot.date} ({nextShoot.time})</span>
                  <span><MapPin size={14} color="var(--gold-400)" /> {nextShoot.location || "Colombo"}</span>
                </div>
              </div>
              <div className="next-shoot-actions">
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => handleStatusChange(nextShoot.id, "Completed")}
                >
                  <Check size={14} /> Mark as Complete
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleStatusChange(nextShoot.id, "Cancelled")}
                >
                  <X size={14} /> Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Recent Confirmed Bookings Table */}
        <div className="card-elevated animate-fade-up delay-3" style={{ padding: 24, marginTop: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 800 }}>Assigned Shoot Reservations</h2>
              <p style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>
                Update confirmed photoshoot assignments directly to completed or cancelled
              </p>
            </div>
            <Link to="/photographer/bookings" className="btn btn-ghost btn-sm">
              View All Bookings <ArrowRight size={14} />
            </Link>
          </div>

          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Client</th>
                  <th>Event Type</th>
                  <th>Date & Time</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {myBookings.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", padding: "36px 0", color: "var(--text-muted)" }}>
                      No photoshoot bookings assigned yet. New client bookings will appear here automatically!
                    </td>
                  </tr>
                ) : (
                  myBookings.slice(0, 5).map((b) => (
                    <tr key={b.id}>
                      <td>
                        <span style={{ fontFamily: "monospace", color: "var(--gold-400)", fontWeight: 700 }}>
                          {b.id}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600 }}>{b.client}</td>
                      <td>{b.event || b.photographyType}</td>
                      <td>
                        <div style={{ fontSize: "0.82rem" }}>{b.date}</div>
                        <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{b.time}</div>
                      </td>
                      <td style={{ fontWeight: 700, color: "var(--gold-400)" }}>
                        Rs. {(b.amount || b.totalAmount || 0)?.toLocaleString()}
                      </td>
                      <td>
                        <span className={`badge ${b.status === "Completed" ? "badge-completed" : b.status === "Cancelled" ? "badge-cancelled" : "badge-confirmed"}`}>
                          {b.status || "Confirmed"}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 6 }}>
                          {b.status === "Confirmed" && (
                            <>
                              <button
                                className="btn btn-ghost btn-sm"
                                style={{ color: "#38bdf8", border: "1px solid rgba(56,189,248,0.25)" }}
                                title="Mark Complete"
                                onClick={() => handleStatusChange(b.id, "Completed")}
                              >
                                <Check size={13} /> Complete
                              </button>
                              <button
                                className="btn btn-danger btn-sm"
                                style={{ padding: "4px 8px" }}
                                title="Cancel Shoot"
                                onClick={() => handleStatusChange(b.id, "Cancelled")}
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
        </div>

        <style>{`
          .admin-toast {
            position: fixed; top: 24px; right: 24px; z-index: 999;
            max-width: 480px; box-shadow: var(--shadow-lg);
          }
          .photo-stats-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 16px;
            margin-bottom: 28px;
          }
          @media (max-width: 1024px) {
            .photo-stats-grid {
              grid-template-columns: repeat(2, 1fr);
            }
          }
          @media (max-width: 600px) {
            .photo-stats-grid {
              grid-template-columns: 1fr;
            }
          }
          .photo-stat-card {
            display: flex;
            flex-direction: row;
            align-items: center;
            gap: 16px;
            padding: 20px 22px;
          }
          .photo-stat-card .stat-value {
            font-size: 1.7rem;
            line-height: 1.1;
            margin-bottom: 4px;
          }
          .photo-stat-card .stat-label {
            font-size: 0.78rem;
            color: var(--text-secondary);
          }
          .photo-welcome-card {
            display: flex; justify-content: space-between; align-items: center;
            background: var(--navy-800);
            border: 1px solid var(--navy-600); border-radius: var(--radius-xl);
            padding: 28px 32px; margin-bottom: 24px; gap: 24px; flex-wrap: wrap;
            box-shadow: 0 4px 16px rgba(0,0,0,0.25);
          }
          .photo-welcome-left {
            display: flex; align-items: center; gap: 20px;
          }
          .photo-welcome-initials {
            width: 72px; height: 72px; border-radius: 50%; flex-shrink: 0;
            background: linear-gradient(135deg, #2563eb, #1d4ed8);
            display: flex; align-items: center; justify-content: center;
            font-family: 'Outfit', sans-serif; font-size: 1.5rem; font-weight: 800;
            color: #fff; box-shadow: 0 4px 14px rgba(37,99,235,0.25);
            letter-spacing: 0.02em;
          }
          .photo-welcome-badge {
            display: inline-flex; align-items: center; gap: 6px;
            color: #60a5fa; font-size: 0.78rem; font-weight: 700;
            background: rgba(37,99,235,0.18); padding: 3px 10px; border-radius: var(--radius-full);
            margin-bottom: 6px; border: 1px solid rgba(96,165,250,0.3);
          }
          .photo-welcome-title {
            font-size: 1.5rem; font-weight: 800; margin-bottom: 4px; color: #ffffff;
          }
          .photo-welcome-sub {
            font-size: 0.85rem; color: var(--text-secondary);
          }
          .photo-welcome-right {
            display: flex; align-items: center; gap: 16px;
          }
          .avail-status-box {
            display: flex; flex-direction: column; gap: 10px;
            background: var(--navy-700); border: 1px solid var(--navy-600);
            padding: 12px 18px; border-radius: var(--radius-md);
          }
          .avail-status-text {
            display: flex; align-items: center; gap: 8px;
          }
          .status-dot {
            width: 10px; height: 10px; border-radius: 50%;
          }
          .status-dot.green { background: #16a34a; box-shadow: 0 0 8px #16a34a; }
          .status-dot.red { background: #dc2626; box-shadow: 0 0 8px #dc2626; }

          /* Next Shoot Card */
          .next-shoot-card {
            background: var(--navy-800);
            border: 1px solid var(--navy-600); border-radius: var(--radius-lg);
            padding: 22px 24px; box-shadow: 0 4px 14px rgba(0,0,0,0.25);
          }
          .next-shoot-header {
            display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;
          }
          .next-shoot-pill {
            font-size: 0.78rem; font-weight: 700; color: #60a5fa; letter-spacing: 0.05em; text-transform: uppercase;
          }
          .next-shoot-body {
            display: flex; justify-content: space-between; align-items: center; gap: 20px; flex-wrap: wrap;
          }
          .next-shoot-event {
            font-size: 1.2rem; font-weight: 800; margin-bottom: 6px; color: #ffffff;
          }
          .next-shoot-meta {
            display: flex; gap: 18px; flex-wrap: wrap; font-size: 0.84rem; color: var(--text-secondary);
          }
          .next-shoot-meta span { display: flex; align-items: center; gap: 6px; }
          .next-shoot-actions { display: flex; gap: 10px; }
        `}</style>
      </main>
    </div>
  );
}
