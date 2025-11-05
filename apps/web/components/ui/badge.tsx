import * as React from "react";
import { cn } from "../../lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "outline" | "soft";
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-wide",
          variant === "default" &&
            "border-accent-primary/40 bg-accent-primary/15 text-accent-primary",
          variant === "outline" &&
            "border-outline/50 bg-transparent text-text-primary",
          variant === "soft" &&
            "border-accent-secondary/30 bg-accent-secondary/15 text-accent-secondary",
          className,
        )}
        {...props}
      />
    );
  },
);
Badge.displayName = "Badge";
