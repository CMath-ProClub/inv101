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
import { StatusBanner } from "../../../components/ui/status-banner";
import { IntrinsicValueCalculatorForm } from "../../../components/calculators/intrinsic-value-calculator-form";
import { DividendYieldCalculatorForm } from "../../../components/calculators/dividend-yield-calculator-form";
import { PeRatioCalculatorForm } from "../../../components/calculators/pe-ratio-calculator-form";

export const metadata: Metadata = {
  title: "Stock Calculators",
  description:
    "Equity valuation, dividend, and intrinsic value calculators based on the stock prototype screens.",
};

export default function StockCalculatorsPage() {
  return (
    <div className="space-y-10">
      <BackLink href="/calculators" label="Back to calculators" />
      <header className="space-y-3">
        <Badge variant="soft">Calculators • Stock</Badge>
        <h1 className="text-4xl font-semibold text-text-primary">Equity valuation helpers</h1>
        <p className="max-w-3xl text-lg text-text-secondary">
          Styles, terminology, and prompts match the prototype calculators so investors can switch between environments without friction.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Dividend yield tracker</CardTitle>
          <CardDescription>
            Ported from <code>calc-stock-divyield.html</code> with the same helper copy and yield bands.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DividendYieldCalculatorForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Intrinsic value (DCF)</CardTitle>
          <CardDescription>
            Mirrors <code>calc-stock-intrinsic.html</code> including the advanced cash/debt controls.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <IntrinsicValueCalculatorForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>P/E and PEG scenarios</CardTitle>
          <CardDescription>
            Based on <code>calc-stock-pe.html</code> to keep heuristics identical to the prototype.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PeRatioCalculatorForm />
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
