import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Route } from "next";
import { cn } from "../../lib/utils";

interface BackLinkProps {
  href: Route | { pathname: Route; hash?: string };
  label?: string;
  className?: string;
}

export function BackLink({ href, label = "Back", className }: BackLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-2 rounded-2xl border border-outline/30 bg-surface-card/80 px-4 py-2 text-sm font-semibold text-text-primary shadow-sm transition hover:-translate-y-0.5 hover:border-accent-primary/50",
        className,
      )}
    >
      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
      <span>{label}</span>
    </Link>
  );
}
