import React, { createContext, useContext, useEffect, useState } from "react";

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

  // Load auth state from localStorage on mount
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("memorymaster-user");
      if (savedUser) {
        const user = JSON.parse(savedUser);
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error("Error loading auth state:", error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const register = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (!username.trim() || !password.trim()) {
      return { success: false, error: "Username and password are required" };
    }

    if (username.length < 3) {
      return { success: false, error: "Username must be at least 3 characters long" };
    }

    if (password.length < 6) {
      return { success: false, error: "Password must be at least 6 characters long" };
    }

    try {
      // Get existing users from localStorage
      const existingUsers = JSON.parse(localStorage.getItem("memorymaster-users") || "[]");
      
      // Check if username already exists
      if (existingUsers.find((user: any) => user.username === username)) {
        return { success: false, error: "Username already exists" };
      }

      // Create new user
      const newUser: User = {
        id: crypto.randomUUID(),
        username: username.trim(),
        createdAt: new Date().toISOString(),
      };

      // Store user credentials (in production, this should be handled by a secure backend)
      const userWithPassword = {
        ...newUser,
        password: password, // In production, this should be hashed
      };

      // Save to users list
      existingUsers.push(userWithPassword);
      localStorage.setItem("memorymaster-users", JSON.stringify(existingUsers));

      // Set as current user
      localStorage.setItem("memorymaster-user", JSON.stringify(newUser));
      setAuthState({
        user: newUser,
        isAuthenticated: true,
        isLoading: false,
      });

      return { success: true };
    } catch (error) {
      console.error("Registration error:", error);
      return { success: false, error: "Registration failed. Please try again." };
    }
  };

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (!username.trim() || !password.trim()) {
      return { success: false, error: "Username and password are required" };
    }

    try {
      // Get existing users from localStorage
      const existingUsers = JSON.parse(localStorage.getItem("memorymaster-users") || "[]");
      
      // Find user with matching credentials
      const foundUser = existingUsers.find(
        (user: any) => user.username === username && user.password === password
      );

      if (!foundUser) {
        return { success: false, error: "Invalid username or password" };
      }

      // Create user object without password
      const user: User = {
        id: foundUser.id,
        username: foundUser.username,
        createdAt: foundUser.createdAt,
      };

      // Set as current user
      localStorage.setItem("memorymaster-user", JSON.stringify(user));
      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });

      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: "Login failed. Please try again." };
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem("memorymaster-user");
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
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
