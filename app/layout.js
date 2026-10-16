import "./globals.css";
import Navbar from "@/components/Navbar";
import HeaderBanner from "@/components/HeaderBanner";
import Footer from "@/components/Footer";
import ThemeScript from "@/components/ThemeScript";
import SocialBarAd from "@/components/SocialBarAd";
import Script from "next/script";
import { Suspense } from "react";
import { SITE_CONFIG } from "@/lib/config";

export const metadata = {
  metadataBase: new URL(SITE_CONFIG.baseUrl),
  title: {
    default: SITE_CONFIG.defaultTitle,
    template: `%s | ${SITE_CONFIG.siteName}`,
  },
  description: SITE_CONFIG.defaultDescription,
  keywords: SITE_CONFIG.defaultKeywords,
  authors: [{ name: SITE_CONFIG.defaultAuthor }],
  creator: SITE_CONFIG.defaultAuthor,
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: SITE_CONFIG.baseUrl,
  },
  openGraph: {
    type: "website",
    locale: "bn_BD",
    url: SITE_CONFIG.baseUrl,
    siteName: SITE_CONFIG.siteName,
    title: SITE_CONFIG.defaultTitle,
    description: SITE_CONFIG.defaultDescription,
    images: [
      {
        url: SITE_CONFIG.defaultOgImage,
        width: 1200,
        height: 630,
        alt: SITE_CONFIG.defaultTitle,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_CONFIG.defaultTitle,
    description: SITE_CONFIG.defaultDescription,
    images: [SITE_CONFIG.defaultOgImage],
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon.png", sizes: "128x128", type: "image/png" },
    ],
  },
};

export const viewport = {
  themeColor: "#07090e",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  const gaId = SITE_CONFIG.gaMeasurementId;

  return (
    <html lang="bn" data-theme="dark" suppressHydrationWarning>
      <head>
        <ThemeScript />
        <link rel="preconnect" href="https://i.postimg.cc" />
        {gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}');
              `}
            </Script>
          </>
        )}
      </head>
      <body>
        <Suspense fallback={<div style={{ height: "68px" }} />}>
          <Navbar />
        </Suspense>
        <HeaderBanner />
        <main className="site-main-content">{children}</main>
        <Footer />
        <SocialBarAd />
      </body>
    </html>
  );
}
