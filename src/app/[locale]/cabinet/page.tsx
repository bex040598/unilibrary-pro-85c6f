import { redirect } from "next/navigation";

import { requirePageRole } from "@/lib/permissions/rbac";
import { getRoleDashboardPath } from "@/lib/role-dashboard";

export default async function CabinetPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const user = await requirePageRole("student", locale);
  redirect(getRoleDashboardPath(locale, user.role));
}
