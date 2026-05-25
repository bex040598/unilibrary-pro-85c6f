export const dynamic = "force-dynamic";

import { Card } from "@/components/ui/card";
import { AnalyticsCharts } from "@/components/dashboard/analytics-charts";
import { requirePageRole } from "@/lib/permissions/rbac";
import { getAdminAnalytics } from "@/server/services/statistics-service";

export default async function LibrarianStatisticsPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  await requirePageRole("librarian", locale);
  const analytics = await getAdminAnalytics();

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
      <div>
        <p className="text-sm uppercase tracking-[0.24em] text-primary">Kutubxona statistikasi</p>
        <h1 className="mt-2 text-3xl font-semibold">Ko‘rishlar, yuklab olishlar va faol foydalanuvchilar</h1>
      </div>
      <AnalyticsCharts
        resourcesByCategory={analytics.resourcesByCategory}
        downloadsByMonth={analytics.downloadsByMonth}
        viewsByMonth={analytics.viewsByMonth}
        reservationTrend={analytics.reservationTrend}
        loanTrend={analytics.loanTrend}
        topSearchKeywords={analytics.topSearchKeywords}
      />
      <Card className="rounded-2xl border border-border bg-surface-soft p-6 text-sm text-muted-foreground">
        Kutubxonachi uchun bugungi ko‘rilgan resurslar, eng faol talabalar va kafedralar kesimidagi hisobotlar shu sahifada ko‘rsatiladi.
      </Card>
    </div>
  );
}
