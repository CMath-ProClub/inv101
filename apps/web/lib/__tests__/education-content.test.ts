import { describe, expect, it } from "vitest";
import {
  featuredLesson,
  budgetingPlanSteps,
  budgetingTools,
  budgetingQuickFlows,
  budgetingCalculatorShortcuts,
} from "../education-content";

describe("education-content", () => {
  it("exposes a featured lesson with outcomes", () => {
    expect(featuredLesson.title).toBeTruthy();
    expect(featuredLesson.outcomes).toHaveLength(3);
    expect(featuredLesson.xpReward).toBeGreaterThan(0);
  });

  it("provides sequential budgeting plan steps with XP values", () => {
    const totalXp = budgetingPlanSteps.reduce((sum, step) => sum + step.xp, 0);
    expect(budgetingPlanSteps).toHaveLength(3);
    expect(totalXp).toBeGreaterThan(0);
  });

  it("lists budgeting tools and calculator shortcuts", () => {
    expect(budgetingTools.length).toBeGreaterThan(0);
    expect(budgetingCalculatorShortcuts.length).toBeGreaterThan(0);
  });

  it("flags quick flows by status", () => {
    const statuses = new Set(budgetingQuickFlows.map((flow) => flow.status));
    expect(statuses.has("live")).toBe(true);
  });
});
