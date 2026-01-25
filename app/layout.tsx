
import type { Metadata } from "next";
import { Heebo } from "next/font/google";
import "./globals.css";
import React from "react";
import { NextRouterProvider } from "../components/RouterContext";

const heebo = Heebo({ subsets: ["hebrew", "latin"] });

export const metadata: Metadata = {
  title: "Realty-Pages | דפי נחיתה לנדל\"ן ב-20 שניות בטכנולוגיה המובילה בעולם",
  description: "הופכים נכסים ללידים ב-20 שניות. Realty-Pages היא המערכת המתקדמת ביותר בעולם לבניית דפי נחיתה אוטומטיים לנדל\"ן מבוססת טכנולוגיית GenEstate AI. התחילו עכשיו!",
  keywords: "דפי נחיתה לנדל\"ן, שיווק נדל\"ן אוטומטי, לידים למתווכים, לידים למשווקי נדל\"ן, בניית דף נחיתה, בניית דפי נחיתה, שיווק נדל\"ן",
  openGraph: {
    title: "Realty-Pages | דפי נחיתה לנדל\"ן ב-20 שניות",
    description: "המערכת המתקדמת בעולם לבניית דפי נחיתה אוטומטיים לנדל\"ן מבוססת טכנולוגיית GenEstate AI.",
    url: "https://realty-pages.com",
    siteName: "Realty-Pages",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 1200,
        alt: "Realty-Pages Logo",
      },
    ],
    locale: "he_IL",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Realty-Pages | דפי נחיתה לנדל\"ן ב-20 שניות",
    description: "המערכת המתקדמת בעולם לבניית דפי נחיתה אוטומטיים לנדל\"ן.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <body className={`${heebo.className} bg-slate-900 text-white`}>
        <NextRouterProvider>
          {children}
        </NextRouterProvider>
      </body>
    </html>
  );
}
