import { useEffect, useRef, useState } from "react";
import Layout from "./Layout";
import HeaderBar from "./HeaderBar";
import TopBar from "./TopBar";
import CarReveal from "./CarReveal";
import ScorePanel from "./ScorePanel";
import GuessGrid from "./GuessGrid";
import GuessForm from "./GuessForm";
import ResultModal from "./ResultModal";
import HowToPlay from "./HowToPlay";
import WinFX from "./WinFX";
import {
  MAX_ATTEMPTS,
  activeRevealIndex,
  createInitialState,
  submitGuess,
  turnsLeft as turnsLeftFn,
} from "../lib/game";
import { bankedDots, finalScore, multiplierFor } from "../lib/scoring";
import { loadGameState, saveGameState } from "../lib/storage";
import type { ModelCatalog } from "../lib/models";
import type { Theme } from "../lib/theme";
import type { Guess, Puzzle } from "../types/game";

export default function Game({
  puzzle,
  puzzles,
  models,
  completedIds,
  totalPoints,
  onSelectPuzzle,
  onGameUpdate,
  theme,
  onToggleTheme,
}: {
  puzzle: Puzzle;
  puzzles: Puzzle[];
  models: ModelCatalog;
  completedIds: string[];
  totalPoints: number;
  onSelectPuzzle: (id: string) => void;
  onGameUpdate: () => void;
  theme: Theme;
  onToggleTheme: () => void;
}) {
  const [state, setState] = useState(
    () => loadGameState(puzzle.id) ?? createInitialState(puzzle.id),
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [howToOpen, setHowToOpen] = useState(false);
  const [winTrigger, setWinTrigger] = useState(0);
  const [perfectWin, setPerfectWin] = useState(false);
  const prevStatusRef = useRef(state.status);

  useEffect(() => {
    setState(loadGameState(puzzle.id) ?? createInitialState(puzzle.id));
    setModalOpen(false);
    prevStatusRef.current = "playing";
  }, [puzzle.id]);

  const done = state.status !== "playing";
  const won = state.status === "won";

  useEffect(() => {
    saveGameState(puzzle.id, state);
    onGameUpdate();
  }, [puzzle.id, state, onGameUpdate]);

  useEffect(() => {
    const prev = prevStatusRef.current;
    prevStatusRef.current = state.status;
    if (prev === "playing" && state.status === "won") {
      setPerfectWin(state.guesses.length === 1);
      setWinTrigger((n) => n + 1);
    }
  }, [state.status, state.guesses.length]);

  useEffect(() => {
    if (done) {
      const delay = won && state.guesses.length === 1 ? 2400 : 1200;
      const t = setTimeout(() => setModalOpen(true), delay);
      return () => clearTimeout(t);
    }
  }, [done, won, state.guesses.length]);

  function handleSubmit(g: Guess) {
    setState((prev) => submitGuess(prev, g, puzzle));
  }

  function handlePlayAnother() {
    setModalOpen(false);
    setTimeout(() => setPickerOpen(true), 320);
  }

  function handleSelectPuzzle(id: string) {
    setPickerOpen(false);
    onSelectPuzzle(id);
  }

  const turnsLeft = turnsLeftFn(state);
  const multiplier = multiplierFor(state.currentAttempt);
  const banked = bankedDots(state.guesses);
  const revealIdx = activeRevealIndex(state, puzzle.reveals.length);
  const score = finalScore(state.guesses, won);

  const locked = state.guesses.reduce(
    (acc, g) => ({
      make: acc.make || (g.feedback.make === "correct" ? g.guess.make : ""),
      model:
        acc.model || (g.feedback.model === "correct" ? g.guess.model : ""),
      year:
        acc.year ||
        (g.feedback.year === "correct" ? String(g.guess.year) : ""),
    }),
    { make: "", model: "", year: "" },
  );

  return (
    <Layout theme={theme} onHowToPlay={() => setHowToOpen(true)}>
      <HeaderBar
        completed={completedIds.length}
        totalPoints={totalPoints}
        puzzles={puzzles}
        selectedId={puzzle.id}
        onSelectPuzzle={handleSelectPuzzle}
        completedIds={completedIds}
        pickerOpen={pickerOpen}
        onPickerOpen={() => setPickerOpen(true)}
        onPickerClose={() => setPickerOpen(false)}
        theme={theme}
        onToggleTheme={onToggleTheme}
      />
      <div className="roadle-grid">
        <div className="roadle-left">
          <TopBar />
          <CarReveal puzzle={puzzle} unlockedThrough={revealIdx} />
          <ScorePanel
            turnsLeft={turnsLeft}
            maxAttempts={MAX_ATTEMPTS}
            multiplier={multiplier}
            banked={banked}
          />
        </div>

        <div className="roadle-right">
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              padding: "4px 4px 0",
            }}
          >
            <h2
              style={{
                margin: 0,
                fontFamily: "var(--display)",
                fontSize: 20,
                fontWeight: 700,
                letterSpacing: "-.025em",
                color: "var(--ink)",
              }}
            >
              Your guesses
            </h2>
            <span
              style={{
                fontFamily: "var(--mono)",
                fontSize: 11,
                fontWeight: 500,
                color: "var(--muted)",
                letterSpacing: ".08em",
                textTransform: "uppercase",
              }}
            >
              {state.guesses.length}/{MAX_ATTEMPTS}
            </span>
          </div>

          <GuessGrid guesses={state.guesses} maxAttempts={MAX_ATTEMPTS} />

          <GuessForm
            multiplier={multiplier}
            disabled={done}
            onSubmit={handleSubmit}
            locked={locked}
            models={models}
          />
        </div>
      </div>

      <ResultModal
        open={modalOpen}
        won={won}
        puzzle={puzzle}
        guesses={state.guesses}
        score={score}
        streak={completedIds.length}
        maxAttempts={MAX_ATTEMPTS}
        onClose={() => setModalOpen(false)}
        onPlayAnother={handlePlayAnother}
      />

      <HowToPlay open={howToOpen} onClose={() => setHowToOpen(false)} />

      <WinFX trigger={winTrigger} perfect={perfectWin} />
    </Layout>
  );
}
