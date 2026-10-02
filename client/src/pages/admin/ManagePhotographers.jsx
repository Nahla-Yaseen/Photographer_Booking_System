import { useState } from "react";
import { Plus, Edit2, Trash2, Star, UserCheck, X, Camera } from "lucide-react";
import AdminSidebar from "../../components/layout/AdminSidebar";
import { useAuth } from "../../context/AuthContext";
import { savePhotographerToFirestore, deletePhotographerFromFirestore } from "../../services/firestoreService";

const emptyForm = { name: "", specialization: "", experience: "3 Years", price: 35000, rating: 4.8, available: true, phone: "+94 77 123 4567" };

export default function ManagePhotographers() {
  const { photographersList, updatePhotographerProfile } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const openAdd = () => { setForm(emptyForm); setEditItem(null); setShowModal(true); };
  const openEdit = (p) => { setForm({ ...p }); setEditItem(p.id); setShowModal(true); };

  const handleSave = async () => {
    try {
      if (editItem) {
        await savePhotographerToFirestore({ ...form, id: editItem });
      } else {
        const newId = "p" + Date.now();
        await savePhotographerToFirestore({
          ...form,
          id: newId,
          avatar: "https://i.pravatar.cc/150?img=" + Math.floor(Math.random() * 60),
          reviews: 0,
        });
      }
      setShowModal(false);
    } catch (err) {
      console.error("Failed to save photographer:", err);
      alert("Failed to save photographer to Firestore.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Permanently remove this photographer from Firestore?")) {
      try {
        await deletePhotographerFromFirestore(id);
      } catch (err) {
        console.error("Failed to delete photographer:", err);
      }
    }
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-main">
        <div className="admin-page-header animate-fade-up">
          <div>
            <h1 style={{ fontSize: "1.6rem", fontWeight: 800, marginBottom: 4 }}>Manage Photographers</h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
              {photographersList.length} professional photographers in Firestore database
            </p>
          </div>
          <button className="btn btn-primary" onClick={openAdd}>
            <Plus size={16} /> Add Photographer
          </button>
        </div>

        {/* Table */}
        <div className="table-wrapper animate-fade-up delay-1">
          <table className="data-table">
            <thead>
              <tr>
                <th>Photographer</th>
                <th>Specialization</th>
                <th>Experience</th>
                <th>Price (Rs.)</th>
                <th>Rating</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {photographersList.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <img src={p.avatar} alt={p.name} className="avatar" style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover" }} />
                      <div>
                        <div style={{ fontWeight: 600 }}>{p.name}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{p.email || "No email"}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className="tag" style={{ background: "#eff6ff", color: "#2563eb", padding: "3px 8px", borderRadius: 4, fontSize: "0.78rem", fontWeight: 600 }}>{p.specialization}</span></td>
                  <td>{p.experience}</td>
                  <td style={{ fontWeight: 700, color: "#2563eb" }}>Rs. {Number(p.price || 0).toLocaleString()}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#f59e0b", fontSize: "0.85rem" }}>
                      <Star size={13} fill="currentColor" /> {p.rating}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${p.available ? "badge-confirmed" : "badge-cancelled"}`}>
                      {p.available ? "Available" : "Unavailable"}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(p)} title="Edit Profile">
                        <Edit2 size={14} />
                      </button>
                      <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(p.id)} title="Delete Photographer">
                        <Trash2 size={14} color="var(--text-muted)" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-box animate-scale-up" onClick={(e) => e.stopPropagation()}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>
                  {editItem ? "Edit Photographer" : "Add New Photographer"}
                </h3>
                <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}><X size={18} /></button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input className="form-control" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Photographer Name" />
                </div>
                <div className="form-group">
                  <label className="form-label">Specialization</label>
                  <input className="form-control" value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} placeholder="e.g. Wedding Photography, Portrait" />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Experience</label>
                    <input className="form-control" value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} placeholder="e.g. 5 Years" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Base Price (Rs.)</label>
                    <input type="number" className="form-control" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Availability Status</label>
                  <select className="form-control" value={form.available ? "true" : "false"} onChange={(e) => setForm({ ...form, available: e.target.value === "true" })}>
                    <option value="true">Available for Bookings</option>
                    <option value="false">Currently Unavailable / Off-duty</option>
                  </select>
                </div>

                <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 10 }}>
                  <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button className="btn btn-primary" onClick={handleSave}>Save to Firestore</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
