"use client";

import type React from "react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || status === "loading") return;

    setStatus("loading");
    setMessage("");

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setStatus("success");
      setMessage("Thanks for subscribing! Please check your inbox to confirm.");
      setEmail("");
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message || "An error occurred. Please try again later.");
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      className="my-16"
    >
      <div className="mx-auto max-w-2xl rounded-lg border bg-card p-8 text-center">
        <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Join the Newsletter
        </h2>
        <p className="mt-3 text-muted-foreground">
          Project updates, cool links, and maybe some bad jokes. Straight to
          your inbox. No spam, ever.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-6 flex flex-col items-stretch gap-2 sm:flex-row sm:items-start"
        >
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your.email@example.com"
            className="h-11 flex-1 text-base"
            required
            disabled={status === "loading"}
            aria-label="Email for newsletter"
          />
          <Button
            type="submit"
            disabled={status === "loading" || !email.trim()}
            className="h-11 px-6 text-base"
          >
            {status === "loading" && (
              <Loader2 className="mr-2 size-4 animate-spin" />
            )}
            {status === "loading" ? "Subscribing..." : "Subscribe"}
          </Button>
        </form>

        <AnimatePresence>
          {message && (
            <motion.p
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: "auto", marginTop: "1rem" }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{ duration: 0.3 }}
              className={`rounded-md p-3 text-sm font-medium
                ${status === "success" ? "border border-green-500/30 bg-green-500/10 text-green-400" : ""}
                ${status === "error" ? "border border-destructive/50 bg-destructive/10 text-destructive" : ""}`}
              role={status === "error" ? "alert" : "status"}
            >
              {message}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  );
}
