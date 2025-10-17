/*
This file is updated to align with the new kinetic typography design system.
- Removed all neo-brutalist styles (hard shadows, thick borders, `rounded-none`).
- The entire component now uses a clean, centered layout on a dark background.
- Switched to the new 'Inter' font via the `font-sans` class (inherited).
- Replaced custom inputs and buttons with the redesigned `Input` and `Button` components from the UI kit for a consistent look and feel.
- The color palette is updated to use the new theme variables. The icon and overall aesthetic are now minimalist and modern.
*/
"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/supabase/client";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Lock } from "lucide-react";

export default function SupabaseLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
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

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

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

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  return (
    <motion.div
      key="login-page"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={{ duration: 0.3 }}
      className="flex min-h-screen items-center justify-center bg-background px-4"
    >
      <div className="w-full max-w-sm space-y-8 rounded-lg border border-border bg-card p-8">
        <div className="text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-secondary">
            <Lock className="size-6 text-foreground" />
          </div>
          <h2 className="text-3xl font-black text-foreground">Admin Access</h2>
          <p className="mt-2 text-muted-foreground">
            Sign in to manage your portfolio.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
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
                className="rounded-md border border-destructive/50 bg-destructive/10 p-3"
              >
                <p className="text-sm font-medium text-destructive">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Signing In...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>
      </div>
    </motion.div>
  );
}