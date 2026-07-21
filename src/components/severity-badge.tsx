import { cn } from "@/lib/utils";

export type Severity = "critical" | "high" | "medium" | "low" | "info";

const severityStyles: Record<Severity, string> = {
  critical: "bg-danger/10 text-danger ring-1 ring-inset ring-danger/20",
  high: "bg-warning/10 text-warning ring-1 ring-inset ring-warning/20",
  medium: "bg-warning/10 text-warning ring-1 ring-inset ring-warning/20",
  low: "bg-primary/10 text-primary ring-1 ring-inset ring-primary/20",
  info: "bg-muted text-muted-foreground ring-1 ring-inset ring-border",
};

export function SeverityBadge({ severity, className }: { severity: Severity; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize",
        severityStyles[severity],
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      {severity}
    </span>
  );
}
