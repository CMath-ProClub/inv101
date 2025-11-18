import { Metadata } from "next";
import type { Route } from "next";
import {
  CreditCard,
  Handshake,
  LayoutDashboard,
  Newspaper,
  Settings,
  Trophy,
  UserCheck,
} from "lucide-react";
import { WorkspaceGrid, type WorkspaceNavItem } from "../../components/layout/workspace-grid";

export const metadata: Metadata = {
  title: "Profile",
  description:
    "Profile, friends, activity, newsletter, and subscription hubs migrated from the prototype workspace.",
};

const profileShortcuts: WorkspaceNavItem[] = [
  {
    title: "Overview",
    helper: "Identity",
    description: "Snapshot of your level, XP, and account metadata.",
    href: "/profile/overview" as Route,
    icon: UserCheck,
    accent: "bg-gradient-to-br from-emerald-500/20 via-transparent to-surface-card/95",
    span: "md:col-span-3",
  },
  {
    title: "Friends",
    helper: "Community",
    description: "Connections, invites, and accountability partners.",
    href: "/profile/friends" as Route,
    icon: Handshake,
    accent: "bg-gradient-to-br from-sky-500/20 via-transparent to-surface-card/95",
    span: "md:col-span-3",
  },
  {
    title: "Activity",
    helper: "Feed",
    description: "Recent streaks, simulator logs, and calculator runs.",
    href: "/profile/activity" as Route,
    icon: LayoutDashboard,
    accent: "bg-gradient-to-br from-amber-500/20 via-transparent to-surface-card/95",
    span: "md:col-span-3",
  },
  {
    title: "Newsletter",
    helper: "Preferences",
    description: "Market pulse emails and digests settings.",
    href: "/profile/newsletter" as Route,
    icon: Newspaper,
    accent: "bg-gradient-to-br from-fuchsia-500/20 via-transparent to-surface-card/95",
    span: "md:col-span-3",
  },
  {
    title: "Subscription",
    helper: "Billing",
    description: "Plan details, invoices, and upgrade paths.",
    href: "/profile/subscription" as Route,
    icon: CreditCard,
    accent: "bg-gradient-to-br from-purple-500/20 via-transparent to-surface-card/95",
    span: "md:col-span-3",
  },
  {
    title: "Settings",
    helper: "Workspace",
    description: "Theme, guardrails, and notification controls.",
    href: "/profile/settings" as Route,
    icon: Settings,
    accent: "bg-gradient-to-br from-slate-500/20 via-transparent to-surface-card/95",
    span: "md:col-span-3",
  },
  {
    title: "Achievements",
    helper: "XP",
    description: "Badges and league ladder inside the playground.",
    href: "/playground/achievements" as Route,
    icon: Trophy,
    accent: "bg-gradient-to-br from-rose-500/20 via-transparent to-surface-card/95",
    span: "md:col-span-6",
  },
];

export default function ProfilePage() {
  return (
    <div id="politician-tracker" className="space-y-8">
      <section className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-text-muted">Profile</p>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-4xl font-semibold text-text-primary">Workspace & identity</h1>
            <p className="text-sm text-text-secondary">
              Prioritize the essentials—overview, community, billing, and achievements each get their own tile.
            </p>
          </div>
          <span className="text-xs font-semibold uppercase tracking-[0.35em] text-text-muted">5–7 shortcuts</span>
        </div>
        <WorkspaceGrid items={profileShortcuts} className="md:auto-rows-[minmax(160px,1fr)]" />
      </section>
    </div>
  );
}
