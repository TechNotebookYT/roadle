import { iconBtn } from "./atoms";

export default function HeaderBar({
  streak,
  puzzleLabel,
}: {
  streak: number;
  puzzleLabel: string;
}) {
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
        Today · {puzzleLabel}
      </span>
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
              background: "linear-gradient(180deg, #FF9F0A, #FF6B00)",
              fontSize: 10,
            }}
          >
            🔥
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
            {streak}
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
