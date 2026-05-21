import { redirect } from "next/navigation";

export default async function StudentRootPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  redirect(`/${locale}/student/dashboard`);
}
