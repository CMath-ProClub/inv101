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
import { AssetRebalancerForm } from "../../../components/calculators/asset-rebalancer-form";
import { MptOptimizerForm } from "../../../components/calculators/mpt-optimizer-form";
import { AssetMixHelper } from "../../../components/calculators/asset-mix-helper";

export const metadata: Metadata = {
  title: "Asset Allocation Calculators",
  description:
    "Asset allocation and optimization workflows sourced from the asset prototype pages.",
};

export default function AssetCalculatorsPage() {
  return (
    <div className="space-y-10">
      <BackLink href="/calculators" label="Back to calculators" />
      <header className="space-y-3">
        <Badge variant="soft">Calculators • Asset</Badge>
        <h1 className="text-4xl font-semibold text-text-primary">Asset allocation lab</h1>
        <p className="max-w-3xl text-lg text-text-secondary">
          Layouts, legends, and helper text mirror the prototype so allocation workflows feel instantly familiar.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Asset allocation rebalancer</CardTitle>
          <CardDescription>
            Mirrors <code>calc-asset-allocation.html</code> so you can plug in current values and get exact trade tickets.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AssetRebalancerForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>MPT optimizer</CardTitle>
          <CardDescription>
            Lifted from <code>calc-asset-mpt.html</code> with the same risk toggles and Sharpe readout.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MptOptimizerForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Goal-based asset mix</CardTitle>
          <CardDescription>
            Inspired by the general helper in <code>calc-asset.html</code> for quick preset allocations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AssetMixHelper />
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
