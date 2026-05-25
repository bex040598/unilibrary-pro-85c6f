"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { loginSchema } from "@/lib/validation/auth";
import { getRoleDashboardPath } from "@/lib/role-dashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type LoginValues = {
  email: string;
  password: string;
};

function getLoginErrorMessage(status: number, payload: unknown) {
  if (status === 401) {
    return "Email yoki parol noto'g'ri";
  }

  if (status >= 500) {
    return "Serverda vaqtinchalik xatolik yuz berdi. Iltimos, keyinroq urinib ko'ring.";
  }

  if (
    payload &&
    typeof payload === "object" &&
    "error" in payload &&
    payload.error &&
    typeof payload.error === "object" &&
    "message" in payload.error &&
    typeof payload.error.message === "string"
  ) {
    return payload.error.message;
  }

  return "Kirish jarayonida xatolik yuz berdi";
}

export function LoginForm({ locale }: { locale: string }) {
  const router = useRouter();
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "student@atmu.uz",
      password: "Student12345!"
    }
  });

  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit(async (values) => {
        try {
          const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(values)
          });

          const payload = await response.json().catch(() => null);
          if (!response.ok) {
            toast.error(getLoginErrorMessage(response.status, payload));
            return;
          }

          toast.success("Kirish muvaffaqiyatli");
          router.push(
            payload?.data?.role ? getRoleDashboardPath(locale, payload.data.role) : payload?.data?.redirectTo ?? `/${locale}/cabinet`
          );
          router.refresh();
        } catch {
          toast.error("Serverda vaqtinchalik xatolik yuz berdi. Iltimos, keyinroq urinib ko'ring.");
        }
      })}
    >
      <div className="space-y-2">
        <label className="text-sm font-medium">Email</label>
        <Input type="email" {...form.register("email")} />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Parol</label>
        <Input type="password" {...form.register("password")} />
      </div>
      <Button type="submit" className="w-full">
        Kirish
      </Button>
    </form>
  );
}
