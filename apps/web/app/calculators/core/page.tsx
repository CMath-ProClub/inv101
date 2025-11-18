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
import { CompoundInterestForm } from "../../../components/calculators/compound-interest-form";
import { RoiCalculatorForm } from "../../../components/calculators/roi-calculator-form";
import { VolatilityCalculatorForm } from "../../../components/calculators/volatility-calculator-form";

export const metadata: Metadata = {
  title: "Core Calculators",
  description:
    "Compound interest, ROI, and volatility tools migrated from the calc-core prototype screens.",
};

export default function CoreCalculatorsPage() {
  return (
    <div className="space-y-10">
      <BackLink href="/calculators" label="Back to calculators" />
      <header className="space-y-3">
        <Badge variant="soft">Calculators • Core</Badge>
        <h1 className="text-4xl font-semibold text-text-primary">Core calculator suite</h1>
        <p className="max-w-3xl text-lg text-text-secondary">
          These utilities keep the original formatting, helper copy, and callouts from the prototype so investor onboarding feels familiar.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Compound interest</CardTitle>
          <CardDescription>
            Replicates <code>calc-core-compound.html</code> with support for recurring contributions and multiple compounding cadences.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CompoundInterestForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Return on investment</CardTitle>
          <CardDescription>
            Lifted from <code>calc-core-roi.html</code> with annualized calculations for longer holding periods.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RoiCalculatorForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Volatility explorer</CardTitle>
          <CardDescription>
            Based on <code>calc-core-volatility.html</code> for quick standard deviation and annualized volatility reads.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <VolatilityCalculatorForm />
        </CardContent>
      </Card>
    </div>
  );
}
