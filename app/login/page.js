"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { motion } from "framer-motion";

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.8, ease: "easeOut" }
  }
};

const orbVariants = {
  animate: {
    y: [0, -20, 0],
    rotate: [0, 8, -8, 0],
    transition: {
      duration: 12,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(event) {
    event.preventDefault();
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
            setError(data.error ?? "Unable to login. Please try again.");
            return;
          }

          setSuccess("Welcome back! Redirecting you to magical opportunities...");
          router.push("/dashboard");
        } catch (err) {
          console.error("Login failed", err);
          setError("Unexpected error. Please try again later.");
        }
      })();
    });
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-16">
      <div className="absolute inset-0 bg-magic-gradient" />
      <motion.div
        className="absolute inset-0 opacity-40 bg-grid"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.25 }}
        transition={{ duration: 1.4, ease: "easeOut" }}
      />
      <motion.span
        className="pointer-events-none absolute -left-16 top-10 h-72 w-72 rounded-full bg-primary-500/40 blur-3xl"
        variants={orbVariants}
        animate="animate"
      />
      <motion.span
        className="pointer-events-none absolute -right-12 bottom-24 h-72 w-72 rounded-full bg-purple-500/35 blur-3xl"
        variants={orbVariants}
        animate="animate"
        transition={{ delay: 2 }}
      />

      <motion.div
        className="relative z-10 glass-panel gradient-border w-full max-w-3xl overflow-hidden rounded-3xl border border-white/10 bg-white/5 px-8 py-12 shadow-glow backdrop-blur-xl"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="flex flex-col justify-center gap-6">
            <motion.span
              className="text-xs uppercase tracking-[0.4em] text-white/60"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6, ease: "easeOut" }}
            >
              Welcome Back, Dreamer
            </motion.span>
            <motion.h1
              className="text-3xl font-semibold text-slate-100 sm:text-4xl"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.7, ease: "easeOut" }}
            >
              Log in to continue the journey into luminous careers.
            </motion.h1>
            <motion.p
              className="text-base text-white/70"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.7, ease: "easeOut" }}
            >
              Access curated opportunities, track applications, and stay aligned with teams that
              resonate with your ambitions.
            </motion.p>
            <div className="flex flex-wrap gap-4 text-sm text-white/60">
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
                Tailored Matches
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
                Intelligent Search
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
                Seamless Applications
              </span>
            </div>
          </div>

          <motion.form
            className="flex flex-col gap-6 rounded-3xl border border-white/10 bg-black/30 p-8 shadow-inner"
            layout
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
          >
            <div>
              <label className="text-sm text-white/70">Email</label>
              <div className="mt-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 focus-within:border-primary-400">
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@lumina.com"
                  required
                  className="w-full bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-white/70">Password</label>
              <div className="mt-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 focus-within:border-primary-400">
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
                />
              </div>
            </div>

            {error && (
              <p className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </p>
            )}

            {success && (
              <p className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                {success}
              </p>
            )}

            <motion.button
              type="submit"
              disabled={isPending}
              className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-primary-500 via-purple-500 to-primary-400 px-8 py-3 text-sm font-semibold text-white shadow-glow transition hover:shadow-glow/40 disabled:cursor-not-allowed disabled:opacity-60"
              whileHover={{ scale: isPending ? 1 : 1.02 }}
              whileTap={{ scale: isPending ? 1 : 0.98 }}
            >
              <span className="relative z-10">
                {isPending ? "Signing you in..." : "Log In"}
              </span>
              <motion.span
                className="absolute inset-0 bg-gradient-to-r from-white/30 via-transparent to-white/0"
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.button>

            <div className="text-sm text-white/60">
              No account yet?{" "}
              <Link className="text-primary-300 hover:text-primary-200" href="/signup">
                Create one now
              </Link>
            </div>
          </motion.form>
        </div>
      </motion.div>
    </div>
  );
}
