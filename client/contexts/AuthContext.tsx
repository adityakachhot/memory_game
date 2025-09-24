import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextType {
  authState: AuthState;
  login: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  register: (
    username: string,
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Subscribe to Firebase auth state
  useEffect(() => {
    let resolved = false;
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) {
        setAuthState({ user: null, isAuthenticated: false, isLoading: false });
        resolved = true;
        return;
      }
      const ref = doc(db, "users", fbUser.uid);
      let profile: { username: string; email: string; createdAt?: any } = {
        username: fbUser.displayName || fbUser.email?.split("@")[0] || "Player",
        email: fbUser.email || "",
        createdAt: new Date().toISOString(),
      };
      try {
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data() as any;
          profile = {
            username: data.username || profile.username,
            email: data.email || profile.email,
            createdAt: data.createdAt?.toDate
              ? data.createdAt.toDate().toISOString()
              : data.createdAt || profile.createdAt,
          };
        } else {
          await setDoc(
            ref,
            {
              username: profile.username,
              email: profile.email,
              createdAt: serverTimestamp(),
            },
            { merge: true },
          );
        }
      } catch (e) {
        console.warn("Firestore profile access failed (using fallback):", e);
      }
      setAuthState({
        user: {
          id: fbUser.uid,
          username: profile.username,
          email: profile.email,
          createdAt: profile.createdAt,
        },
        isAuthenticated: true,
        isLoading: false,
      });
      resolved = true;
    });

    const t = setTimeout(() => {
      if (!resolved) {
        setAuthState((s) => ({ ...s, isLoading: false }));
      }
    }, 5000);

    return () => {
      clearTimeout(t);
      unsub();
    };
  }, []);

  const register = async (
    username: string,
    email: string,
    password: string,
  ): Promise<{ success: boolean; error?: string }> => {
    if (!username.trim() || !email.trim() || !password.trim()) {
      return {
        success: false,
        error: "Username, email and password are required",
      };
    }
    if (username.length < 3) {
      return {
        success: false,
        error: "Username must be at least 3 characters long",
      };
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { success: false, error: "Please enter a valid email" };
    }
    if (password.length < 6) {
      return {
        success: false,
        error: "Password must be at least 6 characters long",
      };
    }
    let cred: Awaited<
      ReturnType<typeof createUserWithEmailAndPassword>
    > | null = null;
    try {
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        return {
          success: false,
          error: "No internet connection. Please reconnect and try again.",
        };
      }
      cred = await createUserWithEmailAndPassword(auth, email, password);
      if (cred.user) {
        await updateProfile(cred.user, { displayName: username.trim() });
        const ref = doc(db, "users", cred.user.uid);
        await setDoc(
          ref,
          {
            username: username.trim(),
            email: email.trim(),
            createdAt: serverTimestamp(),
          },
          { merge: true },
        );
      }
      return { success: true };
    } catch (error: any) {
      let msg = "Registration failed. Please try again.";
      if (error && typeof error.code === "string") {
        if (error.code === "auth/email-already-in-use")
          msg = "Email already in use";
        else if (error.code === "auth/invalid-email")
          msg = "Invalid email address";
        else if (error.code === "auth/weak-password")
          msg = "Password is too weak";
        else if (error.code === "auth/network-request-failed") {
          const host =
            typeof window !== "undefined"
              ? window.location.hostname
              : "your-domain";
          msg = `Network error. Ensure Email/Password is enabled and add ${host} to Firebase Auth Authorized domains. Also check ad blockers.`;
        } else if (error.code === "permission-denied") {
          msg =
            "Firestore rules block writes. Allow users/{uid} for authenticated users.";
        }
      } else if (
        typeof error?.message === "string" &&
        error.message.includes("insufficient permissions")
      ) {
        msg =
          "Firestore rules block access. Update rules to allow users/{uid}.";
      }
      if (cred?.user) {
        try {
          const { deleteUser } = await import("firebase/auth");
          await deleteUser(cred.user);
        } catch (_) {
          // ignore cleanup errors
        }
      }
      console.error("Registration error:", error);
      return { success: false, error: msg };
    }
  };

  const login = async (
    email: string,
    password: string,
  ): Promise<{ success: boolean; error?: string }> => {
    if (!email.trim() || !password.trim()) {
      return { success: false, error: "Email and password are required" };
    }
    try {
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        return {
          success: false,
          error: "No internet connection. Please reconnect and try again.",
        };
      }
      await signInWithEmailAndPassword(auth, email.trim(), password);
      return { success: true };
    } catch (error: any) {
      let msg = "Login failed. Please try again.";
      if (error && typeof error.code === "string") {
        if (
          error.code === "auth/invalid-credential" ||
          error.code === "auth/wrong-password"
        )
          msg = "Invalid email or password";
        else if (error.code === "auth/user-not-found")
          msg = "No account found for this email";
        else if (error.code === "auth/too-many-requests")
          msg = "Too many attempts. Try again later";
        else if (error.code === "auth/network-request-failed") {
          const host =
            typeof window !== "undefined"
              ? window.location.hostname
              : "your-domain";
          msg = `Network error. Add ${host} to Firebase Auth Authorized domains and check connectivity/ad blockers.`;
        }
      }
      console.error("Login error:", error);
      return { success: false, error: msg };
    }
  };

  const logout = () => {
    try {
      signOut(auth);
      setAuthState({ user: null, isAuthenticated: false, isLoading: false });
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ authState, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
