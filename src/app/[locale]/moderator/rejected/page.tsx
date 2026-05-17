export const dynamic = "force-dynamic";

import { Card } from "@/components/ui/card";
import { requirePageRole } from "@/lib/permissions/rbac";
import { prisma } from "@/lib/db/prisma";

export default async function ModeratorRejectedPage() {
  await requirePageRole("moderator");
  const resources = await prisma.resource.findMany({
    where: {
      status: {
        in: ["REJECTED", "NEEDS_REVISION"]
      }
    },
    include: { uploadedBy: true },
    orderBy: { updatedAt: "desc" }
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
      <div>
        <p className="text-sm uppercase tracking-[0.24em] text-primary">Rejected resources</p>
        <h1 className="mt-2 text-3xl font-semibold">Rad etilgan va revision so‘ralgan resurslar</h1>
      </div>
      <Card className="space-y-4">
        {resources.map((resource) => (
          <div key={resource.id} className="rounded-2xl border border-border bg-surface-soft p-4">
            <p className="font-medium">{resource.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{resource.uploadedBy.fullName}</p>
            {resource.rejectionReason ? <p className="mt-2 text-sm text-danger">{resource.rejectionReason}</p> : null}
          </div>
        ))}
      </Card>
    </div>
  );
}
