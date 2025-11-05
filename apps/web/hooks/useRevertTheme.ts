"use client";

import { useTheme } from "next-themes";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type RevertState = {
  previousTheme: string;
  nextTheme: string;
  secondsLeft: number;
};

export function useRevertTheme(revertSeconds = 12) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [revertState, setRevertState] = useState<RevertState | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeTheme = useMemo(() => (mounted ? theme ?? "dark" : "dark"), [mounted, theme]);

  const clearTimers = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

  const applyTheme = useCallback(
    (nextTheme: string) => {
      const previousTheme = activeTheme;
      if (!nextTheme || nextTheme === previousTheme) {
        clearTimers();
        setRevertState(null);
        return;
      }

      clearTimers();
      setTheme(nextTheme);
      setRevertState({ previousTheme, nextTheme, secondsLeft: revertSeconds });

      timeoutRef.current = setTimeout(() => {
        setTheme(previousTheme);
        setRevertState(null);
        clearTimers();
      }, revertSeconds * 1000);

      intervalRef.current = setInterval(() => {
        setRevertState((state) => {
          if (!state) return null;
          if (state.secondsLeft <= 1) {
            return { ...state, secondsLeft: 0 };
          }
          return { ...state, secondsLeft: state.secondsLeft - 1 };
        });
      }, 1000);
    },
    [activeTheme, clearTimers, revertSeconds, setTheme],
  );

  const keepTheme = useCallback(() => {
    clearTimers();
    setRevertState(null);
  }, [clearTimers]);

  const revertThemeNow = useCallback(() => {
    setRevertState((state) => {
      if (!state) return null;
      setTheme(state.previousTheme);
      clearTimers();
      return null;
    });
  }, [clearTimers, setTheme]);

  return {
    activeTheme,
    applyTheme,
    revertState,
    keepTheme,
    revertThemeNow,
  };
}
