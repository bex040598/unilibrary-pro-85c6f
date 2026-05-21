"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

type Props = {
  locale: string;
  profilePath: string;
};

export function UserControls({ locale, profilePath }: Props) {
  const router = useRouter();

  return (
    <div className="flex items-center gap-2">
      <Button variant="secondary" onClick={() => router.push(profilePath)}>
        Profilim
      </Button>
      <Button
        variant="ghost"
        onClick={async () => {
          const response = await fetch("/api/auth/logout", { method: "POST" });
          const payload = await response.json().catch(() => null);

          if (!response.ok) {
            toast.error(payload?.error?.message ?? "Chiqishda xatolik yuz berdi");
            return;
          }

          toast.success("Tizimdan chiqildi");
          router.push(`/${locale}/auth/login`);
          router.refresh();
        }}
      >
        Chiqish
      </Button>
    </div>
  );
}
