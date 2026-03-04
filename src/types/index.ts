export type ColorKey = 'red' | 'green' | 'blue' | 'yellow';

export type ScoreDeltaReason = 'perfect' | 'good' | 'miss' | 'out';

export type GameResult = {
  score: number;
  highScore: number;
};
