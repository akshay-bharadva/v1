// This component's styling is updated to match the dark theme.
// The core functionality remains identical.

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
    checkAuth();  }, [router]);

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
      className="flex min-h-screen items-center justify-center bg-zinc-900 px-4 font-sans"
    >
      <div className="w-full max-w-md space-y-8 rounded-lg border border-zinc-700 bg-zinc-800 p-6 sm:p-8">
        <div className="text-center">
          <div className="mx-auto mb-4 flex w-12 h-12 items-center justify-center rounded-lg border border-zinc-600 bg-zinc-700">
            <span className="text-xl">🔐</span>
          </div>
          <h2 className="text-3xl font-bold text-slate-100">Admin Access</h2>
          <p className="mt-2 text-zinc-400">
            Sign in with your Supabase credentials
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-bold text-slate-200">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="w-full rounded-md border border-zinc-600 bg-zinc-700 px-3 py-2 text-slate-100 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-bold text-slate-200">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full rounded-md border border-zinc-600 bg-zinc-700 px-3 py-2 text-slate-100 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent"
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
                className="rounded-md border border-red-500/50 bg-red-900/20 p-3"
              >
                <p className="text-sm font-semibold text-red-300">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-md bg-accent px-4 py-3 font-bold text-accent-foreground transition-opacity hover:opacity-90 active:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="-ml-1 mr-3 size-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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