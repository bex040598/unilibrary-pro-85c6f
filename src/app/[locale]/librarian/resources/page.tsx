export const dynamic = "force-dynamic";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { requirePageRole } from "@/lib/permissions/rbac";
import { listLibrarianResources } from "@/server/services/librarian-dashboard-service";

export default async function LibrarianResourcesPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  await requirePageRole("librarian", locale);
  const resources = await listLibrarianResources();

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-primary">Kutubxonachi katalogi</p>
          <h1 className="mt-2 text-3xl font-semibold">Resurslarni boshqarish</h1>
        </div>
        <Link href={`/${locale}/librarian/resources/new`}>
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
                    {resource.department?.nameUz ?? "Kafedra biriktirilmagan"} • {resource.status}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link href={`/${locale}/librarian/resources/${resource.id}/edit`} className="text-sm text-primary underline underline-offset-4">
                    Tahrirlash
                  </Link>
                  <Link href={`/${locale}/catalog/${resource.slug}`} className="text-sm text-primary underline underline-offset-4">
                    Ko'rish
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-surface-soft p-8 text-sm text-muted-foreground">
            Hozircha resurslar topilmadi.
          </div>
        )}
      </Card>
    </div>
  );
}
