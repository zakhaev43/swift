import { Card } from "./Card";

export function StatTile({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "critical";
}) {
  return (
    <Card className="px-4 py-3">
      <div className="text-xs font-medium uppercase tracking-wide text-ink-muted">
        {label}
      </div>
      <div
        className={`tabular-nums mt-1 text-2xl font-semibold ${
          tone === "critical" ? "text-status-critical" : "text-ink-primary"
        }`}
      >
        {value}
      </div>
    </Card>
  );
}
