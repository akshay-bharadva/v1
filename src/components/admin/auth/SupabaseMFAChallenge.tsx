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
        className="flex min-h-screen items-center justify-center bg-indigo-100 font-space"
      >
        <div className="border-2 border-black bg-white p-8 text-center">
          <div className="mx-auto mb-4 size-12 animate-spin rounded-none border-y-4 border-indigo-600"></div>
          <p className="font-semibold text-gray-700">
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
      className="flex min-h-screen items-center justify-center bg-indigo-100 px-4 font-space"
    >
      <div className="w-full max-w-md space-y-8 border-2 border-black bg-white p-6 shadow-[8px_8px_0px_#000000] sm:p-8">
        <div className="text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-none border-2 border-black bg-indigo-500">
            <span className="text-xl text-white">🔑</span>
          </div>
          <h2 className="text-3xl font-bold text-black">
            Two-Factor Authentication
          </h2>
          <p className="mt-2 text-gray-700">
            Enter the code from your authenticator app
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleVerify}>
          <div>
            <label
              htmlFor="totpCode"
              className="mb-1 block text-sm font-bold text-black"
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
                className="flex-1 rounded-none border-2 border-black px-3 py-2 text-center font-mono text-xl tracking-widest focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              />
              <div className="rounded-none border-2 border-black p-2 text-center">
                <div className="text-2xl font-bold text-indigo-600">
                  {remainingTime}
                </div>
                <div className="text-xs text-gray-600">seconds</div>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="rounded-none border-2 border-red-500 bg-red-100 p-3"
              >
                <p className="text-sm font-semibold text-red-700">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={isLoadingState || otp.length !== 6 || !factorId}
            className="w-full rounded-none border-2 border-black bg-indigo-600 px-4 py-3 font-space font-bold text-white shadow-[4px_4px_0px_#000] transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:bg-indigo-700 hover:shadow-[2px_2px_0px_#000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none disabled:translate-x-0 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70 disabled:shadow-none"
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
              className="font-space text-sm font-semibold text-gray-600 underline hover:text-black"
            >
              Cancel and sign out
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}