import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { database } from "../FirebaseConfig";
import { PHOTOGRAPHERS, ADMIN_BOOKINGS, INITIAL_BLOCKED_SLOTS } from "../data/mockData";

// Collection references
const BOOKINGS_COL = "bookings";
const PHOTOGRAPHERS_COL = "photographers";
const BLOCKED_SLOTS_COL = "blocked_slots";
const PAYMENTS_COL = "payments";
const USERS_COL = "users";

/* =========================================================
   1. BOOKINGS (Storing, Updating, Cancelling, Real-time Sync)
   ========================================================= */

export function subscribeToBookings(onData, onError) {
  try {
    const q = query(collection(database, BOOKINGS_COL));
    return onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const bookings = snapshot.docs.map((d) => ({
            ...d.data(),
            id: d.id,
          }));
          onData(bookings);
        } else {
          // If Firestore is empty initially, seed with default mock bookings
          seedInitialBookings();
        }
      },
      (err) => {
        console.warn("[Firestore] Error reading bookings:", err.message);
        if (onError) onError(err);
      }
    );
  } catch (err) {
    console.warn("[Firestore] subscribeToBookings error:", err.message);
    if (onError) onError(err);
    return () => {};
  }
}

export async function saveBookingToFirestore(bookingData) {
  try {
    const id = bookingData.id || "BK" + Date.now().toString().slice(-9);
    const docRef = doc(database, BOOKINGS_COL, id);
    const dataToSave = {
      ...bookingData,
      id,
      depositPaid: Number(bookingData.totalAmount || 0) * 0.3,
      balanceRemaining: Number(bookingData.totalAmount || 0) * 0.7,
      status: bookingData.status || "Confirmed",
      createdAt: bookingData.createdAt || new Date().toISOString(),
      updatedAt: serverTimestamp(),
    };
    await setDoc(docRef, dataToSave, { merge: true });
    console.log(`[Firestore] Booking ${id} saved successfully.`);
    return dataToSave;
  } catch (err) {
    console.error("[Firestore] saveBookingToFirestore error:", err);
    throw err;
  }
}

export async function updateBookingInFirestore(bookingId, updates) {
  try {
    const docRef = doc(database, BOOKINGS_COL, bookingId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    console.log(`[Firestore] Booking ${bookingId} updated:`, updates);
  } catch (err) {
    console.error("[Firestore] updateBookingInFirestore error:", err);
    throw err;
  }
}

export async function deleteBookingFromFirestore(bookingId) {
  try {
    const docRef = doc(database, BOOKINGS_COL, bookingId);
    await deleteDoc(docRef);
    console.log(`[Firestore] Booking ${bookingId} deleted.`);
  } catch (err) {
    console.error("[Firestore] deleteBookingFromFirestore error:", err);
    throw err;
  }
}

async function seedInitialBookings() {
  try {
    for (const b of ADMIN_BOOKINGS) {
      const docRef = doc(database, BOOKINGS_COL, b.id);
      await setDoc(docRef, {
        ...b,
        status: b.status === "Pending" ? "Confirmed" : b.status,
        depositPaid: (b.amount || 45000) * 0.3,
        balanceRemaining: (b.amount || 45000) * 0.7,
        createdAt: new Date().toISOString(),
      });
    }
  } catch (e) {
    console.warn("[Firestore] Auto-seed bookings skipped:", e.message);
  }
}

/* =========================================================
   2. PHOTOGRAPHERS (Managing, Profiles, Availability)
   ========================================================= */

export function subscribeToPhotographers(onData, onError) {
  try {
    const q = query(collection(database, PHOTOGRAPHERS_COL));
    return onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const list = snapshot.docs.map((d) => ({
            ...d.data(),
            id: d.id,
          }));
          onData(list);
        } else {
          seedInitialPhotographers();
        }
      },
      (err) => {
        console.warn("[Firestore] Error reading photographers:", err.message);
        if (onError) onError(err);
      }
    );
  } catch (err) {
    console.warn("[Firestore] subscribeToPhotographers error:", err.message);
    if (onError) onError(err);
    return () => {};
  }
}

export async function savePhotographerToFirestore(photographer) {
  try {
    const id = photographer.id || "p_" + Date.now().toString().slice(-6);
    const docRef = doc(database, PHOTOGRAPHERS_COL, id);
    await setDoc(docRef, { ...photographer, id, updatedAt: serverTimestamp() }, { merge: true });
    console.log(`[Firestore] Photographer ${id} saved.`);
    return { ...photographer, id };
  } catch (err) {
    console.error("[Firestore] savePhotographerToFirestore error:", err);
    throw err;
  }
}

export async function deletePhotographerFromFirestore(id) {
  try {
    const docRef = doc(database, PHOTOGRAPHERS_COL, id);
    await deleteDoc(docRef);
    console.log(`[Firestore] Photographer ${id} deleted.`);
  } catch (err) {
    console.error("[Firestore] deletePhotographerFromFirestore error:", err);
    throw err;
  }
}

async function seedInitialPhotographers() {
  try {
    for (const p of PHOTOGRAPHERS) {
      const docRef = doc(database, PHOTOGRAPHERS_COL, p.id);
      await setDoc(docRef, p);
    }
  } catch (e) {
    console.warn("[Firestore] Auto-seed photographers skipped:", e.message);
  }
}

/* =========================================================
   3. AVAILABILITY & BLOCKED SLOTS
   ========================================================= */

export function subscribeToBlockedSlots(onData, onError) {
  try {
    const q = query(collection(database, BLOCKED_SLOTS_COL));
    return onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const slots = snapshot.docs.map((d) => ({
            ...d.data(),
            id: d.id,
          }));
          onData(slots);
        } else {
          seedInitialBlockedSlots();
        }
      },
      (err) => {
        console.warn("[Firestore] Error reading blocked slots:", err.message);
        if (onError) onError(err);
      }
    );
  } catch (err) {
    console.warn("[Firestore] subscribeToBlockedSlots error:", err.message);
    if (onError) onError(err);
    return () => {};
  }
}

export async function saveBlockedSlotToFirestore(slotData) {
  try {
    const id = slotData.id || "blk_" + Date.now().toString().slice(-8);
    const docRef = doc(database, BLOCKED_SLOTS_COL, id);
    await setDoc(docRef, { ...slotData, id, createdAt: new Date().toISOString() });
    console.log(`[Firestore] Blocked slot ${id} saved.`);
    return { ...slotData, id };
  } catch (err) {
    console.error("[Firestore] saveBlockedSlotToFirestore error:", err);
    throw err;
  }
}

export async function deleteBlockedSlotFromFirestore(id) {
  try {
    const docRef = doc(database, BLOCKED_SLOTS_COL, id);
    await deleteDoc(docRef);
    console.log(`[Firestore] Blocked slot ${id} removed.`);
  } catch (err) {
    console.error("[Firestore] deleteBlockedSlotFromFirestore error:", err);
    throw err;
  }
}

async function seedInitialBlockedSlots() {
  try {
    for (const s of INITIAL_BLOCKED_SLOTS) {
      const docRef = doc(database, BLOCKED_SLOTS_COL, s.id);
      await setDoc(docRef, s);
    }
  } catch (e) {
    console.warn("[Firestore] Auto-seed blocked slots skipped:", e.message);
  }
}

/* =========================================================
   4. PAYMENTS & TRANSACTIONS
   ========================================================= */

export async function recordPaymentToFirestore(paymentData) {
  try {
    const id = paymentData.id || "pay_" + Date.now().toString().slice(-8);
    const docRef = doc(database, PAYMENTS_COL, id);
    const record = {
      ...paymentData,
      id,
      timestamp: new Date().toISOString(),
      status: "Success",
    };
    await setDoc(docRef, record);
    console.log(`[Firestore] Payment ${id} recorded.`);
    return record;
  } catch (err) {
    console.error("[Firestore] recordPaymentToFirestore error:", err);
    throw err;
  }
}

export async function getPaymentsFromFirestore() {
  try {
    const snapshot = await getDocs(collection(database, PAYMENTS_COL));
    return snapshot.docs.map((d) => ({ ...d.data(), id: d.id }));
  } catch (err) {
    console.warn("[Firestore] getPaymentsFromFirestore error:", err.message);
    return [];
  }
}

/* =========================================================
   5. CUSTOMER & USER DETAILS
   ========================================================= */

export async function saveUserToFirestore(userData) {
  try {
    const id = userData.id || userData.email.replace(/[^a-zA-Z0-9]/g, "_");
    const docRef = doc(database, USERS_COL, id);
    await setDoc(
      docRef,
      {
        ...userData,
        id,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    console.log(`[Firestore] Customer details saved for ${userData.email}.`);
  } catch (err) {
    console.error("[Firestore] saveUserToFirestore error:", err);
    throw err;
  }
}

/* =========================================================
   6. ADMIN REPORTS & ANALYTICS
   ========================================================= */

export function calculateReports(bookings = [], payments = []) {
  const totalBookings = bookings.length;
  const confirmed = bookings.filter((b) => b.status === "Confirmed").length;
  const completed = bookings.filter((b) => b.status === "Completed").length;
  const cancelled = bookings.filter((b) => b.status === "Cancelled").length;

  // Calculate gross booking revenue
  const totalGrossRevenue = bookings
    .filter((b) => b.status !== "Cancelled")
    .reduce((sum, b) => sum + Number(b.totalAmount || b.amount || 0), 0);

  // 30% advance deposit collected
  const advanceCollected = bookings
    .filter((b) => b.status !== "Cancelled")
    .reduce((sum, b) => sum + Number(b.depositPaid || (b.totalAmount || b.amount || 0) * 0.3), 0);

  // 70% remaining balance due
  const remainingBalance = bookings
    .filter((b) => b.status === "Confirmed")
    .reduce((sum, b) => sum + Number(b.balanceRemaining || (b.totalAmount || b.amount || 0) * 0.7), 0);

  return {
    totalBookings,
    confirmed,
    completed,
    cancelled,
    totalGrossRevenue,
    advanceCollected,
    remainingBalance,
    cancellationRate: totalBookings > 0 ? ((cancelled / totalBookings) * 100).toFixed(1) : 0,
  };
}
