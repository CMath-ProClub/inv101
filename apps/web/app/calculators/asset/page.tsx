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
  title: "Asset Allocation Calculators",
  description:
    "Asset allocation and optimization workflows sourced from the asset prototype pages.",
};

const calculators = [
  "Modern portfolio theory grid from calc-asset-mpt.html.",
  "Allocation balancing flows from calc-asset-allocation.html.",
  "General asset mix helper based on calc-asset.html.",
];

export default function AssetCalculatorsPage() {
  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <Badge variant="soft">Calculators • Asset</Badge>
        <h1 className="text-4xl font-semibold text-text-primary">Asset allocation lab</h1>
        <p className="max-w-3xl text-lg text-text-secondary">
          Layouts, legends, and helper text mirror the prototype so allocation workflows feel instantly familiar.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Included calculators</CardTitle>
          <CardDescription>
            Built from the <code>calc-asset*.html</code> family.
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
            Data connectors to portfolio accounts land after the simulator migration completes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StatusBanner
            status="loading"
            title="Allocation tools staging"
            description="Prototype panels are lined up and will render once the data feeds are approved."
          />
        </CardContent>
      </Card>
    </div>
  );
}
