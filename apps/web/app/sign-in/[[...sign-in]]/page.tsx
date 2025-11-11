"use client";

import Link from "next/link";
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-[calc(100vh-var(--header-height))] w-full items-center justify-center px-4 py-12 sm:px-8 lg:px-12">
      <div className="w-full max-w-xl space-y-6 rounded-3xl border border-outline/20 bg-surface-muted/60 p-8 shadow-card backdrop-blur">
        <div className="space-y-2 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-accent-secondary">Account Access</p>
          <h1 className="text-3xl font-semibold text-text-primary sm:text-4xl">Welcome back to Invest101</h1>
          <p className="text-sm text-text-secondary">
            Use your Clerk account to sync watchlists, saved scenarios, and your simulator progress across devices.
          </p>
        </div>
        <SignIn
          appearance={{
            elements: {
              card: "!shadow-none !border-none !bg-transparent",
              formButtonPrimary: "bg-accent-primary hover:bg-accent-secondary text-white font-semibold",
              headerSubtitle: "text-text-secondary",
              headerTitle: "text-text-primary",
              identityPreview: "bg-surface-card/80 border border-outline/20",
              socialButtonsBlockButton: "bg-surface-card/80 border border-outline/20 text-text-primary",
              socialButtonsIconButton: "border border-outline/20",
            },
          }}
          signUpUrl="/sign-up"
          afterSignInUrl="/"
          redirectUrl="/"
        />
        <p className="text-center text-sm text-text-secondary">
          New to Invest101? {" "}
          <Link href="/sign-up" className="font-semibold text-accent-primary transition hover:text-accent-secondary">
            Create an account
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
