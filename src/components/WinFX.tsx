import { useEffect, useMemo, useState } from "react";

type Particle = {
  id: number;
  x: number;
  size: number;
  color: string;
  shape: "rect" | "circle";
  fallDuration: number;
  fallDelay: number;
  spinDuration: number;
  drift: number;
};

const NORMAL_PALETTE = [
  "#34C759",
  "#007AFF",
  "#FF9F0A",
  "#BF5AF2",
  "#FFFFFF",
];

const PERFECT_PALETTE = [
  "#0A0A0A",
  "#FFFFFF",
  "#FF3B30",
  "#FFD60A",
  "#C0C0C0",
];

function buildParticles(count: number, palette: string[]): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    size: 6 + Math.random() * 8,
    color: palette[Math.floor(Math.random() * palette.length)],
    shape: Math.random() < 0.55 ? "rect" : "circle",
    fallDuration: 2400 + Math.random() * 1800,
    fallDelay: Math.random() * 350,
    spinDuration: 900 + Math.random() * 1400,
    drift: (Math.random() - 0.5) * 120,
  }));
}

const PERFECT_DURATION = 3400;
const NORMAL_DURATION = 4200;

export default function WinFX({
  trigger,
  perfect,
}: {
  trigger: number;
  perfect: boolean;
}) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (trigger === 0) return;
    setActive(true);
    const t = setTimeout(
      () => setActive(false),
      perfect ? PERFECT_DURATION : NORMAL_DURATION,
    );
    return () => clearTimeout(t);
  }, [trigger, perfect]);

  const particles = useMemo(() => {
    if (!active) return [];
    const count = perfect ? 80 : 70;
    const palette = perfect ? PERFECT_PALETTE : NORMAL_PALETTE;
    return buildParticles(count, palette);
  }, [active, perfect]);

  if (!active) return null;

  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 80,
        overflow: "hidden",
      }}
    >
      {perfect && <CheckeredFlag />}
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            top: -30,
            left: `${p.x}%`,
            width: p.size,
            height: p.shape === "rect" ? p.size * 1.4 : p.size,
            animation: `roadle-confetti-fall ${p.fallDuration}ms cubic-bezier(.35,.4,.6,1) ${p.fallDelay}ms both`,
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              background: p.color,
              borderRadius: p.shape === "circle" ? "50%" : 2,
              transform: `translateX(${p.drift}px)`,
              animation: `roadle-confetti-spin ${p.spinDuration}ms linear ${p.fallDelay}ms infinite`,
              boxShadow: "0 1px 2px rgba(0,0,0,.2)",
            }}
          />
        </div>
      ))}
    </div>
  );
}

function CheckeredFlag() {
  const cols = 9;
  const rows = 6;
  const flagW = 280;
  const flagH = 168;
  const cw = flagW / cols;
  const ch = flagH / rows;
  const poleH = flagH + 80;

  return (
    <div
      style={{
        position: "absolute",
        top: "16%",
        left: "50%",
        transform: "translate(-50%, 0)",
        animation:
          "roadle-flag-enter .55s cubic-bezier(.2,.8,.2,1) both, roadle-flag-exit .6s ease-in 2.5s both",
        filter: "drop-shadow(0 18px 28px rgba(0,0,0,.45))",
      }}
    >
      <svg
        width={flagW + 22}
        height={poleH + 10}
        viewBox={`0 0 ${flagW + 22} ${poleH + 10}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Pole */}
        <defs>
          <linearGradient id="poleGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#3a3a3a" />
            <stop offset="50%" stopColor="#9a9a9a" />
            <stop offset="100%" stopColor="#3a3a3a" />
          </linearGradient>
          <radialGradient id="finialGrad" cx="35%" cy="30%" r="60%">
            <stop offset="0%" stopColor="#FFD86B" />
            <stop offset="60%" stopColor="#C99000" />
            <stop offset="100%" stopColor="#6b4900" />
          </radialGradient>
        </defs>
        <rect
          x={4}
          y={10}
          width={7}
          height={poleH}
          fill="url(#poleGrad)"
          rx={2}
        />
        <circle cx={7.5} cy={9} r={7} fill="url(#finialGrad)" />

        {/* Waving flag — each column oscillates with a staggered delay */}
        <g transform={`translate(11, 8)`}>
          {Array.from({ length: cols }).map((_, c) => (
            <g
              key={c}
              style={{
                animation: `roadle-flag-wave 1.6s ease-in-out infinite`,
                animationDelay: `${-c * 0.14}s`,
                transformBox: "fill-box",
                transformOrigin: "left center",
              }}
            >
              {Array.from({ length: rows }).map((_, r) => (
                <rect
                  key={r}
                  x={c * cw}
                  y={r * ch}
                  width={cw + 0.6}
                  height={ch + 0.6}
                  fill={(r + c) % 2 === 0 ? "#0A0A0A" : "#FAFAFA"}
                />
              ))}
            </g>
          ))}
          {/* Subtle shading overlay for depth */}
          <rect
            x={0}
            y={0}
            width={flagW}
            height={flagH}
            fill="url(#flagShade)"
            pointerEvents="none"
          />
        </g>

        <defs>
          <linearGradient id="flagShade" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(0,0,0,.25)" />
            <stop offset="30%" stopColor="rgba(0,0,0,0)" />
            <stop offset="70%" stopColor="rgba(0,0,0,0)" />
            <stop offset="100%" stopColor="rgba(0,0,0,.15)" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
