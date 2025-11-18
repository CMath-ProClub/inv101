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
import { StakingYieldCalculatorForm } from "../../../components/calculators/staking-yield-calculator-form";
import { MiningProfitabilityForm } from "../../../components/calculators/mining-profitability-form";

export const metadata: Metadata = {
  title: "Crypto Calculators",
  description:
    "Crypto mining and staking calculators migrated from the crypto prototype files.",
};

export default function CryptoCalculatorsPage() {
  return (
    <div className="space-y-10">
      <BackLink href="/calculators" label="Back to calculators" />
      <header className="space-y-3">
        <Badge variant="soft">Calculators • Crypto</Badge>
        <h1 className="text-4xl font-semibold text-text-primary">Crypto toolkit</h1>
        <p className="max-w-3xl text-lg text-text-secondary">
          The calculators reuse the prototype layouts, warnings, and helper copy so crypto coverage lands with the same polish.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Staking yield</CardTitle>
          <CardDescription>
            Mirrors <code>calc-crypto-staking.html</code> to show rewards, USD value, and effective APY.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StakingYieldCalculatorForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mining profitability</CardTitle>
          <CardDescription>
            Straight from <code>calc-crypto-mining.html</code> so hash-rate math stays recognizable.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MiningProfitabilityForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Status</CardTitle>
          <CardDescription>
            Awaiting market data feeds and volatility adjustments before public launch.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StatusBanner
            status="loading"
            title="Crypto calculators syncing"
            description="Prototype flows are staged and will light up once pricing data is wired."
          />
        </CardContent>
      </Card>
    </div>
  );
}
