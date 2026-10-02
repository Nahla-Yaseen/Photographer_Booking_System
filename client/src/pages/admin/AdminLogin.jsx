import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Camera, Mail, Lock, Eye, EyeOff, ArrowRight, Shield, User, Key, ArrowLeft } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function AdminLogin() {
  const [tab, setTab] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "", adminKey: "", remember: false });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const { loginAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (!form.email || !form.password) { setError("Please fill in all fields."); return; }
    loginAdmin(form.email, form.password);
    navigate("/admin/dashboard");
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (!form.name || !form.email || !form.password) {
      setError("Please fill in all fields.");
      return;
    }
    // Simulate admin account creation
    loginAdmin(form.email, form.password);
    navigate("/admin/dashboard");
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-bg" />

      <div className="admin-login-left animate-slide-left">
        <div className="admin-login-logo">
          <div className="admin-logo-icon"><Camera size={28} /></div>
          <div>
            <div className="admin-brand">SHUTTER MOMENTS</div>
            <div className="admin-brand-sub">Admin Portal</div>
          </div>
        </div>
        <h1 className="admin-login-title">
          Manage Your<br />
          <span className="gradient-text">Photography</span><br />Operations
        </h1>
        <p className="admin-login-desc">
          Complete control center for photographer schedules, customer reservations, packages, and booking approvals.
        </p>
        <div className="admin-login-stats">
          {[
            { val: "128", label: "Total Bookings" },
            { val: "4", label: "Photographers" },
            { val: "Rs. 2.4M", label: "Revenue" },
          ].map((s, i) => (
            <div key={i} className="admin-login-stat">
              <div className="admin-stat-val">{s.val}</div>
              <div className="admin-stat-lbl">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="admin-login-right">
        <div className="admin-login-card animate-fade-up">

          {/* Position Selector Bar */}
          <div style={{ display: "flex", gap: 6, padding: 4, borderRadius: "var(--radius-full)", background: "rgba(255,255,255,0.04)", border: "1px solid var(--glass-border)", marginBottom: 20 }}>
            <Link to="/login" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "7px 10px", borderRadius: "var(--radius-full)", fontSize: "0.76rem", fontWeight: 600, color: "var(--text-muted)", textDecoration: "none" }}>
              <User size={13} /> Customer
            </Link>
            <Link to="/photographer/login" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "7px 10px", borderRadius: "var(--radius-full)", fontSize: "0.76rem", fontWeight: 600, color: "var(--text-muted)", textDecoration: "none" }}>
              <Camera size={13} /> Photographer
            </Link>
            <span style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "7px 10px", borderRadius: "var(--radius-full)", fontSize: "0.76rem", fontWeight: 600, background: "#2563eb", color: "#fff" }}>
              <Shield size={13} /> Admin
            </span>
          </div>

          {/* Admin Header */}
          <div className="admin-card-header">
            <div className="admin-shield">
              <Shield size={26} color="#60a5fa" />
            </div>
            <h2>{tab === "login" ? "Admin Sign In" : "Register Admin"}</h2>
            <p>{tab === "login" ? "Enter your credentials to access the admin dashboard" : "Register a new administrator account"}</p>
          </div>

          {/* Admin Tabs */}
          <div className="admin-tabs">
            <button
              className={`admin-tab ${tab === "login" ? "active" : ""}`}
              onClick={() => { setTab("login"); setError(""); }}
            >
              Admin Login
            </button>
            <button
              className={`admin-tab ${tab === "register" ? "active" : ""}`}
              onClick={() => { setTab("register"); setError(""); }}
            >
              Admin Register
            </button>
          </div>

          {error && <div className="alert alert-error" style={{ marginBottom: 18 }}>{error}</div>}

          {tab === "login" ? (
            <form onSubmit={handleLoginSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div className="form-group">
                <label className="form-label">Admin Email</label>
                <div className="input-icon-wrapper">
                  <Mail size={16} className="input-icon" />
                  <input
                    type="email"
                    className="form-control"
                    placeholder="admin@shutter.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="input-icon-wrapper" style={{ position: "relative" }}>
                  <Lock size={16} className="input-icon" />
                  <input
                    type={showPass ? "text" : "password"}
                    className="form-control"
                    placeholder="Enter admin password"
                    style={{ paddingRight: 44 }}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                  />
                  <button type="button" className="pass-toggle" onClick={() => setShowPass(!showPass)}>
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <label className="custom-checkbox">
                <input
                  type="checkbox"
                  checked={form.remember}
                  onChange={(e) => setForm({ ...form, remember: e.target.checked })}
                />
                <div className="checkmark" style={{ borderRadius: 4 }}>
                  {form.remember && <span style={{ fontSize: 10, color: "#ffffff", fontWeight: 900 }}>✓</span>}
                </div>
                <span style={{ fontSize: "0.83rem", color: "var(--text-secondary)" }}>Remember me on this device</span>
              </label>

              <button type="submit" className="btn btn-primary btn-lg w-full">
                Login to Dashboard <ArrowRight size={18} />
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div className="form-group">
                <label className="form-label">Admin Name</label>
                <div className="input-icon-wrapper">
                  <User size={16} className="input-icon" />
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Sarah Jenkins"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Official Email</label>
                <div className="input-icon-wrapper">
                  <Mail size={16} className="input-icon" />
                  <input
                    type="email"
                    className="form-control"
                    placeholder="admin@shuttermoments.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="input-icon-wrapper" style={{ position: "relative" }}>
                  <Lock size={16} className="input-icon" />
                  <input
                    type={showPass ? "text" : "password"}
                    className="form-control"
                    placeholder="Create strong admin password"
                    style={{ paddingRight: 44 }}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                  />
                  <button type="button" className="pass-toggle" onClick={() => setShowPass(!showPass)}>
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              
              <button type="submit" className="btn btn-primary btn-lg w-full">
                Register as Admin <ArrowRight size={18} />
              </button>
            </form>
          )}

          {/* Switch to User Portal */}
          <div className="client-portal-switch">
            <div className="client-portal-divider">
              <span>OR</span>
            </div>
            <div className="client-portal-box">
              <div className="client-portal-info">
                <div className="client-icon-circle">
                  <User size={16} />
                </div>
                <div>
                  <div className="client-portal-desc">Login or register as a user</div>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-outline-white btn-sm"
                onClick={() => navigate("/login")}
              >
                <ArrowLeft size={14} /> Go to User Login
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .admin-login-page {
          min-height: 100vh; display: flex;
          background: linear-gradient(160deg, #040916, #08142c);
          position: relative; overflow: hidden;
        }
        .admin-login-bg {
          position: absolute; inset: 0;
          background: radial-gradient(ellipse 50% 70% at 10% 50%, rgba(37,99,235,0.12), transparent 70%),
            radial-gradient(ellipse 40% 50% at 90% 20%, rgba(59,130,246,0.08), transparent 70%);
          pointer-events: none;
        }
        .admin-login-left {
          flex: 1; display: flex; flex-direction: column; justify-content: center;
          padding: 80px; position: relative; z-index: 1;
        }
        .admin-login-logo { display: flex; align-items: center; gap: 14px; margin-bottom: 48px; }
        .admin-logo-icon {
          width: 52px; height: 52px; border-radius: 16px;
          background: linear-gradient(135deg, var(--blue-500), #1d4ed8);
          display: flex; align-items: center; justify-content: center;
          color: var(--white); box-shadow: 0 4px 18px rgba(37,99,235,0.4);
        }
        .admin-brand { font-family: 'Outfit', sans-serif; font-size: 1rem; font-weight: 900; letter-spacing: 0.06em; color: var(--white); }
        .admin-brand-sub { font-size: 0.72rem; color: #93c5fd; letter-spacing: 0.05em; margin-top: -2px; }
        .admin-login-title {
          font-size: clamp(2rem, 4vw, 3rem); font-weight: 900; line-height: 1.1; margin-bottom: 20px; color: var(--white);
        }
        .admin-login-desc { color: var(--text-secondary); line-height: 1.7; margin-bottom: 48px; max-width: 400px; }
        .admin-login-stats { display: flex; gap: 40px; }
        .admin-stat-val { font-family: 'Outfit', sans-serif; font-size: 1.6rem; font-weight: 800; color: #93c5fd; }
        .admin-stat-label { font-size: 0.78rem; color: var(--text-muted); margin-top: 2px; }
        .admin-login-right {
          width: 500px; display: flex; align-items: center; justify-content: center;
          padding: 48px; background: rgba(8,19,41,0.85);
          border-left: 1px solid var(--glass-border); position: relative; z-index: 1;
        }
        .admin-login-card { width: 100%; }
        .admin-card-header { text-align: center; margin-bottom: 24px; }
        .admin-shield {
          width: 56px; height: 56px; border-radius: 16px; margin: 0 auto 16px;
          background: rgba(37,99,235,0.15); border: 1px solid rgba(59,130,246,0.3);
          display: flex; align-items: center; justify-content: center;
        }
        .admin-card-header h2 { font-size: 1.5rem; font-weight: 800; margin-bottom: 6px; color: var(--white); }
        .admin-card-header p { color: var(--text-muted); font-size: 0.85rem; }

        .admin-tabs {
          display: flex; background: rgba(255,255,255,0.04);
          border: 1px solid var(--glass-border); border-radius: var(--radius-md);
          padding: 4px; margin-bottom: 24px;
        }
        .admin-tab {
          flex: 1; padding: 10px; border-radius: calc(var(--radius-md) - 2px);
          background: none; border: none; color: var(--text-muted);
          font-weight: 600; font-size: 0.88rem; cursor: pointer; transition: var(--transition);
        }
        .admin-tab.active {
          background: linear-gradient(135deg, var(--blue-500), #1d4ed8);
          color: var(--white);
          box-shadow: 0 2px 10px rgba(37,99,235,0.4);
        }

        .pass-toggle {
          position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
          background: none; border: none; color: var(--text-muted); cursor: pointer;
          transition: var(--transition); padding: 4px;
        }
        .pass-toggle:hover { color: var(--white); }

        /* Client switch */
        .client-portal-switch {
          margin-top: 24px;
        }
        .client-portal-divider {
          display: flex; align-items: center; text-align: center; margin-bottom: 16px;
        }
        .client-portal-divider::before, .client-portal-divider::after {
          content: ''; flex: 1; border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        .client-portal-divider span {
          padding: 0 12px; font-size: 0.68rem; font-weight: 700;
          letter-spacing: 0.1em; color: var(--text-muted);
        }
        .client-portal-box {
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 16px; border-radius: var(--radius-md);
          background: rgba(255,255,255,0.03); border: 1px solid var(--glass-border);
          gap: 12px;
        }
        .client-portal-info {
          display: flex; align-items: center; gap: 12px;
        }
        .client-icon-circle {
          width: 36px; height: 36px; border-radius: 10px;
          background: rgba(255,255,255,0.06); border: 1px solid var(--glass-border);
          display: flex; align-items: center; justify-content: center;
          color: var(--white); flex-shrink: 0;
        }
        .client-portal-title {
          font-size: 0.82rem; font-weight: 700; color: var(--white);
        }
        .client-portal-desc {
          font-size: 0.72rem; color: var(--text-muted);
        }

        @media (max-width: 900px) {
          .admin-login-left { display: none; }
          .admin-login-right { width: 100%; border-left: none; }
        }
      `}</style>
    </div>
  );
}
