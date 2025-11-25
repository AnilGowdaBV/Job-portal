"use client";
import { useState } from "react";

const FIELD_CONFIG = [
  { name: "name", label: "Name", type: "text" },
  { name: "logo_url", label: "Logo URL", type: "text" },
  { name: "banner_url", label: "Banner Image URL", type: "text" },
  { name: "website", label: "Website", type: "text" },
  { name: "linkedin_url", label: "LinkedIn URL", type: "text" },
  { name: "twitter_url", label: "Twitter URL", type: "text" },
  { name: "github_url", label: "GitHub URL", type: "text" },
  { name: "employees_count", label: "Employees Count", type: "number" },
  { name: "founded_year", label: "Founded Year", type: "number" },
  { name: "industry", label: "Industry", type: "text" },
  { name: "hiring_focus", label: "Hiring Focus", type: "text" },
  { name: "mission", label: "Mission", type: "textarea" },
  { name: "description", label: "Description", type: "textarea" },
  { name: "location", label: "Location", type: "text" }
];

export default function EditCompanyProfileDialog({ company, onClose, onSaved }) {
  const [form, setForm] = useState(() => ({ ...company }));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/company/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      onSaved(data.company);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 px-4 py-12">
      <div className="w-full max-w-3xl rounded-3xl border border-white/10 bg-[#0a0f1a] p-8 shadow-glow">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Edit Company Profile</h2>
          <button onClick={onClose} className="rounded-md px-3 py-2 text-sm text-white/60 hover:text-white">Close</button>
        </div>
        <form onSubmit={handleSubmit} className="mt-6 grid gap-6">
          <div className="grid gap-4 md:grid-cols-2">
            {FIELD_CONFIG.filter(f => f.type !== "textarea").map(field => (
              <label key={field.name} className="flex flex-col gap-2 text-sm text-white/70">
                <span>{field.label}</span>
                <input
                  type={field.type}
                  value={form[field.name] || ""}
                  onChange={e => setForm({ ...form, [field.name]: e.target.value })}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary-400"
                  placeholder={field.label}
                />
              </label>
            ))}
          </div>
          {FIELD_CONFIG.filter(f => f.type === "textarea").map(field => (
            <label key={field.name} className="flex flex-col gap-2 text-sm text-white/70">
              <span>{field.label}</span>
              <textarea
                value={form[field.name] || ""}
                onChange={e => setForm({ ...form, [field.name]: e.target.value })}
                rows={4}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary-400"
                placeholder={field.label}
              />
            </label>
          ))}
          {error && <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">{error}</div>}
          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-gradient-to-r from-primary-500 via-purple-500 to-primary-400 px-6 py-3 text-sm font-semibold text-white shadow-glow disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white/70 hover:text-white"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
