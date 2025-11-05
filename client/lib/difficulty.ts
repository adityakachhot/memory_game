import { GameSettings } from "@/contexts/SettingsContext";

export type ThreeLevel = "easy" | "medium" | "hard";

export function mapSettingsToThreeLevel(
  difficulty: GameSettings["difficulty"],
): { level: ThreeLevel; adaptive: boolean } {
  switch (difficulty) {
    case "easy":
      return { level: "easy", adaptive: false };
    case "normal":
      return { level: "medium", adaptive: false };
    case "hard":
      return { level: "hard", adaptive: false };
    case "adaptive":
    default:
      return { level: "easy", adaptive: true };
  }
}

export function mapSettingsToWordConfig(
  difficulty: GameSettings["difficulty"],
): { min: number; max: number; extraLetters: number; adaptive: boolean } {
  switch (difficulty) {
    case "easy":
      return { min: 3, max: 4, extraLetters: 0, adaptive: false };
    case "normal":
      return { min: 5, max: 6, extraLetters: 2, adaptive: false };
    case "hard":
      return { min: 7, max: 8, extraLetters: 4, adaptive: false };
    case "adaptive":
    default:
      return { min: 3, max: 5, extraLetters: 1, adaptive: true };
  }
}
