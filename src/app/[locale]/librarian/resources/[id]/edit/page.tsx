export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";

import { TeacherResourceWizard } from "@/components/teacher/resource-wizard";
import { Card } from "@/components/ui/card";
import { requirePageRole } from "@/lib/permissions/rbac";
import { prisma } from "@/lib/db/prisma";

export default async function LibrarianEditResourcePage({
  params
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  await requirePageRole("librarian", locale);

  const [categories, faculties, departments, resource] = await Promise.all([
    prisma.category.findMany({ orderBy: { nameUz: "asc" } }),
    prisma.faculty.findMany({ orderBy: { nameUz: "asc" } }),
    prisma.department.findMany({ orderBy: { nameUz: "asc" } }),
    prisma.resource.findUnique({
      where: { id },
      include: {
        authors: {
          include: {
            author: true
          }
        }
      }
    })
  ]);

  if (!resource) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
      <div>
        <p className="text-sm uppercase tracking-[0.24em] text-primary">Kutubxonachi wizard</p>
        <h1 className="mt-2 text-3xl font-semibold">Resursni tahrirlash</h1>
      </div>
      <Card>
        <TeacherResourceWizard
          locale={locale}
          categories={categories.map((item) => ({ id: item.id, label: item.nameUz }))}
          faculties={faculties.map((item) => ({ id: item.id, label: item.nameUz }))}
          departments={departments.map((item) => ({ id: item.id, label: item.nameUz, facultyId: item.facultyId }))}
          draftRedirectPath={`/${locale}/librarian/resources`}
          allowSubmitToReview={false}
          draftButtonLabel="O'zgarishlarni saqlash"
          resource={{
            ...resource,
            authorNames: resource.authors.map((item) => item.author.fullName)
          }}
        />
      </Card>
    </div>
  );
}
