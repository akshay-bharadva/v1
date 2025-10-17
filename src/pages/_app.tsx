// This file is updated to use a simpler, more elegant page transition.
// The font variable for 'tahu' is removed as we are standardizing on 'Inter'.
// The primary font class is no longer needed on the main element.

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
    },
    animate: {
      opacity: 1,
      transition: {
        duration: 0.4,
        ease: "easeInOut",
      },
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.2,
        ease: "easeInOut",
      },
    },
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <AnimatePresence
        mode="wait"
        initial={false}
        onExitComplete={() => window.scrollTo(0, 0)}
      >
        <motion.div
          key={router.asPath}
          initial="initial"
          animate="animate"
          exit="exit"
          variants={pageVariants}
        >
          <Component {...pageProps} />
        </motion.div>
      </AnimatePresence>
    </ThemeProvider>
  );
}