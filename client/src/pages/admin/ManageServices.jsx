import { useState } from "react";
import { Plus, Edit2, Trash2, CheckCircle2, XCircle, X, Sparkles, Layers } from "lucide-react";
import AdminSidebar from "../../components/layout/AdminSidebar";
import { ADDITIONAL_SERVICES } from "../../data/mockData";

const defaultForm = { name: "", price: "", description: "", icon: "✨", active: true };

export default function ManageServices() {
  const [services, setServices] = useState(ADDITIONAL_SERVICES);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [searchTerm, setSearchTerm] = useState("");

  const handleOpenAdd = () => {
    setForm(defaultForm);
    setEditingId(null);
    setShowModal(true);
  };

  const handleOpenEdit = (svc) => {
    setForm({ ...svc });
    setEditingId(svc.id);
    setShowModal(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!form.name || !form.price) return;

    if (editingId) {
      setServices((prev) =>
        prev.map((s) => (s.id === editingId ? { ...s, ...form, price: Number(form.price) } : s))
      );
    } else {
      const newService = {
        ...form,
        id: "s" + Date.now(),
        price: Number(form.price),
      };
      setServices((prev) => [...prev, newService]);
    }
    setShowModal(false);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to remove this service?")) {
      setServices((prev) => prev.filter((s) => s.id !== id));
    }
  };

  const handleToggleStatus = (id) => {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, active: !s.active } : s))
    );
  };

  const filtered = services.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-main">
        {/* Page Header */}
        <div className="admin-page-header animate-fade-up">
          <div>
            <h1 style={{ fontSize: "1.6rem", fontWeight: 800, marginBottom: 4 }}>Manage Services</h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
              Configure extra add-ons and optional services available for clients during checkout
            </p>
          </div>
          <button className="btn btn-primary" onClick={handleOpenAdd}>
            <Plus size={16} /> Add New Service
          </button>
        </div>

        {/* Filter bar */}
        <div className="admin-search-bar animate-fade-up delay-1">
          <input
            type="text"
            className="form-control"
            placeholder="Search services by title or keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ maxWidth: 360 }}
          />
          <div className="service-count-badge">
            <Layers size={14} color="var(--gold-400)" />
            <span>{filtered.length} Total Services</span>
          </div>
        </div>

        {/* Services Cards / Grid */}
        <div className="services-grid animate-fade-up delay-2">
          {filtered.map((service) => (
            <div key={service.id} className="card-elevated service-admin-card">
              <div className="service-card-header">
                <div className="service-icon-box">{service.icon || "✨"}</div>
                <div className="service-status-pill">
                  <span className={`badge ${service.active ? "badge-confirmed" : "badge-cancelled"}`}>
                    {service.active ? "Active" : "Disabled"}
                  </span>
                </div>
              </div>

              <h3 className="service-admin-title">{service.name}</h3>
              <p className="service-admin-desc">{service.description}</p>

              <div className="service-card-footer">
                <div>
                  <span className="price-label">Price Rate</span>
                  <div className="service-price">Rs. {Number(service.price).toLocaleString()}</div>
                </div>
                <div className="action-buttons">
                  <button
                    className="btn btn-ghost btn-sm"
                    title={service.active ? "Disable Service" : "Enable Service"}
                    onClick={() => handleToggleStatus(service.id)}
                  >
                    {service.active ? <XCircle size={15} color="#f87171" /> : <CheckCircle2 size={15} color="#4ade80" />}
                  </button>
                  <button
                    className="btn btn-ghost btn-sm"
                    title="Edit Service"
                    onClick={() => handleOpenEdit(service)}
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    title="Delete Service"
                    onClick={() => handleDelete(service.id)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-box" onClick={(e) => e.stopPropagation()}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h3 style={{ fontSize: "1.15rem", fontWeight: 800, display: "flex", alignItems: "center", gap: 8 }}>
                  <Sparkles size={18} color="var(--gold-400)" />
                  {editingId ? "Edit Additional Service" : "Add New Service"}
                </h3>
                <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}>
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Service Title</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    placeholder="e.g. Drone Videography"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Price (Rs.)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      className="form-control"
                      placeholder="25000"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Icon / Emoji</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="📸, 🚁, 🎨"
                      value={form.icon}
                      onChange={(e) => setForm({ ...form, icon: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    rows={3}
                    className="form-control"
                    placeholder="Provide a brief summary of what this extra add-on entails..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="custom-checkbox">
                    <input
                      type="checkbox"
                      checked={form.active}
                      onChange={(e) => setForm({ ...form, active: e.target.checked })}
                    />
                    <div className="checkmark">
                      {form.active && <span style={{ fontSize: 10, color: "var(--navy-900)", fontWeight: 900 }}>✓</span>}
                    </div>
                    <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                      Make this service active & visible to users during booking
                    </span>
                  </label>
                </div>

                <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 12 }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingId ? "Update Service" : "Add Service"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <style>{`
          .admin-page-header {
            display: flex; justify-content: space-between; align-items: flex-start;
            margin-bottom: 24px; flex-wrap: wrap; gap: 12px;
          }
          .admin-search-bar {
            display: flex; justify-content: space-between; align-items: center;
            margin-bottom: 24px; flex-wrap: wrap; gap: 12px;
          }
          .service-count-badge {
            display: flex; align-items: center; gap: 8px; font-size: 0.82rem;
            color: var(--text-secondary); background: rgba(255,255,255,0.04);
            padding: 8px 16px; border-radius: 9999px; border: 1px solid var(--glass-border);
          }
          .services-grid {
            display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
            gap: 20px;
          }
          .service-admin-card {
            padding: 24px; display: flex; flex-direction: column;
            transition: var(--transition);
          }
          .service-admin-card:hover {
            transform: translateY(-3px);
            border-color: rgba(244,168,32,0.3);
          }
          .service-card-header {
            display: flex; justify-content: space-between; align-items: center;
            margin-bottom: 16px;
          }
          .service-icon-box {
            font-size: 2rem; width: 52px; height: 52px;
            background: rgba(255,255,255,0.04); border-radius: var(--radius-md);
            display: flex; align-items: center; justify-content: center;
            border: 1px solid var(--glass-border);
          }
          .service-admin-title {
            font-size: 1.1rem; font-weight: 700; margin-bottom: 8px;
          }
          .service-admin-desc {
            font-size: 0.82rem; color: var(--text-muted); line-height: 1.6;
            margin-bottom: 20px; flex: 1;
          }
          .service-card-footer {
            display: flex; justify-content: space-between; align-items: flex-end;
            padding-top: 16px; border-top: 1px solid var(--glass-border);
          }
          .price-label {
            font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.06em;
            color: var(--text-muted); display: block; margin-bottom: 2px;
          }
          .service-price {
            font-family: 'Outfit', sans-serif; font-size: 1.25rem; font-weight: 800;
            color: var(--gold-400);
          }
          .action-buttons {
            display: flex; gap: 8px;
          }
        `}</style>
      </main>
    </div>
  );
}
