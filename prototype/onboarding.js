// Onboarding Quiz Logic
const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:4000'
  : 'https://inv101-production.up.railway.app';

let quizData = null;
let currentQuestionIndex = 0;
let userAnswers = [];
let startTime = null;
let timerInterval = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadQuiz();
});

async function loadQuiz() {
  try {
    const response = await fetch(`${API_BASE}/api/gamification/quizzes/onboarding-skill-assessment`);
    const data = await response.json();
    
    if (data.success) {
      quizData = data.quiz;
      document.getElementById('totalQuestions').textContent = quizData.questions.length;
    } else {
      console.error('Failed to load quiz:', data.error);
    }
  } catch (error) {
    console.error('Error loading quiz:', error);
  }
}

function startQuiz() {
  document.getElementById('welcomeScreen').classList.add('hidden');
  document.getElementById('quizScreen').classList.remove('hidden');
  
  startTime = Date.now();
  startTimer();
  renderQuestion();
}

function startTimer() {
  const totalSeconds = 600; // 10 minutes
  let elapsed = 0;
  
  timerInterval = setInterval(() => {
    elapsed++;
    const remaining = totalSeconds - elapsed;
    
    if (remaining <= 0) {
      clearInterval(timerInterval);
      submitQuiz();
      return;
    }
    
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;
    document.getElementById('timeDisplay').textContent = 
      `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, 1000);
}

function renderQuestion() {
  if (!quizData) return;
  
  const question = quizData.questions[currentQuestionIndex];
  const container = document.getElementById('questionContainer');
  
  const difficultyColors = {
    easy: 'bg-green-100 text-green-700',
    medium: 'bg-yellow-100 text-yellow-700',
    hard: 'bg-red-100 text-red-700'
  };
  
  container.innerHTML = `
    <div class="flex items-start justify-between mb-4">
      <h3 class="text-xl font-bold flex-1">${question.question}</h3>
      <span class="px-3 py-1 rounded-full text-xs font-semibold ${difficultyColors[question.difficulty] || ''}">${question.difficulty || 'medium'}</span>
    </div>
    <div class="space-y-3" id="optionsContainer">
      ${question.options.map((option, index) => `
        <button 
          class="quiz-option" 
          onclick="selectAnswer(${index})"
          data-option-index="${index}"
        >
          ${option}
        </button>
      `).join('')}
    </div>
  `;
  
  // Update progress
  const progress = ((currentQuestionIndex + 1) / quizData.questions.length) * 100;
  document.getElementById('progressBar').style.width = `${progress}%`;
  document.getElementById('currentQuestion').textContent = currentQuestionIndex + 1;
  
  // Update buttons
  document.getElementById('prevBtn').disabled = currentQuestionIndex === 0;
  document.getElementById('nextBtn').textContent = 
    currentQuestionIndex === quizData.questions.length - 1 ? 'Submit Quiz' : 'Next Question';
  
  // Restore previous answer if exists
  if (userAnswers[currentQuestionIndex]) {
    const selectedIndex = question.options.indexOf(userAnswers[currentQuestionIndex]);
    if (selectedIndex !== -1) {
      const optionBtn = document.querySelector(`[data-option-index="${selectedIndex}"]`);
      if (optionBtn) optionBtn.classList.add('selected');
      document.getElementById('nextBtn').disabled = false;
    }
  } else {
    document.getElementById('nextBtn').disabled = true;
  }
}

function selectAnswer(optionIndex) {
  if (!quizData) return;
  
  const question = quizData.questions[currentQuestionIndex];
  const selectedAnswer = question.options[optionIndex];
  
  // Save answer
  userAnswers[currentQuestionIndex] = selectedAnswer;
  
  // Update UI
  document.querySelectorAll('.quiz-option').forEach(btn => {
    btn.classList.remove('selected');
  });
  document.querySelector(`[data-option-index="${optionIndex}"]`).classList.add('selected');
  
  // Enable next button
  document.getElementById('nextBtn').disabled = false;
}

function previousQuestion() {
  if (currentQuestionIndex > 0) {
    currentQuestionIndex--;
    renderQuestion();
  }
}

function nextQuestion() {
  if (currentQuestionIndex < quizData.questions.length - 1) {
    currentQuestionIndex++;
    renderQuestion();
  } else {
    submitQuiz();
  }
}

async function submitQuiz() {
  clearInterval(timerInterval);
  
  const timeSpent = Math.floor((Date.now() - startTime) / 1000);
  
  // Get or create user ID (for demo purposes, using localStorage)
  let userId = localStorage.getItem('inv101_userId');
  if (!userId) {
    // In production, this should come from authentication
    userId = 'demo-user-' + Date.now();
    localStorage.setItem('inv101_userId', userId);
  }
  
  const answers = quizData.questions.map((q, index) => ({
    questionIndex: index,
    selectedAnswer: userAnswers[index] || ''
  }));
  
  try {
    const response = await fetch(`${API_BASE}/api/gamification/quizzes/onboarding-skill-assessment/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        answers,
        timeSpent
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      showResults(data.attempt, data.user);
    } else {
      console.error('Failed to submit quiz:', data.error);
      alert('Error submitting quiz. Please try again.');
    }
  } catch (error) {
    console.error('Error submitting quiz:', error);
    alert('Error submitting quiz. Please try again.');
  }
}

function showResults(attempt, user) {
  document.getElementById('quizScreen').classList.add('hidden');
  document.getElementById('resultsScreen').classList.remove('hidden');
  
  // Display score
  document.getElementById('scoreDisplay').textContent = `${attempt.score}%`;
  document.getElementById('correctDisplay').textContent = `${attempt.pointsEarned}/${attempt.totalPoints} pts`;
  document.getElementById('gradeDisplay').textContent = attempt.grade;
  document.getElementById('xpEarned').textContent = `${attempt.xpAwarded} XP`;
  
  // Display skill level
  const skillLevel = user.skillLevel || 'new';
  const skillBadge = document.getElementById('skillBadge');
  const skillDescriptions = {
    new: 'Perfect! We\'ll start with the absolute basics and build your foundation.',
    beginner: 'Great! You know the basics. We\'ll help you expand your knowledge.',
    intermediate: 'Impressive! You have solid fundamentals. Ready for more advanced concepts.',
    advanced: 'Excellent! You\'re well-versed in investing. Let\'s refine your expertise.',
    expert: 'Outstanding! You\'re an investing pro. Access our most advanced content.'
  };
  
  skillBadge.className = `skill-badge ${skillLevel}`;
  skillBadge.innerHTML = `
    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
    ${skillLevel.charAt(0).toUpperCase() + skillLevel.slice(1)}
  `;
  
  document.getElementById('skillDescription').textContent = skillDescriptions[skillLevel];
  
  // Save to localStorage for dashboard
  localStorage.setItem('inv101_skillLevel', skillLevel);
  localStorage.setItem('inv101_onboardingComplete', 'true');
}

function viewResults() {
  // In a real implementation, this would show detailed question-by-question results
  alert('Detailed results view coming soon!');
}

function goToDashboard() {
  window.location.href = 'index.html';
}

function skipOnboarding() {
  if (confirm('Are you sure you want to skip the assessment? We recommend completing it for a personalized experience.')) {
    localStorage.setItem('inv101_onboardingComplete', 'false');
    localStorage.setItem('inv101_skillLevel', 'beginner');
    window.location.href = 'index.html';
  }
}
