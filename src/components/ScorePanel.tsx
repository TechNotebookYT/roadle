import { useMediaQuery } from "../lib/useMediaQuery";

function ScoreCell({
  kicker,
  value,
  divider,
}: {
  kicker: string;
  value: string;
  divider?: boolean;
}) {
  return (
    <div
      style={{
        padding: "4px 18px",
        borderLeft: divider ? "1px solid var(--line)" : "none",
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
          fontSize: 26,
          fontWeight: 600,
          letterSpacing: "-.03em",
          marginTop: 4,
          color: "var(--ink)",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function MobileScoreBar({
  turnsLeft,
  maxAttempts,
  multiplier,
  banked,
}: {
  turnsLeft: number;
  maxAttempts: number;
  multiplier: number;
  banked: number;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 10px",
        borderRadius: 14,
        background: "var(--surface)",
        border: "1px solid var(--line)",
        boxShadow: "var(--shadow-slab)",
        flexWrap: "wrap",
      }}
    >
      <InlineStat label="Turns" value={`${turnsLeft}/${maxAttempts}`} />
      <span
        style={{
          width: 1,
          alignSelf: "stretch",
          background: "var(--line)",
        }}
      />
      <InlineStat label="Mult" value={`×${multiplier}`} />
      <span
        style={{
          width: 1,
          alignSelf: "stretch",
          background: "var(--line)",
        }}
      />
      <InlineStat label="Banked" value={`+${banked}`} />
    </div>
  );
}

function InlineStat({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "baseline",
        gap: 6,
        padding: "2px 6px",
      }}
    >
      <span
        style={{
          fontFamily: "var(--ui)",
          fontSize: 11,
          fontWeight: 600,
          color: "var(--muted)",
          letterSpacing: ".04em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: "var(--display)",
          fontSize: 16,
          fontWeight: 700,
          letterSpacing: "-.02em",
          color: "var(--ink)",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value}
      </span>
    </div>
  );
}

export default function ScorePanel({
  turnsLeft,
  maxAttempts,
  multiplier,
  banked,
}: {
  turnsLeft: number;
  maxAttempts: number;
  multiplier: number;
  banked: number;
}) {
  const isMobile = useMediaQuery("(max-width: 880px)");

  if (isMobile) {
    return (
      <MobileScoreBar
        turnsLeft={turnsLeft}
        maxAttempts={maxAttempts}
        multiplier={multiplier}
        banked={banked}
      />
    );
  }

  return (
    <div
      style={{
        padding: "16px 4px",
        borderRadius: 20,
        background: "var(--surface)",
        border: "1px solid var(--line)",
        boxShadow: "var(--shadow-slab)",
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gap: 0,
      }}
    >
      <ScoreCell kicker="Turns left" value={`${turnsLeft}/${maxAttempts}`} />
      <ScoreCell kicker="Multiplier" value={`×${multiplier}`} divider />
      <ScoreCell kicker="Banked" value={`+${banked}`} divider />
    </div>
  );
}
