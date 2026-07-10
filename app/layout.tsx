import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "../components/providers";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-inter",
  display: "swap",
});

const SITE_URL = "https://build.ebbli.co";
const TITLE = "Ebbli Build — AI Architecture & Construction for East Africa";
const DESCRIPTION =
  "Design, plan and build smarter with AI. Instant BOQs, floor plan briefs, cost estimates and construction management — priced in KES, built for Kenya.";

export const metadata: Metadata = {
  title: {
    default: TITLE,
    template: "%s — Ebbli Build",
  },
  description: DESCRIPTION,
  metadataBase: new URL(SITE_URL),
  keywords: [
    "architecture Kenya",
    "construction AI Kenya",
    "Bill of Quantities Kenya",
    "building design Kenya",
    "AEC platform Africa",
    "Ebbli Build",
  ],
  authors: [{ name: "Ebbli Build", url: SITE_URL }],
  creator: "Ebbli Build",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  manifest: "/manifest.json",
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: "website",
    url: SITE_URL,
    siteName: "Ebbli Build",
    locale: "en_KE",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    creator: "@ebbli_co",
  },
  alternates: { canonical: SITE_URL },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-KE" className={inter.variable} suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#b45309" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Ebbli Build" />
      </head>
      <body className="min-h-screen flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
