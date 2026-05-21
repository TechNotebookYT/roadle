import type { ReactNode } from "react";
import { iconBtn } from "./atoms";

function TopBar({
  streak,
  puzzleLabel,
}: {
  streak: number;
  puzzleLabel: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 6,
        padding: "28px 4px 24px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontFamily: "var(--ui)",
            fontSize: 13,
            fontWeight: 500,
            color: "var(--muted)",
            letterSpacing: "-.005em",
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
            aria-label="Profile"
          >
            ◐
          </button>
        </div>
      </div>
      <h1
        style={{
          margin: 0,
          fontFamily: "var(--display)",
          fontSize: 38,
          fontWeight: 700,
          letterSpacing: "-.035em",
          color: "var(--ink)",
          lineHeight: 1.05,
        }}
      >
        Roadle
      </h1>
      <p
        style={{
          margin: 0,
          fontFamily: "var(--ui)",
          fontSize: 16,
          fontWeight: 400,
          color: "var(--body)",
          letterSpacing: "-.01em",
        }}
      >
        A daily car puzzle.
      </p>
    </div>
  );
}

function Footer() {
  return (
    <div
      style={{
        marginTop: 50,
        paddingTop: 20,
        borderTop: "1px solid var(--line-soft)",
        display: "flex",
        justifyContent: "space-between",
        fontFamily: "var(--ui)",
        fontSize: 12,
        fontWeight: 500,
        color: "var(--muted)",
        letterSpacing: "-.005em",
      }}
    >
      <span>Roadle · 2026</span>
      <span>How to play</span>
    </div>
  );
}

export default function Layout({
  streak,
  puzzleLabel,
  children,
}: {
  streak: number;
  puzzleLabel: string;
  children: ReactNode;
}) {
  return (
    <div
      data-theme="light"
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        color: "var(--ink)",
        fontFamily: "var(--ui)",
      }}
    >
      <div
        style={{
          maxWidth: 560,
          margin: "0 auto",
          padding: "12px 22px 80px",
        }}
      >
        <TopBar streak={streak} puzzleLabel={puzzleLabel} />
        {children}
        <Footer />
      </div>
    </div>
  );
}
