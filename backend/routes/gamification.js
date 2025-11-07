const express = require('express');
const router = express.Router();
const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const User = require('../models/User');
const onboardingQuizData = require('../data/onboardingQuiz');

// Get all available quizzes (with filtering)
router.get('/quizzes', async (req, res) => {
  try {
    const { type, category, difficulty } = req.query;
    const filter = { isActive: true };
    
    if (type) filter.type = type;
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    
    const quizzes = await Quiz.find(filter).select('-questions.correctAnswer -questions.explanation');
    res.json({ success: true, quizzes });
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch quizzes' });
  }
});

// Get specific quiz (without answers)
router.get('/quizzes/:quizId', async (req, res) => {
  try {
    const { quizId } = req.params;
    const quiz = await Quiz.findOne({ quizId, isActive: true }).select('-questions.correctAnswer -questions.explanation');
    
    if (!quiz) {
      return res.status(404).json({ success: false, error: 'Quiz not found' });
    }
    
    res.json({ success: true, quiz });
  } catch (error) {
    console.error('Error fetching quiz:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch quiz' });
  }
});

// Submit quiz attempt
router.post('/quizzes/:quizId/submit', async (req, res) => {
  try {
    const { quizId } = req.params;
    const { userId, answers, timeSpent } = req.body;
    
    if (!userId || !answers) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }
    
    // Get the full quiz with correct answers
    const quiz = await Quiz.findOne({ quizId, isActive: true });
    if (!quiz) {
      return res.status(404).json({ success: false, error: 'Quiz not found' });
    }
    
    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    // Grade the quiz
    let pointsEarned = 0;
    let totalPoints = 0;
    const gradedAnswers = answers.map((answer, index) => {
      const question = quiz.questions[index];
      totalPoints += question.points;
      const isCorrect = answer.selectedAnswer === question.correctAnswer;
      const points = isCorrect ? question.points : 0;
      pointsEarned += points;
      
      return {
        questionIndex: index,
        selectedAnswer: answer.selectedAnswer,
        isCorrect,
        pointsEarned: points
      };
    });
    
    const score = totalPoints > 0 ? Math.round((pointsEarned / totalPoints) * 100) : 0;
    const passed = score >= quiz.passingScore;
    
    // Count previous attempts
    const previousAttempts = await QuizAttempt.countDocuments({ userId, quizId });
    const attemptNumber = previousAttempts + 1;
    
    // Award XP (only on first pass)
    let xpAwarded = 0;
    if (passed && previousAttempts === 0) {
      const xpResult = await user.passQuiz(quizId, score, quiz.xpReward);
      xpAwarded = quiz.xpReward;
    }
    
    // Handle onboarding quiz special logic
    if (quiz.type === 'onboarding' && !user.onboardingCompleted) {
      user.onboardingScore = score;
      user.onboardingCompleted = true;
      user.updateSkillLevel();
      await user.save();
    }
    
    // Save attempt
    const attempt = new QuizAttempt({
      userId,
      quizId,
      quizTitle: quiz.title,
      quizType: quiz.type,
      answers: gradedAnswers,
      score,
      pointsEarned,
      totalPoints,
      passed,
      timeSpent,
      attemptNumber,
      xpAwarded
    });
    
    await attempt.save();
    
    res.json({
      success: true,
      attempt: {
        score,
        passed,
        pointsEarned,
        totalPoints,
        attemptNumber,
        xpAwarded,
        grade: attempt.grade
      },
      user: {
        skillLevel: user.skillLevel,
        xp: user.xp,
        level: user.level,
        onboardingCompleted: user.onboardingCompleted
      }
    });
  } catch (error) {
    console.error('Error submitting quiz:', error);
    res.status(500).json({ success: false, error: 'Failed to submit quiz' });
  }
});

// Get user's quiz attempts
router.get('/users/:userId/quiz-attempts', async (req, res) => {
  try {
    const { userId } = req.params;
    const { quizId } = req.query;
    
    const filter = { userId };
    if (quizId) filter.quizId = quizId;
    
    const attempts = await QuizAttempt.find(filter).sort({ completedAt: -1 }).limit(50);
    res.json({ success: true, attempts });
  } catch (error) {
    console.error('Error fetching quiz attempts:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch quiz attempts' });
  }
});

// Get quiz results with correct answers (after submission)
router.get('/quiz-attempts/:attemptId/results', async (req, res) => {
  try {
    const { attemptId } = req.params;
    
    const attempt = await QuizAttempt.findById(attemptId);
    if (!attempt) {
      return res.status(404).json({ success: false, error: 'Attempt not found' });
    }
    
    // Get the quiz with correct answers and explanations
    const quiz = await Quiz.findOne({ quizId: attempt.quizId });
    if (!quiz) {
      return res.status(404).json({ success: false, error: 'Quiz not found' });
    }
    
    // Merge attempt answers with quiz questions for detailed results
    const results = quiz.questions.map((question, index) => {
      const attemptAnswer = attempt.answers.find(a => a.questionIndex === index);
      return {
        question: question.question,
        options: question.options,
        selectedAnswer: attemptAnswer?.selectedAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect: attemptAnswer?.isCorrect,
        explanation: question.explanation,
        points: question.points,
        pointsEarned: attemptAnswer?.pointsEarned || 0
      };
    });
    
    res.json({
      success: true,
      results,
      summary: {
        score: attempt.score,
        passed: attempt.passed,
        pointsEarned: attempt.pointsEarned,
        totalPoints: attempt.totalPoints,
        grade: attempt.grade,
        timeSpent: attempt.timeSpent
      }
    });
  } catch (error) {
    console.error('Error fetching quiz results:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch quiz results' });
  }
});

// Initialize onboarding quiz in database (admin/setup route)
router.post('/quizzes/initialize-onboarding', async (req, res) => {
  try {
    // Check if already exists
    const existing = await Quiz.findOne({ quizId: onboardingQuizData.quizId });
    if (existing) {
      return res.json({ success: true, message: 'Onboarding quiz already exists', quiz: existing });
    }
    
    // Create new quiz
    const quiz = new Quiz(onboardingQuizData);
    await quiz.save();
    
    res.json({ success: true, message: 'Onboarding quiz created', quiz });
  } catch (error) {
    console.error('Error initializing onboarding quiz:', error);
    res.status(500).json({ success: false, error: 'Failed to initialize onboarding quiz' });
  }
});

module.exports = router;
