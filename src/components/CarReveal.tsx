import { useEffect, useState } from "react";
import type { Puzzle } from "../types/game";

function RevealImage({
  src,
  alt,
  index,
}: {
  src: string;
  alt: string;
  index: number;
}) {
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    setErrored(false);
  }, [src]);

  const placeholder = (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "repeating-linear-gradient(135deg, var(--placeholder-a) 0 14px, var(--placeholder-b) 14px 28px)",
      }}
    />
  );

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: "4 / 3",
        borderRadius: 22,
        overflow: "hidden",
        border: "1px solid var(--line)",
        boxShadow: "var(--shadow-slab)",
        background: "var(--surface)",
      }}
    >
      {placeholder}
      {!errored && (
        <img
          src={src}
          alt={alt}
          onError={() => setErrored(true)}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      )}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 18,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 8,
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              padding: "7px 13px",
              borderRadius: 999,
              background: "var(--glass-bg-strong)",
              backdropFilter: "blur(24px) saturate(180%)",
              WebkitBackdropFilter: "blur(24px) saturate(180%)",
              border: "1px solid var(--glass-border)",
              boxShadow:
                "0 1px 0 rgba(255,255,255,.6) inset, 0 2px 6px rgba(15,23,42,.08)",
              fontFamily: "var(--ui)",
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: "-.01em",
              color: "var(--ink)",
            }}
          >
            <span
              style={{
                display: "inline-grid",
                placeItems: "center",
                width: 18,
                height: 18,
                borderRadius: 5,
                background:
                  "linear-gradient(180deg, color-mix(in srgb, var(--accent) 80%, white 20%), var(--accent))",
                color: "#fff",
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              {index + 1}
            </span>
            Reveal {index + 1}
          </span>
        </div>
        {errored && (
          <div
            style={{
              display: "inline-flex",
              alignSelf: "flex-start",
              background: "var(--glass-bg-strong)",
              backdropFilter: "blur(24px) saturate(180%)",
              WebkitBackdropFilter: "blur(24px) saturate(180%)",
              color: "var(--body)",
              border: "1px solid var(--glass-border)",
              boxShadow:
                "0 1px 0 rgba(255,255,255,.6) inset, 0 2px 6px rgba(15,23,42,.08)",
              fontFamily: "var(--mono)",
              fontSize: 11,
              fontWeight: 500,
              padding: "7px 12px",
              borderRadius: 10,
              maxWidth: "82%",
            }}
          >
            placeholder · {src}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CarReveal({
  puzzle,
  unlockedThrough,
  showFull = false,
}: {
  puzzle: Puzzle;
  unlockedThrough: number;
  showFull?: boolean;
}) {
  const [view, setView] = useState(unlockedThrough);

  useEffect(() => {
    setView(unlockedThrough);
  }, [unlockedThrough]);

  if (showFull) {
    return (
      <RevealImage
        src={puzzle.fullImage}
        alt={`Full image of ${puzzle.answer.year} ${puzzle.answer.make} ${puzzle.answer.model}`}
        index={puzzle.reveals.length - 1}
      />
    );
  }

  const safeIndex = Math.min(
    Math.max(view, 0),
    Math.max(0, puzzle.reveals.length - 1),
  );

  return (
    <div style={{ position: "relative" }}>
      <RevealImage
        src={puzzle.reveals[safeIndex]}
        alt={`Reveal ${safeIndex + 1}`}
        index={safeIndex}
      />
      <div
        style={{
          display: "flex",
          gap: 6,
          marginTop: 16,
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            position: "relative",
            display: "inline-flex",
            padding: 4,
            borderRadius: 999,
            background: "var(--glass-bg)",
            backdropFilter: "blur(30px) saturate(180%)",
            WebkitBackdropFilter: "blur(30px) saturate(180%)",
            border: "1px solid var(--glass-border)",
            boxShadow:
              "0 1px 0 rgba(255,255,255,.6) inset, 0 8px 24px -8px rgba(15,23,42,.18), 0 1px 2px rgba(15,23,42,.06)",
          }}
        >
          {puzzle.reveals.map((_, i) => {
            const unlocked = i <= unlockedThrough;
            const active = i === safeIndex;
            return (
              <button
                key={i}
                onClick={() => unlocked && setView(i)}
                disabled={!unlocked}
                style={{
                  padding: "7px 14px",
                  borderRadius: 999,
                  border: "none",
                  background: active
                    ? "linear-gradient(180deg, rgba(255,255,255,.98) 0%, rgba(255,255,255,.82) 100%)"
                    : "transparent",
                  color: active ? "var(--ink)" : "var(--muted)",
                  fontFamily: "var(--ui)",
                  fontSize: 13,
                  fontWeight: 600,
                  letterSpacing: "-.01em",
                  whiteSpace: "nowrap",
                  cursor: unlocked ? "pointer" : "not-allowed",
                  opacity: unlocked ? 1 : 0.4,
                  boxShadow: active
                    ? "0 1px 0 rgba(255,255,255,.9) inset, 0 -1px 0 rgba(0,0,0,.04) inset, 0 4px 12px -2px rgba(15,23,42,.18), 0 1px 2px rgba(15,23,42,.08)"
                    : "none",
                  transition:
                    "background .25s, color .25s, box-shadow .25s, transform .15s",
                  fontVariantNumeric: "tabular-nums",
                }}
                aria-label={`Reveal ${i + 1}${unlocked ? "" : " (locked)"}`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
        <div
          style={{
            fontFamily: "var(--mono)",
            fontSize: 11,
            fontWeight: 500,
            color: "var(--muted)",
            letterSpacing: ".08em",
            textTransform: "uppercase",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {puzzle.date}
        </div>
      </div>
    </div>
  );
}
