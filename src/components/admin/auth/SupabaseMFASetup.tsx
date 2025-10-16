// This component's styling is updated to match the new dark theme.
// - All neo-brutalist styles (thick borders, shadows, square corners) are replaced with clean, modern equivalents.
// - Colors are updated to the dark theme palette (zinc, slate, accent).
// - Font is changed to 'font-sans' (Inter).
// - All functionality for MFA setup remains identical.

"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/supabase/client";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";

export default function SupabaseMFASetup() {
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [manualEntryKey, setManualEntryKey] = useState("");
  const [factorId, setFactorId] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [isLoadingState, setIsLoadingState] = useState(true);
  const [showSecret, setShowSecret] = useState(false);
  const [remainingTime, setRemainingTime] = useState(30);
  const router = useRouter();

  useEffect(() => {
    const enrollMfa = async () => {
      setIsLoadingState(true);
      setError("");

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/admin/login");
        return;
      }
      
      const { data, error: enrollError } = await supabase.auth.mfa.enroll({
        factorType: "totp",
      });

      if (enrollError) {
        setError(enrollError.message || "Failed to start MFA enrollment.");
        if (enrollError.message.includes("MFA is already set up")) {
            // Check if there are verified factors
            const { data: factorsData } = await supabase.auth.mfa.listFactors();
            const hasVerifiedFactor = factorsData?.totp.some(f => f.status === 'verified');
            if (hasVerifiedFactor) {
                // If already set up, redirect to challenge
                router.replace("/admin/mfa-challenge");
                return;
            }
        }
        setIsLoadingState(false);
        return;
      }

      if (data) {
        setFactorId(data.id);
        setQrCodeUrl(data.totp.qr_code);
        setManualEntryKey(data.totp.secret);
      }
      setIsLoadingState(false);
    };

    enrollMfa();
  }, [router]);

  useEffect(() => {
    const timer = setInterval(() => {
      setRemainingTime(30 - (new Date().getSeconds() % 30));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleVerify = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoadingState(true);
  setError("");

  // 1️⃣ Create the challenge
  const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });
  if (challengeError || !challengeData) {
    setError(challengeError?.message || "Could not challenge MFA factor.");
    setIsLoadingState(false);
    return;
  }

  // 2️⃣ Use the returned challengeId in verify()
  const challengeId = challengeData.id;

  const { error: verifyError } = await supabase.auth.mfa.verify({
    factorId,
    challengeId,
    code: otp,
  });

  if (verifyError) {
    setError(verifyError.message || "Invalid code. Please try again.");
    setIsLoadingState(false);
    return;
  }

  // 3️⃣ Success → redirect
  router.replace("/admin/dashboard");
};

  const copySecret = async () => {
    try {
      await navigator.clipboard.writeText(manualEntryKey);
      const button = document.getElementById("copySecretButton");
      if (button) {
        const originalText = button.innerText;
        button.innerText = "Copied!";
        setTimeout(() => { button.innerText = originalText; }, 2000);
      }
    } catch (err) {
      setError("Failed to copy secret key.");
    }
  };

  const stepVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  if (isLoadingState && !qrCodeUrl && !error) {
    return (
      <motion.div
        key="mfa-setup-loading"
        initial="initial"
        animate="animate"
        exit="exit"
        variants={stepVariants}
        transition={{ duration: 0.3 }}
        className="flex min-h-screen items-center justify-center bg-zinc-900 font-sans"
      >
        <div className="rounded-lg border border-zinc-700 bg-zinc-800 p-8 text-center">
          <div className="mx-auto mb-4 w-12 h-12 animate-spin rounded-full border-4 border-l-transparent border-accent"></div>
          <p className="font-semibold text-slate-200">Loading MFA Setup...</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      key="mfa-setup-page"
      variants={stepVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3 }}
      className="flex min-h-screen items-center justify-center bg-zinc-900 px-4 py-8 font-sans"
    >
      <div className="w-full max-w-2xl space-y-8 rounded-lg border border-zinc-700 bg-zinc-800 p-6 sm:p-8">
        <div className="text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-lg border border-zinc-600 bg-zinc-700">
            <span className="text-xl">📱</span>
          </div>
          <h2 className="text-3xl font-bold text-slate-100">
            Set Up Two-Factor Authentication
          </h2>
          <p className="mt-2 text-zinc-400">
            Secure your admin account with an authenticator app
          </p>
        </div>

        <AnimatePresence>
          {error && !factorId && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="my-4 rounded-md border border-red-500/50 bg-red-900/20 p-3"
            >
              <p className="text-sm font-semibold text-red-300">{error}</p>
              {error.includes("MFA is already set up") && (
                <button
                  onClick={() => router.push("/admin/mfa-challenge")}
                  className="mt-2 text-sm font-semibold text-accent underline hover:no-underline"
                >
                  Go to MFA Challenge
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {factorId && (
          <div className="space-y-8">
            <div>
              <h3 className="mb-2 text-lg font-bold text-slate-100">
                Step 1: Scan QR Code
              </h3>
              <p className="mb-4 text-zinc-400">
                Open your authenticator app and scan this QR code.
              </p>
              {qrCodeUrl ? (
                <div className="flex justify-center">
                  <div className="rounded-lg border border-zinc-600 bg-white p-2">
                    <img
                      src={qrCodeUrl}
                      alt="QR Code for MFA setup"
                      className="size-48"
                    />
                  </div>
                </div>
              ) : (
                <p className="text-zinc-500">Generating QR Code...</p>
              )}
            </div>

            {manualEntryKey && (
              <div className="border-t border-zinc-700 pt-6">
                <h3 className="mb-2 text-lg font-bold text-slate-100">
                  Step 2: Manual Entry (Optional)
                </h3>
                <p className="mb-3 text-zinc-400">
                  Can&apos;t scan? Enter this secret manually:
                </p>
                <div className="flex flex-col items-stretch gap-2 rounded-md border border-zinc-600 bg-zinc-700 p-3 sm:flex-row sm:items-center sm:gap-4">
                  <code className="flex-1 break-all font-mono text-sm text-slate-300">
                    {showSecret ? manualEntryKey : "••••••••••••••••••••••••••••••••"}
                  </code>
                  <div className="flex gap-x-3">
                    <button
                      type="button"
                      onClick={() => setShowSecret(!showSecret)}
                      className="text-sm font-semibold text-accent underline hover:no-underline"
                    >
                      {showSecret ? "Hide" : "Show"}
                    </button>
                    <button
                      type="button"
                      id="copySecretButton"
                      onClick={copySecret}
                      className="text-sm font-semibold text-accent underline hover:no-underline"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>
            )}

            {factorId && (
              <div className="border-t border-zinc-700 pt-6">
                <form onSubmit={handleVerify} className="space-y-6">
                  <div>
                    <h3 className="mb-2 text-lg font-bold text-slate-100">
                      Step 3: Verify Setup
                    </h3>
                    <label
                      htmlFor="totpCode"
                      className="mb-1 block text-sm font-bold text-slate-200"
                    >
                      Enter the 6-digit code from your app:
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
                    {error && factorId && (
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

                  <div className="flex flex-col space-y-3 sm:flex-row sm:space-x-3 sm:space-y-0">
                    <button
                      type="submit"
                      disabled={isLoadingState || otp.length !== 6 || !factorId}
                      className="flex-1 rounded-md bg-accent px-4 py-3 font-sans font-bold text-accent-foreground transition-opacity hover:opacity-90 active:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isLoadingState ? "Verifying..." : "Verify & Complete Setup"}
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        await supabase.auth.signOut();
                        router.push("/admin/login");
                      }}
                      className="flex-1 rounded-md border border-zinc-600 bg-zinc-700 px-4 py-3 font-sans font-bold text-slate-100 transition-colors hover:bg-zinc-600"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}