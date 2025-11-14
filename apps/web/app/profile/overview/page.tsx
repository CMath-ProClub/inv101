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
import { fetchAuthedApi } from "../../../lib/api";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Profile Overview",
  description:
    "Profile main page that reflects the profile-main-enhanced prototype with Clerk sessions.",
};

type ProfileResponse = {
  success: boolean;
  user: {
    id: string;
    username: string;
    displayName: string;
    email: string;
    bio?: string;
    avatar?: string;
    location?: string;
    website?: string;
    isPublic: boolean;
    provider: string;
    createdAt: string;
    totalTrades: number;
    portfolioValue: number;
    performancePercent: number;
    rank?: number;
    badges: string[];
    followingCount: number;
    followersCount: number;
  };
};

const highlights = [
  "Avatar upload + preview from profile-main-enhanced.html.",
  "Sharable user ID card with copy-to-clipboard logic.",
  "Stats dashboard covering education progress, achievements, and high scores.",
];

function formatDate(value?: string) {
  if (!value) return null;
  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return null;
  }
}

function formatCurrency(value?: number) {
  const safeValue = Number.isFinite(value) ? value! : 0;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(safeValue);
}

function formatPercent(value?: number) {
  const safeValue = Number.isFinite(value) ? value! : 0;
  return `${safeValue.toFixed(2)}%`;
}

export default async function ProfileOverviewPage() {
  const profileResponse = await fetchAuthedApi<ProfileResponse>("/api/profile/me", {
    revalidateSeconds: 60,
  });

  const profile = profileResponse?.success ? profileResponse.user : null;
  const joinedDate = formatDate(profile?.createdAt);

  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <Badge variant="soft">Profile</Badge>
        <h1 className="text-4xl font-semibold text-text-primary">Profile overview</h1>
        <p className="max-w-3xl text-lg text-text-secondary">
          The production profile retains the same structure, typography, and microcopy from the enhanced prototype while layering in Clerk identity.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Feature parity</CardTitle>
          <CardDescription>
            Directly mapped from <code>profile-main-enhanced.html</code> with Clerk-aware session state.
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

      {profile ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Profile snapshot</CardTitle>
              <CardDescription>
                Identity, reach, and metadata synced from <code className="rounded bg-surface-muted/80 px-1.5 py-0.5 text-xs">/api/profile/me</code>.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border border-outline/20 bg-surface-muted/60 p-4">
                  <dt className="text-xs font-semibold uppercase tracking-[0.28em] text-accent-secondary">Display name</dt>
                  <dd className="mt-2 text-2xl font-semibold text-text-primary">{profile.displayName}</dd>
                  <dd className="text-xs text-text-muted">@{profile.username}</dd>
                </div>
                <div className="rounded-2xl border border-outline/20 bg-surface-muted/60 p-4">
                  <dt className="text-xs font-semibold uppercase tracking-[0.28em] text-accent-secondary">Followers</dt>
                  <dd className="mt-2 text-2xl font-semibold text-text-primary">{profile.followersCount}</dd>
                  <dd className="text-xs text-text-muted">Following {profile.followingCount}</dd>
                </div>
                <div className="rounded-2xl border border-outline/20 bg-surface-muted/60 p-4">
                  <dt className="text-xs font-semibold uppercase tracking-[0.28em] text-accent-secondary">Joined</dt>
                  <dd className="mt-2 text-2xl font-semibold text-text-primary">{joinedDate ?? "--"}</dd>
                  <dd className="text-xs text-text-muted">Provider: {profile.provider}</dd>
                </div>
                <div className="rounded-2xl border border-outline/20 bg-surface-muted/60 p-4">
                  <dt className="text-xs font-semibold uppercase tracking-[0.28em] text-accent-secondary">Badges</dt>
                  <dd className="mt-2 text-2xl font-semibold text-text-primary">{profile.badges.length}</dd>
                  <dd className="text-xs text-text-muted">XP milestones synced with achievements</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance metrics</CardTitle>
              <CardDescription>
                Portfolio summary values reflected from the simulator ledger.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border border-outline/20 bg-surface-muted/60 p-4">
                  <dt className="text-xs font-semibold uppercase tracking-[0.28em] text-accent-secondary">Total trades</dt>
                  <dd className="mt-2 text-2xl font-semibold text-text-primary">{profile.totalTrades}</dd>
                </div>
                <div className="rounded-2xl border border-outline/20 bg-surface-muted/60 p-4">
                  <dt className="text-xs font-semibold uppercase tracking-[0.28em] text-accent-secondary">Portfolio value</dt>
                  <dd className="mt-2 text-2xl font-semibold text-text-primary">{formatCurrency(profile.portfolioValue)}</dd>
                </div>
                <div className="rounded-2xl border border-outline/20 bg-surface-muted/60 p-4">
                  <dt className="text-xs font-semibold uppercase tracking-[0.28em] text-accent-secondary">Performance</dt>
                  <dd className={`mt-2 text-2xl font-semibold ${profile.performancePercent >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                    {formatPercent(profile.performancePercent)}
                  </dd>
                </div>
                <div className="rounded-2xl border border-outline/20 bg-surface-muted/60 p-4">
                  <dt className="text-xs font-semibold uppercase tracking-[0.28em] text-accent-secondary">Visibility</dt>
                  <dd className="mt-2 text-2xl font-semibold text-text-primary">{profile.isPublic ? "Public" : "Private"}</dd>
                  <dd className="text-xs text-text-muted">Editable in profile settings</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Status</CardTitle>
          <CardDescription>
            Avatar uploads and stats now read from the production datastore via Clerk-authenticated requests.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {profile ? (
            <div className="space-y-2 text-sm text-text-secondary">
              <p>
                Profile widgets are fetching data from <code className="rounded bg-surface-muted/80 px-1.5 py-0.5 text-xs">/api/profile/me</code> with your Clerk session token.
              </p>
              <p>Use the social tiles to invite friends or update your bio from the live dataset.</p>
            </div>
          ) : (
            <StatusBanner
              status="offline"
              title="Profile service unavailable"
              description="We&apos;ll restore live profile data as soon as the API responds."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
