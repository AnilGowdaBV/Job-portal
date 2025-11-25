"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

export default function LogoutButton({ className = "" }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleLogout() {
    startTransition(() => {
      (async () => {
        try {
          const response = await fetch("/api/auth/logout", { method: "POST" });
          if (!response.ok) {
            console.error("Logout failed", await response.text());
          }
        } catch (error) {
          console.error("Logout error", error);
        } finally {
          router.push("/");
          router.refresh();
        }
      })();
    });
  }

  const baseClasses = "inline-flex items-center justify-center rounded-full border border-white/15 bg-white/10 px-5 py-2 text-sm font-semibold text-white/80 shadow-glow transition hover:bg-white/20 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isPending}
      className={`${baseClasses}${className ? ` ${className}` : ""}`}
    >
      {isPending ? "Signing out..." : "Logout"}
    </button>
  );
}
