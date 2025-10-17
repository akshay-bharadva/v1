/*
This file is updated for the new design system.
- The loading state is simplified to be a minimal, clean spinner, removing the neo-brutalist box.
- The `font-space` class is removed, inheriting the global `font-sans`.
- The redirection logic remains the same, as it's purely functional.
*/
import { useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/supabase/client";
import { motion } from "framer-motion";
import Layout from "@/components/layout";
import { Loader2 } from "lucide-react";

export default function AdminIndexPage() {
  const router = useRouter();

  useEffect(() => {
    const checkAuthStateAndRedirect = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      console.log("###session", session)

      if (!session) {
        router.replace("/admin/login");
        return;
      }

      const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

      console.log("####aalData", aalData)

      if (aalData?.currentLevel === "aal2") {
        router.replace("/admin/dashboard");
      } else if (
        aalData?.currentLevel === "aal1" &&
        aalData?.nextLevel === "aal2"
      ) {
        router.replace("/admin/mfa-challenge");
      } else {
        const { data: factorsData } = await supabase.auth.mfa.listFactors();
        const verifiedFactor = factorsData?.totp?.find((factor) => factor.status === "verified");

        if (!verifiedFactor) {
          router.replace("/admin/setup-mfa");
        } else {
          router.replace("/admin/mfa-challenge");
        }
      }
    };

    checkAuthStateAndRedirect();
  }, [router]);

  const pageVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  };

  return (
    <Layout>
      <motion.div
        key="admin-index-loading"
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="flex min-h-[calc(100vh-10rem)] items-center justify-center"
      >
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </motion.div>
    </Layout>
  );
}