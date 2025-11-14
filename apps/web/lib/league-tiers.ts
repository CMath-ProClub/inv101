export type LeagueTier = {
  name: string;
  xpRange: string;
  highlights: string;
  movement: string;
};

export const leagueTiers: LeagueTier[] = [
  {
    name: "Bullish Bronze",
    xpRange: "0 – 2,499 XP",
    highlights: "Focus on onboarding, budgeting labs, and completing the first Education track.",
    movement: "Top 25% promote weekly; bottom 10% demoted from Steady Silver.",
  },
  {
    name: "Steady Silver",
    xpRange: "2,500 – 6,999 XP",
    highlights: "Unlock simulator drills and AI nudges with double XP for streak maintenance.",
    movement: "Finish top 20% or hold a 7-day streak to promote into Momentum Gold.",
  },
  {
    name: "Momentum Gold",
    xpRange: "7,000 – 14,999 XP",
    highlights: "Trading Battles award bonus trophies; budgeting labs sync to leaderboard multipliers.",
    movement: "Top 15% promote up, bottom 15% are demoted to Silver if streak breaks.",
  },
  {
    name: "Rocket Platinum",
    xpRange: "15,000 – 24,999 XP",
    highlights: "Energy regen accelerates to 1 point every 4 hours plus AI sparring crits.",
    movement: "Top 10% plus anyone in the global top 50 XP promote to Wall Street Official.",
  },
  {
    name: "Wall Street Official",
    xpRange: "25,000+ XP",
    highlights: "Weekly podium callouts, concierge coaching slots, and exclusive league challenges.",
    movement: "Maintain top-200 XP or drop to Platinum after two inactive weeks.",
  },
];
