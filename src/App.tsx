import { useCallback, useEffect, useMemo, useState } from "react";
import Game from "./components/Game";
import { loadManifest } from "./lib/manifest";
import { loadModelCatalog, type ModelCatalog } from "./lib/models";
import { loadGameState } from "./lib/storage";
import type { Puzzle } from "./types/game";

function computeCompletedIds(puzzles: Puzzle[]): string[] {
  return puzzles
    .filter((p) => {
      const s = loadGameState(p.id);
      return s !== null && s.status !== "playing";
    })
    .map((p) => p.id);
}

function App() {
  const [puzzles, setPuzzles] = useState<Puzzle[]>([]);
  const [models, setModels] = useState<ModelCatalog>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [completedTick, setCompletedTick] = useState(0);

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
    // completedTick is a manual refresh trigger from Game state changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [puzzles, completedTick],
  );

  const refreshCompleted = useCallback(() => {
    setCompletedTick((n) => n + 1);
  }, []);

  if (loadError) return <CenteredMessage text="No puzzles available." />;
  const puzzle = puzzles.find((p) => p.id === selectedId);
  if (!puzzle || !selectedId) return <CenteredMessage text="Loading…" />;

  return (
    <Game
      puzzle={puzzle}
      puzzles={puzzles}
      models={models}
      completedIds={completedIds}
      onSelectPuzzle={setSelectedId}
      onGameUpdate={refreshCompleted}
    />
  );
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
