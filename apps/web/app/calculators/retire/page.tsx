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
  title: "Retirement Calculators",
  description:
    "Retirement planning calculators migrated from the retire prototype pages.",
};

const calculators = [
  "401(k) trajectory planner based on calc-retire-401k.html.",
  "Savings runway estimator from calc-retire-savings.html.",
  "General retirement readiness flow referencing calc-retire.html.",
];

export default function RetirementCalculatorsPage() {
  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <Badge variant="soft">Calculators • Retire</Badge>
        <h1 className="text-4xl font-semibold text-text-primary">Retirement planning workspace</h1>
        <p className="max-w-3xl text-lg text-text-secondary">
          These calculators preserve the prototype phrasing, sliders, and scenario callouts while we wire them into live data.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Included calculators</CardTitle>
          <CardDescription>
            Reusing layouts from <code>calc-retire*.html</code> prototypes.
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
          <CardTitle>Status</CardTitle>
          <CardDescription>
            Tying into budgeting goals after the upcoming migration wave.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StatusBanner
            status="loading"
            title="Retirement calculators syncing"
            description="Prototype timelines and helper copy will go live after the budgeting module is ready."
          />
        </CardContent>
      </Card>
    </div>
  );
}
