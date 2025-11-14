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
  title: "Core Calculators",
  description:
    "Compound interest, ROI, and volatility tools migrated from the calc-core prototype screens.",
};

const calculators = [
  "Compound growth panes from calc-core-compound.html.",
  "Risk/return snapshots ported from calc-core-riskreward.html.",
  "Volatility explorer referencing calc-core-volatility.html.",
];

export default function CoreCalculatorsPage() {
  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <Badge variant="soft">Calculators • Core</Badge>
        <h1 className="text-4xl font-semibold text-text-primary">Core calculator suite</h1>
        <p className="max-w-3xl text-lg text-text-secondary">
          These utilities keep the original formatting, helper copy, and callouts from the prototype so investor onboarding feels familiar.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Included tools</CardTitle>
          <CardDescription>
            Based on the <code>calc-core*.html</code> prototypes and shared styles.
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
          <CardTitle>Migration status</CardTitle>
          <CardDescription>
            Inputs and chart scaffolds are staged while we wire API-backed defaults.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StatusBanner
            status="loading"
            title="Calculator widgets syncing"
            description="Prototype layouts load next as soon as the data layer is hydrated."
          />
        </CardContent>
      </Card>
    </div>
  );
}
