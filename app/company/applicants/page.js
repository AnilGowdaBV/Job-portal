"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import LogoutButton from "@/components/LogoutButton";

export default function CompanyApplicantsPage() {
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(() => {
      (async () => {
        try {
          const response = await fetch("/api/company/applications");
          const data = await response.json();
          if (!response.ok) {
            throw new Error(data.error ?? "Unable to load applicants");
          }
          setApplications(data.applications ?? []);
        } catch (err) {
          console.error("Company applicants error", err);
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

      <div className="relative z-10 mx-auto max-w-5xl">
        <motion.div
          className="glass-panel gradient-border rounded-3xl border border-white/10 bg-white/5 p-10 shadow-glow"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="flex flex-col gap-2">
            <p className="text-xs uppercase tracking-[0.4em] text-white/60">Applicant galaxy</p>
            <h1 className="text-3xl font-semibold text-white">Talent orbiting your roles</h1>
            <p className="text-sm text-white/60">
              Review candidates, download their shimmering resumes, and connect when the alignment feels right.
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
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-white/50">{application.title}</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">{application.applicant_name}</h2>
                  <p className="text-sm text-white/60">{application.applicant_email}</p>
                  <p className="text-sm text-white/60">Applied: {new Date(application.created_at ?? Date.now()).toLocaleString()}</p>
                </div>
                <Link
                  href={`/jobs/${application.job_id}`}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 hover:text-white"
                >
                  View job details
                </Link>
              </div>
              <div className="mt-4 flex flex-wrap gap-3 text-sm text-white/70">
                <a
                  href={application.resume_path}
                  download
                  className="rounded-full border border-primary-400/40 bg-primary-500/20 px-4 py-2 text-primary-100 hover:text-primary-50"
                >
                  Download resume
                </a>
              </div>
            </motion.article>
          ))}

          {!isPending && applications.length === 0 && (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-12 text-center text-sm text-white/60">
              No applicants yet. Share your roles and they will begin to orbit.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
