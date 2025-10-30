import type { Metadata } from "next";
import { Heebo } from "next/font/google";
import "./globals.css";

const heebo = Heebo({ subsets: ["hebrew", "latin"] });

export const metadata: Metadata = {
  title: "מחולל דפי נחיתה לנדל\"ן",
  description: "אפליקציה ליצירת דפי נחיתה מקצועיים וממירים עבור נכסי נדל\"ן.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <body className={`${heebo.className} bg-gray-100 text-gray-800`}>{children}</body>
    </html>
  );
}
