import { useState, useRef } from "react";
import {
  User, Mail, Phone, Award, DollarSign,
  Save, CheckCircle2, Star, Image as ImageIcon, Plus, Trash2, Upload
} from "lucide-react";
import PhotographerSidebar from "../../components/layout/PhotographerSidebar";
import { useAuth } from "../../context/AuthContext";
import { PHOTOGRAPHY_TYPES } from "../../data/mockData";

export default function PhotographerProfile() {
  const { user, updatePhotographerProfile } = useAuth();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    specialization: user?.specialization || "Wedding Photography",
    experience: user?.experience ? String(user.experience).replace(" Years", "") : "",
    price: user?.price || "",
    bio: user?.bio || "",
  });

  const [portfolio, setPortfolio] = useState(
    user?.portfolio && user.portfolio.length > 0
      ? user.portfolio
      : [
          "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=80",
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&q=80",
          "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600&q=80",
          "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=600&q=80",
        ]
  );

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    updatePhotographerProfile({
      name: form.name,
      email: form.email,
      phone: form.phone,
      specialization: form.specialization,
      experience: form.experience ? form.experience + " Years" : undefined,
      price: Number(form.price),
      bio: form.bio,
      portfolio: portfolio,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    let loadedCount = 0;
    const newPhotos = [];

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const base64Data = uploadEvent.target.result;
        newPhotos.push(base64Data);
        loadedCount++;
        if (loadedCount === files.length) {
          setPortfolio((prev) => {
            const updated = [...prev, ...newPhotos];
            updatePhotographerProfile({ portfolio: updated });
            return updated;
          });
          setSavedSuccess(true);
          setTimeout(() => setSavedSuccess(false), 4000);
        }
      };
      reader.readAsDataURL(file);
    });

    e.target.value = "";
  };

  const handleRemovePortfolio = (index) => {
    setPortfolio((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      updatePhotographerProfile({ portfolio: updated });
      return updated;
    });
  };

  return (
    <div className="admin-layout">
      <PhotographerSidebar />
      <main className="admin-main">
        {savedSuccess && (
          <div className="alert alert-success animate-fade-up photo-toast">
            <CheckCircle2 size={18} />
            <div style={{ flex: 1, fontSize: "0.85rem", fontWeight: 500 }}>
              Profile updated successfully! Your public profile and booking rates are synced.
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => setSavedSuccess(false)} style={{ padding: 2 }}>✕</button>
          </div>
        )}

        {/* Page Header */}
        <div className="admin-page-header animate-fade-up">
          <div>
            <h1 style={{ fontSize: "1.6rem", fontWeight: 800, marginBottom: 4 }}>Manage Profile & Showcase</h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
              Configure your public bio, photography specialization, session rates, and portfolio
            </p>
          </div>
        </div>

        <div className="profile-layout-grid animate-fade-up delay-1">
          {/* Left Column: Form */}
          <div className="card-elevated" style={{ padding: 28 }}>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <div className="input-icon-wrapper">
                    <User size={16} className="input-icon" />
                    <input
                      type="text"
                      className="form-control"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <div className="input-icon-wrapper">
                    <Mail size={16} className="input-icon" />
                    <input
                      type="email"
                      className="form-control"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <div className="input-icon-wrapper">
                    <Phone size={16} className="input-icon" />
                    <input
                      type="tel"
                      className="form-control"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Primary Specialization</label>
                  <select
                    className="form-control"
                    value={form.specialization}
                    onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                  >
                    {PHOTOGRAPHY_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Years of Experience</label>
                  <div className="input-icon-wrapper">
                    <Award size={16} className="input-icon" />
                    <input
                      type="number"
                      className="form-control"
                      min="1"
                      max="40"
                      value={form.experience}
                      onChange={(e) => setForm({ ...form, experience: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Base Rate Per Session (Rs.)</label>
                  <div className="input-icon-wrapper">
                    <DollarSign size={16} className="input-icon" />
                    <input
                      type="number"
                      className="form-control"
                      step="1000"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Bio & Creative Style</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                />
              </div>

            

              <button type="submit" className="btn btn-primary btn-lg" style={{ alignSelf: "flex-start", marginTop: 8 }}>
                <Save size={16} /> Save Profile Changes
              </button>
            </form>
          </div>

          {/* Right Column: Public Preview & Portfolio */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Live Card Preview */}
            <div className="card" style={{ padding: 24 }}>
              <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#2563eb", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14 }}>
                Public Client View Card
              </div>
              <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                <div style={{
                  width: 64, height: 64, borderRadius: 16, flexShrink: 0,
                  background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1.4rem", fontWeight: 800, color: "#fff",
                  fontFamily: "'Outfit', sans-serif",
                  boxShadow: "0 4px 14px rgba(37,99,235,0.4)",
                }}>
                  {(form.name || "?").split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                </div>
                <div>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 800 }}>{form.name}</h3>
                  <div style={{ fontSize: "0.8rem", color: "#2563eb", fontWeight: 600 }}>{form.specialization}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 3, color: "#f59e0b", fontSize: "0.78rem", fontWeight: 700 }}>
                      <Star size={12} fill="currentColor" /> {user?.rating || "4.9"}
                    </span>
                    <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>· {form.experience} Yrs Exp</span>
                  </div>
                </div>
              </div>
              <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: 1.6, marginTop: 14 }}>
                {form.bio}
              </p>
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--navy-600)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Session Starting At</span>
                <span style={{ fontFamily: "Outfit", fontWeight: 800, color: "var(--gold-400)", fontSize: "1.1rem" }}>
                  Rs. {Number(form.price || 0).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Portfolio Showcase Grid */}
            <div className="card" style={{ padding: 24, background: "var(--navy-800)", border: "1px solid var(--navy-600)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <h3 style={{ fontSize: "0.95rem", fontWeight: 700, display: "flex", alignItems: "center", gap: 8, color: "#ffffff" }}>
                  <ImageIcon size={16} color="var(--gold-400)" /> Portfolio Photos ({portfolio.length})
                </h3>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
                {portfolio.map((img, i) => (
                  <div key={i} className="portfolio-thumb-card">
                    <img src={img} alt="Portfolio item" className="portfolio-thumb-img" />
                    <button
                      type="button"
                      className="portfolio-del-btn"
                      title="Remove Photo"
                      onClick={() => handleRemovePortfolio(i)}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Hidden file input for choosing photos from PC */}
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                multiple
                style={{ display: "none" }}
                onChange={handleFileSelect}
              />

              <button
                type="button"
                className="btn btn-secondary w-full"
                onClick={() => fileInputRef.current?.click()}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "10px 16px" }}
              >
                <Plus size={16} /> Choose Photo from PC / Add Photo
              </button>
            </div>
          </div>
        </div>

        <style>{`
          .photo-toast {
            position: fixed; top: 24px; right: 24px; z-index: 999;
            max-width: 460px; box-shadow: var(--shadow-lg);
          }
          .profile-layout-grid {
            display: grid; grid-template-columns: 1.4fr 1fr; gap: 24px;
          }

          .portfolio-thumb-card {
            position: relative; height: 90px; border-radius: var(--radius-sm); overflow: hidden;
            border: 1px solid #e2e8f0;
          }
          .portfolio-thumb-img {
            width: 100%; height: 100%; object-fit: cover;
          }
          .portfolio-del-btn {
            position: absolute; top: 4px; right: 4px; background: rgba(0,0,0,0.5);
            color: #dc2626; border: none; border-radius: 4px; width: 22px; height: 22px;
            display: flex; align-items: center; justify-content: center; cursor: pointer;
            transition: var(--transition);
          }
          .portfolio-del-btn:hover { background: #dc2626; color: #fff; }

          @media (max-width: 960px) {
            .profile-layout-grid { grid-template-columns: 1fr; }
          }
        `}</style>
      </main>
    </div>
  );
}
