import { Metadata } from "next";
import { BackLink } from "../../../components/layout/back-link";
import { Badge } from "../../../components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { KellyCalculatorForm } from "../../../components/calculators/kelly-calculator-form";
import { PositionSizingForm } from "../../../components/calculators/position-sizing-form";
import { VarCalculatorForm } from "../../../components/calculators/var-calculator-form";

export const metadata: Metadata = {
  title: "Risk Calculators",
  description:
    "Kelly, VAR, and position sizing calculators carried over from the risk prototype set.",
};

export default function RiskCalculatorsPage() {
  return (
    <div className="space-y-10">
      <BackLink href="/calculators" label="Back to calculators" />
      <header className="space-y-3">
        <Badge variant="soft">Calculators • Risk</Badge>
        <h1 className="text-4xl font-semibold text-text-primary">Risk management toolkit</h1>
        <p className="max-w-3xl text-lg text-text-secondary">
          These modules reuse the prototype layouts, warning callouts, and helper tooltips so risk coaching stays consistent.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Kelly criterion</CardTitle>
          <CardDescription>
            Live port of <code>calc-risk-kelly.html</code> with fractional sizing controls and bankroll-aware outputs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <KellyCalculatorForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Position sizing</CardTitle>
          <CardDescription>
            Mirrors <code>calc-risk-position.html</code> so percent-risk workflows feel identical to the prototype.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PositionSizingForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Portfolio VaR</CardTitle>
          <CardDescription>
            Based on <code>calc-risk-var.html</code> for day, week, month, or year risk reads at common confidence levels.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <VarCalculatorForm />
        </CardContent>
      </Card>
    </div>
  );
}
