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
  title: "Friends",
  description:
    "Friends list, requests, and search features migrated from the friends-enhanced prototype.",
};

const modules = [
  "Search-as-you-type from friends-enhanced.html.",
  "Request acceptance/decline cards with status badges.",
  "Online indicators and presence pills wired to Clerk sessions.",
];

export default function FriendsPage() {
  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <Badge variant="soft">Profile • Friends</Badge>
        <h1 className="text-4xl font-semibold text-text-primary">Friends & community</h1>
        <p className="max-w-3xl text-lg text-text-secondary">
          The production friends hub mirrors the grid, tabs, and request flows from the enhanced prototype so upgrade is seamless.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Feature lineup</CardTitle>
          <CardDescription>
            Built from <code>friends-enhanced.html</code> and supporting scripts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-3 sm:grid-cols-3">
            {modules.map((module) => (
              <li
                key={module}
                className="rounded-2xl border border-outline/20 bg-surface-muted/60 p-4 text-sm text-text-secondary"
              >
                {module}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Status</CardTitle>
          <CardDescription>
            Awaiting Clerk relationship APIs before enabling live invites.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StatusBanner
            status="loading"
            title="Friends module syncing"
            description="Prototype layouts unlock once the backend friend graph is activated."
          />
        </CardContent>
      </Card>
    </div>
  );
}
