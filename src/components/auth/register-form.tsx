"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { registerSchema } from "@/lib/validation/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

type RegisterValues = {
  fullName: string;
  email: string;
  password: string;
  role: "STUDENT" | "TEACHER";
};

export function RegisterForm({ locale }: { locale: string }) {
  const router = useRouter();
  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema.pick({ fullName: true, email: true, password: true, role: true })),
    defaultValues: {
      role: "STUDENT"
    }
  });

  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit(async (values) => {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(values)
        });

        const payload = await response.json();
        if (!response.ok) {
          toast.error(payload.error?.message ?? "Registration failed");
          return;
        }

        toast.success("Ro'yxatdan o'tish muvaffaqiyatli yakunlandi");
        router.push(`/${locale}/auth/login`);
      })}
    >
      <div className="space-y-2">
        <label className="text-sm font-medium">To'liq ism</label>
        <Input {...form.register("fullName")} />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Email</label>
        <Input type="email" {...form.register("email")} />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Parol</label>
        <Input type="password" {...form.register("password")} />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Rol</label>
        <Select {...form.register("role")}>
          <option value="STUDENT">Talaba</option>
          <option value="TEACHER">O'qituvchi</option>
        </Select>
      </div>
      <Button type="submit" className="w-full">
        Ro'yxatdan o'tish
      </Button>
    </form>
  );
}
