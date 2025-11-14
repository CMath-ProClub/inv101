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
  title: "Activity Feed",
  description:
    "Activity feed timeline migrated from activity-feed.html with streak and XP highlights.",
};

const details = [
  "Timeline bubbles and timestamp formatting from activity-feed.html.",
  "Badge + XP callouts aligned with gamification-widget.js toasts.",
  "Filter chips and layout spacing maintained from the prototype.",
];

export default function ActivityFeedPage() {
  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <Badge variant="soft">Profile • Activity</Badge>
        <h1 className="text-4xl font-semibold text-text-primary">Activity feed</h1>
        <p className="max-w-3xl text-lg text-text-secondary">
          Stream formatting, copy, and cadence are lifted directly from the prototype so updates feel familiar while we wire real data.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Prototype anchors</CardTitle>
          <CardDescription>
            The feed references <code>activity-feed.html</code> for design and tone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-3 sm:grid-cols-3">
            {details.map((item) => (
              <li
                key={item}
                className="rounded-2xl border border-outline/20 bg-surface-muted/60 p-4 text-sm text-text-secondary"
              >
                {item}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Status</CardTitle>
          <CardDescription>
            We&apos;re connecting the feed to portfolio and playground events next.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StatusBanner
            status="loading"
            title="Activity feed syncing"
            description="Prototype timeline will populate once event ingestion is fully live."
          />
        </CardContent>
      </Card>
    </div>
  );
}
