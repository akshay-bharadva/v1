// This file is updated to import the 'Inter' font instead of 'Space Mono'.
// The 'scroll-smooth' class is added for native smooth scrolling.

import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en" className="scroll-smooth">
      <Head>
        {/* The Inter font is now imported via globals.css */}
      </Head>
      <body className="bg-background text-foreground antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}