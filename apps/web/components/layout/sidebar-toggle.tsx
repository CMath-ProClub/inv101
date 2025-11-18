"use client";

import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { cn } from "../../lib/utils";
import { emitSidebarState, readSidebarPreference, SIDEBAR_EVENT, SIDEBAR_STORAGE_KEY, type SidebarEventDetail } from "./sidebar-state";

interface SidebarToggleProps {
  className?: string;
}

export function SidebarToggle({ className }: SidebarToggleProps) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setCollapsed(readSidebarPreference(false));

    if (typeof window === "undefined") {
      return;
    }

    const handleState = (event: Event) => {
      const detail = (event as CustomEvent<SidebarEventDetail>).detail;
      if (typeof detail?.collapsed === "boolean") {
        setCollapsed(detail.collapsed);
      }
    };

    window.addEventListener(SIDEBAR_EVENT, handleState as EventListener);
    return () => window.removeEventListener(SIDEBAR_EVENT, handleState as EventListener);
  }, []);

  const toggle = useCallback(() => {
    const next = !collapsed;
    if (typeof window !== "undefined") {
      window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
    }
    emitSidebarState(next);
    setCollapsed(next);
  }, [collapsed]);

  return (
    <button
      type="button"
      onClick={toggle}
      className={cn(
        "inline-flex items-center justify-center rounded-full border border-outline/40 bg-surface-card/85 p-2 text-text-secondary shadow-sm transition hover:border-accent-primary/40 hover:text-text-primary",
        className,
      )}
      aria-pressed={collapsed}
      aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
    >
      {collapsed ? <PanelLeftOpen className="h-5 w-5" aria-hidden="true" /> : <PanelLeftClose className="h-5 w-5" aria-hidden="true" />}
    </button>
  );
}
