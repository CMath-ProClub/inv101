import { AlertTriangle, Loader2, WifiOff } from "lucide-react";
import { cn } from "../../lib/utils";

type StatusType = "loading" | "offline";

type StatusBannerProps = {
  status: StatusType;
  title: string;
  description?: string;
  className?: string;
};

const iconByStatus: Record<StatusType, React.ComponentType<{ className?: string }>> = {
  loading: Loader2,
  offline: WifiOff,
};

export function StatusBanner({ status, title, description, className }: StatusBannerProps) {
  const Icon = iconByStatus[status] ?? AlertTriangle;
  const pulse = status === "loading";

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-2xl border border-outline/30 bg-surface-muted/70 px-4 py-3 text-sm text-text-secondary",
        className,
      )}
      role="status"
      aria-live={status === "loading" ? "polite" : "assertive"}
    >
      <Icon
        className={cn(
          "mt-0.5 h-4 w-4 text-accent-primary",
          pulse && "animate-spin",
        )}
        aria-hidden="true"
      />
      <div className="space-y-1">
        <p className="font-semibold text-text-primary">{title}</p>
        {description ? <p className="text-xs text-text-muted">{description}</p> : null}
      </div>
    </div>
  );
}
