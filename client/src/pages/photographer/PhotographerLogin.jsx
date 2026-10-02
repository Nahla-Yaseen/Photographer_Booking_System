import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Camera, Mail, Lock, Eye, EyeOff, User, ArrowRight,
  Phone, Award, DollarSign, Sparkles, CheckCircle2, Shield, AlertCircle
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { PHOTOGRAPHY_TYPES } from "../../data/mockData";

export default function PhotographerLogin() {
  const [tab, setTab] = useState("login");
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { loginPhotographer, registerPhotographer } = useAuth();
  const navigate = useNavigate();

  // Login form state — empty by default
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  // Register form state
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
    specialization: "Wedding Photography",
    price: "",
    bio: "",
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    if (!loginData.email || !loginData.password) {
      setError("Please fill in your email and password.");
      return;
    }
    setLoading(true);
    try {
      await loginPhotographer(loginData.email, loginData.password);
      navigate("/photographer/dashboard");
    } catch (err) {
      const msg = err?.code === "auth/invalid-credential" || err?.code === "auth/wrong-password" || err?.code === "auth/user-not-found"
        ? "Invalid email or password. Please try again."
        : err?.code === "auth/too-many-requests"
        ? "Too many failed attempts. Please try again later."
        : err?.message || "Login failed. Please check your credentials.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    if (!registerData.name || !registerData.email || !registerData.password) {
      setError("Please complete all required fields.");
      return;
    }
    if (registerData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (registerData.password !== registerData.confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await registerPhotographer(registerData);
      navigate("/photographer/dashboard");
    } catch (err) {
      const msg = err?.code === "auth/email-already-in-use"
        ? "This email is already registered. Please login instead."
        : err?.code === "auth/invalid-email"
        ? "Please enter a valid email address."
        : err?.message || "Registration failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="photo-auth-page">
      <div className="photo-auth-bg" />

      {/* Left visual column */}
      <div className="photo-auth-left animate-slide-left">
        <div className="photo-auth-left-inner">
          <Link to="/" className="photo-auth-logo">
            <div className="photo-logo-icon">
              <Camera size={26} />
            </div>
            <div>
              <div className="photo-logo-name">SHUTTER MOMENTS</div>
              <div className="photo-logo-sub">Photographer Portal</div>
            </div>
          </Link>

          <div className="photo-hero-badge">
            <Sparkles size={14} color="var(--gold-400)" /> Join 50+ Verified Photographers
          </div>

          <h1 className="photo-auth-title">
            Grow Your Photography<br />
            <span className="gradient-text">Career & Bookings</span>
          </h1>

          <p className="photo-auth-desc">
            Access client shoot assignments, manage your availability calendar, mark completed events, and showcase your creative portfolio.
          </p>

          <div className="photo-perks-list">
            {[
              "Real-time confirmed photoshoot assignments",
              "Control availability and blackout vacation dates",
              "Direct booking updates (complete or cancel shoots)",
              "Showcase specialization and custom rates",
            ].map((perk, i) => (
              <div key={i} className="photo-perk-item">
                <CheckCircle2 size={16} color="#38bdf8" />
                <span>{perk}</span>
              </div>
            ))}
          </div>

          <div className="photo-switch-portal-card">
            <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: 8 }}>
              Not a photographer?
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <Link to="/login" className="btn btn-ghost btn-sm" style={{ border: "1px solid var(--glass-border)" }}>
                <User size={14} /> Client Login
              </Link>
              <Link to="/admin/login" className="btn btn-ghost btn-sm" style={{ border: "1px solid var(--glass-border)" }}>
                <Shield size={14} /> Admin Portal
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Right form column */}
      <div className="photo-auth-right">
        <div className="photo-auth-card animate-fade-up">

          {/* Position Selector Bar */}
          <div className="role-switch-pills">
            <Link to="/login" className="role-pill">
              <User size={13} /> Customer
            </Link>
            <span className="role-pill active">
              <Camera size={13} /> Photographer
            </span>
            <Link to="/admin/login" className="role-pill">
              <Shield size={13} /> Admin
            </Link>
          </div>

          {/* Tab Selector */}
          <div className="photo-auth-tabs">
            <button
              className={`photo-tab-btn ${tab === "login" ? "active" : ""}`}
              onClick={() => { setTab("login"); setError(""); }}
            >
              Photographer Login
            </button>
            <button
              className={`photo-tab-btn ${tab === "register" ? "active" : ""}`}
              onClick={() => { setTab("register"); setError(""); }}
            >
              Register as Photographer
            </button>
          </div>

          {error && (
            <div className="alert alert-error" style={{ marginBottom: 18, fontSize: "0.83rem", display: "flex", alignItems: "flex-start", gap: 8 }}>
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>{error}</span>
            </div>
          )}

          {/* ── Login View ── */}
          {tab === "login" ? (
            <form onSubmit={handleLogin} className="photo-auth-form">
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="input-icon-wrapper">
                  <Mail size={16} className="input-icon" />
                  <input
                    type="email"
                    className="form-control"
                    placeholder="your@email.com"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="input-icon-wrapper">
                  <Lock size={16} className="input-icon" />
                  <input
                    type={showPass ? "text" : "password"}
                    className="form-control"
                    placeholder="Enter your password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", padding: 4 }}
                    onClick={() => setShowPass(!showPass)}
                  >
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-full btn-lg"
                style={{ marginTop: 10 }}
                disabled={loading}
              >
                {loading ? "Logging in..." : <>Login to Dashboard <ArrowRight size={17} /></>}
              </button>

              <p style={{ textAlign: "center", fontSize: "0.8rem", color: "var(--text-muted)", marginTop: 8 }}>
                Don't have an account?{" "}
                <button
                  type="button"
                  style={{ background: "none", border: "none", color: "#60a5fa", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600 }}
                  onClick={() => { setTab("register"); setError(""); }}
                >
                  Register here
                </button>
              </p>
            </form>
          ) : (
            /* ── Register View ── */
            <form onSubmit={handleRegister} className="photo-auth-form">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <div className="input-icon-wrapper">
                  <User size={16} className="input-icon" />
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. David Silva"
                    required
                    value={registerData.name}
                    onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <div className="input-icon-wrapper">
                    <Mail size={16} className="input-icon" />
                    <input
                      type="email"
                      className="form-control"
                      placeholder="you@example.com"
                      required
                      value={registerData.email}
                      onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <div className="input-icon-wrapper">
                    <Phone size={16} className="input-icon" />
                    <input
                      type="tel"
                      className="form-control"
                      placeholder="+94 77 XXX XXXX"
                      value={registerData.phone}
                      onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Specialization</label>
                  <select
                    className="form-control"
                    value={registerData.specialization}
                    onChange={(e) => setRegisterData({ ...registerData, specialization: e.target.value })}
                  >
                    {PHOTOGRAPHY_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Base Rate (Rs./hour)</label>
                  <div className="input-icon-wrapper">
                    <DollarSign size={16} className="input-icon" />
                    <input
                      type="number"
                      className="form-control"
                      placeholder="35000"
                      value={registerData.price}
                      onChange={(e) => setRegisterData({ ...registerData, price: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Password *</label>
                  <div className="input-icon-wrapper">
                    <Lock size={16} className="input-icon" />
                    <input
                      type="password"
                      className="form-control"
                      placeholder="Min 6 chars"
                      required
                      value={registerData.password}
                      onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm Password *</label>
                  <div className="input-icon-wrapper">
                    <Lock size={16} className="input-icon" />
                    <input
                      type={showConfirmPass ? "text" : "password"}
                      className="form-control"
                      placeholder="Re-enter password"
                      required
                      value={registerData.confirm}
                      onChange={(e) => setRegisterData({ ...registerData, confirm: e.target.value })}
                    />
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", padding: 4 }}
                      onClick={() => setShowConfirmPass(!showConfirmPass)}
                    >
                      {showConfirmPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Short Bio / About You</label>
                <textarea
                  className="form-control"
                  rows={2}
                  placeholder="Share a few words about your photography style and experience..."
                  value={registerData.bio}
                  onChange={(e) => setRegisterData({ ...registerData, bio: e.target.value })}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary w-full btn-lg"
                style={{ marginTop: 8 }}
                disabled={loading}
              >
                {loading ? "Creating Account..." : <>Create Photographer Account <ArrowRight size={17} /></>}
              </button>

              <p style={{ textAlign: "center", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                Already registered?{" "}
                <button
                  type="button"
                  style={{ background: "none", border: "none", color: "#60a5fa", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600 }}
                  onClick={() => { setTab("login"); setError(""); }}
                >
                  Login here
                </button>
              </p>
            </form>
          )}

          <div className="photo-auth-footer-nav">
            <Link to="/" style={{ color: "var(--text-muted)", fontSize: "0.82rem", textDecoration: "none" }}>
              ← Return to Home
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        .photo-auth-page {
          min-height: 100vh; display: flex;
          background: #050d1a; position: relative; overflow-x: hidden;
        }
        .photo-auth-bg {
          position: absolute; inset: 0;
          background: radial-gradient(circle at 10% 20%, rgba(37,99,235,0.15) 0%, transparent 40%),
                      radial-gradient(circle at 90% 80%, rgba(244,168,32,0.1) 0%, transparent 40%);
          pointer-events: none;
        }
        .photo-auth-left {
          flex: 1; padding: 60px; display: flex; align-items: center; justify-content: center;
          background: linear-gradient(135deg, rgba(14,26,50,0.8), rgba(5,13,26,0.95));
          border-right: 1px solid var(--glass-border); position: relative; z-index: 1;
        }
        .photo-auth-left-inner { max-width: 520px; width: 100%; }
        .photo-auth-logo {
          display: inline-flex; align-items: center; gap: 12px; text-decoration: none;
          margin-bottom: 36px;
        }
        .photo-logo-icon {
          width: 44px; height: 44px; border-radius: 12px;
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          display: flex; align-items: center; justify-content: center;
          color: #fff; box-shadow: 0 4px 14px rgba(37,99,235,0.4);
        }
        .photo-logo-name {
          font-family: 'Outfit', sans-serif; font-size: 1.1rem; font-weight: 800;
          letter-spacing: 0.06em; color: var(--white);
        }
        .photo-logo-sub {
          font-size: 0.72rem; color: #93c5fd; letter-spacing: 0.05em;
        }
        .photo-hero-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(244,168,32,0.1); border: 1px solid rgba(244,168,32,0.25);
          color: var(--gold-400); padding: 5px 12px; border-radius: var(--radius-full);
          font-size: 0.75rem; font-weight: 600; margin-bottom: 20px;
        }
        .photo-auth-title {
          font-size: clamp(2rem, 3.5vw, 2.6rem); font-weight: 900;
          line-height: 1.15; margin-bottom: 18px; font-family: 'Outfit', sans-serif;
        }
        .photo-auth-desc {
          font-size: 0.95rem; color: var(--text-secondary); line-height: 1.65; margin-bottom: 28px;
        }
        .photo-perks-list {
          display: flex; flex-direction: column; gap: 12px; margin-bottom: 36px;
        }
        .photo-perk-item {
          display: flex; align-items: center; gap: 10px; font-size: 0.85rem; color: var(--white);
        }
        .photo-switch-portal-card {
          padding: 16px; border-radius: var(--radius-md);
          background: rgba(255,255,255,0.02); border: 1px solid var(--glass-border);
        }

        /* Right column */
        .photo-auth-right {
          flex: 1.1; display: flex; align-items: center; justify-content: center;
          padding: 40px 30px; position: relative; z-index: 1;
        }
        .photo-auth-card {
          width: 100%; max-width: 480px;
          background: rgba(14,26,50,0.7); backdrop-filter: blur(20px);
          border: 1px solid var(--glass-border); border-radius: var(--radius-xl);
          padding: 36px 32px; box-shadow: var(--shadow-xl);
        }
        .role-switch-pills {
          display: flex; gap: 6px; padding: 4px; border-radius: var(--radius-full);
          background: rgba(255,255,255,0.04); border: 1px solid var(--glass-border);
          margin-bottom: 24px;
        }
        .role-pill {
          flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px;
          padding: 8px 12px; border-radius: var(--radius-full); font-size: 0.78rem; font-weight: 600;
          color: var(--text-muted); text-decoration: none; transition: var(--transition);
        }
        .role-pill:hover { color: var(--white); }
        .role-pill.active {
          background: #2563eb; color: var(--white);
          box-shadow: 0 2px 8px rgba(37,99,235,0.4);
        }
        .photo-auth-tabs {
          display: flex; border-bottom: 1px solid var(--glass-border); margin-bottom: 22px;
        }
        .photo-tab-btn {
          flex: 1; padding: 10px; background: none; border: none;
          border-bottom: 2px solid transparent; color: var(--text-muted);
          font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: var(--transition);
        }
        .photo-tab-btn.active {
          color: #60a5fa; border-bottom-color: #3b82f6;
        }
        .photo-auth-form {
          display: flex; flex-direction: column; gap: 14px;
        }
        .photo-auth-footer-nav {
          margin-top: 24px; text-align: center;
        }

        @media (max-width: 900px) {
          .photo-auth-left { display: none; }
          .photo-auth-right { padding: 40px 16px; }
        }
      `}</style>
    </div>
  );
}



