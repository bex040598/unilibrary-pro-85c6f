export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";

import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/stat-card";
import { requirePageRole } from "@/lib/permissions/rbac";
import { prisma } from "@/lib/db/prisma";

const allowedSections = ["resources", "teachers", "statistics", "reports"] as const;

export default async function DepartmentHeadSectionPage({
  params
}: {
  params: Promise<{ section: string }>;
}) {
  const user = await requirePageRole("department-head");
  const { section } = await params;

  if (!allowedSections.includes(section as (typeof allowedSections)[number])) {
    notFound();
  }

  if (section === "resources") {
    const resources = await prisma.resource.findMany({
      where: { departmentId: user.departmentId ?? undefined },
      include: { uploadedBy: true },
      orderBy: { updatedAt: "desc" }
    });

    return (
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-semibold">Department resources</h1>
        <Card className="space-y-4">
          {resources.map((resource) => (
            <div key={resource.id} className="rounded-2xl border border-border bg-surface-soft p-4 text-sm">
              <p className="font-medium">{resource.title}</p>
              <p className="text-muted-foreground">
                {resource.uploadedBy.fullName} - {resource.status}
              </p>
            </div>
          ))}
        </Card>
      </div>
    );
  }

  if (section === "teachers") {
    const teachers = await prisma.user.findMany({
      where: {
        departmentId: user.departmentId ?? undefined,
        role: "TEACHER"
      },
      orderBy: { fullName: "asc" }
    });

    return (
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-semibold">Teachers</h1>
        <Card className="space-y-4">
          {teachers.map((teacher) => (
            <div key={teacher.id} className="rounded-2xl border border-border bg-surface-soft p-4 text-sm">
              <p className="font-medium">{teacher.fullName}</p>
              <p className="text-muted-foreground">{teacher.email}</p>
            </div>
          ))}
        </Card>
      </div>
    );
  }

  if (section === "statistics") {
    const [resourceCount, pendingCount, teacherCount] = await Promise.all([
      prisma.resource.count({ where: { departmentId: user.departmentId ?? undefined } }),
      prisma.resource.count({ where: { departmentId: user.departmentId ?? undefined, status: "PENDING_REVIEW" } }),
      prisma.user.count({ where: { departmentId: user.departmentId ?? undefined, role: "TEACHER" } })
    ]);

    return (
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-semibold">Department statistics</h1>
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard label="Resources" value={resourceCount} />
          <StatCard label="Pending review" value={pendingCount} />
          <StatCard label="Teachers" value={teacherCount} />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold">Reports</h1>
      <Card className="rounded-2xl border border-dashed border-border bg-surface-soft p-8 text-sm text-muted-foreground">
        Department export va richer reports admin/statistics endpoints bilan ulanadi.
      </Card>
    </div>
  );
}
