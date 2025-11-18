"use client";

import Link from "next/link";
import type { Route } from "next";
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-[calc(100vh-var(--header-height))] w-full items-center justify-center px-4 py-10 sm:px-8">
      <div className="w-full max-w-lg space-y-5 rounded-3xl border border-outline/15 bg-surface-muted/60 p-6 shadow-card backdrop-blur-sm sm:p-8">
        <div className="space-y-2 text-center">
          <p className="text-[11px] uppercase tracking-[0.32em] text-accent-secondary">Create Account</p>
          <h1 className="text-3xl font-semibold text-text-primary sm:text-[2.1rem]">Join the Investing101 workspace</h1>
          <p className="text-sm text-text-secondary">
            Start fresh with guided onboarding, personalized dashboards, and synced simulator progress.
          </p>
        </div>
        <SignUp
          appearance={{
            elements: {
              card: "!shadow-none !border-none !bg-transparent !p-0",
              formButtonPrimary:
                "bg-accent-primary hover:bg-accent-secondary text-white font-semibold transition-transform duration-150 hover:-translate-y-0.5",
              headerSubtitle: "text-text-secondary text-sm",
              headerTitle: "text-text-primary text-2xl font-semibold",
              identityPreview: "bg-surface-card/90 border border-outline/15",
              formFieldLabel: "text-sm font-medium text-text-secondary",
              formFieldInput: "text-sm",
              formHeader: "space-y-1",
              form: "space-y-4",
              footer: "text-xs text-text-tertiary",
              socialButtonsBlockButton:
                "bg-surface-card/80 border border-outline/15 text-text-primary hover:border-outline/25",
              socialButtonsIconButton: "border border-outline/15",
            },
            variables: {
              borderRadius: "18px",
              fontSize: "15px",
              spacingUnit: "10px",
            },
            layout: {
              socialButtonsPlacement: "bottom",
              socialButtonsVariant: "iconButton",
            },
          }}
          signInUrl="/sign-in"
          afterSignUpUrl="/"
          redirectUrl="/"
        />
        <p className="text-center text-sm text-text-secondary">
          Already have an account? {" "}
          <Link
            href={"/sign-in" as Route}
            className="font-semibold text-accent-primary transition hover:text-accent-secondary"
          >
            Sign in instead
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
