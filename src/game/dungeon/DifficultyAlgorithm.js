export class DifficultyAlgorithm {
  constructor() {
    this.reset();
  }

  reset() {
    this.startTime = null;
    this.correctAnswers = 0;
    this.totalQuestions = 0;
    this.levelNumber = 1;
  }

  startLevel(levelNumber) {
    this.levelNumber = levelNumber;
    this.startTime = Date.now();
    this.correctAnswers = 0;
    this.totalQuestions = 0;
  }

  recordAnswer(isCorrect) {
    this.totalQuestions++;
    if (isCorrect) {
      this.correctAnswers++;
    }
  }

  // recordHint removed

  calculatePerformance() {
    if (!this.startTime) {
      console.warn('DifficultyAlgorithm: No start time recorded');
      return null;
    }

    const timeTaken = (Date.now() - this.startTime) / 1000; // Convert to seconds
    const accuracy = this.totalQuestions > 0 ? this.correctAnswers / this.totalQuestions : 0;

    // Calculate time score
    let timeScore = 0;
    if (timeTaken <= 120) {
      timeScore = 2;
    } else if (timeTaken <= 300) {
      timeScore = 1;
    }

    // Calculate accuracy score
    let accuracyScore = 0;
    if (accuracy >= 0.9) { // 90%
      accuracyScore = 2;
    } else if (accuracy >= 0.75) { // 75%
      accuracyScore = 1;
    }

    // Calculate performance score
    const performanceScore = timeScore + accuracyScore;

    // Calculate performance rating
    let performanceRating = 0;
    if (performanceScore >= 4) {
      performanceRating = 2;
    } else if (performanceScore >= 2) {
      performanceRating = 1;
    }

    // Calculate final difficulty and cap at 4
    const baseDifficulty = this.levelNumber;
    const difficultyRating = Math.min(4, baseDifficulty + performanceRating);

    const result = {
      timeTaken: Math.round(timeTaken),
      accuracy: Math.round(accuracy * 100), // Convert to percentage
      levelNumber: this.levelNumber,
      baseDifficulty,
      timeScore,
      accuracyScore,
      performanceScore,
      performanceRating,
      difficultyRating
    };

    // Console logging for debugging
    console.log('=== DIFFICULTY ALGORITHM DEBUG ===');
    console.log(`Level: ${this.levelNumber}`);
    console.log(`Time taken: ${result.timeTaken}s (score: ${timeScore})`);
    console.log(`Accuracy: ${result.accuracy}% (${this.correctAnswers}/${this.totalQuestions}) (score: ${accuracyScore})`);
    // Hints removed
    console.log(`Performance score: ${performanceScore}`);
    console.log(`Performance rating: ${performanceRating}`);
    console.log(`Base difficulty: ${baseDifficulty}`);
    console.log(`Final difficulty rating: ${difficultyRating}`);
    console.log('================================');

    return result;
  }

  getStats() {
    return {
      timeTaken: this.startTime ? Math.round((Date.now() - this.startTime) / 1000) : 0,
      accuracy: this.totalQuestions > 0 ? Math.round((this.correctAnswers / this.totalQuestions) * 100) : 0,
      correctAnswers: this.correctAnswers,
      totalQuestions: this.totalQuestions
    };
  }
}
