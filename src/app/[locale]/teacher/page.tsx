export const dynamic = "force-dynamic";

import { Card } from "@/components/ui/card";
import { requirePageRole } from "@/lib/permissions/rbac";
import { prisma } from "@/lib/db/prisma";

export default async function TeacherPage() {
  const user = await requirePageRole("teacher");
  const resources = await prisma.resource.findMany({
    where: { uploadedById: user.id },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
      <div>
        <p className="text-sm uppercase tracking-[0.24em] text-primary">O‘qituvchi ish jarayoni</p>
        <h1 className="mt-2 text-3xl font-semibold">Mening resurslarim</h1>
      </div>
      <Card className="space-y-4">
        {resources.map((resource) => (
          <div key={resource.id} className="rounded-2xl border border-border bg-surface-soft p-4">
            <p className="font-medium">{resource.title}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {resource.status} • {resource.createdAt.toISOString().slice(0, 10)}
            </p>
            {resource.rejectionReason ? <p className="mt-2 text-sm text-danger">{resource.rejectionReason}</p> : null}
          </div>
        ))}
      </Card>
    </div>
  );
}
