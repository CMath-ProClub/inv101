import { Badge } from "../../components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { StatusBanner } from "../../components/ui/status-banner";

export default function LessonsPage() {
  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <Badge variant="soft">Learning Tracks</Badge>
        <h2 className="text-4xl font-semibold text-text-primary">
          Guided lessons that pair fundamentals with action
        </h2>
        <p className="max-w-3xl text-lg text-text-secondary">
          We&apos;re refreshing every Invest101 lesson with interactive summaries, calculators, and real market examples so new investors stay confident.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Updated curriculum queued</CardTitle>
          <CardDescription>
            Lesson content is moving into the new layout with checkpoints, flash cards, and drill-down tabs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StatusBanner
            status="loading"
            title="Lessons hub synchronizing"
            description="Interactive lesson modules will unlock after the knowledge base migration completes."
          />
        </CardContent>
      </Card>
    </div>
  );
}
