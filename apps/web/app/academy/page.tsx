import { Badge } from "../../components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { StatusBanner } from "../../components/ui/status-banner";

export default function AcademyPage() {
  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <Badge variant="soft">Invest101 Academy</Badge>
        <h2 className="text-4xl font-semibold text-text-primary">
          Workshops, office hours, and community deep dives
        </h2>
        <p className="max-w-3xl text-lg text-text-secondary">
          The academy combines live instruction with self-paced projects so motivated investors can practice with real data and tooling.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Community programming underway</CardTitle>
          <CardDescription>
            We&apos;re lining up the events calendar, cohort roadmap, and resource library for launch.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StatusBanner
            status="loading"
            title="Academy portal onboarding"
            description="Event registration and replays will appear here soon."
          />
        </CardContent>
      </Card>
    </div>
  );
}
