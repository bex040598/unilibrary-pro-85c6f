import { Card } from "@/components/ui/card";
import { formatNumber } from "@/lib/utils";

export function StatCard({
  label,
  value,
  hint
}: {
  label: string;
  value: number | string;
  hint?: string;
}) {
  return (
    <Card className="space-y-3">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-3xl font-semibold tracking-tight">{typeof value === "number" ? formatNumber(value) : value}</p>
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </Card>
  );
}
