const mongoose = require('mongoose');

const QuizQuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  type: { type: String, enum: ['multiple-choice', 'true-false', 'scenario'], default: 'multiple-choice' },
  options: [{ type: String }], // For multiple choice
  correctAnswer: { type: String, required: true },
  explanation: String,
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  points: { type: Number, default: 10 },
  category: String
}, { _id: false });

const QuizSchema = new mongoose.Schema({
  quizId: { type: String, required: true, unique: true, index: true },
  title: { type: String, required: true },
  description: String,
  type: {
    type: String,
    enum: ['onboarding', 'lesson', 'checkpoint', 'assessment', 'challenge'],
    required: true
  },
  category: {
    type: String,
    enum: ['foundations', 'instruments', 'market', 'practical', 'advanced', 'general'],
    default: 'general'
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    default: 'beginner'
  },
  questions: [QuizQuestionSchema],
  passingScore: { type: Number, default: 70 }, // Percentage
  timeLimit: { type: Number }, // in seconds, optional
  xpReward: { type: Number, default: 100 },
  requiredLevel: { type: Number, default: 1 },
  prerequisites: [{ type: String }], // Other quiz IDs that must be completed first
  isActive: { type: Boolean, default: true },
  isPremium: { type: Boolean, default: false }
}, {
  timestamps: true
});

QuizSchema.index({ type: 1, category: 1, isActive: 1 });
QuizSchema.index({ difficulty: 1, isActive: 1 });

const Quiz = mongoose.model('Quiz', QuizSchema);

module.exports = Quiz;
