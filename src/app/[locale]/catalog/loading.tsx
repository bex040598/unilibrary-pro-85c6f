import { Card } from "@/components/ui/card";

export default function CatalogLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[280px,1fr]">
        <Card className="h-[420px] animate-pulse bg-muted/60">&nbsp;</Card>
        <div className="space-y-6">
          <Card className="h-28 animate-pulse bg-muted/60">&nbsp;</Card>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="h-80 animate-pulse bg-muted/60">
                &nbsp;
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
