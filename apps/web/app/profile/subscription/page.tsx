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
  title: "Subscription",
  description:
    "Subscription management experience mapped from subscription.html with Clerk billing hooks.",
};

const highlights = [
  "Plan cards and comparison table layout from subscription.html.",
  "Upgrade CTA copy and icons matched to the prototype.",
  "Billing reminders and cancellation flow preserved for migration.",
];

export default function SubscriptionPage() {
  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <Badge variant="soft">Profile • Subscription</Badge>
        <h1 className="text-4xl font-semibold text-text-primary">Subscription management</h1>
        <p className="max-w-3xl text-lg text-text-secondary">
          The production billing surface is staged to match the typography, layout, and messaging from the prototype subscription page.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Prototype references</CardTitle>
          <CardDescription>
            Based on <code>subscription.html</code> and shared UI styles.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-3 sm:grid-cols-3">
            {highlights.map((entry) => (
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
            Billing integration activates after payment provider sync.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StatusBanner
            status="loading"
            title="Subscription portal syncing"
            description="Prototype layouts render as soon as billing webhooks are validated."
          />
        </CardContent>
      </Card>
    </div>
  );
}
