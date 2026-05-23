import { useEffect, useRef } from "react";
import type { Puzzle } from "../types/game";
import type { Theme } from "../lib/theme";

const glassChip = {
  background: "var(--glass-bg)",
  backdropFilter: "blur(20px) saturate(180%)",
  WebkitBackdropFilter: "blur(20px) saturate(180%)",
  border: "1px solid var(--glass-border)",
  boxShadow:
    "0 1px 0 rgba(255,255,255,.5) inset, 0 2px 6px rgba(15,23,42,.06)",
} as const;

export default function HeaderBar({
  completed,
  totalPoints,
  puzzles,
  selectedId,
  onSelectPuzzle,
  completedIds,
  pickerOpen,
  onPickerOpen,
  onPickerClose,
  theme,
  onToggleTheme,
}: {
  completed: number;
  totalPoints: number;
  puzzles: Puzzle[];
  selectedId: string;
  onSelectPuzzle: (id: string) => void;
  completedIds: string[];
  pickerOpen: boolean;
  onPickerOpen: () => void;
  onPickerClose: () => void;
  theme: Theme;
  onToggleTheme: () => void;
}) {
  const doneSet = new Set(completedIds);
  const selectedIndex = Math.max(
    0,
    puzzles.findIndex((p) => p.id === selectedId),
  );
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!pickerOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        onPickerClose();
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onPickerClose();
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [pickerOpen, onPickerClose]);

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
      <div ref={wrapRef} style={{ position: "relative" }}>
        <button
          onClick={() => (pickerOpen ? onPickerClose() : onPickerOpen())}
          aria-haspopup="listbox"
          aria-expanded={pickerOpen}
          aria-label="Select puzzle"
          style={{
            ...glassChip,
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            padding: "7px 12px 7px 8px",
            borderRadius: 999,
            cursor: "pointer",
            color: "var(--ink)",
            fontFamily: "var(--ui)",
          }}
        >
          <span
            style={{
              display: "inline-grid",
              placeItems: "center",
              minWidth: 24,
              height: 24,
              padding: "0 7px",
              borderRadius: 999,
              background:
                "linear-gradient(180deg, color-mix(in srgb, var(--accent) 82%, white 18%), var(--accent))",
              color: "#fff",
              fontSize: 11,
              fontWeight: 700,
              fontVariantNumeric: "tabular-nums",
              letterSpacing: ".01em",
            }}
          >
            {selectedIndex + 1}
          </span>
          <span
            className="roadle-picker-name"
            style={{
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: "-.01em",
            }}
          >
            Game {selectedIndex + 1}
          </span>
          <span
            className="roadle-picker-suffix"
            style={{
              fontFamily: "var(--ui)",
              fontSize: 11,
              fontWeight: 600,
              color: "var(--muted)",
              letterSpacing: ".04em",
              textTransform: "uppercase",
            }}
          >
            of {puzzles.length}
          </span>
          <Chevron open={pickerOpen} />
        </button>

        {pickerOpen && (
          <div
            role="listbox"
            style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              left: 0,
              zIndex: 40,
              minWidth: 280,
              padding: 6,
              borderRadius: 18,
              background: "var(--glass-bg-strong)",
              backdropFilter: "blur(28px) saturate(180%)",
              WebkitBackdropFilter: "blur(28px) saturate(180%)",
              border: "1px solid var(--glass-border)",
              boxShadow: "var(--shadow-pop)",
              maxHeight: 360,
              overflowY: "auto",
              animation:
                "roadle-pop-in .18s cubic-bezier(.2,.8,.2,1) both",
            }}
          >
            {puzzles.map((p, i) => {
              const selected = p.id === selectedId;
              const done = doneSet.has(p.id);
              return (
                <button
                  key={p.id}
                  role="option"
                  aria-selected={selected}
                  onClick={() => onSelectPuzzle(p.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                    gap: 12,
                    padding: "10px 12px",
                    borderRadius: 12,
                    border: "none",
                    cursor: "pointer",
                    background: selected
                      ? "color-mix(in srgb, var(--accent) 16%, transparent)"
                      : "transparent",
                    color: "var(--ink)",
                    textAlign: "left",
                    transition: "background .15s",
                  }}
                  onMouseEnter={(e) => {
                    if (!selected)
                      e.currentTarget.style.background = "var(--hover)";
                  }}
                  onMouseLeave={(e) => {
                    if (!selected)
                      e.currentTarget.style.background = "transparent";
                  }}
                >
                  <span
                    style={{
                      display: "inline-grid",
                      placeItems: "center",
                      minWidth: 26,
                      height: 26,
                      padding: "0 7px",
                      borderRadius: 8,
                      background: selected
                        ? "linear-gradient(180deg, color-mix(in srgb, var(--accent) 82%, white 18%), var(--accent))"
                        : "var(--chip)",
                      color: selected ? "#fff" : "var(--ink)",
                      fontFamily: "var(--mono)",
                      fontSize: 11,
                      fontWeight: 700,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {i + 1}
                  </span>
                  <span
                    style={{
                      flex: 1,
                      fontFamily: "var(--ui)",
                      fontSize: 14,
                      fontWeight: 600,
                      letterSpacing: "-.01em",
                    }}
                  >
                    Game {i + 1}
                  </span>
                  {done && (
                    <span
                      style={{
                        display: "inline-grid",
                        placeItems: "center",
                        width: 18,
                        height: 18,
                        borderRadius: 999,
                        background:
                          "linear-gradient(180deg, #34C759, #28A745)",
                        color: "#fff",
                        fontSize: 10,
                        fontWeight: 800,
                      }}
                      aria-label="Completed"
                    >
                      ✓
                    </span>
                  )}
                  {selected && !done && (
                    <span
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: 999,
                        background: "var(--accent)",
                      }}
                      aria-label="Selected"
                    />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <StatChip
          icon={
            <span
              style={{
                display: "inline-grid",
                placeItems: "center",
                width: 18,
                height: 18,
                borderRadius: 5,
                background: "linear-gradient(180deg, #FF9F0A, #FF6B00)",
                color: "#fff",
                fontSize: 11,
                fontWeight: 800,
              }}
            >
              ★
            </span>
          }
          value={totalPoints}
          label="pts"
        />
        <StatChip
          icon={
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
                fontWeight: 800,
              }}
            >
              ✓
            </span>
          }
          value={completed}
          label="done"
        />
        <button
          onClick={onToggleTheme}
          style={{
            ...glassChip,
            width: 38,
            height: 38,
            borderRadius: 999,
            cursor: "pointer",
            color: "var(--ink)",
            display: "grid",
            placeItems: "center",
            fontSize: 16,
            padding: 0,
          }}
          aria-label={
            theme === "light" ? "Switch to dark mode" : "Switch to light mode"
          }
          title={theme === "light" ? "Dark mode" : "Light mode"}
        >
          {theme === "light" ? "☾" : "☀"}
        </button>
      </div>
    </div>
  );
}

function StatChip({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
}) {
  return (
    <div
      style={{
        ...glassChip,
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        padding: "7px 12px",
        borderRadius: 999,
      }}
    >
      {icon}
      <span
        style={{
          fontFamily: "var(--ui)",
          fontSize: 13,
          fontWeight: 600,
          color: "var(--ink)",
          letterSpacing: "-.01em",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value}
      </span>
      <span
        className="roadle-chip-label"
        style={{
          fontFamily: "var(--ui)",
          fontSize: 11,
          fontWeight: 600,
          color: "var(--muted)",
          letterSpacing: ".04em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </span>
    </div>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      style={{
        transition: "transform .2s",
        transform: open ? "rotate(180deg)" : "rotate(0deg)",
      }}
      aria-hidden
    >
      <path
        d="M2 4l3 3 3-3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity=".6"
      />
    </svg>
  );
}
