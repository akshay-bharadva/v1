import { useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/supabase/client";
import { motion } from "framer-motion";
import Layout from "@/components/layout";

export default function AdminIndexPage() {
  const router = useRouter();

  useEffect(() => {
    const checkAuthStateAndRedirect = async () => {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.error("Error fetching session on admin index:", sessionError);
        router.replace("/admin/login");
        return;
      }

      if (!session) {
        router.replace("/admin/login");
        return;
      }

      const { data: aalData, error: aalError } =
        await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

      if (aalError) {
        console.error("Error fetching AAL status on admin index:", aalError);
        router.replace("/admin/login");
        return;
      }

      if (aalData?.currentLevel === "aal2") {
        router.replace("/admin/dashboard");
      } else if (
        aalData?.currentLevel === "aal1" &&
        aalData?.nextLevel === "aal2"
      ) {
        router.replace("/admin/mfa-challenge");
      } else {
        const { data: factorsData, error: factorsError } =
          await supabase.auth.mfa.listFactors();
        if (factorsError) {
          console.error(
            "Error listing MFA factors on admin index:",
            factorsError,
          );
          router.replace("/admin/login");
          return;
        }

        const verifiedFactor = factorsData?.totp?.find(
          (factor) => factor.status === "verified",
        );

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
    transition: { duration: 0.2 },
  };

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
          <p className="font-semibold text-slate-200">Loading Admin Area...</p>
        </div>
      </motion.div>
    </Layout>
  );
}