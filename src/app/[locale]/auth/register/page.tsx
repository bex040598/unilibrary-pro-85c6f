import { Card } from "@/components/ui/card";
import { RegisterForm } from "@/components/auth/register-form";
import { getDictionary } from "@/lib/i18n";

export default async function RegisterPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = getDictionary(locale);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-7xl items-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid w-full gap-6 lg:grid-cols-2">
        <Card className="space-y-4">
          <p className="text-sm uppercase tracking-[0.24em] text-primary">Access onboarding</p>
          <h1 className="text-4xl font-semibold">{dict.auth.registerTitle}</h1>
          <p className="text-sm leading-7 text-muted-foreground">
            Talabalar va o'qituvchilar elektron kutubxona ekotizimiga shu sahifa orqali ulanadi.
          </p>
        </Card>
        <Card>
          <RegisterForm locale={locale} />
        </Card>
      </div>
    </div>
  );
}
