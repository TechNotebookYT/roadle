import type { ReactNode } from "react";
import type { Theme } from "../lib/theme";

function Footer({ onHowToPlay }: { onHowToPlay: () => void }) {
  return (
    <div
      style={{
        marginTop: 50,
        paddingTop: 20,
        borderTop: "1px solid var(--line-soft)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontFamily: "var(--ui)",
        fontSize: 12,
        fontWeight: 500,
        color: "var(--muted)",
        letterSpacing: "-.005em",
      }}
    >
      <span>Roadle · 2026</span>
      <button
        onClick={onHowToPlay}
        style={{
          background: "transparent",
          border: "none",
          padding: 0,
          cursor: "pointer",
          fontFamily: "var(--ui)",
          fontSize: 12,
          fontWeight: 600,
          color: "var(--muted)",
          letterSpacing: "-.005em",
          textDecoration: "underline",
          textDecorationColor: "var(--line)",
          textUnderlineOffset: 3,
        }}
      >
        How to play
      </button>
    </div>
  );
}

export default function Layout({
  children,
  theme,
  onHowToPlay,
}: {
  children: ReactNode;
  theme: Theme;
  onHowToPlay: () => void;
}) {
  return (
    <div
      data-theme={theme}
      style={{
        minHeight: "100vh",
        color: "var(--ink)",
        fontFamily: "var(--ui)",
      }}
    >
      <div className="roadle-shell">
        {children}
        <Footer onHowToPlay={onHowToPlay} />
      </div>
    </div>
  );
}
