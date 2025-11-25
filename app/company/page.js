import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";

export default function CompanyLanding() {
  return (
    <div className="relative min-h-screen overflow-hidden px-6 py-16 lg:px-16">
      <LogoutButton className="absolute right-6 top-6 z-30" />
      <div className="absolute inset-0 bg-magic-gradient" />
      <div className="absolute inset-0 opacity-25 bg-grid" />

      <div className="relative z-10 mx-auto max-w-4xl">
        <section className="glass-panel gradient-border rounded-3xl border border-white/10 bg-white/5 p-10 shadow-glow">
          <p className="text-xs uppercase tracking-[0.4em] text-white/60">Company hub</p>
          <h1 className="mt-3 text-4xl font-semibold text-white">Illuminate your openings</h1>
          <p className="mt-3 text-sm text-white/60">
            Launch roles that radiate culture, review stellar applicants, and hire with clarity inside the Lumina suite.
          </p>
          <div className="mt-6 flex flex-wrap gap-4 text-sm">
            <Link className="rounded-full bg-gradient-to-r from-primary-500 via-purple-500 to-primary-400 px-6 py-3 font-semibold text-white shadow-glow" href="/company/jobs/new">
              Post a role
            </Link>
            <Link className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-white/70 hover:text-white" href="/company/applicants">
              Review applicants
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
