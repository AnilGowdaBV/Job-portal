"use client";

import { useEffect, useState, useTransition } from "react";
import { motion } from "framer-motion";
import LogoutButton from "@/components/LogoutButton";

const metricCard = {
  hidden: { opacity: 0, y: 30 },
  visible: (index) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut", delay: 0.1 * index }
  })
};

export default function AdminPage() {
  const [overview, setOverview] = useState(null);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(() => {
      (async () => {
        try {
          const response = await fetch("/api/admin/overview");
          const data = await response.json();
          if (!response.ok) {
            throw new Error(data.error ?? "Unable to load admin data");
          }
          setOverview(data);
        } catch (err) {
          console.error("Admin overview error", err);
          setError(err instanceof Error ? err.message : "Unexpected error");
        }
      })();
    });
  }, []);

  const metrics = overview?.metrics ?? { totalUsers: 0, totalCompanies: 0, totalJobs: 0 };

  return (
    <div className="relative min-h-screen overflow-hidden px-6 py-16 lg:px-16">
      <LogoutButton className="absolute right-6 top-6 z-30" />
      <div className="absolute inset-0 bg-magic-gradient" />
      <div className="absolute inset-0 opacity-25 bg-grid" />

      <div className="relative z-10 mx-auto max-w-5xl">
        <motion.div
          className="glass-panel gradient-border rounded-3xl border border-white/10 bg-white/5 p-10 shadow-glow"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="flex flex-col gap-3">
            <p className="text-xs uppercase tracking-[0.4em] text-white/60">Admin constellation</p>
            <h1 className="text-3xl font-semibold text-white">Monitor the Lumina ecosystem</h1>
            <p className="text-sm text-white/60">
              Observe growth metrics, keep roles authentic, and celebrate top contributors.
            </p>
          </div>
        </motion.div>

        {error && (
          <div className="mt-6 rounded-3xl border border-red-500/40 bg-red-500/10 p-6 text-sm text-red-200">
            {error}
          </div>
        )}

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {Object.entries(metrics).map(([key, value], index) => (
            <motion.div
              key={key}
              className="rounded-3xl border border-white/10 bg-white/5 p-6 text-center"
              variants={metricCard}
              initial="hidden"
              animate="visible"
              custom={index}
            >
              <p className="text-xs uppercase tracking-[0.3em] text-white/60">{key.replace(/([A-Z])/g, " $1").trim()}</p>
              <p className="mt-3 text-4xl font-semibold text-white">{value}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <motion.div
            className="rounded-3xl border border-white/10 bg-white/5 p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
          >
            <h2 className="text-xl font-semibold text-white">Recent applications</h2>
            <ul className="mt-4 flex flex-col gap-3 text-sm text-white/70">
              {(overview?.latestApplications ?? []).map((item) => (
                <li key={item.id} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <div className="flex justify-between">
                    <span>{item.applicant_name}</span>
                    <span className="text-xs text-white/50">
                      {new Date(item.created_at ?? Date.now()).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-white/50">{item.title}</p>
                </li>
              ))}
              {!isPending && (overview?.latestApplications?.length ?? 0) === 0 && (
                <li className="rounded-2xl border border-white/10 bg-white/5 px-4 py-6 text-center text-white/60">
                  No applications yet.
                </li>
              )}
            </ul>
          </motion.div>

          <motion.div
            className="rounded-3xl border border-white/10 bg-white/5 p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
          >
            <h2 className="text-xl font-semibold text-white">Top companies by listings</h2>
            <ul className="mt-4 flex flex-col gap-3 text-sm text-white/70">
              {(overview?.topCompanies ?? []).map((company) => (
                <li key={company.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <span>{company.name}</span>
                  <span className="text-xs text-white/50">{company.job_count} roles</span>
                </li>
              ))}
              {!isPending && (overview?.topCompanies?.length ?? 0) === 0 && (
                <li className="rounded-2xl border border-white/10 bg-white/5 px-4 py-6 text-center text-white/60">
                  No companies yet. Encourage new partners to join Lumina.
                </li>
              )}
            </ul>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
