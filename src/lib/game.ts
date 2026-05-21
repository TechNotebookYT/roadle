import type {
  CarAnswer,
  GameState,
  GameStatus,
  Guess,
  GuessFeedback,
  GuessResult,
  Puzzle,
} from "../types/game";

export const MAX_ATTEMPTS = 5;
export const YEAR_TOLERANCE = 2;

export function normalize(s: string): string {
  return (s || "").trim().toLowerCase().replace(/\s+/g, " ");
}

export function checkMake(
  guess: string,
  answer: string,
): "correct" | "wrong" {
  return normalize(guess) === normalize(answer) ? "correct" : "wrong";
}

export function checkModel(
  guess: string,
  answer: string,
): "correct" | "wrong" {
  return normalize(guess) === normalize(answer) ? "correct" : "wrong";
}

export function checkYear(
  guess: number,
  answer: number,
  tolerance: number = YEAR_TOLERANCE,
): "correct" | "close" | "wrong" {
  if (!Number.isFinite(guess)) return "wrong";
  if (guess === answer) return "correct";
  if (Math.abs(guess - answer) <= tolerance) return "close";
  return "wrong";
}

export function evaluateGuess(guess: Guess, answer: CarAnswer): GuessFeedback {
  return {
    make: checkMake(guess.make, answer.make),
    model: checkModel(guess.model, answer.model),
    year: checkYear(guess.year, answer.year),
  };
}

export function isWin(feedback: GuessFeedback): boolean {
  return (
    feedback.make === "correct" &&
    feedback.model === "correct" &&
    feedback.year === "correct"
  );
}

export function isLoss(
  attemptsUsed: number,
  maxAttempts: number = MAX_ATTEMPTS,
): boolean {
  return attemptsUsed >= maxAttempts;
}

export function createInitialState(puzzleId: string): GameState {
  return {
    puzzleId,
    guesses: [],
    currentAttempt: 0,
    status: "playing",
  };
}

export function submitGuess(
  state: GameState,
  guess: Guess,
  puzzle: Puzzle,
  maxAttempts: number = MAX_ATTEMPTS,
): GameState {
  if (state.status !== "playing") return state;

  const feedback = evaluateGuess(guess, puzzle.answer);
  const result: GuessResult = { guess, feedback };
  const nextGuesses = [...state.guesses, result];
  const nextAttempt = state.currentAttempt + 1;

  let nextStatus: GameStatus = "playing";
  if (isWin(feedback)) nextStatus = "won";
  else if (isLoss(nextAttempt, maxAttempts)) nextStatus = "lost";

  return {
    puzzleId: state.puzzleId,
    guesses: nextGuesses,
    currentAttempt: nextAttempt,
    status: nextStatus,
  };
}

export function activeRevealIndex(
  state: GameState,
  revealsCount: number,
): number {
  if (revealsCount <= 0) return 0;
  return Math.min(state.currentAttempt, revealsCount - 1);
}

export function turnsLeft(
  state: GameState,
  maxAttempts: number = MAX_ATTEMPTS,
): number {
  return Math.max(0, maxAttempts - state.currentAttempt);
}
