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
    const protectPageAndEnroll = async () => {
      setIsLoadingState(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/admin/login");
        return;
      }

      const { data, error: enrollError } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        issuer: "MyPortfolioAdmin",
      });

      if (enrollError) {
        let errorMessage = enrollError.message || "Failed to start MFA enrollment.";
        if (enrollError.message.includes("Enrolled factors exceed")) {
          errorMessage = "MFA is already set up or max factors reached. Try the MFA Challenge page or manage factors in your Security settings.";
        }
        setError(errorMessage);
        setIsLoadingState(false);
        return;
      }

      if (data) {
        setQrCodeUrl(data.totp.qr_code);
        setManualEntryKey(data.totp.secret);
        setFactorId(data.id);
      }
      setIsLoadingState(false);
    };

    protectPageAndEnroll();
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

    const { data: challengeData, error: challengeError } =
      await supabase.auth.mfa.challenge({ factorId });

    if (challengeError) {
      setIsLoadingState(false);
      setError(challengeError.message || "Failed to create MFA challenge.");
      return;
    }

    const challengeId = challengeData.id;
    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId,
      challengeId,
      code: otp,
    });

    setIsLoadingState(false);
    if (verifyError) {
      setError(verifyError.message || "Invalid OTP. Please try again.");
      return;
    }

    await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    router.replace("/admin/dashboard");
  };

  const copySecret = async () => {
    try {
      await navigator.clipboard.writeText(manualEntryKey);
      const copyButton = document.getElementById("copySecretButton");
      if (copyButton) {
        const originalText = copyButton.innerText;
        copyButton.innerText = "Copied!";
        setTimeout(() => {
          if (copyButton) copyButton.innerText = originalText;
        }, 2000);
      }
    } catch (err) {
      console.error("Failed to copy secret:", err);
      setError("Failed to copy. Please copy manually.");
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
        className="flex min-h-screen items-center justify-center bg-indigo-100 font-space"
      >
        <div className="border-2 border-black bg-white p-8 text-center">
          <div className="mx-auto mb-4 size-12 animate-spin rounded-none border-y-4 border-indigo-600"></div>
          <p className="font-semibold text-gray-700">Loading MFA Setup...</p>
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
      className="flex min-h-screen items-center justify-center bg-indigo-100 px-4 py-8 font-space"
    >
      <div className="w-full max-w-2xl space-y-8 border-2 border-black bg-white p-6 shadow-[8px_8px_0px_#000000] sm:p-8">
        <div className="text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-none border-2 border-black bg-green-500">
            <span className="text-xl text-white">📱</span>
          </div>
          <h2 className="text-3xl font-bold text-black">
            Set Up Two-Factor Authentication
          </h2>
          <p className="mt-2 text-gray-700">
            Secure your admin account with an authenticator app
          </p>
        </div>

        <AnimatePresence>
          {error && !factorId && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="my-4 rounded-none border-2 border-red-500 bg-red-100 p-3"
            >
              <p className="text-sm font-semibold text-red-700">{error}</p>
              {error.includes("MFA is already set up") && (
                <button
                  onClick={() => router.push("/admin/mfa-challenge")}
                  className="mt-2 font-space text-sm font-semibold text-indigo-700 underline hover:text-indigo-900"
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
              <h3 className="mb-2 text-lg font-bold text-black">
                Step 1: Scan QR Code
              </h3>
              <p className="mb-4 text-gray-700">
                Open your authenticator app (e.g., Google Authenticator) and
                scan this QR code.
              </p>
              {qrCodeUrl ? (
                <div className="flex justify-center">
                  <div className="rounded-none border-2 border-black bg-white p-2">
                    <img
                      src={qrCodeUrl}
                      alt="QR Code for MFA setup"
                      className="size-48"
                    />
                  </div>
                </div>
              ) : (
                <p className="text-gray-600">Generating QR Code...</p>
              )}
            </div>

            {manualEntryKey && (
              <div className="border-t-2 border-black pt-6">
                <h3 className="mb-2 text-lg font-bold text-black">
                  Step 2: Manual Entry (Optional)
                </h3>
                <p className="mb-3 text-gray-700">
                  Can&apos;t scan? Enter this secret manually:
                </p>
                <div className="flex flex-col items-stretch gap-2 rounded-none border-2 border-black bg-gray-100 p-3 sm:flex-row sm:items-center sm:gap-4">
                  <code className="flex-1 break-all font-mono text-sm text-gray-800">
                    {showSecret
                      ? manualEntryKey
                      : "••••••••••••••••••••••••••••••••"}
                  </code>
                  <div className="flex gap-x-3">
                    <button
                      type="button"
                      onClick={() => setShowSecret(!showSecret)}
                      className="font-space text-sm font-semibold text-indigo-600 underline hover:text-indigo-800"
                    >
                      {showSecret ? "Hide" : "Show"}
                    </button>
                    <button
                      type="button"
                      id="copySecretButton"
                      onClick={copySecret}
                      className="font-space text-sm font-semibold text-indigo-600 underline hover:text-indigo-800"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>
            )}

            {factorId && (
              <div className="border-t-2 border-black pt-6">
                <form onSubmit={handleVerify} className="space-y-6">
                  <div>
                    <h3 className="mb-2 text-lg font-bold text-black">
                      Step 3: Verify Setup
                    </h3>
                    <label
                      htmlFor="totpCode"
                      className="mb-1 block text-sm font-bold text-black"
                    >
                      Enter the 6-digit code from your authenticator app:
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
                        onChange={(e) =>
                          setOtp(e.target.value.replace(/\D/g, ""))
                        }
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
                    {error && factorId && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="rounded-none border-2 border-red-500 bg-red-100 p-3"
                      >
                        <p className="text-sm font-semibold text-red-700">
                          {error}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex flex-col space-y-3 sm:flex-row sm:space-x-3 sm:space-y-0">
                    <button
                      type="submit"
                      disabled={isLoadingState || otp.length !== 6 || !factorId}
                      className="flex-1 rounded-none border-2 border-black bg-indigo-600 px-4 py-3 font-space font-bold text-white shadow-[4px_4px_0px_#000] transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:bg-indigo-700 hover:shadow-[2px_2px_0px_#000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none disabled:translate-x-0 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70 disabled:shadow-none"
                    >
                      {isLoadingState
                        ? "Verifying..."
                        : "Verify & Complete Setup"}
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        await supabase.auth.signOut();
                        router.push("/admin/login");
                      }}
                      className="flex-1 rounded-none border-2 border-black bg-gray-200 px-4 py-3 font-space font-bold text-black shadow-[4px_4px_0px_#000] transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:bg-gray-300 hover:shadow-[2px_2px_0px_#000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
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