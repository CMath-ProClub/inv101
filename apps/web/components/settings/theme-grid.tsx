"use client";

import { Check, Sparkles } from "lucide-react";
import { themeOptions, type ThemeOption } from "../../lib/theme-config";
import { useRevertTheme } from "../../hooks/useRevertTheme";
import { cn } from "../../lib/utils";

export function ThemeGrid({ className }: { className?: string }) {
  const { activeTheme, applyTheme, keepTheme, revertState, revertThemeNow } = useRevertTheme();
  const grouped = themeOptions.reduce(
    (acc, option) => {
      acc[option.mode].push(option);
      return acc;
    },
    { light: [] as ThemeOption[], dark: [] as ThemeOption[] },
  );

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="grid gap-6 lg:grid-cols-2">
        {[{ label: "Light themes", key: "light" as const }, { label: "Dark themes", key: "dark" as const }].map(
          (group) => (
            <div key={group.key} className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-text-muted">
                {group.label}
              </p>
              <div className="space-y-3">
                {grouped[group.key].map((option) => {
                  const isActive = option.id === activeTheme;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => applyTheme(option.id)}
                      className={cn(
                        "group flex flex-col gap-3 rounded-2xl border border-outline/30 bg-surface-muted/60 p-4 text-left shadow-card transition hover:border-accent-primary/60 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black",
                        isActive && "border-accent-primary/80 shadow-lg",
                      )}
                      aria-pressed={isActive}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 text-sm font-semibold text-text-primary">
                            {option.label}
                            {isActive && <Check className="h-4 w-4 text-accent-primary" aria-hidden="true" />}
                          </div>
                          <p className="text-xs text-text-secondary">{option.hint}</p>
                        </div>
                        <Sparkles
                          className={cn(
                            "h-4 w-4 text-accent-secondary transition",
                            isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100",
                          )}
                          aria-hidden="true"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        {option.swatches.map((swatch, index) => (
                          <span
                            key={`${option.id}-${index}`}
                            className="flex flex-1 flex-col items-center gap-1 text-[10px] font-medium text-text-secondary"
                          >
                            <span
                              className="h-10 w-full rounded-xl border border-outline/40"
                              style={{ backgroundColor: swatch.color }}
                              aria-hidden="true"
                            />
                            <span className="truncate" aria-hidden="true">
                              {swatch.label}
                            </span>
                          </span>
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ),
        )}
      </div>
      {revertState && (
        <div
          className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-outline/30 bg-surface-muted/60 p-4 text-xs text-text-secondary shadow-card"
          role="status"
          aria-live="assertive"
        >
          <span className="text-sm text-text-primary">
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
