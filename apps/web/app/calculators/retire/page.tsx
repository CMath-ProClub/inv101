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
import { K401GrowthCalculatorForm } from "../../../components/calculators/k401-growth-calculator-form";
import { RetirementReadinessForm } from "../../../components/calculators/retirement-readiness-form";

export const metadata: Metadata = {
  title: "Retirement Calculators",
  description:
    "Retirement planning calculators migrated from the retire prototype pages.",
};

export default function RetirementCalculatorsPage() {
  return (
    <div className="space-y-10">
      <BackLink href="/calculators" label="Back to calculators" />
      <header className="space-y-3">
        <Badge variant="soft">Calculators • Retire</Badge>
        <h1 className="text-4xl font-semibold text-text-primary">Retirement planning workspace</h1>
        <p className="max-w-3xl text-lg text-text-secondary">
          These calculators preserve the prototype phrasing, sliders, and scenario callouts while we wire them into live data.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>401(k) growth simulator</CardTitle>
          <CardDescription>
            Replicates <code>calc-retire-401k.html</code> with employer matching math and the “free money” framing.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <K401GrowthCalculatorForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Retirement readiness</CardTitle>
          <CardDescription>
            Ported from <code>calc-retire-savings.html</code> to keep the sustainable-income vs. goal guidance.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RetirementReadinessForm />
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
