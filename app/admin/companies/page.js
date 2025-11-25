"use client";

import { useEffect, useState, useTransition } from "react";
import { motion } from "framer-motion";
import LogoutButton from "@/components/LogoutButton";

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState([]);
  const [error, setError] = useState("");
  const [globalMessage, setGlobalMessage] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: "", email: "" });
  const [isPending, startTransition] = useTransition();

  function beginEdit(company) {
    setEditingId(company.id);
    setForm({ name: company.name, email: company.email });
    setGlobalMessage("");
  }

  function cancelEdit() {
    setEditingId(null);
    setForm({ name: "", email: "" });
  }

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function refresh() {
    setError("");
    setGlobalMessage("");
    try {
      const response = await fetch("/api/admin/companies");
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to load companies");
      setCompanies(data.companies ?? []);
    } catch (err) {
      console.error("Companies fetch error", err);
      setError(err instanceof Error ? err.message : "Unexpected error");
    }
  }

  useEffect(() => {
    startTransition(() => {
      refresh();
    });
  }, []);

  function handleUpdate(event) {
    event.preventDefault();
    if (!editingId) return;
    setGlobalMessage("");
    startTransition(() => {
      (async () => {
        try {
          const response = await fetch(`/api/admin/companies/${editingId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form)
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.error ?? "Update failed");
          setGlobalMessage("Company details updated.");
          cancelEdit();
          refresh();
        } catch (err) {
          console.error("Company update error", err);
          setGlobalMessage(err instanceof Error ? err.message : "Unexpected error");
        }
      })();
    });
  }

  function handleDelete(id) {
    if (!confirm("Delete company and all its jobs/applicant linkages?")) return;
    setGlobalMessage("");
    startTransition(() => {
      (async () => {
        try {
          const response = await fetch(`/api/admin/companies/${id}`, { method: "DELETE" });
          const data = await response.json();
          if (!response.ok) throw new Error(data.error ?? "Delete failed");
          setGlobalMessage("Company removed.");
          if (editingId === id) cancelEdit();
          refresh();
        } catch (err) {
          console.error("Company delete error", err);
          setGlobalMessage(err instanceof Error ? err.message : "Unexpected error");
        }
      })();
    });
  }

  return (
    <div className="relative min-h-screen overflow-hidden px-6 py-16 lg:px-16">
      <LogoutButton className="absolute right-6 top-6 z-30" />
      <div className="absolute inset-0 bg-magic-gradient" />
      <div className="absolute inset-0 opacity-20 bg-grid" />
      <div className="relative z-10 mx-auto max-w-6xl">
        <motion.div
          className="glass-panel gradient-border rounded-3xl border border-white/10 bg-white/5 p-10 shadow-glow"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="flex flex-col gap-2">
            <p className="text-xs uppercase tracking-[0.4em] text-white/60">Admin companies</p>
            <h1 className="text-3xl font-semibold text-white">Manage registered companies</h1>
            <p className="text-sm text-white/60">Inspect, refine, or remove company entities to keep the platform trusted.</p>
          </div>
          {globalMessage && (
            <div className="mt-6 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
              {globalMessage}
            </div>
          )}
          {error && (
            <div className="mt-6 rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}
        </motion.div>

        <div className="mt-10 flex flex-col gap-6">
          {companies.map((company) => {
            const isEditing = editingId === company.id;
            return (
              <motion.div
                key={company.id}
                className="rounded-3xl border border-white/10 bg-white/5 p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                {!isEditing && (
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="min-w-[240px]">
                      <h2 className="text-xl font-semibold text-white">{company.name}</h2>
                      <p className="text-sm text-white/60">{company.email}</p>
                      <p className="mt-1 text-xs text-white/50">Jobs: {company.job_count}</p>
                      <p className="mt-1 text-xs text-white/50">Joined {new Date(company.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-3 text-sm">
                      <button
                        onClick={() => beginEdit(company)}
                        className="rounded-full bg-gradient-to-r from-primary-500 via-purple-500 to-primary-400 px-5 py-2 font-semibold text-white shadow-glow"
                        disabled={isPending}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(company.id)}
                        className="rounded-full border border-red-500/40 bg-red-500/10 px-5 py-2 font-semibold text-red-200 hover:border-red-500/60"
                        disabled={isPending}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
                {isEditing && (
                  <form onSubmit={handleUpdate} className="flex flex-col gap-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="flex flex-col gap-2">
                        <span className="text-xs text-white/60">Name</span>
                        <input
                          type="text"
                          value={form.name}
                          onChange={(e) => updateField("name", e.target.value)}
                          required
                          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-primary-400 focus:outline-none"
                        />
                      </label>
                      <label className="flex flex-col gap-2">
                        <span className="text-xs text-white/60">Email</span>
                        <input
                          type="email"
                          value={form.email}
                          onChange={(e) => updateField("email", e.target.value)}
                          required
                          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-primary-400 focus:outline-none"
                        />
                      </label>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="submit"
                        disabled={isPending}
                        className="rounded-full bg-gradient-to-r from-primary-500 via-purple-500 to-primary-400 px-6 py-2 text-sm font-semibold text-white shadow-glow disabled:opacity-60"
                      >
                        {isPending ? "Saving..." : "Save"}
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="rounded-full border border-white/10 bg-white/5 px-6 py-2 text-sm text-white/70 hover:text-white"
                        disabled={isPending}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </motion.div>
            );
          })}
          {!isPending && companies.length === 0 && !error && (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-12 text-center text-sm text-white/60">
              No companies yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
