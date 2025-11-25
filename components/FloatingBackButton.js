"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function FloatingBackButton() {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function fetchMe() {
      try {
        const res = await fetch("/api/me", { credentials: "same-origin" });
        if (!mounted) return;
        if (res.ok) {
          setIsAuthed(true);
        } else {
          setIsAuthed(false);
        }
      } catch (err) {
        setIsAuthed(false);
      } finally {
        if (mounted) setReady(true);
      }
    }

    fetchMe();

    return () => {
      mounted = false;
    };
  }, []);

  // Pages where the button should never appear
  const hideForPaths = () => {
    if (!pathname) return true;
    const p = pathname.toLowerCase();
    if (p === "/") return true; // landing
    if (p.includes("/login") || p.includes("/signup") || p.includes("/register")) return true;
    return false;
  };

  // Ordered rules: first matching prefix decides where to navigate
  const rules = [
    // User flows: when on dashboard go back to login
    { prefixes: ["/dashboard"], backTo: "/login" },
    // Job seeker flows -> dashboard
    { prefixes: ["/jobs/", "/jobs", "/apply", "/discover", "/track", "/profile/applied", "/profile"], backTo: "/dashboard" },
    // Company-specific flows -> company dashboard
    { prefixes: ["/company/jobs/new", "/company/jobs/", "/company/jobs", "/company/applicants", "/company/applicants/"], backTo: "/company" },
    // Company dashboard -> company login
    { prefixes: ["/company/dashboard", "/company"], backTo: "/company/login" },
    // Admin
    { prefixes: ["/admin"], backTo: "/admin/login" }
  ];

  if (!ready) return null;
  if (!isAuthed) return null;
  if (hideForPaths()) return null;
  // find first matching rule
  let matched = null;
  for (const r of rules) {
    for (const pref of r.prefixes) {
      if (!pref) continue;
      if (pref.endsWith("/")) {
        if (pathname.startsWith(pref)) matched = r;
      } else {
        if (pathname === pref || pathname.startsWith(pref + "/") || pathname.startsWith(pref)) matched = r;
      }
      if (matched) break;
    }
    if (matched) break;
  }

  if (!matched) return null;

  function handleClick(e) {
    e.preventDefault();
    // If the rule specifies a backTo, go there
    if (matched.backTo) {
      router.push(matched.backTo);
      return;
    }

    // fallback
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  }

  return (
    <button
      aria-label="Go back"
      title="Back"
      onClick={handleClick}
      className={
        "fixed bottom-6 right-6 z-50 w-12 h-12 flex items-center justify-center rounded-full bg-gray-800/80 hover:bg-gray-700 transition-colors shadow-lg ring-1 ring-white/10"
      }
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        className="w-6 h-6 text-white"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
    </button>
  );
}
