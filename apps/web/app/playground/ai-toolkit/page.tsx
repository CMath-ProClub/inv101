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
  title: "Play the AI",
  description:
    "The AI sparring partner from play-ai.html, rebuilt with Clerk context and production telemetry.",
};

const highlights = [
  "Scenario prompts and response scoring replicate the play-ai.html prototype copy.",
  "Coach personas and difficulty ramps are ported from the play-the-ai scripts.",
  "Shared XP + streak integration so AI duels influence the global leaderboard.",
];

export default function PlayTheAIPage() {
  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <Badge variant="soft">Playground • AI Toolkit</Badge>
        <h1 className="text-4xl font-semibold text-text-primary">Challenge the AI coach</h1>
        <p className="max-w-3xl text-lg text-text-secondary">
          This module carries over the duel-format prompts, pacing, and scoring from the prototype so production users get the same coaching cadence.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>What&apos;s included</CardTitle>
          <CardDescription>
            Functional parity with <code>prototype/play-ai.html</code> and <code>play-the-ai.html</code> while modernizing data flow.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-3 sm:grid-cols-3">
            {highlights.map((item) => (
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
          <CardTitle>Integration status</CardTitle>
          <CardDescription>
            Dialogue trees now hydrate from Clerk profiles so the AI references user skill levels and recent drills.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StatusBanner
            status="loading"
            title="AI duel interface arriving"
            description="The duel UI lifts styles from the prototype and will surface once the conversation engine completes testing."
          />
        </CardContent>
      </Card>
    </div>
  );
}
