import { iconBtn } from "./atoms";
import type { Puzzle } from "../types/game";

export default function HeaderBar({
  completed,
  puzzles,
  selectedId,
  onSelectPuzzle,
  completedIds,
}: {
  completed: number;
  puzzles: Puzzle[];
  selectedId: string;
  onSelectPuzzle: (id: string) => void;
  completedIds: string[];
}) {
  const doneSet = new Set(completedIds);
  return (
    <div
      className="roadle-header"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        padding: "4px 4px 16px",
      }}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "5px 6px 5px 14px",
          borderRadius: 999,
          background: "var(--glass-bg)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          border: "1px solid var(--glass-border)",
          boxShadow:
            "0 1px 0 rgba(255,255,255,.5) inset, 0 2px 6px rgba(15,23,42,.06)",
        }}
      >
        <span
          style={{
            fontFamily: "var(--ui)",
            fontSize: 12,
            fontWeight: 600,
            color: "var(--muted)",
            letterSpacing: ".06em",
            textTransform: "uppercase",
          }}
        >
          Game
        </span>
        <select
          value={selectedId}
          onChange={(e) => onSelectPuzzle(e.target.value)}
          style={{
            appearance: "none",
            WebkitAppearance: "none",
            MozAppearance: "none",
            border: "none",
            background: "transparent",
            color: "var(--ink)",
            fontFamily: "var(--ui)",
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: "-.01em",
            padding: "4px 26px 4px 10px",
            borderRadius: 999,
            cursor: "pointer",
            backgroundImage:
              "linear-gradient(45deg, transparent 50%, var(--muted) 50%), linear-gradient(135deg, var(--muted) 50%, transparent 50%)",
            backgroundPosition:
              "calc(100% - 14px) 50%, calc(100% - 9px) 50%",
            backgroundSize: "5px 5px, 5px 5px",
            backgroundRepeat: "no-repeat",
          }}
          aria-label="Select puzzle"
        >
          {puzzles.map((p, i) => (
            <option key={p.id} value={p.id}>
              Game {i + 1}
              {doneSet.has(p.id) ? " · ✓" : ""}
            </option>
          ))}
        </select>
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            padding: "7px 12px",
            borderRadius: 999,
            background: "var(--glass-bg)",
            backdropFilter: "blur(20px) saturate(180%)",
            WebkitBackdropFilter: "blur(20px) saturate(180%)",
            border: "1px solid var(--glass-border)",
            boxShadow:
              "0 1px 0 rgba(255,255,255,.5) inset, 0 2px 6px rgba(15,23,42,.06)",
          }}
        >
          <span
            style={{
              display: "inline-grid",
              placeItems: "center",
              width: 18,
              height: 18,
              borderRadius: 5,
              background: "linear-gradient(180deg, #34C759, #28A745)",
              color: "#fff",
              fontSize: 11,
              fontWeight: 700,
            }}
          >
            ✓
          </span>
          <span
            style={{
              fontFamily: "var(--ui)",
              fontSize: 13,
              fontWeight: 600,
              color: "var(--ink)",
              letterSpacing: "-.01em",
            }}
          >
            {completed}
          </span>
          <span
            style={{
              fontFamily: "var(--ui)",
              fontSize: 11,
              fontWeight: 600,
              color: "var(--muted)",
              letterSpacing: ".04em",
              textTransform: "uppercase",
            }}
          >
            done
          </span>
        </div>
        <button
          style={{
            ...iconBtn,
            background: "var(--glass-bg)",
            backdropFilter: "blur(20px) saturate(180%)",
            WebkitBackdropFilter: "blur(20px) saturate(180%)",
            border: "1px solid var(--glass-border)",
            boxShadow:
              "0 1px 0 rgba(255,255,255,.5) inset, 0 2px 6px rgba(15,23,42,.06)",
          }}
          aria-label="Toggle theme"
        >
          ◐
        </button>
      </div>
    </div>
  );
}
