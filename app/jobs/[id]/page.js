import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import ApplyJobForm from "@/components/ApplyJobForm";
import CompanyProfileCard from "@/components/CompanyProfileCard";
import { getTokenCookieName, verifyAuthToken } from "@/lib/auth";
import { query } from "@/lib/db";

async function fetchJob(jobId) {
  const jobs = await query({
    sql: `SELECT j.id, j.company_id, j.title, j.location, j.salary, j.category, j.description, j.created_at,
                 c.id AS company_id, c.name AS company_name, c.email AS company_email, c.logo_url, c.website, c.linkedin_url, c.twitter_url, c.github_url, c.employees_count, c.founded_year, c.industry, c.mission, c.description AS company_description, c.location AS company_location, c.hiring_focus
          FROM jobs j
          LEFT JOIN companies c ON c.id = j.company_id
          WHERE j.id = ?
          LIMIT 1`,
    values: [jobId]
  });
  return Array.isArray(jobs) && jobs.length > 0 ? jobs[0] : null;
}

async function fetchRelatedJobs(jobId, category) {
  const related = await query({
    sql: `SELECT j.id, j.title, j.location, j.salary, c.name AS company_name
          FROM jobs j
          LEFT JOIN companies c ON c.id = j.company_id
          WHERE j.id <> ? AND j.category = ?
          ORDER BY j.created_at DESC
          LIMIT 4`,
    values: [jobId, category]
  });
  return related ?? [];
}

async function resolveViewerRole() {
  try {
    const token = cookies().get(getTokenCookieName())?.value;
    if (!token) {
      return "guest";
    }

    const payload = await verifyAuthToken(token);
    return typeof payload?.role === "string" ? payload.role : "guest";
  } catch (error) {
    console.error("Job detail role detection failed", error);
    return "guest";
  }
}

export default async function JobDetailPage({ params }) {
  const jobId = Number(params.id);
  if (!Number.isInteger(jobId)) {
    notFound();
  }

  const job = await fetchJob(jobId);
  if (!job) {
    notFound();
  }

  const company = job.company_id
    ? {
        id: job.company_id,
        name: job.company_name,
        email: job.company_email,
        logo_url: job.logo_url,
        website: job.website,
        linkedin_url: job.linkedin_url,
        twitter_url: job.twitter_url,
        github_url: job.github_url,
        employees_count: job.employees_count,
        founded_year: job.founded_year,
        industry: job.industry,
        mission: job.mission || job.company_description,
        description: job.company_description,
        location: job.company_location,
        hiring_focus: job.hiring_focus,
      }
    : null;

  const relatedJobs = job.category ? await fetchRelatedJobs(jobId, job.category) : [];
  const viewerRole = await resolveViewerRole();
  const canApply = viewerRole === "user";

  return (
    <div className="relative min-h-screen overflow-hidden px-6 py-16 lg:px-16">
      <div className="absolute inset-0 bg-magic-gradient" />
      <div className="absolute inset-0 opacity-25 bg-grid" />

      <div className="relative z-10 mx-auto flex max-w-5xl flex-col gap-12">
        <section className="glass-panel gradient-border rounded-3xl border border-white/10 bg-white/5 p-10 shadow-glow">
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-white/60">{job.category ?? "Opportunity"}</p>
                <h1 className="mt-3 text-4xl font-semibold text-white">{job.title}</h1>
                <p className="mt-2 text-sm text-white/60">{job.company_name ?? "Confidential"}</p>
              </div>
              <div className="flex flex-col items-start gap-3 text-sm text-white/60">
                <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">{job.location}</span>
                {job.salary && (
                  <span className="rounded-full border border-primary-400/50 bg-primary-500/20 px-4 py-2 text-primary-100">
                    {job.salary}
                  </span>
                )}
              </div>
            </div>

            <article className="rounded-3xl border border-white/10 bg-black/30 p-8 text-sm leading-relaxed text-white/70">
              {job.description?.split("\n").map((paragraph, index) => (
                <p key={index} className="mb-4 last:mb-0">
                  {paragraph}
                </p>
              ))}
            </article>
          </div>
        </section>

        {company && (
          <section className="relative z-10 mx-auto max-w-5xl">
            <CompanyProfileCard company={company} />
            <div className="mt-4 flex gap-3">
              {company.website && (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center rounded-full bg-gradient-to-r from-primary-500 via-purple-500 to-primary-400 px-4 py-2 text-sm font-semibold text-white shadow-glow"
                >
                  Visit website
                </a>
              )}
              {company.email && (
                <a
                  href={`mailto:${company.email}`}
                  className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 hover:text-white"
                >
                  Email
                </a>
              )}
            </div>
          </section>
        )}

        <section id="apply" className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-glow">
            <h2 className="text-2xl font-semibold text-white">Why this role sparkles</h2>
            <ul className="mt-4 grid gap-3 text-sm text-white/70">
              <li className="rounded-3xl border border-white/10 bg-white/5 px-4 py-3">
                Collaborate with teams pioneering future-forward experiences.
              </li>
              <li className="rounded-3xl border border-white/10 bg-white/5 px-4 py-3">
                Access curated tools, rituals, and mentorship to support your craft.
              </li>
              <li className="rounded-3xl border border-white/10 bg-white/5 px-4 py-3">
                Become part of the Lumina constellation where purpose meets progression.
              </li>
            </ul>
          </div>
          {canApply ? (
            <ApplyJobForm jobId={job.id} jobTitle={job.title} />
          ) : (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-glow">
              <h2 className="text-2xl font-semibold text-white">
                {viewerRole === "company"
                  ? "You're managing this role"
                  : viewerRole === "admin"
                  ? "Admin read-only view"
                  : "Sign in to apply"}
              </h2>
              <p className="mt-2 text-sm text-white/60">
                {viewerRole === "company"
                  ? "Company accounts review incoming resumes from the applicants hub."
                  : viewerRole === "admin"
                  ? "Administrators oversee listings but cannot submit applications."
                  : "Log in or create a job seeker account to submit your resume for this role."}
              </p>
              {viewerRole === "company" && (
                <Link
                  href="/company/applicants"
                  className="mt-6 inline-flex items-center text-sm font-semibold text-primary-200 hover:text-primary-100"
                >
                  Review applicants →
                </Link>
              )}
              {viewerRole === "admin" && (
                <Link
                  href="/admin"
                  className="mt-6 inline-flex items-center text-sm font-semibold text-primary-200 hover:text-primary-100"
                >
                  Open admin panel →
                </Link>
              )}
              {viewerRole === "guest" && (
                <div className="mt-6 flex flex-wrap gap-3 text-sm font-semibold">
                  <Link
                    href="/login"
                    className="rounded-full bg-gradient-to-r from-primary-500 via-purple-500 to-primary-400 px-6 py-3 text-white shadow-glow"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/signup"
                    className="rounded-full border border-white/20 px-6 py-3 text-white/80 hover:text-white"
                  >
                    Create account
                  </Link>
                </div>
              )}
            </div>
          )}
        </section>

        {relatedJobs.length > 0 && (
          <section className="flex flex-col gap-6">
            <h3 className="text-2xl font-semibold text-white">More roles orbiting this craft</h3>
            <div className="grid gap-6 md:grid-cols-2">
              {relatedJobs.map((related) => (
                <div key={related.id} className="rounded-3xl border border-white/10 bg-white/5 p-6">
                  <p className="text-xs uppercase tracking-[0.3em] text-white/50">{job.category}</p>
                  <h4 className="mt-3 text-xl font-semibold text-white">{related.title}</h4>
                  <p className="mt-1 text-sm text-white/60">{related.company_name ?? "Confidential"}</p>
                  <p className="mt-1 text-sm text-white/60">{related.location}</p>
                  {related.salary && <p className="mt-2 text-sm text-primary-200">{related.salary}</p>}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
