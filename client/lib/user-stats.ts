import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  getDocs,
  runTransaction,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

export type GameId = "card-flip" | "guess-cup" | "simon-says" | "word-builder";

export interface GameStats {
  gamesPlayed: number;
  bestStreak: number;
  totalScore: number;
  updatedAt?: any;
}

export async function updateGameStats(
  uid: string,
  gameId: GameId,
  delta: { addScore?: number; played?: boolean; streakCandidate?: number },
) {
  const ref = doc(db, "users", uid, "stats", gameId);
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    const prev: GameStats = snap.exists()
      ? (snap.data() as any)
      : { gamesPlayed: 0, bestStreak: 0, totalScore: 0 };
    const next: GameStats = {
      gamesPlayed: prev.gamesPlayed + (delta.played ? 1 : 0),
      bestStreak: Math.max(prev.bestStreak || 0, delta.streakCandidate || 0),
      totalScore: prev.totalScore + (delta.addScore || 0),
      updatedAt: serverTimestamp(),
    };
    if (!snap.exists()) {
      tx.set(ref, next, { merge: true });
    } else {
      tx.update(ref, next);
    }
  });
}

export async function getUserTotals(uid: string) {
  const statsCol = collection(db, "users", uid, "stats");
  const snaps = await getDocs(statsCol);
  let gamesPlayed = 0;
  let totalScore = 0;
  let bestStreak = 0;
  snaps.forEach((d) => {
    const s = d.data() as any;
    gamesPlayed += s.gamesPlayed || 0;
    totalScore += s.totalScore || 0;
    bestStreak = Math.max(bestStreak, s.bestStreak || 0);
  });
  return { gamesPlayed, totalScore, bestStreak };
}
