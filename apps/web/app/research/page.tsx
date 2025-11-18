import { Badge } from "../../components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { StatusBanner } from "../../components/ui/status-banner";

export default function ResearchPage() {
  return (
    <div id="recommendations" className="space-y-10">
      <header className="space-y-3">
        <Badge variant="soft">Research Lab</Badge>
        <h2 className="text-4xl font-semibold text-text-primary">
          AI-accelerated filings, transcripts, and scenario testing
        </h2>
        <p className="max-w-3xl text-lg text-text-secondary">
          The research cockpit links premium transcripts, structured filings, and Investing101 explainers so you can move from questions to conviction in minutes.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Interface in progress</CardTitle>
          <CardDescription>
            We&apos;re exposing the insights API with copilot-assisted prompts and strategy templates.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StatusBanner
            status="loading"
            title="Research workspace calibrating"
            description="Document intelligence, semantic ranking, and answer synthesis will appear after the next milestone release."
          />
        </CardContent>
      </Card>
    </div>
  );
}
