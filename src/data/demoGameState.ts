import type { GameState } from "../types/game";

export const demoGameState: GameState = {
  puzzleId: "cadillac-escalade-2006",
  guesses: [
    {
      guess: {
        make: "Cadillac",
        model: "CTS",
        year: 2008,
      },
      feedback: {
        make: "correct",
        model: "wrong",
        year: "close",
      },
    },
  ],
  currentAttempt: 1,
  status: "playing",
};
