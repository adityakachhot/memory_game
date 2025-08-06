import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Volume2, VolumeX, Palette, Gamepad2, Zap, Save, RotateCcw, Sun, Moon, Monitor } from "lucide-react";
import Layout from "@/components/Layout";
import { Badge } from "@/components/ui/badge";
import { useSettings } from "@/contexts/SettingsContext";
import { useState } from "react";

export default function Settings() {
  const { settings, updateSettings, resetSettings } = useSettings();
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);

  const handleSave = () => {
    setShowSaveConfirmation(true);
    setTimeout(() => setShowSaveConfirmation(false), 2000);
  };

  const handleReset = () => {
    resetSettings();
    setShowSaveConfirmation(true);
    setTimeout(() => setShowSaveConfirmation(false), 2000);
  };

  const getThemeIcon = () => {
    switch (settings.theme) {
      case 'light':
        return <Sun className="h-5 w-5 text-primary" />;
      case 'dark':
        return <Moon className="h-5 w-5 text-primary" />;
      case 'auto':
        return <Monitor className="h-5 w-5 text-primary" />;
      default:
        return <Palette className="h-5 w-5 text-primary" />;
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Game Settings</h1>
          <p className="text-muted-foreground">Customize your gaming experience</p>
          {showSaveConfirmation && (
            <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-3 text-green-400 text-sm animate-fade-in-up">
              ✅ Settings saved successfully!
            </div>
          )}
        </div>

        {/* Audio Settings */}
        <Card className="bg-card/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              {settings.soundEnabled ? (
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
                checked={settings.soundEnabled}
                onCheckedChange={(checked) => updateSettings({ soundEnabled: checked })}
              />
            </div>
            
            {settings.soundEnabled && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="volume">Volume</Label>
                  <Badge variant="secondary">{settings.soundVolume}%</Badge>
                </div>
                <Slider
                  id="volume"
                  min={0}
                  max={100}
                  step={10}
                  value={[settings.soundVolume]}
                  onValueChange={(value) => updateSettings({ soundVolume: value[0] })}
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
              {getThemeIcon()}
              <CardTitle>Visual Settings</CardTitle>
            </div>
            <CardDescription>Customize the look and feel of the games</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="theme">Theme</Label>
              <Select value={settings.theme} onValueChange={(value: 'light' | 'dark' | 'auto') => updateSettings({ theme: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dark">
                    <div className="flex items-center gap-2">
                      <Moon className="h-4 w-4" />
                      Dark Mode
                    </div>
                  </SelectItem>
                  <SelectItem value="light">
                    <div className="flex items-center gap-2">
                      <Sun className="h-4 w-4" />
                      Light Mode
                    </div>
                  </SelectItem>
                  <SelectItem value="auto">
                    <div className="flex items-center gap-2">
                      <Monitor className="h-4 w-4" />
                      Auto (System)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                {settings.theme === 'auto' 
                  ? 'Follows your system preference'
                  : `Currently using ${settings.theme} mode`
                }
              </p>
            </div>

            <div className="space-y-3">
              <Label htmlFor="animation-speed">Animation Speed</Label>
              <Select 
                value={settings.animationSpeed} 
                onValueChange={(value: 'slow' | 'normal' | 'fast' | 'none') => updateSettings({ animationSpeed: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select speed" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="slow">Slow (2x duration)</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="fast">Fast (0.5x duration)</SelectItem>
                  <SelectItem value="none">No Animations</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                {settings.animationSpeed === 'none' 
                  ? 'All animations are disabled'
                  : `Animations play at ${settings.animationSpeed} speed`
                }
              </p>
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
              <Select 
                value={settings.difficulty} 
                onValueChange={(value: 'easy' | 'normal' | 'hard' | 'adaptive') => updateSettings({ difficulty: value })}
              >
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
              {settings.difficulty === "adaptive" && (
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
                checked={settings.showHints}
                onCheckedChange={(checked) => updateSettings({ showHints: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="auto-save" className="text-base">Auto-save Progress</Label>
                <p className="text-sm text-muted-foreground">Automatically save your game progress</p>
              </div>
              <Switch
                id="auto-save"
                checked={settings.autoSave}
                onCheckedChange={(checked) => updateSettings({ autoSave: checked })}
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
                checked={settings.hapticFeedback}
                onCheckedChange={(checked) => updateSettings({ hapticFeedback: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Current Settings Summary */}
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle>Current Settings</CardTitle>
            <CardDescription>Overview of your current configuration</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Theme:</span>
                  <span className="font-medium capitalize">{settings.theme}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Animations:</span>
                  <span className="font-medium capitalize">{settings.animationSpeed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sound:</span>
                  <span className="font-medium">{settings.soundEnabled ? `${settings.soundVolume}%` : 'Off'}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Difficulty:</span>
                  <span className="font-medium capitalize">{settings.difficulty}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Auto-save:</span>
                  <span className="font-medium">{settings.autoSave ? 'On' : 'Off'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Hints:</span>
                  <span className="font-medium">{settings.showHints ? 'On' : 'Off'}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 pt-6">
          <Button onClick={handleSave} className="gap-2 px-8">
            <Save className="h-4 w-4" />
            Save Settings
          </Button>
          <Button onClick={handleReset} variant="outline" className="gap-2 px-8">
            <RotateCcw className="h-4 w-4" />
            Reset to Defaults
          </Button>
        </div>
      </div>
    </Layout>
  );
}
