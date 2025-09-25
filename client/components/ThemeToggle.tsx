import { Button } from "@/components/ui/button";
import { useSettings } from "@/contexts/SettingsContext";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const { settings, updateSettings } = useSettings();
  const isDark = settings.theme === "dark";

  const toggle = () => {
    updateSettings({ theme: isDark ? "light" : "dark" });
  };

  return (
    <Button variant="outline" size="sm" onClick={toggle} aria-label="Toggle theme" className="gap-2">
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      {isDark ? "Light" : "Dark"}
    </Button>
  );
}
