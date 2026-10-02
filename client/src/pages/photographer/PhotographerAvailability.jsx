import { useState } from "react";
import {
  Calendar, Clock, CheckCircle2,
  Lock, Unlock, AlertCircle, Ban, Trash2
} from "lucide-react";
import PhotographerSidebar from "../../components/layout/PhotographerSidebar";
import { useAuth } from "../../context/AuthContext";
import { useBooking } from "../../context/BookingContext";
import { TIME_BASED_SLOTS } from "../../data/mockData";

export default function PhotographerAvailability() {
  const { user } = useAuth();
  const { blockedSlots, blockSlot, unblockSlot, getSlotStatus } = useBooking();

  const photographerId = user?.id || "p1";
  const photographerName = user?.name || "Photographer";
  const photographerSpec = user?.specialization || "Photography";
  const photographerInitials = photographerName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  const todayStr = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [viewedDate, setViewedDate] = useState(todayStr);

  // Bottom block form states
  const [bottomSlotId, setBottomSlotId] = useState("");
  const [bottomReason, setBottomReason] = useState("Unavailable");
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  const handleViewSlots = () => {
    setViewedDate(selectedDate);
    showToast(`Loaded your slots for ${selectedDate}`);
  };

  const handleQuickBlock = (slot) => {
    setBottomSlotId(slot.id);
    const el = document.getElementById("photographer-block-form");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmitBottomBlock = (e) => {
    e?.preventDefault();
    if (!bottomSlotId) {
      showToast("Please select a time slot to block.");
      return;
    }

    const slot = TIME_BASED_SLOTS.find(s => s.id === bottomSlotId);
    blockSlot({
      photographerId,
      date: viewedDate,
      slotId: bottomSlotId,
      reason: bottomReason || "Unavailable",
      blockedBy: photographerName,
    });

    showToast(`Your slot "${slot?.label || bottomSlotId}" is now blocked.`);
    setBottomSlotId("");
    setBottomReason("Unavailable");
  };

  const handleUnblock = (blockId, slotLabel) => {
    unblockSlot(blockId);
    showToast(`Slot "${slotLabel}" unblocked and is now Available for clients.`);
  };

  // Compile photographer's own slots
  const evaluatedSlots = TIME_BASED_SLOTS.map((s) => ({
    ...s,
    statusInfo: getSlotStatus(photographerId, viewedDate, s.id, s.label),
  }));

  const freeCount = evaluatedSlots.filter((s) => s.statusInfo.status === "available").length;
  const bookedCount = evaluatedSlots.filter((s) => s.statusInfo.status === "booked").length;
  const blockedCount = evaluatedSlots.filter((s) => s.statusInfo.status === "blocked").length;

  return (
    <div className="admin-layout" style={{ minHeight: "100vh" }}>
      <PhotographerSidebar />
      <main className="admin-main" style={{ padding: "30px 36px" }}>
        {toastMessage && (
          <div className="alert alert-success animate-fade-up" style={{ marginBottom: 20 }}>
            <CheckCircle2 size={18} />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Header */}
        <div style={{ marginBottom: 22 }}>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#ffffff", marginBottom: 4 }}>
            Manage Slots Availability
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
            View your personal schedule, block personal time or maintenance, and manage your 1-hour booking slots.
          </p>
        </div>

        {/* Photographer Info Card */}
        <div
          style={{
            background: "var(--navy-800)",
            border: "1px solid var(--navy-600)",
            borderRadius: "var(--radius-lg)",
            padding: "18px 24px",
            marginBottom: 20,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 16,
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 50, height: 50, borderRadius: "50%",
                background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "'Outfit', sans-serif", fontSize: "1.1rem", fontWeight: 800,
                color: "#fff", boxShadow: "0 4px 12px rgba(37,99,235,0.4)",
                flexShrink: 0,
              }}
            >
              {photographerInitials}
            </div>
            <div>
              <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#ffffff" }}>
                {photographerName}
              </div>
              <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 2 }}>
                <span style={{ color: "#60a5fa", fontWeight: 600 }}>{photographerId}</span> · {photographerSpec} ·{" "}
                <span style={{ color: "#4ade80", fontWeight: 700 }}>
                  Rs. {(user?.hourlyRate || Math.round((user?.price || 35000) / 6)).toLocaleString()}/hr
                </span>
              </div>
            </div>
          </div>

          <span className="badge badge-confirmed" style={{ fontSize: "0.74rem" }}>
            ✓ Personal Availability Portal
          </span>
        </div>

        {/* Select Date + View Slots Button */}
        <div
          style={{
            background: "var(--navy-800)",
            border: "1px solid var(--navy-600)",
            borderRadius: "var(--radius-lg)",
            padding: "18px 24px",
            marginBottom: 20,
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>
                Select Date
              </label>
              <input
                type="date"
                className="form-control"
                style={{ width: 190, padding: "8px 12px", fontSize: "0.88rem", background: "var(--navy-900)", border: "1px solid var(--navy-500)", color: "#ffffff" }}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>

            <div style={{ alignSelf: "flex-end" }}>
              <button
                type="button"
                className="btn btn-primary"
                style={{
                  padding: "9px 20px",
                  borderRadius: "var(--radius-md)",
                  fontWeight: 700,
                  fontSize: "0.88rem",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  cursor: "pointer",
                }}
                onClick={handleViewSlots}
              >
                🔍 View Slots
              </button>
            </div>
          </div>
        </div>

        {/* Stats Pill Row */}
        <div style={{ display: "flex", gap: 14, marginBottom: 16, flexWrap: "wrap" }}>
          <div
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "7px 18px", borderRadius: 9999,
              background: "rgba(34, 197, 94, 0.15)",
              border: "1px solid rgba(74, 222, 128, 0.35)",
              color: "#4ade80", fontSize: "0.84rem", fontWeight: 700,
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#4ade80" }} />
            Free: {freeCount}
          </div>

          <div
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "7px 18px", borderRadius: 9999,
              background: "rgba(239, 68, 68, 0.15)",
              border: "1px solid rgba(248, 113, 113, 0.35)",
              color: "#f87171", fontSize: "0.84rem", fontWeight: 700,
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#f87171" }} />
            Booked: {bookedCount}
          </div>

          <div
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "7px 18px", borderRadius: 9999,
              background: "rgba(245, 158, 11, 0.15)",
              border: "1px solid rgba(251, 191, 36, 0.35)",
              color: "#fbbf24", fontSize: "0.84rem", fontWeight: 700,
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#fbbf24" }} />
            Blocked: {blockedCount}
          </div>

          <div style={{ marginLeft: "auto", fontSize: "0.82rem", color: "var(--text-muted)", alignSelf: "center" }}>
            Viewing: <strong style={{ color: "#60a5fa" }}>{viewedDate}</strong>
          </div>
        </div>

        {/* Legend Row */}
        <div style={{ display: "flex", gap: 18, marginBottom: 20, fontSize: "0.78rem", color: "var(--text-secondary)" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#4ade80" }} />
            <strong style={{ color: "#4ade80" }}>Free</strong> — available for booking
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#f87171" }} />
            <strong style={{ color: "#f87171" }}>Booked</strong> — client has booking
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#fbbf24" }} />
            <strong style={{ color: "#fbbf24" }}>Blocked</strong> — personal or admin blocked
          </span>
        </div>

        {/* 4-Columns Grid of 1-Hour Time Slots */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 14,
            marginBottom: 28,
          }}
        >
          {evaluatedSlots.map((slot) => {
            const { status, color, reason, blockId, booking } = slot.statusInfo;
            const isFree = status === "available";
            const isBooked = status === "booked";
            const isBlocked = status === "blocked";

            let cardBorder = "1px solid rgba(74, 222, 128, 0.3)";
            let cardBg = "rgba(34, 197, 94, 0.08)";

            if (isBooked) {
              cardBorder = "1px solid rgba(248, 113, 113, 0.35)";
              cardBg = "rgba(239, 68, 68, 0.12)";
            } else if (isBlocked) {
              cardBorder = "1px solid rgba(251, 191, 36, 0.35)";
              cardBg = "rgba(245, 158, 11, 0.12)";
            }

            return (
              <div
                key={slot.id}
                style={{
                  border: cardBorder,
                  background: cardBg,
                  borderRadius: 10,
                  padding: "14px 16px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  transition: "all 0.15s ease",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                }}
              >
                {/* Left Side: Status + Time */}
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: color }} />
                    <span
                      style={{
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        color: isFree ? "#4ade80" : isBooked ? "#f87171" : "#fbbf24",
                      }}
                    >
                      {isFree ? "Free" : isBooked ? "Booked" : "Blocked"}
                    </span>
                  </div>
                  <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#ffffff" }}>
                    {slot.label}
                  </div>
                  {isBlocked && (
                    <div style={{ fontSize: "0.7rem", color: "#fbbf24", marginTop: 2, fontWeight: 600 }}>
                      {reason}
                    </div>
                  )}
                  {isBooked && (
                    <div style={{ fontSize: "0.7rem", color: "#f87171", marginTop: 2, fontWeight: 600 }}>
                      {booking?.client || "Client shoot"}
                    </div>
                  )}
                </div>

                {/* Right Side: Block / Unblock Action Button */}
                <div>
                  {isFree && (
                    <button
                      type="button"
                      className="btn btn-sm"
                      style={{
                        border: "1px solid rgba(239, 68, 68, 0.4)",
                        background: "rgba(239, 68, 68, 0.15)",
                        color: "#f87171",
                        borderRadius: 6,
                        padding: "5px 12px",
                        fontSize: "0.74rem",
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        cursor: "pointer",
                      }}
                      onClick={() => handleQuickBlock(slot)}
                    >
                      <Ban size={12} /> Block
                    </button>
                  )}

                  {isBlocked && (
                    <button
                      type="button"
                      className="btn btn-sm"
                      style={{
                        border: "1px solid rgba(74, 222, 128, 0.4)",
                        background: "rgba(34, 197, 94, 0.15)",
                        color: "#4ade80",
                        borderRadius: 6,
                        padding: "5px 12px",
                        fontSize: "0.74rem",
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        cursor: "pointer",
                      }}
                      onClick={() => handleUnblock(blockId, slot.label)}
                    >
                      <Unlock size={12} /> Unblock
                    </button>
                  )}

                  {isBooked && (
                    <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                      Booked
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Section: Block a Slot */}
        <div
          id="photographer-block-form"
          style={{
            border: "1px solid var(--navy-600)",
            borderRadius: 12,
            padding: "20px 24px",
            background: "var(--navy-800)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <Ban size={16} color="#ef4444" />
            <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#ffffff", margin: 0 }}>
              Block a Slot for {photographerName} on {viewedDate}
            </h3>
          </div>

          <form onSubmit={handleSubmitBottomBlock}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr 120px", gap: 14, alignItems: "flex-end" }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: "0.8rem", marginBottom: 6 }}>
                  Time Slot
                </label>
                <select
                  className="form-control"
                  style={{ fontSize: "0.84rem", padding: "9px 12px" }}
                  value={bottomSlotId}
                  onChange={(e) => setBottomSlotId(e.target.value)}
                >
                  <option value="">-- Select Slot --</option>
                  {evaluatedSlots.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label} {s.statusInfo.status === "available" ? "(Free)" : `(${s.statusInfo.status})`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: "0.8rem", marginBottom: 6 }}>
                  Reason
                </label>
                <input
                  type="text"
                  className="form-control"
                  style={{ fontSize: "0.84rem", padding: "9px 12px" }}
                  placeholder="e.g. Unavailable, Personal Leave, Equipment Check"
                  value={bottomReason}
                  onChange={(e) => setBottomReason(e.target.value)}
                />
              </div>

              <div>
                <button
                  type="submit"
                  className="btn"
                  style={{
                    background: "#b91c1c",
                    color: "white",
                    width: "100%",
                    height: 42,
                    borderRadius: 6,
                    fontWeight: 700,
                    fontSize: "0.88rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  <Ban size={15} /> Block
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
