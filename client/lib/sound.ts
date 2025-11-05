let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    try {
      ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch {
      ctx = null;
    }
  }
  return ctx;
}

export type SoundName =
  | "flip"
  | "success"
  | "error"
  | "click"
  | "move"
  | "start";

export function playSound(name: SoundName, volume = 0.6, durationMs?: number) {
  const audio = getCtx();
  if (!audio) return;
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.connect(gain);
  gain.connect(audio.destination);

  let freq = 440;
  let dur = durationMs ?? 120;
  switch (name) {
    case "flip":
      freq = 520;
      dur = durationMs ?? 90;
      break;
    case "click":
      freq = 600;
      dur = durationMs ?? 60;
      break;
    case "move":
      freq = 340;
      dur = durationMs ?? 80;
      break;
    case "success":
      freq = 800;
      dur = durationMs ?? 200;
      break;
    case "error":
      freq = 200;
      dur = durationMs ?? 220;
      break;
    case "start":
      freq = 440;
      dur = durationMs ?? 150;
      break;
  }
  osc.type = "sine";
  gain.gain.setValueAtTime(Math.max(0, Math.min(1, volume)), audio.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + dur / 1000);
  osc.frequency.setValueAtTime(freq, audio.currentTime);
  osc.start();
  osc.stop(audio.currentTime + dur / 1000);
}
