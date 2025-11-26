export function calculatePoints({ elapsedMs = 0, performanceResult = {} }) {
  const base = 500;
  const timeBonus = Math.max(0, 300 - Math.floor(elapsedMs / 100));
  const accuracy = Math.max(0, Math.min(100, performanceResult.accuracy || 0));
  const accuracyBonus = Math.floor(accuracy * 2);
  const difficulty = performanceResult.difficultyRating || 1;
  const difficultyBonus = difficulty * 50;
  return Math.max(100, base + timeBonus + accuracyBonus + difficultyBonus);
}

