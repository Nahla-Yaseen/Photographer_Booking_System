import { createContext, useContext, useState, useEffect } from "react";

// --- Slot Definitions ---
export const ALL_TIME_SLOTS = [
  { id: "s1",  label: "08:00 AM - 09:00 AM", start: "08:00", end: "09:00" },
  { id: "s2",  label: "09:00 AM - 10:00 AM", start: "09:00", end: "10:00" },
  { id: "s3",  label: "10:00 AM - 11:00 AM", start: "10:00", end: "11:00" },
  { id: "s4",  label: "11:00 AM - 12:00 PM", start: "11:00", end: "12:00" },
  { id: "s5",  label: "12:00 PM - 01:00 PM", start: "12:00", end: "13:00" },
  { id: "s6",  label: "01:00 PM - 02:00 PM", start: "13:00", end: "14:00" },
  { id: "s7",  label: "02:00 PM - 03:00 PM", start: "14:00", end: "15:00" },
  { id: "s8",  label: "03:00 PM - 04:00 PM", start: "15:00", end: "16:00" },
  { id: "s9",  label: "04:00 PM - 05:00 PM", start: "16:00", end: "17:00" },
  { id: "s10", label: "05:00 PM - 06:00 PM", start: "17:00", end: "18:00" },
  { id: "s11", label: "06:00 PM - 07:00 PM", start: "18:00", end: "19:00" },
  { id: "s12", label: "07:00 PM - 08:00 PM", start: "19:00", end: "20:00" },
];

export const PACKAGES = [
  { id: "pkg_mini", name: "Mini Session",  description: "Quick and fun - ideal for headshots, small events or social media content",           duration: "2 Hours", slots: 2, price: 12000, icon: "flash",   color: "#60a5fa" },
  { id: "pkg_half", name: "Half Day",      description: "Perfect for engagements, small parties, or outdoor shoots",                          duration: "4 Hours", slots: 4, price: 25000, icon: "sun",     color: "#a78bfa" },
  { id: "pkg_full", name: "Full Day",      description: "Complete coverage for weddings, corporate events, and all-day celebrations",           duration: "8 Hours", slots: 8, price: 45000, icon: "star",    color: "#f59e0b" },
];

const SlotContext = createContext(null);

export const SlotProvider = ({ children }) => {
  const [slotData, setSlotData] = useState(() => {
    try {
      const saved = localStorage.getItem("shutter_slots");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    const demo = {};
    const today = new Date();
    const tStr = today.getFullYear() + "-" + String(today.getMonth()+1).padStart(2,"0") + "-" + String(today.getDate()).padStart(2,"0");
    demo["p1|" + tStr] = {
      s1: { status: "booked",  reason: "" },
      s2: { status: "booked",  reason: "" },
      s5: { status: "blocked", reason: "Lunch / Personal Break" },
      s9: { status: "booked",  reason: "" },
    };
    demo["p3|" + tStr] = {
      s3: { status: "blocked", reason: "Equipment Maintenance" },
      s4: { status: "blocked", reason: "Equipment Maintenance" },
    };
    return demo;
  });

  useEffect(() => {
    try { localStorage.setItem("shutter_slots", JSON.stringify(slotData)); } catch (e) {}
  }, [slotData]);

  const getSlots = (photographerId, date) => {
    if (!photographerId || !date) return {};
    return slotData[photographerId + "|" + date] || {};
  };

  const getSlotStatus = (photographerId, date, slotId) => {
    const daySlots = getSlots(photographerId, date);
    return daySlots[slotId]?.status || "available";
  };

  const blockSlot = (photographerId, date, slotId, reason) => {
    const key = photographerId + "|" + date;
    setSlotData(prev => ({ ...prev, [key]: { ...(prev[key] || {}), [slotId]: { status: "blocked", reason: reason || "" } } }));
  };

  const unblockSlot = (photographerId, date, slotId) => {
    const key = photographerId + "|" + date;
    setSlotData(prev => {
      const dayData = { ...(prev[key] || {}) };
      delete dayData[slotId];
      return { ...prev, [key]: dayData };
    });
  };

  const bookSlots = (photographerId, date, slotIds) => {
    const key = photographerId + "|" + date;
    setSlotData(prev => {
      const updated = { ...(prev[key] || {}) };
      slotIds.forEach(id => { updated[id] = { status: "booked", reason: "" }; });
      return { ...prev, [key]: updated };
    });
  };

  const areSlotsAvailable = (photographerId, date, slotIds) => {
    const daySlots = getSlots(photographerId, date);
    return slotIds.every(id => !daySlots[id] || daySlots[id].status === "available");
  };

  return (
    <SlotContext.Provider value={{ getSlots, getSlotStatus, blockSlot, unblockSlot, bookSlots, areSlotsAvailable }}>
      {children}
    </SlotContext.Provider>
  );
};

export const useSlots = () => useContext(SlotContext);
