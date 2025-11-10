// Onboarding quiz to assess user skill level
// Score ranges: 0-25 (new), 26-45 (beginner), 46-70 (intermediate), 71-85 (advanced), 86-100 (expert)

module.exports = {
  quizId: 'onboarding-skill-assessment',
  title: 'Investment Knowledge Assessment',
  description: 'Help us understand your current knowledge level so we can personalize your learning experience.',
  type: 'onboarding',
  category: 'general',
  difficulty: 'beginner',
  passingScore: 0, // No passing score for onboarding
  timeLimit: 600, // 10 minutes
  xpReward: 50,
  questions: [
    {
      question: 'What is a stock?',
      type: 'multiple-choice',
      options: [
        'A loan you give to a company',
        'Ownership share in a company',
        'A type of savings account',
        'A government bond'
      ],
      correctAnswer: 'Ownership share in a company',
      explanation: 'A stock represents partial ownership in a company. When you buy stock, you become a shareholder.',
      difficulty: 'easy',
      points: 10,
      category: 'foundations'
    },
    {
      question: 'What does "diversification" mean?',
      type: 'multiple-choice',
      options: [
        'Putting all your money in one investment',
        'Spreading investments across different assets',
        'Only investing in tech companies',
        'Trading frequently'
      ],
      correctAnswer: 'Spreading investments across different assets',
      explanation: 'Diversification means spreading your investments across various assets to reduce risk.',
      difficulty: 'easy',
      points: 10,
      category: 'foundations'
    },
    {
      question: 'What is compound interest?',
      type: 'multiple-choice',
      options: [
        'Interest paid only once',
        'Interest earned on both principal and accumulated interest',
        'A type of loan',
        'A penalty fee'
      ],
      correctAnswer: 'Interest earned on both principal and accumulated interest',
      explanation: 'Compound interest is when you earn interest on your initial investment plus all accumulated interest over time.',
      difficulty: 'easy',
      points: 10,
      category: 'foundations'
    },
    {
      question: 'What is the P/E ratio?',
      type: 'multiple-choice',
      options: [
        'Price divided by Earnings per share',
        'Profit divided by Expenses',
        'Performance divided by Efficiency',
        'Portfolio divided by Equity'
      ],
      correctAnswer: 'Price divided by Earnings per share',
      explanation: 'The P/E ratio (Price-to-Earnings) shows how much investors are willing to pay per dollar of earnings.',
      difficulty: 'medium',
      points: 15,
      category: 'instruments'
    },
    {
      question: 'What does "bull market" mean?',
      type: 'multiple-choice',
      options: [
        'A market where prices are falling',
        'A market with high volatility',
        'A market where prices are rising',
        'A market for commodity trading'
      ],
      correctAnswer: 'A market where prices are rising',
      explanation: 'A bull market is characterized by rising prices and investor optimism.',
      difficulty: 'medium',
      points: 10,
      category: 'market'
    },
    {
      question: 'What is an ETF?',
      type: 'multiple-choice',
      options: [
        'A single company stock',
        'A basket of securities that tracks an index',
        'A type of cryptocurrency',
        'An interest rate'
      ],
      correctAnswer: 'A basket of securities that tracks an index',
      explanation: 'An ETF (Exchange-Traded Fund) is a collection of securities that tracks an index, sector, or asset class.',
      difficulty: 'medium',
      points: 15,
      category: 'instruments'
    },
    {
      question: 'What is dollar-cost averaging?',
      type: 'multiple-choice',
      options: [
        'Investing a lump sum all at once',
        'Investing fixed amounts at regular intervals',
        'Only buying when prices are low',
        'Selling all investments at once'
      ],
      correctAnswer: 'Investing fixed amounts at regular intervals',
      explanation: 'Dollar-cost averaging means investing a fixed amount regularly, regardless of market conditions.',
      difficulty: 'medium',
      points: 15,
      category: 'practical'
    },
    {
      question: 'What is the Sharpe Ratio used for?',
      type: 'multiple-choice',
      options: [
        'Calculating tax liability',
        'Measuring risk-adjusted returns',
        'Determining company valuation',
        'Predicting stock prices'
      ],
      correctAnswer: 'Measuring risk-adjusted returns',
      explanation: 'The Sharpe Ratio measures the return of an investment compared to its risk.',
      difficulty: 'hard',
      points: 20,
      category: 'advanced'
    },
    {
      question: 'What is beta in stock analysis?',
      type: 'multiple-choice',
      options: [
        'A measure of a stock\'s volatility relative to the market',
        'The dividend payment ratio',
        'The company\'s profit margin',
        'The earnings growth rate'
      ],
      correctAnswer: 'A measure of a stock\'s volatility relative to the market',
      explanation: 'Beta measures how much a stock moves compared to the overall market. Beta > 1 means more volatile than market.',
      difficulty: 'hard',
      points: 20,
      category: 'advanced'
    },
    {
      question: 'What is the difference between intrinsic value and market value?',
      type: 'multiple-choice',
      options: [
        'There is no difference',
        'Intrinsic is what you paid, market is current price',
        'Intrinsic is calculated "true value", market is current trading price',
        'Intrinsic is for stocks, market is for bonds'
      ],
      correctAnswer: 'Intrinsic is calculated "true value", market is current trading price',
      explanation: 'Intrinsic value is the calculated fundamental value, while market value is what people are actually willing to pay.',
      difficulty: 'hard',
      points: 20,
      category: 'advanced'
    }
  ]
};
