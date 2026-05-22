import type { ReactNode } from "react";

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

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div
      data-theme="light"
      style={{
        minHeight: "100vh",
        color: "var(--ink)",
        fontFamily: "var(--ui)",
      }}
    >
      <div className="roadle-shell">
        {children}
        <Footer />
      </div>
    </div>
  );
}
