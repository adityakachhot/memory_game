import React, { createContext, useContext, useEffect, useState } from "react";

export interface GameSettings {
  theme: "light" | "dark" | "auto";
  animationSpeed: "slow" | "normal" | "fast" | "none";
  soundEnabled: boolean;
  soundVolume: number;
  difficulty: "easy" | "normal" | "hard" | "adaptive";
  autoSave: boolean;
  hapticFeedback: boolean;
  showHints: boolean;
}

const defaultSettings: GameSettings = {
  theme: "light",
  animationSpeed: "normal",
  soundEnabled: true,
  soundVolume: 70,
  difficulty: "adaptive",
  autoSave: true,
  hapticFeedback: true,
  showHints: false,
};

interface SettingsContextType {
  settings: GameSettings;
  updateSettings: (newSettings: Partial<GameSettings>) => void;
  resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined,
);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [settings, setSettings] = useState<GameSettings>(defaultSettings);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem("memorymaster-settings");
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsedSettings });
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  }, []);

  // Apply theme changes
  useEffect(() => {
    const applyTheme = () => {
      const root = document.documentElement;

      if (settings.theme === "auto") {
        const systemPrefersDark = window.matchMedia(
          "(prefers-color-scheme: dark)",
        ).matches;
        root.classList.toggle("dark", systemPrefersDark);
      } else {
        root.classList.toggle("dark", settings.theme === "dark");
      }
    };

    applyTheme();

    // Listen for system theme changes if auto mode is selected
    if (settings.theme === "auto") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      mediaQuery.addEventListener("change", applyTheme);
      return () => mediaQuery.removeEventListener("change", applyTheme);
    }
  }, [settings.theme]);

  // Apply animation speed
  useEffect(() => {
    const root = document.documentElement;

    // Remove existing animation speed classes
    root.classList.remove("animation-slow", "animation-fast", "animation-none");

    // Add new animation speed class
    if (settings.animationSpeed !== "normal") {
      root.classList.add(`animation-${settings.animationSpeed}`);
    }

    // Update CSS custom properties for animation duration
    const speedMultipliers = {
      slow: 2,
      normal: 1,
      fast: 0.5,
      none: 0,
    };

    root.style.setProperty(
      "--animation-speed-multiplier",
      speedMultipliers[settings.animationSpeed].toString(),
    );
  }, [settings.animationSpeed]);

  const updateSettings = (newSettings: Partial<GameSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);

    // Save to localStorage
    try {
      localStorage.setItem(
        "memorymaster-settings",
        JSON.stringify(updatedSettings),
      );
    } catch (error) {
      console.error("Error saving settings:", error);
    }
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    try {
      localStorage.removeItem("memorymaster-settings");
    } catch (error) {
      console.error("Error resetting settings:", error);
    }
  };

  return (
    <SettingsContext.Provider
      value={{ settings, updateSettings, resetSettings }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
