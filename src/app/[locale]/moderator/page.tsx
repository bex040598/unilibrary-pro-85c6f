export const dynamic = "force-dynamic";

import { Card } from "@/components/ui/card";
import { requirePageRole } from "@/lib/permissions/rbac";
import { prisma } from "@/lib/db/prisma";

export default async function ModeratorPage() {
  await requirePageRole("moderator");
  const pending = await prisma.resource.findMany({
    where: { status: "PENDING_REVIEW" },
    include: {
      uploadedBy: true
    }
  });

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
      <div>
        <p className="text-sm uppercase tracking-[0.24em] text-primary">Moderator queue</p>
        <h1 className="mt-2 text-3xl font-semibold">Pending resource review</h1>
      </div>
      <Card className="space-y-4">
        {pending.map((resource) => (
          <div key={resource.id} className="rounded-2xl border border-border bg-surface-soft p-4">
            <p className="font-medium">{resource.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {resource.uploadedBy.fullName} • {resource.resourceType}
            </p>
          </div>
        ))}
      </Card>
    </div>
  );
}
