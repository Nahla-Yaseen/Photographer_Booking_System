import { createContext, useContext, useState, useEffect } from "react";
import { ADDITIONAL_SERVICES, ADMIN_BOOKINGS, INITIAL_BLOCKED_SLOTS, PACKAGE_TYPES, TIME_BASED_SLOTS } from "../data/mockData";
import {
  subscribeToBookings,
  saveBookingToFirestore,
  updateBookingInFirestore,
  deleteBookingFromFirestore,
  subscribeToBlockedSlots,
  saveBlockedSlotToFirestore,
  deleteBlockedSlotFromFirestore,
  recordPaymentToFirestore
} from "../services/firestoreService";
import { sendConfirmationEmail, sendCancellationEmail } from "../services/emailService";

const BookingContext = createContext(null);

export const BookingProvider = ({ children }) => {
  const [booking, setBooking] = useState({
    bookingType: "time_based", // "time_based" | "package_based"
    packageType: "mini_session", // "mini_session" | "half_day" | "full_day"
    slotId: "",
    slotLabel: "",
    selectedSlotIds: [], // Array of slot IDs for multi-slot time based booking
    selectedSlots: [], // Array of slot objects
    photographyType: "",
    photographerId: "",
    photographer: null,
    eventDate: "",
    startTime: "08:00 AM",
    endTime: "09:00 AM",
    location: "",
    coordinates: null,
    selectedServices: [],
    totalAmount: 0,
  });

  const [confirmedBooking, setConfirmedBooking] = useState(() => {
    try {
      const saved = sessionStorage.getItem("shutter_confirmed_booking");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return null;
  });

  // Shared persistent bookings across User, Admin, and Photographer
  const [allBookings, setAllBookings] = useState(() => {
    try {
      const saved = localStorage.getItem("shutter_bookings");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return ADMIN_BOOKINGS.map(b => ({
      ...b,
      status: b.status === "Pending" ? "Confirmed" : b.status,
    }));
  });

  // Shared persistent blocked slots across Admin, Photographer, and User
  const [blockedSlots, setBlockedSlots] = useState(() => {
    try {
      const saved = localStorage.getItem("shutter_blocked_slots");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_BLOCKED_SLOTS;
  });

  // Connect to real-time Firestore listeners
  useEffect(() => {
    const unsubBookings = subscribeToBookings((data) => {
      if (data && data.length > 0) {
        setAllBookings(data);
      }
    });

    const unsubBlocked = subscribeToBlockedSlots((data) => {
      if (data && data.length > 0) {
        setBlockedSlots(data);
      }
    });

    return () => {
      if (typeof unsubBookings === "function") unsubBookings();
      if (typeof unsubBlocked === "function") unsubBlocked();
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("shutter_bookings", JSON.stringify(allBookings));
    } catch (e) {
      console.error(e);
    }
  }, [allBookings]);

  useEffect(() => {
    try {
      localStorage.setItem("shutter_blocked_slots", JSON.stringify(blockedSlots));
    } catch (e) {
      console.error(e);
    }
  }, [blockedSlots]);

  const updateBooking = (fields) => {
    setBooking((prev) => ({ ...prev, ...fields }));
  };

  // Toggle slot selection (supports multi-slot selection in time-based booking)
  const toggleSlotSelection = (slot) => {
    let errorMessage = null;

    setBooking((prev) => {
      const exists = prev.selectedSlotIds.includes(slot.id);
      let newIds = [];
      let newSlots = [];

      if (prev.bookingType === "time_based") {
        if (exists) {
          newIds = prev.selectedSlotIds.filter(id => id !== slot.id);
          newSlots = prev.selectedSlots.filter(s => s.id !== slot.id);
        } else {
          newIds = [...prev.selectedSlotIds, slot.id];
          newSlots = [...prev.selectedSlots, slot];
        }
      } else {
        const pkg = PACKAGE_TYPES.find(p => p.id === prev.packageType);
        const hours = pkg ? parseInt(pkg.badge.split(" ")[0]) || 1 : 1;

        const startIndex = TIME_BASED_SLOTS.findIndex(s => s.id === slot.id);

        if (startIndex === -1 || startIndex + hours > TIME_BASED_SLOTS.length) {
          errorMessage = `Not enough time slots left for a ${hours}-hour package starting here. Pick an earlier slot.`;
          return prev;
        }

        const candidateSlots = TIME_BASED_SLOTS.slice(startIndex, startIndex + hours);

        const isSlotUnavailable = (s) => {
          const slotBooked = allBookings.some(b => {
            if (b.status === "Cancelled") return false;
            const samePhotographer = !prev.photographerId || b.photographerId === prev.photographerId;
            const sameDate = b.date === prev.eventDate;
            const slotMatches =
              b.slotId === s.id ||
              (b.selectedSlotIds && b.selectedSlotIds.includes(s.id)) ||
              (b.slotIds && b.slotIds.includes(s.id));
            return samePhotographer && sameDate && slotMatches;
          });
          if (slotBooked) return true;

          const slotBlocked = blockedSlots.some(b =>
            (!prev.photographerId || b.photographerId === prev.photographerId) &&
            b.date === prev.eventDate &&
            b.slotId === s.id
          );
          return slotBlocked;
        };

        const hasUnavailable = candidateSlots.some(isSlotUnavailable);
        if (hasUnavailable) {
          errorMessage = `One or more slots in this ${hours}-hour range are already booked or blocked. Try a different start time.`;
          return prev;
        }

        newIds = candidateSlots.map(s => s.id);
        newSlots = candidateSlots;
      }

      let label = "";
      if (newSlots.length === 0) {
        label = "";
      } else if (newSlots.length === 1) {
        label = newSlots[0].label;
      } else {
        label = `${newSlots.length} Slots (${newSlots[0].startTime} – ${newSlots[newSlots.length - 1].endTime})`;
      }

      return {
        ...prev,
        selectedSlotIds: newIds,
        selectedSlots: newSlots,
        slotId: newIds.join(","),
        slotLabel: label,
        startTime: newSlots[0]?.startTime || prev.startTime,
        endTime: newSlots[newSlots.length - 1]?.endTime || prev.endTime,
      };
    });

    return errorMessage;
  };

  const toggleService = (serviceId) => {
    const svc = ADDITIONAL_SERVICES.find((s) => s.id === serviceId);
    if (!svc) return;

    setBooking((prev) => {
      const exists = prev.selectedServices.find((s) => s.id === serviceId);
      const updated = exists
        ? prev.selectedServices.filter((s) => s.id !== serviceId)
        : [...prev.selectedServices, svc];
      return { ...prev, selectedServices: updated };
    });
  };

  // Block a slot with reason
  const blockSlot = ({ photographerId, date, slotId, reason = "Blocked by Management", blockedBy = "Admin" }) => {
    const newBlock = {
      id: "blk_" + Date.now().toString().slice(-8),
      photographerId,
      date,
      slotId,
      reason,
      blockedBy,
      createdAt: new Date().toISOString(),
    };
    setBlockedSlots((prev) => [newBlock, ...prev.filter(b => !(b.photographerId === photographerId && b.date === date && b.slotId === slotId))]);
    saveBlockedSlotToFirestore(newBlock).catch(err => console.warn("Firestore saveBlockedSlot error:", err));
    return newBlock;
  };

  // Unblock a slot
  const unblockSlot = (blockId) => {
    setBlockedSlots((prev) => prev.filter((b) => b.id !== blockId));
    deleteBlockedSlotFromFirestore(blockId).catch(err => console.warn("Firestore unblock error:", err));
  };

  const unblockSlotByDetails = (photographerId, date, slotId) => {
    const target = blockedSlots.find(b => b.photographerId === photographerId && b.date === date && b.slotId === slotId);
    if (target?.id) {
      deleteBlockedSlotFromFirestore(target.id).catch(console.warn);
    }
    setBlockedSlots((prev) => prev.filter((b) => !(b.photographerId === photographerId && b.date === date && b.slotId === slotId)));
  };

  // Check if slot is booked or blocked
  const getSlotStatus = (photographerId, date, slotId, slotTimeLabel = "") => {
    if (!date) return { status: "available" };

    const bookedMatch = allBookings.find((b) => {
      if (b.status === "Cancelled") return false;
      const samePhotographer = !photographerId || b.photographerId === photographerId;
      const sameDate = b.date === date;
      const slotMatches =
        b.slotId === slotId ||
        (b.selectedSlotIds && b.selectedSlotIds.includes(slotId)) ||
        (b.slotIds && b.slotIds.includes(slotId)) ||
        (slotTimeLabel && b.time && b.time.includes(slotTimeLabel));

      return samePhotographer && sameDate && slotMatches;
    });

    if (bookedMatch) {
      return {
        status: "booked",
        color: "#ef4444",
        label: "Booked",
        booking: bookedMatch,
      };
    }

    const blockedMatch = blockedSlots.find((b) => {
      const samePhotographer = !photographerId || b.photographerId === photographerId || b.photographerId === "all";
      const sameDate = b.date === date;
      const sameSlot = b.slotId === slotId;
      return samePhotographer && sameDate && sameSlot;
    });

    if (blockedMatch) {
      return {
        status: "blocked",
        color: "#f97316",
        label: `Blocked (${blockedMatch.reason})`,
        reason: blockedMatch.reason,
        blockedBy: blockedMatch.blockedBy,
        blockId: blockedMatch.id,
      };
    }

    return {
      status: "available",
      color: "#22c55e",
      label: "Available",
    };
  };

  const confirmBooking = (photographerData, clientData = {}, customBooking = null) => {
    const activeBooking = customBooking || booking;
    const servicesTotal = (activeBooking.selectedServices || []).reduce(
      (acc, s) => acc + s.price,
      0
    );

    const slotCount = Math.max(1, activeBooking.selectedSlotIds?.length || 1);
    const photoBase = activeBooking.bookingType === "time_based"
      ? (photographerData?.hourlyRate || 6000) * slotCount
      : (photographerData?.price || 45000);

    const total = activeBooking.totalAmount || (photoBase + servicesTotal);
    const id = activeBooking.id || "BK" + Date.now().toString().slice(-9);

    const clientName = typeof clientData === "object" ? clientData.name || "Customer" : clientData || "Customer";
    const clientEmail = typeof clientData === "object" ? clientData.email || "customer@shuttermoments.com" : "customer@shuttermoments.com";
    const clientPhone = typeof clientData === "object" ? clientData.phone || "+94 77 123 4567" : "+94 77 123 4567";
    const clientId = typeof clientData === "object" ? clientData.clientId || clientData.userId || null : null;
    const paymentRef = typeof clientData === "object" ? clientData.paymentRef || null : null;

    const resolvedPhotographerName =
      photographerData?.name ||
      (activeBooking.photographerName && activeBooking.photographerName !== "Professional Photographer" ? activeBooking.photographerName : null) ||
      (typeof activeBooking.photographer === "string" && activeBooking.photographer !== "Professional Photographer" ? activeBooking.photographer : null) ||
      (activeBooking.photographer && typeof activeBooking.photographer === "object" ? activeBooking.photographer.name : null) ||
      photographersList?.[0]?.name ||
      "Alex Morgan";

    const servicesList = (activeBooking.selectedServices || []).map(s => typeof s === "string" ? s : s.name);

    const newBooking = {
      id,
      event: activeBooking.photographyType || "Photo Shoot",
      photographyType: activeBooking.photographyType,
      bookingType: activeBooking.bookingType || "time_based",
      packageType: activeBooking.packageType || null,
      package: activeBooking.packageType || (activeBooking.bookingType === "time_based" ? "Hourly Shoot" : "Standard Package"),
      slotId: activeBooking.slotId || null,
      slotIds: activeBooking.selectedSlotIds?.length > 0 ? activeBooking.selectedSlotIds : [activeBooking.slotId],
      selectedSlotIds: activeBooking.selectedSlotIds?.length > 0 ? activeBooking.selectedSlotIds : [activeBooking.slotId],
      slotLabel: activeBooking.slotLabel || `${activeBooking.startTime} – ${activeBooking.endTime}`,
      time: activeBooking.slotLabel || `${activeBooking.startTime} – ${activeBooking.endTime}`,
      client: clientName,
      clientEmail,
      clientPhone,
      clientId,
      userId: clientId,
      photographer: resolvedPhotographerName,
      photographerName: resolvedPhotographerName,
      photographerId: photographerData?.id || activeBooking.photographerId || "",
      date: activeBooking.eventDate || "Upcoming Date",
      amount: total,
      totalAmount: total,
      depositPaid: total * 0.3,
      balanceRemaining: total * 0.7,
      status: "Confirmed",
      paymentRef: paymentRef || "Card Payment",
      location: activeBooking.location || "On-site",
      coordinates: activeBooking.coordinates || null,
      services: servicesList,
      selectedServices: activeBooking.selectedServices || [],
      createdAt: new Date().toISOString(),
    };

    setConfirmedBooking(newBooking);
    try {
      sessionStorage.setItem("shutter_confirmed_booking", JSON.stringify(newBooking));
    } catch (e) {}

    setAllBookings((prev) => [newBooking, ...prev]);

    // 1. Save to Google Cloud Firestore
    saveBookingToFirestore(newBooking).catch(err => console.warn("Firestore saveBooking error:", err));

    // 2. Record 30% advance deposit payment to Firestore payments collection
    recordPaymentToFirestore({
      bookingId: id,
      clientName,
      clientEmail,
      amountPaid: total * 0.3,
      totalAmount: total,
      paymentMethod: paymentRef ? `Stripe (${paymentRef})` : "Card / Advance Deposit (30%)",
      status: "Success",
    }).catch(err => console.warn("Firestore recordPayment error:", err));

    // 3. Dispatch automated confirmation email notification to user email
    sendConfirmationEmail(newBooking, clientEmail, clientName).catch(err => console.warn("Confirmation email error:", err));

    return newBooking;
  };

  const updateBookingStatus = (id, newStatus, reason = "", cancelledBy = "Management", targetBooking = null) => {
    const booking = targetBooking || allBookings.find((b) => b.id === id);

    setAllBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: newStatus, cancellationReason: reason } : b))
    );

    // Update in Firestore
    updateBookingInFirestore(id, { status: newStatus, cancellationReason: reason }).catch(console.warn);

    // If cancelled in critical situation, send cancellation email notification to client
    if (newStatus === "Cancelled") {
      const b = booking || allBookings.find((item) => item.id === id);
      if (b) {
        const clientEmail = b.clientEmail || (b.client && b.client.includes("@") ? b.client : "mohamedysn130@gmail.com");
        const clientName = b.client || "Valued Customer";
        console.log(`[Cancellation Email] Dispatching to ${clientEmail} for Booking #${id} by ${cancelledBy}`);
        sendCancellationEmail(b, clientEmail, clientName, reason, cancelledBy)
          .catch((err) => console.warn("[Cancellation Email Error]:", err));
      }
    }
  };

  const removeBooking = (id) => {
    setAllBookings((prev) => prev.filter((b) => b.id !== id));
    deleteBookingFromFirestore(id).catch(console.warn);
  };

  const resetBooking = () => {
    setBooking({
      bookingType: "time_based",
      packageType: "mini_session",
      slotId: "",
      slotLabel: "",
      selectedSlotIds: [],
      selectedSlots: [],
      photographyType: "",
      photographerId: "",
      photographer: null,
      eventDate: "",
      startTime: "08:00 AM",
      endTime: "09:00 AM",
      location: "",
      coordinates: null,
      selectedServices: [],
      totalAmount: 0,
    });
  };

  return (
    <BookingContext.Provider
      value={{
        booking,
        updateBooking,
        toggleSlotSelection,
        toggleService,
        confirmBooking,
        confirmedBooking,
        resetBooking,
        allBookings,
        updateBookingStatus,
        removeBooking,
        blockedSlots,
        blockSlot,
        unblockSlot,
        unblockSlotByDetails,
        getSlotStatus,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => useContext(BookingContext);
