import { Metadata } from "next";
import { ThemeGrid } from "../../../components/settings/theme-grid";
import { ThemeSwitcher } from "../../../components/ui/theme-switcher";
import { Badge } from "../../../components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { cn } from "../../../lib/utils";

type ToggleSetting = {
  id: string;
  label: string;
  description: string;
  defaultChecked?: boolean;
  disabled?: boolean;
  meta?: string;
};

const notificationSettings: ToggleSetting[] = [
  {
    id: "push",
    label: "Push notifications",
    description: "Receive alerts for notable market swings and feature drops.",
    defaultChecked: true,
  },
  {
    id: "daily-pulse",
    label: "Daily Market Pulse email",
    description: "Briefing delivered each trading day with macro, earnings, and sentiment notes.",
    defaultChecked: true,
    disabled: true,
    meta: "Auto-enabled while you’re in challenge mode",
  },
  {
    id: "portfolio-alerts",
    label: "Portfolio alerts",
    description: "Ping me when watchlist names move more than 3% intraday.",
  },
];

const privacySettings: ToggleSetting[] = [
  {
    id: "profile-visibility",
    label: "Profile visibility",
    description: "Let other learners view your achievements and lesson streaks.",
    defaultChecked: true,
  },
  {
    id: "share-performance",
    label: "Share portfolio performance",
    description: "Show anonymized returns inside community leaderboards.",
  },
];

const guardrailChecklist = [
  "Cross-check every AI summary with at least one trusted market feed before acting.",
  "Treat hype-heavy social posts as noise; we intentionally down-rank clickbait signals.",
  "Pause before trading on emotion—use the worksheet prompts to separate sentiment from fundamentals.",
];

const guardrailFaq = [
  {
    title: "Does the AI recommend specific trades?",
    answer:
      "No. Sentiment experiments use static practice scenarios so you can rehearse analysis without live-market pressure.",
  },
  {
    title: "What if a headline sounds too confident?",
    answer:
      "Assume it is marketing until you verify fundamentals, earnings calls, and risk guidelines. Confidence never equals certainty.",
  },
];

export const metadata: Metadata = {
  title: "Profile Settings",
  description: "Control notifications, privacy, guardrails, and themes from one workspace.",
};

function ToggleRow({ setting }: { setting: ToggleSetting }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 border-b border-outline/15 pb-4 last:border-b-0 last:pb-0">
      <div className="max-w-xl space-y-1">
        <p className="text-base font-semibold text-text-primary">{setting.label}</p>
        <p className="text-sm text-text-secondary">{setting.description}</p>
        {setting.meta ? <p className="text-xs uppercase tracking-[0.35em] text-text-muted">{setting.meta}</p> : null}
      </div>
      <label className={cn("relative inline-flex h-7 w-12 cursor-pointer items-center", setting.disabled && "opacity-40")}> 
        <input
          id={setting.id}
          type="checkbox"
          className="peer sr-only"
          defaultChecked={setting.defaultChecked}
          disabled={setting.disabled}
        />
        <span
          className="absolute inset-0 rounded-full border border-outline/40 bg-surface-muted/70 transition peer-checked:border-accent-primary/50 peer-checked:bg-accent-primary/40"
          aria-hidden="true"
        />
        <span className="absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow transition peer-checked:translate-x-5" aria-hidden="true" />
        <span className="sr-only">Toggle {setting.label}</span>
      </label>
    </div>
  );
}

export default function ProfileSettingsPage() {
  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <Badge variant="soft">Profile · Settings</Badge>
        <h1 className="text-4xl font-semibold text-text-primary">Personalize your Investing101 hub</h1>
        <p className="max-w-4xl text-lg text-text-secondary">
          Control notifications, privacy, AI tool guardrails, and visual themes without hopping between tabs. Your selections sync across web and mobile automatically.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Decide which nudges keep you accountable and which stay muted.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {notificationSettings.map((setting) => (
              <ToggleRow key={setting.id} setting={setting} />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Privacy</CardTitle>
            <CardDescription>Control how your profile and performance show up to other learners.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {privacySettings.map((setting) => (
              <ToggleRow key={setting.id} setting={setting} />
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>AI Toolkit guardrails</CardTitle>
          <CardDescription>
            Sentiment experiments are practice reps—not trade ideas. These reminders keep analysis grounded in facts.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <ul className="space-y-3 text-sm text-text-secondary">
            {guardrailChecklist.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-accent-primary" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <div className="space-y-3 rounded-2xl border border-outline/20 bg-surface-muted/40 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-text-muted">faq</p>
            {guardrailFaq.map((item) => (
              <details key={item.title} className="rounded-2xl border border-outline/15 bg-surface-card/60 p-4">
                <summary className="cursor-pointer text-sm font-semibold text-text-primary">{item.title}</summary>
                <p className="mt-2 text-sm text-text-secondary">{item.answer}</p>
              </details>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Theme selector</CardTitle>
          <CardDescription>
            Start with the dropdown preview, then pick a palette from the organized grid—light options on the left, dark options on the right.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <ThemeSwitcher />
          <ThemeGrid />
        </CardContent>
      </Card>
    </div>
  );
}
