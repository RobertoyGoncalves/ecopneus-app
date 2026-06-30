import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export interface MetricCardProps {
  label: string;
  value: string;
  hint?: string;
  delta?: string;
  deltaType?: "up" | "down" | "neutral";
  icon: LucideIcon;
  iconBg?: string;
}

export function MetricCard({
  label,
  value,
  hint,
  delta,
  deltaType = "neutral",
  icon: Icon,
  iconBg = "bg-green-500",
}: MetricCardProps) {
  const deltaConfig = {
    up: { cls: "text-green-700 bg-green-50", Icon: TrendingUp },
    down: { cls: "text-red-600 bg-red-50", Icon: TrendingDown },
    neutral: { cls: "text-slate-500 bg-slate-100", Icon: Minus },
  } as const;

  const { cls: deltaCls, Icon: DeltaIcon } = deltaConfig[deltaType];

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            {label}
          </p>
          <p className="text-2xl font-medium text-slate-900">{value}</p>
          {hint && !delta && (
            <p className="mt-1.5 text-xs text-slate-400">{hint}</p>
          )}
          {delta && (
            <span
              className={`mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${deltaCls}`}
            >
              <DeltaIcon className="h-3 w-3" />
              {delta}
            </span>
          )}
        </div>
        <div
          className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${iconBg}`}
        >
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
    </div>
  );
}
