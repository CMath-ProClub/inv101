import { describe, expect, it } from "vitest";
import { leagueTiers } from "../league-tiers";

describe("league-tiers", () => {
  it("contains five ordered tiers", () => {
    expect(leagueTiers).toHaveLength(5);
    expect(leagueTiers[0].name).toBe("Bullish Bronze");
    expect(leagueTiers[leagueTiers.length - 1].name).toBe("Wall Street Official");
  });

  it("describes promotion or demotion rules for every tier", () => {
    leagueTiers.forEach((tier) => {
      expect(tier.highlights).toBeTruthy();
      expect(tier.movement).toMatch(/promote|demoted|maintain/i);
    });
  });
});
