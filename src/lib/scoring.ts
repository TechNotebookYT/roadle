import type { GuessFeedback, GuessResult } from "../types/game";
import { MAX_ATTEMPTS } from "./game";

export function dotsFor(feedback: GuessFeedback): number {
  let n = 0;
  if (feedback.make === "correct") n++;
  if (feedback.model === "correct") n++;
  if (feedback.year === "correct") n++;
  return n;
}

export function multiplierFor(
  attemptsUsed: number,
  maxAttempts: number = MAX_ATTEMPTS,
): number {
  return Math.max(0, maxAttempts - attemptsUsed);
}

export function bankedDots(guesses: GuessResult[]): number {
  return guesses.reduce((sum, g) => sum + dotsFor(g.feedback), 0);
}

export function scoreOnWin(
  winningFeedback: GuessFeedback,
  attemptsUsed: number,
  maxAttempts: number = MAX_ATTEMPTS,
): number {
  const remainingMultiplier = maxAttempts - attemptsUsed + 1;
  return remainingMultiplier * dotsFor(winningFeedback);
}

export function finalScore(
  guesses: GuessResult[],
  won: boolean,
  maxAttempts: number = MAX_ATTEMPTS,
): number {
  if (!won) return bankedDots(guesses);
  const last = guesses[guesses.length - 1];
  if (!last) return 0;
  return scoreOnWin(last.feedback, guesses.length, maxAttempts);
}
