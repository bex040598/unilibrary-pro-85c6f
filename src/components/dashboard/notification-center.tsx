"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Bell, CheckCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";

type NotificationItem = {
  id: string;
  type: string;
  title: string;
  message: string;
  priority: string;
  actionUrl: string | null;
  readAt: string | Date | null;
  createdAt: string | Date;
};

type NotificationCenterProps = {
  initialNotifications: NotificationItem[];
  heading: string;
  subtitle: string;
};

const filterOptions = ["ALL", "RESERVATION", "LOAN", "RENEWAL", "RESOURCE", "READING_ROOM", "SECURITY"];

function matchesFilter(item: NotificationItem, activeFilter: string) {
  if (activeFilter === "ALL") {
    return true;
  }

  return item.type.includes(activeFilter);
}

export function NotificationCenter({ initialNotifications, heading, subtitle }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [filter, setFilter] = useState("ALL");
  const [isPending, startTransition] = useTransition();

  const filtered = notifications.filter((item) => matchesFilter(item, filter));

  async function refresh(type = filter) {
    const query = type === "ALL" ? "" : `?type=${encodeURIComponent(type)}`;
    const response = await fetch(`/api/notifications${query}`);
    const payload = await response.json();

    if (!response.ok || !payload.success) {
      throw new Error(payload.error?.message ?? "Notifications could not be loaded");
    }

    setNotifications(payload.data);
  }

  function handleFilterChange(value: string) {
    setFilter(value);
    startTransition(() => {
      refresh(value).catch((error) => {
        toast.error(error instanceof Error ? error.message : "Notifications could not be loaded");
      });
    });
  }

  function markAsRead(notificationId: string) {
    startTransition(() => {
      fetch(`/api/notifications/${notificationId}/read`, { method: "POST" })
        .then(async (response) => {
          const payload = await response.json();
          if (!response.ok || !payload.success) {
            throw new Error(payload.error?.message ?? "Notification update failed");
          }
          setNotifications((current) =>
            current.map((item) => (item.id === notificationId ? { ...item, readAt: new Date().toISOString() } : item))
          );
        })
        .catch((error) => {
          toast.error(error instanceof Error ? error.message : "Notification update failed");
        });
    });
  }

  function markAllAsRead() {
    startTransition(() => {
      fetch("/api/notifications/read-all", { method: "POST" })
        .then(async (response) => {
          const payload = await response.json();
          if (!response.ok || !payload.success) {
            throw new Error(payload.error?.message ?? "Bulk update failed");
          }
          setNotifications((current) => current.map((item) => ({ ...item, readAt: item.readAt ?? new Date().toISOString() })));
          toast.success("Barcha bildirishnomalar o'qilgan deb belgilandi.");
        })
        .catch((error) => {
          toast.error(error instanceof Error ? error.message : "Bulk update failed");
        });
    });
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-primary">Notification center</p>
          <h1 className="mt-2 text-3xl font-semibold">{heading}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Select value={filter} onChange={(event) => handleFilterChange(event.target.value)}>
            {filterOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
          <Button variant="secondary" onClick={markAllAsRead} disabled={isPending}>
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCheck className="mr-2 h-4 w-4" />}
            Mark all as read
          </Button>
        </div>
      </div>

      <Card className="space-y-4">
        {filtered.length ? (
          filtered.map((notification) => (
            <div key={notification.id} className="rounded-2xl border border-border bg-surface-soft p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{notification.title}</p>
                    <Badge value={notification.priority} />
                    {!notification.readAt ? <Badge value="UNREAD" /> : null}
                  </div>
                  <p className="text-sm text-muted-foreground">{notification.message}</p>
                  <div className="flex flex-wrap gap-3 text-sm">
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">{notification.type}</span>
                    {notification.actionUrl ? (
                      <Link href={notification.actionUrl} className="text-primary underline underline-offset-4">
                        Open action
                      </Link>
                    ) : null}
                  </div>
                </div>
                {!notification.readAt ? (
                  <Button variant="ghost" className="min-w-36" onClick={() => markAsRead(notification.id)} disabled={isPending}>
                    Mark as read
                  </Button>
                ) : null}
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-surface-soft p-10 text-center text-sm text-muted-foreground">
            <Bell className="mx-auto mb-3 h-10 w-10 text-primary/70" />
            Filtr bo'yicha bildirishnoma topilmadi.
          </div>
        )}
      </Card>
    </div>
  );
}
