/*
This file is updated to integrate the new mobile navigation structure.
- The `BottomMenu` component import and usage have been removed.
- The new `MobileHeader` component is imported and rendered alongside the existing desktop `Header`.
- Because both header components use mutually exclusive responsive classes (`md:hidden` vs. `hidden md:block`), they will correctly switch based on the viewport size.
- The top margin on the `main` element has been adjusted to `mt-16 md:mt-20` to account for the consistent height of both the mobile and desktop headers.
*/
import Head from "next/head";
import { PropsWithChildren } from "react";
import Container from "./container";
import Header from "./header";
import MobileHeader from "./MobileHeader"; // Import the new MobileHeader
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
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
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
      </Head>
      <div className="flex min-h-screen flex-col justify-between font-sans selection:bg-accent selection:text-accent-foreground">
        <Header />
        <MobileHeader />
        <main className="mt-16 w-full grow md:mt-20">
          <Container>{children}</Container>
        </main>
        <Container>
          <Footer />
        </Container>
        <SonnerToaster />
        <ShadcnToaster />
      </div>
    </>
  );
}