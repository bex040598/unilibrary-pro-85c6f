import { Card } from "@/components/ui/card";
import { LoginForm } from "@/components/auth/login-form";
import { getDictionary } from "@/lib/i18n";

export default async function LoginPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = getDictionary(locale);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-7xl items-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid w-full gap-6 lg:grid-cols-2">
        <Card className="space-y-4 bg-[linear-gradient(135deg,rgba(11,45,77,0.98),rgba(30,90,168,0.84))] text-white">
          <p className="text-sm uppercase tracking-[0.24em] text-white/70">ATMU Identity Access</p>
          <h1 className="text-4xl font-semibold">{dict.auth.loginTitle}</h1>
          <p className="text-sm leading-7 text-white/75">
            Student cabinet, teacher workflow, moderator approval va administrator boshqaruvi yagona xavfsiz kirish
            nuqtasida birlashtirilgan.
          </p>
        </Card>
        <Card>
          <LoginForm locale={locale} />
        </Card>
      </div>
    </div>
  );
}
