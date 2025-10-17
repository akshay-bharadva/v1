"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/supabase/client";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";

export default function SupabaseLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        const { data: aalData } =
          await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
        if (aalData?.currentLevel === "aal2") {
          router.replace("/admin/dashboard");
        }
      }
    };
    checkAuth();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const { data, error: signInError } = await supabase.auth.signInWithPassword(
      { email, password },
    );

    if (signInError) {
      setIsLoading(false);
      setError(signInError.message || "Invalid login credentials.");
      return;
    }

    if (data.session) {
      const { data: aalData, error: aalError } =
        await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

      if (aalError) {
        setIsLoading(false);
        setError(aalError.message || "Could not verify MFA status.");
        return;
      }

      if (aalData.currentLevel === "aal2") {
        router.replace("/admin/dashboard");
      } else if (
        aalData.currentLevel === "aal1" &&
        aalData.nextLevel === "aal2"
      ) {
        router.replace("/admin/mfa-challenge");
      } else {
        const { data: factorsData, error: factorsError } =
          await supabase.auth.mfa.listFactors();
        if (factorsError) {
          setIsLoading(false);
          setError(factorsError.message || "Could not list MFA factors.");
          return;
        }
        const totpFactor = factorsData?.totp?.find(
          (factor) => factor.status === "verified",
        );
        if (totpFactor) {
          router.replace("/admin/mfa-challenge");
        } else {
          router.replace("/admin/setup-mfa");
        }
      }
    } else {
      setIsLoading(false);
      setError("Login failed. Please try again.");
    }
  };

  const stepVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  return (
    <motion.div
      key="login-page"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={stepVariants}
      transition={{ duration: 0.3 }}
      className="flex min-h-screen items-center justify-center bg-muted px-4 font-space"
    >
      <div className="w-full max-w-md space-y-8 border-2 border-black bg-card p-6 shadow-[8px_8px_0px_#000000] sm:p-8">
        <div className="text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-none border-2 border-black bg-indigo-500">
            <span className="text-xl text-white">🔐</span>
          </div>
          <h2 className="text-3xl font-bold text-black">Admin Access</h2>
          <p className="mt-2 text-gray-700">
            Sign in with your Supabase credentials
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-bold text-black"
            >
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="w-full rounded-none border-2 border-black px-3 py-2 font-space focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-bold text-black"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full rounded-none border-2 border-black px-3 py-2 font-space focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
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
            disabled={isLoading}
            className="w-full rounded-none border-2 border-black bg-indigo-600 px-4 py-3 font-space font-bold text-white shadow-[4px_4px_0px_#000] transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:bg-indigo-700 hover:shadow-[2px_2px_0px_#000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none disabled:translate-x-0 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70 disabled:shadow-none"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="-ml-1 mr-3 size-5 animate-spin text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Signing In...
              </span>
            ) : (
              "Sign In"
            )}
          </button>
        </form>
      </div>
    </motion.div>
  );
}