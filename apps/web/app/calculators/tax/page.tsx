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
import { CapitalGainsCalculatorForm } from "../../../components/calculators/capital-gains-calculator-form";
import { NetProfitTaxForm } from "../../../components/calculators/net-profit-tax-form";

export const metadata: Metadata = {
  title: "Tax Calculators",
  description:
    "Capital gains and net profit calculators migrated from the tax prototype set.",
};

export default function TaxCalculatorsPage() {
  return (
    <div className="space-y-10">
      <BackLink href="/calculators" label="Back to calculators" />
      <header className="space-y-3">
        <Badge variant="soft">Calculators • Tax</Badge>
        <h1 className="text-4xl font-semibold text-text-primary">Tax planning helpers</h1>
        <p className="max-w-3xl text-lg text-text-secondary">
          Formatting, disclaimers, and helper copy match the prototypes so tax planning guidance feels consistent.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Capital gains estimator</CardTitle>
          <CardDescription>
            Direct port of <code>calc-tax-capitalgains.html</code> with bracket-aware rates.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CapitalGainsCalculatorForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Net profit after tax</CardTitle>
          <CardDescription>
            From <code>calc-tax-netprofit.html</code> complete with the helper to estimate effective rates.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NetProfitTaxForm />
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
