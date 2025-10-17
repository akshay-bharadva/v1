"use client";

import type React from "react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
      // Fake API call
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
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="my-16 rounded-lg border border-zinc-700 bg-zinc-900 p-6 md:p-8"
    >
      <h2 className="mb-2 text-2xl font-bold text-slate-100">Join The Newsletter</h2>
      <p className="mb-4 text-zinc-400">
        Project updates, cool links, and maybe some bad jokes. Straight to your
        inbox. No spam, ever.
      </p>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-start"
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
            className={`rounded-md p-3 text-sm font-semibold
              ${status === "success" ? "border border-green-500/30 bg-green-900/20 text-green-300" : ""}
              ${status === "error" ? "border border-red-500/30 bg-red-900/20 text-red-300" : ""}`}
            role={status === "error" ? "alert" : "status"}
          >
            {message}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.section>
  );
}