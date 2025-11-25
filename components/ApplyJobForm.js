"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function ApplyJobForm({ jobId, jobTitle }) {
  const formRef = useRef(null);
  const [status, setStatus] = useState({ type: "idle", message: "" });
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(event) {
    event.preventDefault();

    const formData = new FormData(formRef.current ?? undefined);
    setStatus({ type: "idle", message: "" });

    startTransition(() => {
      (async () => {
        try {
          const response = await fetch(`/api/jobs/${jobId}/apply`, {
            method: "POST",
            body: formData
          });
          const data = await response.json();
          if (!response.ok) {
            setStatus({ type: "error", message: data.error ?? "Unable to submit application." });
            return;
          }
          setStatus({
            type: "success",
            message: "Application sent! Your resume now shimmers in the recruiter's inbox."
          });
          formRef.current?.reset();
          // Redirect to dashboard after 2 seconds so user can read success message
          setTimeout(() => {
            router.push("/dashboard");
          }, 2000);
        } catch (err) {
          console.error("Apply form error", err);
          setStatus({ type: "error", message: "Unexpected error. Please try again later." });
        }
      })();
    });
  }

  return (
    <motion.form
      ref={formRef}
      onSubmit={handleSubmit}
      className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-glow"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <h2 className="text-2xl font-semibold text-white">Apply for {jobTitle}</h2>
      <p className="mt-2 text-sm text-white/60">
        Upload your shimmering PDF resume and we will notify the hiring team instantly.
      </p>

      <div className="mt-6 flex flex-col gap-4">
        <label className="text-xs uppercase tracking-[0.3em] text-white/60">Resume (PDF)</label>
        <div className="relative flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-white/20 bg-black/30 p-8 text-center">
          <input
            type="file"
            name="resume"
            accept="application/pdf"
            required
            className="absolute inset-0 cursor-pointer opacity-0"
          />
          <span className="text-base font-medium text-white">Drop your PDF here or browse</span>
          <span className="text-xs text-white/40">Maximum file size: 5MB</span>
        </div>
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
        {isPending ? "Sending your constellation..." : "Submit application"}
      </motion.button>

      <p className="mt-3 text-center text-xs text-white/50">
        By applying, you agree to share your resume with the hiring company.
      </p>
    </motion.form>
  );
}
