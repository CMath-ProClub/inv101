"use client";

import { Palette } from "lucide-react";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { cn } from "../../lib/utils";

type ThemeOption = {
  id: string;
  label: string;
  hint: string;
};

type RevertState = {
  previousTheme: string;
  nextTheme: string;
  secondsLeft: number;
};

const REVERT_SECONDS = 12;

const themeOptions: ThemeOption[] = [
  { id: "light", label: "Lumen", hint: "Bright day mode" },
  { id: "dark", label: "Nebula", hint: "Balanced night view" },
  { id: "ultradark", label: "Ultradark", hint: "Neon contrast" },
  { id: "emerald-trust", label: "Emerald Trust", hint: "Organic calm" },
  { id: "quantum-violet", label: "Quantum Violet", hint: "Futuristic glow" },
  { id: "copper-balance", label: "Copper Balance", hint: "Warm craft" },
  { id: "regal-portfolio", label: "Regal Portfolio", hint: "Classic luxe" },
  { id: "carbon-edge", label: "Carbon Edge", hint: "Stealth mode" },
];

export function ThemeSwitcher({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [revertState, setRevertState] = useState<RevertState | null>(null);
  const revertTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeTheme = useMemo(() => (mounted ? theme ?? "dark" : "dark"), [mounted, theme]);

  const clearRevertTimers = useCallback(() => {
    if (revertTimeoutRef.current) {
      clearTimeout(revertTimeoutRef.current);
      revertTimeoutRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      clearRevertTimers();
    };
  }, [clearRevertTimers]);

  const handleThemeChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const nextTheme = event.target.value;
      const previousTheme = activeTheme;

      if (!nextTheme || nextTheme === previousTheme) {
        clearRevertTimers();
        setRevertState(null);
        return;
      }

      clearRevertTimers();
      setTheme(nextTheme);
      setRevertState({ previousTheme, nextTheme, secondsLeft: REVERT_SECONDS });

      revertTimeoutRef.current = setTimeout(() => {
        setTheme(previousTheme);
        setRevertState(null);
        clearRevertTimers();
      }, REVERT_SECONDS * 1000);

      countdownIntervalRef.current = setInterval(() => {
        setRevertState((state) => {
          if (!state) return null;
          if (state.secondsLeft <= 1) {
            return { ...state, secondsLeft: 0 };
          }
          return { ...state, secondsLeft: state.secondsLeft - 1 };
        });
      }, 1000);
    },
    [activeTheme, clearRevertTimers, setTheme],
  );

  const handleKeepTheme = useCallback(() => {
    clearRevertTimers();
    setRevertState(null);
  }, [clearRevertTimers]);

  const handleRevertNow = useCallback(() => {
    setRevertState((state) => {
      if (!state) return null;
      setTheme(state.previousTheme);
      clearRevertTimers();
      return null;
    });
  }, [clearRevertTimers, setTheme]);

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
              onClick={handleKeepTheme}
              className="rounded-full border border-outline/30 bg-surface-base/80 px-3 py-1 font-semibold text-text-primary transition hover:border-accent-primary/60 hover:text-accent-primary"
            >
              Keep
            </button>
            <button
              type="button"
              onClick={handleRevertNow}
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
