import { db } from "@/lib/firebase";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  runTransaction,
  serverTimestamp,
  setDoc,
  increment,
  updateDoc,
} from "firebase/firestore";

export type GameId = "card-flip" | "guess-cup" | "simon-says" | "word-builder" | "picture-puzzle";

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
  const userRef = doc(db, "users", uid);
  try {
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(ref);
      const prev: GameStats = snap.exists()
        ? (snap.data() as any)
        : { gamesPlayed: 0, bestStreak: 0, totalScore: 0 };
      const next: GameStats & { gameId: GameId } = {
        gameId,
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

      // Maintain aggregate totals on users/{uid}
      const userSnap = await tx.get(userRef);
      if (!userSnap.exists()) {
        tx.set(userRef, { totalScore: 0, gamesPlayed: 0 }, { merge: true });
      }
      const userUpdates: Record<string, any> = {};
      if (delta.played) userUpdates.gamesPlayed = increment(1);
      if (typeof delta.addScore === "number")
        userUpdates.totalScore = increment(delta.addScore);
      if (Object.keys(userUpdates).length) {
        tx.update(userRef, userUpdates);
      }
    });
  } catch (e) {
    // Fallback to non-transactional increments (may not update bestStreak accurately without read)
    const updates: Record<string, any> = {
      updatedAt: serverTimestamp(),
      gameId,
    };
    if (delta.played) updates.gamesPlayed = increment(1);
    if (typeof delta.addScore === "number")
      updates.totalScore = increment(delta.addScore);
    await setDoc(
      ref,
      { gameId, gamesPlayed: 0, bestStreak: 0, totalScore: 0 },
      { merge: true },
    );
    if (Object.keys(updates).length > 0) {
      try {
        await updateDoc(ref, updates);
      } catch (_) {
        await setDoc(ref, updates, { merge: true });
      }
    }
    if (typeof delta.streakCandidate === "number") {
      await setDoc(ref, { bestStreak: delta.streakCandidate }, { merge: true });
    }

    // Also update aggregate user totals
    const userUpdates: Record<string, any> = {};
    if (delta.played) userUpdates.gamesPlayed = increment(1);
    if (typeof delta.addScore === "number")
      userUpdates.totalScore = increment(delta.addScore);
    if (Object.keys(userUpdates).length) {
      await setDoc(userRef, { totalScore: 0, gamesPlayed: 0 }, { merge: true });
      try {
        await updateDoc(userRef, userUpdates);
      } catch (_) {
        await setDoc(userRef, userUpdates, { merge: true });
      }
    }
  }
}

export async function logGamePlay(
  uid: string,
  gameId: GameId,
  details: Record<string, any>,
) {
  const col = collection(db, "users", uid, "plays");
  await addDoc(col, {
    gameId,
    createdAt: serverTimestamp(),
    ...details,
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
