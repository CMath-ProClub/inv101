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
  title: "Newsletter Preferences",
  description:
    "Newsletter settings referencing newsletter.html with Clerk profile linkage.",
};

const highlights = [
  "Subscription toggles and preview copy ported from newsletter.html.",
  "Topic chips styled with shared-ui.css tokens.",
  "Delivery cadence reminders preserved from the prototype layout.",
];

export default function NewsletterPage() {
  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <Badge variant="soft">Profile • Newsletter</Badge>
        <h1 className="text-4xl font-semibold text-text-primary">Newsletter settings</h1>
        <p className="max-w-3xl text-lg text-text-secondary">
          Copy, layout, and callouts match the prototype version so investors recognize the flow when it launches.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Prototype alignment</CardTitle>
          <CardDescription>
            Referencing <code>newsletter.html</code> for formatting, copy, and iconography.
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
            Waiting on email infrastructure wiring before enabling toggles.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StatusBanner
            status="loading"
            title="Newsletter preferences syncing"
            description="Prototype panels will go live once the email service is connected."
          />
        </CardContent>
      </Card>
    </div>
  );
}
