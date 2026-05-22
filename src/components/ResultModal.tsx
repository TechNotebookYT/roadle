import { useEffect, useState } from "react";
import { Pill, iconBtn, primaryBtn, ghostBtn } from "./atoms";
import CarReveal from "./CarReveal";
import GuessGrid from "./GuessGrid";
import type { GuessResult, Puzzle } from "../types/game";

function StatBlock({ kicker, value }: { kicker: string; value: string }) {
  return (
    <div
      style={{
        border: "1px solid var(--line)",
        borderRadius: 14,
        padding: "10px 12px",
        background: "var(--surface)",
        boxShadow: "var(--shadow-slab)",
      }}
    >
      <div
        style={{
          fontFamily: "var(--ui)",
          fontSize: 12,
          fontWeight: 600,
          color: "var(--muted)",
          letterSpacing: "-.005em",
        }}
      >
        {kicker}
      </div>
      <div
        style={{
          fontFamily: "var(--display)",
          fontSize: 20,
          fontWeight: 600,
          letterSpacing: "-.03em",
          marginTop: 2,
          color: "var(--ink)",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value}
      </div>
    </div>
  );
}

export default function ResultModal({
  open,
  onClose,
  won,
  puzzle,
  guesses,
  score,
  streak,
  maxAttempts,
  onPlayAnother,
}: {
  open: boolean;
  onClose: () => void;
  won: boolean;
  puzzle: Puzzle;
  guesses: GuessResult[];
  score: number;
  streak: number;
  maxAttempts: number;
  onPlayAnother: () => void;
}) {
  const [mounted, setMounted] = useState(open);
  useEffect(() => {
    if (open) {
      setMounted(true);
      return;
    }
    const t = setTimeout(() => setMounted(false), 500);
    return () => clearTimeout(t);
  }, [open]);
  if (!mounted) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        pointerEvents: open ? "auto" : "none",
        background: open ? "rgba(15,15,15,.45)" : "transparent",
        transition: "background .35s",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="roadle-no-scrollbar"
        style={{
          width: "min(560px, 100%)",
          background: "var(--surface)",
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          padding: "16px 22px 22px",
          transform: open ? "translateY(0)" : "translateY(110%)",
          transition: "transform .45s cubic-bezier(.2,.8,.2,1)",
          boxShadow: "var(--shadow-pop)",
          maxHeight: "92vh",
          overflowY: "auto",
          border: "1px solid var(--line)",
        }}
      >
        <div
          style={{
            width: 44,
            height: 5,
            background: "var(--line)",
            borderRadius: 3,
            margin: "0 auto 12px",
          }}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <Pill tone={won ? "accent" : "neutral"}>
            {won ? "Solved" : "Out of turns"}
          </Pill>
          <button onClick={onClose} style={iconBtn} aria-label="Close">
            ✕
          </button>
        </div>

        <div
          style={{
            fontFamily: "var(--display)",
            fontSize: 28,
            lineHeight: 1.1,
            letterSpacing: "-.03em",
            color: "var(--ink)",
            fontWeight: 700,
          }}
        >
          <span style={{ color: "var(--muted)", fontWeight: 500 }}>
            It was the{" "}
          </span>
          {puzzle.answer.year} {puzzle.answer.make} {puzzle.answer.model}.
        </div>

        <div style={{ marginTop: 12 }}>
          <CarReveal
            puzzle={puzzle}
            unlockedThrough={puzzle.reveals.length - 1}
            showFull
          />
        </div>

        <div
          style={{
            marginTop: 14,
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 8,
          }}
        >
          <StatBlock kicker="Points" value={`+${score}`} />
          <StatBlock kicker="Total done" value={`${streak}`} />
          <StatBlock
            kicker="Turns used"
            value={`${guesses.length}/${maxAttempts}`}
          />
        </div>

        <div style={{ marginTop: 14 }}>
          <div
            style={{
              fontFamily: "var(--ui)",
              fontSize: 12,
              fontWeight: 500,
              color: "var(--muted)",
              letterSpacing: "-.005em",
              marginBottom: 6,
            }}
          >
            Your guesses
          </div>
          <GuessGrid
            guesses={guesses}
            maxAttempts={Math.max(guesses.length, 1)}
          />
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          <button
            style={{ ...primaryBtn, flex: 1 }}
            onClick={onPlayAnother}
          >
            Play another
          </button>
          <button style={ghostBtn} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
