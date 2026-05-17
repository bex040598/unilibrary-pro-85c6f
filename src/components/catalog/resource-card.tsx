import Link from "next/link";
import { Eye, Heart, Library, Quote, Star, Download } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatNumber } from "@/lib/utils";

type ResourceCardProps = {
  locale: string;
  resource: {
    id: string;
    slug: string;
    title: string;
    authorNames?: string[];
    publicationYear?: number | null;
    language: string;
    resourceType: string;
    fileFormat?: string | null;
    ratingAvg: number;
    viewCount: number;
    downloadCount: number;
    accessType: string;
    status: string;
    department?: { nameUz: string } | null;
    availableCopies?: number;
  };
};

export function ResourceCard({ locale, resource }: ResourceCardProps) {
  return (
    <Card className="group flex h-full flex-col gap-5 transition duration-300 hover:-translate-y-1 hover:shadow-glow">
      <div className="overflow-hidden rounded-2xl border border-border bg-surface-soft">
        <div className="flex aspect-[4/5] items-end justify-between bg-[radial-gradient(circle_at_top,rgba(30,90,168,0.18),transparent_55%),linear-gradient(135deg,rgba(11,45,77,0.98),rgba(30,90,168,0.82))] p-5 text-white transition duration-300 group-hover:scale-[1.02]">
          <div className="max-w-[70%]">
            <p className="text-xs uppercase tracking-[0.24em] text-white/70">{resource.resourceType}</p>
            <p className="mt-3 text-lg font-semibold leading-tight">{resource.title}</p>
          </div>
          <Library className="h-8 w-8 text-accent" />
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Badge value={resource.accessType} />
          <Badge value={resource.status} />
          {resource.fileFormat ? <Badge value={resource.fileFormat} /> : null}
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">{resource.authorNames?.join(", ") || "Unknown author"}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {resource.department?.nameUz ?? "ATMU"} • {resource.publicationYear ?? "n/a"} • {resource.language}
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Star className="h-3.5 w-3.5 text-accent" />
            {resource.ratingAvg.toFixed(1)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Eye className="h-3.5 w-3.5 text-info" />
            {formatNumber(resource.viewCount)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Download className="h-3.5 w-3.5 text-success" />
            {formatNumber(resource.downloadCount)}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">Available copies: {resource.availableCopies ?? 0}</p>
      </div>
      <div className="mt-auto flex flex-wrap gap-2">
        <Link
          href={`/${locale}/catalog/${resource.slug}`}
          className="inline-flex h-10 items-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground"
        >
          View
        </Link>
        <div className="inline-flex h-10 items-center rounded-xl border border-border px-4 text-sm text-muted-foreground">
          <Heart className="mr-2 h-4 w-4" />
          Save
        </div>
        <div className="inline-flex h-10 items-center rounded-xl border border-border px-4 text-sm text-muted-foreground">
          <Quote className="mr-2 h-4 w-4" />
          Citation
        </div>
      </div>
    </Card>
  );
}
