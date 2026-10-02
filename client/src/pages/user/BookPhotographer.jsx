import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft, ChevronRight, MapPin, Clock,
  CheckCircle, AlertCircle, Camera, Calendar, ArrowRight,
  Package, ShieldAlert, ArrowLeft, Layers, Sparkles, User
} from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import LocationPickerMap from "../../components/common/LocationPickerMap";
import { useBooking } from "../../context/BookingContext";
import { useAuth } from "../../context/AuthContext";
import {
  PHOTOGRAPHERS, PHOTOGRAPHY_TYPES, TIME_BASED_SLOTS, PACKAGE_TYPES
} from "../../data/mockData";



export default function BookPhotographer() {
  const navigate = useNavigate();
  const { booking, updateBooking, toggleSlotSelection, getSlotStatus } = useBooking();
  const { photographersList } = useAuth();

  // Booking page step: 1 = Check Availability, 2 = Event Details & Slots
  const [currentStep, setCurrentStep] = useState(1);

  const [availability, setAvailability] = useState(null);
  const [checking, setChecking] = useState(false);
  const [validationMsg, setValidationMsg] = useState("");

  // Booking Type: "package_based" | "time_based"
  const [bookingType, setBookingType] = useState(booking.bookingType || "time_based");
  // Package selection: "mini_session" | "half_day" | "full_day"
  const [selectedPackageId, setSelectedPackageId] = useState(booking.packageType || "mini_session");

  // Default date
  useEffect(() => {
    if (!booking.eventDate) {
      const today = new Date().toISOString().split("T")[0];
      updateBooking({ eventDate: today });
    }
  }, []);

  // Merge live Firestore photographers with static mock data (deduplicate by id)
  const allPhotographers = [
    ...photographersList,
    ...PHOTOGRAPHERS.filter(mp => !photographersList.some(lp => lp.id === mp.id)),
  ];

  // Auto-filter by photography type — when type is selected, only show matching photographers
  const filteredPhotographers = booking.photographyType
    ? allPhotographers.filter((p) =>
        p.specialization === booking.photographyType ||
        (p.types && p.types.includes(booking.photographyType))
      )
    : allPhotographers;

  const selectedPhotographer = allPhotographers.find((p) => p.id === booking.photographerId);
  const currentPackage = PACKAGE_TYPES.find((p) => p.id === selectedPackageId);

  const handleTypeChange = (type) => {
    updateBooking({
      photographyType: type,
      photographerId: "",
      slotId: "",
      slotLabel: "",
      selectedSlotIds: [],
      selectedSlots: [],
    });
    setAvailability(null);
    setValidationMsg("");
  };

  const handleBookingTypeChange = (type) => {
    setBookingType(type);
    updateBooking({
      bookingType: type,
      slotId: "",
      slotLabel: "",
      selectedSlotIds: [],
      selectedSlots: [],
    });
    setAvailability(null);
    setValidationMsg("");
  };

  const handlePackageChange = (pkgId) => {
    setSelectedPackageId(pkgId);
    updateBooking({
      packageType: pkgId,
      slotId: "",
      slotLabel: "",
      selectedSlotIds: [],
      selectedSlots: [],
    });
    setAvailability(null);
  };

  // Slot selection handling (multi-select for time_based, single start-slot for package)
  const handleSlotClick = (slot) => {
    const statusInfo = getSlotStatus(booking.photographerId, booking.eventDate, slot.id, slot.label);

    if (statusInfo.status === "booked") {
      setValidationMsg(`Slot ${slot.label} is already booked. Please choose another free slot.`);
      return;
    }
    if (statusInfo.status === "blocked") {
      setValidationMsg(`Slot ${slot.label} is blocked (${statusInfo.reason}). Please select another free slot.`);
      return;
    }

    setValidationMsg("");
    setAvailability(null);
    const err = toggleSlotSelection(slot);
    if (err) setValidationMsg(err);
  };

  // Check Availability button in Step 1
  const handleCheckAvailability = () => {
    setValidationMsg("");

    if (!booking.photographyType) {
      setValidationMsg("Please select a Photography Type.");
      return;
    }
    if (!booking.photographerId) {
      setValidationMsg("Please select a Photographer.");
      return;
    }
    if (!booking.eventDate) {
      setValidationMsg("Please select an Event Date on the calendar.");
      return;
    }

    const hasSelectedSlots =
      bookingType === "time_based"
        ? (booking.selectedSlotIds && booking.selectedSlotIds.length > 0)
        : Boolean(booking.slotId || (booking.selectedSlotIds && booking.selectedSlotIds.length > 0));

    if (!hasSelectedSlots) {
      setValidationMsg("Please click on at least one available (Green) time slot.");
      return;
    }

    // Verify none of selected slots are blocked or booked
    const slotIdsToCheck = booking.selectedSlotIds?.length > 0 ? booking.selectedSlotIds : [booking.slotId];
    for (const sid of slotIdsToCheck) {
      const statusInfo = getSlotStatus(booking.photographerId, booking.eventDate, sid);
      if (statusInfo.status !== "available") {
        setValidationMsg(`One or more of your selected slots is ${statusInfo.status} (${statusInfo.label}).`);
        return;
      }
    }

    setChecking(true);
    setTimeout(() => {
      setChecking(false);
      setAvailability({
        isAvailable: true,
        photographer: selectedPhotographer?.name || "Selected Photographer",
        date: booking.eventDate,
        time: booking.slotLabel || `${booking.startTime} – ${booking.endTime}`,
        slotsCount: booking.selectedSlotIds?.length || 1,
        type: booking.photographyType,
        bookingType: bookingType === "time_based" ? "Time Based Booking" : `Package Based (${currentPackage?.name})`,
      });
    }, 350);
  };

  // Move from Step 1 to Step 2
  const handleProceedToStep2 = () => {
    if (!availability?.isAvailable) {
      handleCheckAvailability();
      return;
    }
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Move from Step 2 to Step 3 (Add Services)
  const handleProceedToStep3 = () => {
    if (!booking.location || !booking.location.trim()) {
      setValidationMsg("Please enter or pinpoint your Event Venue / Location on the map.");
      return;
    }
    navigate("/services");
  };

  // Always show all 17 slots for both booking types
  const activeSlots = TIME_BASED_SLOTS;

  // For package-based: compute which slot indices are in the selected consecutive range
  const pkgHours = currentPackage ? parseInt(currentPackage.badge.split(" ")[0]) || 1 : 1;
  const pkgStartIndex = bookingType === "package_based" && booking.selectedSlotIds?.length > 0
    ? TIME_BASED_SLOTS.findIndex(s => s.id === booking.selectedSlotIds[0])
    : -1;

  return (
    <div className="page-wrapper" style={{ minHeight: "100vh" }}>
      <Navbar />
      <div className="page-content" style={{ paddingTop: 88 }}>
        <div className="container" style={{ padding: "36px 24px" }}>

          {/* 4 Steps Wizard Bar */}
          <div className="step-bar" style={{ marginBottom: 32 }}>
            {[
              { label: "Check Availability", step: 1 },
              { label: "Event Details & Slots", step: 2 },
              { label: "Add Services", step: 3 },
              { label: "Confirmation", step: 4 },
            ].map((s) => {
              const isDone = currentStep > s.step;
              const isActive = currentStep === s.step;
              return (
                <div key={s.step} className="step-item">
                  {s.step > 1 && <div className={`step-connector ${currentStep >= s.step ? "done" : ""}`} />}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div className={`step-circle ${isDone ? "done" : isActive ? "active" : ""}`}>
                      {isDone ? <CheckCircle size={15} /> : s.step}
                    </div>
                    <div
                      className="step-label"
                      style={{
                        color: isActive ? "#60a5fa" : isDone ? "#34d399" : "var(--text-muted)",
                        fontWeight: isActive ? 700 : 500,
                      }}
                    >
                      {s.label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ─────────────────────────────────────────────────────────────
              STEP 1: CHECK AVAILABILITY
             ───────────────────────────────────────────────────────────── */}
          {currentStep === 1 && (
            <div className="book-grid animate-fade-in">
              {/* Left Column: Selection & Slot Picker */}
              <div className="book-left">
                <div className="card-elevated" style={{ padding: "28px 32px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                    <h2 className="book-title" style={{ margin: 0, display: "flex", alignItems: "center", gap: 10 }}>
                      <Calendar size={22} color="#60a5fa" /> Step 1: Check Availability
                    </h2>
                    <span className="badge badge-pending" style={{ fontSize: "0.72rem" }}>
                      Step 1 of 4
                    </span>
                  </div>

                  {/* 1. Photography Type */}
                  <div className="form-group" style={{ marginBottom: 18 }}>
                    <label className="form-label">1. Photography Type</label>
                    <select
                      className="form-control"
                      value={booking.photographyType}
                      onChange={(e) => handleTypeChange(e.target.value)}
                    >
                      <option value="">-- Select Photography Type --</option>
                      {PHOTOGRAPHY_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 2. Select Photographer — auto-filtered by Photography Type */}
                  <div className="form-group" style={{ marginBottom: 22 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <label className="form-label" style={{ margin: 0 }}>2. Select Photographer</label>
                      {booking.photographyType && (
                        <span style={{ fontSize: "0.72rem", color: filteredPhotographers.length > 0 ? "#4ade80" : "#f87171", fontWeight: 700 }}>
                          {filteredPhotographers.length} specialist{filteredPhotographers.length !== 1 ? "s" : ""} available
                        </span>
                      )}
                    </div>
                    {!booking.photographyType && (
                      <div style={{ padding: "10px 14px", background: "rgba(255,255,255,0.03)", border: "1px dashed rgba(255,255,255,0.12)", borderRadius: "var(--radius-md)", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: 8 }}>
                        📷 Select a Photography Type above to see available specialists
                      </div>
                    )}
                    {booking.photographyType && filteredPhotographers.length === 0 && (
                      <div style={{ padding: "10px 14px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: "var(--radius-md)", fontSize: "0.8rem", color: "#f87171", marginBottom: 8 }}>
                        No photographers registered for this specialization yet.
                      </div>
                    )}
                    <select
                      className="form-control"
                      value={booking.photographerId}
                      disabled={!booking.photographyType || filteredPhotographers.length === 0}
                      onChange={(e) => {
                        const chosen = allPhotographers.find((p) => p.id === e.target.value);
                        updateBooking({
                          photographerId: e.target.value,
                          photographer: chosen?.name || "",
                          photographerName: chosen?.name || "",
                        });
                        setAvailability(null);
                        setValidationMsg("");
                      }}
                    >
                      <option value="">-- Choose Photographer --</option>
                      {filteredPhotographers.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.specialization}) – Rs. {(p.hourlyRate || Math.round((p.price || 35000) / 6)).toLocaleString()}/hr
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 3. Select Preferred Date */}
                  <div className="form-group" style={{ marginBottom: 22 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <label className="form-label" style={{ margin: 0 }}>
                        <Calendar size={13} style={{ display: "inline", marginRight: 4, verticalAlign: "-2px" }} />
                        3. Select Preferred Date
                      </label>
                      {booking.eventDate && (
                        <span style={{ fontSize: "0.78rem", color: "#60a5fa", fontWeight: 700 }}>
                          Selected Date: {booking.eventDate}
                        </span>
                      )}
                    </div>
                    <input
                      type="date"
                      className="form-control"
                      value={booking.eventDate || ""}
                      onChange={(e) => {
                        updateBooking({ eventDate: e.target.value });
                        setAvailability(null);
                        setValidationMsg("");
                      }}
                      min={new Date().toISOString().split("T")[0]}
                      style={{ maxWidth: "250px", cursor: "pointer", colorScheme: "light" }}
                    />
                  </div>

                  {/* 4. Select Booking Type (Package Based or Time Based) */}
                  <div style={{ marginBottom: 22 }}>
                    <label className="form-label" style={{ marginBottom: 8, display: "block" }}>
                      4. Select Booking Type
                    </label>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      {/* Option A: Package Based Booking */}
                      <div
                        onClick={() => handleBookingTypeChange("package_based")}
                        style={{
                          padding: "14px 16px",
                          borderRadius: "var(--radius-md)",
                          cursor: "pointer",
                          border: `1.5px solid ${bookingType === "package_based" ? "#3b82f6" : "rgba(255,255,255,0.1)"}`,
                          background: bookingType === "package_based" ? "rgba(37,99,235,0.18)" : "rgba(255,255,255,0.02)",
                          transition: "all 0.2s ease",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                          <Package size={16} color={bookingType === "package_based" ? "#60a5fa" : "var(--text-muted)"} />
                          <span style={{ fontWeight: 700, fontSize: "0.88rem", color: bookingType === "package_based" ? "var(--white)" : "var(--text-secondary)" }}>
                            Package Based Booking
                          </span>
                        </div>
                        <div style={{ fontSize: "0.73rem", color: "var(--text-muted)", lineHeight: 1.4 }}>
                          Mini Session, Half Day, or Full Day packages with curated sessions.
                        </div>
                      </div>

                      {/* Option B: Time Based Booking */}
                      <div
                        onClick={() => handleBookingTypeChange("time_based")}
                        style={{
                          padding: "14px 16px",
                          borderRadius: "var(--radius-md)",
                          cursor: "pointer",
                          border: `1.5px solid ${bookingType === "time_based" ? "#3b82f6" : "rgba(255,255,255,0.1)"}`,
                          background: bookingType === "time_based" ? "rgba(37,99,235,0.18)" : "rgba(255,255,255,0.02)",
                          transition: "all 0.2s ease",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                          <Clock size={16} color={bookingType === "time_based" ? "#60a5fa" : "var(--text-muted)"} />
                          <span style={{ fontWeight: 700, fontSize: "0.88rem", color: bookingType === "time_based" ? "var(--white)" : "var(--text-secondary)" }}>
                            Time Based Booking
                          </span>
                        </div>
                        <div style={{ fontSize: "0.73rem", color: "var(--text-muted)", lineHeight: 1.4 }}>
                          Hourly slots (6:00 AM – 11:00 PM). Select multiple slots freely.
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sub-selection for Package Based */}
                  {bookingType === "package_based" && (
                    <div style={{ marginBottom: 20, background: "rgba(255,255,255,0.02)", padding: 14, borderRadius: "var(--radius-md)", border: "1px solid var(--glass-border)" }}>
                      <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#93c5fd", marginBottom: 8 }}>
                        Choose Package:
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10 }}>
                        {PACKAGE_TYPES.map((pkg) => {
                          const isPkgSelected = selectedPackageId === pkg.id;
                          return (
                            <div
                              key={pkg.id}
                              onClick={() => handlePackageChange(pkg.id)}
                              style={{
                                padding: "10px 12px",
                                borderRadius: "var(--radius-sm)",
                                cursor: "pointer",
                                border: `1.5px solid ${isPkgSelected ? "#60a5fa" : "rgba(255,255,255,0.1)"}`,
                                background: isPkgSelected ? "rgba(59,130,246,0.2)" : "rgba(0,0,0,0.2)",
                                textAlign: "center",
                                transition: "all 0.2s ease",
                              }}
                            >
                              <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--white)" }}>{pkg.name}</div>
                              <div style={{ fontSize: "0.7rem", color: "#60a5fa", marginTop: 2 }}>{pkg.badge}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* 4. Time Slots Grid */}
                  <div style={{ marginBottom: 22 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <label className="form-label" style={{ margin: 0 }}>
                        5. Select Time Slots ({bookingType === "time_based" ? "Select Multiple Slots Allowed" : "Select Slot"})
                      </label>
                      {booking.selectedSlotIds?.length > 0 && (
                        <span style={{ fontSize: "0.74rem", color: "#4ade80", fontWeight: 700 }}>
                          ✓ {booking.selectedSlotIds.length} Slot(s) Chosen
                        </span>
                      )}
                    </div>

                    {/* Legend */}
                    <div style={{ display: "flex", gap: 14, marginBottom: 12, fontSize: "0.72rem" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 5, color: "#4ade80" }}>
                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e" }} />
                        Free (Available)
                      </span>
                      <span style={{ display: "flex", alignItems: "center", gap: 5, color: "#f87171" }}>
                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444" }} />
                        Booked
                      </span>
                      <span style={{ display: "flex", alignItems: "center", gap: 5, color: "#fb923c" }}>
                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#f97316" }} />
                        Blocked
                      </span>
                    </div>

                    {/* Package hint */}
                    {bookingType === "package_based" && (
                      <div style={{ marginBottom: 10, padding: "8px 12px", background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.25)", borderRadius: 8, fontSize: "0.78rem", color: "#93c5fd" }}>
                        <strong>📦 {currentPackage?.name} ({currentPackage?.badge})</strong> — Click a <span style={{ color: "#4ade80" }}>green</span> starting slot. {pkgHours} consecutive hour{pkgHours > 1 ? "s" : ""} will be auto-selected from that point.
                      </div>
                    )}

                    {/* Grid of Slots */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 10, maxHeight: 360, overflowY: "auto", paddingRight: 4 }}>
                      {activeSlots.map((slot, slotIdx) => {
                        const statusInfo = getSlotStatus(
                          booking.photographerId,
                          booking.eventDate,
                          slot.id,
                          slot.label
                        );
                        const isAvailable = statusInfo.status === "available";
                        const isBooked = statusInfo.status === "booked";
                        const isBlocked = statusInfo.status === "blocked";
                        const isSelected = booking.selectedSlotIds?.includes(slot.id);

                        // For package_based: mark slots that would be selected if user clicks this slot
                        const isInPreviewRange = bookingType === "package_based" && pkgStartIndex !== -1
                          && slotIdx >= pkgStartIndex && slotIdx < pkgStartIndex + pkgHours;

                        let borderCol = "rgba(255,255,255,0.1)";
                        let bgCol = "rgba(255,255,255,0.02)";

                        if (isSelected || isInPreviewRange) {
                          borderCol = "#22c55e";
                          bgCol = "rgba(34,197,94,0.22)";
                        } else if (isAvailable) {
                          borderCol = "rgba(34,197,94,0.4)";
                          bgCol = "rgba(34,197,94,0.06)";
                        } else if (isBooked) {
                          borderCol = "rgba(239,68,68,0.4)";
                          bgCol = "rgba(239,68,68,0.1)";
                        } else if (isBlocked) {
                          borderCol = "rgba(249,115,22,0.4)";
                          bgCol = "rgba(249,115,22,0.1)";
                        }

                        const isStart = bookingType === "package_based" && slotIdx === pkgStartIndex;

                        return (
                          <div
                            key={slot.id}
                            onClick={() => isAvailable && handleSlotClick(slot)}
                            style={{
                              border: `1.5px solid ${borderCol}`,
                              background: bgCol,
                              borderRadius: "var(--radius-md)",
                              padding: "10px 12px",
                              cursor: isAvailable ? "pointer" : "not-allowed",
                              position: "relative",
                              transition: "all 0.15s ease",
                              boxShadow: (isSelected || isInPreviewRange) ? "0 0 10px rgba(34,197,94,0.3)" : "none",
                            }}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                              <span style={{ fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                                {isAvailable
                                  ? (isStart ? "▶ Start" : isInPreviewRange ? "Included" : isSelected ? "Selected" : "Free")
                                  : isBooked ? "Booked" : "Blocked"}
                              </span>
                              {(isSelected || isInPreviewRange) && (
                                <CheckCircle size={13} color="#22c55e" />
                              )}
                            </div>
                            <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--white)" }}>
                              {slot.label}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Validation alert */}
                  {validationMsg && (
                    <div className="alert alert-error" style={{ marginBottom: 16 }}>
                      <AlertCircle size={16} /> {validationMsg}
                    </div>
                  )}

                  {/* Check Availability Button */}
                  <button
                    type="button"
                    className="btn btn-primary w-full btn-lg"
                    style={{ fontWeight: 700 }}
                    onClick={handleCheckAvailability}
                    disabled={checking}
                  >
                    {checking ? "Verifying Availability..." : "Check Availability"}
                  </button>

                  {/* Availability Result Banner & Proceed to Step 2 Button */}
                  {availability?.isAvailable && (
                    <div className="availability-card animate-fade-in" style={{ marginTop: 20 }}>
                      <div className="avail-status-bar">
                        <CheckCircle size={22} color="#34d399" />
                        <div className="avail-status-title">Slot Is Available!</div>
                      </div>
                      <p className="avail-status-text" style={{ marginTop: 6, fontSize: "0.85rem", lineHeight: 1.6 }}>
                        <strong>{availability.photographer}</strong> is confirmed available for your{" "}
                        <strong>{availability.type}</strong> on <strong>{availability.date}</strong> ({availability.time}).
                      </p>
                      <button
                        type="button"
                        className="btn btn-white w-full"
                        style={{ marginTop: 14, fontWeight: 700 }}
                        onClick={handleProceedToStep2}
                      >
                        Proceed to Event Details & Slots <ArrowRight size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Photographer Card & Overview */}
              <div className="book-right">
                {selectedPhotographer ? (
                  <div className="card-elevated" style={{ padding: 22, marginBottom: 20 }}>
                    <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 16 }}>
                      <div style={{
                        width: 56, height: 56, borderRadius: 12, flexShrink: 0,
                        background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontFamily: "'Outfit', sans-serif", fontSize: "1.1rem", fontWeight: 800,
                        color: "#fff", boxShadow: "0 4px 12px rgba(37,99,235,0.4)",
                      }}>
                        {(selectedPhotographer.name || "?").split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: "1.05rem", color: "var(--white)" }}>
                          {selectedPhotographer.name}
                        </div>
                        <div className="tag" style={{ marginTop: 3 }}>
                          {selectedPhotographer.specialization}
                        </div>
                        <div style={{ fontSize: "0.76rem", color: "var(--text-muted)", marginTop: 4 }}>
                          ★ {selectedPhotographer.rating} ({selectedPhotographer.reviews} reviews) · {selectedPhotographer.experience}
                        </div>
                      </div>
                    </div>

                    <div style={{ borderTop: "1px solid var(--glass-border)", paddingTop: 14, display: "flex", flexDirection: "column", gap: 8, fontSize: "0.82rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "var(--text-muted)" }}>Hourly Rate:</span>
                        <span style={{ fontWeight: 700, color: "#60a5fa" }}>
                          Rs. {(selectedPhotographer.hourlyRate || Math.round((selectedPhotographer.price || 35000) / 6)).toLocaleString()} / hr
                        </span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "var(--text-muted)" }}>Package Rate:</span>
                        <span style={{ fontWeight: 700, color: "var(--white)" }}>
                          Rs. {(selectedPhotographer.price || 0).toLocaleString()}
                        </span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "var(--text-muted)" }}>Selected Date:</span>
                        <span style={{ fontWeight: 600, color: "var(--white)" }}>
                          {booking.eventDate || "Not chosen"}
                        </span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "var(--text-muted)" }}>Selected Slot(s):</span>
                        <span style={{ fontWeight: 700, color: booking.slotLabel ? "#4ade80" : "var(--text-muted)" }}>
                          {booking.slotLabel || "None selected"}
                        </span>
                      </div>
                    </div>

                    {availability?.isAvailable && (
                      <button
                        type="button"
                        className="btn btn-primary w-full"
                        style={{ marginTop: 18 }}
                        onClick={handleProceedToStep2}
                      >
                        Continue to Step 2 <ArrowRight size={15} />
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="card-elevated" style={{ padding: 30, textAlign: "center", color: "var(--text-muted)" }}>
                    <div style={{ fontSize: "2.4rem", marginBottom: 12 }}>📷</div>
                    <div style={{ fontWeight: 700, color: "#93c5fd", marginBottom: 6 }}>
                      Select a Photographer
                    </div>
                    <p style={{ fontSize: "0.82rem", lineHeight: 1.6 }}>
                      Choose your photography type and select a specialist to inspect their live calendar schedule.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              STEP 2: EVENT DETAILS & SLOTS (SHOWS DETAILS + MAP PICKER)
             ───────────────────────────────────────────────────────────── */}
          {currentStep === 2 && (
            <div className="book-grid animate-fade-in">
              <div className="book-left">
                <div className="card-elevated" style={{ padding: "28px 32px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                    <h2 className="book-title" style={{ margin: 0, display: "flex", alignItems: "center", gap: 10 }}>
                      <MapPin size={22} color="#60a5fa" /> Step 2: Event Details & Location
                    </h2>
                    <span className="badge badge-confirmed" style={{ fontSize: "0.72rem" }}>
                      Step 2 of 4
                    </span>
                  </div>

                  {/* Verified Schedule Summary Banner */}
                  <div
                    style={{
                      background: "linear-gradient(135deg, rgba(37,99,235,0.12), rgba(15,23,42,0.8))",
                      border: "1px solid rgba(59,130,246,0.3)",
                      borderRadius: "var(--radius-md)",
                      padding: "16px 20px",
                      marginBottom: 24,
                    }}
                  >
                    <div style={{ fontSize: "0.74rem", textTransform: "uppercase", color: "#93c5fd", fontWeight: 700, letterSpacing: "0.05em", marginBottom: 8 }}>
                      Confirmed Availability Details
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, fontSize: "0.85rem" }}>
                      <div>
                        <span style={{ color: "var(--text-muted)", fontSize: "0.74rem", display: "block" }}>Booking Date:</span>
                        <strong style={{ color: "var(--white)" }}>{booking.eventDate}</strong>
                      </div>
                      <div>
                        <span style={{ color: "var(--text-muted)", fontSize: "0.74rem", display: "block" }}>Photographer:</span>
                        <strong style={{ color: "#60a5fa" }}>{selectedPhotographer?.name}</strong>
                      </div>
                      <div>
                        <span style={{ color: "var(--text-muted)", fontSize: "0.74rem", display: "block" }}>Photography Type:</span>
                        <strong style={{ color: "var(--white)" }}>{booking.photographyType}</strong>
                      </div>
                      <div>
                        <span style={{ color: "var(--text-muted)", fontSize: "0.74rem", display: "block" }}>Selected Time Slot(s):</span>
                        <strong style={{ color: "#4ade80" }}>{booking.slotLabel}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Event Venue / Location (Point on Map) */}
                  <div className="form-group" style={{ marginBottom: 24 }}>
                    <label className="form-label" style={{ marginBottom: 6 }}>
                      <MapPin size={14} style={{ display: "inline", marginRight: 4, verticalAlign: "-2px" }} />
                      Select Event Venue / Location (Click or Drag Pin on Map)
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Type or click the map below to pinpoint venue (e.g. Galle Face Hotel, Colombo)"
                      value={booking.location}
                      onChange={(e) => {
                        updateBooking({ location: e.target.value });
                        setValidationMsg("");
                      }}
                    />

                    {/* Interactive Leaflet Location Picker Map */}
                    <LocationPickerMap
                      value={booking.location}
                      onChange={(loc) => {
                        updateBooking({ location: loc });
                        setValidationMsg("");
                      }}
                      onCoordinatesChange={(coords) => updateBooking({ coordinates: coords })}
                    />
                  </div>

                  {/* Special Notes / Event Details */}
                  <div className="form-group" style={{ marginBottom: 24 }}>
                    <label className="form-label">Special Notes / Instructions for Photographer (Optional)</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      placeholder="e.g. Ceremony starts at 10 AM sharp, requested outdoor lawn portrait session, special family shots..."
                      value={booking.notes || ""}
                      onChange={(e) => updateBooking({ notes: e.target.value })}
                    />
                  </div>

                  {/* Validation alert */}
                  {validationMsg && (
                    <div className="alert alert-error" style={{ marginBottom: 18 }}>
                      <AlertCircle size={16} /> {validationMsg}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div style={{ display: "flex", gap: 14, marginTop: 10 }}>
                    <button
                      type="button"
                      className="btn btn-ghost"
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                      onClick={() => setCurrentStep(1)}
                    >
                      <ArrowLeft size={16} /> Back to Step 1
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary flex-1 btn-lg"
                      style={{ fontWeight: 700 }}
                      onClick={handleProceedToStep3}
                    >
                      Continue to Add Services (Step 3) <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Summary Card */}
              <div className="book-right">
                <div className="card-elevated" style={{ padding: 24 }}>
                  <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--white)", marginBottom: 16 }}>
                    Current Booking Summary
                  </h3>

                  <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: "0.84rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--text-muted)" }}>Type:</span>
                      <span style={{ fontWeight: 600, color: "var(--white)" }}>{booking.photographyType}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--text-muted)" }}>Photographer:</span>
                      <span style={{ fontWeight: 600, color: "#60a5fa" }}>{selectedPhotographer?.name}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--text-muted)" }}>Date:</span>
                      <span style={{ fontWeight: 600, color: "var(--white)" }}>{booking.eventDate}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--text-muted)" }}>Slots:</span>
                      <span style={{ fontWeight: 700, color: "#4ade80" }}>{booking.slotLabel}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--text-muted)" }}>Location:</span>
                      <span style={{ fontWeight: 600, color: "var(--white)", maxWidth: 170, textAlign: "right" }}>
                        {booking.location || "Point on map"}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn btn-primary w-full"
                    style={{ marginTop: 22 }}
                    onClick={handleProceedToStep3}
                  >
                    Proceed to Add Services <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
