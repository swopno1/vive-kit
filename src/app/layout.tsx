import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: "ViveKit - Free AI Client Communication Toolkit",
  description: "A free AI-powered toolkit for freelancers, agencies, and consultants — transform raw client conversations into strategic replies. By ViveScript Solutions.",
  authors: [{ name: "ViveScript Solutions", url: "https://www.vivescriptsolutions.com" }],
  creator: "ViveScript Solutions",
  publisher: "ViveScript Solutions",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "ViveKit - Free AI Client Communication Toolkit",
    description: "A free AI-powered toolkit for freelancers, agencies, and consultants — transform raw client conversations into strategic replies. By ViveScript Solutions.",
    url: "https://kit.vivereply.com",
    siteName: "ViveKit",
    type: "website",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "ViveKit by ViveScript Solutions",
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ViveKit - Free AI Client Communication Toolkit",
    description: "A free AI-powered toolkit for freelancers, agencies, and consultants — transform raw client conversations into strategic replies.",
    images: ["/twitter-header.png"],
    creator: "@vivescript",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100">{children}</body>
    </html>
  );
}
