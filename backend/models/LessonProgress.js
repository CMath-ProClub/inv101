const mongoose = require('mongoose');

const LessonProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  lessonId: {
    type: String,
    required: true,
    index: true
  },
  lessonTitle: String,
  lessonCategory: {
    type: String,
    enum: ['foundations', 'instruments', 'market', 'practical', 'advanced'],
    required: true
  },
  status: {
    type: String,
    enum: ['not-started', 'in-progress', 'completed'],
    default: 'not-started'
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  completedAt: Date,
  timeSpent: { type: Number, default: 0 }, // in seconds
  lastAccessedAt: { type: Date, default: Date.now },
  // Interactive elements
  checkpointsCompleted: [{ type: String }],
  notesCount: { type: Number, default: 0 },
  bookmarked: { type: Boolean, default: false },
  rating: { type: Number, min: 1, max: 5 }
}, {
  timestamps: true
});

// Compound index for efficient querying
LessonProgressSchema.index({ userId: 1, lessonId: 1 }, { unique: true });
LessonProgressSchema.index({ userId: 1, status: 1 });
LessonProgressSchema.index({ userId: 1, lessonCategory: 1 });

const LessonProgress = mongoose.model('LessonProgress', LessonProgressSchema);

module.exports = LessonProgress;
