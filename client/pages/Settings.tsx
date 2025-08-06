import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Volume2, VolumeX, Palette, Gamepad2, Zap, Save } from "lucide-react";
import Layout from "@/components/Layout";
import { Badge } from "@/components/ui/badge";

export default function Settings() {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [soundVolume, setSoundVolume] = useState([70]);
  const [animationSpeed, setAnimationSpeed] = useState(["normal"]);
  const [difficulty, setDifficulty] = useState("adaptive");
  const [theme, setTheme] = useState("dark");
  const [autoSave, setAutoSave] = useState(true);
  const [hapticFeedback, setHapticFeedback] = useState(true);
  const [showHints, setShowHints] = useState(false);

  const handleSave = () => {
    // In a real app, save to localStorage or send to server
    console.log("Settings saved:", {
      soundEnabled,
      soundVolume: soundVolume[0],
      animationSpeed: animationSpeed[0],
      difficulty,
      theme,
      autoSave,
      hapticFeedback,
      showHints
    });
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Game Settings</h1>
          <p className="text-muted-foreground">Customize your gaming experience</p>
        </div>

        {/* Audio Settings */}
        <Card className="bg-card/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              {soundEnabled ? (
                <Volume2 className="h-5 w-5 text-primary" />
              ) : (
                <VolumeX className="h-5 w-5 text-muted-foreground" />
              )}
              <CardTitle>Audio Settings</CardTitle>
            </div>
            <CardDescription>Control sound effects and audio preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="sound-enabled" className="text-base">Enable Sound Effects</Label>
              <Switch
                id="sound-enabled"
                checked={soundEnabled}
                onCheckedChange={setSoundEnabled}
              />
            </div>
            
            {soundEnabled && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="volume">Volume</Label>
                  <Badge variant="secondary">{soundVolume[0]}%</Badge>
                </div>
                <Slider
                  id="volume"
                  min={0}
                  max={100}
                  step={10}
                  value={soundVolume}
                  onValueChange={setSoundVolume}
                  className="flex-1"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Visual Settings */}
        <Card className="bg-card/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-primary" />
              <CardTitle>Visual Settings</CardTitle>
            </div>
            <CardDescription>Customize the look and feel of the games</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="theme">Theme</Label>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger>
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dark">Dark Mode</SelectItem>
                  <SelectItem value="light">Light Mode</SelectItem>
                  <SelectItem value="auto">Auto (System)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label htmlFor="animation-speed">Animation Speed</Label>
              <Select value={animationSpeed[0]} onValueChange={(value) => setAnimationSpeed([value])}>
                <SelectTrigger>
                  <SelectValue placeholder="Select speed" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="slow">Slow</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="fast">Fast</SelectItem>
                  <SelectItem value="none">No Animations</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Gameplay Settings */}
        <Card className="bg-card/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Gamepad2 className="h-5 w-5 text-primary" />
              <CardTitle>Gameplay Settings</CardTitle>
            </div>
            <CardDescription>Adjust game mechanics and difficulty</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="difficulty">Default Difficulty</Label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                  <SelectItem value="adaptive">Adaptive (Recommended)</SelectItem>
                </SelectContent>
              </Select>
              {difficulty === "adaptive" && (
                <p className="text-sm text-muted-foreground">
                  Difficulty automatically adjusts based on your performance
                </p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="show-hints" className="text-base">Show Hints</Label>
                <p className="text-sm text-muted-foreground">Display helpful tips during games</p>
              </div>
              <Switch
                id="show-hints"
                checked={showHints}
                onCheckedChange={setShowHints}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="auto-save" className="text-base">Auto-save Progress</Label>
                <p className="text-sm text-muted-foreground">Automatically save your game progress</p>
              </div>
              <Switch
                id="auto-save"
                checked={autoSave}
                onCheckedChange={setAutoSave}
              />
            </div>
          </CardContent>
        </Card>

        {/* Device Settings */}
        <Card className="bg-card/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <CardTitle>Device Settings</CardTitle>
            </div>
            <CardDescription>Control device-specific features</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="haptic-feedback" className="text-base">Haptic Feedback</Label>
                <p className="text-sm text-muted-foreground">Enable vibration on mobile devices</p>
              </div>
              <Switch
                id="haptic-feedback"
                checked={hapticFeedback}
                onCheckedChange={setHapticFeedback}
              />
            </div>
          </CardContent>
        </Card>

        {/* Game Statistics */}
        <Card className="bg-card/50">
          <CardHeader>
            <CardTitle>Game Statistics</CardTitle>
            <CardDescription>Your overall performance across all games</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-primary">147</p>
                <p className="text-sm text-muted-foreground">Games Played</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">73%</p>
                <p className="text-sm text-muted-foreground">Win Rate</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">12</p>
                <p className="text-sm text-muted-foreground">Best Streak</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">8,420</p>
                <p className="text-sm text-muted-foreground">Total Points</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-center pt-6">
          <Button onClick={handleSave} className="gap-2 px-8">
            <Save className="h-4 w-4" />
            Save Settings
          </Button>
        </div>
      </div>
    </Layout>
  );
}
