import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "NEPSE Sathi",
  description: "Nepal Stock Market Companion",
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const resolvedParams = await params;
  const locale = resolvedParams.locale || "en";

  return <div lang={locale}>{children}</div>;
}
