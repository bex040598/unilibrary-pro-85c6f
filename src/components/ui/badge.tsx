import { cn } from "@/lib/utils";

const colorMap: Record<string, string> = {
  APPROVED: "bg-success/12 text-success border-success/20",
  PENDING_REVIEW: "bg-warning/15 text-warning border-warning/20",
  DRAFT: "bg-muted text-muted-foreground border-border",
  REJECTED: "bg-danger/12 text-danger border-danger/20",
  NEEDS_REVISION: "bg-info/15 text-info border-info/20",
  PUBLIC: "bg-primary/10 text-primary border-primary/15",
  AUTH_REQUIRED: "bg-secondary/10 text-secondary border-secondary/15",
  STAFF_ONLY: "bg-accent/15 text-primary border-accent/20",
  PRIVATE: "bg-danger/12 text-danger border-danger/20",
  AVAILABLE: "bg-success/12 text-success border-success/20",
  BORROWED: "bg-danger/12 text-danger border-danger/20",
  RESERVED: "bg-warning/15 text-warning border-warning/20",
  OVERDUE: "bg-danger/12 text-danger border-danger/20"
};

export function Badge({ value, className }: { value: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium tracking-wide",
        colorMap[value] ?? "bg-muted text-muted-foreground border-border",
        className
      )}
    >
      {value.replaceAll("_", " ")}
    </span>
  );
}
