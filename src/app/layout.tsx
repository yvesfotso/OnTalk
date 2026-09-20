import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { APP } from "@/lib/constants/app";

import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(APP.url),
  title: {
    default: `${APP.name} — Learn English with Lessons, Speaking Practice & AI`,
    template: `%s · ${APP.name}`,
  },
  description: APP.description,
  applicationName: APP.name,
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    siteName: APP.name,
    title: `${APP.name} — Learn English with Lessons, Speaking Practice & AI`,
    description: APP.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${APP.name} — Learn English`,
    description: APP.description,
  },
};

export const viewport: Viewport = {
  themeColor: "#f2530f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <a
          href="#main"
          className="sr-only rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
