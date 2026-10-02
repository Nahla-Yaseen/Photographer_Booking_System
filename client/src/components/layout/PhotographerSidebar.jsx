import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard, CalendarCheck, Clock, User, LogOut,
  Camera, ChevronRight, CheckCircle2, AlertCircle
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/photographer/dashboard" },
  { icon: CalendarCheck, label: "Manage Bookings", path: "/photographer/bookings" },
  { icon: Clock, label: "Manage Availability", path: "/photographer/availability" },
  { icon: User, label: "Manage Profile", path: "/photographer/profile" },
];

export default function PhotographerSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const displayName = user?.name || "Photographer";
  const displayRole = user?.specialization || "Photographer";
  const displayInitials = displayName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <aside className="photographer-sidebar">
      {/* Brand Header */}
      <Link to="/" className="sidebar-brand-link">
        <div className="sidebar-logo-icon">
          <Camera size={22} />
        </div>
        <div>
          <div className="sidebar-brand-name">SHUTTER MOMENTS</div>
          <div className="sidebar-badge-role">Photographer Portal</div>
        </div>
      </Link>

      <div className="sidebar-divider" />

      {/* Navigation Links */}
      <nav className="sidebar-nav">
        {navItems.map(({ icon: Icon, label, path }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={`sidebar-nav-item ${isActive ? "active" : ""}`}
            >
              <Icon size={18} />
              <span>{label}</span>
              {isActive && <ChevronRight size={14} className="active-arrow" />}
            </Link>
          );
        })}
      </nav>

      <div style={{ flex: 1 }} />

      <div className="sidebar-divider" />

      {/* Current Photographer Card */}
      <div className="sidebar-user-card">
        <div className="sidebar-avatar-wrap">
          <div className="sidebar-initials-circle">
            {displayInitials}
          </div>
          <span className="online-indicator" title="Available for Bookings" />
        </div>
        <div className="sidebar-user-details">
          <div className="sidebar-user-name">{displayName}</div>
          <div className="sidebar-user-role">{displayRole}</div>
        </div>
      </div>

      <button className="sidebar-logout-btn" onClick={handleLogout}>
        <LogOut size={16} /> Logout
      </button>

      <style>{`
        .photographer-sidebar {
          position: fixed; left: 0; top: 0; bottom: 0; width: 260px;
          background: var(--navy-800);
          border-right: 1px solid var(--navy-600);
          display: flex; flex-direction: column;
          padding: 24px 16px; gap: 8px; z-index: 50;
          overflow-y: auto;
          box-shadow: 4px 0 20px rgba(0,0,0,0.3);
        }
        .sidebar-brand-link {
          display: flex; align-items: center; gap: 12px;
          text-decoration: none; padding: 4px 8px 12px;
        }
        .sidebar-logo-icon {
          width: 42px; height: 42px; border-radius: 12px;
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          display: flex; align-items: center; justify-content: center;
          color: #ffffff; box-shadow: 0 4px 12px rgba(37,99,235,0.3);
          flex-shrink: 0;
        }
        .sidebar-brand-name {
          font-family: 'Outfit', sans-serif; font-size: 0.85rem;
          font-weight: 800; letter-spacing: 0.06em; color: #ffffff;
        }
        .sidebar-badge-role {
          font-size: 0.7rem; color: var(--gold-400); font-weight: 700;
          letter-spacing: 0.04em; margin-top: 1px;
        }
        .sidebar-divider {
          height: 1px; background: var(--navy-600); margin: 6px 0;
        }
        .sidebar-nav { display: flex; flex-direction: column; gap: 4px; }
        .sidebar-nav-item {
          display: flex; align-items: center; gap: 12px; padding: 11px 14px;
          border-radius: var(--radius-md); font-size: 0.88rem; font-weight: 500;
          color: var(--text-secondary); text-decoration: none; transition: var(--transition);
        }
        .sidebar-nav-item:hover {
          color: #ffffff; background: var(--navy-700);
        }
        .sidebar-nav-item.active {
          color: #60a5fa; background: rgba(37,99,235,0.18);
          border: 1px solid rgba(96,165,250,0.3); font-weight: 600;
        }
        .active-arrow { margin-left: auto; color: #60a5fa; }

        .sidebar-user-card {
          display: flex; align-items: center; gap: 12px; padding: 10px;
          border-radius: var(--radius-md); background: var(--navy-700);
          border: 1px solid var(--navy-600);
        }
        .sidebar-avatar-wrap { position: relative; width: 40px; height: 40px; flex-shrink: 0; }
        .sidebar-initials-circle {
          width: 100%; height: 100%; border-radius: 50%;
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Outfit', sans-serif; font-size: 0.85rem; font-weight: 800;
          color: #fff; letter-spacing: 0.02em;
        }
        .online-indicator {
          position: absolute; bottom: 0; right: 0; width: 10px; height: 10px;
          border-radius: 50%; background: #22c55e; border: 2px solid var(--navy-800);
        }
        .sidebar-user-details { overflow: hidden; }
        .sidebar-user-name {
          font-size: 0.84rem; font-weight: 700; color: #ffffff;
          white-space: nowrap; text-overflow: ellipsis; overflow: hidden;
        }
        .sidebar-user-role {
          font-size: 0.72rem; color: var(--text-muted);
          white-space: nowrap; text-overflow: ellipsis; overflow: hidden;
        }
        .sidebar-logout-btn {
          display: flex; align-items: center; gap: 10px; padding: 10px 14px;
          border-radius: var(--radius-md); font-size: 0.84rem; font-weight: 600;
          color: #f87171; background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.3);
          cursor: pointer; transition: var(--transition);
        }
        .sidebar-logout-btn:hover {
          background: rgba(239,68,68,0.25);
        }
      `}</style>
    </aside>
  );
}
