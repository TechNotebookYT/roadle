import { useEffect, useRef, useState } from "react";
import type { Puzzle } from "../types/game";

const FADE_MS = 600;

function RevealImage({ src, alt }: { src: string; alt: string }) {
  const [errored, setErrored] = useState(false);
  const [layers, setLayers] = useState<{ src: string; key: number }[]>([
    { src, key: 0 },
  ]);
  const keyRef = useRef(0);

  useEffect(() => {
    setErrored(false);
  }, [src]);

  useEffect(() => {
    setLayers((prev) => {
      const top = prev[prev.length - 1];
      if (top && top.src === src) return prev;
      keyRef.current += 1;
      const next = [...prev, { src, key: keyRef.current }];
      return next.slice(-2);
    });
  }, [src]);

  useEffect(() => {
    if (layers.length < 2) return;
    const t = setTimeout(() => {
      setLayers((prev) => prev.slice(-1));
    }, FADE_MS + 40);
    return () => clearTimeout(t);
  }, [layers]);

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
      {!errored &&
        layers.map((layer, i) => {
          const isTop = i === layers.length - 1;
          return (
            <img
              key={layer.key}
              src={layer.src}
              alt={isTop ? alt : ""}
              onError={() => {
                if (isTop) setErrored(true);
              }}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                animation: isTop
                  ? `roadle-img-in ${FADE_MS}ms ease both`
                  : `roadle-img-out ${FADE_MS}ms ease both`,
              }}
            />
          );
        })}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: 18,
          pointerEvents: "none",
        }}
      >
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
            padding: 3,
            borderRadius: 999,
            background: "var(--chip)",
            border: "1px solid var(--line)",
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
                  padding: "6px 14px",
                  borderRadius: 999,
                  border: "none",
                  background: active ? "var(--surface)" : "transparent",
                  color: active
                    ? "var(--ink)"
                    : unlocked
                      ? "var(--body)"
                      : "var(--muted)",
                  fontFamily: "var(--ui)",
                  fontSize: 13,
                  fontWeight: 600,
                  letterSpacing: "-.01em",
                  whiteSpace: "nowrap",
                  cursor: unlocked ? "pointer" : "not-allowed",
                  opacity: unlocked ? 1 : 0.45,
                  boxShadow: active
                    ? "0 1px 2px rgba(0,0,0,.12), 0 0 0 1px var(--line)"
                    : "none",
                  transition:
                    "background .2s, color .2s, box-shadow .2s",
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
