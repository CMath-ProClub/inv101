import type { Route } from "next";

export type FeaturedLesson = {
  title: string;
  duration: string;
  xpReward: number;
  summary: string;
  outcomes: string[];
};

export const featuredLesson: FeaturedLesson = {
  title: "Signals & Sentiment Warmup",
  duration: "12 min",
  xpReward: 35,
  summary:
    "A fast, free preview that teaches how macro catalysts shape price action while pairing summaries with live dashboards.",
  outcomes: [
    "Spot bullish vs. bearish breadth in under two minutes",
    "Journal one actionable takeaway per session",
    "Trigger a budgeting reflection when confidence dips",
  ],
};

export type BudgetingPlanStep = {
  title: string;
  detail: string;
  xp: number;
};

export const budgetingPlanSteps: BudgetingPlanStep[] = [
  {
    title: "Audit inflows & outflows",
    detail: "Use the Cashflow Snapshot to tag paychecks, subscriptions, and lumpy expenses.",
    xp: 30,
  },
  {
    title: "Design envelopes",
    detail: "Allocate percentages to essentials, goals, and investing boosts with the Envelope Board.",
    xp: 25,
  },
  {
    title: "Automate adjustments",
    detail: "Schedule Autopilot nudges that suggest trims when envelopes hit custom guardrails.",
    xp: 20,
  },
];

export type BudgetingTool = {
  name: string;
  detail: string;
};

export const budgetingTools: BudgetingTool[] = [
  {
    name: "Cashflow Snapshot",
    detail: "Live spreadsheet + chart combo that highlights where every dollar lands each week.",
  },
  {
    name: "Envelope Board",
    detail: "Drag-and-drop card set with XP incentives for keeping categories within target bands.",
  },
  {
    name: "Autopilot Rules",
    detail: "If/then nudges that pause discretionary spend or boost savings when signals flip bearish.",
  },
];

export type BudgetingQuickFlowStatus = "live" | "beta" | "soon";

export type BudgetingQuickFlow = {
  name: string;
  status: BudgetingQuickFlowStatus;
  summary: string;
};

export const budgetingQuickFlows: BudgetingQuickFlow[] = [
  {
    name: "Cashflow snapshot",
    status: "live",
    summary: "Upload or tag transactions, then auto-create envelopes with XP rewards.",
  },
  {
    name: "Goals board",
    status: "beta",
    summary: "Prioritize savings goals, assign envelope boosts, and project completion dates.",
  },
  {
    name: "Envelope autopilot",
    status: "soon",
    summary: "Trigger calculator suggestions when a category deviates from plan.",
  },
];

export type BudgetingCalculatorShortcut = {
  title: string;
  description: string;
  href: Route;
};

export const budgetingCalculatorShortcuts: BudgetingCalculatorShortcut[] = [
  {
    title: "Emergency fund planner",
    description: "Set envelope minimums using the core savings calculator with guardrails.",
    href: "/calculators/core" as Route,
  },
  {
    title: "Debt snowball",
    description: "Queue the payoff calculator and sync XP to budgeting streaks.",
    href: "/calculators/asset" as Route,
  },
  {
    title: "Retirement glidepath",
    description: "Open the retirement calculator with budgeting envelopes piped into contributions.",
    href: "/calculators/retire" as Route,
  },
];
