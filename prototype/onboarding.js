// Onboarding Quiz Logic
// Local fallback question bank (used if API unavailable)
const DEFAULT_QUIZ = {
  title: 'Investing101 Onboarding Assessment',
  questions: [
    // Knowledge: Foundations
    { question: 'What does diversification primarily help reduce?', options: ['Fees', 'Taxes', 'Risk', 'Returns'], answerIndex: 2, difficulty: 'easy', category: 'foundations', type: 'knowledge', explanation: 'Diversification spreads exposure across assets so one position cannot dominate outcomes, which lowers portfolio risk.' },
    { question: "An S&P 500 index fund is best described as:", options: ['An actively managed fund', 'A single company stock', 'A basket tracking 500 large US companies', 'A bond ETF'], answerIndex: 2, difficulty: 'easy', category: 'foundations', type: 'knowledge', explanation: 'An S&P 500 index fund passively tracks the performance of 500 large U.S. companies as a diversified basket.' },
    { question: 'If a stock rises from $100 to $110, what is the simple return?', options: ['1%', '5%', '10%', '20%'], answerIndex: 2, difficulty: 'easy', category: 'math', type: 'knowledge', explanation: 'The simple return is gain divided by initial price: (110 − 100) / 100 = 10%.' },
    // Knowledge: Instruments
    { question: 'A dividend is:', options: ['A fee paid to the broker', 'A portion of profits paid to shareholders', 'An interest payment on a bond', 'A tax refund'], answerIndex: 1, difficulty: 'easy', category: 'instruments', type: 'knowledge', explanation: 'Dividends are distributions of a company’s profits to shareholders, typically paid in cash per share.' },
    { question: 'A bond typically pays investors:', options: ['Dividends', 'Coupons/interest', 'Royalties', 'Capital calls'], answerIndex: 1, difficulty: 'easy', category: 'instruments', type: 'knowledge', explanation: 'Bonds pay periodic coupon (interest) payments and return principal at maturity.' },
    { question: 'Options can be used to:', options: ['Only increase risk', 'Eliminate all losses', 'Hedge or add leverage', 'Guarantee profits'], answerIndex: 2, difficulty: 'medium', category: 'instruments', type: 'knowledge', explanation: 'Options are flexible: they can hedge downside (protective puts) or add leverage (calls) but never guarantee profits.' },
    // Knowledge: Risk
    { question: 'The Kelly criterion helps with:', options: ['Tax planning', 'Position sizing', 'Finding dividend yield', 'Index tracking'], answerIndex: 1, difficulty: 'medium', category: 'risk', type: 'knowledge', explanation: 'Kelly sizing estimates the optimal fraction to bet based on edge and odds to maximize long‑run growth.' },
    { question: 'Which usually has lower volatility?', options: ['Single stock', 'Diversified ETF', 'Crypto token', 'Leveraged ETF'], answerIndex: 1, difficulty: 'medium', category: 'risk', type: 'knowledge', explanation: 'Diversified ETFs spread risk across many holdings and typically fluctuate less than single or leveraged assets.' },
    { question: 'Drawdown refers to:', options: ['Maximum price ever reached', 'Time to recovery after a loss', 'Peak-to-trough decline', 'Number of shares outstanding'], answerIndex: 2, difficulty: 'medium', category: 'risk', type: 'knowledge', explanation: 'Drawdown is the decline from a peak to a subsequent trough, a key measure of downside risk.' },
    // Experience + Goals (affect ELO/goals, not correctness)
    { question: 'How much experience do you have investing?', options: ['None', 'Some paper trading', '1–2 years live', '3+ years live'], answerIndex: 0, difficulty: 'easy', category: 'experience', type: 'meta' },
    { question: 'What’s your primary goal here?', options: ['Learn fundamentals', 'Practice with simulator', 'Find trade ideas', 'Connect with community'], answerIndex: 0, difficulty: 'easy', category: 'goals', type: 'meta' },
    { question: 'How would you describe your risk tolerance?', options: ['Low', 'Moderate', 'High', 'Very high'], answerIndex: 0, difficulty: 'easy', category: 'goals', type: 'meta' }
  ]
};
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
      // Fallback to local quiz
      quizData = DEFAULT_QUIZ;
      document.getElementById('totalQuestions').textContent = quizData.questions.length;
    }
  } catch (error) {
    console.error('Error loading quiz:', error);
    // Fallback to local quiz
    quizData = DEFAULT_QUIZ;
    document.getElementById('totalQuestions').textContent = quizData.questions.length;
  }
}

function startQuiz() {
  document.getElementById('welcomeScreen').classList.add('hidden');
  document.getElementById('quizScreen').classList.remove('hidden');
  
  startTime = Date.now();
  startTimer();
  buildCategorySegments();
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
  updateActiveCategorySegment();
  
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

function groupByCategory() {
  if (!quizData) return [];
  const groups = [];
  let last = null;
  quizData.questions.forEach((q) => {
    const cat = q.category || 'general';
    if (!last || last.category !== cat) {
      last = { category: cat, count: 1 };
      groups.push(last);
    } else {
      last.count += 1;
    }
  });
  return groups;
}

function buildCategorySegments() {
  const wrap = document.getElementById('categorySegments');
  if (!wrap || !quizData) return;
  wrap.innerHTML = '';
  const groups = groupByCategory();
  const total = quizData.questions.length;
  groups.forEach(g => {
    const seg = document.createElement('div');
    seg.className = 'quiz-categories__seg';
    seg.style.width = `${(g.count / total) * 100}%`;
    seg.dataset.label = (g.category || 'general');
    wrap.appendChild(seg);
  });
}

function updateActiveCategorySegment() {
  const wrap = document.getElementById('categorySegments');
  if (!wrap || !quizData) return;
  const groups = groupByCategory();
  // find current group
  let idx = 0, cursor = 0;
  for (let i = 0; i < groups.length; i++) {
    const span = cursor + groups[i].count; // exclusive
    if (currentQuestionIndex < span) { idx = i; break; }
    cursor = span;
  }
  [...wrap.children].forEach((el, i) => {
    el.classList.toggle('is-active', i === idx);
  });
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
      // Local evaluation fallback
      const local = evaluateLocally(quizData, userAnswers, timeSpent);
      showResults(local.attempt, local.user);
    }
  } catch (error) {
    console.error('Error submitting quiz:', error);
    // Local evaluation fallback
    const local = evaluateLocally(quizData, userAnswers, timeSpent);
    showResults(local.attempt, local.user);
  }
}

function evaluateLocally(quiz, answers, timeSpent) {
  // Score knowledge questions only
  const knowledge = quiz.questions
    .map((q, i) => ({ ...q, index: i }))
    .filter(q => (q.type || 'knowledge') === 'knowledge');

  let correct = 0;
  knowledge.forEach(q => {
    const selected = answers[q.index];
    if (typeof q.answerIndex === 'number' && q.options[q.answerIndex] === selected) {
      correct++;
    }
  });

  const totalPoints = knowledge.length;
  const scorePct = totalPoints ? Math.round((correct / totalPoints) * 100) : 0;
  const grade = scorePct >= 90 ? 'A' : scorePct >= 80 ? 'B' : scorePct >= 70 ? 'C' : scorePct >= 60 ? 'D' : 'F';
  const xpAwarded = 50;

  // ELO seed based on score and experience/meta answers
  // Base by knowledge
  let elo = scorePct >= 90 ? 1300 : scorePct >= 75 ? 1200 : scorePct >= 55 ? 1050 : 900;

  // Adjust by experience response
  const expIdx = quiz.questions.findIndex(q => q.category === 'experience');
  const expAns = expIdx >= 0 ? answers[expIdx] : null;
  if (expAns) {
    if (expAns.includes('3+ years')) elo += 75;
    else if (expAns.includes('1–2 years')) elo += 40;
    else if (expAns.includes('Some paper')) elo += 15;
  }

  // Adjust by risk tolerance
  const riskIdx = quiz.questions.findIndex(q => q.category === 'goals' && q.question.toLowerCase().includes('risk'));
  const riskAns = riskIdx >= 0 ? answers[riskIdx] : null;
  if (riskAns) {
    if (riskAns === 'Low') elo -= 25;
    if (riskAns === 'Very high') elo += 25;
  }

  // Map to skill level buckets
  const skillLevel = elo >= 1300 ? 'advanced' : elo >= 1150 ? 'intermediate' : elo >= 1000 ? 'beginner' : 'new';

  // Persist locally
  localStorage.setItem('inv101_skillLevel', skillLevel);
  localStorage.setItem('inv101_onboardingComplete', 'true');
  localStorage.setItem('inv101_elo', String(elo));

  return {
    attempt: {
      score: scorePct,
      pointsEarned: correct,
      totalPoints,
      grade,
      xpAwarded,
      timeSpent
    },
    user: {
      skillLevel,
      elo
    }
  };
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
  // Optional ELO display if available
  const eloEl = document.getElementById('eloDisplay');
  if (eloEl && (user.elo || localStorage.getItem('inv101_elo'))) {
    const elo = user.elo || Number(localStorage.getItem('inv101_elo')) || 1000;
    eloEl.textContent = `Starting ELO: ${elo}`;
    eloEl.style.display = 'block';
  }
  
  // Save to localStorage for dashboard
  localStorage.setItem('inv101_skillLevel', skillLevel);
  localStorage.setItem('inv101_onboardingComplete', 'true');

  // Compute and persist tags + recommended section
  try {
    const tagsResult = computePlayerTags(quizData, userAnswers, skillLevel, Number(localStorage.getItem('inv101_elo')) || user.elo || 0);
    localStorage.setItem('inv101_tags', JSON.stringify(tagsResult.tags));
    if (tagsResult.recommendedSection) {
      localStorage.setItem('inv101_recommendedSection', tagsResult.recommendedSection);
    }
  } catch (e) {
    console.warn('Tagging failed:', e);
  }
}

function viewResults() {
  const modal = document.getElementById('reviewModal');
  const body = document.getElementById('reviewContent');
  if (!quizData) return;
  const items = quizData.questions.map((q, i) => {
    const isKnowledge = (q.type || 'knowledge') === 'knowledge';
    const user = userAnswers[i] ?? '(no answer)';
    const correct = typeof q.answerIndex === 'number' ? q.options[q.answerIndex] : null;
    const ok = isKnowledge && correct ? (user === correct) : null;
    const status = ok === null ? '—' : ok ? '✔ Correct' : '✖ Incorrect';
    return `
    <div class="mb-4 p-3 rounded-lg ${ok === null ? 'bg-slate-50' : ok ? 'bg-green-50' : 'bg-red-50'}">
      <div class="text-sm text-slate-500">${q.category || 'general'} · ${q.difficulty || 'medium'}</div>
      <div class="font-semibold">Q${i+1}. ${q.question}</div>
      <div class="mt-1">Your answer: <strong>${user}</strong></div>
      ${correct ? `<div>Correct answer: <strong>${correct}</strong> <span class="ml-2">${status}</span></div>` : ''}
      ${q.explanation && isKnowledge ? `<div class="quiz-explanation"><strong>Why:</strong> ${q.explanation}</div>` : ''}
    </div>`;
  }).join('');
  body.innerHTML = items;
  modal.style.display = 'flex';
}

function closeReview() {
  const modal = document.getElementById('reviewModal');
  if (modal) modal.style.display = 'none';
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

// Generate player tags and recommended section based on answers and placement
function computePlayerTags(quiz, answers, skillLevel, elo) {
  const tags = new Set();

  // Skill and ELO tier
  tags.add(`skill:${skillLevel}`);
  const eloTier = elo >= 1300 ? 'platinum' : elo >= 1150 ? 'gold' : elo >= 1000 ? 'silver' : 'bronze';
  tags.add(`elo:tier:${eloTier}`);

  // Primary goal based on meta answer
  const goalIdx = quiz.questions.findIndex(q => q.category === 'goals' && q.type === 'meta' && q.question.includes('primary goal'));
  const goalAns = goalIdx >= 0 ? answers[goalIdx] : null;
  let recommendedSection = '';
  if (goalAns) {
    if (goalAns.includes('fundamentals')) { tags.add('focus:lessons-foundations'); recommendedSection = 'lessons'; }
    else if (goalAns.includes('simulator')) { tags.add('focus:simulator'); recommendedSection = 'simulator'; }
    else if (goalAns.includes('ideas')) { tags.add('focus:signals'); recommendedSection = 'home'; }
    else if (goalAns.includes('community')) { tags.add('focus:social'); recommendedSection = 'profile'; }
  }

  // Category remediation needs (knowledge only)
  const catStats = {};
  quiz.questions.forEach((q, i) => {
    const cat = q.category || 'general';
    if ((q.type || 'knowledge') !== 'knowledge') return;
    if (!catStats[cat]) catStats[cat] = { total: 0, correct: 0 };
    catStats[cat].total += 1;
    const correct = typeof q.answerIndex === 'number' ? q.options[q.answerIndex] : null;
    const user = answers[i];
    if (correct && user === correct) catStats[cat].correct += 1;
  });
  Object.entries(catStats).forEach(([cat, s]) => {
    const pct = s.total ? (s.correct / s.total) : 1;
    if (pct < 0.6) tags.add(`needs:${cat}`);
  });

  return { tags: Array.from(tags), recommendedSection };
}
