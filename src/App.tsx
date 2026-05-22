import { useEffect, useState } from "react";
import Game from "./components/Game";
import { loadManifest, selectTodaysPuzzle } from "./lib/manifest";
import type { Puzzle } from "./types/game";

function App() {
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadManifest()
      .then((puzzles) => {
        if (cancelled) return;
        const today = selectTodaysPuzzle(puzzles);
        if (!today) {
          setLoadError(true);
          return;
        }
        setPuzzle(today);
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loadError) {
    return <CenteredMessage text="No puzzle available." />;
  }
  if (!puzzle) {
    return <CenteredMessage text="Loading…" />;
  }
  return <Game puzzle={puzzle} />;
}

function CenteredMessage({ text }: { text: string }) {
  return (
    <div
      data-theme="light"
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        color: "var(--muted)",
        display: "grid",
        placeItems: "center",
        fontFamily: "var(--ui)",
        fontSize: 14,
        fontWeight: 500,
        letterSpacing: "-.005em",
      }}
    >
      {text}
    </div>
  );
}

export default App;
