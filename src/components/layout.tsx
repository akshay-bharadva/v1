// The Layout is updated to remove the bottom menu (replaced by the overlay) and simplify the main content margin.
// It now provides the core structure for the new minimalist design.

import Head from "next/head";
import { PropsWithChildren } from "react";
import Header from "./header";
import Footer from "./footer";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { Toaster as ShadcnToaster } from "@/components/ui/toaster";

type LayoutProps = PropsWithChildren;

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://akshay-bharadva.github.io";
const DEFAULT_OG_TITLE = "Akshay Bharadva - Fullstack Developer";
const DEFAULT_OG_DESCRIPTION =
  "Portfolio and Blog of Akshay Bharadva, showcasing projects and thoughts on web development.";
const DEFAULT_OG_IMAGE = `${SITE_URL}/default-og-image.png`;

export default function Layout({ children }: LayoutProps) {
  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Akshay Bharadva</title>
        <meta
          name="description"
          content="Akshay Bharadva - Fullstack Developer Portfolio & Blog"
        />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />

        <meta property="og:title" content={DEFAULT_OG_TITLE} />
        <meta property="og:description" content={DEFAULT_OG_DESCRIPTION} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={SITE_URL} />
        <meta property="og:image" content={DEFAULT_OG_IMAGE} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="Akshay Bharadva" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={DEFAULT_OG_TITLE} />
        <meta name="twitter:description" content={DEFAULT_OG_DESCRIPTION} />
        <meta name="twitter:image" content={DEFAULT_OG_IMAGE} />

        <link rel="alternate" type="application/rss+xml" title="Akshay Bharadva Blog RSS Feed" href="/feed.xml" />
        <link rel="sitemap" type="application/xml" title="Sitemap" href="/sitemap.xml" />
      </Head>
      <div className="flex min-h-screen flex-col bg-background font-sans">
        <Header />
        <main className="w-full grow pt-20">
          {children}
        </main>
        <Footer />
        <SonnerToaster />
        <ShadcnToaster />
      </div>
    </>
  );
}