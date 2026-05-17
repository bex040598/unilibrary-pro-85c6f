import { Card } from "@/components/ui/card";

export function PageSkeleton({ title = "Loading workspace" }: { title?: string }) {
  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
      <div>
        <p className="text-sm uppercase tracking-[0.24em] text-primary">Loading</p>
        <h1 className="mt-2 text-3xl font-semibold">{title}</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="h-32 animate-pulse bg-surface-soft">
            <div />
          </Card>
        ))}
      </div>
      <Card className="space-y-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="h-14 animate-pulse rounded-2xl bg-surface-soft" />
        ))}
      </Card>
    </div>
  );
}
