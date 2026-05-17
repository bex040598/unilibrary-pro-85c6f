export const dynamic = "force-dynamic";

import Image from "next/image";

import { CitationBox } from "@/components/catalog/citation-box";
import { ResourceCard } from "@/components/catalog/resource-card";
import { ResourceInteractions } from "@/components/catalog/resource-interactions";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getAppUrl } from "@/lib/app-url";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/permissions/rbac";
import { generateQrDataUrl } from "@/lib/qr";
import { formatDate } from "@/lib/utils";
import { getCitation, getResourceBySlug, listReviews, listSimilarResources } from "@/server/services/resource-service";

type ReviewItem = Awaited<ReturnType<typeof listReviews>>[number];
type SimilarItem = Awaited<ReturnType<typeof listSimilarResources>>[number];

export default async function ResourceDetailPage({
  params
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const resource = await getResourceBySlug(slug);
  const [citations, similar, reviews, qrDataUrl, currentUser] = await Promise.all([
    getCitation(resource.id),
    listSimilarResources(resource.id),
    listReviews(resource.id),
    generateQrDataUrl(`${getAppUrl()}/${locale}/catalog/${resource.slug}`),
    getCurrentUser()
  ]);
  const favorite = currentUser
    ? await prisma.favorite.findUnique({
        where: {
          userId_resourceId: {
            userId: currentUser.id,
            resourceId: resource.id
          }
        }
      })
    : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-6 xl:grid-cols-[320px,1fr,320px]">
        <Card className="space-y-5">
          <div className="overflow-hidden rounded-3xl border border-border bg-[linear-gradient(135deg,rgba(11,45,77,0.98),rgba(30,90,168,0.84))] p-6 text-white">
            <p className="text-sm uppercase tracking-[0.24em] text-white/70">{resource.resourceType}</p>
            <h1 className="mt-5 text-2xl font-semibold">{resource.title}</h1>
          </div>
          <div className="rounded-2xl border border-border bg-surface-soft p-4">
            <Image src={qrDataUrl} alt="QR" width={240} height={240} className="mx-auto h-48 w-48" />
          </div>
          <ResourceInteractions
            resourceId={resource.id}
            locale={locale}
            initialIsFavorite={Boolean(favorite)}
            canInteract={Boolean(currentUser)}
          />
        </Card>

        <div className="space-y-6">
          <Card className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge value={resource.status} />
              <Badge value={resource.accessType} />
              <Badge value={resource.language} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Mualliflar</p>
              <p className="mt-1 text-lg font-medium">{resource.authorNames.join(", ") || "Unknown author"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Abstract</p>
              <p className="mt-2 leading-7 text-foreground">{resource.abstract || resource.description}</p>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl bg-surface-soft p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Metadata</p>
                <ul className="mt-3 space-y-2 text-sm">
                  <li>Publisher: {resource.publisher || "-"}</li>
                  <li>Year: {resource.publicationYear || "-"}</li>
                  <li>ISBN: {resource.isbn || "-"}</li>
                  <li>Pages: {resource.pages || "-"}</li>
                  <li>Department: {resource.department?.nameUz || "-"}</li>
                </ul>
              </div>
              <div className="rounded-2xl bg-surface-soft p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Usage</p>
                <ul className="mt-3 space-y-2 text-sm">
                  <li>Views: {resource.viewCount}</li>
                  <li>Downloads: {resource.downloadCount}</li>
                  <li>Rating: {resource.ratingAvg.toFixed(1)}</li>
                  <li>Reviews: {resource.ratingCount}</li>
                  <li>Available copies: {resource.availableCopies}</li>
                </ul>
              </div>
            </div>
          </Card>

          <CitationBox citations={citations} />

          <Card className="space-y-4">
            <h2 className="text-2xl font-semibold">PDF Viewer</h2>
            {resource.fileUrl ? (
              <iframe
                src={`/api/files/resources/${resource.id}`}
                className="h-[640px] w-full rounded-2xl border border-border"
                title={resource.title}
              />
            ) : (
              <div className="rounded-2xl border border-dashed border-border bg-surface-soft p-8 text-sm text-muted-foreground">
                Bu resurs uchun yuklangan fayl topilmadi.
              </div>
            )}
          </Card>

          <Card className="space-y-4">
            <h2 className="text-2xl font-semibold">Reviews</h2>
            <div className="space-y-4">
              {reviews.map((review: ReviewItem) => (
                <div key={review.id} className="rounded-2xl border border-border bg-surface-soft p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{review.user.fullName}</p>
                    <p className="text-sm text-muted-foreground">{formatDate(review.createdAt)}</p>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">Rating: {review.rating}/5</p>
                  <p className="mt-2 text-sm">{review.comment}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="space-y-4">
            <h2 className="text-xl font-semibold">Availability</h2>
            <p className="text-sm text-muted-foreground">Available copies: {resource.availableCopies}</p>
            <div className="space-y-2">
              {resource.copies.map((copy) => (
                <div key={copy.id} className="rounded-2xl border border-border bg-surface-soft p-4 text-sm">
                  <p>Inventory: {copy.inventoryNumber}</p>
                  <p>Shelf: {copy.shelfLocation || "-"}</p>
                  <p>Status: {copy.status}</p>
                </div>
              ))}
            </div>
          </Card>
          <Card className="space-y-4">
            <h2 className="text-xl font-semibold">Similar resources</h2>
            <div className="grid gap-4">
              {similar.map((item: SimilarItem) => (
                <ResourceCard
                  key={item.id}
                  locale={locale}
                  resource={{
                    ...item,
                    authorNames: [],
                    availableCopies: 0
                  }}
                />
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
