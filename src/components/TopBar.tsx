export default function TopBar() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
        padding: "0 4px 8px",
      }}
    >
      <h1
        style={{
          margin: 0,
          fontFamily: "var(--display)",
          fontSize: "clamp(44px, 5.6vw, 64px)",
          fontWeight: 700,
          letterSpacing: "-.045em",
          color: "var(--ink)",
          lineHeight: 1,
        }}
      >
        Roadle
      </h1>
      <p
        style={{
          margin: 0,
          fontFamily: "var(--ui)",
          fontSize: 17,
          fontWeight: 400,
          color: "var(--body)",
          letterSpacing: "-.01em",
        }}
      >
        A daily car puzzle.
      </p>
    </div>
  );
}
