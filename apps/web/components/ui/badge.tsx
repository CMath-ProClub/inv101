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
            "border-brand-500/60 bg-brand-500/20 text-brand-100",
          variant === "outline" && "border-white/20 bg-transparent text-white",
          variant === "soft" &&
            "border-brand-500/10 bg-brand-500/10 text-brand-200",
          className,
        )}
        {...props}
      />
    );
  },
);
Badge.displayName = "Badge";
