export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";

import { AdminEntityManager } from "@/components/dashboard/admin-entity-manager";
import { Card } from "@/components/ui/card";
import { requirePageRole } from "@/lib/permissions/rbac";
import { prisma } from "@/lib/db/prisma";
import { listAdminEntity } from "@/server/services/admin-crud-service";

const allowedSections = [
  "users",
  "resources",
  "categories",
  "faculties",
  "departments",
  "book-copies",
  "audit-logs",
  "security",
  "settings",
  "announcements"
] as const;

const entitySections = ["users", "resources", "categories", "faculties", "departments", "book-copies", "settings", "announcements"] as const;

export default async function AdminSectionPage({
  params
}: {
  params: Promise<{ section: string }>;
}) {
  await requirePageRole("admin");
  const { section } = await params;

  if (!allowedSections.includes(section as (typeof allowedSections)[number])) {
    notFound();
  }

  const heading = section.replaceAll("-", " ");

  if (entitySections.includes(section as (typeof entitySections)[number])) {
    const [result, faculties, departments, categories, resources, users] = await Promise.all([
      listAdminEntity(section as (typeof entitySections)[number], { page: 1, limit: 12 }),
      prisma.faculty.findMany({ orderBy: { nameUz: "asc" } }),
      prisma.department.findMany({ orderBy: { nameUz: "asc" } }),
      prisma.category.findMany({ orderBy: { nameUz: "asc" } }),
      prisma.resource.findMany({ select: { id: true, title: true }, orderBy: { title: "asc" }, take: 200 }),
      prisma.user.findMany({ select: { id: true, fullName: true }, orderBy: { fullName: "asc" }, take: 200 })
    ]);

    return (
      <AdminEntityManager
        entity={section as (typeof entitySections)[number]}
        title={heading}
        initialItems={result.items as Record<string, unknown>[]}
        initialMeta={result.meta}
        auxiliary={{
          faculties: faculties.map((item) => ({ value: item.id, label: item.nameUz })),
          departments: departments.map((item) => ({ value: item.id, label: item.nameUz })),
          categories: categories.map((item) => ({ value: item.id, label: item.nameUz })),
          resources: resources.map((item) => ({ value: item.id, label: item.title })),
          users: users.map((item) => ({ value: item.id, label: item.fullName }))
        }}
      />
    );
  }

  const logs =
    section === "audit-logs"
      ? await prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 100 })
      : await prisma.securityLog.findMany({ orderBy: { createdAt: "desc" }, take: 100 });

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
      <div>
        <p className="text-sm uppercase tracking-[0.24em] text-primary">Admin monitoring</p>
        <h1 className="mt-2 text-3xl font-semibold capitalize">{heading}</h1>
      </div>
      <Card className="space-y-4">
        {logs.map((log) => (
          <div key={log.id} className="rounded-2xl border border-border bg-surface-soft p-4 text-sm">
            <p className="font-medium">
              {"action" in log ? `${log.action} / ${log.entity}` : `${log.event} / ${log.severity}`}
            </p>
            <p className="mt-1 text-muted-foreground">{log.createdAt.toISOString()}</p>
          </div>
        ))}
      </Card>
    </div>
  );
}
