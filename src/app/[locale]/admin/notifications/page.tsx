export const dynamic = "force-dynamic";

import { NotificationCenter } from "@/components/dashboard/notification-center";
import { requirePageRole } from "@/lib/permissions/rbac";
import { listNotifications } from "@/server/services/notification-service";

export default async function AdminNotificationsPage() {
  const user = await requirePageRole("admin");
  const notifications = await listNotifications(user.id);

  return (
    <NotificationCenter
      initialNotifications={notifications}
      heading="Admin notifications"
      subtitle="Security alertlar, moderation hodisalari va tizimdagi muhim workflow eventlari shu yerda ko'rinadi."
    />
  );
}
