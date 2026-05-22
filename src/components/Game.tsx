import { useEffect, useState } from "react";
import Layout from "./Layout";
import HeaderBar from "./HeaderBar";
import TopBar from "./TopBar";
import CarReveal from "./CarReveal";
import ScorePanel from "./ScorePanel";
import GuessGrid from "./GuessGrid";
import GuessForm from "./GuessForm";
import ResultModal from "./ResultModal";
import {
  MAX_ATTEMPTS,
  activeRevealIndex,
  createInitialState,
  submitGuess,
  turnsLeft as turnsLeftFn,
} from "../lib/game";
import { bankedDots, finalScore, multiplierFor } from "../lib/scoring";
import { loadGameState, saveGameState } from "../lib/storage";
import type { Guess, Puzzle } from "../types/game";

const STREAK = 3;

export default function Game({ puzzle }: { puzzle: Puzzle }) {
  const [state, setState] = useState(
    () => loadGameState(puzzle.id) ?? createInitialState(puzzle.id),
  );
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    setState(loadGameState(puzzle.id) ?? createInitialState(puzzle.id));
    setModalOpen(false);
  }, [puzzle.id]);

  const done = state.status !== "playing";
  const won = state.status === "won";

  useEffect(() => {
    saveGameState(puzzle.id, state);
  }, [puzzle.id, state]);

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
    <Layout>
      <HeaderBar streak={STREAK} puzzleLabel={puzzle.date} />
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
          />
        </div>
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
