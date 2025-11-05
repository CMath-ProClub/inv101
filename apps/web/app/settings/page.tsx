import { Metadata } from "next";
import { ThemeGrid } from "../../components/settings/theme-grid";
import { Badge } from "../../components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";

export const metadata: Metadata = {
  title: "Settings",
  description: "Personalize your Invest101 experience",
};

export default function SettingsPage() {
  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <Badge variant="soft">Workspace Settings</Badge>
        <h1 className="text-4xl font-semibold text-text-primary">Tune your visual cockpit</h1>
        <p className="max-w-3xl text-lg text-text-secondary">
          Swap between curated palettes previewed below. Each selection gives you a brief preview window to confirm the match before we roll back.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Theme palettes</CardTitle>
          <CardDescription>
            Explore the full suite of Invest101 themes, each tuned for different lighting environments, accessibility needs, and brand feel.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ThemeGrid />
        </CardContent>
      </Card>
    </div>
  );
}
