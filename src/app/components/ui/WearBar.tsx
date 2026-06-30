interface WearBarProps {
  wear: number;
  showLabel?: boolean;
}

export function WearBar({ wear, showLabel = true }: WearBarProps) {
  const clamped = Math.min(100, Math.max(0, wear));
  const color =
    clamped > 50 ? "bg-green-500" : clamped > 20 ? "bg-yellow-500" : "bg-red-500";

  return (
    <div>
      {showLabel && (
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-xs text-slate-500">Vida útil</span>
          <span className="text-xs font-medium text-slate-900">{clamped}%</span>
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full transition-all duration-300 ${color}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
