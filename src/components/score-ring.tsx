import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export function ScoreRing({
  value,
  size = 200,
  stroke = 14,
  label = "Health score",
  status,
  trend,
}: {
  value: number;
  size?: number;
  stroke?: number;
  label?: string;
  status?: string;
  trend?: number;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  const tone = value >= 85 ? "text-primary" : value >= 70 ? "text-warning" : "text-danger";
  const autoStatus = status ?? (value >= 85 ? "Excellent" : value >= 70 ? "Good" : "Needs work");
  const TrendIcon =
    trend === undefined ? null : trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="var(--color-border)"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className={cn("transition-[stroke-dashoffset] duration-1000 ease-out", tone)}
          style={{ animation: "ring-progress 1.2s ease-out" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </div>
          <div className="text-heading mt-1 text-[56px] font-semibold leading-none tabular-nums">
            {value}
          </div>
          <div className="mt-2 inline-flex items-center gap-1.5">
            <span
              className={cn("inline-flex h-1.5 w-1.5 rounded-full", tone.replace("text-", "bg-"))}
            />
            <span className="text-xs font-semibold text-foreground">{autoStatus}</span>
            {TrendIcon && (
              <span
                className={cn(
                  "ml-1 inline-flex items-center gap-0.5 text-[11px] font-semibold tabular-nums",
                  trend! > 0
                    ? "text-primary"
                    : trend! < 0
                      ? "text-danger"
                      : "text-muted-foreground",
                )}
              >
                <TrendIcon className="h-3 w-3" />
                {trend! > 0 ? `+${trend}` : trend}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function MiniScore({ value }: { value: number }) {
  const tone = value >= 85 ? "text-primary" : value >= 70 ? "text-warning" : "text-danger";
  return (
    <div className={cn("text-heading text-3xl font-semibold tabular-nums", tone)}>{value}</div>
  );
}
