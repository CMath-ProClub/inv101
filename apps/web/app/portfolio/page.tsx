import { Badge } from "../../components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { StatusBanner } from "../../components/ui/status-banner";

export default function PortfolioPage() {
  return (
    <div id="index-comparison" className="space-y-10">
      <header className="space-y-3">
        <Badge variant="soft">Portfolio Intelligence</Badge>
        <h2 className="text-4xl font-semibold text-text-primary">
          Track allocations, drift, and scenario plans
        </h2>
        <p className="max-w-3xl text-lg text-text-secondary">
          We&apos;re finalizing the portfolio modeler so you can benchmark performance, flag risk exposure, and receive AI generated rebalancing prompts in real time.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Coming very soon</CardTitle>
          <CardDescription>
            We&apos;re wiring the Atlas data stores to drive personalized dashboards and portfolio diagnostics.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StatusBanner
            status="loading"
            title="Portfolio analytics are provisioning"
            description="Live positions, risk analysis, and drift monitors arrive after the next deployment window."
          />
        </CardContent>
      </Card>
    </div>
  );
}
