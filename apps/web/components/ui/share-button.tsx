"use client";

import { Check, Share2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { cn } from "../../lib/utils";

type ShareStatus = "idle" | "copied" | "error";

const SHARE_TARGET = "inv101.onrender.com";
const RESET_DELAY = 2000;

export function ShareButton({ className }: { className?: string }) {
  const [status, setStatus] = useState<ShareStatus>("idle");

  useEffect(() => {
    if (status === "idle") return;
    const timeout = setTimeout(() => setStatus("idle"), RESET_DELAY);
    return () => clearTimeout(timeout);
  }, [status]);

  const handleCopy = useCallback(async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(SHARE_TARGET);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = SHARE_TARGET;
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setStatus("copied");
    } catch (error) {
      console.warn("Copy to clipboard failed", error);
      setStatus("error");
    }
  }, []);

  const icon = status === "copied" ? (
    <Check className="h-4 w-4 text-accent-primary" aria-hidden="true" />
  ) : (
    <Share2 className="h-4 w-4 text-accent-primary" aria-hidden="true" />
  );

  const label =
    status === "copied"
      ? "Link copied"
      : status === "error"
      ? "Copy failed — retry"
      : "Share preview";

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-outline/40 bg-surface-muted/60 px-3 py-1.5 text-sm font-medium text-text-primary shadow-card transition hover:border-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black",
        className,
      )}
      aria-label="Copy the Invest101 link for sharing"
      aria-live="polite"
      data-status={status}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
