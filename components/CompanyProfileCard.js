"use client";
import { motion } from "framer-motion";

export default function CompanyProfileCard({ company, onEdit }) {
  if (!company) return null;
  const initial = company.name?.charAt(0)?.toUpperCase() ?? "?";
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 shadow-glow"
    >
      <div className="flex flex-col gap-6 md:flex-row md:items-center">
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 overflow-hidden rounded-2xl border border-white/10 bg-white/10 flex items-center justify-center text-3xl font-semibold text-white">
            {company.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={company.logo_url}
                alt={company.name + " logo"}
                className="h-full w-full object-cover"
              />
            ) : (
              initial
            )}
          </div>
          <div>
            <h3 className="text-2xl font-semibold text-white">{company.name}</h3>
            <p className="text-sm text-white/60">{company.industry || "Industry not set"}</p>
          </div>
        </div>
        <div className="ml-auto flex flex-wrap gap-3 text-xs text-white/70">
          {company.website && (
            <a href={company.website} target="_blank" rel="noreferrer" className="hover:text-white">
              Website ↗
            </a>
          )}
          {company.linkedin_url && (
            <a href={company.linkedin_url} target="_blank" rel="noreferrer" className="hover:text-white">
              LinkedIn ↗
            </a>
          )}
          {company.twitter_url && (
            <a href={company.twitter_url} target="_blank" rel="noreferrer" className="hover:text-white">
              Twitter ↗
            </a>
          )}
          {company.github_url && (
            <a href={company.github_url} target="_blank" rel="noreferrer" className="hover:text-white">
              GitHub ↗
            </a>
          )}
        </div>
      </div>
      <div className="mt-6 grid gap-6 md:grid-cols-3 text-sm">
        <div className="flex flex-col gap-1">
          <span className="text-white/50 uppercase tracking-[0.2em] text-xs">Founded</span>
          <span className="text-white font-medium">{company.founded_year || "—"}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-white/50 uppercase tracking-[0.2em] text-xs">Team Size</span>
          <span className="text-white font-medium">{company.employees_count || "—"}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-white/50 uppercase tracking-[0.2em] text-xs">Hiring Focus</span>
          <span className="text-white font-medium">{company.hiring_focus || "—"}</span>
        </div>
      </div>
      <p className="mt-6 text-sm text-white/70 leading-relaxed">
        {company.mission || company.description || "No mission set yet."}
      </p>
      {onEdit && (
        <button
          onClick={onEdit}
          className="mt-8 rounded-full bg-gradient-to-r from-primary-500 via-purple-500 to-primary-400 px-6 py-3 text-sm font-semibold text-white shadow-glow"
        >
          Edit Company Profile
        </button>
      )}
    </motion.div>
  );
}
