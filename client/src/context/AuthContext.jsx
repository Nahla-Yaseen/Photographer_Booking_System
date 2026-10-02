import { createContext, useContext, useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import { auth } from "../FirebaseConfig";
import { PHOTOGRAPHERS } from "../data/mockData";
import {
  subscribeToPhotographers,
  savePhotographerToFirestore,
  saveUserToFirestore,
} from "../services/firestoreService";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { database } from "../FirebaseConfig";

// Admin emails — anyone who logs in with these emails gets the "admin" role
const ADMIN_EMAILS = ["mohamedysn130@gmail.com", "admin@shuttermoments.com"];

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("shutter_user");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return null;
  });
  const [authLoading, setAuthLoading] = useState(true); // true while Firebase checks session

  const [photographersList, setPhotographersList] = useState(() => {
    try {
      const saved = localStorage.getItem("shutter_photographers");
      if (saved) return JSON.parse(saved);
    } catch (e) { /* ignore */ }
    return PHOTOGRAPHERS;
  });

  // ── Sync photographers from Firestore ──────────────────────────────────────
  useEffect(() => {
    const unsub = subscribeToPhotographers((list) => {
      if (list && list.length > 0) setPhotographersList(list);
    });
    return () => { if (typeof unsub === "function") unsub(); };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("shutter_photographers", JSON.stringify(photographersList));
    } catch (e) { /* ignore */ }
  }, [photographersList]);

  // ── Firebase session observer — runs on every page load ───────────────────
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Load role & profile from Firestore users/{uid}
        try {
          const docRef = doc(database, "users", firebaseUser.uid);
          const snap   = await getDoc(docRef);
          if (snap.exists()) {
            const data = snap.data();
            const fullProfile = { ...data, firebaseUid: firebaseUser.uid };
            setUser(fullProfile);
            try { localStorage.setItem("shutter_user", JSON.stringify(fullProfile)); } catch (e) {}
          } else {
            // Fallback — build minimal profile from Firebase Auth
            const isAdmin = ADMIN_EMAILS.includes(firebaseUser.email?.toLowerCase());
            const profile = {
              id: firebaseUser.uid,
              firebaseUid: firebaseUser.uid,
              name: firebaseUser.displayName || firebaseUser.email.split("@")[0],
              email: firebaseUser.email,
              phone: "",
              role: isAdmin ? "admin" : "user",
            };
            setUser(profile);
            try { localStorage.setItem("shutter_user", JSON.stringify(profile)); } catch (e) {}
          }
        } catch (err) {
          console.warn("[Auth] Could not load user profile from Firestore:", err.message);
        }
      } else {
        setUser(null);
        try { localStorage.removeItem("shutter_user"); } catch (e) {}
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const isAdmin        = user?.role === "admin";
  const isPhotographer = user?.role === "photographer";

  // ── Helper: save user profile to Firestore users/{uid} ────────────────────
  const persistUserDoc = async (uid, profileData) => {
    try {
      const docRef = doc(database, "users", uid);
      await setDoc(docRef, { ...profileData, updatedAt: serverTimestamp() }, { merge: true });
    } catch (err) {
      console.warn("[Auth] Could not save user doc:", err.message);
    }
  };

  // ── CUSTOMER: Register ─────────────────────────────────────────────────────
  const registerUser = async (email, password, name, phone = "") => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
    const profile = {
      id: cred.user.uid,
      firebaseUid: cred.user.uid,
      name,
      email,
      phone,
      role: "user",
    };
    await persistUserDoc(cred.user.uid, profile);
    setUser(profile);
    try {
      localStorage.setItem("shutter_user", JSON.stringify(profile));
    } catch (e) {}
    return profile;
  };

  // ── CUSTOMER: Login ────────────────────────────────────────────────────────
  const loginUser = async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    let profile = {
      id: cred.user.uid,
      firebaseUid: cred.user.uid,
      name: cred.user.displayName || email.split("@")[0],
      email: cred.user.email,
      phone: "",
      role: "user",
    };
    try {
      const docRef = doc(database, "users", cred.user.uid);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        profile = { ...profile, ...snap.data(), firebaseUid: cred.user.uid };
      }
    } catch (e) {}
    setUser(profile);
    try {
      localStorage.setItem("shutter_user", JSON.stringify(profile));
    } catch (e) {}
    return profile;
  };

  // ── ADMIN: Login ───────────────────────────────────────────────────────────
  const loginAdmin = async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    // Ensure admin role is set in Firestore
    const profile = {
      id: cred.user.uid,
      firebaseUid: cred.user.uid,
      name: cred.user.displayName || "Administrator",
      email,
      role: "admin",
    };
    await persistUserDoc(cred.user.uid, profile);
    return cred.user;
  };

  // ── PHOTOGRAPHER: Login ────────────────────────────────────────────────────
  const loginPhotographer = async (email, password) => {
    // This will throw on bad credentials — let the caller catch & display the error
    const cred = await signInWithEmailAndPassword(auth, email, password);
    // onAuthStateChanged will load the full profile from Firestore automatically
    return cred.user;
  };

  // ── PHOTOGRAPHER: Register ─────────────────────────────────────────────────
  const registerPhotographer = async (data) => {
    // Will throw on duplicate email / weak password — let the caller catch & display the error
    const cred = await createUserWithEmailAndPassword(auth, data.email, data.password);
    await updateProfile(cred.user, { displayName: data.name });
    const newPhotographer = {
      id: cred.user.uid,
      firebaseUid: cred.user.uid,
      name: data.name,
      email: data.email,
      phone: data.phone || "",
      role: "photographer",
      specialization: data.specialization || "Wedding Photography",
      types: [data.specialization || "Wedding Photography"],
      price: Number(data.price) || 35000,
      hourlyRate: Math.round((Number(data.price) || 35000) / 6),
      rating: 5.0,
      reviews: 0,
      available: true,
      bio: data.bio || "Passionate professional photographer.",
      blackoutDates: [],
    };
    await persistUserDoc(cred.user.uid, newPhotographer);
    await savePhotographerToFirestore(newPhotographer);
    setPhotographersList((prev) => [newPhotographer, ...prev]);
    return newPhotographer;
  };

  // ── Update photographer profile ────────────────────────────────────────────
  const updatePhotographerProfile = (fields) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...fields };
      setPhotographersList((list) =>
        list.map((p) => (p.id === updated.id ? { ...p, ...fields } : p))
      );
      if (prev.firebaseUid) persistUserDoc(prev.firebaseUid, updated);
      savePhotographerToFirestore(updated).catch(console.warn);
      return updated;
    });
  };

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        isPhotographer,
        authLoading,
        loginUser,
        loginAdmin,
        loginPhotographer,
        registerUser,
        registerPhotographer,
        updatePhotographerProfile,
        logout,
        photographersList,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
