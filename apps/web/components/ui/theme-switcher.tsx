"use client";

import { Palette } from "lucide-react";
import type { ChangeEvent } from "react";
import { cn } from "../../lib/utils";
import { themeOptions } from "../../lib/theme-config";
import { useRevertTheme } from "../../hooks/useRevertTheme";

export function ThemeSwitcher({ className }: { className?: string }) {
  const { activeTheme, applyTheme, keepTheme, revertState, revertThemeNow } = useRevertTheme();

  const handleThemeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    applyTheme(event.target.value);
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label className="inline-flex items-center gap-2 rounded-full border border-outline/40 bg-surface-muted/60 px-3 py-1.5 text-sm text-text-secondary shadow-card transition hover:border-black focus-within:border-black">
        <Palette className="h-4 w-4 text-accent-primary" aria-hidden="true" />
        <span className="sr-only">Select theme</span>
        <select
          className="appearance-none bg-transparent text-sm font-medium text-text-primary outline-none"
          value={activeTheme}
          onChange={handleThemeChange}
          aria-label="Select visual theme"
        >
          {themeOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label} · {option.hint}
            </option>
          ))}
        </select>
      </label>
      {revertState && (
        <div
          className="inline-flex items-center gap-3 rounded-full border border-outline/30 bg-surface-muted/60 px-4 py-2 text-xs text-text-secondary shadow-card"
          role="status"
          aria-live="assertive"
        >
          <span>
            Previewing {themeOptions.find((option) => option.id === revertState.nextTheme)?.label ?? "theme"}. Auto revert in {revertState.secondsLeft}s.
          </span>
          <div className="flex items-center gap-2 text-[11px]">
            <button
              type="button"
              onClick={keepTheme}
              className="rounded-full border border-outline/30 bg-surface-base/80 px-3 py-1 font-semibold text-text-primary transition hover:border-accent-primary/60 hover:text-accent-primary"
            >
              Keep
            </button>
            <button
              type="button"
              onClick={revertThemeNow}
              className="rounded-full border border-outline/30 bg-surface-base/80 px-3 py-1 font-semibold text-text-primary transition hover:border-accent-secondary/60 hover:text-accent-secondary"
            >
              Undo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
