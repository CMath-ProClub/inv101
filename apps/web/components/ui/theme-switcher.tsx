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
    <div className={cn("flex flex-col gap-3", className)}>
      <label
        className="inline-flex items-center gap-3 rounded-full border border-outline/30 bg-surface-card/80 px-4 py-2 text-sm font-semibold text-text-secondary shadow-[0_20px_35px_rgba(5,10,25,0.28)] transition focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-accent-primary"
        style={{
          background:
            "linear-gradient(115deg, rgba(var(--surface-card), 0.96), rgba(var(--surface-elevated), 0.9))",
        }}
      >
        <span
          className="flex h-8 w-8 items-center justify-center rounded-2xl"
          style={{
            backgroundColor: "rgba(var(--accent-primary), 0.15)",
            color: "rgb(var(--accent-primary))",
          }}
        >
          <Palette className="h-4 w-4" aria-hidden="true" />
        </span>
        <span className="sr-only">Select theme</span>
        <select
          className="appearance-none bg-transparent text-sm font-semibold text-text-primary outline-none"
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
          className="flex flex-wrap items-center gap-3 rounded-3xl border border-outline/30 bg-surface-card/90 px-5 py-3 text-xs text-text-secondary shadow-[0_28px_45px_rgba(5,10,25,0.32)]"
          style={{
            background:
              "linear-gradient(120deg, rgba(var(--surface-card), 0.96), rgba(var(--surface-elevated), 0.9))",
          }}
          role="status"
          aria-live="assertive"
        >
          <span className="text-sm font-medium text-text-primary">
            Previewing {themeOptions.find((option) => option.id === revertState.nextTheme)?.label ?? "theme"}
            <span className="ml-1 text-text-secondary">· Auto revert in {revertState.secondsLeft}s</span>
          </span>
          <div className="flex items-center gap-2 text-[11px] font-semibold">
            <button
              type="button"
              onClick={keepTheme}
              className="rounded-full border border-outline/30 bg-surface-card/80 px-4 py-1.5 text-text-primary transition hover:-translate-y-0.5 hover:border-accent-primary/40"
            >
              Keep
            </button>
            <button
              type="button"
              onClick={revertThemeNow}
              className="rounded-full border border-outline/30 bg-surface-card/80 px-4 py-1.5 text-text-primary transition hover:-translate-y-0.5 hover:border-accent-secondary/40"
            >
              Undo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
