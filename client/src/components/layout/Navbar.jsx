import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Camera, Menu, X, User, LogOut, BookOpen, LayoutDashboard } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setDropOpen(false);
    setMenuOpen(false);
    navigate("/");
  };

  const handleNavScroll = (id) => {
    setMenuOpen(false);
    if (window.location.pathname === "/") {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
        return;
      }
    }
    navigate(`/#${id}`);
  };

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <div className="logo-icon">
            <Camera size={20} />
          </div>
          <div>
            <div className="logo-name">SHUTTER MOMENTS</div>
            <div className="logo-tagline">Photography Services</div>
          </div>
        </Link>

        {/* Desktop Links */}
        <ul className="navbar-links">
          <li><Link to="/" className="nav-link">Home</Link></li>
          <li><button type="button" onClick={() => handleNavScroll("services")} className="nav-link nav-btn-link">Services</button></li>
          <li><Link to="/about" className="nav-link">About Us</Link></li>
          <li><button type="button" onClick={() => handleNavScroll("gallery")} className="nav-link nav-btn-link">Gallery</button></li>
          <li><button type="button" onClick={() => handleNavScroll("contact")} className="nav-link nav-btn-link">Contact</button></li>
        </ul>

        {/* Right Actions */}
        <div className="navbar-actions">
          {user ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div className="user-menu-wrapper">
                <button className="user-avatar-btn" onClick={() => setDropOpen(!dropOpen)}>
                  <div className="user-avatar-circle">
                    {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <span>{user.name || "My Account"}</span>
                </button>
                {dropOpen && (
                  <div className="user-dropdown animate-fade-in">
                    <Link to="/dashboard" className="dropdown-item" onClick={() => setDropOpen(false)}>
                      <LayoutDashboard size={15} /> Dashboard
                    </Link>
                    <Link to="/my-bookings" className="dropdown-item" onClick={() => setDropOpen(false)}>
                      <BookOpen size={15} /> My Bookings
                    </Link>
                    <div className="dropdown-divider" />
                    <button className="dropdown-item danger" onClick={handleLogout}>
                      <LogOut size={15} /> Logout
                    </button>
                  </div>
                )}
              </div>
              <button
                onClick={handleLogout}
                className="btn btn-ghost btn-sm"
                title="Log out of account"
                style={{ padding: "7px 12px", fontSize: "0.8rem", display: "inline-flex", gap: 6 }}
              >
                <LogOut size={14} /> Logout
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm">Login</Link>
          )}
          <button className="mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="mobile-menu animate-fade-in">
          <Link to="/" className="mobile-link" onClick={() => setMenuOpen(false)}>Home</Link>
          <button type="button" className="mobile-link text-left" onClick={() => handleNavScroll("services")}>Services</button>
          <Link to="/about" className="mobile-link" onClick={() => setMenuOpen(false)}>About Us</Link>
          <button type="button" className="mobile-link text-left" onClick={() => handleNavScroll("gallery")}>Gallery</button>
          <button type="button" className="mobile-link text-left" onClick={() => handleNavScroll("contact")}>Contact</button>
          {user ? (
            <div style={{ padding: "10px 0", borderTop: "1px solid var(--navy-600)", marginTop: 8 }}>
              <div style={{ color: "#ffffff", fontWeight: 700, padding: "8px 16px", fontSize: "0.88rem" }}>
                Signed in as {user.name}
              </div>
              <Link to="/dashboard" className="mobile-link" onClick={() => setMenuOpen(false)}>
                Dashboard
              </Link>
              <Link to="/my-bookings" className="mobile-link" onClick={() => setMenuOpen(false)}>
                My Bookings
              </Link>
              <button
                type="button"
                className="mobile-link text-left"
                style={{ color: "#f87171", border: "none", background: "none", width: "100%", display: "flex", alignItems: "center", gap: 8 }}
                onClick={handleLogout}
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary w-full" onClick={() => setMenuOpen(false)}>Login</Link>
          )}
        </div>
      )}

      <style>{`
        .navbar {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          background: rgba(6, 13, 27, 0.88);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--navy-600);
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        }
        .navbar-inner {
          display: flex; align-items: center; justify-content: space-between;
          height: 68px;
        }
        .navbar-logo {
          display: flex; align-items: center; gap: 12px;
          text-decoration: none;
        }
        .logo-icon {
          width: 38px; height: 38px;
          background: linear-gradient(135deg, var(--blue-500), #1d4ed8);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          color: #ffffff;
          box-shadow: 0 4px 12px rgba(37,99,235,0.3);
        }
        .logo-name {
          font-family: 'Outfit', sans-serif;
          font-size: 0.95rem; font-weight: 800;
          letter-spacing: 0.08em;
          color: #ffffff;
        }
        .logo-tagline {
          font-size: 0.62rem; color: var(--gold-400);
          letter-spacing: 0.06em; margin-top: -2px; font-weight: 600;
        }
        .navbar-links {
          display: flex; align-items: center; gap: 4px; list-style: none;
        }
        .nav-link {
          padding: 8px 14px; border-radius: var(--radius-md);
          color: var(--text-secondary); font-size: 0.87rem; font-weight: 600;
          transition: var(--transition); text-decoration: none;
        }
        .nav-btn-link {
          background: none; border: none; cursor: pointer; font-family: inherit;
        }
        button.mobile-link {
          background: none; border: none; cursor: pointer; font-family: inherit; width: 100%; text-align: left;
        }
        .nav-link:hover { color: #ffffff; background: var(--navy-700); }
        .navbar-actions { display: flex; align-items: center; gap: 12px; }
        .user-menu-wrapper { position: relative; }
        .user-avatar-btn {
          display: flex; align-items: center; gap: 8px;
          background: var(--navy-800); border: 1px solid var(--navy-600);
          border-radius: var(--radius-full); padding: 5px 12px 5px 5px;
          color: #ffffff; font-size: 0.85rem; font-weight: 600;
          cursor: pointer; transition: var(--transition);
        }
        .user-avatar-btn:hover { background: var(--navy-700); border-color: var(--blue-500); }
        .user-avatar-circle {
          width: 28px; height: 28px; border-radius: 50%;
          background: linear-gradient(135deg, var(--blue-500), #1d4ed8);
          color: #ffffff; display: flex; align-items: center; justify-content: center;
          font-weight: 800; font-size: 0.85rem;
        }
        .user-dropdown {
          position: absolute; top: calc(100% + 8px); right: 0;
          background: var(--navy-800);
          border: 1px solid var(--navy-600);
          border-radius: var(--radius-md); overflow: hidden;
          box-shadow: var(--shadow-lg); min-width: 180px; z-index: 200;
        }
        .dropdown-item {
          display: flex; align-items: center; gap: 10px;
          padding: 12px 16px; color: var(--text-secondary);
          font-size: 0.85rem; font-weight: 500;
          cursor: pointer; transition: var(--transition);
          background: none; border: none; width: 100%; text-align: left;
          text-decoration: none;
        }
        .dropdown-item:hover { background: var(--navy-700); color: #ffffff; }
        .dropdown-item.danger:hover { color: var(--red-400); background: rgba(239,68,68,0.15); }
        .dropdown-divider { height: 1px; background: var(--navy-600); margin: 4px 0; }
        .mobile-menu-btn {
          display: none; background: none; border: none; color: #ffffff; padding: 4px;
        }
        .mobile-menu {
          display: none; flex-direction: column; gap: 4px;
          padding: 16px 24px; background: var(--navy-800);
          border-top: 1px solid var(--navy-600);
          box-shadow: var(--shadow-md);
        }
        .mobile-link {
          display: block; padding: 12px 16px; color: var(--text-secondary);
          font-weight: 500; border-radius: var(--radius-md);
          transition: var(--transition); text-decoration: none;
        }
        .mobile-link:hover { background: var(--navy-700); color: #ffffff; }
        @media (max-width: 768px) {
          .navbar-links { display: none; }
          .mobile-menu-btn { display: flex; }
          .mobile-menu { display: flex; }
        }
      `}</style>
    </nav>
  );
}
