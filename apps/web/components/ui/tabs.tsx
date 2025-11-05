"use client";

import {
  useCallback,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { cn } from "../../lib/utils";

type TabItem = {
  id: string;
  label: string;
  description?: string;
  content: ReactNode;
};

type TabsProps = {
  items: TabItem[];
  className?: string;
  defaultTabId?: string;
  ariaLabel?: string;
};

export function Tabs({
  items,
  className,
  defaultTabId,
  ariaLabel,
}: TabsProps) {
  const generatedId = useId();
  const tabIds = useMemo(() => items.map((item) => item.id), [items]);
  const initialIndex = useMemo(() => {
    if (!defaultTabId) return 0;
    const idx = tabIds.indexOf(defaultTabId);
    return idx >= 0 ? idx : 0;
  }, [defaultTabId, tabIds]);
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const focusTab = useCallback((index: number) => {
    const clamped = Math.max(0, Math.min(items.length - 1, index));
    tabRefs.current[clamped]?.focus();
    setActiveIndex(clamped);
  }, [items.length]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (items.length === 0) return;
      switch (event.key) {
        case "ArrowRight":
        case "ArrowDown":
          event.preventDefault();
          focusTab((activeIndex + 1) % items.length);
          break;
        case "ArrowLeft":
        case "ArrowUp":
          event.preventDefault();
          focusTab((activeIndex - 1 + items.length) % items.length);
          break;
        case "Home":
          event.preventDefault();
          focusTab(0);
          break;
        case "End":
          event.preventDefault();
          focusTab(items.length - 1);
          break;
        default:
          break;
      }
    },
    [activeIndex, focusTab, items.length],
  );

  if (!items.length) {
    return null;
  }

  return (
    <div className={className}>
      <div
        role="tablist"
        aria-orientation="horizontal"
        aria-label={ariaLabel}
        onKeyDown={handleKeyDown}
        className="flex flex-wrap gap-3 border-b border-outline/30"
      >
        {items.map((item, index) => {
          const tabId = `${generatedId}-${item.id}-tab`;
          const panelId = `${generatedId}-${item.id}-panel`;
          const isActive = index === activeIndex;
          return (
            <button
              key={item.id}
              id={tabId}
              role="tab"
              type="button"
              ref={(node) => {
                tabRefs.current[index] = node;
              }}
              aria-selected={isActive}
              aria-controls={panelId}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActiveIndex(index)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-semibold text-text-secondary outline outline-2 outline-transparent transition",
                isActive
                  ? "bg-surface-card/80 text-text-primary outline-black shadow-card"
                  : "bg-surface-muted/70 hover:outline-black",
              )}
            >
              <span className="block text-left">
                {item.label}
                {item.description ? (
                  <span className="mt-0.5 block text-xs font-normal text-text-muted">
                    {item.description}
                  </span>
                ) : null}
              </span>
            </button>
          );
        })}
      </div>
      {items.map((item, index) => {
        const panelId = `${generatedId}-${item.id}-panel`;
        const tabId = `${generatedId}-${item.id}-tab`;
        const isActive = index === activeIndex;
        return (
          <div
            key={item.id}
            id={panelId}
            role="tabpanel"
            aria-labelledby={tabId}
            hidden={!isActive}
            className="pt-6"
          >
            {isActive ? item.content : null}
          </div>
        );
      })}
    </div>
  );
}
