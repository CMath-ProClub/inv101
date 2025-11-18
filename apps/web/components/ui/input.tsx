import * as React from "react";
import { cn } from "../../lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function InputComponent(
  { className, type = "text", ...props },
  ref,
) {
  return (
    <input
      type={type}
      className={cn(
        "h-12 w-full rounded-2xl border border-outline/30 bg-transparent px-4 text-sm text-text-primary shadow-sm transition placeholder:text-text-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});