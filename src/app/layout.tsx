import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sokkar | سوق العقارات",
  description: "منصة سكّر للعقارات - بيع وشراء وإيجار العقارات بسهولة",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          crossOrigin=""
        />
      </head>
      <body className="bg-gray-50 text-gray-900 antialiased font-cairo">
        {children}
      </body>
    </html>
  );
}
