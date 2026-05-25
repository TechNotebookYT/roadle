import type { ReactNode } from "react";
import type { Theme } from "../lib/theme";

function FooterGitHubMark() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55v-1.93c-3.2.69-3.87-1.54-3.87-1.54-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.36.95.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.47.11-3.06 0 0 .97-.31 3.18 1.19a11 11 0 0 1 5.79 0c2.2-1.5 3.17-1.19 3.17-1.19.63 1.59.23 2.77.12 3.06.74.81 1.18 1.84 1.18 3.1 0 4.42-2.7 5.39-5.27 5.68.41.36.78 1.06.78 2.14v3.18c0 .31.21.67.8.55C20.21 21.38 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  );
}

function Footer({ onHowToPlay }: { onHowToPlay: () => void }) {
  const year = new Date().getFullYear();
  const linkBase = {
    background: "transparent",
    border: "none",
    padding: 0,
    cursor: "pointer",
    fontFamily: "var(--ui)",
    fontSize: 12,
    fontWeight: 600,
    color: "var(--muted)",
    letterSpacing: "-.005em",
    textDecoration: "none",
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
  } as const;
  return (
    <div
      style={{
        marginTop: 50,
        paddingTop: 20,
        borderTop: "1px solid var(--line-soft)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 14,
        flexWrap: "wrap",
        fontFamily: "var(--ui)",
        fontSize: 12,
        fontWeight: 500,
        color: "var(--muted)",
        letterSpacing: "-.005em",
      }}
    >
      <span>
        Roadle ·{" "}
        <a
          href="https://www.pranavbala.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: "inherit",
            textDecoration: "underline",
            textDecorationColor: "var(--line)",
            textUnderlineOffset: 3,
          }}
        >
          © Pranav Bala
        </a>{" "}
        {year}
      </span>
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 18,
          flexWrap: "wrap",
        }}
      >
        <a
          href="https://www.pranavbala.com/projects/roadle"
          target="_blank"
          rel="noopener noreferrer"
          style={linkBase}
        >
          Project overview
        </a>
        <button onClick={onHowToPlay} style={linkBase}>
          How to play
        </button>
        <a
          href="https://github.com/TechNotebookYT/roadle"
          target="_blank"
          rel="noopener noreferrer"
          style={linkBase}
          aria-label="View source on GitHub"
        >
          <FooterGitHubMark />
          GitHub
        </a>
      </div>
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
