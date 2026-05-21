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
          fontSize: 28,
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
  return (
    <div
      style={{
        padding: "18px 4px",
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
