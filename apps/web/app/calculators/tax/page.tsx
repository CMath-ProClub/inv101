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
  title: "Tax Calculators",
  description:
    "Capital gains and net profit calculators migrated from the tax prototype set.",
};

const calculators = [
  "Capital gains estimator from calc-tax-capitalgains.html.",
  "Net profit calculator based on calc-tax-netprofit.html.",
  "General tax planning layout referencing calc-tax.html.",
];

export default function TaxCalculatorsPage() {
  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <Badge variant="soft">Calculators • Tax</Badge>
        <h1 className="text-4xl font-semibold text-text-primary">Tax planning helpers</h1>
        <p className="max-w-3xl text-lg text-text-secondary">
          Formatting, disclaimers, and helper copy match the prototypes so tax planning guidance feels consistent.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Included calculators</CardTitle>
          <CardDescription>
            Derived from <code>calc-tax*.html</code> resources.
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
            Awaiting integrations with brokerage importers and planning APIs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StatusBanner
            status="loading"
            title="Tax calculators staging"
            description="Prototype layouts will show once the input schema is finalized."
          />
        </CardContent>
      </Card>
    </div>
  );
}
