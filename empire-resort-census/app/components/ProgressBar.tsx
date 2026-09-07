export default function ProgressBar({ value, total }: { value: number; total: number }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
        <div className="h-full bg-brand" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-1 text-xs text-muted">
        {value} / {total} ({pct}%)
      </p>
    </div>
  );
}
