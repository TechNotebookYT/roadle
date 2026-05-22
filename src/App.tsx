import { useCallback, useEffect, useMemo, useState } from "react";
import Game from "./components/Game";
import { loadManifest } from "./lib/manifest";
import { loadModelCatalog, type ModelCatalog } from "./lib/models";
import { loadGameState } from "./lib/storage";
import { finalScore } from "./lib/scoring";
import { initialTheme, persistTheme, type Theme } from "./lib/theme";
import type { Puzzle } from "./types/game";

function computeCompletedIds(puzzles: Puzzle[]): string[] {
  return puzzles
    .filter((p) => {
      const s = loadGameState(p.id);
      return s !== null && s.status !== "playing";
    })
    .map((p) => p.id);
}

function computeTotalPoints(puzzles: Puzzle[]): number {
  let total = 0;
  for (const p of puzzles) {
    const s = loadGameState(p.id);
    if (!s || s.status === "playing") continue;
    total += finalScore(s.guesses, s.status === "won");
  }
  return total;
}

function App() {
  const [puzzles, setPuzzles] = useState<Puzzle[]>([]);
  const [models, setModels] = useState<ModelCatalog>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [completedTick, setCompletedTick] = useState(0);
  const [theme, setTheme] = useState<Theme>(() => initialTheme());

  useEffect(() => {
    persistTheme(theme);
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", theme);
      document.documentElement.style.colorScheme = theme;
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === "light" ? "dark" : "light"));
  }, []);

  useEffect(() => {
    let cancelled = false;
    Promise.all([loadManifest(), loadModelCatalog()])
      .then(([p, m]) => {
        if (cancelled) return;
        if (p.length === 0) {
          setLoadError(true);
          return;
        }
        setPuzzles(p);
        setModels(m);
        const completed = new Set(computeCompletedIds(p));
        const firstUncompleted = p.find((x) => !completed.has(x.id));
        setSelectedId((firstUncompleted ?? p[0]).id);
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const completedIds = useMemo(
    () => computeCompletedIds(puzzles),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [puzzles, completedTick],
  );

  const totalPoints = useMemo(
    () => computeTotalPoints(puzzles),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [puzzles, completedTick],
  );

  const refreshCompleted = useCallback(() => {
    setCompletedTick((n) => n + 1);
  }, []);

  if (loadError)
    return <CenteredMessage text="No puzzles available." theme={theme} />;
  const puzzle = puzzles.find((p) => p.id === selectedId);
  if (!puzzle || !selectedId)
    return <CenteredMessage text="Loading…" theme={theme} />;

  return (
    <Game
      puzzle={puzzle}
      puzzles={puzzles}
      models={models}
      completedIds={completedIds}
      totalPoints={totalPoints}
      onSelectPuzzle={setSelectedId}
      onGameUpdate={refreshCompleted}
      theme={theme}
      onToggleTheme={toggleTheme}
    />
  );
}

function CenteredMessage({ text, theme }: { text: string; theme: Theme }) {
  return (
    <div
      data-theme={theme}
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
