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

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://hanbuy.com";

export const metadata: Metadata = {
  title: {
    default: "HanBuy - Korea to Philippines E-commerce & Logistics",
    template: "%s | HanBuy",
  },
  description:
    "Shop Korean products and consolidate your purchases with HanBuy. Professional Korea-to-Philippines e-commerce and logistics platform with real-time box tracking.",
  keywords: [
    "Korean products",
    "Philippines",
    "e-commerce",
    "logistics",
    "consolidation",
    "Korea shipping",
    "Korean goods",
    "Philippines delivery",
  ],
  authors: [{ name: "HanBuy" }],
  creator: "HanBuy",
  publisher: "HanBuy",
  metadataBase: new URL(baseUrl),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseUrl,
    siteName: "HanBuy",
    title: "HanBuy - Korea to Philippines E-commerce & Logistics",
    description:
      "Shop Korean products and consolidate your purchases with HanBuy. Professional Korea-to-Philippines e-commerce and logistics platform.",
    images: [
      {
        url: `${baseUrl}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "HanBuy - Korea to Philippines E-commerce & Logistics",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "HanBuy - Korea to Philippines E-commerce & Logistics",
    description:
      "Shop Korean products and consolidate your purchases with HanBuy.",
    images: [`${baseUrl}/og-image.jpg`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Add your verification codes here when available
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

