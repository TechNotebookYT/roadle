import { useEffect, useState } from "react";
import { iconBtn, Pill } from "./atoms";

export default function HowToPlay({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(open);
  useEffect(() => {
    if (open) {
      setMounted(true);
      return;
    }
    const t = setTimeout(() => setMounted(false), 400);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!mounted) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
        background: open ? "rgba(15,15,15,.45)" : "transparent",
        transition: "background .3s",
        pointerEvents: open ? "auto" : "none",
        display: "grid",
        placeItems: "center",
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(520px, 100%)",
          maxHeight: "86vh",
          overflowY: "auto",
          background: "var(--surface)",
          border: "1px solid var(--line)",
          borderRadius: 24,
          padding: "22px 24px 24px",
          boxShadow: "var(--shadow-pop)",
          transform: open ? "scale(1)" : "scale(.96)",
          opacity: open ? 1 : 0,
          transition: "transform .35s cubic-bezier(.2,.8,.2,1), opacity .25s",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 14,
          }}
        >
          <Pill tone="accent">How to play</Pill>
          <button onClick={onClose} style={iconBtn} aria-label="Close">
            ✕
          </button>
        </div>

        <h2
          style={{
            margin: 0,
            fontFamily: "var(--display)",
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: "-.035em",
            color: "var(--ink)",
            lineHeight: 1.1,
          }}
        >
          Spot the car in 5 tries.
        </h2>
        <p
          style={{
            margin: "8px 0 18px",
            fontFamily: "var(--ui)",
            fontSize: 14,
            color: "var(--body)",
            letterSpacing: "-.005em",
            lineHeight: 1.45,
          }}
        >
          Guess the make, model, and year of the pictured car. Each round
          starts zoomed in and pulls back as you go.
        </p>

        <Rule
          n={1}
          title="Five attempts, three categories"
          body="You get 5 guesses. Each of make, model, and year is worth one point per correct field."
        />
        <Rule
          n={2}
          title="The picture zooms out"
          body="After every wrong guess, the next reveal pulls back to show a bit more of the car."
        />
        <Rule
          n={3}
          title="Your multiplier shrinks each turn"
          body="Your points are multiplied by the remaining attempts. Nail all three on turn one and you score 5 × 3 = 15. On turn two, it's 4 × 3 = 12, and so on."
        />
        <Rule
          n={4}
          title="Year has a small grace window"
          body="A year guess counts as correct if it's within ±2 of the real year. A 2013 answer accepts 2011 through 2015."
        />

        <button
          onClick={onClose}
          style={{
            marginTop: 18,
            width: "100%",
            padding: "14px 18px",
            borderRadius: 14,
            border: "none",
            cursor: "pointer",
            background:
              "linear-gradient(180deg, color-mix(in srgb, var(--accent) 88%, white 12%) 0%, var(--accent) 100%)",
            color: "#fff",
            fontFamily: "var(--ui)",
            fontSize: 15,
            fontWeight: 600,
            letterSpacing: "-.01em",
            boxShadow:
              "0 1px 0 rgba(255,255,255,.35) inset, 0 -1px 0 rgba(0,0,0,.10) inset, 0 8px 18px -4px color-mix(in srgb, var(--accent) 50%, transparent), 0 2px 4px rgba(0,0,0,.08)",
          }}
        >
          Got it
        </button>
      </div>
    </div>
  );
}

function Rule({
  n,
  title,
  body,
}: {
  n: number;
  title: string;
  body: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        padding: "12px 0",
        borderTop: "1px solid var(--line-soft)",
      }}
    >
      <span
        style={{
          flexShrink: 0,
          display: "inline-grid",
          placeItems: "center",
          width: 26,
          height: 26,
          borderRadius: 8,
          background:
            "linear-gradient(180deg, color-mix(in srgb, var(--accent) 82%, white 18%), var(--accent))",
          color: "#fff",
          fontFamily: "var(--mono)",
          fontSize: 12,
          fontWeight: 700,
        }}
      >
        {n}
      </span>
      <div>
        <div
          style={{
            fontFamily: "var(--ui)",
            fontSize: 14,
            fontWeight: 600,
            color: "var(--ink)",
            letterSpacing: "-.01em",
          }}
        >
          {title}
        </div>
        <div
          style={{
            marginTop: 3,
            fontFamily: "var(--ui)",
            fontSize: 13,
            color: "var(--body)",
            letterSpacing: "-.005em",
            lineHeight: 1.45,
          }}
        >
          {body}
        </div>
      </div>
    </div>
  );
}
