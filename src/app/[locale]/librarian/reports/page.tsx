export const dynamic = "force-dynamic";

import Link from "next/link";

import { AnalyticsCharts } from "@/components/dashboard/analytics-charts";
import { Card } from "@/components/ui/card";
import { requirePageRole } from "@/lib/permissions/rbac";
import { getAdminAnalytics } from "@/server/services/statistics-service";

export default async function LibrarianReportsPage() {
  await requirePageRole("librarian");
  const analytics = await getAdminAnalytics();

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-primary">Librarian reports</p>
          <h1 className="mt-2 text-3xl font-semibold">Kutubxona hisobotlari</h1>
        </div>
        <Link href="/api/statistics/export?report=loans" className="text-sm text-primary underline underline-offset-4">
          Export loan CSV
        </Link>
      </div>
      <AnalyticsCharts
        resourcesByCategory={analytics.resourcesByCategory}
        downloadsByMonth={analytics.downloadsByMonth}
        viewsByMonth={analytics.viewsByMonth}
        reservationTrend={analytics.reservationTrend}
        loanTrend={analytics.loanTrend}
        topSearchKeywords={analytics.topSearchKeywords}
      />
      <Card className="rounded-2xl border border-dashed border-border bg-surface-soft p-8 text-sm text-muted-foreground">
        PDF report export hali skeleton, CSV export esa ishlaydi.
      </Card>
    </div>
  );
}
