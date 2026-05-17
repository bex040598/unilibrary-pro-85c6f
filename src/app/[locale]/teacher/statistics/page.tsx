export const dynamic = "force-dynamic";

import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/stat-card";
import { requirePageRole } from "@/lib/permissions/rbac";
import { prisma } from "@/lib/db/prisma";

export default async function TeacherStatisticsPage() {
  const user = await requirePageRole("teacher");
  const [total, pending, approved, rejected] = await Promise.all([
    prisma.resource.count({ where: { uploadedById: user.id } }),
    prisma.resource.count({ where: { uploadedById: user.id, status: "PENDING_REVIEW" } }),
    prisma.resource.count({ where: { uploadedById: user.id, status: "APPROVED" } }),
    prisma.resource.count({ where: { uploadedById: user.id, status: { in: ["REJECTED", "NEEDS_REVISION"] } } })
  ]);

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
      <div>
        <p className="text-sm uppercase tracking-[0.24em] text-primary">Teacher statistics</p>
        <h1 className="mt-2 text-3xl font-semibold">Resurs faoliyati</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Jami resurs" value={total} />
        <StatCard label="Pending" value={pending} />
        <StatCard label="Approved" value={approved} />
        <StatCard label="Rejected / Revision" value={rejected} />
      </div>
      <Card className="rounded-2xl border border-dashed border-border bg-surface-soft p-8 text-sm text-muted-foreground">
        Bu bo‘lim keyingi bosqichda faculty va department kesimidagi chuqur analytics bilan kengaytiriladi.
      </Card>
    </div>
  );
}
