export const dynamic = "force-dynamic";

import Link from "next/link";

import { AnalyticsCharts } from "@/components/dashboard/analytics-charts";
import { Card } from "@/components/ui/card";
import { requirePageRole } from "@/lib/permissions/rbac";
import { getAdminAnalytics } from "@/server/services/statistics-service";

export default async function DepartmentReportsPage() {
  await requirePageRole("department-head");
  const analytics = await getAdminAnalytics();

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-primary">Department reports</p>
          <h1 className="mt-2 text-3xl font-semibold">Kafedra hisobotlari</h1>
        </div>
        <Link href="/api/statistics/export?report=departments" className="text-sm text-primary underline underline-offset-4">
          Export department CSV
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
        Kafedra kesimidagi chuqur faculty/department drill-down keyingi iteratsiyada yanada boyitiladi.
      </Card>
    </div>
  );
}
