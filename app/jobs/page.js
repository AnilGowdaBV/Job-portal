"use client";

import { useEffect, useState, useTransition } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (index) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.05 * index, duration: 0.6, ease: "easeOut" }
  })
};

const initialFilters = {
  q: "",
  location: "",
  category: "",
  minSalary: "",
  maxSalary: ""
};

export default function JobsPage() {
  const [filters, setFilters] = useState(initialFilters);
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    handleSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function updateFilter(field, value) {
    setFilters((prev) => ({ ...prev, [field]: value }));
  }

  function handleSearch(event) {
    if (event) {
      event.preventDefault();
    }

    setError("");
    startTransition(() => {
      (async () => {
        try {
          const params = new URLSearchParams();
          Object.entries(filters).forEach(([key, value]) => {
            if (value) {
              params.append(key, value);
            }
          });

          params.append("limit", "60");

          const response = await fetch(`/api/jobs?${params.toString()}`);
          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error ?? "Unable to fetch jobs.");
          }

          setJobs(data.jobs ?? []);
        } catch (err) {
          console.error("Job search error", err);
          setError(err instanceof Error ? err.message : "Unexpected error");
        }
      })();
    });
  }

  function resetFilters() {
    setFilters(initialFilters);
    startTransition(() => {
      (async () => {
        try {
          const response = await fetch("/api/jobs?limit=60");
          const data = await response.json();
          if (response.ok) {
            setJobs(data.jobs ?? []);
          }
        } catch (err) {
          console.error("Reset filters error", err);
        }
      })();
    });
  }

  return (
    <div className="relative min-h-screen overflow-hidden px-6 py-16 lg:px-16">
      <div className="absolute inset-0 bg-magic-gradient" />
      <motion.div
        className="absolute inset-0 opacity-25 bg-grid"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.25 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />

      <div className="relative z-10 mx-auto max-w-6xl">
        <motion.div
          className="glass-panel gradient-border rounded-3xl border border-white/10 bg-white/5 p-10 shadow-glow"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="flex flex-col gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-white/60">Lumina Opportunities</p>
              <h1 className="mt-3 text-4xl font-semibold text-white">Search roles across the cosmos</h1>
              <p className="mt-2 text-sm text-white/60">
                Filter by title, location, craft, or salary aura to find the opportunity that feels destined.
              </p>
            </div>

            <form
              onSubmit={handleSearch}
              className="grid gap-4 rounded-3xl border border-white/10 bg-black/30 p-6 sm:grid-cols-2 lg:grid-cols-6"
            >
              <div className="lg:col-span-2">
                <label className="text-xs text-white/60">Role or keyword</label>
                <input
                  type="text"
                  value={filters.q}
                  onChange={(event) => updateFilter("q", event.target.value)}
                  placeholder="e.g. Product Magician"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-primary-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-white/60">Location</label>
                <input
                  type="text"
                  value={filters.location}
                  onChange={(event) => updateFilter("location", event.target.value)}
                  placeholder="Remote, Berlin, Mars Colony"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-primary-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-white/60">Category</label>
                <input
                  type="text"
                  value={filters.category}
                  onChange={(event) => updateFilter("category", event.target.value)}
                  placeholder="Design, Engineering, Growth"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-primary-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-white/60">Min Salary</label>
                <input
                  type="number"
                  min="0"
                  value={filters.minSalary}
                  onChange={(event) => updateFilter("minSalary", event.target.value)}
                  placeholder="90000"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-primary-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-white/60">Max Salary</label>
                <input
                  type="number"
                  min="0"
                  value={filters.maxSalary}
                  onChange={(event) => updateFilter("maxSalary", event.target.value)}
                  placeholder="200000"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-primary-400 focus:outline-none"
                />
              </div>
              <div className="flex items-end gap-3 lg:col-span-2">
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 rounded-full bg-gradient-to-r from-primary-500 via-purple-500 to-primary-400 px-6 py-3 text-sm font-semibold text-white shadow-glow disabled:opacity-60"
                >
                  {isPending ? "Searching..." : "Search roles"}
                </button>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-white/70 hover:border-white/20"
                >
                  Reset
                </button>
              </div>
            </form>
          </div>
        </motion.div>

        {error && (
          <div className="mt-6 rounded-3xl border border-red-500/40 bg-red-500/10 p-6 text-sm text-red-200">
            {error}
          </div>
        )}

        <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {jobs.map((job, index) => (
            <motion.article
              key={job.id}
              className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 shadow-glow"
              custom={index}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-[0.3em] text-white/50">
                  {job.category ?? "Opportunity"}
                </span>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/60">
                  {new Date(job.created_at ?? Date.now()).toLocaleDateString()}
                </span>
              </div>
              <h3 className="mt-3 text-2xl font-semibold text-white">{job.title}</h3>
              <p className="mt-2 text-sm text-white/60">{job.company_name ?? "Confidential"}</p>
              <p className="mt-1 text-sm text-white/60">{job.location}</p>
              {job.salary && <p className="mt-3 text-sm text-primary-200">{job.salary}</p>}
              <p className="mt-4 line-clamp-3 text-sm text-white/60">{job.description}</p>
              <div className="mt-6 flex items-center justify-between text-sm">
                <Link className="font-semibold text-primary-200 hover:text-primary-100" href={`/jobs/${job.id}`}>
                  View details →
                </Link>
                <Link className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-white/70 hover:text-white" href={`/jobs/${job.id}#apply`}>
                  Apply
                </Link>
              </div>
            </motion.article>
          ))}

          {!isPending && jobs.length === 0 && (
            <div className="col-span-full rounded-3xl border border-white/10 bg-white/5 p-12 text-center text-sm text-white/60">
              No roles match your filter yet. Adjust filters or check back soon.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
