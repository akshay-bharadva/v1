import * as React from "react";
import { motion } from "framer-motion";
import Layout from "@/components/layout";

 const pageVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 },
  };

function Loading() {
   return (
    <Layout>
      <motion.div
        key="admin-index-loading"
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
        className="flex min-h-screen items-center justify-center bg-zinc-900 font-sans"
      >
        <div className="rounded-lg border border-zinc-700 bg-zinc-800 p-8 text-center">
          <div className="mx-auto mb-4 w-12 h-12 animate-spin rounded-full border-4 border-l-transparent border-accent"></div>
          <p className="font-semibold text-slate-200">Loading...</p>
        </div>
      </motion.div>
    </Layout>
  );
}

export default Loading;