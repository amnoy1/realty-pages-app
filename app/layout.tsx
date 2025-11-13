import type { Metadata } from "next";
import { Heebo } from "next/font/google";
import "./globals.css";
import React from "react";

const heebo = Heebo({ subsets: ["hebrew", "latin"] });

export const metadata: Metadata = {
  title: "מחולל דפי נחיתה לנדל\"ן",
  description: "אפליקציה ליצירת דפי נחיתה מקצועיים וממירים עבור נכסי נדל\"н, עם תיאור נכס משודרג באמצעות AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <body className={`${heebo.className} bg-slate-50 text-slate-800`}>{children}</body>
    </html>
  );
}