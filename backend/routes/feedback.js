const express = require('express');
const router = express.Router();

// Store feedback submissions (in production, this would go to a database or email service)
const feedbackSubmissions = [];

/**
 * POST /api/feedback/lesson-idea
 * Submit a lesson idea from the lessons page
 */
router.post('/lesson-idea', async (req, res) => {
  try {
    const { name, email, idea, timestamp } = req.body;

    // Validate input
    if (!name || !email || !idea) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: 'Please provide name, email, and idea'
      });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: 'Invalid email',
        message: 'Please provide a valid email address'
      });
    }

    const submission = {
      id: Date.now().toString(),
      name,
      email,
      idea,
      timestamp: timestamp || new Date().toISOString(),
      type: 'lesson-idea'
    };

    // Store submission
    feedbackSubmissions.push(submission);

    // In production, you would:
    // 1. Save to database (MongoDB, PostgreSQL, etc.)
    // 2. Send email notification to curriculum team
    // 3. Add to project management tool (Trello, Notion, etc.)
    
    console.log('📝 New lesson idea submitted:', {
      from: name,
      email: email,
      preview: idea.substring(0, 100) + (idea.length > 100 ? '...' : '')
    });

    // TODO: Send email notification
    // await sendEmailNotification({
    //   to: 'curriculum@investing101.com',
    //   subject: `New Lesson Idea from ${name}`,
    //   body: `Name: ${name}\nEmail: ${email}\n\nIdea:\n${idea}`
    // });

    res.status(200).json({ 
      success: true,
      message: 'Thank you for your submission!',
      submissionId: submission.id
    });

  } catch (error) {
    console.error('Error processing feedback submission:', error);
    res.status(500).json({ 
      error: 'Server error',
      message: 'Failed to submit feedback. Please try again later.'
    });
  }
});

/**
 * GET /api/feedback/submissions
 * Get all feedback submissions (admin only)
 */
router.get('/submissions', (req, res) => {
  // TODO: Add authentication middleware to protect this endpoint
  // For now, return all submissions
  res.json({
    total: feedbackSubmissions.length,
    submissions: feedbackSubmissions.sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    )
  });
});

module.exports = router;
