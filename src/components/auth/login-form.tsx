"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { loginSchema } from "@/lib/validation/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type LoginValues = {
  email: string;
  password: string;
};

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
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(values)
        });

        const payload = await response.json();
        if (!response.ok) {
          toast.error(payload.error?.message ?? "Login failed");
          return;
        }

        toast.success("Kirish muvaffaqiyatli");
        router.push(`/${locale}/cabinet`);
        router.refresh();
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
