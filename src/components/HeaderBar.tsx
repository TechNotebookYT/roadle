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
        <a
          href="https://github.com/TechNotebookYT/roadle"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            ...glassChip,
            width: 38,
            height: 38,
            borderRadius: 999,
            color: "var(--ink)",
            display: "grid",
            placeItems: "center",
            textDecoration: "none",
            padding: 0,
          }}
          aria-label="View source on GitHub"
          title="GitHub"
        >
          <GitHubMark />
        </a>
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

function GitHubMark() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55v-1.93c-3.2.69-3.87-1.54-3.87-1.54-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.36.95.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.47.11-3.06 0 0 .97-.31 3.18 1.19a11 11 0 0 1 5.79 0c2.2-1.5 3.17-1.19 3.17-1.19.63 1.59.23 2.77.12 3.06.74.81 1.18 1.84 1.18 3.1 0 4.42-2.7 5.39-5.27 5.68.41.36.78 1.06.78 2.14v3.18c0 .31.21.67.8.55C20.21 21.38 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5Z" />
    </svg>
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
