"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { motion } from "framer-motion";
import CompanyProfileCard from "@/components/CompanyProfileCard";
import EditCompanyProfileDialog from "@/components/EditCompanyProfileDialog";
import LogoutButton from "@/components/LogoutButton";

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (index) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.1 * index, duration: 0.6, ease: "easeOut" }
  })
};

function SectionHeader({ title, description }) {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-2xl font-semibold text-white">{title}</h2>
      <p className="text-sm text-white/60">{description}</p>
    </div>
  );
}

export default function DashboardPage() {
  const [profile, setProfile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [showEdit, setShowEdit] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const [deletingJobId, setDeletingJobId] = useState(null);

  useEffect(() => {
    startTransition(() => {
      (async () => {
        try {
          const profileResponse = await fetch("/api/me");

          if (!profileResponse.ok) {
            const data = await profileResponse.json();
            throw new Error(data.error ?? "Unable to load profile");
          }

          const profileData = await profileResponse.json();
          setProfile(profileData);

          const companyId = profileData?.user?.role === "company" ? profileData?.company?.id : null;
          const jobsUrl = companyId ? `/api/jobs?limit=6&companyId=${companyId}` : "/api/jobs?limit=6";
          const jobsResponse = await fetch(jobsUrl);
          if (jobsResponse.ok) {
            const jobsData = await jobsResponse.json();
            setJobs(jobsData.jobs ?? []);
          } else {
            const jobsError = await jobsResponse.json().catch(() => ({}));
            console.error("Jobs fetch error", jobsError);
          }
        } catch (err) {
          console.error("Dashboard load error", err);
          setError(err instanceof Error ? err.message : "Unexpected error");
        }
      })();
    });
  }, []);

  const role = profile?.user?.role ?? "user";

  async function handleDeleteJob(jobId) {
    if (!confirm("Are you sure you want to remove this role? This action cannot be undone.")) {
      return;
    }
    setDeletingJobId(jobId);
    try {
      const res = await fetch(`/api/jobs/${jobId}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error ?? "Unable to delete job");
      }
      setJobs((prev) => (Array.isArray(prev) ? prev.filter((j) => j.id !== jobId) : []));
      // small feedback — use alert for now
      alert(data.message ?? "Role removed.");
    } catch (err) {
      console.error("Delete job error", err);
      alert(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setDeletingJobId(null);
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col gap-12 overflow-hidden px-6 py-16 lg:px-16">
      <LogoutButton className="absolute right-6 top-6 z-30" />
      <div className="absolute inset-0 bg-magic-gradient" />
      <motion.div
        className="absolute inset-0 opacity-20 bg-grid"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.2 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />
      <div className="relative z-10 flex flex-col gap-12">
        <section className="glass-panel gradient-border rounded-3xl border border-white/10 bg-white/5 p-10 shadow-glow">
          <motion.div
            className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="max-w-2xl">
              <p className="text-sm uppercase tracking-[0.4em] text-white/60">
                {role === "company" ? "Company Command Center" : role === "admin" ? "Admin Constellation" : "Explorer Dashboard"}
              </p>
              <h1 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
                {profile?.user?.name ? `Welcome, ${profile.user.name}` : "Welcome back"}
              </h1>
              <p className="mt-2 text-sm text-white/60">
                {role === "company"
                  ? "Craft captivating job stories, monitor applicant stardust, and hire with intention."
                  : role === "admin"
                  ? "Survey the galaxy of users, companies, and roles to keep Lumina radiant."
                  : "Track your magical applications, discover tailored roles, and elevate your journey."}
              </p>
            </div>
            <div className="flex flex-wrap gap-4 text-sm">
              {role === "user" && (
                <Link
                  href="/jobs"
                  className="rounded-full bg-gradient-to-r from-primary-500 via-purple-500 to-primary-400 px-6 py-3 font-semibold text-white shadow-glow"
                >
                  Discover Roles
                </Link>
              )}
              {role === "company" && (
                <Link
                  href="/company/jobs/new"
                  className="rounded-full bg-gradient-to-r from-primary-500 via-purple-500 to-primary-400 px-6 py-3 font-semibold text-white shadow-glow"
                >
                  Post a Role
                </Link>
              )}
              {role === "admin" && (
                <Link
                  href="/admin"
                  className="rounded-full bg-gradient-to-r from-primary-500 via-purple-500 to-primary-400 px-6 py-3 font-semibold text-white shadow-glow"
                >
                  Open Admin Panel
                </Link>
              )}
            </div>
          </motion.div>
        </section>

        {error && (
          <div className="rounded-3xl border border-red-500/40 bg-red-500/10 p-6 text-sm text-red-200">
            {error}
          </div>
        )}

        {role === "company" && (
          <section className="flex flex-col gap-6">
            <SectionHeader
              title="Company Profile"
              description="Showcase your identity, culture, and hiring focus to applicants."
            />
            <CompanyProfileCard
              company={profile?.company}
              onEdit={() => setShowEdit(true)}
            />
          </section>
        )}

        <section className="flex flex-col gap-6">
          <SectionHeader
            title={role === "company" ? "Your Active Listings" : "Fresh Opportunities"}
            description={
              role === "company"
                ? "Monitor performance of roles you've launched into the Lumina universe."
                : "Handpicked roles emerging from visionary teams across the cosmos."
            }
          />
          <div className="grid gap-6 lg:grid-cols-3">
            {(jobs ?? []).slice(0, 6).map((job, index) => (
              <motion.div
                key={job.id}
                className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 shadow-glow"
                custom={index}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
              >
                <span className="text-xs uppercase tracking-[0.3em] text-white/50">
                  {job.category ?? "Opportunity"}
                </span>
                <h3 className="mt-3 text-xl font-semibold text-white">{job.title}</h3>
                <p className="mt-2 text-sm text-white/60">{job.company_name ?? "Anonymous Company"}</p>
                <p className="mt-1 text-sm text-white/50">{job.location}</p>
                {job.salary && <p className="mt-2 text-sm text-primary-200">{job.salary}</p>}
                <div className="mt-6 flex items-center justify-between text-sm text-white/70">
                  <div className="flex items-center gap-4">
                    <Link className="hover:text-white" href={`/jobs/${job.id}`}>
                      View details →
                    </Link>
                    {role === "company" && (
                      <>
                        <Link
                          href={`/jobs/${job.id}`}
                          className="text-primary-200 hover:text-primary-100"
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDeleteJob(job.id)}
                          disabled={deletingJobId === job.id}
                          className="rounded-full border border-red-400/30 bg-red-500/10 px-3 py-1 text-sm text-red-300 hover:bg-red-500/20 disabled:opacity-50"
                        >
                          {deletingJobId === job.id ? "Removing..." : "Delete"}
                        </button>
                      </>
                    )}
                  </div>
                  <span>{new Date(job.created_at ?? Date.now()).toLocaleDateString()}</span>
                </div>
              </motion.div>
            ))}
            {jobs.length === 0 && !isPending && (
              <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center text-sm text-white/60">
                No roles yet. {role === "company" ? "Post your first role to get started." : "Check back soon for more opportunities."}
              </div>
            )}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          {role === "user" && (
            <motion.div
              className="rounded-3xl border border-white/10 bg-white/5 p-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
            >
              <h3 className="text-xl font-semibold text-white">Track your cosmic journey</h3>
              <p className="mt-2 text-sm text-white/60">
                Manage every application, download resumes, and map out your next move in the dedicated
                applications hub.
              </p>
              <Link
                className="mt-6 inline-flex items-center text-sm font-semibold text-primary-200 hover:text-primary-100"
                href="/profile/applied"
              >
                View applied roles →
              </Link>
            </motion.div>
          )}

          {role === "company" && (
            <motion.div
              className="rounded-3xl border border-white/10 bg-white/5 p-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
            >
              <h3 className="text-xl font-semibold text-white">Review incoming starlight</h3>
              <p className="mt-2 text-sm text-white/60">
                Explore applicants, download resumes instantly, and send updates without friction.
              </p>
              <Link
                className="mt-6 inline-flex items-center text-sm font-semibold text-primary-200 hover:text-primary-100"
                href="/company/applicants"
              >
                Review applicants →
              </Link>
            </motion.div>
          )}

          {role === "admin" && (
            <motion.div
              className="rounded-3xl border border-white/10 bg-white/5 p-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
            >
              <h3 className="text-xl font-semibold text-white">Admin quick links</h3>
              <ul className="mt-3 grid gap-2 text-sm text-white/70">
                <li>
                  <Link className="hover:text-white" href="/admin">
                    Overview panel
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-white" href="/jobs">
                    Browse public listings
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-white" href="/company/applicants">
                    Review applicants
                  </Link>
                </li>
              </ul>
            </motion.div>
          )}
        </section>
        {showEdit && (
          <EditCompanyProfileDialog
            company={profile?.company}
            onClose={() => setShowEdit(false)}
            onSaved={updated => setProfile(p => ({ ...p, company: updated }))}
          />
        )}
      </div>
    </div>
  );
}
