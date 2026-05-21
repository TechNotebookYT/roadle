import type { CSSProperties, ReactNode } from "react";

export type DotState = "empty" | "correct" | "close" | "wrong";

const CLOSE_COLOR = "#FF9F0A";

export function Dot({ state }: { state: DotState }) {
  const base: CSSProperties = {
    width: 18,
    height: 18,
    borderRadius: 999,
    display: "inline-block",
    transition:
      "transform .25s cubic-bezier(.2,.8,.2,1), background .25s, border-color .25s",
  };
  if (state === "empty") {
    return (
      <span
        style={{
          ...base,
          border: "1.5px solid var(--line)",
          background: "transparent",
        }}
      />
    );
  }
  const fill =
    state === "correct"
      ? "var(--ok)"
      : state === "close"
        ? CLOSE_COLOR
        : "var(--bad)";
  return (
    <span
      style={{ ...base, background: fill, boxShadow: `0 0 0 4px ${fill}22` }}
    />
  );
}

type PillTone = "neutral" | "accent" | "ghost";

export function Pill({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: PillTone;
}) {
  const tones: Record<PillTone, { bg: string; fg: string; border?: string }> = {
    neutral: { bg: "var(--chip)", fg: "var(--ink)" },
    accent: { bg: "var(--accent)", fg: "var(--accent-ink)" },
    ghost: {
      bg: "transparent",
      fg: "var(--muted)",
      border: "1px solid var(--line)",
    },
  };
  const t = tones[tone];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "5px 11px",
        borderRadius: 999,
        background: t.bg,
        color: t.fg,
        border: t.border || "none",
        fontFamily: "var(--ui)",
        fontSize: 12,
        letterSpacing: "-.005em",
        fontWeight: 500,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

export function FieldShell({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "16px 18px",
        border: "1px solid var(--line)",
        borderRadius: 14,
        background: "var(--surface)",
        boxShadow: "var(--inset)",
        transition: "border-color .2s, box-shadow .2s",
      }}
    >
      <span
        style={{
          fontFamily: "var(--ui)",
          fontSize: 13,
          fontWeight: 600,
          color: "var(--muted)",
          letterSpacing: "-.005em",
          minWidth: 48,
        }}
      >
        {label}
      </span>
      {children}
    </label>
  );
}

export const inputStyle: CSSProperties = {
  flex: 1,
  background: "transparent",
  border: "none",
  outline: "none",
  fontFamily: "var(--ui)",
  fontSize: 16,
  fontWeight: 500,
  color: "var(--ink)",
  padding: 0,
  letterSpacing: "-.01em",
};

export const iconBtn: CSSProperties = {
  width: 38,
  height: 38,
  borderRadius: 999,
  border: "1px solid var(--line)",
  background: "var(--surface)",
  color: "var(--ink)",
  cursor: "pointer",
  fontSize: 14,
  display: "grid",
  placeItems: "center",
};

export const primaryBtn: CSSProperties = {
  padding: "15px 22px",
  borderRadius: 14,
  border: "none",
  cursor: "pointer",
  background: "linear-gradient(180deg, #3D94FF 0%, #007AFF 100%)",
  color: "#FFFFFF",
  fontFamily: "var(--ui)",
  fontSize: 16,
  fontWeight: 600,
  letterSpacing: "-.01em",
  boxShadow:
    "0 1px 0 rgba(255,255,255,.35) inset, 0 -1px 0 rgba(0,0,0,.10) inset, 0 6px 14px -4px rgba(0,122,255,.45), 0 2px 4px rgba(0,0,0,.08)",
};

export const ghostBtn: CSSProperties = {
  padding: "15px 22px",
  borderRadius: 14,
  border: "1px solid var(--line)",
  background: "var(--surface)",
  color: "var(--ink)",
  cursor: "pointer",
  fontFamily: "var(--ui)",
  fontSize: 16,
  fontWeight: 600,
  letterSpacing: "-.01em",
  boxShadow: "var(--shadow-slab)",
};
