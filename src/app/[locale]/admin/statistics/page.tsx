export const dynamic = "force-dynamic";

import Link from "next/link";

import { AnalyticsCharts } from "@/components/dashboard/analytics-charts";
import { Card } from "@/components/ui/card";
import { requirePageRole } from "@/lib/permissions/rbac";
import { getAdminAnalytics } from "@/server/services/statistics-service";

export default async function AdminStatisticsPage() {
  await requirePageRole("admin");
  const analytics = await getAdminAnalytics();

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-primary">Statistika</p>
          <h1 className="mt-2 text-3xl font-semibold">Admin statistikasi</h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/api/statistics/export?report=resources" className="text-sm text-primary underline underline-offset-4">
            Kategoriyalar CSV eksporti
          </Link>
          <Link href="/api/statistics/export?report=downloads" className="text-sm text-primary underline underline-offset-4">
            Yuklab olishlar CSV eksporti
          </Link>
        </div>
      </div>
      <AnalyticsCharts
        resourcesByCategory={analytics.resourcesByCategory}
        downloadsByMonth={analytics.downloadsByMonth}
        viewsByMonth={analytics.viewsByMonth}
        reservationTrend={analytics.reservationTrend}
        loanTrend={analytics.loanTrend}
        topSearchKeywords={analytics.topSearchKeywords}
      />
      <Card className="space-y-4">
        <h2 className="text-xl font-semibold">Qo‘shimcha tahlil</h2>
        <pre className="overflow-x-auto rounded-2xl bg-surface-soft p-4 text-sm">{JSON.stringify(analytics, null, 2)}</pre>
      </Card>
    </div>
  );
}
