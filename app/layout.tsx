
import type { Metadata } from "next";
import { Heebo } from "next/font/google";
import "./globals.css";
import React from "react";
import { NextRouterProvider } from "../components/RouterContext";
import GoogleAnalytics from "../components/GoogleAnalytics";

const heebo = Heebo({ subsets: ["hebrew", "latin"] });

export const metadata: Metadata = {
  title: "Realty-Pages | דפי נחיתה לנדל\"ן ב-20 שניות בטכנולוגיה המובילה בעולם",
  description: "הופכים נכסים ללידים ב-20 שניות. Realty-Pages היא המערכת המתקדמת ביותר בעולם לבניית דפי נחיתה אוטומטיים לנדל\"ן מבוססת טכנולוגיית GenEstate AI. התחילו עכשיו!",
  keywords: "דפי נחיתה לנדל\"ן, שיווק נדל\"ן אוטומטי, לידים למתווכים, לידים למשווקי נדל\"ן, בניית דף נחיתה, בניית דפי נחיתה, שיווק נדל\"ן",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <body className={`${heebo.className} bg-slate-900 text-white`}>
        <GoogleAnalytics />
        <NextRouterProvider>
          {children}
        </NextRouterProvider>
      </body>
    </html>
  );
}
