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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  ShieldCheck,
  Terminal,
  PlusCircle,
  Trash2,
} from "lucide-react";

const buttonPrimaryClass =
  "bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-3 rounded-none font-bold border-2 border-black shadow-[3px_3px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1.5px_1.5px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-150 font-space";
const buttonDangerClass =
  "bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded-none font-bold border-2 border-black shadow-[3px_3px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1.5px_1.5px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-150 font-space";

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
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });
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
      className="space-y-8"
    >
      <div>
        <h2 className="text-2xl font-bold">Security Settings</h2>
        <p className="text-muted-foreground">
          Manage your account security and two-factor authentication.
        </p>
      </div>

      {success && (
        <Alert>
          <Terminal className="size-4" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}
      {error && (
        <Alert variant="destructive">
          <Terminal className="size-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Two-Factor Authentication (MFA)</CardTitle>
              <CardDescription>
                Add an extra layer of security to your account.
              </CardDescription>
            </div>
            <Badge
              variant={mfaEnabled ? "default" : "secondary"}
              className={
                mfaEnabled
                  ? "border-green-500/50 bg-green-500/10 text-green-400"
                  : ""
              }
            >
              <ShieldCheck className="mr-1.5 size-3" />
              {mfaEnabled ? "Enabled" : "Not Enabled"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <Loader2 className="animate-spin text-muted-foreground" />
          ) : (
            <>
              {factors.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold">
                    Registered Authenticators:
                  </h4>
                  {factors.map((factor) => (
                    <div
                      key={factor.id}
                      className="flex items-center justify-between rounded-md border bg-secondary/50 p-3"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {factor.friendly_name ||
                            `Authenticator ID: ...${factor.id.slice(-6)}`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Status: {factor.status}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => handleUnenroll(factor.id)}
                        disabled={isLoading}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <Button
                onClick={() => router.push("/admin/setup-mfa")}
                disabled={isLoading}
              >
                <PlusCircle className="mr-2 size-4" />{" "}
                {factors.length > 0
                  ? "Add Another Authenticator"
                  : "Set Up MFA Now"}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>
            Update your login password. We recommend a long, unique password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            {passwordError && (
              <p className="text-sm font-medium text-destructive">
                {passwordError}
              </p>
            )}
            {passwordSuccess && (
              <p className="text-sm font-medium text-accent">
                {passwordSuccess}
              </p>
            )}
            <Button
              type="submit"
              disabled={isUpdatingPassword || !newPassword || !confirmPassword}
            >
              {isUpdatingPassword && (
                <Loader2 className="mr-2 size-4 animate-spin" />
              )}
              {isUpdatingPassword ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
            <li>Keep your authenticator app secure and backed up.</li>
            <li>Do not share your password or MFA codes.</li>
            <li>Use a strong, unique password for admin access.</li>
            <li>Log out when you finish managing your site.</li>
          </ul>
        </CardContent>
      </Card>
    </motion.div>
  );
}
