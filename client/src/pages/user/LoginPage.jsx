import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Camera, Mail, Lock, Eye, EyeOff, User, ArrowRight, Shield,
  Sparkles, CheckCircle2, ChevronRight, ArrowLeft, Phone
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get("role"); // "user" | "photographer" | "admin" | null

  // If initialRole is specified, use it; otherwise null prompts role selection
  const [selectedPosition, setSelectedPosition] = useState(initialRole || null);
  const [tab, setTab] = useState("login");
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { loginUser, registerUser } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.email || !form.password) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    try {
      await loginUser(form.email, form.password);
      const redirectTo = searchParams.get("redirect") || "/dashboard";
      navigate(redirectTo);
    } catch (err) {
      setError("Invalid email or password. Please verify your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name || !form.email || !form.phone || !form.password) {
      setError("Please fill in all fields (Full Name, Email, Phone Number, Password).");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await registerUser(form.email, form.password, form.name, form.phone);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-art" />

      {/* ── Visual Left Column ── */}
      <div className="auth-left">
        <div className="auth-left-content animate-slide-left">
          <Link to="/" className="auth-logo">
            <div className="auth-logo-icon"><Camera size={28} /></div>
            <div>
              <div className="auth-brand">SHUTTER MOMENTS</div>
              <div className="auth-brand-sub">Photography Services</div>
            </div>
          </Link>
          <h1 className="auth-hero-title">
            Book Your<br />
            <span className="gradient-text">Perfect</span><br />
            Photographer
          </h1>
          <p className="auth-hero-desc">
            Join thousands of happy clients who captured their best moments with us.
          </p>
          <div className="auth-features">
            {["500+ Professional Photographers", "Instant Booking Confirmation", "Secure Payments", "24/7 Customer Support"].map((f, i) => (
              <div key={i} className="auth-feature-item">
                <div className="auth-feature-dot" />
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Content Column ── */}
      <div className="auth-right">

        {/* STEP 1: POSITION SELECTION SCREEN */}
        {!selectedPosition ? (
          <div className="role-chooser-card animate-fade-up">
            <div className="role-chooser-header">
              <div className="role-chooser-badge">
                <Sparkles size={13} color="var(--gold-400)" /> Welcome to Shutter Moments
              </div>
              <h2 className="role-chooser-title">Choose Your Position</h2>
              <p className="role-chooser-subtitle">
                Please select your account type to proceed to the login and register portal
              </p>
            </div>

            <div className="position-options-grid">
              {/* Option 1: Customer / User */}
              <div
                className="position-card"
                onClick={() => setSelectedPosition("user")}
              >
                <div className="position-icon-wrapper user-theme">
                  <User size={24} />
                </div>
                <div className="position-info">
                  <div className="position-name">Client / Customer</div>
                  <div className="position-desc">
                    Book top photographers, customize event packages, and manage your shoot bookings.
                  </div>
                </div>
                <ChevronRight size={20} className="position-arrow" />
              </div>

              {/* Option 2: Photographer */}
              <div
                className="position-card"
                onClick={() => navigate("/photographer/login")}
              >
                <div className="position-icon-wrapper photo-theme">
                  <Camera size={24} />
                </div>
                <div className="position-info">
                  <div className="position-name">Photographer</div>
                  <div className="position-desc">
                    View assigned shoots, mark bookings completed or cancelled, manage calendar availability.
                  </div>
                </div>
                <ChevronRight size={20} className="position-arrow" />
              </div>

              {/* Option 3: Administrator */}
              <div
                className="position-card"
                onClick={() => navigate("/admin/login")}
              >
                <div className="position-icon-wrapper admin-theme">
                  <Shield size={24} />
                </div>
                <div className="position-info">
                  <div className="position-name">Administrator</div>
                  <div className="position-desc">
                    Full platform control, manage photographers, pricing, reservations, and analytics.
                  </div>
                </div>
                <ChevronRight size={20} className="position-arrow" />
              </div>
            </div>

            <div className="role-chooser-footer">
              <Link to="/" className="btn btn-ghost btn-sm">
                ← Back to Home
              </Link>
            </div>
          </div>
        ) : (
          /* STEP 2: USER / CUSTOMER LOGIN & REGISTER FORM */
          <div className="auth-card animate-fade-up">

            {/* Role Header & Switcher */}
            <div className="role-active-bar">
              <button
                type="button"
                className="back-to-roles-btn"
                onClick={() => setSelectedPosition(null)}
              >
                <ArrowLeft size={14} /> Change Position
              </button>
              <div className="active-role-indicator">
                <User size={13} color="#93c5fd" />
                <span>Customer Portal</span>
              </div>
            </div>

            {/* Quick Switch Pills */}
            <div className="role-pills-row">
              <span className="role-pill active">
                <User size={13} /> Customer
              </span>
              <button
                type="button"
                className="role-pill"
                onClick={() => navigate("/photographer/login")}
              >
                <Camera size={13} /> Photographer
              </button>
              <button
                type="button"
                className="role-pill"
                onClick={() => navigate("/admin/login")}
              >
                <Shield size={13} /> Admin
              </button>
            </div>

            {/* Tabs */}
            <div className="auth-tabs">
              <button
                className={`auth-tab ${tab === "login" ? "active" : ""}`}
                onClick={() => { setTab("login"); setError(""); }}
              >
                Login
              </button>
              <button
                className={`auth-tab ${tab === "register" ? "active" : ""}`}
                onClick={() => { setTab("register"); setError(""); }}
              >
                Register
              </button>
            </div>

            {tab === "login" ? (
              <form onSubmit={handleLogin} className="auth-form">
                <div className="auth-form-header">
                  <h2>Welcome Back!</h2>
                  <p>Login to book photographers & track events</p>
                </div>

                {error && <div className="alert alert-error">{error}</div>}

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <div className="input-icon-wrapper">
                    <Mail size={16} className="input-icon" />
                    <input
                      type="email" className="form-control"
                      placeholder="Enter your email"
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Password</label>
                  <div className="input-icon-wrapper" style={{ position: "relative" }}>
                    <Lock size={16} className="input-icon" />
                    <input
                      type={showPass ? "text" : "password"} className="form-control"
                      placeholder="Enter your password"
                      value={form.password}
                      onChange={e => setForm({ ...form, password: e.target.value })}
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

                <button type="submit" className="btn btn-primary w-full btn-lg">
                  Login to Account <ArrowRight size={16} />
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="auth-form">
                <div className="auth-form-header">
                  <h2>Create Account</h2>
                  <p>Register to start booking professional photographers</p>
                </div>

                {error && <div className="alert alert-error">{error}</div>}

                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <div className="input-icon-wrapper">
                    <User size={16} className="input-icon" />
                    <input
                      type="text" className="form-control"
                      placeholder="John Doe"
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <div className="input-icon-wrapper">
                    <Mail size={16} className="input-icon" />
                    <input
                      type="email" className="form-control"
                      placeholder="Enter your email"
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <div className="input-icon-wrapper">
                    <Phone size={16} className="input-icon" />
                    <input
                      type="tel" className="form-control"
                      placeholder="+94 77 123 4567"
                      value={form.phone}
                      onChange={e => setForm({ ...form, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Password</label>
                  <div className="input-icon-wrapper">
                    <Lock size={16} className="input-icon" />
                    <input
                      type={showPass ? "text" : "password"} className="form-control"
                      placeholder="Create password"
                      value={form.password}
                      onChange={e => setForm({ ...form, password: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Confirm Password</label>
                  <div className="input-icon-wrapper">
                    <Lock size={16} className="input-icon" />
                    <input
                      type="password" className="form-control"
                      placeholder="Confirm password"
                      value={form.confirm}
                      onChange={e => setForm({ ...form, confirm: e.target.value })}
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary w-full btn-lg">
                  Create Account <ArrowRight size={16} />
                </button>
              </form>
            )}

            <div style={{ marginTop: 24, textAlign: "center" }}>
              <Link to="/" style={{ color: "var(--text-muted)", fontSize: "0.82rem", textDecoration: "none" }}>
                ← Return to Home
              </Link>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .auth-page {
          min-height: 100vh; display: flex;
          background: #050d1a; position: relative; overflow-x: hidden;
        }
        .auth-bg-art {
          position: absolute; inset: 0;
          background-image:
            radial-gradient(ellipse 60% 40% at 20% 30%, rgba(37,99,235,0.12) 0%, transparent 60%),
            radial-gradient(ellipse 50% 50% at 80% 70%, rgba(244,168,32,0.08) 0%, transparent 60%);
          pointer-events: none;
        }
        .auth-left {
          flex: 1; padding: 60px; display: flex; align-items: center; justify-content: center;
          background: linear-gradient(135deg, rgba(14,26,50,0.8), rgba(5,13,26,0.95));
          border-right: 1px solid var(--glass-border); position: relative; z-index: 1;
        }
        .auth-left-content { max-width: 480px; width: 100%; }
        .auth-logo {
          display: inline-flex; align-items: center; gap: 12px; text-decoration: none; margin-bottom: 40px;
        }
        .auth-logo-icon {
          width: 44px; height: 44px; border-radius: 12px;
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          display: flex; align-items: center; justify-content: center;
          color: var(--white); box-shadow: 0 4px 14px rgba(37,99,235,0.4);
        }
        .auth-brand {
          font-family: 'Outfit', sans-serif; font-size: 1.1rem; font-weight: 800;
          letter-spacing: 0.06em; color: var(--white);
        }
        .auth-brand-sub { font-size: 0.72rem; color: #93c5fd; letter-spacing: 0.05em; }
        .auth-hero-title {
          font-size: clamp(2rem, 3.5vw, 2.8rem); font-weight: 900;
          line-height: 1.1; margin-bottom: 20px; font-family: 'Outfit', sans-serif;
        }
        .auth-hero-desc {
          color: var(--text-secondary); font-size: 0.95rem; line-height: 1.7; margin-bottom: 36px;
        }
        .auth-features { display: flex; flex-direction: column; gap: 12px; }
        .auth-feature-item {
          display: flex; align-items: center; gap: 10px; font-size: 0.85rem; color: var(--text-secondary);
        }
        .auth-feature-dot {
          width: 6px; height: 6px; border-radius: 50%; background: var(--gold-400); flex-shrink: 0;
        }

        /* Right Side & Role Chooser */
        .auth-right {
          flex: 1.1; display: flex; align-items: center; justify-content: center;
          padding: 40px 24px; position: relative; z-index: 1;
        }
        .role-chooser-card {
          width: 100%; max-width: 520px;
          background: rgba(14,26,50,0.75); backdrop-filter: blur(24px);
          border: 1px solid var(--glass-border); border-radius: var(--radius-xl);
          padding: 40px 36px; box-shadow: var(--shadow-xl);
        }
        .role-chooser-header { text-align: center; margin-bottom: 30px; }
        .role-chooser-badge {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(37,99,235,0.15); border: 1px solid rgba(59,130,246,0.3);
          color: #93c5fd; padding: 4px 12px; border-radius: var(--radius-full);
          font-size: 0.75rem; font-weight: 600; margin-bottom: 12px;
        }
        .role-chooser-title {
          font-size: 1.8rem; font-weight: 800; color: var(--white); margin-bottom: 8px;
        }
        .role-chooser-subtitle {
          font-size: 0.88rem; color: var(--text-muted); line-height: 1.5;
        }
        .position-options-grid {
          display: flex; flex-direction: column; gap: 16px; margin-bottom: 24px;
        }
        .position-card {
          display: flex; align-items: center; gap: 16px; padding: 20px;
          background: rgba(255,255,255,0.03); border: 1px solid var(--glass-border);
          border-radius: var(--radius-lg); cursor: pointer; transition: var(--transition);
        }
        .position-card:hover {
          background: rgba(255,255,255,0.06); border-color: #3b82f6;
          transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.3);
        }
        .position-icon-wrapper {
          width: 50px; height: 50px; border-radius: 14px;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .position-icon-wrapper.user-theme {
          background: rgba(37,99,235,0.2); border: 1px solid rgba(59,130,246,0.35); color: #60a5fa;
        }
        .position-icon-wrapper.photo-theme {
          background: rgba(244,168,32,0.18); border: 1px solid rgba(244,168,32,0.35); color: var(--gold-400);
        }
        .position-icon-wrapper.admin-theme {
          background: rgba(168,85,247,0.18); border: 1px solid rgba(168,85,247,0.35); color: #c084fc;
        }
        .position-info { flex: 1; }
        .position-name {
          font-size: 1rem; font-weight: 700; color: var(--white); margin-bottom: 4px;
        }
        .position-desc {
          font-size: 0.8rem; color: var(--text-secondary); line-height: 1.45;
        }
        .position-arrow { color: var(--text-muted); transition: var(--transition); }
        .position-card:hover .position-arrow { color: var(--white); transform: translateX(4px); }
        .role-chooser-footer { text-align: center; }

        /* Step 2 Form Card */
        .auth-card {
          width: 100%; max-width: 440px;
          background: rgba(14,26,50,0.75); backdrop-filter: blur(24px);
          border: 1px solid var(--glass-border); border-radius: var(--radius-xl);
          padding: 36px 32px; box-shadow: var(--shadow-xl);
        }
        .role-active-bar {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 18px; padding-bottom: 12px; border-bottom: 1px solid var(--glass-border);
        }
        .back-to-roles-btn {
          background: none; border: none; cursor: pointer; color: var(--text-muted);
          font-size: 0.78rem; font-weight: 600; display: inline-flex; align-items: center; gap: 4px;
          transition: var(--transition);
        }
        .back-to-roles-btn:hover { color: var(--white); }
        .active-role-indicator {
          display: flex; align-items: center; gap: 6px; font-size: 0.78rem;
          color: #93c5fd; font-weight: 600; background: rgba(37,99,235,0.15);
          padding: 3px 10px; border-radius: var(--radius-full);
        }
        .role-pills-row {
          display: flex; gap: 6px; padding: 4px; border-radius: var(--radius-full);
          background: rgba(255,255,255,0.04); border: 1px solid var(--glass-border);
          margin-bottom: 22px;
        }
        .role-pill {
          flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px;
          padding: 7px 10px; border-radius: var(--radius-full); font-size: 0.76rem; font-weight: 600;
          color: var(--text-muted); background: none; border: none; cursor: pointer;
          transition: var(--transition); text-decoration: none;
        }
        .role-pill:hover { color: var(--white); }
        .role-pill.active {
          background: #2563eb; color: var(--white); box-shadow: 0 2px 8px rgba(37,99,235,0.4);
        }
        .auth-tabs {
          display: flex; border-bottom: 1px solid var(--glass-border); margin-bottom: 22px;
        }
        .auth-tab {
          flex: 1; padding: 10px; background: none; border: none;
          border-bottom: 2px solid transparent; color: var(--text-muted);
          font-size: 0.88rem; font-weight: 600; cursor: pointer; transition: var(--transition);
        }
        .auth-tab.active { color: #60a5fa; border-bottom-color: #3b82f6; }
        .auth-form-header { margin-bottom: 20px; }
        .auth-form-header h2 { font-size: 1.4rem; font-weight: 800; margin-bottom: 4px; }
        .auth-form-header p { color: var(--text-muted); font-size: 0.84rem; }
        .auth-form { display: flex; flex-direction: column; gap: 14px; }

        @media (max-width: 900px) {
          .auth-left { display: none; }
          .auth-right { padding: 40px 16px; }
        }
      `}</style>
    </div>
  );
}
