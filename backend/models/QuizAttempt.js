const mongoose = require('mongoose');

const QuizAttemptSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  quizId: {
    type: String,
    required: true,
    index: true
  },
  quizTitle: String,
  quizType: {
    type: String,
    enum: ['onboarding', 'lesson', 'checkpoint', 'assessment', 'challenge']
  },
  answers: [{
    questionIndex: Number,
    selectedAnswer: String,
    isCorrect: Boolean,
    pointsEarned: Number
  }],
  score: { type: Number, required: true }, // Percentage
  pointsEarned: { type: Number, default: 0 },
  totalPoints: { type: Number, default: 0 },
  passed: { type: Boolean, default: false },
  timeSpent: { type: Number }, // in seconds
  attemptNumber: { type: Number, default: 1 },
  completedAt: { type: Date, default: Date.now },
  xpAwarded: { type: Number, default: 0 }
}, {
  timestamps: true
});

QuizAttemptSchema.index({ userId: 1, quizId: 1 });
QuizAttemptSchema.index({ userId: 1, passed: 1 });
QuizAttemptSchema.index({ completedAt: -1 });

// Virtual for performance grade
QuizAttemptSchema.virtual('grade').get(function() {
  if (this.score >= 90) return 'A';
  if (this.score >= 80) return 'B';
  if (this.score >= 70) return 'C';
  if (this.score >= 60) return 'D';
  return 'F';
});

const QuizAttempt = mongoose.model('QuizAttempt', QuizAttemptSchema);

module.exports = QuizAttempt;
