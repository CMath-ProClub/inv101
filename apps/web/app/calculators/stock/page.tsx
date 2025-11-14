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
  title: "Stock Calculators",
  description:
    "Equity valuation, dividend, and intrinsic value calculators based on the stock prototype screens.",
};

const calculators = [
  "Dividend yield tracker from calc-stock-divyield.html.",
  "Intrinsic value calculator based on calc-stock-intrinsic.html.",
  "P/E scenario builder referencing calc-stock-pe.html.",
];

export default function StockCalculatorsPage() {
  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <Badge variant="soft">Calculators • Stock</Badge>
        <h1 className="text-4xl font-semibold text-text-primary">Equity valuation helpers</h1>
        <p className="max-w-3xl text-lg text-text-secondary">
          Styles, terminology, and prompts match the prototype calculators so investors can switch between environments without friction.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Included calculators</CardTitle>
          <CardDescription>
            Pulled directly from <code>calc-stock*.html</code> resources.
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
          <CardTitle>Integration status</CardTitle>
          <CardDescription>
            Data hooks will surface once the research API is complete.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StatusBanner
            status="loading"
            title="Equity calculators syncing"
            description="Prototype visuals are ready; the metrics populate after the next backend milestone."
          />
        </CardContent>
      </Card>
    </div>
  );
}
