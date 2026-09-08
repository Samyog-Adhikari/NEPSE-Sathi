import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "NEPSE Sathi",
  description: "Nepal Stock Market Companion",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
