"use client";

import Link from "next/link";
import { SignIn } from "@clerk/nextjs";
import type { SignInProps } from "@clerk/types";

export default function SignInPage() {
  const signInAppearance: SignInProps["appearance"] = {
    elements: {
      card: "!shadow-none !border-none !bg-transparent !p-0",
      formButtonPrimary:
        "bg-accent-primary hover:bg-accent-secondary text-white font-semibold transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-secondary/60",
      headerSubtitle: "text-text-secondary text-sm",
      headerTitle: "text-text-primary text-2xl font-semibold",
      identityPreview: "bg-surface-muted/60 border border-outline/20",
      formFieldLabel: "text-sm font-medium text-text-secondary",
      formFieldInput:
        "text-sm bg-surface-base/60 border border-outline/15 focus:border-accent-primary/70 focus:ring-0 focus-visible:border-accent-primary/90",
      formHeader: "space-y-1",
      form: "space-y-4",
      footer: "text-xs text-text-muted",
      dividerText: "text-xs text-text-muted",
      socialButtonsBlockButton:
        "bg-surface-base/60 border border-outline/20 text-text-primary transition hover:border-outline/35 hover:bg-surface-muted/50",
      socialButtonsIconButton:
        "border border-outline/20 text-text-primary transition hover:border-outline/35",
    },
    variables: {
      colorPrimary: "rgb(var(--accent-primary) / 1)",
      colorText: "rgb(var(--text-primary) / 1)",
      colorInputBackground: "rgb(var(--surface-base) / 0.6)",
      colorInputText: "rgb(var(--text-primary) / 1)",
      borderRadius: "18px",
      fontSize: "15px",
      spacingUnit: "10",
    },
    layout: {
      socialButtonsPlacement: "bottom",
      socialButtonsVariant: "iconButton",
    },
  };

  return (
    <div className="relative isolate flex min-h-[calc(100vh-var(--header-height))] w-full items-center justify-center overflow-hidden px-4 py-16 sm:px-8">
      <div className="pointer-events-none absolute inset-0 -z-20" aria-hidden="true">
        <div
          className="absolute inset-0 opacity-80"
          style={{
            background:
              "radial-gradient(circle at 18% 18%, rgb(var(--accent-primary) / 0.16) 0%, transparent 58%), radial-gradient(circle at 82% 30%, rgb(var(--accent-secondary) / 0.14) 0%, transparent 55%)",
          }}
        />
      </div>

      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <div
          className="animate-orb-slow absolute left-[6%] top-[12%] h-56 w-56 rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(circle at center, rgb(var(--accent-primary) / 0.4) 0%, rgb(var(--accent-primary) / 0) 68%)",
          }}
        />
        <div
          className="animate-orb-medium absolute right-[8%] top-[18%] h-72 w-72 rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(circle at center, rgb(var(--accent-secondary) / 0.38) 0%, rgb(var(--accent-secondary) / 0) 70%)",
          }}
        />
        <div
          className="animate-orb-fast absolute bottom-[12%] left-1/2 h-64 w-64 -translate-x-1/2 rounded-full blur-[110px]"
          style={{
            background:
              "radial-gradient(circle at center, rgb(var(--accent-tertiary) / 0.32) 0%, rgb(var(--accent-tertiary) / 0) 65%)",
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-5xl">
        <div className="relative overflow-hidden rounded-[32px] border border-outline/15 bg-surface-elevated/70 shadow-card backdrop-blur-2xl">
          <div className="absolute inset-x-20 top-0 h-px bg-gradient-to-r from-transparent via-accent-primary/60 to-transparent" />
          <div className="grid gap-10 px-7 py-10 sm:px-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,380px)]">
            <div className="flex flex-col gap-8">
              <div className="space-y-3 text-left">
                <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-accent-secondary">Account Access</p>
                <h1 className="text-3xl font-semibold text-text-primary sm:text-[2.1rem]">Welcome back to Investing101</h1>
                <p className="text-base text-text-secondary">
                  Sign in with your Clerk account to continue crafting smarter investing habits, sync personalized lessons,
                  and stay aligned with your portfolio roadmap across every device.
                </p>
              </div>

              <div className="rounded-3xl border border-outline/10 bg-surface-card/70 p-5 shadow-inner backdrop-blur">
                <div className="grid gap-4 text-sm text-text-secondary sm:grid-cols-2">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-outline/30 bg-surface-muted/60 text-[0.65rem] font-semibold text-accent-secondary">
                      01
                    </span>
                    <p>
                      <span className="font-medium text-text-primary">Synchronize progress</span>
                      <br />
                      Seamlessly resume watchlists and simulator milestones wherever you log in.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-outline/30 bg-surface-muted/60 text-[0.65rem] font-semibold text-accent-secondary">
                      02
                    </span>
                    <p>
                      <span className="font-medium text-text-primary">Tailored insights</span>
                      <br />
                      Receive curated briefings and goal-based nudges tuned to your investing style.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-outline/30 bg-surface-muted/60 text-[0.65rem] font-semibold text-accent-secondary">
                      03
                    </span>
                    <p>
                      <span className="font-medium text-text-primary">Secure by design</span>
                      <br />
                      Enterprise-grade authentication keeps your account protected and compliant.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-outline/30 bg-surface-muted/60 text-[0.65rem] font-semibold text-accent-secondary">
                      04
                    </span>
                    <p>
                      <span className="font-medium text-text-primary">Daily momentum</span>
                      <br />
                      Access streak tracking, achievements, and refreshed learning paths instantly.
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-xs text-text-muted">
                Need partner or enterprise access? Contact your account manager or email
                <span className="mx-1 text-text-secondary">support@investing101.com</span>
                for concierge onboarding.
              </p>
            </div>

            <div className="flex flex-col gap-6 rounded-3xl border border-outline/10 bg-surface-card/85 p-6 shadow-card backdrop-blur">
              <SignIn appearance={signInAppearance} signUpUrl="/sign-up" afterSignInUrl="/" redirectUrl="/" />

              <p className="text-center text-sm text-text-secondary">
                New to Investing101?
                <Link
                  href={{ pathname: "/sign-up" }}
                  className="ml-2 font-semibold text-accent-primary transition-colors hover:text-accent-secondary"
                >
                  Create an account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
