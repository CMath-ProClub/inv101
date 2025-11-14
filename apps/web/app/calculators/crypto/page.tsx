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
  title: "Crypto Calculators",
  description:
    "Crypto mining and staking calculators migrated from the crypto prototype files.",
};

const calculators = [
  "Mining profitability panel from calc-crypto-mining.html.",
  "Staking yield estimator based on calc-crypto-staking.html.",
  "General crypto toolkit referencing calc-crypto.html.",
];

export default function CryptoCalculatorsPage() {
  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <Badge variant="soft">Calculators • Crypto</Badge>
        <h1 className="text-4xl font-semibold text-text-primary">Crypto toolkit</h1>
        <p className="max-w-3xl text-lg text-text-secondary">
          The calculators reuse the prototype layouts, warnings, and helper copy so crypto coverage lands with the same polish.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Included calculators</CardTitle>
          <CardDescription>
            Sourced from <code>calc-crypto*.html</code>.
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
