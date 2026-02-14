"use client";

interface MigrationProgressProps {
  label: string;
  current: number;
  total: number;
  failed?: number;
}

export function MigrationProgress({
  label,
  current,
  total,
  failed = 0,
}: MigrationProgressProps) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="text-gray-500">
          {current.toLocaleString()} / {total.toLocaleString()}
          {failed > 0 && (
            <span className="text-red-500 ml-2">({failed} errores)</span>
          )}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className="bg-primary h-3 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="text-right text-xs text-gray-400">{pct}%</div>
    </div>
  );
}
