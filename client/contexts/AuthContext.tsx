import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User as FirebaseUser,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";

export interface User {
  id: string;
  username: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextType {
  authState: AuthState;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
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
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const mapped = await mapFirebaseUserToUser(firebaseUser);
        setAuthState({ user: mapped, isAuthenticated: true, isLoading: false });
      } else {
        setAuthState({ user: null, isAuthenticated: false, isLoading: false });
      }
    });
    return () => unsubscribe();
  }, []);

  const mapFirebaseUserToUser = async (firebaseUser: FirebaseUser): Promise<User> => {
    // Fetch profile from Firestore if exists (to get username and createdAt)
    const userDocRef = doc(db, "users", firebaseUser.uid);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      const data = snap.data() as any;
      return {
        id: firebaseUser.uid,
        username: data.username || firebaseUser.email || "user",
        createdAt: (data.createdAt?.toDate?.() || new Date()).toISOString(),
      };
    }
    // Fallback to auth info
    return {
      id: firebaseUser.uid,
      username: firebaseUser.email || "user",
      createdAt: new Date(firebaseUser.metadata.creationTime || Date.now()).toISOString(),
    };
  };

  const register = async (emailOrUsername: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (!emailOrUsername.trim() || !password.trim()) {
      return { success: false, error: "Email and password are required" };
    }
    const isEmail = /@/.test(emailOrUsername);
    if (!isEmail) {
      if (emailOrUsername.length < 3) {
        return { success: false, error: "Username must be at least 3 characters long" };
      }
    }
    if (password.length < 6) {
      return { success: false, error: "Password must be at least 6 characters long" };
    }
    try {
      const cred = await createUserWithEmailAndPassword(auth, isEmail ? emailOrUsername : `${emailOrUsername}@memorymaster.app`, password);
      // Create Firestore user profile with username (derive from email before @)
      const email = cred.user.email || emailOrUsername;
      const username = isEmail ? (email.split("@")[0] || "user") : emailOrUsername;
      const userDocRef = doc(db, "users", cred.user.uid);
      await setDoc(userDocRef, {
        username,
        email,
        createdAt: serverTimestamp(),
      }, { merge: true });
      const mapped = await mapFirebaseUserToUser(cred.user);
      setAuthState({ user: mapped, isAuthenticated: true, isLoading: false });
      return { success: true };
    } catch (error: any) {
      const message = error?.message || "Registration failed. Please try again.";
      return { success: false, error: message };
    }
  };

  const login = async (emailOrUsername: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (!emailOrUsername.trim() || !password.trim()) {
      return { success: false, error: "Email and password are required" };
    }
    try {
      const isEmail = /@/.test(emailOrUsername);
      const email = isEmail ? emailOrUsername : `${emailOrUsername}@memorymaster.app`;
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (error: any) {
      const message = error?.message || "Login failed. Please try again.";
      return { success: false, error: message };
    }
  };

  const logout = () => {
    signOut(auth).catch(() => {});
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
