export type CarAnswer = {
  make: string;
  model: string;
  year: number;
};

export type Puzzle = {
  id: string;
  date: string;
  answer: CarAnswer;
  reveals: string[];
  fullImage: string;
  credit?: string;
  source?: string;
  license?: string;
};

export type Guess = {
  make: string;
  model: string;
  year: number;
};

export type GuessFeedback = {
  make: "correct" | "wrong";
  model: "correct" | "wrong";
  year: "correct" | "close" | "wrong";
};

export type GuessResult = {
  guess: Guess;
  feedback: GuessFeedback;
};

export type GameStatus = "playing" | "won" | "lost";

export type GameState = {
  puzzleId: string;
  guesses: GuessResult[];
  currentAttempt: number;
  status: GameStatus;
};
