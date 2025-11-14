import { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";
import type { ComponentType } from "react";
import {
  ArrowUpRight,
  CreditCard,
  Handshake,
  LayoutDashboard,
  Newspaper,
  Settings,
  Trophy,
  UserCheck,
} from "lucide-react";
import { Badge } from "../../components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { leagueTiers } from "../../lib/league-tiers";

export const metadata: Metadata = {
  title: "Profile",
  description:
    "Profile, friends, activity, newsletter, and subscription hubs migrated from the prototype workspace.",
};

type ProfileLink = {
  title: string;
  description: string;
  href: Route;
  tag: string;
  icon: ComponentType<{ className?: string }>;
};

const links: ProfileLink[] = [
  {
    title: "Profile overview",
    description: "Profile-main-enhanced.html features (avatar upload, ID card, stats).",
    href: "/profile/overview" as Route,
    tag: "Identity",
    icon: UserCheck,
  },
  {
    title: "Friends & social",
    description: "Search, requests, and status indicators from friends-enhanced.html.",
    href: "/profile/friends" as Route,
    tag: "Community",
    icon: Handshake,
  },
  {
    title: "Activity feed",
    description: "Activity-feed prototype stream for XP, badges, and community updates.",
    href: "/profile/activity" as Route,
    tag: "Feed",
    icon: LayoutDashboard,
  },
  {
    title: "Achievements",
    description: "Badges and XP ledger unified with the playground achievements hub.",
    href: "/playground/achievements" as Route,
    tag: "Progress",
    icon: Trophy,
  },
  {
    title: "Newsletter",
    description: "Newsletter.html flow for preferences and content previews.",
    href: "/profile/newsletter" as Route,
    tag: "Communications",
    icon: Newspaper,
  },
  {
    title: "Subscription",
    description: "Subscription prototype copy ported to production for billing and plan upgrades.",
    href: "/profile/subscription" as Route,
    tag: "Billing",
    icon: CreditCard,
  },
  {
    title: "Settings",
    description: "Theme and workspace preferences already live in Settings.",
    href: "/settings" as Route,
    tag: "Workspace",
    icon: Settings,
  },
];

export default function ProfilePage() {
  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <Badge variant="soft">Workspace</Badge>
        <h1 className="text-4xl font-semibold text-text-primary">Profile & community hub</h1>
        <p className="max-w-3xl text-lg text-text-secondary">
          Every card routes to the production implementation that mirrors formatting, copy, and flows from the prototype profile system.
        </p>
      </header>

      <section className="grid gap-6 lg:grid-cols-2">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <Card
              key={link.title}
              className="group border-outline/20 bg-surface-muted/60 transition hover:border-accent-primary/60 hover:bg-surface-card/80"
            >
              <CardHeader className="flex flex-col gap-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.35em] text-accent-secondary">
                      {link.tag}
                    </p>
                    <CardTitle>{link.title}</CardTitle>
                    <CardDescription>{link.description}</CardDescription>
                  </div>
                  <Icon className="h-10 w-10 text-accent-primary" aria-hidden="true" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <Link
                  href={link.href}
                  aria-label={`Open ${link.title}`}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-accent-primary transition hover:gap-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"
                >
                  Open section
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <Card>
        <CardHeader>
          <CardTitle>League ladder overview</CardTitle>
          <CardDescription>
            The same Bullish Bronze → Wall Street Official tiers shown in Achievements so community + profile views stay in sync.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 lg:grid-cols-2">
            {leagueTiers.map((tier) => (
              <div
                key={tier.name}
                className="rounded-2xl border border-outline/20 bg-surface-muted/60 p-4"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-accent-secondary">{tier.name}</p>
                <p className="mt-1 text-sm font-semibold text-text-primary">{tier.xpRange}</p>
                <p className="mt-2 text-sm text-text-secondary">{tier.highlights}</p>
                <div className="mt-3 rounded-xl border border-dashed border-outline/30 bg-surface-base/60 p-3 text-xs text-text-secondary">
                  {tier.movement}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
