import type { Puzzle } from "../types/game";
import { fallbackPuzzles } from "../data/fallbackPuzzles";

const DEFAULT_MANIFEST_URL =
  "https://raw.githubusercontent.com/TechNotebookYT/roadle_gamefiles/refs/heads/main/puzzles.json";

export function manifestUrl(): string {
  const base = import.meta.env.VITE_MANIFEST_URL ?? DEFAULT_MANIFEST_URL;
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}t=${Date.now()}`;
}

export async function loadManifest(): Promise<Puzzle[]> {
  try {
    const res = await fetch(manifestUrl(), { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: unknown = await res.json();
    const valid = validateManifest(data);
    if (valid.length === 0) throw new Error("Manifest has no valid puzzles");
    return valid;
  } catch {
    return fallbackPuzzles;
  }
}

export function validateManifest(v: unknown): Puzzle[] {
  if (!Array.isArray(v)) return [];
  return v.filter(isValidPuzzle);
}

function isValidPuzzle(v: unknown): v is Puzzle {
  if (!v || typeof v !== "object") return false;
  const p = v as Record<string, unknown>;
  if (typeof p.id !== "string" || p.id.length === 0) return false;
  if (typeof p.date !== "string" || p.date.length === 0) return false;
  if (!p.answer || typeof p.answer !== "object") return false;
  const a = p.answer as Record<string, unknown>;
  if (typeof a.make !== "string" || a.make.length === 0) return false;
  if (typeof a.model !== "string" || a.model.length === 0) return false;
  if (typeof a.year !== "number" || !Number.isFinite(a.year)) return false;
  if (
    !Array.isArray(p.reveals) ||
    p.reveals.length === 0 ||
    !p.reveals.every((r) => typeof r === "string")
  ) {
    return false;
  }
  if (typeof p.fullImage !== "string" || p.fullImage.length === 0) return false;
  return true;
}

export function todayISO(now: Date = new Date()): string {
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function selectTodaysPuzzle(
  puzzles: Puzzle[],
  today: string = todayISO(),
): Puzzle | null {
  if (puzzles.length === 0) return null;

  const exact = puzzles.find((p) => p.date === today);
  if (exact) return exact;

  const sorted = [...puzzles].sort((a, b) => a.date.localeCompare(b.date));
  const past = sorted.filter((p) => p.date <= today);
  if (past.length > 0) return past[past.length - 1];

  return sorted[0];
}
