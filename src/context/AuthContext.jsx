// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";

const AuthCtx = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);     // {uid, email, name, role}
  const [loading, setLoading] = useState(true);

  // Încarcă profilul din Firestore
  const loadProfile = async (fbUser) => {
    const ref = doc(db, "users", fbUser.uid);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const profile = snap.data();
      return {
        uid: fbUser.uid,
        email: fbUser.email,
        name: profile.name || fbUser.email.split("@")[0],
        role: profile.role || "student",
      };
    }
    // dacă nu există, creăm profil minimal cu rol student
    const fallback = {
      name: fbUser.email.split("@")[0],
      role: "student",
    };
    await setDoc(ref, fallback, { merge: true });
    return { uid: fbUser.uid, email: fbUser.email, ...fallback };
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) {
        setUser(null);
        setLoading(false);
        return;
      }
      const profile = await loadProfile(fbUser);
      setUser(profile);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // login: dacă utilizatorul nu există, îl creăm și îi setăm rolul ales
  const login = async ({ email, password, role }) => {
    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      const profile = await loadProfile(res.user);
      // dacă rolul diferă față de cel cerut (prima logare), nu-l suprascriem
      return profile;
    } catch (err) {
      if (err.code === "auth/user-not-found") {
        // creăm contul și profilul
        const res = await createUserWithEmailAndPassword(auth, email, password);
        const ref = doc(db, "users", res.user.uid);
        const profile = {
          name: email.split("@")[0],
          role: role || "student",
        };
        await setDoc(ref, profile, { merge: true });
        setUser({ uid: res.user.uid, email, ...profile });
        return { uid: res.user.uid, email, ...profile };
      }
      throw err;
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  const value = { user, loading, login, logout };
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);
