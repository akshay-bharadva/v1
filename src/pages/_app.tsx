/*
This file is updated to refine the page transition animations for a more 'kinetic' feel.
- The ThemeProvider from next-themes is now configured with `defaultTheme="dark"` and `enableSystem={false}` for a consistent, dark-first experience.
- The `framer-motion` variants are adjusted for a faster, more fluid horizontal slide transition.
- The old local font import for 'Tahu' is removed.
- The main `font-space` class is replaced with `font-sans` to apply the new 'Inter' font globally.
*/
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/router";
import { ThemeProvider } from "@/components/theme-provider";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  const pageVariants = {
    initial: {
      opacity: 0,
      x: "-20px",
    },
    animate: {
      opacity: 1,
      x: "0px",
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      x: "20px",
      transition: {
        duration: 0.2,
        ease: "easeIn",
      },
    },
  };

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      storageKey="portfolio-theme"
    >
      <AnimatePresence
        mode="wait"
        initial={false}
        onExitComplete={() => window.scrollTo(0, 0)}
      >
        <main className="font-sans">
          <motion.div
            key={router.asPath}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
          >
            <Component {...pageProps} />
          </motion.div>
        </main>
      </AnimatePresence>
    </ThemeProvider>
  );
}