export const dynamic = "force-dynamic";

import type React from "react";
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import Script from "next/script";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";

import ClientLayout from "./ClientLayout";   // ⭐ ADDED

config.autoAddCss = false;

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Meta Partner Demos - Create Demo Kits",
  icons: {
    icon: "../favicon.png",
  },
  description:
    "Create immersive demo kits with Meta Quest headsets. Choose headsets, select apps, and manage your demo kit orders.",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={poppins.className}>
      <body className="font-sans antialiased">

        {/* ⭐ NOW NAV + FOOTER ARE CONTROLLED HERE */}
        <ClientLayout>
          {children}
        </ClientLayout>

        <Analytics />

        <Script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
