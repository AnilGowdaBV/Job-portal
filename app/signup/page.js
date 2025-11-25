"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
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

const RoleCopy = {
  user: {
    title: "Job Seeker",
    blurb: "Curated opportunities, seamless applications, and a dashboard tailored to your ascent."
  },
  company: {
    title: "Company",
    blurb: "Showcase roles with storytelling, manage applicants elegantly, and hire with intention."
  }
};

const orbs = [
  { className: "left-10 top-12 h-64 w-64 bg-primary-500/30" },
  { className: "right-12 top-24 h-72 w-72 bg-purple-500/35" },
  { className: "left-1/2 bottom-6 h-56 w-56 -translate-x-1/2 bg-blue-500/25" }
];

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isPending, startTransition] = useTransition();

  const roleInfo = useMemo(() => RoleCopy[role], [role]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    startTransition(() => {
      (async () => {
        try {
          const response = await fetch("/api/auth/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password, role })
          });

          const data = await response.json();

          if (!response.ok) {
            setError(data.error ?? "Unable to create account.");
            return;
          }

          setSuccess("Account created! Crafting your portal...");
          router.push("/dashboard");
        } catch (err) {
          console.error("Signup failed", err);
          setError("Unexpected error. Please try again later.");
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
        animate={{ opacity: 0.2 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />
      {orbs.map((orb, index) => (
        <motion.span
          key={index}
          className={`pointer-events-none absolute rounded-full blur-3xl ${orb.className}`}
          animate={{
            y: [0, -18, 0],
            rotate: [0, 6, -6, 0]
          }}
          transition={{ duration: 16 + index * 2, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      <motion.div
        className="relative z-10 glass-panel gradient-border w-full max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-white/5 px-8 py-12 shadow-glow backdrop-blur-xl"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="flex flex-col gap-6">
            <motion.span
              className="text-xs uppercase tracking-[0.4em] text-white/60"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6, ease: "easeOut" }}
            >
              Choose Your Path
            </motion.span>
            <motion.h1
              className="text-3xl font-semibold text-slate-100 sm:text-4xl"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.7, ease: "easeOut" }}
            >
              Join Lumina Careers and illuminate the next chapter of your professional odyssey.
            </motion.h1>
            <motion.p
              key={role}
              className="text-base text-white/70"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              {roleInfo.blurb}
            </motion.p>
            <div className="flex flex-wrap gap-4 text-sm text-white/60">
              <button
                type="button"
                onClick={() => setRole("user")}
                className={`rounded-full border px-4 py-2 transition ${
                  role === "user"
                    ? "border-primary-400 bg-primary-500/20 text-primary-100"
                    : "border-white/10 bg-white/5 hover:border-white/20"
                }`}
              >
                Job Seeker
              </button>
              <button
                type="button"
                onClick={() => setRole("company")}
                className={`rounded-full border px-4 py-2 transition ${
                  role === "company"
                    ? "border-primary-400 bg-primary-500/20 text-primary-100"
                    : "border-white/10 bg-white/5 hover:border-white/20"
                }`}
              >
                Company
              </button>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-white/70">
              <p className="font-semibold text-white">What you unlock:</p>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                <li className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
                  Intelligent job matching
                </li>
                <li className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
                  Magical UI for managing roles
                </li>
                <li className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
                  Secure resume storage
                </li>
                <li className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
                  Insightful analytics & stories
                </li>
              </ul>
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
              <label className="text-sm text-white/70">Full Name</label>
              <div className="mt-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 focus-within:border-primary-400">
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Astra Nova"
                  required
                  className="w-full bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
                />
              </div>
            </div>

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
                  placeholder="Minimum 8 characters"
                  required
                  className="w-full bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-white/70">Selected Role</label>
              <div className="mt-2 rounded-2xl border border-primary-400/70 bg-primary-500/15 px-4 py-3 text-sm text-primary-100">
                {roleInfo.title}
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
                {isPending ? "Crafting your profile..." : "Create Account"}
              </span>
              <motion.span
                className="absolute inset-0 bg-gradient-to-r from-white/30 via-transparent to-white/0"
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.button>

            <div className="text-sm text-white/60">
              Already have an account?{" "}
              <Link className="text-primary-300 hover:text-primary-200" href="/login">
                Log in here
              </Link>
            </div>
          </motion.form>
        </div>
      </motion.div>
    </div>
  );
}
