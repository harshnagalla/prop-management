import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/providers";
import { StructuredData } from "@/components/structured-data";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://prop-management-one.vercel.app"),
  title: "BhoomiQ — AI-Powered Property Intelligence for Indian Families",
  description:
    "Manage your family's property portfolio with AI-powered bill scanning, rental income tracking, ROI analytics, and Excel import. Built for Indian property owners managing 5-100+ properties across Ahmedabad and beyond.",
  manifest: "/manifest.json",
  alternates: { canonical: "/" },
  openGraph: {
    title: "BhoomiQ — AI-Powered Property Intelligence",
    description:
      "Track bills, rental income, documents, and ROI for your entire property portfolio. AI scans Indian utility bills instantly.",
    url: "https://prop-management-one.vercel.app",
    siteName: "BhoomiQ",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BhoomiQ — AI-Powered Property Intelligence",
    description:
      "Track bills, rental income, documents, and ROI for your entire property portfolio. AI scans Indian utility bills instantly.",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <StructuredData />
        <noscript>
          <style>{`.opacity-0{opacity:1!important;transform:none!important}`}</style>
        </noscript>
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
