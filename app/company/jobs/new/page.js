"use client";

import { useRef, useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import LogoutButton from "@/components/LogoutButton";

const initialForm = {
  title: "",
  location: "",
  salary: "",
  category: "",
  description: ""
};

export default function NewJobPage() {
  const formRef = useRef(null);
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState({ type: "idle", message: "" });
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const redirectTimeoutRef = useRef(null);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    setStatus({ type: "idle", message: "" });

    startTransition(() => {
      (async () => {
        try {
          const response = await fetch("/api/jobs", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form)
          });
          const data = await response.json();
          if (!response.ok) {
            throw new Error(data.error ?? "Unable to create job");
          }
          setStatus({ type: "success", message: "Role launched into the Lumina galaxy." });
          setForm(initialForm);
          formRef.current?.reset();
          // wait 2 seconds so user can see success message, then redirect
          redirectTimeoutRef.current = setTimeout(() => {
            router.push("/dashboard");
          }, 2000);
        } catch (err) {
          console.error("Create job error", err);
          setStatus({ type: "error", message: err instanceof Error ? err.message : "Unexpected error" });
        }
      })();
    });
  }

  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden px-6 py-16 lg:px-16">
      <LogoutButton className="absolute right-6 top-6 z-30" />
      <div className="absolute inset-0 bg-magic-gradient" />
      <motion.div
        className="absolute inset-0 opacity-20 bg-grid"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.2 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />

      <div className="relative z-10 mx-auto max-w-4xl">
        <motion.form
          ref={formRef}
          onSubmit={handleSubmit}
          className="glass-panel gradient-border rounded-3xl border border-white/10 bg-white/5 p-10 shadow-glow"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="flex flex-col gap-2">
            <p className="text-xs uppercase tracking-[0.4em] text-white/60">Post a role</p>
            <h1 className="text-3xl font-semibold text-white">Craft a luminous job listing</h1>
            <p className="text-sm text-white/60">
              Share the story, expectations, and rewards to attract talent destined for your team.
            </p>
          </div>

          <div className="mt-8 grid gap-6">
            <label className="flex flex-col gap-2">
              <span className="text-xs text-white/60">Job title</span>
              <input
                type="text"
                value={form.title}
                onChange={(event) => updateField("title", event.target.value)}
                required
                placeholder="Senior Product Magician"
                className="rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-primary-400 focus:outline-none"
              />
            </label>

            <div className="grid gap-6 sm:grid-cols-3">
              <label className="flex flex-col gap-2">
                <span className="text-xs text-white/60">Location</span>
                <input
                  type="text"
                  value={form.location}
                  onChange={(event) => updateField("location", event.target.value)}
                  required
                  placeholder="Remote, Berlin, Lunar Base"
                  className="rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-primary-400 focus:outline-none"
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-xs text-white/60">Salary band</span>
                <input
                  type="text"
                  value={form.salary}
                  onChange={(event) => updateField("salary", event.target.value)}
                  placeholder="$140k - $180k"
                  className="rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-primary-400 focus:outline-none"
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-xs text-white/60">Category</span>
                <input
                  type="text"
                  value={form.category}
                  onChange={(event) => updateField("category", event.target.value)}
                  required
                  placeholder="Design, Engineering, Marketing"
                  className="rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-primary-400 focus:outline-none"
                />
              </label>
            </div>

            <label className="flex flex-col gap-2">
              <span className="text-xs text-white/60">Description</span>
              <textarea
                value={form.description}
                onChange={(event) => updateField("description", event.target.value)}
                required
                rows={8}
                placeholder="Describe the craft, responsibilities, and magic candidates will create."
                className="rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-primary-400 focus:outline-none"
              />
            </label>
          </div>

          {status.type !== "idle" && (
            <div
              className={`mt-6 rounded-2xl border px-4 py-3 text-sm ${
                status.type === "success"
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
                  : "border-red-500/40 bg-red-500/10 text-red-200"
              }`}
            >
              {status.message}
            </div>
          )}

          <motion.button
            type="submit"
            disabled={isPending}
            className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-primary-500 via-purple-500 to-primary-400 px-8 py-3 text-sm font-semibold text-white shadow-glow disabled:opacity-60"
            whileHover={{ scale: isPending ? 1 : 1.01 }}
            whileTap={{ scale: isPending ? 1 : 0.98 }}
          >
            {isPending ? "Publishing..." : "Publish role"}
          </motion.button>

          <div className="mt-4 text-center text-xs text-white/50">
            Need applicants? <Link className="text-primary-200 hover:text-primary-100" href="/company/applicants">Review the talent pool →</Link>
          </div>
        </motion.form>
      </div>
    </div>
  );
}
