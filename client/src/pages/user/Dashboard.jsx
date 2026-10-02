import { Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, BookOpen, Plus, CalendarCheck,
  ChevronRight, Zap, Camera, Clock, LogOut
} from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import { useAuth } from "../../context/AuthContext";
import { useBooking } from "../../context/BookingContext";

const statusBadge = (s) => {
  const m = { Confirmed: "badge-confirmed", Pending: "badge-pending", Cancelled: "badge-cancelled", Completed: "badge-completed" };
  return <span className={`badge ${m[s] || "badge-confirmed"}`}>{s}</span>;
};

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { allBookings } = useBooking();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Filter bookings for the logged-in customer
  const userBookings = (allBookings || []).filter(b => {
    if (!user) return true;
    const matchEmail = user.email && b.clientEmail?.toLowerCase() === user.email.toLowerCase();
    const matchName = user.name && b.client?.toLowerCase() === user.name.toLowerCase();
    const matchId = user.id && (b.clientId === user.id || b.userId === user.id);
    return matchEmail || matchName || matchId;
  });

  const stats = {
    total: userBookings.length,
    confirmed: userBookings.filter(b => b.status === "Confirmed").length,
    completed: userBookings.filter(b => b.status === "Completed").length,
    cancelled: userBookings.filter(b => b.status === "Cancelled").length,
  };

  const upcoming = userBookings
    .filter(b => b.status === "Confirmed" || b.status === "Pending")
    .slice(0, 4);

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="page-content" style={{ paddingTop: 88 }}>
        <div className="container" style={{ padding: "32px 24px" }}>

          {/* Header */}
          <div className="dash-header animate-fade-up">
            <div>
              <h1 className="dash-welcome">Welcome, {user?.name || "Customer"}! 👋</h1>
              <p className="dash-sub">Here's your personal photography booking overview.</p>
            </div>
            <div className="dash-header-actions">
              <Link to="/book" className="btn btn-primary btn-sm">
                <Plus size={15} /> Book a Shoot
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="dash-stats animate-fade-up delay-1">
            <div className="stat-card stat-blue">
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">Total Bookings</div>
            </div>
            <div className="stat-card stat-green">
              <div className="stat-value">{stats.confirmed}</div>
              <div className="stat-label">Confirmed</div>
            </div>
            <div className="stat-card stat-cyan">
              <div className="stat-value">{stats.completed}</div>
              <div className="stat-label">Completed</div>
            </div>
            <div className="stat-card stat-red">
              <div className="stat-value">{stats.cancelled}</div>
              <div className="stat-label">Cancelled</div>
            </div>
          </div>

          <div className="dash-grid animate-fade-up delay-2">
            {/* Left Column */}
            <div className="dash-left">
              {/* Quick Actions */}
              <div className="card-elevated dash-section">
                <h3 className="dash-section-title"><Zap size={16} color="var(--gold-400)" /> Quick Actions</h3>
                <div className="quick-actions">
                  <Link to="/book" className="btn btn-primary">
                    <Camera size={16} /> Book Now
                  </Link>
                  <Link to="/my-bookings" className="btn btn-secondary">
                    <BookOpen size={16} /> My Bookings
                  </Link>
                </div>
              </div>

              {/* Upcoming Bookings */}
              <div className="card-elevated dash-section">
                <div className="dash-section-header">
                  <h3 className="dash-section-title"><CalendarCheck size={16} color="var(--gold-400)" /> Upcoming Bookings</h3>
                  <Link to="/my-bookings" className="view-all-link">View All <ChevronRight size={14} /></Link>
                </div>
                <div className="upcoming-list">
                  {upcoming.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "32px 0", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                      No upcoming shoots yet. Ready to capture your memories?
                      <div style={{ marginTop: 12 }}>
                        <Link to="/book" className="btn btn-primary btn-sm">Book Your First Shoot</Link>
                      </div>
                    </div>
                  ) : (
                    upcoming.map((b, i) => (
                      <div key={b.id || i} className="upcoming-item">
                        <div className="upcoming-left">
                          <div className="upcoming-event">{b.event || b.photographyType || "Photo Shoot"}</div>
                          <div className="upcoming-meta">
                            <Clock size={12} /> {b.date} · {b.time || b.slotLabel}
                          </div>
                          <div className="upcoming-meta">Photographer: {b.photographer || b.photographerName}</div>
                        </div>
                        <div className="upcoming-right">
                          {statusBadge(b.status || "Confirmed")}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="dash-right">
              {/* Navigation Sidebar */}
              <div className="card-elevated dash-section">
                <h3 className="dash-section-title">Navigation</h3>
                <div className="dash-nav-list">
                  {[
                    { icon: LayoutDashboard, label: "Dashboard", to: "/dashboard" },
                    { icon: Plus, label: "Book Now", to: "/book" },
                    { icon: BookOpen, label: "My Bookings", to: "/my-bookings" },
                  ].map(({ icon: Icon, label, to }, i) => (
                    <Link key={i} to={to} className="dash-nav-item">
                      <Icon size={16} />
                      <span>{label}</span>
                      <ChevronRight size={14} style={{ marginLeft: "auto", opacity: 0.4 }} />
                    </Link>
                  ))}
                  <button onClick={handleLogout} className="dash-nav-item danger" style={{ background: "none", border: "none", textAlign: "left", width: "100%", cursor: "pointer", color: "#f87171" }}>
                    <LogOut size={16} />
                    <span>Logout</span>
                    <ChevronRight size={14} style={{ marginLeft: "auto", opacity: 0.4 }} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .dash-header {
          display: flex; align-items: flex-start; justify-content: space-between;
          margin-bottom: 28px; gap: 16px; flex-wrap: wrap;
        }
        .dash-welcome { font-size: 1.8rem; font-weight: 800; margin-bottom: 4px; color: #ffffff; }
        .dash-sub { color: var(--text-muted); font-size: 0.88rem; }
        .dash-header-actions { display: flex; gap: 12px; align-items: center; }
        .dash-stats {
          display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 28px;
        }
        .dash-grid {
          display: grid; grid-template-columns: 1fr 360px; gap: 24px;
        }
        .dash-left, .dash-right { display: flex; flex-direction: column; gap: 24px; }
        .dash-section { padding: 24px; background: var(--navy-800); border: 1px solid var(--navy-600); border-radius: var(--radius-lg); }
        .dash-section-title {
          display: flex; align-items: center; gap: 8px;
          font-size: 0.95rem; font-weight: 700; margin-bottom: 16px; color: #ffffff;
        }
        .dash-section-header {
          display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;
        }
        .view-all-link {
          display: flex; align-items: center; gap: 4px;
          font-size: 0.78rem; color: #60a5fa; font-weight: 600; text-decoration: none;
          transition: var(--transition);
        }
        .view-all-link:hover { gap: 8px; color: #93c5fd; }
        .quick-actions { display: flex; gap: 12px; flex-wrap: wrap; }
        .upcoming-list { display: flex; flex-direction: column; gap: 0; }
        .upcoming-item {
          display: flex; justify-content: space-between; align-items: center;
          padding: 14px 0; border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .upcoming-item:last-child { border-bottom: none; }
        .upcoming-event { font-size: 0.88rem; font-weight: 600; margin-bottom: 4px; color: #ffffff; }
        .upcoming-meta {
          font-size: 0.75rem; color: var(--text-muted);
          display: flex; align-items: center; gap: 4px; margin-top: 2px;
        }
        .dash-nav-list { display: flex; flex-direction: column; gap: 6px; }
        .dash-nav-item {
          display: flex; align-items: center; gap: 10px;
          padding: 11px 14px; border-radius: var(--radius-md);
          color: var(--text-secondary); font-size: 0.85rem; font-weight: 500;
          transition: var(--transition); text-decoration: none;
          border: 1px solid transparent; background: rgba(255,255,255,0.03);
        }
        .dash-nav-item:hover { background: var(--navy-700); color: #ffffff; border-color: var(--navy-500); }
        @media (max-width: 1024px) {
          .dash-stats { grid-template-columns: repeat(2, 1fr); }
          .dash-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 640px) {
          .dash-stats { grid-template-columns: 1fr 1fr; }
        }
      `}</style>
    </div>
  );
}
