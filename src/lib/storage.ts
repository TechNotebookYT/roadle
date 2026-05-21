import type { GameState, GameStatus } from "../types/game";

const KEY_PREFIX = "roadle:game:";

function storageKey(puzzleId: string): string {
  return `${KEY_PREFIX}${puzzleId}`;
}

function hasStorage(): boolean {
  try {
    return (
      typeof window !== "undefined" &&
      typeof window.localStorage !== "undefined"
    );
  } catch {
    return false;
  }
}

export function saveGameState(puzzleId: string, state: GameState): void {
  if (!hasStorage()) return;
  try {
    window.localStorage.setItem(storageKey(puzzleId), JSON.stringify(state));
  } catch {
    // Quota exceeded, private mode, etc. — fail silently.
  }
}

export function loadGameState(puzzleId: string): GameState | null {
  if (!hasStorage()) return null;
  try {
    const raw = window.localStorage.getItem(storageKey(puzzleId));
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isValidGameState(parsed, puzzleId)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearGameState(puzzleId: string): void {
  if (!hasStorage()) return;
  try {
    window.localStorage.removeItem(storageKey(puzzleId));
  } catch {
    // ignore
  }
}

const VALID_STATUSES: GameStatus[] = ["playing", "won", "lost"];

function isValidGameState(v: unknown, puzzleId: string): v is GameState {
  if (!v || typeof v !== "object") return false;
  const s = v as Record<string, unknown>;
  if (s.puzzleId !== puzzleId) return false;
  if (!Array.isArray(s.guesses)) return false;
  if (typeof s.currentAttempt !== "number") return false;
  if (!VALID_STATUSES.includes(s.status as GameStatus)) return false;
  return true;
}
