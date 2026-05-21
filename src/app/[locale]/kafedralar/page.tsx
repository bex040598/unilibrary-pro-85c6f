import { redirect } from "next/navigation";

export default async function KafedralarPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/departments`);
}
