// This component's styling has been updated to match the new dark theme.
// - Backgrounds, text, borders, and input fields are changed to dark-mode colors (zinc/slate).
// - The Neo-Brutalist shadows and thick borders are replaced with subtle, clean lines.
// - The primary accent color (lime green) is used for the timer and focus states.
// - The font is updated from 'font-space' to 'font-sans' (Inter).
// - All functionality remains identical.

"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/supabase/client";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";

export default function SupabaseMFAChallenge() {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [isLoadingState, setIsLoadingState] = useState(true);
  const [remainingTime, setRemainingTime] = useState(30);
  const [factorId, setFactorId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const protectPageAndGetFactor = async () => {
      setIsLoadingState(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/admin/login");
        return;
      }

      const { data: aalData, error: aalError } =
        await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aalError) {
        setError("Could not check MFA status: " + aalError.message);
        setIsLoadingState(false);
        return;
      }

      if (aalData?.currentLevel === "aal2") {
        router.replace("/admin/dashboard");
        return;
      }
      if (aalData?.currentLevel !== "aal1" || aalData?.nextLevel !== "aal2") {
        setError(
          "MFA challenge is not applicable. You might need to set up MFA first.",
        );
        router.replace("/admin/login");
        return;
      }

      const { data: factorsData, error: factorsError } =
        await supabase.auth.mfa.listFactors();
      if (factorsError || !factorsData?.totp?.length) {
        setError("Could not retrieve MFA factor. Please try logging in again.");
        setIsLoadingState(false);
        router.replace("/admin/login");
        return;
      }

      const firstVerifiedFactor = factorsData.totp.find(
        (f) => f.status === "verified",
      );
      if (firstVerifiedFactor) {
        setFactorId(firstVerifiedFactor.id);
      } else {
        setError(
          "No verified MFA factor found. Please set up MFA or try logging in again.",
        );
        router.replace("/admin/setup-mfa");
        return;
      }
      setIsLoadingState(false);
    };
    protectPageAndGetFactor();
  }, [router]);

  useEffect(() => {
    const timer = setInterval(() => {
      setRemainingTime(30 - (new Date().getSeconds() % 30));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!factorId) {
      setError("MFA factor ID is missing. Please try logging in again.");
      return;
    }
    setIsLoadingState(true);
    setError("");

    const { error: verifyError } = await supabase.auth.mfa.challengeAndVerify({
      factorId: factorId,
      code: otp,
    });

    setIsLoadingState(false);
    if (verifyError) {
      setError(verifyError.message || "Invalid OTP. Please try again.");
      return;
    }

    router.replace("/admin/dashboard");
  };

  const stepVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  if (isLoadingState && !error && !factorId) {
    return (
      <motion.div
        key="mfa-challenge-loading"
        initial="initial"
        animate="animate"
        exit="exit"
        variants={stepVariants}
        transition={{ duration: 0.3 }}
        className="flex min-h-screen items-center justify-center bg-zinc-900 font-sans"
      >
        <div className="rounded-lg border border-zinc-700 bg-zinc-800 p-8 text-center">
          <div className="mx-auto mb-4 w-12 h-12 animate-spin rounded-full border-4 border-l-transparent border-accent"></div>
          <p className="font-semibold text-slate-200">
            Loading MFA Challenge...
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      key="mfa-challenge-page"
      variants={stepVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3 }}
      className="flex min-h-screen items-center justify-center bg-zinc-900 px-4 font-sans"
    >
      <div className="w-full max-w-md space-y-8 rounded-lg border border-zinc-700 bg-zinc-800 p-6 sm:p-8">
        <div className="text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-lg border border-zinc-600 bg-zinc-700">
            <span className="text-xl text-slate-100">🔑</span>
          </div>
          <h2 className="text-3xl font-bold text-slate-100">
            Two-Factor Authentication
          </h2>
          <p className="mt-2 text-zinc-400">
            Enter the code from your authenticator app
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleVerify}>
          <div>
            <label
              htmlFor="totpCode"
              className="mb-1 block text-sm font-bold text-slate-200"
            >
              Verification Code
            </label>
            <div className="flex items-center space-x-3">
              <input
                id="totpCode"
                name="totpCode"
                type="text"
                required
                maxLength={6}
                pattern="[0-9]{6}"
                className="flex-1 rounded-md border border-zinc-600 bg-zinc-700 px-3 py-2 text-center font-mono text-xl tracking-widest text-slate-100 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              />
              <div className="rounded-md border border-zinc-600 bg-zinc-700 p-2 text-center">
                <div className="text-2xl font-bold text-accent">
                  {remainingTime}
                </div>
                <div className="text-xs text-zinc-400">seconds</div>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="rounded-md border border-red-500/50 bg-red-900/20 p-3"
              >
                <p className="text-sm font-semibold text-red-300">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={isLoadingState || otp.length !== 6 || !factorId}
            className="w-full rounded-md bg-accent px-4 py-3 font-sans font-bold text-accent-foreground transition-opacity hover:opacity-90 active:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoadingState ? "Verifying..." : "Verify & Sign In"}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={async () => {
                setIsLoadingState(true);
                await supabase.auth.signOut();
                router.replace("/admin/login");
              }}
              className="font-sans text-sm font-semibold text-zinc-400 underline hover:text-accent"
            >
              Cancel and sign out
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}