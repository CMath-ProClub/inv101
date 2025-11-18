import * as React from "react";
import { cn } from "../../lib/utils";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function ButtonComponent(
  { className, type = "button", ...props },
  ref,
) {
  return (
    <button
      type={type}
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-accent-primary px-5 py-3 text-sm font-semibold text-white shadow transition hover:bg-accent-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      {...props}
    />
  );
});