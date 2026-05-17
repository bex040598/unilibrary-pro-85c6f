export const dynamic = "force-dynamic";

import Link from "next/link";

import { Card } from "@/components/ui/card";
import { requirePageRole } from "@/lib/permissions/rbac";
import { prisma } from "@/lib/db/prisma";

export default async function ModeratorPendingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  await requirePageRole("moderator");
  const resources = await prisma.resource.findMany({
    where: { status: "PENDING_REVIEW" },
    include: { uploadedBy: true, category: true, department: true },
    orderBy: { updatedAt: "desc" }
  });

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
      <div>
        <p className="text-sm uppercase tracking-[0.24em] text-primary">Moderator queue</p>
        <h1 className="mt-2 text-3xl font-semibold">Pending resources</h1>
      </div>
      <Card className="space-y-4">
        {resources.length ? (
          resources.map((resource) => (
            <div key={resource.id} className="rounded-2xl border border-border bg-surface-soft p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium">{resource.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {resource.uploadedBy.fullName} - {resource.category.nameUz} - {resource.department?.nameUz ?? "-"}
                  </p>
                </div>
                <Link href={`/${locale}/moderator/review/${resource.id}`} className="text-sm text-primary underline underline-offset-4">
                  Review
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-surface-soft p-8 text-sm text-muted-foreground">
            Pending resource topilmadi.
          </div>
        )}
      </Card>
    </div>
  );
}
