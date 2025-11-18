"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";

const STORAGE_KEY = "inv101_welcome_banner_dismissed";

export function WelcomeBanner({ className }: { className?: string }) {
  const [visible, setVisible] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const dismissed = window.localStorage.getItem(STORAGE_KEY) === "true";
      setVisible(!dismissed);
    } catch {
      setVisible(true);
    } finally {
      setHydrated(true);
    }
  }, []);

  if (!hydrated || !visible) {
    return null;
  }

  function handleDismiss() {
    try {
      window.localStorage.setItem(STORAGE_KEY, "true");
    } catch {
      /* noop */
    }
    setVisible(false);
  }

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-outline/30 bg-gradient-to-r from-accent-secondary/10 via-accent-tertiary/10 to-transparent px-4 py-3 text-sm shadow-inner",
        className,
      )}
    >
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-accent-secondary">Investing101</p>
        <p className="text-sm font-medium text-text-primary">Welcome back—your analysis desk is synced and ready.</p>
        <p className="text-xs text-text-secondary">We keep prototypes, calculators, and playground tools aligned in one canvas.</p>
      </div>
      <button
        type="button"
        onClick={handleDismiss}
        className="ml-auto inline-flex items-center justify-center rounded-2xl border border-outline/40 bg-surface-card/80 p-2 text-text-muted transition hover:text-text-primary"
        aria-label="Dismiss welcome banner"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
