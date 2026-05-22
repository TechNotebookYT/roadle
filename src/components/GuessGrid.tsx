import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Dot } from "./atoms";
import type { DotState } from "./atoms";
import type { GuessResult } from "../types/game";

function feedbackToDot(state: "correct" | "close" | "wrong"): DotState {
  return state;
}

function Cell({
  result,
  field,
}: {
  result: GuessResult | undefined;
  field: "make" | "model" | "year";
}) {
  if (!result) return <Dot state="empty" />;
  const fb = result.feedback[field];
  const state = feedbackToDot(fb);
  const label =
    field === "year"
      ? String(result.guess.year || "—")
      : result.guess[field] || "—";
  const isWrong = state === "wrong";

  return (
    <div
      style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}
    >
      <Dot state={state} />
      <span
        style={{
          fontSize: 15,
          color: "var(--ink)",
          fontFamily: "var(--ui)",
          fontWeight: 500,
          letterSpacing: "-.01em",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          textDecoration: isWrong ? "line-through" : "none",
          textDecorationColor: "var(--bad)",
          opacity: isWrong ? 0.55 : 1,
        }}
      >
        {label}
      </span>
    </div>
  );
}

const CELL_STAGGER_MS = 160;

export default function GuessGrid({
  guesses,
  maxAttempts,
}: {
  guesses: GuessResult[];
  maxAttempts: number;
}) {
  const rows = Array.from({ length: maxAttempts }, (_, i) => guesses[i]);
  const [animatingRow, setAnimatingRow] = useState<number | null>(null);
  const prevCount = useRef(guesses.length);

  useLayoutEffect(() => {
    if (guesses.length > prevCount.current) {
      setAnimatingRow(guesses.length - 1);
    }
    prevCount.current = guesses.length;
  }, [guesses.length]);

  useEffect(() => {
    if (animatingRow === null) return;
    const t = setTimeout(
      () => setAnimatingRow(null),
      700 + CELL_STAGGER_MS * 3,
    );
    return () => clearTimeout(t);
  }, [animatingRow]);

  return (
    <div
      style={{
        borderRadius: 20,
        background: "var(--surface)",
        border: "1px solid var(--line)",
        boxShadow: "var(--shadow-slab)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "38px 1fr 1fr 1fr",
          gap: 14,
          padding: "14px 18px 10px",
          borderBottom: "1px solid var(--line-soft)",
        }}
      >
        <span />
        {["Make", "Model", "Year"].map((h) => (
          <span
            key={h}
            style={{
              fontFamily: "var(--ui)",
              fontSize: 12,
              fontWeight: 600,
              color: "var(--muted)",
              letterSpacing: "-.005em",
            }}
          >
            {h}
          </span>
        ))}
      </div>
      {rows.map((g, i) => {
        const animateThisRow = animatingRow === i;
        return (
          <div
            key={i}
            style={{
              display: "grid",
              gridTemplateColumns: "38px 1fr 1fr 1fr",
              gap: 14,
              alignItems: "center",
              padding: "14px 18px",
              borderTop: i === 0 ? "none" : "1px solid var(--line-soft)",
              opacity: g ? 1 : 0.55,
            }}
          >
            <AnimCell animate={animateThisRow} delayMs={0}>
              <span
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: 12,
                  fontWeight: 500,
                  color: "var(--muted)",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
            </AnimCell>
            <AnimCell animate={animateThisRow} delayMs={CELL_STAGGER_MS * 1}>
              <Cell result={g} field="make" />
            </AnimCell>
            <AnimCell animate={animateThisRow} delayMs={CELL_STAGGER_MS * 2}>
              <Cell result={g} field="model" />
            </AnimCell>
            <AnimCell animate={animateThisRow} delayMs={CELL_STAGGER_MS * 3}>
              <Cell result={g} field="year" />
            </AnimCell>
          </div>
        );
      })}
    </div>
  );
}

function AnimCell({
  animate,
  delayMs,
  children,
}: {
  animate: boolean;
  delayMs: number;
  children: React.ReactNode;
}) {
  return (
    <div
      className={animate ? "roadle-cell-anim" : undefined}
      style={{
        minWidth: 0,
        animationDelay: animate ? `${delayMs}ms` : undefined,
      }}
    >
      {children}
    </div>
  );
}
