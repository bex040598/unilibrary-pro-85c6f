export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";

import { ModeratorReviewActions } from "@/components/moderator/review-actions";
import { Card } from "@/components/ui/card";
import { requirePageRole } from "@/lib/permissions/rbac";
import { prisma } from "@/lib/db/prisma";

function parseAuditValue(value: string | null) {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export default async function ModeratorReviewPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePageRole("moderator");
  const { id } = await params;
  const [resource, auditLog] = await Promise.all([
    prisma.resource.findUnique({
      where: { id },
      include: {
        uploadedBy: true,
        category: true,
        department: true,
        faculty: true,
        authors: {
          include: {
            author: true
          }
        }
      }
    }),
    prisma.auditLog.findFirst({
      where: {
        entity: "Resource",
        entityId: id,
        action: {
          in: ["CREATE", "UPDATE"]
        }
      },
      orderBy: { createdAt: "desc" }
    })
  ]);

  if (!resource) {
    notFound();
  }

  const auditPayload = parseAuditValue(auditLog?.newValue ?? null);
  const validationReport = auditPayload?.uploadValidation;

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
      <div>
        <p className="text-sm uppercase tracking-[0.24em] text-primary">Moderator review</p>
        <h1 className="mt-2 text-3xl font-semibold">{resource.title}</h1>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
        <Card className="space-y-4">
          <h2 className="text-xl font-semibold">Metadata</h2>
          <pre className="overflow-x-auto rounded-2xl bg-surface-soft p-4 text-sm">
            {JSON.stringify(
              {
                uploadedBy: resource.uploadedBy.fullName,
                authors: resource.authors.map((item) => item.author.fullName),
                category: resource.category.nameUz,
                faculty: resource.faculty?.nameUz,
                department: resource.department?.nameUz,
                resourceType: resource.resourceType,
                language: resource.language,
                publicationYear: resource.publicationYear,
                publisher: resource.publisher,
                isbn: resource.isbn,
                keywords: resource.keywords,
                abstract: resource.abstract
              },
              null,
              2
            )}
          </pre>
          <div className="rounded-2xl border border-border bg-surface-soft p-4 text-sm">
            <p className="font-medium">Metadata quality checklist</p>
            <ul className="mt-3 space-y-2 text-muted-foreground">
              <li>{resource.abstract ? "Abstract mavjud" : "Abstract yo'q"}</li>
              <li>{resource.keywords ? "Keywords mavjud" : "Keywords yo'q"}</li>
              <li>{resource.fileUrl ? "Resource file mavjud" : "Resource file yo'q"}</li>
              <li>{resource.coverImageUrl ? "Cover image mavjud" : "Cover image yo'q"}</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-border bg-surface-soft p-4 text-sm">
            <p className="font-medium">Plagiarism placeholder</p>
            <p className="mt-2 text-muted-foreground">External plagiarism integration keyingi bosqich uchun placeholder sifatida tayyorlandi.</p>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="space-y-4">
            <h2 className="text-xl font-semibold">File validation result</h2>
            <pre className="overflow-x-auto rounded-2xl bg-surface-soft p-4 text-sm">{JSON.stringify(validationReport ?? {}, null, 2)}</pre>
          </Card>

          <Card className="space-y-4">
            <h2 className="text-xl font-semibold">File preview</h2>
            {resource.fileUrl && resource.fileFormat === "PDF" ? (
              <iframe src={`/api/files/resources/${resource.id}`} className="h-[520px] w-full rounded-2xl border border-border" />
            ) : (
              <div className="rounded-2xl border border-dashed border-border bg-surface-soft p-8 text-sm text-muted-foreground">
                PDF preview faqat PDF format uchun ko‘rsatiladi.
              </div>
            )}
          </Card>

          <Card className="space-y-4">
            <h2 className="text-xl font-semibold">Review action</h2>
            <ModeratorReviewActions resourceId={resource.id} />
          </Card>
        </div>
      </div>
    </div>
  );
}
