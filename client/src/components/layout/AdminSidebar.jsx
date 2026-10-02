import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Users, CalendarCheck, Layers, BookOpen,
  LogOut, Camera, MessageSquare, BarChart2,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard",   path: "/admin/dashboard" },
  { icon: CalendarCheck,   label: "Manage Slots Availability", path: "/admin/availability" },
  { icon: Users,           label: "Manage Photographers", path: "/admin/photographers" },
  { icon: Layers,          label: "Manage Services",     path: "/admin/services" },
  { icon: CalendarCheck,   label: "Manage Bookings",     path: "/admin/bookings" },
  { icon: BarChart2,       label: "Manage Reports",      path: "/admin/reports" },
];

export default function AdminSidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => { logout(); navigate("/admin/login"); };

  return (
    <aside className="admin-sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon"><Camera size={20} /></div>
        <div>
          <div className="sidebar-brand">SHUTTER MOMENTS</div>
          <div className="sidebar-role">Admin Panel</div>
        </div>
      </div>

      <div className="sidebar-divider" />

      {/* Nav */}
      <nav className="sidebar-nav">
        {navItems.map(({ icon: Icon, label, path }) => (
          <Link
            key={path}
            to={path}
            className={`sidebar-nav-item ${location.pathname === path ? "active" : ""}`}
          >
            <Icon size={18} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>

      <div style={{ flex: 1 }} />
      <div className="sidebar-divider" />

      {/* Admin Profile */}
      <div className="sidebar-profile">
        <div className="sidebar-avatar">A</div>
        <div>
          <div className="sidebar-uname">Admin User</div>
          <div className="sidebar-uemail">admin@shutter.com</div>
        </div>
      </div>

      <button className="sidebar-logout" onClick={handleLogout}>
        <LogOut size={16} /> Logout
      </button>

      <style>{`
        .admin-sidebar {
          position: fixed; left: 0; top: 0; bottom: 0; width: 260px;
          background: var(--navy-800);
          border-right: 1px solid var(--navy-600);
          display: flex; flex-direction: column;
          padding: 24px 16px; gap: 8px; z-index: 50;
          overflow-y: auto;
          box-shadow: 4px 0 20px rgba(0,0,0,0.3);
        }
        .sidebar-logo {
          display: flex; align-items: center; gap: 12px; padding: 0 4px 8px;
        }
        .sidebar-logo-icon {
          width: 40px; height: 40px;
          background: linear-gradient(135deg, var(--blue-500), #1d4ed8);
          border-radius: 12px; display: flex; align-items: center; justify-content: center;
          color: #ffffff; box-shadow: 0 4px 12px rgba(37,99,235,0.3); flex-shrink: 0;
        }
        .sidebar-brand {
          font-family: 'Outfit', sans-serif; font-size: 0.85rem;
          font-weight: 800; letter-spacing: 0.06em; color: #ffffff;
        }
        .sidebar-role {
          font-size: 0.7rem; color: var(--gold-400);
          letter-spacing: 0.05em; margin-top: -2px; font-weight: 700;
        }
        .sidebar-divider { height: 1px; background: var(--navy-600); margin: 4px 0; }
        .sidebar-nav { display: flex; flex-direction: column; gap: 2px; }
        .sidebar-profile {
          display: flex; align-items: center; gap: 10px; padding: 12px 8px;
        }
        .sidebar-avatar {
          width: 36px; height: 36px; border-radius: 50%;
          background: rgba(37,99,235,0.2); border: 1px solid rgba(59,130,246,0.4);
          color: #60a5fa; display: flex; align-items: center; justify-content: center;
          font-weight: 800; font-size: 0.9rem; flex-shrink: 0;
        }
        .sidebar-uname { font-size: 0.85rem; font-weight: 700; color: #ffffff; }
        .sidebar-uemail { font-size: 0.72rem; color: var(--text-muted); }
        .sidebar-logout {
          display: flex; align-items: center; gap: 8px;
          padding: 10px 20px; border-radius: var(--radius-md);
          background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.3);
          color: #f87171; font-size: 0.85rem; font-weight: 600;
          cursor: pointer; transition: var(--transition); width: 100%;
        }
        .sidebar-logout:hover { background: rgba(239,68,68,0.25); }
      `}</style>
    </aside>
  );
}
