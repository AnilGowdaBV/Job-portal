"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const shimmerVariants = {
  animate: {
    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
    transition: {
      duration: 12,
      repeat: Infinity,
      ease: "linear"
    }
  }
};

const floatVariants = {
  initial: { y: 0 },
  animate: {
    y: [0, -20, 0],
    rotate: [0, 3, -3, 0],
    transition: {
      duration: 8,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

const fadeSlideUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 }
};

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-magic-gradient" />
      <motion.div
        className="absolute inset-0 opacity-60 bg-grid"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.35 }}
        transition={{ duration: 1.8, ease: "easeOut" }}
      />
      <div className="absolute inset-0 pointer-events-none">
        <motion.span
          className="absolute h-72 w-72 rounded-full bg-primary-500/40 blur-3xl"
          initial={{ opacity: 0, x: -120, y: 120 }}
          animate={{ opacity: 0.7, x: 0, y: 0 }}
          transition={{ duration: 1.6, ease: "easeOut" }}
        />
        <motion.span
          className="absolute right-10 top-32 h-72 w-72 rounded-full bg-purple-500/30 blur-3xl"
          initial={{ opacity: 0, x: 120, y: -120 }}
          animate={{ opacity: 0.6, x: 0, y: 0 }}
          transition={{ duration: 1.6, ease: "easeOut", delay: 0.2 }}
        />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="px-6 py-8 lg:px-16">
          <motion.nav
            className="flex items-center justify-between rounded-full border border-white/10 bg-white/5 px-6 py-3 backdrop-blur-2xl"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          >
            <motion.div
              className="flex items-center gap-3"
              variants={fadeSlideUp}
              initial="initial"
              animate="animate"
              transition={{ duration: 0.9, ease: "easeOut" }}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 shadow-glow">
                <motion.span
                  className="h-2 w-2 rounded-full bg-primary-400"
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>
              <div className="flex flex-col">
                <span className="text-sm uppercase tracking-[0.3em] text-white/60">
                  Lumina
                </span>
                <span className="text-xl font-semibold text-white">Careers</span>
              </div>
            </motion.div>

            <div className="hidden items-center gap-8 text-sm text-white/70 md:flex">
              <span className="hover:text-white transition">Stories</span>
              <span className="hover:text-white transition">Companies</span>
              <span className="hover:text-white transition">Insights</span>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <Link
                href="/login"
                className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-white/80 transition hover:bg-white/10"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-gradient-to-r from-primary-500 via-purple-500 to-primary-400 px-5 py-2 font-semibold text-white shadow-glow transition hover:shadow-glow/50"
              >
                Join Now
              </Link>
            </div>
          </motion.nav>
        </header>

        <main className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center px-6 pb-24 pt-6 text-center lg:px-16 lg:text-left">
          <div className="grid w-full items-center gap-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)]">
            <div className="flex flex-col items-center gap-10 lg:items-start">
              <motion.span
                className="rounded-full border border-white/10 bg-white/10 px-4 py-1 text-xs uppercase tracking-[0.4em] text-white/70"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
              >
                Whispers of Opportunity
              </motion.span>

              <motion.h1
                className="text-balance text-4xl font-semibold leading-tight text-slate-100 text-glow sm:text-5xl lg:text-6xl"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.1, ease: "easeOut", delay: 0.2 }}
              >
                Discover the careers that feel like destiny.
              </motion.h1>

              <motion.p
                className="max-w-xl text-lg text-white/70"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.1, ease: "easeOut", delay: 0.35 }}
              >
                Lumina Careers is your luminous bridge between ambitious talent and visionary
                companies. Navigate a universe of curated roles, guided by intelligent search,
                handcrafted stories, and a touch of magic in every interaction.
              </motion.p>

              <motion.div
                className="flex flex-col items-center gap-4 sm:flex-row"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.1, ease: "easeOut", delay: 0.45 }}
              >
                <Link
                  href="/login"
                  className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-primary-500 via-purple-500 to-primary-400 px-8 py-3 text-base font-semibold text-white shadow-glow transition hover:shadow-glow/40"
                >
                  <span className="relative z-10">Let&apos;s Get Started</span>
                  <motion.span
                    className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/0"
                    variants={shimmerVariants}
                    animate="animate"
                  />
                </Link>
                <a
                  href="#experience"
                  className="rounded-full border border-white/10 bg-white/5 px-8 py-3 text-base font-semibold text-white/80 transition hover:bg-white/10"
                >
                  Explore Experience
                </a>
              </motion.div>

              <motion.div
                className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-4 text-left glass-panel/0"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.1, ease: "easeOut", delay: 0.55 }}
              >
                <span className="text-sm uppercase tracking-[0.4em] text-white/50">Trusted by</span>
                <div className="grid grid-cols-2 gap-4 text-sm text-white/70 sm:grid-cols-4">
                  {[
                    "Aurora Labs",
                    "Nebula Corp",
                    "StellarPulse",
                    "Orbit Works"
                  ].map((brand) => (
                    <span key={brand} className="rounded-full border border-white/5 bg-white/5 px-4 py-2 text-center">
                      {brand}
                    </span>
                  ))}
                </div>
              </motion.div>
            </div>

            <div className="relative flex items-center justify-center">
              <motion.div
                className="glass-panel gradient-border relative flex w-full max-w-md flex-col gap-6 rounded-3xl p-8 shadow-glow"
                variants={fadeSlideUp}
                initial="initial"
                animate="animate"
                transition={{ duration: 1.1, ease: "easeOut", delay: 0.3 }}
              >
                <motion.div
                  className="flex items-center justify-between"
                  variants={fadeSlideUp}
                  initial="initial"
                  animate="animate"
                  transition={{ duration: 1.1, ease: "easeOut", delay: 0.4 }}
                >
                  <span className="text-xs uppercase tracking-[0.4em] text-white/60">Live Roles</span>
                  <span className="text-white/80">Updated in real-time</span>
                </motion.div>
                <motion.div className="flex flex-col gap-4">
                  {[
                    {
                      title: "Senior Product Magician",
                      location: "Remote · Global",
                      salary: "$140k - $180k",
                      color: "from-primary-500/40 to-purple-500/40"
                    },
                    {
                      title: "AI Journey Architect",
                      location: "Berlin, Germany",
                      salary: "$120k - $160k",
                      color: "from-purple-500/40 to-blue-500/40"
                    },
                    {
                      title: "Quantum Design Alchemist",
                      location: "San Francisco, USA",
                      salary: "$150k - $210k",
                      color: "from-blue-500/40 to-emerald-500/40"
                    }
                  ].map((job, index) => (
                    <motion.div
                      key={job.title}
                      className={`relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5`}
                      variants={fadeSlideUp}
                      initial="initial"
                      animate="animate"
                      transition={{ duration: 1, ease: "easeOut", delay: 0.5 + index * 0.08 }}
                    >
                      <motion.span
                        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${job.color}`}
                        variants={floatVariants}
                        initial="initial"
                        animate="animate"
                      />
                      <div className="relative z-10 flex flex-col gap-2 text-left">
                        <span className="text-base font-semibold text-white">
                          {job.title}
                        </span>
                        <span className="text-sm text-white/70">{job.location}</span>
                        <span className="text-sm font-medium text-primary-200">{job.salary}</span>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
                <motion.div
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                  variants={fadeSlideUp}
                  initial="initial"
                  animate="animate"
                  transition={{ duration: 1, ease: "easeOut", delay: 0.7 }}
                >
                  <span className="text-sm text-white/70">Stories crafted for every journey</span>
                  <motion.span
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  >
                    ✨
                  </motion.span>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </main>

        <footer className="px-6 pb-8 pt-12 text-center text-xs text-white/50 lg:px-16">
          Crafted with care • Powered by Next.js, Tailwind CSS &amp; Framer Motion
        </footer>
      </div>
    </div>
  );
}
