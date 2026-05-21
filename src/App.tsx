import { useEffect, useState } from "react";
import Layout from "./components/Layout";
import CarReveal from "./components/CarReveal";
import ScorePanel from "./components/ScorePanel";
import GuessGrid from "./components/GuessGrid";
import GuessForm from "./components/GuessForm";
import ResultModal from "./components/ResultModal";
import { fallbackPuzzles } from "./data/fallbackPuzzles";
import {
  MAX_ATTEMPTS,
  activeRevealIndex,
  createInitialState,
  submitGuess,
  turnsLeft as turnsLeftFn,
} from "./lib/game";
import { bankedDots, finalScore, multiplierFor } from "./lib/scoring";
import type { Guess } from "./types/game";

const STREAK = 3;

function App() {
  const puzzle = fallbackPuzzles[0];
  const [state, setState] = useState(() => createInitialState(puzzle.id));
  const [modalOpen, setModalOpen] = useState(false);

  const done = state.status !== "playing";
  const won = state.status === "won";

  useEffect(() => {
    if (done) {
      const t = setTimeout(() => setModalOpen(true), 600);
      return () => clearTimeout(t);
    }
  }, [done]);

  function handleSubmit(g: Guess) {
    setState((prev) => submitGuess(prev, g, puzzle));
  }

  function handlePlayAgain() {
    setModalOpen(false);
    setTimeout(() => setState(createInitialState(puzzle.id)), 300);
  }

  const turnsLeft = turnsLeftFn(state);
  const multiplier = multiplierFor(state.currentAttempt);
  const banked = bankedDots(state.guesses);
  const revealIdx = activeRevealIndex(state, puzzle.reveals.length);
  const score = finalScore(state.guesses, won);

  return (
    <Layout streak={STREAK} puzzleLabel={puzzle.date}>
      <CarReveal puzzle={puzzle} unlockedThrough={revealIdx} />

      <div style={{ marginTop: 24 }}>
        <ScorePanel
          turnsLeft={turnsLeft}
          maxAttempts={MAX_ATTEMPTS}
          multiplier={multiplier}
          banked={banked}
        />
      </div>

      <div style={{ marginTop: 16 }}>
        <GuessGrid guesses={state.guesses} maxAttempts={MAX_ATTEMPTS} />
      </div>

      <div style={{ marginTop: 22 }}>
        <GuessForm
          multiplier={multiplier}
          disabled={done}
          onSubmit={handleSubmit}
        />
      </div>

      <ResultModal
        open={modalOpen}
        won={won}
        puzzle={puzzle}
        guesses={state.guesses}
        score={score}
        streak={STREAK}
        maxAttempts={MAX_ATTEMPTS}
        onClose={() => setModalOpen(false)}
        onPlayAgain={handlePlayAgain}
      />
    </Layout>
  );
}

export default App;
