import * as React from "react";
import { cn } from "../../lib/utils";

export type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(function LabelComponent(
  { className, ...props },
  ref,
) {
  return (
    <label
      ref={ref}
      className={cn(
        "text-xs font-semibold uppercase tracking-[0.25em] text-text-muted",
        className,
      )}
      {...props}
    />
  );
});