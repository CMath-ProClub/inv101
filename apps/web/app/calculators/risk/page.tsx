import { Metadata } from "next";
import { Badge } from "../../../components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { StatusBanner } from "../../../components/ui/status-banner";

export const metadata: Metadata = {
  title: "Risk Calculators",
  description:
    "Kelly, VAR, and position sizing calculators carried over from the risk prototype set.",
};

const calculators = [
  "Kelly criterion flow from calc-risk-kelly.html.",
  "Position sizing helpers drawn from calc-risk-position.html.",
  "Value at risk explorer mirroring calc-risk-var.html formatting.",
];

export default function RiskCalculatorsPage() {
  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <Badge variant="soft">Calculators • Risk</Badge>
        <h1 className="text-4xl font-semibold text-text-primary">Risk management toolkit</h1>
        <p className="max-w-3xl text-lg text-text-secondary">
          These modules reuse the prototype layouts, warning callouts, and helper tooltips so risk coaching stays consistent.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Included calculators</CardTitle>
          <CardDescription>
            Migrated from <code>calc-risk*.html</code> and related scripts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-3 sm:grid-cols-3">
            {calculators.map((entry) => (
              <li
                key={entry}
                className="rounded-2xl border border-outline/20 bg-surface-muted/60 p-4 text-sm text-text-secondary"
              >
                {entry}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Implementation status</CardTitle>
          <CardDescription>
            Hooking into shared volatility data and Clerk preferences.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StatusBanner
            status="loading"
            title="Risk calculators queueing"
            description="We&apos;ll flip the switch once live market feeds and simulations are wired."
          />
        </CardContent>
      </Card>
    </div>
  );
}
