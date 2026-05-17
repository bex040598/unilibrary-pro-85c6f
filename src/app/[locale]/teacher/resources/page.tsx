export const dynamic = "force-dynamic";

import Link from "next/link";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { requirePageRole } from "@/lib/permissions/rbac";
import { prisma } from "@/lib/db/prisma";

export default async function TeacherResourcesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const user = await requirePageRole("teacher");
  const resources = await prisma.resource.findMany({
    where: { uploadedById: user.id },
    orderBy: { updatedAt: "desc" }
  });

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-primary">Teacher resources</p>
          <h1 className="mt-2 text-3xl font-semibold">Mening resurslarim</h1>
        </div>
        <Link href={`/${locale}/teacher/resources/new`}>
          <Button>Yangi resurs</Button>
        </Link>
      </div>

      <Card className="space-y-4">
        {resources.length ? (
          resources.map((resource) => (
            <div key={resource.id} className="rounded-2xl border border-border bg-surface-soft p-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="font-medium">{resource.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {resource.status} - {resource.updatedAt.toISOString().slice(0, 10)}
                  </p>
                  {resource.rejectionReason ? <p className="mt-2 text-sm text-danger">{resource.rejectionReason}</p> : null}
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link href={`/${locale}/teacher/resources/${resource.id}/edit`} className="text-sm text-primary underline underline-offset-4">
                    Edit
                  </Link>
                  <Link href={`/${locale}/catalog/${resource.slug}`} className="text-sm text-primary underline underline-offset-4">
                    View
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-surface-soft p-8 text-sm text-muted-foreground">
            Hozircha resurs yo'q. Yangi wizard orqali upload qiling.
          </div>
        )}
      </Card>
    </div>
  );
}
