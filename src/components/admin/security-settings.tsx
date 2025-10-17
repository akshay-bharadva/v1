// This component's styling is updated to match the dark admin theme.
// - All hard-coded style classes and neo-brutalist styles are replaced.
// - Backgrounds, borders, text colors, and form elements are updated.
// - The font is changed to 'font-sans' (Inter).
// - All functionality for managing security settings remains identical.

"use client";
import type React from "react";
import { useState, useEffect, FormEvent } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/supabase/client";
import type { Factor } from "@supabase/supabase-js";
import { useRouter } from "next/router";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function SecuritySettings() {
  const [factors, setFactors] = useState<Factor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const router = useRouter();
  
  const loadFactors = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    const { data, error: factorsError } = await supabase.auth.mfa.listFactors();
    if (factorsError) {
      setError("Failed to load MFA factors: " + factorsError.message);
      setFactors([]);
    } else {
      setFactors(data?.totp || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadFactors();
  }, []);

  const handleUnenroll = async (factorId: string) => {
    if (
      !confirm(
        "Are you sure you want to remove this MFA method? You might be logged out or lose access if it's your only method.",
      )
    ) {
      return;
    }
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    const { error: unenrollError } = await supabase.auth.mfa.unenroll({
      factorId,
    });

    if (unenrollError) {
      setError("Failed to unenroll MFA: " + unenrollError.message);
      setIsLoading(false);
    } else {
      setSuccess("MFA method removed successfully.");
      await loadFactors();
      const { data: aalData } =
        await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aalData?.currentLevel !== "aal2") {
        router.push("/admin/login");
      } else {
        setIsLoading(false);
      }
    }
  };

  const mfaEnabled = factors.some((f) => f.status === "verified");

   const handlePasswordChange = async (e: FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }
    
    setIsUpdatingPassword(true);
    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
    setIsUpdatingPassword(false);

    if (updateError) {
      setPasswordError("Failed to update password: " + updateError.message);
    } else {
      setPasswordSuccess("Password updated successfully!");
      setNewPassword("");
      setConfirmPassword("");
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-4xl font-sans"
    >
      <div className="rounded-lg border border-zinc-700 bg-zinc-800">
        <div className="border-b border-zinc-700 bg-zinc-900/50 px-6 py-4">
          <h2 className="text-xl font-bold text-slate-100">Security Settings</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Manage your account security and two-factor authentication
          </p>
        </div>

        <div className="space-y-8 p-4 sm:p-6">
          {success && (
            <div className="rounded-md border border-green-500/30 bg-green-900/20 p-4">
              <p className="text-sm font-semibold text-green-300">{success}</p>
            </div>
          )}
          {error && (
            <div className="rounded-md border border-red-500/30 bg-red-900/20 p-4">
              <p className="text-sm font-semibold text-red-300">{error}</p>
            </div>
          )}

          <div className="rounded-lg border border-zinc-700 bg-zinc-900/50 p-4 sm:p-6">
            <div className="mb-4 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-100">
                  Two-Factor Authentication (TOTP)
                </h3>
                <p className="text-sm text-zinc-400">
                  {mfaEnabled ? "MFA is currently active on your account." : "Add an extra layer of security."}
                </p>
              </div>
              <span className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-bold ${ mfaEnabled ? "bg-green-500/10 text-green-300" : "bg-yellow-500/10 text-yellow-300"}`}>
                {mfaEnabled ? "AAL2 Active" : "Not Fully Active"}
              </span>
            </div>
            
            {!isLoading && factors.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-md font-semibold text-slate-200">Registered Authenticators:</h4>
                {factors.map((factor) => (
                  <div key={factor.id} className="flex flex-col items-start gap-2 rounded-md border border-zinc-700 bg-zinc-800 p-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold">{factor.friendly_name || `Authenticator (...${factor.id.slice(-6)})`}</p>
                      <p className="text-xs text-zinc-400">Status: {factor.status}</p>
                    </div>
                    <Button onClick={() => handleUnenroll(factor.id)} variant="destructive" size="sm" disabled={isLoading}>{isLoading ? "Removing..." : "Remove"}</Button>
                  </div>
                ))}
              </div>
            )}
            
            <Button onClick={() => router.push("/admin/setup-mfa")} className="mt-4" disabled={isLoading}>
              {factors.length > 0 ? "Add Another Authenticator" : "Set Up MFA Now"}
            </Button>
          </div>

          <div className="rounded-lg border border-zinc-700 bg-zinc-900/50 p-4 sm:p-6">
            <h3 className="mb-4 text-lg font-bold text-slate-100">Change Password</h3>
            <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
              <div>
                <Label htmlFor="new-password">New Password</Label>
                <Input id="new-password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={6} />
              </div>
              <div>
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input id="confirm-password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required minLength={6} />
              </div>
              {passwordError && <p className="text-sm font-semibold text-red-400">{passwordError}</p>}
              {passwordSuccess && <p className="text-sm font-semibold text-green-400">{passwordSuccess}</p>}
              <Button type="submit" disabled={isUpdatingPassword || !newPassword || !confirmPassword}>
                {isUpdatingPassword ? "Updating..." : "Update Password"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </motion.div>
  );
}