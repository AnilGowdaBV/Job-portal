"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import LogoutButton from "@/components/LogoutButton";

export default function AppliedJobsPage() {
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(() => {
      (async () => {
        try {
          const response = await fetch("/api/applications");
          const data = await response.json();
          if (!response.ok) {
            throw new Error(data.error ?? "Unable to load applications");
          }
          setApplications(data.applications ?? []);
        } catch (err) {
          console.error("Applied jobs error", err);
          setError(err instanceof Error ? err.message : "Unexpected error");
        }
      })();
    });
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden px-6 py-16 lg:px-16">
      <LogoutButton className="absolute right-6 top-6 z-30" />
      <div className="absolute inset-0 bg-magic-gradient" />
      <div className="absolute inset-0 opacity-20 bg-grid" />

      <div className="relative z-10 mx-auto max-w-4xl">
        <motion.div
          className="glass-panel gradient-border rounded-3xl border border-white/10 bg-white/5 p-10 shadow-glow"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="flex flex-col gap-2">
            <p className="text-xs uppercase tracking-[0.4em] text-white/60">Your orbit</p>
            <h1 className="text-3xl font-semibold text-white">Applications timeline</h1>
            <p className="text-sm text-white/60">
              Track every role you've reached for, revisit details, and download resumes you shared.
            </p>
          </div>
        </motion.div>

        {error && (
          <div className="mt-6 rounded-3xl border border-red-500/40 bg-red-500/10 p-6 text-sm text-red-200">
            {error}
          </div>
        )}

        <div className="mt-8 flex flex-col gap-4">
          {applications.map((application) => (
            <motion.article
              key={application.id}
              className="rounded-3xl border border-white/10 bg-white/5 p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-white">{application.title}</h2>
                  <p className="text-sm text-white/60">{application.company_name}</p>
                  <p className="text-sm text-white/60">{application.location}</p>
                </div>
                <span className="rounded-full bg-white/10 px-4 py-2 text-xs text-white/60">
                  Applied on {new Date(application.created_at ?? Date.now()).toLocaleDateString()}
                </span>
              </div>
              {application.salary && <p className="mt-3 text-sm text-primary-200">{application.salary}</p>}
              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-white/70">
                <Link className="hover:text-white" href={`/jobs/${application.job_id}`}>
                  View job →
                </Link>
                <a
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 hover:text-white"
                  href={application.resume_path}
                  download
                >
                  Download submitted resume
                </a>
              </div>
            </motion.article>
          ))}

          {!isPending && applications.length === 0 && (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-12 text-center text-sm text-white/60">
              You haven&apos;t applied to any roles yet. Explore the <Link className="text-primary-200" href="/jobs">jobs</Link> page to get started.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
