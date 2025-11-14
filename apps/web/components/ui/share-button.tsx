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
    <Check aria-hidden="true" className="h-4 w-4" />
  ) : (
    <Share2 aria-hidden="true" className="h-4 w-4" />
  );

  const label =
    status === "copied"
      ? "Link copied"
      : status === "error"
      ? "Copy failed — retry"
      : "Share preview";

  const iconChipStyle =
    status === "copied"
      ? {
          backgroundColor: "rgba(var(--accent-primary), 0.9)",
          color: "rgb(var(--surface-card))",
        }
      : status === "error"
        ? {
            backgroundColor: "rgba(var(--accent-secondary), 0.2)",
            color: "rgb(var(--accent-secondary))",
          }
        : {
            backgroundColor: "rgba(var(--accent-primary), 0.15)",
            color: "rgb(var(--accent-primary))",
          };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(
        "inline-flex items-center gap-3 rounded-full border border-outline/30 bg-surface-card/80 px-4 py-2 text-sm font-semibold text-text-primary shadow-[0_22px_35px_rgba(5,10,25,0.28)] transition hover:-translate-y-0.5 hover:border-accent-primary/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary",
        className,
      )}
      style={{
        background:
          "linear-gradient(115deg, rgba(var(--surface-card), 0.96), rgba(var(--surface-elevated), 0.9))",
      }}
      aria-label="Copy the Invest101 link for sharing"
      aria-live="polite"
      data-status={status}
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-2xl" style={iconChipStyle}>
        {icon}
      </span>
      <span className="text-text-secondary">{label}</span>
    </button>
  );
}
