"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

export default function CompanyLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    startTransition(() => {
      (async () => {
        try {
          const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
          });
          const data = await response.json();
          if (!response.ok) {
            throw new Error(data.error ?? "Login failed.");
          }
          if (data.user?.role !== "company") {
            throw new Error("This account is not a company profile.");
          }
          setSuccess("Authenticated. Redirecting to company hub...");
          router.push("/company");
        } catch (err) {
          console.error("Company login error", err);
          setError(err instanceof Error ? err.message : "Unexpected error");
        }
      })();
    });
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-16">
      <div className="absolute inset-0 bg-magic-gradient" />
      <motion.div
        className="absolute inset-0 opacity-30 bg-grid"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />
      <motion.div
        className="relative z-10 w-full max-w-lg rounded-3xl border border-white/10 bg-white/5 p-10 shadow-glow backdrop-blur-xl"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="flex flex-col gap-3">
          <p className="text-xs uppercase tracking-[0.4em] text-white/60">Company access</p>
          <h1 className="text-3xl font-semibold text-white">Log in to manage roles</h1>
          <p className="text-sm text-white/60">Publish openings and review applicants in your dedicated space.</p>
        </div>
        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-6">
          <label className="flex flex-col gap-2 text-sm text-white/70">
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="company@domain.com"
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-primary-400 focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-white/70">
            Password
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-primary-400 focus:outline-none"
            />
          </label>
          {error && (
            <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>
          )}
          {success && (
            <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{success}</div>
          )}
          <motion.button
            type="submit"
            disabled={isPending}
            whileHover={{ scale: isPending ? 1 : 1.02 }}
            whileTap={{ scale: isPending ? 1 : 0.98 }}
            className="rounded-full bg-gradient-to-r from-primary-500 via-purple-500 to-primary-400 px-8 py-3 text-sm font-semibold text-white shadow-glow disabled:opacity-60"
          >
            {isPending ? "Authenticating..." : "Log In"}
          </motion.button>
          <p className="text-xs text-white/60">
            Need a standard account? <Link href="/login" className="text-primary-300 hover:text-primary-200">User login →</Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
}
